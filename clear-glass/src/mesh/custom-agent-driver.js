'use strict';

/**
 * clear-glass/src/mesh/custom-agent-driver.js
 *
 * §BUILT 2026-09-19 — James: "hook up agent mesh and cleardriver."
 * options/store.js's registerAgent() persists a picked input+output
 * element pair for an arbitrary site (guardian-picker.js's own
 * commitListener() 'new-agent' pairing flow, already real, already
 * wired end to end on the capture side). That method's own header
 * comment says plainly what was missing: "Actually DISPATCHING a job
 * to a custom agent... is real, separate, non-trivial work — not built
 * here." This file is that work.
 *
 * A custom agent has zero NCP/userscript coverage — it isn't one of
 * Guardian's known providers, it's a site a person pointed a picker at.
 * ClearDriver is therefore not a fast-path ahead of some other real
 * transport for this case, it's the only one. A failure here has no
 * NCP fallback to hand off to; the caller's own retry/queue (agent-
 * mesh.js's existing drain machinery) is the real fallback layer.
 */

const IDLE_MS  = 12000; // matches guardian-picker.js's own mutation-mode idle timer, same real convention
const POLL_MS  = 400;
const ATTACH_TIMEOUT_MS = 8000;

class CustomAgentDriver {
  constructor({ driver, options, sse }) {
    this.driver  = driver;   // ClearDriver instance — required
    this.options = options;  // NexusOptions instance — getAgent()/listAgents()
    this.sse     = sse || { emit: () => {} };
  }

  /**
   * dispatch({ agentRecordId, prompt, timeoutMs }) — real, complete
   * round trip: opens (or reuses) a background tab for the registered
   * agent's site, types the prompt into its picked input element,
   * submits with Enter (the one generic convention every real chat
   * composer honors — a custom agent has no known sendSel the way
   * AGENT_REGISTRY entries do), then watches the picked output element
   * for a real, settled response the same way guardian-picker.js's own
   * mutation-mode listener does (idle-timeout, not a fixed wait).
   */
  async dispatch({ agentRecordId, prompt, timeoutMs = 60000 }) {
    if (!this.driver)  throw new Error('CustomAgentDriver requires a real ClearDriver instance');
    if (!this.options) throw new Error('CustomAgentDriver requires a real options/NexusOptions instance');

    const agent = this.options.getAgent?.(agentRecordId);
    if (!agent) throw new Error(`no registered custom agent: ${agentRecordId}`);
    if (agent.enabled === false) throw new Error(`custom agent "${agent.agentName}" is disabled`);

    const tabAgentId = `custom-${agent.id}`;
    const { openBackgroundTab, getAgentWebContents } = require('../main/index.js');

    try {
      await openBackgroundTab({ agentId: tabAgentId, url: agent.url || agent.origin });
    } catch (err) {
      throw new Error(`could not open a tab for custom agent "${agent.agentName}": ${err.message}`);
    }

    // did-attach-webview fires asynchronously relative to openBackgroundTab's
    // own resolve — give the guest a moment to actually attach before the
    // driver goes looking for it, same honest wait _watchForResponse below
    // already has to do for the response element itself.
    await this._pollUntil(
      () => !!getAgentWebContents(tabAgentId),
      ATTACH_TIMEOUT_MS,
      `webview for custom agent "${agent.agentName}" never attached`
    );

    const inputSel = agent.input.selector;

    try {
      await this.driver.exec({ action: 'click', agentId: tabAgentId, selector: inputSel });
    } catch (err) {
      // Best-effort focus — a composer that's already focused, or one
      // ClearDriver's plain querySelector click can't reach (shadow DOM),
      // still gets a real attempt at typing below rather than aborting here.
      this.sse.emit('custom-agent.focus.warn', { tabAgentId, error: err.message, ts: Date.now() });
    }

    await this.driver.exec({ action: 'type', agentId: tabAgentId, selector: inputSel, text: prompt, clearFirst: true });

    const submitResult = await this.driver.exec({
      action: 'eval', agentId: tabAgentId,
      code: `(function(){
        const el = document.querySelector(${JSON.stringify(inputSel)});
        if (!el) return false;
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        el.dispatchEvent(new KeyboardEvent('keyup',   { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        return true;
      })();`,
    });
    if (!submitResult?.result) {
      throw new Error(`custom agent "${agent.agentName}": input element "${inputSel}" not found at submit time`);
    }

    this.sse.emit('custom-agent.dispatch.submitted', { agentRecordId, tabAgentId, agentName: agent.agentName, ts: Date.now() });

    const text = await this._watchForResponse(tabAgentId, agent.output, timeoutMs, agent.agentName);

    this.sse.emit('custom-agent.dispatch.complete', { agentRecordId, tabAgentId, agentName: agent.agentName, chars: text.length, ts: Date.now() });

    return { text, agentRecordId, agentName: agent.agentName };
  }

  async _pollUntil(check, timeoutMs, failMessage) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (check()) return true;
      await this._sleep(200);
    }
    throw new Error(`${failMessage} within ${timeoutMs}ms`);
  }

  /**
   * _watchForResponse — a real, headless port of guardian-picker.js's
   * own attachListenerDOM 'mutation' mode (attachToElement/onText/idle-
   * timer): a MutationObserver runs inside the guest page (set up once
   * via eval, since nothing here can receive a push event directly from
   * the guest), and this polls its accumulated text back out until it's
   * gone IDLE_MS without changing — the same "settled, not just present"
   * completion signal, not a fixed sleep.
   */
  async _watchForResponse(tabAgentId, output, timeoutMs, agentName) {
    const selector = output.selector;
    const setupResult = await this.driver.exec({
      action: 'eval', agentId: tabAgentId,
      code: `(function() {
        if (window.__cgJobWatch) { try { window.__cgJobWatch.disconnect(); } catch (_) {} }
        const state = { text: '' };
        window.__cgJobState = state;
        function pick() {
          const els = document.querySelectorAll(${JSON.stringify(selector)});
          return els.length ? els[els.length - 1] : null;
        }
        const el = pick();
        if (el) state.text = el.innerText || '';
        const obs = new MutationObserver(() => {
          const latest = pick();
          if (latest) state.text = latest.innerText || '';
        });
        obs.observe(el ? (el.parentElement || el) : document.body, { childList: true, subtree: true, characterData: true });
        window.__cgJobWatch = obs;
        return true;
      })();`,
    });
    if (!setupResult?.result) {
      throw new Error(`custom agent "${agentName}": could not attach response watcher on "${selector}"`);
    }

    let lastText = '';
    let lastChangeAt = Date.now();
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      await this._sleep(POLL_MS);
      let text;
      try {
        const r = await this.driver.exec({
          action: 'eval', agentId: tabAgentId,
          code: '(window.__cgJobState && window.__cgJobState.text) || ""',
        });
        text = r?.result || '';
      } catch (err) {
        // A single failed poll (e.g. tab mid-navigation) isn't fatal —
        // matches ClearDriver's own honest-degrade contract elsewhere;
        // the loop just tries again on the next tick.
        this.sse.emit('custom-agent.watch.poll_error', { tabAgentId, error: err.message, ts: Date.now() });
        continue;
      }
      if (text && text !== lastText) {
        lastText = text;
        lastChangeAt = Date.now();
      } else if (text && (Date.now() - lastChangeAt) >= IDLE_MS) {
        return text; // settled — no change for IDLE_MS, same convention as the picker's own idle timer
      }
    }

    if (lastText) return lastText; // failsafe: a slow-but-real, still-growing response beats throwing on one that's genuinely working
    throw new Error(`custom agent "${agentName}": no response observed on "${selector}" within ${timeoutMs}ms`);
  }

  _sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
}

module.exports = { CustomAgentDriver };
