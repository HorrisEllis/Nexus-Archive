# Nexus 0.39.324

**0.39.324 — 2026-10-05**

| | |
|---|---|
| Built | 2026-10-05 02:57:04 → 2026-10-05 02:57:04 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.324 |
| Tag | `v0.39.324` → snap-0728 |
| Full file ledger | [LEDGER-0.39.324.csv](../ledger/LEDGER-0.39.324.csv) |

## Release notes — `CHANGELOG-0.39.324.md`

Copied unchanged from the build.

### 0.39.324 — 2026-10-05

James: "can you benchmark it?"

`scripts/bench-warp2-vs-siso.mjs` (`node --expose-gc scripts/bench-warp2-vs-siso.mjs [N]`) runs SISO, WARP 1.x and WARP 2 on one workload: N causes, a handler turns each into an effect, and one in ten never got its effect. Logging is on in each. Results are the median of 7 runs on node v22:

| N | system | causes/sec | vs SISO | bytes held/cause | missing effects found | what caused an effect |
|---|---|---|---|---|---|---|
| 20000 | SISO | 185217 | 1.00x | 169 | cannot tell | cannot tell |
| 20000 | WARP 1.x | 152163 | 0.82x | 506 | cannot tell | cannot tell |
| 20000 | WARP 2 | 39016 | 0.21x | 1223 | 2000 (exact) | effect ← cause |
| 100000 | SISO | 196287 | 1.00x | 162 | cannot tell | cannot tell |
| 100000 | WARP 1.x | 121322 | 0.62x | 505 | cannot tell | cannot tell |
| 100000 | WARP 2 | 35836 | 0.18x | 1204 | 10000 (exact) | effect ← cause |

The benchmark found two WARP 2 bugs. Both are fixed in WARP 2.0.1.

- **Wrong answer:** WARP 2 reported 20000 of 20000 causes without their effect instead of 2000. An expectation could only be declared after its emit returned, and a synchronous handler had already produced the effect by then. Now `emit(..., { expect })` declares it with the link, before any handler runs. Test W2-07.
- **Slow:** WARP 2 was quadratic, at 0.01x SISO, because every emit scanned every open expectation. Open expectations are now indexed by effect and by cause link.

Where WARP 2's remaining time goes (CPU profile): about three quarters is the hash chain, which canonicalizes and hashes every ledger entry. That is what makes the ledger verifiable; it was not traded away.

`test-warp2` 7/7. WARP 1.x 43/43 and Emergence 155/155 are unchanged.

## Ledger

### Build 0.39.324 — snap-0728 — 2026-10-05 02:57:04

- Archive: `nexus-0728_2026-10-05_v0.39.324_main-22.zip` (was `Nexus-main-22.zip`)
- SHA-256: `c8c35777bc02854140f7f54dfc698f2bcc87dc56860fd55455e8aef4a8e17b74`, 14.5 MB, downloaded 2026-10-05 03:04:54
- Kind: full
- Commit: `b0faf79298c9d45197630cc9067508fee671e66e`, tag `snap-0728`
- Identical copy: `nexus-0728_2026-10-05_v0.39.324_main-23_dup1.zip` (was `Nexus-main-23.zip`)
- Identical copy: `nexus-0728_2026-10-05_v0.39.324_main-24_dup2.zip` (was `Nexus-main-24.zip`)
- Identical copy: `nexus-0728_2026-10-05_v0.39.324_main-25_dup3.zip` (was `Nexus-main-25.zip`)
- Files in archive: 5241. Changes against the build before it: **153 added, 52 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| emergence | 84 | 0 | 0 |
| docs | 2 | 20 | 0 |
| (root) | 20 | 1 | 0 |
| idearium | 10 | 11 | 0 |
| warp | 11 | 5 | 0 |
| tests | 8 | 6 | 0 |
| emerge | 13 | 0 | 0 |
| lib | 3 | 5 | 0 |
| loom | 0 | 3 | 0 |
| cli | 0 | 1 | 0 |
| cos | 1 | 0 | 0 |
| scripts | 1 | 0 | 0 |

```
A CHANGELOG-0.39.305.md
A CHANGELOG-0.39.306.md
A CHANGELOG-0.39.307.md
A CHANGELOG-0.39.308.md
A CHANGELOG-0.39.309.md
A CHANGELOG-0.39.310.md
A CHANGELOG-0.39.311.md
A CHANGELOG-0.39.312.md
A CHANGELOG-0.39.313.md
A CHANGELOG-0.39.314.md
A CHANGELOG-0.39.315.md
A CHANGELOG-0.39.316.md
A CHANGELOG-0.39.317.md
A CHANGELOG-0.39.318.md
A CHANGELOG-0.39.319.md
A CHANGELOG-0.39.320.md
A CHANGELOG-0.39.321.md
A CHANGELOG-0.39.322.md
A CHANGELOG-0.39.323.md
A CHANGELOG-0.39.324.md
M cli/nexus.js
A cos/interaction-contract.json
M docs/2026-10-01-idearium-agent-ready-master-phasemap.spec
M docs/2026-10-02-emerge-field-memory-build-phasemap.spec
A docs/2026-10-05-build-from-the-spec-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/architecture-spec/architecture-spec.spec
M docs/atlases/architect-atlas.md
M docs/atlases/clear-glass-atlas.md
M docs/atlases/components-atlas.md
M docs/atlases/copilot-atlas.md
M docs/atlases/core-atlas.md
M docs/atlases/cortex-atlas.md
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
A docs/emerge-copies-divergence.md
A emerge/core/budget.js
A emerge/core/constraint.js
A emerge/core/field.js
A emerge/core/gap.js
A emerge/core/history.js
A emerge/core/index.js
A emerge/core/lens.js
A emerge/core/level.js
A emerge/core/observation.js
A emerge/core/seed.js
A emerge/core/transition.js
A emerge/interaction-contract.json
A emerge/spec/emerge-core.spec
A emergence/ARCHITECTURE.md
A emergence/MANIFEST.json
A emergence/README.md
A emergence/cli.js
A emergence/components/associative-lattice/component.spec
A emergence/components/associative-lattice/index.js
A emergence/components/causal-graph/component.spec
A emergence/components/causal-graph/index.js
A emergence/components/cfr-creator/component.spec
A emergence/components/cfr-creator/index.js
A emergence/components/event-ledger/component.spec
A emergence/components/event-ledger/index.js
A emergence/components/feedback-loop-buffer/README.md
A emergence/components/feedback-loop-buffer/api/server.js
A emergence/components/feedback-loop-buffer/cli/ring-cli.js
A emergence/components/feedback-loop-buffer/component.spec
A emergence/components/feedback-loop-buffer/core/RingBufferCore.js
A emergence/components/feedback-loop-buffer/core/wire.js
A emergence/components/feedback-loop-buffer/diagnostics/health.js
A emergence/components/feedback-loop-buffer/index.js
A emergence/components/feedback-loop-buffer/package.json
A emergence/components/feedback-loop-buffer/persist/EvictionLedger.js
A emergence/components/feedback-loop-buffer/persist/FilePersistence.js
A emergence/components/feedback-loop-buffer/test/ringbuffer.test.js
A emergence/components/feedback-loop-buffer/test/runner.js
A emergence/components/idea-store/component.spec
A emergence/components/idea-store/index.js
A emergence/components/idea-store/test/idea-store.test.js
A emergence/components/pattern-engine/component.spec
A emergence/components/pattern-engine/index.js
A emergence/components/pattern-engine/test/pattern-engine.test.js
A emergence/components/rfr2-observer/component.spec
A emergence/components/rfr2-observer/index.js
A emergence/components/rfr2-observer/kernel-adapter.mjs
A emergence/components/rfr2-observer/sentiment-scorer.js
A emergence/components/rfr2-observer/test/affective-field.test.js
A emergence/components/rfr2-observer/test/oscillatory.test.js
A emergence/components/rfr2-observer/test/relational-gaps.test.js
A emergence/components/rfr2-observer/test/reversal-negspace.test.js
A emergence/components/rfr2-observer/test/sentiment-scorer.test.js
A emergence/components/rfr2-observer/test/shadow-etc.test.js
A emergence/contracts/LLM_CONTRACT.js
A emergence/contracts/test/llm-contract.test.js
A emergence/emerge-language.spec
A emergence/emergence.spec
A emergence/loop.js
A emergence/package.json
A emergence/schemas/created.schema.json
A emergence/schemas/idea-edge.schema.json
A emergence/schemas/idea.schema.json
A emergence/schemas/ledger-record.schema.json
A emergence/schemas/observation.schema.json
A emergence/schemas/target.schema.json
A emergence/schemas/test/schemas.test.js
A emergence/schemas/tick-result.schema.json
A emergence/server.js
A emergence/test/loop.test.js
A emergence/test/server.test.js
A emergence/vendor/jaa/FileRefs.js
A emergence/vendor/jaa/FileStore.js
A emergence/vendor/jaa/Recovery.js
A emergence/vendor/jaa/canonicalize.js
A emergence/vendor/jaa/test/jaa-port.test.js
A emergence/vendor/resonance-v5.1/relational-physics.js
A emergence/vendor/rfr2/causality/index.js
A emergence/vendor/rfr2/cfr-kernel/index.js
A emergence/vendor/rfr2/cfr-kernel/physics.js
A emergence/vendor/rfr2/cfr-kernel/render.js
A emergence/vendor/rfr2/cfr-kernel/rewind.js
A emergence/vendor/rfr2/field/ALKModule.js
A emergence/vendor/rfr2/field/relational.js
A emergence/vendor/rfr2/lattice/lattice.js
A emergence/vendor/rfr2/ledger/index.js
A emergence/vendor/rfr2/liminal/assumption.js
A emergence/vendor/rfr2/liminal/bus.js
A emergence/vendor/rfr2/liminal/contrastive.js
A emergence/vendor/rfr2/liminal/core.js
A emergence/vendor/rfr2/liminal/existential.js
A emergence/vendor/rfr2/liminal/negative-space.js
A emergence/vendor/rfr2/liminal/oscillatory.js
A emergence/vendor/rfr2/liminal/relational-gaps.js
A emergence/vendor/rfr2/liminal/reversal.js
A emergence/vendor/rfr2/liminal/shadow.js
A emergence/vendor/rfr2/liminal/structural.js
M idearium/api/index.js
M idearium/index.js
M idearium/lib/config-core.cjs
M idearium/package.json
M idearium/repo/index.js
M idearium/spec-engine/blocks.yaml
M idearium/spec-engine/chunk-dispatch.js
M idearium/spec-engine/index.js
M idearium/spec-engine/templates/architecture-spec.template.yaml
```

55 more (mostly data, logs and archived files) are in the ledger file.

