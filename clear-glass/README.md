# Clear Glass v3 — NEXUS Sovereign Browser

**Architecture: →E→E→ (SISO-native)**

Every behavior is a Gate on a Stream. No module talks to another directly.
Commands arrive as Events. Gates transform them. SSE broadcasts results.

---

## Boot

```bash
npm install
npm test       # 29 tests, pure Node — no Electron needed
npm start      # Launch browser
```

---

## SISO Architecture

```
Command arrives
  → emit(Event)
    → Stream looks up Gate by event.type  [O(1)]
      → Gate.transform(event, stream)
        → stream.emit(new Event(...))     [depth-first]
          → SSE broadcasts to NEXUS
```

### Gate inventory

| Signature | What it does |
|---|---|
| `driver.exec` | Browser automation — click, type, navigate, screenshot |
| `dom.query` | Query live DOM tree |
| `dom.mutate` | Mutate DOM node |
| `dom.pick` | Register element picker result |
| `dom.tokens` | Token archaeology scan |
| `context.create` | New agent partition |
| `context.switch` | Switch active agent |
| `context.fp.switch` | Switch fingerprint mode |
| `cookie.save` | Save account cookies |
| `cookie.restore` | Restore cookies from vault |
| `cookie.snapshot` | Snapshot session |
| `cookie.health` | Token validity check |
| `copilot.message` | Send to Cortex co-pilot |
| `mesh.spawn` | Spawn free AI agent |
| `mesh.send` | Send prompt to agent |
| `mesh.route` | RAID-route to best agent |
| `mesh.enqueue` | Queue task |
| `diag.run` | Run diagnostic suite |
| `diag.nexus` | NEXUS UI audit |
| `diag.page` | Page audit |
| `url.listen` | Add URL pattern listener |
| `url.listen.remove` | Remove listener |
| `window.open` | Open agent window |
| `window.close` | Close window (destroy) |
| `window.minimize` | Minimize window to taskbar |
| `window.hide` | Hide window to tray |
| `options.get` | Read Nexus options |
| `options.set` | Write Nexus options |
| `status.request` | Get full system status |
| `lifecycle.ready` | Boot complete |
| `lifecycle.shutdown` | Shutdown |

---

## Ports

| Port | Service |
|---|---|
| 7701 | SSE event stream |
| 7702 | IPC command endpoint |
| 7703 | TLS proxy (Firefox JA4) |

---

## NEXUS integration

All commands via POST to `:7702/cmd`:
```json
{ "eventType": "driver.exec", "data": { "action": "navigate", "agentId": "default", "url": "https://example.com" } }
```

Subscribe to all events:
```
GET http://localhost:7701/events
```

---

## Fix: orchestrator.js `Cannot find module './lib/intent-map'`

Wrong directory. Run from inside the extracted NEXUS folder:
```
cd nexus-complete-v1_0_9
npm start
```

See `fix-orchestrator.js` for diagnosis tool.

---

## Test results

```
[1] SISO Core           12/12 ✓
[2] Gate factory         3/3  ✓
[3] Bus singleton        4/4  ✓
[4] URL Listener         5/5  ✓
[5] Fingerprint Engine   5/5  ✓
Total: 29/29 ✓
```
