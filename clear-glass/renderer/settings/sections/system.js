'use strict';
/**
 * renderer/settings/sections/system.js — Connections, Co-pilot, Diagnostics
 * §BUILT 2026-09-23. Connections + co-pilot: src/api/settings.js (ApiSettings,
 * the same file-backed store the old page used — not a second config
 * mechanism). The fallback key is write-only from here: getPublic() never
 * returns it, only hasFallbackKey. Diagnostics: errors:recent, vault key
 * status, the live /contract, speech availability.
 */
(function () {
  const { cg, h, call, toast, busy, field, pane, row, btn, chip, toggle, select, section } = window.CGS;

  const NEXUS_PORTS = [['orchestratorPort', 'Orchestrator', 9000], ['cortexPort', 'Cortex', 3748], ['guardianPort', 'Guardian', 7820], ['copilotPort', 'Co-pilot', 3750], ['ollamaPort', 'Ollama bridge', 3749], ['idearium', 'Idearium', 4800]];
  const CG_PORTS = [['ssePort', 'Event stream', 7701], ['ipcPort', 'Command server', 7702], ['tlsPort', 'TLS proxy (JA4)', 7703]];

  async function probe(port) {
    const t0 = performance.now();
    try { const r = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(2500) }); return { ok: r.ok, ms: Math.round(performance.now() - t0), status: r.status }; }
    catch (e) { return { ok: false, ms: null, status: e.name === 'TimeoutError' ? 'timeout' : 'unreachable' }; }
  }

  section({
    id: 'connections', group: 'System', icon: '\u2301', label: 'Connections',
    keywords: 'ports health probe orchestrator cortex guardian copilot ollama idearium sse ipc tls wire',
    blurb: 'Where Clear Glass finds the rest of NEXUS. Port changes take effect after a restart.',
    async render() {
      const s = await call(() => cg.api.get(), 'settings');
      const inputs = {};
      const statusCells = {};
      const mk = ([k, l, d]) => { inputs[k] = h('input', { type: 'number', class: 'mono', min: 1, max: 65535, value: s[k] || d }); statusCells[k] = h('span'); return field(l, h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } }, inputs[k], statusCells[k])); };
      const probeAll = async () => {
        await Promise.all([...NEXUS_PORTS, ...CG_PORTS.filter(p => p[0] === 'ipcPort')].map(async ([k]) => {
          statusCells[k].replaceChildren(chip('\u2026', 'plain'));
          const r = await probe(parseInt(inputs[k].value, 10));
          statusCells[k].replaceChildren(chip(r.ok ? `${r.ms} ms` : String(r.status), r.ok ? 'ok' : 'bad'));
        }));
      };
      const saveBtn = btn('Save ports', (e) => busy(e.currentTarget, async () => {
        const patch = {};
        for (const [k] of [...NEXUS_PORTS, ...CG_PORTS]) {
          const v = parseInt(inputs[k].value, 10);
          if (!(v > 0 && v < 65536)) throw new Error(`${k}: ${inputs[k].value} isn\u2019t a port number.`);
          patch[k] = v;
        }
        await call(() => cg.api.set(patch), 'save'); toast('Ports saved — restart Clear Glass to apply');
      }), 'primary');
      setTimeout(probeAll, 0);
      return [
        pane({ title: 'NEXUS services', tools: btn('Check again', probeAll, 'sm'), body: h('div', { class: 'grid' }, NEXUS_PORTS.map(mk)) }),
        pane({ title: 'Clear Glass', sub: `Wire server (mesh, automation, Erosmancer proxy): ${window.CGS.WIRE_PORT}`, body: h('div', { class: 'grid' }, CG_PORTS.map(mk)) }),
        h('div', {}, saveBtn),
      ];
    },
  });

  section({
    id: 'copilot', group: 'System', icon: '\u2726', label: 'Co-pilot',
    keywords: 'copilot raid routing channel fallback api key model offline',
    blurb: 'Co-pilot runs through NEXUS: Ollama first, then Guardian\u2019s provider tabs. The fallback key is only for when NEXUS itself is down.',
    async render({ rerender }) {
      const s = await call(() => cg.api.get(), 'settings');
      const save = (patch, msg) => call(() => cg.api.set(patch), 'save').then(() => msg && toast(msg));
      const channel = h('input', { type: 'text', value: s.copilotChannel || 'clear-glass' });
      channel.addEventListener('change', () => save({ copilotChannel: channel.value.trim() || 'clear-glass' }, 'Channel saved').catch(e => toast(e.message, 'bad')));
      const key = h('input', { type: 'password', autocomplete: 'off', placeholder: s.hasFallbackKey ? 'A key is saved \u2014 type to replace it' : 'sk-ant-\u2026' });
      const model = select(['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5-20251001'], s.fallbackModel || 'claude-sonnet-4-6');
      model.addEventListener('change', () => save({ fallbackModel: model.value }, 'Model saved').catch(e => toast(e.message, 'bad')));
      return [
        pane({ title: 'Routing', flush: true, body: [
          row('Route through NEXUS co-pilot', 'Dual cognition, 7-layer context and every NEXUS tool. Off means fallback-only.', toggle(s.useCortex !== false, (on) => save({ useCortex: on }))),
          row('RAID routing', 'Picks the provider by task type and health.', toggle(s.raidEnabled !== false, (on) => save({ raidEnabled: on }))),
        ] }),
        pane({ title: 'Session', body: h('div', { class: 'grid' }, field('Co-pilot channel', channel)) }),
        pane({ title: 'Offline fallback', sub: s.hasFallbackKey ? 'A key is saved.' : 'No key saved \u2014 fallback is off.', body: [
          h('div', { class: 'grid' }, field('Anthropic API key', key), field('Model', model)),
          h('div', { style: { marginTop: '10px', display: 'flex', gap: '8px' } },
            btn('Save key', (e) => busy(e.currentTarget, async () => { if (!key.value.trim()) throw new Error('Paste a key first.'); await save({ fallbackApiKey: key.value.trim() }); toast('Fallback key saved'); rerender(); }), 'primary'),
            s.hasFallbackKey ? btn('Remove key', (e) => busy(e.currentTarget, async () => { await save({ fallbackApiKey: '' }); toast('Fallback key removed'); rerender(); }), 'danger') : null),
        ] }),
      ];
    },
  });

  section({
    id: 'diagnostics', group: 'System', icon: '\u2695', label: 'Diagnostics',
    keywords: 'errors log contract components vault key speech health debug',
    blurb: 'What\u2019s gone wrong recently and what Clear Glass says it can do.',
    async render({ rerender }) {
      const [errs, vault, speech, s] = await Promise.all([cg.errors.recent(40).catch(e => ({ ok: false, error: e.message })), cg.vault.status().catch(() => ({})), cg.speech.available().catch(() => null), cg.api.get().catch(() => ({}))]);
      let contract = null;
      try { contract = await (await fetch(`http://127.0.0.1:${s.ipcPort || 7702}/contract`, { signal: AbortSignal.timeout(2500) })).json(); } catch (e) { contract = { error: e.message }; }
      const errors = (errs && errs.errors) || [];
      const keyChip = (k) => chip(k && k.source === 'safeStorage' ? 'OS keychain' : 'legacy key', k && k.source === 'safeStorage' ? 'ok' : 'warn');
      return [
        pane({ title: 'Recent errors', tools: btn('Refresh', rerender, 'sm'), body: errs.ok === false ? h('div', { class: 'err-box', text: errs.error })
          : errors.length ? h('pre', { class: 'out', text: errors.slice().reverse().map(e => `${e.ts ? new Date(e.ts).toLocaleTimeString() : ''} [${e.source || '?'}] ${e.type || ''} ${e.message || JSON.stringify(e)}${e.count > 1 ? ` \u00D7${e.count}` : ''}`).join('\n') })
          : h('p', { class: 'blurb', text: 'No errors recorded this session.' }) }),
        pane({ title: 'Vaults', flush: true, body: [row('Cookie vault', (vault.cookies && vault.cookies.reason) || 'Saved sessions for every account', keyChip(vault.cookies)), row('Password vault', (vault.passwords && vault.passwords.reason) || 'Saved sign-ins', keyChip(vault.passwords))] }),
        pane({ title: 'Capabilities', sub: contract.error ? contract.error : `v${contract.version} \u00B7 ${(contract.components || []).length} components`, body: contract.error ? null : h('pre', { class: 'out', text: (contract.components || []).map(c => `${c.id.padEnd(34)} ${c.route.method.padEnd(5)} ${c.route.path}`).join('\n') }) }),
        pane({ title: 'Speech to text', body: h('p', { class: 'blurb', text: speech ? JSON.stringify(speech) : 'Unavailable.' }) }),
      ];
    },
  });
})();
