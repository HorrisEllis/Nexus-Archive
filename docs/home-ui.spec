spec:
  meta:
    name:        home-ui
    version:     1.2.0
    uuid:        nexus-home-ui-v1-1000-2026-0617-jamesbrooks-001
    file:        ui/home/index.html
    serves:      http://127.0.0.1:9000/
    purpose: >
      The NEXUS home screen. Sovereign OS overview surface.
      Always opens on the tile grid (Overview channel).
      Mode selector is a non-blocking overlay, opened by user intent only.
      All system tiles pulse on health poll. Forge Shell tile links to build surface.
      Agent tile opens mode selector and reflects active mode.

  phases:
    1:
      name:    Overlay boot fix
      status:  complete
      desc:    mode-overlay starts display:none, opens only with .open class. Never blocks boot.
    2:
      name:    Silent mode restore
      status:  complete
      desc:    selectMode(mode, goToSuite=false) on init — applies mode to body/badge/tiles
               without navigating away from Overview. goToSuite=true only on user selection.
    3:
      name:    Forge Shell tile
      status:  complete
      desc:    Tile 7 in sys-grid. Heartbeat pulse animation on icon. Opens forge-shell.html
               in new tab. Shows open gap count from cortex. Phase progress metric.
    4:
      name:    Agent mode tile
      status:  complete
      desc:    Tile 8. Opens mode selector overlay. Reflects active mode name/color/badge.
               Updates on every health poll cycle.
    5:
      name:    Heartbeat CSS
      status:  complete
      desc:    forge-pulse keyframe on forge tile icon. Tile border glow on hover.
    6:
      name:    Cortex event logging
      status:  complete
      desc:    ui.mode.selected event on every mode change.
               ui.navigation event when forge shell opened.
               Both fire-and-forget POST to cortex :3748/api/event.
    7:
      name:    Polling hook
      status:  complete
      desc:    updateForgeTile() runs every 10s alongside pollHealth.
               Updates forge gap count and agent tile state from live data.

  channels:
    0: Overview     (tile grid — always the landing)
    1: Guardian     (:7820)
    2: Cortex       (:3748)
    3: Idearium     (:4800)
    4: Bridge       (:9999)
    5: Log          (SSE stream)
    6: Diagnose     (health checks + CFR + gaps)
    7: Blueprint    (descriptor + phase map)
    suite: Agent Suite (injected dynamically when mode is selected)

  tiles:
    tile-orch:   Orchestrator  :9000
    tile-gd:     Guardian      :7820
    tile-cx:     Cortex        :3748
    tile-idr:    Idearium      :4800
    tile-br:     Bridge        :9999
    tile-dg:     Diagnose      system
    tile-forge:  Forge Shell   ui/forge-shell.html  (new v1.1)
    tile-agent:  Agent Mode    overlay              (new v1.1)

  cortex_events:
    ui.mode.selected:
      payload: { mode, provider, ts }
      source:  home-ui
    ui.navigation:
      payload: { target, ts }
      source:  home-ui

  quick_notes:
    status: pending
    phase: 35
    description: >
      Sticky-notes box synced across every panel, the TV shell, and the
      CLI simultaneously. Thin view over Idearium's idea.create/list
      surface — not a redundant standalone notes system.
    flow: "type → 300ms debounce → POST → SSE broadcast → re-render in every connected panel"
    tag_to_idea: "tagging a note creates an Idearium idea (idearium.spec idea-store module)"
    grammar: "'note <text>' → KNOWLEDGE_CAPTURE intent"
    deps: "jaa ✓ · guardian/server ✓ · sse ✓ · userscripts ✓ — fully unblocked"
    unlocks: "Phase 37 (Userscript Rebuild) — needs this landed alongside Phase 36 first"

  axioms:
    - §1.2 nothing silent — all UI events logged to cortex
    - §3.1 bottom-up — overview loads first, mode is a layer above
    - mode selector never blocks the OS view
    - forge shell opens in new tab — does not replace the TV shell
    - all tiles pulse on successful health poll (existing pulseCard behavior)
