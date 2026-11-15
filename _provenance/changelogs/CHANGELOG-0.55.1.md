# Nexus 0.55.1

**0.55.1 — 2026-10-10**

| | |
|---|---|
| Built | 2026-10-09 12:15:10 → 2026-10-09 12:15:10 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.55.1 |
| Tag | `v0.55.1` → snap-0742 |
| Full file ledger | [LEDGER-0.55.1.csv](../ledger/LEDGER-0.55.1.csv) |

## Release notes — `CHANGELOG-0.55.1.md`

Copied unchanged from the build.

### 0.55.1 — 2026-10-10

James: "plan panel, needs to not show all the phases. it is for the current plans only, basically the queue also for the build surface which has vanished." · "look at the .response in clearglass. the problem with copilot is i dont get an understanding of why a agent didnt work. just says copilot." · "we need to prioritize on getting it stable and working."

#### The Plan is the queue (HP9)

On "every phasemap", the Plan listed all 1,000 steps. The CT7 filter only folded away the finished ones, so every not-started phase of every map showed, shelved phases included. The Plan now shows:

- **Now:** every step with runs, or marked active.
- **Next:** three not-started steps from the maps that have something now, or from the map you chose.
- **The rest:** one line with its count, which you can open.
- **Done:** still folded into one line.
- **The shelf:** never listed, only a count.

#### The build surface is back in view (HP10)

The work surface sits below the queue. It had been pushed off the bottom by a thousand steps. With the short queue it's visible again.

#### A reply on the page is never sent again (HP11)

"No reply element found … findResponseEl() matched nothing" means the page changed, not that the agent failed. The prompt used to be typed into the same chat again, up to four times.

Now guardian reads the chat transcript and the Clear Glass `.response` first:
- **The answer is there:** the job completes from it.
- **It isn't:** the job asks you to pick the reply with ◎. The pick is saved for every job after, and the prompt is not sent twice.

#### A failure names the agent (HP12)

A timed-out dispatch used to say only "copilot :3750 did not answer in time". It now names:
- the agent, or the Ollama model;
- the route it took;
- how long it waited;
- for a browser agent, where guardian's job for this repo stood: its gate sentence, job id and status.

When copilot is unreachable, it says nothing was sent to that agent.

#### Tests

| Suite | Result |
|---|---|
| test-hardening-pass (HR-08, HR-09 new) | 9/9 |
| test-guardian-retry-novelty-installs (3 new checks) | 52/52 |
| test-repo-agent | 17/17 |
| test-repo-agent-provider | 67/67 |
| test-build-surface | 13/13 |
| test-build-surface-2 | 3/3 |
| test-code-tab | 16/16 |
| test-phases-tab | 5/5 |
| test-escalation-ladder | 9/9 |
| test-lifeline-guardian-timeout | 6/6 |

## Ledger

### Build 0.55.1 — snap-0742 — 2026-10-09 12:15:10

- Archive: `nexus-0742_2026-10-09_v0.55.1_main-41.zip` (was `Nexus-main-41.zip`)
- SHA-256: `b379879bc6682dea024c1126e8690afca858f7a6dbf759ca5341dbb9e30a6b79`, 15.4 MB, downloaded 2026-10-09 12:15:27
- Kind: full
- Commit: `7103e061333686c5a89efb6b7b69a8fc8796c176`, tag `snap-0742`
- Files in archive: 5491. Changes against the build before it: **17 added, 103 modified, 3 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 5 | 72 | 0 |
| idearium | 1 | 9 | 0 |
| (root) | 7 | 1 | 0 |
| tests | 1 | 6 | 0 |
| lib | 0 | 6 | 0 |
| loom | 0 | 5 | 0 |
| _archive | 3 | 0 | 0 |
| copilot | 0 | 2 | 0 |
| guardian | 0 | 2 | 0 |
| ui | 0 | 0 | 2 |
| scripts | 0 | 0 | 1 |

```
A CHANGELOG-0.52.0.md
A CHANGELOG-0.53.0.md
A CHANGELOG-0.54.0.md
A CHANGELOG-0.54.1.md
A CHANGELOG-0.54.2.md
A CHANGELOG-0.55.0.md
A CHANGELOG-0.55.1.md
A _archive/2026-10-09-declutter/scripts/_register-session-hooks.js
A _archive/2026-10-09-declutter/ui/pipeline-tutorial.js
A _archive/2026-10-09-declutter/ui/ui-pulse.js
M copilot/lifeline.js
M copilot/spec/copilot.spec
M docs/2026-08-22-session-full-phasemap.spec
M docs/2026-08-23-backlog-phasemap.spec
M docs/2026-08-27-event-taxonomy-and-brainstorm-phasemap.spec
M docs/2026-08-28-definition-of-complete-phasemap.spec
M docs/2026-08-28-self-building-pipeline-phasemap.spec
M docs/2026-08-30-interaction-contract-context-phasemap.spec
M docs/2026-09-01-living-model-and-autonomous-pipeline-phasemap.spec
M docs/2026-09-02-agent-mesh-full-map-phasemap.spec
M docs/2026-09-02-nexus-vision-master-phasemap.spec
M docs/2026-09-02-versionium-sovereign-and-cleanup-phasemap.spec
M docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
M docs/2026-09-11-compartment-nodetype-and-reorg-phasemap.spec
M docs/2026-09-11-sovereign-node-architecture-phasemap.spec
M docs/2026-09-13-axiom-5-2-raid-routing-phasemap.spec
M docs/2026-09-13-track-b-sovereignty-phasemap.spec
M docs/2026-09-19-architect-blueprint-forge-idearium-phasemap.spec
M docs/2026-09-19-cortex-to-intelligence-and-versionium-consolidation-phasemap.spec
M docs/2026-09-19-guardian-mesh-first-dispatch-phasemap.spec
M docs/2026-09-22-brainos-agent-suite-phasemap.spec
M docs/2026-09-22-clear-glass-tab-per-repo-and-ui-expansion-phasemap.spec
M docs/2026-09-26-guardian-retry-novelty-and-installs-phasemap.spec
M docs/2026-09-27-components-store-and-atlases-phasemap.spec
M docs/2026-09-28-graph-build-context-settings-memory-phasemap.spec
M docs/2026-09-28-staging-self-heal-phasemap.spec
M docs/2026-09-29-build-surface-phasemap.spec
M docs/2026-09-29-nex-node-store-phasemap.spec
M docs/2026-09-29-tool-layers-and-pane-memory-phasemap.spec
M docs/2026-09-30-idearium-coding-flow-phasemap.spec
M docs/2026-10-01-idearium-agent-ready-master-phasemap.spec
M docs/2026-10-01-routing-registry-genesis-phasemap.spec
M docs/2026-10-01-work-visibility-job-reuse-phasemap.spec
M docs/2026-10-02-emerge-field-memory-build-phasemap.spec
M docs/2026-10-02-fractal-graph-any-size-agent-phasemap.spec
M docs/2026-10-02-synthesis-zoom-versionium-phasemap.spec
M docs/2026-10-02-workshop-codex-rewind-phasemap.spec
M docs/2026-10-05-announce-pulse-repair-phasemap.spec
M docs/2026-10-05-build-from-the-spec-phasemap.spec
M docs/2026-10-05-cli-data-code-phasemap.spec
M docs/2026-10-05-cos-machines-phasemap.spec
M docs/2026-10-05-failure-reproduction-phasemap.spec
M docs/2026-10-05-fiverr-guide-phasemap.spec
M docs/2026-10-05-idea-to-spec-workshop-phasemap.spec
M docs/2026-10-05-spec-workshop-rebuild-phasemap.spec
M docs/2026-10-05-verified-primitives-phasemap.spec
M docs/2026-10-07-compartment-control-and-activity-phasemap.spec
M docs/2026-10-07-heal-nodes-phasemap.spec
M docs/2026-10-07-idearium-one-surface-phasemap.spec
M docs/2026-10-07-ollama-recorder-phasemap.spec
M docs/2026-10-07-runtime-load-phasemap.spec
M docs/2026-10-07-system-expectations-phasemap.spec
M docs/2026-10-07-versionium-releases-phasemap.spec
A docs/2026-10-09-hardening-pass-phasemap.spec
A docs/2026-10-09-one-model-engine-phasemap.spec
A docs/2026-10-09-one-roadmap-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/agent-intelligence-loop-phasemap.spec
M docs/agent-model-and-user-continuity-phasemap.spec
M docs/atlases/core-atlas.md
M docs/clearglass-agent-suite-and-cfr-loom-phasemap.spec
M docs/copilot-guardian-cos-expansion-phasemap.spec
M docs/copilot-omniscience-phasemap.spec
M docs/cortex-schema-registry-phasemap.spec
M docs/gemini-multiagent-coding-phasemap.spec
M docs/idearium-creative-repo-overhaul-phasemap.spec
M docs/idearium-repository-overhaul-phasemap.spec
M docs/nexus-architecture-rebuild-phasemap.spec
M docs/nexus-repo-compartment-and-rich-dispatch-phasemap.spec
M docs/nexus-repository-system-build-phasemap.spec
M docs/nexus-self-build-pipeline-phasemap.spec
M docs/nexus-system-standardization-phasemap.spec
M docs/raid-routing-fidelity-phasemap.spec
M docs/raid.spec
M docs/repair-contract-and-loom-hub-phasemap.spec
M docs/rich-atlas-phasemap.spec
A docs/roadmap-triage.md
M docs/snapshot-trigger-phasemap.spec
A docs/the-path.md
M guardian/lib/job-retry.js
M guardian/spec/guardian.spec
M idearium/api/index.js
M idearium/lib/config-core.cjs
M idearium/repo/build-plan.js
M idearium/repo/roadmap.js
A idearium/repo/run-reconcile.js
M idearium/repo/thread.js
M idearium/ui/index.html
M idearium/ui/js/phases.js
M idearium/ui/js/plan-panel.js
M idearium/ui/settings.html
M lib/economy/ledger.js
M lib/economy/router.js
M lib/pipeline-routing.js
M lib/repo-agent.js
M lib/spec-document.js
M lib/version.js
M loom/data/events.json
M loom/data/registry.json
M loom/maps/build-surface-map.js
M loom/scanners/phasemap-map.js
M loom/spec/loom.spec
M package.json
D scripts/_register-session-hooks.js
M tests/modules/run-all.js
M tests/modules/test-guardian-retry-novelty-installs.js
A tests/modules/test-hardening-pass.test.js
M tests/modules/test-lifeline-guardian-timeout.test.js
M tests/modules/test-loom-phasemap-status.js
M tests/modules/test-spec-document.test.js
M tests/modules/test-thread.test.js
D ui/pipeline-tutorial.js
D ui/ui-pulse.js
```

