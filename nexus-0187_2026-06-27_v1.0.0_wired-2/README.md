# NEXUS Wired Ecosystem

**Three sovereign systems. One bus. Zero coupling.**

```
ErosmancerOS  →  Wire Layer  →  NEXUS Bus
Clear Glass   →  Wire Layer  →  NEXUS Bus
COS           →  Wire Layer  →  NEXUS Bus
```

---

## Systems

### ErosmancerOS (`erosmancer-os/`)
CDP-native perception engine. 9 modules: BridgeCore, NodeRegistry, SelectorEngine (7 strategies), SignalDispatcher, BehaviorEngine, RoutingEngine, DOMObserver, ShadowDOMMapper, Telemetry.

**Security patches applied:**
- EROS-001 FIXED: `byTextMatch` + `byRelativePosition` — `Runtime.callFunctionOn` with serialized args. String interpolation removed.
- EROS-002 FIXED: `BridgeCore.send()` — MAX_PENDING=64 cap. Backpressure throws instead of silently overloading CDP.

Runs at `:7432`. Start: `npm run eros`

### Clear Glass v3 (`clear-glass-v3/`)
NEXUS sovereign browser. SISO-native →E→E→. 25 gates. Electron + Chromium + Firefox fingerprint + TLS JA4 proxy.

Ports: `:7701` SSE, `:7702` IPC, `:7703` TLS proxy. Start: `npm run cg`

### Wire Layer (`wire/`)
Thin bridge. Registers ErosmancerOS + Clear Glass as NEXUS components. Proxies commands between systems. Hostile detection → fingerprint switch. Behavior plans → Cortex intelligence.

Port: `:7704`. Start: `npm run wire`

### COS — Compartment OS (`cos/`)
Sovereign host OS. SISO bus. Compartment types: browser (Clear Glass), cdp (ErosmancerOS), node, python, shell.

Port: `:7705`. Start: `npm run cos`

---

## Boot order

```bash
# 1. NEXUS orchestrator (must be first)
cd nexus-complete-v1_0_9 && npm start                # :9000

# 2. ErosmancerOS
npm run eros                                          # :7432

# 3. Clear Glass
npm run cg                                            # :7701 :7702 :7703

# 4. Wire
npm run wire                                          # :7704

# 5. COS
npm run cos                                           # :7705
```

---

## COS CLI

```bash
node cos/src/cli/index.js create --type browser --name "claude-agent" --url https://claude.ai
node cos/src/cli/index.js create --type cdp     --name "scraper"      --url https://example.com
node cos/src/cli/index.js create --type node    --name "server"       --config '{"cmd":"node","args":["server.js"]}'
node cos/src/cli/index.js start <id>
node cos/src/cli/index.js list
node cos/src/cli/index.js map
node cos/src/cli/index.js cmd <id> browser.navigate --data '{"url":"https://google.com"}'
```

---

## Tests

```
npm test                     # all 75 tests
npm run test:integration     # 28 tests — wire + COS
npm run test:cg              # 46 tests — Clear Glass bus + watchdog

Results:
  [1] Foundation           11/11 ✓
  [2] COS Kernel           12/12 ✓  
  [3] Wire registry         5/5  ✓
  [4] Clear Glass bus      29/29 ✓
  [5] Watchdog gates       17/17 ✓
  Total: 75/75 ✓
```

---

## Component registry IDs

| System | Namespace | Example ID |
|---|---|---|
| Clear Glass | `cg` | `cg.driver.exec` |
| ErosmancerOS | `eros` | `eros.cmd.click` |
| COS | `cos` | `cos.compartment.create` |
| Guardian | `guardian` | `guardian.seam.watchdog` |
| Cortex | `cortex` | `cortex.raid.decide` |

All IDs follow CR-004: `namespace.name` — lowercase, dot-separated, no hyphens.

---

## Wire architecture

```
NEXUS Bus (:9000)
├── Guardian (:7820)          ← SEAM queue, watchdog, artifacts
├── Cortex (:3748)            ← memory, RAID, intelligence
├── Clear Glass (:7701-7703)  ← sovereign browser, SISO bus
│     └── 25 gates            → driver, dom, context, cookie, copilot, mesh, diag, url
├── ErosmancerOS (:7432)      ← CDP engine, 9 modules
│     └── Wire (:7704)        → proxies Eros REST to NEXUS components
└── COS (:7705)               ← compartment OS, SISO host bus
      ├── Browser driver       → Clear Glass :7702
      ├── CDP driver           → ErosmancerOS :7432
      └── Node/Python/Shell    → child_process.spawn
```

---

## Typecodes

### Clear Glass inbound
`CG-DRV-001` DriverPayload · `CG-DOM-001/002/003` DOM ops · `CG-CTX-001/002` Context · `CG-CKI-001/002` Cookies · `CG-CPL-001` Copilot · `CG-MSH-001/002/003` Mesh · `CG-URL-001` URL listener · `CG-DGN-001/002/003` Diagnostics

### ErosmancerOS inbound  
`EROS-OS-001/002` Lifecycle · `EROS-TAB-001` Tab · `EROS-NODE-001` Node · `EROS-CMD-001-005` Commands · `EROS-BEH-001` Behavior

### COS inbound
`COS-CMP-001/002` Compartment create/start

---

## Fixes to NEXUS orchestrator error

**Error:** `Cannot find module './lib/intent-map'`

**Cause:** Running `orchestrator.js` from wrong directory.

**Fix:**
```
cd nexus-complete-v1_0_9
npm start
```

The `lib/` folder must be in the same directory as `orchestrator.js`. Run `node fix-orchestrator.js` to diagnose.
