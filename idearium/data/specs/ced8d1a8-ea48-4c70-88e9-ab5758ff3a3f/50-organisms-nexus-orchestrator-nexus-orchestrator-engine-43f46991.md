---
chunk_uuid: 43f46991-6572-44c6-8312-bde7e93cd576
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-nexus-orchestrator-nexus-orchestrator-engine
title: organisms/nexus-orchestrator/nexus-orchestrator.engine.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-nexus-orchestrator-nexus-orchestrator-engine
contract_id: spec-contract:ced8d1a8:organisms-nexus-orchestrator-nexus-orchestrator-engine:43f46991
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.369Z
---

/* ═══════════════════════════════════════════════════════════
   ORGANISM: ORCHESTRATOR  v1.0.0
   id: eravos.nexus-orchestrator

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusOrchestratorEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'orchestrator',
    label: 'ORCHESTRATOR',
    icon: '🌐',
    accent: '#ff2266',
    base: 'http://127.0.0.1:9000',
    statusPath: '/api/status',
    snapshotsPath: '/snapshots',
    orchestratorBase: 'http://127.0.0.1:9000',
    diagnosePath: '/diagnose',
    idLink: 'http://127.0.0.1:4800',
    isOrchestrator: true,
    ...config,
  });
}

return { mount };
})();