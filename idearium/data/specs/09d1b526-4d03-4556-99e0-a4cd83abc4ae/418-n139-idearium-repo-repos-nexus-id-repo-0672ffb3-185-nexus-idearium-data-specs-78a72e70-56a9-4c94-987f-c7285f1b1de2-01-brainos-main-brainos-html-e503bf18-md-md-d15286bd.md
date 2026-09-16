---
chunk_uuid: d15286bd-d0a8-4ea7-9d53-a0aeb273827d
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-185-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-01-brainos-main-brainos-html-e503bf18-md-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/185-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-01-brainos-main-brainos-html-e503bf18-md.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-185-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-01-brainos-main-brainos-html-e503bf18-md-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-185-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-01-brainos-main-brainos-html-e503bf18-md-md:d15286bd
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:24:35.591Z
---

---
chunk_uuid: e503bf18-717d-4c98-a11a-76d4e96f3db0
spec_uuid: 78a72e70-56a9-4c94-987f-c7285f1b1de2
section: brainos-main-brainos-html
title: BrainOS-main/BrainOS.html
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:78a72e70:brainos-main-brainos-html
contract_id: spec-contract:78a72e70:brainos-main-brainos-html:e503bf18
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:27:34.685Z
---

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BrainOS — Integrated Control v5.0</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

/* ═══ TOKENS ═══════════════════════════════════════════════════ */
:root {
  --bg:      #06060f;
  --bg2:     #09091a;
  --panel:   #0a0a1c;
  --panel2:  #0d0d22;
  --border:  #12122a;
  --border2: #1e1e40;
  --border3: #2a2a55;
  --text:    #c8ccee;
  --text2:   #525580;
  --text3:   #1e1e40;
  --font:    'Oxanium', monospace;
  --mono:    'DM Mono', monospace;

  --online:  #00e5a0;
  --idle:    #4fc3f7;
  --offline: #1e1e40;
  --relay:   #7c4dff;
  --warn:    #ffd740;
  --danger:  #ff4060;
  --bridge:  #ff6b35;
  --signal:  #00ff88;
  --noise:   #ff3355;

  --tab-h: 40px;
  --bar-h: 42px;
  --status-h: 22px;
}

* { margin:0; padding:0; box-sizing:border-box; }
html,body { height:100%; overflow:hidden; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  display: flex;
  flex-direction: column;
}



.ctx-item { padding:5px 12px; cursor:pointer; color:var(--text2); transition:all .1s; }
.ctx-item:hover { background:var(--bg2); color:var(--text); }

/* ── HELP NAV ─────────────────────────────────────────────────── */
.help-nav-item {
  padding:5px 12px;font-size:9px;font-weight:600;letter-spacing:.08em;
  color:var(--text2);cursor:pointer;transition:all .1s;white-space:nowrap;
  border-left:2px solid transparent;
}
.help-nav-item:hover { color:var(--text);background:rgba(255,255,255,.03); }
.help-nav-item.act { color:var(--idle);border-left-color:var(--idle); }

/* ═══ TOP BAR ═══════════════════════════════════════════════════ */
.bar {
  height: var(--bar-h);
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 10px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  z-index: 100;
}

.logo { font-size:13px; font-weight:800; letter-spacing:.22em; color:var(--bridge); white-space:nowrap; }
.logo em { color:var(--text2); font-style:normal; font-weight:300; font-size:9px; margin-left:4px; }

.sep { width:1px; height:18px; background:var(--border2); flex-shrink:0; }

.hb { width:7px;height:7px;border-radius:50%;background:var(--offline);flex-shrink:0;transition:all .3s; }
.hb.live { background:var(--online);box-shadow:0 0 6px var(--online);animation:hb 2s ease infinite; }
@keyframes hb { 0%,100%{opacity:1}50%{opacity:.3} }

.bstat { display:flex;flex-direction:column;align-items:center; }
.bstat-v { font-size:13px;font-weight:700;line-height:1.1; }
.bstat-l { font-size:7px;color:var(--text2);letter-spacing:.07em;font-family:var(--mono); }

.spacer { flex:1; }

/* tab nav in bar */
.tab-nav { display:flex;gap:0; }
.tnav {
  padding:0 12px; height:var(--bar-h); display:flex; align-items:center;
  font-size:9px;font-weight:700;letter-spacing:.12em;color:var(--text2);
  cursor:pointer;border-bottom:2px solid transparent;transition:all .12s;
  white-space:nowrap;
}
.tnav:hover { color:var(--text); }
.tnav.act { color:var(--idle);border-bottom-color:var(--idle); }

.hbtn {
  padding:4px 10px;font-family:var(--font);font-size:9px;font-weight:700;
  letter-spacing:.1em;border:1px solid var(--border2);background:transparent;
  color:var(--text2);cursor:pointer;border-radius:2px;transition:all .12s;white-space:nowrap;
}
.hbtn:hover { color:var(--text);border-color:var(--border3); }
.hbtn.g { border-color:var(--online);color:var(--online); }
.hbtn.g:hover { background:rgba(0,229,160,.07); }
.hbtn.act { background:rgba(79,195,247,.08);border-color:var(--idle);color:var(--idle); }

/* URL input */
.url-row { display:flex;gap:5px;align-items:center; }
.url-in {
  padding:4px 8px;background:rgba(255,255,255,.03);border:1px solid var(--border2);
  color:var(--text);font-family:var(--mono);font-size:9px;border-radius: