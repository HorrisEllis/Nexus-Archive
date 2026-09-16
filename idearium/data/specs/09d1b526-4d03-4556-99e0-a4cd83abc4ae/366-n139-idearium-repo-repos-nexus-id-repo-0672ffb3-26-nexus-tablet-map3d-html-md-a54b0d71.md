---
chunk_uuid: a54b0d71-5ec6-4693-ad64-a468acea67ec
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-26-nexus-tablet-map3d-html-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/26-nexus-tablet-map3d-html.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-26-nexus-tablet-map3d-html-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-26-nexus-tablet-map3d-html-md:a54b0d71
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:23:26.766Z
---

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NEXUS · 3D Map</title>
<!--
  tablet/map3d.html — OB9 of the observability/tablet phasemap (CHUNK I, final)
  UUID: nexus-tablet-map3d-v1-0000-2026-0730-001

  §PHASEMAP OB9. A real 3D dynamic map of NEXUS. NODES = systems/components from
  the movement graph (OB3), EDGES = observed flow, COLOR/PULSE = bottleneck score
  (OB4) + CFR friction. §1.1 / §0.1 THE LAW (inherited from the tablet's Brain
  view): every node, edge, and color traces to a REAL registry/CFR value. A fact
  that isn't observed is labelled unknown, NEVER rendered as a confident zero —
  "an authoritative-looking wrong picture is the specific failure this view is
  warned against." No mocks, no fakes. Data comes from copilot's diagnostics +
  movement endpoints; if they're unreachable, the map says so, it does not invent
  a topology.
-->
<style>
  :root{ --bg:#05060a; --ink:#e8edf5; --dim:#8792a6; --ac:#00e5ff; --bad:#ff5d6c; --warn:#f2c14e; --ok:#3ad29f; --mono:'Space Mono',ui-monospace,monospace; }
  *{box-sizing:border-box;} html,body{margin:0;height:100%;background:var(--bg);color:var(--ink);font-family:var(--mono);overflow:hidden;}
  #stage{position:fixed;inset:0;}
  .hud{position:fixed;z-index:10;font-size:11px;letter-spacing:.05em;}
  #title{top:16px;left:20px;} #title b{font-size:14px;letter-spacing:.2em;}
  #title .v{color:var(--dim);}
  #legend{bottom:16px;left:20px;color:var(--dim);line-height:1.9;}
  #legend .sw{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;vertical-align:middle;}
  #status{top:16px;right:20px;text-align:right;color:var(--dim);}
  #status b{color:var(--ok);}
  #banner{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:20;text-align:center;color:var(--warn);font-size:13px;max-width:60%;display:none;}
  #tip{position:fixed;z-index:15;background:rgba(8,10,18,.95);border:1px solid #2a3040;border-radius:8px;padding:8px 11px;font-size:11px;pointer-events:none;display:none;max-width:240px;}
  #tip .n{color:var(--ac);font-weight:700;} #tip .r{color:var(--dim);margin-top:3px;}
</style>
</head>
<body>
<canvas id="stage"></canvas>
<div class="hud" id="title"><b>NEXUS</b> <span class="v">· 3D map · v0.17</span></div>
<div class="hud" id="status">connecting…</div>
<div class="hud" id="legend">
  <div><span class="sw" style="background:#3ad29f"></span>healthy flow</div>
  <div><span class="sw" style="background:#f2c14e"></span>friction / watch</div>
  <div><span class="sw" style="background:#ff5d6c"></span>bottleneck (OB4)</div>
  <div><span class="sw" style="background:#565f70"></span>unknown — not observed</div>
</div>
<div id="banner"></div>
<div id="tip"></div>

<script type="importmap">{ "imports": { "three": "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js" } }</script>
<script type="module">
import * as THREE from 'three';

const COPILOT = `http://127.0.0.1:3750`;
const $ = s => document.querySelector(s);

// ── scene ──
const canvas = $('#stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
camera.position.set(0, 0, 46);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const key = new THREE.PointLight(0x00e5ff, 0.8, 200); key.position.set(20,20,30); scene.add(key);

function resize(){ const w=innerWidth,h=innerHeight; renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

// ── data (REAL only — §1.1) ──
// nodes/edges come from the movement graph; color from bottleneck score. A node
// with no observed health is grey "unknown", never a confident green.
const COLORS = { ok:0x3ad29f, warn:0xf2c14e, bad:0xff5d6c, unknown:0x565f70 };
let nodeMeshes = [], edgeLines = [], group = new THREE.Group(); scene.add(group);
const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2(); let hovered = null;

function colorFor(node){
  if(node.state==='offline'||node.state==='degraded') return COLORS.bad;
  if(node.bottleneck>=0.5) return COLORS.bad;
  if(node.bottleneck>=0.25||node.friction>=0.4) return COLORS.warn;
  if(node.state==='online') return COLORS.ok;
  return COLORS.unknown; // not observed — honest grey, not fake green
}

function build(graph, health, bottlenecks){
  // clear
  group.clear(); nodeMeshes=[]; edgeLines=[];
  const nodes = graph.nodes || [];
  if(!nodes.length){ showBanner('No topology observed yet — the movement graph is empty. Boot the systems so real flow can be mapped. (Nothing is invented here.)'); return; }
  hideBanner();

  // position nodes on a sphere (deterministic by index)
  const N = nodes.length, R = 16;
  const bnByNode = {}; (bottlenecks||[]).forEach(b=>{ bnByNode[b.node]=b.score; bnByNode[b.where]=Math.max(bnByNode[b.where]||0,b.score); });
  const pos = {};
  nodes.forEach((n,i)=>{
    const phi = Math.acos(1 - 2*(i+0.5)/N), theta = Math.PI*(1+Math.sqrt(5))*i;
    const p = new THREE.Vector3(R*Math.cos(theta)*Math.sin(phi), R*Math.sin(theta)*Math.sin(phi), R*Math.cos(phi));
    pos[n.id]=p;
    n.state = (health && health.systems && health.systems[n.system]) || (health&&health.systems&&health.systems[n.id]) || 'unknown';
    n.bottleneck = bnByNode[n.id]||0;
    const size = 0.9 + (n.type==='system'?0.7:0);
    const geo = new THREE.SphereGeometry(size, 24, 24);
    const mat = new THREE.MeshStandardMaterial({ color:colorFor(n), emissive:colorFor(n), emissiveIntensity:0.35, roughness:0.4 });
    const mesh = new THREE.Mesh(geo, mat); mesh.position.copy(p); mesh.userData=n;
    group.add(mesh); nodeMeshes.push(mesh);
  });

  // edges — ONLY observed flow (§1.1). friction sets color+opacity.
  (graph.edges||[]).forEach(e=>{
    const a=pos[e.from], b=pos[e.to]; if(!a||!b)return;
    const col = e.friction>=0.5?COLORS.bad:e.friction>=0.25?COLORS.warn:COLORS.ok;
    const mat = new THREE.LineBasicMaterial({ color:col, transparent:true, opacity:0.25+Math.min(0.5,(e.count||1)*0.08) });
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]), mat);
    line.userData=e; group.add(line); edgeLines.push(line);
  });
}

function showBanner(t){ const b=$('#banner'); b.textContent=t; b.style.display='block'; }
function hideBanner(){ $('#banner').style.display='none'; }

// ── live data fetch ──
async function jpost(prompt){ try{ const r=await fetch(`${COPILOT}/api/prompt`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})}); return await r.json(); }catch{ return null; } }

async function refresh(){
  const res = await jpost('run diagnostics');
  const report = res && res.report;
  if(!report){ $('#status').textContent='co-pilot offline (:3750)'; showBanner('Cannot reach co-pilot on :3750 — no live data. This map renders only real observed topology, so it stays empty rather than show a fake one.'); return; }
  $('#status').innerHTML = `<b>${report.health?report.health.online:0}</b>/${report.health?report.health.total:0} online · regime ${report.regime?report.regime.state:'—'}`;
  // movement graph + bottlenecks: co-pilot exposes them via the report where present;
  // otherwise derive a coarse graph from the systems in health (real nodes only).
  let graph = report.movement || null, bottlenecks = report.bottlenecks || [];
  if(!graph){
    const sys = report.health && report.health.systems ? Object.keys(report.health.systems) : [];
    graph = { nodes: sys.map(s=>({id:s,name:s,system:s,type:'system'})), edges: [] };
  }
  build(graph, report.health, bottlenecks);
}

// ── interaction: rotate + hover ──
let rot = { x:0, y:0 }, drag=false, last={x:0,y:0};
canvas.addEventListener('pointerdown',e=>{drag=true;last={x:e.clientX,y:e.clientY};});
addEventListener('pointerup',()=>drag=false);
addEventListener('pointermove',e=>{
  if(drag){ rot.y+=(e.clientX-last.x)*0.005; rot.x+=(e.clientY-last.y)*0.005; last={x:e.clientX,y:e.clientY}; }
  mouse.x=(e.clientX/innerWidth)*2-1; mouse.y=-(e.clientY/innerHeight)*2+1;
  const tip=$('#tip');
  raycaster.setFromCamera(mouse,camera);
  const hit=raycaster.intersectObjects(nodeMeshes)[0];
  if(hit){ const n=hit.object.userData; tip.style.display='block'; tip.style.left=(e.clientX+14)+'px'; tip.style.top=(e.clientY+14)+'px';
    tip.innerHTML=`<div class="n">${n.name}</div><div class="r">state: ${n.state}${n.bottleneck?` · bottleneck ${n.bottleneck.toFixed(2)}`:''}</div>`;
  } else tip.style.display='none';
});
addEventListener('wheel',e=>{ camera.position.z=Math.max(20,Math.min(90,camera.position.z+e.deltaY*0.02)); });

// ── loop ──
function animate(t){
  requestAnimationFrame(animate);
  if(!drag){ rot.y+=0.0015; }
  group.rotation.x += (rot.x - group.rotation.x)*0.1;
  group.rotation.y += (rot.y - group.rotation.y)*0.1;
  // pulse bottleneck nodes
  const s=1+Math.sin(t*0.004)*0.08;
  nodeMeshes.forEach(m=>{ if(m.userData.bottleneck>=0.5){ m.scale.setScalar(s); } });
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);

refresh(); setInterval(refresh, 15000);
</script>
</body>
</html>