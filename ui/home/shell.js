'use strict';
/**
 * ui/home/shell.js — thin shell, per ui/home/DECOMP.md's own spec:
 * "tune(), toggleMenu(), connectSSE(), flashDot(), pollHealth(),
 * CH_META[], MODE_CONFIG{}, P{}. Everything else is in the module
 * that owns it." This shell only boots modules and wires the one SSE
 * connection everything else shares — it owns no rendering of its own.
 *
 * §NOTE — this is an ADDITIVE new entry point (nexus-home.html), not a
 * replacement of the existing ui/home/index.html. That file is a real,
 * working 4000-line surface already carrying production traffic
 * (per DECOMP.md's own "What exists now" section) — DECOMP.md's own
 * migration plan (Phase 1-3) extracts modules out of it incrementally
 * rather than swapping the whole file at once, which is the same
 * instinct followed here: prove the decomposed shape works standalone
 * first, cut the monolith over to it once it does.
 */
(function () {
  const P = { orchestrator: 9000 }; // same origin — see STRUCTURE.md SISO law

  async function boot() {
    // 1. Toast layer mounts first — every subsequent step can report failure.
    window.Toast && window.Toast.mount(document.body);
    const sse = window.Toast ? window.Toast.connect('/sse') : new EventSource('/sse');

    // 2. Consent gate — blocks nothing except RFR2 people-modeling itself.
    //    The rest of the UI (build pipeline, health, etc.) works whether
    //    the user says yes or no; this only decides whether copilot's
    //    user-model calls getRelationalSignal() successfully or gets
    //    'consent-not-granted' back.
    if (window.ConsentGate) {
      const alreadyDecided = await window.ConsentGate.checkAndShow();
      window.ConsentGate.on('decided', ({ granted }) => {
        window.Toast && window.Toast.show(
          granted ? 'Pattern learning enabled.' : 'Pattern learning stays off.', 'info');
      });
    }

    // 3. Load the primary channel — build pipeline is the point of this
    //    UI (per the brief this shell was built against: "the point of
    //    the ui though is a build execution pipeline closed loop").
    _mountChannel('build', '/ui/channels/build/build.html');

    // 4. Floating menu + copilot CLI — reuses the real, existing
    //    tv-shell modules rather than re-inventing them here.
    _loadScript('/ui/tv-shell/menu.js');
    _loadScript('/ui/tv-shell/spotlight/spotlight.js');
    _loadScript('/ui/tv-shell/nerve/nerve.js');
  }

  function _mountChannel(id, src) {
    const host = document.getElementById('shell-channel-host');
    if (!host) return;
    const iframe = document.createElement('iframe');
    iframe.id = `channel-${id}`;
    iframe.className = 'shell-channel-frame';
    iframe.src = src;
    host.appendChild(iframe);
  }

  function _loadScript(src) {
    const s = document.createElement('script');
    s.src = src;
    s.onerror = () => console.warn(`[shell] optional module not found: ${src} (safe to ignore if not yet decomposed)`);
    document.body.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
