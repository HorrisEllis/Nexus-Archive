'use strict';
/**
 * cortex/core/raid/officiator.js — real contract synthesis from a
 * staged artifact.
 * UUID: nexus-raid-officiator-v1-0000-2026-0902-jamesbrooks-001
 * Version: 1.0.0
 *
 * §BUILT 2026-09-02 — James: "did you finish the synthesis for the
 * contracts. thats top priority. maybe intent: contract or officiator
 * for synthesizing contracts. needs to listen for the artifact."
 *
 * §WHAT THIS IS — the real, second half of B1's own agent-synthesized-
 * contracts design (docs/2026-09-02-nexus-vision-master-phasemap.spec):
 * an agent (not a fixed function) receives the real B1 primitive
 * schema plus real context and PRODUCES the actual contract content,
 * rather than a function assembling it. "the_officiator" (lib/hat-
 * seed.js, this same session) is that hat — real, scoped, dispatched
 * exactly like any other hat-wearing job, through the same guardian
 * path every other real dispatch in this codebase already uses.
 *
 * §LISTENING FOR THE ARTIFACT — "the artifact" is the real, already-
 * built pipeline this session's own artifact-storage work wired up:
 * clear-glass's download-capture -> guardian's POST /api/intake ->
 * lib/intake.js's stage(). That pipeline writes real drops to a real,
 * physical directory (lib/intake.js's own INTAKE_DIR) — this module
 * polls it, the same real "worker ticks and drains a queue" pattern
 * already proven by cortex/core/raid/worker.js and orchestrator/lib/
 * versionium-auto-commit.js, not a new mechanism. Polling, not a push
 * subscription, because guardian (where the artifact lands) and this
 * module (cortex's process) are genuinely separate processes — the
 * intake directory is real, physical, shared-file-store infrastructure
 * both processes already read/write today (same convention versionium/
 * lib/store.js's own header already documents for event_log).
 */
const intake = require('../../../lib/intake.js');
const hatForge = require('../../../lib/hat-forge.js');
const { submitContract } = require('./contract-intake.js');

const MODULE_ID = 'raid-officiator';
const VERSION   = '1.0.0';
const INTERVAL_MS = parseInt(process.env.OFFICIATOR_INTERVAL_MS || '20000', 10);

let _timer = null;
let _running = false;
// §HONEST, IN-MEMORY DEDUP — a drop this process has already turned
// into a contract (or tried and gave up on) is never reconsidered
// within this process's own lifetime. Not persisted: a restart re-
// scanning already-synthesized drops and finding they're still STAGED
// (submitContract doesn't currently write anything back onto the
// intake drop's own state) would re-synthesize them — a real, known
// limitation, not silently hidden.
// §FIXED 2026-09-02 — the honest, in-memory-only limitation this
// module's own header used to document (a restart re-scanning already-
// synthesized drops would re-synthesize them) is now closed for real:
// officiate() calls the new lib/intake.js's markOfficiated() on every
// real success, a persisted, physical marker on the drop's own
// intake-contract.json — survives a restart, not just this process's
// own memory. _seen stays as a real, same-process fast-path (skips a
// disk read for a drop this exact process already handled moments
// ago), not the only defense anymore.
const _seen = new Set();

// §FIXED 2026-09-02 — checked lib/intake.js's real stage()/read() shape
// directly before writing this (not assumed): the drop object IS the
// contract, flat — drop.dropId/state/summary/provenance/claims, not
// nested under a .contract key. summary is a real OBJECT (file/create/
// overwrite/identical/unplaced/archive counts), not a string. There is
// no real .content field — claims only carry metadata (source/target/
// mapped/bytes/sha256/effect); real file bytes live on disk under the
// drop's own payload/ directory and have to be read separately.
function _readRealFileContent(drop, maxFiles = 5, maxBytesPerFile = 4000) {
  const fs = require('fs');
  const path = require('path');
  const claims = Array.isArray(drop.claims) ? drop.claims : [];
  const intakeDir = process.env.NEXUS_INTAKE_DIR || path.join(__dirname, '../../../data/intake');
  const out = [];
  for (const claim of claims.slice(0, maxFiles)) {
    try {
      const abs = path.join(intakeDir, drop.dropId, 'payload', claim.source);
      const buf = fs.readFileSync(abs);
      // §HONEST — a binary file's real bytes aren't useful in a text
      // prompt; skip it by real content sniff rather than guessing from
      // the extension alone.
      const isLikelyText = !buf.slice(0, 512).includes(0);
      if (!isLikelyText) { out.push(`--- ${claim.source} (binary, ${claim.bytes} bytes, not shown) ---`); continue; }
      out.push(`--- ${claim.source} ---\n${buf.toString('utf8').slice(0, maxBytesPerFile)}`);
    } catch (e) {
      out.push(`--- ${claim.source} (could not read: ${e.message}) ---`);
    }
  }
  return out.join('\n\n');
}

function _buildSynthesisPrompt(drop) {
  const s = drop.summary || {};
  const provenance = drop.provenance || {};
  return [
    'Synthesize ONE real build contract from the artifact below.',
    'Output ONLY a single JSON object — no prose, no markdown fences.',
    '',
    'Required keys: endState, conditions, intent, context, warpPrimitives, axioms, tools, compartmentUuid, fileDirectory, fileName.',
    'A key you cannot determine from the artifact must be null — never invent a value.',
    '',
    `Artifact provider: ${provenance.provider || 'unknown'}`,
    `Artifact filename: ${provenance.filename || 'unknown'}`,
    `Artifact summary: ${s.files || 0} file(s) — ${s.create || 0} new, ${s.overwrite || 0} would overwrite, ${s.identical || 0} identical, ${s.unplaced || 0} unplaced, ${s.archives || 0} archive(s) staged whole`,
    'Artifact real file content (up to 5 files shown):',
    _readRealFileContent(drop),
  ].join('\n');
}

function _parseSynthesizedContract(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_) {
    return null;
  }
}

async function officiate(drop, opts = {}) {
  const forAgent = opts.forAgent || 'claude';
  const hat = hatForge.get('the_officiator');
  if (!hat) {
    return { ok: false, reason: 'the_officiator hat is not seeded — run lib/hat-seed.js\'s seedHats() first' };
  }

  const prompt = _buildSynthesisPrompt(drop);
  const { dispatchToNcpAgent } = require('../../../copilot/lifeline.js');
  const result = await dispatchToNcpAgent(prompt, { provider: forAgent });
  if (!result || !result.ok) {
    return { ok: false, reason: `no real agent response (forAgent=${forAgent}) — guardian unreachable or an empty response` };
  }

  const synthesized = _parseSynthesizedContract(result.text);
  if (!synthesized) {
    return { ok: false, reason: `the_officiator's real response could not be parsed as a real contract JSON object: ${(result.text || '').slice(0, 200)}` };
  }

  const s = drop.summary || {};
  const { queueId } = submitContract(
    {
      content: synthesized.context || `Artifact with ${s.files || 0} file(s) from ${(drop.provenance && drop.provenance.provider) || 'unknown'}`,
      title: synthesized.fileName || null,
      forAgent: opts.dispatchTo || forAgent,
      endState: synthesized.endState ?? null,
      conditions: synthesized.conditions ?? null,
      warpPrimitives: synthesized.warpPrimitives ?? null,
      axioms: synthesized.axioms ?? null,
      compartmentUuid: synthesized.compartmentUuid ?? null,
      fileDirectory: synthesized.fileDirectory ?? null,
      // §B1 SCHEMA — a real, literal fileName key too, not just reused
      // as the row's existing top-level `title` column. B1's own real
      // field list names both endState/conditions/etc AND fileName
      // explicitly — this keeps the nested contract object a complete,
      // honest record of everything the_officiator actually produced.
      fileName: synthesized.fileName ?? null,
    },
    {
      source: 'officiator',
      intention: synthesized.intent || 'build',
      forAgent: opts.dispatchTo || forAgent,
      sourceDropId: drop.dropId || drop.id || null,
    },
  );

  // §PERSISTED DEDUP 2026-09-02 — real, physical marker on the drop
  // itself (lib/intake.js's own new markOfficiated()), not just this
  // process's in-memory _seen set. A failure here is logged, not
  // fatal — the contract is already real and queued; a drop that
  // somehow gets re-scanned and re-officiated after this is a real,
  // rare, honest edge case (two contracts for one artifact), not a
  // silent double-submit this module pretends can't happen.
  try {
    const markResult = intake.markOfficiated(drop.dropId, { queueId });
    if (!markResult.ok) console.warn(`[${MODULE_ID}] could not mark drop ${drop.dropId} as officiated (non-fatal, contract ${queueId} already exists): ${markResult.reason}`);
  } catch (e) {
    console.warn(`[${MODULE_ID}] markOfficiated threw (non-fatal): ${e.message}`);
  }

  return { ok: true, queueId, synthesized };
}

async function tick() {
  if (_running) return { skipped: true, reason: 'previous tick still in flight' };
  _running = true;
  try {
    const drops = intake.list().filter(d => d.state === intake.STATE.STAGED && !d.officiated);
    let synthesized = 0, failed = 0;
    for (const drop of drops) {
      const id = drop.dropId || drop.id;
      if (!id || _seen.has(id)) continue;
      _seen.add(id);
      const result = await officiate(drop);
      if (result.ok) { synthesized++; console.log(`[${MODULE_ID}] synthesized contract ${result.queueId?.slice(0, 8)} from drop ${id.slice(0, 8)}`); }
      else { failed++; console.warn(`[${MODULE_ID}] synthesis failed for drop ${id.slice(0, 8)}: ${result.reason}`); }
    }
    return { ok: true, checked: drops.length, synthesized, failed };
  } catch (e) {
    console.warn(`[${MODULE_ID}] tick failed, will retry next interval: ${e.message}`);
    return { ok: false, error: e.message };
  } finally {
    _running = false;
  }
}

function start(opts = {}) {
  if (_timer) return;
  const intervalMs = opts.intervalMs || INTERVAL_MS;
  _timer = setInterval(tick, intervalMs);
  if (_timer.unref) _timer.unref();
  console.log(`[${MODULE_ID}] v${VERSION} — listening for staged artifacts every ${intervalMs}ms`);
}

function stop() {
  if (_timer) { clearInterval(_timer); _timer = null; }
}

module.exports = { start, stop, tick, officiate, MODULE_ID, VERSION };
