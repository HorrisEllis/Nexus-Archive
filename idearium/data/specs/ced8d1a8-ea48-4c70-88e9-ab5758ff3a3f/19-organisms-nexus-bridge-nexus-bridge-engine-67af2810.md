---
chunk_uuid: 67af2810-5310-4b29-8bf8-f43d2f938303
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-nexus-bridge-nexus-bridge-engine
title: organisms/nexus-bridge/nexus-bridge.engine.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-nexus-bridge-nexus-bridge-engine
contract_id: spec-contract:ced8d1a8:organisms-nexus-bridge-nexus-bridge-engine:67af2810
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.359Z
---

/* ═══════════════════════════════════════════════════════════
   ORGANISM: NEXUS_BRIDGE  v1.0.0
   id: eravos.nexus-bridge

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusBridgeEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'bridge',
    label: 'NEXUS_BRIDGE',
    icon: '⬡',
    accent: '#00d4ff',
    base: 'http://127.0.0.1:9999',
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