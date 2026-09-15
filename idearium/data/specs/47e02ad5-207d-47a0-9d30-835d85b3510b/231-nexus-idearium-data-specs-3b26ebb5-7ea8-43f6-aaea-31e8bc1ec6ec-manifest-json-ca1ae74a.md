---
chunk_uuid: ca1ae74a-3461-49f1-8240-eefec15761e9
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-idearium-data-specs-3b26ebb5-7ea8-43f6-aaea-31e8bc1ec6ec-manifest-json
title: nexus/idearium/data/specs/3b26ebb5-7ea8-43f6-aaea-31e8bc1ec6ec/manifest.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-idearium-data-specs-3b26ebb5-7ea8-43f6-aaea-31e8bc1ec6ec-manifest-json
contract_id: spec-contract:47e02ad5:nexus-idearium-data-specs-3b26ebb5-7ea8-43f6-aaea-31e8bc1ec6ec-manifest-json:ca1ae74a
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:06:19.738Z
---

{
  "uuid": "3b26ebb5-7ea8-43f6-aaea-31e8bc1ec6ec",
  "dedupKey": "a30bf4061c004815",
  "name": "mco22-test-repo",
  "type": "codebase",
  "description": "ingested from dropped files",
  "author": "test",
  "version": "0.1.0",
  "phase": "40",
  "status": "complete",
  "agent": "auto",
  "agentPriority": [
    "ollama",
    "chatgpt",
    "claude"
  ],
  "buildEngine": "auto",
  "ideaUuid": null,
  "totalChunks": 1,
  "doneChunks": 1,
  "failedChunks": 0,
  "progress": 100,
  "createdAt": 1789426567615,
  "updatedAt": 1789426567703,
  "completedAt": 1789426567660,
  "archivePath": null,
  "templateId": null,
  "templateIds": [],
  "templateSeeded": [],
  "duplicateOf": null,
  "rootHash": "922977d72e977691aafaa9d196a09ef3532bbf168092f0a7fa5dbb336c9449bd",
  "warpPrimitives": [],
  "chunks": [
    {
      "uuid": "4c4e3f5e-6c22-4a56-a56d-16ac4661d883",
      "specUuid": "3b26ebb5-7ea8-43f6-aaea-31e8bc1ec6ec",
      "chunkIdx": 0,
      "sectionId": "hello-txt",
      "sectionTitle": "hello.txt",
      "sectionDesc": "ingested file: hello.txt",
      "comp_id": "idearium.spec-engine",
      "seam_id": "idearium.spec-engine:v1:chunk:3b26ebb5:hello-txt",
      "contract_id": "spec-contract:3b26ebb5:hello-txt:4c4e3f5e",
      "filePath": "/home/claude/work/nexus/idearium/data/specs/3b26ebb5-7ea8-43f6-aaea-31e8bc1ec6ec/00-hello-txt-4c4e3f5e.md",
      "fileName": "00-hello-txt.md",
      "status": "complete",
      "dependsOn": [],
      "agent": "ingest",
      "agentModel": "ingest:drop",
      "attempts": 1,
      "failureMode": null,
      "content": "real test content",
      "byteSize": 391,
      "createdAt": 1789426567615,
      "updatedAt": 1789426567659,
      "completedAt": 1789426567659,
      "tags": [
        "hello-txt",
        "codebase",
        "mco22-test-repo"
      ],
      "jobId": null,
      "dispatchDir": null
    }
  ],
  "specPath": "/home/claude/work/nexus/idearium/data/specs/3b26ebb5-7ea8-43f6-aaea-31e8bc1ec6ec/3b26ebb5-7ea8-43f6-aaea-31e8bc1ec6ec.spec"
}