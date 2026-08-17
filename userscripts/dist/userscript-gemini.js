// BUILT 2026-08-17T04:12:10.999Z by scripts/build-userscripts.js — source: userscripts/src/gemini.entry.js + shared modules. NOT the served copy — see userscripts/dist/README.md.
"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // userscripts/src/shared/chat-logger.js
  var require_chat_logger = __commonJS({
    "userscripts/src/shared/chat-logger.js"(exports, module) {
      "use strict";
      async function logMessage2(msg, ctx) {
        if (!ctx || !ctx.cortexUrl) {
          throw new Error("chat-logger.logMessage: ctx.cortexUrl is required");
        }
        try {
          const res = await fetch(ctx.cortexUrl + "/api/meta/observe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: msg.role,
              text: msg.text,
              sessionId: ctx.sessionId,
              source: ctx.provider
            })
          });
          const d = await res.json();
          if (d && d.result && d.result.signals) {
            if (ctx.onSignals) ctx.onSignals({ ...d.result.signals, role: msg.role, ts: Date.now() });
            if (d.result.pendulum && d.result.pendulum.regime && d.result.pendulum.regime !== "STABLE") {
              if (ctx.onGapRegime) ctx.onGapRegime(msg.role, d.result.pendulum.regime, (d.result.gaps || []).length);
            }
          }
        } catch (_) {
        }
      }
      module.exports = { logMessage: logMessage2, MODULE_ID: "userscripts-chat-logger", VERSION: "0.2.0" };
    }
  });

  // userscripts/src/gemini.entry.js
  var { logMessage } = require_chat_logger();
  if (typeof window !== "undefined") {
    window.__NEXUS_CHAT_LOGGER_BUILD_PROOF__ = { logMessage, builtFrom: "userscripts/src/shared/chat-logger.js" };
  }
})();
