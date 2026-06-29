# Sovereign System Spec Audit — All Systems Against nexus-system-foundation@1.0.0

Every claim below was checked against the actual file (registry-components.js,
service.js, or the equivalent), not against the old spec's word. Where a spec
made a claim the code doesn't back up, that's called out explicitly rather
than quietly fixed — same reasoning as the version.js precedent for
MANIFEST.json/README.md: don't silently rewrite to hide a discrepancy.

## Summary table

| System | Spec existed | Version sync | Structure (core/events) | Handshake matches code | AX-008 (copilot reach) |
|---|---|---|---|---|---|
| orchestrator | ✅ | ✅ | ✅ | n/a (root) | n/a |
| bridge | ✅ | ✅ | ✅ but missing AX-007 | ❌ spec listed 2 routes, code has 11, **none matched** | ❌ open |
| cortex | ✅ | 🔧 fixed (3.0.0→3.2.0) | ✅ | ✅ (spot-checked) | ✅ wires to copilot |
| guardian | ✅ | 🔧 fixed (3.6.0→3.6.1) | ✅ | ✅ (spot-checked) | ✅ wires to copilot |
| idearium | ✅ | ✅ | 🔧 fixed — axioms were undeclared | ✅ | ❌ **zero hooks.out anywhere in the file** |
| architect | ✅ | 🔧 **three-way drift**, see below | 🔧 rewritten — used `build_order:`, not core/events at all | ❌ spec described an unbuilt v2 (templates, canvas, 5 UI panels) — 0 of those routes exist in code | ❌ open |
| emerge | ✅ | ✅ | 🔧 fixed — no core/events at all | ❌ spec listed 2 routes (`emerge.run`/`emerge.validate`), code has 9, **none matched** | ⚠️ needs live verification (transitive via cortex) |
| diagnostic | ✅ | ✅ | 🔧 fixed | ❌ **no registry-components.js exists at all** — spec describes a handshake the code doesn't implement | ❌ can't close until the code gap is closed |
| copilot | ✅ | ✅ | ✅ | ✅ | n/a (is copilot) |
| eravos | ❌ **no spec file existed** | — | ✅ written fresh from the exported module | ✅ | ❌ open |
| ollama | ✅ | ✅ | ✅ | not audited this pass | ✅ wires to copilot (confirmed earlier session) |

## The architect three-way version drift — worth its own line

Three different sources claimed three different versions for the same system:
- `lib/version.js` (the canonical one, by its own header): **1.0.0**
- `docs/architect.spec` (before this fix): **2.0.0** — described as a v2 with
  a template library and 5-panel UI, **none of which exists in
  `architect/registry-components.js`**
- `architect/service.js` line 621, `busEmit('architect.booted', { version: '3.0.0', ... })`: **3.0.0**, hardcoded as a literal string

`spec-drift.js` only catches the first two — it diffs spec against
`lib/version.js`. It has no way to see the third, because the third is a
hardcoded string inside the service's own boot event, not a declared version
anywhere it reads. That's a real blind spot in the drift checker itself, not
just in architect's spec — worth knowing about for every other system too.

## A second blind spot found the same way

`lib/version.js` calls itself "the single source of truth for all system and
module versions." **eravos and copilot are not in it at all** — not drifted,
just absent. Both are real, running, sovereign systems with their own ports
(3751, 3750) since Phase 74/76. `spec-drift.js` can't flag a system that
isn't in either source to begin with — it never even checked them. Suggested
addition (not applied — that file's yours):

```js
services: {
  // ...existing 8...
  eravos:   '3.0.0',   // :3751 — sovereign canvas, organisms/wires/transport
  copilot:  '2.0.0',   // :3750 — confirmed synced with docs/copilot.spec
}
```

## Mechanical fixes applied (no structural issues, just version sync)

Per `spec-drift.js`'s own report (re-ran it live, matches Phase 111's 7/9 count exactly):

| System | Was | Now |
|---|---|---|
| cortex | 3.0.0 | 3.2.0 |
| guardian | 3.6.0 | 3.6.1 |
| escalation | 1.0.0 | 1.1.0 |
| snapshot | 1.0.0 | 1.2.0 |
| grammar-engine | 1.3.0 | 1.2.0 |
| replay-engine | 1.0.0 | 1.1.0 |

## Still open — the 9 modules with no spec at all (Phase 111, not touched this pass)

You asked for sovereign systems specifically — these are `lib/` modules, not
sovereign systems, so I left them for a separate pass:
`gap-finder`, `divergence-watcher`, `macro-compiler`, `ncp`, `grammar-fallback`,
`mutation-contract`, `open-loop-taxonomy`, `loop-topology`, `gap-loop`.
Already fully scoped — `spec-drift.js` names exactly what's missing for each.

## What's in the attached zip

- `architect.spec` — rewritten: real v1.0.0 core/events/routes/handshake
  matching code exactly; old v2 design preserved as `v2_proposed`, not deleted
- `emerge.spec`, `diagnostic.spec` — core/events added, handshake corrected to match real components
- `eravos.spec` — new, written from the system's own exported module
- `bridge.spec` — handshake corrected (was 2 fake routes, now the real 11), AX-007/AX-008/L4-EXTERNAL added
- `idearium.spec` — axioms added, AX-008 violation flagged (zero hooks.out anywhere)
- `cortex.spec`, `guardian.spec`, `escalation.spec`, `snapshot.spec`, `grammar-engine.spec`, `replay-engine.spec` — version sync only
