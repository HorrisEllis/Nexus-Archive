# Nexus 0.60.47

**0.60.47 — 2026-10-15**

| | |
|---|---|
| Built | 2026-10-15 06:23:54 → 2026-10-15 06:23:54 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.47 |
| Tag | `v0.60.47` → snap-0753 |
| Full file ledger | [LEDGER-0.60.47.csv](../ledger/LEDGER-0.60.47.csv) |

## Release notes — `CHANGELOG-0.60.47.md`

Copied unchanged from the build.

### 0.60.47 — 2026-10-15

James: "Claude's reply not found … it should have poped up with the claude window but didint."

#### A reply that can't be found now opens the agent's window

His log showed `job 119a854e — needs-you (claude's page changed: the reply could not be found on it — pick the reply …)`, followed by no `[attention] claude` line. The Claude window never opened.

**Why it didn't open.** There are two ways a job ends up at "pick the reply":
- **The dispatch ladder.** It opened the agent's window with the Nexus picker panel.
- **Job retry.** A job's watch can end with "no reply element". This path only wrote a message on the job, so the window never appeared. This is the path James's Claude job took.

**What changed.** Job retry now opens the window too, using the same request as the dispatch ladder: the provider, reason `map`, the job, the agent, and stage `reply_not_found`. Before asking James, it first checks the chat transcript and the saved response. If the answer is already there, it uses that and asks nobody.

#### Proof

- test-reply-not-found-attention: 3/3. RA-01 and RA-03 fail on the old code.
- Unchanged:
  - guardian-retry-novelty-installs: 52 passed, 1 skipped
  - raid-retry-escalation: 9/9
  - plan-code-run-attention: 40/40
- guardian-job-correlation: 2 failures, the same ones that fail on main.

## Ledger

### Build 0.60.47 — snap-0753 — 2026-10-15 06:23:54

- Archive: `nexus-0753_2026-10-15_v0.60.47.zip` (was `nexus-0.60.47.zip`)
- SHA-256: `6abe7fec0e20e175297c95d60e42966007613b07f559d102b6fd7eca1e089710`, 16.6 MB, downloaded 2026-10-15 06:26:48
- Kind: full
- Commit: `2286bb12d53f43d89ad6ed9f00c3949b04563943`, tag `snap-0753`
- Files in archive: 5741. Changes against the build before it: **68 added, 86 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 23 | 2 | 0 |
| tests | 19 | 6 | 0 |
| lib | 13 | 11 | 0 |
| guardian | 2 | 20 | 0 |
| docs | 4 | 11 | 0 |
| idearium | 1 | 12 | 0 |
| clear-glass | 1 | 5 | 0 |
| loom | 1 | 5 | 0 |
| cortex | 0 | 5 | 0 |
| scripts | 1 | 1 | 0 |
| versionium | 1 | 1 | 0 |
| cos | 1 | 1 | 0 |
| copilot | 0 | 2 | 0 |
| ollama | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| architect | 0 | 1 | 0 |
| intelligence | 0 | 1 | 0 |
| .github | 1 | 0 | 0 |

```
A .github/workflows/release.yml
M .gitignore
A CHANGELOG-0.60.26.md
A CHANGELOG-0.60.27.md
A CHANGELOG-0.60.28.md
A CHANGELOG-0.60.29.md
A CHANGELOG-0.60.30.md
A CHANGELOG-0.60.31.md
A CHANGELOG-0.60.32.md
A CHANGELOG-0.60.33.md
A CHANGELOG-0.60.34.md
A CHANGELOG-0.60.35.md
A CHANGELOG-0.60.36.md
A CHANGELOG-0.60.37.md
A CHANGELOG-0.60.38.md
A CHANGELOG-0.60.39.md
A CHANGELOG-0.60.40.md
A CHANGELOG-0.60.41.md
A CHANGELOG-0.60.42.md
A CHANGELOG-0.60.43.md
A CHANGELOG-0.60.44.md
A CHANGELOG-0.60.45.md
A CHANGELOG-0.60.46.md
A CHANGELOG-0.60.47.md
A VERSION
M architect/spec/architect.spec
M clear-glass/renderer/guardian-picker.js
M clear-glass/src/main/index.js
M clear-glass/src/providers/account-switch.js
M clear-glass/src/providers/attention.js
M clear-glass/src/providers/host.js
A clear-glass/src/providers/profile-tabs.js
M copilot/adversarial.js
M copilot/server.js
M cortex/boot.js
M cortex/core/raid/contract-adapters.js
M cortex/core/raid/contract-gates.js
M cortex/core/raid/contract-intake.js
M cortex/core/raid/officiator.js
M cos/spec/check-catalogue.spec
A cos/spec/deny-list.spec
M docs/2026-10-01-idearium-agent-ready-master-phasemap.spec
M docs/2026-10-07-versionium-releases-phasemap.spec
M docs/2026-10-12-browser-providers-and-work-phasemap.spec
M docs/2026-10-12-request-spine-phasemap.spec
M docs/2026-10-13-gates-that-learn-and-priorities-phasemap.spec
M docs/2026-10-13-nexus-memory-gates-and-contract-phasemap.spec
M docs/2026-10-13-projects-raid-and-gates-phasemap.spec
A docs/2026-10-15-automatic-tracking-phasemap.spec
A docs/2026-10-15-capability-specs-and-semantic-page-tree-phasemap.spec
A docs/2026-10-15-one-contract-raid-releases-phasemap.spec
M docs/CLAUDE.md
A docs/HANDOFF-local-claude-code.md
M docs/PROOF-OF-COMPETENCY.md
M docs/SPEC-REGISTRY.spec
M docs/contracts/ct0-executable-contracts.contract
M guardian/ask.js
M guardian/event-taxonomy.js
M guardian/lib/account-routing.js
M guardian/lib/dispatch-pool-bridge.js
M guardian/lib/dispatcher.js
M guardian/lib/index.js
M guardian/lib/job-retry.js
M guardian/lib/ncp.js
A guardian/lib/profile-lanes.js
A guardian/lib/provider-ready.js
M guardian/lib/provider-routing.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/api/build-surface.js
M idearium/api/index.js
M idearium/cli/route-commands.js
M idearium/event-taxonomy.cjs
M idearium/index.js
M idearium/lib/config-core.cjs
M idearium/repo/build-plan.js
M idearium/repo/index.js
A idearium/repo/phase-mapping.js
M idearium/ui/index.html
M idearium/ui/js/phases.js
M idearium/ui/js/plan-panel.js
M idearium/ui/settings.html
M intelligence/spec/intelligence.spec
M lib/agent-facts-hash.js
M lib/agent-intent-contract.js
M lib/agent-providers.js
A lib/check-catalogue.js
A lib/checks/ck-230-shadow.js
A lib/checks/ck-233-deny.js
A lib/checks/ck-247-decomposition.js
A lib/checks/ck-248-toolchain.js
A lib/checks/ck-253-versions.js
M lib/gap-relay.js
M lib/model-door.js
A lib/nexus-releases.js
M lib/node-schemas/schema.provider
A lib/phase-cost.js
A lib/phase-files.js
M lib/phase-plan.js
M lib/pipeline-routing.js
A lib/release-version.js
A lib/repo-releases.js
A lib/route-eligibility.js
A lib/run-ready.js
M lib/shadow.js
M lib/version.js
M lib/zip-ingest.js
M loom/bootstrap.js
M loom/maps/build-surface-map.js
M loom/maps/raid-events-and-tools-map.js
A loom/maps/releases-map.js
M ollama/spec/ollama.spec
M orchestrator/orchestrator.js
M package.json
M scripts/precommit-check.js
A scripts/release-zip.js
M tests/modules/run-all.js
A tests/modules/test-account-fallback.test.js
A tests/modules/test-cg-attention-focus.test.js
A tests/modules/test-check-catalogue.test.js
M tests/modules/test-chunked-phase-build.test.js
M tests/modules/test-contract-adapters.test.js
M tests/modules/test-contract-phase-build.test.js
M tests/modules/test-dispatcher-deepseek-ncp.js
A tests/modules/test-gate-assess.test.js
A tests/modules/test-gate-tracking.test.js
A tests/modules/test-gate-versioning.test.js
A tests/modules/test-lean-quiet.test.js
A tests/modules/test-ncp-half-open.test.js
A tests/modules/test-phase-cost.test.js
A tests/modules/test-phase-mapping.test.js
A tests/modules/test-profile-tabs.test.js
A tests/modules/test-qa2-real-run.test.js
M tests/modules/test-raid-officiator.js
A tests/modules/test-raid-runs-contract.test.js
A tests/modules/test-recursive-split.test.js
A tests/modules/test-release-version.test.js
A tests/modules/test-releases.test.js
A tests/modules/test-reply-not-found-attention.test.js
A tests/modules/test-route-eligibility.test.js
A tests/modules/test-run-ready.test.js
A versionium/lib/releases.js
M versionium/routes/versionium.js
```

7 more (mostly data, logs and archived files) are in the ledger file.

