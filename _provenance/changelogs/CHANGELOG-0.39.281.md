# Nexus 0.39.281

**NEXUS 0.39.281: the provider economy — tiers and limits per provider, learned token limits, a learning router, staging by tier; ErosmancerOS in workflows and its workbench**

| | |
|---|---|
| Built | 2026-09-29 06:36:32 → 2026-09-29 09:55:52 |
| Builds on the main line | 2 |
| Other archives filed here | 1 |
| Versions the builds claimed | 0.39.281 |
| Tag | `v0.39.281` → snap-0715 |
| Full file ledger | [LEDGER-0.39.281.csv](../ledger/LEDGER-0.39.281.csv) |

## Release notes — `CHANGELOG-0.39.281.md`

Copied unchanged from the build.

### NEXUS 0.39.281: the provider economy — tiers and limits per provider, learned token limits, a learning router, staging by tier; ErosmancerOS in workflows and its workbench

**Date:** 2026-09-29 · base: 0.39.280 · MINOR: new routes (below)
**Map:** `docs/2026-09-29-provider-economy-phasemap.spec` — written before the work, every phase closed with its proof (EC11 is this release).

James: *"What if we have economy tags for each provider. With staging branches. Like id love an extensive configurable
options for this. What about using the tokenizer and graphs to learn token constraints. Can we enforce have the jobs
types using ErosmancerOS, and enforce the semantic randomizer. What about injecting a random question or something. Like
I want it look as close to me typing it as possible, at least with the providers. I got soft signed out of ChatGPT."*
Asked two questions. Official API providers: *"Not now."* Scope: *"Economy tags + limits, Staging per economy, Learned
token limits, ErosmancerOS job types, Smart economy like dynamically evolving and learning routing. Wha about having a
huge editor for the ErosmancerOS? Only if it these are additive."*

#### Not built, on purpose

Three things were not built, and I told James so before mapping: making provider-chat jobs look like a person typing
(human timing forced on every job, a mandatory semantic randomizer, injected decoy questions). Their purpose is to get
past ChatGPT's and Claude's automated-use detection. That goes against those providers' terms, and James's own account is
what is at risk. What already existed is left exactly as it was: the optional 'reword' prompt block (off by default) and
`guardian/lib/eros-typist.js`. The economy's answer to the sign-outs is limits: automated load on a browser account is
bounded, spaced, kept out of quiet hours, and visible.

#### Provenance — the commits, in build order

| phase | commit | what |
|---|---|---|
| map | 0ffc097 | the phasemap, EC0–EC11, with what exists read first and the exclusion stated |
| EC0–EC4 | ca68401 | lib/economy: policy, usage ledger, gate, token constraints, learning router |
| EC5 | 700f7df | staging by economy + the policy store (it also swept in four guardian/data response nodes a test run wrote; untracked in a later commit) |
| EC6 | 46a2ce8 | guardian enforces the economy at dispatch and records every outcome |
| — | be94276 | revert: test-run state that EC6's commit swept in (data/**, two versionium snapshots) — nothing of it was code |
| EC7 | ddfdf76 | the learning router orders builds nobody chose a provider for |
| EC8 | a422570 | the Provider economy page in the settings console |
| EC9 | 29d44d3 | browser steps can send click / hover / type as real input through ErosmancerOS |
| EC10 | a0cac05 | the ErosmancerOS workbench (tabs, nodes, console, replay) |
| EC11 | this commit | versions, specs, atlases, loom map, registry, tests registered, regression |

#### New

- **Economy tags and limits** (`lib/economy/policy.js`, `gate.js`, `store.js`):
  - Every provider has a tier (local, free, subscription or metered) and can be switched on or off.
  - Limits per provider: jobs per hour, jobs per day, tokens per day, concurrent jobs, and the least gap between two jobs.
  - Quiet hours, and what to do at a limit: wait, stop, or `fallback:<provider>`.
  - Job types (build, chat, plan, manage, heal, wake, automation) list the tiers allowed to take them.
  - The policy is saved as `policy.json`. The previous one is kept as `policy.prev.json`, with who changed it.
- **Enforced at dispatch** (`guardian/lib/economy-guard.js`, one call in the dispatcher). The job waits in the queue with
  the reason given, stops with the reason, or moves to the fallback YOU configured, saying so. A provider someone chose
  is never swapped silently.
- **The usage ledger** (`lib/economy/ledger.js`, the only writer). One line per outcome in
  `<data>/economy/usage-YYYY-MM-DD.jsonl`, carrying the job, provider, job type, tokens in and out (estimated, and how),
  time, model and outcome.
- **Learned token limits** (`lib/economy/tokens.js`). Per provider: the largest input that came back whole, the smallest
  that did not, p50 and p95, and a safe limit below the smallest failure. Each says how many records it rests on and that
  it is an estimate (`estimate-v1`; no vendor tokenizer is bundled). They are drawn as a graph in the console.
- **A learning router** (`lib/economy/router.js`). Thompson sampling over each provider's success record, weighted by
  cost and speed, with exploration. It is used only when nobody chose a provider. The WARP cascade uses it for such builds
  once there are enough build outcomes, and `routedBy` names the draw.
- **Staging by economy.** In an auto-inject repo, code from a stage-tier provider (by default: local) is staged on
  `repo-<uuid>@staging` as one Versionium commit (`causedBy economy:<tier>:<provider>`), not written. If Versionium
  fails, nothing is written and the reason is given.
- **Settings → Provider economy** (idearium's settings console): all of the above is editable, with live usage against
  each limit, the token graphs and the router's scores. Changes save as one POST.
- **ErosmancerOS input on browser steps** (Clear Glass workflows). Click, hover and type can go through ErosmancerOS as
  real input. The default (in the page) is unchanged, a refusal fails the step and never falls back silently, and the
  output names which path ran.
- **The ErosmancerOS workbench** (Settings → ErosmancerOS): tabs (open, attach with a role, close), nodes (search,
  inspect, use in console), a command console (one command, or its plan only), and replay (frames, replay one). The
  existing panes are unchanged, and the console sends no behaviour profile of its own.

Routes:
- Guardian: GET and POST `/api/economy`; GET `/api/economy/usage`, `/api/economy/limits`, `/api/economy/routing`.
- Idearium: GET and POST `/api/economy`; GET `/api/economy/:what` (proxy to guardian).
- ErosmancerOS: `GET /api/replay/frames` adds `frames` beside the snapshot.

#### Drift found and fixed on the way (read, not guessed)

- **Clear Glass's version points had drifted again.** CG_VERSION in main/index.js was still 3.18.0. The registry's `V`
  and the interaction contract were still 3.17.0. idearium/index.js's VERSION was still 4.7.0. All are synced now.
- **`version-sync-and-registry.test.js` pinned literal versions** (3.17.0, 4.7.0), so every release bump failed it (6
  failing on 0.39.279, 11 on 0.39.280) and the sync it guards went unchecked. It now holds every point to package.json
  and passes 30/30.
- **ErosmancerOS listed replay frames as counts only**, so no frame could be picked. It gains `ScriptReplayQueue.list()`,
  which is additive; erosmancer-os is now 0.3.0.
- **The spec-drift checker would have reported the new lib entry as "no spec".** It is named `provider-economy`, so it
  pairs with its phasemap (synced at 1.0.0).

#### Registry, specs, atlases

- **Loom:** `loom/maps/economy-map.js`, wired in `loom/bootstrap.js`: 10 components, 15 hooks, 27 wires. It maps deps,
  HTTP and wire-proxy edges, including the .ts and .html ends the scanner cannot see. After a full bootstrap, all 27 of
  its wires are in the registry (checked in `loom/data/registry.json`, not just declared).
- **Correction to 0.39.280.** Its changelog said the build-surface map had 25 wires. A full bootstrap put only 21 in the
  registry: two consumers (the dispatcher, living-spec.js) had no import hook, because their edges are not require()s.
  Both maps now declare the import hook a consumer lacks, and 24 of 25 build-surface wires are in. The one still missing
  is a cos/testenv edge (detect → environment or setup-job → build-surface): its endpoint comes from cos-testenv-map and
  is among loom's 108 still-unresolved declarations, all of which predate this release. `loom/data/registry.json` is
  regenerated by the bootstrap and, as in 0.39.280, is not committed.
- **Specs:** guardian 3.19.0, idearium 4.12.0 and clear-glass 3.22.0, each with a dated addendum. `docs/SPEC-REGISTRY.spec`
  registers the phasemap. ErosmancerOS has a CHANGELOG entry.
- **Atlases:** guardian (the economy at dispatch), idearium (the Provider economy page, staging, who builds) and
  clear-glass (ErosmancerOS input, the workbench).

#### Versions

system 0.39.281 · guardian 3.19.0 · idearium 4.12.0 · clear-glass 3.22.0 · erosmancer-os 0.3.0 · provider-economy 1.0.0.

#### Tests

New: test-economy (11: EC0–EC5, EC7, EC9), test-economy-guardian (5, the real dispatcher), test-eros-workbench (6), probe
economy-console-chromium (9). Repaired: version-sync-and-registry (30/30).

**Regression against 0.39.280.** The full list was run, 461 files plus the 3 new ones, each with its own HOME, in clean
copies of 5fc197b and of this release. Results:
- **Failing:** 82 on 0.39.280, 80 now.
- **One new failure, caught and fixed before handing back:** test-nexus-atlas-refs. My idearium atlas section put routes
  and tokens in code spans, which that atlas's strict rule forbids; they are plain text now, and the file passes 51/51.
- **Now passing:** version-sync-and-registry (repaired above) and intelligence.test.js. intelligence.test.js failed one of
  9 on 0.39.280 and passed all 9 here. I changed nothing it touches, so I do not claim it as a fix.
- **No other changes.** The 80 remaining failures fail identically on 0.39.280.

Note: my 0.39.280 list included tests/modules/test-atlas-references.test.js, which has never existed in git. It was
counted as failing on both sides last time; it is dropped from the list now.

#### Not done / not proven here

- No live ChatGPT or Claude account was run against the limits. Whether they prevent sign-outs is untested; the limits make
  the load visible and bounded, and nothing more is claimed.
- Token counts are estimates (`estimate-v1`), not a vendor tokenizer. Learned limits say how many records they rest on.
- No real ErosmancerOS or Chrome was driven here. The workbench was tested against a fake built to the shapes in
  `server.ts`, and EC9 against a fake driver.
- The router orders builds only after `minRecords` (20) build outcomes. Until then, the fixed chain applies.

## Ledger

### Build 0.39.281-r1 — snap-0713 — 2026-09-29 06:36:32

- Archive: `nexus-0713_2026-09-29_v0.39.281-r1_9.zip` (was `nexus-9.zip`)
- SHA-256: `fe218f432e04c99621221909e2ad3feb58f942a04df7db07027bfc59a5e2734a`, 13.3 MB, downloaded 2026-09-29 06:42:57
- Kind: full
- Commit: `42739aed1bd9d6562b4658105f3bc7bf7174aab7`, tag `snap-0713`
- Files in archive: 4919. Changes against the build before it: **14 added, 36 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 6 | 4 | 0 |
| clear-glass | 0 | 9 | 0 |
| tests | 5 | 2 | 0 |
| docs | 0 | 5 | 0 |
| guardian | 1 | 4 | 0 |
| idearium | 0 | 5 | 0 |
| erosmancer | 0 | 4 | 0 |
| loom | 1 | 2 | 0 |
| (root) | 1 | 1 | 0 |

```
A CHANGELOG-0.39.281.md
M clear-glass/interaction-contract.json
M clear-glass/package.json
M clear-glass/registry-components.js
M clear-glass/renderer/settings/sections/eros.css
M clear-glass/renderer/settings/sections/eros.js
M clear-glass/spec/clear-glass.spec
M clear-glass/src/automation/steps.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/automation-engine.js
M docs/2026-09-29-provider-economy-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/atlases/clear-glass-atlas.md
M docs/atlases/guardian-atlas.md
M docs/atlases/idearium-atlas.md
M erosmancer/erosmancer-os/CHANGELOG.md
M erosmancer/erosmancer-os/package.json
M erosmancer/erosmancer-os/src/api/server.ts
M erosmancer/erosmancer-os/src/replay/index.ts
M guardian/lib/dispatcher.js
A guardian/lib/economy-guard.js
M guardian/lib/index.js
M guardian/server.js
M guardian/spec/guardian.spec
M idearium/api/index.js
M idearium/index.js
M idearium/package.json
M idearium/spec/idearium.spec
M idearium/ui/settings.html
A lib/economy/gate.js
A lib/economy/ledger.js
A lib/economy/policy.js
A lib/economy/router.js
A lib/economy/store.js
A lib/economy/tokens.js
M lib/repo-agent.js
M lib/repo-inject.js
M lib/seam/adapters/warp-cascade.js
M lib/version.js
M loom/bootstrap.js
M loom/maps/build-surface-map.js
A loom/maps/economy-map.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-economy-guardian.test.js
A tests/modules/test-economy.more.js
A tests/modules/test-economy.test.js
A tests/modules/test-eros-workbench.test.js
M tests/modules/version-sync-and-registry.test.js
A tests/probe/economy-console-chromium.js
```

### identical — 0714 — 2026-09-29 07:08:44

- Archive: `nexus-0714_2026-09-29_v0.39.281-r1_main-11_same-as-0713.zip` (was `Nexus-main-11.zip`)
- SHA-256: `08722e78b3649a43a78a57fcc75f579bbfe0cc12fbf6c315700c48dc7a9489ae`, 13.3 MB, downloaded 2026-09-29 07:09:36
- Kind: identical (same tree as snap-0713; no commit)

### Build 0.39.281-r2 — snap-0715 — 2026-09-29 09:55:52

- Archive: `nexus-0715_2026-09-29_v0.39.281-r2_main-12.zip` (was `Nexus-main-12.zip`)
- SHA-256: `d203af74e1dc9d6f85b73365487de663c566ce3a11a446311e873fad25b646d5`, 13.4 MB, downloaded 2026-09-29 10:50:58
- Kind: full
- Commit: `3ae446538862a3e18713e721844b64c398e3a581`, tag `snap-0715`
- Files in archive: 4924. Changes against the build before it: **7 added, 123 modified, 2 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 2 | 59 | 0 |
| guardian | 0 | 41 | 0 |
| copilot | 4 | 4 | 2 |
| lib | 0 | 7 | 0 |
| cortex | 0 | 3 | 0 |
| docs | 1 | 1 | 0 |
| idearium | 0 | 2 | 0 |
| intelligence | 0 | 2 | 0 |
| nexus | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| tablet | 0 | 1 | 0 |
| versionium | 0 | 1 | 0 |

```
A copilot/data/nodes/_archive/capability/copilot.context.get~get.api.context.id.1790698456534.capability
A copilot/data/nodes/_archive/command/copilot.context.get~get.api.context.get.1790698456534.command
D copilot/data/nodes/capability/copilot.context.get~get.api.context.id.capability
A copilot/data/nodes/capability/copilot.context.session.capability
M copilot/data/nodes/command/copilot.context.get.command
D copilot/data/nodes/command/copilot.context.get~get.api.context.get.command
A copilot/data/nodes/command/copilot.context.session.command
M copilot/lifeline.js
M copilot/module-builder.js
M copilot/registry-components.js
M cortex/boot.js
M cortex/core/raid/contract-intake.js
M cortex/core/raid/officiator.js
A docs/2026-09-29-nex-node-store-phasemap.spec
M docs/SPEC-REGISTRY.spec
M guardian/data/nodes/capability/guardian.artifacts.list.capability
M guardian/data/nodes/capability/guardian.baseline.capability
M guardian/data/nodes/capability/guardian.bus.emit.capability
M guardian/data/nodes/capability/guardian.bus.log.capability
M guardian/data/nodes/capability/guardian.chats.item.capability
M guardian/data/nodes/capability/guardian.chats.list.capability
M guardian/data/nodes/capability/guardian.chats.versions.capability
M guardian/data/nodes/capability/guardian.contract.capability
M guardian/data/nodes/capability/guardian.copilot.memory.capability
M guardian/data/nodes/capability/guardian.copilot.prompt.capability
M guardian/data/nodes/capability/guardian.events.capability
M guardian/data/nodes/capability/guardian.gaps.list.capability
M guardian/data/nodes/capability/guardian.gaps.summary.capability
M guardian/data/nodes/capability/guardian.health.capability
M guardian/data/nodes/capability/guardian.job.build.capability
M guardian/data/nodes/capability/guardian.job.dispatch.capability
M guardian/data/nodes/capability/guardian.job.list.capability
M guardian/data/nodes/capability/guardian.job.response.capability
M guardian/data/nodes/capability/guardian.job.status.capability
M guardian/data/nodes/capability/guardian.provider.channel.capability
M guardian/data/nodes/capability/guardian.provider.result.capability
M guardian/data/nodes/capability/guardian.providers.list.capability
M guardian/data/nodes/capability/guardian.queue.compartment.create.capability
M guardian/data/nodes/capability/guardian.queue.compartments.capability
M guardian/data/nodes/capability/guardian.queue.enqueue.capability
M guardian/data/nodes/capability/guardian.queue.status.capability
M guardian/data/nodes/capability/guardian.seam.queue.capability
M guardian/data/nodes/capability/guardian.seam.queues.capability
M guardian/data/nodes/capability/guardian.seam.retry.capability
M guardian/data/nodes/capability/guardian.seam.session.create.capability
M guardian/data/nodes/capability/guardian.seam.sessions.capability
M guardian/data/nodes/capability/guardian.seam.watchdog.capability
M guardian/data/nodes/capability/guardian.sessions.list.capability
M guardian/data/nodes/capability/guardian.settings.get.capability
M guardian/data/nodes/capability/guardian.settings.reset.capability
M guardian/data/nodes/capability/guardian.version.capability
M guardian/lib/code-artifact.js
M guardian/lib/response-sink.js
M guardian/registry-components.js
M guardian/server.js
M guardian/userscript-nexus-wake.js
M idearium/api/index.js
M idearium/lib/config-core.cjs
M intelligence/interaction-contract.json
M intelligence/registry-components.js
M lib/component-ledger.js
M lib/cortex-write.js
M lib/extract-code.js
M lib/opportunity/index.js
M lib/repo-agent.js
M lib/system-nodes.js
M lib/test-sandbox.js
M nexus/autopilot.js
M orchestrator/orchestrator.js
M tablet/index.html
A tests/known-gaps.yaml
M tests/modules/associative-lattice.test.js
M tests/modules/autonomous-loop.test.js
M tests/modules/brainos-canvas.test.js
M tests/modules/cortex-sse-broadcast.test.js
M tests/modules/idea-provenance.test.js
M tests/modules/idearium-loop.test.js
M tests/modules/lifeline-fluid-routing.test.js
M tests/modules/manifest.test.js
M tests/modules/nerve-phase0-phase1.test.js
M tests/modules/nexus-nerve.test.js
M tests/modules/nexus-seam.test.js
M tests/modules/orchestrator-cli.test.js
M tests/modules/read-time-expiry.test.js
M tests/modules/run-all.js
M tests/modules/snapshot-integrity.test.js
M tests/modules/test-agent-feed.test.js
M tests/modules/test-autopilot-intelligence.js
M tests/modules/test-boot-phases.js
M tests/modules/test-brainos-canvas-agent-mesh.js
M tests/modules/test-brainos-real-access-path.js
M tests/modules/test-brainos-v2-rebuild.js
M tests/modules/test-browser-action-screenshot.js
M tests/modules/test-bus-subscriptions.js
M tests/modules/test-causal-hygiene.js
M tests/modules/test-clear-glass-idle-vs-open.js
M tests/modules/test-config-governance.js
M tests/modules/test-cortex-heartbeat.js
M tests/modules/test-cos-workspace.test.js
M tests/modules/test-diagnostic-heal-path.js
M tests/modules/test-eravos-pulse-migration.js
M tests/modules/test-extract-code.js
M tests/modules/test-file-tree-plan.js
M tests/modules/test-guardian-agent-registry.js
M tests/modules/test-guardian-cfr-consolidation.js
M tests/modules/test-guardian-job-correlation.js
A tests/modules/test-guardian-json-routes.test.js
M tests/modules/test-guardian-state-provider.test.js
M tests/modules/test-intelligence-core-wired.js
M tests/modules/test-introspect.js
M tests/modules/test-map3d.js
M tests/modules/test-observability-map.js
M tests/modules/test-one-tab-e2e.test.js
M tests/modules/test-opportunity.test.js
M tests/modules/test-raid-agent-nodes.js
M tests/modules/test-raid-decision-record.js
M tests/modules/test-raid-officiator.js
M tests/modules/test-raid-processnext-am1-gate.js
M tests/modules/test-registration-shape.js
M tests/modules/test-repo-agent-provider.js
M tests/modules/test-repo-run.js
M tests/modules/test-schema-registry.js
M tests/modules/test-snapshot-half-life-prune.js
M tests/modules/test-spawn-guard.js
M tests/modules/test-user-model-everywhere.js
M tests/modules/test-versionium-migration.js
M tests/modules/test-work-queue.js
M tests/modules/uid.test.js
M tests/modules/warp-compounding.test.js
M tests/probe/nexus-atlas-home.js
M tests/userscript-adapter-consistency.test.js
M versionium/config.js
```

