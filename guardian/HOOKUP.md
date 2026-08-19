# Hooking the wake word into each provider userscript

Add to `guardian/userscript-chatgpt.js`, `-claude.js`, `-gemini.js`, `-perplexity.js`.

## 1. Load it (top of file, after the constants block ~line 25)

```js
// @require file:///…/guardian/userscript-nexus-wake.js
// or, if ProviderHost concatenates scripts, just ensure it loads first —
// it attaches window.NexusWake and does nothing until install() is called.
```

## 2. Arm it (once, where the script finishes booting)

```js
const NEXUS = window.NexusWake.install({
  provider: PROVIDER,      // 'chatgpt' | 'claude' | 'gemini' | 'perplexity'
  tabId:    MY_TAB,
  log:      (m) => console.log(m),
  // hintMode defaults per provider — 'once' on flat-rate, 'off' on claude.
  // hintMode: 'every',    // available; deliberately not a default
});
```

That's the whole listener. `install()` attaches a capture-phase `keydown` on
`document`, so it beats the host app's own Enter handler.

## 3. Optional — the agent hint on outgoing prompts

Only needed if you want the **model** to know NEXUS is queryable. Wrap the text
just before it's injected:

```js
function injectText(text) {
  text = NEXUS ? NEXUS.decorate(text) : text;    // ← one line
  …existing body unchanged…
}
```

And on a new conversation, so "once" means once per chat:

```js
NEXUS.resetHint();
```

---

## What happens

**You type** `hey nexus, what gaps are open?` and press Enter:

1. Capture-phase handler matches, calls `preventDefault` + `stopPropagation` +
   `stopImmediatePropagation` — the turn never reaches ChatGPT
2. Composer is cleared
3. `POST http://127.0.0.1:3750/api/prompt` with a per-tab `sessionId`
4. Answer renders in a panel bottom-right

**Anything else** you type is untouched. `can you explain nexus to me` goes to the
host model exactly as before.

## §UPDATE 2026-08-19 — wired for real, and pointed at the full tool loop

All four provider scripts (`userscript-chatgpt.js`, `-claude.js`, `-gemini.js`,
`-perplexity.js`) now have steps 2 and 3 below actually applied — they weren't
before this pass; the module existed with 18 passing tests but nothing called
`install()`. Step 1 (`@require`) never worked as written either: ProviderHost
(`clear-glass/src/providers/host.js`) injects each provider's *exact unmodified*
file via `executeJavaScript`, no `@require` resolution. Fixed at the loader
instead — `_inject()` now loads this file as a shared prelude, the same way it
already loads the GM shim, so `window.NexusWake` exists before any provider
script runs.

**The endpoint also changed.** `COPILOT_PROMPT` now targets `/api/prompt/tools`,
not `/api/prompt`. The intent behind this doc was always "co-pilot has all it
needs to work on nexus" — `/api/prompt` is real and intent-routed but does not
run the agentic tool loop (no `read_file`, `diagnose`, `nexus-map`, nothing that
touches real state mid-answer). `/api/prompt/tools` is `copilot/tool-runtime.js`'s
`run()`, the same loop co-pilot runs for everything else, with the full
`lib/agent-tools` registry — including the new `agent_chat` tool below, so "hey
nexus, ask gemini to..." works from inside the loop, not just "hey nexus" itself.

**Agent-to-agent: `agent_chat` tool, `lib/agent-chat.js`.** Addresses ONE agent
(as opposed to `agent_council`'s fan-out to several) with a hop cap so a relayed
chain can't loop back through an agent already in it, and logs every exchange to
`guardian_chat_log` — which had zero writers anywhere in the tree before this.
Dispatch is injected: the tool wrapper supplies `copilot/tool-runtime.js`'s
`runViaAgent`, so chatgpt/gemini/claude/perplexity get the SAME real tool access
to nexus this loop has when addressed this way, not a bare completion.

## Endpoint — a correction worth knowing

This first pointed at guardian's copilot relay. That route calls `askSync()`, which
**dispatches to another provider** — so "hey nexus" would have gone back out to
ChatGPT and returned a model's guess about NEXUS wearing co-pilot's name. Same
failure as the fabricated compartments answer, with a more convincing label.

It now targets the sovereign co-pilot on `:3750` — the one with the tool index, gap
field, component registry and ledger. Guardian's own comments at lines 2854 and 3011
say so: *"sovereign copilot service at :3750 handles these."*

Cross-origin works because `copilot/server.js` already sends
`Access-Control-Allow-Origin: *` — checked, not assumed.

## Hint modes

| provider | default | why |
|---|---|---|
| chatgpt, gemini, perplexity | `once` | flat-rate; once is enough for the model to know the tool exists |
| claude | `off` | metered, and you're usually driving that tab yourself |
| — | `every` | available because you asked; **not** any provider's default |

You were right that tokens don't matter on the flat-rate tabs, so I dropped that
objection. The reason `every` still isn't the default is behavioural, not economic:
identical trailing text on every turn is what makes a model start remarking on it,
explaining it back, or treating it as an instruction. `once` gets you the capability
without that.

The on-screen reminder is separate — it goes in the composer placeholder, where the
person typing can see it, rather than in the prompt where only the model can.

## Two bugs this file caught in itself

**NW-005 failed while the code was correct** — the literal path appeared in the comment
explaining why I'd moved off it. Exactly the BL-001 trap from 2026-08-17: a
string-scanning test can't tell code from prose. Fixed on both sides — the comment no
longer spells it, and the test strips comments first.

**Then the stripper ate the URL.** `/\/\/[^\n]*/` matches the `//` in `http://`, so
the test reported the endpoint missing from its own source. Now `(?<!:)\/\/`. Both are
the same shape of mistake: a scanner mistaking one kind of text for another.
