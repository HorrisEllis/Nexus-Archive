# Full co-pilot/ClearGlass capability system — real breakdown

James: "full system for ollama, tools, personality, giving it capability...
full access to clear-glass... visiturl, screenshot feature... capchas popup
when needed, have commands trigger ui elements, could id elements of any
webpage for calltos or listeners... browser history with the rewind engine.
bookmarks and history linked to cookies. each tab could be a different
account/cookie. support for webextension. also ublock style adblocker. all
cli first, then ui last."

This is a real, large system, not one feature. Building it blind in a single
pass would mean shallow, unverified sprawl across a dozen subsystems — the
opposite of how the rest of this session has worked. This breakdown does
what the cortex/boot.js migration breakdown did: read what's actually there
before proposing what to build, so the plan is executable, not aspirational.

**The headline finding: far more of this already exists, real and working,
than the request implied.** The genuine gaps are narrower and more specific
than "build a whole new system."

---

## Already real, verified by reading the actual code — not assumed

| Capability requested | Real, existing implementation |
|---|---|
| "visiturl" | `lib/agent-tools/tools/browser/browser-action.js`'s `navigate` action → ClearGlass's `driver.exec`. Already a real co-pilot tool. |
| "id elements of any webpage for calltos or listeners" | `dom_pick` action, already real, already wired: ClearGlass's `dom/archaeology.js` picks a live DOM element and registers it as a named hook via the real gate `dom.pick` → `dom.pick.registered`. This is exactly what was described, already built. |
| Screenshot | `clear-glass/src/driver/index.js`'s real `_screenshot(agentId, {rect})` — returns a real base64 PNG, already wired into ClearGlass's own `copilot/tools.js` catalog and `copilot/bridge.js`. **The one real gap: not exposed in co-pilot's own tool registry** (`browser-action.js`'s `REAL_ACTIONS` has no `screenshot` entry) — this is the actual, narrow, buildable gap, not a missing feature. |
| Cookies / per-agent isolation | `clear-glass/src/cookies/vault.js` — a real, encrypted, SQLite-backed cookie vault with save/restore/snapshot/diff, already per-agent. Confirmed: `cookies_save`/`cookies_restore` are already real co-pilot tools too. |
| Rewind / browser history | `clear-glass/src/rewind/` — a real, dedicated module, plus a real sandbox tool (`lib/agent-tools/tools/sandbox/rewind-replay.js`) and its own test suite (`tests/modules/test-raid-rewind.js`). Real, substantial, already exists. |
| DOM read/query/mutate | `dom_query`, `dom_mutate` — already real co-pilot tools, already wired. |
| URL listeners (triggers) | `url_listen`/`url_unlisten` — already real, already gate-registered (confirmed live-wired in an earlier session, not orphaned). |

## Genuine gaps — real, not built yet

| Gap | Real evidence it's missing |
|---|---|
| Screenshot as a co-pilot tool | Confirmed: zero `screenshot` entry in `browser-action.js`'s `REAL_ACTIONS`, despite the underlying driver method being fully real and working. **Smallest, highest-value, most immediately buildable gap in this whole list.** |
| Web extension support | Zero real matches anywhere in `clear-glass/` for extension loading (`loadExtension`, webextension APIs). Electron supports this natively (`session.loadExtension`) — a real, scoped, buildable feature, not started. |
| Ad blocker | Zero real matches for `ublock`/`adblock` anywhere. Would need either a real extension load (uBlock Origin itself, once extension support exists) or a request-filtering layer on ClearGlass's own `session.webRequest`. Depends on the extension-support gap above, or can be built independently as a filter list + `webRequest.onBeforeRequest` blocker. |
| CAPTCHA-aware CLI pause | No real mechanism found for "CLI drives automation, but pop a real UI prompt when a CAPTCHA blocks it, then resume." This is a real, specific pattern (detect a CAPTCHA challenge in the DOM via `dom_query`, surface a real notification, block the CLI command until a human clears it) — buildable on top of what already exists (`dom_query` + a new real "wait for human" gate), not started. |
| Bookmarks linked to cookie/account | Cookie vault is real and per-agent; no evidence of a *bookmarks* system tied to it. Real, separate, smaller gap. |
| Commands triggering arbitrary UI elements | `dom_mutate` exists (can change DOM state) but "a CLI command triggers a specific, named UI affordance" as a general pattern isn't a distinct real system — likely composable from `dom_pick` (name a real element once) + `dom_mutate`/`driver_exec` (act on it later by name), not a new subsystem, but worth confirming this composition actually works end to end rather than assuming it. |
| Multi-account-per-tab as a first-class concept | The cookie vault is per-*agent* (claude/chatgpt/gemini/perplexity), not per-*tab*. "Each tab could be a different account" is a real, different granularity — worth a real design decision (does this mean N cookie-vault-entries per provider, tab-keyed instead of provider-keyed?) before building, not picked silently. |

---

## Real, CLI-first build sequence

Per James's own ordering ("all cli first, then ui last"), and prioritizing the
narrowest, highest-value, most-verified-existing-infrastructure gaps first:

1. **Screenshot as a real co-pilot tool** — the clear win. Everything it
   needs already exists; this is wiring, not building, and it's independently
   useful the moment it lands (co-pilot can *see* what's on screen). Built in
   this same pass — see below.
2. **CAPTCHA-aware pause/resume gate** — composes `dom_query` (detect the
   challenge) with a new, real "block until human" mechanism. Real, scoped,
   second-smallest gap.
3. **Bookmarks tied to the real cookie vault** — extends existing,
   already-real infrastructure rather than building new.
4. **The tab-vs-agent cookie granularity decision**, then whatever building
   it implies.
5. **Web extension support** — a real, standalone Electron feature
   (`session.loadExtension`), independently valuable, and the real
   prerequisite for using an actual uBlock Origin build rather than
   reimplementing ad-blocking from scratch.
6. **Ad blocking** — either atop #5 (load the real extension) or as its own
   `webRequest`-based filter, once #5's design direction is picked.

This list is deliberately not "build everything this session" — each of
these is a real, separately-committable, separately-verifiable piece, the
same discipline as every other commit this session.

---

## Built and verified in this same pass: screenshot as a real co-pilot tool

See the commit for the real, live-verified implementation.
