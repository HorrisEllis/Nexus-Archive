'use strict';
/**
 * tests/modules/test-detector-code-mode.test.js — 0.39.285 DC (idearium: a correct file failed verification every time)
 *
 * James's "webrtc pipeline" spec: chunk src-kernel-state-js stalled with "exceeded outer wall-clock attempt cap", the
 * build-queue retried it every 10 minutes, and the Files tab stayed empty. Cause (measured, not assumed): the Detector
 * graded a source FILE as PROSE — it must end in sentence punctuation, be 40% as long as the prompt (which carries the
 * whole system state), and contain the fences WARP had already stripped. A clean 405-char state.js scored composite
 * 0.65, TRUNCATED:mid_sentence_end, on every attempt.
 *
 *   DC-0x  Detector.profile/evaluate in code mode: real files pass, real defects fail — with the real parse error
 *   DC-1x  QueueCompartment: a file's retry prompt says what was wrong and never asks for `SEAM VERDICT`
 *   DC-2x  dispatchChunkWithVerification end to end (only the agent is faked): pass, recover, escalate honestly
 *   DC-3x  prose is untouched — guardian and every non-file chunk keep the old grading
 */
require('../../lib/test-sandbox.js').ensure();
const fs = require('fs');
const os = require('os');
const path = require('path');

let pass = 0, fail = 0;
function check(n, c, d = '') { if (c) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? ` — ${d}` : ''}`); } }

const { Detector: D } = require('../../lib/seam/detector.js');
const { QueueCompartment } = require('../../lib/seam/queue.js');

// What idearium really sends: the file request with system state and the file tree in front of it, fenced example and all.
const PROMPT = 'Write the complete file `src/kernel/state.js` for the project "webrtc pipeline".\n\nSYSTEM STATE:\n' +
  'service cortex :3748 online\n'.repeat(120) + '\nTHE FILE TREE:\n- src/kernel/state.js [kernel]\n' +
  '\n```js\n// example\n```\n' + 'Build `createState` and `STATES`. Output ONLY the file in one fenced code block.';

const CJS = `'use strict';
const STATES = Object.freeze({ IDLE: 'idle', ACTIVE: 'active' });
function createState(initial = STATES.IDLE) {
  let current = initial;
  return {
    get: () => current,
    set(next) {
      if (!Object.values(STATES).includes(next)) throw new Error('bad state: ' + next);
      current = next;
      return current;
    },
  };
}
module.exports = { STATES, createState };`;
const ESM = `export const STATES = Object.freeze({ IDLE: 'idle' });\nexport function createState() { return { s: STATES.IDLE }; }\n`;
const CUT = `function createState() {\n  return {\n    get() {\n      return 1;`;
const fence = (c, lang = 'js') => '```' + lang + '\n' + c + '\n```';

const P = ext => D.profile(PROMPT, { mode: 'code', ext });
const ev = (r, ext = '.js') => D.evaluate(r, PROMPT, P(ext), []);

// ── DC-0x the Detector ─────────────────────────────────────────────────────────
{
  // the defect, pinned: same file, prose grading — this is what stalled the chunk
  const prose = D.evaluate(CJS, PROMPT, D.profile(PROMPT), []);
  check('DC-00 (the defect) prose grading rejects a correct file', prose.passed === false && prose.truncation.reason === 'mid_sentence_end', prose.summary);

  check('DC-01 code mode passes a correct CommonJS file', ev(CJS).passed === true, ev(CJS).summary);
  check('DC-02 code mode passes a correct ES-module file in a .js chunk', ev(ESM).passed === true, ev(ESM).summary);
  check('DC-03 code mode passes a .mjs file and a .json file', ev(ESM, '.mjs').passed && ev('{"a":[1,2,{"b":null}]}', '.json').passed);
  check('DC-04 a fenced reply is judged by the code inside the fence', ev(fence(CJS)).passed === true);
  check('DC-05 prose around the fence does not fail a good file', ev('Here is the file:\n\n' + fence(CJS) + '\n\nLet me know if you want changes.').passed === true);
  check('DC-06 a tiny valid file is not "too short"', ev('module.exports = {};').passed === true);

  const cut = ev(CUT);
  check('DC-10 a file cut off mid-way fails as truncation', cut.passed === false && cut.truncation.truncated && cut.truncation.reason === 'syntax_ended_early', cut.summary);
  check('DC-11 a syntax error fails and reports the real message and line', (() => { const e = ev('const x = ;\nmodule.exports = x;'); return !e.passed && e.syntax.ok === false && /Unexpected token/.test(e.syntax.message) && e.syntax.line === 1; })());
  const unclosed = ev('```js\n' + CJS);
  check('DC-12 a fence that never closes fails as truncation', !unclosed.passed && unclosed.truncation.reason === 'unclosed_fence', unclosed.summary);
  check('DC-13 an empty reply fails', ev('').passed === false && ev('   \n ').passed === false);
  const refuse = ev("I'm sorry, I can't help with that request at this time, please try again later.");
  check('DC-14 a refusal in place of the file fails even though its weighted score is under the threshold', !refuse.passed && refuse.composite < 0.35 && refuse.sigma.deviating, refuse.summary);
  check('DC-15 invalid JSON fails', ev('{"a": 1,', '.json').passed === false);
  check('DC-16 prose that is not code fails in a .js chunk', ev('This file defines the state kernel. It exports createState and STATES for the engine layer to use.').passed === false);

  const py = ev('def create_state():\n    return {"state": "idle"}\n', '.py');
  check('DC-20 a language with no checker passes on the cheap checks and says the syntax was not checked', py.passed === true && py.syntax.checked === false, py.summary);
  check('DC-21 …but an empty or unclosed reply still fails there', !ev('', '.py').passed && !ev('```py\ndef f():\n    pass', '.py').passed);
  check('DC-22 no extension given → cheap checks only, never a false syntax failure', (() => { const e = D.evaluate(CJS, PROMPT, D.profile(PROMPT, { mode: 'code' }), []); return e.passed && e.syntax.checked === false; })());

  // the parse checker leaves nothing behind
  const leftovers = fs.readdirSync(os.tmpdir()).filter(n => n.startsWith('nexus-detector-')).flatMap(d => { try { return fs.readdirSync(path.join(os.tmpdir(), d)); } catch (_) { return []; } });
  check('DC-23 the syntax checker leaves no temp files behind', leftovers.length === 0, leftovers.join(','));
}

// ── DC-1x the queue compartment ───────────────────────────────────────────────
{
  const jaa = { insert: r => r, update: r => r };
  const mk = mode => new QueueCompartment({ queueId: 'q', chunkIdx: 0, chunkTitle: 't', chunkContent: PROMPT, builtPrompt: PROMPT, provider: 'ollama', jaa, mode, ext: '.js' });
  const c = mk('code');
  check('DC-30 the compartment profiles as code when asked', c.profile.mode === 'code' && c.profile.ext === '.js');
  check('DC-31 …and as prose by default', mk(undefined).profile.mode === 'prose');
  check('DC-32 maxAttempts covers the whole ladder: first try + 9 content retries + 3 watchdog retries', c.maxAttempts() === 13, String(c.maxAttempts()));

  // fail it three times so each strategy gets to write a retry prompt
  const seen = [];
  for (let i = 0; i < 9; i++) {
    c.inject(`j${i}`); c.generating();
    c.detecting(CUT);
    const r = c.evaluate();
    if (c.state === 'RETRYING') seen.push(c.buildRetryPrompt());
    if (r.passed || c.state === 'ESCALATED') break;
  }
  check('DC-33 a file\'s retry prompt is built for every strategy', seen.length === 8, String(seen.length));
  check('DC-34 …says what was wrong and shows the END of the reply', seen.every(p => /stops mid-way|does not parse/.test(p) && p.includes('return 1;')));
  check('DC-35 …resends the original prompt whole (never "first half of the chunk")', seen.every(p => p.includes(PROMPT)) && !seen.some(p => /REDUCED SCOPE/.test(p)));
  check('DC-36 …and never asks a file to end with "SEAM VERDICT" (a syntax error at the end of source)', !seen.some(p => /SEAM VERDICT/.test(p)));
  check('DC-37 the ladder still ends in ESCALATED with the real verdict recorded', c.state === 'ESCALATED' && /SYNTAX|TRUNCATED/.test(c.detection.summary), c.state + ' ' + (c.detection && c.detection.summary));
}

// ── DC-2x end to end through the real dispatcher (only the agent is faked) ────
(async () => {
  const { dispatchChunkWithVerification } = await import('../../idearium/spec-engine/chunk-dispatch.js');
  const chunk = { chunkIdx: 0, chunkTitle: 'src-kernel-state-js', sectionId: 'src-kernel-state-js' };
  const base = { preferAgent: 'chatgpt', expectCode: true, fileName: 'src/kernel/state.js', specUuid: 'dc-test' };
  const scripted = replies => { const calls = []; const fn = async prompt => { calls.push(prompt); const t = replies[Math.min(calls.length - 1, replies.length - 1)]; return { ok: true, text: t, agent: 'chatgpt' }; }; fn.calls = calls; return fn; };

  let fn = scripted([CJS]);
  let r = await dispatchChunkWithVerification(PROMPT, chunk, fn, base);
  check('DC-40 a correct file is accepted on the first attempt', r.ok === true && r.attempts === 1 && r.text === CJS, JSON.stringify({ ok: r.ok, a: r.attempts, e: r.error }));

  fn = scripted([CUT, CJS]);
  r = await dispatchChunkWithVerification(PROMPT, chunk, fn, base);
  check('DC-41 a cut-off first reply is retried and the second, complete one is accepted', r.ok && r.attempts === 2 && r.text === CJS, JSON.stringify({ ok: r.ok, a: r.attempts, e: r.error }));
  check('DC-42 …the second attempt was told why the first failed', /stops mid-way|does not parse/.test(fn.calls[1] || '') && (fn.calls[1] || '').includes(PROMPT));

  fn = scripted([fence(CJS)]);
  r = await dispatchChunkWithVerification(PROMPT, chunk, fn, base);
  check('DC-43 a fenced reply comes back as the bare file (the fence is not written into it)', r.ok && r.text === CJS, JSON.stringify(r.text && r.text.slice(0, 40)));

  fn = scripted(['const x = ;']);
  r = await dispatchChunkWithVerification(PROMPT, chunk, fn, base);
  check('DC-44 a file that never parses runs the whole ladder (9 attempts), not 6', r.ok === false && r.escalated && r.attempts === 9 && fn.calls.length === 9, JSON.stringify({ a: r.attempts, calls: fn.calls.length }));
  check('DC-45 …and fails with the real reason, not "exceeded outer wall-clock attempt cap"', /SYNTAX:Unexpected token/.test(r.error || '') && !/wall-clock/.test(r.error || ''), r.error);

  fn = scripted([CJS]);
  r = await dispatchChunkWithVerification(PROMPT, chunk, fn, { ...base, expectCode: false, fileName: null });
  check('DC-30b without expectCode the same reply is still graded as prose (unchanged path)', r.ok === false, JSON.stringify({ ok: r.ok, e: r.error }));

  const section = 'The purpose of this component is to hold the kernel state of the pipeline. It exposes a small API that the engine layer calls, and it never performs any I/O of its own. '.repeat(6);
  fn = scripted([section]);
  r = await dispatchChunkWithVerification('Write the purpose section for the kernel state component of the pipeline.', chunk, fn, { preferAgent: 'chatgpt', specUuid: 'dc-test' });
  check('DC-31b a prose section chunk is graded exactly as before and passes', r.ok === true && r.attempts === 1, JSON.stringify({ ok: r.ok, e: r.error }));

  console.log(`\n  detector-code-mode: ${pass} passed, ${fail} failed\n`);
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
