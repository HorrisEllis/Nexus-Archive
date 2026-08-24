# Clear Glass — full browser-chrome mapping, 2026-08-23

James: "map all of this... after that is mapped. then rebuild the old
guardian into clear-glass." This is the map. Every claim below is checked
against the real, current tree — not assumed from a screenshot or a feature
name.

---

## 1. Image 2's dropdown menu — already real, already wired

This isn't a new UI element to build — it's the existing right-click context
menu (`clear-glass/renderer/browser.html`'s `#ctx-menu`, `data-action`
items), dispatched at `browser.js:1656`. All 7 items are genuinely wired,
not stubs:

| Item | Real handler | Status |
|---|---|---|
| ★ Bookmark this page | `cg.bookmarks.add/remove` + `loadBookmarks()` | real |
| 📍 Rewind snapshot | `cg.rewind.snapshot(agentId, {label:'manual'})` | real |
| ◎ Pick element | injects the real `PICKER_SCRIPT` | real |
| ✦ Ask Co-pilot about this page | fills the real co-pilot input with page context | real |
| ⛏ Scan page tokens | `cg.driver.exec({action:'dom.tokens'})` → confirmed real gate in `gates/index.js` → confirmed real listing in `copilot/tools.js` | real |
| ⬡ Move to background tab | `cg.bgTabs.open()` | real |
| ＋ Open in new agent | `cg.window.open()` | real |

**The "⋯" you want to open something like Image 3 is a real, different
button** — `bookmark-mgr-btn`, sitting in `#bookmarks-bar` (the row showing
"NEXUS" in your screenshots is the real bookmarks bar; "NEXUS" is a saved
bookmark for the dashboard page, not a static label). Confirmed by reading
the HTML directly: it's currently scoped *specifically* to bookmark
management (opens `#bookmark-mgr-panel`), not a general app menu. Turning it
into Image 3's full menu is a real, separate, scoped task (section 4).

---

## 2. Customizable, movable toolbar — closer to real than expected

Real, working foundation already exists, built into `browser.js`:
`SPOTLIGHT_COMMANDS` (id/icon/label/group/pinnable for every toggleable
button) + `applyToolbarPins(pinned)` (shows/hides based on a real, persisted
`NexusOptions.pinnedToolbarButtons` array) + the Ctrl+K command palette as
the "everything lives here even when unpinned" fallback. This session's own
earlier work (the orange-box move) extended it further.

**Real gap vs. Firefox's actual customize-toolbar UX**: no drag-to-reorder,
no visual "drag buttons between toolbar and overflow" panel — today, pinning
is all-or-nothing per button via the options panel's toggles, not a
spatial drag interface. Closing that gap is real, scoped UI work (a real
drag-and-drop panel reading/writing the same, already-real
`pinnedToolbarButtons` data) — not a new backend.

---

## 3. Downloads manager

**Real, existing infrastructure**: `clear-glass/src/providers/
download-capture.js` — hooks Electron's real `will-download`, announces
each download's real provenance (URL, source tab, provider, chat context)
to Guardian's `/api/intake`. Its own header states the real intent
directly: "route to cortex" already exists as a real mechanism — a
download becomes a real, staged intake item, not silently dropped in a
folder.

**Genuinely missing**: any visual downloads list/manager UI (Ctrl+J style),
and no real "change download directory" setting anywhere — checked
`NexusOptions` and `main/index.js`'s session config directly, zero
matches. The *routing* backend is real; the *management UI* and the
*directory setting* are not.

---

## 4. URL-specific / per-site settings

**Zero real infrastructure** — checked directly, no matches anywhere for
per-origin permission or settings storage. This would be genuinely new: a
real, origin-keyed settings store (mirroring Chrome's site-settings model),
plus a UI surface for it. Not started.

---

## 5. Full app menu (Image 3)

**Zero real infrastructure for most of it.** Real, checked findings per
item Image 3 lists:

| Image 3 item | Real status |
|---|---|
| History | not found — no history store/UI anywhere |
| Downloads | backend real (§3), no UI |
| Passwords | zero real code anywhere |
| Extensions | zero — no webextension loading (confirmed earlier session) |
| Print | zero |
| Save Page As | zero |
| Find in Page | zero |
| Zoom | zero — no `zoomFactor`/`setZoom` anywhere |
| Settings | real — this is `#options-panel`, already exists |
| Report Broken Site / Help | zero |

This is the single largest gap in the whole request — Image 3 names 10 real
Chrome features, and only Settings genuinely exists today.

---

## 6. Full bookmarks manager with cookies/state

**Real, but split across two separate, currently-unconnected mechanisms** —
this is the most important finding for this specific item:

1. **`cg.bookmarks`** (native browser bookmarks — `bookmark-mgr-btn`,
   `#bookmarks-bar`) — real, but only stores `{url, title, agentId}`. No
   state capture at all.
2. **`macro.js`'s `bookmark`/`openBookmark`** (built this session,
   commit `cbfc057`) — a genuinely different, real mechanism: uses the
   rewind engine's own snapshot system, which *does* capture cookies,
   storage, and scroll position, and *does* restore them via
   `openBookmark()`. This is exactly "states and account cookies hooked
   in" — already real, already tested (10 real tests) — but it's a
   macro-tool primitive, not surfaced in the browser's own bookmarks UI at
   all.

**The real work here is reconciliation, not new capability**: either merge
these into one real bookmark concept (every bookmark captures state by
default, or has a real "with state" checkbox), or clearly keep them
separate with real, distinct UI (quick url bookmarks vs. state snapshots).
Real design decision, not a blind pick.

---

## 7. Passwords manager

Zero real code anywhere. Genuinely new — credential storage, autofill
detection, a real UI. The cookie vault (`clear-glass/seam/`,
per-agent, encrypted) is real infrastructure for a *different* kind of
secret; passwords would need their own real, separate design (autofill
requires DOM-level form detection this session hasn't built either).

---

## 8. Zoom features

Zero real code. Electron's `webContents.setZoomFactor()` is a real,
built-in API this could wire to directly — genuinely small, scoped,
buildable gap once picked up.

---

## 9. Webcam, audio, Whisper support

Zero real code anywhere for any of these three. Electron's
`session.setPermissionRequestHandler` (for real camera/mic permission
prompts) doesn't exist in this tree at all — currently, a page requesting
`getUserMedia` would hit Electron's own default behavior, unconfigured.
Whisper (speech-to-text) has zero references anywhere in the *entire*
codebase, not just clear-glass — this would be a real, new integration
(a local Whisper model, or an API-based one) with no existing foundation
to build on.

---

## 10. The old Guardian → Clear Glass question

Real, already-gathered evidence from this session's own earlier mining
pass (`GUARDIAN-ARCHIVE-MINING-2026-08-23.md`), summarized against your
three real options:

**What's actually in the old Guardian extension, confirmed real:**
- The social-media listener pattern (Instagram/Threads DM detection,
  `modules/base-module.js`'s `GuardianModule` class) — real, working,
  portable *concept*.
- The element-picker UX (breadcrumb, zoom nav, nearby chips) — real,
  currently mid-port into Clear Glass's own `PICKER_SCRIPT` (this
  session's last two turns).
- Everything else the old changelog implies (passwords, downloads,
  account/cookie UUID fallback, console) — checked directly, **not
  real in that archive either**. The old extension didn't have most of
  what's in this document's own sections 3-9 — it's not a shortcut
  around building them.

**Your three real options, with real tradeoffs:**

1. **Rebuild as its own Clear Glass module** — matches this session's
   established pattern (`clear-glass/src/mesh/`, `clear-glass/src/
   providers/`, etc.). Real pro: fully integrated, one real codebase,
   no separate extension-loading mechanism needed. Real con: the two
   genuinely-portable pieces (listener pattern, picker UX) get
   re-implemented for Clear Glass's real architecture anyway — which is
   already in progress, not blocked on this decision.

2. **Load it as a real Chrome/Firefox web extension** — genuinely
   requires building web-extension support first (confirmed zero real
   infrastructure for this, same finding as the original capability
   breakdown). Real pro: the old Guardian's *own* real manifest/code
   could run mostly as-is, and matches your own "features as plugins"
   instinct directly — a real extension IS a plugin. Real con: Clear
   Glass's own real automation primitives (macro.js, erosmancer,
   rewind) aren't accessible to a sandboxed extension the same way
   they are to native Clear Glass code — a real, permanent capability
   ceiling, not just more work.

3. **A genuine Clear Glass plugin architecture** — neither of the above.
   A real, first-class plugin system (load/unload, permission-scoped,
   hot-updatable) that both old-Guardian-derived features AND future
   Clear Glass features could register into. Zero real infrastructure
   for this today — the biggest real design/build effort of the three,
   but the only one that actually delivers "a lot of Clear Glass
   features as plugins we can update," which is a real, standing ask,
   not unique to old Guardian.

**Given the real evidence**: option 3 is what you're actually describing
("would be nice to have a lot of clear-glass features as plugins") — a
real plugin system that old-Guardian-derived features, and future
features from this whole document, could BOTH live in. Options 1 and 2
each solve old Guardian specifically; option 3 solves the general shape
of the problem this document keeps hitting (customizable toolbar, a
downloads manager, a passwords manager, zoom, webcam — many of these
could genuinely be separate, real plugins rather than more permanent
core surface area).

---

## Real, honest size comparison

Genuinely real and working already: the Image 2 menu (§1), most of the
toolbar customization backend (§2), download provenance routing (§3's
backend half), and — critically — the state-capturing half of "bookmarks
with cookies" (§6, via macro.js).

Genuinely absent, zero real code anywhere: per-site settings (§4), 8 of
Image 3's 10 items (§5), passwords (§7), zoom (§8), webcam/audio/Whisper
(§9), and a real plugin architecture (§10's real recommendation).

This is not one phase. Recommend treating §10's plugin-architecture
decision as the real fork in the road — build it first if you want future
work (§3's UI, §4, §5, §7, §8, §9) to land *as* plugins rather than more
core surface area to maintain forever.
