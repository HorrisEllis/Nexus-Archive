# Nexus 0.0.45

| | |
|---|---|
| Built | 2026-06-09 20:08:34 → 2026-06-09 20:08:34 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 1.0.0 |
| Tag | `v0.0.45` → snap-0049 |
| Full file ledger | [LEDGER-0.0.45.csv](../ledger/LEDGER-0.0.45.csv) |

This build predates the 0.x numbering. `0.0.N` is its place in the order; the number it carried at the time is in the row above.

## Ledger

### Build 0.0.45 — snap-0049 — 2026-06-09 20:08:34

- Archive: `nexus-0049_2026-06-09_v0.0.45_cfr-1_declared-1.0.0.zip` (was `nexus-cfr-1.zip`)
- SHA-256: `b44ef93739f2c2b3cd812cc40f63ac1884e5e0cc9777dce0b304b2db65e2dd21`, 2.5 MB, downloaded 2026-06-09 20:18:59
- Kind: full
- Claimed version: 1.0.0 (registry 1.0.0, file name none); filed under 0.0.45 to keep the line in order
- Commit: `62b973688d91eb0648aa52c5ba13c31747d40195`, tag `snap-0049`
- Files in archive: 525. Changes against the build before it: **72 added, 64 modified, 194 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| bridge | 0 | 0 | 190 |
| cos | 37 | 0 | 0 |
| data | 12 | 10 | 0 |
| ui | 12 | 9 | 1 |
| cortex | 0 | 19 | 2 |
| guardian | 0 | 11 | 0 |
| lib | 8 | 1 | 0 |
| (root) | 1 | 6 | 0 |
| cli | 2 | 3 | 0 |
| idearium | 0 | 2 | 0 |
| service | 0 | 1 | 1 |
| docs | 0 | 1 | 0 |
| emerge | 0 | 1 | 0 |

```
A Bugs.md
M MANIFEST.json
D bridge/Bridge-adversarial/bridge-adversarial.js
D bridge/Bridge-adversarial/deny-flood.js
D bridge/Bridge-adversarial/identity-spoof.js
D bridge/Bridge-adversarial/ime-blindspot.js
D bridge/Bridge-adversarial/index.js
D bridge/Bridge-adversarial/rule-inject.js
D bridge/CHANGES.md
D bridge/LICENSE
D bridge/MANIFEST.json
D bridge/NOTICE
D bridge/README.md
D bridge/boot.js
D bridge/bridge-IME/index.js
D bridge/bridge-IME/tests/test-ime-deep.js
D bridge/bridge-IME/tests/test-ime.js
D bridge/bridge-ai-identity/index.js
D bridge/bridge-appid/index.js
D bridge/bridge-appid/powershell.exe
D bridge/bridge-appid/tests/test-appid-deep.js
D bridge/bridge-bayesian/index.js
D bridge/bridge-canvas/index.js
D bridge/bridge-causal/index.js
D bridge/bridge-cfr/index.js
D bridge/bridge-cfr/tests/test-cfr-deep.js
D bridge/bridge-cli/index.js
D bridge/bridge-cli/mod-causal.js
D bridge/bridge-cli/mod-ollama.js
D bridge/bridge-cli/nexus-cli.js
D bridge/bridge-cobalt/boot.js
D bridge/bridge-cobalt/bridge-integrity-updated.js
D bridge/bridge-cobalt/index.js
D bridge/bridge-cobalt/ledger-lock.js
D bridge/bridge-cobalt/symbol-detector.js
D bridge/bridge-codec/bridge-codec-v3.js
D bridge/bridge-contracts/index.js
D bridge/bridge-contracts/tests/test-contracts-deep.js
D bridge/bridge-contracts/tests/test-contracts.js
D bridge/bridge-core/bus.js
D bridge/bridge-core/crypto-engine.js
D bridge/bridge-core/index.js
D bridge/bridge-core/registry/index.js
D bridge/bridge-core/siso/index.js
D bridge/bridge-core/tests/test-core-deep.js
D bridge/bridge-core/tests/test-core.js
D bridge/bridge-data/index.js
D bridge/bridge-data/tests/test-data-deep.js
D bridge/bridge-data/tests/test-data.js
D bridge/bridge-ddns/bridge-mesh-identity.js
D bridge/bridge-ddns/dns-server.js
D bridge/bridge-ddns/index.js
D bridge/bridge-dht/index.js
D bridge/bridge-dht/tests/test-dht-deep.js
D bridge/bridge-gateway/index.js
D bridge/bridge-health/index.js
D bridge/bridge-health/tests/test-health-deep.js
D bridge/bridge-heartbeat/index.js
D bridge/bridge-heartbeat/tests/test-heartbeat-deep.js
D bridge/bridge-heartbeat/tests/test-heartbeat.js
D bridge/bridge-identity/identity.js
D bridge/bridge-identity/index.js
D bridge/bridge-identity/keystore/index.js
D bridge/bridge-identity/tests/test-identity-deep.js
D bridge/bridge-identity/tests/test-identity.js
D bridge/bridge-integrity/index.js
D bridge/bridge-ipfs/index.js
D bridge/bridge-ipfs/tests/test-ipfs-deep.js
D bridge/bridge-key-rotation/index.js
D bridge/bridge-magnet/index.js
D bridge/bridge-mesh/index.js
D bridge/bridge-mesh/mesh/channel.js
D bridge/bridge-mesh/mesh/peer-discovery.js
D bridge/bridge-mesh/mesh/trust-mesh.js
D bridge/bridge-mesh/mesh/trust-signal.js
D bridge/bridge-mesh/network/host-rotation.js
D bridge/bridge-mesh/network/port-registry.js
D bridge/bridge-mesh/tests/test-mesh.js
D bridge/bridge-mobile/index.js
D bridge/bridge-mobile/tests/test-mobile-deep.js
D bridge/bridge-nat/bridge-nat-engine.js
D bridge/bridge-nat/bridge-nexus-pipe.js
D bridge/bridge-nat/bridge-noise-handshake.js
D bridge/bridge-nat/bridge-path-race.js
D bridge/bridge-nexus-pipe/test-nexus-pipe-deep.js
D bridge/bridge-node/boot.js
D bridge/bridge-node/bridge-node-boot.js
D bridge/bridge-node/callto-router.js
D bridge/bridge-node/eros-shim.js
D bridge/bridge-node/module-registry.js
D bridge/bridge-node/network-identity.js
D bridge/bridge-node/tests/test-boot.js
D bridge/bridge-ollama/index.js
D bridge/bridge-ollama/readme.md
D bridge/bridge-onion/index.js
D bridge/bridge-onion/tests/test-onion-deep.js
D bridge/bridge-os-v6_5.html
D bridge/bridge-plugin/gateway/ws-gateway.js
D bridge/bridge-plugin/guardian-bridge.js
D bridge/bridge-plugin/tests/test-guardian-bridge.js
D bridge/bridge-plugin/tests/test-plugin.js
D bridge/bridge-proxy/index.js
D bridge/bridge-relay/index.js
D bridge/bridge-routing/index.js
D bridge/bridge-shaper/index.js
D bridge/bridge-shaper/tests/test-shaper-deep.js
D bridge/bridge-sngate/index.js
D bridge/bridge-sngate/tests/test-sngate-deep.js
D bridge/bridge-sngate/tests/test-sngate.js
D bridge/bridge-sovereignty/attestation.js
D bridge/bridge-sovereignty/continuity.js
D bridge/bridge-sovereignty/deadman.js
D bridge/bridge-sovereignty/emergency.js
D bridge/bridge-sovereignty/hardware.js
D bridge/bridge-sovereignty/index.js
D bridge/bridge-sovereignty/key-decay.js
D bridge/bridge-sovereignty/lockout.js
D bridge/bridge-sovereignty/runtime-vault.js
D bridge/bridge-sovereignty/vaultd.js
D bridge/bridge-ssh/index.js
D bridge/bridge-steg/index.js
D bridge/bridge-steg/tests/test-steg-deep.js
D bridge/bridge-transport/BLE-GUIDE-WINDOWS.md
D bridge/bridge-transport/BLE-GUIDE.md
D bridge/bridge-transport/ble-host/Program.cs
D bridge/bridge-transport/ble-host/ble-host.csproj
D bridge/bridge-transport/ble-host/build.ps1
D bridge/bridge-transport/bridge-ble-win.js
D bridge/bridge-transport/bridge-ble.js
D bridge/bridge-transport/bridge-hci.js
D bridge/bridge-transport/bridge-winrt-ble-ps7.ps1
D bridge/bridge-transport/bridge-winrt-ble.ps1
D bridge/bridge-transport/bridge-winrt.js
D bridge/bridge-transport/index.js
D bridge/bridge-transport/test-ble-direct.ps1
D bridge/bridge-transport/test-ble-node.js
D bridge/bridge-transport/tests/test-ble-full.js
D bridge/bridge-transport/tests/test-ble-rtl8852be.js
D bridge/bridge-transport/tests/test-find-all.ps1
D bridge/bridge-transport/tests/test-hci-scan.js
D bridge/bridge-transport/tests/test-pnp-scan.js
D bridge/bridge-transport/tests/test-transport-deep.js
D bridge/bridge-ui/brainos-cfr-v6.html
D bridge/bridge-ui/bridge-os-v4.4-p4.html
D bridge/bridge-ui/bridge-os-v4.4-port-fix.html
D bridge/bridge-vpn/index.js
D bridge/bridgfw
D bridge/causal-nexus/CHANGELOG.md
D bridge/causal-nexus/README.md
D bridge/causal-nexus/package.json
```

180 more (mostly data, logs and archived files) are in the ledger file.

