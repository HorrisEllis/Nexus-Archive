'use strict';
/**
 * tests/modules/test-context-atlas.test.js — 0.39.259: every memory system and graph, one door, for Idearium's agents.
 *
 * Real: lib/context-atlas.js over a sandboxed JAA store holding rows in the real table names real modules write
 * (chat_log, fix_map, repo_hat_memory, event_log …), a real graph.json on disk, the real prompt blocks and compose(),
 * repo-agent memoryFor(), copilot-context's L7/L8 layers against a stub Clear Glass on a real port.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');

let passed = 0, failed = 0;
async function t(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.stack || e.message}`); failed++; }
}

const jaa = require('../../cortex/memory/jaa-db.js').jaaDB;
const A = require('../../lib/context-atlas.js');
const PB = require('../../lib/repo-prompt-blocks.js');

async function run() {
  console.log('context atlas (0.39.259)');
  const REPO = 'repo-atlas-test-uuid';
  jaa.insert('chat_log', { id: 'c1', role: 'user', content: 'The Guardian userscript tab claim race happens when two jobs start at once', ts: Date.now() - 5000 });
  jaa.insert('fix_map', { id: 'f1', failure: 'tab claim race in guardian userscript', fix: 'one-job-per-tab pool releases on guardian.job.complete', ts: Date.now() });
  jaa.insert('repo_hat_memory', { uuid: 'm1', repoUuid: REPO, kind: 'pitfall', text: 'The sequencer clock drifts unless precision-clock.worklet owns the tick', ts: Date.now() });
  jaa.insert('repo_hat_memory', { uuid: 'm2', repoUuid: 'other-repo', kind: 'fact', text: 'sequencer in the other project uses setInterval', ts: Date.now() });
  jaa.insert('event_log', { id: 'e1', type: 'sequencer.tick', note: 'sequencer clock', ts: Date.now() });
  const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-repo-'));
  fs.writeFileSync(path.join(repoDir, 'graph.json'), JSON.stringify({ nodes: [
    { kind: 'file', file: 'runtime/precision-clock.js' }, { kind: 'file', file: 'organisms/sequencer/sequencer.engine.js' }, { kind: 'file', file: 'runtime/master-transport.js' },
  ], edges: [
    { relation: 'imports', from: 'file:organisms/sequencer/sequencer.engine.js', to: 'file:runtime/precision-clock.js' },
    { relation: 'imports', from: 'file:runtime/master-transport.js', to: 'file:runtime/precision-clock.js' },
  ] }));

  await t('CA-001', 'directory: every table with rows + what it is + which tool reads it; noisy telemetry marked not-default', () => {
    const d = A.directory();
    const chat = d.tables.find(x => x.table === 'chat_log');
    assert.ok(chat && chat.rows >= 1 && /every AI exchange/.test(chat.what) && chat.tool === 'agent_chat_search');
    assert.strictEqual(d.tables.find(x => x.table === 'event_log').searchedByDefault, false);
    assert.ok(d.sources.find(s => s.source === 'repo-graph') && d.sources.find(s => s.source === 'changelog'));
  });

  await t('CA-002', 'search: one query finds the chat, the fix and the changelog/spec prose; every hit cites source + id', async () => {
    const r = await A.search('guardian tab claim race', { limit: 20 });
    assert.strictEqual(r.ok, true);
    const srcs = r.hits.map(h => h.source);
    assert.ok(srcs.includes('jaa:chat_log') && srcs.includes('jaa:fix_map'), srcs.join(','));
    assert.ok(r.hits.every(h => h.source && h.id), 'every hit has source and id');
    assert.ok(r.skipped.includes('jaa:event_log'), 'telemetry skipped, and named as skipped');
  });

  await t('CA-003', 'search: repo-scoped — this repo\'s learned memory and import graph; another repo\'s memory is not included', async () => {
    const r = await A.search('sequencer clock', { repoDir, repoUuid: REPO, limit: 20 });
    const mem = r.hits.filter(h => h.source === 'jaa:repo_hat_memory').map(h => h.id);
    assert.deepStrictEqual(mem, ['m1']);
    const g = r.hits.find(h => h.source === 'repo-graph' && /sequencer\.engine\.js imports runtime\/precision-clock\.js/.test(h.snippet));
    assert.ok(g, 'graph hit names the import edge');
  });

  await t('CA-004', 'search: naming a noisy table opts it in; get returns the whole row; a spec path returns its text', async () => {
    const r = await A.search('sequencer clock', { sources: ['jaa:event_log'] });
    assert.deepStrictEqual(r.hits.map(h => h.id), ['e1']);
    assert.strictEqual(A.get('jaa:fix_map', 'f1').row.fix, 'one-job-per-tab pool releases on guardian.job.complete');
    const s = await A.search('clear glass screen-qa detector', { sources: ['spec'] });
    const one = s.hits[0];
    assert.ok(one && A.get(one.source, one.id).text.length > 100);
    assert.strictEqual(A.get('spec', '../../etc/passwd').ok, false);
  });

  await t('CA-005', 'prompt blocks: {memory} and {directory} are editable blocks; empty data sends nothing; the pre-0.39.259 render is unchanged', () => {
    assert.deepStrictEqual(PB.PLACEHOLDERS['context-memory'], ['{memory}']);
    const old = PB.render({ persona: 'P', message: 'hi', backend: 'guardian', context: { kind: 'map', block: '- m' } });
    assert.deepStrictEqual(old.used, ['persona', 'learn', 'inject', 'tool-syntax', 'tool-guide', 'context-map', 'question']);
    const withMem = PB.render({ persona: 'P', message: 'hi', backend: 'ollama', memory: '- [jaa:fix_map f1] X', directory: 'Memory you can search' });
    assert.ok(withMem.used.includes('context-memory') && withMem.used.includes('context-directory'));
    assert.match(withMem.text, /## What NEXUS remembers that matches your question[\s\S]*- \[jaa:fix_map f1\] X/);
    const noTools = PB.render({ persona: 'P', message: 'hi', backend: null, memory: 'M', directory: 'D' });
    assert.ok(!noTools.used.includes('context-directory'), 'directory points at a tool, so only with tools');
  });

  await t('CA-006', 'repo agent: memoryFor fills {memory} from the atlas for this repo; a block switched off costs no search', async () => {
    const RA = require('../../lib/repo-agent.js');
    const on = PB.DEFAULT_BLOCKS;
    const m = await RA.memoryFor({ repo: { uuid: REPO }, repoDir, message: 'why does the sequencer clock drift', blocks: on, backend: 'guardian' });
    assert.match(m.memory, /jaa:repo_hat_memory m1/);
    assert.match(m.directory, /nexus\.context\.tool/);
    const off = await RA.memoryFor({ repo: { uuid: REPO }, repoDir, message: 'x', blocks: on.map(b => ({ ...b, enabled: false })), backend: 'guardian' });
    assert.deepStrictEqual([off.memory, off.directory, off.info], ['', '', null]);
    const text = RA.compose({ hat: { personaPrompt: 'I am the sequencer project agent.' }, message: 'why drift?', blocks: on, backend: 'guardian', memory: m.memory, directory: m.directory });
    assert.ok(text.indexOf('What NEXUS remembers') < text.indexOf('why drift?'), 'memory precedes the question');
  });

  await t('CA-007', 'scope: nexus.context.tool is in every repo agent\'s scope, including hats forged before it existed', () => {
    const RA = require('../../lib/repo-agent.js');
    const u = 'scope-test-' + Date.now();
    RA.setToolScope(u, 'project');
    const s = RA.scopeFor(u, { toolScope: ['read_file'] });
    assert.deepStrictEqual(s, ['read_file', 'nexus.context.tool']);
    assert.ok(require('../../lib/repo-hat.js').REPO_TOOL_SCOPE.includes('nexus.context.tool'));
  });

  await t('CA-008', 'the tool: repo agent run context scopes it automatically (repoDir + repoUuid)', async () => {
    const tool = require('../../lib/agent-tools/tools/query/context-atlas.js');
    assert.strictEqual(tool.name, 'nexus.context.tool');
    const r = await tool.execute({ action: 'search', query: 'sequencer clock' }, { context: { repoDir, repoUuid: REPO } });
    assert.ok(r.hits.find(h => h.source === 'repo-graph'));
    assert.ok(!r.hits.find(h => h.id === 'm2'));
  });

  await t('CA-009', 'copilot context: L7 reads Clear Glass /cli/state; L8 reads the opportunity pipeline; Clear Glass down is said, not blank', async () => {
    const srv = http.createServer((q, s) => s.end(JSON.stringify({ ok: true, agents: [{ agentId: 'opp-1', url: 'https://jobs.acme.test/apply', title: 'Apply', background: true }], providers: [{ id: 'claude', hosted: true }], accounts: [], autofillProfiles: [{ id: 'p', name: 'Default' }], macros: ['m1'], blind: [] })));
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    process.env.CLEARGL_IPC_URL = `http://127.0.0.1:${srv.address().port}`;
    delete require.cache[require.resolve('../../copilot/lib/copilot-context.js')];
    const cc = require('../../copilot/lib/copilot-context.js');
    const snap = await cc.assemble({ layers: [7, 8], timeoutMs: 4000 });
    assert.match(snap.text, /=== L7 — Clear Glass Browser ===[\s\S]*opp-1 \[bg\] — Apply https:\/\/jobs\.acme\.test\/apply/);
    assert.match(snap.text, /autofill profiles: Default/);
    assert.match(snap.text, /=== L8 — Opportunities ===/);
    srv.close();
    process.env.CLEARGL_IPC_URL = 'http://127.0.0.1:1';
    delete require.cache[require.resolve('../../copilot/lib/copilot-context.js')];
    const down = await require('../../copilot/lib/copilot-context.js').assemble({ layers: [7], timeoutMs: 4000 });
    assert.match(down.text, /Clear Glass: not reachable on :7702/);
  });

  await t('CA-010', 'seed additions: an installed Clear Glass operator hat gains the new tools once; a tool James removes is not put back', () => {
    const hf = require('../../lib/hat-forge.js');
    const seed = require('../../lib/hat-seed.js');
    const def = seed.SEED_HATS.find(h => h.seedKey === 'the_clearglass_operator');
    const oldScope = def.toolScope.filter(x => !['clearglass.browser.tool', 'nexus.context.tool', 'nexus.opportunity.tool'].includes(x));
    if (!hf.bySeedKey('the_clearglass_operator')) {
      const r = hf.forge({ ...def, toolScope: oldScope });   // an install from before 0.39.259
      assert.ok(r.ok, JSON.stringify(r.errors));
    }
    const known = new Map([...def.toolScope].map(n => [n, {}]));
    const quiet = () => {};
    seed.seedHats({ knownTools: known, log: quiet });
    let h = hf.bySeedKey('the_clearglass_operator');
    assert.ok(['clearglass.browser.tool', 'nexus.context.tool', 'nexus.opportunity.tool'].every(x => h.toolScope.includes(x)), h.toolScope.join(','));
    hf.update(h.uuid || h.name, { toolScope: h.toolScope.filter(x => x !== 'nexus.opportunity.tool') });   // James removes one
    seed.seedHats({ knownTools: known, log: quiet });
    h = hf.bySeedKey('the_clearglass_operator');
    assert.ok(!h.toolScope.includes('nexus.opportunity.tool'), 'a removed tool stays removed');
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
run();
