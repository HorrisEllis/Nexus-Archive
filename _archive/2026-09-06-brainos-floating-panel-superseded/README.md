# brainos.js / brainos.css — archived 2026-09-06

Superseded by brainos-app.js / brainos-app.css, the same session.

This was a floating, draggable panel (mount() appended itself to
document.body as an overlay panel). James: "make this ui, map it all
onto the html" — the real BrainOS-main reference (BrainOS-v2.html) is
a full-page app (top bar, sidebar, canvas, right panel), not a floating
panel, so index.html was rebuilt around that real design instead.

brainos-canvas.js (the real, live dynamic mesh renderer) is UNCHANGED
and still the real, active canvas implementation — only the panel
chrome around it was replaced. brainos.js's own real SSE-connection
logic (guardian /events + clear-glass /events, the mesh-view initial
fetch) was carried forward into brainos-app.js, same real endpoints,
same real behavior, new real page structure.

Kept here, not deleted, per §0.3.
