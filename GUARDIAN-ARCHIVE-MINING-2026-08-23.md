# Guardian archive mining report — 2026-08-23

Four zips, read directly, not skimmed: `files-1.zip` (contains a nested,
most-complete `Guardian-clean.zip`, plus a few loose files), `Guardian-clean-9`,
`Guardian-clean-13`, `Guardian-clean-17`. All four are the **same, older,
separate product** from the current `guardian/server.js` system — a real
Chrome/Firefox extension (Manifest V2), not a Node.js background process.
Confirms what an earlier session in this same conversation already found
about this codebase.

`app.js` and `identities.json` are byte-identical gc9 → gc17 — the core
dispatch/platform-config logic stabilized early. `content.js` (279 diff
lines) and `popup.html` (38 diff lines) evolved meaningfully across
versions. The nested `files-1/Guardian-clean.zip` is the most complete —
manifest.json, background.js, handshake.js, cfr.js, ir-layer.js, real
icons — and is what this report reads from unless noted.

Manifest: `"Guardian v3.4.0 — Causal-Nexus bridge — element picker,
listener, AI tab dispatch, GateForge pipeline."` Real permissions:
`activeTab, tabs, storage, cookies, notifications, webRequest,
clipboardWrite, <all_urls>`.

---

## Mapped against tonight's real requests

| Requested | Real finding |
|---|---|
| Accounts/cookies with UUID for fallback routing on failure/token-out | **Not built here.** `instanceId = guardian-{uuid}` is real but is a per-*device*/per-*browser-install* identifier for mesh routing, confirmed in `background.js` — not per-*account*. `identities.json` is per-*platform* DOM-selector config, not per-account credentials. This is a genuinely new feature to design and build, not something to port. |
| Console | No real devtools-console integration found anywhere across all four zips. |
| Downloads | One real, narrow use: `a.download = 'guardian-calltos-{ts}.json'; a.click()` — exports the extension's *own* internal log, not management of arbitrary web downloads. Not what "clear-glass downloads" means. |
| Print | Zero real matches anywhere. |
| Macros (job applications, emailing therapists on Psychology Today) | Not built. The real, portable *primitive* it would be built from exists: the element picker + `callto` dispatch system (fingerprint an element once, dispatch scripted interactions against it later) — genuinely the right foundation, but "record and replay a real multi-step form flow" isn't there. |
| Listeners — social media | **Real and substantial.** `modules/instagram.js` (DM + post detection via a real `MutationObserver`, emits `guardian.ig.dm`/`guardian.ig.post`) and `modules/threads.js` are real, working, portable code — genuinely the strongest single piece of prior art in this whole archive for tonight's request. |
| Listeners — email | No email-specific module found (only instagram/threads/chatgpt/claude in `modules/`). The real `base-module.js` pattern (`GuardianModule`, `MutationObserver` → `emit()`) is directly reusable for a Gmail/Outlook module — not built, but the template is real and proven. |
| Toasts | **Confirmed gap, cleanly scoped.** `notifications` is a real, declared manifest permission — never actually used anywhere in the code. The extension's own `showToast()` (`content.js`) is the same in-page DOM-overlay pattern the *current* system's `toast()` (`guardian/userscript-claude.js`) already has — real, but not a native OS-level notification. No native `Notification`/`browser.notifications` call exists in any of the four zips, or in the current codebase. |
| Extensions / ad-blocking / CAPTCHA / bookmarks / tab-cookie redesign | Unchanged from the earlier breakdown — still genuine gaps, not addressed by this archive. |

## What's real and genuinely worth porting, in priority order

1. **The social-media listener pattern** (`base-module.js` + `instagram.js`/`threads.js`) — real, working, most substantial. A real port target for the current system's own tool surface, not a rewrite.
2. **The element picker's real UX details** — breadcrumb depth indicator, zoom (parent/child/prev/next), nearby-element suggestion chips, per-listener ring-buffer event log with JSON export. All real, all in `content.js`/`popup.js`, genuinely more polished than what `dom_pick` currently offers.
3. **The killswitch pattern** — single-tap stops UI listeners only, double-tap-within-1.5s does a full stop (listeners + bridge + pulse). A real, well-thought-out safety UX worth having somewhere in the current system too.
4. **Retry queue with real backoff** (1s → 5s → 15s → 60s, max 4 attempts, loud failure, "no silent drops") — a real, tested pattern; current system's own retry logic (scattered across several files this session) could be checked against this for consistency.

## Built in this same pass: real, native OS-level toast notifications

The cleanest, smallest, most immediately valuable gap confirmed across
*both* the old archive and the current codebase — and the real prerequisite
for "CAPTCHAs popup when needed," since an in-page-only toast is invisible
the moment the tab isn't focused. See the commit for the real, live-tested
implementation.
