---
chunk_uuid: e8c86846-5a10-413f-a42c-e8a3f3a2114f
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-08-brainos-main-account-manager-js-21979425-md
title: nexus/idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/08-brainos-main-account-manager-js-21979425.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-08-brainos-main-account-manager-js-21979425-md
contract_id: spec-contract:47e02ad5:nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-08-brainos-main-account-manager-js-21979425-md:e8c86846
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:06:03.851Z
---

---
chunk_uuid: 21979425-b93b-47d6-b74b-d19392aa6fff
spec_uuid: 78a72e70-56a9-4c94-987f-c7285f1b1de2
section: brainos-main-account-manager-js
title: BrainOS-main/account-manager.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:78a72e70:brainos-main-account-manager-js
contract_id: spec-contract:78a72e70:brainos-main-account-manager-js:21979425
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:27:34.719Z
---

/**
 * NEXUS Account Manager v2
 * Multi-account per AI provider with persistent profile storage.
 *
 * Fixes applied:
 *   [1] In-memory state cache — loadState() no longer hits disk on every call
 *   [2] Write mutex — concurrent saveState() calls serialized, no corruption
 *   [3] Custom providers persisted to disk — LOGIN_URLS/SELECTORS survive restart
 *   [4] Auto-heal cooldown — isAvailable() writes active status back to disk when cooldown expires
 *   [5] connectAccount try/finally — Playwright context always closed, no leaks
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ACCOUNTS_FILE = path.join(__dirname, 'data', 'accounts.json');
const PROFILES_DIR  = path.join(__dirname, 'profiles');

// ─── In-Memory State Cache (Fix #1) ──────────────────────────────────────────

let _stateCache = null;

function invalidateCache() { _stateCache = null; }

// ─── Write Mutex (Fix #2) ────────────────────────────────────────────────────

let _writeLock = Promise.resolve();

function withLock(fn) {
  _writeLock = _writeLock.then(() => fn()).catch(() => fn());
  return _writeLock;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const BUILTIN_PROVIDERS = {
  claude:      { loginUrl: 'https://claude.ai/login',                    successSelector: '[data-testid="chat-input"], div[contenteditable="true"]' },
  chatgpt:     { loginUrl: 'https://chat.openai.com/auth/login',         successSelector: 'textarea#prompt-textarea, textarea[data-id="root"]'      },
  gemini:      { loginUrl: 'https://gemini.google.com/',                 successSelector: 'rich-textarea [contenteditable="true"], div.ql-editor'   },
  perplexity:  { loginUrl: 'https://www.perplexity.ai/',                 successSelector: 'textarea[placeholder]'                                   },
  mistral:     { loginUrl: 'https://chat.mistral.ai/chat',               successSelector: 'textarea, [contenteditable="true"]'                      },
  copilot:     { loginUrl: 'https://copilot.microsoft.com/',             successSelector: 'textarea, cib-text-input'                                },
  poe:         { loginUrl: 'https://poe.com/',                           successSelector: 'textarea.GrowingTextArea_textArea__ZWQbP'                },
  grok:        { loginUrl: 'https://grok.com/',                          successSelector: 'textarea, [data-testid="tweetTextarea_0"]'                },
  cohere:      { loginUrl: 'https://coral.cohere.com/',                  successSelector: 'textarea[placeholder]'                                   },
};

const DEFAULT_STATE = {
  providers:      Object.fromEntries(Object.keys(BUILTIN_PROVIDERS).map(k => [k, { accounts: {} }])),
  customProviders: {},  // Fix #3: persisted custom provider configs
};

// ─── Storage ──────────────────────────────────────────────────────────────────

function loadState() {
  if (_stateCache) return _stateCache;
  try {
    fs.mkdirSync(path.dirname(ACCOUNTS_FILE), { recursive: true });
    if (!fs.existsSync(ACCOUNTS_FILE)) {
      _stateCache = JSON.parse(JSON.stringify(DEFAULT_STATE));
      return _stateCache;
    }
    _stateCache = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
    // Ensure shape
    if (!_stateCache.providers)       _stateCache.providers       = {};
    if (!_stateCache.customProviders) _stateCache.customProviders = {};
    return _stateCache;
  } catch {
    _stateCache = JSON.parse(JSON.stringify(DEFAULT_STATE));
    return _stateCache;
  }
}

function saveState(state) {
  return withLock(() => {
    fs.mkdirSync(path.dirname(ACCOUNTS_FILE), { recursive: true });
    // Write to temp file then rename — atomic on all platforms
    const tmp = ACCOUNTS_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, ACCOUNTS_FILE);
    _stateCache = state;
  });
}

// ─── Provider Config (builtin + custom) ──────────────────────────────────────

function getProviderConfig(provide