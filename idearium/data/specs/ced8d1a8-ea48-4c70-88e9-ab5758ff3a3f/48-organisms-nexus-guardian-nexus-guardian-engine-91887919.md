---
chunk_uuid: 91887919-f3d1-428d-b381-533bb7613115
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-nexus-guardian-nexus-guardian-engine
title: organisms/nexus-guardian/nexus-guardian.engine.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-nexus-guardian-nexus-guardian-engine
contract_id: spec-contract:ced8d1a8:organisms-nexus-guardian-nexus-guardian-engine:91887919
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.369Z
---

/* ═══════════════════════════════════════════════════════════
   ORGANISM: NEXUS_GUARDIAN  v1.0.0
   id: eravos.nexus-guardian

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusGuardianEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'guardian',
    label: 'NEXUS_GUARDIAN',
    icon: '🛡️',
    accent: '#ffaa00',
    base: 'http://127.0.0.1:7820',
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