# NEXUS — session 2026-08-18 — full drop

Everything from this session in one archive, per the Output Contract. Drop over
the tree at `6e9051c`. **47 passing tests** across two suites, both registered
in `tests/modules/run-all.js`.

```
node tests/modules/test-hat-forge.js   →  29 passed, 0 failed
node tests/modules/test-intake.js      →  18 passed, 0 failed
```

## Contents

### 1 — Agent identity (code, Verified)
Six defects in the 2026-08-18 permanent-agent-ID work, found by running it.
`f8d2a53` changed one file and added no test; nothing under `tests/` had ever
referenced hat-forge.

- `lib/hat-forge.js` 0.3.0 — seedKey, `bySeedKey`, `adoptSeedKey`, `byName`,
  `migrateLegacyIds`, real-uuid minting with `legacyId` folded by `_byIdentity()`
- `lib/hat-seed.js` 1.1.0 — idempotent by ROLE, not by name
- `copilot/lib/self-model.js` — worn hat pinned and resolved by uuid
- `lib/intent-hat-router.js` 0.2.0 — verb table maps to roles
- `lib/scheduler.js` 1.1.0 — `Infinity` survives the JSON round trip; a lost `fn` fails loudly
- `lib/agent-tools/tools/identity/hat-forge.js` — `rename` reachable at last
- `cortex/memory/jaa-db.js` — the `JAA_DATA_DIR` line the suite needs for isolation
- `tests/modules/test-hat-forge.js` — 29 tests

Verified against a copy of your real `forged_hats.json`: five hats migrated off
name-as-id, four roles adopted, **zero forged**; then rename → reboot → still
zero forged.

### 2 — Guardian intake (code, Verified)
Downloads from a provider tab are captured at the Electron session, staged with
a contract, and never applied by arriving.

- `lib/intake.js` — stage / recordVerdict / promote / rollback
- `clear-glass/src/providers/download-capture.js` — `will-download` → guardian
- `clear-glass/src/providers/host.js` — arms capture on the session at :141
- `guardian/server.js` — five routes under `/api/intake`
- `tests/modules/test-intake.js` — 18 tests

### 3 — Pressure causality: P0 answered, P3 built (code, Verified)
**16 passing tests.** `node tests/modules/test-pressure-window.js`

- `lib/pressure-window.js` — the retrospective window. Joins `event_log`,
  the holders `autopilot.instance_snapshot` already carries, the CFR/RFR2
  field, and what the pattern engine already crystallised. Orders by
  `eventTs` (§3.2). Writes nothing (§10.2). **States its own blind spots.**
- `cli/pressure.js` — `node cli/pressure.js`, `list`, `explain <id>`,
  `--window 300`, `--json`
- `ui/pressure/index.html` — a projection over cortex's existing
  `/api/memory` contract. No new API route (§16.5, §10.3). Delete it and
  nothing stops working (§5.12).
- `tests/modules/test-pressure-window.js` — 16 tests

**P0's answer changed the map.** `autopilot.js:659` `_getPerPidMemoryMB()` is
real, batched, cross-platform — and writes attribution to
`autopilot.instance_snapshot`, never to the pressure event. Attribution
existed; nothing joined it. Two limits found: it only sees autopilot-tracked
pids (so Electron's 4,951 MB renderer is invisible), and an empty OS result
becomes `{}` — indistinguishable from a machine holding no memory. Suspicion,
unverified: `wmic` may be gone on your Windows 11 build.

### 4 — Clear Glass toolkit (spec only, Specified)
§8.5 — nothing is built without a spec first. No code in this drop for either.

- `docs/MAP-2026-08-18-pressure-and-toolkit.md` — the §3.3 map, and a §0.1
  correction: the 16:30:57 crash was **not** the JAA store. Electron 6,897 MB
  across 14 processes vs Node 509 MB across 13.
- `docs/pressure-causality.spec` — P0 verify, P1 attribute, P2 exits as events,
  P3 the retrospective window, P4 API→CLI→UI
- `docs/clear-glass-toolkit.spec` — audit 71 declared vs 26 served before adding
  anything; the real gap is that `driver.screenshot` has zero consumers
- `docs/SPEC-REGISTRY.md` — both registered (§6.3)

## Three open questions (§0.1 — named, not guessed)

1. Should the four provider tabs still pre-warm at boot? Largest available
   memory win; a behaviour change to something you use, so not mine to decide.
2. Is `0xC0000409` reproducible on demand, or only under pressure?
3. Screenshot destination — provider composer, intake pipeline, or both? This
   one blocks P1 of the toolkit spec.

## Still yours to decide from earlier

- Whether hat responsibilities re-arm at boot. The restart failure is now loud
  and the restore lossless, but re-arming starts real dispatches at
  claude/chatgpt/perplexity on boot — cost and consent are yours to spend.
