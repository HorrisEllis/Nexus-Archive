# Nexus 0.39.170

**NEXUS 0.39.170 — version bump + commit message for 165–169**

| | |
|---|---|
| Built | 2026-09-20 03:11:12 → 2026-09-20 03:11:12 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.170 |
| Tag | `v0.39.170` → snap-0618 |
| Full file ledger | [LEDGER-0.39.170.csv](../ledger/LEDGER-0.39.170.csv) |

## Release notes — `CHANGELOG-0.39.170.md`

Copied unchanged from the build.

### NEXUS 0.39.170 — version bump + commit message for 165–169

No code change. `lib/version.js` `system` had stayed at `0.39.163` through
164–169 while `package.json` moved on; this bump brings both to 0.39.170 and
logs 164–169 in one entry there. Per-version detail is in
`CHANGELOG-0.39.165.md` … `CHANGELOG-0.39.169.md`.

Not run at bump time: `scripts/precommit-check.js` and the test suites.
Run precommit before committing.

#### Phasemap correction
`docs/nexus-repository-system-build-phasemap.spec` still read `MCO2 … NOT
STARTED` although L4–L5 (import-pipeline.js), L6–L8 (verify-lazy.js) and
`tests/modules/test-mco2-verify-deepening.js` landed in 5e082f4. Status set
to DONE. MCO3 (snapshot compliance) has no code behind it and stays NOT
STARTED. Gate evidence for MCO2 was not re-run here.

## Ledger

### Build 0.39.170 — snap-0618 — 2026-09-20 03:11:12

- Archive: `nexus-0618_2026-09-20_v0.39.170.zip` (was `Nexus_v0_39_170.zip`)
- SHA-256: `1fcc9a3aef35ffbfc7bdc3f365201abd624cb854b42214fda87cd0f922afba93`, 121 MB, downloaded 2026-09-20 03:45:42
- Kind: full
- Commit: `dbd0797fd4422ed57174996eadf1e96f171320b8`, tag `snap-0618`
- Left out: embedded .git (5284 files, HEAD 3b1929430e07b7a960876bd9f4ef041fe31a9910 (master))
- Left out: node_modules (256 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4830. Changes against the build before it: **18 added, 10 modified, 67 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 1 | 1 | 67 |
| idearium | 5 | 4 | 0 |
| (root) | 6 | 2 | 0 |
| cos | 4 | 0 | 0 |
| lib | 2 | 2 | 0 |
| docs | 0 | 1 | 0 |

```
A CHANGELOG-0.39.165.md
A CHANGELOG-0.39.166.md
A CHANGELOG-0.39.167.md
A CHANGELOG-0.39.168.md
A CHANGELOG-0.39.169.md
A CHANGELOG-0.39.170.md
A cos/ci/ci-keys.smoke.cjs
A cos/ci/ci.smoke.cjs
A cos/ci/index.js
A cos/ci/keys.js
A data/cortex/memory/forged_hats.json
M data/cortex/memory/tool_index.json
D data/intake/061f5eb6-d562-4e9f-adb7-d3c16764a13b/intake-contract.json
D data/intake/061f5eb6-d562-4e9f-adb7-d3c16764a13b/payload/mco01-src-zNFWnl.zip
D data/intake/061f5eb6-d562-4e9f-adb7-d3c16764a13b/payload/mco01-src-zNFWnl.zip.expanded/mco01-src-zNFWnl/a/b/c/real.js
D data/intake/14f9139e-3048-414f-bbe8-b8fd336fffe1/intake-contract.json
D data/intake/14f9139e-3048-414f-bbe8-b8fd336fffe1/payload/mco01-src-QRTMmv.zip
D data/intake/14f9139e-3048-414f-bbe8-b8fd336fffe1/payload/mco01-src-QRTMmv.zip.expanded/mco01-src-QRTMmv/proj/package.json
D data/intake/14f9139e-3048-414f-bbe8-b8fd336fffe1/payload/mco01-src-QRTMmv.zip.expanded/mco01-src-QRTMmv/proj/src/app.js
D data/intake/303842e0-fdee-4373-ad97-1dabd5572b77/intake-contract.json
D data/intake/303842e0-fdee-4373-ad97-1dabd5572b77/payload/mco01-flat-1789800959984.zip
D data/intake/303842e0-fdee-4373-ad97-1dabd5572b77/payload/mco01-flat-1789800959984.zip.expanded/one.js
D data/intake/303842e0-fdee-4373-ad97-1dabd5572b77/payload/mco01-flat-1789800959984.zip.expanded/two.js
D data/intake/4026464a-7add-4e76-bfd7-eef2f5f01e63/intake-contract.json
D data/intake/4026464a-7add-4e76-bfd7-eef2f5f01e63/payload/mco01-src-sAdOU1.zip
D data/intake/4026464a-7add-4e76-bfd7-eef2f5f01e63/payload/mco01-src-sAdOU1.zip.expanded/mco01-src-sAdOU1/proj/package.json
D data/intake/4026464a-7add-4e76-bfd7-eef2f5f01e63/payload/mco01-src-sAdOU1.zip.expanded/mco01-src-sAdOU1/proj/src/app.js
D data/intake/4294c740-6806-413a-8a0c-4554defc6b2c/intake-contract.json
D data/intake/4294c740-6806-413a-8a0c-4554defc6b2c/payload/loose.js
D data/intake/4b47562b-b43f-485e-b71d-ebe2c0ed7548/intake-contract.json
D data/intake/4b47562b-b43f-485e-b71d-ebe2c0ed7548/payload/mco01-src-F1sgMQ.zip
D data/intake/4b47562b-b43f-485e-b71d-ebe2c0ed7548/payload/mco01-src-F1sgMQ.zip.expanded/mco01-src-F1sgMQ/a/b/c/real.js
D data/intake/77fd5c57-c05e-48a3-b318-870d79c839e1/intake-contract.json
D data/intake/77fd5c57-c05e-48a3-b318-870d79c839e1/payload/loose.js
D data/intake/80c4f5e5-f170-41db-b4b4-32817b38fd2f/intake-contract.json
D data/intake/80c4f5e5-f170-41db-b4b4-32817b38fd2f/payload/mco01-flat-1789801269033.zip
D data/intake/80c4f5e5-f170-41db-b4b4-32817b38fd2f/payload/mco01-flat-1789801269033.zip.expanded/one.js
D data/intake/80c4f5e5-f170-41db-b4b4-32817b38fd2f/payload/mco01-flat-1789801269033.zip.expanded/two.js
D data/intake/82cab030-3e42-4212-ab57-19d737785672/intake-contract.json
D data/intake/82cab030-3e42-4212-ab57-19d737785672/payload/mco01-flat-1789800301811.zip
D data/intake/82cab030-3e42-4212-ab57-19d737785672/payload/mco01-flat-1789800301811.zip.expanded/one.js
D data/intake/82cab030-3e42-4212-ab57-19d737785672/payload/mco01-flat-1789800301811.zip.expanded/two.js
D data/intake/8a9448fd-ec26-45a1-8ec1-334ebef5a31b/intake-contract.json
D data/intake/8a9448fd-ec26-45a1-8ec1-334ebef5a31b/payload/loose.js
D data/intake/ac26ef78-7913-4c3c-9ac8-acc222588053/intake-contract.json
D data/intake/ac26ef78-7913-4c3c-9ac8-acc222588053/payload/x.swift
D data/intake/bf4c559c-021d-4908-a536-6dd47b836e83/intake-contract.json
D data/intake/bf4c559c-021d-4908-a536-6dd47b836e83/payload/mco01-flat-1789801703639.zip
D data/intake/bf4c559c-021d-4908-a536-6dd47b836e83/payload/mco01-flat-1789801703639.zip.expanded/one.js
D data/intake/bf4c559c-021d-4908-a536-6dd47b836e83/payload/mco01-flat-1789801703639.zip.expanded/two.js
D data/intake/d75fc3ac-81ec-4e6a-8f4f-5b14eae2bd47/intake-contract.json
D data/intake/d75fc3ac-81ec-4e6a-8f4f-5b14eae2bd47/payload/loose.js
D data/intake/d81428d9-ae8f-404f-8acc-8938d7a56bec/intake-contract.json
D data/intake/d81428d9-ae8f-404f-8acc-8938d7a56bec/payload/mco01-src-Nk5STq.zip
D data/intake/d81428d9-ae8f-404f-8acc-8938d7a56bec/payload/mco01-src-Nk5STq.zip.expanded/mco01-src-Nk5STq/proj/package.json
D data/intake/d81428d9-ae8f-404f-8acc-8938d7a56bec/payload/mco01-src-Nk5STq.zip.expanded/mco01-src-Nk5STq/proj/src/app.js
D data/intake/e246e166-9ccf-4bf6-a30b-66cefef6be59/intake-contract.json
D data/intake/e246e166-9ccf-4bf6-a30b-66cefef6be59/payload/mco01-src-M9mLW5.zip
D data/intake/e246e166-9ccf-4bf6-a30b-66cefef6be59/payload/mco01-src-M9mLW5.zip.expanded/mco01-src-M9mLW5/a/b/c/real.js
D data/intake/e7d2bde5-2d1d-4d95-b01e-8289bf714d3d/intake-contract.json
D data/intake/e7d2bde5-2d1d-4d95-b01e-8289bf714d3d/payload/mco01-src-V0HUnu.zip
D data/intake/e7d2bde5-2d1d-4d95-b01e-8289bf714d3d/payload/mco01-src-V0HUnu.zip.expanded/mco01-src-V0HUnu/proj/package.json
D data/intake/e7d2bde5-2d1d-4d95-b01e-8289bf714d3d/payload/mco01-src-V0HUnu.zip.expanded/mco01-src-V0HUnu/proj/src/app.js
D data/intake/ec968ae1-6e2f-4c00-a924-1829b2ce6514/intake-contract.json
D data/intake/ec968ae1-6e2f-4c00-a924-1829b2ce6514/payload/mco01-flat-1789801067198.zip
D data/intake/ec968ae1-6e2f-4c00-a924-1829b2ce6514/payload/mco01-flat-1789801067198.zip.expanded/one.js
D data/intake/ec968ae1-6e2f-4c00-a924-1829b2ce6514/payload/mco01-flat-1789801067198.zip.expanded/two.js
D data/intake/f06da13e-2166-4fd1-96c7-9d9a034edb4a/intake-contract.json
D data/intake/f06da13e-2166-4fd1-96c7-9d9a034edb4a/payload/mco01-src-kPacrX.zip
D data/intake/f06da13e-2166-4fd1-96c7-9d9a034edb4a/payload/mco01-src-kPacrX.zip.expanded/mco01-src-kPacrX/a/b/c/real.js
D data/intake/f450c8d8-c90c-4472-90de-ca2b5d85ae50/intake-contract.json
D data/intake/f450c8d8-c90c-4472-90de-ca2b5d85ae50/payload/mco01-src-lKuSt6.zip
D data/intake/f450c8d8-c90c-4472-90de-ca2b5d85ae50/payload/mco01-src-lKuSt6.zip.expanded/mco01-src-lKuSt6/proj/package.json
D data/intake/f450c8d8-c90c-4472-90de-ca2b5d85ae50/payload/mco01-src-lKuSt6.zip.expanded/mco01-src-lKuSt6/proj/src/app.js
D data/intake/f4532409-45d9-44ec-9969-75f17b26a99c/intake-contract.json
D data/intake/f4532409-45d9-44ec-9969-75f17b26a99c/payload/loose.js
D data/intake/f6f2e737-da45-486d-a791-d8c3ff17dd8f/intake-contract.json
D data/intake/f6f2e737-da45-486d-a791-d8c3ff17dd8f/payload/mco01-src-ZftdCM.zip
D data/intake/f6f2e737-da45-486d-a791-d8c3ff17dd8f/payload/mco01-src-ZftdCM.zip.expanded/mco01-src-ZftdCM/a/b/c/real.js
M docs/nexus-repository-system-build-phasemap.spec
M idearium/api/index.js
A idearium/data/nodes/repository/t.repository
A idearium/data/nodes/repository/test-repo-uuid.repository
M idearium/registry-components.js
A idearium/repo/scan.js
A idearium/test/scan-unindexed.smoke.cjs
A idearium/test/ui-restructure.smoke.cjs
M idearium/ui/index.html
M idearium/ui/js/app.js
M lib/hat-forge.js
A lib/repo-hat.js
A lib/repo-hat.smoke.cjs
M lib/version.js
M package-lock.json
M package.json
```

