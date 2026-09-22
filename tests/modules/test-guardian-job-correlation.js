'use strict';
/**
 * tests/modules/test-guardian-job-correlation.js
 * §2026-09-22 — James, from a real run: "injected, didn't recieve back... then
 * did it again, still open ui, no response. also it used the first response
 * from the first job for the second attempt." Plus: it only worked with the
 * Clear Glass render open, and chat URLs were not logged consistently.
 *
 * The stale-reply logic is exercised for real: startWatch/checkStable is
 * extracted VERBATIM from each userscript and run against a fake DOM that
 * behaves the way a provider tab does — the previous answer already on screen,
 * stable, with nothing generating.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const PROVIDERS = ['chatgpt', 'claude', 'gemini', 'deepseek', 'perplexity'];

let pass = 0, fail = 0;
function check(n, c, d = '') { if (c) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? ` — ${d}` : ''}`); } }

function extractFn(src, name) {
  const start = src.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`${name} not found`);
  let depth = 0, i = src.indexOf('{', start);
  for (; i < src.length; i++) { if (src[i] === '{') depth++; else if (src[i] === '}' && --depth === 0) break; }
  return src.slice(start, i + 1);
}

/**
 * Runs the REAL startWatch against a scripted tab.
 *
 * §AN1 2026-09-22 — startWatch no longer calls findResponseEl() to decide
 * completion; it calls _anchorMessageEls() (the full, ordered message list)
 * once to capture a starting length, then latches whichever node the list
 * grows into at that index. The fake tab is modeled the same way: a growing
 * `messages` array, not a single mutable element.
 *
 * reply: null = the tab never answers (the previous answer just sits there);
 *        string = a new message node is appended after `afterMs`.
 * extra/extraAfterMs: an unrelated further append (e.g. a stray third node),
 *        to prove the anchor doesn't move once latched.
 * detachAfterMs: if set, the reply node's isConnected flips false this many
 *        ms after it appears, to exercise the detached-anchor failure path.
 */
function runWatch(src, {
  previous, reply = null, afterMs = 1700, noReplyMs = 6000, giveUpMs = 14000,
  extra = null, extraAfterMs = null, detachAfterMs = null,
}) {
  return new Promise((resolve) => {
    const sent = [];
    let messages = [{ innerText: previous, isConnected: true }]; // PREVIOUS answer, already rendered
    let replyNode = null;
    if (reply !== null) setTimeout(() => {
      replyNode = { innerText: reply, isConnected: true };
      messages = [...messages, replyNode];
      if (detachAfterMs !== null) setTimeout(() => { replyNode.isConnected = false; }, detachAfterMs);
    }, afterMs);
    if (extra !== null) setTimeout(() => { messages = [...messages, { innerText: extra, isConnected: true }]; }, extraAfterMs);
    const sandbox = {
      findResponseEl: () => messages[messages.length - 1],
      _anchorMessageEls: () => messages,
      _isGenerating: () => false,                 // settled, as a finished previous answer is
      send: (m) => { sent.push(m); if (m.type === 'GUARDIAN_ERROR') resolve({ sent, done: null }); },
      getAccount: () => 'acct',
      PROVIDER: 'test-provider',
      // Helpers some providers' watch loop calls; stubbed so the REAL
      // startWatch runs unmodified (deepseek checks a search-mode banner).
      detectSearchMode: () => false, _isSearching: () => false, _dismissBanner: () => {},
      detectResponseErrors: () => [], _toolCallCounts: new Map(),
      _log: () => {},
      setJobBar: () => {},
      stopWatch: () => {},
      _streamToCortex: () => {},
      _onJobComplete: (jobId, text) => resolve({ sent, done: { jobId, text } }),
      NO_REPLY_MS: noReplyMs,
      MutationObserver: class { observe() {} disconnect() {} },
      document: { querySelector: () => null, body: {} },
      location: { href: 'https://provider.example/c/abc123' },
      setTimeout, clearTimeout, Date,
      currentJobId: null, jobActive: false, _watchStart: 0, _watchObs: null, _watchTimer: null,
    };
    const body = `${extractFn(src, 'startWatch')}; startWatch('job-2', 'the second question', 0);`;
    const fn = new Function(...Object.keys(sandbox), body);
    fn(...Object.values(sandbox));
    setTimeout(() => resolve({ sent, done: null, timedOut: true }), giveUpMs);
  });
}

async function main() {
  console.log('\ntest-guardian-job-correlation\n');

  for (const p of PROVIDERS) {
    const src = fs.readFileSync(path.join(ROOT, 'guardian', `userscript-${p}.js`), 'utf8');

    // THE BUG: the previous answer is on screen and settled; the new job gets nothing.
    const stale = await runWatch(src, { previous: 'FIRST JOB ANSWER', reply: null, noReplyMs: 1200, giveUpMs: 6000 });
    check(`${p}: a job that gets no reply NEVER completes with the previous answer`,
      stale.done === null, stale.done && stale.done.text);
    check(`${p}: …it reports a no-reply, loudly, with the chat url`,
      stale.sent.some(m => m.type === 'GUARDIAN_ERROR' && /no new response/.test(m.error) && m.chatUrl));

    // A real new answer still completes normally.
    const good = await runWatch(src, { previous: 'FIRST JOB ANSWER', reply: 'SECOND JOB ANSWER' });
    check(`${p}: a genuine new answer completes the job with ITS text`,
      good.done && good.done.text === 'SECOND JOB ANSWER', good.done && good.done.text);
    check(`${p}: the completed job is the one that was watched`, good.done && good.done.jobId === 'job-2');

    // §AN1 — anchor exactness: once the new node exists and is latched, a
    // LATER, unrelated append (a stray third node) must not move the
    // goalposts. A "last of many" re-query (the pre-AN1 shape) would have
    // picked up the third node instead and either mismatched or hung.
    const anchored = await runWatch(src, {
      previous: 'FIRST JOB ANSWER', reply: 'SECOND JOB ANSWER',
      extra: 'THIRD UNRELATED NODE', extraAfterMs: 1900,
    });
    check(`${p}: AN1 — a later unrelated append does not change which node the job completes from`,
      anchored.done && anchored.done.text === 'SECOND JOB ANSWER', anchored.done && anchored.done.text);

    // §AN1 — nothing silently fails: if the anchored node is later removed
    // from the DOM outright (re-render swapped it out) rather than mutated
    // in place, the job must report loudly, never silently read whatever
    // is on screen now.
    const detached = await runWatch(src, {
      previous: 'FIRST JOB ANSWER', reply: 'SECOND JOB ANSWER',
      detachAfterMs: 200, noReplyMs: 6000, giveUpMs: 6000,
    });
    check(`${p}: AN1 — an anchored node later removed from the DOM fails loudly, not silently`,
      detached.done === null && detached.sent.some(m => m.type === 'GUARDIAN_ERROR' && /removed from the DOM/.test(m.error)),
      JSON.stringify(detached.sent.map(m => m.type)));

    check(`${p}: the userscript version was bumped so the fix is visible in guardian's report`,
      /const VERSION\s*=\s*'10\.[1-9]/.test(src));
  }

  // Headless: the watch loop is timer-driven, so hidden windows must not throttle.
  const HOST = fs.readFileSync(path.join(ROOT, 'clear-glass', 'src', 'providers', 'host.js'), 'utf8');
  check('provider windows disable background throttling (jobs work with the UI closed)',
    /webPreferences:\s*\{[\s\S]{0,1600}backgroundThrottling:\s*false/.test(HOST));
  check('provider windows are still hidden and off the taskbar', /skipTaskbar:\s*true/.test(HOST));

  // chat_url on the path a dispatched job actually takes.
  const GS = fs.readFileSync(path.join(ROOT, 'guardian', 'server.js'), 'utf8');
  const update = GS.slice(GS.indexOf("jaa.update('jobs'"), GS.indexOf("jaa.update('jobs'") + 600);
  check('a completing job records the chat url on the UPDATE path, not only on insert',
    /chat_url: data\.chatUrl/.test(update));
  check('completion is logged once, consistently, with the chat it came from',
    /\[guardian\] job complete[\s\S]{0,200}chat=/.test(GS));

  // The agent config moved to Settings → Agents.
  const APP = fs.readFileSync(path.join(ROOT, 'idearium', 'ui', 'js', 'app.js'), 'utf8');
  check('Settings has a per-repo Agents section', APP.includes('repo-agents-section') && APP.includes('renderRepoAgentSettings'));
  check('renderRepoSettings renders it for the current repo', /renderRepoAgentSettings\(repo\)/.test(APP));
  const agentTab = extractFn(APP, 'renderRepoAgent');
  check('the Agent tab no longer carries the hat/provider control', !agentTab.includes('agent-use-guardian'));
  check('…and points at where it moved', /Settings → Agents/.test(agentTab));
  check('the Agent tab still has the CLI', /ask this project's agent/.test(APP));

  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  process.exitCode = fail === 0 ? 0 : 1;
}
main().catch(e => { console.log('  ! crashed:', e.stack); process.exit(1); });
