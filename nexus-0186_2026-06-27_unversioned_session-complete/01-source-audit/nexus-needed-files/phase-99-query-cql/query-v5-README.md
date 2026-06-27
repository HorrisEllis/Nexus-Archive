# Causal Nexus · Query

Causal Query Language (CQL) engine. Rich queries over the event graph without O(n) scans where possible.

## CQL syntax

```
FIND <scope> WHERE <conditions> [ORDER BY <field> ASC|DESC] [LIMIT <n>]

scope      = events | edges | chains
conditions = <condition> [AND|OR <condition>]
condition  = <field> <op> <value>
           | NOT <condition>
           | WITHIN <n> ticks OF '<type>'        (requires AND)
           | CAUSED_BY <condition>
           | HAS_CHILD <condition>
field      = type | source | seq | eventTs | ts | causedBy | edgeType | payload.<key>
op         = = | != | > | < | >= | <= | ~= | IN
```

## Examples

```sql
-- All failed commands with retries
FIND events WHERE type = 'command:failed' AND payload.retryCount >= 3 LIMIT 20

-- DOM changes near a navigation (within 500 causal ticks)
FIND events WHERE type = 'dom:changed' AND WITHIN 500 ticks OF 'page:navigated'

-- Events caused by a command:running (1 hop up the causal graph)
FIND events WHERE CAUSED_BY type = 'command:running'

-- Commands that have a child success event
FIND events WHERE type = 'command:running' AND HAS_CHILD type = 'command:success'

-- Full causal chain for every alert, newest first
FIND chains WHERE type = 'alert:critical' ORDER BY seq DESC LIMIT 5

-- Fuzzy source match
FIND events WHERE source ~= 'element' AND type != 'system:ring:evicted'

-- Type set membership
FIND events WHERE type IN ('command:running', 'command:failed') LIMIT 50
```

## Scopes

| Scope | Returns |
|-------|---------|
| `events` | Matching events only |
| `chains` | Full root→event path for each match |
| `edges` | (future) |

## Execution plan

Every QueryResult includes a `plan` field showing how the query executed:
- `strategy: 'typeIndex'` — seeded from kernel's O(1) typeIndex (fast path)
- `strategy: 'full-scan'` — scanned all events (when no type constraint)

## API

```js
import { query, parseQuery, execQuery, createQueryIndex,
         QueryResult, CQLSyntaxError } from './modules/query/query.js';

// Convenience: parse + exec in one call
const r = query("FIND events WHERE type = 'command:failed' LIMIT 10", kernel);
// r: { ok, events, total, durationMs, scope, plan }

// Separate parse + exec
const ast = parseQuery("FIND events WHERE type = 'command:failed'");
const r2  = execQuery(ast, kernel, { selected: selectedEvent });

// Secondary index for repeated queries on a snapshot
const idx = createQueryIndex(kernel.getAll(), ['type', 'source']);
idx.get('type', 'command:failed'); // O(1)
```
