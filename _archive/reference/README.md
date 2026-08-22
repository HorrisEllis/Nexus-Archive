# Reference sources — not live code

## causal-nexus-persist-v4.5.1.js  (527 L)

Kept for `docs/versionium.spec` build step 2–3 (HOT ring / WARM WAL / COLD archive).

**Why it is here and not in `intelligence/meta/rfr2/`:** rfr2 is the descendant of
Causal-Nexus and does *not* have a `persist` module — it kept clip/delta/compress/
context and dropped the persistence tiers. This is the piece that went missing, and
it is the only correct answer to "snapshot just before the sigma event": a ring that
is always capturing and is frozen when sigma fires.

**It is reference, not a dependency.** Nothing requires it. §1.3 — it is not a live
path, and it must not become one by being imported. Port the tier model into
`versionium/lib/ring.js` and `versionium/lib/wal.js`; do not `require()` this file.

Source: Causal-Nexus v4.5.1, `modules/persist/persist.js`.
Reviewed 2026-08-22 against Causal-Nexus v5.0.0 Spec.
