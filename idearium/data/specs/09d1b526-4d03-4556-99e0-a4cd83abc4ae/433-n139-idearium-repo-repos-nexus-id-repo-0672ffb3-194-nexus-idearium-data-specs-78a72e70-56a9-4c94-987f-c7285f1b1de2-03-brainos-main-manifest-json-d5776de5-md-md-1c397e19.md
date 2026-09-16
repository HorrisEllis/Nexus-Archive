---
chunk_uuid: 1c397e19-cc56-44cb-b024-784f600a0f41
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-194-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-03-brainos-main-manifest-json-d5776de5-md-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/194-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-03-brainos-main-manifest-json-d5776de5-md.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-194-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-03-brainos-main-manifest-json-d5776de5-md-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-194-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-03-brainos-main-manifest-json-d5776de5-md-md:1c397e19
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:24:58.051Z
---

---
chunk_uuid: d5776de5-9f84-4b58-b9e1-80d48326ff44
spec_uuid: 78a72e70-56a9-4c94-987f-c7285f1b1de2
section: brainos-main-manifest-json
title: BrainOS-main/MANIFEST.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:78a72e70:brainos-main-manifest-json
contract_id: spec-contract:78a72e70:brainos-main-manifest-json:d5776de5
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:27:34.693Z
---

{
  "name": "brainos",
  "version": "5.0.0",
  "description": "Integrated Control Canvas. SISO-native. Event bus. AI routing. DNS. Firewall. Mesh. Pipeline. Automation.",
  "uuid": "brainos-integrated-canvas-v5000-000000000001",
  "hookId": "brainos:integrated-canvas-v5:b0001",
  "layer": "application",
  "type": "control-canvas",

  "modules": {
    "bus": {
      "uuid": "brainos-bus-module-v5000-0000-000000000001",
      "hookId": "brainos.bus:bus-v5:b0001",
      "file": "bus.js",
      "version": "5.0.0",
      "role": "Event bus — SISO-native typed pub/sub"
    },
    "dns-server": {
      "uuid": "brainos-dns-server-v5000-0000-000000000002",
      "hookId": "brainos.dns:dns-server-v5:d0002",
      "file": "dns-server.js",
      "version": "5.0.0",
      "role": "Custom DNS server from scratch"
    },
    "firewall": {
      "uuid": "brainos-firewall-v5000-0000-000000000003",
      "hookId": "brainos.firewall:firewall-v5:f0003",
      "file": "firewall.js",
      "version": "5.0.0",
      "role": "Rule-based firewall engine"
    },
    "routing-engine": {
      "uuid": "brainos-routing-v5000-0000-000000000004",
      "hookId": "brainos.routing:routing-engine-v5:r0004",
      "file": "routing-engine.js",
      "version": "5.0.0",
      "role": "Agent routing — if/then/when/fail chains"
    },
    "ddns": {
      "uuid": "brainos-ddns-module-v5000-0000-000000000005",
      "hookId": "brainos.ddns:ddns-v5:d0005",
      "file": "ddns.js",
      "version": "5.0.0",
      "role": "Dynamic DNS client"
    },
    "reverse-proxy": {
      "uuid": "brainos-rproxy-v5000-0000-000000000006",
      "hookId": "brainos.rproxy:rproxy-v5:r0006",
      "file": "reverse-proxy.js",
      "version": "5.0.0",
      "role": "HTTP/HTTPS reverse proxy"
    },
    "snr-filter": {
      "uuid": "snr-filter-module-v1000-0000-000000000001",
      "hookId": "snr.filter:snr-filter-v1:s0001",
      "file": "snr-filter.js",
      "version": "1.0.0",
      "role": "Signal-to-noise gate"
    },
    "crypto-engine": {
      "uuid": "crypto-engine-module-v1000-0000-000000000001",
      "file": "crypto-engine.js",
      "version": "1.0.0"
    },
    "key-manager": {
      "uuid": "key-manager-module-v1000-0000-000000000001",
      "file": "key-manager.js",
      "version": "1.0.0"
    },
    "host-rotation": {
      "uuid": "host-rotation-module-v1000-0000-000000000001",
      "file": "host-rotation.js",
      "version": "1.0.0"
    },
    "port-registry": {
      "uuid": "port-registry-module-v1000-0000-000000000001",
      "file": "port-registry.js",
      "version": "1.0.0"
    },
    "canvas-persistence": {
      "uuid": "bridge-canvas-persist-0001-phase1-foundation",
      "file": "bridge-canvas-persistence.js",
      "version": "1.0.0"
    },
    "siso-core": {
      "uuid": "siso-core-f0und4t10n-layer-0000-000000000001",
      "path": "src/siso/",
      "version": "1.0.0",
      "role": "Foundation — Event · Gate · Stream · StreamLog"
    }
  },

  "axioms": [
    "Everything fails loudly — toast + log + event",
    "Nothing pretends to work — no silent failures",
    "Everything has a UUID",
    "Event bus only — no direct cross-module calls",
    "Bottom-up — storage first, transport second, UI last",
    "SISO-native — Event → Gate → Stream",
    "Persistence is the golden rule — atomic writes",
    "Enterprise grade code, military grade security"
  ],

  "ecosystemLinks": {
    "siso": "src/siso/ — Foundation event framework",
    "jaa": "Planned — SQL persistence backend",
    "nexusPlugin": "NEXUS Browser Extension — bridge connector",
    "bridgeServer": "nexus-bridge-server-v2.js"
  }
}