---
chunk_uuid: 694210ff-9187-48e7-a09d-680701397cf1
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-436-nexus-orchestrator-orchestrator-config-json-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/436-nexus-orchestrator-orchestrator-config-json.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-436-nexus-orchestrator-orchestrator-config-json-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-436-nexus-orchestrator-orchestrator-config-json-md:694210ff
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:19:29.415Z
---

{
  "_comment": "NEXUS Orchestrator runtime config \u2014 edit here, never in orchestrator.js",
  "openUIOnBoot": true,
  "openTerminalOnBoot": false,
  "uiURL": "http://127.0.0.1:9000",
  "openEmergeOnBoot": false,
  "emerge": {
    "autoOpen": false,
    "port": 4242
  },
  "ports": {
    "orchestrator": 9000,
    "bridge": 9999,
    "cortex": 3748,
    "guardian": 7820,
    "architect": 3747,
    "idearium": 4800,
    "emerge": 4242,
    "copilot": 3750,
    "loom": 3752,
    "eravos": 3751,
    "diagnostic": 7825,
    "ollama": 3749,
    "versionium": 3754,
    "autopilot": 7799
  },
  "raid": {
    "tickMs": 3000,
    "healthPollMs": 10000,
    "executionTreeEnabled": true,
    "isDecisionAuthority": true,
    "localFirst": true,
    "localFirstFailThreshold": 3,
    "agents": {
      "ollama": {
        "enabled": true
      },
      "guardian-claude": {
        "enabled": true
      },
      "guardian-chatgpt": {
        "enabled": true
      },
      "claude": {
        "enabled": true
      },
      "chatgpt": {
        "enabled": true
      },
      "gemini": {
        "enabled": true
      },
      "perplexity": {
        "enabled": true
      }
    }
  },
  "heal": {
    "_comment": "Single source of truth for self-healing. Replaces NEXUS_HEAL_DRY and NEXUS_FORGE_APPLY env vars \u2014 those are now ignored if this block is present.",
    "mode": "live",
    "maxAttempts": 3,
    "requireRaidApproval": true,
    "autoHealSeverity": [
      "low",
      "medium"
    ],
    "escalateSeverity": [
      "high",
      "critical"
    ]
  },
  "state": {
    "persistPath": "data/NEXUS_STATE.json",
    "saveIntervalMs": 10000,
    "resumeOnBoot": true
  },
  "_ports_comment": "Single source of truth for system->port. Sovereign systems resolve each other through lib/nexus-client.js, never a hardcoded port. NOTE: 'ollama' is the NEXUS ollama-bridge (:3749), NOT the ollama daemon (:11434) \u2014 this key previously said 11434, which contradicted orchestrator.js's SYS map. Nothing read it, so nothing broke; fixed here before anything started depending on it."
}