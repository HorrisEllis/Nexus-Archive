---
chunk_uuid: 3cd437ed-5d65-48b5-824a-b6b6ea5cb0b5
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-spec-engine-templates-plugin-runtime-md
title: n139/idearium/spec-engine/templates/plugin-runtime.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-spec-engine-templates-plugin-runtime-md
contract_id: spec-contract:09d1b526:n139-idearium-spec-engine-templates-plugin-runtime-md:3cd437ed
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:17:44.796Z
---

<!-- §SEED PROVENANCE — extracted verbatim from SYSTEM_SPEC_v1_0_0.md,
     section "## 12. PLUGINS — plugins/", authored by james-brooks. Real
     isolation/load/unload/hot-swap contract for a shipped plugin system —
     chosen as the reference shape for a "Plugin Runtime" archetype. -->
## 12. PLUGINS — `plugins/`

Plugins are structurally isolated. They communicate only through the bus. They cannot import
from the kernel or from each other. They cannot write to the database directly. They cannot
modify contracts. Any plugin that attempts to do so is rejected at load time and logged.

**Load criteria:**
1. `plugin.json` validates against `plugin.contract.json`
2. All declared `emits` and `consumes` are registered in `events.schema.json`
3. No UUID conflict with any loaded plugin or core module

**Unload:** `teardown()` is called, subscriptions are removed, UUID is flagged inactive in the
registry, and the gap report is re-run.

**Hot-swap:** Plugins can be loaded and unloaded at runtime without kernel restart. The bus
handles subscription cleanup automatically on teardown.

---