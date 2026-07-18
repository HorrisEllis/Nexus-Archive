---
chunk_uuid: 05d9cf2e-bb6b-4e7b-ba88-b810ab838a75
spec_uuid: fd6be92e-8d77-4686-8f93-c17959911727
section: intent-stakeholders
title: intent — stakeholders
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:fd6be92e:intent-stakeholders
contract_id: spec-contract:fd6be92e:intent-stakeholders:05d9cf2e
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:21:36.187Z
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
