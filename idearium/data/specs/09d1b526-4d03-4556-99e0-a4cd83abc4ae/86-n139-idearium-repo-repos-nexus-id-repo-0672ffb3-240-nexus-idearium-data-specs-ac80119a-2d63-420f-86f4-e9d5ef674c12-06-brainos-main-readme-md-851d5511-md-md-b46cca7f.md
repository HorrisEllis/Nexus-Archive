---
chunk_uuid: b46cca7f-26de-46a0-b2d8-bac03db5ec7e
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-240-nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-06-brainos-main-readme-md-851d5511-md-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/240-nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-06-brainos-main-readme-md-851d5511-md.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-240-nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-06-brainos-main-readme-md-851d5511-md-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-240-nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-06-brainos-main-readme-md-851d5511-md-md:b46cca7f
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:18:18.028Z
---

---
chunk_uuid: 851d5511-a5e6-44e4-bce8-93ef42dd7ec3
spec_uuid: ac80119a-2d63-420f-86f4-e9d5ef674c12
section: brainos-main-readme-md
title: BrainOS-main/README.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac80119a:brainos-main-readme-md
contract_id: spec-contract:ac80119a:brainos-main-readme-md:851d5511
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:28:01.729Z
---

# BrainOS · Guardian Control Panel

**BrainOS-v2.html** — Single-file canvas control panel for the Guardian/NEXUS bridge mesh.

## Features
- Live canvas mesh showing Guardian, NEXUS, Bridge, and Callto nodes
- Nodes turn red with animated ring when pulse stops (30s timeout)
- Right-click any node: connect, disconnect, repair, diagnose, wire callto
- Short ID display — copy to share with other systems
- Labeled pulse packets on tunnel lines (green=guardian, purple=callto, cyan=data)
- Pipeline builder: chain AI steps, Guardian as first-class node type
- SSE events auto-create nodes: guardian-pulse → Guardian node, callto.captured → Callto node

## Connection
The bridge must be running: `node bridge/nexus-bridge-server.js`

Bridge now listens on `0.0.0.0` — connect from any device on your LAN:
1. Open `BrainOS-v2.html` in a browser
2. Enter your bridge URL: `http://{LAN_IP}:3747` (find it with `GET /network/info`)
3. Click SCAN — nodes appear on canvas

## Versions
- Bridge: v3.11.0
- Guardian: v3.4.0  
- NEXUS: v0.51.0

## API Reference
See `guardian-bridge-api.html` for the complete endpoint reference.