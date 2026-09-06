---
chunk_uuid: 2387d0cd-6b2d-46eb-a2f2-ac7641699fcb
spec_uuid: 382a3442-220b-47e0-9e3c-3f98fbb98d10
section: document-routes
title: document — routes
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:382a3442:document-routes
contract_id: spec-contract:382a3442:document-routes:2387d0cd
agent: import
model: import:.spec
status: complete
completed_at: 2026-09-06T00:03:56.158Z
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
