# Additional source modules — added after the first zip, on request

These were discussed and mapped to specific IMP- items in the improvement
roadmap but not actually bundled in the first pass. Caught when asked
"does that contain the relevant files" — it didn't, fully. This folder
closes that gap.

## alk-video-and-expression/ — for IMP-18, IMP-19
`expression-engine.js` (real FACS action-unit taxonomy) + `video-module.js`
+ `video-module.server.js` + `codec.js`/`codec-v2.js` (MediaPipe wiring) +
`cfr-mesh-bridge.js` (drives lib/cfr/field.js from face/hand/pose landmarks)
+ supporting signal modules (`latent-model.js`, `signal-topology.js`,
trajectory/`*.js`, `behavior-module.js`).

**Deliberately excluded: `suppression-score.js`.** Discussed two turns ago —
infers a "gap between what someone shows and what they feel" from facial
expression, which is a stronger and harder-to-verify claim than anything
else built this session. Not bundled by default. If you want it anyway,
say so and I'll add it — it lives at
`packages/signal/suppression-score.js` in the ALK upload and
`packages/field/signal-modules/suppression-score.js` in rfr2 (two
slightly different versions, both present in the original uploads).

## alk-full-behavior-kernel/ — for IMP-24
The real general-purpose ALK (`kernel.js` + `alk-wire.js`) — events,
channels, gates, lattice, clock. This is the one with no consent question
attached: pointed at platform-integrity (bot/coordinated-behavior
detection) rather than interpersonal reading.

## relational-private-signal/ — for IMP-27
`relational.js` — rupture/repair + pattern detectors. Bundled on the basis
of the private-signal-only scope agreed two turns ago: visible only to the
person in the conversation, never a public label, never feeds ranking. If
that scope ever changes, this file's appropriate use changes with it.

## kern-v2-l4-external/ — for the foundation addendum's L4-EXTERNAL, and IMP-06/08/09
`identity.js`, `handshake.js`, `gate.js`, `sigma.js`, `grammar.js` —
named directly in `nexus-system-foundation-addendum-v1.1.0.spec` as the
source for the foreign-system handshake, but the actual files were never
copied in until now. `grammar.js` is the intersection-negotiation logic
IMP-08/09 (federation, bounded copilot-to-copilot) both depend on.
