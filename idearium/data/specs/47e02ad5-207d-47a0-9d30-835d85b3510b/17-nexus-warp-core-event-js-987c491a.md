---
chunk_uuid: 987c491a-cb6c-480d-9d74-ce0f012afbb1
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-warp-core-event-js
title: nexus/warp/core/Event.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-warp-core-event-js
contract_id: spec-contract:47e02ad5:nexus-warp-core-event-js:987c491a
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:05:13.796Z
---

'use strict';
/**
 * Event — immutable data packet. { type, data, uuid, ts }.
 * Never mutated after creation. Matches SISO's Event shape exactly —
 * this primitive isn't where WARP differs from SISO.
 */
function _uid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

class Event {
  constructor(type, data = {}) {
    if (!type || typeof type !== 'string') {
      throw new Error('[warp/Event] type must be a non-empty string');
    }
    this.type = type;
    this.data = Object.freeze({ ...data });
    this.uuid = _uid();
    this.ts = Date.now();
    Object.freeze(this);
  }
}

module.exports = { Event };