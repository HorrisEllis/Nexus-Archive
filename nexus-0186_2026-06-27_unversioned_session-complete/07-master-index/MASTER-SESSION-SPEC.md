# NEXUS Session Master Spec — Everything So Far
**Living document, append-only, same convention as SYSTEM-MAP/PHASE-MAP.**
Indexes every artifact produced this session plus every decision made along
the way — including the ones that changed direction mid-session. Where an
earlier turn got something wrong, that correction is recorded here too,
not quietly dropped.

---

## §1. Source audit — what's in each uploaded project, what's redundant

**Full detail:** `NEXUS-INTEGRATION-MAP.md`

- `kern-v2` — not a NEXUS fit. Real value (Ed25519 mesh identity, replay
  protection, grammar-intersection handshake) belongs to a foreign-system
  peer category NEXUS's internal bridge doesn't have — see §3 L4-EXTERNAL.
- `Causal-Nexus.zip` (14 modules, v5.0.0-ish) — mostly redundant with
  CFR-Ω/ESS/SISO. Two real gaps: `query` (CQL — CFR's graph has no query
  language) and `loader` — **superseded**, see correction in §4.
- `rfr2/packages/nexus` (real v6.0.0, 21 modules) — six modules genuinely
  new: `enforcement`, `version-gate`, `clip`, `context`, `observer`,
  `adapter-sandbox`. Built for exactly Phase 27/30/109's clone-simulate-
  compare problem.
- `rfr2`'s liminal/telemetry-codec/topo-kernel — **already ported**,
  already wired into `request-handler.js`. Don't re-port.
- `rfr2/packages/resonance`, raw `irs.js`, `relational.js` — people-modeling
  category. Itemized in §6, not bundled.
- `nexus-v0_53_1` — old architecture, superseded, except the unconfirmed
  `bridge/erosmancer-os` question — **resolved in §5**: it's a browser
  automation engine (CDP/DOM), not Bridge OS. Open question stays open.

## §2. Phase-map crossreference — what's real, what's a false-positive name match

**Full detail:** `NEXUS-PHASE-MAP-CROSSREF.md`, `sovereign-system-specs-fixed.zip`

Real matches: Phase 27/30/109 (epistemic branch runtime cluster), Phase 95/
OL-17 (`enforcement`), Phase 99/OL-14 (CQL — confirmed this is CFR's own
graph terminology, not human-relationship data), Phase 105 (`identity`/`delta`).

**Correction made mid-session:** Phase 14 (Hot Module Loader) was reported
as a gap needing Causal-Nexus's `loader.js` ported in. Wrong — `lib/hot-
loader.js` already exists, already does QUARANTINE→PROVE→INTEGRATE→MONITOR
with sigma rollback, and is *better* than `loader.js` (which targets
browser blob-URL imports — wrong runtime for NEXUS's Node services).
Retracted in the same session it was proposed.

False-positive name matches, checked and ruled out: Phase 41 "projections"
(UI descriptor output, unrelated to Causal-Nexus's kernel-state projections),
Phase 50 "pattern graph" (already covered by `lib/causal/compound.js`).

## §3. Foundation addendum v1.1.0 — two new requirements

**Full detail:** `nexus-system-foundation-addendum-v1.1.0.spec`

- **AX-008**: every component's hook graph must reach `copilot.*` within N
  hops. Mechanism already exists (cortex/guardian/ollama/copilot already do
  this) — just not universal. Checked via `enforcement`'s BoundaryIndex as
  invariant #26.
- **L4-EXTERNAL**: a second, parallel handshake path for foreign sovereign
  systems (not the internal 9 known services) — kern-v2's Ed25519 +
  grammar-intersection, re-scoped from "untrusted mesh peer" to
  "known-but-foreign sovereign project." Explicitly not a replacement for
  `bridge/identity.js`.

## §4. Analysis-module template

**Full detail:** `nexus-analysis-module-foundation.spec`

Specialization of the base foundation for time-series-shape modules
(S-curves, regime changes, divergence). Required imports: `sigma.js`,
`delta.js`, `CausalGraph` — don't reimplement divergence scoring per module.
`module-builder.js`'s `generateSpec()` should route here for anything
whose purpose mentions trend/curve/growth/saturation/regime.

## §5. Sovereign system audit — structural, not just version

**Full detail:** `AUDIT-SUMMARY.md` inside `sovereign-system-specs-fixed.zip`

Ran `spec-drift.js` live: 35 synced, 7 drifted, 9 missing (matches Phase
111 exactly). Then went deeper than the tool does — structural compliance
against L0-L5, not just version numbers:

- **`architect`** had a **three-way** version drift the tool itself can't
  see (`lib/version.js`=1.0.0, spec said 2.0.0 describing an unbuilt v2,
  `service.js` line 621 hardcodes a *third* number, `'3.0.0'`, in its own
  boot event). Rewrote the spec to match reality; preserved the unbuilt v2
  design as `v2_proposed` rather than deleting it.
- **`bridge`** and **`emerge`** specs described routes that don't exist in
  the real registry-components.js at all — rewritten to match the actual
  registered components.
- **`diagnostic`** has no `registry-components.js` and no handshake in code
  at all, despite its spec describing one — flagged as a code gap, not
  papered over.
- **`eravos`** had no spec file. Written fresh from its own exported module.
- **`idearium`** has zero `hooks.out` anywhere — cleanest AX-008 violation found.
- **`eravos` and `copilot` are absent from `lib/version.js`'s services map
  entirely** — not drifted, never tracked. Flagged with a suggested addition,
  not applied (that file's yours).
- 6 mechanical version-syncs applied: cortex, guardian, escalation, snapshot,
  grammar-engine, replay-engine.

## §6. People-modeling — what's been said yes to, what's still itemized

**Self-modeling (consented, in progress):**
- Reviving INVERSION/`irs-signals.js` on `user-model.js` — framed as
  reflection material *for the user*, hypotheses only, never shown as fact.
- `affect.js` — copilot's own internal state (confidence/strain/engagement/
  uncertainty), explicitly **not** a claim about subjective experience, kept
  structurally separate from `user-model.js` (different subject).

**Still itemized, not bundled under "add everything":**
- `packages/resonance`, raw `irs.js`, `kernel-alk`'s `relational.js`
  rupture/repair detectors — third-party modeling, needs a yes per item.

**Resolved this session — masking/non-verbal tool:**
- Use case confirmed: self-facing for both parties (each person sees their
  own signal, no covert monitoring of the other), her own request, not
  imposed. **Design direction:** general non-verbal-literacy teaching
  (what does AU6+AU12 commonly signal) using video as example material,
  not psychological profiling of identifiable people in the source footage.
  Built on `expression-engine.js` (real FACS action-unit taxonomy, genuine
  research-grounded micro/partial/macro/composite expression classification)
  + `video-module.js` (real MediaPipe wiring — 468 face points, 33 pose,
  21×2 hand landmarks). Both confirmed legitimate, well-built, not
  pseudoscience, when read directly.

**Reframed this session — authorship signature:**
- `ase-persistent-scanner.html` (the v4 prototype) explicitly asked an LLM
  for output framed as "irrefutable," designed to survive dismissal by "a
  gaslighter — internal or external." That's a different design contract
  than everything else built this session, and incompatible with IDL3 (no
  diagnosis, no immutable labels) which the user's own earlier specs
  enforce. **Not built as specified.** Built instead in §7 below: same
  engine, evidence-with-confidence-bands contract, explicitly revisable,
  no "holds against doubt" framing.

## §7. Authorship Authentication (new this session)

The real, valuable version of "authorship fingerprinting": ASE's identity-
scale signature drift, applied to verify *whether a body of writing is
still consistent with its established author* over time — not to produce
a verdict about anyone's inner state.

```
spec:
  meta:
    name: ase-authorship-auth
    extends: ase@1.0.0 (lib/ase.js, this session, §ASE module)
    purpose: >
      Track an author's signature (lib/ase.js's tonalCenter + radiusProfile,
      same primitives already built for content) across their own body of
      work over time. Flag when new work falls outside the established
      radius — evidence, not verdict.

  core:
    required_imports: [lib/ase.js — createWorkSignature, recordEncounter]
    schemas:
      AuthorSignature:
        authorId, worksTracked[], signature (tonalCenter, radiusProfile),
        establishedAt, lastConfirmedAt, deviationLog[]

  contract:
    - Every flag ships with the specific evidence it's based on (which
      dimensions deviated, by how much, against how many prior samples) —
      §honesty: a confidence score and sample size, never a bare verdict.
    - Every flag is explicitly revisable — new confirmed samples from the
      same author should pull the signature back toward them, the same
      decay/confirm discipline user-model.js already has, not a frozen verdict.
    - Output is always framed as "this deviates from N prior samples by X"
      — never "this proves," never "this cannot be explained away."
    - copilot provides the qualitative read (§co-pilot deeper insight, as
      requested) — it explains *what kind* of deviation (vocabulary shift,
      sentence-length shift, structural shift) in plain language, but the
      raw signature math is what's load-bearing, not copilot's narrative.

  use_cases:
    - Account takeover / compromised-account detection (flag for the
      account owner's own review — never a public label)
    - Ghostwriting / plagiarism dispute support — evidence you can actually
      point to (these N dimensions, this much deviation) rather than a
      gut feeling
    - Proving continuity of authorship for a body of work over years —
      useful for exactly the kind of dispute that motivated this ask
    - AI-generated text impersonating a known human author — same signature-
      drift mechanism, different evidence pattern (sudden, complete
      dimensional shift vs. gradual drift)

  explicitly_not:
    - A tool that tells someone what they "really" feel
    - A tool optimized to be unfalsifiable or convince a skeptic
    - Usable on someone else's writing without their knowledge for any
      purpose other than the account-security case above (and even there,
      visible only to the account owner)
```

## §8. CLI autocomplete — checked before building, mostly already true

`lib/grammar-engine.js` already has `complete(partial)`, already wired into
`cli/co-pilot.js`, `cli/nexus-repl.js`, and `cli/nexus-cli.js`. This isn't
a missing feature — it's the same root cause as everything in §5: a
command only autocompletes if its system's `registry-components.js`
actually exists and registers it. `diagnostic` has none at all (§5).
`idearium` has zero `hooks.out` but does register components, so its
commands likely do autocomplete already — worth a live check, not assumed.
**Fixing §5's registry gaps *is* fixing CLI autocomplete coverage.** Not
a separate build.

## §9. What-if loops

- Round 1 (combinatorial — each new module crossed against each existing
  system, 27 ideas, stopped when it started being vocabulary reuse instead
  of architecture): `NEXUS-WHAT-IF-LOOP.md`
- Round 2 (outside-the-box, highest-leverage, invent/innovate): `NEXUS-WHAT-IF-LOOP-2.md`

## §10. Files produced this session

`NEXUS-INTEGRATION-MAP.md` · `NEXUS-PHASE-MAP-CROSSREF.md` ·
`nexus-needed-files.zip` · `nexus-system-foundation-addendum-v1.1.0.spec` ·
`nexus-analysis-module-foundation.spec` · `affect.js` ·
`registry-components-affect.js` · `sovereign-system-specs-fixed.zip` ·
`ase-module.zip` (`lib/ase.js`) · `NEXUS-WHAT-IF-LOOP.md` ·
`NEXUS-WHAT-IF-LOOP-2.md` · this file.
