/* NEXUS v0.53.0 — nexus-builder.js
 * Script Builder Engine — SISO gates, build, hostile, QA
 * Phase 0B — extracted 2026-04-07
 */

/* ═══════════════════════════════════════════════════════════════
   NEXUS v6 — FULL SCRIPT BUILDER ENGINE
   SISO-gated, Jaa-logged, hostile-tested, resume-capable
   ═══════════════════════════════════════════════════════════════ */

/* ─── BUILDER STATE ──────────────────────────────────────────── */
let _generatedCode='';
let _buildSessionId='';
let _buildLog=[];
let _sisoRunning=false;
let _sisoAbort=false;
let _sisoGates=[];
let _sisoGateIdx=0;
let _sisoBuiltModules={};

/* ─── JAA LOGGING (Persistent per-session build memory) ──────── */
const JAA={
  _key:'nx6_jaa_log',
  _mkey:'nx6_jaa_meta',
  log(type,data,sessionId='',level='INFO'){
    const entry={id:uid(),ts:new Date().toISOString(),type,level,sessionId,data};
    const logs=this.getAll();logs.push(entry);
    if(logs.length>10000)logs.splice(0,logs.length-10000);
    try{localStorage.setItem(this._key,JSON.stringify(logs));}catch{}
    log_ev('jaa:'+type,{sessionId,level,...(typeof data==='object'?data:{msg:data})},'JAA');
    return entry;
  },
  getAll(){try{return JSON.parse(localStorage.getItem(this._key)||'[]');}catch{return[];}},
  getBySession(sid){return this.getAll().filter(e=>e.sessionId===sid);},
  getLastGate(sessionId){
    const entries=this.getBySession(sessionId).filter(e=>e.type==='gate:complete');
    return entries.length?entries[entries.length-1]:null;
  },
  saveMeta(key,val2){
    const m=this.getMeta();m[key]=val2;
    try{localStorage.setItem(this._mkey,JSON.stringify(m));}catch{}
  },
  getMeta(){try{return JSON.parse(localStorage.getItem(this._mkey)||'{}');}catch{return{};}},
  getMetaKey(key){return this.getMeta()[key]||null;},
  clear(){localStorage.removeItem(this._key);},
  query(filter){
    const all=this.getAll();
    return all.filter(e=>{
      if(filter.type&&e.type!==filter.type)return false;
      if(filter.level&&e.level!==filter.level)return false;
      if(filter.sessionId&&e.sessionId!==filter.sessionId)return false;
      if(filter.since&&new Date(e.ts)<new Date(filter.since))return false;
      return true;
    });
  }
};

/* ─── UUID SYSTEM ─────────────────────────────────────────────── */
const UUID={
  _key:'nx6_uuids',
  _sessionId: null,

  /* ── CORE GEN ── */
  gen(type='generic', meta={}, entity=''){
    const prefix = type.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
    const id = 'NX-'+prefix+'-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
    const record = {
      id, type, entity: entity || meta.name || meta.label || meta.vision?.slice?.(0,30) || '',
      meta, created: new Date().toISOString(), valid: true,
      sessionId: this._sessionId || '',
      sequence: this._nextSeq(),
    };
    const all = this.getAll();
    all.push(record);
    if(all.length > 50000) all.splice(0, all.length - 50000);
    try{ localStorage.setItem(this._key, JSON.stringify(all)); } catch{}
    // Live-update UUID registry if visible
    this._notifyRegistry(record);
    log_ev('uuid:gen', {id, type, entity: record.entity}, 'INFO');
    return id;
  },

  /* ── SESSION ── */
  startSession(context='') {
    this._sessionId = this.gen('session', { context, userAgent: navigator.userAgent.slice(0,80), url: location.href }, context||'app-session');
    return this._sessionId;
  },

  /* ── SEQUENCE COUNTER ── */
  _seqKey: 'nx6_uuid_seq',
  _nextSeq() {
    let n = 0;
    try { n = parseInt(localStorage.getItem(this._seqKey)||'0'); } catch{}
    n++;
    try { localStorage.setItem(this._seqKey, n); } catch{}
    return n;
  },

  /* ── READ ── */
  getAll(){ try{ return JSON.parse(localStorage.getItem(this._key)||'[]'); }catch{ return []; }},
  getById(id){ return this.getAll().find(u=>u.id===id); },
  getByType(type){ return this.getAll().filter(u=>u.type===type); },
  getBySession(sid){ return this.getAll().filter(u=>u.sessionId===sid); },
  getByEntity(entity){ return this.getAll().filter(u=>u.entity.includes(entity)); },

  /* ── INVALIDATE / ROTATE ── */
  invalidate(id, reason='') {
    const all = this.getAll();
    const idx = all.findIndex(u=>u.id===id);
    if(idx>=0){ all[idx].valid=false; all[idx].invalidated=new Date().toISOString(); all[idx].invalidReason=reason; }
    try{ localStorage.setItem(this._key, JSON.stringify(all)); }catch{}
    log_ev('uuid:invalidate', {id, reason}, 'WARN');
  },
  rotate(id){
    this.invalidate(id, 'rotated');
    const old = this.getAll().find(u=>u.id===id);
    return old ? this.gen(old.type, {...old.meta, rotatedFrom:id}, old.entity) : this.gen();
  },

  /* ── STATS ── */
  stats() {
    const all = this.getAll();
    const byType = {};
    all.forEach(u=>{ byType[u.type]=(byType[u.type]||0)+1; });
    return { total: all.length, valid: all.filter(u=>u.valid).length, invalid: all.filter(u=>!u.valid).length, byType, session: this._sessionId };
  },

  /* ── EXPORT ── */
  exportJSON() {
    const data = { exportedAt: new Date().toISOString(), session: this._sessionId, uuids: this.getAll() };
    const a=document.createElement('a'); a.href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(data,null,2)); a.download='nexus-uuids-'+Date.now()+'.json'; a.click();
  },

  /* ── LIVE REGISTRY NOTIFICATION ── */
  _notifyRegistry(record) {
    // Update metrics badge
    const cnt = document.getElementById('uuid-count');
    if(cnt){ const all=this.getAll(); cnt.textContent=all.length+' UUIDs'; }
    // Update valid count
    const vcnt = document.getElementById('uuid-valid-count');
    if(vcnt){ const s=this.stats(); vcnt.textContent=s.valid+' valid'; }
    // If registry tab is open, add row live
    const body = document.getElementById('uuid-registry-body');
    const isOpen = document.getElementById('log-sub-uuids')?.style.display!=='none';
    if(body && isOpen) {
      const row = this._buildRow(record);
      body.insertBefore(row, body.firstChild);
      if(body.children.length > 2000) body.lastChild?.remove();
    }
  },

  /* ── BUILD ROW ── */
  _buildRow(u) {
    const row = document.createElement('div');
    row.className = 'uuid-row';
    row.setAttribute('data-uuid-id', u.id);
    row.onclick = () => uuidInspectorOpen(u.id);
    const metaStr = Object.entries(u.meta||{}).filter(([k])=>k!=='userAgent').map(([k,v])=>`${k}:${String(v).slice(0,30)}`).join(' · ');
    const timeStr = u.created ? new Date(u.created).toTimeString().slice(0,8) : '';
    const typeClass = u.type.replace(/[^a-z0-9-]/g,'-');
    row.innerHTML = `
      <span class="uuid-id" title="${esc(u.id)}">${esc(u.id)}</span>
      <span class="uuid-type ${typeClass}">${esc(u.type)}</span>
      <span class="uuid-entity" title="${esc(u.entity)}">${esc(u.entity||'—')}</span>
      <span class="uuid-meta" title="${esc(metaStr)}">${esc(metaStr||'—')}</span>
      <span class="uuid-ts">${timeStr}</span>
      <span class="uuid-status ${u.valid?'valid':'invalid'}">${u.valid?'VALID':'VOID'}</span>
    `;
    return row;
  },
};

