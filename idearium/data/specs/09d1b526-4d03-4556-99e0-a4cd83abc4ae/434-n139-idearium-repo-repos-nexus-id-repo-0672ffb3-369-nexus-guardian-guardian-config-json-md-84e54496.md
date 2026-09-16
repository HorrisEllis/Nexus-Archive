---
chunk_uuid: 84e54496-9ab4-4356-828c-88cb0c540ae4
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-369-nexus-guardian-guardian-config-json-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/369-nexus-guardian-guardian-config-json.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-369-nexus-guardian-guardian-config-json-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-369-nexus-guardian-guardian-config-json-md:84e54496
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:24:59.348Z
---

{
  "_comment": "Guardian v8 config — runtime settings live in SQLite settings table. Edit via /settings API or Cockpit dashboard.",

  "server": {
    "httpPort":    7820,
    "wssPort":     7821,
    "dropzonePort":7822,
    "memoryPort":  7823,
    "host":        "127.0.0.1",
    "lanHost":     "0.0.0.0",
    "nexusUrl":    "http://127.0.0.1:3001"
  },

  "tls": {
    "certFile": "guardian-cert.pem",
    "keyFile":  "guardian-key.pem"
  },

  "persistence": {
    "engine":   "better-sqlite3",
    "dbFile":   "guardian.db",
    "schemaFile":"schema.sql",
    "fallback": "flat-file-json"
  },

  "siso": {
    "logLevel": "EVENTS",
    "channels": [
      "guardian.artifact",
      "guardian.gaps",
      "guardian.job.complete",
      "guardian.pa.session",
      "guardian.ledger",
      "guardian.download",
      "guardian.session.named",
      "guardian.timeline",
      "guardian.setting.update"
    ]
  },

  "gaphunter": {
    "version":   "3.0.0",
    "minScore":  0.25,
    "taxonomy":  "gap-taxonomy.js"
  },

  "cockpit": {
    "url": "http://127.0.0.1:7820/cockpit",
    "panels": ["stream","artifacts","gaps","pa","sessions","agents","settings","cli"]
  },

  "api": {
    "endpoints": {
      "cockpit":   "/cockpit",
      "events":    "/events",
      "command":   "/command",
      "jobs":      "/jobs",
      "artifacts": "/artifacts",
      "gaps":      "/gaps",
      "ledger":    "/ledger",
      "sessions":  "/sessions",
      "pa":        "/pa",
      "timeline":  "/timeline",
      "settings":  "/settings",
      "memory":    "/memory",
      "providers": "/providers",
      "health":    "/health",
      "stream":    "/stream/:jobId",
      "response":  "/response/:jobId"
    }
  },

  "defaults": {
    "session_greeting_enabled":  true,
    "scan_debounce_ms":          1500,
    "artifact_max":              500,
    "gap_min_score":             0.25,
    "pa_enabled":                true,
    "memory_auto_push":          true,
    "dropzone_auto_upload":      true,
    "stream_log_level":          "EVENTS",
    "greeting_delay_ms":         1200,
    "poll_interval_ms":          500,
    "stable_count_threshold":    5
  }
}