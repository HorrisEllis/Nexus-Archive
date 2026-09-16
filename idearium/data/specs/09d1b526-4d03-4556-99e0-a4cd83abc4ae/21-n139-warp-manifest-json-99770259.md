---
chunk_uuid: 99770259-1d48-415a-8bbd-e532c51c096d
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-warp-manifest-json
title: n139/warp/MANIFEST.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-warp-manifest-json
contract_id: spec-contract:09d1b526:n139-warp-manifest-json:99770259
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:17:29.055Z
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