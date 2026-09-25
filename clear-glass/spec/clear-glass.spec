spec:
  meta:
    name:        clear-glass
    version:     3.13.0
    foundation:  nexus-system-foundation@1.1.0
    port:        7702
    uuid:        nexus-clear-glass-v1-0000-2026-0901-jamesbrooks-001
    status:      active
    purpose: >
      Sovereign NEXUS browser — Electron + Chromium + Firefox fingerprint +
      TLS JA4 + ErosmancerOS wire (SISO-native). Real, running system with
      no prior .spec despite being one of the most actively developed
      subsystems in this codebase (67 real components as of this session,
      confirmed in clear-glass/registry-components.js). This spec is
      written FROM that live registry-components.js contract, not from
      scratch — §8.6 reuse-before-build, applied to spec authorship itself.
    written_from: >
      clear-glass/registry-components.js (the real, served-at-GET-/contract
      module, verified by orchestrator's contract-handshake on boot) — same
      shape copilot and eravos already use. This spec restates that real
      contract in the standard system-spec shape; it does not invent new
      surface.

  core:
    ports:
      ipc:  7702   # IPC server — orchestrator polls /contract here
      sse:  7701   # SSE fan-out (also referenced by lib/version.js's
                   # own 'clear-glass' entry as the sovereign browser shell)
      tls:  7703
      wire: 7704

    axioms:
      - AX-001  validate all inputs at boundary
      - AX-002  no silent failures — bus event on error
      - AX-004  self-describing — registry-components.js served at /contract
      - AX-010  sovereign transport — no cross-system require() into this tree

  events:
    emits:
      - 'clear-glass.boot.complete'
      - 'clear-glass.window.opened'
      - 'clear-glass.registered'
      - 'clear-glass.shutdown'
      - 'eros.hostile.detected'
      - 'eros.behavior.plan'
      - 'lifecycle.ready'
      - 'nexus.status'
    handles:
      - 'orchestrator.shutdown'
      - 'cortex.raid.decide'
      - 'guardian.job.dispatch.receive'

  routes:
    - method: GET
      path: /contract
      returns: "Full clear-glass component registry — 79 real components as of 2026-09-22 (was 67 at 2026-09-01)"

  handshake:
    components_count: 102   # §2026-09-22 — was 67 (stale since 2026-09-01); autofill's 7 real
                            # IPC methods (shipped 2026-09-19, never registered) and screen-qa's
                            # 5 (this session) both landed in registry-components.js with zero
                            # entries here — checked directly against the live registry export,
                            # not assumed. See clear-glass.spec's history: entry below.
    component_families:
      - callto-index
      - download-listeners
      - site-settings
      - history
      - extensions
      - bookmarks-with-state
      - rewind
      - passwords
      - speech-to-text
      - macros
      - background-tabs
      - autofill    # §2026-09-22 — real since 2026-09-19, only registered this session
      - screen-qa   # §2026-09-22 — new this session
    note: >
      Every component is transport IPC, not HTTP — clear-glass is an
      Electron shell, and its real "routes" are ipcMain.handle() channels
      (method: 'IPC', path: <channel name>), not URL paths. This matches
      registry-components.js's own real shape exactly; a spec claiming
      HTTP method/path pairs for these would misrepresent the transport.

  modules:
    - id: registry-components
      path: clear-glass/registry-components.js
      description: >
        The real, live self-description contract. Served at GET /contract.
        Verified by orchestrator's contract-handshake on boot. Source of
        truth for this spec's handshake section — grew from 31 to 67
        components this session (§BL30, see docs/SPEC-REGISTRY.md and
        lib/version.js 0.39.30 for the real diff), and from 67 to 79 in
        the 2026-09-22 pass below (autofill's pre-existing gap + screen-qa).

    - id: screen-qa
      path: clear-glass/src/screen-qa/detector.js
      description: >
        NEW 2026-09-22. Detects open-ended, job-application-style
        questions on the page (label/aria-label/placeholder/name-derived,
        excluding whatever autofill/matcher.js would already confidently
        fill), answers them through the real copilot bridge with an
        injected send function (never fabricates an answer on failure or
        an empty reply), and injects the chosen answer via the same
        React/Vue-safe mutate() every other real DOM writer here already
        uses. UI: a hotkey (Ctrl/Cmd+Shift+A, whole-page), a right-click
        menu entry (one field, via a new elementAt() on the DOM mesh),
        a Settings section, and an isolated main-process Notification.
        5 IPC + 3 REST routes (screen-qa:* / /cli/screen-qa/*).

    - id: autofill
      path: clear-glass/src/autofill/{store,matcher}.js
      description: >
        Real since 2026-09-19 (AutofillProfile CRUD + an evidence-graded
        WHATWG-autocomplete-token matcher) but had no UI anywhere and zero
        registry entries until this session. Now reachable from
        ui/library's own Autofill tab (list/create/edit/delete profiles,
        detect/fill against a live agent tab) and registered as its own
        component family, above.

  history:
    - date: 2026-09-01
      summary: >
        First .spec written for clear-glass, closing one of the 11 real
        gaps orchestrator/lib/spec-drift.js's live check reported (§LM1,
        docs/2026-09-01-living-model-and-autonomous-pipeline-phasemap.spec).
        Grounded in the already-real registry-components.js contract, not
        written blind.
    - date: 2026-09-22
      summary: >
        Version/spec/registry maintenance pass (James: "bump versions,
        update specs, loom component registry"). meta.version corrected
        from stale 3.1.0 to 3.9.0 across five real sync points (package.json,
        this file, lib/version.js's services map, main/index.js's
        CG_VERSION, registry-components.js's own local V constant — see
        version_history above). Registry grew 67 -> 79: autofill's real
        IPC surface (shipped 2026-09-19, never registered — a pre-existing
        gap) plus screen-qa's new one, both added above. handshake.
        components_count corrected to match. interaction-contract.json
        regenerated from the live registry export (it states its own
        routes are derived, never hand-authored) — 67 -> 79 routes.
        FOUND, NOT FIXED: a new cross-check (every declared IPC component
        against a real ipcMain handler) surfaced 4 registered-but-
        unimplemented components — see gaps: entry EXT1 below.

    - date: 2026-09-23
      summary: >
        Accounts authority + login portals + settings rebuild (James:
        "login portals ... hook into the cookie vault, and create a
        accountid per account" / "yes clearglass"). Clear Glass is now
        the ONE account authority: options store gained accountDefaults
        (per-provider default), resolveAccountForDispatch (never auto-
        creates) and per-account session records; GET /accounts/resolve on
        :7702 is what guardian's dispatch ladder asks (guardian/lib/
        cg-account-authority.js) instead of its own list. New
        src/accounts/login-portal.js opens a provider's sign-in page in
        the exact partition agent-mesh spawn() uses (persist:mesh-
        <provider>-<accountId>) and captures the session into the
        CookieVault under the key spawn() restores from. Both vaults' keys
        moved off a hardcoded string onto Electron safeStorage
        (src/security/vault-key.js) with a legacy-key read fallback so no
        existing record becomes unreadable. Two real bugs fixed on the
        way: CookieVault's file-store branch (the real one — better-
        sqlite3 is not a dependency) never read named-account cookies
        back, so every restore() returned []; preload declared `macros`
        twice. Registry 79 -> 94. renderer/settings.html rebuilt as a
        shell over renderer/settings/*.js, one file per area (UI1's
        principle), inline script gone so script-src drops
        'unsafe-inline'.

    - date: 2026-09-25
      summary: >
        PATCH — real bug fix, no new API surface. James: "the ui, its not
        changed at all... just fix it." src/options/store.js's
        DEFAULTS.defaultStartUrl (the URL the app's one real startup
        window opens, src/main/index.js §18) was the literal 'about:blank'
        since before this store existed — every UI build shipped this
        engagement, real and reachable, was simply never what the app
        opened by default. Fixed to orchestrator's own root '/', which
        already, by a prior explicit decision (see orchestrator.js's own
        comments), serves ui/tv-shell/index.html as the homepage. Added a
        real, versioned one-time migration (_schemaVersion) so an existing
        install's already-persisted 'about:blank' is upgraded once, not
        silently re-overridden forever by load()'s {...DEFAULTS, ...raw}
        merge — and never touched again if a person deliberately chooses
        'about:blank' after the migration has run. 5 new tests in
        tests/modules/nexus-options-autoboot.test.js (15/15 total).

    - date: 2026-09-25
      summary: >
        Settings UI gap pass against James's Firefox-reference screenshot
        ("i want it nearly identicle to this... Yes build all the ui").
        Mapped every named Firefox category to real backend capability
        BEFORE building (non-negotiable: map first, no theater). Two
        categories had real, working capability sitting unexposed: (1)
        "Downloads" — cg.downloads.list/clearItem/openFolder have been
        real IPC handlers since 2026-08-24, but no section ever called
        list or openFolder, only privacy.js's bulk clearCompleted; new
        sections/downloads.js is the missing per-item view, plus the same
        real downloadDirectory field General already has. (2) "Extensions
        and themes" — src/plugins/host.js's list()/disable() existed since
        2026-08-24 with zero IPC exposure; added plugins:list/plugins:
        disable to ipc/bridge.js (thin wrappers, no new plugin-host
        behavior) + preload, and list() now also surfaces
        displayName/description (already on every manifest, just never
        returned). New sections/plugins.js — named "Plugins," not
        "Extensions and themes," since themes have no backend anywhere in
        this codebase (grepped directly, zero real matches). Also added a
        small real "Page zoom" control to General, wired to the zoom
        plugin's already-real toolbar-command signatures via
        plugins:invoke (fire-and-forget by that handler's own design, so
        the toast confirms the command was sent, not a zoom factor it
        can't see synchronously). FOUND, NOT BUILT — no real backend
        exists for: search-engine selection, appearance/theme (dark/light
        mode), accessibility settings, or a dedicated language-preference
        page (the only real "language" surface is the fingerprint
        spoofing profile, already covered by sections/fingerprint.js).
        backgroundTabDefaults.openInBackground (already toggled in
        General, pre-existing) still has zero real consumer anywhere —
        confirmed again directly, not touched this pass. Verified live:
        real Electron app under Xvfb, CDP-connected, all three
        pages rendered with real data (6 real installed plugins with real
        manifest text; live options.get()), and a real Disable click on
        the zoom plugin's row round-tripped through the new IPC handlers
        and flipped its state to "disabled" on screen.
        Registry unchanged (no new registry-components.js entries — these
        are new IPC routes on the existing plugins:* namespace, not new
        registry-tracked components; interaction-contract.json is derived
        from registry-components.js alone, so it is untouched).

  gaps:
    as_of: 2026-09-01
    entries:
      - id: SM1
        type: coverage
        summary: >
          loom/scanners/spec-map.js's SPEC_DIRS allowlist does not include
          clear-glass/spec — this new spec will not be picked up by loom's
          §6.3 coverage scanner until that allowlist is extended (a
          separate, pre-existing gap, recorded in this session's foundation
          addendum, not fixed here).
        opened: 2026-09-01

      - id: EXT1
        type: coverage
        summary: >
          Four registered components — cg.extensions.list/load/unload/
          pickDirectory (extensions:list/load/unload/pickDirectory) —
          have no ipcMain handler anywhere in the codebase, confirmed by
          direct search across every clear-glass/src/**/*.js file, not
          assumed from the registry alone. Real and pre-existing, not
          introduced by the 2026-09-22 pass that found it; genuinely
          unimplemented, not a naming mismatch. Out of scope to fix
          here — an extensions feature needs its own real design, not a
          guess made while doing a version/registry maintenance pass.
          tests/modules/version-sync-and-registry.test.js allowlists
          these four explicitly so the same check still catches any
          NEW declared-but-unimplemented component going forward.
        opened: 2026-09-22

      - id: FGAP1
        type: coverage
        summary: >
          Four Firefox settings categories James's reference screenshot
          named have no real NEXUS backend anywhere in this codebase,
          confirmed by direct grep across clear-glass/src and
          clear-glass/renderer, not assumed: search-engine selection
          (zero searchEngine/defaultSearch references anywhere),
          appearance/theme — dark/light mode (zero real theme config;
          only incidental comment-string matches on "theme"),
          accessibility (zero screenReader/a11y/reducedMotion/fontSize
          references anywhere), and a dedicated language-preference page
          (the only real "language" surface anywhere is the fingerprint
          spoofing profile's language/languages fields, already covered
          by sections/fingerprint.js — not a general browser-language
          setting). None of these were built as settings sections this
          pass, per the non-negotiable that a stub with nothing real
          behind it is worse than the gap itself. Firefox Labs / About
          Firefox / More from Mozilla / Firefox support have no NEXUS
          analog at all and were not treated as gaps to close.
        opened: 2026-09-25

  version_history:
    - version: 3.13.0
      date: 2026-09-25
      summary: >-
        MINOR (v0.39.241) — James: "the download manager in clearglass" and "need control j to popout a window
        like the screenshot. thats what it was supposed to look like, the settings ui but with the library. at
        least make the library style consistent with the rest of clearglass." The Library is its own Clear Glass
        window: renderer/library.html loads Settings' own settings.css and settings/core.js (boot() now takes
        groups/defaultId/cssBase/close/search; Settings' defaults unchanged), with one JS + one CSS per area under
        renderer/library/sections/ — Downloads (Firefox-style rows: type tile, name, "size — site — time", folder
        button, click to open; plus the Download Listeners form), Responses, Bookmarks, History (by day),
        Accounts, Passwords, Autofill, Macros. openLibraryWindow(area) in src/main/index.js: frameless, single
        instance, preload, library.html#<area>. Ctrl+J opens it at Downloads from ANY web contents (chrome and
        page) via app 'web-contents-created' before-input-event; Ctrl+Shift+J stays DevTools. The ☰ menu's
        Downloads and Library rows and the tray entry open it. New IPC: window:openLibrary, window:closeLibrary,
        downloads:openFile (completed downloads only) — registry 99 -> 102, contract regenerated. Retired:
        ui/library/ (the :9000 page in an agent window) and browser.js's Downloads dropdown. FIXED: the bridge's
        CORS preflight named no methods, so every DELETE/PUT/PATCH from the Library (remove download, delete
        bookmark/history/account/password/profile, edit profile) was refused by the browser — in the old page too.
        FIXED: downloads/artifact-chat-index.js tried better-sqlite3 on every read and printed two stack traces
        each time it was missing; now tried once, said once, responses/ read directly. Proven: tests/probe/
        clearglass-library-window.js (real page, real bridge, 25/25), clearglass-menu-library.py, clear-glass-
        library-ui 45/45.
      versioniumCommitId: null
    - version: 3.12.1
      date: 2026-09-25
      summary: >-
        PATCH (v0.39.240) — James: "also needs to be clearglass library... added to the 3 lines menu". The Library
        window (ui/library/: bookmarks, history, downloads, agent responses, accounts, macros, autofill, passwords)
        was reachable only from the tray. renderer/browser.js's ☰ menu (#bookmark-mgr-btn) gains a fixed
        "📚 Library" row after History; it opens the SAME window the tray opens (agentId nexus-library, the
        /ui/library/ URL) through cg.window.open -> window:open -> openAgentWindow, and a failure is toasted. No
        new route. Proven by clicking it in headless Chromium on the real browser.html (tests/probe/
        clearglass-menu-library.py); tests/modules/clear-glass-library-ui.test.js 24 -> 28 pins the row and that
        its agentId/URL equal the tray's. All sync points moved together.
      versioniumCommitId: null
    - version: 3.12.0
      date: 2026-09-25
      summary: >-
        MINOR (v0.39.239) — the downloads manager routes each response to its agent and can be read. James: "the download
        manager should be routing the response to the agent or compartment id" / "needs a ui so i can actually see this".
        src/downloads/artifact-chat-index.js: agent_id and job_id are first-class fields (older .response files read from
        raw.agentId/raw.jobId), queryItems filters them, readItem(root,id) returns one record (ids that could leave
        responses/ are refused), defaultRoot() is the ONE root resolver — guardian's writer (code-artifact.js), guardian's
        recovery (response-sink.js), the new routes and download-capture all use it (four callers resolved it themselves
        before). src/ipc/bridge.js: GET /cli/downloads/responses and /cli/downloads/responses/:id (read-only; registry
        97 -> 99, contract routes regenerated from the registry); its command index honours NEXUS_DATA_ROOT so a test
        starting the bridge no longer rewrites the real data/clear-glass/command-index.json. src/providers/download-capture.js
        1.1.0: attach() is idempotent per session (every provider window shares one session; each window added a listener,
        so every download was announced once per open window), each download carries the agentId of the tab it came from
        (ProviderHost resolves it), the ledger no longer records the provider name as the agent, and each download is
        recorded in the index under its agent (copied up to 10 MB, else by path). ui/library: a Responses tab
        (areas/responses.js + .css) lists replies by agent with the reply text and code blocks. Tests:
        tests/modules/test-downloads-responses.test.js 15/15 on the real writer and the real bridge over HTTP, each fix
        mutation-checked; the tab driven in headless Chromium. All sync points moved together.
      versioniumCommitId: null
    - version: 3.11.3
      date: 2026-09-25
      summary: >-
        PATCH (v0.39.237) — no stray provider windows. src/providers/host.js: an agent tab that crashes or
        closes unexpectedly restarts as the same agent tab (start(providerId, {show:false, agentId})); it
        used to call start(providerId) with no agentId, which started the SHARED provider window.
        closeAgentTab — the idle sweep and the LRU cap both use it — now sets _nexusIntentionalStop before
        destroy, as stop() does: without it every intentional agent-tab close was treated as unexpected and
        started the shared window 5 s later. The userscripts guardian injects no longer replay IndexedDB
        records on connect (guardian 3.9.0). No API surface change; interaction-contract routes unchanged.
        Tests: tests/modules/test-provider-host-one-tab.test.js 7/7 against the real ProviderHost class
        (only 'electron' faked), each fix mutation-checked. All seven sync points moved together.
      versioniumCommitId: null
    - version: 3.11.2
      date: 2026-09-25
      summary: >-
        PATCH — two new settings sections (Downloads, Plugins) surfacing real, already-existing backend
        capability that had no UI before (cg.downloads.list/openFolder/clearItem; src/plugins/host.js's
        list()/disable(), newly exposed via plugins:list/plugins:disable in ipc/bridge.js + preload).
        Small real "Page zoom" control added to General. No new registry-components.js entries (plugins:*
        route additions, not registry-tracked components) so interaction-contract.json is unchanged. All
        six sync points moved together.
      versioniumCommitId: null
    - version: 3.11.1
      date: 2026-09-25
      summary: >-
        PATCH — defaultStartUrl's real default fixed ('about:blank' -> orchestrator root '/', which
        already serves ui/tv-shell as the homepage) plus a versioned one-time migration so an existing
        install's persisted 'about:blank' is upgraded once, not silently overridden forever. No new API
        surface. All five sync points moved together.
      versioniumCommitId: null
    - version: 3.11.0
      date: 2026-09-23
      summary: >-
        MINOR — Clear Glass job intake (src/jobs/intake.js): /agent-mesh/send and /agent-mesh/job now go
        through it; it takes in only jobs guardian CLAIMED for it on their .job (read back via guardian
        GET /jobs?id=), keeps its own <jobId>.intake records, survives a restart as clear_glass_restarted
        (sent:null). Registered mesh.jobSend + mesh.jobStatus (real since 2026-09-19, never registered) and new
        mesh.jobIntake GET /agent-mesh/intake: 94 -> 97. Settings UI: one JS + one CSS file per area (14 + 14),
        area CSS scoped to body[data-area], shared settings.css holds tokens/frame/shared components only.
      versioniumCommitId: null
    - version: 3.10.0
      date: 2026-09-23
      summary: >-
        MINOR — new capability, backward compatible: 15 new IPC components (per-provider default
        account + dispatch resolution, 8 login-portal channels, vault key status, macro create/delete/
        schema). All five sync points moved together (package.json, this file, lib/version.js,
        main/index.js CG_VERSION, registry-components.js V); interaction-contract.json regenerated
        79 -> 94 routes, existing route objects kept verbatim.
      versioniumCommitId: null
    - version: 3.1.0
      date: 2026-09-01
      summary: "First real .spec authored, matching live code@3.1.0 exactly (no version bump required)."
      versioniumCommitId: null
    - version: 3.1.0
      date: 2026-09-19
      summary: >-
        clear-glass/src/gates/index.js gained 13 new real gates (mesh.workflow.list/get/create/update/
        remove/run/step.add/step.update/step.remove/step.move, mesh.list.nodes/meshView/agents), same
        convention as the 4 pre-existing mesh gates. Closes a real gap: AgentMesh's own 10-method
        automation engine (this._automation, already backing BrainOS's UI via /automation/workflows) and
        its 3 list methods had zero gate coverage — completely unreachable from the agent-tool loop despite
        being the same real object spawn/send/route/enqueue already dispatched to. No version bump — same
        real object, same real methods, just now also reachable as gates; not a behavior change to anything
        that already worked.
      versioniumCommitId: null
    - version: 3.9.0
      date: 2026-09-22
      summary: >-
        Two real gaps closed at once. (1) DRIFT CORRECTED, not invented: this meta.version had stayed
        at 3.1.0 since 2026-09-01 while clear-glass/package.json (the field actually bumped per real
        release) reached 3.8.0 — the same drift pattern lib/version.js's own services['clear-glass']
        entry and main/index.js's CG_VERSION constant independently exhibited (all three checked
        directly, all three read 3.1.0). What real work landed in package.json's 3.2.0–3.8.0 is not
        reconstructed here — this entry does not claim to document it, only to stop three sources of
        truth disagreeing about the number. (2) This session's real additions, on top of that corrected
        baseline: macros + autofill get a real UI for the first time (ui/library/library-app.js, a
        7-tab page that was previously a shell with no script behind it), and a full screen-qa feature
        — detect open-ended on-screen questions, answer them through the real copilot bridge, inject
        the chosen answer back into the page — with a hotkey (Ctrl/Cmd+Shift+A), a right-click menu
        entry, element-picker integration (elementAt on the DOM mesh), a Settings section, and an
        isolated main-process Notification that fires independent of the renderer's own health. Plus a
        real bug fix: the right-click context menu's position, which used webview-relative coordinates
        against a window-relative #ctx-menu. New real routes/handlers: /cli/agents, /cli/autofill/*
        (7), /cli/downloads/clear-completed, /cli/screen-qa/* (3 REST + 5 IPC). Full detail in
        lib/version.js's own 0.39.204–0.39.210 changelog entries.
      versioniumCommitId: null
