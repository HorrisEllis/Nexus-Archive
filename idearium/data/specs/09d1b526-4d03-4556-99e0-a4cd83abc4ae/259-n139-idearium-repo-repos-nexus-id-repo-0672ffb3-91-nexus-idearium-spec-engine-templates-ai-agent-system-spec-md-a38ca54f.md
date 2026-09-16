---
chunk_uuid: a38ca54f-029d-4918-8d5b-7f0c1a1a275b
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-91-nexus-idearium-spec-engine-templates-ai-agent-system-spec-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/91-nexus-idearium-spec-engine-templates-ai-agent-system-spec.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-91-nexus-idearium-spec-engine-templates-ai-agent-system-spec-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-91-nexus-idearium-spec-engine-templates-ai-agent-system-spec-md:a38ca54f
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:21:13.107Z
---

# §SEED PROVENANCE — extracted verbatim from NEXUS-GUARDIAN.spec, the
# `cockpit_forge` block (lines 731-769 of the source file), authored by
# james-brooks. Real spec for a shipped "AI-powered self-modification
# engine" (routing priority across local/remote models, entry points,
# fail-loud fallback) — chosen as the reference shape for an "AI Agent
# System" archetype.
  cockpit_forge:
    file: "cockpit/forge/cockpit-forge.js"
    formerly: "forge.js"
    uuid: rheon-forge-0000-2026-0529-jamesbrooks-001
    component_id: rheon.forge
    version: "1.0.0"
    description: "AI-powered self-modification engine. Local-first. No API key."

    routing_priority:
      1: "Guardian HTTP — http://127.0.0.1:7820/command"
      2: "Ollama — http://127.0.0.1:11434/api/generate"
      3: "FAIL LOUD — §1.2"

    entry_points:
      - "forgeModule(src, instruction, opts) — full module rewrite"
      - "forgePatch(src, patchSpec, opts)    — minimal targeted patch"
      - "forgeGate(description, opts)        — generate SISO gate function body"
      - "forgeHook(src, hookSpec, opts)      — add new exported function with UUID"

    invariants:
      - "ForgePatchRecord written to JAA before patch applied (§2.1)"
      - "Zero external npm dependencies"
      - "All mutations via SISO bus emit(), never direct calls"
      - "Every new exported symbol gets @hook UUID comment"
      - "Never remove existing @hook UUIDs or change existing signatures"
      - "Source is CommonJS (require/module.exports)"

    system_prompt_nucleus:
      laws:
        - "§1.1 Nothing pretends to work"
        - "§1.2 Nothing silently fails"
        - "§2.1 JAA write before behavior"
        - "§5.1 UUID on everything"
        - "§CF No engine consumes raw meaning — all engines operate on ConstraintField"
        - "§SISO Every gate has exactly one signature"

  # ════════════════════════════════════════════════════════════════
  # GTCI — GAP-TRIGGERED CONTEXT INJECTION
  # ════════════════════════════════════════════════════════════════