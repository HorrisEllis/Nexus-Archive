---
chunk_uuid: 4d961b0a-6ef0-4230-89d8-6fc4b326a0cc
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-warp-manifest-json
title: nexus/warp/MANIFEST.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-warp-manifest-json
contract_id: spec-contract:47e02ad5:nexus-warp-manifest-json:4d961b0a
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:05:14.366Z
---

{
  "name": "warp",
  "version": "1.4.0",
  "description": "Pure functional event-driven devkit. Event -> Gate -> Stream -> StreamLog, plus Axiom as an enforced primitive and a unified dispatch (exact-cache / pre-generation-filter / population / cascade / axiom-gate / score-retain / escalate). v1.4 adds: canonicalization pipeline, fuzzy pre-generation reuse (opt-in), population lifecycle control (decay/pruning/dedup), two-stage generation, gate fusion, axiom cost weighting, and a structural delta cache. Zero dependencies, zero coupling to any consuming project.",
  "license": "MIT",
  "author": "James Brooks",
  "dependencies": "none",
  "decoupling_rule": "warp/core and warp/dispatch import nothing outside warp/. Consuming projects import warp and supply adapters via Stream.hook().",
  "spec": "spec/warp.spec",
  "changelog_note": "v1.4 additions are opt-in and default OFF except decay/pruning being available at zero rate by default (i.e. a no-op unless configured) — existing v1.1.0 callers see zero behavior change. See dispatch/benchmark.js section 4 for real measurements; the original v1.4 patch doc's '10x-35x cheaper / 15x-50x faster' claims were not benchmarked against anything and are not repeated here."
}