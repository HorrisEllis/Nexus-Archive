---
chunk_uuid: f3ec4ea4-0f30-4645-b323-99e1f06be70e
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-warp-core-index-js
title: nexus/warp/core/index.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-warp-core-index-js
contract_id: spec-contract:47e02ad5:nexus-warp-core-index-js:f3ec4ea4
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:05:13.951Z
---

'use strict';
const { Event } = require('./Event');
const { Gate } = require('./Gate');
const { Axiom } = require('./Axiom');
const { Stream } = require('./Stream');
const { StreamLog } = require('./StreamLog');
const { fuseChain, canFuse } = require('./GateFusion');

module.exports = { Event, Gate, Axiom, Stream, StreamLog, fuseChain, canFuse };