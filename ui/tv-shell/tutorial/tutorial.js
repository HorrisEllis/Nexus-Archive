'use strict';
/**
 * ui/tv-shell/tutorial/tutorial.js — Guided Tutorial Orchestrator
 * UUID: nexus-tutorial-engine-v1-0000-2026-0706-jamesbrooks-001
 * Expansion map Phase D (docs/NEXUS-EXPANSION-MAP-2026-07-06.md §2.6).
 *
 * All three primitives were real and never orchestrated: toast (idearium
 * UI has one; tv-shell gets a minimal one here), Spotlight (window.CP —
 * real, its exec/spotlight interface and the cp-/ac- CSS variables),
 * and Nerve (lib/nerve — read-only attention snapshots). This is the
 * missing state machine.
 *
 * §DETECTION, NOT NARRATION — every step carries `expected`: a real,
 * machine-checkable condition (an HTTP endpoint + a check function, or a
 * DOM predicate). The engine polls it. On timeout, the failure is POSTed
 * into copilot's real stream ingest (POST /api/stream — the same
 * streamIngest every system feeds) as `tutorial.step.failed`, carrying
 * step id, what was expected, and what was actually observed. That's the
 * literal "give copilot the expected behavior so it can detect when it's
 * not working" — the expectation is data, the failure is an event in the
 * stream copilot already reads, not a console.log nobody sees.
 *
 * §NERVE'S INVARIANT RESPECTED — nexus-nerve.spec: "Nerve determines
 * what is shown, not what is true. No system decision logic may be
 * derived directly from Nerve output." The engine uses Nerve's presence
 * snapshot ONLY to choose display (dim a step whose system is stale);
 * step pass/fail comes from each step's own expected-condition check
 * against the real endpoint, never from Nerve.
 *
 * Usage (from tv-shell):
 *   const t = new Tutorial(FIRST_SPEC_TUTORIAL);
 *   t.start();
 */

(function (global) {

  const COPILOT_URL = (global.NEXUS_COPILOT_URL) || 'http://127.0.0.1:3750';
  const CORTEX_URL  = (global.NEXUS_CORTEX_URL)  || 'http://127.0.0.1:3748';

  // ── §CFR→CSS root wire — the live field drives the whole visual layer ──
  // spotlight.css declares --cp-tension at :root but only ever wrote it
  // per-tile. This polls the real /cfr/field and sets it at the root, so
  // every variable-driven consumer (cursor glow, pulse radius, anything
  // in tutorial.css or spotlight.css) breathes with the actual system
  // state — turbulent regime = visibly hotter guidance, no JS color code.
  let _tensionTimer = null;
  function startFieldWire() {
    if (_tensionTimer) return;
    const tick = async () => {
      try {
        const r = await fetch(`${CORTEX_URL}/cfr/field`, { signal: AbortSignal.timeout(2500) });
        const f = await r.json();
        // sigma-ish tension: friction+entropy high or coherence low → hotter
        const tension = Math.max(0, Math.min(1,
          ((f.friction ?? 0.5) + (f.entropy ?? 0.5)) / 2 * (f.regime === 'stable' ? 0.6 : 1.0)));
        document.documentElement.style.setProperty('--cp-tension', tension.toFixed(2));
      } catch (_) { /* field unreachable — leave last value, never fabricate */ }
    };
    tick();
    _tensionTimer = setInterval(tick, 3000);
  }

  // ── The co-pilot cursor — a literal pointer copilot moves for you ──────
  function _cursor() {
    let c = document.getElementById('tut-cursor');
    if (!c) { c = document.createElement('div'); c.id = 'tut-cursor'; document.body.appendChild(c); }
    return c;
  }
  function _moveCursorTo(el) {
    const c = _cursor();
    const r = el.getBoundingClientRect();
    c.style.left = `${r.left + r.width / 2 - 9}px`;
    c.style.top  = `${r.top + r.height / 2 - 9}px`;
    c.classList.add('visible');
    return new Promise(res => setTimeout(res, 850)); // matches the CSS transition
  }
  async function _cursorClick() {
    const c = _cursor();
    c.classList.add('clicking');
    setTimeout(() => c.classList.remove('clicking'), 400);
  }
  // Ghost-typing — literally shows what to type, character by character,
  // as a placeholder overlay. Never actually fills the input (the user
  // does the doing; copilot does the showing).
  async function _ghostType(el, text) {
    const original = el.placeholder;
    el.classList.add('tut-input-focus');
    for (let i = 1; i <= text.length; i++) {
      el.placeholder = text.slice(0, i);
      await new Promise(r => setTimeout(r, 45));
    }
    setTimeout(() => { el.placeholder = original; }, 6000);
  }

  async function _showStep(step) {
    // System-tile spotlight (window.CP) — unchanged, still real.
    if (step.spotlight && global.CP?.exec) {
      global.CP.exec({ ui: { spotlight: [step.spotlight], spotlightTtl: 0 } });
    }
    // Element-level guidance — the literal showing.
    if (step.target) {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await _moveCursorTo(el);
        el.classList.add('tut-pulse');
        if (step.action === 'click') await _cursorClick();
        if (step.action === 'type' && step.ghostText) await _ghostType(el, step.ghostText);
        if (step.flash) { el.classList.add('tut-flash'); setTimeout(() => el.classList.remove('tut-flash'), 2000); }
        return el;
      }
      // Target selector matched nothing — report it, don't silently skip.
      _reportToCopilot({ type: 'tutorial.target.missing', selector: step.target, step: step.id, ts: Date.now() });
    }
    return null;
  }
  function _clearStep(el) {
    if (el) { el.classList.remove('tut-pulse', 'tut-input-focus'); }
  }


  // ── Minimal toast for tv-shell (idearium's toast is page-local) ──────────
  function _toast(msg, kind = 'info', ttl = 5000) {
    let area = document.getElementById('tutorial-toast-area');
    if (!area) {
      area = document.createElement('div');
      area.id = 'tutorial-toast-area';
      area.style.cssText = 'position:fixed;bottom:56px;right:16px;z-index:1000;display:flex;flex-direction:column;gap:6px;';
      document.body.appendChild(area);
    }
    const div = document.createElement('div');
    // Uses the SAME CSS variables Spotlight owns (--ac, --cp-focus) —
    // spotlight.css is the producer, this is a consumer, per the
    // variable-based integration contract.
    div.style.cssText = `font:12px/1.5 monospace;color:var(--text,#cde);background:var(--panel,#0d1219);
      border:1px solid ${kind === 'err' ? 'var(--err,#ff3355)' : 'var(--cp-focus,var(--ac,#00d4ff))'};
      border-radius:8px;padding:10px 14px;max-width:340px;box-shadow:0 4px 18px rgba(0,0,0,.5)`;
    div.textContent = msg;
    area.appendChild(div);
    if (ttl > 0) setTimeout(() => div.remove(), ttl);
    return div;
  }

  async function _check(expected) {
    if (!expected) return { ok: true, observed: 'no expectation declared' };
    if (typeof expected.dom === 'function') {
      try { const v = expected.dom(); return { ok: !!v, observed: `dom check → ${!!v}` }; }
      catch (e) { return { ok: false, observed: `dom check threw: ${e.message}` }; }
    }
    if (expected.url) {
      try {
        const r = await fetch(expected.url, { signal: AbortSignal.timeout(4000) });
        const data = await r.json().catch(() => null);
        const pass = expected.checkFn ? expected.checkFn(data, r) : r.ok;
        return { ok: !!pass, observed: `HTTP ${r.status}${data ? ', body received' : ''}` };
      } catch (e) { return { ok: false, observed: `fetch failed: ${e.message}` }; }
    }
    return { ok: false, observed: 'expectation had neither dom nor url — unverifiable, treated as failed, not silently passed' };
  }

  function _reportToCopilot(event) {
    // Fire-and-forget into copilot's real streamIngest (POST body with
    // .type lands in the same buffer AX-008's SSE feeds fill).
    try {
      fetch(`${COPILOT_URL}/api/stream`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {});
    } catch (_) {}
  }

  class Tutorial {
    constructor(def) {
      this.def = def;
      this.idx = -1;
      this._active = null;
    }

    start() {
      document.body.classList.add('tut-active');
      startFieldWire(); // live CFR → root --cp-tension, the whole visual layer breathes with the real field
      _toast(`Tutorial: ${this.def.title}`, 'info', 4000);
      _reportToCopilot({ type: 'tutorial.started', tutorial: this.def.id, steps: this.def.steps.length, ts: Date.now() });
      this.next();
    }

    async next() {
      this.idx++;
      if (this.idx >= this.def.steps.length) {
        _toast('Tutorial complete ✓', 'info', 6000);
        if (global.CP?.off) global.CP.off();
        document.body.classList.remove('tut-active');
        const c = document.getElementById('tut-cursor');
        if (c) c.classList.remove('visible');
        _reportToCopilot({ type: 'tutorial.completed', tutorial: this.def.id, ts: Date.now() });
        return;
      }
      const step = this.def.steps[this.idx];
      this._active = _toast(`${this.idx + 1}/${this.def.steps.length} — ${step.say}`, 'info', 0);

      // The literal showing — cursor moves to the target, borders pulse,
      // ghost-typing demonstrates input. Falls back to tile spotlight
      // alone when a step has no element-level target.
      const shownEl = await _showStep(step);

      // Poll the expected condition — the machine-checkable half.
      const deadline = Date.now() + (step.timeoutMs || 60000);
      while (Date.now() < deadline) {
        const result = await _check(step.expected);
        if (result.ok) {
          this._active?.remove();
          _clearStep(shownEl);
          _reportToCopilot({ type: 'tutorial.step.passed', tutorial: this.def.id, step: step.id, ts: Date.now() });
          return this.next();
        }
        await new Promise(r => setTimeout(r, step.pollMs || 1500));
      }

      // Timed out — the detection path. Expected vs observed, into
      // copilot's stream, plus a visible failure toast with a retry.
      const last = await _check(step.expected);
      this._active?.remove();
      _clearStep(shownEl);
      _toast(`Step "${step.id}" didn't complete — expected: ${step.expectedText || 'condition'}; observed: ${last.observed}`, 'err', 0);
      _reportToCopilot({
        type: 'tutorial.step.failed', tutorial: this.def.id, step: step.id,
        expected: step.expectedText || String(step.expected?.url || 'dom condition'),
        observed: last.observed, ts: Date.now(),
      });
    }
  }

  // ── The first real tutorial: idea → spec → AI generation, the flow this
  // session built. Every expected condition hits a real endpoint.
  const FIRST_SPEC_TUTORIAL = {
    id: 'first-spec',
    title: 'Your first spec — idea to AI-generated chunks',
    steps: [
      {
        id: 'open-idearium',
        say: 'Open Idearium (the Idearium tile). Choose "Brainstorm a new system" on the entry gate.',
        spotlight: 'idearium',
        expected: { url: 'http://127.0.0.1:4800/health' },
        expectedText: 'Idearium reachable',
        timeoutMs: 120000,
      },
      {
        id: 'capture-idea',
        say: 'Type a raw thought into the brainstorm box and hit "+ capture", then promote it to an idea.',
        target: '#gate-brain-text',
        action: 'type',
        ghostText: 'a system that watches my repos and opens gaps when tests fail...',
        expected: { url: 'http://127.0.0.1:4800/api/ideas', checkFn: d => (d?.ideas || []).length > 0 },
        expectedText: 'at least one idea exists',
        timeoutMs: 300000,
      },
      {
        id: 'create-spec',
        say: 'Open your idea and create a spec from it.',
        expected: { url: 'http://127.0.0.1:4800/api/specs', checkFn: d => (d?.specs || []).length > 0 },
        expectedText: 'at least one spec exists',
        timeoutMs: 300000,
      },
      {
        id: 'generate-ai',
        say: 'In the Spec Library, open your spec and press "generate via AI" — watch the chunks fill in.',
        expected: { url: 'http://127.0.0.1:4800/api/spec-engine/specs', checkFn: d => (d?.specs || []).some(s => (s.doneChunks || 0) > 0) },
        expectedText: 'at least one AI-built chunk complete',
        timeoutMs: 600000,
      },
    ],
  };

  global.NexusTutorial = { Tutorial, FIRST_SPEC_TUTORIAL, _check, startFieldWire, _showStep, _clearStep };
})(typeof window !== 'undefined' ? window : globalThis);
