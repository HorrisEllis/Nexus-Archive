# NEXUS Spec Registry
**Author:** James Brooks (Erosmancer)
**Created:** 2026-06-29 (session 8)
**Status:** Living document — §6.3 (`docs/AXIOMS-v3.0.md`). Every `.spec` file
is entered here on creation. This registry is updated every time a spec is
checked for drift, not just when it's written — a spec not in this table
is unaccounted for.

**88 spec files exist in `docs/` as of this session.** Most have not been
checked against live code in this conversation — that's stated honestly
below, not glossed over. 17 have been, with real findings, across sessions
3 through 7. The other 71 are real work still ahead, not assumed clean.

## Status legend
- ✓ — checked against live code, no drift found (or drift found and closed)
- ⚠ PARTIAL — checked, some drift found, not fully resolved
- ✗ DRIFTED — checked, real drift found, open
- — not yet checked this pass — no claim either way

---

| Spec | Version | Last drift-check | Status |
|------|---------|-------------------|--------|
| `alk-perception.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `api-dispatch.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `architect.spec` | 1.0.0 | 2026-06-28 | ✗ DRIFTED — 3-way version split: spec says 2.0.0, lib/version.js says 1.0.0, service.js boot event hardcodes '3.0.0'. Not yet reconciled. |
| `auth.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `autonomous-loop.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `bda.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `behavioral-boundary.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `blueprint.spec` | 1.1.0 | — | not yet checked against live code this pass |
| `bridge.spec` | 3.0.0 | 2026-06-28 | ⚠ PARTIAL — described routes not found in live registry-components.js. Mechanical version sync applied, route drift not. |
| `builder.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `case-library.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `cfr-contract-wire.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `cfr.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `chat-logger.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `cli-reasoning.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `cli.spec` | 1.4.0 | — | not yet checked against live code this pass |
| `component-registry.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `constitutional-ai.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `context-builder.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `contract-queue.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `contracts.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `copilot-expansion.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `copilot-migration-and-new-capabilities.spec` | 1.1.0 | 2026-06-29 | ✓ filed session 6 — MIG-01 resolved, MIG-02 resolved differently than proposed, MIG-03 unverifiable (file not in tree), capability_cli_authoring built session 6. |
| `copilot.spec` | 2.0.0 | — | not yet checked against live code this pass |
| `cortex-dual-cognition.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `cortex.spec` | 3.2.0 | 2026-06-29 | ⚠ PARTIAL — version synced session 3. Phase 84/85 intelligence description overstated vs. code (session 6 finding) — not yet corrected here. |
| `cos.spec` | 1.5.0 | — | not yet checked against live code this pass |
| `diagnostic-engines.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `diagnostic-fixes.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `diagnostic-phase-map.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `diagnostic.spec` | 1.0.0 | 2026-06-28 | ✗ DRIFTED — describes a registry-components.js and handshake that don't exist in code. Flagged, not fixed (code gap, not a doc fix). |
| `emerge.spec` | 1.0.0 | 2026-06-28 | ⚠ PARTIAL — described routes not found in live registry. Mechanical sync only. |
| `eravos.spec` | 3.0.0 | 2026-06-28 | ✓ written fresh session 3 — no prior spec existed, generated from the live exported module. |
| `erosmancer.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `escalation.spec` | 1.1.0 | 2026-06-28 | ✓ mechanical version sync only, no further drift found. |
| `forge.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `gap-lifecycle.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `grammar-engine.spec` | 1.2.0 | 2026-06-28 | ✓ mechanical version sync only, no further drift found. |
| `guardian-user-understanding.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `guardian.spec` | 3.6.1 | 2026-06-28 | ✓ mechanical version sync only, no further drift found. |
| `healer.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `heartbeat.spec` | 2.0.0 | — | not yet checked against live code this pass |
| `home-ui.spec` | 1.3.0 | — | not yet checked against live code this pass |
| `hooks.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `hot-module-loader.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `idearium.spec` | 3.0.0 | 2026-06-29 | ✓ AX-008 closed session 5/7 (idearium→copilot wire built and verified) — this spec's axioms list updated to match. |
| `intelligence-bridge.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `intelligence.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `jaa-db.spec` | 6.0.0 | — | not yet checked against live code this pass |
| `lib.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `liminal-space.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `liminal.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `mcp.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `meta-layer.spec` | 1.2.0 | — | not yet checked against live code this pass |
| `nexus-analysis-module-foundation.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `nexus-cli.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `nexus-improvement-roadmap.spec` | 1.0.0 | 2026-06-29 | ⚠ PARTIAL — IMP-02 corrected proposed→built (lib/file-integrity.js, verified). Other 29 items still uniformly 'proposed', not re-audited. |
| `nexus-organisms.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `nexus-shell-ui.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `nexus-system-foundation-addendum-v1.1.0.spec` | 1.1.0 | 2026-06-29 | ⚠ SUPERSEDED — folded into nexus-system-foundation.spec v1.1.0. Kept as historical record only. |
| `nexus-system-foundation.spec` | 1.1.0 | 2026-06-29 | ✓ LIVING — this is the spec governing all specs. AX-008/009 promoted in from the addendum, AX-010 added, hooks added to interaction_contract. Addendum file superseded. |
| `nexus.spec` | 2.0.0 | — | not yet checked against live code this pass |
| `ollama.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `orchestrator.spec` | 2.0.0 | — | not yet checked against live code this pass |
| `phase-map.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `raid-snr-filter.spec` | 1.1.0 | — | not yet checked against live code this pass |
| `raid.spec` | 6.2.0 | 2026-06-29 | ✓ CORE BUILT — cortex/core/raid/index.js + cortex/contract/index.js built session 7, 21/21 against pre-existing tests. Layer-2 fitness (role_confidence/topological_proximity/SNR_tier_gate) honestly stubbed — named dependencies not yet built. |
| `reflection-engine.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `replay-engine.spec` | 1.1.0 | 2026-06-29 | ⚠ PARTIAL — lib/replay-engine.js is real but has zero test coverage in this tree; a prior audit's "16/16 tests" claim actually described a different project (erosmancer-os). Comparison baseline needs re-establishing. |
| `request-handler.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `seam-component-registry.spec` | 1.1.0 | — | not yet checked against live code this pass |
| `seam-queue.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `seam.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `self-heal.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `service.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `siso.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `snapshot.spec` | 1.2.0 | 2026-06-28 | ✓ mechanical version sync only, no further drift found. |
| `spatial.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `spec-compiler.spec` | 1.1.0 | — | not yet checked against live code this pass |
| `spec-drift.spec` | 1.1.0 | — | not yet checked against live code this pass |
| `telemetry-codec.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `tests.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `topo-kernel.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `ui-location.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `ui-registry.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `ui.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `user-model.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `vector-memory.spec` | 1.0.0 | — | not yet checked against live code this pass |
