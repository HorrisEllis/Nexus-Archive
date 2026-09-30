'use strict';
/**
 * guardian/lib/detector.js — Response Quality Detector
 * UUID: guardian-detector-v1-0000-4000-0000-000000000001
 *
 * Ported from userscript v8.3 Detector object.
 * Runs server-side so detection results are persisted in JAA, not localStorage.
 *
 * Three detection axes:
 *   truncation — response cut short (context window pressure, incomplete)
 *   sigma      — behavioral deviation (missing code blocks, low diversity)
 *   delta      — content deviation (missing keywords, stubs, axiom violations)
 *
 * composite = truncation×0.5 + sigma×0.3 + delta×0.2
 * passed = composite < 0.35 AND !truncated
 *
 * §CODE MODE 2026-09-30 — everything above grades PROSE (a reply that ends in
 * punctuation, is at least 40% as long as the prompt, and contains fenced
 * blocks when the prompt did). A source FILE fails all three by being correct:
 * it ends in `}` or `;`, it is far shorter than the prompt (which carries the
 * system state and the file tree), and idearium's WARP path hands it over with
 * the fences already stripped. Confirmed by running a clean 405-char state.js
 * through prose mode: composite 0.65, TRUNCATED:mid_sentence_end — every file
 * rejected, every retry identical, chunk stalled. profile(text, {mode:'code'})
 * switches to file-appropriate checks: a real syntax check (node --check) in
 * place of the punctuation/length/fence guesses. Default behaviour (no opts) is
 * unchanged, byte for byte — guardian's NCP handler and ollama's dispatch keep
 * grading prose.
 */
const _fs = require('fs');
const _os = require('os');
const _path = require('path');
const { spawnSync } = require('child_process');

const _JS_EXT = new Set(['.js', '.mjs', '.cjs']);
let _tmpDir = null;
function _tmp() {
  if (!_tmpDir) _tmpDir = _fs.mkdtempSync(_path.join(_os.tmpdir(), 'nexus-detector-'));
  return _tmpDir;
}

/**
 * The file's body: the first fenced block if the reply has one (a fence opened
 * and never closed is reported, not guessed at), else the reply itself.
 * @returns {{ body: string, fenced: boolean, unclosed: boolean }}
 */
function _codeBody(response) {
  const text = String(response || '');
  const open = text.match(/^[ \t]*```[^\n`]*\n/m);
  if (!open) return { body: text, fenced: false, unclosed: false };
  const start = open.index + open[0].length;
  const rest = text.slice(start);
  const close = rest.match(/^[ \t]*```[ \t]*$/m);
  if (!close) return { body: rest, fenced: true, unclosed: true };
  return { body: rest.slice(0, close.index), fenced: true, unclosed: false };
}

function _nodeCheck(body, ext) {
  const file = _path.join(_tmp(), `c${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  try {
    _fs.writeFileSync(file, body);
    const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', timeout: 8000, windowsHide: true, env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } });
    if (r.error || r.status === null) return { unavailable: true, why: r.error ? r.error.message : 'node --check did not finish' };
    if (r.status === 0) return { ok: true };
    const err = String(r.stderr || '');
    const m = err.match(/^(?:\w*Error): (.*)$/m);
    const ln = err.match(/:(\d+)\s*$/m);
    return { ok: false, message: (m ? m[1] : err.split('\n').find(l => l.trim()) || 'syntax error').trim(), line: ln ? parseInt(ln[1], 10) : null };
  } catch (e) {
    return { unavailable: true, why: e.message };
  } finally {
    try { _fs.unlinkSync(file); } catch (_) {}
  }
}

/**
 * syntax(body, ext) — does this file parse? Only for languages this process can
 * really check (JS in either module system, JSON). Anything else, or a checker
 * that cannot run, is `checked:false` — never a failure: an unavailable checker
 * must not reject good work (§1.2).
 */
function _syntax(body, ext) {
  ext = String(ext || '').toLowerCase();
  if (ext === '.json') {
    try { JSON.parse(body); return { checked: true, ok: true, score: 0 }; }
    catch (e) { return { checked: true, ok: false, score: 1, message: e.message, eof: /end of JSON input|Unexpected end/i.test(e.message) }; }
  }
  if (!_JS_EXT.has(ext)) return { checked: false, ok: null, score: 0, why: ext ? `no checker for ${ext}` : 'no file extension given' };
  // .js is CJS or ESM depending on the nearest package.json, which is not known here — it passes if EITHER parses.
  // A file that reads as ESM is tried as ESM first, so the common case is one process, not two.
  const esm = /^\s*(import\s[^(]|export\s)/m.test(body);
  const tries = ext === '.js' ? (esm ? ['.mjs', '.cjs'] : ['.cjs', '.mjs']) : [ext];
  const results = {};
  for (const e of tries) {
    const r = _nodeCheck(body, e);
    if (r.unavailable) return { checked: false, ok: null, score: 0, why: r.why };
    if (r.ok) return { checked: true, ok: true, score: 0 };
    results[e] = r;
  }
  // both failed: report the error from the module system the file's own syntax points to
  const r = results[tries[0]];
  return { checked: true, ok: false, score: 1, message: r.message, line: r.line, eof: /Unexpected end of input|Unterminated/i.test(r.message) };
}

const Detector = {
  profile(chunk, opts = {}) {
    const lines = chunk.split('\n'), words = chunk.match(/\b\w+\b/g)||[];
    const codeBlocks = (chunk.match(/```/g)||[]).length / 2;
    const code = opts && opts.mode === 'code';
    return {
      mode: code ? 'code' : 'prose',
      ext: code ? (String(opts.ext || '').toLowerCase() || null) : null,
      words: words.length, chars: chunk.length,
      codeBlocks: Math.ceil(codeBlocks),
      headers: lines.filter(l => /^#{1,4}\s/.test(l)).length,
      musts: (chunk.match(/\b(MUST|REQUIRED|SHALL|CRITICAL)\b/g)||[]).length,
      hasSeamContract: /SEAM CONTRACT|SEAM VERDICT/i.test(chunk),
      minResponseChars: Math.max(200, chunk.length * 0.4),
      maxResponseChars: chunk.length * 8,
    };
  },

  truncation(response, profile) {
    if (profile && profile.mode === 'code') {
      // A file is not a sentence: no punctuation rule, no length-vs-prompt rule. What truncation MEANS for a file is
      // an empty reply, a fence that never closes, or a parse that ran off the end — syntax() adds the last one.
      const { body, unclosed } = _codeBody(response);
      if (body.replace(/\s/g, '').length < 8) return { truncated:true, score:1.0, reason:'empty_or_tiny' };
      if (unclosed) return { truncated:true, score:0.85, reason:'unclosed_fence' };
      return { truncated:false, score:0 };
    }
    if (!response || response.length < 40)
      return { truncated:true, score:1.0, reason:'empty_or_tiny' };
    const lines = response.trim().split('\n');
    const last = lines[lines.length-1]?.trim() || '';
    // The SEAM protocol's own designed terminator — "SEAM VERDICT: PASS" /
    // "SEAM VERDICT: FAIL", verbatim from the prompt template this detector
    // is grading against — doesn't end in [.!?:)\]'"] at all, with or
    // without a trailing emoji (✔️/❌ etc., which models commonly add and
    // which the old emoji-blind regex also choked on). The old check flagged
    // every well-formed SEAM VERDICT line as mid_sentence_end unconditionally
    // — confirmed live: identical composite score across 9 straight retries
    // on content that varied each time, meaning it was never reading content
    // at all. A real verdict format gets a real pass here, not a punctuation
    // guess.
    const isSeamVerdictLine = /SEAM\s+VERDICT\s*:\s*(PASS|FAIL)\s*[^\w]{0,10}$/i.test(last);
    if (!isSeamVerdictLine && last.length > 0 && !last.match(/[.!?:)\]'"]$/) && last.length < 80)
      return { truncated:true, score:0.85, reason:'mid_sentence_end' };
    if (response.length < profile.minResponseChars) {
      const ratio = response.length / profile.minResponseChars;
      return { truncated:true, score:parseFloat((1-ratio).toFixed(3)), reason:'too_short', ratio };
    }
    if (profile.hasSeamContract && !/SEAM VERDICT/i.test(response))
      return { truncated:true, score:0.75, reason:'missing_seam_verdict' };
    return { truncated:false, score:0 };
  },

  sigma(response, profile) {
    if (profile && profile.mode === 'code') {
      // Prose-shaped checks (fence count, ratio to the prompt, lexical diversity, hedging) are meaningless for source.
      // What is still a real behavioural failure: a refusal or apology delivered in place of the file.
      const head = String(response || '').trim().slice(0, 200);
      if (/^(I['’]m sorry|I am sorry|Sorry,|I cannot|I can['’]t|As an AI|Unfortunately)/i.test(head))
        return { score:0.6, signals:[{ type:'refusal_instead_of_code', head:head.slice(0, 80) }], deviating:true };
      return { score:0, signals:[], deviating:false };
    }
    const signals = []; let score = 0;
    const gotCodeBlocks = (response.match(/```/g)||[]).length / 2;
    if (profile.codeBlocks > 0 && gotCodeBlocks === 0) {
      signals.push({ type:'missing_code_blocks', expected:profile.codeBlocks, got:0 });
      score += 0.3;
    }
    const ratio = response.length / Math.max(1, profile.chars);
    if (ratio < 0.3) { signals.push({ type:'too_short', ratio }); score += 0.25; }
    const words = response.toLowerCase().match(/\b\w+\b/g) || [];
    const ld = words.length > 5 ? new Set(words).size / words.length : 1;
    if (ld < 0.25 && words.length > 100) {
      signals.push({ type:'low_lexical_diversity', ld }); score += 0.2;
    }
    const hedgeRate = words.length > 0
      ? (response.match(/\b(might|may|could|perhaps|possibly|seems|appears)\b/gi)||[]).length / words.length
      : 0;
    if (hedgeRate > 0.08) {
      signals.push({ type:'high_hedge_rate', hedgeRate:parseFloat(hedgeRate.toFixed(3)) });
      score += 0.15;
    }
    if (profile.musts > 2) {
      const addressed = (response.match(/\b(implement|complete|done|added|created|built|resolved)\b/gi)||[]).length;
      if (addressed === 0) {
        signals.push({ type:'mandatory_reqs_unaddressed', musts:profile.musts }); score += 0.2;
      }
    }
    return { score:parseFloat(Math.min(1,score).toFixed(3)), signals, deviating:score >= 0.4 };
  },

  delta(response, chunkContent, axioms = [], profile = null) {
    const issues = []; let score = 0;
    for (const axiom of axioms) {
      if (axiom.startsWith('!')) {
        const pat = axiom.slice(1);
        if (response.toLowerCase().includes(pat.toLowerCase())) {
          issues.push({ axiom, type:'axiom_violation', detail:`Forbidden: "${pat}"` });
          score += 0.35;
        }
      } else {
        if (!response.toLowerCase().includes(axiom.toLowerCase())) {
          issues.push({ axiom, type:'axiom_missing', detail:`Required: "${axiom}"` });
          score += 0.2;
        }
      }
    }
    // Code mode: the prompt's backticked names are mostly system state and neighbouring files, not this file's contract.
    const kws = (profile && profile.mode === 'code') ? [] : [
      ...(chunkContent.match(/`([^`]{2,40})`/g)||[]).map(m => m.replace(/`/g,'')),
      ...(chunkContent.match(/\b([A-Z][a-zA-Z]{3,}(?:Store|Client|Engine|Manager|Service|Handler|Router|Bus))\b/g)||[]),
    ].filter((v,i,a) => a.indexOf(v) === i).slice(0, 20);
    const missing = kws.filter(kw => !response.includes(kw)).length;
    if (kws.length > 0 && missing/kws.length > 0.6) {
      issues.push({ type:'keyword_coverage_low', missingRate:parseFloat((missing/kws.length).toFixed(2)), total:kws.length });
      score += (missing/kws.length) * 0.3;
    }
    const stubs = (response.match(/\bTODO\b|\bFIXME\b|\/\/ stub|throw new Error\(['"]not implemented/gi)||[]).length;
    if (stubs > 0) {
      issues.push({ type:'stubs_in_response', count:stubs });
      score += Math.min(0.4, stubs * 0.12);
    }
    return { score:parseFloat(Math.min(1,score).toFixed(3)), issues, deviating:score >= 0.35 };
  },

  syntax(response, profile) {
    if (!profile || profile.mode !== 'code') return { checked:false, ok:null, score:0 };
    return _syntax(_codeBody(response).body, profile.ext);
  },

  evaluate(response, chunkContent, profile, axioms = []) {
    const code = !!(profile && profile.mode === 'code');
    const trunc = Detector.truncation(response, profile);
    const sig   = Detector.sigma(response, profile);
    const delt  = Detector.delta(response, chunkContent, axioms, profile);
    if (!code) {
      const composite = parseFloat((trunc.score*0.5 + sig.score*0.3 + delt.score*0.2).toFixed(3));
      const passed = composite < 0.35 && !trunc.truncated;
      return {
        passed, composite, truncation:trunc, sigma:sig, delta:delt,
        summary: passed
          ? `Δ=${composite} — accepted`
          : `Δ=${composite} — ${trunc.truncated ? 'TRUNCATED:'+trunc.reason : sig.deviating ? 'SIGMA:'+sig.signals.map(s=>s.type).join(',') : 'DELTA:'+delt.issues.map(i=>i.type).join(',')}`,
      };
    }
    // Code mode. The parse is the verdict a file is judged by; run it only when nothing cheaper already failed it.
    const syn = (trunc.truncated || sig.deviating) ? { checked:false, ok:null, score:0, why:'skipped — failed an earlier check' } : Detector.syntax(response, profile);
    if (syn.checked && syn.ok === false && syn.eof && !trunc.truncated) {
      // parse ran off the end of the file — that is truncation, and the retry prompt should say so
      trunc.truncated = true; trunc.score = 0.85; trunc.reason = 'syntax_ended_early';
    }
    const composite = parseFloat(Math.min(1, trunc.score*0.5 + sig.score*0.3 + delt.score*0.2 + syn.score*0.5).toFixed(3));
    // a refusal in place of the file fails on its own — its weighted score (0.6×0.3) alone would not clear the threshold
    const passed = composite < 0.35 && !trunc.truncated && !sig.deviating && !(syn.checked && syn.ok === false);
    const why = trunc.truncated ? 'TRUNCATED:'+trunc.reason
      : (syn.checked && syn.ok === false) ? `SYNTAX:${syn.message}${syn.line ? ` (line ${syn.line})` : ''}`
      : sig.deviating ? 'SIGMA:'+sig.signals.map(s=>s.type).join(',')
      : 'DELTA:'+delt.issues.map(i=>i.type).join(',');
    return {
      passed, composite, truncation:trunc, sigma:sig, delta:delt, syntax:syn,
      summary: passed ? `Δ=${composite} — accepted${syn.checked ? ' (parses)' : ' (syntax unchecked)'}` : `Δ=${composite} — ${trunc.truncated && syn.checked && syn.ok === false ? `SYNTAX:${syn.message}` : why}`,
    };
  },
};

module.exports = { Detector };
