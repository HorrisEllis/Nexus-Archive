# Nexus 0.0.51

| | |
|---|---|
| Built | 2026-06-12 12:05:34 → 2026-06-12 12:05:34 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 1.0.0 |
| Tag | `v0.0.51` → snap-0055 |
| Full file ledger | [LEDGER-0.0.51.csv](../ledger/LEDGER-0.0.51.csv) |

This build predates the 0.x numbering. `0.0.N` is its place in the order; the number it carried at the time is in the row above.

## Ledger

### Build 0.0.51 — snap-0055 — 2026-06-12 12:05:34

- Archive: `nexus-0055_2026-06-12_v0.0.51_system_declared-1.0.0.zip` (was `nexus-system.zip`)
- SHA-256: `2b57caf5a48e233601001c1874902bcb58d518163c81b5cd5b6e791bfcc20962`, 2.3 MB, downloaded 2026-06-12 12:06:14
- Kind: full
- Claimed version: 1.0.0 (registry 1.0.0, file name none); filed under 0.0.51 to keep the line in order
- Commit: `0661e47d5f045ed4b0a26e4267209e9ac87214b5`, tag `snap-0055`
- Files in archive: 535. Changes against the build before it: **106 added, 31 modified, 59 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| spec-compiler | 53 | 0 | 0 |
| data | 44 | 3 | 5 |
| cortex | 0 | 4 | 46 |
| (root) | 6 | 7 | 0 |
| architect | 2 | 2 | 2 |
| guardian | 1 | 4 | 0 |
| tests | 0 | 0 | 5 |
| ui | 0 | 2 | 1 |
| bridge | 0 | 2 | 0 |
| lib | 0 | 2 | 0 |
| cli | 0 | 1 | 0 |
| hooks | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| seams | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M MANIFEST.json
M README.md
A architect/compile-route.js
M architect/service.js
M architect/src/spec/Blueprint.js
A architect/src/ui/spec-builder.html
M bridge/index.js
M bridge/server.js
M cli/boot-systems.js
A emerge-codegen-v2.js
M emerge-ide.js
M emerge.spec
M guardian/memory_store/cfr_state.json
M guardian/memory_store/event_stats.json
A guardian/memory_store/gaps.json
M guardian/memory_store/settings.json
M hooks/index.js
M idearium/index.js
M lib/cfr/field.js
M lib/node-ledger.js
A nexus-bus.js
A nexus-cfr-influence.js
M nexus-connect.js
A nexus-heal-loop.js
A nexus-knowledge.js
A nexus-query.js
M orchestrator.js
M package.json
M seams/seam-contracts.js
M service/nexus-diagnostic.js
A spec-compiler/SPEC_COMPILER.spec
A spec-compiler/chunk/index.js
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
D tests/brutal-results.json
D tests/diagnose-results.json
D tests/integration-results.json
D tests/kernel-test-results.json
D tests/pipeline-results.json
M ui/home/index.html
M ui/index.html
```

106 more (mostly data, logs and archived files) are in the ledger file.

