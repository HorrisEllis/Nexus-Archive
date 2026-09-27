# NEXUS 0.39.266: nexus is back in Idearium, and the agent builds it from inside with approval

**Date:** 2026-09-26 · base: Nexus-main-9 (package.json 0.39.264, with 0.39.265 code and tests already in the tree but no CHANGELOG-0.39.265.md)

James:

> *"nexus should be in idearium but isn't. really close to being able to use idearium to build nexus from inside nexus using you as the agent."*

## Map

- **The sync side was healthy.** `data/nexus-self/metrics.jsonl` from James's machine shows syncs completing today: 2,102 files, 14 systems, understanding recorded.
- **The same sync on a clean copy of this tree works.** A fresh `idearium/api/index.js` on :4800 creates 14 system repos and the parent in about 10 s. The Repos library then shows one `nexus` block ("14 systems · 1855 files").
- **So the repos exist, and something between the registry and the library hides them.** Two paths were found and both were reproduced.

## Failure 1: Delete archived an immutable repo, and the sync never undid it

- `RepoLayer.archive()` was the only lifecycle call without the `_immutableError` guard. Write, delete-file, fork and writeTextFile all had it.
- The repo detail panel showed **✕ delete** on nexus/core like on any other repo. `DELETE /api/repos/:uuid` then set `status: 'archived'`.
- `list()` hides archived rows. The library groups the 13 system repos *inside* nexus (core, or the parent if core is missing), so once core and the parent were archived, all of Nexus disappeared.
- `_findRepo()` reads with `includeArchived: true`. It found the archived row, compared hashes, and returned `unchanged`. Nothing ever restored the row, and every sync after that kept it hidden.
- **Reproduced live:** `DELETE` on nexus/core and nexus, then `POST /api/nexus-self/sync`. Afterwards only the 13 child repos were listed, and the library showed nothing for Nexus.

**Fix**

- `idearium/repo/index.js`:
  - `archive()` refuses immutable repos with `code: 'IMMUTABLE'`.
  - New `restore(uuid)` moves a repo from archived to active.
- `idearium/api/index.js`:
  - `repo.archive` answers **409** for IMMUTABLE instead of 404.
  - The last-sync status lists restored repos as `<name>:restored`.
- `idearium/repo/nexus-self.js`:
  - `sync()` first restores any archived nexus-self row that has no active twin for the same role and system. It returns them as `restored` and logs `restored archived nexus/core (…)`.
  - `_findRepo()` prefers an active row over an archived twin.
- **This heals James's current state on the first sync after upgrade.** No manual data edit is needed.
- `idearium/ui/js/app.js`: an immutable repo shows no **delete**, **+ add file** or **fork**. In their place it shows "immutable — edit on a COS branch, apply through the gate".

## Failure 2: on first boot the library stayed empty until a reload

- The first sync runs 20 s after boot. On Windows, core (~1,800 files) takes longer than that to sync.
- The sync broadcasts `idearium.nexus-self.sync` once per system. `refreshOnEvent()` handled `repo.*` and did nothing for `nexus-self.*`. The nexus-self pipeline passes `onEvent: null`, so no `repo.*` event fired either.
- A page opened before the sync finished said "no repos yet" until it was reloaded by hand.

**Fix:** `refreshOnEvent()` reloads the repo list on `nexus-self.*`, debounced to one reload per burst (one event per system).

**Reproduced and verified in headless Chromium:** a page loaded before the sync showed "no repos yet". Without a reload, it then showed `nexus · 14 systems · 1855 files`.

## Tested

- New `tests/modules/test-nexus-self-visible.test.js`, 4/4 passing (registered in `run-all.js`):
  - NV-001: archive refused.
  - NV-002: archived core and parent restored by sync; a second sync restores nothing.
  - NV-003: an archived twin stays archived.
  - NV-004: UI wiring.
- The same test run against the unmodified files fails 0/4, so it catches this regression.
- Neighbouring suites are unchanged: `test-nexus-self-and-cos-run` 30/30 and `test-versionium-repo-history` 7/7.

## The agent builds Nexus from inside Nexus, and James approves each change

> *"really close to being able to use idearium to build nexus from inside nexus using you as the agent"* … on how agent code should reach the live tree: *"just prompt for approval"*

**What was wrong**

- The Agent tab's code goes through `lib/repo-inject.js`: `propose`, then `apply`, then `RepoLayer.writeTextFile`.
- The Nexus repos are immutable, so that write was refused with IMMUTABLE. An agent's code on a nexus repo could be proposed but could never land.
- The loop dead-ended one step short.

**What changed**

- New `lib/nexus-self/inject-gate.js`. An `.inject` on a nexus repo now carries `target: { kind: 'nexus-gate', system, path }`, where `system = ownerOf(path)`.
- On approval, that inject is applied through `lib/nexus-self/apply.js`: plan, then a live-tree write, then a recorded apply, then a snapshot. The API then resyncs that system's repo.
- Revert is the gate's own `rollback(applyId)`.
- Before comparing, the gate snapshots the live tree (index-cached).
  - A file James edited since the last 10-minute sync does not block an inject for some other file (IG-007).
  - The inject's own base sha is checked against the tree as it is now. An agent that worked from a stale copy of the file is refused as a conflict instead of overwriting his edit (IG-006).
- A path under another system is that system's change. For example, `guardian/x.js` proposed from nexus/core is applied under guardian (IG-005).
- A nexus repo is always in review mode:
  - `modeFor(repo)` returns review.
  - `injectMode: 'auto'` is refused with 409.
  - A stored 'auto' is ignored (IG-008).
- **The approval stands in for the branch gate's "run first" check.** That check exists for branch applies, where nobody has looked at the diff. The apply record's reason says who approved and which inject it was.

**The prompt**

- When a reply settles with proposed injects on a nexus repo, the inject editor opens as an approval prompt, one inject at a time, with a queue for the rest. It shows:
  - the system and the path;
  - whether the file is created or changed;
  - the gate's plan (ok, errors, or conflicts);
  - a coloured diff against the live tree;
  - the content, still editable before approving.
- **approve → live tree** applies it; **reject** drops it. A plan error disables approve. A conflict goes through the existing type-"force" path.
- No prompt text was added. James's rule is that only blocks he can edit in Agent settings go into the prompt. If the agent should be told more about nexus repos, it goes in that repo's `.inject` block.

**Tested**

- `tests/modules/test-nexus-inject-approval.test.js` 8/8 (IG-001…008), run against a throwaway live tree.
- End to end on a running :4800 in headless Chromium:
  - a proposed inject on nexus/core opened the prompt ("gate plan: ok", diff shown);
  - clicking approve wrote `lib/hello-from-agent.js` into the live tree, recorded as `apply-…`;
  - nexus/core was resynced.
- `PUT` of `injectMode: 'auto'` on nexus/core returned 409.
- Regressions: `test-repo-inject` 79/79, `test-nexus-self-and-cos-run` 30/30, `test-versionium-repo-history` 7/7, `test-nexus-atlas-and-glass` 9/9.
