---
chunk_uuid: 9fe953eb-610f-4953-bde0-7c72e32da5f5
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: intent-stakeholders
title: intent — stakeholders
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:intent-stakeholders
contract_id: spec-contract:a851a5dc:intent-stakeholders:9fe953eb
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.323Z
---

<!-- imported: intent → stakeholders -->

# BLOCK 2 — INTENT
  # ════════════════════════════════════════════════════════════════
  intent:
    purpose: >
      causal-nexus is a real-time causal event engine for Node.js and browser environments.
      It provides a bounded ring buffer with a built-in gate system, explicit causal graph,
      delta analytics, CQL query, persistence (WAL + archive), and AI-powered self-modification
      (forge). Every event carries a declared causal edge type — causality is declared at
      ingestion, never inferred post-hoc. The engine is designed to be embedded in any project
      as a dependency with zero runtime dependencies of its own.

    problem_statement: >
      Most event systems lose causal context: they emit events but cannot answer "what caused
      this?" or "what will break if this changes?". Replay is undirected. Snapshots are opaque
      blobs. Memory is unbounded. Gate logic is scattered and untestable. causal-nexus solves
      all of these by making causality first-class, bounding memory via ring eviction, and
      making gate logic declarative, composable, and AI-writable.

stakeholders:
      - name: library-consumer
        role: >
          Imports causal-nexus as a dependency. Uses kernel, adapter, query, persist, forge.
          Expects zero runtime deps, ES module API, Node >= 18.
      - name: guardian-operator
        role: >
          Runs Guardian browser extension (v5.0.0). Injects DOM, AI-tab, and callto events
          into a host application via the bridge bus. Expects reliable calltoMap linkage and
          session boundary detection.
      - name: ai-agent
        role: >
          Uses forge module to autonomously modify causal-nexus modules.
          Expects stable law registry and atomic loader output.
      - name: spec-pipeline
        role: >
          Reads and patches this spec via masteravos-pipeline. Expects machine-parseable
          schema, causal_map, and enforcement block with BoundaryIndex coverage.