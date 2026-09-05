'use strict';
/**
 * ollama/config.js — real, distinct config, not inline constants scattered
 * across ollama/server.js and every other file that independently hardcodes
 * a model tag. Matches the shape already established by
 * intelligence/config.js — same pattern, same reasoning: a real, single
 * file a person can open and change, not a value to grep for across a
 * dozen files and hope none were missed.
 *
 * §HISTORY worth keeping visible, not just in a commit message: on
 * 2026-07-04 this bridge's own model constants were wrong (requesting a
 * tag that was never pulled), and the real fix required FIVE separate
 * files to independently agree on the correct one — because there was no
 * single place to fix. On 2026-08-23, changing the model again meant
 * re-discovering that same list by hand. This file exists so the next
 * change is one line, in one place, not an archaeology exercise.
 *
 * Every real value below is env-overridable, matching the convention
 * already used throughout this codebase (INTELLIGENCE_PORT,
 * OLLAMA_MAX_CONCURRENT, etc.) — a person can override any single setting
 * for one run without editing this file, or change the real default here
 * for good.
 */
const path = require('path');

module.exports = {
  // ── Network ────────────────────────────────────────────────────────────
  PORT: parseInt(process.env.OLLAMA_BRIDGE_PORT || '3749', 10),
  OLLAMA_HOST: (() => {
    const raw = process.env.OLLAMA_HOST || '127.0.0.1:11434';
    return raw.startsWith('http') ? raw : `http://${raw}`;
  })(),
  ORCH_URL: process.env.ORCHESTRATOR_URL || 'http://127.0.0.1:9000',
  CX_URL:   process.env.CORTEX_URL || 'http://127.0.0.1:3748',

  // ── Storage ────────────────────────────────────────────────────────────
  DATA_DIR: path.join(__dirname, '..', 'data', 'ollama'),

  // ── Models — the one real place this codebase's model tags live ──────────
  // James, 2026-08-23: "now using huihui_ai/qwen2.5-coder-abliterate:3b for
  // ollama/co-pilot." Real tag, verified against ollama.com before it was
  // ever written down (1.9GB, Q4_K_M, real arch qwen2).
  DEFAULT_MODEL:  process.env.OLLAMA_DEFAULT_MODEL  || 'huihui_ai/qwen2.5-coder-abliterate:3b',
  FALLBACK_MODEL: process.env.OLLAMA_FALLBACK_MODEL || 'mistral:7b-instruct-q4_K_M',

  // ── Concurrency ────────────────────────────────────────────────────────
  // 1 is the honest default for a single-GPU/single-box install: it
  // serialises rather than thrashing, and the real queue already absorbs
  // the wait. The number was never measured, it was assumed — raise it
  // deliberately once there's real headroom to raise it INTO.
  MAX_CONCURRENT: parseInt(process.env.OLLAMA_MAX_CONCURRENT || '1', 10),

  // ── Timeouts — every real magic number that was living inline in
  // ollama/server.js, now with a name and an env override ─────────────────
  CHAT_TOOLS_TIMEOUT_MS:   parseInt(process.env.OLLAMA_CHAT_TOOLS_TIMEOUT_MS   || '60000', 10),
  RAW_GENERATE_TIMEOUT_MS: parseInt(process.env.OLLAMA_RAW_GENERATE_TIMEOUT_MS || '45000', 10),
  DEFAULT_JOB_TIMEOUT_MS:  parseInt(process.env.OLLAMA_JOB_TIMEOUT_MS         || '45000', 10),
  HEALTH_CHECK_TIMEOUT_MS: parseInt(process.env.OLLAMA_HEALTH_TIMEOUT_MS      || '3000', 10),
  DEFAULT_MAX_TOKENS:      parseInt(process.env.OLLAMA_DEFAULT_MAX_TOKENS     || '2048', 10),

  // ── Identity (not tunable — real, fixed values, kept here so a reader
  // checking "what does this bridge think it is" has one place to look,
  // not two) ─────────────────────────────────────────────────────────────
  SYSTEM_ID: 'ollama',
  VERSION:   '1.0.0',
};
