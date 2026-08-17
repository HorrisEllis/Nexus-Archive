# userscripts/dist/ — build output, not the served copy

Files here are produced by `node scripts/build-userscripts.js`, composing
`userscripts/src/shared/*.js` with each provider's `*.entry.js`.

**This is not what Tampermonkey injects today.** The real, live, served
userscripts are `guardian/userscript-{claude,chatgpt,gemini,perplexity}.js`
— unchanged by this build system so far. Promoting a built file here to
the served location is a deliberate, separate, human-reviewed step, not
something the build script does on its own — per LS1's own stated risk:
these four files are live, running, injected into real provider pages.

As of 2026-08-15: only `gemini.entry.js` exists, and it's a
**demonstration build** proving the bundler correctly composes the real
`userscripts/src/shared/chat-logger.js` module — not a full rebuild of
`guardian/userscript-gemini.js`. Wiring `logMessage()` into gemini's
actual DOM message-capture point is real, provider-specific work still to
do, not guessed at from claude's selectors.
