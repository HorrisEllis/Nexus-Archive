'use strict';
// lib/node-schemas/guardian_listener.js — real schema for the
// .guardian_listener node type.
// UUID: nexus-node-schema-guardian-listener-v1-0000-2026-0911-001
// §NEW 2026-09-11 — guardian per-system pass (James: "guardian and the
// npcs... from the listeners"). "NPC" isn't an existing NEXUS term —
// James's own name for these; this schema is the real thing behind it:
// one guardian_listener per live browser tab running a provider
// userscript. Identical GUARDIAN_HEARTBEAT shape confirmed across all
// four real listeners (userscript-claude.js, userscript-chatgpt.js,
// userscript-gemini.js, userscript-perplexity.js) — one schema covers
// all of them, not assumed, grep-verified byte-identical.
//
// §NOTE — guardian_nodes / guardian_health (jaa/schema-full.sql) look
// like they'd be this table, but confirmed dead: no writer anywhere in
// the real guardian/ tree. Only referenced by cortex/cortex-v2.js (and
// its archived twin in _archive/unintegrated/2026-07-branch-b-cortex-v2/),
// a parallel/older implementation, not the live path. This schema is
// grounded in the REAL, live heartbeat instead — guardian_nodes/
// guardian_health stay flagged as dead schema, not built against.
//
// §NOTE — MY_TAB (the tabId) is deliberately ephemeral, sessionStorage
// only, regenerated per tab session — per each userscript's own header
// comment ("intentionally ephemeral"). This node's identity is therefore
// SESSION-scoped, not a persistent cross-restart identity. A listener
// node's lifecycle ends when the tab closes; it isn't "the same NPC"
// reopened tomorrow. Real, not a gap — matches the ephemeral-by-design
// comment in source.

module.exports = {
  status: 'REAL',
  source: 'guardian/userscript-{claude,chatgpt,gemini,perplexity}.js — identical real GUARDIAN_HEARTBEAT payload, confirmed byte-identical across all four',
  fields: {
    provider:  { type: 'string',  required: true, description: "real provider this listener runs against — 'claude' | 'chatgpt' | 'gemini' | 'perplexity', one const PROVIDER per userscript file" },
    tabId:     { type: 'string',  required: true, description: 'real, session-ephemeral tab identity — MY_TAB, generated once per tab session and held in sessionStorage only, never persisted cross-restart' },
    ts:        { type: 'number',  required: true, description: 'real heartbeat timestamp, sent every HB_MS (8000ms)' },
    usage:     { type: 'any',     required: false, description: 'real output of detectUsageLimit() — provider-specific usage/rate-limit state, shape not unified across providers' },
    chatId:    { type: 'string',  required: false, description: 'real current chat id on the provider\'s own site, from chatId()' },
    claimed:   { type: 'boolean', required: true, description: 'real claim state — whether this tab is currently claimed for job dispatch (isClaimed, set via GUARDIAN_CLAIM messages, sessionStorage TAB_KEY-backed)' },
    connState: { type: 'string',  required: false, description: "real connection state to guardian's NCP endpoint — 'disconnected' | 'ready', not itself sent in the heartbeat payload but held alongside it in the same runtime state" },
  },
};
