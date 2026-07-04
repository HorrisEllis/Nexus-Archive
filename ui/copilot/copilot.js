/**
 * ui/copilot/copilot.js — the co-pilot input/response runtime
 *
 * Extracted from ui/home/index.html's inline asSend() + prompt-history
 * state, per DECOMP.md's plan. Behavior is preserved exactly — this is a
 * relocation, not a rewrite. The one real change: instead of reaching
 * directly for shell globals (B, CH_META, curCh, tune, post), the shell
 * injects them once via CoPilot.init(deps) — otherwise this module would
 * just recreate the same coupling DECOMP.md exists to remove, one file
 * later. get()/post()/del() themselves come from the already-extracted
 * ui/lib/api.js, loaded before this file.
 *
 * DOM elements this module still reads/writes directly (#assistant-in,
 * #assistant-out) are the co-pilot input bar itself — genuinely this
 * module's own concern, not shell chrome, so that part is NOT injected.
 */
window.CoPilot = (() => {
  let _deps = null; // { B, CH_META, getCurCh, tune, post }
  const _hist = [];
  let _histIdx = -1;

  function init(deps) {
    _deps = deps;
  }

  /**
   * navigateHistory('up'|'down') — returns the prompt text to place in
   * the input box. The shell's keydown listener stays in shell.js (it's
   * wired to a DOM element the shell owns), but no longer touches the
   * history array/index directly — those are this module's state now.
   */
  function navigateHistory(direction) {
    if (direction === 'up') {
      _histIdx = Math.min(_histIdx + 1, _hist.length - 1);
      return _hist[_histIdx] || '';
    }
    _histIdx = Math.max(_histIdx - 1, -1);
    return _histIdx >= 0 ? _hist[_histIdx] : '';
  }

  async function send() {
    if (!_deps) throw new Error('[CoPilot] init(deps) must be called before send()');
    const { B, CH_META, getCurCh, tune, post } = _deps;

    const inp = document.getElementById('assistant-in');
    const q   = inp.value.trim(); if (!q) return;
    _hist.unshift(q); _histIdx = -1; inp.value = '';

    const out = document.getElementById('assistant-out');
    out.style.display = 'block';
    out.style.color = 'rgba(200,220,210,.8)';
    out.textContent = '';

    // clear is the only client-side command — everything else goes to co-pilot
    if (q.toLowerCase() === 'clear') { out.style.display = 'none'; return; }

    // Show thinking indicator
    const thinking = document.createElement('span');
    thinking.textContent = '…';
    thinking.style.cssText = 'opacity:.4;font-style:italic';
    out.appendChild(thinking);

    // Pass current channel context + live UI state to co-pilot
    let uiSnapshot = null;
    try { uiSnapshot = JSON.parse(window.NEXUS_UI_STATE.snapshot()); } catch (_) {}
    const curCh = getCurCh();
    const cp = await post(`${B.orch}/api/guardian/copilot/prompt`, {
      prompt: q,
      channel: CH_META[curCh]?.id || 'ch-overview',
      channelName: CH_META[curCh]?.name || 'Overview',
      uiState: uiSnapshot,
      contextOpts: { intent: q },
    });

    out.textContent = '';

    if (cp === null) {
      out.style.color = 'rgba(255,100,100,.8)';
      out.textContent = 'Orchestrator unreachable (:9000), or co-pilot (:3750) failed. Is NEXUS running?';
      return;
    }

    if (!cp.ok) {
      out.style.color = 'rgba(255,100,100,.8)';
      out.textContent = cp.denied
        ? `RAID denied: ${cp.reason}`
        : `Error: ${cp.error || 'request failed'}`;
      return;
    }

    // Execute any UI instructions from co-pilot (spotlight, steps, navigation)
    if (cp.ui) window.CP.exec(cp.ui, cp.text);

    // Navigation shortcut — co-pilot says "go to channel X"
    if (cp.action === 'navigate' && cp.ui?.command === 'tuneById') {
      const navId = cp.ui.arg;
      const navIdx = CH_META.findIndex(c => c.id === navId);
      if (navIdx !== -1) {
        out.style.color = 'rgba(150,220,180,.9)';
        out.textContent = cp.text || 'Navigating…';
        setTimeout(() => tune(navIdx), 350);
        return;
      }
    }

    // Main response
    out.style.color = 'rgba(200,220,210,.92)';
    out.textContent = cp.text || 'No response.';

    // If co-pilot spotlighted something, briefly scroll it into view
    if (cp.ui?.spotlight) {
      const name = Array.isArray(cp.ui.spotlight) ? cp.ui.spotlight[0] : cp.ui.spotlight;
      const el = document.getElementById(name) || document.getElementById(
        { guardian: 'tile-gd', cortex: 'tile-cx', idearium: 'tile-idr',
          orchestrator: 'tile-orch', bridge: 'tile-br', diagnostic: 'tile-dg' }[name]);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // RAID decision — always explicit, never hidden
    if (cp.classification) {
      const c = cp.classification;
      const raidEl = document.createElement('div');
      raidEl.style.cssText = 'font-size:10px;opacity:.45;margin-top:6px;font-family:monospace;border-top:1px solid rgba(255,255,255,.07);padding-top:4px';
      const parts = [`RAID → ${c.intent}`];
      if (c.tool) parts.push(`tool:${c.tool}`);
      if (c.confidence) parts.push(`confidence:${(c.confidence * 100).toFixed(0)}%`);
      if (cp.modelUsed) parts.push(`model:${cp.modelUsed}`);
      if (cp.systemState) parts.push(`gaps:${cp.systemState.gapCount} jobs:${cp.systemState.jobCount}`);
      raidEl.textContent = parts.join(' · ');
      out.appendChild(raidEl);
    } else if (cp.modelUsed) {
      const m = document.createElement('div');
      m.style.cssText = 'font-size:10px;opacity:.35;margin-top:4px;font-family:monospace';
      m.textContent = `via ${cp.modelUsed}`;
      out.appendChild(m);
    }
  }

  return { init, send, navigateHistory };
})();
