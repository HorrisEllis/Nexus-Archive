'use strict';

/**
 * tests/modules/mco16d-copilot-tool-parity.test.js
 *
 * §MCO16d 2026-09-13 — James: "full parity: everything I built today,
 * exposed as copilot tools." Real tests for the three new tools:
 * clear_glass_dom_mutate, ncp_clients, raid_submit_contract.
 */

const http = require('http');
const assert = require('assert');

let pass = 0, fail = 0;
async function atest(name, fn) {
  try { await fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}\n    ${e.message}`); }
}

const domMutate = require('../../lib/agent-tools/tools/clear-glass/dom-mutate.js');
const raidSubmit = require('../../lib/agent-tools/tools/raid/submit-contract.js');

async function main() {
  await atest('TOOL-001: clear_glass_dom_mutate refuses a missing providerId', async () => {
    const r = await domMutate.execute({ mutation: { text: 'x' }, cgId: 'cg-1' });
    assert.ok(r.error);
  });

  await atest('TOOL-002: clear_glass_dom_mutate refuses a missing mutation object', async () => {
    const r = await domMutate.execute({ providerId: 'claude', cgId: 'cg-1' });
    assert.ok(r.error);
  });

  await atest('TOOL-003: clear_glass_dom_mutate refuses neither cgId nor selector', async () => {
    const r = await domMutate.execute({ providerId: 'claude', mutation: { text: 'x' } });
    assert.ok(r.error);
  });

  await atest('TOOL-004: raid_submit_contract refuses empty content', async () => {
    const r = await raidSubmit.execute({ content: '   ' });
    assert.ok(r.error);
  });

  await atest('TOOL-005: raid_submit_contract refuses missing content entirely', async () => {
    const r = await raidSubmit.execute({});
    assert.ok(r.error);
  });

  // ── Live integration: clear_glass_dom_mutate against a real fake ClearGlass wire server ──
  await atest('TOOL-006: clear_glass_dom_mutate dispatches a real /dom/mutate POST with the exact body', async () => {
    process.env.WIRE_PORT = '7797';
    delete require.cache[require.resolve('../../lib/agent-tools/tools/clear-glass/dom-mutate.js')];
    const freshDomMutate = require('../../lib/agent-tools/tools/clear-glass/dom-mutate.js');
    let received = null;
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        received = JSON.parse(body);
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true, nodeId: received.cgId }));
      });
    });
    await new Promise(r => server.listen(7797, r));
    try {
      const result = await freshDomMutate.execute({ providerId: 'claude', cgId: 'cg-42', mutation: { text: 'hi' } });
      assert.strictEqual(result.ok, true);
      assert.strictEqual(received.providerId, 'claude');
      assert.strictEqual(received.cgId, 'cg-42');
      assert.strictEqual(received.selector, undefined);
      assert.deepStrictEqual(received.mutation, { text: 'hi' });
    } finally {
      server.close();
    }
  });

  // ── Live integration: ncp_clients against a real fake guardian server ──
  await atest('TOOL-007: ncp_clients hits the real GET /ncp/clients?provider=... with the right query', async () => {
    process.env.GUARDIAN_PORT = '7796';
    delete require.cache[require.resolve('../../lib/agent-tools/tools/ncp/clients.js')];
    const freshNcpClients = require('../../lib/agent-tools/tools/ncp/clients.js');
    let receivedPath = null;
    const server = http.createServer((req, res) => {
      receivedPath = req.url;
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, provider: 'chatgpt', clients: [{ tabId: 't1', claimed: true }], wouldDispatchTo: { ok: true, tabId: 't1' } }));
    });
    await new Promise(r => server.listen(7796, r));
    try {
      const result = await freshNcpClients.execute({ provider: 'chatgpt' });
      assert.strictEqual(receivedPath, '/ncp/clients?provider=chatgpt');
      assert.strictEqual(result.wouldDispatchTo.tabId, 't1');
    } finally {
      server.close();
    }
  });

  // ── Live integration: raid_submit_contract against the REAL cortex boot.js, domSteps included ──
  await atest('TOOL-008: raid_submit_contract reaches the real POST /api/raid/submit, domSteps included end to end', async () => {
    process.env.NEXUS_PORT   = '0';
    process.env.CORTEX_PORT  = '0';
    process.env.JAA_DATA_DIR = '/tmp/mco16d-jaa-' + Date.now();
    process.env.RAID_INPUT_DIR  = '/tmp/mco16d-raid-input-' + Date.now();
    process.env.RAID_OUTPUT_DIR = '/tmp/mco16d-raid-output-' + Date.now();
    const boot = require('../../cortex/boot.js');
    const srv = boot.server;
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    const port = srv.address().port;
    process.env.NEXUS_PORT = String(port); // raid_submit_contract reads this at execute() time

    delete require.cache[require.resolve('../../lib/agent-tools/tools/raid/submit-contract.js')];
    const freshRaidSubmit = require('../../lib/agent-tools/tools/raid/submit-contract.js');

    try {
      const result = await freshRaidSubmit.execute({
        content: 'automate the page', executionSurface: 'browser', forAgent: 'claude',
        domSteps: [{ action: 'query', selector: '#target' }],
      });
      assert.strictEqual(result.ok, true);
      assert.ok(result.queueId);

      // Confirm domSteps genuinely reached the queue row, not silently dropped.
      const { listQueue } = require('../../cortex/core/raid/contract-intake.js');
      const row = listQueue().find(r => r.uuid === result.queueId);
      assert.ok(row, 'submitted contract must be a real, queryable queue row');
      assert.strictEqual(row.executionSurface, 'browser');
      assert.deepStrictEqual(row.contract.domSteps, [{ action: 'query', selector: '#target' }]);
    } finally {
      srv.close();
    }
  });

  console.log(`\n  mco16d-copilot-tool-parity: ${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
}

main();
