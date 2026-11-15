# Nexus 0.39.339

**0.39.339 — 2026-10-05**

| | |
|---|---|
| Built | 2026-10-05 07:49:12 → 2026-10-05 07:49:12 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.339 |
| Tag | `v0.39.339` → snap-0731 |
| Full file ledger | [LEDGER-0.39.339.csv](../ledger/LEDGER-0.39.339.csv) |

## Release notes — `CHANGELOG-0.39.339.md`

Copied unchanged from the build.

### 0.39.339 — 2026-10-05

James: "do it. we could use that for more than coding. coudl use it for debugging, dom in clearglass, or any data fed into a pipeline"
James: "im saying for anything it wants to learn. agnostic tool for context"
James: "don't just agree. im not looking to add noise. can i build from inside nexus now?"

#### One agnostic context tool
`lib/context-prereqs.js` is now an **engine with domains**. Every domain gets the same steps:
1. its own source;
2. past conversations, from this repo's agent then copilot;
3. otherwise, ask James, with the gap recorded.

| domain | for | the checklist |
|---|---|---|
| `code` | a question about a repo (SB38, unchanged) | the code · what it uses · what uses it · tests · what it should do |
| `data` | any record fed into a pipeline | the fields the caller needs, each a path and the question to ask if it's absent |
| `topic` | anything else | what it is · where it lives · what it connects to · what was said before, from every store Nexus keeps |

`learn()` picks the domain from what it's given.

**`nexus.learn.tool`** gives any agent (Ollama, ChatGPT, Copilot) the checklist, the context found for each item, and the questions to ask. The `context-tools` prompt block names it in one line.

#### The checklist builds the working set
- An Ollama run's working set (SB37) now **starts from the checklist**: items already found go in as the first reads.
- A code read ticks off a missing target.
- Each later round opens with the checklist: complete, or what's left to ask.
- The first round's prompt already carries the checklist, so the working set isn't sent until a real read is in it. Nothing goes twice.

#### Kept to what was asked
- The DOM and debug domains were mapped, then removed again before any code was written. `registerDomain()` takes them when they're wanted; mapping them now was paperwork.
- The first message still fits under 3,000 characters (RH-006).

#### Proof
- **`tests/modules/test-checklist-workset.test.js`, 6/6:**
  - **CW-01:** the working set is seeded from the checklist.
  - **CW-02:** an Ollama run with no duplicate in round one, the target ticked by a code read, then complete.
  - **CW-03:** a pipeline record's missing field is asked.
  - **CW-04:** `learn()` finds a topic in Nexus's own specs and asks what it can't find.
  - **CW-05:** the tool answers.
  - **CW-06:** the domain is picked automatically, and a new domain runs through the same engine.
- **Every suite that touches** repo-agent, the prompt blocks, the tool loop, the agent tools or the working set: 49 suites, all green. TL-01 needed the new tool categorised (Memory & thinking).
- **End to end, build inside Nexus:** `test-prove-loop` 7/7 (a real idearium server: spec → files → a failing round → repaired → proven) and `test-build-from-the-spec` 5/5.
- **Loom:** the registry was regenerated from scratch, with nothing lost. `nexus.lib.agent-tools.tools.query.learn` is wired from naming and context-prereqs, and context-prereqs from context-atlas.

#### Versions
- copilot 3.8.1
- idearium 4.29.6
- prompt blocks 1.6.1
- context-prereqs 1.1.0
- workset 1.1.0

## Ledger

### Build 0.39.339 — snap-0731 — 2026-10-05 07:49:12

- Archive: `nexus-0731_2026-10-05_v0.39.339_main-28.zip` (was `Nexus-main-28.zip`)
- SHA-256: `4cece65572b3f84eebd9ee81d9b6cf57c9f3092dd43415fb7370ef3ed863076a`, 14.6 MB, downloaded 2026-10-05 07:49:36
- Kind: full
- Commit: `3ea1724f7f5988aac45f739225168ba1fd2b9f61`, tag `snap-0731`
- Files in archive: 5276. Changes against the build before it: **9 added, 22 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 2 | 7 | 0 |
| (root) | 3 | 2 | 0 |
| copilot | 1 | 3 | 0 |
| idearium | 0 | 4 | 0 |
| tests | 3 | 1 | 0 |
| loom | 0 | 3 | 0 |
| docs | 0 | 2 | 0 |

```
M .gitignore
A CHANGELOG-0.39.337.md
A CHANGELOG-0.39.338.md
A CHANGELOG-0.39.339.md
A copilot/lib/workset.js
M copilot/server.js
M copilot/spec/copilot.spec
M copilot/tool-runtime.js
M docs/2026-10-05-build-from-the-spec-phasemap.spec
M docs/SPEC-REGISTRY.spec
M idearium/api/index.js
M idearium/index.js
M idearium/package.json
M idearium/spec/idearium.spec
M lib/agent-tools/index.js
M lib/agent-tools/tool-catalog.js
M lib/agent-tools/tool-guide.js
A lib/agent-tools/tools/query/learn.js
A lib/context-prereqs.js
M lib/repo-agent.js
M lib/repo-prompt-blocks.js
M lib/test-sandbox.js
M lib/version.js
M loom/data/events.json
M loom/data/registry.json
M loom/maps/copilot-capability-map.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-checklist-workset.test.js
A tests/modules/test-context-prereqs.test.js
A tests/modules/test-copilot-workset.test.js
```

