---
chunk_uuid: 95f8ea01-8b9a-43af-81db-8e9718d990e5
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-nexus-architect-nexus-architect-engine
title: organisms/nexus-architect/nexus-architect.engine.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-nexus-architect-nexus-architect-engine
contract_id: spec-contract:ced8d1a8:organisms-nexus-architect-nexus-architect-engine:95f8ea01
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.371Z
---

/* ═══════════════════════════════════════════════════════════
   ORGANISM: ARCHITECT  v1.0.0
   id: eravos.nexus-architect

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusArchitectEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'architect',
    label: 'ARCHITECT',
    icon: '📐',
    accent: '#00ff88',
    base: 'http://127.0.0.1:3747',
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