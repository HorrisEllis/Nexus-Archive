'use strict';
/**
 * lib/seam/index.js — SEAM Delivery System
 * UUID: nexus-seam-v1-0000-2026-0702-jamesbrooks-001
 *
 * Sovereign quality-gate layer for AI provider delivery.
 * Transport-agnostic — accepts any deliverFn (ncpPush, ollamaDispatch, etc).
 *
 * State machine: QUEUED → INJECTING → GENERATING → DETECTING → VERIFIED
 *                                                      ↓ fail
 *                                                   RETRYING (context/shorter/forensic)
 *                                                      ↓ exhausted
 *                                                   ESCALATED → gap opened
 *
 * Usage (guardian/NCP):
 *   const { SEAMQueue } = require('../lib/seam');
 *   const q = new SEAMQueue({ provider:'claude', ncpPush: ncp.push, jaa, busEmit });
 *
 * Usage (ollama):
 *   const { SEAMQueue } = require('../lib/seam');
 *   const q = new SEAMQueue({ provider:'ollama', ncpPush: (_, data) => ollamaDispatch(data), jaa, busEmit });
 */
module.exports = {
  get SEAMQueue()    { return require('./queue.js').SEAMQueue; },
  get STATE()        { return require('./queue.js').STATE; },
  get Watchdog()     { return require('./watchdog.js').createSeamWatchdog; },
  get Detector()     { return require('./detector.js').Detector; },
  get parseSpec()    { return require('./spec-parser.js').parseSpec; },
  get parseSpecFile(){ return require('./spec-parser.js').parseSpecFile; },
  get extractPrerequisite() { return require('./spec-parser.js').extractPrerequisite; },
};
