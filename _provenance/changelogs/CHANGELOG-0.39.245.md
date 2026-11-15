# Nexus 0.39.245

**NEXUS 0.39.244 — repo jobs reach their own tab; the Agent tab shows the provider tab live**

| | |
|---|---|
| Built | 2026-09-25 15:09:32 → 2026-09-25 15:09:32 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.245 |
| Tag | `v0.39.245` → snap-0670 |
| Full file ledger | [LEDGER-0.39.245.csv](../ledger/LEDGER-0.39.245.csv) |

## Release notes — `CHANGELOG-0.39.245.md`

Copied unchanged from the build.

### NEXUS 0.39.245 — spec-engine phase 1: file list → wiring, no LLM

**Date:** 2026-09-25 · idearium 4.3.1 → 4.4.0

James: *"generate a manifest and component registry from the file list. that's why it's vital to generate components and file list first. dependencies."* · *"phase 1 build, would be first principles logic. right now, it doesn't build anything."*

#### What it does
One file list in; a checked wiring map out. No LLM anywhere in this path.

- **Reads** a `.spec` catalog (genesis's `file "path" { … }` grammar), a build_order YAML (compiler-t0's shape) or a JSON file list.
- **Checks everything at once** and lists every violation, not the first: duplicate ids/paths, missing intent, self-dependency, unresolved dependency, every cycle, and — once entries declare `emits`/`consumes` — one producer per signal (I3), undeclared residue (I4), consumer with no producer, and schema mismatch (a consumer requiring a field the producer never sends: the class of the 0.39.244 `/events` bug).
- **Emits** `manifest.json` (entries with depends, dependents, layer, build index) and `component-registry.json`. Deterministic. No registry is written while the wiring has errors.
- **Layers:** every file in a layer depends only on earlier layers, so each layer's chunks can build in parallel.
- **Chunk context (I5):** `context <file> <id>` returns a component's own entry plus its direct dependencies' intents and signals — nothing else. That is the whole context a chunk agent needs.

#### Commands
- `idearium manifest check <file> [--warnings]` · `generate <file> [--out dir]` · `context <file> <id>`
- The same verbs via `node idearium/spec-engine/manifest/cli.js …` — loads no store, so `context` prints clean JSON a chunk prompt can consume. The idearium CLI statically imports core/spec-engine/repo, which load all of JAA (~20k rows) before any command runs; that is why the pure door exists. Both doors call `manifest/commands.js`.

#### genesis.spec, checked by its own rules
The first run over genesis's file tree found:
- a **cycle**: `kernel/boot.js` ↔ `spine/warp-bridge.js`
- `registry/component-registry.js` is generated from `manifest-registry.js` but didn't depend on it
- `kernel/boot.js` and `pulse/heartbeat.js` read config but didn't depend on it
- the hand-written boot order put `config/` last

Cause: `ref` meant "calls **or** relates to." A list that generates wiring needs one direction. **Fixed:** `ref` split into `depends` (directional, generates everything) and `related` (generates nothing); the edges above corrected; the boot order is now the generated 7-layer order. `ref` is still read (as depends) with a `LEGACY_REF` warning, never silently trusted.

#### Reuse
`compiler-t0.js`'s private `_topoOrder` now calls `manifest/graph.js` `order()` — one Kahn implementation, same error text, same `isPrimitive`.

#### Proof
- **`test-manifest-phase1` 16/16** (new, registered in `run-all.js`): parser, genesis clean (39 files, 7 layers), config-before-readers, legacy-ref cycle caught, all violations listed, resolution by uuid/prefix/path, I3, I4, no-producer, schema mismatch, build_order YAML, determinism, no registry on error, I5 context, pure CLI JSON + exit code, generate output.
- Regression: 12 suites touching spec-engine or the CLI run. `spec-import` (5 fail) and `idearium-loop` (2 fail) fail **identically with the untouched 0.39.244 files** — pre-existing, not from this change.

#### Not built (filed in docs/2026-09-25-spec-engine-manifest-first-phasemap.spec)
- P1a (LLM writes the file list) and P1c (LLM writes each file's interface) — they need the agent reply path working first.
- N1 Ollama: new conversation per chunk, logged, referencing the previous by pointer. N2 Copilot: logged, referencing last context. N3 manage NEXUS in Idearium: run this over NEXUS itself.

## Ledger

### Build 0.39.245 — snap-0670 — 2026-09-25 15:09:32

- Archive: `nexus-0670_2026-09-25_v0.39.245_vnamed-0.39.245.zip` (was `Nexus_v0_39_245.zip`)
- SHA-256: `e182fde50f1be58264986432527d4a208695df6f9039c24b64196297045bd5f4`, 137.4 MB, downloaded 2026-09-25 15:09:32
- Kind: full
- Commit: `0d40f3bcacbdda5341846f2fb9aa818078bfc186`, tag `snap-0670`
- Left out: embedded .git (1294 files, HEAD 66f633cfe44d2a1b48166acb8f43266be674dc4d (main))
- Left out: node_modules (9706 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 5353. Changes against the build before it: **11 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 8 | 4 | 0 |
| (root) | 1 | 1 | 0 |
| tests | 1 | 1 | 0 |
| docs | 1 | 0 | 0 |

```
A CHANGELOG-0.39.245.md
A docs/2026-09-25-spec-engine-manifest-first-phasemap.spec
M idearium/cli/index.js
M idearium/package.json
M idearium/spec-engine/compiler-t0.js
A idearium/spec-engine/manifest/cli.js
A idearium/spec-engine/manifest/commands.js
A idearium/spec-engine/manifest/file-list.js
A idearium/spec-engine/manifest/graph.js
A idearium/spec-engine/manifest/index.js
A idearium/spec-engine/manifest/parse-catalog.js
A idearium/spec-engine/manifest/registry.js
A idearium/spec-engine/manifest/wire-check.js
M idearium/spec-engine/templates/genesis.spec
M package.json
M tests/modules/run-all.js
A tests/modules/test-manifest-phase1.test.mjs
```

