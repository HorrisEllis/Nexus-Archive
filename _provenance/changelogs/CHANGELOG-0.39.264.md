# Nexus 0.39.264

**NEXUS 0.39.264: the Nexus atlas written out, a test VM for any repo, ErosmancerOS runs with Clear Glass**

| | |
|---|---|
| Built | 2026-09-26 06:22:44 → 2026-09-26 10:59:28 |
| Builds on the main line | 4 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.264 |
| Tag | `v0.39.264` → snap-0696 |
| Full file ledger | [LEDGER-0.39.264.csv](../ledger/LEDGER-0.39.264.csv) |

## Release notes — `CHANGELOG-0.39.264.md`

Copied unchanged from the build.

### NEXUS 0.39.264: the Nexus atlas written out, a test VM for any repo, ErosmancerOS runs with Clear Glass

**Date:** 2026-09-26 · idearium 4.8.0 → 4.9.0 · eravos 3.17.0 → 3.18.0 · git: 0.39.263 + claude/adoring-tesla-cb5705 merged first (`34c7753`)

James:

> *"merge. to 264. keep the git, loom relies on it. the nexus atlas in the nexus repo. expand it completely, don't make it just a list. then make each reference a link to either open the nested or file. then with cos, i need help setting the vm up. either a batch file or just in the packages. or invent a js alternative. needs to be able to create a test env for any repo."*
>
> *"this in idearium needs to only show in nested compartments/repos. also make sure your following the axioms in the docs folder"* · *"instead of download, it should create a idea or spec for a new organism"* · *"hook it in to run with clearglass … just need erosmanceros to start with clearglass"*

Mapped first in `docs/2026-09-26-cos-testenv-vm-and-nexus-atlas-phasemap.spec`. The axiom reminder arrived after the tar, detect and host modules were written; the phasemap records them as built before the map rather than back-dating it.

#### The merge, with the git

- `claude/adoring-tesla-cb5705` was cut from 0.39.263 and only adds to it (an idea that became a spec lives in its repo; `/ui/architect/`). It was taken whole.
- The 0.39.263 zip had no `.git`. The history comes from the 0.39.253 zip's `.git` (last commit `bf5adc9`). On top of it: `34c7753` (0.39.263 as delivered, 254–263 in one commit, since those commits exist only on James's machine), then the 0.39.264 commits. `data/` is never staged.

#### The Nexus atlas, written out

- `docs/atlases/nexus-atlas.md` covers:
  - how to read it;
  - what NEXUS is;
  - the kernels, phases and ports;
  - every top-level directory;
  - how work moves through NEXUS (a prompt, a repo change, healing, self-knowledge);
  - the governing law;
  - a section per system (13 kernels + core);
  - core, directory by directory;
  - cross-cutting concerns, the build and run reference, and known drift.
- The previous text is kept in `docs/atlases/_archive/`.
- New atlases were written for the four systems that had none: `orchestrator-atlas.md`, `architect-atlas.md`, `eravos-atlas.md` and `core-atlas.md`. Every system now opens into a nested atlas.
- On the page:
  - Under each system heading, "open its atlas ›" opens the nested atlas in place, and "open the repo ›" opens the system.
  - A contents list at the top jumps to each section.
  - Nested atlases get a contents list too.
- References:
  - Every reference is a link: a system, a file, a directory, a document, or a glob (which opens its directory).
  - Routes and data folders link to the code that owns them.
  - Code spans are no longer mangled when they contain an asterisk.
- `resolveWith()` / `indexOf()` are exported from `idearium/repo/nexus-self.js`, so the page's own resolution rules can be tested.

**Tested:**
- `tests/modules/test-nexus-atlas-refs.test.js` 45/45. It renders every new atlas with the page's own renderer and resolves every reference against the real tree: 0 dead.
  - The Nexus atlas holds ~400 references across all four kinds, over 5,600 words.
  - The older atlases' stale references are listed, not failed.
- `tests/probe/nexus-atlas-home.js` 17/17 in a real browser, including the nested-atlas click.

#### Create and Build live inside a repo

- At the top level Idearium shows Welcome and Repos. Create, Build, and the ideas/specs counters appear once a repo is open.
- The navigator nests Create and Build under the open repo, which it shows expanded.
- Welcome's pillars that lead into Create/Build are hidden at the top level too.
- **Default, not confirmed:** James was asked whether he meant the counters, Create/Build, or both. With no answer before the build, both was built.

#### A new Eravos organism starts in Idearium

- The catalog's "+ NEW" no longer downloads engine.js + schema.json. It offers **CREATE IDEA** and **CREATE SPEC**.
- Inside Idearium, the request goes to the page. Idearium makes the idea and opens it, or opens the New Spec dialog filled in and linked to the idea.
- Standalone, the canvas calls Idearium's API itself.
- Idearium takes the message only from its own Eravos frame.
- The same change was made in both canvases (`ui/eravos/`, `eravos/ui/`), which remain two contracts.
- The download path is superseded; it is in git at `34c7753`.

#### COS: a test VM for any repo

**What was wrong**
- The VM shared the repo over 9p, which exists only in Linux-host QEMU, so on Windows it was never offered.
- There was no way to make a base image.
- Tests were found by file name only, so a repo with `tests/basic.js` said "no test files found".
- A fresh `winget install QEMU` is not on the running Nexus's PATH.

**What changed**
- `cos/testenv/tar.js`: the repo goes to the guest as a read-only tar disk, written in pure JavaScript (ustar + PAX).
- `cos/testenv/detect.js`: for any repo, works out the install step, the repo's own test command (npm/pnpm/yarn test, pytest, go test, cargo test, rspec, phpunit, make test), and the test files by every common convention.
- `cos/testenv/index.js`:
  - Dependencies install with the network on.
  - Then QMP `set_link nic0 off` pulls the cable, and the guest must prove it cannot resolve names before any test runs.
  - Then the suite and the test files run.
  - If WHPX or KVM is not really available, it boots again under TCG.
- `cos/testenv/host.js`: finds QEMU off the PATH, and reads the base image manifest from `%LOCALAPPDATA%\nexus\cos-testenv` (never the repo).
- `cos/testenv/provision.js`, the "JS alternative":
  - Downloads a Debian 12 cloud image.
  - Seeds cloud-init over HTTP via SMBIOS, so no ISO tools are needed.
  - Installs qemu-guest-agent, Node LTS, Python, git and build tools; `--with go,ruby,php,rust` adds more.
  - Verifies the image with a second boot the way a test run boots.
  - Keeps the previous base.
- **`cos/testenv/setup-vm.bat`**: one command on Windows. It installs QEMU with winget if needed, then runs the provisioner. `setup-vm.sh` does the same elsewhere, and `npm run cos:vm-setup` / `cos:vm-status` are also available.
- Idearium Run menu:
  - When the VM is missing, "Set up the test VM" starts the setup in the background and shows its progress (`GET /api/cos/testenv`, `POST /api/cos/testenv/setup`).
  - The VM option describes its plan.
  - The result line shows the accelerator, the network and whether the offline check passed.
- `qemu-runtime.js` got opt-in additions: CPU model, share disk, NIC id, SMBIOS seed, serial log, kernel/initrd boot, and resolved binaries. Existing VMs boot unchanged.

**Tested:**
- `test-cos-testenv` 29/29.
- `test-cos-testenv-any-repo` 65/65, including a **real QEMU boot** (TCG) of a guest assembled from the host's kernel, busybox, qemu-ga and node (`tests/helpers/cos-mini-guest.js`). `npm test` and per-file tests ran in the guest's own kernel behind the cut network.
- **Not proven here:** a real Debian download and first boot. The build machine has no internet. The seed and cloud-init path is tested with a real HTTP seed server and an emulated guest. The first real run is `setup-vm.bat` on James's machine.

#### ErosmancerOS runs with Clear Glass

**What was wrong**
- Nothing started ErosmancerOS. Every boot logged `ECONNREFUSED 127.0.0.1:7432`.
- Once started by hand, every `/api/connect` crashed: `DEFAULT_CONFIG` lacked the routing, behavior and observer defaults its own types declared, and a comment claimed they had been merged in.

**What changed**
- `clear-glass/src/eros/supervisor.js`:
  - Clear Glass starts ErosmancerOS through tsx (already installed with the workspace) and waits for it.
  - It connects ErosmancerOS to Clear Glass's own DevTools port (9333).
  - A crash is restarted with backoff. Five crashes in two minutes stop the restarts, and the reason is shown.
  - Quitting Clear Glass stops it.
  - An ErosmancerOS already running is reused, and `EROS_AUTOSTART=0` opts out.
- Settings › ErosmancerOS shows who started it and offers Start or Reconnect. Its port field now defaults to 9333; it said 9222.
- ErosmancerOS itself:
  - The defaults are fixed.
  - `EROS_LOG_LEVEL` limits what it prints, so each DevTools message no longer floods Clear Glass's console.

**Tested:** `test-cg-eros-supervisor` 16/16, including a real tsx start connected to a real Chromium's DevTools port, then stopped and the port freed.

#### Also fixed

Clear Glass's page driver (`src/driver/glass.js`) failed on Chromium 141 with "Target position can only be set for new windows". It now creates the target, then sizes its viewport.

#### Registry and records

- `loom/maps/cos-testenv-map.js` maps every new component with its real wires, including edges the scanner cannot see: spawn, HTTP and postMessage. It also maps ErosmancerOS's TypeScript server.
- Addenda: `cos/spec/cos.spec`, `idearium/spec/idearium.spec`, `erosmancer/spec/erosmancer.spec`, `clear-glass/spec/clear-glass.spec`. The phasemap is registered in `docs/SPEC-REGISTRY.spec`.
- `lib/version.js`: system 0.39.264. The line had said 0.39.258 while `package.json` said 0.39.263, because 0.39.259–263 never moved it; this bump corrects it.
- Not recorded in Versionium from here: that needs the running system.

## Ledger

### Build 0.39.264-r1 — snap-0693 — 2026-09-26 06:22:44

- Archive: `nexus-0693_2026-09-26_v0.39.264-r1_main-4.zip` (was `Nexus-main-4.zip`)
- SHA-256: `fc9691e75b9a7ad1ee3f639d186054031e2cf69736416b37b0830d95e7b5b5e5`, 12 MB, downloaded 2026-09-26 06:25:35
- Kind: full
- Commit: `8065ec77c396e257fd3527ecc87239df426698d0`, tag `snap-0693`
- Files in archive: 4213. Changes against the build before it: **111 added, 162 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| versionium | 70 | 0 | 0 |
| data | 6 | 46 | 0 |
| intelligence | 2 | 38 | 0 |
| clear-glass | 4 | 33 | 0 |
| tests | 8 | 10 | 0 |
| guardian | 4 | 8 | 0 |
| cos | 7 | 3 | 0 |
| docs | 7 | 2 | 0 |
| idearium | 0 | 6 | 0 |
| (root) | 1 | 3 | 1 |
| lib | 0 | 3 | 0 |
| erosmancer | 0 | 3 | 0 |
| loom | 1 | 1 | 0 |
| eravos | 0 | 1 | 0 |
| diagnostic | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |
| .claude | 1 | 0 | 0 |

```
A .claude/settings.local.json
M .gitignore
A CHANGELOG-0.39.264.md
M clear-glass/plugins/adblocker/manifest.json
M clear-glass/plugins/guardian-listeners/manifest.json
M clear-glass/plugins/passwords/manifest.json
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/renderer/library/sections/bookmarks.js
M clear-glass/renderer/settings.html
M clear-glass/renderer/settings/core.js
M clear-glass/renderer/settings/sections/accounts.js
M clear-glass/renderer/settings/sections/autofill.css
M clear-glass/renderer/settings/sections/autofill.js
M clear-glass/renderer/settings/sections/automation.css
M clear-glass/renderer/settings/sections/automation.js
M clear-glass/renderer/settings/sections/eros.js
M clear-glass/renderer/settings/sections/fingerprint.js
M clear-glass/renderer/settings/sections/mesh.js
M clear-glass/renderer/settings/sections/privacy.js
M clear-glass/renderer/settings/sections/providers.js
A clear-glass/renderer/settings/sections/shortcuts.css
A clear-glass/renderer/settings/sections/shortcuts.js
M clear-glass/renderer/settings/sections/suite.css
M clear-glass/renderer/settings/sections/suite.js
M clear-glass/renderer/settings/settings.css
M clear-glass/spec/clear-glass.spec
M clear-glass/src/autofill/matcher.js
A clear-glass/src/autofill/proposal.js
M clear-glass/src/autofill/store.js
M clear-glass/src/driver/glass.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/mesh/automation-engine.js
M clear-glass/src/options/store.js
M clear-glass/src/preload/index.js
A clear-glass/src/shortcuts/registry.js
M clear-glass/src/toolbar/commands.js
M cos/compartment/qemu-runtime.js
M cos/spec/cos.spec
A cos/testenv/detect.js
A cos/testenv/host.js
M cos/testenv/index.js
A cos/testenv/provision.js
A cos/testenv/setup-job.js
A cos/testenv/setup-vm.bat
A cos/testenv/setup-vm.sh
A cos/testenv/tar.js
M diagnostic/nexus-diagnostic.js
A docs/2026-09-26-cos-testenv-vm-and-nexus-atlas-phasemap.spec
A docs/2026-09-26c-handoff.md
M docs/SPEC-REGISTRY.spec
A docs/atlases/architect-atlas.md
A docs/atlases/core-atlas.md
A docs/atlases/eravos-atlas.md
M docs/atlases/nexus-atlas.md
A docs/atlases/orchestrator-atlas.md
M eravos/ui/catalog/catalog-ui.js
M erosmancer/erosmancer-os/src/api/server.ts
M erosmancer/erosmancer-os/src/telemetry/index.ts
M erosmancer/spec/erosmancer.spec
A guardian/input/547bac67-abf5-4739-be7a-b2df01808167.contract
A guardian/input/89c220ce-6d73-4135-ba47-8a491c4c26fd.contract
A guardian/input/c4f2189a-b6f7-4cba-b705-99d845efb718.contract
A guardian/input/dde80285-278c-416b-a2f5-9da44df25400.contract
M idearium/repo/nexus-self.js
M idearium/spec/idearium.spec
M idearium/ui/index.html
M idearium/ui/js/app.js
M idearium/ui/js/compartment.js
M idearium/ui/js/nexus-atlas.js
M intelligence/server.js
M lib/blueprint-index.js
M lib/vector-memory.js
M lib/version.js
M loom/bootstrap.js
A loom/maps/cos-testenv-map.js
D nexus-0.39.265.bundle
M orchestrator/lib/contract-handshake.js
M package.json
A tests/helpers/cos-mini-guest.js
M tests/modules/automation-engine.test.js
M tests/modules/clear-glass-library-ui.test.js
M tests/modules/clear-glass-screen-qa-ui.test.js
M tests/modules/copilot-provider-toggle.test.js
M tests/modules/run-all.js
M tests/modules/test-cg-accounts-portal-settings.test.js
A tests/modules/test-cg-autofill-jobs.test.js
A tests/modules/test-cg-bookmark-account-state.test.js
A tests/modules/test-cg-eros-supervisor.js
A tests/modules/test-cg-listener-decay.test.js
A tests/modules/test-cg-shortcuts.test.js
A tests/modules/test-cos-testenv-any-repo.js
M tests/modules/test-cos-testenv.js
M tests/modules/test-idearium-cjs-under-esm.js
M tests/modules/test-nexus-atlas-and-glass.test.js
A tests/modules/test-nexus-atlas-refs.test.js
M tests/probe/nexus-atlas-home.js
M ui/eravos/catalog/catalog-ui.js
```

173 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.264-r2 — snap-0694 — 2026-09-26 07:31:46

- Archive: `nexus-0694_2026-09-26_v0.39.264-r2_main-5.zip` (was `Nexus-main-5.zip`)
- SHA-256: `494e86add22a8bdadb4c7757989d4c9ccd85ff555f7e5ceba80a4e9f8095839e`, 12 MB, downloaded 2026-09-26 07:32:59
- Kind: full
- Commit: `a747729d939c21e227036860bdf22a7d481e9491`, tag `snap-0694`
- Identical copy: `nexus-0694_2026-09-26_v0.39.264-r2_main-6_dup1.zip` (was `Nexus-main-6.zip`)
- Files in archive: 4219. Changes against the build before it: **6 added, 21 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 9 | 0 |
| tests | 4 | 3 | 0 |
| data | 0 | 5 | 0 |
| lib | 2 | 1 | 0 |
| cos | 0 | 2 | 0 |
| loom | 0 | 1 | 0 |

```
M cos/ci/keys.js
M cos/testenv/setup-job.js
M data/idearium/cfr_state.json
M data/idearium/event_log.jsonl
M data/idearium/event_stats.json
M data/nexus-self/event_log.jsonl
M data/nexus-self/metrics.jsonl
M idearium/api/index.js
M idearium/registry-components.js
M idearium/repo/index.js
M idearium/repo/nexus-self.js
M idearium/repo/source-files.js
M idearium/spec-engine/index.js
M idearium/ui/index.html
M idearium/ui/js/app.js
M idearium/ui/js/nexus-atlas.js
A lib/repo-git.js
A lib/spec-digest.js
M lib/zip-ingest.js
M loom/maps/cos-testenv-map.js
M tests/modules/run-all.js
M tests/modules/test-cos-testenv-any-repo.js
A tests/modules/test-idearium-codegen.test.js
A tests/modules/test-idearium-source-files-async.test.js
A tests/modules/test-idearium-spec-meta-cache.test.js
M tests/modules/test-nexus-atlas-and-glass.test.js
A tests/modules/test-repo-git.test.js
```

### Build 0.39.264-r3 — snap-0695 — 2026-09-26 08:49:36

- Archive: `nexus-0695_2026-09-26_v0.39.264-r3_main-7.zip` (was `Nexus-main-7.zip`)
- SHA-256: `4c7c72bad0c093c3e42f527f79b54c75c826b02b89f653d3a08e892454dc22f5`, 12.1 MB, downloaded 2026-09-26 09:00:01
- Kind: full
- Commit: `67d7639557ec26b6337b6965d21c655977bf0ca5`, tag `snap-0695`
- Identical copy: `nexus-0695_2026-09-26_v0.39.264-r3_main-8_dup1.zip` (was `Nexus-main-8.zip`)
- Files in archive: 4233. Changes against the build before it: **14 added, 31 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 7 | 13 | 0 |
| tests | 4 | 4 | 0 |
| lib | 3 | 3 | 0 |
| idearium | 0 | 4 | 0 |
| copilot | 0 | 3 | 0 |
| ui | 0 | 2 | 0 |
| guardian | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
M clear-glass/renderer/browser.js
M clear-glass/renderer/copilot-cli.js
M clear-glass/renderer/settings/sections/automation.css
M clear-glass/renderer/settings/sections/automation.js
M clear-glass/renderer/settings/sections/copilot.js
M clear-glass/renderer/settings/sections/macros.js
A clear-glass/src/automation/cron.js
A clear-glass/src/automation/dom.js
A clear-glass/src/automation/from-macro.js
A clear-glass/src/automation/routes.js
A clear-glass/src/automation/steps.js
A clear-glass/src/automation/template.js
A clear-glass/src/automation/templates.js
M clear-glass/src/bookmarks/browser.js
M clear-glass/src/driver/index.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/mesh/automation-engine.js
M clear-glass/src/options/store.js
M clear-glass/src/providers/registry.js
M copilot/cli.js
M copilot/lib/self-model.js
M copilot/server.js
M guardian/server.js
M idearium/api/index.js
M idearium/registry-components.js
M idearium/ui/index.html
M idearium/ui/js/app.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/clear-glass/automation.js
A lib/agent-tools/tools/clear-glass/browser-automation.js
A lib/cos-remote.js
M lib/hat-seed.js
M lib/repo-git.js
M loom/maps/copilot-capability-map.js
A tests/modules/automation-settings-ui.test.js
A tests/modules/automation-v2.test.js
M tests/modules/nexus-options-autoboot.test.js
M tests/modules/run-all.js
M tests/modules/test-cg-settings-ui-files.test.js
A tests/modules/test-cos-remote-api.test.js
A tests/modules/test-cos-remote.test.js
M tests/modules/test-repo-git.test.js
M ui/brainos-float/brainos-float-contract.json
M ui/brainos/brainos-automation.js
```

### Build 0.39.264-r4 — snap-0696 — 2026-09-26 10:59:28

- Archive: `nexus-0696_2026-09-26_v0.39.264-r4_main-9.zip` (was `Nexus-main-9.zip`)
- SHA-256: `debbc553c178886a7d064c2085e17ed0cec0b0588f1ffcdc4037255567acb58d`, 12.1 MB, downloaded 2026-09-26 10:59:52
- Kind: full
- Commit: `c9421b50b22bb7e161dfb15aeb80687e563c4b5b`, tag `snap-0696`
- Files in archive: 4236. Changes against the build before it: **3 added, 10 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 1 | 5 | 0 |
| lib | 1 | 3 | 0 |
| tests | 1 | 2 | 0 |

```
M clear-glass/renderer/settings/sections/automation.js
M clear-glass/renderer/settings/sections/macros.js
A clear-glass/src/automation/nodes.js
M clear-glass/src/automation/routes.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/automation-engine.js
M lib/agent-tools/tools/clear-glass/automation.js
M lib/agent-tools/tools/clear-glass/macro.js
M lib/node-export.js
A lib/node-schemas/schema.workflow
A tests/modules/automation-nodes.test.js
M tests/modules/automation-settings-ui.test.js
M tests/modules/run-all.js
```

