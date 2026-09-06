'use strict';
const assert = require('assert');
const http = require('http');
(async () => {
  // Fake target that behaves like copilot's /bridge/deliver — returns the human answer
  const target = http.createServer((req, res) => {
    let b=''; req.on('data',c=>b+=c); req.on('end',()=>{
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ ok:true, text:"Hey! Cortex is healthy — 1 open event, no gaps. What do you want to look at?", modelUsed:'ollama.tools' }));
    });
  });
  await new Promise(r=>target.listen(0,'127.0.0.1',r));
  const port = target.address().port;

  const { createBridgeRouter } = require('../../bridge/router.js');
  const ledger = { write:async()=>{}, update:async()=>{}, get:()=>null };
  const registry = { resolve: async () => ({ ok:true, target:'copilot', entry:{ port }, }) };
  const router = createBridgeRouter({ registry, ledger });

  const { createRequest } = require('../../bridge/types.js');
  const reqObj = createRequest({ type:'copilot.prompt', source:'test', target:'copilot', payload:{ prompt:'status?' }, tags:[] });
  const result = await router.dispatch(reqObj);

  target.close();
  assert.strictEqual(result.ok, true, 'dispatch should succeed');
  assert.ok(result.response, 'result.response must exist — this was the bug (dropped)');
  assert.ok(result.response.text.includes('Cortex is healthy'), 'human answer survives to caller');
  // UI unwrap: data.result?.response ?? data.result ?? data  →  .text
  const uiText = result.response?.text || result.response?.response;
  assert.ok(uiText.includes('Cortex is healthy'), 'UI unwrap resolves real text, not the envelope');
  console.log('  ✓ human answer survives Bridge → UI:', JSON.stringify(uiText.slice(0,44))+'...');
  console.log('\n  bridge-response: PASS\n');
  process.exit(0);
})().catch(e => { console.error('  ✗', e.message); process.exit(1); });
