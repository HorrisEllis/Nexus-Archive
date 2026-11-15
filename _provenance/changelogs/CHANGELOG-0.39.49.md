# Nexus 0.39.49

| | |
|---|---|
| Built | 2026-09-05 17:48:58 → 2026-09-05 20:47:02 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.49 |
| Tag | `v0.39.49` → snap-0500 |
| Full file ledger | [LEDGER-0.39.49.csv](../ledger/LEDGER-0.39.49.csv) |

## Ledger

### Build 0.39.49-r1 — snap-0499 — 2026-09-05 17:48:58

- Archive: `nexus-0499_2026-09-05_v0.39.49-r1_vnamed-0.39.49.zip` (was `nexus-v0.39.49.zip`)
- SHA-256: `b0bef5c9eb73e58483a57c6a585b0cd660f853838369ffd338eb304ee727eb4c`, 67.8 MB, downloaded 2026-09-05 17:49:48
- Kind: full
- Commit: `71a947e98c453bdb1fca2463e683bd927054ae7f`, tag `snap-0499`
- Left out: embedded .git (4054 files, HEAD 4b8248c0278299107cb48e8b469f0448407d142f (master))
- Left out: node_modules (55 files)
- Files in archive: 4295. Changes against the build before it: **36 added, 13 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 33 | 5 | 0 |
| data | 0 | 6 | 0 |
| (root) | 0 | 2 | 0 |
| cortex | 2 | 0 | 0 |
| tests | 1 | 0 | 0 |

```
M CHANGELOG.md
A cortex/data/snapshots/2732890a-0032-44b1-b760-2cef84073e2b.nex
A cortex/data/snapshots/2a7a5a19-26cf-4bf3-a4f4-39c71912fe9a.nex
M data/cortex/memory/cfr_tension_history.json
M data/cortex/memory/idearium_ideas.json
M data/cortex/memory/idearium_spec_chunks.json
M data/cortex/memory/idearium_spec_manifests.json
M data/cortex/memory/idearium_specs.json
M data/idearium/event_log.jsonl
A idearium/data/specs/08af9d3b-44c4-4156-8709-261d224a69e6/00-document-meta-f69195ba.md
A idearium/data/specs/08af9d3b-44c4-4156-8709-261d224a69e6/01-document-core-9bd6fe00.md
A idearium/data/specs/08af9d3b-44c4-4156-8709-261d224a69e6/02-document-events-7dbb0f5a.md
A idearium/data/specs/08af9d3b-44c4-4156-8709-261d224a69e6/03-document-modules-9c7844bb.md
A idearium/data/specs/08af9d3b-44c4-4156-8709-261d224a69e6/04-document-command-index-c9c15d99.md
A idearium/data/specs/08af9d3b-44c4-4156-8709-261d224a69e6/05-document-routes-7808488f.md
A idearium/data/specs/08af9d3b-44c4-4156-8709-261d224a69e6/06-document-handshake-6a0a7495.md
A idearium/data/specs/08af9d3b-44c4-4156-8709-261d224a69e6/07-document-ui-81bddc79.md
A idearium/data/specs/08af9d3b-44c4-4156-8709-261d224a69e6/08af9d3b-44c4-4156-8709-261d224a69e6.spec
A idearium/data/specs/08af9d3b-44c4-4156-8709-261d224a69e6/manifest.json
A idearium/data/specs/1fbd72d5-65ad-4b5a-9433-813faa68938e/01-purpose-1d1c763a.md
A idearium/data/specs/1fbd72d5-65ad-4b5a-9433-813faa68938e/manifest.json
M idearium/data/specs/382a3442-220b-47e0-9e3c-3f98fbb98d10/00-document-meta-3c50ffa5.md
M idearium/data/specs/382a3442-220b-47e0-9e3c-3f98fbb98d10/382a3442-220b-47e0-9e3c-3f98fbb98d10.spec
M idearium/data/specs/382a3442-220b-47e0-9e3c-3f98fbb98d10/manifest.json
A idearium/data/specs/3ca5b48b-a871-4eac-9d4c-dedfd552e75d/manifest.json
A idearium/data/specs/40071975-5c14-4f55-a565-a6c94b4bb32e/manifest.json
A idearium/data/specs/53ccd9a4-0a46-4cb3-a8d6-5df1d3bdfc9b/manifest.json
A idearium/data/specs/78cdb460-646f-4cc4-8f44-0cae8cde3d11/manifest.json
A idearium/data/specs/abdfbfcf-6836-4ec2-8f21-fe62faecc737/00-meta-ed636b7b.md
A idearium/data/specs/abdfbfcf-6836-4ec2-8f21-fe62faecc737/manifest.json
A idearium/data/specs/bfe65b64-2a19-40af-9eca-97cd2370c7a0.tar.gz
A idearium/data/specs/bfe65b64-2a19-40af-9eca-97cd2370c7a0/00-meta-8cfe4c58.md
A idearium/data/specs/bfe65b64-2a19-40af-9eca-97cd2370c7a0/manifest.json
A idearium/data/specs/f1a7eb0d-cd7a-4cba-949e-ad9dcd04b7f0/00-meta-021dace7.md
A idearium/data/specs/f1a7eb0d-cd7a-4cba-949e-ad9dcd04b7f0/01-purpose-2d617e46.md
A idearium/data/specs/f1a7eb0d-cd7a-4cba-949e-ad9dcd04b7f0/02-axioms-8192d153.md
A idearium/data/specs/f1a7eb0d-cd7a-4cba-949e-ad9dcd04b7f0/03-schema-a309b6fb.md
A idearium/data/specs/f1a7eb0d-cd7a-4cba-949e-ad9dcd04b7f0/04-api-c6098a39.md
A idearium/data/specs/f1a7eb0d-cd7a-4cba-949e-ad9dcd04b7f0/05-events-e003564d.md
A idearium/data/specs/f1a7eb0d-cd7a-4cba-949e-ad9dcd04b7f0/06-integration-dd03c97d.md
A idearium/data/specs/f1a7eb0d-cd7a-4cba-949e-ad9dcd04b7f0/07-failure_modes-46a1db7a.md
A idearium/data/specs/f1a7eb0d-cd7a-4cba-949e-ad9dcd04b7f0/08-build_order-a126dc38.md
A idearium/data/specs/f1a7eb0d-cd7a-4cba-949e-ad9dcd04b7f0/09-tests-ce50c79f.md
A idearium/data/specs/f1a7eb0d-cd7a-4cba-949e-ad9dcd04b7f0/f1a7eb0d-cd7a-4cba-949e-ad9dcd04b7f0.spec
A idearium/data/specs/f1a7eb0d-cd7a-4cba-949e-ad9dcd04b7f0/manifest.json
M idearium/data/warp-crystals.json
M idearium/spec-engine/index.js
M package.json
A tests/spec-engine-yaml-import.test.js
```

### Build 0.39.49-r2 — snap-0500 — 2026-09-05 20:47:02

- Archive: `nexus-0500_2026-09-05_v0.39.49-r2_chatlog-fix.zip` (was `nexus-v0_39_49-chatlog-fix.zip`)
- SHA-256: `fabd6fdd8c4bb601b947bfb4f317a43843b63ff4671b4c76e21ddc73acc09073`, 66.1 MB, downloaded 2026-09-05 20:49:50
- Kind: full
- Commit: `b6ab93a576956c2bf7d496b349d02bff1850b676`, tag `snap-0500`
- Left out: embedded .git (4064 files, HEAD d66cfb6fcaab702a36ab683580a38c9e0e5910da (master))
- Files in archive: 3791. Changes against the build before it: **0 added, 3 modified, 504 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 504 |
| guardian | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M guardian/lib/ncp-handler.js
M lib/version.js
M tests/modules/test-ncp-handler-sr3.js
```

504 more (mostly data, logs and archived files) are in the ledger file.

