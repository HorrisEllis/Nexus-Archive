---
chunk_uuid: 8a54669e-525f-4e43-95a0-5b9da716b4f7
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-warp-core-index-js
title: n139/warp/core/index.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-warp-core-index-js
contract_id: spec-contract:09d1b526:n139-warp-core-index-js:8a54669e
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:17:27.105Z
---

'use strict';
const { Event } = require('./Event');
const { Gate } = require('./Gate');
const { Axiom } = require('./Axiom');
const { Stream } = require('./Stream');
const { StreamLog } = require('./StreamLog');
const { fuseChain, canFuse } = require('./GateFusion');

module.exports = { Event, Gate, Axiom, Stream, StreamLog, fuseChain, canFuse };