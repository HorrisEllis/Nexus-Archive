'use strict';
/**
 * tests/modules/test-repo-agent-provider.js — §2026-09-21 chatgpt/gemini/
 * deepseek/… wearing the repo hat. A real http stub on copilot's :3750
 * records the route each dispatch carries (backend/agent — what copilot's
 * /api/prompt reads to call guardian's dispatchToNcpAgent), and answers like
 * a provider would: code, @learn lines, and a placement answer. Writes go
 * through the REAL idearium RepoLayer.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const ROOT = path.resolve(__dirname, '..', '..');
process.env.NEXUS_INJECT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'prov-inject-'));

let pass = 0, fail = 0;
function check(n, c, d = '') { if (c) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? ` — ${d}` : ''}`); } }

async function main() {
  console.log('\ntest-repo-agent-provider\n');
  const RA = require(path.join(ROOT, 'lib', 'repo-agent.js'));
  const RH = require(path.join(ROOT, 'lib', 'repo-hat.js'));
  const RI = require(path.join(ROOT, 'lib', 'repo-inject.js'));
  const MEM = require(path.join(ROOT, 'lib', 'repo-hat-memory.js'));
  const api = await import(path.join(ROOT, 'idearium', 'api', 'index.js'));
  const layer = api.getRepoLayer();

  // ── the provider list is guardian's own userscripts ──
  const onDisk = fs.readdirSync(path.join(ROOT, 'guardian')).map(f => (f.match(/^userscript-([a-z0-9-]+)\.js$/) || [])[1]).filter(n => n && !['memory', 'nexus-wake'].includes(n));
  check('browser providers are exactly guardian\'s userscripts on disk', JSON.stringify(RA.guardianProviders()) === JSON.stringify(onDisk.sort()));
  check('chatgpt, gemini and deepseek are all available', ['chatgpt', 'gemini', 'deepseek'].every(p => RA.providers().includes(p)));
  check('a browser provider routes through guardian', JSON.stringify(RA.routeFor('deepseek')) === JSON.stringify({ backend: 'guardian', agent: 'deepseek' }));
  check('ollama routes through its own backend', RA.routeFor('ollama').backend === 'ollama');
  check('auto leaves routing to copilot', RA.routeFor('auto').backend === null);

  let repoRec = null;
  for (let i = 0; i < 20; i++) {
    repoRec = layer.ingest({ name: `prov-${Date.now()}`, source: 'test', files: [{ path: 'src/a.js', content: 'const a = 1;\n' }] });
    if (!(repoRec && repoRec.error && /no spec-engine/.test(repoRec.error))) break;
    await new Promise(r => setTimeout(r, 250));
  }
  const repo = { ...(repoRec.repo || repoRec), compartmentId: 'cos.test.provider' };
  const U = repo.uuid;
  check('a real repo exists', !!U, JSON.stringify(repoRec).slice(0, 160));
  check('an unknown provider is refused with the list', RA.setProvider(U, 'bard').ok === false);
  // §DEFAULT-GUARDIAN 2026-09-21 — James: "needs to default to guardian".
  // Was 'auto' (copilot's own routing, unobservable from the settings tab);
  // deliberately changed, not silently — a fresh compartment now defaults
  // to a real, named guardian agent, same as any explicitly-set one.
  check('the default is a real guardian agent (chatgpt), not auto', RA.getProvider(U) === 'chatgpt' && RA.defaultProvider() === 'chatgpt');
  check('isGuardianProvider is true for the default, false for auto/ollama', RA.isGuardianProvider(RA.getProvider(U)) === true && !RA.isGuardianProvider('auto') && !RA.isGuardianProvider('ollama'));
  { // settingsView — the one derivation the switch+dropdown API route reads
    const sv = RA.settingsView(U);
    check('settingsView: fresh compartment is guardian-on, agent chatgpt', sv.useGuardian === true && sv.guardianAgent === 'chatgpt');
    RA.setProvider(U, 'ollama');
    const sv2 = RA.settingsView(U);
    check('settingsView: ollama reports guardian-off, agent null', sv2.useGuardian === false && sv2.guardianAgent === null);
    RA.setProvider(U, 'auto');
    const sv3 = RA.settingsView(U);
    check('settingsView: explicit auto reports guardian-on (not ollama), agent null — honest, not invented', sv3.useGuardian === true && sv3.guardianAgent === null);
  }

  const bodies = [];
  let reply = '';
  const srv = await new Promise((res, rej) => {
    const s = http.createServer((q, r) => { let d = ''; q.on('data', c => d += c); q.on('end', () => {
      let b = {}; try { b = JSON.parse(d); } catch (_) {}
      if (q.url === '/api/prompt') bodies.push(b);
      const resolveQ = /Which repo-relative file does it belong in\?/.test(b.prompt || '');
      r.writeHead(200, { 'Content-Type': 'application/json' });
      r.end(JSON.stringify({ ok: true, text: resolveQ ? 'src/helper.js' : reply, provider_used: b.agent || b.backend || 'copilot' }));
    }); });
    s.on('error', rej); s.listen(3750, '127.0.0.1', () => res(s));
  }).catch(e => { console.log(`  ! cannot bind :3750 — ${e.message}`); return null; });
  if (!srv) { process.exitCode = 1; return; }

  try {
    reply = 'plain';
    await RA.dispatch({ repo, repoDir: null, message: 'hi', layer });
    check('auto (explicitly set above) sends no backend/agent — copilot decides', bodies[0].backend === undefined && bodies[0].agent === undefined);

    RA.setProvider(U, RA.defaultProvider());
    bodies.length = 0; reply = 'plain';
    await RA.dispatch({ repo, repoDir: null, message: 'hi', layer });
    check('the default provider (chatgpt) really routes guardian → chatgpt end to end', bodies[0].backend === 'guardian' && bodies[0].agent === 'chatgpt');

    for (const prov of ['chatgpt', 'gemini', 'deepseek']) {
      RA.setProvider(U, prov);
      bodies.length = 0;
      reply = `Done.\n\`\`\`js src/${prov}.js\nexport const who = '${prov}';\n\`\`\`\n\`\`\`js\nexport function helper_${prov}() {}\n\`\`\`\n@learn convention: ${prov} says exports are named, never default`;
      RI.setMode(U, 'auto');
      const r = await RA.dispatch({ repo, repoDir: null, message: `write the ${prov} file`, layer });
      const main = bodies.find(b => !/Which repo-relative file/.test(b.prompt || ''));
      const side = bodies.find(b => /Which repo-relative file/.test(b.prompt || ''));
      check(`${prov}: the dispatch routes guardian → ${prov}`, main && main.backend === 'guardian' && main.agent === prov);
      check(`${prov}: it wears the same hat (persona + protocols reach it)`, main && main.prompt.includes('@learn <fact|convention|pitfall>') && main.prompt.includes('Code you write for this project is written into it'));
      check(`${prov}: its stated-path code is written into the compartment`, r.injects && r.injects.injects.some(i => i.path === `src/${prov}.js` && i.status === 'applied'));
      const rb = layer.readFile(U, `src/${prov}.js`);
      check(`${prov}: the file is really in the repo, exact bytes`, rb && rb.content === `export const who = '${prov}';\n`);
      check(`${prov}: its unlabelled block is placed by asking the SAME provider`, side && side.agent === prov && r.injects.injects.some(i => i.addressedBy === 'agent'));
      check(`${prov}: what it learned is recorded, attributed to the agent`, MEM.list(U).some(o => o.text.includes(`${prov} says exports are named`) && o.source === 'agent'));
      check(`${prov}: the reply says which provider answered`, r.providerUsed === prov && r.provider === prov);
    }

    RA.setProvider(U, 'gemini'); bodies.length = 0; reply = 'x';
    await RA.dispatch({ repo, repoDir: null, message: 'q', provider: 'deepseek', layer });
    check('an explicit provider on one message beats the stored choice', bodies[0].agent === 'deepseek');
    bodies.length = 0;
    await RA.dispatch({ repo, repoDir: null, message: 'q', layer });
    check('…and the stored choice still holds afterwards', bodies[0].agent === 'gemini');
    const SRC = fs.readFileSync(path.join(ROOT, 'lib', 'repo-agent.js'), 'utf8');
    check('a browser provider gets a longer wait than 90s', /backend === 'guardian' && timeoutMs === DEFAULT_TIMEOUT_MS\) timeoutMs = 300000/.test(SRC));
  } finally {
    RI.setMode(U, 'review');
    try { RH.revokeRepoHat(U); } catch (_) {}
    MEM.clear(U); RA.clearHistory(U); srv.close();
  }

  const APP = fs.readFileSync(path.join(ROOT, 'idearium', 'ui', 'js', 'app.js'), 'utf8');
  // §DEFAULT-GUARDIAN 2026-09-21 — the flat <select id="agent-provider"> is
  // now a switch (guardian on/off) + a guardian-agent dropdown.
  check('the Agent tab offers a guardian switch', APP.includes('id="agent-use-guardian"') && APP.includes('agentSetUseGuardian(this.checked)'));
  check('the Agent tab offers a guardian-agent dropdown', APP.includes('id="agent-guardian-agent"') && APP.includes('agentSetGuardianAgent(this.value)'));
  check('the CLI has /provider, documented in /help', APP.includes("case 'provider':") && APP.includes("'/provider [name]"));

  fs.rmSync(process.env.NEXUS_INJECT_DIR, { recursive: true, force: true });
  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  process.exitCode = fail === 0 ? 0 : 1;
  setTimeout(() => process.exit(process.exitCode), 300);
}
setTimeout(() => main().catch(e => { console.log('  ! crashed:', e.stack); process.exit(1); }), 2500);
