# Nexus — decisions across versions

Where decisions were written down in the archived builds, and when each first appeared.

## Decisions made in this reconstruction (2026-11-14)

These are the choices behind the history itself. They were made by the tool author (Claude) unless marked as James's.

1. **One commit per unique archive, oldest first.** 938 zips reduce to 792 byte-unique files (SHA-256). Byte-identical copies are recorded as duplicates of the earliest one and share its commit.
2. **Order is by content date, not download date.** Each archive is placed by the newest file timestamp inside it. Archives built in a UTC sandbox carry timestamps 7 hours ahead of the local download time; those are shifted back, and no content date is allowed to be later than the file's own modified time.
3. **One version line that only goes up** (James, 2026-11-15: "fix the versioning first"; "i want all versions in order. like books on a bookshelf"). The numbering the builds carried restarted several times (5.1.0 → 1.0.0 → 3.0.0 → 0.4.0-pre → … → 0.60.320) and parallel sessions overlapped, so it could not be used as it stood. The line is built like this (the coder's design):
   - A build *claims* the higher of its registry version (`lib/version.js`, then `VERSION`, then `package.json`) and the version in its file name, when these are on the 0.x line.
   - The longest run of claims that never goes down is kept exactly as claimed: 644 of 751 builds.
   - A build whose claim would go backwards is filed under the version current at that point, as a further build of it. Its claim is kept in the manifest, the ledger, the commit (`Version-Claimed`) and the file name (`declared-x.y.z`).
   - The 52 builds made before the 0.x numbering began are `0.0.1` to `0.0.52`, in order.
4. **Several builds of one version are numbered `-r1`, `-r2` …** in build order (0.39.0 has 105, 0.9.8 has 96). A version with one build has no suffix. `vX.Y.Z` tags the last build of each version.
5. **Full builds replace the tree; patches overlay it.** An archive with at least 1,000 files, or at least 30% of the current tree, is a full snapshot. A smaller one whose paths mostly exist in the current tree is applied on top of it as a patch (`overlay`). A smaller one that does not match the tree goes to the `artifacts` branch under its own folder.
6. **The project root is normalised.** Wrapper folders (`nexus/`, `Nexus-main/`, `merged/`, `base/` …) are stripped so the same file keeps the same path across builds.
7. **Left out of git, recorded in EXCLUSIONS.md:** `node_modules`, embedded `.git` directories (their HEAD commit is recorded), and files of 50 MB or more (GitHub rejects files over 100 MB).
8. **Secrets are redacted on the way in.** Private-key blocks and key-shaped tokens are replaced with a typed fingerprint. The original zips are untouched.
9. **Rename in place with a manifest** (James's choice): `nexus-NNNN_YYYY-MM-DD_v<version>[-rN][_label][_dupK].zip`, filed under `archives/v<major>.<minor>/`. `rename-map.csv` and `undo-rename.ps1` reverse it.
10. **Destination: its own repository, `HorrisEllis/Nexus-Archive`** (James, 2026-11-15: "push here instead"), with a GitHub noreply author address (James's choice). This replaced two earlier destinations: a new private repository (his first pick), then the live Nexus repository ("im saying for nexus' repo"; "i want nexus to have a history"). A push into Nexus was started and he stopped it after 100 builds had reached a branch `archive/history` there; `main` and every existing branch and tag in Nexus were untouched, no merge was made, and he said he would delete that branch himself. Joining the pre-history to Nexus's `main` is not done.


## Documents, by first appearance

| First seen | Version | Document | Title |
|---|---|---|---|
| snap-0225 2026-07-02 | 0.9.8 | `session-specs/NEXUS-BRANCHING-DECISION-LOOP-SPEC-v0_1.md` | NEXUS — Branching Decision Loop (Copilot → COS → LOOM → Idearium) |
| snap-0590 2026-09-15 | 0.39.142 | `docs/2026-09-15-versionium-cortex-snapshot-migration-decision.md` | Decision Log — versionium/cortex snapshot migration — 2026-09-15 |
| snap-0609 2026-09-19 | 0.39.153 | `docs/2026-09-19-versionium-snapshot-and-ledger-decision.md` | Decision Log — versionium snapshot ownership + per-system ledgers — 2026-09-19 |

## Recorded in release notes and handoffs, by version

Sections lifted verbatim (trimmed) from changelog, handoff and session files at the snapshot where each file first appeared.

### snap-0225 — v0.9.8-r79 — 2026-07-02

**NEXUS — Branching Decision Loop (Copilot → COS → LOOM → Idearium)** — `session-specs/NEXUS-BRANCHING-DECISION-LOOP-SPEC-v0_1.md`

> **Author:** James Brooks (Erosmancer) + Claude
> **Generated:** 2026-07-02
> **Status:** spec — no code written this session, per explicit instruction
> **Scope:** "Ask Copilot something it doesn't know → pick the relevant system → contain it in COS → trial-and-error → fork multiple COS branches to simulate outcomes in parallel → pick the best or synthesize the invariants."
> **Convention:** every ✓/⚠/✗ below is read from real source this session, not assumed. This spans four systems on purpose — Copilot, COS, LOOM, Idearium — none of them own this loop alone, per the correction that this is not LOOM-only.
> 
> ---

### snap-0276 — v0.9.13-r1 — 2026-07-14

**3. `unintegrated/` staging — two open decisions from earlier this session** — `HANDOFF-2026-07-11.md`

> - `unintegrated/2026-07-branch-a-additions/lib/compartment-engine.js` vs `cos/kernel.js`'s `Compartment` class — resolved as *not* redundant (different scopes: durable sovereign-agent identity vs throwaway action-sandboxing), but neither has been wired into the live tree, just clarified.
> - `unintegrated/2026-07-branch-b-cortex-v2/` — the whole cortex-v2/BEP/crystal/liminal-space lineage from a parallel branch, still just sitting there. Whether to merge it, and how it reconciles with the current `cortex/` tree's own memory model, is a real architectural decision, not a mechanical patch.

### snap-0438 — v0.39.0-r96 — 2026-08-27

**Part 2 — genuine open decisions (I'm not picking for you)** — `ARCHITECTURE-BRAINSTORM-SYNTHESIS-2026-08-25.md`

> You used "struggling," "maybe," and "wait" around all of these. They're
> real, and they interconnect, but each has a real fork:
> 
> **A. Is `.nex` the universal storage unit, or just the snapshot format?**
> You asked about `.nex` for versions, then separately asked about
> compartments-as-storage-templates ("a jaa database would be a container
> template... a compressed container with all the relevant files in it").
> These are two different real answers to "what's the unit of stored data":
> a versioned snapshot file, or a spawnable compartment. They're not
> mutually exclusive (a compartment's *contents* could include `.nex`
> snapshots), but which one is the *primary* organizing concept changes how
> everyt …

### snap-0590 — v0.39.142-r1 — 2026-09-15

**Decision Log — versionium/cortex snapshot migration — 2026-09-15** — `docs/2026-09-15-versionium-cortex-snapshot-migration-decision.md`

> Real decisions made this pass, each checked against `docs/AXIOMS-v3.1.md`
> before being made, not after (§8.4/§6.2 — read before building). Full
> narrative account lives in `versionium/spec/versionium.spec`'s own
> 2026-09-15 history entries; this doc is the decision-by-decision index
> §17.3 (every decision recorded, alternatives and rejections named) asks
> for on top of that.

### snap-0607 — v0.39.151 — 2026-09-19

**Open (decisions, in order)** — `docs/HANDOFF-2026-09-19-cortex-intelligence-move.md`

> - **"Current sigma"**: autonomous-loop, hot-loader (rollback at sigma>0.70) and MCP `nexus_cfr` read a `sigma` no route exposes, so it is always 0/n/a. Suggest max sigma over last N ledger entries.
> - **V7**: two independent sigma-gated auto-commit triggers (versionium/lib/engine.js, orchestrator/lib/versionium-auto-commit.js).
> - **`cortex/snapshot`** (D3) still cortex-owned; decide git-vs-versionium rewind engine first.
> - `cortex/versionium/` left as unexecuted archive (D6) on purpose.
> - Cortex still keeps a private CFR cache for RAID and `/health` output (not served as a relay).
> - Intelligence's command logger writes `event_log` from its own process (multi-writer hazard); `relational-field` …

### snap-0609 — v0.39.153-r1 — 2026-09-19

**Decision Log — versionium snapshot ownership + per-system ledgers — 2026-09-19** — `docs/2026-09-19-versionium-snapshot-and-ledger-decision.md`

> Continues the numbering of `docs/2026-09-15-versionium-cortex-snapshot-migration-decision.md`
> (D1–D7). Each decision checked against `docs/AXIOMS-v3.1.md` before being
> made, not after (§8.4/§6.2). §17.3 asks for every decision recorded with
> alternatives and rejections named; this is that index.
> 
> James, this session: *"cortex is not versionium, or the intelligence
> system. there should not be any .nex files generating in cortex. also the
> ledgers in cortex need to be per system."* and *"clean up the old cortex
> versionium and snapshots folder."*
> 
> ---

### snap-0633 — v0.39.194-r2 — 2026-09-21

**Why** — `idearium/CHANGES-2026-09-21.md`

> Boot log 2026-09-21: importing `eravos-complete` (369 files) killed idearium with
> `FATAL ERROR: Reached heap limit` at chunk ~313. The spec survived on disk, the repo
> never got created ("no repos yet"), and the build queue then asked ChatGPT (via guardian)
> to "generate" the ~55 files the import never reached.

### snap-0654 — v0.39.223 — 2026-09-23

**Decided** — `CHANGELOG-0.39.223.md`

> - **D3 (mesh-first phasemap): Clear Glass is the one account authority.** Guardian no longer keeps its own account list for dispatch; it asks Clear Glass.

### snap-0655 — v0.39.228 — 2026-09-25

**1. Job intake — decided: push-with-claim (not a directory watch)** — `CHANGELOG-0.39.227.md`

> - **guardian owns the decision, on disk.** The dispatch ladder calls `claim(job)` before any mesh send; `server.js` writes `transport: mesh, claimedBy: clear-glass, status: dispatched` to the `.job` as a **required** write (`updateJob(id, patch, { required })` — opt-in used only here; status updates stay non-fatal). Failed claim → nothing sent → NCP with `mesh_claim_failed`. NCP fallback clears `claimedBy`.
> - **Clear Glass's intake** (`clear-glass/src/jobs/intake.js`) accepts a job only after reading it back through guardian's `GET /jobs?id=` and finding the claim. Refusals (unclaimed, unknown, finished, provider mismatch, guardian unreachable) return `intake_refused`, `sent: false`.
> - Write …

### snap-0661 — v0.39.236 — 2026-09-25

**Why they kept coming back** — `CHANGELOG-0.39.236.md`

> - Tests wrote into the real stores: idearium/data, cortex memory, COMPARTMENT OS. Isolation was opt-in per test and most tests never opted in. COMPARTMENT OS had no override at all. `idearium/repo/repo-node.js` and `idearium/lib/chunk-nodes.js` ignored `IDEARIUM_DATA_DIR` even when a test set it.
> - At boot, `_reconcileSpecRepos` adopted every leaked spec into a real compartment. The build queue built them, and the repo agent sent their prompt to ChatGPT (2026-09-25 log: job `0631e27a` for `inject-test-1790345265876`).
> - One unpatched suite run here left 422 idearium node files, 29 spec files, 80 project files and 141 COS files.
> - This is the third cleanup of the same class, so the cause is f …

### snap-0669 — v0.39.244 — 2026-09-25

**1. Why "hello" failed instantly** — `CHANGELOG-0.39.244.md`

> The request path is: Agent tab → idearium `repo-agent` (`agentId repo-<uuid>`) → copilot `backend:'guardian'` → guardian → **that repo's own provider tab**. Guardian's dispatcher opens that tab itself: `lib/dispatcher.js` `_awaitAgentTab` waits up to 60 s, then falls back to the shared tab.
> 
> Two checks upstream of the dispatcher refused the job first, because the *shared* chatgpt tab wasn't connected:
> - **copilot/lifeline.js `_tryGuardian`** asked guardian's `/providers`. If `chatgpt` wasn't listed as connected, it returned a bare `null`. The job was never created, and no reason was passed on.
> - **guardian/ask.js** failed fast on the same condition.
> 
> copilot then turned the `null` into its g …

### snap-0702 — v0.39.272 — 2026-09-27

**Decisions to keep** — `docs/HANDOFF-0.39.272.md`

> - Approval is `by:'user'` only. An agent submits only when the policy is `auto`, plus `acknowledgeTos` on LinkedIn, Indeed, Upwork, Fiverr and Freelancer.
> - Fiverr/Upwork replies are typed into the box and never sent by the agent.
> - `/cli/invoke` denies only credential saving. No route ever returns a decrypted password.
> - Learning is evidence only: every hint names its observations, can be forgotten, and never overrides recipes, macros or James's settings.
> - `{memory}` (the agent's own work, 0.39.269) and `{atlas}` (everything else) never send the same line twice.

### snap-0703 — v0.39.273 — 2026-09-27

**Decisions to keep** — `docs/HANDOFF-0.39.273.md`

> - **Every agent write is an inject.** Review mode stacks; auto mode is all-or-nothing per call; a Nexus repo needs James's approval.
> - **An agent never approves its own proposal.** `code_changes` only lists, reverts, or withdraws.
> - **A syntax error introduced by a write is refused** unless `force`.
> - **Cards say how each reference was found** (`import`, `same-file` or `name`). They are never presented as a call graph. `graph.js`'s `calls` stays unsupported.
> - **Chunk ids come from kind + qualified name.** Changing a chunk's name changes its id, which is intended. Adding code above it does not.

### snap-0716 — v0.39.283 — 2026-09-29

**Decisions waiting on James** — `docs/2026-09-29-handoff.md`

> - **Tablet "one write verb" law** (T1-012 / T2-012). The tablet now has spawn and touch controls and a copilot prompt POST. Either amend the law or remove those controls.
> - **RAID intent gate.** It fails open on a check error. Should it fail closed?
> - **N26.** Your message cut off at "needs to have an op…". What was the rest?
> - **Staging.** With Ollama as the default, an auto-mode repo's Ollama code goes to the staging branch (promote it with `code/promote`). Keep it that way, or apply directly?

### snap-0721 — v0.39.291 — 2026-10-01

**Why Ollama cut off or came back empty — found in `ollama/lib/ollama-client.js`** — `CHANGELOG-0.39.289.md`

> - **A 45 s total timeout on a request that was not streamed.** A local model writing a whole phase was killed at 45 s, which is the "46s · blocked: empty" above. Generation is now streamed:
>   - the timeout counts silence (no token for 45 s), under a 10-minute cap on the whole generation;
>   - copilot's wait for the job now follows that cap (it was 90 s);
>   - the repo agent's wait for an Ollama reply now follows it too (it was 90 s).
> - **Thinking models came back empty.** qwen3, deepseek-r1 and similar can spend their whole budget thinking, and their reply was read as empty. Now, thinking with no answer means it is asked again with thinking off.
> - **Cut-offs looked complete.** Ollama's "stoppe …

### snap-0728 — v0.39.324 — 2026-10-05

**Why every provider's answer was "too short"** — `CHANGELOG-0.39.307.md`

> For a spec section, the quality detector (`lib/seam/detector.js`) required the answer to be at least **40% as long as the prompt**. The old section prompt pasted every earlier section in full, so by integration (section 7) and failure modes (section 8) the minimum was kilobytes. Ollama, Gemini and ChatGPT were all rejected.
> 
> The only answers that passed were the ones that copied earlier sections back. That's how the DAW spec's echo grew: the detector was selecting for it.
> 
> **Now:** a spec section is judged as a section.
> - It needs at least 200 characters, never a fraction of its prompt.
> - It may end on a list item, a table row, a heading or bold text, not only on punctuation.
> 
> Prose cut off  …

**Why Guardian couldn't be clicked** — `CHANGELOG-0.39.307.md`

> Clicking Guardian with no Guardian agent chosen fell back to the default provider. Since 0.39.282 that's Ollama, so the click saved Ollama and the switch snapped back.
> 
> **Now:** Guardian resolves to a Guardian agent, in this order:
> 1. the current one;
> 2. the default, if it's a Guardian agent;
> 3. ChatGPT;
> 4. the first Guardian agent available.
> 
> If there are none, it says why.

### snap-0737 — v0.39.357 — 2026-10-05

**Why it didn't build** — `CHANGELOG-0.39.355.md`

> 1. **BL8 went to `huihui_ai/qwen3-abliterated:0.6b`.** The derived ladder sorts your Ollama models smallest first, so a 0.6b model was the first rung.
> 2. **Its reply changed no file, and the build still counted it as "replied".** So the ladder never climbed.
> 3. **Round 1 failed on 71 broken imports that were already broken before anything was built.** The repair then sent those unrelated files to the 3b model to rewrite, at 33k characters and 220 s each.
> 4. **Most of those 71 were not imports.** They were `require('…')` written inside test fixtures' strings.

### snap-0738 — v0.39.360 — 2026-10-05

**Why you didn't see it** — `CHANGELOG-0.39.358.md`

> The picker from 0.39.357 is the workshop's start page. But I had only made a **promoted idea** go through it. Opening the workshop **from a repo** went straight into the writer. nexus/core has no `.spec` file, so the writer had nothing to show and opened a blank Purpose. The picker was reachable only through the SPEC WORKSHOP name at the top left, and nothing said so.

### snap-0742 — v0.55.1 — 2026-10-09

**The ladder says why Ollama is missing (HP8)** — `CHANGELOG-0.55.0.md`

> "No Ollama models listed or installed" read the same whether Ollama was empty or not answering. The run's route now says which:
> - **The bridge didn't answer:** "Ollama left off: " followed by the bridge's error.
> - **Ollama answered with nothing installed:** it says no models are installed.

### snap-0744 — v0.60.0 — 2026-10-12

**Why the command didn't run, and the fix** — `CHANGELOG-0.59.6.md`

> 0.59.5 treated everything already on the page when it opened as history. James opened the chat after the command was posted, so the command was swallowed.
> 
> Now, in `clear-glass/src/page/nexus-chat.js`:
> 
> - **First open:** the page's newest `nexus> ` line runs, once it has stayed the same for two reads. Older lines never run.
> - **Reload:** reloading the same page in the same session replays nothing. The lines already run are kept per URL.
> - **Restart:** after a Clear Glass restart, the newest line can run once more. It is read-only.
> - **Moving to another chat in the page** counts as a first open of that chat.
> - Clear Glass now logs `[ClearGlass/nexus-chat] watching <url>`, so the log shows whe …

**Why Ollama was not coding** — `CHANGELOG-0.60.0.md`

> - A phase was cut into one-file chunks only when its ladder **started** on Ollama (`routing.chunk_phases: auto`). With a browser agent first, the whole phase went to that agent in one request.
> - Each chunk's brief was the phasemap's prose cut to 2400 characters. The small model still had to work out what the file exports, what it imports and how it fits.
> - The only Ollama job in your log was the `rewrite` one: the reword randomizer rephrasing the prompt before it went to ChatGPT/Gemini. It writes no code.

### snap-0745 — v0.60.6-r1 — 2026-10-12

**His decisions, quoted with context (`docs/CLAUDE.md`, new root `CLAUDE.md`)** — `CHANGELOG-0.60.6.md`

> `docs/CLAUDE.md` has a new rule for every decision he makes:
> - It is recorded verbatim and dated, with what was being decided and the choices on the table.
> - The coder's recommendation and the coder's reading are named as the coder's, and a reading is marked "to confirm" when there is another one.
> - A later decision supersedes an earlier one through an addendum that quotes both; nothing is rewritten.
> 
> A root `CLAUDE.md` imports `docs/CLAUDE.md`, so the agreement loads in every session.

### snap-0753 — v0.60.47 — 2026-10-15

**Why it didn't work** — `CHANGELOG-0.60.28.md`

> This is the coder's reading of every run he pasted this session.
> 
> The agents answer. In those logs ChatGPT finished 38 jobs and Gemini 16. The problem was how the pipeline used them. It
> gambled twice:
> 
> 1. **A run started without knowing its parts were ready.**
>    - SB9: the ladder climbed into Claude, whose page was waiting on his ◎ pick, so it gave an empty reply. Then it
>      climbed into DeepSeek, which had no tab and was behind a sign-in wall. Ladder exhausted. Guardian knew both before
>      the run began.
> 2. **When the planner failed, the build fell back to its hardest mode.** One chat agent explored the whole phase alone,
>    one tool call every 15 seconds. BL30 ended there: a placehold …

**Why** — `docs/HANDOFF-local-claude-code.md`

> No phase build has ever reached `proven` on his machine:
> - **BL30** ended `incomplete`: the planner was dropped under memory pressure, and one agent explored the whole phase
>   alone.
> - **SB9** ran out of agents: Claude's page needed a ◎ pick, and DeepSeek was behind a sign-in wall with no tab.
> 
> Versions 0.60.24 to 0.60.29 were written to fix that. They have only run in tests, in the cloud copy. They are on
> GitHub at `HorrisEllis/Nexus`, branch `claude/quirky-thompson-kz9xvs`:
> 
> | Version | What it changed |
> |---|---|
> | 0.60.25 | account fallback chain, and a missing provider tab is opened |
> | 0.60.26 | services held by lean mode stay quiet; the officiator backs off |
> | 0.60.27 | agent calls a …

### snap-0759 — v0.60.110 — 2026-10-16

**Not shipped, and why** — `CHANGELOG-0.60.104.md`

> - His scripts that load Playwright (shots, perf, run.mjs, tool-kit, specs, planned-deps, migrate-tools). Nexus's
>   CG-001b fails any file that loads Playwright. Clear Glass drives the canvas here instead.
> - His music domain's own test suites. A canvas from the template runs its tools' tests on his harness.

**Why so much regression (what the run showed)** — `CHANGELOG-0.60.105.md`

> - **The cause.** The agent sends the whole file back, and anything it leaves out is deleted. A weak reply deletes code it
>   was never asked to touch.
> - **What main already had, newer than his 0.60.93:**
>   - the shrink rule (0.60.98);
>   - proposal evidence (0.60.99);
>   - the reject retry with his reason;
>   - the fix for the "auto-retry-held" loop in his Tasks list (0.60.102).
> - **What still got through:**
>   - 124 → 34 lines is above the shrink rule's quarter.
>   - A 54-line schema is under its 100-line floor.

**Why Google refused** — `CHANGELOG-0.60.106.md`

> - The user agent was already scrubbed of "Electron" (in `main/index.js` and `providers/host.js`).
> - Two other things still named an embedded Chromium, and Google's sign-in checks them:
>   - every request still sent Chromium's client hints (`Sec-CH-UA: "Chromium"`, with no "Google Chrome" brand);
>   - pages could read the same from `navigator.userAgentData`.

### snap-0760 — v0.60.124 — 2026-10-17

**Why it was still broken after 0.60.103** — `CHANGELOG-0.60.111.md`

> Main's 0.60.103 had already taught the store to read the version from inside the zip. His COS never got that change:
> - `cos/app/version.js` stayed at 0.1.0;
> - `cos-v0.1.0` was built at 0.60.96 (run 38891061643);
> - `.github/workflows/cos-app.yml` only ran when `version.js` changed, and leaves a tagged version alone.
> 
> So the exe he runs still has the old, strict store.

**His decision, and what it was between** — `CHANGELOG-0.60.116.md`

> FR1 and FR2 had been built inside Nexus on the coder's working assumption, which was never put to him. Answering his
> question, the coder set out two options:
> - **(A)** keep building in Nexus and branch it out at each release;
> - **(B)** build in the branched repo: a standalone product sooner, but it forks at once and every fix is made twice.
> 
> The coder recommended **A with a real boundary**: a product folder in Nexus with a manifest, the branch tool reading that
> manifest, product files declaring themselves, and a check that fails when the copy lacks something the product needs.
> He chose that. It is recorded in `docs/2026-10-16-repo-carve-phasemap.spec` (`decision_where_the_product_is_built`).

### snap-0761 — v0.60.135 — 2026-10-17

**His decisions, recorded** — `CHANGELOG-0.60.127.md`

> His decisions are in `docs/2026-10-17-system-drawbridge-phasemap.spec`, addendum (a):
> - The registry is the interaction contract, the event bus, the queue, the dependency graph, the wiring harness and the
>   spine.
> - The routes and the CLI are the only way between systems.
> - There is a handshake for the UI, so the UI is disposable and the system is sovereign.
> - Handoffs carry contracts and nodes.
> - COS is each system's isolated compartment, with the registry as its drawbridge.
> 
> What is still open, and the coder's readings:
> - **DB0b, to confirm:** the coder recommended that a call inside one process could use the same contract without HTTP.
>   His words say routes and CLI. The coder reads COS c …

**His decisions, recorded** — `CHANGELOG-0.60.128.md`

> His decisions are in `docs/2026-10-17-system-drawbridge-phasemap.spec`, addendum (b):
> - Each system needs a registry.
> - Each system is sovereign and self-contained, isolated in its own COS compartment.
> - `lib/system-registry.js` is the tunnel. It is his 2026-09-06 "need a system registry." module: the 14 running systems
>   with their port, health URL, phase, data folder and version. The CLI, the routes, the toasts and the heartbeat are
>   reached through it.
> 
> The coder's reading, to confirm: one registry with two faces.
> - `lib/system-registry.js` is the runtime face: where a system is and how to reach it.
> - `lib/drawbridge-registry.js` (0.60.127) is the source face: what the system declares, c …

**His decisions, recorded** — `CHANGELOG-0.60.129.md`

> They are in `docs/2026-10-17-system-drawbridge-phasemap.spec`, addendum (c).
> - A file that serves one system lives in that system's folder. This follows from his "sovereign and self contained": a
>   compartment can only hold what is in its folder.
> - Each system's data nodes are in Guardian's shape and carry their relation to the system they are for.
> 
> The coder's reading of "in relation to", to confirm:
> - **What is built:** each node names its system, and the system's dependencies are nodes too.
> - **Another reading, not built:** each node names the other systems it touches. That needs the event bus (DB4).

**Decided by the axioms (`docs/2026-10-17-decisions-by-the-axioms.spec`)** — `CHANGELOG-0.60.135.md`

> | # | Was | Decision | Axioms |
> |---|---|---|---|
> | D1 | DB0a / IM0d | `lib/` is the kernel, mounted read-only into every compartment. Anything in it that has its own state or lifecycle moves to its system | §5.9, §0.5, §16.7, §10.1, §5.14 |
> | D2 | DB0b | Between systems, the routes and the CLI, in his words. Inside one system, in-process. One contract and one handshake either way | §5.10, §5.11, §5.14, §5.9 |
> | D3 | DB0c | The ratchet | §0.4, §1.2, §3.1 |
> | D4 | IM0a | State out of git. The generated projections go first, because they regenerate at boot. Any other data file goes only after a backup exists outside git, because untracking deletes the file on his next pull | §10.2, §10.3, §0.3 …

### snap-0762 — v0.60.140 — 2026-10-17

**Whose decisions** — `CHANGELOG-0.60.136.md`

> 0.60.135 recorded the decisions made by the axioms as "the coder's, never his". He corrected that. The axioms are his, so
> those decisions are his system deciding by its own law, and the coder applies and cites them. What goes to him is a
> problem: something the axioms do not settle, two of them in conflict, a failure, or a cost he would want to know about
> first.
> 
> - `docs/CLAUDE.md` has the correction. The first wording is kept beside it (§0.3).
> - `docs/2026-10-17-decisions-by-the-axioms.spec` has addendum (a): "decided by his axioms".
> - The owning maps' statuses say the same.

### snap-0763 — v0.60.142 — 2026-10-17

**Why nothing showed** — `CHANGELOG-0.60.142.md`

> Gemini thinks first. Its thinking goes in `<model-thoughts>`, and its reply element stays empty until the thinking ends.
> The job's live stream sent only the reply text, and Guardian dropped any chunk that had no text. So minutes of the agent's
> work never reached Idearium, and there was nothing to show anywhere.
> 
> The live views did exist, but only in Code › plans and the Plan panel. They were not in Code › changes or on the open file.

### snap-0764 — v0.60.146 — 2026-10-17

**Decided by his axioms** — `CHANGELOG-0.60.143.md`

> `docs/2026-10-17-decisions-by-the-axioms.spec` addendum (b):
> 
> - **D10:** ids are kept and referenced, not shared (§5.1, §10.3, §17.5).
> - **D11:** one gap door (§10.1, §17.7, §1.2).
> - **D12:** a case is a contract (§8.6, §16.5, §0.5).
> 
> Still his: DP0a, whether this is its own product or Flight Recorder's next phases, and DP0b, its name.

**Why FR6 first** — `CHANGELOG-0.60.144.md`

> The coder's reading, to confirm: a claim that the product saves repair costs needs a measured number. That number is what a run
> spent on attempts that never landed, and the runs already record it. Nothing read a run whole:
> 
> - `phase-cost` counts the calls;
> - `phase-faults` names each failure;
> - `run-watch` finds stalls;
> - none of them says "landed" or "stuck", what was wasted, or why.

**Decisions** — `CHANGELOG-0.60.145.md`

> - **Decided by his axioms:**
>   - macros can leave the machine, always masked at cut time;
>   - Guardian gets the first replay route, then versionium;
>   - Nerve is the view, never the evidence (his invariant).
> - **His:** FMR0a, whether every failure replays automatically or only on request. The coder recommends: on request, plus
>   automatically on recurrence or STUCK.

### snap-0766 — v0.60.167 — 2026-10-19

**Decisions** — `CHANGELOG-0.60.152.md`

> - **His (GM0a):** what "the precommit compartment" is. The words name nothing in Nexus. The coder recommends the repo's own
>   compartment, beside its staged work.
> - **Decided by his axioms:**
>   - records are node files, and the table is their index;
>   - a record holds references and hashes, never copies;
>   - the ladder runs deterministic-first.

**Decided by his axioms** — `CHANGELOG-0.60.154.md`

> - The stream is `siso/`, the shared primitive (`lib/system-boundary.js` PRIMITIVES), not Clear Glass's own copy. Requiring
>   that copy from lib would be a crossing (SB-06).
> - `siso/` is ESM, so `lib/context-stream.js` loads it with `import()`. That reuses it instead of making a third copy (§8.6).

**Decided by his axioms (D15–D23)** — `CHANGELOG-0.60.155.md`

> Under his rule "come to me for problems, else use the axioms", nine questions were waiting on a yes to a technical
> recommendation: GW0b, GW0c, GW0e, GW0f, GW0g, GW0h, GW0i, TL0a and TL0b. They are decided by his axioms, with the axiom each one
> rests on, in `docs/2026-10-17-decisions-by-the-axioms.spec` addendum (c). Their maps now read DECIDED, and he can overturn any one
> of them.

**Decided by his axioms** — `CHANGELOG-0.60.159.md`

> - **CE0b:** Debian. COS's provisioner already builds and proves it. Ubuntu server stays one flag away.
> - **CE0c:** xterm.js, vendored into Idearium.
> - **CE0d:** what the handshake verifies.
> - **CE0e:** COS answers on its own route. This adds one on-demand process, and it is brought to him as a cost.
> - **CE0f:** the handshake's verification moves into lib, the kernel. Both the orchestrator and the drawbridge use it.

**Why it isn't a plugin** — `CHANGELOG-0.60.160.md`

> Clear Glass's Plugins section lists webextensions (loaded from a manifest). Snowflake/Tor is a built-in **network transport**, not
> a webextension, so it doesn't belong in that list. Its home is a settings section with the other network things.

**Why it matters (the spine → dumb components → local-first)** — `CHANGELOG-0.60.164.md`

> With the registry holding the require/consumer edges, each component can stay small and single-purpose — which is what lets a 7B-class
> local model write it. The spine is the mechanism behind "chunk dynamically so local can handle it": you make components small by
> decomposing against the spine, not by splitting a file mid-build. (Mapping DC1 showed the contract splitter can't chunk a single
> file — its children would overwrite the same path — so CR1, the spine, is the real lever, exactly as James said.)

**Why** — `CHANGELOG-0.60.166.md`

> The quality gate (GQ, next) must run a phase's test in **isolation** — not in the build's own process, where a test could read
> the build's env, hang it, or flood it. COS already has the machinery; it was only wired to the manual Run menu, never the build.

### snap-0769 — v0.60.180-r1 — 2026-10-20

**4c. Architecture decision NC0 — neutral core, replaceable interpreters, explicit evidence** — `docs/HANDOFF-2026-10-19-verify-first-and-dag.md`

> James, 2026-10-19 (adopting a reviewer's qualification): "make the core domain-neutral now, but don't make the feature pilot wait for
> a grand adapter framework. Establish the boundary and prove it with two small adapters before expanding it." · "the components in
> the component registry can be any language … all resuable or deterministic code thats architectural, memory or data storage, or
> maintains consistency for stability, should have a schema, template or resuable node type or spec file"
> 
> Recorded in `docs/CLAUDE.md` (migration, evidence and schema rules) and mapped in the infrastructure map's addendum:
> - **NC1** the boundary in code: manifest, graphs, registry shape, proof contract (pass …

**6. Facts measured this session (for the portfolio and the next decisions)** — `docs/HANDOFF-2026-10-19-verify-first-and-dag.md`

> - 490k lines of JS; 543 test files; 404 suites in the runner; 296 specs; 376 changelogs; 94 MB without node_modules.
> - Sovereignty: no kernel's compartment seal is ready; 56 non-test files in the 12 kernels still require
>   `cortex/memory/jaa-db.js`; `lib/system-store.js` (IM6) has one user (diagnostic/healer).
> - Shared-store contention: "BREAKING STALE FLUSH LOCK … held >10000ms" means a whole-table flush took >10 s while other kernels
>   waited — the reason MEM1/SS1 matter, not only tidiness.

### snap-0771 — v0.60.192 — 2026-10-21

**What's built (decided by your axioms: one record, §7.6 and §0.3)** — `CHANGELOG-0.60.190.md`

> - **The change log lives in the commit.** An approved change's entry is written into the Versionium commit of its diff. The commit's
>   message is the change-log line, for example:
> 
>   `GR1_loud_b · src/a.js: make b loud (+2 −1) — approved by james`
> 
>   The commit also carries the full entry: why, each file with lines added and removed, who proposed it, who approved it, the run it came
>   from, and who started that run (RC7). The change log you read is built from the commits, so it can't drift from the diffs.
> - **The same for Nexus's own tree.** An approval there rides on the system's sync commit. If that commit fails, the entry goes back in
>   the queue. A failed commit in a repo keeps its entri …

### snap-0772 — v0.60.195 — 2026-10-21

**0.60.195 — 2026-10-21 — Why SP5 never landed: the file that worked was called missing** — `CHANGELOG-0.60.195.md`

> James, 2026-10-21: "okay bvut did it not capture response from chatgtp." · "looking glaass is a test spec. rral spec test caser"
> 
> Looking Glass is your real test case for the pipeline, so when SP5 fails, it's the pipeline that's failing. Recorded as yours.

**Why nothing fixed SP5 — the real cause** — `CHANGELOG-0.60.195.md`

> - **What happened.** Your log: `[shadow] phase.build: 1 expected thing(s) absent — lib/title.js`. Gemini did bring back title.js, at
>   `looking-glass-bundle-v0_4/lib/title.js`. An imported bundle keeps its files in its own folder, and its map names them from inside that
>   folder.
> - **Why it was thrown away.** The build checked for exactly `lib/title.js`, called Gemini's file missing, and climbed to ChatGPT, then
>   Claude. Every attempt that worked was discarded.
> - **Fixed.** A file delivered under the bundle's own folder now counts as the file the map names. A bare file name never matches, so a
>   stray `index.js` somewhere else is still not the file.

### snap-0778 — v0.60.212 — 2026-10-22

**Why they looked cheap** — `CHANGELOG-0.60.210.md`

> - **Text glyphs next to drawn icons.** The Tools rows drew each command's text glyph (✦ ⛏ ◎ ⬡ ⏮ ⟳ ⚙), while every other row in the menu
>   has a drawn icon. The pinned tool buttons on the toolbar drew the same glyphs.
> - **The old editor.**
>   - It was a grid of identical chips under an all-caps heading.
>   - Nothing said what a tool does.
>   - The only way to move a tool was to drag it.

### snap-0779 — v0.60.220 — 2026-10-23

**Why they were back** — `CHANGELOG-0.60.214.md`

> - In 0.60.180, Agent Mesh, Element Picker and NCP Providers moved into Guardian's agents hub, the robot button (`shell/agents.js`):
>   - the hub's "Agent mesh" row;
>   - its "Pick an element" row;
>   - its list of every NCP agent with Start / Show / Stop, the same calls the old panel made.
> - 0.60.210's rebuilt Tools section listed every tool not pinned to the toolbar, which brought those three back into the ☰ menu. That was
>   the coder's miss.

### snap-0780 — v0.60.233 — 2026-10-23

**Why this first** — `CHANGELOG-0.60.222.md`

> The self-building loop (docs/2026-10-23-self-building-loop-phasemap.spec) is open at five places. The first is that nobody, person or
> agent, could ask "what can be built now". The build refused a phase with an open dependency (DG1) or no files (DG2) only after it was
> asked to build it, and "pending" was often stale. SL0 is that answer. The loop (SL4) needs it before it can pick the next phase.

**Why** — `CHANGELOG-0.60.223.md`

> The second place the self-building loop was open (docs/2026-10-23-self-building-loop-phasemap.spec, `found:`): nothing marked a
> phase done. The only status writes were 'active' when a build starts and his manual Set status. So a proven run left its phase open,
> and DG1 refused every phase that depends on it until he marked it by hand. SL1 is that write.

**Drift from the spec, decided by the axioms** — `CHANGELOG-0.60.223.md`

> The full record is in the map's SL1 addendum and the spec's addendum.
> 
> - The status format keeps the writer's date, with the version and run after it (§8.6, §0.1).
> - The close record lives in its own table rather than as a run state (§1.2, §0.3).

**Why** — `CHANGELOG-0.60.224.md`

> The self-building loop's map orders SL2 after SL1: close the out-of-date backlog by evidence, not by guessing. "pending" is often out
> of date (GA1 shipped in 0.60.161 and still said pending), and every phase left open wrongly holds back everything that depends on it
> (DG1).

**Why (traced, §0.1)** — `CHANGELOG-0.60.225.md`

> - RF2 is not a phase. It sits under `root_findings:` in
>   `docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec`, and the map says of that block: "Not phases — these are
>   the confirmed, evidence-backed facts every phase below cites back to."
> - Its fix already shipped: DF1 moved guardian off cortex's store, and DL3 (0.60.208) points `guardian/config.js` at
>   `lib/data-home.js`. Your boot log shows it working: "guardian brought 5 file(s) home".
> - loom's phasemap parser (`loom/scanners/phasemap-map.js`) took anything shaped like `XX1_name:` as a phase. It marked only
>   `decisions:` entries (CV6), so RF2 showed as pending work.
> - The build sent it to Gemini. Gemini read `guard …

**Why** — `CHANGELOG-0.60.228.md`

> After SL3, 233 open phases on Nexus's maps still can't be placed by anything deterministic: they name no files, and nothing in their
> words points at one. DG2 refused every one of them (NO_GRAPH, no override). MP4 (0.60.29) could already ask an agent to map phases,
> but only as a batch job, never at the moment a build needed it.

### snap-0783 — v0.60.265 — 2026-10-26

**Not ported, and why** — `CHANGELOG-0.60.255.md`

> - **The spec-compiler port (EW2/EW3).** On main the compiler is the kernel's (`lib/emerge/compiler`), so requiring it is no crossing. The
>   port and its test are kept in `_archive/2026-10-26-brave-cori-records/not-ported/`.
> - **PS3/PS4, one file per phase.** It would rewrite every `.phase` and drop every `.graph`, which is the regeneration he said not to do.
>   This is open, and it is his call.
> - **EW1, emerge as a 16th system, and the "language" crossing kind.** Main's RF2 put the language in `lib/`, so main's census stands.
> - **Sentinel's archive.** His 2026-10-24 "Yeah archive it." stands. Main still keeps `lib/sentinel`, because the merge kept main's moves.
>   It is mapped as BCR5, open, a …

**Why it never let him through** — `CHANGELOG-0.60.260.md`

> - **Every person tab pretended to be Firefox.** It sent a Firefox user agent, Firefox headers, no client hints, and a Firefox TLS
>   handshake. Underneath it is Chromium, and the page's JavaScript behaves like Chromium. A human check (HUMAN/PerimeterX on Fiverr) reads
>   that mismatch as a bot, so holding the button never verifies.
> - **The challenge made it worse.** When ErosmancerOS saw a challenge, the hostile hook switched the tab to Firefox again.
> - **Switching identity only half-worked.** Two latent bugs, both proven under xvfb:
>   1. The request hook kept the first profile, so headers stayed the old persona after a switch.
>   2. A page already open keeps the user agent it was made with, so …

**Why** — `CHANGELOG-0.60.262.md`

> Clear Glass reads a page's fields through a small script it injects into the page (the dom mesh, `window.__cgDomMesh`). That tab did not
> have it, so the field query came back `undefined`. The gig fill passed that straight to the matcher, which threw.
> 
> The profile fill had the same gap. It only caught an `{ error }` answer, not an empty one.

**Why nothing matched** — `CHANGELOG-0.60.265.md`

> Fiverr's boxes have no label of their own. "Gig title", "Search tags" and "Positive keywords" are headings in the row's other column. The
> field reader only knew a box by its own attributes and its `<label>`, so neither the fill nor the chip could tell what a box was for.

**His decision, and what it cost** — `_archive/2026-10-26-brave-cori-records/CHANGELOG-0.60.230.md`

> His axiom §5.9 already said it: "a primitive with none of these [state, lifecycle, persistence, execution] is not a system"
> (docs/2026-10-17-decisions-by-the-axioms.spec). The boundary census never applied it. So 0.60.229 counted these eight as the systems closest
> to sovereign, and drafted a registry for each.

**His decision** — `_archive/2026-10-26-brave-cori-records/CHANGELOG-0.60.231.md`

> The systems are exactly Idearium's own list, `lib/nexus-self/systems.js` SYSTEMS:
> 
> > orchestrator, cortex, guardian, idearium, architect, diagnostic, intelligence, ollama-bridge (`ollama/`), versionium, copilot, loom,
> > clear-glass, components, cos, and core (the kernel, `lib/`)
> 
> This supersedes 0.60.230's count of 20. It also supersedes the coder's reading that had put components among the parts. Both are kept in
> the map's addendum.

**Why it matters beyond AE1** — `_archive/2026-10-26-main-parallel-0.60.254-259/CHANGELOG-0.60.254.md`

> Every sovereignty migration (RF2, the COS compartment moves, every "make system X sovereign") is a relocation. Until now DG2
> could not warn that a move would breach the boundary; now it does, at map time.

### snap-0784 — v0.60.269 — 2026-10-26

**Why they were left** — `CHANGELOG-0.60.266.md`

> They are Fiverr's own widgets, not `<select>`s. Each is a box reading "SELECT A CATEGORY" that opens a list on mouse-down. The
> subcategory list only fills after a category is chosen. A fill that types into inputs had nothing to type into.

### snap-0787 — v0.60.285 — 2026-10-28

**Decided by his axioms** — `CHANGELOG-0.60.274.md`

> - Where the files go is his word: Versionium.
> - Where the resolver lives was decided by §8.6 (reuse: one resolver like lib/data-home), the boundary rule (no new crossing) and §0.3
>   (the root is still read, so nothing older breaks).

**Decided by his axioms — his to overturn** — `CHANGELOG-0.60.285.md`

> - **HN_D1.** `.input` and `.response` are reused (his words name them). `.response`'s `jobId` is widened by a dated addendum: an
>   Idearium exchange with no job uses its exchange id, and says so with `source: idearium.repo-agent`. New types only where none existed.
> - **HN_D2.** On "what about .node types for each language/code block for each agent?": **one `.code_block` type**, with the language and the
>   agent as fields, not a type per language or per agent. A type per language would be the same schema dozens of times (NC0: a language
>   is data; §5.13: syntax is not architecture). "Every Python block Claude wrote" is a query:
>   `repo history-nodes <repo> --lang python --provider claude`.

### snap-0790 — v0.60.312 — 2026-10-30

**Decisions (`docs/2026-10-24-cos-manager-phasemap.spec`)** — `versionium/changelogs/CHANGELOG-0.60.300.md`

> - **MG_D5, his: COS is the orchestrator.** It manages the overview and runs each system isolated in its compartment. This confirms the role part of MG_D4.
> - **MG_D6, his: the spec is the system.** The file layout follows from his axioms:
>   - the YAML metadata comes first and one compressed payload comes last;
>   - so every existing `.spec` reader (55 files in lib) still reads the metadata;
>   - a zip renamed `.spec` would have broken them.

**Decision MG_D7 (his)** — `versionium/changelogs/CHANGELOG-0.60.301.md`

> - Every page, and every section of a page, is its own component with its own html, css and js. It is isolated in its own shadow root.
> - Pages and sections talk only through the declared events on the component registry's bus.
> - MG18 now waits on DB16: COS's registry is still a draft (`cos/registry-components.draft.json`), and accepting it is his call.

**0.60.309 — the pipe door decided; too many primitives, and ESS; his uploads kept whole** — `versionium/changelogs/CHANGELOG-0.60.309.md`

> James, 2026-10-30:
> > "these? give you input about all of this. not just han holding. your my partner in this."
> > "non-linear / input, which can be any input, any data packet, then the system / way to many primitives i feel like / the data needs to flow into the /input and then moved to the output one by one."
> > "both, one per system using the server.js as a ingest, from the input folder, with the intent as a flag after the command. / and then orchastrator/cos using raid as the routing, for systems, load balancing, and agents"

**Decided (his): RULE C, the door** — `versionium/changelogs/CHANGELOG-0.60.309.md`

> - Each system has one door, served by its own `server.js`.
> - An input folder is ingested one packet at a time. The pipe routes are the same door over HTTP.
> - Each packet carries its intent, as a flag on the command (the exact syntax is to confirm).
> - COS routes between systems with RAID: systems, load balancing and agents.

**Decisions** — `versionium/changelogs/CHANGELOG-0.60.310.md`

> - **F_D0, his:** foundation up.
> - **To confirm:**
>   - F_D1: ESS is the kernel.
>   - F_D2: copies are locked snapshots.
>   - F_D3: the assistant acts on structural moments, the checker first, and what he types stays on his machine.

**0.60.311 — spec and map first: cos/dependencies and the COS cockpit, every decision by the axioms** — `versionium/changelogs/CHANGELOG-0.60.311.md`

> James, 2026-10-30:
> > "no not every keystroke, only when you need it. or maybe make it a setting, using the contiious event stream."
> > "copy every file you need to a cos/dependancies folder. then lets build cos, tabs, beautiful, what about using forking idearium specifically for cos for now, llook at the tablet spec. i want it to look beautiful, not cramped, open and use the axioms as law for each decisiion. full control panel/cockpit for each system."
> > "SPEC AND MAP FIRST. DAG" · "THE AXIOMS IN DOCS THE 3.1 AS LAW"
> 
> The coder had started copying before the spec: a folder was made, nothing was copied, and the folder was removed. This release is that work done in his order.

**Decisions (`docs/2026-10-24-cos-manager-phasemap.spec`)** — `versionium/changelogs/CHANGELOG-0.60.311.md`

> - **MG_D9, his: `cos/dependencies`.** COS's outside files are copied with `VENDOR.lock.json` and a check that fails on any edit. By the axioms: §0.3, §10.3, §5.15 rule 2, §16.5 and §17.12.
>   - **Copied:** Emerge, the ERAVOS canvas and schemas, his update system, SNR Passthrough, and the ESS text.
>   - **Not copied:** Emergence and the Associative Lattice. They are Emerge's components, and stay in `_archive`.
>   - **Named gap:** two copies of Emerge exist until F2 switches the callers of `lib/emerge`.
> - **MG_D10, by the axioms: COS's own cockpit server.** It runs on 127.0.0.1:7797, serves the pages and forwards to the one door. CORS `*` is refused, because any website could then restart his sys …

### snap-0792 — v0.60.320 — 2026-10-30

**Why this wasn't already done (reuse check)** — `versionium/changelogs/CHANGELOG-0.60.314.md`

> AF6 (0.60.296) made the chip's *driver-paced single fill* choose a dropdown. But the **bulk fill path** — "Autofill this page", the Library Fill, copilot, and the no-driver chip fallback — goes through `fillFields → handleMutate → mutate()`, which had no option resolution. DD1 fills exactly that gap. AF6's chip + the driver's `select`/`choose` are kept.

