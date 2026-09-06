---
chunk_uuid: 7808488f-78c7-45e3-860f-449adaf73b64
spec_uuid: 08af9d3b-44c4-4156-8709-261d224a69e6
section: document-routes
title: document — routes
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:08af9d3b:document-routes
contract_id: spec-contract:08af9d3b:document-routes:7808488f
agent: import
model: import:.spec
status: complete
completed_at: 2026-09-06T00:17:18.306Z
---

<!-- imported: document → routes -->


  routes:
    external:
      - "GET  /health"
      - "GET  /contract"
      - "GET  /api/projects"
      - "POST /api/projects"
      - "GET  /api/projects/:id"
      - "POST /api/projects/:id/spec"
      - "GET  /api/ideas"
      - "POST /api/ideas"
      - "PUT  /api/ideas/:id/phase"
      - "GET  /api/lattice"
      - "POST /api/lattice/connect"
