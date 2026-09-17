<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NEXUS — Idea Review</title>
<style>
:root{--bg:#12161c;--panel:#1a1f27;--line:#2a323d;--txt:#dfe6ef;--dim:#7d8b9c;
--agent:#e0a33e;--user:#4ec9b0;--ok:#4ec973;--no:#e05c5c;--acc:#6ba7ff}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);
font:14px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace}
header{padding:16px 22px;border-bottom:1px solid var(--line);display:flex;gap:22px;align-items:baseline;flex-wrap:wrap}
h1{font-size:15px;margin:0;letter-spacing:.09em;text-transform:uppercase}
.stat{color:var(--dim);font-size:12px}.stat b{color:var(--txt)}
.bar{padding:10px 22px;border-bottom:1px solid var(--line);display:flex;gap:8px;flex-wrap:wrap}
button{background:var(--panel);color:var(--txt);border:1px solid var(--line);
padding:5px 11px;border-radius:4px;cursor:pointer;font:inherit;font-size:12px}
button:hover{border-color:var(--acc)}button.on{border-color:var(--acc);color:var(--acc)}
main{padding:18px 22px;display:grid;gap:12px;max-width:1100px}
.card{background:var(--panel);border:1px solid var(--line);border-left:3px solid var(--line);border-radius:5px;padding:14px 16px}
.card.agent{border-left-color:var(--agent)}.card.user{border-left-color:var(--user)}
.text{margin:0 0 10px;font-size:14px}
.tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.tag{font-size:11px;padding:2px 7px;border-radius:3px;background:#232b35;color:var(--dim)}
.tag.origin-agent{background:#3a2e14;color:var(--agent)}
.tag.origin-user{background:#123430;color:var(--user)}
.tag.status-accepted{background:#12331d;color:var(--ok)}
.tag.status-rejected{background:#331515;color:var(--no)}
.ev{border-left:2px solid var(--line);padding:5px 0 5px 11px;margin:8px 0;color:var(--dim);font-size:12px}
.ev b{color:var(--txt);font-weight:400}
.act{display:flex;gap:8px;margin-top:11px;align-items:center;flex-wrap:wrap}
.act input{flex:1;min-width:200px;background:#0e1216;border:1px solid var(--line);
color:var(--txt);padding:6px 9px;border-radius:4px;font:inherit;font-size:12px}
.yes{border-color:#2c5c39;color:var(--ok)}.no{border-color:#5c2c2c;color:var(--no)}
.empty,.note{color:var(--dim);padding:22px;text-align:center}
.warn{color:var(--agent);font-size:12px;padding:9px 22px;border-bottom:1px solid var(--line)}
</style></head><body>
<header><h1>Idea Review</h1><span class="stat" id="stats">loading…</span></header>
<div class="warn" id="warn"></div>
<div class="bar" id="filters"></div>
<main id="list"><div class="empty">loading…</div></main>
<script>
// Reads cortex. No local state, no optimistic UI — the list is whatever the
// server says after a decision, so the screen can never disagree with the store.
const F={status:'proposed',origin:''};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function api(p,o){const r=await fetch(p,o);return r.json();}

async function load(){
  const [q,s]=await Promise.all([
    api('/api/ideas?'+new URLSearchParams(Object.entries(F).filter(([,v])=>v))),
    api('/api/ideas/stats')]);
  const st=document.getElementById('stats');
  st.innerHTML = s.ok
    ? `<b>${s.total}</b> ideas · agent <b>${s.byOrigin.agent||0}</b> · user <b>${s.byOrigin.user||0}</b> · proposed <b>${s.byStatus.proposed||0}</b> · accepted <b>${s.byStatus.accepted||0}</b> · rejected <b>${s.byStatus.rejected||0}</b>`
    : esc(s.reason||'stats unavailable');
  // §1.2 — untagged legacy rows are shown as untagged, never bucketed by guessing.
  document.getElementById('warn').textContent = s.untaggedNote || '';

  document.getElementById('filters').innerHTML =
    [['status','','all'],['status','proposed','proposed'],['status','accepted','accepted'],['status','rejected','rejected'],
     ['origin','','any origin'],['origin','agent','agent'],['origin','user','user']]
    .map(([k,v,label])=>`<button class="${F[k]===v?'on':''}" onclick="setF('${k}','${v}')">${label}</button>`).join('');

  const list=document.getElementById('list');
  const rows=q.ideas||[];
  if(!rows.length){list.innerHTML='<div class="empty">nothing matches this filter</div>';return;}
  list.innerHTML=rows.map(r=>{
    const o=r.origin||'untagged', st=r.status||'proposed';
    const ev=(r.evidenceFull||[]).map(e=>`<div class="ev"><b>${esc(e.kind)}</b> — ${esc(e.detail)}<br>↳ ${esc(e.where)}</div>`).join('');
    const acts = st==='proposed'
      ? `<div class="act"><input id="n-${esc(r.slug)}" placeholder="note (required to reject)">
         <button class="yes" onclick="decide('${esc(r.slug)}','accepted')">accept</button>
         <button class="no"  onclick="decide('${esc(r.slug)}','rejected')">reject</button></div>`
      : `<div class="act note">${esc(st)} by ${esc(r.reviewedBy||'?')}${r.reviewNote?' — '+esc(r.reviewNote):''}</div>`;
    return `<div class="card ${o}"><p class="text">${esc(r.text)}</p>
      <div class="tags">${(r.tags||[]).map(t=>`<span class="tag ${esc(String(t).replace(':','-'))}">${esc(t)}</span>`).join('')}</div>
      ${ev}${acts}</div>`;
  }).join('');
}
function setF(k,v){F[k]=v;load();}
async function decide(slug,decision){
  const note=(document.getElementById('n-'+slug)||{}).value||'';
  if(decision==='rejected'&&!note.trim()){alert('A rejection needs a note. Without one the idea will just be re-proposed.');return;}
  // reviewerKind:user is what the server requires for accept — this page IS the
  // user's surface, and nothing else may send it.
  const r=await api('/api/ideas/review',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({slug,decision,reviewer:'james',reviewerKind:'user',note})});
  if(!r.ok)alert(r.reason||'refused');
  load();
}
load();setInterval(load,15000);
</script></body></html>