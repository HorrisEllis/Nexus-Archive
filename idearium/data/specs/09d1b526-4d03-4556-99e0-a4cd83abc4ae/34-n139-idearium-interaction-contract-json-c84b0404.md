---
chunk_uuid: c84b0404-bffb-42b3-b491-1a8043be5bad
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-interaction-contract-json
title: n139/idearium/interaction-contract.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-interaction-contract-json
contract_id: spec-contract:09d1b526:n139-idearium-interaction-contract-json:c84b0404
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:17:37.579Z
---

{
  "id": "idearium-v1",
  "version": "1.0.0",
  "namespace": "idearium",
  "_reconciled_2026_09_13": "MCO18 (Track B item 3 continuation) \u2014 extracted programmatically from idearium/api/index.js's own real route table (a [method, pathSegments, actionName] array, not path_.startsWith-style dispatch like most other systems) \u2014 every entry below is real, verbatim from that table, not manually transcribed or guessed.",
  "ports": {
    "http": 4800
  },
  "uuid": "idearium-contract-v1-0000-2026-0701-jamesbrooks-001",
  "role": "Spec engine, repo layer (compartment-as-repo, MCO11), ideas/brainstorms, chunk dispatch",
  "health": {
    "method": "GET",
    "path": "/health",
    "returns": {
      "ok": true
    }
  },
  "routes": [
    {
      "method": "GET",
      "path": "/health",
      "description": "health"
    },
    {
      "method": "GET",
      "path": "/api/contract",
      "description": "contract.get"
    },
    {
      "method": "GET",
      "path": "/api/contract/live",
      "description": "contract.live"
    },
    {
      "method": "GET",
      "path": "/api/stats",
      "description": "stats.get"
    },
    {
      "method": "GET",
      "path": "/api/snr",
      "description": "snr.current"
    },
    {
      "method": "GET",
      "path": "/api/snr/history",
      "description": "snr.history"
    },
    {
      "method": "GET",
      "path": "/api/events",
      "description": "events.log"
    },
    {
      "method": "GET",
      "path": "/api/ideas",
      "description": "idea.list"
    },
    {
      "method": "POST",
      "path": "/api/ideas",
      "description": "idea.create"
    },
    {
      "method": "GET",
      "path": "/api/brainstorms",
      "description": "brainstorm.list"
    },
    {
      "method": "POST",
      "path": "/api/brainstorms",
      "description": "brainstorm.create"
    },
    {
      "method": "DELETE",
      "path": "/api/brainstorms/:uuid",
      "description": "brainstorm.delete"
    },
    {
      "method": "POST",
      "path": "/api/brainstorms/:uuid/promote",
      "description": "brainstorm.promote"
    },
    {
      "method": "GET",
      "path": "/api/specs",
      "description": "spec.list"
    },
    {
      "method": "POST",
      "path": "/api/specs",
      "description": "spec.create"
    },
    {
      "method": "GET",
      "path": "/api/gaps",
      "description": "gap.list"
    },
    {
      "method": "POST",
      "path": "/api/gaps",
      "description": "gap.open"
    },
    {
      "method": "GET",
      "path": "/api/snapshots",
      "description": "snapshot.list"
    },
    {
      "method": "POST",
      "path": "/api/snapshots",
      "description": "snapshot.push"
    },
    {
      "method": "POST",
      "path": "/api/cli/exec",
      "description": "cli.exec"
    },
    {
      "method": "GET",
      "path": "/api/repos",
      "description": "repo.list"
    },
    {
      "method": "POST",
      "path": "/api/repos",
      "description": "repo.ingest"
    },
    {
      "method": "POST",
      "path": "/api/repos/import",
      "description": "repo.import-archive"
    },
    {
      "method": "GET",
      "path": "/api/projects",
      "description": "project.list"
    },
    {
      "method": "POST",
      "path": "/api/projects",
      "description": "project.upload"
    },
    {
      "method": "GET",
      "path": "/api/projects/:uuid/download",
      "description": "project.download"
    },
    {
      "method": "DELETE",
      "path": "/api/projects/:uuid",
      "description": "project.delete"
    },
    {
      "method": "GET",
      "path": "/api/spec-engine/warp-status",
      "description": "speceng.warp.status"
    },
    {
      "method": "GET",
      "path": "/api/spec-engine/templates",
      "description": "speceng.templates"
    },
    {
      "method": "GET",
      "path": "/api/spec-engine/specs",
      "description": "speceng.list"
    },
    {
      "method": "POST",
      "path": "/api/spec-engine/specs",
      "description": "speceng.create"
    },
    {
      "method": "POST",
      "path": "/api/spec-engine/import",
      "description": "spec.import"
    },
    {
      "method": "POST",
      "path": "/api/spec-engine/specs/:uuid/promote",
      "description": "spec.promote"
    },
    {
      "method": "POST",
      "path": "/api/spec-engine/wizard",
      "description": "speceng.wizard"
    },
    {
      "method": "GET",
      "path": "/api/spec-engine/context",
      "description": "speceng.context"
    },
    {
      "method": "POST",
      "path": "/api/copilot/suggest",
      "description": "copilot.suggest"
    },
    {
      "method": "GET",
      "path": "/sse",
      "description": "sse"
    },
    {
      "method": "GET",
      "path": "/api/ideas/:uuid",
      "description": "idea.show"
    },
    {
      "method": "PATCH",
      "path": "/api/ideas/:uuid",
      "description": "idea.update"
    },
    {
      "method": "DELETE",
      "path": "/api/ideas/:uuid",
      "description": "idea.archive"
    },
    {
      "method": "POST",
      "path": "/api/ideas/:uuid/tension",
      "description": "idea.tension"
    },
    {
      "method": "POST",
      "path": "/api/ideas/:uuid/link",
      "description": "idea.link"
    },
    {
      "method": "POST",
      "path": "/api/ideas/:uuid/spec",
      "description": "idea.spec"
    },
    {
      "method": "POST",
      "path": "/api/ideas/:uuid/phase",
      "description": "idea.phase"
    },
    {
      "method": "GET",
      "path": "/api/specs/:uuid",
      "description": "spec.show"
    },
    {
      "method": "PATCH",
      "path": "/api/specs/:uuid",
      "description": "spec.update"
    },
    {
      "method": "POST",
      "path": "/api/specs/:uuid/check",
      "description": "spec.check"
    },
    {
      "method": "POST",
      "path": "/api/ideas/:uuid/progress",
      "description": "idea.progress"
    },
    {
      "method": "POST",
      "path": "/api/queue/:queueId/progress",
      "description": "queue.progress"
    },
    {
      "method": "GET",
      "path": "/api/queue/:queueId",
      "description": "queue.show"
    },
    {
      "method": "POST",
      "path": "/api/specs/:uuid/build",
      "description": "spec.build"
    },
    {
      "method": "GET",
      "path": "/api/specs/:uuid/export",
      "description": "spec.export"
    },
    {
      "method": "DELETE",
      "path": "/api/specs/:uuid",
      "description": "spec.archive"
    },
    {
      "method": "GET",
      "path": "/api/gaps/:uuid",
      "description": "gap.show"
    },
    {
      "method": "POST",
      "path": "/api/gaps/:uuid/resolve",
      "description": "gap.resolve"
    },
    {
      "method": "POST",
      "path": "/api/gaps/:uuid/ignore",
      "description": "gap.ignore"
    },
    {
      "method": "GET",
      "path": "/api/snapshots/:uuid",
      "description": "snapshot.show"
    },
    {
      "method": "GET",
      "path": "/api/snapshots/:a/diff/:b",
      "description": "snapshot.diff"
    },
    {
      "method": "POST",
      "path": "/api/snapshots/:uuid/restore",
      "description": "snapshot.restore"
    },
    {
      "method": "GET",
      "path": "/api/repos/:uuid",
      "description": "repo.show"
    },
    {
      "method": "GET",
      "path": "/api/spec-engine/specs/:uuid",
      "description": "speceng.show"
    },
    {
      "method": "POST",
      "path": "/api/spec-engine/specs/:uuid/build",
      "description": "speceng.build"
    },
    {
      "method": "POST",
      "path": "/api/spec-engine/specs/:uuid/chunk/:chunkUuid/complete",
      "description": "speceng.chunk.complete"
    },
    {
      "method": "POST",
      "path": "/api/spec-engine/specs/:uuid/chunk/:chunkUuid/fail",
      "description": "speceng.chunk.fail"
    },
    {
      "method": "POST",
      "path": "/api/spec-engine/specs/:uuid/chunk/:chunkUuid/agent",
      "description": "speceng.chunk.setAgent"
    },
    {
      "method": "POST",
      "path": "/api/spec-engine/specs/:uuid/warp-primitives",
      "description": "speceng.setWarpPrimitives"
    },
    {
      "method": "POST",
      "path": "/api/spec-engine/specs/:uuid/archive",
      "description": "speceng.archive"
    },
    {
      "method": "DELETE",
      "path": "/api/spec-engine/specs/:uuid",
      "description": "speceng.delete"
    },
    {
      "method": "POST",
      "path": "/api/spec-engine/specs/:uuid/restore",
      "description": "speceng.restore"
    },
    {
      "method": "POST",
      "path": "/api/spec-engine/specs/:uuid/expand",
      "description": "speceng.expand"
    },
    {
      "method": "POST",
      "path": "/api/repos/:uuid/fork",
      "description": "repo.fork"
    },
    {
      "method": "DELETE",
      "path": "/api/repos/:uuid",
      "description": "repo.archive"
    },
    {
      "method": "GET",
      "path": "/api/repos/:uuid/lineage",
      "description": "repo.lineage"
    },
    {
      "method": "GET",
      "path": "/api/repos/:uuid/file",
      "description": "repo.file.read"
    },
    {
      "method": "POST",
      "path": "/api/repos/:uuid/file",
      "description": "repo.file.write"
    },
    {
      "method": "DELETE",
      "path": "/api/repos/:uuid/file",
      "description": "repo.file.delete"
    },
    {
      "method": "GET",
      "path": "/api/repos/:uuid/export",
      "description": "repo.export"
    },
    {
      "method": "GET",
      "path": "/api/spec-engine/specs/:uuid/promote",
      "description": "spec.promote"
    }
  ]
}