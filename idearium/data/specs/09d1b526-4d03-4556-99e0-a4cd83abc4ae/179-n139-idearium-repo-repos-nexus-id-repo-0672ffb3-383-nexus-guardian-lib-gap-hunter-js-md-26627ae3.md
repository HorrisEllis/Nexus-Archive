---
chunk_uuid: 26627ae3-2638-46e9-be4d-6e83cdbc79be
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-383-nexus-guardian-lib-gap-hunter-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/383-nexus-guardian-lib-gap-hunter-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-383-nexus-guardian-lib-gap-hunter-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-383-nexus-guardian-lib-gap-hunter-js-md:26627ae3
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:19:46.035Z
---

'use strict';
/**
 * guardian/lib/gap-hunter.js — FORWARDING SHIM
 * UUID: guardian-gap-hunter-v1-0000-4000-0000-000000000001
 *
 * §CONSOLIDATED 2026-07-06 — this used to be a byte-identical copy of
 * meta/gap/hunter.js (confirmed via diff — same UUID, same "GapHunter v3"
 * header, only the relative import paths for liminal/confidence differed).
 * Two copies of the same logic, each with its own consumers
 * (guardian/server.js + 3 test files here; guardian/lib/ncp.js,
 * guardian/server.js, service/nexus-diagnostic.js, lib/reflection.js,
 * lib/open-loop-taxonomy.js, lib/nexus-expansion-boot.js on the meta/
 * side) — any future fix would need to land in both or silently drift.
 * meta/gap/hunter.js is canonical now — matches meta/'s own stated role
 * as the domain-agnostic home for this class of detector, and already
 * had more consumers. This shim exists for backward compatibility only —
 * same pattern lib/meta/index.js already uses for the broader meta
 * layer. Update any require('./lib/gap-hunter') to require('../../meta/gap/hunter')
 * directly when touching a file that uses this.
 */
module.exports = require('../../intelligence/gap/hunter.js');