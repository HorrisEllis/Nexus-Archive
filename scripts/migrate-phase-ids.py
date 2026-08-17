#!/usr/bin/env python3
"""One-shot phase-ID namespace migration.

Ten phasemaps shared three prefixes between them. `P1`-`P5` were each declared
by EIGHT different maps, `CA1`-`CA7` by two, `SS1`-`SS2` by two. This gives
every map a prefix of its own.

Order matters: cross-map references are rewritten to their FOREIGN prefix
FIRST, so the per-file bulk pass can no longer match them (they stop looking
like `P<n>` the moment they become `OM<n>`/`WV<n>`). Doing it the other way
round would silently relabel a reference to another map's phase as this map's.
"""
import re, sys, os

MIGRATION = {
    # file stem                          old   new   why this prefix
    'copilot-full-capability':          ('P',  'FC'),
    'copilot-omniscience':              ('P',  'OM'),
    'cortex-schema-registry':           ('P',  'CS'),   # its UM1-UM4 are already unique, untouched
    'gemini-multiagent-coding':         ('P',  'GM'),
    'nexus-architecture-rebuild':       ('P',  'AR'),
    'nexus-live-mind':                  ('P',  'LM'),
    'raid-verification-spine':          ('P',  'VS'),
    'raid-warp-verification':           ('P',  'WV'),
    'copilot-autonomous':               ('CA', 'AU'),   # collided with copilot-awareness-routing, which code cites by name
    'snapshot-trigger':                 ('SS', 'SN'),   # collided with nexus-system-standardization
}

# Genuine cross-map references, found by grepping for a phase id within 70
# chars of the word "phasemap" and reading all four hits. Rewritten to the
# TARGET map's new prefix before anything else runs.
CROSS_MAP = [
    ('copilot-full-capability', 'docs/copilot-omniscience-phasemap.spec (P1-P7, ALL',
                                'docs/copilot-omniscience-phasemap.spec (OM1-OM7, ALL'),
    ('copilot-full-capability', 'same rule P7 of the omniscience phasemap alre',
                                'same rule OM7 of the omniscience phasemap alre'),
    ('cortex-schema-registry',  'docs/raid-warp-verification-phasemap.spec P1-P4 (DONE)',
                                'docs/raid-warp-verification-phasemap.spec WV1-WV4 (DONE)'),
]

DOCS = 'docs'
report = []

# ── Pass 1 — cross-map references ────────────────────────────────────────────
for stem, old, new in CROSS_MAP:
    p = os.path.join(DOCS, f'{stem}-phasemap.spec')
    s = open(p).read()
    if new in s and old not in s:
        report.append(f"  cross-map  {stem}: already applied, skipped")
        continue
    if old not in s:
        sys.exit(f"FATAL: cross-map anchor not found in {p}: {old!r}")
    s = s.replace(old, new)
    open(p, 'w').write(s)
    report.append(f"  cross-map  {stem}: {old[:46]!r} -> foreign prefix")

# ── Pass 2 — per-file bulk rename ────────────────────────────────────────────
for stem, (old, new) in MIGRATION.items():
    p = os.path.join(DOCS, f'{stem}-phasemap.spec')
    s = open(p).read()

    decls_before = len(re.findall(rf'^\s{{2,6}}{old}\d+_', s, re.M))
    # §FIXED during the migration run itself. This was `\\b{old}(\\d+)\\b`, and
    # `_` is a word character — so there is NO word boundary between the `1`
    # and the `_` in `P1_cross_agent_recall`, and the pattern skipped every
    # single declaration line while happily rewriting the prose around them.
    # Caught by the decls_before/decls_after guard (11 -> 0), which is exactly
    # what that guard was for. Verified separately that no `P<n><letter>`
    # token exists anywhere in the corpus, so a lookahead on digits alone is
    # safe here.
    pat = re.compile(rf'\b{old}(\d+)(?!\d)')
    hits = len(pat.findall(s))
    s2 = pat.sub(rf'{new}\1', s)
    decls_after = len(re.findall(rf'^\s{{2,6}}{new}\d+_', s2, re.M))

    if decls_before != decls_after:
        sys.exit(f"FATAL: {stem} declaration count changed {decls_before} -> {decls_after}")
    if pat.search(s2):
        sys.exit(f"FATAL: {stem} still contains bare {old}<n> after rename")

    open(p, 'w').write(s2)
    report.append(f"  {stem:34} {old}->{new}  {decls_before} declarations, {hits} total references")

print("MIGRATED")
print("\n".join(report))
