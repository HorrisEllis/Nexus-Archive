# 0.60.99 -- 2026-10-16

James: "the login screen for chatgpt still keeps closing immedie" -- sent after 0.60.98, with the earlier lines repeated: "it needs to
have profile or hat dependantat cookies. or compartmenrt cookies. like we need multiaccount routing. also i cant sign into chatgpt,
it closes the login evey time i clikc it"

Context: "closes the login" had now been fixed three times -- 0.60.45, 0.60.52, 0.60.98 -- each in `providers/attention.js`, each by
stopping one way the panel could *hide* the window. It kept happening. That is the evidence the cause was not a hide. He did not
accept the third fix as done; the repeat report is what sent this release past `attention.js`.

## What was wrong (read in the code, then reproduced with fakes; Electron and chatgpt.com cannot run here)

- **`ProviderHost._sweepIdle()` destroyed the window he was signing in on.** Every 15 s it calls `stop()` -> `win.destroy()` on any
  provider window with no dispatch for 2 minutes. It never asked whether the window was on screen.
- **`stop()` left the idle clock behind.** `_lastUsed` was set in `touch()` and read by the sweep; nothing ever deleted it, and
  neither `start()`, `show()` nor `attention.attend()` refreshed it. So: ChatGPT idles out and is stopped (as intended) -> a sign-in
  is needed -> `attend()` calls `start({ show: true })` -> the new window inherits the OLD time -> the next 15 s tick destroys it.
  Every click, deterministically. That is "closes immediately, every time".
- **Its twin for per-account tabs.** `_sweepIdleAgentTabs()` closed a profile tab after 15 minutes idle even with the person in it.
- **A second, smaller gap in multi-account routing.** 0.60.98 gave a non-primary account its own jar to sign in in, but when that
  sign-in window closed the account's OWN provider tab (if already open, signed out) was never reloaded. `endSignIn()` does that for
  the primary; a profile account has no `endSignIn`. Jobs routed to the account kept finding a signed-out page.
- **A smaller one in the same window:** `LoginPortal.open()` made the window before cleaning the session's user agent, and Electron's
  `setUserAgent` does not reach a webContents that already exists, so a profile account's first sign-in window still said "Electron".

## What changed

- `src/providers/host.js`:
  - `_inUse(win)` (visible or minimised) and `_isSigningIn(providerId)`; the shared-window sweep and the agent-tab sweep both skip
    a window that is either. A hidden, idle window is still stopped: the memory-freeing job of the sweep is unchanged.
  - `stop()` clears the provider's idle clock; `start()` and `show()` count as use.
  - `_guardSignIn` also marks the provider as mid sign-in while any of its windows is on Google / Microsoft / Apple / OpenAI auth.
- `src/providers/attention.js`: `attend()` touches the provider -- a window he is asked to use is not idle.
- `src/providers/profile-tabs.js`: `reload(provider, accountId)`. `src/accounts/login-portal.js`: takes `profileTabs`; closing a
  profile account's sign-in window reloads that account's tab (a reload, not a close: it keeps its chat). `src/main/index.js` wires it.
- `src/accounts/login-portal.js`: the session (and its Chrome-not-Electron user agent) is made before the window.
- Tests (both in the clear-glass `test` script): `test/provider-idle-signin.test.js` (10) and `test/signin-profile-tab-reload.test.js`.

## Proof

- **The new test fails on the old code.** Run against 0.60.98's `host.js`: 1 passed, 9 failed. IS-05 replays the loop above (idle-stop,
  reopen to sign in, next tick) and fails with "destroyed by the very next sweep tick". IS-02, the control (a hidden idle window is
  still stopped), passes on both. Against this release: 10/10.
- clear-glass suite, before vs after: identical. The failures it already had (`jsdom` and `js-yaml` are not installed in the zip;
  `gig-file` and `network-install` fail on 0.60.98 too) are unchanged. `signin-in-provider-tab`, `signin-profile-jar`,
  `signin-window-quiet`, `login-portal-elsewhere`, `session-hub`, `provider-account-sync` all pass.
- `tests/modules/test-cg-accounts-portal-settings` 31/31, `test-cg-attention-focus` 6/6, `test-plan-code-run-attention` 40/40.

## Not proven

- **Not seen running.** This is the same caveat 0.60.98 made. What confirms it: while the ChatGPT window is open, the console no
  longer prints `[ProviderHost] chatgpt idle for <n>s -- stopping to free real memory`. If that line appeared right before the window
  vanished on a previous run, it was this.
- **If the window still closes**, the next suspects are ChatGPT's own page calling `window.close()` on the auth step, or
  `attention.js`'s hide on leaving the sign-in page. The log line for the second is `[attention] chatgpt -- left the sign-in page (<url>)`.
  Send whichever lines appear and the next fix starts from evidence, not from the code.
- **Google's "This browser or app may not be secure"** is untouched, as in 0.60.98 (a Google check on the embedded browser; not worked around).
