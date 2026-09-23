spec:
  meta:
    name:        clear-glass
    version:     3.10.0
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
    components_count: 94   # §2026-09-22 — was 67 (stale since 2026-09-01); autofill's 7 real
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

  version_history:
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
