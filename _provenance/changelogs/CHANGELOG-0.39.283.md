# Nexus 0.39.283

**NEXUS 0.39.283: builds that account for what they didn't make, Ollama drafts reviewed by an agent, the Manage workbench, history from the release zips, and idearium no longer drops offline**

| | |
|---|---|
| Built | 2026-09-29 16:28:12 → 2026-09-29 16:28:12 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.283 |
| Tag | `v0.39.283` → snap-0716 |
| Full file ledger | [LEDGER-0.39.283.csv](../ledger/LEDGER-0.39.283.csv) |

## Release notes — `CHANGELOG-0.39.283.md`

Copied unchanged from the build.

### NEXUS 0.39.283: builds that account for what they didn't make, Ollama drafts reviewed by an agent, the Manage workbench, history from the release zips, and idearium no longer drops offline

**Date:** 2026-09-29 · base: 0.39.282 · MINOR (idearium 4.14.0: new config keys, new run states)
**Map:** `docs/2026-09-29-nex-node-store-phasemap.spec`. The release carries out the handoff's order: N21, then N22, N23, N25, N27 and N28. **Handoff:** `docs/2026-09-29-handoff.md`.

James: *"continue"*

#### Nothing written empty or broken (N21, slice 2)
- **The write gate now parse-checks JavaScript** with Node's own `--check` on a temporary copy. The copy is checked as `.mjs` when the code has import/export, and as `.cjs` otherwise. Under Node 22's module detection, a `.js` file with ESM syntax *and* a syntax error passes the check, so nothing is ever checked as plain `.js`.
- **TypeScript stays unchecked, on purpose.** Node's type stripping both passes broken TS and fails valid enums.
- **Every block is also a gap** (`step.blocked.<step>.<check>` in `lib/gap-field.js`), which is the existing road into self-heal's failure modes. There is one open gap per step and check, and repeats bump its count. A rule node can turn this off with `report_gap: false`.

#### What a step did NOT produce is data (N22)
`lib/shadow.js` records, before a step runs, what must exist afterwards: its shadow of files, events and fields. When the step settles, the difference is read:
- **Present, absent and extra** are reported.
- **Each absence** becomes a gap (`absent.<step>.<kind>`) and a liminal-space item at L1/L3 (where shadow meets causal tracing), caused by the shadow.
- **A step that failed outright** drops its shadow, because its failure is already recorded.

It is adopted in three places:
- **Manage actions:** a rebuild whose reply never brings the file back reads **incomplete** and names the file.
- **Spec plan runs:** the phasemap must come back.
- **Phase builds:** every file the phase names must come back.

#### Ollama drafts, a guardian agent reviews (N23)
- **Each phase build asks in a fresh chat** (repo-agent `dispatch({ session })`), so a small local model gets its whole window for that phase. Before, one running conversation per repo carried every phase that came before it.
- **When Ollama drafted a phase or a writing Manage action,** the drafted files go to a guardian agent in one plain conversation (`lib/draft-review.js`). The files carry their full content from their inject nodes. The message says what is needed, carries the draft fenced by path, names what the draft never produced, and passes James's note.
  - The review runs in its own chat, with its own shadow.
  - The draft stays on the staging branch as provenance, and the review run links back to it (`draftRunId`).
- **Settings:**
  - `repos.draft_then_review` is on by default.
  - `repos.review_provider` names the reviewer. Empty means guardian's first agent, and the reviewer is never ollama or auto.
- **The hand-off is honest text.** Nothing rewrites it to pass as a person typing.

#### The Manage workbench (N25)
James: *"the manage button. Can you make it beautiful like the rest of idearium. Like enterprise grade, fully built."*
- **Header:** the file with its state, lines, size and waiting proposals.
- **Actions** in three groups (change, fix & prove, understand), each marked WRITES or READS.
- **Scope:** the whole file or a line range, with a live preview of exactly those lines.
- **Instructions,** plus related code search with picks, and who does it (the repo's providers).
- **The pipeline, stated before sending:** snapshot → agent → gate → shadow → review of an Ollama draft. Steps that do not apply are struck through.
- **History:** this file's runs, newest first, with review runs linked, their states and reasons, and any absent files.
- **Keys:** Esc and Ctrl+Enter work wherever focus is while the workbench is open.

Styling lives in `idearium/ui/css/file-manage.css`, with every class `mg-`-prefixed. A global `.ds` rule had been stretching the cards. The old `.manage-*` rules are retired with a note.

#### History from the release zips (N27)
James: *"I have 700 nexus zips. Some with .git a lot without. I want to import the full (mostly) history from them."*

Run `node cli/import-history.js <folder of zips>` from inside the checkout. Use `--dry-run` to see the order first. It is pure Node plus the git CLI, and it runs on Windows.
- **One snapshot commit per zip,** in version order, on `history/snapshots`, dated to the newest file in the zip. node_modules, data/ and nested .git are left out.
- **A tree already on the branch counts as a duplicate** and gets no commit.
- **A zip with `.git`** also has its real commits fetched into `refs/import/<sha12>/*`.
- **Provenance goes in the commit trailers,** and a YAML report lands in `.git/nexus-history-import/`.
- **Reruns are safe:** a rerun skips every zip already imported. A release found later is appended and flagged, and `--rebuild` reorders and keeps the old branch.
- **Your current branch is never touched.** The one merge that joins the history in is printed for you.

`lib/zip.js` now reads and writes entry dates. On the real 0.39.278–0.39.282 zips, 5 imported in 8 s, which works out to about 20 minutes for 700.

#### Idearium OFFLINE every 10 minutes, fixed at the root (N28)
This is the "compartments 17–23 s" in the live log.
- **Cause:** every `lib/cos-bridge.js` call built a brand-new COS host. That meant reloading the whole state file, rebuilding the system map, re-upserting every compartment and re-registering every gate. On top of that, every `mountPath()` rewrote the whole store even when nothing had changed.
- **Fix:** one host per process, reused while its state file is unchanged. A write by another process reloads it. An identical remount is now a no-op.
- **Measured:** with 300 compartments, the unchanged compartments step went from **34–36 s to 1–2 ms**.
- **Also fixed:** a mount made writable again used to stay in the read-only list.

#### Tests
- **Full run:** 408 suites with 0 unregistered failures. The remaining failures are the 30 registered gap cases, each with its reason.
- **New suites:**
  - test-step-gate 18/18
  - test-shadow 16/16
  - test-draft-review 12/12
  - test-import-history 14/14
  - test-cos-mount-idempotent 8/8
  - the Chromium probe `tests/probe/manage-workbench-chromium.js` 13/13
- **Fixed on the way:**
  - the economy fixture now writes real JavaScript;
  - the intelligence C2 test no longer flakes when two tests land in the same millisecond.

#### Provenance: the commits
| commit | what |
|---|---|
| bb76c7b | N21: JavaScript parse check; every block is a gap |
| 6c78cb1 · 6ae6f09 | N22: shadow and negative space; phase builds cast a shadow |
| 24f2945 | N23: a fresh chat per phase; Ollama drafts reviewed by a guardian agent |
| b6a6739 | N27: `cli/import-history.js` |
| ed711d4 | N28: the COS host cache and the no-op remount |
| 88a2bc8 · f3fcec7 | tests: the economy fixture, the intelligence C2 flake |
| 36fcce2 | N25: the Manage workbench |

## Ledger

### Build 0.39.283 — snap-0716 — 2026-09-29 16:28:12

- Archive: `nexus-0716_2026-09-29_v0.39.283_main-13.zip` (was `Nexus-main-13.zip`)
- SHA-256: `f2e1d8024b50b2fccdac82ef8a4d95e778703293db9d2bbedabcc035a3987fef`, 13.4 MB, downloaded 2026-09-29 16:37:31
- Kind: full
- Commit: `2cec24508847226e03da65ffa7b99b355e3db2f8`, tag `snap-0716`
- Files in archive: 4942. Changes against the build before it: **18 added, 53 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 7 | 14 | 0 |
| lib | 6 | 8 | 0 |
| idearium | 1 | 10 | 0 |
| docs | 1 | 5 | 0 |
| cos | 0 | 4 | 0 |
| (root) | 2 | 1 | 0 |
| cortex | 0 | 3 | 0 |
| guardian | 0 | 3 | 0 |
| cli | 1 | 0 | 0 |
| copilot | 0 | 1 | 0 |
| emerge | 0 | 1 | 0 |
| eravos | 0 | 1 | 0 |
| intelligence | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
A CHANGELOG-0.39.282.md
A CHANGELOG-0.39.283.md
A cli/import-history.js
M copilot/spec/copilot.spec
M cortex/core/raid/contract-intake.js
M cortex/registry-components.js
M cortex/spec/cortex.spec
M cos/compartment/guest-agent.js
M cos/testenv/provision.js
M cos/testenv/setup-job.js
M cos/workspace/index.js
A docs/2026-09-29-handoff.md
M docs/2026-09-29-nex-node-store-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/atlases/guardian-atlas.md
M docs/atlases/idearium-atlas.md
M docs/atlases/nexus-atlas.md
M emerge/cortex-query/writeback.js
M eravos/spec/eravos.spec
M guardian/lib/response-sink.js
M guardian/registry-components.js
M guardian/spec/guardian.spec
M idearium/api/build-surface.js
M idearium/api/index.js
M idearium/index.js
M idearium/lib/config-core.cjs
M idearium/package.json
M idearium/spec/idearium.spec
A idearium/ui/css/file-manage.css
M idearium/ui/desktop.html
M idearium/ui/index.html
M idearium/ui/js/file-manage.js
M idearium/ui/js/plan-panel.js
M intelligence/lib/domain-nodes.js
M lib/cos-bridge.js
A lib/draft-review.js
M lib/node-export.js
A lib/node-schemas/schema.step_gate
M lib/queue.js
M lib/repo-agent.js
M lib/repo-inject.js
A lib/shadow.js
A lib/step-gate.js
A lib/step-gates/code.write.step_gate
A lib/step-gates/reply.accept.step_gate
M lib/test-sandbox.js
M lib/version.js
M lib/zip.js
M orchestrator/spec/orchestrator.spec
M package.json
M tests/modules/intelligence.test.js
M tests/modules/mco4-stage-transitions.test.js
M tests/modules/run-all.js
M tests/modules/test-adversarial-sim.js
M tests/modules/test-autopilot-boot-gates.js
M tests/modules/test-contract-queue-hardening.js
A tests/modules/test-cos-mount-idempotent.test.js
M tests/modules/test-cos-workspace.test.js
A tests/modules/test-draft-review.test.js
M tests/modules/test-economy.more.js
M tests/modules/test-ico-ledger-writethrough.js
M tests/modules/test-idearium-cjs-under-esm.js
A tests/modules/test-import-history.test.js
M tests/modules/test-repo-agent-late.test.js
M tests/modules/test-repo-agent-provider.js
M tests/modules/test-repo-inject.js
A tests/modules/test-run-all-process-group.test.js
M tests/modules/test-sentinel-cli.js
A tests/modules/test-shadow.test.js
A tests/modules/test-step-gate.test.js
A tests/probe/manage-workbench-chromium.js
```

