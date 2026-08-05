# Emergence field contract — as OBSERVED FROM THE CONSUMER

**§0.1 — read this section first.** Emergence is not in `eravos-git.zip`. Its
source has never been read. Everything below is reconstructed from ERAVOS's
consumer code only. Each line is marked for what it is.

- **[E]** evidence — read directly off consumer source, with file:line.
- **[I]** inference — consistent with the consumer, but unverified against
  Emergence itself. May be wrong. Must not be built against as if settled.

## Transport

| | |
|---|---|
| **[E]** Base path | `/emergence`, overridable via `EravosConfig.emergence.base` — `eravos-kernel.js:5665` |
| **[E]** Endpoint | `GET {base}/field`, `cache: 'no-store'` — `eravos-kernel.js:5672` |
| **[E]** Response | JSON object, `res.ok` required — `eravos-kernel.js:5673–5674` |
| **[E]** Auth | none sent by the consumer |
| **[I]** Method set | Read-only. The consumer never POSTs. Whether Emergence exposes writes is unknown. |
| **[I]** Same-origin | `config/options.json:88–91` says a server-side mount makes the same-origin path work unchanged. The mount itself does not exist in this repo — `eravos-serve.js` has no `/emergence` route. **The bridge has never run against a live producer in anything shipped here.** |

## Payload

Four fields are used by name. **[E]** all four, `alk/dimensions.js:258–300`:

| Field | Type | Used how |
|-------|------|----------|
| `trajectory` | categorical string | Mismatch caps similarity at `0.25`. Two named values appear in prose: `DECAYING`, `REPAIRING`. |
| `decay_score` | number | Gates `extract()` — a payload without a numeric `decay_score` is treated as no field at all. |
| `rupture_severity` | number | Euclidean distance term. |
| `meaning_charge` | number | Euclidean distance term. |

- **[I]** The full enum of `trajectory` is unknown. Only two values are named
  anywhere in ERAVOS, and both appear in a comment, not in code.
- **[I]** Numeric ranges are unstated. `similarity()` computes
  `1 − sqrt(mean(squared differences))` and clamps at 0, which only behaves
  sensibly if all three numerics are roughly 0–1. That is an assumption the
  consumer makes silently.
- **[E]** Extra fields are harmless: `extract()` returns the whole object and
  `similarity()` iterates a fixed key list.

## Lifecycle

**[E]** `eravos-kernel.js:5667–5702`:

- Three states: `unknown | attached | absent`.
- Once `absent`, `refreshEmergenceField()` returns `null` immediately and
  never probes again for the life of the page.
- The absence is logged **once**, via `console.info`, phrased as a stated
  absence and not an error.
- Attachment is logged once on the transition to `attached`.
- On success, publishes the raw payload to the ALK bus as `alk.field.state`.
- Polls at load + 2500 ms, then only on `rupture:save`, `feeling:set`,
  `growth:save` — the events that would actually move a field. No interval.

**[E]** `alk/alk-boot.js:96–98, 177–182`: the subscriber stores the last field
in `_lastField`, defaulting to `null`. The field is read **at ingest** and
frozen onto the node, so a later field change never retroactively rewrites what
an earlier node recorded.

## The two properties worth carrying over

1. **Abstention is structural, not a flag.** No field → `extract()` returns
   `null` → the dimension emits no edge. There is no "default field," no zero
   vector, no neutral value. A dimension that cannot see is silent, and
   silence is information (§12.5).
2. **Time-of-record, not time-of-query.** The field is stamped onto the node
   when the event happens. This is what makes the dimension answer "was the
   system in the same state both times" instead of "does the current state
   match" — and it is the property that would be lost first if this were
   reimplemented from the description rather than from the source.

## What must be verified before this contract is trusted

- Read Emergence itself. Until then the payload shape is one consumer's belief.
- Confirm the numeric ranges. The distance math assumes 0–1 without checking.
- Enumerate `trajectory`. A categorical that caps a score cannot have an
  open-ended unknown domain in a system that then reasons over the result.
- Stand up a real `/emergence` mount and observe one live response. Every
  claim above is currently from code that has only ever taken the `absent`
  branch in this repo.
