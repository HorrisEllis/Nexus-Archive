---
chunk_uuid: 4fc5605d-17e4-4c3c-8e11-ccd506e7441e
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-idearium-spec-engine-blocks-yaml
title: nexus/idearium/spec-engine/blocks.yaml
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-idearium-spec-engine-blocks-yaml
contract_id: spec-contract:47e02ad5:nexus-idearium-spec-engine-blocks-yaml:4fc5605d
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:05:27.925Z
---

# idearium/spec-engine/blocks.yaml — Block-ID Schema
# UUID: nexus-idearium-blocks-v1-0000-2026-0903-jamesbrooks-001
# Version: 1.0.0
#
# §BUILT 2026-09-03 — James: "using a yaml with block ids for each block.
# each block is a slot for the chunks." Replaces the hardcoded SPEC_SECTIONS
# JS array literal (spec-engine/index.js) as the single declared source for
# the 10 standard spec sections. Each block id was already load-bearing in
# three places that had to independently agree on it (chunk.sectionId,
# the on-disk fileName `00-meta.md` pattern, RepoLayer._resolveChunk's
# path/sectionId match) — this makes that agreement explicit and
# authorable in one file instead of implicit across three.
#
# `agent` here is the per-block DEFAULT — the routing table James asked
# for. Read by spec-engine/index.js's _buildManifest() at chunk creation
# (one default per block, not per spec), overridable per-spec via
# createSpec's `sectionAgents` param, and always overridable per-chunk
# post-creation (while PENDING) via setChunkAgent(). Real dispatch still
# reads chunk.agent, not this file, at build time — this only seeds it.
#
# Seeded by Claude, not James — a starting point James said he'd correct
# once he sees it in practice, not a claimed-correct routing table.
version: "1.0.0"
blocks:
  - id: meta
    title: "Meta & Identity"
    desc: "UUID, version, phase, comp_id, seam_id, status, author, dependencies"
    agent: ollama
  - id: purpose
    title: "Purpose & Intent"
    desc: "What this component does, why it exists, what problem it solves"
    agent: ollama
  - id: axioms
    title: "Axioms Enforced"
    desc: "Which AXIOMS-v1.0 axioms this component satisfies, with evidence"
    agent: claude
  - id: schema
    title: "Data Schema"
    desc: "JAA tables, field shapes, types, constraints, decay tier"
    agent: deepseek
  - id: api
    title: "API & Routes"
    desc: "HTTP routes, request/response shapes, error codes"
    agent: claude
  - id: events
    title: "Events & Bus"
    desc: "Bus events emitted, bus events consumed, event payload shapes"
    agent: ollama
  - id: integration
    title: "Integration Points"
    desc: "What talks to this, what this talks to, seam contracts"
    agent: gemini
  - id: failure_modes
    title: "Failure Modes"
    desc: "What can fail, how it fails loudly (§1.2), recovery paths"
    agent: claude
  - id: build_order
    title: "Build Order"
    desc: "Bottom-up build sequence (§3.1), what must exist first"
    agent: ollama
  - id: tests
    title: "Tests & Verification"
    desc: "How each piece is proven (§1.1), test cases, invariants"
    agent: deepseek