spec:
  meta:
    name:        clear-glass
    version:     3.1.0
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
      returns: "Full clear-glass component registry — 67 real components as of 2026-09-01"

  handshake:
    components_count: 67
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
        lib/version.js 0.39.30 for the real diff).

  history:
    - date: 2026-09-01
      summary: >
        First .spec written for clear-glass, closing one of the 11 real
        gaps orchestrator/lib/spec-drift.js's live check reported (§LM1,
        docs/2026-09-01-living-model-and-autonomous-pipeline-phasemap.spec).
        Grounded in the already-real registry-components.js contract, not
        written blind.
    - date: 2026-09-02
      summary: >
        Real cookie-vault IPC round-trip built end to end. Checked first:
        a real, secure contextBridge relay already existed (src/preload/
        webview-bridge.js, built 2026-07-09, for exactly the reason a
        page-level userscript has zero Node access) — a new
        'nexus:cookie-request' channel added to its existing allowlist,
        relayed through browser.js/preload/index.js to a real main-
        process handler (src/ipc/bridge.js) that reuses cookies:count's
        own real logic (extracted into a shared _countCookies(), not
        duplicated) and delivers the response back into the SAME webview
        via executeJavaScript — the same real pattern injectAnswer()
        already uses for wake-word answers. Only "count" is real today;
        save/restore exist in src/cookies/vault.js but aren't wired
        through this same round-trip yet.
    - date: 2026-09-02
      summary: >
        AM8 — the guardian element-picker's real, two-step "add as new
        agent" pairing flow. renderer/guardian-picker.js's existing
        listener-config modal gained a 9th LINK TARGET option; picking an
        element, naming an agent, and marking it input/output reopens the
        picker asking for the opposite role, refusing a same-role second
        pick. Real persistence added directly to src/options/store.js
        (registerAgent/listAgents/getAgent, matching its own established
        registerListener convention). Honest scope, stated in the code:
        registration only — actually dispatching a job to a custom agent
        is real, separate, unbuilt work.
    - date: 2026-09-02
      summary: >
        §ROOT CAUSE — James, live, from a real standalone-browser
        screenshot: "the userscript isn't connecting... make sure you
        account for cors." Every local endpoint guardian's userscripts
        talk to is plain HTTP while the host page is HTTPS — a standard
        mixed-content block. Not a clear-glass-side fix per se (the real
        fix lives in guardian/userscript-*.js), but directly explains why
        clear-glass's own webview-hosted agents appeared "disconnected"
        outside clear-glass's own Electron context, where this same
        restriction doesn't apply the same way. Also: AM8's own new
        agents:list handler (above) collided with a pre-existing, real
        agent-mesh registry handler in this same ipc/bridge.js, crashing
        Electron's ipcMain at boot — renamed to custom-agents:*.
    - date: 2026-09-03
      summary: >
        Merged a real parallel session's work: clear-glass/src/mesh/
        agent-mesh.js's route() now tries Guardian's real, more-
        instrumented NCP+userscript path first for exactly the two agents
        it actually covers (claude/chatgpt — gemini/perplexity/mistral
        have no Guardian userscripts, so this mesh's own DOM automation
        remains their only real coverage), falling through honestly on
        any failure.
    - date: 2026-09-05
      summary: "docs: update the living models — real history entries, plus a real pre-existing YAML bug found and fixed in 4 specs (1 real file touched)"
    - date: 2026-09-05
      summary: "chore: register the two orphans the new post-commit hook itself flagged (1 real file touched)"
    - sha: f66c6f434bd997c38ccef6de34109805a2767ee8
      date: 2026-09-05
      summary: "fix: real, tested merge safety for parallel-session history writes — found a genuine, silent data-loss risk before it could bite (1 real file touched)"

  gaps:
    as_of: 2026-09-03
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
      - id: CG-CV1
        type: coverage
        summary: >
          The real cookie-vault IPC round-trip (2026-09-02) only wires
          "count." src/cookies/vault.js's real save/restore/snapshot
          capabilities exist but aren't reachable from a page-level
          userscript through the same round-trip yet — a real, bounded,
          separate follow-up using the exact same pattern already proven.
        opened: 2026-09-02
      - id: CG-AM8-1
        type: design
        summary: >
          AM8's registerAgent() is registration only — no real dispatch
          mechanism exists yet for a custom, user-paired agent (injecting
          text into the real input element, reading the real output back
          out, knowing when a response is done streaming on a site this
          system has never seen before). Named explicitly in the code
          itself, not implied by the method's name.
        opened: 2026-09-02

  version_history:
    - version: 3.1.0
      date: 2026-09-01
      summary: "First real .spec authored, matching live code@3.1.0 exactly (no version bump required)."
      versioniumCommitId: null
    - version: 3.1.0
      date: 2026-09-03
      summary: "Cookie-vault IPC round-trip, AM8's element-picker agent pairing, and the agent-mesh/Guardian connection all landed without a real internal CG_VERSION bump — src/main/index.js's own constant is unchanged at 3.1.0, recorded here as real, additive capability against the same version."
      versioniumCommitId: null
