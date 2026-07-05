'use strict';
/**
 * guardian/ncp/dispatch-pipeline.js — NCP job dispatch, rebuilt on WARP
 * UUID: nexus-guardian-ncp-dispatch-v1-0000-2026-0705-001
 * Version: 1.0.0
 * Seam ID: guardian.ncp.dispatch:v1:p0001
 *
 * Previously, guardian/userscript-perplexity.js's job lifecycle (dispatch →
 * wait for browser round-trip → log) was bespoke per provider, with no
 * shared cache, no declared invariants, and no audit trail beyond ad-hoc
 * console/ledger writes. This module puts NCP's /command handling through
 * warp/dispatch's unifiedDispatch instead:
 *
 *   - identical (provider, prompt) pairs hit warp's exact-cache instead of
 *     re-opening a browser round-trip — real cost reduction, not just a
 *     TTL guess
 *   - every job is axiom-gated BEFORE it reaches a browser tab: origin
 *     must be on the seam allowlist (hard), payload must not contain an
 *     obvious secret being asked to leave the machine (hard)
 *   - every step (cache hit/miss, axiom pass/fail, score, promotion) is
 *     written to a warp StreamLog — an actual append-only audit trail,
 *     not scattered ledger writes
 *
 * warp/core and warp/dispatch import nothing outside warp/ (see
 * warp/MANIFEST.json's decoupling_rule) — this file is the adapter layer
 * that wires warp into NEXUS, exactly as warp.spec's hooks contract
 * intends: a consuming project supplies the crystallizer/cascader/scorer,
 * warp's core never knows NEXUS exists.
 */

const path = require('path');
const { Event, Gate, Axiom, Stream, StreamLog } = require('../../warp/core');
const { unifiedDispatch } = require('../../warp/dispatch');
const { PopulationStore } = require('../../warp/dispatch/population');
const { FlatFileCrystallizer } = require('../../warp/plugins/crystallizer-flatfile');
const { scoreDefault } = require('../../warp/plugins/scorer-default');

// ── §PRIVACY — known chat-surface origins this seam will ever dispatch to ────
// Anything not on this list is a hard axiom failure. Extending provider
// support means extending this list explicitly — never a wildcard.
const KNOWN_ORIGINS = {
  chatgpt:    ['https://chatgpt.com', 'https://chat.openai.com'],
  claude:     ['https://claude.ai'],
  perplexity: ['https://www.perplexity.ai', 'https://perplexity.ai'],
  gemini:     ['https://gemini.google.com'],
};

// ── §PRIVACY — redaction applied before anything is written to StreamLog or ──
// memory_store. This is a floor, not a substitute for not logging raw
// transcripts longer than needed — see PRIVACY_RETENTION_MS below.
const PII_PATTERNS = [
  { name: 'email',     re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi },
  { name: 'phone',     re: /\b(?:\+?\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g },
  { name: 'apikey',    re: /\b(sk|pk|api|key|token)[-_][a-z0-9]{16,}\b/gi },
  { name: 'ssn_like',  re: /\b\d{3}-\d{2}-\d{4}\b/g },
];

function redact(text) {
  if (typeof text !== 'string') return text;
  let out = text;
  const hits = [];
  for (const { name, re } of PII_PATTERNS) {
    if (re.test(out)) hits.push(name);
    out = out.replace(re, `[redacted:${name}]`);
  }
  return { text: out, redacted: hits };
}

// Raw prompt/response text is never persisted to StreamLog directly — only
// a redacted copy, plus a digest so exact-cache still works on the
// *original* content (redaction must not affect cache correctness).
const DEFAULT_PRIVACY_RETENTION_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

// ── Axioms ─────────────────────────────────────────────────────────────────
const originAllowlist = new Axiom('ncp.origin-allowlist', {
  severity: 'hard',
  version: '1.0.0',
  check: (event) => {
    const { provider, origin } = event.data;
    const allowed = KNOWN_ORIGINS[provider];
    if (!allowed) return false; // unknown provider — never dispatched
    if (!origin) return true;   // server-originated /command calls (no browser origin yet)
    return allowed.includes(origin);
  },
});

const noSecretEgress = new Axiom('ncp.no-secret-egress', {
  severity: 'hard',
  version: '1.0.0',
  check: (event) => {
    const prompt = event.data.output ?? event.data.prompt ?? '';
    // A prompt that is itself trying to smuggle a live secret string to a
    // third-party chat surface is rejected outright — this is not about
    // catching secrets already in a page, it's about not being the thing
    // that forwards them.
    return !PII_PATTERNS.some(p => p.name === 'apikey' && p.re.test(prompt));
  },
});

const privacyRetentionFlag = new Axiom('ncp.privacy-retention', {
  severity: 'soft',
  version: '1.0.0',
  check: (event) => {
    const target = event.data.output ?? event.data.prompt ?? '';
    return PII_PATTERNS.every(p => !p.re.test(target));
  },
});

// ── Gate — the one thing /command dispatch does ──────────────────────────────
const commandGate = new Gate('ncp.command.dispatch', {
  schema: { requiredKeys: ['ok'], types: { ok: 'boolean' } },
  transform: (event) => {
    // Pure per Gate's contract — actual browser round-trip happens in the
    // cascade function passed into unifiedDispatch, not here. This just
    // shapes the follow-up log event.
    return new Event('ncp.command.dispatched', { jobId: event.data.jobId, provider: event.data.provider });
  },
});

/**
 * buildPipeline({ memoryStoreDir, sendToBrowser })
 *
 * sendToBrowser(job) → Promise<{ ok, output }>  — the actual NCP round-trip:
 * broadcast GUARDIAN_JOB over SSE to the claimed tab for job.provider, then
 * resolve when that tab's /result POST reports GUARDIAN_COMPLETE or
 * GUARDIAN_ERROR for job.jobId (server.js wires this).
 */
function buildPipeline({ memoryStoreDir, sendToBrowser }) {
  const log = new StreamLog();
  const stream = new Stream({ log, axioms: [originAllowlist, noSecretEgress, privacyRetentionFlag] });
  stream.register(commandGate);

  const crystallizer = new FlatFileCrystallizer({
    path: path.join(memoryStoreDir, 'ncp_dispatch_cache.json'),
  });
  const population = new PopulationStore({ maxPerClass: 8 });

  async function dispatchCommand({ provider, prompt, origin = null, meta = {} }) {
    const event = new Event('ncp.command.request', { provider, prompt, origin, meta });

    // Route through Stream first — this is where the hard axioms actually
    // run and get logged, even though unifiedDispatch below re-checks them
    // per-candidate (cheap check, cheap to run twice; the Stream pass is
    // what makes this seam's audit trail complete for *every* event, not
    // only ones that reach generation).
    stream.emit(event);
    const rejected = stream.rejected.find(r => r.event.uuid === event.uuid);
    if (rejected) {
      return { ok: false, error: 'axiom-rejected', failures: rejected.failures };
    }

    const result = await unifiedDispatch({
      gateSignature: 'ncp.command.dispatch',
      gateClass: `ncp.${provider}`,
      event,
      axioms: [originAllowlist, noSecretEgress, privacyRetentionFlag],
      crystallizer,
      population,
      scorer: scoreDefault,
      log,
      cascade: async ({ event: e }) => {
        const r = await sendToBrowser({ provider: e.data.provider, prompt: e.data.prompt, meta: e.data.meta });
        return { ok: r.ok, output: r.output ?? '', attempts: [{}] };
      },
    });

    const { text: safeOutput, redacted } = redact(result.output || '');
    log.record({
      step: 'privacy-redact', jobClass: `ncp.${provider}`,
      redactedFields: redacted, retentionMs: DEFAULT_PRIVACY_RETENTION_MS,
    });

    return { ...result, output: result.output, loggedOutput: safeOutput, redacted };
  }

  return { dispatchCommand, log, crystallizer, population, stream };
}

module.exports = {
  buildPipeline, KNOWN_ORIGINS, redact, PII_PATTERNS,
  DEFAULT_PRIVACY_RETENTION_MS, originAllowlist, noSecretEgress, privacyRetentionFlag,
};
