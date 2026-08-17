'use strict';
/**
 * lib/chat-target.js — bind a specific provider conversation to an agent
 * UUID: nexus-chat-target-v1-0000-2026-0814-jamesbrooks-001
 *
 * §WIRED 2026-08-14 — James: "I want to tell co-pilot to switch to Claude (or
 * any agent) and add a chat URL to use."
 *
 * Traced before writing anything. The pieces are further along than expected
 * in one direction and completely absent in the other:
 *
 *   UPWARD (tab -> guardian) IS REAL. Every userscript reports chatId() on
 *   every heartbeat and chatUrl on every result. guardian/lib/ncp.js's
 *   updateClient() stores chatId on the live client entry, /providers exposes
 *   it under `channels`, and guardian's `sessions` table already persists
 *   {chat_id, chat_url, name, provider, account} with a real GET /session/
 *   :chatId route. Guardian always knows which conversation a tab is in.
 *
 *   DOWNWARD (guardian -> tab) DOES NOT EXIST. Grepped all four userscripts'
 *   _handleServerMessage: the complete set of accepted messages is NCP_READY,
 *   GUARDIAN_READY, GUARDIAN_CLAIM, GUARDIAN_RELEASE, GUARDIAN_JOB,
 *   NEXUS_CONTEXT_RESPONSE, GUARDIAN_SESSION_NAMED, GUARDIAN_ARTIFACT_SAVED.
 *   There is no navigate, no open-chat, no set-conversation. chatId is
 *   reported up and never commanded down. A job goes to whichever conversation
 *   the tab happens to be sitting in.
 *
 * So this module does the half that can be real and complete today, and does
 * NOT pretend to do the other half:
 *
 *   · parse() understands a real chat URL for each provider, using the EXACT
 *     regexes the userscripts themselves use to derive chatId — copied from
 *     the four files, not re-invented, so a URL parsed here yields the same id
 *     the tab will report over its own heartbeat. If those ever diverge the
 *     comparison silently stops working, which is why they are cited by file.
 *   · the provider is derived from the URL's host against
 *     clear-glass/src/providers/registry.js, the canonical NCP provider list —
 *     not a second table of hostnames.
 *   · compare() answers the one question worth answering right now: is the
 *     live tab actually in the conversation you asked for? Guardian already
 *     knows; nothing was asking.
 *
 * What it deliberately does NOT do: navigate the tab. That needs a new NCP
 * message plus a handler in four userscripts, which is browser-side code that
 * cannot be honestly verified from here. Mapped as CU1 in
 * docs/copilot-command-and-chat-target-phasemap.spec instead of stubbed.
 */

const path = require('path');

// ── Provider chat-id extraction ──────────────────────────────────────────────
// Each regex is copied verbatim from that provider's own userscript chatId().
// Cited by file+function so a future change there is traceable to here.
const PROVIDER_CHAT = {
  claude: {
    // guardian/userscript-claude.js chatId()
    re: /\/chat\/([a-zA-Z0-9_-]+)/,
    example: 'https://claude.ai/chat/<id>',
  },
  chatgpt: {
    // guardian/userscript-chatgpt.js chatId()
    re: /\/c\/([a-zA-Z0-9_-]+)/,
    example: 'https://chatgpt.com/c/<id>',
  },
  gemini: {
    // guardian/userscript-gemini.js chatId()
    re: /\/(?:app|chat)\/([a-zA-Z0-9_-]+)/,
    example: 'https://gemini.google.com/app/<id>',
  },
  perplexity: {
    // guardian/userscript-perplexity.js chatId() — note it truncates to 80
    re: /\/search\/(.+)/,
    example: 'https://www.perplexity.ai/search/<slug>',
    truncate: 80,
  },
};

/**
 * _providers() — the canonical NCP provider registry (id + hosts).
 * §10.3 — clear-glass/src/providers/registry.js is the single source of truth
 * for "which hostnames count as which provider". This does not keep a second
 * copy; if the registry is unreachable it says so rather than falling back to
 * a guess that could silently disagree with it.
 */
function _providers() {
  try {
    const reg = require(path.join(__dirname, '..', 'clear-glass', 'src', 'providers', 'registry.js'));
    return reg.NCP_PROVIDERS || null;
  } catch (_) {
    return null;
  }
}

/**
 * parse(url) — { ok, provider, chatId, url, isNewChat } | { ok:false, reason }
 *
 * isNewChat is true for a provider's root/new-conversation URL. That is a
 * legitimate thing to bind ("use claude, start fresh") and is reported as its
 * own state rather than as a parse failure — the userscripts call this same
 * case 'home'.
 */
function parse(url) {
  const raw = String(url || '').trim();
  if (!raw) return { ok: false, reason: 'no url given' };

  let u;
  try { u = new URL(raw); }
  catch (_) { return { ok: false, reason: `not a valid URL: ${raw}` }; }

  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    return { ok: false, reason: `unsupported protocol "${u.protocol}" — expected http(s)` };
  }

  const registry = _providers();
  if (!registry) {
    return { ok: false, reason: 'clear-glass provider registry unreachable — cannot resolve which provider this URL belongs to without it' };
  }

  const host = u.hostname.toLowerCase();
  const entry = Object.values(registry).find(p => (p.hosts || []).some(h => h.toLowerCase() === host));
  if (!entry) {
    const known = Object.values(registry).flatMap(p => p.hosts || []).join(', ');
    return { ok: false, reason: `host "${host}" is not a known NCP provider — known hosts: ${known}` };
  }

  const spec = PROVIDER_CHAT[entry.id];
  if (!spec) {
    return { ok: false, reason: `provider "${entry.id}" is in the registry but has no chat-id pattern here — add one alongside its userscript's chatId()` };
  }

  const m = spec.re.exec(u.pathname);
  if (!m) {
    // Root or an unrecognised path. The userscripts call this 'home'.
    return { ok: true, provider: entry.id, chatId: 'home', url: u.href, isNewChat: true };
  }

  let id = m[1];
  if (spec.truncate) id = id.slice(0, spec.truncate);

  return { ok: true, provider: entry.id, chatId: id, url: u.href, isNewChat: false };
}

/**
 * validate(url, agent) — parse, then check the URL actually belongs to the
 * agent being switched to. "switch to claude and use <a chatgpt url>" is a
 * real mistake worth catching at bind time rather than at dispatch time.
 */
function validate(url, agent) {
  const p = parse(url);
  if (!p.ok) return p;

  const a = String(agent || '').trim().toLowerCase();
  if (a && a !== 'auto' && p.provider !== a) {
    return {
      ok: false,
      reason: `that URL is a ${p.provider} conversation, but the agent is "${a}" — ` +
              `switch to ${p.provider}, or give a ${a} URL (${(PROVIDER_CHAT[a] || {}).example || 'no known pattern'})`,
      provider: p.provider,
      chatId: p.chatId,
    };
  }
  return p;
}

/**
 * compare(target, liveChatId) — is the live tab in the conversation we bound?
 *
 * Four-valued and honest, same discipline as lib/ncp-availability.state():
 *   'match'    — the tab is in the bound conversation right now.
 *   'elsewhere'— the tab is connected and in a DIFFERENT conversation.
 *   'new'      — bound to a fresh conversation; anything the tab is on counts.
 *   'unknown'  — no live chatId to compare against (tab offline, or it has not
 *                heartbeated yet). NOT the same as 'elsewhere'.
 */
function compare(target, liveChatId) {
  if (!target || !target.ok) return 'unknown';
  if (target.isNewChat) return 'new';
  if (liveChatId === null || liveChatId === undefined || liveChatId === '') return 'unknown';
  return String(liveChatId) === String(target.chatId) ? 'match' : 'elsewhere';
}

/**
 * describe(target, liveChatId) — one honest sentence, or null when there is
 * nothing worth saying. Written here rather than at each call site so the
 * wording cannot drift between the tool and the CLI.
 */
function describe(target, liveChatId) {
  const state = compare(target, liveChatId);
  if (state === 'match') return null;
  if (state === 'new') {
    return `Bound to a new ${target.provider} conversation — the next job lands wherever that tab currently is, ` +
           `because NCP has no way to tell a tab which chat to open (see CU1).`;
  }
  if (state === 'elsewhere') {
    return `Bound to ${target.provider} chat ${target.chatId}, but that tab is currently in chat ${liveChatId}. ` +
           `NCP cannot navigate a tab, so the next job goes to ${liveChatId}, not the chat you named — ` +
           `open it in the tab yourself, or see CU1.`;
  }
  return `Bound to ${target.provider} chat ${target.chatId}. No live chat id to compare against — ` +
         `the tab is offline or has not heartbeated yet, so whether it is in that conversation is unknown.`;
}

module.exports = {
  parse, validate, compare, describe,
  PROVIDER_CHAT,
  MODULE_ID: 'lib/chat-target',
  VERSION: '1.0.0',
};
