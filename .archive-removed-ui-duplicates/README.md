# Removed UI duplicates — 2026-06-24

These three files used to live at `ui/cortex/index.html`, `ui/guardian/index.html`,
and `ui/idearium/index.html`. They were stale mirrors of the real UIs at
`cortex/ui/`, `guardian/ui/`, `idearium/ui/` — supposed to be kept in sync by an
`npm run sync-ui` script that was never actually built (checked package.json
directly — no such script, never existed).

In practice this meant `orchestrator.js`'s `/ui/:system` route was serving these
stale copies instead of the real UIs. Worst case: `ui/guardian/index.html` was
17KB with zero cockpit/Forge IDE content, while the real `guardian/ui/index.html`
is 243KB and has the actual feature set — every request through the home shell's
Guardian tab was serving the placeholder, silently.

`orchestrator.js` was changed (§CONSOLIDATE-2026-06-24) to serve cortex, guardian,
and idearium directly from their system-local `ui/` directories. These three
files are archived here, not deleted, in case anything else was depending on the
old root path that wasn't caught. If nothing breaks, they can be deleted outright
later.
