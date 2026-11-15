# Nexus 0.60.0

**0.60.0 — 2026-10-12**

| | |
|---|---|
| Built | 2026-10-12 07:56:56 → 2026-10-12 07:56:56 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.0 |
| Tag | `v0.60.0` → snap-0744 |
| Full file ledger | [LEDGER-0.60.0.csv](../ledger/LEDGER-0.60.0.csv) |

## Release notes — `CHANGELOG-0.60.0.md`

Copied unchanged from the build.

### 0.60.0 — 2026-10-12

James: "need it to generate code. not sure why its not using ollama in chunks, but i want to have a intent for the reasoning, to map and plan, then ollama codes in chunks. that way ollama can be as dumb as possible."
· "guardian should detect when a sign in is needed, also when it cant map to the chat, have a compartment os style popup for the chat, to have me sign in or map the dom using the element picker."
· "each phase has to map to the spec and architect/component registry. like i want the conditions to be generated from the intent."
· "the plan panel doesn't need to show all the completed phases at all times. needs a clear button to remove them."
· "needs play, pause and rewind, using the state of the compartment using the rewind engine. like i want to be able to pause the repo activity like the way vmware pauses the state of the vm."
· "always read the code first, the atlas and the .spec. loom map and then map the phases. make sure the right system is being mapped. like having the agents have seperate jobs, and also nexus learning from the agents."

#### Why Ollama was not coding

- A phase was cut into one-file chunks only when its ladder **started** on Ollama (`routing.chunk_phases: auto`). With a browser agent first, the whole phase went to that agent in one request.
- Each chunk's brief was the phasemap's prose cut to 2400 characters. The small model still had to work out what the file exports, what it imports and how it fits.
- The only Ollama job in your log was the `rewrite` one: the reword randomizer rephrasing the prompt before it went to ChatGPT/Gemini. It writes no code.

#### Plan, then code (PC1, PC2)

A phase build is now two jobs, done by two agents. A third job, the proof, checks the result.

1. **The planner** is a reasoning agent: `routing.planner`, or the first agent on the ladder that is not Ollama. Before it maps anything it is told to read, in this order:
   - the code
   - the system's section of the atlas (README.md)
   - the spec
   - the system's components in the loom map

   It is also given:
   - the component registry: the spec's own `registry` block first, then the repo's code-derived registry
   - components to reuse, matched to the phase by its words
   - what earlier planned builds taught Nexus

   It answers with one JSON plan:
   - the system and what it read
   - the intent
   - every file: the registry component it is, or `new` with its layer; its purpose, imports, exports (names and signatures) and steps
   - the order
   - the **conditions, generated from the intent**

   `lib/phase-plan.js parsePlan` refuses a plan that:
   - leaves a file mapped to nothing
   - leaves out a file the phase names
   - is for another system, or plans a file another system owns
   - has a lower layer importing a higher one, or an import cycle

   A refused plan goes back with its problems, up to `routing.plan_attempts` (default 2). If no plan holds, the phase is built as before and the run says why.
2. **The coder** gets each planned file, in dependency order, as one bare request (no retrieval context, no atlas):
   - the file, and the registry component it is
   - its exact exports and signatures
   - the imports it may use, with what the earlier files *really* export
   - numbered steps, and the fenced block to answer with

   The coder ladder puts Ollama first. Among the Ollama models, the one with the best record on planned files goes first (`lib/plan-learning.js orderCoders`). The browser agents are its fallback.
   A file that comes back without a planned export is **incomplete** ("came back without cachedRead — the plan says it exports it"), so the ladder retries or climbs.
3. **The proof** uses the plan's conditions when the map declares none. The proof row says they were generated from the intent by the planner.

- **The right system.** For all of NEXUS, every file of the phase and every loom tag votes on the system that builds it. Before, the first file's owner decided alone. In a system repo, a vote against the repo's own system is said on the run.
- **Learning.** Nexus reads the phase-run ledger back into each new plan:
  - which coder landed which layer
  - which exports a coder keeps dropping
  - what plans were refused for
  - which files are already built from a plan, and proven: import them, never rewrite them
- **Settings → Routing → Plan, then code:**

| Key | Values |
|---|---|
| `routing.plan_code` | auto (an Ollama model on the ladder) · always · never |
| `routing.planner` | the agent that plans; empty = the ladder's first agent that is not Ollama |
| `routing.plan_attempts` | tries for a plan, 1–5 (default 2) |
| `routing.chunk_phases` | auto · always · never |

  `routing.chunk_phases` and `routing.ladder_learn` were read by the policy since 0.39.361 but never declared. They are declared now.
- **The Plan panel** shows each step of a planned build:
  - who plans and why
  - the system and the vote
  - what the planner was given to read: atlas, loom components, registry size, reuse, lessons
  - the plan: each file → its component and exports, and the conditions
  - why a plan was refused, and the coder order

#### Play, pause, rewind (RS1)

`lib/repo-run-state.js` gives each repo one run state, shared by every process through a small file in idearium's data dir.

| Control | What happens |
|---|---|
| ⏸ pause | A Versionium version is taken, the desktop (if running) is checkpointed and paused, and the repo is paused. No agent call starts (the one door, `repo-agent.js dispatch`, waits on the repo's task), no phase attempt starts (a `paused` row on the Plan), and no spec chunk is queued or built (`409 REPO_PAUSED`). A reply already being written finishes, like a VM's in-flight I/O. |
| ▶ play | The desktop resumes and everything waiting goes on where it stopped. |
| ⏮ rewind | Pauses first. Restores the version you pick, or by default the one before the pause, using the existing restore: a pre-restore version is taken, so it can be undone, and the restore is verified against disk. The desktop rewinds to its newest checkpoint at or before that version. The repo stays paused until you press ▶. |

- Routes: `GET /api/repos/:uuid/run` and `POST /api/repos/:uuid/run/:op` (pause | play | rewind `{ commitId? }`). Each act is a row in the repo's log.
- On the repo card: an "activity" bar (▶/⏸, ⏮) above the versions, and ⏮ on each version.
- In the Plan header: ⏸ ▶ ⏮.

#### The Plan panel clears what is done (PP1)

**⌫ clear done** takes everything complete off the panel as of that moment:
- the completed steps
- a finished spec build
- a proven proof run
- done plans and file jobs

New work still shows. Nothing is deleted: the runs stay in the ledger and the log. "⌫ N cleared — restore" brings them back. The setting is kept per repo, in this browser.

#### Guardian asks for you; Clear Glass shows the tab (GA1)

Provider tabs run hidden. Your Claude tab sat on `claude.ai/login`, the userscript never connected, and the job was cancelled after 45 s with no one able to see why.

- `guardian/lib/provider-attention.js` asks for the person. It asks once per agent and reason within `jobs.attention_cooldown_ms` (2 min), and asks again at once after the agent connects. It asks when:
  - **signin**: a tab reports a sign-in wall or is signed out; or, while a job waits for a tab, Guardian checks the tab's page halfway through the wait and finds a sign-in page or a page off the agent's own site. The job then waits `jobs.signin_wait_ms` (5 min), not 45 s. If it is still not signed in, the job fails as `login`, saying so.
  - **map**: the ladder cannot find the chat's input, send button or reply.
  - **no-connect**: the tab is open but never connects.
- Clear Glass (`clear-glass/src/providers/attention.js`, `POST :7702/providers/:id/attention`) shows the right window. That is the repo's own agent tab when the job is routed to one (its account routing), else the provider's tab. Over the page it lays a COS-style panel you can drag by its title bar:
  - **I've signed in**
  - **pick the input** · **pick send** · **pick the reply**
  - **hide**

  A pick runs the element picker in the page: hover outlines, click chooses, Esc cancels. The selector is checked live and goes to Guardian through `selector-assign.js`, with the same evidence rule as before. Guardian's answer (saved or refused) shows on the panel. When the page moves off the sign-in page, the panel closes, the tab hides again and the userscript connects.

#### Tests

- `test-plan-code-run-attention` passes 39/39 and is new. It covers:
  - the plan, the registry mapping, the system refusal, the layer rule and the order
  - the coder's brief and export check
  - the grounded planner prompt and the atlas section
  - the system vote, the loom slice, planMode/coderRungs and the config keys
  - lessons and coder order
  - pause/wait/play, and the gate at the dispatch door
  - attention page states, cooldown and clear
  - Clear Glass's panel and picker against a fake window: shown, picked, sent to Guardian with evidence, hidden; and the repo's own agent tab chosen
  - the wiring
- These still pass:

| Suite | Result |
|---|---|
| `test-pipeline-routing` | 19/19 |
| `test-phases-tab` | 5/5 |
| `test-repo-activity` | 24/24 |
| `test-one-idearium-phases-nodes` | 21/21 |
| `test-readme-atlas` | 1/1 |

## Ledger

### Build 0.60.0 — snap-0744 — 2026-10-12 07:56:56

- Archive: `nexus-0744_2026-10-12_v0.60.0_main-43.zip` (was `Nexus-main-43.zip`)
- SHA-256: `095f498aee892bcaebdabc3176086c62e962e8b94e454ac0b9fd43547fa335a0`, 15.8 MB, downloaded 2026-10-12 08:16:30
- Kind: full
- Commit: `105ea9d78d54c9690d12d79ddb6be80642c3348e`, tag `snap-0744`
- Redacted: `tests/modules/test-nexus-read.test.js (1 x sk-key)`
- Files in archive: 5575. Changes against the build before it: **25 added, 63 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 1 | 19 | 0 |
| (root) | 11 | 2 | 0 |
| lib | 4 | 8 | 0 |
| tests | 5 | 5 | 0 |
| clear-glass | 1 | 8 | 0 |
| idearium | 0 | 9 | 0 |
| guardian | 1 | 4 | 0 |
| copilot | 1 | 2 | 0 |
| loom | 0 | 3 | 0 |
| _archive | 1 | 0 | 0 |
| cos | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |
| versionium | 0 | 1 | 0 |

```
A CHANGELOG-0.59.10.md
A CHANGELOG-0.59.11.md
A CHANGELOG-0.59.12.md
A CHANGELOG-0.59.13.md
A CHANGELOG-0.59.14.md
A CHANGELOG-0.59.15.md
A CHANGELOG-0.59.6.md
A CHANGELOG-0.59.7.md
A CHANGELOG-0.59.8.md
A CHANGELOG-0.59.9.md
A CHANGELOG-0.60.0.md
M README.md
A _archive/README-v5.1.0-superseded-2026-10-11.md
M clear-glass/renderer/browser.js
M clear-glass/renderer/copilot-cli.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/copilot/verbs.js
M clear-glass/src/event-taxonomy.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/page/nexus-chat.js
A clear-glass/src/providers/attention.js
M copilot/intuition.js
A copilot/lib/nexus-ask.js
M copilot/server.js
M cos/host/system-map.js
A docs/2026-10-10-copilot-talk-to-nexus-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/atlases/architect-atlas.md
M docs/atlases/clear-glass-atlas.md
M docs/atlases/components-atlas.md
M docs/atlases/copilot-atlas.md
M docs/atlases/core-atlas.md
M docs/atlases/cortex-atlas.md
M docs/atlases/cos-atlas.md
M docs/atlases/diagnostic-atlas.md
M docs/atlases/eravos-atlas.md
M docs/atlases/guardian-atlas.md
M docs/atlases/idearium-atlas.md
M docs/atlases/intelligence-atlas.md
M docs/atlases/loom-atlas.md
M docs/atlases/nexus-atlas.md
M docs/atlases/ollama-atlas.md
M docs/atlases/orchestrator-atlas.md
M docs/atlases/versionium-atlas.md
M docs/copilot.spec
M guardian/ask.js
A guardian/lib/provider-attention.js
M guardian/options.js
M guardian/server.js
M guardian/tool-runtime.js
M idearium/api/index.js
M idearium/cli/route-commands.js
M idearium/lib/config-core.cjs
M idearium/repo/build-plan.js
M idearium/repo/phases.js
M idearium/ui/index.html
M idearium/ui/js/plan-panel.js
M idearium/ui/js/repo-card-time.js
M idearium/ui/settings.html
M lib/agent-tools/tool-guide.js
M lib/agent-tools/tools/nexus/command.js
M lib/atlas-generate.js
M lib/claude-code-backend.js
M lib/listener-commands.js
A lib/nexus-read.js
A lib/phase-plan.js
M lib/pipeline-routing.js
A lib/plan-learning.js
M lib/repo-agent.js
A lib/repo-run-state.js
M lib/version.js
M loom/data/events.json
M loom/data/registry.json
M loom/maps/build-surface-map.js
M package.json
M scripts/generate-atlases.js
M tests/modules/run-all.js
M tests/modules/test-cg-copilot-verbs.test.js
A tests/modules/test-copilot-claude-code.test.js
M tests/modules/test-listener-commands.test.js
A tests/modules/test-nexus-ask.test.js
M tests/modules/test-nexus-chat.test.js
M tests/modules/test-nexus-command-tool.test.js
A tests/modules/test-nexus-read.test.js
A tests/modules/test-plan-code-run-attention.test.js
A tests/modules/test-readme-atlas.test.js
M versionium/lib/snapshot.js
```

