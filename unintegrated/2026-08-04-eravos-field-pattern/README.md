# 2026-08-04-eravos-field-pattern/

**Nothing in here runs. Nothing in here is required by anything else in the
repo. It is staged, not installed** — same terms as the rest of `unintegrated/`.

Cited by: `docs/RELATIONAL-FIELD-PHASEMAP.spec` — Chunk A (RF-1, RF-2) and
Chunk C (RF-9, RF-10). Status there is 🔵 SOURCED, which per §1.1 means "the
candidate code exists and was checked," not "this is built."

## Where it came from

`eravos-git.zip` → `repo/eravos/`, received 2026-08-04. Copied **verbatim**,
byte-for-byte, not adapted. SHA-256 prefixes at copy time:

| File | sha256 (first 16) | Origin path |
|------|-------------------|-------------|
| `alk/dimensions.js`    | `651d320883063b35` | `eravos/shared/alk/dimensions.js` |
| `alk/alk-boot.js`      | `10890c1904473572` | `eravos/shared/alk/alk-boot.js` |
| `alk/signal-vector.js` | `aa8a4d29310024b5` | `eravos/shared/alk/signal-vector.js` |

Two reference artifacts, clearly marked as not-modules:

- `emergence-field-bridge.excerpt.js` — lines 5656–5703 of
  `eravos/shared/eravos-kernel.js`. **This is an excerpt, not a module.** The
  bridge has no standalone file in ERAVOS; it lives inline in a ~6,000-line
  kernel. Carving it into a fake module here would invent a boundary that does
  not exist upstream, so it is kept as a named excerpt with its line range.
- `eravos-options.reference.json` — ERAVOS's `config/options.json`, kept only
  for its `emergence` block (lines 88–91), which states the attachment terms.

## Why these files and not others

They are the only place in either repo where a **field producer** and a
**field reader** are separate systems that click together instead of
overlapping. That is the exact structural question open in NEXUS between
`meta/cfr/` (Constraint Field Runtime — gives the field its shape) and
`meta/rfr2/` (reads relation/meaning across it).

What the pattern actually consists of, read off the source:

1. **The producer is attached, never vendored.** `config/options.json`:
   Emergence is a separate project; if the server mounts `/emergence` the
   same-origin path works unchanged, and if it is absent the field dimension
   abstains and everything else is unaffected. NEXUS has the same relationship
   with WARP.
2. **The contract is one read-only HTTP GET.** `GET {base}/field` →
   `{ trajectory, decay_score, rupture_severity, meaning_charge }`. Observed
   from the consumer only — Emergence itself is **not** in `eravos-git.zip`
   and has not been read. See `emergence-field.contract.md` for exactly how
   much of this is evidence and how much is inference.
3. **Absence is stated once, then honoured.** The bridge holds three states
   (`unknown | attached | absent`), logs the absence exactly once as info not
   error, never retries forever, and never fabricates a field.
4. **The reader abstains rather than guesses.** `dimensions.js:258` — the
   `field` dimension returns `null` from `extract()` when there is no field,
   and a null dimension contributes no edge. Its own docblock: *abstains
   entirely rather than guessing at a field it cannot see.*
5. **A categorical mismatch caps the score instead of averaging away.**
   `field.similarity()` returns 0.25 flat on a trajectory mismatch, because
   DECAYING and REPAIRING are opposite motions and averaging their numeric
   distance would let two contradictory states read as similar.
6. **The field dimension is different in kind from the other eight.** The
   nine dimensions are `lexical`, `signal`, `needs`, `intent`, `affect`,
   `prosody`, `grammar`, `field`, `temporal`. Eight compare two *moments*;
   `field` compares *the state the system was in* when each moment happened.
   Its docblock is the thesis: two moments can share no words, no need, no
   intent and no feeling-movement and still belong together, because the
   field was in the same place both times — which is exactly what none of the
   other eight can see.

`alk-boot.js` is included because it is the assembly discipline, not just
plumbing: one ESM entry, strict dependency order (bus → latent → observers →
consumers → lattice), and a partial boot reported as a partial boot rather
than as a success (§3.1, §5.11).

`signal-vector.js` is included because `dimensions.js`'s `signal` dimension
depends on it. Staging a reader without its input would stage something that
cannot be evaluated.

## Before anything here gets integrated

Same caution the rest of this folder already carries, plus two specific to
this batch:

- **These files are browser/ESM.** They use `window`, `fetch`, and ESM
  `import`/`export`. NEXUS's meta layer is CJS and Node-side. Nothing here
  drops in. What transfers is the **shape**, and possibly `dimensions.js`'s
  similarity functions, which are pure and have no browser dependency — that
  is a claim to verify, not to assume.
- **The relationship domain is not the system domain.** ERAVOS's field
  measures a relationship between two people (rupture severity, decay). CFR's
  field measures coherence, friction, entropy, regime. The transferable part
  is the producer/reader split and the abstention discipline. Any attempt to
  transfer the *dimensions themselves* needs its own justification.

The redundancy check this folder demands elsewhere applies here too. Before
any of this informs a build, `meta/rfr2/causality/index.js` still needs the
real diff against `meta/cfr/graph.js` that `unintegrated/README.md` flagged as
outstanding on 2026-06-29 and that has still not been done. That diff is
RF-3 in the phase map and it gates everything above it.
