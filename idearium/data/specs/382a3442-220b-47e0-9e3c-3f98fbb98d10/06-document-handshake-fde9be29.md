---
chunk_uuid: fde9be29-b1b1-4f9d-9456-bcb7def4490e
spec_uuid: 382a3442-220b-47e0-9e3c-3f98fbb98d10
section: document-handshake
title: document — handshake
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:382a3442:document-handshake
contract_id: spec-contract:382a3442:document-handshake:fde9be29
agent: import
model: import:.spec
status: complete
completed_at: 2026-09-06T00:03:56.162Z
---

<!-- imported: document → handshake -->


  handshake:
    components:
      - id: "idearium.projects.list"
        grammar: ["idearium projects", "projects", "proj"]
        route: { method: GET, path: "/api/idearium/projects" }
        description: "List all projects by phase"

      - id: "idearium.ideas.list"
        grammar: ["idearium ideas", "ideas"]
        route: { method: GET, path: "/api/idearium/ideas" }
        description: "List all ideas with phase and weight"

      - id: "idearium.ideas.create"
        grammar: ["idearium new idea", "new idea", "idea"]
        route: { method: POST, path: "/api/idearium/ideas" }
        description: "Create a new seed idea"
        params: [{ name: text, type: string, required: true }]

      - id: "idearium.lattice.view"
        grammar: ["idearium lattice", "lattice"]
        route: { method: GET, path: "/api/idearium/lattice" }
        description: "View the current idea-spec-gap lattice"
