# emerge/consumer.js — archived 2026-09-06

Retired per James: "its just a compiler thats it, the rest is trash."

This was a standalone poller (spawned by autopilot.js) that watched
emerge/input/ for contracts dropped by copilot/module-builder.js via
lib/contract-queue.js, then called emerge/compiler/pipeline.js's real
compile(). The compiler itself was always the only real work; this file
was the file-drop/poll/accept ceremony around it.

Replaced by: copilot/module-builder.js now calls compile() directly,
synchronously, in the same request — no queue, no separate process, no
5-second poll latency. Same real side effects preserved (architecture.json
sidecar, event_log write), just made once instead of twice and without a
second process needed to make them.

emerge/compiler/ (pipeline.js, t2-gate.js, and everything under it) is
UNCHANGED and still real, load-bearing code — called directly now by both
copilot/module-builder.js and idearium/compiler-bridge.js. Only this
poller wrapper was retired.

Kept here, not deleted, per §0.3 (information must never be lost).
