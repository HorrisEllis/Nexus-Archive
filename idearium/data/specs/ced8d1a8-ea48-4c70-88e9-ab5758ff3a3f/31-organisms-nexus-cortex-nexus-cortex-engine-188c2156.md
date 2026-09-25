---
chunk_uuid: 188c2156-bc17-43cd-8af2-658eac5e9478
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-nexus-cortex-nexus-cortex-engine
title: organisms/nexus-cortex/nexus-cortex.engine.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-nexus-cortex-nexus-cortex-engine
contract_id: spec-contract:ced8d1a8:organisms-nexus-cortex-nexus-cortex-engine:188c2156
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.363Z
---

/* ═══════════════════════════════════════════════════════════
   ORGANISM: NEXUS_CORTEX  v1.0.0
   id: eravos.nexus-cortex

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusCortexEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'cortex',
    label: 'NEXUS_CORTEX',
    icon: '🧠',
    accent: '#00ff88',
    base: 'http://127.0.0.1:3748',
    statusPath: '/api/status',
    snapshotsPath: '/snapshots',
    orchestratorBase: 'http://127.0.0.1:9000',
    diagnosePath: '/diagnose',
    idLink: 'http://127.0.0.1:4800',
    isOrchestrator: false,
    ...config,
  });
}

return { mount };
})();