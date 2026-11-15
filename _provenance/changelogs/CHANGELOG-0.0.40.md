# Nexus 0.0.40

| | |
|---|---|
| Built | 2026-06-08 21:42:28 → 2026-06-08 21:42:28 |
| Builds on the main line | 1 |
| Other archives filed here | 1 |
| Versions the builds claimed | 1.0.0 |
| Tag | `v0.0.40` → snap-0043 |
| Full file ledger | [LEDGER-0.0.40.csv](../ledger/LEDGER-0.0.40.csv) |

This build predates the 0.x numbering. `0.0.N` is its place in the order; the number it carried at the time is in the row above.

## Ledger

### Build 0.0.40 — snap-0043 — 2026-06-08 21:42:28

- Archive: `nexus-0043_2026-06-08_v0.0.40_complete_declared-1.0.0.zip` (was `nexus-complete.zip`)
- SHA-256: `0312498f778293d70e9657bc6bf2c6ca952eff5ddef152cef9b73e68067b119d`, 4 MB, downloaded 2026-06-08 21:42:57
- Kind: full
- Claimed version: 1.0.0 (registry 1.0.0, file name none); filed under 0.0.40 to keep the line in order
- Commit: `c67cb0ee683d3ba2acb98f781489b5e19d63b29d`, tag `snap-0043`
- Files in archive: 1074. Changes against the build before it: **639 added, 19 modified, 21 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-final | 429 | 0 | 0 |
| bridge | 187 | 0 | 0 |
| data | 17 | 10 | 0 |
| guardian | 4 | 2 | 12 |
| cortex | 2 | 2 | 6 |
| tests | 0 | 3 | 0 |
| (root) | 0 | 1 | 1 |
| test | 0 | 0 | 2 |
| lib | 0 | 1 | 0 |

```
M README.md
A bridge/Bridge-adversarial/bridge-adversarial.js
A bridge/Bridge-adversarial/deny-flood.js
A bridge/Bridge-adversarial/identity-spoof.js
A bridge/Bridge-adversarial/ime-blindspot.js
A bridge/Bridge-adversarial/index.js
A bridge/Bridge-adversarial/rule-inject.js
A bridge/CHANGES.md
A bridge/LICENSE
A bridge/MANIFEST.json
A bridge/NOTICE
A bridge/README.md
A bridge/boot.js
A bridge/bridge-IME/index.js
A bridge/bridge-IME/tests/test-ime-deep.js
A bridge/bridge-IME/tests/test-ime.js
A bridge/bridge-ai-identity/index.js
A bridge/bridge-appid/index.js
A bridge/bridge-appid/powershell.exe
A bridge/bridge-appid/tests/test-appid-deep.js
A bridge/bridge-bayesian/index.js
A bridge/bridge-canvas/index.js
A bridge/bridge-causal/index.js
A bridge/bridge-cfr/index.js
A bridge/bridge-cfr/tests/test-cfr-deep.js
A bridge/bridge-cli/index.js
A bridge/bridge-cli/mod-causal.js
A bridge/bridge-cli/mod-ollama.js
A bridge/bridge-cli/nexus-cli.js
A bridge/bridge-cobalt/boot.js
A bridge/bridge-cobalt/bridge-integrity-updated.js
A bridge/bridge-cobalt/index.js
A bridge/bridge-cobalt/ledger-lock.js
A bridge/bridge-cobalt/symbol-detector.js
A bridge/bridge-codec/bridge-codec-v3.js
A bridge/bridge-contracts/index.js
A bridge/bridge-contracts/tests/test-contracts-deep.js
A bridge/bridge-contracts/tests/test-contracts.js
A bridge/bridge-core/bus.js
A bridge/bridge-core/crypto-engine.js
A bridge/bridge-core/index.js
A bridge/bridge-core/registry/index.js
A bridge/bridge-core/siso/index.js
A bridge/bridge-core/tests/test-core-deep.js
A bridge/bridge-core/tests/test-core.js
A bridge/bridge-data/index.js
A bridge/bridge-data/tests/test-data-deep.js
A bridge/bridge-data/tests/test-data.js
A bridge/bridge-ddns/bridge-mesh-identity.js
A bridge/bridge-ddns/dns-server.js
A bridge/bridge-ddns/index.js
A bridge/bridge-dht/index.js
A bridge/bridge-dht/tests/test-dht-deep.js
A bridge/bridge-gateway/index.js
A bridge/bridge-health/index.js
A bridge/bridge-health/tests/test-health-deep.js
A bridge/bridge-heartbeat/index.js
A bridge/bridge-heartbeat/tests/test-heartbeat-deep.js
A bridge/bridge-heartbeat/tests/test-heartbeat.js
A bridge/bridge-identity/identity.js
A bridge/bridge-identity/index.js
A bridge/bridge-identity/keystore/index.js
A bridge/bridge-identity/tests/test-identity-deep.js
A bridge/bridge-identity/tests/test-identity.js
A bridge/bridge-integrity/index.js
A bridge/bridge-ipfs/index.js
A bridge/bridge-ipfs/tests/test-ipfs-deep.js
A bridge/bridge-key-rotation/index.js
A bridge/bridge-magnet/index.js
A bridge/bridge-mesh/index.js
A bridge/bridge-mesh/mesh/channel.js
A bridge/bridge-mesh/mesh/peer-discovery.js
A bridge/bridge-mesh/mesh/trust-mesh.js
A bridge/bridge-mesh/mesh/trust-signal.js
A bridge/bridge-mesh/network/host-rotation.js
A bridge/bridge-mesh/network/port-registry.js
A bridge/bridge-mesh/tests/test-mesh.js
A bridge/bridge-mobile/index.js
A bridge/bridge-mobile/tests/test-mobile-deep.js
A bridge/bridge-nat/bridge-nat-engine.js
A bridge/bridge-nat/bridge-nexus-pipe.js
A bridge/bridge-nat/bridge-noise-handshake.js
A bridge/bridge-nat/bridge-path-race.js
A bridge/bridge-nexus-pipe/test-nexus-pipe-deep.js
A bridge/bridge-node/boot.js
A bridge/bridge-node/bridge-node-boot.js
A bridge/bridge-node/callto-router.js
A bridge/bridge-node/eros-shim.js
A bridge/bridge-node/module-registry.js
A bridge/bridge-node/network-identity.js
A bridge/bridge-node/tests/test-boot.js
A bridge/bridge-ollama/index.js
A bridge/bridge-ollama/readme.md
A bridge/bridge-onion/index.js
A bridge/bridge-onion/tests/test-onion-deep.js
A bridge/bridge-os-v6_5.html
A bridge/bridge-plugin/gateway/ws-gateway.js
A bridge/bridge-plugin/guardian-bridge.js
A bridge/bridge-plugin/tests/test-guardian-bridge.js
A bridge/bridge-plugin/tests/test-plugin.js
A bridge/bridge-proxy/index.js
A bridge/bridge-relay/index.js
A bridge/bridge-routing/index.js
A bridge/bridge-shaper/index.js
A bridge/bridge-shaper/tests/test-shaper-deep.js
A bridge/bridge-sngate/index.js
A bridge/bridge-sngate/tests/test-sngate-deep.js
A bridge/bridge-sngate/tests/test-sngate.js
A bridge/bridge-sovereignty/attestation.js
A bridge/bridge-sovereignty/continuity.js
A bridge/bridge-sovereignty/deadman.js
A bridge/bridge-sovereignty/emergency.js
A bridge/bridge-sovereignty/hardware.js
A bridge/bridge-sovereignty/index.js
A bridge/bridge-sovereignty/key-decay.js
A bridge/bridge-sovereignty/lockout.js
A bridge/bridge-sovereignty/runtime-vault.js
A bridge/bridge-sovereignty/vaultd.js
A bridge/bridge-ssh/index.js
A bridge/bridge-steg/index.js
A bridge/bridge-steg/tests/test-steg-deep.js
A bridge/bridge-transport/BLE-GUIDE-WINDOWS.md
A bridge/bridge-transport/BLE-GUIDE.md
A bridge/bridge-transport/ble-host/Program.cs
A bridge/bridge-transport/ble-host/ble-host.csproj
A bridge/bridge-transport/ble-host/build.ps1
A bridge/bridge-transport/bridge-ble-win.js
A bridge/bridge-transport/bridge-ble.js
A bridge/bridge-transport/bridge-hci.js
A bridge/bridge-transport/bridge-winrt-ble-ps7.ps1
A bridge/bridge-transport/bridge-winrt-ble.ps1
A bridge/bridge-transport/bridge-winrt.js
A bridge/bridge-transport/index.js
A bridge/bridge-transport/test-ble-direct.ps1
A bridge/bridge-transport/test-ble-node.js
A bridge/bridge-transport/tests/test-ble-full.js
A bridge/bridge-transport/tests/test-ble-rtl8852be.js
A bridge/bridge-transport/tests/test-find-all.ps1
A bridge/bridge-transport/tests/test-hci-scan.js
A bridge/bridge-transport/tests/test-pnp-scan.js
A bridge/bridge-transport/tests/test-transport-deep.js
A bridge/bridge-ui/brainos-cfr-v6.html
A bridge/bridge-ui/bridge-os-v4.4-p4.html
A bridge/bridge-ui/bridge-os-v4.4-port-fix.html
A bridge/bridge-vpn/index.js
A bridge/bridgfw
A bridge/causal-nexus/CHANGELOG.md
A bridge/causal-nexus/README.md
A bridge/causal-nexus/package.json
A bridge/causal-nexus/src/adapter-sandbox/index.js
```

529 more (mostly data, logs and archived files) are in the ledger file.

### identical — 0044 — 2026-06-08 21:42:28

- Archive: `nexus-0044_2026-06-08_v0.0.40_complete-1_declared-1.0.0_same-as-0043.zip` (was `nexus-complete (1).zip`)
- SHA-256: `93c08edb94e3db6e4c8b0538da3ea3ed9ff76c4d0f5bf7cdf4fd19d1b638f9ef`, 4 MB, downloaded 2026-06-08 21:44:43
- Kind: identical (same tree as snap-0043; no commit)
- Claimed version: 1.0.0 (registry 1.0.0, file name none); filed under 0.0.40 to keep the line in order
- Identical copy: `nexus-0044_2026-06-08_v0.0.40_complete-2_dup1_declared-1.0.0_same-as-0043.zip` (was `nexus-complete (2).zip`)

