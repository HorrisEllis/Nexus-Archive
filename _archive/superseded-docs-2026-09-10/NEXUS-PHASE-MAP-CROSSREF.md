# NEXUS Phase Map ↔ Source Crossreference

Every PARTIAL / PENDING / OPEN LOOP item from both phase map docs, checked
against the actual files in kern-v2, Causal-Nexus.zip, rfr2, and nexus-v0_53_1.
"Match" means I verified the source file does the thing the phase asks for —
not that it shares a word with the phase name. Two false-positives are called
out explicitly below because the naming collision is easy to fall for.

---

## Real matches — bundled in the zip

| Phase(s) | What's open | Source | Why it fits |
|---|---|---|---|
| **27** System State VM (NEX-VM/1.0) | "Snapshot engine exists, VM not formalized" | `rfr2/packages/nexus/src/{kernel,compress,context,time}` | `compress.snapshot()`/`restore()` is full state serialize/restore. `context.createLiveContext/createReplayContext` is exactly suspend↔resume. `time` gives the monotonic seq/tick separation NEX-VM's `resume_plan` ordering needs. |
| **30** Time-Travel Debugging | "Snapshot engine ready, fork not built" | `rfr2/packages/nexus/src/{clip,context}` | `clip.snapshotRange()`/`restoreClip()` IS the fork primitive — bounded subgraph extraction + replay + stability validation. This is the most direct one-to-one match in the whole corpus. |
| **109** Epistemic Branch Runtime | "Clone state → apply hypothesis → simulate → compare → crystallise" | `rfr2/packages/nexus/src/{clip,context,adapter-sandbox,observer}` | Clone state = `clip.snapshotRange`. Simulate = `context.createReplayContext` (hermetically isolated — side effects nulled via `adapter-sandbox`'s READ_ONLY/LOCAL_ONLY/FULL policy). Compare = `clip.validateClipStability`. This is the cluster your own build order already called "the big one." |
| **95** RAID First-Principles Reinforcement / **OL-17** | "RAID doesn't validate against axioms" | `rfr2/packages/nexus/src/enforcement` | `RuntimeGuard` + `BoundaryIndex` — registry of 25 continuously-monitored invariants, hard stop on violation. This is a runtime-layer axiom check; `constitutional-ai.js` is request-layer. Complementary, not overlapping. |
| **99** Relational field query / **OL-14** `/api/field/*` | "not built" | `rfr2/packages/nexus/src/query` (CQL) | ⚠️ naming note below — wraps `lib/cfr/graph.js`'s `CausalGraph` (which only has ancestors/descendants/jobChain) with an actual query language. Gives you `/api/field/nodes`, `/edges`, `/new-pathways` for free. |
| **105** File Integrity + Delta Types | "lib/cfr/integrity.js... named delta types" | `Causal-Nexus.zip/identity.js` + `delta.js`, cross-referenced against `rfr2/packages/nexus/src/{identity,delta}` | Standalone zip's `delta.js` is 600 lines vs rfr2's 455 — likely more named types enumerated; both included so you can pick. `identity.js`'s 3-axis model (id/contentHash/replayOf) is the dedup-and-integrity primitive Phase 105 wants. |

**⚠️ Phase 99 naming note:** "Relational Field" here is CFR's own causal-graph terminology (`lib/cfr/field.js` = coherence/friction/resonance/entropy — system health physics), **not** human-relationship data. I checked — there's no overlap with rfr2's people-modeling packages here, no consent question applies to this one.

---

## Already done — confirmed, not bundled

| Phase | Status | Evidence |
|---|---|---|
| **14** Hot Module Loader | Phase map says ✅, and it's real | `lib/hot-loader.js` (221 ln) — full QUARANTINE→PROVE→INTEGRATE→MONITOR, accepts raw source strings, sigma-gated rollback. **Better** than Causal-Nexus's `loader.js`, which targets browser blob-URL import as its primary strategy — wrong runtime for NEXUS's Node services anyway. My earlier recommendation to port `loader.js` was wrong; retracted. |
| Liminal 12 detectors (Phase 3 meta layer) | ✅ | `lib/meta/liminal/index.js`, wired into `request-handler.js` |

---

## False-positive name matches — checked, no real fit

| Phase | Tempting source | Why it doesn't actually match |
|---|---|---|
| **41** Compiler knowledge layer — "six projections" | Causal-Nexus's `projection.js` (read-only kernel views) | Different domain entirely — Phase 41's "six projections" (`.comp/.cli/.grammar/.ui/.config/.seam/.doc`) are UI/CLI descriptor outputs, already built in `lib/descriptor-projector.js`. Coincidental word overlap only. |
| **50** Pattern Graph | rfr2's pattern/forge packages | Already covered by NEXUS's own `lib/causal/compound.js` (ripple/wave/tidal). No external gap. |

---

## No source found anywhere — would need an original build

- **OL-13 / Phase 99's counterfactual half** — `counterfactual.js` doesn't exist in any of the four sources. Spec-only everywhere.
- **Phase 38** (unified pipeline), **47** (pattern engine novelty), **94** (meta observer), **97/48** (CFR→RAID wire) — these are internal wiring between modules NEXUS already has. No external file solves them; they're integration work, not missing code.

---

## Deliberately excluded from the zip

- **kern-v2** — every file. No phase-map item points at it; its actual fit (Ed25519 mesh identity for untrusted peers) is `nexus-v0_53_1/bridge/erosmancer-os`, a different, unconfirmed project. Not bundled.
- **nexus-v0_53_1** — entirely. Old architecture, no unique phase-map match found beyond the unconfirmed erosmancer-os question above.
- **rfr2's `resonance`, `irs.js`, `relational.js`** — people-modeling category, still needs your explicit per-item yes, not bundled under a phase-map pretext.
- **Causal-Nexus's `forge`, `gui`** — forge already consumed (`cockpit/forge.js` matches its v5.0.0 contract); gui explicitly removed per the v5.0.0 spec itself.
