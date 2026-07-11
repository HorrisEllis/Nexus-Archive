# Clear Glass v3 — NEXUS Sovereign Browser

**Architecture: →E→E→ (SISO-native)**

Every behavior is a Gate on a Stream. No module talks to another directly.
Commands arrive as Events. Gates transform them. SSE broadcasts results.

## §ADDENDUM 2026-07-11 (2) — v3.3.0, fixed from a real crash log

You ran this on a real Windows machine and it caught two things no amount
of code review here would have: `app.disableHardwareAcceleration()` alone
didn't stop the GPU process from being spawned for software compositing —
on this machine that process itself failed to launch (`error_code=18`,
`FATAL: GPU process isn't usable. Goodbye.`), crashing Clear Glass
entirely and taking every provider window down with it (repeated `oom`/
`launch-failed` on claude/chatgpt/gemini/perplexity as autopilot kept
respawning into the same failure). Added `--disable-gpu`,
`--disable-gpu-compositing`, `--disable-software-rasterizer` — removes
the GPU process from the picture entirely instead of just deprioritizing
it. Standard fix for this exact fatal error on constrained/virtualized
Windows hosts.

Separately: `copilot/bridge.js` had already self-diagnosed, across three
prior debugging rounds, that `fetch()` fails against `bridge:9999`
specifically (`ERR_STREAM_PREMATURE_CLOSE`) while `http.request()` against
the identical URL/payload succeeds — confirmed live in your boot log
("http.request FALLBACK succeeded where fetch() failed — status 200").
Its own logged conclusion, "Real fix: switch this function to
http.request permanently," is now the actual code — both bridge call
sites (`_bridgeHandshake`, `_bridgeDispatch`) use `http.request` as
primary rather than trying `fetch()` first and eating the failure. This
likely also explains the guardian NCP connect/disconnect cycling in the
same log — every co-pilot prompt and guardian command routes through
`_bridgeDispatch`.

Not fixed this round, flagged from the same log for later: `/cfr/field`
returning without a numeric `tension` field (cfr-influence polling skips
gracefully, doesn't crash, but the field itself is worth checking), 6
systems with spec/code version drift (orchestrator, bridge, guardian,
copilot, forge, spec-drift itself), 12 systems with no spec at all, and
ErosmancerOS not running (`ECONNREFUSED 127.0.0.1:7432` — ClearGlass/Wire
retries on first driver call rather than failing, so this may be
intentional if you don't run it every session).

## §ADDENDUM 2026-07-11 (3) — v3.4.0, lighter by default

Every boot was unconditionally spawning 4 hidden full Chromium renderer
windows (claude, chatgpt, gemini, perplexity) via `providerHost.
autoBootAll()`, whether or not you were about to use any of them —
`src/gates/index.js` already boots a provider on-demand the instant
something actually needs it, so the eager pre-warm was pure duplication
of a lazy path that already worked. Default is now lazy-only — nothing
pre-warms. Set `CG_AUTOBOOT_PROVIDERS=claude,chatgpt` to pre-warm
specific ones back, or `CG_AUTOBOOT_PROVIDERS=all` for the old behavior.
Combined with the GPU-crash fix above (which was itself causing repeat
respawns of all 4 windows every time the crash loop fired), this should
meaningfully cut idle resource use.

## §ADDENDUM 2026-07-11 — v3.2.0, renderer decomposed

`renderer/browser.html` was 1879 lines with ~1600 of that as one inline
`<script>` block. Extracted to `renderer/browser.js` (external, same-origin
`<script src>`); `browser.html` is 275 lines now, structure only. CSP's
`script-src` dropped `'unsafe-inline'` — nothing inline left to justify it
(`style-src` keeps it; inline `style="..."` attributes weren't part of
this pass). `npm test` below is unaffected — it exercises `src/`, not
`renderer/`, and was re-run after the extraction (46/46, unchanged).

---

## Boot

```bash
npm install
npm test       # 46 tests total (29 bus + 17 watchdog), pure Node — no Electron needed
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
