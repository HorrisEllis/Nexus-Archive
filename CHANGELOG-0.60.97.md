# 0.60.97 -- 2026-10-16

James: "looook at clearglass, trying to get chatgpt signed in" -- with a screenshot of Google's window, titled "Sign in - Google
Accounts": "We've detected a problem with your cookie settings." Behind it, the Plan panel shows guardian dispatching to ChatGPT
every few seconds (task.build / phase.escalating, ollama out of memory so each file escalates to `chatgpt`).

## What was wrong (read in the code; Electron cannot run here, so this is not yet seen working)

- **0.60.51 fixed the Accounts portal only.** `LoginPortal.open()` parks the provider tabs, quiets the session hub and takes the
  jar for itself. A sign-in that starts **in the ChatGPT tab** (Log in -> Continue with Google, in the tab or a popup of it) never
  went through the portal, so none of that applied.
- **That sign-in runs in `persist:ncp-chatgpt`, the one provider jar, while guardian keeps using it:**
  - `account-switch` `use()` / `sync()` restore the account's saved cookies with `replace:true` and reload the provider's tabs;
  - `settled()` saves to, or removes from, the vault depending on what the jar holds at that moment;
  - `attention` sends a ChatGPT window on a sign-in page back to the chat (loginOptional) unless it is focused.
  Google sets a test cookie on one page and reads it back on the next; any of these between the two is that error.

## What changed

- `src/providers/account-switch.js`: `freeze(provider) -> release()` and `isFrozen()`. While frozen `use`, `sync` and `settled`
  skip (and say why); counted, so two sign-ins in flight need two releases.
- `src/providers/host.js`: `_guardSignIn` -- while any window of a provider (or a popup it opens) is on a sign-in host (Google,
  Microsoft, Apple, OpenAI's auth) it calls `signInGuard(providerId)`, and releases when the window leaves, closes, or after 15
  minutes. It logs the Google/OpenAI cookie changes by name and cause only (never a value) when the sign-in ends.
- `src/main/index.js`: `providerHost.signInGuard` = session-hub `quiet()` + account-switch `freeze()`; one `settled()` after release.
- `src/providers/attention.js`: a window that is mid sign-in is not bounced back to the chat.
- `clear-glass/test/signin-in-provider-tab.test.js` (in the clear-glass test script): freeze semantics, one guard per sign-in,
  popup guarded at once and released on close, cookie log has no values.

## If it still says "cookie settings"

The log line `[ProviderHost] chatgpt -- cookie changes during the sign-in: ...` names which cookie (`GAPS`, `__Host-GAPS`, ...) was
set or removed and by what cause. That, plus whether the Plan panel kept dispatching during it, is what to look at next.
