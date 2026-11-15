# Nexus 0.7.1

| | |
|---|---|
| Built | 2026-06-16 19:20:04 → 2026-06-17 05:05:18 |
| Builds on the main line | 8 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.6.3, 0.7.1 |
| Tag | `v0.7.1` → snap-0112 |
| Full file ledger | [LEDGER-0.7.1.csv](../ledger/LEDGER-0.7.1.csv) |

## Ledger

### Build 0.7.1-r1 — snap-0105 — 2026-06-16 19:20:04

- Archive: `nexus-0105_2026-06-16_v0.7.1-r1.zip` (was `nexus-v0_7_1.zip`)
- SHA-256: `7db12a5fa15b07cbe219602f6de9e7e6f5b7a6d549765ceefc54c3ce31b24c04`, 3.1 MB, downloaded 2026-06-16 19:21:37
- Kind: full
- Commit: `c9d0d683437116a8298225cb3f1903c9a34da569`, tag `snap-0105`
- Files in archive: 553. Changes against the build before it: **3 added, 8 modified, 83 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 78 |
| cortex | 2 | 5 | 0 |
| guardian | 0 | 0 | 5 |
| emerge | 0 | 1 | 0 |
| idearium | 1 | 0 | 0 |
| lib | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M cortex/boot.js
M cortex/foundation/admin-server.js
M cortex/gate/gap-finder.js
A cortex/intelligence/macro-compiler.js
M cortex/self-heal/escalation.js
A cortex/snapshot/divergence-watcher.js
M cortex/snapshot/index.js
D data/snapshots/nex-0241aa18.nex
D data/snapshots/nex-02c9e103.nex
D data/snapshots/nex-053fe029.nex
D data/snapshots/nex-064a8174.nex
D data/snapshots/nex-07613c80.nex
D data/snapshots/nex-08a1d88c.nex
D data/snapshots/nex-0cf5fd35.nex
D data/snapshots/nex-0d25db0f.nex
D data/snapshots/nex-0e3cdf89.nex
D data/snapshots/nex-14d04b4a.nex
D data/snapshots/nex-1aea4156.nex
D data/snapshots/nex-1bf5f0d1.nex
D data/snapshots/nex-1c92891d.nex
D data/snapshots/nex-1f59249a.nex
D data/snapshots/nex-25b6c207.nex
D data/snapshots/nex-265d0b8e.nex
D data/snapshots/nex-2d98f62a.nex
D data/snapshots/nex-2ee75df0.nex
D data/snapshots/nex-33d3ead2.nex
D data/snapshots/nex-34527626.nex
D data/snapshots/nex-3537f506.nex
D data/snapshots/nex-37520118.nex
D data/snapshots/nex-3b53639c.nex
D data/snapshots/nex-3cb374b3.nex
D data/snapshots/nex-3dfab89c.nex
D data/snapshots/nex-46208a20.nex
D data/snapshots/nex-4817694b.nex
D data/snapshots/nex-4bfbf66c.nex
D data/snapshots/nex-4e6479e0.nex
D data/snapshots/nex-52325153.nex
D data/snapshots/nex-5afd4cf9.nex
D data/snapshots/nex-5d8c95c3.nex
D data/snapshots/nex-61e77962.nex
D data/snapshots/nex-652c0877.nex
D data/snapshots/nex-6604c156.nex
D data/snapshots/nex-6ce6336d.nex
D data/snapshots/nex-70dc2fca.nex
D data/snapshots/nex-7e61afda.nex
D data/snapshots/nex-7ef18d43.nex
D data/snapshots/nex-8017404e.nex
D data/snapshots/nex-825b06d5.nex
D data/snapshots/nex-8a140693.nex
D data/snapshots/nex-8bbc4b84.nex
D data/snapshots/nex-8f02663b.nex
D data/snapshots/nex-8fb90ce9.nex
D data/snapshots/nex-900b2cf5.nex
D data/snapshots/nex-90a3e632.nex
D data/snapshots/nex-9184a08b.nex
D data/snapshots/nex-9b8c35c3.nex
D data/snapshots/nex-9d087b04.nex
D data/snapshots/nex-9f552998.nex
D data/snapshots/nex-a5e38fa8.nex
D data/snapshots/nex-abbb5116.nex
D data/snapshots/nex-acf19e7d.nex
D data/snapshots/nex-b7e65bac.nex
D data/snapshots/nex-ba65e1df.nex
D data/snapshots/nex-bb31bf75.nex
D data/snapshots/nex-c0e3125d.nex
D data/snapshots/nex-c218756f.nex
D data/snapshots/nex-c30e0710.nex
D data/snapshots/nex-c63a2dd7.nex
D data/snapshots/nex-cacbd764.nex
D data/snapshots/nex-ccf6f000.nex
D data/snapshots/nex-cea0573f.nex
D data/snapshots/nex-cf51067f.nex
D data/snapshots/nex-d0a0f17c.nex
D data/snapshots/nex-d0fa17f0.nex
D data/snapshots/nex-db2ad7ca.nex
D data/snapshots/nex-e225b56a.nex
D data/snapshots/nex-e300dcfb.nex
D data/snapshots/nex-e351a2fd.nex
D data/snapshots/nex-e6c20aa3.nex
D data/snapshots/nex-e71c5578.nex
D data/snapshots/nex-e7786e57.nex
D data/snapshots/nex-e92b936c.nex
D data/snapshots/nex-ef5176bf.nex
D data/snapshots/nex-f21db4dd.nex
D data/snapshots/nex-fe2e46d4.nex
M emerge/siso/index.js
D guardian/memory_store/cfr_state.json
D guardian/memory_store/event_log.jsonl
D guardian/memory_store/gaps.json
D guardian/memory_store/ledger.json
D guardian/memory_store/settings.json
A idearium/core/index.js
M lib/version.js
M ui/home/index.html
```

### Build 0.7.1-r2 — snap-0106 — 2026-06-16 20:00:56

- Archive: `nexus-0106_2026-06-16_v0.7.1-r2_fixed.zip` (was `nexus-v0.7.1-fixed.zip`)
- SHA-256: `5afe18e3c68e637b3b293de27a7f494a24e4d9e45e0c93145edc8c61c4b88729`, 3.1 MB, downloaded 2026-06-16 20:29:10
- Kind: full
- Commit: `561c9fe4db9cac33fde82def9c1bc6cd5fbce87c`, tag `snap-0106`
- Files in archive: 553. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M lib/version.js
M ui/home/index.html
```

### Build 0.7.1-r3 — snap-0107 — 2026-06-17 04:18:26

- Archive: `nexus-0107_2026-06-17_v0.7.1-r3_073.zip` (was `nexus-073.zip`)
- SHA-256: `d01ace6a2d148fbf6cde6d7fdb1cf3a858233b14fd20b6c887aa64b2dca2aa66`, 3.2 MB, downloaded 2026-06-17 04:19:27
- Kind: full
- Commit: `0ce58e8fd8166d07242cc9e4c1c28bd455ed3920`, tag `snap-0107`
- Files in archive: 556. Changes against the build before it: **3 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 2 | 1 | 0 |
| lib | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |

```
M cli/diagnose.js
M emerge-ide.js
M idearium/index.js
A lib/intent-classifier.js
M lib/request-handler.js
A ui/builder/index.html
A ui/forge-shell.html
M ui/home/index.html
```

### Build 0.7.1-r4 — snap-0108 — 2026-06-17 04:22:42

- Archive: `nexus-0108_2026-06-17_v0.7.1-r4_074.zip` (was `nexus-074.zip`)
- SHA-256: `0289362012a9a53b6b88c9f08bb45ffb016de94694738725845fd0858a2060fe`, 3.2 MB, downloaded 2026-06-17 04:29:51
- Kind: full
- Commit: `143b201a8a1cd0e303241a64e4d4dcf7005897bb`, tag `snap-0108`
- Files in archive: 557. Changes against the build before it: **1 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 1 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M guardian/userscript-chatgpt.js
A guardian/userscript-orchestrator.js
M ui/forge-shell.html
```

### Build 0.7.1-r5 — snap-0109 — 2026-06-17 04:38:46

- Archive: `nexus-0109_2026-06-17_v0.7.1-r5_075.zip` (was `nexus-075.zip`)
- SHA-256: `0c44b67da6b33898f05d2de9dfde66242bbe355c2bfd00b7dd190658313af429`, 3.2 MB, downloaded 2026-06-17 04:41:29
- Kind: full
- Commit: `e7135254a114df16fb0c3b9f2974633f663fbc38`, tag `snap-0109`
- Files in archive: 559. Changes against the build before it: **2 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 1 | 0 | 0 |
| tests | 1 | 0 | 0 |
| ui | 0 | 1 | 0 |

```
A docs/home-ui.spec
A tests/home-ui.test.js
M ui/home/index.html
```

### Build 0.7.1-r6 — snap-0110 — 2026-06-17 04:54:40

- Archive: `nexus-0110_2026-06-17_v0.7.1-r6_080_declared-0.6.3.zip` (was `nexus-080.zip`)
- SHA-256: `9534dc503734be96df4a2b5089e2210f4949bf0fd797110ff2a414caefacbb14`, 0.1 MB, downloaded 2026-06-17 05:34:11
- Kind: overlay (a patch laid over the build before it)
- Claimed version: 0.6.3 (registry 0.6.3, file name none); filed under 0.7.1 to keep the line in order
- Commit: `106cfebb36e3791e8eaa9717cb6226c5676149ff`, tag `snap-0110`
- Files in archive: 10. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 1 | 0 |

```
M idearium/index.js
```

### Build 0.7.1-r7 — snap-0111 — 2026-06-17 04:59:50

- Archive: `nexus-0111_2026-06-17_v0.7.1-r7_078.zip` (was `nexus-078.zip`)
- SHA-256: `b151dc1ac74f4d7f97587cb30d6bbc44ca58266d100786861080fc65204a0769`, 3.2 MB, downloaded 2026-06-17 05:07:34
- Kind: full
- Commit: `3b48644fb148b8c305345c5b94fcefa8dfcc49a8`, tag `snap-0111`
- Files in archive: 562. Changes against the build before it: **3 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 2 | 0 | 0 |
| tests | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| architect | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M architect/service.js
M cli/boot-systems.js
M cortex/self-heal/index.js
A docs/diagnostic-fixes.spec
A docs/diagnostic-phase-map.spec
M orchestrator.js
M service/nexus-diagnostic.js
A tests/diagnostic-fixes.test.js
M tests/home-ui.test.js
M ui/home/index.html
```

### Build 0.7.1-r8 — snap-0112 — 2026-06-17 05:05:18

- Archive: `nexus-0112_2026-06-17_v0.7.1-r8_079.zip` (was `nexus-079.zip`)
- SHA-256: `a1858e1339740c85e1b5430df6c41c42553d11305336e69943e2e8ae502516d4`, 3.2 MB, downloaded 2026-06-17 05:07:40
- Kind: full
- Commit: `b0ecaa63507abd3935e86ab401aa3753e5401284`, tag `snap-0112`
- Files in archive: 563. Changes against the build before it: **1 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 1 | 2 | 0 |

```
A ui/blueprint-builder/index.html
M ui/forge-shell.html
M ui/home/index.html
```

