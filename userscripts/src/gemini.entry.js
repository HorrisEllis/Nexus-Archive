'use strict';
/**
 * userscripts/src/gemini.entry.js — §DEMONSTRATION BUILD, not the served
 * userscript. Proves the bundler correctly resolves and includes the real
 * shared chat-logger module. Native fetch()-based now, no GM_* pretense —
 * ClearGlass's executeJavaScript() injection is the only real consumer.
 *
 * §NOT YET DONE, stated plainly: this does not replace guardian/
 * userscript-gemini.js. Wiring logMessage() into gemini's actual DOM
 * message-capture point is real, provider-specific work still to do.
 */
const { logMessage } = require('./shared/chat-logger.js');

if (typeof window !== 'undefined') {
  window.__NEXUS_CHAT_LOGGER_BUILD_PROOF__ = { logMessage, builtFrom: 'userscripts/src/shared/chat-logger.js' };
}
