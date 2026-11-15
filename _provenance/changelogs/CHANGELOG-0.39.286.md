# Nexus 0.39.286

**0.39.286 — 2026-10-01**

| | |
|---|---|
| Built | 2026-10-01 09:59:28 → 2026-10-01 09:59:28 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.286 |
| Tag | `v0.39.286` → snap-0720 |
| Full file ledger | [LEDGER-0.39.286.csv](../ledger/LEDGER-0.39.286.csv) |

## Release notes — `CHANGELOG-0.39.286.md`

Copied unchanged from the build.

### 0.39.286 — 2026-10-01

James: "can we have full options for fallback logic, routing. what could improve stability with the pipeline? can we add the
components registry as an 11th chunk for the systems template … after the file list and tree … is its self the doorway, and
the rest is isolated modular, interacting through the interaction contract/registry … routes, cli, nodes and dir … the nodes
based data structure exactly like guardian … have genesis the default spec? … remove anything from the architecture spec
thats absent from nexus?"

Map: `docs/2026-10-01-routing-registry-genesis-phasemap.spec`.

#### Routing and fallback (RG1–RG4)
- `lib/pipeline-routing.js`, the policy every spec chunk build now follows. Before: one hard-coded hop (chatgpt → gemini).
  - **modes:** `fixed` · `chain` (default) · `local-first` · `economy` (the provider economy's learned order)
  - **chain:** global, plus each block's own `fallback:` in blocks.yaml; unknown providers skipped with the reason
  - **failure classes:** empty · truncated · refused · timeout · provider-down · rate-limit · login · unknown;
    `fallback_on` picks which move on (login never does)
  - **breaker:** per provider. N failures in a row skip it for a cooldown; a truncated or refused reply does not count against it.
  - **caps:** `max_hops`, `attempts_per_hop`
- Config `routing.*`, `GET /api/routing`, `GET /api/routing/plan?block=&agent=`, `POST /api/routing/breaker/reset`,
  `idearium routing [show|plan|set]`, and the settings console's **Routing & fallback** page.
- Each hop a chunk took is kept on the chunk (`chunk.route`: provider, outcome, class, ms).
- Stability fixes found on the way:
  - A hop's own error (ECONNREFUSED, log in…) was replaced by "exceeded outer wall-clock attempt cap"; it is now kept.
  - A login or a limit was retried six times against the same provider; it now ends that hop at once.
- `tests/modules/test-pipeline-routing.test.js` 14/14.

#### The registry: the 11th block (RC1–RC2)
- `idearium/spec-engine/blocks.yaml` block 11, **registry** ("Component Registry & Interaction Contract"). It comes after
  build_order (the file list and tree) and waits on it.
- A repo's registry now also reads routes, CLI commands and events (emitter → consumer wires). POST
  `/api/repos/:uuid/architecture` writes it as Guardian-style nodes: `nodes/<type>/<id>.<type>` in the node-export
  envelope.
  - Node types: .component .hook .wire .event .command .contract (the doorway) .system.
  - Unchanged nodes are left alone; a node no longer produced moves to `nodes/_archive/`.
- The Architect tab shows routes, CLI and events.
- `test-repo-architecture` 12/12.

#### Genesis and the architecture spec (GN1, AR1)
- **genesis 1.1.0:**
  - new domains: Domain 2c, the registry as the doorway (nodes), and Domain 11, routing;
  - axioms REGISTRY_IS_THE_DOORWAY and ALL_DATA_ARE_NODES;
  - files registry/node-registry.js and spine/route-policy.js;
  - the manifest check is still clean, now 41 files.
- Genesis is now the default: a `type: system` spec that names no template starts from it, and the New spec form opens
  with it checked.
- **architecture-spec 0.8.0** keeps only what exists in NEXUS:
  - module paths corrected (`registry/`, not `schema/` or `compiler/`) and three unlisted modules added;
  - the eleven events nothing emits, the six unbuilt routes, three unenforced proposed axioms and gap AS4 (BPM) moved to
    `docs/architecture-spec/_archive/architecture-spec-0.7.0.spec`, kept whole;
  - the registry block and routing added; AS1 and AS3 closed.
- `test-genesis-and-architecture-spec` 5/5.

#### Noted, not changed
- chunk-dispatch.js is an ES module whose RAID default calls a `require` that does not exist there. It has never run;
  builds always pass an agent. Recorded in the map.

## Ledger

### Build 0.39.286 — snap-0720 — 2026-10-01 09:59:28

- Archive: `nexus-0720_2026-10-01_v0.39.286_main-15.zip` (was `Nexus-main-15.zip`)
- SHA-256: `29ba96b03a4d6888fcc001217ef9875550c5697c2a7fb8e8b23420dc45fb7cfd`, 13.6 MB, downloaded 2026-10-01 09:59:59
- Kind: full
- Commit: `5925df044e9ab8358f9629d82ddb09cf4ba9d4dc`, tag `snap-0720`
- Files in archive: 4972. Changes against the build before it: **15 added, 39 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 2 | 17 | 0 |
| tests | 6 | 6 | 1 |
| docs | 4 | 8 | 0 |
| lib | 1 | 3 | 0 |
| (root) | 2 | 1 | 0 |
| erosmancer | 0 | 2 | 0 |
| clear-glass | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
A CHANGELOG-0.39.285.md
A CHANGELOG-0.39.286.md
M clear-glass/src/plugins/webextensions.js
M docs/2026-09-29-handoff.md
A docs/2026-09-29-tool-layers-and-pane-memory-phasemap.spec
M docs/2026-09-30-idearium-coding-flow-phasemap.spec
A docs/2026-10-01-routing-registry-genesis-phasemap.spec
A docs/2026-10-01-work-visibility-job-reuse-phasemap.spec
M docs/SPEC-REGISTRY.spec
A docs/architecture-spec/_archive/architecture-spec-0.7.0.spec
M docs/architecture-spec/architecture-spec.spec
M docs/atlases/copilot-atlas.md
M docs/atlases/idearium-atlas.md
M docs/atlases/nexus-atlas.md
M docs/erosmancer.spec
M erosmancer/erosmancer-os/src/telemetry/index.ts
M erosmancer/erosmancer-os/src/types/index.ts
M idearium/api/build-surface.js
M idearium/api/index.js
M idearium/cli/index.js
M idearium/index.js
M idearium/lib/config-core.cjs
M idearium/package.json
A idearium/repo/architecture.js
M idearium/spec-engine/blocks.yaml
M idearium/spec-engine/chunk-dispatch.js
M idearium/spec-engine/index.js
M idearium/spec-engine/templates/genesis.spec
M idearium/spec/idearium.spec
M idearium/ui/css/work-surface.css
M idearium/ui/index.html
M idearium/ui/js/app.js
A idearium/ui/js/file-versions.js
M idearium/ui/js/plan-panel.js
M idearium/ui/js/work-surface.js
M idearium/ui/settings.html
A lib/pipeline-routing.js
M lib/seam/detector.js
M lib/seam/queue.js
M lib/version.js
M loom/maps/one-idearium-map.js
M package.json
M tests/known-gaps.yaml
M tests/modules/run-all.js
M tests/modules/test-cg-eros-supervisor.js
A tests/modules/test-detector-code-endings.test.js
D tests/modules/test-detector-code-mode.test.js
A tests/modules/test-eros-telemetry-bounded.test.js
A tests/modules/test-file-versions-and-reassign.test.js
A tests/modules/test-genesis-and-architecture-spec.test.js
M tests/modules/test-manifest-phase1.test.mjs
A tests/modules/test-pipeline-routing.test.js
A tests/modules/test-repo-architecture.test.js
M tests/modules/test-work-surface.test.js
M tests/probe/idearium-coding-flow-chromium.js
```

