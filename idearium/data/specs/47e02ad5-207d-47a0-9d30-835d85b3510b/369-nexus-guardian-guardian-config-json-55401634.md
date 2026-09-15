---
chunk_uuid: 55401634-243b-43ee-a801-c710142fe711
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-guardian-guardian-config-json
title: nexus/guardian/guardian.config.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-guardian-guardian-config-json
contract_id: spec-contract:47e02ad5:nexus-guardian-guardian-config-json:55401634
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:07:24.932Z
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