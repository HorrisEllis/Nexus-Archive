# Nexus 0.5.4

| | |
|---|---|
| Built | 2026-06-15 22:33:58 → 2026-06-15 22:33:58 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.5.4 |
| Tag | `v0.5.4` → snap-0086 |
| Full file ledger | [LEDGER-0.5.4.csv](../ledger/LEDGER-0.5.4.csv) |

## Ledger

### Build 0.5.4 — snap-0086 — 2026-06-15 22:33:58

- Archive: `nexus-0086_2026-06-15_v0.5.4_system-21.zip` (was `nexus-system-21.zip`)
- SHA-256: `592ec1113cc98963f0ea3f9a6929a7d0e91d8543f8f7da2df6a9e8123e7aaaf9`, 2.9 MB, downloaded 2026-06-16 00:56:47
- Kind: full
- Commit: `82af6c95b55bbbfc8abfbe6eb044f44b5671880c`, tag `snap-0086`
- Identical copy: `nexus-0086_2026-06-15_v0.5.4_system-22_dup1.zip` (was `nexus-system-22.zip`)
- Files in archive: 724. Changes against the build before it: **199 added, 15 modified, 3 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 83 | 0 | 0 |
| spec-compiler | 55 | 0 | 0 |
| docs | 48 | 0 | 0 |
| guardian | 6 | 6 | 2 |
| lib | 4 | 1 | 0 |
| (root) | 0 | 3 | 1 |
| cortex | 1 | 3 | 0 |
| tests | 2 | 1 | 0 |
| auth | 0 | 1 | 0 |

```
D CHANGELOG.md
M MANIFEST.json
M auth/client.js
A cortex/behavioral-boundary/index.js
M cortex/boot.js
M cortex/core/raid/index.js
M cortex/memory/jaa-db.js
A docs/alk-perception.spec
A docs/architect.spec
A docs/auth.spec
A docs/bda.spec
A docs/behavioral-boundary.spec
A docs/blueprint.spec
A docs/bridge.spec
A docs/builder.spec
A docs/chat-logger.spec
A docs/cli.spec
A docs/component-registry.spec
A docs/context-builder.spec
A docs/contracts.spec
A docs/cortex.spec
A docs/cos.spec
A docs/diagnostic-engines.spec
A docs/diagnostic.spec
A docs/emerge.spec
A docs/erosmancer.spec
A docs/escalation.spec
A docs/forge.spec
A docs/guardian.spec
A docs/healer.spec
A docs/heartbeat.spec
A docs/hooks.spec
A docs/idearium.spec
A docs/intelligence.spec
A docs/jaa-db.spec
A docs/lib.spec
A docs/liminal.spec
A docs/meta-layer.spec
A docs/nexus-system-foundation.spec
A docs/orchestrator.spec
A docs/raid.spec
A docs/seam.spec
A docs/self-heal.spec
A docs/service.spec
A docs/siso.spec
A docs/snapshot.spec
A docs/spatial.spec
A docs/spec-compiler.spec
A docs/spec-drift.spec
A docs/telemetry-codec.spec
A docs/tests.spec
A docs/topo-kernel.spec
A docs/ui-registry.spec
A docs/ui.spec
A docs/vector-memory.spec
M guardian/api-dispatch.js
M guardian/dropzone-persist.js
D guardian/lib/cli-registry.js
D guardian/lib/dom-picker-inject.js
A guardian/memory_store/cfr_state.json
A guardian/memory_store/event_stats.json
A guardian/memory_store/gaps.json
A guardian/memory_store/ledger.json
A guardian/memory_store/settings.json
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-ollama.js
A lib/component-registry.js
M lib/meta/topo-kernel/index.js
A lib/spec-drift.js
A lib/ui-registry.js
A lib/version.js
M orchestrator.js
M package.json
A spec-compiler/SPEC_COMPILER.spec
A spec-compiler/chunk/index.js
A spec-compiler/cli.js
A spec-compiler/compiler/baseline-tracker.js
A spec-compiler/compiler/emit.js
A spec-compiler/compiler/gap-field-engine.js
A spec-compiler/compiler/index.js
A spec-compiler/compiler/invariants-engine.js
A spec-compiler/compiler/kg-builder.js
A spec-compiler/compiler/pipeline.js
A spec-compiler/compiler/reply-engine.js
A spec-compiler/compiler/ring-buffer.js
A spec-compiler/compiler/tier-contract.js
A spec-compiler/cortex-query/index.js
A spec-compiler/cortex-query/writeback.js
A spec-compiler/dispatch.js
A spec-compiler/output/verify-run/package.json
A spec-compiler/output/verify-run/src/index.ts
A spec-compiler/output/verify-run/src/modules/chunk/chunk.interface.ts
A spec-compiler/output/verify-run/src/modules/chunk/chunk.test.ts
A spec-compiler/output/verify-run/src/modules/chunk/chunk.ts
A spec-compiler/output/verify-run/src/modules/chunk/index.ts
A spec-compiler/output/verify-run/src/modules/compiler-t0/compiler-t0.interface.ts
A spec-compiler/output/verify-run/src/modules/compiler-t0/compiler-t0.test.ts
A spec-compiler/output/verify-run/src/modules/compiler-t0/compiler-t0.ts
A spec-compiler/output/verify-run/src/modules/compiler-t0/index.ts
A spec-compiler/output/verify-run/src/modules/compiler-t1/compiler-t1.interface.ts
A spec-compiler/output/verify-run/src/modules/compiler-t1/compiler-t1.test.ts
A spec-compiler/output/verify-run/src/modules/compiler-t1/compiler-t1.ts
A spec-compiler/output/verify-run/src/modules/compiler-t1/index.ts
A spec-compiler/output/verify-run/src/modules/cortex-query/cortex-query.interface.ts
A spec-compiler/output/verify-run/src/modules/cortex-query/cortex-query.test.ts
A spec-compiler/output/verify-run/src/modules/cortex-query/cortex-query.ts
A spec-compiler/output/verify-run/src/modules/cortex-query/index.ts
A spec-compiler/output/verify-run/src/types/events.ts
A spec-compiler/output/verify-run/src/types/index.ts
A spec-compiler/output/verify-run/src/types/schemas.ts
A spec-compiler/output/verify-run/tsconfig.json
A spec-compiler/package-lock.json
A spec-compiler/package.json
A spec-compiler/runtime.spec
A spec-compiler/seams/CORTEX_QUERY_SEAM.js
A spec-compiler/siso/Event.js
A spec-compiler/siso/Gate.js
A spec-compiler/siso/Stream.js
A spec-compiler/siso/StreamLog.js
A spec-compiler/siso/index.js
A spec-compiler/test/gap-field.test.js
A spec-compiler/test/invariants.test.js
A spec-compiler/test/kg.test.js
A spec-compiler/test/propagation.test.js
A spec-compiler/test/reply-engine.test.js
A spec-compiler/test/tier-contract.test.js
A spec-compiler/verify.js
A spec-compiler/version.js
M tests/brutal-results.json
A tests/modules/test-component-registry.js
A tests/modules/test-ui-registry.js
```

84 more (mostly data, logs and archived files) are in the ledger file.

