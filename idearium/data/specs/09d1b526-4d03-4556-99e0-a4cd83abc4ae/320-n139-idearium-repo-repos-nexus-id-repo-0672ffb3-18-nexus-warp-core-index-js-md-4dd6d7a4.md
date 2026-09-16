---
chunk_uuid: 4dd6d7a4-cb34-4724-bd10-4efbb080da13
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-18-nexus-warp-core-index-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/18-nexus-warp-core-index-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-18-nexus-warp-core-index-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-18-nexus-warp-core-index-js-md:4dd6d7a4
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:22:27.840Z
---

'use strict';
const { Event } = require('./Event');
const { Gate } = require('./Gate');
const { Axiom } = require('./Axiom');
const { Stream } = require('./Stream');
const { StreamLog } = require('./StreamLog');
const { fuseChain, canFuse } = require('./GateFusion');

module.exports = { Event, Gate, Axiom, Stream, StreamLog, fuseChain, canFuse };