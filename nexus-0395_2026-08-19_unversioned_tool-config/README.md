# Tool config — backend first

**34 passing tests** (22 config + 12 reachability). Drop over
`nexus-2026-08-19-hey-nexus-merged-1`.

```
lib/tool-config.js                                    new — the store + the rules
lib/agent-tools/index.js                              enforcement at BOTH gates
lib/agent-tools/tools/governance/tool-config.js       new — co-pilot changes options
lib/agent-reach.js + tools/identity/switch-agent.js   yesterday's fix, included
tests/modules/test-tool-config.js                     22 tests
tests/probe/copilot-probe.js                          still not in your tree — it's here
```

```
node tests/modules/test-tool-config.js   →  22 passed, 0 failed
node tests/modules/test-agent-reach.js   →  12 passed, 0 failed
```

§8.5, backend first: store, rules, enforcement. No API, no CLI, no UI — those
are P5 and they come after this gate, in that order (§3.4).

---

## Talking to co-pilot

```
"disable run_command, it keeps failing"        → done immediately
"what's configured right now?"                 → list
"why is read_file behaving differently?"       → history, with who and why
"make safe_apply ask me first"                 → done immediately
"restrict parallel_dispatch to ollama"         → done immediately
"turn run_command back on"                     → proposal for you
```

## The ratchet — the rule that makes this safe

You want co-pilot editing the config that governs co-pilot. §7.2 says ideas
can't affect runtime; §17.10 says nothing bypasses verification. So the naive
version is out. The resolution is **directional**, not a blanket ban:

| | who |
|---|---|
| **Tightening** — disable, require confirmation, narrow allowedAgents | anyone, immediately |
| **Loosening** — enable, drop confirmation, widen | **you only** |

An agent that can only ever restrict itself cannot grant itself capability,
which is the entire risk. It keeps the useful half intact: *"run_command has
failed four times this session, I'm disabling it and here's why"* needs nobody's
permission, and that's the case this exists for.

Loosening isn't refused — it returns a **proposal**, and
`autonomy-router.js` 2.0.0 already implements propose-then-confirm for every
state-changing action. Reused, not reinvented (§16.5).

**The tool has no `by` parameter.** `lib/tool-config.js` accepts one; the agent
tool hard-codes `ACTOR.AGENT` and exposes no argument, because a model that
could pass `by:'user'` would make the whole ratchet decorative. `TC-009` asserts
the parameter doesn't exist; `TC-010` passes `by:'user'` anyway and proves it's
ignored.

## The test that protects your other 71 tools

`TC-001`. An unconfigured tool returns defaults and is allowed — so landing this
file changes the behaviour of **nothing** you haven't explicitly configured. If
the config layer throws or goes missing, `executeTool` proceeds exactly as
before: a broken config layer must never become a silent capability outage.

## Enforcement is structural, in two places

`lib/agent-tools/index.js` is the only path every tool call takes, so both gates
live there rather than inside 71 tools checking politely (§16.3):

- **`getToolSchemas()`** — a disabled tool isn't *offered*. A model shown a tool
  it can't use will plan around it and then fail, which is worse than never
  seeing it. `TC-013`.
- **`executeTool()`** — a disabled tool doesn't *run*, defaults merge **under**
  caller args (a default that overrode an explicit argument would make the tool
  disobey its own call — `TC-016`), and `allowedAgents` / `requiresConfirm` are
  checked. `TC-012`, `TC-014`, `TC-015`.

## What I deliberately left out

**Limits and budgets.** `perHour`, `maxConcurrent` are in the spec as P3 and are
not in this code, because a stored limit that nothing enforces is a placeholder
that looks like a safeguard — §1.3, and worse than its absence, since it would
be trusted. They land when the enforcement lands.

## The adversarial test worth reading

`TC-006`. The sneaky case: an agent submits `{enabled: true, requiresConfirm: true}`
— net safer on its face, and it smuggles an enable through under cover of a
tightening. Any change containing **any** loosening is treated as loosening. If
you only ever read one test in this drop, read that one.
