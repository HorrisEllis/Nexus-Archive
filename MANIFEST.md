# NEXUS Session Package — Changed Files Only
Every file created or modified this session, and nothing else. No full-project noise.

## New files (didn't exist before this session)
lib/seam/kg-seam-bridge.js
lib/seam/stream.js
lib/seam/gates.js
lib/seam/axioms.js
lib/seam/build-contract.js
lib/seam/chunk-lifecycle.js
lib/seam/adapters/warp-cascade.js
lib/seam/adapters/cortex-persist.js
lib/agent-tools/index.js          — sovereign tool-calling core, started, not finished (read_file tool designed, not yet wired to a live model)
guardian/artifact-upload.js       — replaces the broken inline dropzone autoUpload
cos/playground/llm-lab.js         — moved from guardian/lab/lab.js
loom/ui/index.html                — forked from idearium/ui/index.html
ui/architect-minimal/index.html   — early test page, superseded once the real /ui/spec-builder link was fixed; kept for reference
cortex/push-recall.js             — real push/recall Unified API (2 of 5 MQL lanes: lexical + recency)
cortex/core/raid/routing-ir.js
idearium/spec-engine/chunk-dispatch.js
scripts/verify-wires.js           — systematic hook-registry-vs-real-code checker
docs/NEXUS-STATE-SPEC-2026-07-06.md — the master session record, read this first

## Modified files (full replacement — copy over the original)
bridge/ledger.js                  — Cortex mirror added, was the only system with zero Cortex writes
copilot/server.js                 — fixed the /bridge/deliver double-wrap bug; added spotlight-decision logic
guardian/server.js                — removed dropzone dup, dead TLS/cert code, dead WSS stubs (4275→3959 lines)
guardian/lib/gap-hunter.js         — now a one-line forwarding shim to meta/gap/hunter.js (confirmed byte-identical duplicate)
guardian/userscript-chatgpt.js     — pushes real content to Cortex (was metadata-only); fixed gap-event shape (batched → per-issue)
guardian/userscript-claude.js      — same two fixes as chatgpt's userscript
loom/server.js                     — wired real endpoints for previously-orphaned ingest/scaffold library code
ui/agents/mistral/index.html       — routed through the real ollama-bridge queue instead of raw Ollama
ui/tv-shell/spotlight/spotlight.js — fixed window.CP never being assigned; fixed 3 misnamed method wrappers
ui/tv-shell/index.html             — fixed the Architect tile linking to a 404'ing bare root instead of /ui/spec-builder
lib/seam/index.js                  — new exports added, existing SEAMQueue exports untouched
warp/dispatch/index.js             — fixed the axiom-gate checking the wrong event (request, not candidate output)
warp/core/Stream.js                — added async-transform support (thenable-detection, not blanket async) + .on() pub/sub
ollama/server.js                   — wired to WARP's real cache/dispatch; added file upload endpoint
cortex/boot.js                     — wired push/recall; fixed the pattern-engine shape mismatch; upgraded mastermind to real causal tracing; added snapshot rollback
cortex/core/raid/index.js          — topologicalProximity now has a real implementation path (opt-in, backward compatible)
meta/cfr/graph.js                  — added the _byComponent edge type + componentProximity() query
idearium/api/index.js              — wired real retry/verification onto chunk dispatch, including the chatgpt/claude poller
orchestrator.js                    — added /api/heartbeat + /api/bus/stats; then found and fixed a real regression this same session introduced (a duplicate heartbeat route shadowing a pre-existing, richer handler)
service/nexus-diagnostic.js        — fixed the completely-broken failure-detection loop (ReferenceError on every execution since written); added 3 permanent self-tests
nexus-heal-loop.js                 — fixed the shape-mismatch bug that caused Architect's UTL pipeline to fail 928/928 times

## Deleted (not in this package — confirmed dead before removal)
guardian/memory.js                — 756 lines, zero references anywhere, duplicate of the live inline memory server
guardian/lab/ (directory)         — contents moved to cos/playground/llm-lab.js
warp/dispatch/dispatchSeam.js     — superseded by lib/seam/ (backend-agnostic core + adapters)
warp/dispatch/seamAxioms.js       — superseded by lib/seam/axioms.js

## Read first
docs/NEXUS-STATE-SPEC-2026-07-06.md is the full, cross-referenced account of all of this — what's real, what's tested, what's still stubbed, and every self-caught mistake along the way. This manifest is just the file inventory.
