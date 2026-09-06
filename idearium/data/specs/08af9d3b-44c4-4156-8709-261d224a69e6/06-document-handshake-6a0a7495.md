---
chunk_uuid: 6a0a7495-4551-45e7-b06f-50d3cb7bf9b9
spec_uuid: 08af9d3b-44c4-4156-8709-261d224a69e6
section: document-handshake
title: document — handshake
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:08af9d3b:document-handshake
contract_id: spec-contract:08af9d3b:document-handshake:6a0a7495
agent: import
model: import:.spec
status: complete
completed_at: 2026-09-06T00:17:18.311Z
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
