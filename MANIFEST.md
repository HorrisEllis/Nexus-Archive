# PATCH MANIFEST — nexus-v0_9_8, 2026-06-22, critical fix

You were right, this was wrong. 4 files. Full suite: 664 passed, 2 failed
(same pre-existing test-liminal-space.js failures, unrelated, confirmed
again).

## What was wrong

co-pilot's narrator was sending the "chatgpt" path through
`guardian/api-dispatch.js`'s direct OpenAI API call — needs
OPENAI_API_KEY, a paid-API mechanism. That's a real thing in this
codebase (`cortex/agents/chatgpt`'s RAID job-queue fallback uses it on
purpose), but it has no business being the default for an everyday
narrator with no key configured, and it's not what NEXUS is built around.

## What it does now

`guardian/server.js` gained `dispatchJobAndWait(provider, prompt, opts)` —
a Promise wrapper around the REAL path: `createJob()` + `dispatchJob()`,
the exact mechanism `/cli/exec`'s `send <provider> <prompt>` command
already uses. That means the actual logged-in chatgpt.com browser tab via
`guardian/userscript-chatgpt.js` + `lib/ncp.js` — no API key, no per-token
cost.

`co-pilot/index.js` no longer requires `guardian/api-dispatch.js` at all
— enforced by a real test now (CP-13 checks the source for that
`require()` and fails if it's back). The `_apiDispatch` dependency is
gone; `_dispatchAndWait` is injected from guardian's boot sequence
instead.

One real constraint worth knowing: the NCP job shape has no separate
system-role field — `handleJob()` in the userscript just concatenates
prompt+content into one message. `_narrate()` now builds one combined
string itself (context first, `=== USER ===`, then the actual prompt)
rather than depending on that concatenation's exact field order.

And the actual caveat that matters for you right now: this path needs a
**real chatgpt.com tab open with the userscript installed and connected**.
If none is connected, the job queues and the 90s timeout from the last
patch will fire before a human opens one — you'll get a clear timeout
error, not a hang, but it won't magically work with zero tabs open either.
ollama-first should still be your default in practice; this just makes
the fallback honest about what it actually calls.

## Tests

`tests/modules/copilot.test.js`: 12/12 → 13/13. CP-09 through CP-12
rewritten to mock `dispatchAndWait` instead of `apiDispatch`. New CP-13
asserts the `require()` is gone for good, not just patched this once.

`docs/copilot.spec`: v1.1.0 → v1.2.0, changelog entry added, the
`chatgpt_path` section corrected to describe what's actually there now
instead of what used to be there.
