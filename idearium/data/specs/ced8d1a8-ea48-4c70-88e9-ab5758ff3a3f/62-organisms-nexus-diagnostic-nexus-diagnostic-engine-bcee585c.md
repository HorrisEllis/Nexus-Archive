---
chunk_uuid: bcee585c-b736-4195-90c0-f85796688a3c
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-nexus-diagnostic-nexus-diagnostic-engine
title: organisms/nexus-diagnostic/nexus-diagnostic.engine.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-nexus-diagnostic-nexus-diagnostic-engine
contract_id: spec-contract:ced8d1a8:organisms-nexus-diagnostic-nexus-diagnostic-engine:bcee585c
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.373Z
---

/* ═══════════════════════════════════════════════════════════
   ORGANISM: DIAGNOSTIC  v1.0.0
   id: eravos.nexus-diagnostic

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusDiagnosticEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'diagnostic',
    label: 'DIAGNOSTIC',
    icon: '🩹',
    accent: '#aa44ff',
    base: 'http://127.0.0.1:7825',
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