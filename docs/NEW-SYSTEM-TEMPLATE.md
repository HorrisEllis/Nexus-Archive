# NEXUS — Adding a New System or Feature: The Template

This exists because every item on this checklist is a real bug found and fixed this
session — not a hypothetical. Skipping any one of these has already broken something,
silently, in production, on a real boot log. Follow in order; each step is cheap, and
the cost of skipping one only shows up much later, somewhere else, looking unrelated.

---

## Step 1 — Pick a port. Check it's actually unique.

`orchestrator.js`'s `SYS` table is a single object literal. **JavaScript will not warn
you if you reuse a key — it silently keeps the last one.** This already happened once:
`ollama` was defined twice (the sovereign bridge at :3749, then the native desktop app
at :11434), and every orchestrator call meant for the bridge silently went to the native
app instead for an unknown amount of time before anyone noticed.

```js
grep -n "yoursystemname:" orchestrator.js   // must return exactly one line, always
```

## Step 2 — Every component needs all seven fields, not just the obvious ones.

`lib/component-registry.js`'s real validator requires:
`id, namespace, name, version, grammar, route, description`

Two brand-new sovereign systems (copilot, ollama) shipped with only 4 of the 7 — missing
`namespace`, `name`, `version` on every single component. Registration failed completely
for both (`registered 0 components, 4/5 failed`) and nobody saw an error, just a quiet
zero in a boot log most people scroll past.

```js
{
  id: 'yoursystem.thing',
  namespace: 'yoursystem',        // ← must match systemId
  name: 'yoursystem.thing',       // ← can just repeat id
  version: '1.0.0',               // ← matches your module's own VERSION
  uuid: 'nexus-yoursystem-comp-thing-v1-001',
  grammar: ['thing', 'do thing'],
  route: { method: 'GET', path: '/api/thing' },
  description: 'One sentence, what this actually does.',
}
```

**Verify it, don't assume it:**
```js
const { validate } = require('./lib/component-registry.js');
require('./yoursystem/registry-components.js').components.forEach(c => {
  const r = validate(c);
  console.log(c.id, r.ok ? 'PASS' : 'FAIL: ' + r.errors.join('; '));
});
```

## Step 3 — Expose `/api/contract`. The orchestrator checks every system for it, unconditionally.

Three new systems shipped with no contract route at all. The orchestrator's
`contract.unreachable` check hit each one's catch-all 404 handler, which returns plain
text (`"Not found"`), and tried to `JSON.parse()` it — hence the exact error
`invalid JSON: Unexpected token 'N', "Not found" is not valid JSON`. Every system that
talks to the orchestrator needs this route, no exceptions, copied from any working one
(architect's is a clean reference).

## Step 4 — If you're replacing something that already exists, find every caller first. Don't assume `require()` finds them all.

Code-level dependency grep (`grep -rl "old/path"`) only finds callers that `require()`
the module directly. It misses anything that calls in over HTTP. The co-pilot migration
this session had two callers a pure code grep never would have caught —
`cli/nexus-repl.js` and `ui/home/index.html` both hit the old route by URL string, not by
`require()`. Found only by reading a comment that happened to mention them. Grep for the
**route string**, not just the module path:

```bash
grep -rl "old/route/path" --include="*.js" --include="*.html" .
```

## Step 5 — If a caller needs something the new system doesn't have yet, say so. Don't fake it.

One of the four co-pilot callers (`ui/home/index.html`'s channel-change tracker) needed
an endpoint the new sovereign co-pilot simply doesn't have. The fix was to leave it
pointed at the old route with an explicit comment explaining why, not to invent a
plausible-looking endpoint that might quietly do the wrong thing. A known, flagged gap
is recoverable. A silently wrong guess is not.

## Step 6 — Write the `.spec`, with a changelog block from day one, not added later.

```yaml
spec:
  meta:
    name: yoursystem
    version: 1.0.0
    uuid: nexus-yoursystem-v1-0000-<date>-jamesbrooks-001
    purpose: >
      One paragraph. What is this for, and what does it specifically NOT do.

  changelog:
    - version: 1.0.0
      date: <today>
      change: "Initial implementation. What it does, what it deliberately doesn't."
      evidence: "Which test file, how many passing, against what real dependencies."
```

## Step 7 — Add it to `lib/version.js`'s registry, matching the `.spec` exactly.

This is what `spec-drift.js` checks every boot. If the spec says 1.0.0 and the registry
says something else, that's an immediate, visible gap on the next boot — which is the
point. Better to show up here than be silently wrong for weeks.

## Step 8 — Write a test that proves the actual claim, against real dependencies.

Not "does it load." Prove the one thing you're claiming is true — the same way every
fix this session was verified: real compartment-engine, real case-library, real
validator, real dispatch pool — mocking only the unavoidable (JAA, usually). A test that
mocks away the thing it's supposed to prove, proves nothing.

## Step 9 — Run the full regression sweep before calling it done.

```bash
node tests/brutal.test.js
node tests/modules/<anything touching what you changed>.test.js
node -e "require('./lib/spec-drift').check()"
```

## Step 10 — Log the fix to Cortex, not just to a diff.

`cortex/data/fix_map.jsonl` is the real, persistent record of what was actually
wrong and what was actually done about it — append a real entry, same shape as
everything already in there. A fix that only exists as a code change and a chat
message is a fix nobody five sessions from now will be able to find.

---

### The one-line version, for next time

**Unique key → all 7 required fields → contract route → find every real caller, not
just `require()`-able ones → flag what you can't migrate, don't fake it → spec with
changelog → registry entry matching the spec → test that proves the real claim →
full regression → logged to Cortex.**

Every step above is paid for already, once, this session. Following this list means
paying for it zero more times.
