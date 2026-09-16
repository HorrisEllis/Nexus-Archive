---
chunk_uuid: b692a14f-41c6-47e0-9df1-1a0d30502a34
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-warp-core-event-js
title: n139/warp/core/Event.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-warp-core-event-js
contract_id: spec-contract:09d1b526:n139-warp-core-event-js:b692a14f
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:17:26.462Z
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