spec:
  name: ERAVOS v3-17 catalog
  uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
  version: 0.1.0
  type: codebase
  phase: 40
  status: complete
  agent: auto
  completed_at: 2026-09-25T20:17:11.385Z

# runtime/organism-factory.js

/* ═══════════════════════════════════════════════════════════
   ERAVOS ORGANISM FACTORY  v3.0.0
   Spawns any registered organism with its UI projection.
   Engine first — UI last.
   ═══════════════════════════════════════════════════════════ */

window.OrganismFactory = (() => {
'use strict';

/* ── Scoped publish ─────────────────────────────────────────
   _pub is a module-level stub. The real scoped version is
   passed into each buildUI as scopedPub and captured in
   event handler closures at build time.
   We override the module-level _pub during buildUI execution
   so the shared helpers (mkKnob etc) also use the right scope.
   Event handlers close over the scoped version permanently.  */
let _pub = (topic, payload) => KERNEL.bus.publish(topic, payload);


/* ── Shared control helpers ─────────────────────────────── */
function mkKnob(parent, opts) {
  const { label, min, max, value, unit='', step=0.01, onChange, eventKey, pub } = opts;
  const _pubFn = pub || _pub;
  const pct = (value - min) / (max - min);
  const deg = -145 + pct * 290;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;cursor:ns-resize;';
  const knob = document.createElement('div');
  knob.style.cssText = 'width:36px;height:36px;border-radius:50%;border:2px solid var(--b3);background:radial-gradient(circle at 35% 35%,var(--bg3),var(--bg1));position:relative;transition:border-color .12s;';
  const dot = document.createElement('div');
  dot.style.cssText = `position:absolute;width:2.5px;height:8px;background:var(--accent);border-radius:2px;top:4px;left:50%;transform-origin:bottom center;transform:translateX(-50%) rotate(${deg}deg);pointer-events:none;`;
  knob.appendChild(dot);
  const valEl = document.createElement('div'); valEl.style.cssText='font-family:var(--mono);font-size:6px;color:var(--dim2);min-width:30px;text-align:center;';
  const lblEl = document.createElement('div'); lblEl.style.cssText='font-family:var(--mono);font-size:6px;color:var(--dim);letter-spacing:.1em;text-transform:uppercase;text-align:center;';
  valEl.textContent = _fmt(value, unit, step);
  lblEl.textContent = label;
  knob.addEventListener('mouseenter', () => knob.style.borderColor='var(--accent)');
  knob.addEventListener('mouseleave', () => knob.style.borderColor='var(--b3)');
  let _d=false, _sy=0, _sv=value, cur=value;
  knob.addEventListener('pointerdown', e=>{_d=true;_sy=e.clientY;_sv=cur;knob.setPointerCapture(e.pointerId);e.preventDefault();});
  knob.addEventListener('pointermove', e=>{
    if(!_d) return;
    cur = Math.max(min, Math.min(max, _sv + (_sy-e.clientY)/150*(max-min)));
    const p=(cur-min)/(max-min);
    dot.style.transform=`translateX(-50%) rotate(${-145+p*290}deg)`;
    valEl.textContent=_fmt(cur,unit,step);
    if(onChange) onChange(cur);
    if(eventKey) _pubFn('ui:config_change',{key:eventKey,value:cur});
  });
  knob.addEventListener('pointerup',()=>_d=false);
  wrap.appendChild(knob); wrap.appendChild(valEl); wrap.appendChild(lblEl);
  parent.appendChild(wrap);
  return { el:wrap, get value(){return cur;} };
}

function mkToggle(parent, opts) {
  const { label, value=false, onChange, eventKey, pub } = opts;
  const _pubFn = pub || _pub;
  const el  = document.createElement('div');
  el.style.cssText = `display:flex;align-items:center;gap:6px;padding:4px 7px;border-radius:3px;border:1px solid ${value?'var(--accent)':'var(--b2)'};background:${value?'rgba(0,255,136,.07)':'transparent'};cursor:pointer;transition:all .12s;`;
  const led = document.createElement('div'); led.style.cssText=`width:6px;height:6px;border-radius:50%;background:${value?'var(--accent)':'var(--dim)'};flex-shrink:0;transition:background .12s,box-shadow .12s;${value?'box-shadow:0 0 5px var(--accent);':''}`;
  const lbl = document.createElement('div'); lbl.style.cssText='font-family:var(--mono);font-size:7.5px;letter-spacing:.1em;color:var(--dim2);';
  lbl.textContent = label;
  el.appendChild(led); el.appendChild(lbl);
  let cur = value;
  el.addEventListener('click', () => {
    cur = !cur;
    el.style.borderColor = cur ? 'var(--accent)' : 'var(--b2)';
    el.style.background  = cur ? 'rgba(0,255,136,.07)' : 'transparent';
    led.style.background = cur ? 'var(--accent)' : 'var(--dim)';
    led.style.boxShadow  = cur ? '0 0 5px var(--accent)' : '';
    lbl.style.color      = cur ? 'var(--accent)' : 'var(--dim2)';
    if(onChange) onChange(cur);
    if(eventKey) _pubFn('ui:config_change',{key:eventKey,value:cur});
  });
  parent.appendChild(el);
  return { el, get value(){return cur;} };
}

function mkSelect(parent, opts) {
  const { label, options, value, onChange, eventKey, pub } = opts;
  const _pubFn = pub || _pub;
  const row = document.createElement('div'); row.style.cssText='display:flex;align-items:center;gap:6px;';
  const lbl = document.createElement('div'); lbl.style.cssText='font-family:var(--mono);font-size:7px;letter-spacing:.09em;color:var(--dim2);min-width:34px;flex-shrink:0;'; lbl.textContent=label;
  const sel = document.createElement('select'); sel.style.cssText='flex:1;background:var(--bg3);border:1px solid var(--b2);border-radius:3px;color:var(--white);font-family:var(--mono);font-size:8px;padding:3px 5px;outline:none;cursor:pointer;';
  options.forEach(o => {
    const opt = document.createElement('option'); opt.value=o.v||o; opt.textContent=o.l||o;
    if((o.v||o)===value) opt.selected=true; sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    if(onChange) onChange(sel.value);
    if(eventKey) _pubFn('ui:config_change',{key:eventKey,value:sel.value});
  });
  row.appendChild(lbl); row.appendChild(sel);
  parent.appendChild(row);
  return sel;
}

function mkDiv(parent) {
  const d=document.createElement('div'); d.style.cssText='height:1px;background:var(--b1);margin:3px 0;flex-shrink:0;'; parent.appendChild(d);
}

function mkScope(parent, { height=48, color='rgba(0,255,136,.4)', label } = {}) {
  if(label){ const l=document.createElement('div'); l.style.cssText='font-family:var(--mono);font-size:6.5px;color:var(--dim);margin-bottom:2px;'; l.textContent=label; parent.appendChild(l); }
  const scope=document.createElement('div'); scope.style.cssText=`width:100%;height:${height}px;border-radius:4px;background:var(--bg2);border:1px solid var(--b1);overflow:hidden;position:relative;flex-shrink:0;`;
  const cvs=document.createElement('canvas'); cvs.width=200; cvs.height=height; cvs.style.cssText='position:absolute;inset:0;width:100%;height:100%;';
  scope.appendChild(cvs); parent.appendChild(scope);
  const ctx=cvs.getContext('2d'); let ph=0;
  function draw(){ requestAnimationFrame(draw); ctx.clearRect(0,0,200,height); ctx.strokeStyle=color; ctx.lineWidth=1.5; ctx.beginPath(); for(let x=0;x<200;x++){const y=height/2+Math.sin(x*.08+ph)*Math.sin(x*.033+ph*.5)*(height*.3); x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke(); ph+=.04; }
  draw();
  return scope;
}

function mkWave(parent, { height=54, color='rgba(170,68,255,.7)' } = {}) {
  const wrap=document.createElement('div'); wrap.style.cssText=`width:100%;height:${height}px;border-radius:4px;background:var(--bg2);border:1px solid var(--b1);overflow:hidden;position:relative;flex-shrink:0;cursor:pointer;`;
  const cvs=document.createElement('canvas'); cvs.width=200; cvs.height=height; cvs.style.cssText='position:absolute;inset:0;width:100%;height:100%;';
  const ph=document.createElement('div'); ph.style.cssText='position:absolute;top:0;bottom:0;width:1.5px;background:var(--accent);pointer-events:none;left:0;';
  wrap.appendChild(cvs); wrap.appendChild(ph);
  parent.appendChild(wrap);
  return {
    el: wrap, cvs, ph,
    draw(peaks) {
      const ctx=cvs.getContext('2d'); ctx.clearRect(0,0,200,height);
      ctx.strokeStyle=color; ctx.lineWidth=1; ctx.beginPath();
      peaks.forEach((v,i)=>{ const h2=v*height*.45; ctx.moveTo(i/peaks.length*200,height/2-h2); ctx.lineTo(i/peaks.length*200,height/2+h2); });
      ctx.stroke();
    },
    setHead(norm) { ph.style.left=(norm*100)+'%'; },
  };
}

function _fmt(v, unit, step) {
  const n = step >= 1 ? Math.round(v) : +v.toFixed(2);
  return unit ? `${n}${unit}` : `${n}`;
}

function mkBtn(parent, label, onClick, opts={}) {
  const b=document.createElement('button');
  b.textContent=label; b.title=opts.title||'';
  b.style.cssText=`height:${opts.h||20}px;padding:0 ${opts.px||7}px;border-radius:3px;border:1px solid var(--b2);background:transparent;color:var(--dim2);font-family:var(--mono);font-size:${opts.fs||7}px;letter-spacing:.08em;cursor:pointer;transition:all .12s;outline:none;flex-shrink:0;`;
  b.addEventListener('mouseenter',()=>{b.style.borderColor='var(--accent)';b.style.color='var(--accent)';});
  b.addEventListener('mouseleave',()=>{if(!b.dataset.on){b.style.borderColor='var(--b2)';b.style.color='var(--dim2)';}});
  b.addEventListener('click',onClick);
  if(parent) parent.appendChild(b);
  return b;
}

/* ── Organism definitions ──────────────────────────────── */

const DEFS = {};

function reg(id, def) { DEFS[id] = { id, ...def }; }

/* ═══════════════════════════════════════════════════════
   DRUM MACHINE
═══════════════════════════════════════════════════════ */
reg('pads', {
  category:'Audio — Drums', summary:'Eight-pad sample-trigger drum machine with per-pad pitch and decay.', needs:[],
  label:'Drum Machine', icon:'🥁', accent:'#00ff88',
  width:290, height:500, minWidth:230, minHeight:360,
  mountEngine(instanceId, intakeResult, sBus) {
    PadsOrganism.mount(instanceId, sBus, KERNEL.audio, {});
  },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const root=document.createElement('div'); root.style.cssText='display:flex;flex-direction:column;height:100%;';
    const bankBar=document.createElement('div'); bankBar.style.cssText='display:flex;gap:3px;padding:6px 8px;border-bottom:1px solid var(--b1);flex-shrink:0;';
    const grid=document.createElement('div'); grid.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:8px;';
    const qa=document.createElement('div'); qa.style.cssText='padding:6px 8px;border-top:1px solid var(--b1);flex-shrink:0;';
    const kRow=document.createElement('div'); kRow.style.cssText='display:flex;gap:6px;justify-content:center;padding:4px 8px 8px;border-top:1px solid var(--b1);flex-shrink:0;';

    root.appendChild(bankBar); root.appendChild(grid); root.appendChild(qa); root.appendChild(kRow);
    content.appendChild(root);

    let curBank=0, selIdx=null, state={bank:0, pads:[], config:{}, voiceNames:[]};

    /* Bank buttons */
    ['A','B','C'].forEach((id,i)=>{
      const btn=document.createElement('button'); btn.textContent=id;
      btn.style.cssText='flex:1;height:20px;border-radius:3px;border:1px solid var(--b2);background:transparent;color:var(--dim);font-family:var(--orb);font-size:7.5px;font-weight:700;letter-spacing:.14em;cursor:pointer;transition:all .12s;outline:none;';
      btn.addEventListener('click',()=>_pub('ui:bank_select',{bank:i}));
      bankBar.appendChild(btn);
    });

    function renderPads(pads) {
      grid.innerHTML='';
      pads.forEach((pad,i)=>{
        const cell=document.createElement('div');
        cell.style.cssText=`aspect-ratio:1;border-radius:5px;border:1px solid var(--b2);background:var(--bg2);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;transition:border-color .08s,transform .06s;`;
        cell.innerHTML=`<div style="font-family:var(--mono);font-size:6px;color:rgba(255,255,255,.15);z-index:1;">${i+1}</div><div style="font-family:var(--raj);font-size:8px;font-weight:700;color:rgba(255,255,255,.5);z-index:1;max-width:90%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pad.sound.toUpperCase()}</div><div style="position:absolute;bottom:0;left:0;right:0;height:2px;background:${pad.color};opacity:.3;"></div><div class="flash" style="position:absolute;inset:0;background:${pad.color};opacity:0;transition:opacity .07s;border-radius:5px;"></div>`;
        cell.addEventListener('mouseenter',()=>{cell.style.borderColor=pad.color;cell.style.transform='scale(.97)';});
        cell.addEventListener('mouseleave',()=>{cell.style.borderColor='var(--b2)';cell.style.transform='';});
        cell.addEventListener('pointerdown',()=>{
          KERNEL.audio.boot();
          selIdx=i; renderQA(pads);
          _pub('ui:pad_press',{index:i,velocity:0.9});
        });
        cell.dataset.padIdx=i;
        grid.appendChild(cell);
      });
    }

    function litPad(index, color) {
      const cell=grid.querySelector(`[data-pad-idx="${index}"]`);
      if(!cell) return;
      const flash=cell.querySelector('.flash');
      if(flash){ flash.style.opacity='.35'; setTimeout(()=>flash.style.opacity='0',140); }
      cell.style.transform='scale(.91)'; setTimeout(()=>cell.style.transform='',120);
    }

    function renderQA(pads) {
      qa.innerHTML='';
      if(selIdx===null||!pads[selIdx]) return;
      const pad=pads[selIdx];
      const row=document.createElement('div'); row.style.cssText='display:flex;align-items:center;gap:5px;';
      const lbl=document.createElement('div'); lbl.style.cssText='font-family:var(--raj);font-size:8px;font-weight:600;color:var(--dim2);min-width:36px;'; lbl.textContent=`PAD ${selIdx+1}`;
      const sel=document.createElement('select'); sel.style.cssText='flex:1;background:var(--bg3);border:1px solid var(--b2);border-radius:3px;color:var(--white);font-family:var(--mono);font-size:8px;padding:2px 4px;outline:none;';
      (state.voiceNames.length?state.voiceNames:['kick','snare','hat','clap','808','rim','reese','wobble','acid','stab','openhat','crash','laser','glitch','noise','riser','drone','scream','vinyl']).forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;if(n===pad.sound)o.selected=true;sel.appendChild(o);});
      sel.addEventListener('change',()=>_pub('ui:pad_assign',{index:selIdx,sound:sel.value}));
      const swatch=document.createElement('div'); swatch.style.cssText='width:24px;height:20px;border-radius:3px;border:1px solid var(--b2);overflow:hidden;flex-shrink:0;cursor:pointer;';
      const ci=document.createElement('input'); ci.type='color'; ci.value=pad.color; ci.style.cssText='width:200%;height:200%;margin:-25%;border:none;cursor:pointer;';
      ci.addEventListener('input',()=>_pub('ui:pad_assign',{index:selIdx,color:ci.value}));
      swatch.appendChild(ci);
      row.appendChild(lbl); row.appendChild(sel); row.appendChild(swatch); qa.appendChild(row);
    }

    /* Knobs */
    mkKnob(kRow,{label:'VOL',  min:0,  max:1,   value:.88,step:.01,unit:'',    eventKey:'volume',pub:_pub});
    mkKnob(kRow,{label:'PITCH',min:-12,max:12,  value:0,  step:1,  unit:'st',  eventKey:'pitch',pub:_pub});
    mkKnob(kRow,{label:'DECAY',min:.01,max:2,   value:.3, step:.01,unit:'s',   eventKey:'decay',pub:_pub});

    /* State sync from engine */
    sBus.subscribe('org:state_sync', d=>{
      state={...state,...d};
      if(d.pads){ renderPads(d.pads); if(selIdx!==null) renderQA(d.pads); }
      if(d.bank!==undefined){ Array.from(bankBar.children).forEach((b,i)=>{ const on=i===d.bank; b.style.color=on?'var(--accent)':'var(--dim)'; b.style.borderColor=on?'var(--accent)':'var(--b2)'; b.style.background=on?'rgba(0,255,136,.07)':'transparent'; }); }
      if(d.voiceNames) state.voiceNames=d.voiceNames;
    });
    sBus.subscribe('org:pad_lit', ({index,color})=>litPad(index,color));
  },
});

/* ═══════════════════════════════════════════════════════
   SEQUENCER
═══════════════════════════════════════════════════════ */
reg('sequencer', {
  category:'Audio — Sequencing', summary:'Step sequencer driving pads and synths over the shared clock.', needs:[],
  label:'Sequencer', icon:'⬛', accent:'#00d4ff',
  width:600, height:440, minWidth:420, minHeight:280,
  mountEngine(instanceId, intakeResult, sBus) {
    SequencerOrganism.mount(instanceId, sBus, KERNEL.audio, KERNEL.clock, {});
  },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;height:100%;min-height:0;';

    /* Header */
    const hdr=document.createElement('div'); hdr.style.cssText='display:flex;align-items:center;gap:6px;padding:6px 10px;border-bottom:1px solid var(--b1);flex-shrink:0;background:var(--bg2);flex-wrap:wrap;';
    let playing=false;
    const btnPlay=mkBtn(null,'▶',()=>_pub('ui:play_press',{}));
    const btnRand=mkBtn(null,'RAND',()=>_pub('ui:randomize',{}));
    const btnClr =mkBtn(null,'CLR', ()=>_pub('ui:clear_pattern',{}));
    const bpmEl=document.createElement('div'); bpmEl.style.cssText='font-family:var(--orb);font-size:15px;font-weight:700;color:var(--accent);cursor:ns-resize;letter-spacing:.04em;min-width:42px;text-align:center;';
    bpmEl.textContent=KERNEL.clock.BPM;
    let _bd=false,_by=0,_bv=KERNEL.clock.BPM;
    bpmEl.addEventListener('pointerdown',e=>{_bd=true;_by=e.clientY;_bv=KERNEL.clock.BPM;bpmEl.setPointerCapture(e.pointerId);});
    bpmEl.addEventListener('pointermove',e=>{if(!_bd)return;KERNEL.clock.BPM=_bv+Math.round((_by-e.clientY)*.5);bpmEl.textContent=KERNEL.clock.BPM;_pub('ui:bpm_change',{bpm:KERNEL.clock.BPM});});
    bpmEl.addEventListener('pointerup',()=>_bd=false);
    const stepsSel=document.createElement('select'); stepsSel.style.cssText='background:var(--bg3);border:1px solid var(--b2);border-radius:3px;color:var(--white);font-family:var(--mono);font-size:7.5px;padding:2px 4px;outline:none;cursor:pointer;';
    [16,32].forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;stepsSel.appendChild(o);});
    stepsSel.addEventListener('change',()=>_pub('ui:step_count_change',{steps:+stepsSel.value}));
    const lcdEl=document.createElement('div'); lcdEl.style.cssText='font-family:var(--mono);font-size:8.5px;color:var(--accent);min-width:28px;';lcdEl.textContent='—';
    const sep=()=>{const s=document.createElement('div');s.style.cssText='width:1px;height:14px;background:var(--b1);flex-shrink:0;';return s;};
    hdr.append(btnPlay,btnRand,btnClr,sep(),bpmEl,sep(),stepsSel,sep(),lcdEl);

    /* Grid */
    const scroll=document.createElement('div'); scroll.style.cssText='flex:1;overflow-y:auto;overflow-x:hidden;padding:6px 8px;min-height:0;';
    const grid=document.createElement('div');
    scroll.appendChild(grid);

    let cellEls=[];

    function renderGrid(tracks,steps) {
      grid.innerHTML=''; cellEls=[];
      tracks.forEach((track,ti)=>{
        const row=document.createElement('div'); row.style.cssText='display:grid;grid-template-columns:70px 1fr;gap:4px;margin-bottom:3px;align-items:center;';
        const nm=document.createElement('div'); nm.style.cssText='font-family:var(--raj);font-size:8.5px;font-weight:700;color:var(--dim2);text-align:right;padding-right:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'; nm.textContent=track.sound.toUpperCase();
        const st=document.createElement('div'); st.style.cssText=`display:grid;grid-template-columns:repeat(${steps},1fr);gap:2px;`;
        const cs=[];
        for(let si=0;si<steps;si++){
          const cell=document.createElement('div'); cell.style.cssText=`aspect-ratio:1;border-radius:2px;cursor:pointer;background:${track.steps[si]?track.color:'var(--bg3)'};border:1px solid ${track.steps[si]?track.color:'var(--b1)'};opacity:${track.steps[si]?.85:1};transition:background .07s;`;
          if(si%4===0&&si>0) cell.style.marginLeft='2px';
          cell.addEventListener('click',()=>_pub('ui:step_toggle',{track:ti,step:si,value:track.steps[si]?0:1}));
          st.appendChild(cell); cs.push(cell);
        }
        cellEls.push(cs); row.appendChild(nm); row.appendChild(st); grid.appendChild(row);
      });
    }

    sBus.subscribe('org:grid_sync',({tracks,steps,playing:p,bpm})=>{
      renderGrid(tracks,steps); stepsSel.value=steps;
      bpmEl.textContent=bpm||KERNEL.clock.BPM;
      if(p!==undefined){ playing=p; btnPlay.textContent=p?'⏸':'▶'; btnPlay.dataset.on=p?'1':''; btnPlay.style.color=p?'var(--accent)':'var(--dim2)'; btnPlay.style.borderColor=p?'var(--accent)':'var(--b2)'; }
    });
    sBus.subscribe('org:state_sync',({playing:p})=>{
      if(p===undefined) return; playing=p; btnPlay.textContent=p?'⏸':'▶'; btnPlay.dataset.on=p?'1':''; btnPlay.style.color=p?'var(--accent)':'var(--dim2)'; btnPlay.style.borderColor=p?'var(--accent)':'var(--b2)';
    });
    sBus.subscribe('org:step_cursor',({step,bar})=>{
      lcdEl.textContent=`${bar+1}.${(step%4)+1}`;
      cellEls.forEach(row=>row.forEach((c,si)=>{ c.style.outline=si===step?'1px solid rgba(238,244,255,.85)':''; c.style.outlineOffset='-1px'; }));
    });
    sBus.subscribe('org:step_set',({track,step,value})=>{
      if(cellEls[track]?.[step]){ const c=cellEls[track][step]; c.style.background=value?'var(--accent)':'var(--bg3)'; c.style.borderColor=value?'var(--accent)':'var(--b1)'; }
    });

    wrap.appendChild(hdr); wrap.appendChild(scroll); content.appendChild(wrap);
  },
});

/* ═══════════════════════════════════════════════════════
   TIMELINE
═══════════════════════════════════════════════════════ */
reg('timeline', {
  category:'Audio — Sequencing', summary:'Multi-track audio clip timeline synced to the master transport.', needs:[],
  label:'Timeline', icon:'📼', accent:'#00d4ff',
  width:720, height:360, minWidth:480, minHeight:200,
  mountEngine(instanceId, intakeResult, sBus) {
    TimelineOrganism.mount(instanceId, sBus, KERNEL.audio, KERNEL.clock, {});
  },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;height:100%;min-height:0;';
    /* Header */
    const hdr=document.createElement('div'); hdr.style.cssText='display:flex;align-items:center;gap:6px;padding:5px 10px;border-bottom:1px solid var(--b1);background:var(--bg2);flex-shrink:0;flex-wrap:wrap;';
    let playing=false;
    const btnPlay=mkBtn(null,'▶',()=>_pub('ui:play_press',{}));
    const btnStop=mkBtn(null,'⏮',()=>{ _pub('ui:play_press',{}); setTimeout(()=>_pub('ui:play_press',{}),50); });
    const btnRec =mkBtn(null,'⏺',()=>btnRec.classList.toggle('rec-on')); btnRec.style.color='var(--accent3)';
    const timeEl=document.createElement('div'); timeEl.style.cssText='font-family:var(--orb);font-size:13px;font-weight:700;color:var(--accent);letter-spacing:.08em;min-width:84px;';timeEl.textContent='0:00.000';
    const bpmWrap=document.createElement('div'); bpmWrap.style.cssText='display:flex;align-items:center;gap:4px;cursor:ns-resize;';
    const bpmLbl=document.createElement('div'); bpmLbl.style.cssText='font-family:var(--mono);font-size:6.5px;color:var(--dim);letter-spacing:.1em;'; bpmLbl.textContent='BPM';
    const bpmVal=document.createElement('div'); bpmVal.style.cssText='font-family:var(--orb);font-size:13px;font-weight:700;color:var(--accent);min-width:38px;'; bpmVal.textContent=KERNEL.clock.BPM;
    let _bd=false,_by=0,_bv=KERNEL.clock.BPM;
    bpmWrap.addEventListener('pointerdown',e=>{_bd=true;_by=e.clientY;_bv=KERNEL.clock.BPM;bpmWrap.setPointerCapture(e.pointerId);});
    bpmWrap.addEventListener('pointermove',e=>{if(!_bd)return;KERNEL.clock.BPM=_bv+Math.round((_by-e.clientY)*.5);bpmVal.textContent=KERNEL.clock.BPM;});
    bpmWrap.addEventListener('pointerup',()=>_bd=false);
    bpmWrap.appendChild(bpmLbl); bpmWrap.appendChild(bpmVal);
    const addLaneBtn=mkBtn(null,'+ LANE',()=>_pub('ui:lane_add',{name:'Track',icon:'♪',color:'#00d4ff'}));
    const sep=()=>{const s=document.createElement('div');s.style.cssText='width:1px;height:14px;background:var(--b1);flex-shrink:0;';return s;};
    hdr.append(btnPlay,btnStop,btnRec,sep(),timeEl,sep(),bpmWrap,sep(),addLaneBtn);

    /* Ruler */
    const rulerRow=document.createElement('div'); rulerRow.style.cssText='display:flex;flex-shrink:0;height:22px;border-bottom:1px solid var(--b1);';
    const rulerLbl=document.createElement('div'); rulerLbl.style.cssText='width:88px;min-width:88px;background:var(--bg2);border-right:1px solid var(--b1);display:flex;align-items:center;padding:0 8px;font-family:var(--mono);font-size:6.5px;color:var(--dim);flex-shrink:0;'; rulerLbl.textContent='BARS';
    const rulerMarks=document.createElement('div'); rulerMarks.style.cssText='flex:1;position:relative;overflow:hidden;cursor:pointer;';
    const rulerCvs=document.createElement('canvas'); rulerCvs.style.cssText='position:absolute;inset:0;width:100%;height:100%;';
    rulerMarks.appendChild(rulerCvs); rulerRow.appendChild(rulerLbl); rulerRow.appendChild(rulerMarks);

    /* Lanes */
    const lanesScroll=document.createElement('div'); lanesScroll.style.cssText='flex:1;overflow-y:auto;overflow-x:hidden;position:relative;min-height:0;';
    const lanesWrap=document.createElement('div'); lanesWrap.style.position='relative';
    const emptyHint=document.createElement('div'); emptyHint.style.cssText='padding:16px;font-family:var(--mono);font-size:8px;color:var(--dim);text-align:center;pointer-events:none;'; emptyHint.textContent='Drop audio · click lane body to place clip · + LANE to add';
    lanesWrap.appendChild(emptyHint);
    const playheadEl=document.createElement('div'); playheadEl.style.cssText='position:absolute;top:0;bottom:0;width:1.5px;background:var(--accent);pointer-events:none;z-index:10;left:88px;';
    playheadEl.innerHTML='<div style="position:absolute;top:0;left:-4px;border:4px solid transparent;border-top-color:var(--accent);"></div>';
    lanesWrap.appendChild(playheadEl);
    lanesScroll.appendChild(lanesWrap);

    const addLaneRow=document.createElement('div'); addLaneRow.style.cssText='display:flex;align-items:center;justify-content:center;height:26px;gap:6px;cursor:pointer;font-family:var(--mono);font-size:7.5px;letter-spacing:.12em;color:var(--dim);border-top:1px solid var(--b1);transition:color .12s,background .12s;flex-shrink:0;';
    addLaneRow.innerHTML='<span>+</span><span>ADD LANE</span>';
    addLaneRow.addEventListener('click',()=>_pub('ui:lane_add',{name:'Track',icon:'♪',color:'#00d4ff'}));
    addLaneRow.addEventListener('mouseenter',()=>{addLaneRow.style.color='var(--accent)';addLaneRow.style.background='rgba(0,255,136,.04)';});
    addLaneRow.addEventListener('mouseleave',()=>{addLaneRow.style.color='var(--dim)';addLaneRow.style.background='';});

    wrap.appendChild(hdr); wrap.appendChild(rulerRow); wrap.appendChild(lanesScroll); wrap.appendChild(addLaneRow);
    content.appendChild(wrap);

    let _pxPerSec=80, _offset=0, _laneEls={};

    function drawRuler(cursor=0) {
      const rect=rulerMarks.getBoundingClientRect(); const W=rect.width,H=rect.height; if(!W) return;
      rulerCvs.width=W; rulerCvs.height=H;
      const ctx=rulerCvs.getContext('2d');
      const accent=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#00ff88';
      ctx.clearRect(0,0,W,H);
      const beatSec=60/KERNEL.clock.BPM, barSec=beatSec*4;
      let t=Math.floor(_offset/barSec)*barSec;
      ctx.font='6.5px "Share Tech Mono",monospace'; ctx.textBaseline='middle';
      while(t<=_offset+W/_pxPerSec+barSec){
        const x=(t-_offset)*_pxPerSec;
        ctx.strokeStyle='rgba(42,60,88,.8)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
        for(let b=1;b<4;b++){const bx=x+b*beatSec*_pxPerSec;ctx.strokeStyle='rgba(42,60,88,.35)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(bx,H*.5);ctx.lineTo(bx,H);ctx.stroke();}
        ctx.fillStyle=accent; ctx.fillText(`${Math.round(t/barSec)+1}`,x+3,H/2);
        t+=barSec;
      }
      const phX=(cursor-_offset)*_pxPerSec;
      ctx.strokeStyle=accent; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(phX,0); ctx.lineTo(phX,H); ctx.stroke();
    }

    rulerMarks.addEventListener('click',e=>{
      const r=rulerMarks.getBoundingClientRect();
      const sec=Math.max(0,_offset+(e.clientX-r.left)/_pxPerSec);
      _pub('ui:ruler_click',{position_sec:sec});
    });
    rulerMarks.addEventListener('wheel',e=>{
      e.preventDefault();
      _pxPerSec=Math.max(20,Math.min(400,_pxPerSec*(e.deltaY<0?1.12:.9)));
      _pub('ui:zoom_change',{px_per_sec:_pxPerSec});
    },{passive:false});

    function addLaneEl(lane) {
      if(_laneEls[lane.laneId]) return;
      emptyHint.style.display='none';
      const laneEl=document.createElement('div'); laneEl.style.cssText='display:flex;height:34px;border-bottom:1px solid var(--b1);';
      const lbl=document.createElement('div'); lbl.style.cssText='width:88px;min-width:88px;background:var(--bg2);border-right:1px solid var(--b1);display:flex;align-items:center;padding:0 7px;gap:4px;flex-shrink:0;overflow:hidden;';
      lbl.innerHTML=`<span style="font-size:11px;flex-shrink:0;">${lane.icon}</span><span style="font-family:var(--mono);font-size:7px;color:var(--dim2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${lane.name}</span>`;
      const xBtn=document.createElement('span'); xBtn.textContent='×'; xBtn.style.cssText='font-size:9px;color:var(--dim);cursor:pointer;flex-shrink:0;transition:color .12s;';
      xBtn.addEventListener('mouseenter',()=>xBtn.style.color='var(--accent3)');
      xBtn.addEventListener('mouseleave',()=>xBtn.style.color='var(--dim)');
      xBtn.addEventListener('click',()=>{_pub('ui:lane_remove',{laneId:lane.laneId});laneEl.remove();delete _laneEls[lane.laneId];});
      lbl.appendChild(xBtn);
      const body=document.createElement('div'); body.style.cssText='flex:1;position:relative;overflow:hidden;cursor:crosshair;';
      body.addEventListener('click',e=>{
        if(e.target.closest('.tl-clip')) return;
        const r=body.getBoundingClientRect();
        const sec=_offset+(e.clientX-r.left)/_pxPerSec;
        _pub('ui:clip_place',{laneId:lane.laneId,position_sec:sec,name:lane.name});
      });
      body.addEventListener('dragover',e=>e.preventDefault());
      body.addEventListener('drop',async e=>{
        e.preventDefault(); e.stopPropagation();
        const files=e.dataTransfer.files; if(!files.length) return;
        const results=await Intake.ingestAll(files,KERNEL.bus);
        results.filter(r=>r.id==='audio:sample').forEach(r=>{
          const rect=body.getBoundingClientRect();
          const sec=_offset+(e.clientX-rect.left)/_pxPerSec;
          _pub('ui:clip_place',{laneId:lane.laneId,position_sec:sec,name:r.name,assetId:r.hash});
          addClipEl(body,lane,{clipId:'c-'+Math.random().toString(36).slice(2),name:r.name,startSec:sec,durSec:4,color:lane.color,arrayBuffer:r.arrayBuffer});
        });
      });
      laneEl.appendChild(lbl); laneEl.appendChild(body);
      lanesWrap.insertBefore(laneEl,playheadEl);
      _laneEls[lane.laneId]={laneEl,body};
    }

    function addClipEl(body,lane,clip) {
      const el=document.createElement('div'); el.className='tl-clip';
      el.dataset.start=clip.startSec; el.dataset.dur=clip.durSec||4;
      el.style.cssText=`position:absolute;top:3px;height:28px;border-radius:3px;cursor:grab;display:flex;align-items:center;padding:0 6px;overflow:hidden;border:1px solid ${(clip.color||'#00d4ff')}44;background:${(clip.color||'#00d4ff')}18;min-width:16px;transition:border-color .1s;`;
      const wave=document.createElement('canvas'); wave.style.cssText='position:absolute;inset:0;border-radius:3px;opacity:.38;pointer-events:none;width:100%;height:100%;';
      const lbl=document.createElement('span'); lbl.style.cssText='font-family:var(--mono);font-size:6.5px;color:rgba(255,255,255,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;z-index:1;'; lbl.textContent=clip.name||'';
      const xBtn=document.createElement('span'); xBtn.textContent='×'; xBtn.style.cssText='position:absolute;right:3px;font-size:9px;color:rgba(255,255,255,.5);cursor:pointer;display:none;';
      xBtn.addEventListener('click',e=>{e.stopPropagation();_pub('ui:clip_remove',{clipId:el.dataset.clipId});el.remove();});
      el.addEventListener('mouseenter',()=>{el.style.borderColor=clip.color||'#00d4ff';xBtn.style.display='block';});
      el.addEventListener('mouseleave',()=>{el.style.borderColor=(clip.color||'#00d4ff')+'44';xBtn.style.display='none';});
      el.appendChild(wave); el.appendChild(lbl); el.appendChild(xBtn);
      el.dataset.clipId=clip.clipId||'';
      posClip(el); body.appendChild(el);
      if(clip.arrayBuffer){ const AC=KERNEL.audio.AC||KERNEL.audio.boot(); AC.decodeAudioData(clip.arrayBuffer.slice(0)).then(ab=>{const W=200,H=28;wave.width=W;wave.height=H;const ctx=wave.getContext('2d');ctx.strokeStyle=clip.color||'#00d4ff';ctx.lineWidth=1;ctx.beginPath();const data=ab.getChannelData(0),step=Math.ceil(data.length/W);for(let i=0;i<W;i++){let m=0;for(let j=0;j<step;j++)m=Math.max(m,Math.abs(data[i*step+j]||0));const h=m*H*.44;ctx.moveTo(i,H/2-h);ctx.lineTo(i,H/2+h);}ctx.stroke();}).catch(()=>{}); }
      let _cd=false,_csx=0,_css=0;
      el.addEventListener('pointerdown',e=>{if(e.target===xBtn)return;_cd=true;_csx=e.clientX;_css=parseFloat(el.dataset.start);el.setPointerCapture(e.pointerId);el.classList.add('selected');el.style.cursor='grabbing';e.stopPropagation();});
      el.addEventListener('pointermove',e=>{if(!_cd)return;const s=Math.max(0,_css+(e.clientX-_csx)/_pxPerSec);el.dataset.start=s;_pub('ui:clip_move',{clipId:el.dataset.clipId,position_sec:s});posClip(el);});
      el.addEventListener('pointerup',()=>{_cd=false;el.style.cursor='grab';el.classList.remove('selected');});
    }

    function posClip(el) {
      const s=parseFloat(el.dataset.start),d=parseFloat(el.dataset.dur)||4;
      el.style.left=(s-_offset)*_pxPerSec+'px';
      el.style.width=Math.max(16,d*_pxPerSec)+'px';
    }

    function reposAll() { document.querySelectorAll('.tl-clip').forEach(posClip); }

    sBus.subscribe('org:clip_sync',({lanes,clips,pxPerSec:px,offset,cursor,bpm})=>{
      if(px) _pxPerSec=px; if(offset!==undefined) _offset=offset;
      if(bpm) bpmVal.textContent=bpm;
      lanes.forEach(l=>addLaneEl(l));
      drawRuler(cursor||0);
    });
    sBus.subscribe('org:playhead_update',({position_sec,bar,beat})=>{
      const W=rulerMarks.offsetWidth;
      const phX=88+(position_sec-_offset)*_pxPerSec;
      playheadEl.style.left=phX+'px';
      const m=Math.floor(position_sec/60),s=Math.floor(position_sec%60),ms=Math.round((position_sec%1)*1000);
      timeEl.textContent=`${m}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;
      if(phX>W*.82){_offset=position_sec-W*.2/_pxPerSec;reposAll();}
      drawRuler(position_sec);
    });
    sBus.subscribe('org:asset_loaded',({laneId,assetId,arrayBuffer,name})=>{
      const laneData=_laneEls[laneId];
      if(laneData && arrayBuffer) addClipEl(laneData.body,{laneId,color:'#00d4ff'},{clipId:'c-'+assetId,name,startSec:0,durSec:4,arrayBuffer,color:'#00d4ff'});
    });
    sBus.subscribe('org:state_sync',({playing:p})=>{
      if(p===undefined) return; playing=p; btnPlay.textContent=p?'⏸':'▶'; btnPlay.dataset.on=p?'1':''; btnPlay.style.color=p?'var(--accent)':'var(--dim2)'; btnPlay.style.borderColor=p?'var(--accent)':'var(--b2)';
    });

    window.addEventListener('resize', ()=>drawRuler());
    requestAnimationFrame(()=>drawRuler());
  },
});

/* ═══════════════════════════════════════════════════════
   SAMPLE PLAYER
═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   SAMPLE PLAYER — waveform is the entire interface
   No knobs underneath. Everything happens on the canvas.
   Drag start/end handles directly on the waveform.
   Pitch bends by dragging vertically on the clip.
   Playhead scrubs on click.
═══════════════════════════════════════════════════════ */
reg('sample-player', {
  category:'Audio — Playback', summary:'Single-sample player with scrub and loop controls.', needs:[],
  label:'Sample', icon:'🎵', accent:'#aa44ff',
  width:420, height:280, minWidth:320, minHeight:220,
  mountEngine(instanceId, intakeResult, sBus) {
    SamplePlayerOrganism.mount(instanceId, sBus, KERNEL.audio, {}, intakeResult||null);
  },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const root = document.createElement('div');
    root.style.cssText = 'display:flex;flex-direction:column;height:100%;background:var(--bg0);position:relative;';

    /* ── Name bar ── */
    const namebar = document.createElement('div');
    namebar.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 10px;border-bottom:1px solid var(--b1);flex-shrink:0;background:var(--bg2);';
    const nameEl = document.createElement('div');
    nameEl.style.cssText = 'font-family:var(--mono);font-size:8px;color:var(--accent4);letter-spacing:.1em;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    nameEl.textContent = intakeResult?.name || '⬇  drop audio here';

    /* Reverse + Loop pills */
    function mkPill(label, color, onToggle) {
      const p = document.createElement('div');
      p.style.cssText = `padding:2px 8px;border-radius:10px;border:1px solid ${color}44;font-family:var(--mono);font-size:6.5px;color:${color}44;letter-spacing:.1em;cursor:pointer;transition:all .18s;flex-shrink:0;`;
      p.textContent = label;
      let on = false;
      p.addEventListener('click', () => {
        on = !on;
        p.style.color       = on ? color : color+'44';
        p.style.borderColor = on ? color : color+'44';
        p.style.background  = on ? color+'18' : 'transparent';
        onToggle(on);
      });
      return p;
    }
    const loopPill    = mkPill('LOOP',    '#aa44ff', v => _pub('ui:config_change', { key:'loop',    value:v }));
    const reversePill = mkPill('REVERSE', '#ff2266', v => _pub('ui:config_change', { key:'reverse', value:v }));

    namebar.appendChild(nameEl);
    namebar.appendChild(loopPill);
    namebar.appendChild(reversePill);

    /* ── Main waveform canvas — fills all remaining space ── */
    const canvasWrap = document.createElement('div');
    canvasWrap.style.cssText = 'flex:1;position:relative;overflow:hidden;cursor:crosshair;';
    canvasWrap.title = 'Drag to scrub · drag handles to set start/end · drag up/down for pitch';
    const cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    canvasWrap.appendChild(cvs);

    /* Handle overlays — positioned absolutely on the canvas */
    function mkHandle(color, side) {
      const h = document.createElement('div');
      h.style.cssText = `position:absolute;top:0;bottom:0;width:3px;background:${color};cursor:ew-resize;z-index:10;opacity:.8;transition:opacity .1s;`;
      h.style[side] = 'auto';
      const cap = document.createElement('div');
      cap.style.cssText = `position:absolute;top:50%;transform:translateY(-50%);width:10px;height:20px;border-radius:${side==='left'?'0 3px 3px 0':'3px 0 0 3px'};background:${color};${side==='left'?'left:3px':'right:3px'};`;
      h.appendChild(cap);
      h.addEventListener('mouseenter', () => h.style.opacity='1');
      h.addEventListener('mouseleave', () => h.style.opacity='.8');
      canvasWrap.appendChild(h);
      return h;
    }
    const startHandle = mkHandle('#aa44ff','left');
    const endHandle   = mkHandle('#ff2266','right');

    /* ── Transport bar ── */
    const transport = document.createElement('div');
    transport.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 10px;border-top:1px solid var(--b1);flex-shrink:0;background:var(--bg2);';

    const playBtn = document.createElement('button');
    playBtn.style.cssText = 'width:32px;height:32px;border-radius:50%;border:1.5px solid #aa44ff;background:rgba(170,68,255,.1);color:#aa44ff;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;outline:none;flex-shrink:0;';
    playBtn.textContent = '▶';
    playBtn.addEventListener('mouseenter', () => { playBtn.style.background='rgba(170,68,255,.25)'; playBtn.style.boxShadow='0 0 12px rgba(170,68,255,.4)'; });
    playBtn.addEventListener('mouseleave', () => { playBtn.style.background='rgba(170,68,255,.1)'; playBtn.style.boxShadow=''; });
    playBtn.addEventListener('click', () => { KERNEL.audio.boot(); _pub('ui:play_press', {}); });

    /* Pitch display — drag it */
    const pitchWrap = document.createElement('div');
    pitchWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:ns-resize;padding:0 6px;flex-shrink:0;';
    const pitchVal = document.createElement('div');
    pitchVal.style.cssText = 'font-family:var(--orb);font-size:14px;font-weight:700;color:#aa44ff;letter-spacing:.04em;min-width:36px;text-align:center;';
    pitchVal.textContent = '0st';
    const pitchLbl = document.createElement('div');
    pitchLbl.style.cssText = 'font-family:var(--mono);font-size:6px;color:var(--dim);letter-spacing:.12em;';
    pitchLbl.textContent = 'PITCH';
    pitchWrap.appendChild(pitchVal); pitchWrap.appendChild(pitchLbl);

    let _pd=false,_py=0,_pv=0;
    pitchWrap.addEventListener('pointerdown',e=>{ _pd=true;_py=e.clientY;_pv=_pitch;pitchWrap.setPointerCapture(e.pointerId); });
    pitchWrap.addEventListener('pointermove',e=>{ if(!_pd)return; _pitch=Math.max(-24,Math.min(24,_pv+Math.round((_py-e.clientY)*.2))); pitchVal.textContent=`${_pitch>0?'+':''}${_pitch}st`; _pub('ui:config_change',{key:'pitch',value:_pitch}); });
    pitchWrap.addEventListener('pointerup',()=>_pd=false);

    /* Gain bar */
    const gainWrap = document.createElement('div');
    gainWrap.style.cssText = 'flex:1;display:flex;align-items:center;gap:5px;';
    const gainLbl = document.createElement('div'); gainLbl.style.cssText='font-family:var(--mono);font-size:6.5px;color:var(--dim);letter-spacing:.1em;'; gainLbl.textContent='GAIN';
    const gainSlider = document.createElement('input'); gainSlider.type='range'; gainSlider.min=0; gainSlider.max=2; gainSlider.step=.01; gainSlider.value=1;
    gainSlider.style.cssText='flex:1;accent-color:#aa44ff;height:3px;cursor:pointer;';
    gainSlider.addEventListener('input', () => _pub('ui:config_change',{key:'gain',value:+gainSlider.value}));
    gainWrap.appendChild(gainLbl); gainWrap.appendChild(gainSlider);

    /* Time display */
    const timeEl = document.createElement('div');
    timeEl.style.cssText = 'font-family:var(--mono);font-size:7.5px;color:var(--dim2);letter-spacing:.06em;min-width:52px;text-align:right;flex-shrink:0;';
    timeEl.textContent = '0.00s';

    transport.appendChild(playBtn);
    transport.appendChild(pitchWrap);
    transport.appendChild(gainWrap);
    transport.appendChild(timeEl);

    root.appendChild(namebar);
    root.appendChild(canvasWrap);
    root.appendChild(transport);
    content.appendChild(root);

    /* ── Drop audio onto canvas ── */
    canvasWrap.addEventListener('dragover', e => { e.preventDefault(); cvs.style.outline='2px solid #aa44ff'; });
    canvasWrap.addEventListener('dragleave', () => cvs.style.outline='');
    canvasWrap.addEventListener('drop', async e => {
      e.preventDefault(); cvs.style.outline='';
      const results = await Intake.ingestAll(e.dataTransfer.files, KERNEL.bus);
      const audio = results.find(r => r.id === 'audio:sample');
      if (audio) KERNEL.bus.publish('intake:file', { ...audio, _targetInstanceId: instanceId });
    });

    /* ── State ── */
    let _peaks    = [];
    let _start    = 0;   /* normalized 0-1 */
    let _end      = 1;
    let _pitch    = 0;
    let _playhead = 0;
    let _playing  = false;
    let _duration = 0;
    let _dragging = null; /* 'start'|'end'|'scrub'|null */

    /* ── Canvas rendering ── */
    function draw() {
      requestAnimationFrame(draw);
      const W = cvs.offsetWidth, H = cvs.offsetHeight;
      if (!W || !H) return;
      if (cvs.width !== W || cvs.height !== H) { cvs.width = W; cvs.height = H; }
      const ctx = cvs.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      /* Background */
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, W, H);

      if (!_peaks.length) {
        /* Empty state — drop zone */
        ctx.strokeStyle = 'rgba(170,68,255,.2)';
        ctx.setLineDash([6,6]); ctx.lineWidth = 1;
        ctx.strokeRect(8, 8, W-16, H-16);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(170,68,255,.3)';
        ctx.font = '8px "Share Tech Mono",monospace'; ctx.textAlign='center';
        ctx.fillText('DROP AUDIO', W/2, H/2-8);
        ctx.fillStyle = 'rgba(170,68,255,.15)';
        ctx.font = '24px sans-serif';
        ctx.fillText('⬇', W/2, H/2+16);
        return;
      }

      const startX = _start * W;
      const endX   = _end   * W;

      /* Dimmed regions outside start/end */
      ctx.fillStyle = 'rgba(0,0,0,.55)';
      ctx.fillRect(0, 0, startX, H);
      ctx.fillRect(endX, 0, W-endX, H);

      /* Waveform — full width */
      const mid = H / 2;
      ctx.beginPath(); ctx.strokeStyle = 'rgba(170,68,255,.25)'; ctx.lineWidth = 1;
      _peaks.forEach((p, i) => {
        const x = (i / _peaks.length) * W;
        const h = p * mid * 0.85;
        ctx.moveTo(x, mid - h); ctx.lineTo(x, mid + h);
      }); ctx.stroke();

      /* Active region waveform — bright */
      ctx.beginPath(); ctx.strokeStyle = '#aa44ff'; ctx.lineWidth = 1.5;
      _peaks.forEach((p, i) => {
        const x = (i / _peaks.length) * W;
        if (x < startX || x > endX) return;
        const h = p * mid * 0.9;
        ctx.moveTo(x, mid - h); ctx.lineTo(x, mid + h);
      }); ctx.stroke();

      /* Glow on active region */
      if (_playing) {
        ctx.save();
        ctx.shadowColor = '#aa44ff'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.strokeStyle = 'rgba(170,68,255,.15)'; ctx.lineWidth = 3;
        _peaks.forEach((p, i) => {
          const x = (i / _peaks.length) * W;
          if (x < startX || x > endX) return;
          const h = p * mid * 0.9;
          ctx.moveTo(x, mid - h); ctx.lineTo(x, mid + h);
        }); ctx.stroke();
        ctx.restore();
      }

      /* Center line */
      ctx.strokeStyle = 'rgba(170,68,255,.15)'; ctx.lineWidth = .5;
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();

      /* Start handle line */
      ctx.strokeStyle = '#aa44ff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(startX, 0); ctx.lineTo(startX, H); ctx.stroke();

      /* End handle line */
      ctx.strokeStyle = '#ff2266'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(endX, 0); ctx.lineTo(endX, H); ctx.stroke();

      /* Handle caps */
      ctx.fillStyle = '#aa44ff';
      ctx.fillRect(startX, mid-12, 8, 24);
      ctx.fillStyle = '#ff2266';
      ctx.fillRect(endX-8, mid-12, 8, 24);

      /* Handle labels */
      ctx.fillStyle = '#aa44ff'; ctx.font = '6px "Share Tech Mono",monospace'; ctx.textAlign = 'left';
      ctx.fillText(`${(_start*100).toFixed(0)}%`, startX+10, mid-4);
      ctx.fillStyle = '#ff2266'; ctx.textAlign = 'right';
      ctx.fillText(`${(_end*100).toFixed(0)}%`, endX-10, mid-4);

      /* Playhead */
      if (_playing || _playhead > 0) {
        const phX = (_start + _playhead * (_end - _start)) * W;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.globalAlpha = .8;
        ctx.beginPath(); ctx.moveTo(phX, 0); ctx.lineTo(phX, H); ctx.stroke();
        ctx.globalAlpha = 1;
        /* Triangle cap */
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(phX-4, 0); ctx.lineTo(phX+4, 0); ctx.lineTo(phX, 8); ctx.fill();
      }

      /* Position DOM handles */
      startHandle.style.left = startX + 'px';
      endHandle.style.left   = (endX - 3) + 'px';
    }
    draw();

    /* ── Pointer interaction on canvas ── */
    function _pxToNorm(e) {
      const r = canvasWrap.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    }

    const HANDLE_THRESH = 12; /* px */
    canvasWrap.addEventListener('pointerdown', e => {
      const r   = canvasWrap.getBoundingClientRect();
      const x   = e.clientX - r.left;
      const W   = r.width;
      const sX  = _start * W;
      const eX  = _end   * W;
      if (Math.abs(x - sX) < HANDLE_THRESH)      _dragging = 'start';
      else if (Math.abs(x - eX) < HANDLE_THRESH) _dragging = 'end';
      else                                         _dragging = 'scrub';
      canvasWrap.setPointerCapture(e.pointerId);
    });

    canvasWrap.addEventListener('pointermove', e => {
      if (!_dragging) return;
      const n = _pxToNorm(e);
      if (_dragging === 'start') {
        _start = Math.max(0, Math.min(_end - 0.01, n));
        _pub('ui:config_change', { key:'start', value:_start });
      } else if (_dragging === 'end') {
        _end = Math.max(_start + 0.01, Math.min(1, n));
        _pub('ui:config_change', { key:'end', value:_end });
      } else {
        /* Scrub — seek playhead */
        const pos = Math.max(0, Math.min(1, (n - _start) / Math.max(0.001, _end - _start)));
        _pub('ui:scrub', { position: pos });
      }
    });
    canvasWrap.addEventListener('pointerup', () => { _dragging = null; });

    /* Click to play/stop */
    canvasWrap.addEventListener('click', e => {
      if (_dragging) return;
      KERNEL.audio.boot();
      _pub('ui:play_press', {});
    });

    /* ── Engine state ── */
    sBus.subscribe('org:waveform_ready', ({ peaks, duration_sec, name }) => {
      _peaks    = peaks;
      _duration = duration_sec;
      nameEl.textContent = name;
      timeEl.textContent = `${duration_sec.toFixed(2)}s`;
    });

    sBus.subscribe('org:playhead_update', ({ position_normalized }) => {
      _playhead = position_normalized;
    });

    sBus.subscribe('org:state_sync', ({ playing, name, duration_sec }) => {
      if (playing !== undefined) {
        _playing = playing;
        playBtn.textContent  = playing ? '⏸' : '▶';
        playBtn.style.borderColor = playing ? '#00ff88' : '#aa44ff';
        playBtn.style.color       = playing ? '#00ff88' : '#aa44ff';
        playBtn.style.background  = playing ? 'rgba(0,255,136,.15)' : 'rgba(170,68,255,.1)';
        if (playing && playBtn.style.boxShadow !== undefined) {
          playBtn.style.boxShadow = playing ? '0 0 12px rgba(0,255,136,.4)' : '';
        }
      }
      if (name) nameEl.textContent = name;
      if (duration_sec) { _duration = duration_sec; timeEl.textContent = `${duration_sec.toFixed(2)}s`; }
    });
  },
});

reg('lfo', {
  category:'Audio — Modulation', summary:'Low-frequency oscillator for modulating other organisms\' parameters.', needs:[],
  label:'LFO', icon:'〰', accent:'#aa44ff',
  width:230, height:270, minWidth:190, minHeight:220,
  mountEngine(instanceId, intakeResult, sBus) { LFOEngine.mount(instanceId, sBus, KERNEL.audio, {}); },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='padding:10px;display:flex;flex-direction:column;gap:8px;height:100%;';
    mkSelect(wrap,{label:'SHAPE',options:['sine','triangle','square','sawtooth','S&H'],value:'sine',eventKey:'shape',pub:_pub});
    const kRow=document.createElement('div'); kRow.style.cssText='display:flex;gap:8px;justify-content:center;';
    let rate=4,depth=.5;
    const rateK =mkKnob(kRow,{label:'RATE', min:.01,max:32, value:4,  step:.01,unit:'Hz',onChange:v=>rate=v});
    const depthK=mkKnob(kRow,{label:'DEPTH',min:0,  max:1,  value:.5, step:.01,unit:'',  onChange:v=>depth=v});
    mkKnob(kRow,{label:'PHASE',min:0,max:360,value:0,step:1,unit:'°'});
    wrap.appendChild(kRow);
    const scope=document.createElement('div'); scope.style.cssText='width:100%;height:52px;border-radius:4px;background:var(--bg2);border:1px solid var(--b1);overflow:hidden;position:relative;flex-shrink:0;';
    const cvs=document.createElement('canvas'); cvs.width=200;cvs.height=52;cvs.style.cssText='position:absolute;inset:0;width:100%;height:100%;'; scope.appendChild(cvs);
    mkToggle(wrap,{label:'BPM SYNC',value:false});
    mkToggle(wrap,{label:'BIPOLAR', value:true});
    wrap.appendChild(scope);
    content.appendChild(wrap);
    let shape='sine',ph=0;
    const ctx=cvs.getContext('2d');
    function draw(){ requestAnimationFrame(draw); ctx.clearRect(0,0,200,52); ctx.strokeStyle='rgba(170,68,255,.5)'; ctx.lineWidth=1.5; ctx.beginPath(); for(let x=0;x<200;x++){const t=(x/200)*Math.PI*4+ph;let y=shape==='sine'?Math.sin(t):shape==='triangle'?(2/Math.PI)*Math.asin(Math.sin(t)):shape==='square'?Math.sign(Math.sin(t)):shape==='sawtooth'?(t%(2*Math.PI))/Math.PI-1:(Math.random()*2-1)*.3+(Math.sin(t)*.7);const py=26+y*depth*18; x===0?ctx.moveTo(x,py):ctx.lineTo(x,py);} ctx.stroke(); ph+=rate*.01; }
    draw();
    KERNEL.bus.subscribe('ui:config_change',({key,value})=>{if(key==='shape')shape=value;});
  },
});

/* ═══════════════════════════════════════════════════════
   WOBBLE BASS
═══════════════════════════════════════════════════════ */
reg('wobble-bass', {
  category:'Audio — Bass Synths', summary:'Filter-wobble bass synth voice.', needs:[],
  label:'Wobble Bass', icon:'🔊', accent:'#ff2266',
  width:270, height:330, minWidth:220, minHeight:270,
  mountEngine(instanceId, intakeResult, sBus) { WobbleBassEngine.mount(instanceId, sBus, KERNEL.audio, {}); },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='padding:10px;display:flex;flex-direction:column;gap:8px;height:100%;';
    const kRow=document.createElement('div'); kRow.style.cssText='display:flex;gap:6px;justify-content:center;flex-wrap:wrap;';
    mkKnob(kRow,{label:'PITCH', min:20, max:200,  value:110,step:1,  unit:'Hz',eventKey:'freq',  pub:_pub});
    mkKnob(kRow,{label:'CUTOFF',min:100,max:4000, value:600,step:10, unit:'Hz',eventKey:'cutoff',pub:_pub});
    mkKnob(kRow,{label:'RES',   min:.5, max:20,   value:4,  step:.1, unit:'',  eventKey:'res',   pub:_pub});
    mkKnob(kRow,{label:'RATE',  min:.5, max:16,   value:4,  step:.1, unit:'Hz',eventKey:'rate',  pub:_pub});
    mkKnob(kRow,{label:'DEPTH', min:100,max:3000, value:600,step:10, unit:'',  eventKey:'depth', pub:_pub});
    mkKnob(kRow,{label:'DRIVE', min:0,  max:1,    value:.4, step:.01,unit:'', eventKey:'drive',  pub:_pub});
    mkDiv(wrap);
    mkScope(wrap,{height:44,color:'rgba(255,34,102,.45)'});
    mkDiv(wrap);
    const btnRow=document.createElement('div'); btnRow.style.cssText='display:flex;gap:6px;';
    mkBtn(btnRow,'▶ HIT', ()=>_pub('ui:wobble_trigger',{vel:1}), {h:24,fs:8});
    const activeBtn=mkToggle(wrap,{label:'ACTIVE (SUSTAIN)',value:false,onChange:()=>_pub('ui:wobble_toggle',{})});
    wrap.appendChild(btnRow);
    mkSelect(wrap,{label:'WAVE',options:['sawtooth','square','triangle'],value:'sawtooth',eventKey:'waveform',pub:_pub});
    wrap.appendChild(kRow);
    content.appendChild(wrap);
    /* pad:trigger→wobble is wired inside WobbleBassEngine itself.
       ACTIVE now genuinely starts/stops the continuous LFO'd oscillator
       via ui:wobble_toggle instead of firing one dead 0.9s one-shot. */
  },
});

/* ═══════════════════════════════════════════════════════
   ACID SYNTH, REESE BASS, CHANNEL, XY PAD — compact versions
═══════════════════════════════════════════════════════ */
reg('acid-synth', {
  category:'Audio — Bass Synths', summary:'303-style acid bass synth with slide and accent.', needs:[],
  label:'Acid Synth', icon:'⚡', accent:'#00ff88',
  width:250, height:300, minWidth:210, minHeight:240,
  mountEngine(instanceId, intakeResult, sBus) { AcidSynthEngine.mount(instanceId, sBus, KERNEL.audio, {}); },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='padding:10px;display:flex;flex-direction:column;gap:8px;height:100%;';
    const kRow=document.createElement('div'); kRow.style.cssText='display:flex;gap:6px;justify-content:center;flex-wrap:wrap;';
    mkKnob(kRow,{label:'PITCH', min:24, max:84,  value:45, step:1,  unit:'st',eventKey:'pitch', pub:_pub});
    mkKnob(kRow,{label:'CUTOFF',min:100,max:8000,value:300,step:10, unit:'Hz',eventKey:'cutoff',pub:_pub});
    mkKnob(kRow,{label:'RES',   min:0,  max:30,  value:6,  step:.5, unit:'',  eventKey:'res',   pub:_pub});
    mkKnob(kRow,{label:'ENV',   min:0,  max:1,   value:.4, step:.01,unit:'',  eventKey:'env',   pub:_pub});
    mkKnob(kRow,{label:'DECAY', min:.01,max:2,   value:.3, step:.01,unit:'s', eventKey:'decay', pub:_pub});
    mkScope(wrap,{height:44,color:'rgba(0,255,136,.4)'});
    mkDiv(wrap);
    const btnRow=document.createElement('div'); btnRow.style.cssText='display:flex;gap:6px;';
    mkBtn(btnRow,'▶ TRIGGER', ()=>_pub('ui:acid_trigger',{vel:1}), {h:24,fs:8});
    wrap.appendChild(btnRow);
    mkToggle(wrap,{label:'ACCENT',value:false,eventKey:'accent',pub:_pub});
    mkToggle(wrap,{label:'GLIDE', value:false,eventKey:'glide', pub:_pub});
    mkSelect(wrap,{label:'WAVE',options:['sawtooth','square'],value:'sawtooth',eventKey:'wave',pub:_pub});
    wrap.appendChild(kRow); content.appendChild(wrap);
    /* Note: pad:trigger→acid is wired inside AcidSynthEngine itself
       (mounted above). No shortcut re-triggering here — that used to
       double-fire the voice through window.PadsOrganism.VOICES.acid
       in addition to the engine's own trigger. */
  },
});

reg('reese-bass', {
  category:'Audio — Bass Synths', summary:'Detuned-stack Reese bass synth.', needs:[],
  label:'Reese Bass', icon:'🔈', accent:'#ff2266',
  width:240, height:290, minWidth:200, minHeight:230,
  mountEngine(instanceId, intakeResult, sBus) { ReeseBassEngine.mount(instanceId, sBus, KERNEL.audio, {}); },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='padding:10px;display:flex;flex-direction:column;gap:8px;height:100%;';
    const kRow=document.createElement('div'); kRow.style.cssText='display:flex;gap:6px;justify-content:center;flex-wrap:wrap;';
    mkKnob(kRow,{label:'PITCH', min:20, max:120, value:55,step:1,  unit:'Hz',eventKey:'pitch', pub:_pub});
    mkKnob(kRow,{label:'DETUNE',min:0,  max:50,  value:10,step:.5, unit:'¢', eventKey:'detune',pub:_pub});
    mkKnob(kRow,{label:'CUTOFF',min:50, max:4000,value:400,step:10,unit:'Hz',eventKey:'cutoff', pub:_pub});
    mkKnob(kRow,{label:'SWEEP', min:.1, max:4,   value:.9, step:.05,unit:'s',eventKey:'sweep',  pub:_pub});
    mkKnob(kRow,{label:'GAIN',  min:0,  max:1,   value:.85,step:.01,unit:'', eventKey:'gain',   pub:_pub});
    mkScope(wrap,{height:44,color:'rgba(255,34,102,.4)'});
    mkDiv(wrap);
    const btnRow=document.createElement('div'); btnRow.style.cssText='display:flex;gap:6px;';
    mkBtn(btnRow,'▶ HIT', ()=>_pub('ui:reese_trigger',{vel:1}), {h:24,fs:8});
    const sustainBtn=mkBtn(btnRow,'◉ SUSTAIN', ()=>{
      sustainBtn.dataset.on = sustainBtn.dataset.on ? '' : '1';
      sustainBtn.style.borderColor = sustainBtn.dataset.on ? 'var(--accent)' : 'var(--b2)';
      sustainBtn.style.color = sustainBtn.dataset.on ? 'var(--accent)' : 'var(--dim2)';
      _pub('ui:reese_toggle',{});
    }, {h:24,fs:8});
    wrap.appendChild(btnRow);
    mkToggle(wrap,{label:'SUB OSC',value:true,eventKey:'sub',pub:_pub});
    wrap.appendChild(kRow); content.appendChild(wrap);
    /* pad:trigger→reese is wired inside ReeseBassEngine itself. */
  },
});

reg('channel', {
  category:'Audio — Mixing', summary:'Per-organism mixer channel: gain, pan, sends.', needs:[],
  label:'Channel', icon:'🎚', accent:'#6a88a8',
  width:160, height:380, minWidth:130, minHeight:280,
  mountEngine(instanceId, intakeResult, sBus) { ChannelEngine.mount(instanceId, sBus, KERNEL.audio, {}); },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;padding:8px;gap:6px;height:100%;';
    const lbl=document.createElement('div'); lbl.style.cssText='font-family:var(--mono);font-size:7px;letter-spacing:.14em;color:var(--dim2);'; lbl.textContent='CHANNEL';
    const meter=document.createElement('div'); meter.style.cssText='width:100%;height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;border:1px solid var(--b1);';
    const fill=document.createElement('div'); fill.style.cssText='height:100%;width:8%;border-radius:3px;background:linear-gradient(90deg,var(--accent),#aaff44);transition:width .05s;'; meter.appendChild(fill);
    const faderWrap=document.createElement('div'); faderWrap.style.cssText='flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;justify-content:center;';
    const fader=document.createElement('input'); fader.type='range'; fader.min=0; fader.max=1; fader.step=.01; fader.value=1;
    fader.style.cssText='writing-mode:vertical-lr;direction:rtl;width:4px;height:80px;accent-color:var(--accent);cursor:pointer;appearance:slider-vertical;';
    faderWrap.appendChild(fader);
    const kRow=document.createElement('div'); kRow.style.cssText='display:flex;gap:6px;justify-content:center;flex-wrap:wrap;';
    mkKnob(kRow,{label:'PAN',  min:-1,max:1,value:0, step:.01,unit:''});
    mkKnob(kRow,{label:'VERB', min:0, max:1,value:.2,step:.01,unit:''});
    mkKnob(kRow,{label:'DELAY',min:0, max:1,value:0, step:.01,unit:''});
    mkDiv(wrap);
    mkToggle(wrap,{label:'MUTE',value:false});
    mkToggle(wrap,{label:'SOLO',value:false});
    wrap.appendChild(lbl); wrap.appendChild(meter); wrap.appendChild(faderWrap); wrap.appendChild(kRow);
    content.appendChild(wrap);
    setInterval(()=>fill.style.width=(5+Math.random()*30)+'%',80);
  },
});

reg('xy-pad', {
  category:'Audio — Control', summary:'2D XY controller for mapping gestures to any parameter.', needs:[],
  label:'XY Ctrl', icon:'✛', accent:'#00d4ff',
  width:250, height:280, minWidth:200, minHeight:220,
  mountEngine(instanceId, intakeResult, sBus) { XYPadEngine.mount(instanceId, sBus, KERNEL.audio, {}); },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='padding:10px;display:flex;flex-direction:column;gap:8px;height:100%;';
    const selRow=document.createElement('div'); selRow.style.cssText='display:flex;gap:6px;';
    const xSel=document.createElement('select'); xSel.style.cssText='flex:1;background:var(--bg3);border:1px solid var(--b2);border-radius:3px;color:var(--white);font-family:var(--mono);font-size:7.5px;padding:2px 4px;outline:none;';
    const ySel=xSel.cloneNode();
    ['cutoff','pitch','rate','gain','depth','decay'].forEach(o=>{[xSel,ySel].forEach(s=>{const op=document.createElement('option');op.value=o;op.textContent=o;s.appendChild(op);});});
    ySel.value='depth'; selRow.appendChild(xSel); selRow.appendChild(ySel);
    const xy=document.createElement('div'); xy.style.cssText='flex:1;background:var(--bg2);border:1px solid var(--b1);border-radius:4px;position:relative;cursor:crosshair;min-height:100px;';
    const dot=document.createElement('div'); dot.style.cssText='position:absolute;width:10px;height:10px;border-radius:50%;background:var(--accent2);box-shadow:0 0 8px var(--accent2);transform:translate(-50%,-50%);pointer-events:none;left:50%;top:50%;';
    const ch=document.createElement('div'); ch.style.cssText='position:absolute;height:1px;left:0;right:0;top:50%;background:rgba(0,212,255,.12);pointer-events:none;';
    const cv=document.createElement('div'); cv.style.cssText='position:absolute;width:1px;top:0;bottom:0;left:50%;background:rgba(0,212,255,.12);pointer-events:none;';
    xy.appendChild(ch); xy.appendChild(cv); xy.appendChild(dot);
    let active=false;
    xy.addEventListener('pointerdown',e=>{active=true;xy.setPointerCapture(e.pointerId);_m(e);});
    xy.addEventListener('pointermove',e=>{if(!active)return;_m(e);});
    xy.addEventListener('pointerup',()=>active=false);
    function _m(e){const r=xy.getBoundingClientRect();const px=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));const py=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));dot.style.left=(px*100)+'%';dot.style.top=(py*100)+'%';ch.style.top=(py*100)+'%';cv.style.left=(px*100)+'%';KERNEL.bus.publish('mod:xy',{x:px,y:py,xDest:xSel.value,yDest:ySel.value});}
    wrap.appendChild(selRow); wrap.appendChild(xy);
    content.appendChild(wrap);
  },
});

/* ═══════════════════════════════════════════════════════
   NEXUS DIAGNOSTIC NODES — 7 separate organisms, one per
   NEXUS subsystem. No fabricated status: a card that can't
   be reached says UNREACHABLE, not a guess.

   Polling is NOT this card's own clock — it starts/stops with
   the global ▶ ⏺ transport bar (see nexus-node-core.js), so
   these stay agnostic the same way every audio organism reacts
   to seq:play/seq:stop instead of running its own timer.

   Diagnose routes through the Orchestrator for every node
   except the Orchestrator card itself, which diagnoses itself.
═══════════════════════════════════════════════════════ */
function _nexusCardUI(meta) {
  return function buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const root=document.createElement('div'); root.style.cssText='display:flex;flex-direction:column;height:100%;min-height:0;font-family:var(--mono);padding:8px;gap:6px;';

    const top=document.createElement('div'); top.style.cssText='display:flex;align-items:center;gap:5px;';
    const ic=document.createElement('span'); ic.textContent=meta.icon; ic.style.fontSize='11px';
    const lbl=document.createElement('span'); lbl.style.cssText=`font-size:7.5px;letter-spacing:.08em;color:${meta.accent};flex:1;font-weight:700;`; lbl.textContent=meta.label;
    const badge=document.createElement('span'); badge.style.cssText='font-size:6.5px;padding:2px 5px;border-radius:3px;letter-spacing:.06em;'; badge.textContent='CHECKING…';
    top.appendChild(ic); top.appendChild(lbl); top.appendChild(badge);

    const bar=document.createElement('div'); bar.style.cssText='height:3px;border-radius:2px;background:var(--bg3);overflow:hidden;flex-shrink:0;';
    const barFill=document.createElement('div'); barFill.style.cssText='height:100%;width:0%;background:var(--dim);transition:width .2s,background .2s;'; bar.appendChild(barFill);

    const body=document.createElement('div'); body.style.cssText='font-size:6.5px;color:var(--dim2);line-height:1.6;white-space:pre;flex:1;';

    const transportNote=document.createElement('div'); transportNote.style.cssText='font-size:6px;color:var(--dim);letter-spacing:.04em;';
    transportNote.textContent='waiting for ▶ PLAY (master transport)';

    const btnRow=document.createElement('div'); btnRow.style.cssText='display:flex;gap:4px;flex-wrap:wrap;';
    const diagBtn = mkBtn(null,'⚙ DIAGNOSE',   ()=>_pub('ui:diagnose',{}));
    const snapBtn = mkBtn(null,'▤ SNAPSHOTS',  ()=>_pub('ui:open-snapshots',{}));
    const ideaBtn = mkBtn(null,'✎ IDEARIUM',   ()=>_pub('ui:open-idearium',{}));
    btnRow.appendChild(diagBtn); btnRow.appendChild(snapBtn); btnRow.appendChild(ideaBtn);

    const diagResult=document.createElement('div'); diagResult.style.cssText='font-size:6px;color:var(--dim);line-height:1.5;white-space:pre;';

    root.appendChild(top); root.appendChild(bar); root.appendChild(body);
    root.appendChild(transportNote); root.appendChild(btnRow); root.appendChild(diagResult);
    content.appendChild(root);

    sBus.subscribe('org:state_sync', (s) => {
      if (s.online === null) {
        badge.textContent='CHECKING…'; badge.style.color='var(--dim)'; badge.style.background='var(--bg3)';
        barFill.style.width='30%'; barFill.style.background='var(--dim)';
        body.textContent=`PORT: ${meta.port}\nSTATUS: pending first check`;
      } else if (s.online) {
        badge.textContent='ONLINE'; badge.style.color='#00ff88'; badge.style.background='rgba(0,255,136,.12)';
        barFill.style.width='100%'; barFill.style.background='#00ff88';
        body.textContent=`PORT: ${meta.port}\nLATENCY: ${s.latencyMs}ms\nCHECKED: ${new Date(s.lastCheckedAt).toLocaleTimeString()}`;
      } else {
        badge.textContent='UNREACHABLE'; badge.style.color='#ff2266'; badge.style.background='rgba(255,34,102,.12)';
        barFill.style.width='100%'; barFill.style.background='#ff2266';
        body.textContent=`PORT: ${meta.port}\nERROR: ${s.error}\nCHECKED: ${new Date(s.lastCheckedAt).toLocaleTimeString()}`;
      }
      transportNote.textContent = s.playing
        ? (s.recording ? '⏺ recording — every poll logged to ledger' : '▶ live — polling on transport clock')
        : 'waiting for ▶ PLAY (master transport)';
      transportNote.style.color = s.recording ? '#ff2266' : (s.playing ? '#00ff88' : 'var(--dim)');
      diagBtn.disabled = !!s.diagnosing;
      diagBtn.textContent = s.diagnosing ? '⚙ DIAGNOSING…' : '⚙ DIAGNOSE';
      if (s.lastDiagnose) {
        const d=s.lastDiagnose;
        diagResult.textContent = d.ok
          ? `last diagnose: OK (${d.ms}ms) @ ${new Date(d.at).toLocaleTimeString()}`
          : `last diagnose: FAILED — ${d.error||'see response'} @ ${new Date(d.at).toLocaleTimeString()}`;
        diagResult.style.color = d.ok ? '#00ff88' : '#ff2266';
      }
    });
  };
}

reg('nexus-cortex', {
  label:'NEXUS_CORTEX', icon:'🧠', accent:'#00ff88',
  width:250, height:230, minWidth:200, minHeight:200,
  category:'NEXUS Diagnostic', summary:'Live status card for NEXUS subsystem on port 3748. Polling rides the global transport, not its own clock.',
  needs:[
    {key:'base', label:'CORTEX base URL', type:'url', default:'http://127.0.0.1:3748'},
    {key:'orchestratorBase', label:'Orchestrator base URL', type:'url', default:'http://127.0.0.1:9000'},
    {key:'diagnosePath', label:'Diagnose path', type:'string', default:'/diagnose'},
  ],
  mountEngine(instanceId, intakeResult, sBus, userConfig={}) { NexusCortexEngine.mount(instanceId, sBus, KERNEL.audio, userConfig); },
  buildUI: _nexusCardUI({label:'NEXUS_CORTEX', icon:'🧠', accent:'#00ff88', port:3748}),
});

reg('nexus-guardian', {
  label:'NEXUS_GUARDIAN', icon:'🛡️', accent:'#ffaa00',
  width:250, height:230, minWidth:200, minHeight:200,
  category:'NEXUS Diagnostic', summary:'Live status card for NEXUS subsystem on port 7820. Polling rides the global transport, not its own clock.',
  needs:[
    {key:'base', label:'GUARDIAN base URL', type:'url', default:'http://127.0.0.1:7820'},
    {key:'orchestratorBase', label:'Orchestrator base URL', type:'url', default:'http://127.0.0.1:9000'},
    {key:'diagnosePath', label:'Diagnose path', type:'string', default:'/diagnose'},
  ],
  mountEngine(instanceId, intakeResult, sBus, userConfig={}) { NexusGuardianEngine.mount(instanceId, sBus, KERNEL.audio, userConfig); },
  buildUI: _nexusCardUI({label:'NEXUS_GUARDIAN', icon:'🛡️', accent:'#ffaa00', port:7820}),
});

reg('nexus-bridge', {
  label:'NEXUS_BRIDGE', icon:'⬡', accent:'#00d4ff',
  width:250, height:230, minWidth:200, minHeight:200,
  category:'NEXUS Diagnostic', summary:'Live status card for NEXUS subsystem on port 9999. Polling rides the global transport, not its own clock.',
  needs:[
    {key:'base', label:'BRIDGE base URL', type:'url', default:'http://127.0.0.1:9999'},
    {key:'orchestratorBase', label:'Orchestrator base URL', type:'url', default:'http://127.0.0.1:9000'},
    {key:'diagnosePath', label:'Diagnose path', type:'string', default:'/diagnose'},
  ],
  mountEngine(instanceId, intakeResult, sBus, userConfig={}) { NexusBridgeEngine.mount(instanceId, sBus, KERNEL.audio, userConfig); },
  buildUI: _nexusCardUI({label:'NEXUS_BRIDGE', icon:'⬡', accent:'#00d4ff', port:9999}),
});

reg('nexus-orchestrator', {
  label:'ORCHESTRATOR', icon:'🌐', accent:'#ff2266',
  width:250, height:230, minWidth:200, minHeight:200,
  category:'NEXUS Diagnostic', summary:'Live status card for NEXUS subsystem on port 9000. Polling rides the global transport, not its own clock.',
  needs:[
    {key:'base', label:'ORCHESTRATOR base URL', type:'url', default:'http://127.0.0.1:9000'},
    {key:'orchestratorBase', label:'Orchestrator base URL', type:'url', default:'http://127.0.0.1:9000'},
    {key:'diagnosePath', label:'Diagnose path', type:'string', default:'/diagnose'},
  ],
  mountEngine(instanceId, intakeResult, sBus, userConfig={}) { NexusOrchestratorEngine.mount(instanceId, sBus, KERNEL.audio, userConfig); },
  buildUI: _nexusCardUI({label:'ORCHESTRATOR', icon:'🌐', accent:'#ff2266', port:9000}),
});

reg('nexus-diagnostic', {
  label:'DIAGNOSTIC', icon:'🩹', accent:'#aa44ff',
  width:250, height:230, minWidth:200, minHeight:200,
  category:'NEXUS Diagnostic', summary:'Live status card for NEXUS subsystem on port 7825. Polling rides the global transport, not its own clock.',
  needs:[
    {key:'base', label:'DIAGNOSTIC base URL', type:'url', default:'http://127.0.0.1:7825'},
    {key:'orchestratorBase', label:'Orchestrator base URL', type:'url', default:'http://127.0.0.1:9000'},
    {key:'diagnosePath', label:'Diagnose path', type:'string', default:'/diagnose'},
  ],
  mountEngine(instanceId, intakeResult, sBus, userConfig={}) { NexusDiagnosticEngine.mount(instanceId, sBus, KERNEL.audio, userConfig); },
  buildUI: _nexusCardUI({label:'DIAGNOSTIC', icon:'🩹', accent:'#aa44ff', port:7825}),
});

reg('nexus-architect', {
  label:'ARCHITECT', icon:'📐', accent:'#00ff88',
  width:250, height:230, minWidth:200, minHeight:200,
  category:'NEXUS Diagnostic', summary:'Live status card for NEXUS subsystem on port 3747. Polling rides the global transport, not its own clock.',
  needs:[
    {key:'base', label:'ARCHITECT base URL', type:'url', default:'http://127.0.0.1:3747'},
    {key:'orchestratorBase', label:'Orchestrator base URL', type:'url', default:'http://127.0.0.1:9000'},
    {key:'diagnosePath', label:'Diagnose path', type:'string', default:'/diagnose'},
  ],
  mountEngine(instanceId, intakeResult, sBus, userConfig={}) { NexusArchitectEngine.mount(instanceId, sBus, KERNEL.audio, userConfig); },
  buildUI: _nexusCardUI({label:'ARCHITECT', icon:'📐', accent:'#00ff88', port:3747}),
});

reg('nexus-idearium', {
  label:'IDEARIUM', icon:'💡', accent:'#ffaa00',
  width:250, height:230, minWidth:200, minHeight:200,
  category:'NEXUS Diagnostic', summary:'Live status card for NEXUS subsystem on port 4800. Polling rides the global transport, not its own clock.',
  needs:[
    {key:'base', label:'IDEARIUM base URL', type:'url', default:'http://127.0.0.1:4800'},
    {key:'orchestratorBase', label:'Orchestrator base URL', type:'url', default:'http://127.0.0.1:9000'},
    {key:'diagnosePath', label:'Diagnose path', type:'string', default:'/diagnose'},
  ],
  mountEngine(instanceId, intakeResult, sBus, userConfig={}) { NexusIdeariumEngine.mount(instanceId, sBus, KERNEL.audio, userConfig); },
  buildUI: _nexusCardUI({label:'IDEARIUM', icon:'💡', accent:'#ffaa00', port:4800}),
});

/* ── Scoped bus helper ──────────────────────────────────
   Engines publish to  org:EVENT:instanceId
   UI subscribes to    org:EVENT:instanceId
   Global topics (pad:trigger, seq:fire etc) remain global.
   This eliminates crosstalk between multiple instances. */
function _scopedBus(instanceId) {
  return {
    publish(topic, payload) {
      KERNEL.bus.publish(topic + ':' + instanceId, payload);
      /* also publish global for topics that need to be heard by other organisms */
      KERNEL.bus.publish(topic, { ...payload, _from: instanceId });
    },
    subscribe(topic, fn) {
      return KERNEL.bus.subscribe(topic + ':' + instanceId, fn);
    },
    /* global subscribe — for pad:trigger, seq:fire, midi:note etc */
    global: KERNEL.bus,
  };
}

/* ── Public spawn function ─────────────────────────────── */
function spawn(id, pos = {}, intakeResult = null, userConfig = {}) {
  const def = DEFS[id];
  if (!def) { console.warn('[ERAVOS] unknown organism:', id); return null; }

  const instanceId = id + '-' + KERNEL.uuid();
  const x = pos.x ?? 80, y = pos.y ?? 80;

  const win = CanvasWM.create({
    id: instanceId,
    title: def.label,
    x, y,
    width:    def.width    || 300,
    height:   def.height   || 380,
    minWidth:  def.minWidth  || 200,
    minHeight: def.minHeight || 160,
  });

  /* Accent bar */
  if (win.bar) win.bar.style.borderTop = `2px solid ${def.accent || 'var(--accent)'}`;

  /* Tag content with instanceId */
  win.content.dataset.instanceId = instanceId;

  const sBus = _scopedBus(instanceId);

  /* ── ORDER: UI first, engine second ────────────────────
     UI subscribes before engine fires initial state sync.
     _pub is passed as a local arg so every event handler
     closes over the scoped version permanently — no module
     variable mutation, no restore needed.               */

  const _scopedPub = (topic, payload) => KERNEL.bus.publish(topic + ':' + instanceId, payload);

  if (def.buildUI) def.buildUI(win.content, intakeResult, instanceId, sBus, _scopedPub);
  if (def.mountEngine) def.mountEngine(instanceId, intakeResult, sBus, userConfig);

  KERNEL.bus.publish('canvas:organism-spawned', { instanceId, id, label: def.label, icon: def.icon, accent: def.accent });

  return { win, instanceId };
}

function defs() { return Object.values(DEFS); }

/* ═══════════════════════════════════════════════════════
   EDM LAB — Tranki / dubstep / wubs / bass drop studio
═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   EDM LAB  — full production environment
   Three concurrent engines, each with its own unique interface:
     BASS ENGINE   — filter visualiser you interact with directly
     RHYTHM ENGINE — density-paint canvas (not a step grid)
     TENSION ENGINE — harmonic dissonance wheel + overtone display
   Drop trigger at the bottom fires everything simultaneously.
═══════════════════════════════════════════════════════ */
reg('edm-lab', {
  category:'Audio — Production', summary:'Full EDM build studio: bass, rhythm-density, and tension engines.', needs:[],
  label:'EDM Lab', icon:'⚡', accent:'#ff2266',
  width:860, height:620, minWidth:680, minHeight:500,
  mountEngine(instanceId, intakeResult, sBus) {
    EDMLabEngine.mount(instanceId, sBus, KERNEL.audio, {});
  },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {

    /* ─────────────────────────────────────────────────────
       ROOT LAYOUT
       Three columns side by side + drop bar at bottom.
    ───────────────────────────────────────────────────── */
    const root = document.createElement('div');
    root.style.cssText = 'display:flex;flex-direction:column;height:100%;background:var(--bg0);';

    const cols = document.createElement('div');
    cols.style.cssText = 'display:flex;flex:1;min-height:0;gap:1px;background:var(--b1);';

    /* ─────────────────────────────────────────────────────
       SHARED SECTION HEADER HELPER
    ───────────────────────────────────────────────────── */
    function mkSection(title, color, onToggle) {
      const wrap = document.createElement('div');
      wrap.style.cssText = `display:flex;flex-direction:column;flex:1;background:var(--bg1);min-width:0;`;

      const hdr = document.createElement('div');
      hdr.style.cssText = `display:flex;align-items:center;gap:7px;padding:7px 10px;border-bottom:1px solid var(--b1);flex-shrink:0;background:var(--bg2);`;

      const dot = document.createElement('div');
      dot.style.cssText = `width:7px;height:7px;border-radius:50%;background:${color};opacity:.4;flex-shrink:0;transition:opacity .2s,box-shadow .2s;cursor:pointer;`;
      dot.title = 'Toggle engine';
      dot.addEventListener('click', () => onToggle(dot));

      const lbl = document.createElement('div');
      lbl.style.cssText = `font-family:var(--orb);font-size:8px;font-weight:700;letter-spacing:.2em;color:${color};opacity:.7;`;
      lbl.textContent = title;

      const status = document.createElement('div');
      status.style.cssText = `font-family:var(--mono);font-size:6.5px;color:var(--dim);letter-spacing:.1em;margin-left:auto;`;
      status.textContent = 'OFF';

      hdr.appendChild(dot); hdr.appendChild(lbl); hdr.appendChild(status);
      wrap.appendChild(hdr);
      return { wrap, dot, status, color };
    }

    /* ═════════════════════════════════════════════════════
       COLUMN 1 — BASS ENGINE
       A filter frequency response curve you interact with.
       Drag the cutoff point on the curve itself.
       LFO makes the curve breathe live.
    ═════════════════════════════════════════════════════ */
    let bassRunning = false;

    const { wrap: bassWrap, dot: bassDot, status: bassStatus } = mkSection('BASS ENGINE', '#00ff88', (dot) => {
      bassRunning = !bassRunning;
      _pub('ui:bass-toggle', {});
      dot.style.opacity    = bassRunning ? '1' : '.4';
      dot.style.boxShadow  = bassRunning ? `0 0 8px #00ff88` : '';
      bassStatus.textContent = bassRunning ? 'ON' : 'OFF';
      bassStatus.style.color = bassRunning ? '#00ff88' : 'var(--dim)';
    });

    /* Filter curve canvas */
    const filterCanvas = document.createElement('canvas');
    filterCanvas.style.cssText = 'width:100%;flex:1;display:block;cursor:crosshair;';
    bassWrap.appendChild(filterCanvas);

    /* Bass params below canvas */
    const bassParams = document.createElement('div');
    bassParams.style.cssText = 'display:flex;flex-direction:column;gap:5px;padding:8px;border-top:1px solid var(--b1);flex-shrink:0;';

    /* Mini param rows */
    function mkParamRow(label, min, max, val, step, unit, color, onInput) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:7px;';
      const lbl = document.createElement('div');
      lbl.style.cssText = `font-family:var(--mono);font-size:6.5px;color:var(--dim2);letter-spacing:.1em;min-width:44px;flex-shrink:0;`;
      lbl.textContent = label;
      const slider = document.createElement('input');
      slider.type = 'range'; slider.min = min; slider.max = max; slider.step = step; slider.value = val;
      slider.style.cssText = `flex:1;accent-color:${color};height:3px;cursor:pointer;`;
      const valEl = document.createElement('div');
      valEl.style.cssText = `font-family:var(--mono);font-size:6.5px;color:${color};min-width:32px;text-align:right;`;
      valEl.textContent = `${val}${unit}`;
      slider.addEventListener('input', () => {
        valEl.textContent = `${slider.value}${unit}`;
        onInput(+slider.value);
      });
      row.appendChild(lbl); row.appendChild(slider); row.appendChild(valEl);
      bassParams.appendChild(row);
      return slider;
    }

    const freqSlider  = mkParamRow('FREQ',   20,  220, 55,  1,   'Hz','#00ff88', v => _pub('ui:bass-param', { key:'freq',     val:v }));
    const cutSlider   = mkParamRow('CUTOFF', 80, 4000, 600, 10,  'Hz','#00ff88', v => _pub('ui:bass-param', { key:'cutoff',   val:v }));
    const resSlider   = mkParamRow('RES',    0.5, 20,  8,   0.5, '',  '#00ff88', v => _pub('ui:bass-param', { key:'res',      val:v }));
    const rateSlider  = mkParamRow('LFO Hz', 0.1, 16,  4,   0.1, 'Hz','#00d4ff', v => _pub('ui:bass-param', { key:'lfoRate',  val:v }));
    const depthSlider = mkParamRow('DEPTH',  0,  2000, 800, 10,  '',  '#00d4ff', v => _pub('ui:bass-param', { key:'lfoDepth', val:v }));
    const driveSlider = mkParamRow('DRIVE',  0,   1,   0.5, 0.01,'',  '#ff2266', v => _pub('ui:bass-param', { key:'drive',    val:v }));

    /* Waveform selector */
    const waveRow = document.createElement('div');
    waveRow.style.cssText = 'display:flex;gap:3px;';
    ['sawtooth','square','triangle','sine'].forEach(w => {
      const btn = document.createElement('button');
      btn.textContent = w.slice(0,3).toUpperCase();
      btn.style.cssText = `flex:1;height:18px;border-radius:2px;border:1px solid ${w==='sawtooth'?'#00ff88':'var(--b2)'};background:${w==='sawtooth'?'rgba(0,255,136,.1)':'transparent'};color:${w==='sawtooth'?'#00ff88':'var(--dim)'};font-family:var(--mono);font-size:6px;letter-spacing:.08em;cursor:pointer;transition:all .12s;outline:none;`;
      btn.addEventListener('click', () => {
        waveRow.querySelectorAll('button').forEach(b => { b.style.borderColor='var(--b2)'; b.style.color='var(--dim)'; b.style.background='transparent'; });
        btn.style.borderColor='#00ff88'; btn.style.color='#00ff88'; btn.style.background='rgba(0,255,136,.1)';
        _pub('ui:bass-param', { key:'wave', val:w });
      });
      waveRow.appendChild(btn);
    });
    bassParams.appendChild(waveRow);
    bassWrap.appendChild(bassParams);

    /* Filter canvas rendering */
    let _bassFilterPos = 0.5;
    let _draggingFilter = false;
    let _bassParams = { cutoff:600, res:8, lfoDepth:800 };

    function drawFilterCurve() {
      const W = filterCanvas.offsetWidth, H = filterCanvas.offsetHeight;
      if (!W || !H) return;
      filterCanvas.width = W; filterCanvas.height = H;
      const ctx = filterCanvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      /* Background grid */
      ctx.strokeStyle = 'rgba(42,60,88,.35)'; ctx.lineWidth = .5;
      for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(i*W/4,0); ctx.lineTo(i*W/4,H); ctx.stroke(); }
      for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(0,i*H/3); ctx.lineTo(W,i*H/3); ctx.stroke(); }

      /* Frequency labels */
      ctx.fillStyle='rgba(100,136,168,.4)'; ctx.font='6px "Share Tech Mono",monospace'; ctx.textAlign='center';
      ['20Hz','200Hz','2kHz','20kHz'].forEach((l,i) => ctx.fillText(l, i*W/3+W/6, H-4));

      const cutoff   = _bassParams.cutoff;
      const res      = _bassParams.res;
      const depth    = _bassParams.depth || 800;
      const animated = _bassFilterPos; /* 0-1 animated position */

      /* Animated cutoff position */
      const animCut = Math.max(20, Math.min(20000, cutoff + (animated - 0.5) * depth * 2));
      const cutX    = (Math.log10(animCut) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * W;

      /* Draw filter response curve */
      ctx.beginPath(); ctx.strokeStyle = bassRunning ? '#00ff88' : 'rgba(0,255,136,.3)'; ctx.lineWidth = 2;
      for (let px = 0; px < W; px++) {
        const freq = Math.pow(10, Math.log10(20) + (px/W) * (Math.log10(20000) - Math.log10(20)));
        const ratio = freq / animCut;
        /* Simplified 2nd-order lowpass response */
        const q     = res / 2;
        const denom = Math.sqrt(Math.pow(1 - ratio*ratio, 2) + Math.pow(ratio/q, 2));
        let   db    = -20 * Math.log10(Math.max(denom, 0.001));
        /* Resonance peak */
        if (Math.abs(ratio - 1) < 0.3) db += (res - 0.7) * 2;
        db = Math.max(-40, Math.min(12, db));
        const y = H * 0.5 - (db / 40) * H * 0.4;
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.stroke();

      /* Fill under curve */
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = bassRunning ? 'rgba(0,255,136,.07)' : 'rgba(0,255,136,.03)';
      ctx.fill();

      /* Cutoff handle */
      ctx.beginPath();
      ctx.arc(cutX, H * 0.35, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff88';
      ctx.fill();
      if (bassRunning) { ctx.shadowColor='#00ff88'; ctx.shadowBlur=10; ctx.fill(); ctx.shadowBlur=0; }

      /* LFO sweep indicator */
      const loX = Math.max(0, cutX - (depth/20000)*W*0.3);
      const hiX = Math.min(W, cutX + (depth/20000)*W*0.3);
      ctx.fillStyle = 'rgba(0,212,255,.12)';
      ctx.fillRect(loX, 0, hiX - loX, H);
    }

    /* Drag cutoff on canvas */
    filterCanvas.addEventListener('pointerdown', e => {
      _draggingFilter = true; filterCanvas.setPointerCapture(e.pointerId);
    });
    filterCanvas.addEventListener('pointermove', e => {
      if (!_draggingFilter) return;
      const r = filterCanvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const freq = Math.round(Math.pow(10, Math.log10(20) + x * (Math.log10(20000) - Math.log10(20))));
      _bassParams.cutoff = freq;
      cutSlider.value = Math.min(4000, freq);
      cutSlider.dispatchEvent(new Event('input'));
    });
    filterCanvas.addEventListener('pointerup', () => _draggingFilter = false);

    /* ═════════════════════════════════════════════════════
       COLUMN 2 — RHYTHM ENGINE
       A 2D density canvas. Paint with mouse/touch.
       Y = kit track, X = time in bar.
       Brightness = probability of firing.
       Current step scans across as a cursor.
    ═════════════════════════════════════════════════════ */
    let rhythmRunning = false;
    const TRACKS = 8, STEPS = 32;
    const KIT_NAMES  = ['KICK','SNARE','GALLOP','GALLOP2','OPEN HAT','CLAP','808','RISER'];
    const KIT_COLORS = ['#00ff88','#00ff88','#00d4ff','#00d4ff','#6a88a8','#00ff88','#ff2266','#aa44ff'];

    const { wrap: rhythmWrap, dot: rhythmDot, status: rhythmStatus } = mkSection('RHYTHM ENGINE', '#00d4ff', (dot) => {
      rhythmRunning = !rhythmRunning;
      _pub('ui:rhythm-toggle', {});
      dot.style.opacity    = rhythmRunning ? '1' : '.4';
      dot.style.boxShadow  = rhythmRunning ? '0 0 8px #00d4ff' : '';
      rhythmStatus.textContent = rhythmRunning ? 'ON' : 'OFF';
      rhythmStatus.style.color = rhythmRunning ? '#00d4ff' : 'var(--dim)';
    });

    /* Label column + canvas side by side */
    const rhythmBody = document.createElement('div');
    rhythmBody.style.cssText = 'display:flex;flex:1;min-height:0;';

    /* Track labels */
    const trackLabels = document.createElement('div');
    trackLabels.style.cssText = 'display:flex;flex-direction:column;width:56px;flex-shrink:0;border-right:1px solid var(--b1);';
    KIT_NAMES.forEach((name, i) => {
      const lbl = document.createElement('div');
      lbl.style.cssText = `flex:1;display:flex;align-items:center;justify-content:flex-end;padding-right:5px;font-family:var(--mono);font-size:6px;color:${KIT_COLORS[i]};letter-spacing:.06em;border-bottom:1px solid var(--b1);cursor:pointer;transition:background .12s;`;
      lbl.textContent = name;
      lbl.title = 'Click to clear / double-click to fill';
      lbl.addEventListener('click', () => _pub('ui:rhythm-clear', { track: i }));
      lbl.addEventListener('dblclick', () => {
        for(let s=0;s<STEPS;s++) densityCache[i][s] = 0.8;
        drawDensity();
      });
      trackLabels.appendChild(lbl);
    });

    /* Density canvas */
    const densityCanvas = document.createElement('canvas');
    densityCanvas.style.cssText = 'flex:1;display:block;cursor:crosshair;';
    rhythmBody.appendChild(trackLabels); rhythmBody.appendChild(densityCanvas);
    rhythmWrap.appendChild(rhythmBody);

    /* Preset row */
    const presetRow = document.createElement('div');
    presetRow.style.cssText = 'display:flex;gap:3px;padding:5px 8px;border-top:1px solid var(--b1);flex-shrink:0;';
    const presetLbl = document.createElement('div');
    presetLbl.style.cssText = 'font-family:var(--mono);font-size:6.5px;color:var(--dim);letter-spacing:.1em;display:flex;align-items:center;margin-right:3px;';
    presetLbl.textContent = 'PRESET';
    presetRow.appendChild(presetLbl);
    ['tranki','drop','build'].forEach(p => {
      const btn = document.createElement('button');
      btn.textContent = p.toUpperCase();
      btn.style.cssText = 'flex:1;height:18px;border-radius:2px;border:1px solid var(--b2);background:transparent;color:var(--dim2);font-family:var(--mono);font-size:6.5px;letter-spacing:.08em;cursor:pointer;transition:all .12s;outline:none;';
      btn.addEventListener('mouseenter', () => { btn.style.borderColor='#00d4ff'; btn.style.color='#00d4ff'; });
      btn.addEventListener('mouseleave', () => { btn.style.borderColor='var(--b2)'; btn.style.color='var(--dim2)'; });
      btn.addEventListener('click', () => _pub('ui:rhythm-preset', { preset: p }));
      presetRow.appendChild(btn);
    });
    rhythmWrap.appendChild(presetRow);

    /* Local density cache for rendering */
    let densityCache = Array.from({ length: TRACKS }, () => new Float32Array(STEPS).fill(0));
    /* Default tranki pattern */
    [[0,8,16,24],[4,12,20,28],[0,2,3,6,8,10,11,14],[1,5,9,13],[],[4,12],[],[]].forEach((steps, ti) => {
      steps.forEach(s => densityCache[ti][s] = 0.85);
    });

    let _rhythmStep = 0;
    let _painting   = false;
    let _paintVal   = 1;
    let _lastPaintCell = null;

    function drawDensity() {
      const W = densityCanvas.offsetWidth, H = densityCanvas.offsetHeight;
      if (!W || !H) return;
      densityCanvas.width = W; densityCanvas.height = H;
      const ctx = densityCanvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      const cellW = W / STEPS, cellH = H / TRACKS;

      for (let ti = 0; ti < TRACKS; ti++) {
        for (let si = 0; si < STEPS; si++) {
          const d = densityCache[ti][si];
          if (d > 0) {
            const alpha = 0.15 + d * 0.75;
            ctx.fillStyle = KIT_COLORS[ti] + Math.round(alpha * 255).toString(16).padStart(2,'0');
            const pad = 1;
            ctx.fillRect(si*cellW+pad, ti*cellH+pad, cellW-pad*2, cellH-pad*2);
            /* Bar markers */
            if (si % 8 === 0) {
              ctx.fillStyle = 'rgba(255,255,255,.04)';
              ctx.fillRect(si*cellW, ti*cellH, cellW, cellH);
            }
          }
        }
      }

      /* Grid lines */
      ctx.strokeStyle = 'rgba(42,60,88,.4)'; ctx.lineWidth = .5;
      for (let si = 0; si <= STEPS; si++) {
        ctx.beginPath(); ctx.moveTo(si*cellW, 0); ctx.lineTo(si*cellW, H); ctx.stroke();
      }
      for (let ti = 0; ti <= TRACKS; ti++) {
        ctx.beginPath(); ctx.moveTo(0, ti*cellH); ctx.lineTo(W, ti*cellH); ctx.stroke();
      }

      /* Bar lines */
      ctx.strokeStyle = 'rgba(238,244,255,.15)'; ctx.lineWidth = 1;
      for (let b = 0; b <= 4; b++) {
        const x = b * W / 4;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }

      /* Step cursor */
      if (rhythmRunning) {
        const x = _rhythmStep * cellW;
        ctx.fillStyle = 'rgba(255,255,255,.12)';
        ctx.fillRect(x, 0, cellW, H);
        ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }

      /* Beat numbers */
      ctx.fillStyle = 'rgba(100,136,168,.3)'; ctx.font = '6px "Share Tech Mono",monospace'; ctx.textAlign='center';
      for (let b = 0; b < 4; b++) ctx.fillText(b+1, (b*8+4)*cellW, 8);
    }

    function _canvasToCell(e) {
      const r = densityCanvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const step  = Math.floor(x / r.width  * STEPS);
      const track = Math.floor(y / r.height * TRACKS);
      return { step: Math.max(0,Math.min(STEPS-1,step)), track: Math.max(0,Math.min(TRACKS-1,track)) };
    }

    densityCanvas.addEventListener('pointerdown', e => {
      _painting = true; densityCanvas.setPointerCapture(e.pointerId);
      const { step, track } = _canvasToCell(e);
      _paintVal = densityCache[track][step] > 0.5 ? 0 : 1; /* toggle erase/paint */
      _lastPaintCell = null;
      _doPaint(e);
    });
    densityCanvas.addEventListener('pointermove', e => { if (_painting) _doPaint(e); });
    densityCanvas.addEventListener('pointerup',   () => { _painting = false; _lastPaintCell = null; });

    function _doPaint(e) {
      const { step, track } = _canvasToCell(e);
      const key = `${track},${step}`;
      if (key === _lastPaintCell) return;
      _lastPaintCell = key;
      densityCache[track][step] = _paintVal;
      _pub('ui:rhythm-paint', { track, step, radius: 0, val: _paintVal });
      drawDensity();
    }

    /* ═════════════════════════════════════════════════════
       COLUMN 3 — TENSION ENGINE
       A dial from consonant to dissonant.
       Overtones shown as vertical bars spreading apart.
       Drag the dial clockwise = more tension.
    ═════════════════════════════════════════════════════ */
    let tensionRunning = false;
    let _tensionVal    = 0;
    let _tensionLevel  = 0.5;

    const { wrap: tensionWrap, dot: tensionDot, status: tensionStatus } = mkSection('TENSION ENGINE', '#aa44ff', (dot) => {
      tensionRunning = !tensionRunning;
      _pub('ui:tension-toggle', {});
      dot.style.opacity   = tensionRunning ? '1' : '.4';
      dot.style.boxShadow = tensionRunning ? '0 0 8px #aa44ff' : '';
      tensionStatus.textContent = tensionRunning ? 'ON' : 'OFF';
      tensionStatus.style.color = tensionRunning ? '#aa44ff' : 'var(--dim)';
    });

    /* Overtone display canvas */
    const overtoneCanvas = document.createElement('canvas');
    overtoneCanvas.style.cssText = 'width:100%;flex:1;display:block;';
    tensionWrap.appendChild(overtoneCanvas);

    /* Tension dial + label */
    const dialWrap = document.createElement('div');
    dialWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:10px 8px;border-top:1px solid var(--b1);flex-shrink:0;gap:8px;';

    /* Big tension dial as SVG */
    const dialSVG = document.createElementNS('http://www.w3.org/2000/svg','svg');
    dialSVG.setAttribute('width','120'); dialSVG.setAttribute('height','80');
    dialSVG.style.cursor = 'ew-resize';
    dialSVG.innerHTML = `
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#00ff88;stop-opacity:.6"/>
          <stop offset="50%" style="stop-color:#ffaa00;stop-opacity:.8"/>
          <stop offset="100%" style="stop-color:#ff2266;stop-opacity:1"/>
        </linearGradient>
      </defs>
      <!-- Track arc -->
      <path d="M 15 70 A 45 45 0 0 1 105 70" stroke="rgba(42,60,88,.8)" stroke-width="4" fill="none"/>
      <!-- Fill arc (dynamic) -->
      <path id="tArcFill" d="M 15 70 A 45 45 0 0 1 15 70" stroke="url(#arcGrad)" stroke-width="4" fill="none" stroke-linecap="round"/>
      <!-- Handle -->
      <circle id="tHandle" cx="15" cy="70" r="6" fill="#aa44ff" opacity=".8"/>
      <!-- Label -->
      <text x="60" y="52" text-anchor="middle" font-family="'Share Tech Mono',monospace" font-size="7" fill="rgba(100,136,168,.8)">CONSONANT</text>
      <text id="tValLabel" x="60" y="30" text-anchor="middle" font-family="'Orbitron',monospace" font-size="14" font-weight="900" fill="#aa44ff">0</text>
    `;

    /* Drag to turn dial */
    let _dialDragging = false, _dialStartX = 0, _dialStartVal = 0;
    dialSVG.addEventListener('pointerdown', e => { _dialDragging=true; _dialStartX=e.clientX; _dialStartVal=_tensionVal; dialSVG.setPointerCapture(e.pointerId); });
    dialSVG.addEventListener('pointermove', e => {
      if (!_dialDragging) return;
      const delta = (e.clientX - _dialStartX) * 0.8;
      _tensionVal = Math.max(0, Math.min(100, _dialStartVal + delta));
      _updateDial();
      _pub('ui:tension-val', { val: _tensionVal });
    });
    dialSVG.addEventListener('pointerup', () => _dialDragging = false);

    function _updateDial() {
      const t = _tensionVal / 100;
      /* Arc from 15,70 (left) to 105,70 (right) — semi-circle */
      const angle  = -Math.PI + t * Math.PI; /* -π to 0 */
      const cx = 60, cy = 70, r = 45;
      const hx = cx + r * Math.cos(angle);
      const hy = cy + r * Math.sin(angle);
      const large = t > 0.5 ? 1 : 0;
      const fillPath = `M 15 70 A 45 45 0 ${large} 1 ${hx.toFixed(1)} ${hy.toFixed(1)}`;
      dialSVG.querySelector('#tArcFill').setAttribute('d', fillPath);
      dialSVG.querySelector('#tHandle').setAttribute('cx', hx.toFixed(1));
      dialSVG.querySelector('#tHandle').setAttribute('cy', hy.toFixed(1));
      dialSVG.querySelector('#tValLabel').textContent = Math.round(_tensionVal);
      const color = _tensionVal < 33 ? '#00ff88' : _tensionVal < 66 ? '#ffaa00' : '#ff2266';
      dialSVG.querySelector('#tHandle').setAttribute('fill', color);
      dialSVG.querySelector('#tValLabel').setAttribute('fill', color);
      /* Label */
      const labelEl = dialSVG.querySelector('text:first-of-type');
      labelEl.textContent = _tensionVal < 20 ? 'CONSONANT' : _tensionVal < 50 ? 'TENSION' : _tensionVal < 80 ? 'DISSONANT' : 'CHAOS';
    }

    /* Level slider */
    const levelRow = document.createElement('div');
    levelRow.style.cssText = 'display:flex;align-items:center;gap:7px;width:100%;';
    const levelLbl = document.createElement('div'); levelLbl.style.cssText='font-family:var(--mono);font-size:6.5px;color:var(--dim2);letter-spacing:.1em;min-width:32px;'; levelLbl.textContent='LEVEL';
    const levelSlider = document.createElement('input'); levelSlider.type='range'; levelSlider.min=0; levelSlider.max=1; levelSlider.step=.01; levelSlider.value=.5;
    levelSlider.style.cssText = 'flex:1;accent-color:#aa44ff;height:3px;cursor:pointer;';
    levelSlider.addEventListener('input', () => _pub('ui:tension-level', { val: +levelSlider.value }));
    levelRow.appendChild(levelLbl); levelRow.appendChild(levelSlider);

    const freqRow = document.createElement('div');
    freqRow.style.cssText = 'display:flex;align-items:center;gap:7px;width:100%;';
    const freqLblT = document.createElement('div'); freqLblT.style.cssText='font-family:var(--mono);font-size:6.5px;color:var(--dim2);letter-spacing:.1em;min-width:32px;'; freqLblT.textContent='ROOT';
    const freqSliderT = document.createElement('input'); freqSliderT.type='range'; freqSliderT.min=40; freqSliderT.max=220; freqSliderT.step=1; freqSliderT.value=110;
    freqSliderT.style.cssText='flex:1;accent-color:#aa44ff;height:3px;cursor:pointer;';
    freqSliderT.addEventListener('input', () => _pub('ui:tension-freq', { val: +freqSliderT.value }));
    freqRow.appendChild(freqLblT); freqRow.appendChild(freqSliderT);

    dialWrap.appendChild(dialSVG); dialWrap.appendChild(levelRow); dialWrap.appendChild(freqRow);
    tensionWrap.appendChild(dialWrap);

    /* Overtone canvas rendering */
    let _overtones = [];
    function drawOvertones() {
      const W = overtoneCanvas.offsetWidth, H = overtoneCanvas.offsetHeight;
      if (!W || !H) return;
      overtoneCanvas.width = W; overtoneCanvas.height = H;
      const ctx = overtoneCanvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'var(--bg2)'; ctx.fillRect(0,0,W,H);

      if (!_overtones.length) {
        ctx.fillStyle = 'rgba(100,136,168,.2)'; ctx.font='7px "Share Tech Mono",monospace'; ctx.textAlign='center';
        ctx.fillText('ENABLE TENSION ENGINE', W/2, H/2);
        return;
      }

      const baseFreq = _overtones[0]?.freq || 110;
      const logMin = Math.log10(baseFreq * 0.9);
      const logMax = Math.log10(Math.max(..._overtones.map(o => o.freq)) * 1.1);

      _overtones.forEach((ot, i) => {
        const x    = ((Math.log10(ot.freq) - logMin) / (logMax - logMin)) * W;
        const barH = ot.amplitude * (H * 0.7);
        const y    = H - barH;
        const alpha= tensionRunning ? 0.6 + ot.amplitude * 0.4 : 0.2;
        const hue  = 270 - (_tensionVal / 100) * 120; /* purple → red */
        ctx.fillStyle = `hsla(${hue},80%,60%,${alpha})`;
        ctx.fillRect(x-2, y, 4, barH);
        if (tensionRunning) {
          ctx.shadowColor = `hsl(${hue},80%,60%)`; ctx.shadowBlur = 6 + ot.amplitude * 8;
          ctx.fillRect(x-2, y, 4, barH); ctx.shadowBlur = 0;
        }
        ctx.fillStyle = `hsla(${hue},60%,70%,.4)`;
        ctx.font='6px "Share Tech Mono",monospace'; ctx.textAlign='center';
        const ratio = ot.ratio.toFixed(2);
        ctx.fillText(ratio, x, H - 2);
      });

      /* Dissonance label */
      const label = _tensionVal < 20 ? 'HARMONIC' : _tensionVal < 50 ? 'TENSION' : _tensionVal < 80 ? 'DISSONANT' : 'CLUSTER';
      ctx.fillStyle = _tensionVal < 33 ? '#00ff88' : _tensionVal < 66 ? '#ffaa00' : '#ff2266';
      ctx.font = 'bold 8px "Share Tech Mono",monospace'; ctx.textAlign = 'right';
      ctx.fillText(label, W-6, 14);
    }

    /* ═════════════════════════════════════════════════════
       BOTTOM — BPM + DROP TRIGGER
    ═════════════════════════════════════════════════════ */
    const bottomBar = document.createElement('div');
    bottomBar.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;border-top:1px solid var(--b2);background:var(--bg2);flex-shrink:0;height:54px;';

    /* BPM */
    const bpmBlock = document.createElement('div');
    bpmBlock.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:ns-resize;flex-shrink:0;';
    const bpmVal = document.createElement('div'); bpmVal.style.cssText='font-family:var(--orb);font-size:20px;font-weight:900;color:var(--accent);letter-spacing:.04em;'; bpmVal.textContent = KERNEL.clock.BPM;
    const bpmLbl = document.createElement('div'); bpmLbl.style.cssText='font-family:var(--mono);font-size:6.5px;color:var(--dim);letter-spacing:.14em;'; bpmLbl.textContent='BPM';
    bpmBlock.appendChild(bpmVal); bpmBlock.appendChild(bpmLbl);
    let _bbd=false,_bby=0,_bbv=KERNEL.clock.BPM;
    bpmBlock.addEventListener('pointerdown',e=>{_bbd=true;_bby=e.clientY;_bbv=KERNEL.clock.BPM;bpmBlock.setPointerCapture(e.pointerId);});
    bpmBlock.addEventListener('pointermove',e=>{if(!_bbd)return;const v=Math.max(60,Math.min(220,_bbv+Math.round((_bby-e.clientY)*.5)));bpmVal.textContent=v;_pub('ui:bpm',{val:v});});
    bpmBlock.addEventListener('pointerup',()=>_bbd=false);

    /* Separator */
    const sep = document.createElement('div'); sep.style.cssText='width:1px;height:32px;background:var(--b2);flex-shrink:0;';

    /* Status pills */
    const pills = document.createElement('div');
    pills.style.cssText = 'display:flex;gap:5px;flex-shrink:0;';
    function mkPill(label, color) {
      const p = document.createElement('div');
      p.style.cssText = `padding:2px 7px;border-radius:10px;border:1px solid ${color}44;font-family:var(--mono);font-size:6.5px;color:${color}44;letter-spacing:.1em;transition:all .2s;`;
      p.textContent = label;
      return p;
    }
    const bassPill    = mkPill('BASS',    '#00ff88');
    const rhythmPill  = mkPill('RHYTHM',  '#00d4ff');
    const tensionPill = mkPill('TENSION', '#aa44ff');
    pills.appendChild(bassPill); pills.appendChild(rhythmPill); pills.appendChild(tensionPill);

    /* DROP button */
    const dropBtn = document.createElement('button');
    dropBtn.style.cssText = 'margin-left:auto;height:38px;padding:0 28px;border-radius:4px;border:2px solid #ff2266;background:rgba(255,34,102,.1);color:#ff2266;font-family:var(--orb);font-size:13px;font-weight:900;letter-spacing:.22em;cursor:pointer;transition:all .18s;outline:none;flex-shrink:0;';
    dropBtn.textContent = '⚡ DROP';
    dropBtn.addEventListener('mouseenter', () => { dropBtn.style.background='rgba(255,34,102,.25)'; dropBtn.style.boxShadow='0 0 22px rgba(255,34,102,.4)'; });
    dropBtn.addEventListener('mouseleave', () => { dropBtn.style.background='rgba(255,34,102,.1)'; dropBtn.style.boxShadow=''; });
    dropBtn.addEventListener('click', () => {
      KERNEL.audio.boot(); _pub('ui:drop', {});
      dropBtn.style.transform='scale(.95)';
      setTimeout(()=>dropBtn.style.transform='',120);
    });

    bottomBar.appendChild(bpmBlock); bottomBar.appendChild(sep); bottomBar.appendChild(pills); bottomBar.appendChild(dropBtn);

    /* ─── Assemble ─── */
    cols.appendChild(bassWrap); cols.appendChild(rhythmWrap); cols.appendChild(tensionWrap);
    root.appendChild(cols); root.appendChild(bottomBar);
    content.appendChild(root);

    /* ─── Engine state sync ─── */
    sBus.subscribe('org:state-sync', state => {
      if (state.bass) {
        _bassFilterPos = state.bass.filterPos;
        _bassParams = { ...state.bass.params };
        bassPill.style.color       = state.bass.running ? '#00ff88' : '#00ff8844';
        bassPill.style.borderColor = state.bass.running ? '#00ff88' : '#00ff8844';
      }
      if (state.rhythm) {
        _rhythmStep = state.rhythm.step;
        if (state.rhythm.densityMap) densityCache = state.rhythm.densityMap.map(row => new Float32Array(row));
        rhythmPill.style.color       = state.rhythm.running ? '#00d4ff' : '#00d4ff44';
        rhythmPill.style.borderColor = state.rhythm.running ? '#00d4ff' : '#00d4ff44';
      }
      if (state.tension) {
        _overtones  = state.tension.overtones || [];
        tensionPill.style.color       = state.tension.running ? '#aa44ff' : '#aa44ff44';
        tensionPill.style.borderColor = state.tension.running ? '#aa44ff' : '#aa44ff44';
      }
    });

    sBus.subscribe('org:density-reset', ({ densityMap }) => {
      densityCache = densityMap.map(row => new Float32Array(row));
    });

    sBus.subscribe('org:drop-fired', () => {
      dropBtn.style.transform='scale(.92)';
      dropBtn.style.boxShadow='0 0 40px rgba(255,34,102,.8)';
      setTimeout(()=>{ dropBtn.style.transform=''; dropBtn.style.boxShadow=''; }, 400);
    });

    /* ─── Render loop ─── */
    function renderAll() {
      requestAnimationFrame(renderAll);
      drawFilterCurve();
      drawDensity();
      drawOvertones();
    }
    renderAll();
    _updateDial();
  },
});


/* ═══════════════════════════════════════════════════════
   CONTRAST ANALYSER — rebuilt
   FREQUENCY: hardware-style spectrum analyser
   DYNAMIC:   dual mirrored waveform, RMS overlay
   RHYTHMIC:  transient roll notation, tension arcs
   Each mode is a completely different visual language.
═══════════════════════════════════════════════════════ */
reg('contrast-analyser', {
  category:'Audio — Analysis', summary:'Frequency / dynamic / rhythmic contrast analyser between two sources.', needs:[],
  label:'Contrast Analyser', icon:'⟺', accent:'#00d4ff',
  width:760, height:500, minWidth:560, minHeight:360,
  mountEngine(instanceId, intakeResult, sBus) {
    ContrastAnalyserEngine.mount(instanceId, sBus, KERNEL.audio, {});
  },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const root = document.createElement('div');
    root.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#010308;';

    /* ── Slot drop zones — top bar ── */
    const slotBar = document.createElement('div');
    slotBar.style.cssText = 'display:flex;gap:1px;flex-shrink:0;height:44px;border-bottom:1px solid var(--b1);background:var(--bg2);';

    function mkSlotZone(slot, color, label) {
      const z = document.createElement('div');
      z.style.cssText = `flex:1;display:flex;align-items:center;gap:8px;padding:0 12px;cursor:pointer;transition:background .15s;border-right:2px solid ${color}33;position:relative;`;
      const dot = document.createElement('div');
      dot.style.cssText = `width:8px;height:8px;border-radius:50%;background:${color};opacity:.35;flex-shrink:0;transition:opacity .2s,box-shadow .2s;`;
      const nameEl = document.createElement('div');
      nameEl.style.cssText = `font-family:var(--mono);font-size:8px;color:${color};letter-spacing:.1em;opacity:.5;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`;
      nameEl.textContent = `SLOT ${slot}  —  DROP AUDIO`;
      const durEl = document.createElement('div');
      durEl.style.cssText = `font-family:var(--mono);font-size:7px;color:var(--dim);letter-spacing:.06em;flex-shrink:0;`;
      z.appendChild(dot); z.appendChild(nameEl); z.appendChild(durEl);
      z.addEventListener('dragover', e => { e.preventDefault(); z.style.background=`${color}12`; });
      z.addEventListener('dragleave', () => z.style.background='');
      z.addEventListener('drop', async e => {
        e.preventDefault(); z.style.background='';
        const results = await Intake.ingestAll(e.dataTransfer.files, KERNEL.bus);
        const audio = results.find(r => r.id==='audio:sample');
        if (!audio) return;
        _pub('ui:slot-load', { slot, arrayBuffer: audio.arrayBuffer, name: audio.name });
        nameEl.textContent = audio.name;
        nameEl.style.opacity = '1';
        dot.style.opacity = '1';
        dot.style.boxShadow = `0 0 8px ${color}`;
        durEl.textContent = '…';
      });
      return { el: z, nameEl, durEl, dot };
    }

    const slotA = mkSlotZone('A', '#00d4ff', 'A');
    const slotB = mkSlotZone('B', '#aa44ff', 'B');
    slotBar.appendChild(slotA.el); slotBar.appendChild(slotB.el);

    /* ── Mode selector ── */
    const modeBar = document.createElement('div');
    modeBar.style.cssText = 'display:flex;gap:0;flex-shrink:0;border-bottom:1px solid var(--b1);';
    const MODES = [
      { id:'frequency', label:'FREQUENCY', desc:'Spectral content · clash zones', color:'#00ff88' },
      { id:'dynamic',   label:'DYNAMIC',   desc:'Energy shape · RMS comparison',  color:'#ffaa00' },
      { id:'rhythmic',  label:'RHYTHMIC',  desc:'Transient grid · tension arcs',  color:'#ff2266' },
    ];
    let activeMode = 'frequency';

    MODES.forEach(m => {
      const tab = document.createElement('div');
      tab.style.cssText = `flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5px 4px;cursor:pointer;border-right:1px solid var(--b1);border-bottom:2px solid transparent;transition:all .15s;`;
      tab.innerHTML = `<div style="font-family:var(--orb);font-size:7.5px;font-weight:700;letter-spacing:.14em;color:${m.color};opacity:.4;">${m.label}</div><div style="font-family:var(--mono);font-size:6px;color:var(--dim);letter-spacing:.06em;margin-top:2px;">${m.desc}</div>`;
      tab.dataset.mode = m.id;
      tab.addEventListener('click', () => {
        activeMode = m.id;
        _pub('ui:mode-change', { mode: m.id });
        Array.from(modeBar.children).forEach(t => {
          const on = t.dataset.mode === m.id;
          t.style.borderBottomColor = on ? m.color : 'transparent';
          t.style.background = on ? `${m.color}0a` : 'transparent';
          t.querySelector('div').style.opacity = on ? '1' : '.4';
        });
      });
      modeBar.appendChild(tab);
    });
    modeBar.children[0].style.borderBottomColor = '#00ff88';
    modeBar.children[0].style.background = '#00ff880a';
    modeBar.children[0].querySelector('div').style.opacity = '1';

    /* ── Main canvas ── */
    const canvasWrap = document.createElement('div');
    canvasWrap.style.cssText = 'flex:1;position:relative;overflow:hidden;';
    const cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    canvasWrap.appendChild(cvs);

    /* ── Bottom bar — score + analysis text + controls ── */
    const bottomBar = document.createElement('div');
    bottomBar.style.cssText = 'display:flex;align-items:center;gap:10px;padding:6px 12px;border-top:1px solid var(--b1);background:var(--bg2);flex-shrink:0;';

    const scoreBlock = document.createElement('div');
    scoreBlock.style.cssText = 'display:flex;flex-direction:column;align-items:center;flex-shrink:0;min-width:52px;';
    const scoreNum = document.createElement('div');
    scoreNum.style.cssText = 'font-family:var(--orb);font-size:22px;font-weight:900;color:#00ff88;letter-spacing:.04em;';
    scoreNum.textContent = '—';
    const scoreLbl = document.createElement('div');
    scoreLbl.style.cssText = 'font-family:var(--mono);font-size:6px;color:var(--dim);letter-spacing:.14em;';
    scoreLbl.textContent = 'SCORE';
    scoreBlock.appendChild(scoreNum); scoreBlock.appendChild(scoreLbl);

    const sep = document.createElement('div'); sep.style.cssText='width:1px;height:30px;background:var(--b2);flex-shrink:0;';

    const textEl = document.createElement('div');
    textEl.style.cssText = 'flex:1;font-family:var(--mono);font-size:7.5px;color:var(--dim2);letter-spacing:.06em;line-height:1.7;';
    textEl.textContent = 'Drop audio into both slots to begin analysis';

    /* BPM tap */
    const bpmBlock = document.createElement('div');
    bpmBlock.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0;';
    const bpmVal = document.createElement('div');
    bpmVal.style.cssText = 'font-family:var(--orb);font-size:14px;font-weight:700;color:var(--dim2);letter-spacing:.04em;cursor:pointer;';
    bpmVal.textContent = '—';
    const bpmLbl = document.createElement('div');
    bpmLbl.style.cssText = 'font-family:var(--mono);font-size:6px;color:var(--dim);letter-spacing:.12em;';
    bpmLbl.textContent = 'TAP BPM';
    bpmBlock.appendChild(bpmVal); bpmBlock.appendChild(bpmLbl);
    bpmBlock.addEventListener('click', () => _pub('ui:tap-bpm', {}));
    bpmBlock.title = 'Tap repeatedly to set BPM';

    /* Sensitivity control */
    const sensBlock = document.createElement('div');
    sensBlock.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0;';
    const sensLbl2 = document.createElement('div'); sensLbl2.style.cssText='font-family:var(--mono);font-size:6px;color:var(--dim);letter-spacing:.12em;'; sensLbl2.textContent='SENSITIVITY';
    const sensSlider = document.createElement('input'); sensSlider.type='range'; sensSlider.min=0; sensSlider.max=1; sensSlider.step=.05; sensSlider.value=.3;
    sensSlider.style.cssText='accent-color:#ff2266;height:3px;width:60px;cursor:pointer;';
    sensSlider.addEventListener('input', () => _pub('ui:config-change', { key:'sensitivity', value:+sensSlider.value }));
    sensBlock.appendChild(sensLbl2); sensBlock.appendChild(sensSlider);

    bottomBar.appendChild(scoreBlock); bottomBar.appendChild(sep); bottomBar.appendChild(textEl);
    bottomBar.appendChild(bpmBlock); bottomBar.appendChild(sensBlock);

    root.appendChild(slotBar); root.appendChild(modeBar);
    root.appendChild(canvasWrap); root.appendChild(bottomBar);
    content.appendChild(root);

    /* ── State ── */
    let state = {
      peaksA:[], peaksB:[], transientsA:[], transientsB:[],
      bpm:128, clash:0, displacement:0, dynContrast:0, text:'',
      peakDbA:0, peakDbB:0,
    };

    /* ── Render ── */
    function draw() {
      requestAnimationFrame(draw);
      const W = cvs.offsetWidth, H = cvs.offsetHeight;
      if (!W || !H) return;
      if (cvs.width !== W || cvs.height !== H) { cvs.width = W; cvs.height = H; }
      const ctx = cvs.getContext('2d');
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#010308'; ctx.fillRect(0, 0, W, H);

      if (activeMode === 'frequency') _drawFreq(ctx, W, H);
      if (activeMode === 'dynamic')   _drawDyn(ctx, W, H);
      if (activeMode === 'rhythmic')  _drawRhythmic(ctx, W, H);
    }

    /* ─ FREQUENCY MODE ─
       Hardware spectrum analyser aesthetic.
       Vertical bars, log scale, A cyan B purple, clash region white.
       LED-style horizontal lines across background. */
    function _drawFreq(ctx, W, H) {
      const pA = state.peaksA, pB = state.peaksB;

      /* LED grid lines */
      ctx.strokeStyle = 'rgba(42,60,88,.3)'; ctx.lineWidth = .5;
      for (let i = 0; i < 10; i++) {
        const y = H - (i/9) * H;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      /* Frequency band markers */
      const bands = [
        { label:'20', freq:20 },{ label:'50', freq:50 },{ label:'100', freq:100 },
        { label:'200', freq:200 },{ label:'500', freq:500 },{ label:'1k', freq:1000 },
        { label:'2k', freq:2000 },{ label:'5k', freq:5000 },{ label:'10k', freq:10000 },
        { label:'20k', freq:20000 },
      ];
      const logMin = Math.log10(20), logMax = Math.log10(20000);
      bands.forEach(b => {
        const x = ((Math.log10(b.freq) - logMin) / (logMax - logMin)) * W;
        ctx.strokeStyle = 'rgba(42,60,88,.5)'; ctx.lineWidth = .5;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H-14); ctx.stroke();
        ctx.fillStyle = 'rgba(100,136,168,.4)'; ctx.font='6px "Share Tech Mono",monospace'; ctx.textAlign='center';
        ctx.fillText(b.label, x, H-3);
      });

      if (!pA.length && !pB.length) {
        ctx.fillStyle='rgba(100,136,168,.2)'; ctx.font='8px "Share Tech Mono",monospace'; ctx.textAlign='center';
        ctx.fillText('DROP AUDIO INTO SLOTS A AND B', W/2, H/2);
        return;
      }

      /* Draw bars — both spectra as vertical bar chart */
      function drawBars(peaks, color, offset) {
        if (!peaks.length) return;
        const BAR_W = W / peaks.length;
        peaks.forEach((amp, i) => {
          const x = i * BAR_W + offset;
          const h = Math.max(1, amp * (H - 20));
          const y = H - 20 - h;
          /* Bar segments with LED style */
          const segs = Math.ceil(h / 4);
          for (let s = 0; s < segs; s++) {
            const sy = H - 20 - s * 4 - 3;
            const alpha = 0.4 + (s / segs) * 0.5;
            ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2,'0');
            ctx.fillRect(x, sy, BAR_W * 0.8, 2.5);
          }
          /* Peak cap */
          ctx.fillStyle = color;
          ctx.fillRect(x, y, BAR_W * 0.8, 1.5);
        });
      }

      /* Clash region first (white bg) */
      if (pA.length && pB.length) {
        const n = Math.min(pA.length, pB.length);
        const BAR_W = W / n;
        for (let i = 0; i < n; i++) {
          const overlap = Math.min(pA[i]||0, pB[i]||0);
          if (overlap > 0.08) {
            const h = overlap * (H - 20);
            ctx.fillStyle = `rgba(255,255,255,${overlap * 0.15})`;
            ctx.fillRect(i * BAR_W, H - 20 - h, BAR_W, h);
          }
        }
      }

      drawBars(pA, '#00d4ff', 0);
      drawBars(pB, '#aa44ff', 0);

      /* Score */
      const clash = state.clash;
      const clashColor = clash > 70 ? '#ff2266' : clash > 40 ? '#ffaa00' : '#00ff88';
      ctx.fillStyle = clashColor; ctx.font='bold 11px "Orbitron",monospace'; ctx.textAlign='right';
      ctx.fillText(`CLASH  ${clash}`, W-8, 16);

      /* Legend */
      ctx.fillStyle='#00d4ff'; ctx.font='7px "Share Tech Mono",monospace'; ctx.textAlign='left';
      ctx.fillText('▌ A', 6, 16);
      ctx.fillStyle='#aa44ff';
      ctx.fillText('▌ B', 26, 16);
    }

    /* ─ DYNAMIC MODE ─
       Dual mirrored waveform. A top half (inverted), B bottom.
       RMS average line. Peak dB labels. Energy delta shaded. */
    function _drawDyn(ctx, W, H) {
      const pA = state.peaksA, pB = state.peaksB;
      const mid = H / 2;

      /* Center axis */
      ctx.strokeStyle = 'rgba(42,60,88,.6)'; ctx.lineWidth = 1; ctx.setLineDash([3,5]);
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke(); ctx.setLineDash([]);

      /* Time grid — 4 sections */
      for (let i = 1; i < 4; i++) {
        const x = i * W / 4;
        ctx.strokeStyle = 'rgba(42,60,88,.3)'; ctx.lineWidth = .5;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        ctx.fillStyle = 'rgba(100,136,168,.25)'; ctx.font='6.5px "Share Tech Mono",monospace'; ctx.textAlign='center';
        ctx.fillText(`${i*25}%`, x, H-4);
      }

      if (!pA.length && !pB.length) {
        ctx.fillStyle='rgba(100,136,168,.2)'; ctx.font='8px "Share Tech Mono",monospace'; ctx.textAlign='center';
        ctx.fillText('DROP AUDIO INTO SLOTS A AND B', W/2, mid); return;
      }

      function drawWaveform(peaks, color, yBase, dir, label) {
        if (!peaks.length) return;
        /* Filled shape */
        ctx.beginPath();
        peaks.forEach((amp, i) => {
          const x = (i / peaks.length) * W;
          const h = amp * (H * 0.42) * dir;
          i === 0 ? ctx.moveTo(x, yBase) : ctx.lineTo(x, yBase - h);
        });
        ctx.lineTo(W, yBase); ctx.lineTo(0, yBase); ctx.closePath();
        ctx.fillStyle = color + '22';
        ctx.fill();

        /* Outline */
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 1.5;
        peaks.forEach((amp, i) => {
          const x = (i / peaks.length) * W;
          const h = amp * (H * 0.42) * dir;
          i === 0 ? ctx.moveTo(x, yBase - h) : ctx.lineTo(x, yBase - h);
        }); ctx.stroke();

        /* Mirror ghost */
        ctx.beginPath(); ctx.strokeStyle = color+'44'; ctx.lineWidth = 0.8;
        peaks.forEach((amp, i) => {
          const x = (i / peaks.length) * W;
          const h = amp * (H * 0.42) * -dir;
          i === 0 ? ctx.moveTo(x, yBase - h) : ctx.lineTo(x, yBase - h);
        }); ctx.stroke();

        /* RMS average line */
        const rms = Math.sqrt(peaks.reduce((a,p)=>a+p*p,0)/peaks.length);
        const rmsY = yBase - rms * (H * 0.42) * dir;
        ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(0, rmsY); ctx.lineTo(W, rmsY); ctx.stroke(); ctx.setLineDash([]);

        /* Label */
        ctx.fillStyle = color; ctx.font='bold 8px "Share Tech Mono",monospace';
        ctx.textAlign = 'left'; ctx.fillText(label, 6, dir > 0 ? yBase - 8 : yBase + 14);
        ctx.font='6.5px "Share Tech Mono",monospace'; ctx.fillStyle = color+'88';
        if (label === 'A' && state.peakDbA) ctx.fillText(`${Math.round(state.peakDbA)}dB pk`, 18, dir > 0 ? yBase - 8 : yBase + 14);
        if (label === 'B' && state.peakDbB) ctx.fillText(`${Math.round(state.peakDbB)}dB pk`, 18, dir > 0 ? yBase - 8 : yBase + 14);
      }

      /* Energy delta shading between A and B at each point */
      if (pA.length && pB.length) {
        const n = Math.min(pA.length, pB.length);
        for (let i = 0; i < n-1; i++) {
          const x  = (i/n)*W, x2 = ((i+1)/n)*W;
          const aH = (pA[i]||0)*(H*.42), bH = (pB[i]||0)*(H*.42);
          if (Math.abs(aH-bH) > H*.05) {
            ctx.fillStyle='rgba(255,170,0,.04)';
            ctx.fillRect(x, mid-Math.max(aH,bH), x2-x, Math.abs(aH-bH));
          }
        }
      }

      drawWaveform(pA, '#00d4ff', mid, 1,  'A');
      drawWaveform(pB, '#aa44ff', mid, -1, 'B');

      /* Dynamic contrast score */
      const dc = state.dynContrast;
      const dcColor = dc > 50 ? '#00ff88' : dc > 20 ? '#ffaa00' : '#ff2266';
      ctx.fillStyle=dcColor; ctx.font='bold 11px "Orbitron",monospace'; ctx.textAlign='right';
      ctx.fillText(`CONTRAST  ${dc}`, W-8, 16);
    }

    /* ─ RHYTHMIC MODE ─
       Transient notation like a drum roll chart.
       A on top, B on bottom. Shared beat grid.
       Tension arcs where A falls between B's beats.
       Lock dots where they align.
       "Fighting the beat" is visible. */
    function _drawRhythmic(ctx, W, H) {
      const tA = state.transientsA, tB = state.transientsB;
      const mid = H / 2;
      const bpm = state.bpm || 128;
      const beatSec = 60 / bpm;
      const barSec  = beatSec * 4;

      const maxT = Math.max(
        tA.length ? tA[tA.length-1].time_sec + 0.5 : 0,
        tB.length ? tB[tB.length-1].time_sec + 0.5 : 0,
        barSec * 2
      );

      /* Bar/beat grid */
      let t = 0;
      while (t <= maxT) {
        const x = (t / maxT) * W;
        const isBar  = Math.abs(t % barSec) < 0.005;
        const isBeat = Math.abs(t % beatSec) < 0.005;
        const is16th = true;
        ctx.strokeStyle = isBar  ? 'rgba(238,244,255,.22)' :
                          isBeat ? 'rgba(238,244,255,.1)'  : 'rgba(238,244,255,.04)';
        ctx.lineWidth = isBar ? 1 : 0.5;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();

        if (isBar) {
          ctx.fillStyle = 'rgba(238,244,255,.3)'; ctx.font='6.5px "Share Tech Mono",monospace'; ctx.textAlign='left';
          ctx.fillText(`${Math.round(t/barSec)+1}`, x+3, 9);
        }
        t += beatSec / 4;
      }

      /* Triplet grid overlay (shows UKG gallop) */
      const tripletSec = beatSec / 3;
      let tt = 0;
      while (tt <= maxT) {
        const x = (tt / maxT) * W;
        ctx.strokeStyle = 'rgba(0,212,255,.06)';
        ctx.lineWidth = 0.5; ctx.setLineDash([1,3]);
        ctx.beginPath(); ctx.moveTo(x, mid*.2); ctx.lineTo(x, mid*.8); ctx.stroke(); ctx.setLineDash([]);
        tt += tripletSec;
      }

      if (!tA.length && !tB.length) {
        ctx.fillStyle='rgba(100,136,168,.2)'; ctx.font='8px "Share Tech Mono",monospace'; ctx.textAlign='center';
        ctx.fillText('DROP AUDIO INTO SLOTS A AND B', W/2, mid); return;
      }

      /* Midline */
      ctx.strokeStyle = 'rgba(42,60,88,.7)'; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke(); ctx.setLineDash([]);

      /* Tension arcs — where A falls between B's 16th grid positions */
      const grid16 = beatSec / 4;
      tA.forEach(ta => {
        let nearestB = null, nearestDist = Infinity;
        tB.forEach(tb => {
          const dist = Math.abs(ta.time_sec - tb.time_sec);
          if (dist < nearestDist) { nearestDist = dist; nearestB = tb; }
        });

        const gridDist = (ta.time_sec % grid16) / grid16;
        const isTension = gridDist > 0.18 && gridDist < 0.82;

        if (isTension && nearestB) {
          const x1 = (ta.time_sec / maxT) * W;
          const x2 = (nearestB.time_sec / maxT) * W;
          const cx = (x1 + x2) / 2;
          const depth = 20 + nearestDist * 80;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255,170,0,.35)'; ctx.lineWidth = 1;
          ctx.moveTo(x1, mid - ta.amplitude * mid * 0.6);
          ctx.quadraticCurveTo(cx, mid - depth, x2, mid + nearestB.amplitude * mid * 0.6);
          ctx.stroke();

          /* TENSION label on strongest arcs */
          if (nearestDist > grid16 * 0.4 && ta.amplitude > 0.5) {
            ctx.fillStyle='rgba(255,170,0,.5)'; ctx.font='5.5px "Share Tech Mono",monospace'; ctx.textAlign='center';
            ctx.fillText('TENSION', cx, mid - depth - 4);
          }
        }

        /* Lock dots — where A and B agree */
        if (nearestDist < grid16 * 0.1 && nearestB) {
          const x = (ta.time_sec / maxT) * W;
          ctx.beginPath();
          ctx.arc(x, mid, 4, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill();
        }
      });

      /* A transients — upper half, downward spikes */
      tA.forEach(({ time_sec, amplitude }) => {
        const x = (time_sec / maxT) * W;
        const h = amplitude * (mid - 20) * 0.9;
        ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5 + amplitude * 0.5;
        ctx.beginPath(); ctx.moveTo(x, mid - 4); ctx.lineTo(x, mid - 4 - h); ctx.stroke();
        /* Horizontal tick at top */
        ctx.beginPath(); ctx.moveTo(x-3, mid-4-h); ctx.lineTo(x+3, mid-4-h); ctx.stroke();
        ctx.globalAlpha = 1;
      });

      /* B transients — lower half, upward spikes */
      tB.forEach(({ time_sec, amplitude }) => {
        const x = (time_sec / maxT) * W;
        const h = amplitude * (mid - 20) * 0.9;
        ctx.strokeStyle = '#aa44ff'; ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5 + amplitude * 0.5;
        ctx.beginPath(); ctx.moveTo(x, mid + 4); ctx.lineTo(x, mid + 4 + h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x-3, mid+4+h); ctx.lineTo(x+3, mid+4+h); ctx.stroke();
        ctx.globalAlpha = 1;
      });

      /* Labels */
      ctx.fillStyle='#00d4ff88'; ctx.font='7px "Share Tech Mono",monospace'; ctx.textAlign='left'; ctx.fillText('A', 4, 14);
      ctx.fillStyle='#aa44ff88'; ctx.fillText('B', 4, H-5);

      /* Displacement score */
      const disp = state.displacement;
      const dispColor = disp > 60 ? '#ff2266' : disp > 30 ? '#ffaa00' : '#00ff88';
      ctx.fillStyle=dispColor; ctx.font='bold 11px "Orbitron",monospace'; ctx.textAlign='right';
      const dispLabel = disp > 70 ? 'FIGHTING' : disp > 35 ? 'TENSION' : 'LOCKED';
      ctx.fillText(`${dispLabel}  ${disp}`, W-8, 16);

      /* Triplet legend */
      ctx.strokeStyle='rgba(0,212,255,.3)'; ctx.setLineDash([1,3]); ctx.lineWidth=.5;
      ctx.beginPath(); ctx.moveTo(W-60, H-12); ctx.lineTo(W-50, H-12); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='rgba(0,212,255,.35)'; ctx.font='6px "Share Tech Mono",monospace'; ctx.textAlign='left';
      ctx.fillText('= TRIPLET GRID', W-48, H-9);
    }

    draw();

    /* Ruler click to set offset */
    canvasWrap.addEventListener('click', e => {
      if (activeMode !== 'rhythmic') return;
      const r = canvasWrap.getBoundingClientRect();
      const frac = (e.clientX - r.left) / r.width;
      const tA = state.transientsA, tB = state.transientsB;
      const maxT = Math.max(
        tA.length ? tA[tA.length-1].time_sec + .5 : 0,
        tB.length ? tB[tB.length-1].time_sec + .5 : 0,
        4
      );
      _pub('ui:config-change', { key:'offsetA', value: -(frac * maxT * 0.3) });
      _pub('ui:reanalyse', {});
    });

    /* ── State sync ── */
    sBus.subscribe('org:slot-loaded', ({ slot, name, duration, peaks, transients, peakDb: pDb, bpmResult }) => {
      if (slot === 'A') {
        slotA.nameEl.textContent = name;
        slotA.durEl.textContent  = duration ? `${duration.toFixed(1)}s` : '';
        state.peaksA      = peaks;
        state.transientsA = transients;
        state.peakDbA     = pDb;
      }
      if (slot === 'B') {
        slotB.nameEl.textContent = name;
        slotB.durEl.textContent  = duration ? `${duration.toFixed(1)}s` : '';
        state.peaksB      = peaks;
        state.transientsB = transients;
        state.peakDbB     = pDb;
      }
      if (bpmResult) {
        state.bpm = bpmResult.bpm;
        bpmVal.textContent  = bpmResult.bpm;
        bpmVal.style.color  = '#00ff88';
        bpmLbl.textContent  = `${Math.round(bpmResult.confidence*100)}% conf`;
      }
    });

    sBus.subscribe('org:analysis-ready', d => {
      Object.assign(state, d);
      const scoreMap = { frequency: d.clash, dynamic: d.dynContrast, rhythmic: d.displacement };
      const score = scoreMap[activeMode] ?? 0;
      scoreNum.textContent = score;
      scoreNum.style.color = score > 70 ? '#ff2266' : score > 40 ? '#ffaa00' : '#00ff88';
      scoreLbl.textContent = { frequency:'CLASH', dynamic:'CONTRAST', rhythmic:'TENSION' }[activeMode] || 'SCORE';
      textEl.textContent   = d.text || '';
      if (d.bpm) { bpmVal.textContent = d.bpm; bpmVal.style.color = '#00ff88'; }
    });

    sBus.subscribe('org:bpm-detected', ({ bpm: b, confidence }) => {
      state.bpm = b;
      bpmVal.textContent = b; bpmVal.style.color = '#00ff88';
      bpmLbl.textContent = `${Math.round(confidence*100)}% conf`;
    });
  },
});


/* ═══════════════════════════════════════════════════════
   BASS DROP BUILDER — horizontal timeline
   Four stages laid out in time. Drag boundaries to resize.
   Vocal clip sits on a lane above — drag to place.
   Firing shows a cursor sweeping through the stages.
═══════════════════════════════════════════════════════ */
reg('bass-drop-builder', {
  category:'Audio — Production', summary:'Four-stage tension-to-drop arrangement builder.', needs:[],
  label:'Bass Drop Builder', icon:'🔻', accent:'#ff2266',
  width:780, height:400, minWidth:580, minHeight:300,
  mountEngine(instanceId, intakeResult, sBus) {
    BassDropBuilderEngine.mount(instanceId, sBus, KERNEL.audio, {});
  },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const root = document.createElement('div');
    root.style.cssText = 'display:flex;flex-direction:column;height:100%;background:var(--bg0);';

    /* ── Top bar: BPM + controls + FIRE ── */
    const topBar = document.createElement('div');
    topBar.style.cssText = 'display:flex;align-items:center;gap:10px;padding:6px 12px;border-bottom:1px solid var(--b1);background:var(--bg2);flex-shrink:0;';

    /* BPM */
    const bpmBlock = document.createElement('div');
    bpmBlock.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:ns-resize;flex-shrink:0;';
    const bpmVal  = document.createElement('div'); bpmVal.style.cssText  = 'font-family:var(--orb);font-size:22px;font-weight:900;color:#ff2266;letter-spacing:.04em;'; bpmVal.textContent = KERNEL.clock.BPM;
    const bpmLbl2 = document.createElement('div'); bpmLbl2.style.cssText = 'font-family:var(--mono);font-size:6px;color:var(--dim);letter-spacing:.14em;'; bpmLbl2.textContent = 'BPM';
    bpmBlock.appendChild(bpmVal); bpmBlock.appendChild(bpmLbl2);
    let _bbd=false,_bby=0,_bbv=KERNEL.clock.BPM;
    bpmBlock.addEventListener('pointerdown',e=>{_bbd=true;_bby=e.clientY;_bbv=KERNEL.clock.BPM;bpmBlock.setPointerCapture(e.pointerId);});
    bpmBlock.addEventListener('pointermove',e=>{if(!_bbd)return;const v=Math.max(60,Math.min(220,_bbv+Math.round((_bby-e.clientY)*.5)));bpmVal.textContent=v;_pub('ui:config-change',{key:'bpm',value:v});});
    bpmBlock.addEventListener('pointerup',()=>_bbd=false);

    const tsep = () => { const s=document.createElement('div'); s.style.cssText='width:1px;height:28px;background:var(--b2);flex-shrink:0;'; return s; };

    /* Bass freq */
    const freqWrap = document.createElement('div'); freqWrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:2px;cursor:ns-resize;flex-shrink:0;';
    const freqVal  = document.createElement('div'); freqVal.style.cssText='font-family:var(--orb);font-size:14px;font-weight:700;color:#00ff88;'; freqVal.textContent='55Hz';
    const freqLbl  = document.createElement('div'); freqLbl.style.cssText='font-family:var(--mono);font-size:6px;color:var(--dim);letter-spacing:.1em;'; freqLbl.textContent='BASS FREQ';
    freqWrap.appendChild(freqVal); freqWrap.appendChild(freqLbl);
    let _fd=false,_fy=0,_fv=55;
    freqWrap.addEventListener('pointerdown',e=>{_fd=true;_fy=e.clientY;_fv=parseInt(freqVal.textContent);freqWrap.setPointerCapture(e.pointerId);});
    freqWrap.addEventListener('pointermove',e=>{if(!_fd)return;const v=Math.max(20,Math.min(220,_fv+Math.round((_fy-e.clientY)*.5)));freqVal.textContent=`${v}Hz`;_pub('ui:config-change',{key:'freq',value:v});});
    freqWrap.addEventListener('pointerup',()=>_fd=false);

    /* Drive */
    const driveWrap = document.createElement('div'); driveWrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:2px;cursor:ns-resize;flex-shrink:0;';
    const driveVal  = document.createElement('div'); driveVal.style.cssText='font-family:var(--orb);font-size:14px;font-weight:700;color:#ffaa00;'; driveVal.textContent='60%';
    const driveLbl  = document.createElement('div'); driveLbl.style.cssText='font-family:var(--mono);font-size:6px;color:var(--dim);letter-spacing:.1em;'; driveLbl.textContent='DRIVE';
    driveWrap.appendChild(driveVal); driveWrap.appendChild(driveLbl);
    let _dd=false,_dy2=0,_dv=0.6;
    driveWrap.addEventListener('pointerdown',e=>{_dd=true;_dy2=e.clientY;_dv=parseFloat(driveVal.textContent)/100;driveWrap.setPointerCapture(e.pointerId);});
    driveWrap.addEventListener('pointermove',e=>{if(!_dd)return;const v=Math.max(0,Math.min(1,_dv+(_dy2-e.clientY)*.005));driveVal.textContent=`${Math.round(v*100)}%`;_pub('ui:config-change',{key:'drive',value:v});});
    driveWrap.addEventListener('pointerup',()=>_dd=false);

    /* FIRE button */
    const fireBtn = document.createElement('button');
    fireBtn.style.cssText = 'margin-left:auto;height:38px;padding:0 28px;border-radius:4px;border:2px solid #ff2266;background:rgba(255,34,102,.1);color:#ff2266;font-family:var(--orb);font-size:13px;font-weight:900;letter-spacing:.22em;cursor:pointer;transition:all .18s;outline:none;flex-shrink:0;';
    fireBtn.textContent = '⚡ FIRE';
    fireBtn.addEventListener('mouseenter',()=>{fireBtn.style.background='rgba(255,34,102,.22)';fireBtn.style.boxShadow='0 0 20px rgba(255,34,102,.35)';});
    fireBtn.addEventListener('mouseleave',()=>{fireBtn.style.background='rgba(255,34,102,.1)';fireBtn.style.boxShadow='';});
    fireBtn.addEventListener('click',()=>{ KERNEL.audio.boot(); _pub('ui:fire',{}); });

    topBar.appendChild(bpmBlock); topBar.appendChild(tsep()); topBar.appendChild(freqWrap); topBar.appendChild(tsep()); topBar.appendChild(driveWrap); topBar.appendChild(tsep());
    topBar.appendChild(fireBtn);

    /* ── Vocal drop zone ── */
    const vocalBar = document.createElement('div');
    vocalBar.style.cssText = 'display:flex;align-items:center;gap:10px;padding:0 12px;height:32px;border-bottom:1px solid var(--b1);background:rgba(255,34,102,.04);flex-shrink:0;cursor:pointer;transition:background .15s;';
    const vocalIcon = document.createElement('div'); vocalIcon.style.cssText='font-size:12px;flex-shrink:0;'; vocalIcon.textContent='🎤';
    const vocalName = document.createElement('div'); vocalName.style.cssText='font-family:var(--mono);font-size:8px;color:rgba(255,34,102,.6);letter-spacing:.1em;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'; vocalName.textContent='DROP RAVEN VOICE CLIP';
    const vocalDur  = document.createElement('div'); vocalDur.style.cssText='font-family:var(--mono);font-size:7px;color:var(--dim);flex-shrink:0;';
    vocalBar.appendChild(vocalIcon); vocalBar.appendChild(vocalName); vocalBar.appendChild(vocalDur);
    vocalBar.addEventListener('dragover',e=>{e.preventDefault();vocalBar.style.background='rgba(255,34,102,.14)';});
    vocalBar.addEventListener('dragleave',()=>vocalBar.style.background='rgba(255,34,102,.04)');
    vocalBar.addEventListener('drop',async e=>{
      e.preventDefault(); vocalBar.style.background='rgba(255,34,102,.04)';
      const results = await Intake.ingestAll(e.dataTransfer.files, KERNEL.bus);
      const audio = results.find(r=>r.id==='audio:sample');
      if (audio) _pub('ui:load-vocal',{arrayBuffer:audio.arrayBuffer,name:audio.name});
    });

    /* ── Stage timeline canvas ── */
    const timelineWrap = document.createElement('div');
    timelineWrap.style.cssText = 'flex:1;position:relative;overflow:hidden;';
    const cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;cursor:ew-resize;';
    timelineWrap.appendChild(cvs);

    /* ── Stage param panel — appears when stage is clicked ── */
    const stagePanel = document.createElement('div');
    stagePanel.style.cssText = 'display:none;flex-direction:column;gap:6px;padding:8px 12px;border-top:1px solid var(--b1);background:var(--bg2);flex-shrink:0;';

    root.appendChild(topBar); root.appendChild(vocalBar);
    root.appendChild(timelineWrap); root.appendChild(stagePanel);
    content.appendChild(root);

    /* ── Stage state ── */
    const STAGES = [
      { id:'tension', label:'TENSION',  color:'#aa44ff', dur:4.0,  desc:'Dissonance builds. Filter closes.' },
      { id:'slope',   label:'SLOPE',    color:'#ffaa00', dur:2.0,  desc:'Density increases. BPM feel rises.' },
      { id:'build',   label:'BUILD',    color:'#00d4ff', dur:4.0,  desc:'Wobble + sub + noise sweep.' },
      { id:'drop',    label:'DROP',     color:'#ff2266', dur:8.0,  desc:'Impact + Reese + neuro burst.' },
    ];

    let _vocalLoaded  = false;
    let _vocalDur     = 0;
    let _vocalPos     = 0;    /* normalized 0-1 across total timeline */
    let _running      = false;
    let _cursorPos    = 0;    /* 0-1 sweeping cursor */
    let _activeStage  = null;
    let _dragging     = null; /* { type:'boundary'|'vocal', index } */

    function totalDur() { return STAGES.reduce((s,st)=>s+st.dur,0); }

    /* Boundary x positions normalized 0-1 */
    function boundaries() {
      let acc = 0;
      return STAGES.map(st => { const x = acc/totalDur(); acc+=st.dur; return x; }).concat([1]);
    }

    /* ── Canvas rendering ── */
    function draw() {
      requestAnimationFrame(draw);
      const W = cvs.offsetWidth, H = cvs.offsetHeight;
      if (!W || !H) return;
      if (cvs.width !== W || cvs.height !== H) { cvs.width = W; cvs.height = H; }
      const ctx = cvs.getContext('2d');
      ctx.clearRect(0, 0, W, H); ctx.fillStyle='#010308'; ctx.fillRect(0,0,W,H);

      const LABEL_H = 20;
      const VOCAL_H = 34;
      const STAGE_Y = LABEL_H + VOCAL_H;
      const STAGE_H = H - STAGE_Y - 20;
      const total   = totalDur();
      const bounds  = boundaries();

      /* ─ Time ruler ─ */
      const bpm = KERNEL.clock.BPM;
      const beatSec = 60/bpm, barSec = beatSec*4;
      ctx.fillStyle='var(--bg2)'; ctx.fillRect(0,0,W,LABEL_H);
      let t = 0;
      while (t <= total) {
        const x = (t/total)*W;
        const isBar = Math.abs(t%barSec)<.01;
        ctx.strokeStyle=isBar?'rgba(238,244,255,.2)':'rgba(238,244,255,.07)'; ctx.lineWidth=isBar?1:.5;
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,LABEL_H); ctx.stroke();
        if (isBar) {
          ctx.fillStyle='rgba(238,244,255,.3)'; ctx.font='6px "Share Tech Mono",monospace'; ctx.textAlign='left';
          ctx.fillText(`${t.toFixed(0)}s`, x+2, LABEL_H-4);
        }
        t += beatSec;
      }

      /* ─ Vocal lane ─ */
      ctx.fillStyle='rgba(255,34,102,.05)';
      ctx.fillRect(0, LABEL_H, W, VOCAL_H);
      ctx.strokeStyle='rgba(255,34,102,.2)'; ctx.lineWidth=.5;
      ctx.beginPath(); ctx.moveTo(0,LABEL_H+VOCAL_H); ctx.lineTo(W,LABEL_H+VOCAL_H); ctx.stroke();

      ctx.fillStyle='rgba(255,34,102,.25)'; ctx.font='6.5px "Share Tech Mono",monospace'; ctx.textAlign='left';
      ctx.fillText('VOCAL', 6, LABEL_H+VOCAL_H-6);

      if (_vocalLoaded) {
        const vx = _vocalPos * W;
        const vw = Math.max(20, (_vocalDur/total)*W);
        /* Clip body */
        ctx.fillStyle='rgba(255,34,102,.2)';
        ctx.fillRect(vx, LABEL_H+3, vw, VOCAL_H-8);
        ctx.strokeStyle='#ff2266'; ctx.lineWidth=1.5;
        ctx.strokeRect(vx, LABEL_H+3, vw, VOCAL_H-8);
        ctx.fillStyle='#ff2266'; ctx.font='7px "Share Tech Mono",monospace'; ctx.textAlign='left';
        ctx.fillText('🎤', vx+4, LABEL_H+VOCAL_H-9);
      } else {
        ctx.fillStyle='rgba(255,34,102,.15)'; ctx.font='7px "Share Tech Mono",monospace'; ctx.textAlign='center';
        ctx.fillText('← drag vocal clip here →', W/2, LABEL_H+VOCAL_H-8);
      }

      /* ─ Stage blocks ─ */
      STAGES.forEach((st, i) => {
        const x1 = bounds[i] * W;
        const x2 = bounds[i+1] * W;
        const isActive = _activeStage === st.id;

        /* Fill */
        ctx.fillStyle = st.color + (isActive ? '28' : '14');
        ctx.fillRect(x1+1, STAGE_Y, x2-x1-2, STAGE_H);

        /* Border */
        ctx.strokeStyle = st.color + (isActive ? 'cc' : '55');
        ctx.lineWidth = isActive ? 1.5 : 1;
        ctx.strokeRect(x1+1, STAGE_Y, x2-x1-2, STAGE_H);

        /* Waveform sketch — unique per stage */
        ctx.save();
        ctx.beginPath();
        ctx.rect(x1+1, STAGE_Y, x2-x1-2, STAGE_H);
        ctx.clip();
        ctx.strokeStyle = st.color+'88'; ctx.lineWidth = 1.2; ctx.beginPath();
        const pts = 80;
        for (let p = 0; p <= pts; p++) {
          const px = x1 + (p/pts)*(x2-x1);
          const progress = p/pts;
          let amp = 0;
          if (st.id==='tension') amp = Math.sin(p*.4)*Math.sin(p*.15+1)*progress*0.8 + Math.sin(p*.7)*progress*.3;
          if (st.id==='slope')   amp = (Math.sin(p*.6+p*.3)+Math.sin(p*1.1))*.5*progress;
          if (st.id==='build')   amp = (Math.sin(p*.08+p*.3)*Math.sin(p*.04))*0.8 + Math.sin(p*.5)*progress*.4;
          if (st.id==='drop')    amp = p===0?2:Math.sin(p*.2)*Math.exp(-p*.04)*2;
          const cy = STAGE_Y + STAGE_H/2 - amp*(STAGE_H*.38);
          p===0 ? ctx.moveTo(px,cy) : ctx.lineTo(px,cy);
        }
        ctx.stroke(); ctx.restore();

        /* Label */
        const blockW = x2 - x1;
        ctx.fillStyle = st.color; ctx.font=`bold ${Math.min(10,blockW*.07)}px "Orbitron",monospace`; ctx.textAlign='center';
        ctx.fillText(st.label, (x1+x2)/2, STAGE_Y + 14);
        ctx.fillStyle = st.color+'99'; ctx.font='6px "Share Tech Mono",monospace';
        ctx.fillText(`${st.dur.toFixed(1)}s`, (x1+x2)/2, STAGE_Y + 25);

        /* Duration handle — right edge */
        ctx.fillStyle = st.color+'cc';
        ctx.fillRect(x2-3, STAGE_Y, 3, STAGE_H);
        /* Handle grip dots */
        for (let d=0;d<3;d++) {
          ctx.fillStyle='rgba(255,255,255,.4)';
          ctx.fillRect(x2-2, STAGE_Y+STAGE_H/2-8+d*8, 1, 4);
        }
      });

      /* ─ Firing cursor ─ */
      if (_running) {
        const cx = _cursorPos * W;
        ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(cx, LABEL_H); ctx.lineTo(cx, H); ctx.stroke();
        ctx.fillStyle='white';
        ctx.beginPath(); ctx.moveTo(cx-4,LABEL_H); ctx.lineTo(cx+4,LABEL_H); ctx.lineTo(cx,LABEL_H+8); ctx.fill();
      }

      /* ─ Active stage glow ─ */
      if (_activeStage) {
        const i = STAGES.findIndex(s=>s.id===_activeStage);
        if (i>=0) {
          const x1=bounds[i]*W, x2=bounds[i+1]*W;
          ctx.save();
          ctx.shadowColor = STAGES[i].color; ctx.shadowBlur=16;
          ctx.strokeStyle = STAGES[i].color; ctx.lineWidth=2;
          ctx.strokeRect(x1+1,STAGE_Y,x2-x1-2,STAGE_H);
          ctx.restore();
        }
      }

      /* Total duration label */
      ctx.fillStyle='rgba(100,136,168,.4)'; ctx.font='6.5px "Share Tech Mono",monospace'; ctx.textAlign='right';
      ctx.fillText(`${total.toFixed(1)}s total`, W-6, H-5);
    }
    draw();

    /* ── Pointer interaction ── */
    const HANDLE_W = 10;
    const LABEL_H  = 20;
    const VOCAL_H  = 34;
    const STAGE_Y  = LABEL_H + VOCAL_H;

    function _getInteraction(e) {
      const r   = cvs.getBoundingClientRect();
      const x   = e.clientX - r.left;
      const y   = e.clientY - r.top;
      const W   = r.width;
      const H   = r.height;
      const total = totalDur();
      const bounds = boundaries();

      /* Vocal lane drag */
      if (y >= LABEL_H && y < LABEL_H + VOCAL_H && _vocalLoaded) {
        const vx = _vocalPos * W;
        const vw = Math.max(20, (_vocalDur/total)*W);
        if (x >= vx && x <= vx + vw) return { type:'vocal' };
      }

      /* Stage boundary handles */
      for (let i = 1; i < bounds.length - 1; i++) {
        const bx = bounds[i] * W;
        if (Math.abs(x - bx) < HANDLE_W && y >= STAGE_Y) return { type:'boundary', index:i };
      }

      /* Stage click to select */
      if (y >= STAGE_Y) {
        const frac = x / W;
        const idx  = bounds.findIndex((b,i) => frac >= b && frac < (bounds[i+1]||1));
        if (idx >= 0 && idx < STAGES.length) return { type:'stage', index:idx };
      }

      return null;
    }

    let _dragStartX = 0, _dragStartDur = 0, _dragStartVocalPos = 0;

    cvs.addEventListener('pointerdown', e => {
      const action = _getInteraction(e);
      if (!action) return;
      _dragging = action;
      _dragStartX = e.clientX;
      if (action.type === 'boundary') _dragStartDur = STAGES[action.index - 1].dur;
      if (action.type === 'vocal')    _dragStartVocalPos = _vocalPos;
      if (action.type === 'stage')    _selectStage(action.index);
      cvs.setPointerCapture(e.pointerId);
    });

    cvs.addEventListener('pointermove', e => {
      if (!_dragging) return;
      const r     = cvs.getBoundingClientRect();
      const dx    = e.clientX - _dragStartX;
      const total = totalDur();

      if (_dragging.type === 'boundary') {
        const idx = _dragging.index;
        const dSec = (dx / r.width) * total;
        const newDur = Math.max(0.5, _dragStartDur + dSec);
        STAGES[idx-1].dur = newDur;
        /* Push config update */
        const keys = ['tensionDur','slopeDur','buildDur'];
        _pub('ui:config-change', { key: keys[idx-1], value: newDur });
      }

      if (_dragging.type === 'vocal') {
        const newPos = Math.max(0, Math.min(0.95, _dragStartVocalPos + dx/r.width));
        _vocalPos = newPos;
        /* Convert to stage + offset */
        const absSec = newPos * totalDur();
        let acc = 0;
        for (let s = 0; s < STAGES.length; s++) {
          if (absSec < acc + STAGES[s].dur) {
            _pub('ui:config-change', { key:'vocalStage',  value: STAGES[s].id });
            _pub('ui:config-change', { key:'vocalOffset', value: absSec - acc });
            break;
          }
          acc += STAGES[s].dur;
        }
      }
    });

    cvs.addEventListener('pointerup', () => { _dragging = null; });

    /* Cursor style */
    cvs.addEventListener('mousemove', e => {
      const action = _getInteraction(e);
      cvs.style.cursor = action?.type === 'boundary' ? 'ew-resize' :
                         action?.type === 'vocal'    ? 'grab' :
                         action?.type === 'stage'    ? 'pointer' : 'default';
    });

    /* ── Stage panel (shown on stage click) ── */
    function _selectStage(idx) {
      _activeStage = STAGES[idx].id;
      stagePanel.style.display = 'flex';

      stagePanel.innerHTML = '';

      const st = STAGES[idx];
      const hdr = document.createElement('div');
      hdr.style.cssText = `display:flex;align-items:center;gap:8px;`;
      const dot = document.createElement('div'); dot.style.cssText=`width:8px;height:8px;border-radius:50%;background:${st.color};flex-shrink:0;box-shadow:0 0 6px ${st.color};`;
      const lbl = document.createElement('div'); lbl.style.cssText=`font-family:var(--orb);font-size:9px;font-weight:700;color:${st.color};letter-spacing:.16em;`; lbl.textContent=st.label;
      const desc= document.createElement('div'); desc.style.cssText=`font-family:var(--mono);font-size:7px;color:var(--dim2);letter-spacing:.06em;`; desc.textContent=st.desc;
      hdr.appendChild(dot); hdr.appendChild(lbl); hdr.appendChild(desc);
      stagePanel.appendChild(hdr);

      /* Stage-specific params */
      const paramRow = document.createElement('div');
      paramRow.style.cssText = 'display:flex;gap:14px;align-items:center;';

      function mkMiniParam(label, min, max, val, step, unit, key) {
        const wrap2 = document.createElement('div'); wrap2.style.cssText='display:flex;flex-direction:column;align-items:center;gap:2px;cursor:ns-resize;';
        const v  = document.createElement('div'); v.style.cssText=`font-family:var(--orb);font-size:12px;font-weight:700;color:${st.color};`; v.textContent=`${val}${unit}`;
        const l2 = document.createElement('div'); l2.style.cssText='font-family:var(--mono);font-size:6px;color:var(--dim);letter-spacing:.1em;'; l2.textContent=label;
        wrap2.appendChild(v); wrap2.appendChild(l2);
        let _d=false,_y=0,_v=val;
        wrap2.addEventListener('pointerdown',e=>{_d=true;_y=e.clientY;_v=parseFloat(v.textContent);wrap2.setPointerCapture(e.pointerId);});
        wrap2.addEventListener('pointermove',e=>{if(!_d)return;const nv=Math.max(min,Math.min(max,_v+(_y-e.clientY)*(max-min)/150));v.textContent=`${step<1?nv.toFixed(1):Math.round(nv)}${unit}`;_pub('ui:config-change',{key,value:+v.textContent.replace(unit,'')});});
        wrap2.addEventListener('pointerup',()=>_d=false);
        paramRow.appendChild(wrap2);
      }

      if (st.id==='tension') { mkMiniParam('INTENSITY',0,1,.6,.01,'',  'tensionIntensity'); }
      if (st.id==='slope')   { mkMiniParam('DENSITY',  0,1,.7,.01,'',  'slopeDensity'); }
      if (st.id==='build')   {
        mkMiniParam('W.RATE', .5,16,6,.5,'Hz','wobbleRate');
        mkMiniParam('W.CUTOFF',100,4000,600,10,'Hz','wobbleCutoff');
        mkMiniParam('W.RES',1,20,8,.5,'','wobbleRes');
      }
      if (st.id==='drop')    { mkMiniParam('DRIVE',0,1,.6,.01,'','drive'); }

      stagePanel.appendChild(paramRow);
    }

    /* ── Engine state sync ── */
    sBus.subscribe('org:state-sync', ({ running, vocalLoaded, vocalName, params }) => {
      if (running !== undefined) {
        _running = running;
        fireBtn.textContent  = running ? '■  STOP' : '⚡ FIRE';
        fireBtn.style.borderColor = running ? '#00ff88' : '#ff2266';
        fireBtn.style.color       = running ? '#00ff88' : '#ff2266';
        fireBtn.style.background  = running ? 'rgba(0,255,136,.1)' : 'rgba(255,34,102,.1)';
      }
      if (vocalLoaded !== undefined) _vocalLoaded = vocalLoaded;
      if (params) {
        ['tensionDur','slopeDur','buildDur'].forEach((k,i) => { if(params[k]) STAGES[i].dur=params[k]; });
      }
    });

    sBus.subscribe('org:vocal-loaded', ({ name, duration }) => {
      _vocalLoaded = true;
      _vocalDur    = duration || 3;
      vocalName.textContent = name;
      vocalName.style.color = '#ff2266';
      vocalBar.style.background = 'rgba(255,34,102,.08)';
    });

    sBus.subscribe('org:stage-active', ({ stage }) => {
      _activeStage = stage;
      /* Advance cursor to that stage's position */
      const bounds = boundaries();
      const idx    = STAGES.findIndex(s => s.id === stage);
      if (idx >= 0) _cursorPos = bounds[idx] + (bounds[idx+1]-bounds[idx])*0.5;
    });

    sBus.subscribe('org:drop-fired', () => {
      _running = true; _cursorPos = 0;
      fireBtn.style.boxShadow='0 0 30px rgba(255,34,102,.7)';
      let t = 0;
      const total = totalDur();
      const tick = () => {
        if (!_running || t >= 1) { _cursorPos=0; _running=false; fireBtn.style.boxShadow=''; return; }
        t += 0.016 / total;
        _cursorPos = t;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    sBus.subscribe('kernel:bpm-change', ({ BPM }) => { bpmVal.textContent = BPM; });
  },
});

/* ═══════════════════════════════════════════════════════
   SUPERSAW — 7-voice detuned unison lead
═══════════════════════════════════════════════════════ */
reg('supersaw', {
  category:'Audio — Lead Synths', summary:'7-voice detuned supersaw lead/pluck.', needs:[],
  label:'Supersaw', icon:'🌟', accent:'#ffd400',
  width:260, height:320, minWidth:220, minHeight:260,
  mountEngine(instanceId, intakeResult, sBus) { SupersawEngine.mount(instanceId, sBus, KERNEL.audio, {}); },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='padding:10px;display:flex;flex-direction:column;gap:8px;height:100%;';
    const kRow=document.createElement('div'); kRow.style.cssText='display:flex;gap:6px;justify-content:center;flex-wrap:wrap;';
    mkKnob(kRow,{label:'PITCH', min:24,max:96,  value:60, step:1,  unit:'',  eventKey:'pitch', pub:_pub});
    mkKnob(kRow,{label:'VOICES',min:3, max:7,   value:7,  step:1,  unit:'',  eventKey:'voices',pub:_pub});
    mkKnob(kRow,{label:'DETUNE',min:0, max:50,  value:18, step:1,  unit:'¢', eventKey:'detune',pub:_pub});
    mkKnob(kRow,{label:'SPREAD',min:0, max:1,   value:.6, step:.01,unit:'',  eventKey:'spread',pub:_pub});
    mkKnob(kRow,{label:'CUTOFF',min:200,max:12000,value:5000,step:50,unit:'Hz',eventKey:'cutoff',pub:_pub});
    mkKnob(kRow,{label:'DECAY', min:.05,max:3,  value:.6, step:.01,unit:'s', eventKey:'decay', pub:_pub});
    mkScope(wrap,{height:44,color:'rgba(255,212,0,.45)'});
    mkDiv(wrap);
    const btnRow=document.createElement('div'); btnRow.style.cssText='display:flex;gap:6px;';
    mkBtn(btnRow,'▶ TRIGGER', ()=>_pub('ui:supersaw_trigger',{vel:1}), {h:24,fs:8});
    const sustainBtn=mkBtn(btnRow,'◉ SUSTAIN', ()=>{
      sustainBtn.dataset.on = sustainBtn.dataset.on ? '' : '1';
      sustainBtn.style.borderColor = sustainBtn.dataset.on ? 'var(--accent)' : 'var(--b2)';
      sustainBtn.style.color = sustainBtn.dataset.on ? 'var(--accent)' : 'var(--dim2)';
      _pub('ui:supersaw_toggle',{});
    }, {h:24,fs:8});
    wrap.appendChild(btnRow);
    wrap.appendChild(kRow); content.appendChild(wrap);
  },
});

/* ═══════════════════════════════════════════════════════
   SIDECHAIN — ducks master bus on kick/808/snare/clap
═══════════════════════════════════════════════════════ */
reg('sidechain-compressor', {
  category:'Audio — Dynamics', summary:'Ducks the master bus on a chosen trigger sound — the EDM pump.', needs:[],
  label:'Sidechain', icon:'🫀', accent:'#00d4ff',
  width:230, height:250, minWidth:200, minHeight:220,
  mountEngine(instanceId, intakeResult, sBus) { SidechainCompressorEngine.mount(instanceId, sBus, KERNEL.audio, {}); },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='padding:10px;display:flex;flex-direction:column;gap:10px;height:100%;';
    mkSelect(wrap,{label:'SOURCE',options:['kick','808','snare','clap'],value:'kick',eventKey:'source',pub:_pub});
    const kRow=document.createElement('div'); kRow.style.cssText='display:flex;gap:8px;justify-content:center;';
    mkKnob(kRow,{label:'AMOUNT', min:0,   max:1,  value:.7, step:.01,unit:'',eventKey:'amount', pub:_pub});
    mkKnob(kRow,{label:'ATTACK', min:.001,max:.2, value:.005,step:.001,unit:'s',eventKey:'attack',pub:_pub});
    mkKnob(kRow,{label:'RELEASE',min:.02, max:1.5,value:.28,step:.01,unit:'s',eventKey:'release',pub:_pub});
    wrap.appendChild(kRow);
    mkToggle(wrap,{label:'ENABLED',value:true,eventKey:'enabled',pub:_pub});
    mkBtn(wrap,'TEST PUMP', ()=>_pub('ui:sidechain_test',{}), {h:22,fs:7});
    const info=document.createElement('div'); info.style.cssText='font-family:var(--mono);font-size:6px;color:var(--dim);line-height:1.5;';
    info.textContent='Ducks the shared master gain every time SOURCE fires on the bus — affects the whole mix, not just one channel.';
    wrap.appendChild(info);
    content.appendChild(wrap);
  },
});

/* ═══════════════════════════════════════════════════════
   MASTER FX — reverb / delay / compressor control surface
═══════════════════════════════════════════════════════ */
reg('master-fx', {
  category:'Audio — Mixing', summary:'Control surface for the shared reverb/delay/compressor send bus.', needs:[],
  label:'Master FX', icon:'🎛', accent:'#00ff88',
  width:280, height:300, minWidth:240, minHeight:260,
  mountEngine(instanceId, intakeResult, sBus) { MasterFXEngine.mount(instanceId, sBus, KERNEL.audio, {}); },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='padding:10px;display:flex;flex-direction:column;gap:10px;height:100%;';
    const revLbl=document.createElement('div'); revLbl.style.cssText='font-family:var(--mono);font-size:7px;letter-spacing:.14em;color:var(--accent);'; revLbl.textContent='REVERB SEND';
    wrap.appendChild(revLbl);
    const rRow=document.createElement('div'); rRow.style.cssText='display:flex;gap:8px;justify-content:center;';
    mkKnob(rRow,{label:'MIX',  min:0,  max:1, value:.35,step:.01,unit:'',eventKey:'reverbMix',  pub:_pub});
    mkKnob(rRow,{label:'SIZE', min:.2, max:6, value:2.4,step:.05,unit:'s',eventKey:'reverbTime', pub:_pub});
    mkKnob(rRow,{label:'DECAY',min:.5, max:8, value:3.2,step:.1,unit:'', eventKey:'reverbDecay',pub:_pub});
    wrap.appendChild(rRow);
    mkDiv(wrap);
    const delLbl=document.createElement('div'); delLbl.style.cssText='font-family:var(--mono);font-size:7px;letter-spacing:.14em;color:var(--accent2);'; delLbl.textContent='DELAY SEND';
    wrap.appendChild(delLbl);
    const dRow=document.createElement('div'); dRow.style.cssText='display:flex;gap:8px;justify-content:center;';
    mkKnob(dRow,{label:'MIX', min:0,  max:1,  value:.28,step:.01,unit:'',eventKey:'delayMix', pub:_pub});
    mkKnob(dRow,{label:'TIME',min:.02,max:1.5,value:.32,step:.01,unit:'s',eventKey:'delayTime',pub:_pub});
    mkKnob(dRow,{label:'FDBK',min:0,  max:.92,value:.35,step:.01,unit:'',eventKey:'delayFB',  pub:_pub});
    wrap.appendChild(dRow);
    mkDiv(wrap);
    const cLbl=document.createElement('div'); cLbl.style.cssText='font-family:var(--mono);font-size:7px;letter-spacing:.14em;color:var(--dim2);'; cLbl.textContent='MASTER COMPRESSOR';
    wrap.appendChild(cLbl);
    const cRow=document.createElement('div'); cRow.style.cssText='display:flex;gap:8px;justify-content:center;';
    mkKnob(cRow,{label:'THRESH',min:-60,max:0, value:-24,step:1,unit:'dB',eventKey:'compThresh',pub:_pub});
    mkKnob(cRow,{label:'RATIO', min:1,  max:20,value:12, step:1,unit:':1',eventKey:'compRatio', pub:_pub});
    wrap.appendChild(cRow);
    content.appendChild(wrap);
  },
});

/* ═══════════════════════════════════════════════════════
   PHOTO EDITOR — canvas filter pipeline, crop, PNG export
═══════════════════════════════════════════════════════ */
reg('photo-editor', {
  category:'Image', summary:'Raster image editor: filters, crop, PNG export.', needs:[],
  label:'Photo Editor', icon:'🖼', accent:'#00d4ff',
  width:380, height:460, minWidth:300, minHeight:360,
  mountEngine(instanceId, intakeResult, sBus, userConfig) {
    /* Mounted once inside buildUI instead — buildUI needs the live engine
       instance to call draw()/applyCrop()/exportPNG() directly, and
       spawn() runs buildUI before mountEngine, so mounting here too would
       create a second, independent, orphaned engine instance. */
  },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='padding:8px;display:flex;flex-direction:column;gap:6px;height:100%;';

    const dropZone=document.createElement('div');
    dropZone.style.cssText='flex:1;min-height:120px;border:1px dashed var(--b2);border-radius:5px;position:relative;overflow:hidden;background:var(--bg2);display:flex;align-items:center;justify-content:center;';
    const canvas=document.createElement('canvas'); canvas.style.cssText='max-width:100%;max-height:100%;display:none;';
    const hint=document.createElement('div'); hint.style.cssText='font-family:var(--mono);font-size:7px;color:var(--dim);text-align:center;padding:8px;';
    hint.textContent='Drop an image here or click to choose a file';
    dropZone.appendChild(canvas); dropZone.appendChild(hint);
    wrap.appendChild(dropZone);

    const fileInput=document.createElement('input'); fileInput.type='file'; fileInput.accept='image/*'; fileInput.style.display='none';
    wrap.appendChild(fileInput);

    let engine=null;
    let cropRect=null, cropStart=null;

    function redraw(){ if(engine) engine.draw(canvas); }

    async function handleFile(file){
      if(!file || !file.type.startsWith('image/')) return;
      await window.__photoEngines[instanceId].loadFile(file);
      engine = window.__photoEngines[instanceId];
      canvas.style.display='block'; hint.style.display='none';
      redraw();
    }

    dropZone.addEventListener('click', ()=>fileInput.click());
    fileInput.addEventListener('change', e=>handleFile(e.target.files[0]));
    dropZone.addEventListener('dragover', e=>{e.preventDefault(); dropZone.style.borderColor='var(--accent)';});
    dropZone.addEventListener('dragleave', ()=>dropZone.style.borderColor='var(--b2)');
    dropZone.addEventListener('drop', e=>{ e.preventDefault(); dropZone.style.borderColor='var(--b2)'; handleFile(e.dataTransfer.files[0]); });

    /* Crop by drag on the canvas */
    let cropBox=null;
    canvas.addEventListener('pointerdown', e=>{
      if(!engine || !engine.image) return;
      const r=canvas.getBoundingClientRect();
      const sx=canvas.width/r.width, sy=canvas.height/r.height;
      cropStart={x:(e.clientX-r.left)*sx, y:(e.clientY-r.top)*sy};
      if(cropBox) cropBox.remove();
      cropBox=document.createElement('div');
      cropBox.style.cssText='position:absolute;border:1.5px dashed var(--accent);pointer-events:none;';
      dropZone.appendChild(cropBox);
    });
    canvas.addEventListener('pointermove', e=>{
      if(!cropStart) return;
      const r=canvas.getBoundingClientRect();
      const cx=e.clientX-r.left, cy=e.clientY-r.top;
      const sx0=(cropStart.x/canvas.width)*r.width, sy0=(cropStart.y/canvas.height)*r.height;
      const x=Math.min(sx0,cx), y=Math.min(sy0,cy), w=Math.abs(cx-sx0), h=Math.abs(cy-sy0);
      cropBox.style.left=x+'px'; cropBox.style.top=y+'px'; cropBox.style.width=w+'px'; cropBox.style.height=h+'px';
      const sx=canvas.width/r.width, sy=canvas.height/r.height;
      cropRect={x:Math.min(cropStart.x,(cx)*sx), y:Math.min(cropStart.y,(cy)*sy), w:w*sx, h:h*sy};
    });
    canvas.addEventListener('pointerup', ()=>{ cropStart=null; });

    const btnRow=document.createElement('div'); btnRow.style.cssText='display:flex;gap:6px;';
    mkBtn(btnRow,'APPLY CROP', async ()=>{ if(engine && cropRect && cropRect.w>4 && cropRect.h>4){ await engine.applyCrop(canvas, cropRect); if(cropBox) cropBox.remove(); cropRect=null; redraw(); } }, {h:22,fs:7});
    mkBtn(btnRow,'⬇ EXPORT PNG', ()=>{ if(engine) engine.exportPNG(canvas); }, {h:22,fs:7});
    mkBtn(btnRow,'RESET', ()=>{ _pub('ui:config_change',{key:'__reset',value:true}); ['brightness','contrast','saturation','hue','blur','grayscale','invert','sepia'].forEach(k=>{}); redraw(); }, {h:22,fs:7});
    wrap.appendChild(btnRow);

    const kRow=document.createElement('div'); kRow.style.cssText='display:flex;gap:5px;justify-content:center;flex-wrap:wrap;';
    mkKnob(kRow,{label:'BRIGHT',min:0,max:2,  value:1,step:.01,unit:'',onChange:redraw,eventKey:'brightness',pub:_pub});
    mkKnob(kRow,{label:'CONTR', min:0,max:2,  value:1,step:.01,unit:'',onChange:redraw,eventKey:'contrast', pub:_pub});
    mkKnob(kRow,{label:'SAT',   min:0,max:3,  value:1,step:.01,unit:'',onChange:redraw,eventKey:'saturation',pub:_pub});
    mkKnob(kRow,{label:'HUE',   min:0,max:360,value:0,step:1,  unit:'°',onChange:redraw,eventKey:'hue',pub:_pub});
    mkKnob(kRow,{label:'BLUR',  min:0,max:20, value:0,step:.1, unit:'px',onChange:redraw,eventKey:'blur',pub:_pub});
    mkKnob(kRow,{label:'GRAY',  min:0,max:1,  value:0,step:.01,unit:'',onChange:redraw,eventKey:'grayscale',pub:_pub});
    mkKnob(kRow,{label:'INVERT',min:0,max:1,  value:0,step:.01,unit:'',onChange:redraw,eventKey:'invert',pub:_pub});
    mkKnob(kRow,{label:'SEPIA', min:0,max:1,  value:0,step:.01,unit:'',onChange:redraw,eventKey:'sepia',pub:_pub});
    wrap.appendChild(kRow);

    content.appendChild(wrap);

    /* PhotoEditorEngine keeps its own param state; buildUI needs a handle
       to call draw()/applyCrop()/exportPNG(). Stash instances by id since
       mountEngine runs in a different `this` context than buildUI. */
    window.__photoEngines = window.__photoEngines || {};
    window.__photoEngines[instanceId] = PhotoEditorEngine.mount(instanceId, sBus, {});
    engine = window.__photoEngines[instanceId];

    KERNEL.bus.subscribe('ui:config_change:' + instanceId, () => redraw());
  },
});

/* ═══════════════════════════════════════════════════════
   VIDEO EDITOR — trim + live filter + MediaRecorder export
═══════════════════════════════════════════════════════ */
reg('video-editor', {
  category:'Video', summary:'Trim, filter, and re-export video clips client-side.', needs:[],
  label:'Video Editor', icon:'🎬', accent:'#ff2266',
  width:400, height:480, minWidth:320, minHeight:380,
  mountEngine(instanceId, intakeResult, sBus) {},
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='padding:8px;display:flex;flex-direction:column;gap:6px;height:100%;';

    const stage=document.createElement('div');
    stage.style.cssText='flex:1;min-height:140px;border:1px dashed var(--b2);border-radius:5px;position:relative;overflow:hidden;background:#000;display:flex;align-items:center;justify-content:center;';
    const canvas=document.createElement('canvas'); canvas.style.cssText='max-width:100%;max-height:100%;display:none;';
    const hint=document.createElement('div'); hint.style.cssText='font-family:var(--mono);font-size:7px;color:var(--dim);text-align:center;padding:8px;';
    hint.textContent='Drop a video file here or click to choose one';
    stage.appendChild(canvas); stage.appendChild(hint);
    wrap.appendChild(stage);

    const fileInput=document.createElement('input'); fileInput.type='file'; fileInput.accept='video/*'; fileInput.style.display='none';
    wrap.appendChild(fileInput);

    window.__videoEngines = window.__videoEngines || {};
    const engine = VideoEditorEngine.mount(instanceId, sBus, {});
    window.__videoEngines[instanceId] = engine;

    let rafId=null;
    function loop(){ engine.drawFrame(canvas); rafId=requestAnimationFrame(loop); }

    async function handleFile(file){
      if(!file || !file.type.startsWith('video/')) return;
      const v = await engine.loadFile(file);
      canvas.style.display='block'; hint.style.display='none';
      inSlider.max=v.duration; outSlider.max=v.duration; outSlider.value=v.duration;
      timeLbl.textContent = `0.00s → ${v.duration.toFixed(2)}s`;
      cancelAnimationFrame(rafId); loop();
    }

    stage.addEventListener('click', ()=>{ if(!engine.video) fileInput.click(); });
    fileInput.addEventListener('change', e=>handleFile(e.target.files[0]));
    stage.addEventListener('dragover', e=>{e.preventDefault(); stage.style.borderColor='var(--accent2)';});
    stage.addEventListener('dragleave', ()=>stage.style.borderColor='var(--b2)');
    stage.addEventListener('drop', e=>{ e.preventDefault(); stage.style.borderColor='var(--b2)'; handleFile(e.dataTransfer.files[0]); });

    const trimRow=document.createElement('div'); trimRow.style.cssText='display:flex;flex-direction:column;gap:3px;';
    const timeLbl=document.createElement('div'); timeLbl.style.cssText='font-family:var(--mono);font-size:6.5px;color:var(--dim2);'; timeLbl.textContent='0.00s → 0.00s';
    const inSlider=document.createElement('input'); inSlider.type='range'; inSlider.min=0; inSlider.max=1; inSlider.step=.01; inSlider.value=0;
    const outSlider=document.createElement('input'); outSlider.type='range'; outSlider.min=0; outSlider.max=1; outSlider.step=.01; outSlider.value=1;
    [inSlider,outSlider].forEach(s=>s.style.cssText='width:100%;accent-color:var(--accent2);');
    inSlider.addEventListener('input', ()=>{ _pub('ui:config_change',{key:'inPoint',value:parseFloat(inSlider.value)}); timeLbl.textContent=`${(+inSlider.value).toFixed(2)}s → ${(+outSlider.value).toFixed(2)}s`; });
    outSlider.addEventListener('input', ()=>{ _pub('ui:config_change',{key:'outPoint',value:parseFloat(outSlider.value)}); timeLbl.textContent=`${(+inSlider.value).toFixed(2)}s → ${(+outSlider.value).toFixed(2)}s`; });
    trimRow.appendChild(timeLbl); trimRow.appendChild(inSlider); trimRow.appendChild(outSlider);
    wrap.appendChild(trimRow);

    const kRow=document.createElement('div'); kRow.style.cssText='display:flex;gap:5px;justify-content:center;flex-wrap:wrap;';
    mkKnob(kRow,{label:'BRIGHT',min:0,max:2,  value:1,step:.01,unit:'',eventKey:'brightness',pub:_pub});
    mkKnob(kRow,{label:'CONTR', min:0,max:2,  value:1,step:.01,unit:'',eventKey:'contrast', pub:_pub});
    mkKnob(kRow,{label:'SAT',   min:0,max:3,  value:1,step:.01,unit:'',eventKey:'saturation',pub:_pub});
    mkKnob(kRow,{label:'HUE',   min:0,max:360,value:0,step:1,  unit:'°',eventKey:'hue',pub:_pub});
    mkKnob(kRow,{label:'BLUR',  min:0,max:12, value:0,step:.1, unit:'px',eventKey:'blur',pub:_pub});
    mkKnob(kRow,{label:'GRAY',  min:0,max:1,  value:0,step:.01,unit:'',eventKey:'grayscale',pub:_pub});
    wrap.appendChild(kRow);

    const btnRow=document.createElement('div'); btnRow.style.cssText='display:flex;gap:6px;';
    const exportBtn=mkBtn(btnRow,'⏺ EXPORT WEBM', ()=>{
      exportBtn.textContent='● RECORDING…'; exportBtn.disabled=true;
      engine.exportClip(canvas, ()=>{ exportBtn.textContent='⏺ EXPORT WEBM'; exportBtn.disabled=false; });
    }, {h:22,fs:7});
    wrap.appendChild(btnRow);

    content.appendChild(wrap);
  },
});

/* ═══════════════════════════════════════════════════════
   SERIAL BRIDGE — Web Serial hardware I/O (robotics)
═══════════════════════════════════════════════════════ */
reg('serial-bridge', {
  category:'Robotics', summary:'Web Serial connection to real hardware — GRBL/Arduino/steppers.', needs:[],
  label:'Serial Bridge', icon:'🤖', accent:'#00ff88',
  width:300, height:340, minWidth:260, minHeight:280,
  mountEngine(instanceId, intakeResult, sBus) {
    window.__serialEngines = window.__serialEngines || {};
    window.__serialEngines[instanceId] = SerialBridgeEngine.mount(instanceId, sBus, {});
  },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='padding:10px;display:flex;flex-direction:column;gap:8px;height:100%;';

    const statusRow=document.createElement('div'); statusRow.style.cssText='display:flex;align-items:center;gap:6px;';
    const led=document.createElement('div'); led.style.cssText='width:7px;height:7px;border-radius:50%;background:var(--dim);flex-shrink:0;';
    const statusTxt=document.createElement('div'); statusTxt.style.cssText='font-family:var(--mono);font-size:7px;color:var(--dim2);'; statusTxt.textContent='DISCONNECTED';
    statusRow.appendChild(led); statusRow.appendChild(statusTxt);
    wrap.appendChild(statusRow);

    if (typeof navigator === 'undefined' || !navigator.serial) {
      const warn=document.createElement('div'); warn.style.cssText='font-family:var(--mono);font-size:6.5px;color:#ff2266;line-height:1.5;';
      warn.textContent='Web Serial not available — needs a Chromium browser (Chrome/Edge/Opera). Firefox and Safari do not implement it.';
      wrap.appendChild(warn);
    }

    mkSelect(wrap,{label:'BAUD',options:[9600,19200,38400,57600,115200,250000],value:115200,eventKey:'baudRate',pub:_pub});
    mkSelect(wrap,{label:'MAP', options:[{v:'off',l:'off'},{v:'xy_to_gcode',l:'XY→G-code'},{v:'trigger_to_line',l:'trigger→line'}],value:'off',eventKey:'mapMode',pub:_pub});

    const btnRow=document.createElement('div'); btnRow.style.cssText='display:flex;gap:6px;';
    const connectBtn=mkBtn(btnRow,'CONNECT', ()=>_pub('ui:serial_connect',{}), {h:22,fs:7});
    const disconnectBtn=mkBtn(btnRow,'DISCONNECT', ()=>_pub('ui:serial_disconnect',{}), {h:22,fs:7});
    wrap.appendChild(btnRow);

    const cmdRow=document.createElement('div'); cmdRow.style.cssText='display:flex;gap:4px;';
    const cmdInput=document.createElement('input'); cmdInput.type='text'; cmdInput.placeholder='G1 X10 Y0 F1000';
    cmdInput.style.cssText='flex:1;background:var(--bg3);border:1px solid var(--b2);border-radius:3px;color:var(--white);font-family:var(--mono);font-size:7.5px;padding:4px 6px;outline:none;';
    const sendBtn=mkBtn(cmdRow,'SEND', ()=>{ if(cmdInput.value.trim()){ _pub('ui:serial_send',{line:cmdInput.value.trim()}); cmdInput.value=''; } }, {h:24,fs:7});
    cmdInput.addEventListener('keydown', e=>{ if(e.key==='Enter') sendBtn.click(); });
    cmdRow.prepend(cmdInput);
    wrap.appendChild(cmdRow);

    const log=document.createElement('div');
    log.style.cssText='flex:1;min-height:70px;background:var(--bg2);border:1px solid var(--b1);border-radius:4px;padding:5px;font-family:var(--mono);font-size:6px;color:var(--dim2);overflow-y:auto;white-space:pre-wrap;';
    wrap.appendChild(log);

    function appendLog(line){ log.textContent += line + '\n'; log.scrollTop = log.scrollHeight; }

    sBus.subscribe('org:connected', ()=>{ led.style.background='var(--accent)'; led.style.boxShadow='0 0 5px var(--accent)'; statusTxt.textContent='CONNECTED'; appendLog('[connected]'); });
    sBus.subscribe('org:disconnected', ()=>{ led.style.background='var(--dim)'; led.style.boxShadow=''; statusTxt.textContent='DISCONNECTED'; appendLog('[disconnected]'); });
    sBus.subscribe('org:error', ({message})=>appendLog('[error] '+message));
    sBus.subscribe('org:tx', ({line})=>appendLog('→ '+line));
    sBus.subscribe('org:rx', ({line})=>appendLog('← '+line));

    content.appendChild(wrap);
  },
});

/* ═══════════════════════════════════════════════════════
   MACRO AUTOMATION — record/replay any organism's params
═══════════════════════════════════════════════════════ */
reg('macro-automation', {
  category:'Automation', summary:'Records and replays another organism\'s parameter changes over time.', needs:[],
  label:'Macro Automation', icon:'⏺', accent:'#ffaa00',
  width:280, height:320, minWidth:240, minHeight:270,
  mountEngine(instanceId, intakeResult, sBus) {
    window.__macroEngines = window.__macroEngines || {};
    window.__macroEngines[instanceId] = MacroAutomationEngine.mount(instanceId, sBus, {});
  },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='padding:10px;display:flex;flex-direction:column;gap:8px;height:100%;';

    const targetSel=document.createElement('select');
    targetSel.style.cssText='background:var(--bg3);border:1px solid var(--b2);border-radius:3px;color:var(--white);font-family:var(--mono);font-size:7.5px;padding:4px;outline:none;';
    function refreshTargets(){
      const cur=targetSel.value;
      targetSel.innerHTML='';
      const none=document.createElement('option'); none.value=''; none.textContent='— choose target —'; targetSel.appendChild(none);
      (KERNEL.registry.all()||[]).forEach(o=>{
        if(o.instanceId===instanceId) return;
        const opt=document.createElement('option'); opt.value=o.instanceId; opt.textContent=o.label+' ('+o.instanceId.slice(-5)+')';
        targetSel.appendChild(opt);
      });
      if(cur) targetSel.value=cur;
    }
    refreshTargets();
    targetSel.addEventListener('mousedown', refreshTargets);
    targetSel.addEventListener('change', ()=>_pub('ui:config_change',{key:'targetInstanceId',value:targetSel.value}));
    wrap.appendChild(targetSel);

    mkToggle(wrap,{label:'LOOP',value:true,eventKey:'loop',pub:_pub});
    const kRow=document.createElement('div'); kRow.style.cssText='display:flex;justify-content:center;';
    mkKnob(kRow,{label:'SPEED',min:.25,max:4,value:1,step:.05,unit:'x',eventKey:'speed',pub:_pub});
    wrap.appendChild(kRow);

    const statusTxt=document.createElement('div'); statusTxt.style.cssText='font-family:var(--mono);font-size:7px;color:var(--dim2);text-align:center;'; statusTxt.textContent='0 events recorded';
    wrap.appendChild(statusTxt);

    const btnRow=document.createElement('div'); btnRow.style.cssText='display:flex;gap:5px;flex-wrap:wrap;';
    const armBtn=mkBtn(btnRow,'⏺ ARM', ()=>_pub('ui:macro_arm',{}), {h:22,fs:7});
    mkBtn(btnRow,'■ STOP REC', ()=>_pub('ui:macro_stop_rec',{}), {h:22,fs:7});
    mkBtn(btnRow,'▶ PLAY', ()=>_pub('ui:macro_play',{}), {h:22,fs:7});
    mkBtn(btnRow,'■ STOP', ()=>_pub('ui:macro_stop',{}), {h:22,fs:7});
    mkBtn(btnRow,'CLEAR', ()=>_pub('ui:macro_clear',{}), {h:22,fs:7});
    wrap.appendChild(btnRow);

    sBus.subscribe('org:state_sync', ({recording,playing,count})=>{
      statusTxt.textContent = `${count||0} events` + (recording?' — RECORDING':'') + (playing?' — PLAYING':'');
      statusTxt.style.color = recording ? '#ff2266' : playing ? 'var(--accent)' : 'var(--dim2)';
    });
    sBus.subscribe('org:error', ({message})=>{ statusTxt.textContent=message; statusTxt.style.color='#ff2266'; });

    content.appendChild(wrap);
  },
});

/* ═══════════════════════════════════════════════════════
   WEBHOOK AUTOMATION — bus events → external HTTP triggers
═══════════════════════════════════════════════════════ */
reg('webhook-automation', {
  category:'Automation', summary:'Fires an HTTP request to an external automation tool on any bus event.', needs:[],
  label:'Webhook Automation', icon:'🌐', accent:'#ff2266',
  width:300, height:340, minWidth:260, minHeight:290,
  mountEngine(instanceId, intakeResult, sBus) {
    window.__webhookEngines = window.__webhookEngines || {};
    window.__webhookEngines[instanceId] = WebhookAutomationEngine.mount(instanceId, sBus, {});
  },
  buildUI(content, intakeResult, instanceId, sBus, _pub) {
    const wrap=document.createElement('div'); wrap.style.cssText='padding:10px;display:flex;flex-direction:column;gap:7px;height:100%;';

    const urlInput=document.createElement('input'); urlInput.type='text'; urlInput.placeholder='https://your-automation-tool/webhook/xyz';
    urlInput.style.cssText='background:var(--bg3);border:1px solid var(--b2);border-radius:3px;color:var(--white);font-family:var(--mono);font-size:7px;padding:5px 6px;outline:none;';
    urlInput.addEventListener('change', ()=>_pub('ui:config_change',{key:'url',value:urlInput.value.trim()}));
    wrap.appendChild(urlInput);

    mkSelect(wrap,{label:'METHOD',options:['POST','GET'],value:'POST',eventKey:'method',pub:_pub});
    mkSelect(wrap,{label:'ON',options:[
      {v:'pad:trigger',l:'pad trigger'},{v:'kernel:bpm-change',l:'bpm change'},{v:'serial:rx',l:'serial rx'},
      {v:'photo:exported',l:'photo exported'},{v:'video:exported',l:'video exported'},{v:'org:pumped',l:'sidechain pump'}
    ],value:'pad:trigger',eventKey:'triggerTopic',pub:_pub});

    const filterInput=document.createElement('input'); filterInput.type='text'; filterInput.placeholder='sound filter (e.g. kick) — blank = any';
    filterInput.style.cssText='background:var(--bg3);border:1px solid var(--b2);border-radius:3px;color:var(--white);font-family:var(--mono);font-size:7px;padding:5px 6px;outline:none;';
    filterInput.addEventListener('change', ()=>_pub('ui:config_change',{key:'soundFilter',value:filterInput.value.trim()}));
    wrap.appendChild(filterInput);

    mkToggle(wrap,{label:'NO-CORS (fire and forget)',value:false,eventKey:'noCors',pub:_pub});
    const kRow=document.createElement('div'); kRow.style.cssText='display:flex;justify-content:center;';
    mkKnob(kRow,{label:'RATE LIMIT',min:0,max:5000,value:250,step:10,unit:'ms',eventKey:'rateLimitMs',pub:_pub});
    wrap.appendChild(kRow);

    mkBtn(wrap,'TEST FIRE', ()=>_pub('ui:webhook_test',{}), {h:22,fs:7});

    const log=document.createElement('div');
    log.style.cssText='flex:1;min-height:50px;background:var(--bg2);border:1px solid var(--b1);border-radius:4px;padding:5px;font-family:var(--mono);font-size:6px;color:var(--dim2);overflow-y:auto;white-space:pre-wrap;';
    wrap.appendChild(log);
    sBus.subscribe('org:log', ({level,message})=>{ log.textContent += `[${level}] ${message}\n`; log.scrollTop=log.scrollHeight; });

    content.appendChild(wrap);
  },
});

return { spawn, defs, reg };
})();

---

# runtime/precision-clock.worklet.js

/* ═══════════════════════════════════════════════════════════
   PRECISION CLOCK WORKLET  v1.0.0
   runtime/precision-clock.worklet.js

   Runs on the audio thread — completely isolated from the
   JavaScript main thread, GC, rendering, and event loop.

   Fires a tick message to the main thread every process()
   call (~2.9ms at 44.1kHz / 128 samples). Main thread
   uses these ticks to drive the lookahead scheduler.

   This file is loaded via AudioContext.audioWorklet.addModule()
   ═══════════════════════════════════════════════════════════ */

class PrecisionClockProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._running    = false;
    this._interval   = 0;      /* samples between ticks */
    this._phase      = 0;      /* sample counter */
    this._sampleRate = sampleRate;

    this.port.onmessage = ({ data }) => {
      if (data.type === 'start') {
        this._running  = true;
        this._interval = Math.round(this._sampleRate * data.intervalSec);
        this._phase    = 0;
      }
      if (data.type === 'stop') {
        this._running = false;
        this._phase   = 0;
      }
      if (data.type === 'set-interval') {
        this._interval = Math.round(this._sampleRate * data.intervalSec);
      }
    };
  }

  process() {
    if (!this._running || this._interval <= 0) return true;

    const blockSize = 128;
    for (let i = 0; i < blockSize; i++) {
      this._phase++;
      if (this._phase >= this._interval) {
        this._phase = 0;
        /* currentTime is the time of the FIRST sample in this block.
           The tick fires at sample i within the block.              */
        const tickTime = currentTime + i / this._sampleRate;
        this.port.postMessage({ type: 'tick', time: tickTime });
      }
    }
    return true; /* keep alive */
  }
}

registerProcessor('precision-clock', PrecisionClockProcessor);

---

# runtime/canvas-wm.js

/* ═══════════════════════════════════════════════════════════
   ERAVOS CANVAS WM  v3.0.0
   Window manager for the canvas space.
   Drag · resize · snap-to-8px · collapse · z-order · close
   ═══════════════════════════════════════════════════════════ */

window.CanvasWM = (() => {
'use strict';

let _canvas = null;
let _zTop   = 100;
const SNAP  = 8;

function init(canvasEl) {
  _canvas = canvasEl;
}

function snap(v) { return Math.round(v / SNAP) * SNAP; }

function create(opts) {
  const {
    id,
    title    = 'Module',
    x        = 80,
    y        = 80,
    width    = 300,
    height   = 380,
    minWidth  = 200,
    minHeight = 120,
  } = opts;

  /* ── Root element ── */
  const el = document.createElement('div');
  el.className   = 'wm-win';
  el.dataset.wmId = id;
  el.style.cssText = `
    position: absolute;
    left: ${snap(x)}px;
    top:  ${snap(y)}px;
    width:  ${Math.max(minWidth,  width)}px;
    height: ${Math.max(minHeight, height)}px;
    min-width:  ${minWidth}px;
    min-height: ${minHeight}px;
    display: flex;
    flex-direction: column;
    background: var(--bg1);
    border: 1px solid var(--b2);
    border-radius: 5px;
    overflow: hidden;
    z-index: ${++_zTop};
    box-shadow: 0 8px 32px rgba(0,0,0,.5);
    will-change: transform;
  `;

  /* ── Title bar ── */
  const bar = document.createElement('div');
  bar.className = 'wm-bar';
  bar.style.cssText = `
    height: 30px;
    display: flex;
    align-items: center;
    padding: 0 8px;
    gap: 6px;
    background: var(--bg2);
    border-bottom: 1px solid var(--b1);
    border-top: 2px solid var(--accent);
    cursor: grab;
    flex-shrink: 0;
    user-select: none;
  `;

  const titleEl = document.createElement('div');
  titleEl.className = 'wm-title';
  titleEl.style.cssText = `
    font-family: var(--orb, monospace);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .18em;
    color: var(--dim2);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `;
  titleEl.textContent = title;

  /* ── Bar buttons ── */
  const btns = document.createElement('div');
  btns.style.cssText = 'display:flex;align-items:center;gap:4px;flex-shrink:0;';

  /* Collapse */
  const colBtn = _barBtn('−', 'Collapse');
  colBtn.addEventListener('click', e => { e.stopPropagation(); _toggleCollapse(el); });

  /* Close × */
  const closeBtn = _barBtn('×', 'Remove');
  closeBtn.style.color = 'var(--accent3)';
  closeBtn.addEventListener('mouseenter', () => closeBtn.style.borderColor = 'var(--accent3)');
  closeBtn.addEventListener('mouseleave', () => closeBtn.style.borderColor = 'var(--b2)');
  closeBtn.addEventListener('click', e => {
    e.stopPropagation();
    el.remove();
    if (window.KERNEL) {
      KERNEL.registry.unregister(id);
      KERNEL.bus.publish('canvas:window-closed', { id });
    }
  });

  btns.appendChild(colBtn);
  btns.appendChild(closeBtn);
  bar.appendChild(titleEl);
  bar.appendChild(btns);

  /* ── Content ── */
  const content = document.createElement('div');
  content.className = 'wm-content';
  content.style.cssText = 'flex:1;overflow:hidden;min-height:0;display:flex;flex-direction:column;';

  /* ── Resize handle ── */
  const resizer = document.createElement('div');
  resizer.className = 'wm-resizer';
  resizer.style.cssText = `
    position: absolute;
    right: 0; bottom: 0;
    width: 14px; height: 14px;
    cursor: se-resize;
    z-index: 2;
  `;
  resizer.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" style="position:absolute;right:2px;bottom:2px;opacity:.3">
    <path d="M9 1L1 9M9 5L5 9M9 9" stroke="var(--dim2)" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;

  el.appendChild(bar);
  el.appendChild(content);
  el.appendChild(resizer);

  /* ── Drag ── */
  let _dragging = false, _dx = 0, _dy = 0;
  bar.addEventListener('pointerdown', e => {
    if (e.target !== bar && e.target !== titleEl) return;
    _dragging = true;
    _dx = e.clientX - el.offsetLeft;
    _dy = e.clientY - el.offsetTop;
    bar.setPointerCapture(e.pointerId);
    bar.style.cursor = 'grabbing';
    _raise(el);
  });
  bar.addEventListener('pointermove', e => {
    if (!_dragging) return;
    const canvasRect = _canvas ? _canvas.getBoundingClientRect() : { left:0, top:0, width:9999, height:9999 };
    const nx = snap(Math.max(0, Math.min(canvasRect.width  - el.offsetWidth,  e.clientX - _dx)));
    const ny = snap(Math.max(0, Math.min(canvasRect.height - el.offsetHeight, e.clientY - _dy)));
    el.style.left = nx + 'px';
    el.style.top  = ny + 'px';
  });
  bar.addEventListener('pointerup',   () => { _dragging = false; bar.style.cursor = 'grab'; });
  bar.addEventListener('pointercancel',()=> { _dragging = false; bar.style.cursor = 'grab'; });

  /* ── Resize ── */
  let _resizing = false, _rx = 0, _ry = 0, _rw = 0, _rh = 0;
  resizer.addEventListener('pointerdown', e => {
    _resizing = true;
    _rx = e.clientX; _ry = e.clientY;
    _rw = el.offsetWidth; _rh = el.offsetHeight;
    resizer.setPointerCapture(e.pointerId);
    e.stopPropagation(); e.preventDefault();
  });
  resizer.addEventListener('pointermove', e => {
    if (!_resizing) return;
    const nw = snap(Math.max(minWidth,  _rw + (e.clientX - _rx)));
    const nh = snap(Math.max(minHeight, _rh + (e.clientY - _ry)));
    el.style.width  = nw + 'px';
    el.style.height = nh + 'px';
  });
  resizer.addEventListener('pointerup',   () => { _resizing = false; });
  resizer.addEventListener('pointercancel',()=> { _resizing = false; });

  /* ── Raise on click ── */
  el.addEventListener('pointerdown', () => _raise(el), { capture: true });

  /* ── Mount ── */
  (_canvas || document.body).appendChild(el);

  return {
    el, bar, content,
    raise: () => _raise(el),
    setTitle: t => titleEl.textContent = t,
    mount: child => { content.innerHTML = ''; content.appendChild(child); },
  };
}

function _raise(el) {
  el.style.zIndex = ++_zTop;
}

function _toggleCollapse(el) {
  const content = el.querySelector('.wm-content');
  const resizer = el.querySelector('.wm-resizer');
  const collapsed = el.dataset.collapsed === '1';
  if (collapsed) {
    content.style.display = '';
    resizer.style.display = '';
    el.style.height = (el.dataset.prevH || '380') + 'px';
    el.dataset.collapsed = '0';
    el.querySelector('.wm-bar button:first-child') && (el.querySelector('.wm-bar button').textContent = '−');
  } else {
    el.dataset.prevH = el.offsetHeight;
    content.style.display = 'none';
    resizer.style.display = 'none';
    el.style.height = '32px';
    el.dataset.collapsed = '1';
    el.querySelector('.wm-bar button') && (el.querySelector('.wm-bar button').textContent = '+');
  }
}

function _barBtn(label, title) {
  const b = document.createElement('button');
  b.title = title;
  b.textContent = label;
  b.style.cssText = `
    width: 16px; height: 16px;
    border-radius: 2px;
    border: 1px solid var(--b2);
    background: var(--bg3);
    color: var(--dim2);
    font-size: 11px; line-height: 1;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    padding: 0; flex-shrink: 0;
    transition: all .1s;
    font-family: monospace;
  `;
  b.addEventListener('mouseenter', () => b.style.borderColor = 'var(--accent)');
  b.addEventListener('mouseleave', () => b.style.borderColor = 'var(--b2)');
  return b;
}

return { init, create };
})();

---

# runtime/canvas-cfr.js

/* ═══════════════════════════════════════════════════════════
   ERAVOS CANVAS CFR  v1.0.0
   runtime/canvas-cfr.js

   Constraint Field Runtime canvas layer.
   Wraps ALK-GL particle field engine.
   Wires ERAVOS kernel bus events → field physics.

   ORGANISM LIFECYCLE → ATTRACTORS:
     canvas:organism-spawned  → upsertAttractor(instanceId, x, y)
     canvas:window-closed     → removeAttractor(instanceId)
     canvas:window-moved      → upsertAttractor (update position)

   AUDIO → FIELD:
     analyser RMS              → field.structure
     dominant frequency band   → field.entropy / field.curl
     beat detected             → injectStress at attractor

   KERNEL FAULTS → TURBULENCE:
     kernel:fault              → entropy spike + stress inject

   The field shows the system. Calm system = laminar flow.
   Many active organisms = structured attractors.
   Faults = turbulence.
   ═══════════════════════════════════════════════════════════ */

window.CanvasCFR = (() => {
'use strict';

let _engine     = null;   /* ALKGL instance */
let _canvas     = null;   /* WebGL canvas element */
let _rafId      = null;
let _running    = false;
let _analyser   = null;
let _fftData    = null;

/* World coordinate system: canvas pixels → world units
   ALK-GL default bound=6 means world is [-6,6] x [-6,6]
   We map canvas pixels to that space.                    */
const BOUND = 6;

function _pxToWorld(px, py, canvasW, canvasH) {
  return [
    ((px / canvasW) - 0.5) * BOUND * 2,
    (0.5 - (py / canvasH)) * BOUND * 2,
  ];
}

/* ── Boot ───────────────────────────────────────────────── */
function boot(hostEl) {
  if (_engine) return; /* already running */

  /* Create WebGL canvas filling the host */
  _canvas = document.createElement('canvas');
  _canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  hostEl.insertBefore(_canvas, hostEl.firstChild);

  /* Remove dot-grid background */
  hostEl.style.backgroundImage = 'none';
  hostEl.style.backgroundColor = '#010308';

  try {
    _engine = new ALKGL(_canvas, {
      N:      12000,   /* 12k particles — works on integrated GPU */
      bound:  BOUND,
      boundZ: 4,
    });

    /* Set initial field state — dark, slow, ready */
    _engine.field.entropy   = 0.08;
    _engine.field.structure = 0.65;
    _engine.field.curl      = 0.3;
    _engine.field.damping   = 0.18;
    _engine.field.vmax      = 0.12;

    _running = true;
    _loop();

    console.log('[CFR] particle field active');
  } catch(e) {
    console.warn('[CFR] WebGL2 unavailable, keeping dot-grid:', e.message);
    if (_canvas) { _canvas.remove(); _canvas = null; }
    /* Restore dot-grid */
    hostEl.style.backgroundImage = 'radial-gradient(circle,rgba(42,60,88,.42) 1px,transparent 1px)';
    hostEl.style.backgroundSize  = '24px 24px';
  }
}

/* ── Render loop ────────────────────────────────────────── */
function _loop() {
  if (!_running || !_engine) return;
  _rafId = requestAnimationFrame(_loop);

  /* Audio-driven field update */
  if (_analyser && _fftData) {
    _analyser.getByteFrequencyData(_fftData);

    /* RMS → structure */
    let rms = 0;
    for (let i = 0; i < _fftData.length; i++) rms += (_fftData[i]/255) ** 2;
    rms = Math.sqrt(rms / _fftData.length);

    /* Sub bass energy (bins 0-3) → entropy */
    let subEnergy = 0;
    for (let i = 0; i < 4; i++) subEnergy += _fftData[i] / 255;
    subEnergy /= 4;

    /* High frequency (upper third) → curl */
    let hiEnergy = 0;
    const hiStart = Math.floor(_fftData.length * 0.66);
    for (let i = hiStart; i < _fftData.length; i++) hiEnergy += _fftData[i] / 255;
    hiEnergy /= (_fftData.length - hiStart);

    /* Smooth field towards audio state */
    const EMA = 0.06;
    _engine.field.structure = _engine.field.structure * (1-EMA) + (0.4 + rms * 0.5) * EMA;
    _engine.field.entropy   = _engine.field.entropy   * (1-EMA) + (0.05 + subEnergy * 0.4) * EMA;
    _engine.field.curl      = _engine.field.curl      * (1-EMA) + (0.2 + hiEnergy * 0.5) * EMA;
  }

  _engine.step(1/60);
}

/* ── Analyser hookup ────────────────────────────────────── */
function connectAnalyser(analyserNode) {
  _analyser = analyserNode;
  _fftData  = new Uint8Array(analyserNode.frequencyBinCount);
}

/* ── Organism → attractor bridge ───────────────────────── */
function onSpawn(instanceId, x, y, accent) {
  if (!_engine || !_canvas) return;
  const W = _canvas.offsetWidth  || 1;
  const H = _canvas.offsetHeight || 1;
  const [wx, wy] = _pxToWorld(x, y, W, H);

  /* Mass based on organism type (larger organisms = stronger attractors) */
  const mass = 0.8 + Math.random() * 0.4;
  _engine.upsertAttractor(instanceId, wx, wy, 0, mass);
}

function onMove(instanceId, x, y) {
  if (!_engine || !_canvas) return;
  const W = _canvas.offsetWidth  || 1;
  const H = _canvas.offsetHeight || 1;
  const [wx, wy] = _pxToWorld(x, y, W, H);
  _engine.upsertAttractor(instanceId, wx, wy, 0, 1.0);
}

function onClose(instanceId) {
  if (!_engine) return;
  _engine.removeAttractor(instanceId);
  /* Inject turbulence where the organism was */
  _engine.injectStress(
    (Math.random() - 0.5) * BOUND,
    (Math.random() - 0.5) * BOUND,
    0, 200, 3
  );
}

function onFault() {
  if (!_engine) return;
  /* Faults create turbulence at a random attractor position */
  _engine.field.entropy = Math.min(0.85, _engine.field.entropy + 0.12);
  _engine.injectStress(
    (Math.random() - 0.5) * BOUND * 1.5,
    (Math.random() - 0.5) * BOUND * 1.5,
    0, 400, 5
  );
}

function setFieldPreset(preset) {
  if (!_engine) return;
  const presets = {
    calm:    { entropy:.04, structure:.75, curl:.2,  damping:.25, vmax:.08 },
    active:  { entropy:.18, structure:.65, curl:.45, damping:.12, vmax:.16 },
    chaos:   { entropy:.55, structure:.35, curl:.7,  damping:.05, vmax:.28 },
    tranki:  { entropy:.22, structure:.58, curl:.52, damping:.10, vmax:.18 },
    drop:    { entropy:.72, structure:.20, curl:.80, damping:.02, vmax:.35 },
  };
  const p = presets[preset];
  if (p) Object.assign(_engine.field, p);
}

function stop() {
  _running = false;
  cancelAnimationFrame(_rafId);
  if (_engine) { /* no dispose method in ALKGL, just stop loop */ }
}

return { boot, stop, onSpawn, onMove, onClose, onFault, connectAnalyser, setFieldPreset };
})();

---

# runtime/wire-system.js

/* ═══════════════════════════════════════════════════════════
   WIRE SYSTEM  v1.0.0
   runtime/wire-system.js

   Right-click any organism window → shows its hooks.
   Drag from an output hook → compatible input hooks glow.
   Release on an input hook → wire drawn, bus subscription made.
   Click a wire → remove it.

   Wires are visual SVG paths + live bus subscriptions.
   ═══════════════════════════════════════════════════════════ */
window.WireSystem = (() => {
'use strict';

/* SVG overlay for wire drawing */
let _svg       = null;
let _canvasEl  = null;
let _dragging  = null; /* { fromInstanceId, fromHookId, fromEl, tempPath } */
const _wires   = new Map(); /* wireId → { path, sub, fromId, toId } */
const _hookEls = new Map(); /* instanceId → { el, hooks[] } */

const HOOK_R    = 6;   /* hook circle radius px */
const WIRE_COL  = 'rgba(0,212,255,0.55)';
const WIRE_HOV  = '#00d4ff';
const COMPAT_COL= 'rgba(0,255,136,0.4)';

function init(canvasEl) {
  _canvasEl = canvasEl;

  _svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  _svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:800;overflow:visible;';
  canvasEl.appendChild(_svg);

  /* Global mousemove/up for drag-to-connect */
  document.addEventListener('mousemove', _onDragMove);
  document.addEventListener('mouseup',   _onDragEnd);
}

/* ── Hook context menu on right-click of any wm-win ── */
function _attachContextMenu(win, instanceId) {
  win.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
    _showHookMenu(instanceId, e.clientX, e.clientY);
  });
}

function _showHookMenu(instanceId, cx, cy) {
  /* Remove any existing hook menu */
  document.querySelectorAll('.wire-hook-menu').forEach(m => m.remove());

  const org = KERNEL.registry.get(instanceId);
  if (!org || !org.hooks?.length) return;

  const menu = document.createElement('div');
  menu.className = 'wire-hook-menu';
  menu.style.cssText = `
    position:fixed;left:${cx}px;top:${cy}px;
    background:var(--bg1);border:1px solid var(--b2);border-top:2px solid var(--accent2);
    border-radius:0 0 5px 5px;z-index:9200;min-width:200px;
    box-shadow:0 8px 32px rgba(0,0,0,.6);overflow:hidden;font-family:var(--mono);
  `;

  const title = document.createElement('div');
  title.style.cssText = 'padding:6px 12px;font-size:7px;letter-spacing:.16em;color:var(--accent2);background:var(--bg2);border-bottom:1px solid var(--b1);';
  title.textContent = `HOOKS — ${org.label}`;
  menu.appendChild(title);

  org.hooks.forEach(hook => {
    const row = document.createElement('div');
    row.style.cssText = `display:flex;align-items:center;gap:8px;padding:7px 12px;cursor:pointer;border-bottom:1px solid var(--b1);transition:background .1s;`;
    const dirCol = hook.direction === 'out' ? '#00ff88' : '#00d4ff';
    row.innerHTML = `
      <span style="width:8px;height:8px;border-radius:50%;background:${dirCol};flex-shrink:0;box-shadow:0 0 4px ${dirCol};"></span>
      <span style="font-size:7.5px;color:var(--dim2);flex:1;">${hook.hook_id.split('.').pop()}</span>
      <span style="font-size:6.5px;color:${dirCol};letter-spacing:.1em;">${hook.direction.toUpperCase()}</span>
      <span style="font-size:6px;color:var(--dim);letter-spacing:.06em;">${hook.event_type}</span>
    `;
    row.addEventListener('mouseenter', () => row.style.background = 'rgba(0,212,255,.08)');
    row.addEventListener('mouseleave', () => row.style.background = '');

    if (hook.direction === 'out') {
      row.title = 'Drag to connect to an input';
      row.style.cursor = 'crosshair';
      row.addEventListener('mousedown', e => {
        e.preventDefault();
        menu.remove();
        _startDrag(instanceId, hook, e.clientX, e.clientY);
      });
    } else {
      row.title = `Listening on: ${hook.event_type}`;
    }
    menu.appendChild(row);
  });

  /* Close */
  const close = document.createElement('div');
  close.style.cssText = 'padding:6px 12px;font-size:7px;color:var(--accent3);cursor:pointer;text-align:center;';
  close.textContent = '× CLOSE';
  close.addEventListener('click', () => menu.remove());
  menu.appendChild(close);

  document.body.appendChild(menu);
  /* Close on outside click */
  setTimeout(() => {
    document.addEventListener('click', () => menu.remove(), { once:true });
  }, 10);
}

/* ── Drag to connect ── */
function _startDrag(fromInstanceId, fromHook, x, y) {
  const r   = _canvasEl.getBoundingClientRect();
  const sx  = x - r.left;
  const sy  = y - r.top;

  /* Temp path */
  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('fill','none');
  path.setAttribute('stroke', WIRE_HOV);
  path.setAttribute('stroke-width','2');
  path.setAttribute('stroke-dasharray','6,3');
  path.setAttribute('opacity','0.8');
  _svg.appendChild(path);

  _dragging = { fromInstanceId, fromHook, startX:sx, startY:sy, path };

  /* Highlight compatible input hooks */
  _highlightCompatible(fromHook.event_type);
}

function _onDragMove(e) {
  if (!_dragging) return;
  const r   = _canvasEl.getBoundingClientRect();
  const ex  = e.clientX - r.left;
  const ey  = e.clientY - r.top;
  const { startX, startY, path } = _dragging;
  const d   = `M${startX},${startY} C${startX+60},${startY} ${ex-60},${ey} ${ex},${ey}`;
  path.setAttribute('d', d);
}

function _onDragEnd(e) {
  if (!_dragging) return;
  _clearHighlights();

  /* Check if we're over a compatible input */
  const target = document.elementFromPoint(e.clientX, e.clientY);
  const hookEl = target?.closest('[data-hook-input]');
  if (hookEl) {
    const toInstanceId = hookEl.dataset.instanceId;
    const toHookId     = hookEl.dataset.hookId;
    const toEventType  = hookEl.dataset.eventType;
    const { fromInstanceId, fromHook } = _dragging;

    /* Draw permanent wire */
    _drawWire(fromInstanceId, fromHook.hook_id, fromHook.event_type,
              toInstanceId,   toHookId,         toEventType);
  }

  _dragging.path.remove();
  _dragging = null;
}

function _highlightCompatible(eventType) {
  /* Add glow to all input hook elements with matching event_type */
  document.querySelectorAll('[data-hook-input]').forEach(el => {
    if (el.dataset.eventType === eventType) {
      el.style.background = COMPAT_COL;
      el.style.boxShadow  = '0 0 8px rgba(0,255,136,.6)';
    }
  });
}

function _clearHighlights() {
  document.querySelectorAll('[data-hook-input]').forEach(el => {
    el.style.background = '';
    el.style.boxShadow  = '';
  });
}

/* ── Draw permanent wire ── */
function _drawWire(fromId, fromHookId, fromEventType, toId, toHookId, toEventType) {
  /* Kernel wire registration */
  const wireId = KERNEL.wireRegistry.register({
    sourceInstanceId: fromId,
    sourceHookId:     fromHookId,
    targetInstanceId: toId,
    targetHookId:     toHookId,
    wireType:         'event_bus',
  });
  if (!wireId) return; /* validation failed */

  /* Bus subscription: when fromId publishes fromEventType, route to toId */
  const topic = fromEventType + ':' + fromId;
  const sub   = KERNEL.bus.subscribe(fromEventType, payload => {
    if (payload?._from !== fromId && fromEventType !== 'pad:trigger') return;
    KERNEL.bus.publish(toEventType + ':' + toId, payload);
  });

  /* SVG path between organism window centers */
  const fromWin = _canvasEl.querySelector(`[data-wm-id="${fromId}"]`);
  const toWin   = _canvasEl.querySelector(`[data-wm-id="${toId}"]`);
  if (!fromWin || !toWin) { sub(); return; }

  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('fill','none');
  path.setAttribute('stroke', WIRE_COL);
  path.setAttribute('stroke-width','2');
  path.setAttribute('opacity','0.7');
  path.style.cursor = 'pointer';
  path.title = `${fromHookId} → ${toHookId}  (click to remove)`;
  _svg.appendChild(path);

  const entry = { wireId, path, sub, fromId, toId, fromHookId, toHookId };
  _wires.set(wireId, entry);
  _updateWirePath(entry);

  /* Click wire to remove */
  path.addEventListener('click', () => _removeWire(wireId));
  path.addEventListener('mouseenter', () => path.setAttribute('stroke', WIRE_HOV));
  path.addEventListener('mouseleave', () => path.setAttribute('stroke', WIRE_COL));

  /* Track window moves to redraw wire */
  const observer = new MutationObserver(() => _updateWirePath(entry));
  [fromWin, toWin].forEach(w => observer.observe(w, { attributes:true, attributeFilter:['style'] }));
  entry.observer = observer;

  KERNEL.bus.publish('kernel:notify', { message: `🔌 Wired: ${fromHookId.split('.').pop()} → ${toHookId.split('.').pop()}` });
  KERNEL.ledger._write({ type:'wire_drawn', wireId, fromId, toId });
}

function _updateWirePath(entry) {
  const r       = _canvasEl.getBoundingClientRect();
  const fromWin = _canvasEl.querySelector(`[data-wm-id="${entry.fromId}"]`);
  const toWin   = _canvasEl.querySelector(`[data-wm-id="${entry.toId}"]`);
  if (!fromWin || !toWin) return;

  const fr = fromWin.getBoundingClientRect();
  const tr = toWin.getBoundingClientRect();
  const sx = fr.right  - r.left;
  const sy = fr.top    - r.top + fr.height / 2;
  const ex = tr.left   - r.left;
  const ey = tr.top    - r.top + tr.height / 2;
  const d  = `M${sx},${sy} C${sx+80},${sy} ${ex-80},${ey} ${ex},${ey}`;
  entry.path.setAttribute('d', d);
}

function _removeWire(wireId) {
  const e = _wires.get(wireId); if (!e) return;
  e.sub?.();
  e.path?.remove();
  e.observer?.disconnect();
  KERNEL.wireRegistry.remove(wireId);
  _wires.delete(wireId);
  KERNEL.bus.publish('kernel:notify', { message: '✂ Wire removed' });
}

/* ── Called by shell when an organism window spawns ── */
function onSpawn(instanceId) {
  /* Small delay for DOM to settle */
  setTimeout(() => {
    const win = _canvasEl?.querySelector(`[data-wm-id="${instanceId}"]`);
    if (!win) return;
    _attachContextMenu(win, instanceId);
  }, 50);
}

function onClose(instanceId) {
  /* Remove all wires involving this organism */
  _wires.forEach((entry, wireId) => {
    if (entry.fromId === instanceId || entry.toId === instanceId) {
      _removeWire(wireId);
    }
  });
}

/* Redraw all wires (e.g. after scroll/resize) */
function redrawAll() {
  _wires.forEach(entry => _updateWirePath(entry));
}

window.addEventListener('resize', redrawAll);

return { init, onSpawn, onClose, redrawAll };
})();

---

# runtime/alk-gl.js

/* ═══════════════════════════════════════════════════════════
   ALK-GL — WebGL2 Particle Field Engine  v1.9.0
   Adapted for ERAVOS: ES6 exports → window.ALKGL
   Original: ES6 module with MediaPipe blendshape support.
   ERAVOS usage: organisms are attractors, audio drives field.
   ═══════════════════════════════════════════════════════════ */
window.ALKGL = (() => {
'use strict';
/**
 * @module       alk-gl
 * @uuid         f9e8d7c6-b5a4-4321-9876-543210fedcba
 * @version      1.0.0
 *
 * ALK-GL — Custom WebGL2 Particle Field Engine
 *
 * Architecture: ping-pong RGBA32F textures. No transform feedback.
 * Each texel = one particle. Texture sampling enables spatial coherence —
 * particles can read their neighbors' state, enabling field dynamics
 * impossible with buffer-based systems.
 *
 * Pass 1 COMPUTE: full-screen quad GLSL integrates curl noise + attractor
 *   gravity + blendshape potential deformation + spatial coherence + entropy.
 *   Writes to output ping-pong textures.
 *
 * Pass 2 RENDER: instanced points, each reads position from state texture
 *   via gl_VertexID. Additive blending. Color = f(entropy, structure, speed).
 *
 * Blendshape deformer: 29 MediaPipe blendshapes → GLSL uniforms →
 *   per-particle potential offset. Eye blink fires collapse+shockwave at iris.
 *   Jaw open expands mouth well. Smile deepens corner wells. Nose sneer
 *   injects rotational turbulence. Cheek puff radial expansion. Gaze direction
 *   biases particles near iris along look vector.
 */
'use strict';

const ALKGL_UUID    = 'f9e8d7c6-b5a4-4321-9876-543210fedcba';
const ALKGL_VERSION = '1.9.0';

const MAX_ATT = 64;
const MAX_STR = 8;

// ── GLSL common ────────────────────────────────────────────────────────────────
const GLSL_COMMON = `
precision highp float;
precision highp sampler2D;
float hash21(vec2 p){p=fract(p*vec2(127.1,311.7));p+=dot(p,p+19.19);return fract(p.x*p.y);}
float valueNoise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+vec2(1,1));return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
vec2 curlNoise2D(vec2 p,float z,float t){float e=0.06,px=p.x+z*.18+t*.04,py=p.y+z*.22+t*.05;return vec2((valueNoise(vec2(px,py+e))-valueNoise(vec2(px,py-e)))/(2.0*e),-(valueNoise(vec2(px+e,py))-valueNoise(vec2(px-e,py)))/(2.0*e));}
`;

// ── Compute shaders ────────────────────────────────────────────────────────────
const COMP_VERT = `#version 300 es
in vec2 a_quad; out vec2 v_uv;
void main(){v_uv=a_quad*.5+.5;gl_Position=vec4(a_quad,0,1);}`;

function buildCompFrag(maxAtt, maxStr) {
return `#version 300 es
${GLSL_COMMON}
uniform sampler2D u_sXY,u_sZ;
uniform float u_t,u_dt,u_ent,u_str,u_curl,u_damp,u_vmax,u_bound,u_boundZ;
uniform vec4 u_att[${maxAtt}]; // w==0.0 = sentinel (no attractor)
uniform vec4 u_spPos[${maxStr}],u_spPow[${maxStr}]; // spPos.w=life sentinel
uniform vec2 u_irisL,u_irisR,u_nose,u_mouth,u_lcheek,u_rcheek,u_fore,u_chin;
uniform vec2 u_boundary[16]; // face oval contour points (world space)
uniform float u_boundaryActive; // 1=face detected, 0=inactive
uniform float u_accumDecay; // temporal accumulation decay rate
uniform float u_faceScale; // face scale for history normalization
uniform vec2 u_gazeL,u_gazeR; uniform float u_gazeStr;
uniform float u_bsBlinkL,u_bsBlinkR,u_bsWideL,u_bsWideR,u_bsSquintL,u_bsSquintR;
uniform float u_bsBrowDL,u_bsBrowDR,u_bsBrowIU,u_bsBrowOUL,u_bsBrowOUR;
uniform float u_bsJawOpen,u_bsJawL,u_bsJawR;
uniform float u_bsSmileL,u_bsSmileR,u_bsFrownL,u_bsFrownR,u_bsPucker;
uniform float u_bsStretchL,u_bsStretchR,u_bsDimpleL,u_bsDimpleR;
uniform float u_bsSneerL,u_bsSneerR,u_bsCheekPuff,u_bsCheekSqL,u_bsCheekSqR;
uniform float u_bsTongue;
in vec2 v_uv;
layout(location=0) out vec4 oXY; layout(location=1) out vec4 oZ;

vec2 worldToUV(vec2 wp){return clamp(wp/(u_bound*2.0)+.5,0.01,0.99);}

float localDensity(vec2 pos){
  float d=0.0;
  vec2 uv=worldToUV(pos);
  d+=1.0/(length(texture(u_sXY,uv+vec2(.018,0)).xy-pos)+.4);
  d+=1.0/(length(texture(u_sXY,uv-vec2(.018,0)).xy-pos)+.4);
  d+=1.0/(length(texture(u_sXY,uv+vec2(0,.018)).xy-pos)+.4);
  d+=1.0/(length(texture(u_sXY,uv-vec2(0,.018)).xy-pos)+.4);
  return d*.055;
}

vec2 blendForce(vec2 pos){
  vec2 f=vec2(0);
  // Eye blink: collapse+shockwave
  if(u_bsBlinkL>.25){vec2 d=u_irisL-pos;float dl=length(d);f+=normalize(d)*u_bsBlinkL*.04/(dl+.4);float ring=abs(dl-1.2);if(ring<.9)f-=normalize(d)*u_bsBlinkL*(.9-ring)*.07;}
  if(u_bsBlinkR>.25){vec2 d=u_irisR-pos;float dl=length(d);f+=normalize(d)*u_bsBlinkR*.04/(dl+.4);float ring=abs(dl-1.2);if(ring<.9)f-=normalize(d)*u_bsBlinkR*(.9-ring)*.07;}
  // Jaw open
  if(u_bsJawOpen>.08){vec2 d=u_mouth-pos;float dl=length(d)+.1;f+=normalize(d)*u_bsJawOpen*.05/dl;float vb=pos.y-u_mouth.y;if(vb<0.0)f.y+=u_bsJawOpen*.02;}
  // Brow inner up
  if(u_bsBrowIU>.04){vec2 d=u_fore-pos;float dl=length(d)+.1;f+=normalize(d)*u_bsBrowIU*.035/dl;}
  // Brow down furrow
  float bd=(u_bsBrowDL+u_bsBrowDR)*.5;
  if(bd>.08){vec2 bm=(u_fore+u_nose)*.5;vec2 fb=pos-bm;float dl=length(fb)+.1;if(dl<3.0)f+=normalize(fb)*bd*.03*(3.0-dl)/3.0;}
  // Smile
  float sm=(u_bsSmileL+u_bsSmileR)*.5;
  if(sm>.08){vec2 sL=u_mouth+vec2(-1.2,.3),sR=u_mouth+vec2(1.2,.3);float dL=length(sL-pos)+.1,dR=length(sR-pos)+.1;f+=normalize(sL-pos)*sm*.025/dL+normalize(sR-pos)*sm*.025/dR;}
  // Nose sneer rotation
  float sn=(u_bsSneerL+u_bsSneerR)*.5;
  if(sn>.08){vec2 fn=pos-u_nose;float dl=length(fn)+.1;if(dl<2.5)f+=normalize(vec2(-fn.y,fn.x))*sn*.04*(2.5-dl)/2.5;}
  // Cheek puff
  if(u_bsCheekPuff>.08){vec2 fL=pos-u_lcheek,fR=pos-u_rcheek;float dL=length(fL)+.1,dR=length(fR)+.1;if(dL<3.0)f+=normalize(fL)*u_bsCheekPuff*.04*(3.0-dL)/3.0;if(dR<3.0)f+=normalize(fR)*u_bsCheekPuff*.04*(3.0-dR)/3.0;}
  // Pucker
  if(u_bsPucker>.08){vec2 d=u_mouth-pos;float dl=length(d)+.1;if(dl<2.0)f+=normalize(d)*u_bsPucker*.04/dl;}
  // Tongue out
  if(u_bsTongue>.08){vec2 fm=pos-u_mouth;float dl=length(fm)+.1;if(dl<2.0)f+=normalize(fm)*u_bsTongue*.05*(2.0-dl)/2.0;}
  // Gaze: bias particles near iris along gaze vector
  if(u_gazeStr>.04){float dL=length(pos-u_irisL),dR=length(pos-u_irisR);if(dL<2.5)f+=u_gazeL*u_gazeStr*.04*(2.5-dL)/2.5;if(dR<2.5)f+=u_gazeR*u_gazeStr*.04*(2.5-dR)/2.5;}
  // Eye wide: expand from iris
  float ew=(u_bsWideL+u_bsWideR)*.5;
  if(ew>.15){vec2 fL=pos-u_irisL,fR=pos-u_irisR;float dL=length(fL)+.1,dR=length(fR)+.1;if(dL<2.0)f+=normalize(fL)*ew*.05*(2.0-dL)/2.0;if(dR<2.0)f+=normalize(fR)*ew*.05*(2.0-dR)/2.0;}
  return f;
}

// Face boundary confinement: push particles toward interior of face oval.
// Uses winding number test (simplified point-in-polygon) via cross products.
// Particles outside the oval get pushed inward along the normal to the nearest edge.
vec2 boundaryForce(vec2 pos) {
  if (u_boundaryActive < 0.5) return vec2(0.0);
  vec2 f = vec2(0.0);
  
  // Find closest boundary edge and direction to interior
  float minDist = 99.0;
  vec2 pushDir = vec2(0.0);
  
  for (int i = 0; i < 16; i++) {
    int next = (i + 1) % 16;
    vec2 a = u_boundary[i];
    vec2 b = u_boundary[next];
    
    // Closest point on edge segment to pos
    vec2 ab = b - a;
    float t = clamp(dot(pos - a, ab) / (dot(ab, ab) + 0.001), 0.0, 1.0);
    vec2 closest = a + t * ab;
    vec2 toPos = pos - closest;
    float d = length(toPos);
    
    if (d < minDist) {
      minDist = d;
      // Edge normal pointing inward (toward face center at nose)
      vec2 edgeNorm = normalize(vec2(-ab.y, ab.x));
      // Check if normal points toward nose
      if (dot(edgeNorm, u_nose - closest) < 0.0) edgeNorm = -edgeNorm;
      pushDir = edgeNorm;
    }
  }
  
  // Inside/outside: project a few test rays
  // Simplified: use face centroid proximity as "inside" proxy
  float distToCenter = length(pos - u_nose);
  float faceRadius = length(u_fore - u_chin) * 0.5 + 1.0;
  
  if (distToCenter > faceRadius) {
    // Outside — push inward proportional to excess distance
    float excess = distToCenter - faceRadius;
    f += -normalize(pos - u_nose) * excess * 0.18;
  }
  
  // Boundary proximity repulsion from perimeter (keeps particles from hugging edges)
  if (minDist < 0.8) {
    f -= pushDir * (0.8 - minDist) * 0.12;
  }
  
  return f;
}

void main(){
  vec4 xy=texture(u_sXY,v_uv),zs=texture(u_sZ,v_uv);
  vec2 pos=xy.rg,vel=xy.ba; float pz=zs.r,vz=zs.g;
  if(any(isnan(pos))||any(isinf(pos))){pos=vel=vec2(0);pz=vz=0.0;}
  float dt=u_dt;
  // Curl
  vec2 cn=curlNoise2D(pos*.32,pz*.18,u_t);
  vel+=cn*u_curl*.011*dt*60.0;
  vz+=(valueNoise(vec2(pos.x*.2,u_t*.03))-.5)*u_curl*.005*dt*60.0;
  // Spatial coherence
  float ld=localDensity(pos);
  if(ld>.8){vec2 uv=worldToUV(pos);vec2 nb=texture(u_sXY,uv+vec2(.01,0)).xy;vec2 away=pos-nb;float dn=length(away)+.01;vel+=normalize(away)*(ld-.8)*.012*dt*60.0;}
  // Attractors
  for(int i=0;i<${maxAtt};i++){vec4 at=u_att[i];if(at.w<=0.0)break;vec2 d=at.xy-pos;float d2=dot(d,d)+.15;float dist=sqrt(d2);float mag=at.w*u_str*.08/d2;vel+=normalize(d)*mag*min(dist,3.5)*dt*60.0;float dz2=at.z-pz;vz+=at.w*u_str*.02*dz2/(d2+.1)*dt*60.0;}
  // Blendshape deformer
  vel+=blendForce(pos)*dt*60.0;
  // Face boundary confinement (skeleton as boundary)
  vel+=boundaryForce(pos)*dt*60.0;
  // Enhanced inter-particle repulsion within face zone
  // Particles inside face repel each other to fill the space evenly
  float distToFaceCenter=length(pos-u_nose);
  float fR=length(u_fore-u_chin)*0.5+1.0;
  if(distToFaceCenter<fR*1.2) {
    // Sample more neighbors for within-face repulsion
    vec2 uv2=worldToUV(pos);
    float repStr=0.0;
    vec2 repDir=vec2(0.0);
    vec4 nb1=texture(u_sXY,uv2+vec2(.025, 0.0));
    vec4 nb2=texture(u_sXY,uv2-vec2(.025, 0.0));
    vec4 nb3=texture(u_sXY,uv2+vec2(0.0, .025));
    vec4 nb4=texture(u_sXY,uv2-vec2(0.0, .025));
    vec4 nb5=texture(u_sXY,uv2+vec2(.018, .018));
    vec4 nb6=texture(u_sXY,uv2-vec2(.018, .018));
    vec2 dirs[6];
    dirs[0]=pos-nb1.xy; dirs[1]=pos-nb2.xy;
    dirs[2]=pos-nb3.xy; dirs[3]=pos-nb4.xy;
    dirs[4]=pos-nb5.xy; dirs[5]=pos-nb6.xy;
    for(int k=0;k<6;k++){
      float nd=length(dirs[k]);
      if(nd>0.01&&nd<1.2) {
        repStr+=1.0/(nd*nd+0.05);
        repDir+=normalize(dirs[k])/(nd+0.05);
      }
    }
    if(repStr>0.0) vel+=normalize(repDir)*min(repStr,3.0)*0.008*dt*60.0;
  }
  // Entropy
  vec2 seed=v_uv*13.7+vec2(u_t*.017,u_t*.023);
  vel+=vec2(hash21(seed)*2.0-1.0,hash21(seed+vec2(.5,.3))*2.0-1.0)*u_ent*.016*dt*60.0;
  vz+=(hash21(seed+vec2(.7,.1))*2.0-1.0)*u_ent*.005*dt*60.0;
  // Stresses
  for(int i=0;i<${maxStr};i++){if(u_spPos[i].w<=0.0)break;vec3 sp=u_spPos[i].xyz;float life=u_spPos[i].w,str2=u_spPow[i].x,rad=u_spPow[i].y;vec2 fw=pos-sp.xy;float d2=dot(fw,fw)+.01,d=sqrt(d2);if(d<rad*3.0){float f2=str2*life/(d2*14.0);vel+=normalize(fw)*f2*dt*60.0;vz+=(pz-sp.z)/(d+.1)*f2*.25*dt*60.0;}}
  // Walls
  float bxy=u_bound*u_str,bz=u_boundZ,wk=.11,wz=1.4;
  vec2 dw=bxy-abs(pos);
  if(dw.x<wz)vel.x+=sign(-pos.x)*wk*(wz-dw.x)*dt*60.0;
  if(dw.y<wz)vel.y+=sign(-pos.y)*wk*(wz-dw.y)*dt*60.0;
  if(bz-abs(pz)<1.0)vz+=sign(-pz)*wk*(1.0-(bz-abs(pz)))*dt*60.0;
  // Damping + clamp
  float dk=1.0-u_damp*.8; vel*=dk; vz*=dk;
  float vm=length(vel); if(vm>u_vmax)vel*=u_vmax/vm;
  vz=clamp(vz,-u_vmax*.5,u_vmax*.5);
  // Integrate
  pos+=vel*dt*60.0; pz+=vz*dt*20.0;
  float hb=bxy+.4,hbz=bz+.4;
  if(pos.x>hb){pos.x=hb;vel.x*=-.3;} if(pos.x<-hb){pos.x=-hb;vel.x*=-.3;}
  if(pos.y>hb){pos.y=hb;vel.y*=-.3;} if(pos.y<-hb){pos.y=-hb;vel.y*=-.3;}
  if(pz>hbz){pz=hbz;vz*=-.3;} if(pz<-hbz){pz=-hbz;vz*=-.3;}
  float spd=min(1.0,length(vel)*5.5);
  oXY=vec4(pos,vel); oZ=vec4(pz,vz,spd,1.0);
}`;
}

// ── Render shaders ─────────────────────────────────────────────────────────────
const REND_VERT = `#version 300 es
${GLSL_COMMON}
uniform sampler2D u_sXY,u_sZ;
uniform vec2 u_texSz; uniform mat4 u_mvp; uniform float u_ptBase;
out float v_spd; out float v_depth;
void main(){
  int id=gl_VertexID;
  vec2 uv=vec2((float(id%int(u_texSz.x))+.5)/u_texSz.x,(float(id/int(u_texSz.x))+.5)/u_texSz.y);
  vec4 xy=texture(u_sXY,uv),zs=texture(u_sZ,uv);
  v_spd=zs.b; v_depth=(zs.r+15.0)/30.0;
  vec4 clip=u_mvp*vec4(xy.r,xy.g,zs.r,1.0);
  gl_Position=clip;
  float ds=clamp(1.0-clip.z/clip.w,.3,2.5);
  gl_PointSize=(u_ptBase+v_spd*1.2)*ds;
}`;

const REND_FRAG = `#version 300 es
precision highp float;
in float v_spd; in float v_depth;
uniform float u_ent,u_str;
out vec4 oCol;
void main(){
  vec2 c=gl_PointCoord-.5; float r=dot(c,c);
  if(r>.25)discard;
  float a=1.0-smoothstep(.15,.25,r);
  float cool=u_str*(1.0-u_ent),warm=u_ent,hot=v_spd;
  vec3 cc=vec3(0.0,.9+cool*.1,.7+cool*.3);
  vec3 wc=vec3(.9+warm*.1,.4+warm*.2,.05);
  vec3 hc=vec3(1.0,.95,.8);
  vec3 col=mix(mix(cc,wc,warm),hc,hot*hot);
  col=mix(col*vec3(.5,.6,.8),col,v_depth);
  float br=(.45+v_spd*.55)*a;
  oCol=vec4(col*br,br*.9);
}`;


// ── Accumulation shader (Pass 3) ──────────────────────────────────────────────
// Blends current render into history texture with exponential decay.
// Result: long-exposure face portrait — expression history written in light.
// Inside-face particles accumulate at full rate; outside at reduced rate.
const ACCUM_VERT = `#version 300 es
in vec2 a_quad; out vec2 v_uv;
void main(){v_uv=a_quad*.5+.5;gl_Position=vec4(a_quad,0,1);}`;

const ACCUM_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_current;  // this frame's render
uniform sampler2D u_history;  // accumulated history
uniform float u_decay;        // e.g. 0.93 = ~16 frame memory at 30fps
uniform float u_weight;       // current frame contribution (1-decay)
uniform vec2 u_faceCenter;    // nose position in screen UV [0,1]
uniform float u_faceRadius;   // face radius in screen UV units
in vec2 v_uv;
out vec4 oCol;
void main(){
  vec4 cur = texture(u_current, v_uv);
  vec4 hist= texture(u_history, v_uv);
  // Foveated decay: inside face = full accumulation, outside = faster decay
  float distToFace = length(v_uv - u_faceCenter) / max(u_faceRadius, 0.05);
  float localDecay = mix(u_decay, u_decay * 0.65, clamp(distToFace - 1.0, 0.0, 1.0));
  oCol = hist * localDecay + cur * u_weight;
}`;

// ── Composition shader (Pass 4) ───────────────────────────────────────────────
// Composites accumulation buffer to screen with tone mapping.
const COMP_VERT2 = `#version 300 es
in vec2 a_quad; out vec2 v_uv;
void main(){v_uv=a_quad*.5+.5;gl_Position=vec4(a_quad,0,1);}`;

const COMP_FRAG2 = `#version 300 es
precision highp float;
uniform sampler2D u_accum;
uniform float u_exposure;    // overall brightness scale
uniform float u_gamma;       // gamma correction
uniform float u_bloom;       // bloom strength [0,1]
in vec2 v_uv;
out vec4 oCol;

// Reinhard tone mapping
vec3 reinhard(vec3 col, float exposure) {
  col *= exposure;
  return col / (col + vec3(1.0));
}

void main(){
  vec4 base = texture(u_accum, v_uv);
  // Simple bloom: average of 4 offset samples
  if(u_bloom > 0.0) {
    vec2 off = vec2(0.003, 0.003);
    vec4 b1 = texture(u_accum, v_uv + vec2(off.x, 0));
    vec4 b2 = texture(u_accum, v_uv - vec2(off.x, 0));
    vec4 b3 = texture(u_accum, v_uv + vec2(0, off.y));
    vec4 b4 = texture(u_accum, v_uv - vec2(0, off.y));
    base = mix(base, (base+b1+b2+b3+b4)*0.2, u_bloom);
  }
  vec3 col = reinhard(base.rgb, u_exposure);
  col = pow(max(col, vec3(0.0)), vec3(1.0/u_gamma));
  oCol = vec4(col, base.a);
}`;

// ── Engine ─────────────────────────────────────────────────────────────────────
class ALKGL {
  constructor(canvas, opts={}) {
    this._canvas = canvas;
    this._N      = opts.N     ?? 80000;
    this._bound  = opts.bound ?? 6;   // tighter: face fills more of world
    this._boundZ = opts.boundZ ?? 4;
    this._texW   = Math.ceil(Math.sqrt(this._N));
    this._texH   = Math.ceil(this._N / this._texW);
    this._texN   = this._texW * this._texH;

    const gl = canvas.getContext('webgl2',{antialias:false,alpha:true,premultipliedAlpha:false});
    if (!gl) throw new Error('[ALK-GL] WebGL2 not supported');
    this._gl = gl;

    if (!gl.getExtension('EXT_color_buffer_float'))
      throw new Error('[ALK-GL] EXT_color_buffer_float required');
    gl.getExtension('OES_texture_float_linear');
    // RGBA16F for accumulation (EXT_color_buffer_half_float or fallback to RGBA32F)
    const hasHalfFloat = !!gl.getExtension('EXT_color_buffer_half_float');
    this._accumInternalFormat = hasHalfFloat ? gl.RGBA16F : gl.RGBA32F;
    this._accumType           = hasHalfFloat ? gl.HALF_FLOAT : gl.FLOAT;

    this.field = { entropy:.18, structure:.85, curl:.50, damping:.12, vmax:.17 };
    this._attractors = [];
    this._stresses   = [];
    this._bs  = {};
    this._sk  = { irisL:[0,0],irisR:[0,0],nose:[0,0],mouth:[0,0],lcheek:[-3,0],rcheek:[3,0],fore:[0,4],chin:[0,-4] };
    this._gz  = { L:[0,0], R:[0,0], str:0 };
    this._t   = 0;
    this._mvp = new Float32Array(16);

    // Temporal accumulation
    this._accumTex  = null;
    this._accumFBO  = null;
    this._accumDecay = 0.93;   // ~16-frame memory at 30fps
    this._accumExposure = 1.8;
    this._accumGamma = 1.8;
    this._accumBloom = 0.25;
    this._accumProg  = null;
    this._compProg2  = null;

    // Face boundary (world-space contour points)
    this._boundary       = new Float32Array(16*2); // 16 vec2s
    this._boundaryActive = 0;
    this._faceScale      = 1.0;
    this._faceCenterUV   = [0.5, 0.5];
    this._faceRadiusUV   = 0.3;

    // Codec audio integration
    this._audioField = { entropy:0, structure:0, curl:0 }; // override from codec
    this._pitchJitter  = 0;
    this._pitchShimmer = 0;
    this._pitchHNR     = 0;
    this._pitchVoiced  = false;

    this._compProg  = this._prog(COMP_VERT, buildCompFrag(MAX_ATT, MAX_STR));
    this._rendProg  = this._prog(REND_VERT, REND_FRAG);
    this._setupQuadVAO();
    this._rendVAO   = gl.createVertexArray();
    this._accumProg  = this._prog(ACCUM_VERT, ACCUM_FRAG);
    this._compProg2  = this._prog(COMP_VERT2, COMP_FRAG2);
    try { this._initAccum(); } catch(e) { console.warn('[ALK-GL] Accumulation init failed:', e.message, '— running without temporal history'); this._accumTex=null; }
    this._ping      = this._mkPair();
    this._pong      = this._mkPair();
    this._upload();
    this._cu        = this._cacheCompUni();
    this._ru        = this._cacheRendUni();
    this._cam       = { fov:1.0, near:.5, far:50, tiltX:.05, camZ:13 };

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    this._ro = new ResizeObserver(()=>this._resize());
    this._ro.observe(canvas);
    this._resize();
  }

  _prog(vSrc, fSrc) {
    const gl=this._gl;
    const mk=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('[ALK-GL] '+gl.getShaderInfoLog(s));return s;};
    const p=gl.createProgram();
    gl.attachShader(p,mk(gl.VERTEX_SHADER,vSrc));
    gl.attachShader(p,mk(gl.FRAGMENT_SHADER,fSrc));
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error('[ALK-GL] '+gl.getProgramInfoLog(p));
    return p;
  }

  _mkTex() {
    const gl=this._gl,t=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,this._texW,this._texH,0,gl.RGBA,gl.FLOAT,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    return t;
  }

  _mkPair() {
    const gl=this._gl;
    const tXY=this._mkTex(), tZ=this._mkTex();
    const fbo=gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tXY,0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT1,gl.TEXTURE_2D,tZ,0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0,gl.COLOR_ATTACHMENT1]);
    const st=gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if(st!==gl.FRAMEBUFFER_COMPLETE)throw new Error(`[ALK-GL] FBO 0x${st.toString(16)}`);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    return {tXY,tZ,fbo};
  }

  _initAccum() {
    const gl = this._gl;
    // Accumulation texture (same size as canvas)
    this._accumTex = this._mkScreenTex();
    this._accumFBO = this._mkFBO(this._accumTex);
    // Cache accumulation uniform locations
    const ap = this._accumProg, cp = this._compProg2;
    const au = (p,n) => gl.getUniformLocation(p,n);
    this._au = {
      current:    au(ap,'u_current'),    history:    au(ap,'u_history'),
      decay:      au(ap,'u_decay'),      weight:     au(ap,'u_weight'),
      faceCenter: au(ap,'u_faceCenter'), faceRadius: au(ap,'u_faceRadius'),
    };
    this._cu2 = {
      accum:    au(cp,'u_accum'),    exposure: au(cp,'u_exposure'),
      gamma:    au(cp,'u_gamma'),    bloom:    au(cp,'u_bloom'),
    };
    // Accumulation VAO
    this._accumVAO = gl.createVertexArray();
    gl.bindVertexArray(this._accumVAO);
    const b2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,b2);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const loc2 = gl.getAttribLocation(this._accumProg,'a_quad');
    gl.enableVertexAttribArray(loc2);
    gl.vertexAttribPointer(loc2,2,gl.FLOAT,false,0,0);
    // Also bind for comp pass
    this._compVAO = gl.createVertexArray();
    gl.bindVertexArray(this._compVAO);
    const b3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,b3);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const loc3 = gl.getAttribLocation(this._compProg2,'a_quad');
    gl.enableVertexAttribArray(loc3);
    gl.vertexAttribPointer(loc3,2,gl.FLOAT,false,0,0);
    gl.bindVertexArray(null);
  }

  _mkScreenTex() {
    const gl = this._gl;
    const W = this._canvas.width || 640, H = this._canvas.height || 480;
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texImage2D(gl.TEXTURE_2D,0,this._accumInternalFormat,W,H,0,gl.RGBA,this._accumType,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    return t;
  }

  _mkFBO(tex) {
    const gl = this._gl;
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    return fbo;
  }

  _upload() {
    const gl=this._gl,N=this._texN,W=this._texW,H=this._texH;
    const BZ=this._boundZ*3*.9;
    const dXY=new Float32Array(N*4),dZ=new Float32Array(N*4);
    // Box-Muller for Gaussian initialization — particles spawn near face zone
    // sigma=2.5 so 95% within ±5 world units, centered at (0,0)
    const gauss = () => {
      const u=Math.random()||1e-10, v=Math.random();
      return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
    };
    for(let i=0;i<N;i++){
      dXY[i*4]  = gauss()*2.5;         // X: Gaussian σ=2.5
      dXY[i*4+1]= gauss()*3.0;         // Y: slightly taller range for forehead/chin
      dXY[i*4+2]=(Math.random()-.5)*.025;
      dXY[i*4+3]=(Math.random()-.5)*.025;
      dZ[i*4]   =(Math.random()-.5)*2*BZ;
      dZ[i*4+1] =(Math.random()-.5)*.012;
      dZ[i*4+2] =.15+Math.random()*.15;
      dZ[i*4+3] =1;
    }
    gl.bindTexture(gl.TEXTURE_2D,this._ping.tXY);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,W,H,0,gl.RGBA,gl.FLOAT,dXY);
    gl.bindTexture(gl.TEXTURE_2D,this._ping.tZ);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,W,H,0,gl.RGBA,gl.FLOAT,dZ);
  }

  _setupQuadVAO() {
    const gl=this._gl;
    this._quadVAO=gl.createVertexArray();
    gl.bindVertexArray(this._quadVAO);
    const b=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,b);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(this._compProg,'a_quad');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    gl.bindVertexArray(null);
  }

  _cacheCompUni() {
    const gl=this._gl,p=this._compProg;
    const u=(n)=>gl.getUniformLocation(p,n);
    return {
      sXY:u('u_sXY'),sZ:u('u_sZ'),t:u('u_t'),dt:u('u_dt'),
      ent:u('u_ent'),str:u('u_str'),curl:u('u_curl'),damp:u('u_damp'),
      vmax:u('u_vmax'),bound:u('u_bound'),boundZ:u('u_boundZ'),
      att:u('u_att'),
      spPos:u('u_spPos'),spPow:u('u_spPow'),
      irisL:u('u_irisL'),irisR:u('u_irisR'),nose:u('u_nose'),mouth:u('u_mouth'),
      lc:u('u_lcheek'),rc:u('u_rcheek'),fore:u('u_fore'),chin:u('u_chin'),
      gazeL:u('u_gazeL'),gazeR:u('u_gazeR'),gazeStr:u('u_gazeStr'),
      boundary:u('u_boundary'),boundaryActive:u('u_boundaryActive'),
      accumDecay:u('u_accumDecay'),faceScale:u('u_faceScale'),
      // blendshapes
      bsBlinkL:u('u_bsBlinkL'),bsBlinkR:u('u_bsBlinkR'),
      bsWideL:u('u_bsWideL'),bsWideR:u('u_bsWideR'),
      bsSquintL:u('u_bsSquintL'),bsSquintR:u('u_bsSquintR'),
      bsBrowDL:u('u_bsBrowDL'),bsBrowDR:u('u_bsBrowDR'),
      bsBrowIU:u('u_bsBrowIU'),bsBrowOUL:u('u_bsBrowOUL'),bsBrowOUR:u('u_bsBrowOUR'),
      bsJawOpen:u('u_bsJawOpen'),bsJawL:u('u_bsJawL'),bsJawR:u('u_bsJawR'),
      bsSmileL:u('u_bsSmileL'),bsSmileR:u('u_bsSmileR'),
      bsFrownL:u('u_bsFrownL'),bsFrownR:u('u_bsFrownR'),bsPucker:u('u_bsPucker'),
      bsStretchL:u('u_bsStretchL'),bsStretchR:u('u_bsStretchR'),
      bsDimpleL:u('u_bsDimpleL'),bsDimpleR:u('u_bsDimpleR'),
      bsSneerL:u('u_bsSneerL'),bsSneerR:u('u_bsSneerR'),
      bsCheekPuff:u('u_bsCheekPuff'),bsCheekSqL:u('u_bsCheekSqL'),bsCheekSqR:u('u_bsCheekSqR'),
      bsTongue:u('u_bsTongue'),
    };
  }

  _cacheRendUni() {
    const gl=this._gl,p=this._rendProg,u=(n)=>gl.getUniformLocation(p,n);
    return {sXY:u('u_sXY'),sZ:u('u_sZ'),texSz:u('u_texSz'),mvp:u('u_mvp'),ptBase:u('u_ptBase'),ent:u('u_ent'),str:u('u_str')};
  }

  _buildMVP(W,H) {
    const c=this._cam,asp=W/H,fov=c.fov,n=c.near,f=c.far;
    const t=1/Math.tan(fov/2),nf=1/(n-f);
    const P=new Float32Array([t/asp,0,0,0,0,t,0,0,0,0,(f+n)*nf,-1,0,0,2*f*n*nf,0]);
    const cs=Math.cos(c.tiltX),sn=Math.sin(c.tiltX);
    const V=new Float32Array([1,0,0,0,0,cs,sn,0,0,-sn,cs,0,0,0,-c.camZ,1]);
    const M=new Float32Array(16);
    for(let col=0;col<4;col++)for(let row=0;row<4;row++){let s=0;for(let k=0;k<4;k++)s+=P[k*4+row]*V[col*4+k];M[col*4+row]=s;}
    this._mvp=M;
  }

  step(dt) {
    const gl=this._gl;
    this._t+=dt;
    const strs=this._stresses.slice(0,MAX_STR);
    for(const s of this._stresses)s.life*=(1-dt*2.2);
    this._stresses=this._stresses.filter(s=>s.life>.015);
    const atts=this._attractors.slice(0,MAX_ATT);

    gl.useProgram(this._compProg);
    gl.bindFramebuffer(gl.FRAMEBUFFER,this._pong.fbo);
    gl.viewport(0,0,this._texW,this._texH);
    gl.disable(gl.BLEND);

    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this._ping.tXY); gl.uniform1i(this._cu.sXY,0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,this._ping.tZ);  gl.uniform1i(this._cu.sZ,1);

    const cu=this._cu,f=this.field,sk=this._sk,gz=this._gz,bs=this._bs;
    gl.uniform1f(cu.t,this._t); gl.uniform1f(cu.dt,Math.min(dt,.033));
    gl.uniform1f(cu.ent,f.entropy); gl.uniform1f(cu.str,f.structure);
    gl.uniform1f(cu.curl,f.curl); gl.uniform1f(cu.damp,f.damping);
    gl.uniform1f(cu.vmax,f.vmax); gl.uniform1f(cu.bound,this._bound);
    gl.uniform1f(cu.boundZ,this._boundZ);

    const aD=new Float32Array(MAX_ATT*4); // w=0 sentinel = end of list
    for(let i=0;i<Math.min(atts.length,MAX_ATT);i++){const a=atts[i];aD[i*4]=a.x;aD[i*4+1]=a.y;aD[i*4+2]=a.z??0;aD[i*4+3]=Math.max(0.01,a.mass??1);}
    // sentinel: next entry w=0 (already zero from Float32Array init)
    gl.uniform4fv(cu.att,aD);

    const spP=new Float32Array(MAX_STR*4),spW=new Float32Array(MAX_STR*4);
    for(let i=0;i<Math.min(strs.length,MAX_STR);i++){const s=strs[i];spP[i*4]=s.x;spP[i*4+1]=s.y;spP[i*4+2]=s.z??0;spP[i*4+3]=Math.max(0.01,s.life);spW[i*4]=s.strength;spW[i*4+1]=s.radius;}
    gl.uniform4fv(cu.spPos,spP); gl.uniform4fv(cu.spPow,spW);

    gl.uniform2fv(cu.irisL,sk.irisL); gl.uniform2fv(cu.irisR,sk.irisR);
    gl.uniform2fv(cu.nose,sk.nose);   gl.uniform2fv(cu.mouth,sk.mouth);
    gl.uniform2fv(cu.lc,sk.lcheek);  gl.uniform2fv(cu.rc,sk.rcheek);
    gl.uniform2fv(cu.fore,sk.fore);   gl.uniform2fv(cu.chin,sk.chin);
    gl.uniform2fv(cu.gazeL,gz.L); gl.uniform2fv(cu.gazeR,gz.R); gl.uniform1f(cu.gazeStr,gz.str);
    // Boundary uniforms
    if (cu.boundary) gl.uniform2fv(cu.boundary, this._boundary);
    if (cu.boundaryActive) gl.uniform1f(cu.boundaryActive, this._boundaryActive);
    if (cu.accumDecay) gl.uniform1f(cu.accumDecay, this._accumDecay);
    if (cu.faceScale) gl.uniform1f(cu.faceScale, this._faceScale);

    // Blendshapes
    gl.uniform1f(cu.bsBlinkL, bs.eyeBlinkLeft??0);    gl.uniform1f(cu.bsBlinkR, bs.eyeBlinkRight??0);
    gl.uniform1f(cu.bsWideL,  bs.eyeWideLeft??0);     gl.uniform1f(cu.bsWideR,  bs.eyeWideRight??0);
    gl.uniform1f(cu.bsSquintL,bs.eyeSquintLeft??0);   gl.uniform1f(cu.bsSquintR,bs.eyeSquintRight??0);
    gl.uniform1f(cu.bsBrowDL, bs.browDownLeft??0);    gl.uniform1f(cu.bsBrowDR, bs.browDownRight??0);
    gl.uniform1f(cu.bsBrowIU, bs.browInnerUp??0);     gl.uniform1f(cu.bsBrowOUL,bs.browOuterUpLeft??0);
    gl.uniform1f(cu.bsBrowOUR,bs.browOuterUpRight??0);
    gl.uniform1f(cu.bsJawOpen,bs.jawOpen??0);         gl.uniform1f(cu.bsJawL,   bs.jawLeft??0);
    gl.uniform1f(cu.bsJawR,   bs.jawRight??0);
    gl.uniform1f(cu.bsSmileL, bs.mouthSmileLeft??0);  gl.uniform1f(cu.bsSmileR, bs.mouthSmileRight??0);
    gl.uniform1f(cu.bsFrownL, bs.mouthFrownLeft??0);  gl.uniform1f(cu.bsFrownR, bs.mouthFrownRight??0);
    gl.uniform1f(cu.bsPucker, bs.mouthPucker??0);
    gl.uniform1f(cu.bsStretchL,bs.mouthStretchLeft??0);gl.uniform1f(cu.bsStretchR,bs.mouthStretchRight??0);
    gl.uniform1f(cu.bsDimpleL,bs.mouthDimpleLeft??0); gl.uniform1f(cu.bsDimpleR,bs.mouthDimpleRight??0);
    gl.uniform1f(cu.bsSneerL, bs.noseSneerLeft??0);   gl.uniform1f(cu.bsSneerR, bs.noseSneerRight??0);
    gl.uniform1f(cu.bsCheekPuff,bs.cheekPuff??0);
    gl.uniform1f(cu.bsCheekSqL,bs.cheekSquintLeft??0);gl.uniform1f(cu.bsCheekSqR,bs.cheekSquintRight??0);
    gl.uniform1f(cu.bsTongue,  bs.tongueOut??0);

    gl.bindVertexArray(this._quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    gl.bindVertexArray(null);

    const tmp=this._ping; this._ping=this._pong; this._pong=tmp;
    gl.enable(gl.BLEND);
  }

  render(W, H, pointSize=1.5) {
    const gl=this._gl;
    this._buildMVP(W,H);

    // ── Pass 2: Render particles to intermediate texture ──────────────────
    // We need an intermediate FBO to capture the current frame before accumulation.
    // Re-use accumulation FBO temporarily if no separate render FBO.
    // Simple approach: render directly then accumulate from canvas.
    // We use a separate offscreen texture for the current frame.
    if (!this._renderTex) {
      this._renderTex = this._mkScreenTex();
      this._renderFBO = this._mkFBO(this._renderTex);
    }

    // Resize accumulation textures if canvas size changed
    if (this._lastW !== W || this._lastH !== H) {
      this._lastW = W; this._lastH = H;
      gl.deleteTexture(this._accumTex);
      gl.deleteTexture(this._renderTex);
      gl.deleteFramebuffer(this._accumFBO);
      gl.deleteFramebuffer(this._renderFBO);
      this._accumTex  = this._mkScreenTex();
      this._accumFBO  = this._mkFBO(this._accumTex);
      this._renderTex = this._mkScreenTex();
      this._renderFBO = this._mkFBO(this._renderTex);
    }

    // Render particles to _renderFBO (not screen)
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderFBO);
    gl.viewport(0,0,W,H);
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this._rendProg);
    const ru = this._ru;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this._ping.tXY); gl.uniform1i(ru.sXY,0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,this._ping.tZ);  gl.uniform1i(ru.sZ,1);
    gl.uniform2f(ru.texSz,this._texW,this._texH);
    gl.uniformMatrix4fv(ru.mvp,false,this._mvp);
    gl.uniform1f(ru.ptBase,pointSize);
    gl.uniform1f(ru.ent,this.field.entropy);
    gl.uniform1f(ru.str,this.field.structure);
    gl.disable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    gl.enable(gl.BLEND);
    gl.bindVertexArray(this._rendVAO);
    gl.drawArrays(gl.POINTS,0,this._texN);
    gl.bindVertexArray(null);

    // ── Pass 3: Accumulate (long-exposure temporal history) ───────────────
    if (!this._accumTex || !this._renderTex || !this._au) {
      // No accumulation — just draw render FBO directly to screen
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      gl.viewport(0,0,W,H);
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      gl.bindVertexArray(null);
      return;
    }
    //
    // Blend current frame into accumulation buffer with exponential decay.
    // Foveated: face region accumulates at full rate, periphery fades faster.
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._accumFBO);
    gl.viewport(0,0,W,H);
    gl.disable(gl.BLEND);
    gl.useProgram(this._accumProg);
    const au = this._au;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this._renderTex); gl.uniform1i(au.current,0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,this._accumTex);  gl.uniform1i(au.history,1);
    gl.uniform1f(au.decay,   this._accumDecay);
    gl.uniform1f(au.weight,  1.0 - this._accumDecay);
    gl.uniform2f(au.faceCenter, this._faceCenterUV[0], this._faceCenterUV[1]);
    gl.uniform1f(au.faceRadius, this._faceRadiusUV);
    gl.bindVertexArray(this._accumVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    gl.bindVertexArray(null);

    // ── Pass 4: Compose to screen with tone mapping + bloom ───────────────
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.viewport(0,0,W,H);
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.BLEND);
    gl.useProgram(this._compProg2);
    const cu2 = this._cu2;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this._accumTex); gl.uniform1i(cu2.accum,0);
    gl.uniform1f(cu2.exposure, this._accumExposure);
    gl.uniform1f(cu2.gamma,    this._accumGamma);
    gl.uniform1f(cu2.bloom,    this._accumBloom);
    gl.bindVertexArray(this._compVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    gl.bindVertexArray(null);

    gl.enable(gl.BLEND);
  }

  // Public API
  upsertAttractor(id,x,y,z=0,mass=1){const i=this._attractors.findIndex(a=>a.id===id);if(i>=0)this._attractors[i]={id,x,y,z,mass};else this._attractors.push({id,x,y,z,mass});}
  removeAttractor(id){this._attractors=this._attractors.filter(a=>a.id!==id);}
  injectStress(x,y,z=0,strength=500,radius=4){this._stresses.push({x,y,z,strength,radius,life:1});if(this._stresses.length>MAX_STR*3)this._stresses.splice(0,1);}
  setBlendshapes(bs){Object.assign(this._bs,bs);}
  setSkeleton(sk){Object.assign(this._sk,sk);}

  /**
   * Set face boundary contour for particle confinement.
   * @param {Array<[number,number]>} points — 16 world-space [x,y] points
   *                                          forming the face oval contour
   * @param {number} faceScale — face size proxy (forehead-chin distance)
   * @param {number[]} faceCenterUV — [u,v] of nose in screen [0,1] space
   * @param {number} faceRadiusUV — face radius in screen UV units
   */
  setFaceBoundary(points, faceScale=1, faceCenterUV=[0.5,0.5], faceRadiusUV=0.3) {
    this._boundaryActive = 1;
    this._faceScale      = faceScale;
    this._faceCenterUV   = faceCenterUV;
    this._faceRadiusUV   = faceRadiusUV;
    for (let i=0;i<Math.min(points.length,16);i++) {
      this._boundary[i*2]   = points[i][0];
      this._boundary[i*2+1] = points[i][1];
    }
  }

  clearFaceBoundary() { this._boundaryActive = 0; }

  /**
   * Ingest codec audio analysis to drive field parameters.
   * Wires codec-v2 NexusRuntime output directly to particle physics.
   *
   * Voice quality → field quality:
   *   High jitter (laryngeal tension)  → entropy spike
   *   Low HNR (breathiness/noise)      → structure drop
   *   High shimmer (amplitude flutter) → curl increase
   *   Unvoiced/silence                 → gentle drift back to base
   *
   * @param {object} pitchResult — from codec-v2 PitchEngine.analyze()
   * @param {object} audioFrame  — from codec GPGPUAudioProcessor
   */
  ingestCodecAudio(pitchResult, audioFrame) {
    if (!pitchResult) return;
    const EMA = 0.12; // slow integration — vocal changes are sustained

    if (pitchResult.voiced) {
      // Jitter → entropy: vocal tension is field turbulence
      const jitter  = pitchResult.jitter  ?? 0;
      const shimmer = pitchResult.shimmer ?? 0;
      const hnr     = pitchResult.hnr     ?? 15; // default healthy HNR

      const jitterEntropy  = Math.min(0.35, jitter  * 8);   // jitter > 0.04 = tense
      const shimmerCurl    = Math.min(0.20, shimmer  * 4);  // shimmer > 0.05 = flutter
      const hnrStructure   = Math.min(0.25, Math.max(0, (hnr-5)/20)); // 5-25dB range

      this._pitchJitter  = this._pitchJitter  * (1-EMA) + jitterEntropy * EMA;
      this._pitchShimmer = this._pitchShimmer * (1-EMA) + shimmerCurl   * EMA;
      this._pitchHNR     = this._pitchHNR     * (1-EMA) + hnrStructure  * EMA;

      // Field modulation: additive on top of base field params
      this._audioField.entropy   = this._pitchJitter;
      this._audioField.structure = this._pitchHNR;
      this._audioField.curl      = this._pitchShimmer;
    } else {
      // Unvoiced/silence: decay audio modulation
      this._pitchJitter  *= 0.95;
      this._pitchShimmer *= 0.95;
      this._pitchHNR     *= 0.95;
      this._audioField.entropy   = this._pitchJitter;
      this._audioField.structure = this._pitchHNR;
      this._audioField.curl      = this._pitchShimmer;
    }

    // Energy anomaly → stress injection at face center
    if (audioFrame?.energyAnomaly) {
      const [nx,ny] = [this._sk.nose[0], this._sk.nose[1]];
      this.injectStress(nx, ny, 0, Math.min(600, (audioFrame.energyZ??2)*150), 4.5);
    }

    // Prosody tag drives accumulation decay:
    // "tense" voice → slower decay (history builds up = tension is written in field)
    // "breathy" → faster decay (field clears quickly = openness)
    // "rising" → standard
    const prosodyDecayMap = {
      tense:    0.96, creaky: 0.95, breathy: 0.88,
      falling:  0.92, rising: 0.91, modal:   0.93,
      unvoiced: 0.91, unknown: 0.93,
    };
    const targetDecay = prosodyDecayMap[pitchResult.prosodyTag] ?? 0.93;
    this._accumDecay = this._accumDecay * 0.95 + targetDecay * 0.05;
  }

  /**
   * Get combined field params: base field + audio modulation.
   */
  getEffectiveField() {
    return {
      entropy:   Math.min(0.98, this.field.entropy   + this._audioField.entropy),
      structure: Math.min(0.98, this.field.structure + this._audioField.structure),
      curl:      Math.min(0.98, this.field.curl      + this._audioField.curl),
      damping:   this.field.damping,
      vmax:      this.field.vmax,
    };
  }

  /**
   * Accumulation parameter controls.
   */
  setAccumulation({ decay, exposure, gamma, bloom } = {}) {
    if (decay    !== undefined) this._accumDecay    = Math.max(0.5, Math.min(0.99, decay));
    if (exposure !== undefined) this._accumExposure = Math.max(0.5, Math.min(5.0,  exposure));
    if (gamma    !== undefined) this._accumGamma    = Math.max(0.5, Math.min(3.0,  gamma));
    if (bloom    !== undefined) this._accumBloom    = Math.max(0.0, Math.min(1.0,  bloom));
  }
  setGaze(L,R,str){this._gz.L=L;this._gz.R=R;this._gz.str=str;}
  get N(){return this._texN;}
  get texW(){return this._texW;}
  get texH(){return this._texH;}
  _resize(){const r=this._canvas.getBoundingClientRect(),dpr=devicePixelRatio??1;this._canvas.width=Math.round((r.width||640)*dpr);this._canvas.height=Math.round((r.height||480)*dpr);}
  destroy(){const gl=this._gl;this._ro?.disconnect();for(const p of[this._ping,this._pong]){gl.deleteTexture(p.tXY);gl.deleteTexture(p.tZ);gl.deleteFramebuffer(p.fbo);}gl.deleteProgram(this._compProg);gl.deleteProgram(this._rendProg);}
  health(){return{status:'OK',N:this._texN,texW:this._texW,texH:this._texH,attractors:this._attractors.length,stresses:this._stresses.length,field:{...this.field},t:this._t};}
}

return ALKGL;
})();

---

# runtime/precision-clock.js

/* ═══════════════════════════════════════════════════════════
   PRECISION CLOCK  v1.0.0
   runtime/precision-clock.js

   Three-layer timing system:

   LAYER 1 — AudioWorklet (audio thread)
     Runs precision-clock.worklet.js on the audio thread.
     Sends tick messages every ~2.9ms with sample-accurate
     AudioContext.currentTime stamps. No JS main thread jitter.

   LAYER 2 — Lookahead scheduler (main thread)
     On each worklet tick, looks LOOKAHEAD seconds into the
     future and fires any events scheduled in that window.
     Events are pre-scheduled against AudioContext.currentTime,
     not "fire now" — so the audio engine gets exact times.

   LAYER 3 — Web Audio API as clock source
     All synthesis uses t = AudioContext.currentTime + offset.
     The AudioContext clock is hardware-locked. It does not drift.

   Usage:
     const clock = new PrecisionClock(AudioContext);
     await clock.boot();
     clock.onTick = (nextBeatTime) => { ... };
     clock.start(bpm, subdivision);
     clock.stop();

   Exports: window.PrecisionClock
   ═══════════════════════════════════════════════════════════ */

window.PrecisionClock = class PrecisionClock {
  constructor(AC) {
    this._AC          = AC;
    this._worklet     = null;   /* AudioWorkletNode */
    this._running     = false;
    this._bpm         = 128;
    this._subdivision = 4;      /* 4 = 16th notes */
    this._stepTime    = 0;      /* seconds per step */
    this._nextStepAt  = 0;      /* AC.currentTime of next step */
    this._stepIdx     = 0;
    this._stepCount   = 16;
    this._swing       = 0;      /* 0-0.5 — amount of swing delay on odd steps */
    this._booted      = false;

    /* Lookahead: how far ahead to schedule in seconds.
       Longer = safer against jitter but more latency.
       100ms is the sweet spot for most hardware.        */
    this.LOOKAHEAD    = 0.100;

    /* Callbacks — set these from outside */
    this.onStep       = null; /* (stepIdx, scheduleTime) => void */
    this.onBar        = null; /* (barIdx, scheduleTime)  => void */
  }

  /* Boot — loads worklet module. Must be called after first user gesture. */
  async boot() {
    if (this._booted) return;
    try {
      /* AudioWorklet requires HTTPS or localhost. For file:// we fallback. */
      const workletUrl = new URL('precision-clock.worklet.js', location.href).href;
      await this._AC.audioWorklet.addModule(workletUrl);
      this._worklet = new AudioWorkletNode(this._AC, 'precision-clock');
      this._worklet.port.onmessage = ({ data }) => {
        if (data.type === 'tick') this._onWorkletTick(data.time);
      };
      /* Connect to destination so the worklet stays alive
         (some browsers garbage-collect disconnected nodes) */
      this._worklet.connect(this._AC.destination);
      this._booted = true;
      console.log('[PrecisionClock] AudioWorklet booted — audio-thread scheduling active');
    } catch(e) {
      /* file:// or browser without AudioWorklet support → fallback */
      console.warn('[PrecisionClock] AudioWorklet unavailable, falling back to lookahead setTimeout:', e.message);
      this._booted = true;
      this._fallback = true;
    }
  }

  /* Recompute step timing from BPM */
  _recompute() {
    const beatSec     = 60 / this._bpm;
    this._stepTime    = beatSec / (this._subdivision / 4);
  }

  start(bpm = 128, stepCount = 16, subdivision = 4, swing = 0) {
    if (this._running) this.stop();
    this._bpm         = bpm;
    this._stepCount   = stepCount;
    this._subdivision = subdivision;
    this._swing       = Math.max(0, Math.min(0.49, swing));
    this._stepIdx     = 0;
    this._running     = true;
    this._recompute();
    this._nextStepAt  = this._AC.currentTime + 0.05; /* small startup delay */

    if (this._fallback) {
      this._fallbackLoop();
    } else {
      /* Start worklet — tick interval = half the lookahead for safety */
      const tickInterval = this.LOOKAHEAD / 2;
      this._worklet.port.postMessage({ type:'start', intervalSec: tickInterval });
    }
  }

  stop() {
    this._running = false;
    this._stepIdx = 0;
    if (this._worklet && !this._fallback) {
      this._worklet.port.postMessage({ type:'stop' });
    }
    if (this._fallbackTimer) {
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = null;
    }
  }

  setBPM(bpm) {
    this._bpm = Math.max(20, Math.min(999, bpm));
    this._recompute();
    if (this._worklet && !this._fallback && this._running) {
      const tickInterval = this.LOOKAHEAD / 2;
      this._worklet.port.postMessage({ type:'set-interval', intervalSec: tickInterval });
    }
  }

  setSwing(swing) {
    this._swing = Math.max(0, Math.min(0.49, swing));
  }

  /* ── Worklet tick handler ─────────────────────────────── */
  _onWorkletTick(tickTime) {
    if (!this._running) return;

    /* Schedule all steps that fall within the lookahead window */
    while (this._nextStepAt < tickTime + this.LOOKAHEAD) {
      this._scheduleStep(this._nextStepAt);
      this._advance();
    }
  }

  /* Schedule one step at an exact AudioContext time */
  _scheduleStep(t) {
    if (!this.onStep) return;
    try {
      this.onStep(this._stepIdx, t);
      if (this._stepIdx % (this._subdivision) === 0 && this.onBar) {
        this.onBar(Math.floor(this._stepIdx / this._subdivision), t);
      }
    } catch(e) {
      console.error('[PrecisionClock] onStep error:', e);
    }
  }

  /* Advance step index and compute next step time with swing */
  _advance() {
    this._stepIdx = (this._stepIdx + 1) % this._stepCount;

    /* Swing: delay odd 16th notes by swing fraction of a 16th */
    const swingDelay = (this._stepIdx % 2 === 1)
      ? this._swing * this._stepTime
      : 0;

    this._nextStepAt += this._stepTime + swingDelay;
  }

  /* ── Fallback: lookahead setTimeout ─────────────────────
     Same lookahead logic but driven by setTimeout.
     Better than bare setTimeout(fn, stepMs) because we
     still schedule against AC.currentTime — just the trigger
     is less precise. ~2-5ms jitter vs ~10-20ms.           */
  _fallbackLoop() {
    if (!this._running) return;

    const now = this._AC.currentTime;
    while (this._nextStepAt < now + this.LOOKAHEAD) {
      this._scheduleStep(this._nextStepAt);
      this._advance();
    }

    /* Schedule next check — aim for half the lookahead window */
    const msUntilNextCheck = (this.LOOKAHEAD / 2) * 1000;
    this._fallbackTimer = setTimeout(() => this._fallbackLoop(), msUntilNextCheck);
  }

  get BPM()     { return this._bpm; }
  get stepIdx() { return this._stepIdx; }
  get running() { return this._running; }
};

/* ── SNR Master Bus ──────────────────────────────────────────
   Signal-to-noise filtering on the audio output chain.

   Chain: dry → highpass(20Hz) → lowpass(20kHz) → compressor
          → limiter → destination

   Highpass: removes sub-sonic rumble (<20Hz) that wastes
   headroom and causes speaker damage.

   Lowpass: removes aliasing artifacts above 20kHz.

   Compressor: already in kernel. Tuned for music production:
   fast attack for transients, slow release for sustain.

   Limiter: hard brickwall at -0.3dBFS. Prevents clipping
   on the digital output. True peak limiting.

   Dithering: adds shaped noise at -144dBFS before the
   limiter to reduce quantization distortion on 16-bit export.
   Inaudible but measurable — improves SNR on export.
   ═══════════════════════════════════════════════════════════ */
window.SNRChain = (() => {
'use strict';

let _booted    = false;
let _hpFilter  = null;
let _lpFilter  = null;
let _compressor= null;
let _limiter   = null;
let _ditherGain= null;
let _ditherSrc = null;

function boot(AC, masterGain) {
  if (_booted) return;
  _booted = true;

  /* High-pass — kill sub-sonic rumble */
  _hpFilter = AC.createBiquadFilter();
  _hpFilter.type            = 'highpass';
  _hpFilter.frequency.value = 22;     /* 22Hz — below human hearing */
  _hpFilter.Q.value         = 0.707;  /* Butterworth — no resonance */

  /* Low-pass — kill aliasing */
  _lpFilter = AC.createBiquadFilter();
  _lpFilter.type            = 'lowpass';
  _lpFilter.frequency.value = 20000;
  _lpFilter.Q.value         = 0.707;

  /* Compressor — tuned for music production */
  _compressor = AC.createDynamicsCompressor();
  _compressor.threshold.value = -18;  /* dBFS — gentle catch */
  _compressor.knee.value      = 6;    /* soft knee — natural sounding */
  _compressor.ratio.value     = 3;    /* 3:1 — gentle, not crushing */
  _compressor.attack.value    = 0.003;/* 3ms — catches transients */
  _compressor.release.value   = 0.25; /* 250ms — musical release */

  /* Limiter — true peak brickwall */
  _limiter = AC.createDynamicsCompressor();
  _limiter.threshold.value = -0.5;   /* -0.5dBFS brickwall */
  _limiter.knee.value      = 0;      /* hard knee */
  _limiter.ratio.value     = 20;     /* 20:1 ≈ limiting */
  _limiter.attack.value    = 0.001;  /* 1ms */
  _limiter.release.value   = 0.05;   /* 50ms */

  /* Dither — shaped noise at -144dBFS
     Reduces quantization noise on 16-bit output.
     Uses noise shaping to push quantization error
     into high frequencies where it's less audible.  */
  try {
    const ditherBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
    const d         = ditherBuf.getChannelData(0);
    /* TPDF dither: two uniform noise sources subtracted */
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() - Math.random()) / 32768; /* 1 LSB at 16-bit */
    }
    _ditherSrc       = AC.createBufferSource();
    _ditherSrc.buffer = ditherBuf;
    _ditherSrc.loop   = true;
    _ditherGain       = AC.createGain();
    _ditherGain.gain.value = 0.5; /* -6dB relative to 1 LSB */
    _ditherSrc.connect(_ditherGain);
    _ditherGain.connect(_limiter);
    _ditherSrc.start();
  } catch(e) {
    /* Dither is enhancement only — non-fatal */
    console.warn('[SNRChain] Dither init failed (non-fatal):', e.message);
  }

  /* Chain: masterGain → hp → lp → compressor → limiter → destination */
  try { masterGain.disconnect(); } catch(e) {}
  masterGain.connect(_hpFilter);
  _hpFilter.connect(_lpFilter);
  _lpFilter.connect(_compressor);
  _compressor.connect(_limiter);
  _limiter.connect(AC.destination);

  console.log('[SNRChain] Master bus: HPF(22Hz) → LPF(20kHz) → Comp(3:1) → Limiter(-0.5dBFS) → Dither(TPDF)');

  return { hpFilter: _hpFilter, lpFilter: _lpFilter, compressor: _compressor, limiter: _limiter };
}

function getReduction() {
  if (!_compressor) return { comp: 0, limit: 0 };
  return {
    comp:  Math.abs(_compressor.reduction),
    limit: Math.abs(_limiter.reduction),
  };
}

return { boot, getReduction };
})();

---

# runtime/master-transport.js

/* ═══════════════════════════════════════════════════════════
   MASTER TRANSPORT  v1.0.0
   runtime/master-transport.js

   Single play/stop/record for the entire canvas.
   All organisms that respond to seq:play / seq:stop sync here.

   RECORD: taps KERNEL.audio.dry via MediaStreamDestination,
   captures to ArrayBuffer, hands to timeline as a new clip.

   Exports: window.MasterTransport
   ═══════════════════════════════════════════════════════════ */
window.MasterTransport = (() => {
'use strict';

let _playing   = false;
let _recording = false;
let _recorder  = null;
let _chunks    = [];
let _startTime = 0;
let _bpm       = 128;

const gBus = () => KERNEL.bus;

function play() {
  if (_playing) return;
  _playing = true;
  _bpm = KERNEL.clock.BPM;
  gBus().publish('seq:play',  { BPM: _bpm });
  gBus().publish('transport:play', { BPM: _bpm, timestamp: Date.now() });
  _startTime = KERNEL.audio.AC?.currentTime || 0;
}

function stop() {
  if (!_playing && !_recording) return;
  _playing = false;
  gBus().publish('seq:stop', {});
  gBus().publish('transport:stop', { timestamp: Date.now() });
  if (_recording) _stopRecord();
}

function togglePlay() { _playing ? stop() : play(); }

function record() {
  if (_recording) { _stopRecord(); return; }
  const AC = KERNEL.audio.boot();
  if (!AC.createMediaStreamDestination) {
    gBus().publish('kernel:notify', { message: '⚠ Recording not supported in this browser' });
    return;
  }
  const dest   = AC.createMediaStreamDestination();
  KERNEL.audio.dry.connect(dest);

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';

  _recorder = new MediaRecorder(dest.stream, { mimeType });
  _chunks   = [];

  _recorder.ondataavailable = e => { if (e.data.size > 0) _chunks.push(e.data); };
  _recorder.onstop = async () => {
    const blob   = new Blob(_chunks, { type: mimeType });
    const ab     = await blob.arrayBuffer();
    const dur    = KERNEL.audio.AC ? (KERNEL.audio.AC.currentTime - _startTime) : 0;
    gBus().publish('transport:recorded', { arrayBuffer: ab, duration: dur, mimeType });
    gBus().publish('kernel:notify', { message: `⏺ Recorded ${dur.toFixed(1)}s` });
    KERNEL.audio.dry.disconnect(dest);
  };

  _recorder.start(100);
  _recording = true;
  _startTime = AC.currentTime;

  /* Auto-start playback with recording */
  if (!_playing) play();

  gBus().publish('transport:record-start', {});
  gBus().publish('kernel:notify', { message: '⏺ Recording…' });
}

function _stopRecord() {
  if (!_recorder || _recorder.state === 'inactive') return;
  _recorder.stop();
  _recording = false;
  gBus().publish('transport:record-stop', {});
}

function setBPM(bpm) {
  _bpm = Math.max(40, Math.min(240, Math.round(bpm)));
  KERNEL.clock.BPM = _bpm;
  gBus().publish('kernel:bpm-change', { BPM: _bpm });
}

/* Listen for organisms that want to drive transport */
function _wire() {
  gBus().subscribe('ui:transport-play',   () => play());
  gBus().subscribe('ui:transport-stop',   () => stop());
  gBus().subscribe('ui:transport-record', () => record());
  gBus().subscribe('ui:transport-bpm',    ({ bpm }) => setBPM(bpm));
}
_wire();

return {
  play, stop, record, togglePlay, setBPM,
  get playing()   { return _playing; },
  get recording() { return _recording; },
  get BPM()       { return _bpm; },
};
})();

---

# specs/eravos.organism.sample-player.spec

# ============================================================
# ERAVOS ORGANISM SPEC — SAMPLE PLAYER
# spec_id:      eravos.organism.sample-player
# version:      1.0.0
# author:       James Brooks
# status:       canonical
# conforms_to:  ERAVOS.kernel.spec v1.0.0
# ============================================================

header:
  spec_id:         eravos.organism.sample-player
  spec_version:    1.0.0
  spec_type:       organism
  kernel_target:   1.0.0
  author:          James Brooks
  created_at:      2026-06-22
  schema:          organism.schema.v1
  status:          canonical

identity:
  id:              eravos.sample-player
  label:           Sample Player
  icon:            🎵
  description: >
    Loads a single audio file. Displays decoded waveform.
    Play, stop, loop, reverse. Pitch, gain, start/end point
    control. Triggered by pad events or manual play.
    Spawns automatically when audio file is dropped.
  comp_type:       module
  comp_intent: >
    Play back a loaded audio sample with pitch, gain,
    loop, and start/end point control, triggered by
    pad events or transport.
  node_id:         module.audio.sample-player
  tags:            [audio, sample, playback, waveform]
  domains:         [music, podcasting, sound-design]
  traits:          [stateful, realtime]

permissions:
  - audio_out
  - bus_publish
  - bus_subscribe
  - filesystem_read

provides:
  - capability.audio_out
  - capability.sample_source

requires:
  - capability.audio_context

dependencies: []

constraints:
  - constraint_id:  samp.C-1
    predicate:      loaded file must be decodable by AudioContext
    failure_mode:   ASSET_002
    blocking:       true

hooks:

  - hook_id:         samp.hook.trigger_in
    hook_type:       receiver
    direction:       in
    intent:          Plays the loaded sample when a matching pad trigger arrives
    event_type:      pad:trigger
    wire_type:       event_bus
    schema:
      type:          object
      required:      [sound, velocity]
      properties:
        sound:       { type: string }
        velocity:    { type: number }
    contract_version: 1.0.0
    failure_mode:    RUNTIME_003

  - hook_id:         samp.hook.audio_out
    hook_type:       emitter
    direction:       out
    intent:          Routes decoded audio to the master bus or channel strip
    event_type:      audio:signal
    wire_type:       event_bus
    schema:
      type:          object
      required:      [source_id, gain]
      properties:
        source_id:   { type: string }
        gain:        { type: number }
    contract_version: 1.0.0
    failure_mode:    RUNTIME_004

  - hook_id:         samp.hook.clip_in
    hook_type:       receiver
    direction:       in
    intent:          Receives timeline clip play event — plays at that position
    event_type:      timeline:clip_play
    wire_type:       event_bus
    schema:
      type:          object
      required:      [clip_id, asset_id, position_sec]
      properties:
        clip_id:     { type: string }
        asset_id:    { type: string }
        position_sec: { type: number }
    contract_version: 1.0.0
    failure_mode:    RUNTIME_003

relations:

  - to:              eravos.channel
    wire:
      from:          samp.hook.audio_out
      to:            channel.hook.audio_in
    auto:            false
    label:           Route to channel strip

  - to:              eravos.timeline
    wire:
      from:          samp.hook.clip_in
      to:            tl.hook.clip_play_out
    auto:            false
    label:           Play from timeline

projections:

  - space_id:        canvas
    component:       ui/sample-player.html
    default:         true
    min_width:       220
    min_height:      240
    resizable:       true
    collapsible:     true
    accent:          "#aa44ff"

  - space_id:        compact
    component:       ui/sample-player-mini.html
    default:         false
    min_width:       120
    min_height:      80

config:

  - key:             gain
    type:            number
    default:         1
    min:             0
    max:             2
    step:            0.01
    label:           Gain
    group:           playback

  - key:             pitch
    type:            number
    default:         0
    min:             -24
    max:             24
    step:            0.5
    unit:            st
    label:           Pitch
    group:           playback

  - key:             start
    type:            number
    default:         0
    min:             0
    max:             1
    step:            0.001
    label:           Start Point
    group:           playback

  - key:             end
    type:            number
    default:         1
    min:             0
    max:             1
    step:            0.001
    label:           End Point
    group:           playback

  - key:             loop
    type:            boolean
    default:         false
    label:           Loop
    group:           playback

  - key:             reverse
    type:            boolean
    default:         false
    label:           Reverse
    group:           playback

modes:

  - mode_id:         performance
    label:           Performance
    mutations:
      disable:       [ui.waveform]
      set:
        audio.buffer_size: 128

  - mode_id:         edit
    label:           Edit
    mutations:
      enable:        [ui.waveform]

imports:

  - mime:            audio/wav
    role:            sample_source
    auto_mount:      true

  - mime:            audio/mpeg
    role:            sample_source
    auto_mount:      true

  - mime:            audio/ogg
    role:            sample_source
    auto_mount:      true

  - mime:            audio/flac
    role:            sample_source
    auto_mount:      true

  - mime:            audio/aiff
    role:            sample_source
    auto_mount:      true

exports:

  - format:          wav
    from:            audio_out
    label:           Bounce to WAV

ui_hooks:

  - hook_id:         ui.play_press
    direction:       ui_to_organism
    event_type:      ui:play_press
    schema:
      type:          object
      properties: {}
    description:     User pressed play

  - hook_id:         ui.stop_press
    direction:       ui_to_organism
    event_type:      ui:stop_press
    schema:
      type:          object
      properties: {}
    description:     User pressed stop

  - hook_id:         ui.config_change
    direction:       ui_to_organism
    event_type:      ui:config_change
    schema:
      type:          object
      required:      [key, value]
      properties:
        key:         { type: string }
        value:       {}
    description:     User changed a config parameter

  - hook_id:         ui.waveform_ready
    direction:       organism_to_ui
    event_type:      org:waveform_ready
    schema:
      type:          object
      required:      [peaks, duration_sec, name]
      properties:
        peaks:       { type: array, items: { type: number } }
        duration_sec: { type: number }
        name:        { type: string }
    description:     Decoded waveform data ready for rendering

  - hook_id:         ui.playhead_update
    direction:       organism_to_ui
    event_type:      org:playhead_update
    schema:
      type:          object
      required:      [position_normalized]
      properties:
        position_normalized: { type: number, minimum: 0, maximum: 1 }
    description:     Playhead position 0-1 for waveform display

files:
  ui:              ui/sample-player.html
  schema:          schema/sample-player.schema.json

raises_faults:
  - MOUNT_002
  - ASSET_001
  - ASSET_002
  - RUNTIME_003
  - RUNTIME_004

---

# specs/eravos.genomes-ecosystems-behaviors.spec

# ============================================================
# ERAVOS GENOME SPEC — MUSIC
# spec_id:      eravos.genome.music
# version:      1.0.0
# author:       James Brooks
# status:       canonical
# conforms_to:  ERAVOS.kernel.spec v1.0.0
# ============================================================

header:
  spec_id:         eravos.genome.music
  spec_version:    1.0.0
  spec_type:       genome
  kernel_target:   1.0.0
  author:          James Brooks
  created_at:      2026-06-22
  schema:          genome.schema.v1
  status:          canonical

identity:
  id:              eravos.genome.music
  label:           Music Production
  icon:            🎛
  description: >
    Species definition for music production environments.
    Preferred archetypes, behaviors, spaces, and layout
    rules for composing, arranging, and mixing.

archetypes:
  - eravos.pads
  - eravos.sequencer
  - eravos.timeline
  - eravos.sample-player
  - eravos.lfo
  - eravos.wobble-bass
  - eravos.acid-synth
  - eravos.reese-bass
  - eravos.channel
  - eravos.xy-pad

behaviors:
  - eravos.behavior.autosave
  - eravos.behavior.bpm-tap
  - eravos.behavior.clip-snap

spaces:
  - canvas
  - timeline
  - graph

default_space:    canvas

constraints:
  - constraint_id:  music.C-1
    predicate:      if timeline exists then transport must be wired
    failure_mode:   CONSTRAINT_001
    blocking:       false

  - constraint_id:  music.C-2
    predicate:      BPM must be consistent across all mounted organisms
    failure_mode:   CONSTRAINT_001
    blocking:       false

layout_rules:

  - if_present:     eravos.timeline
    prefer_position:
      y_anchor:     bottom
      height:       240
    prefer_space:   canvas

  - if_present:     eravos.sequencer
    prefer_position:
      x_anchor:     right
      width:        580
    prefer_space:   canvas

  - if_present:     eravos.pads
    prefer_position:
      x:            40
      y:            30
    prefer_space:   canvas

recipes:
  - eravos.recipe.quick-beat
  - eravos.recipe.full-session

---

# ============================================================
# ERAVOS GENOME SPEC — PODCASTING
# spec_id:      eravos.genome.podcasting
# ============================================================

header:
  spec_id:         eravos.genome.podcasting
  spec_version:    1.0.0
  spec_type:       genome
  kernel_target:   1.0.0
  author:          James Brooks
  created_at:      2026-06-22
  schema:          genome.schema.v1
  status:          canonical

identity:
  id:              eravos.genome.podcasting
  label:           Podcasting
  icon:            🎙
  description: >
    Species definition for podcast editing and production.
    Voice-focused, timeline-first, minimal synthesis surface.

archetypes:
  - eravos.timeline
  - eravos.sample-player
  - eravos.channel
  - eravos.agent.transcriber
  - eravos.agent.librarian

behaviors:
  - eravos.behavior.autosave
  - eravos.behavior.clip-snap
  - eravos.behavior.magnetic-clips

spaces:
  - canvas
  - timeline

default_space:   timeline

constraints:
  - constraint_id:  podcast.C-1
    predicate:      timeline requires at least one audio lane
    failure_mode:   CONSTRAINT_001
    blocking:       false

layout_rules:

  - if_present:     eravos.timeline
    prefer_position:
      y_anchor:     center
      height:       400
    prefer_space:   canvas

  - if_present:     eravos.channel
    prefer_position:
      x_anchor:     right
      width:        160
    prefer_space:   canvas

---

# ============================================================
# ERAVOS ECOSYSTEM SPEC — PODCASTING
# spec_id:      eravos.ecosystem.podcasting
# ============================================================

header:
  spec_id:         eravos.ecosystem.podcasting
  spec_version:    1.0.0
  spec_type:       ecosystem
  kernel_target:   1.0.0
  author:          James Brooks
  created_at:      2026-06-22
  schema:          ecosystem.schema.v1
  status:          canonical

identity:
  id:              eravos.ecosystem.podcasting
  label:           Podcast Production
  icon:            🎙
  description: >
    A complete podcast editing culture. Drops in as a single
    zip. Installs genome, behaviors, theme, and starter recipe.
    Drop voice files. Timeline opens. Transcription agent mounts.

genome:            eravos.genome.podcasting

behaviors:
  - eravos.behavior.autosave
  - eravos.behavior.magnetic-clips
  - eravos.behavior.clip-snap

recipes:
  - eravos.recipe.voice-cleanup
  - eravos.recipe.interview-setup

theme:             eravos.theme.dark

constraints:
  - constraint_id:  podcast-eco.C-1
    predicate:      timeline.clip_snap must be enabled
    failure_mode:   CONSTRAINT_002
    blocking:       false

defaults:
  mode:            edit
  bpm:             120
  space:           canvas

---

# ============================================================
# ERAVOS RECIPE SPEC — QUICK BEAT
# spec_id:      eravos.recipe.quick-beat
# ============================================================

header:
  spec_id:         eravos.recipe.quick-beat
  spec_version:    1.0.0
  spec_type:       recipe
  kernel_target:   1.0.0
  author:          James Brooks
  created_at:      2026-06-22
  schema:          recipe.schema.v1
  status:          canonical

identity:
  id:              eravos.recipe.quick-beat
  label:           Quick Beat
  icon:            🥁
  description: >
    Mounts drum machine and sequencer, auto-wires them,
    loads default pattern. Ready to play in one drop.

steps:

  - step_id:       qb.1
    operation:     mount
    target:        eravos.pads
    payload:
      position:    { x: 40, y: 30 }
    depends_on:    []

  - step_id:       qb.2
    operation:     mount
    target:        eravos.sequencer
    payload:
      position:    { x: 340, y: 30 }
    depends_on:    [qb.1]

  - step_id:       qb.3
    operation:     wire
    payload:
      from:        { instance: eravos.sequencer, hook: seq.hook.fire_out }
      to:          { instance: eravos.pads,      hook: pads.hook.seq_fire_in }
    depends_on:    [qb.1, qb.2]

  - step_id:       qb.4
    operation:     wire
    payload:
      from:        { instance: eravos.pads,      hook: pads.hook.bank_change_out }
      to:          { instance: eravos.sequencer,  hook: seq.hook.bank_in }
    depends_on:    [qb.1, qb.2]

result:
  provides:
    - capability.pad_trigger
    - capability.sequencer
    - capability.clock_source
  workspace:       null

---

# ============================================================
# ERAVOS BEHAVIOR SPEC — AUTOSAVE
# spec_id:      eravos.behavior.autosave
# ============================================================

header:
  spec_id:         eravos.behavior.autosave
  spec_version:    1.0.0
  spec_type:       behavior
  kernel_target:   1.0.0
  author:          James Brooks
  created_at:      2026-06-22
  schema:          behavior.schema.v1
  status:          canonical

identity:
  id:              eravos.behavior.autosave
  label:           Autosave
  icon:            💾
  description: >
    Saves workspace snapshot to the causal ledger every
    N seconds. No UI. Runs silently in background.
    Triggered by timer or organism mount/unmount events.
  comp_type:       behavior
  comp_intent: >
    Automatically persist workspace state at configurable
    intervals without user intervention.

permissions:
  - bus_subscribe
  - ledger_read
  - filesystem_write

provides:
  - capability.autosave

requires: []

triggers:

  - event_type:    kernel:timer
    condition:     elapsed_seconds >= config.interval

  - event_type:    kernel:organism-mounted
    condition:     true

  - event_type:    kernel:organism-unmounted
    condition:     true

effects:

  - effect_id:     autosave.snapshot
    operation:     serialize_workspace
    target:        kernel.workspace
    payload:
      format:      json
      destination: config.save_path

config:
  - key:           interval
    type:          number
    default:       30
    min:           5
    max:           300
    unit:          s
    label:         Save Interval

  - key:           save_path
    type:          string
    default:       .eravos/autosave
    label:         Save Location

---

# ============================================================
# ERAVOS BEHAVIOR SPEC — CLIP SNAP
# spec_id:      eravos.behavior.clip-snap
# ============================================================

header:
  spec_id:         eravos.behavior.clip-snap
  spec_version:    1.0.0
  spec_type:       behavior
  kernel_target:   1.0.0
  author:          James Brooks
  created_at:      2026-06-22
  schema:          behavior.schema.v1
  status:          canonical

identity:
  id:              eravos.behavior.clip-snap
  label:           Clip Snap
  icon:            🔲
  description: >
    Quantizes clip positions to the nearest grid division
    on drag release. No UI. Intercepts ui:clip_move events
    and corrects position before organism receives them.
  comp_type:       behavior
  comp_intent: >
    Snap timeline clips to the nearest musical grid division
    during drag operations.

permissions:
  - bus_subscribe
  - bus_publish

provides:
  - capability.clip_snap

requires:
  - capability.timeline
  - capability.clock_source

triggers:

  - event_type:    ui:clip_move
    condition:     config.enabled === true

effects:

  - effect_id:     snap.quantize
    operation:     transform_event
    target:        ui:clip_move
    payload:
      transform:   quantize_to_grid
      resolution:  config.resolution

config:
  - key:           enabled
    type:          boolean
    default:       true
    label:         Snap Enabled

  - key:           resolution
    type:          enum
    default:       beat
    options:       [bar, beat, "1/2", "1/4", "1/8", "1/16", none]
    label:         Snap Resolution

---

# specs/eravos.organism.pads.spec

# ============================================================
# ERAVOS ORGANISM SPEC — DRUM MACHINE
# spec_id:      eravos.organism.pads
# version:      1.0.0
# author:       James Brooks
# status:       canonical
# conforms_to:  ERAVOS.kernel.spec v1.0.0
# ============================================================

header:
  spec_id:         eravos.organism.pads
  spec_version:    1.0.0
  spec_type:       organism
  kernel_target:   1.0.0
  author:          James Brooks
  created_at:      2026-06-22
  updated_at:      2026-06-22
  schema:          organism.schema.v1
  status:          canonical

identity:
  id:              eravos.pads
  version:         1.0.0
  label:           Drum Machine
  icon:            🥁
  description: >
    16-pad velocity-sensitive drum machine with 3 banks,
    19 synthesis voices, per-pad sound and color assignment,
    keyboard mapping, and MIDI input routing.
  author:          James Brooks
  comp_type:       engine
  comp_intent: >
    Trigger and layer percussive and tonal synthesis voices
    from velocity-sensitive pad banks via pad press, keyboard,
    or MIDI input.
  comp_lineage:    []
  node_id:         engine.audio.drum-machine
  tags:            [audio, percussion, synthesis, pads, midi]
  domains:         [music, performance, sound-design]
  traits:          [stateful, realtime, interactive]

permissions:
  - audio_out
  - midi_in
  - bus_publish
  - bus_subscribe
  - filesystem_read

provides:
  - capability.pad_trigger
  - capability.audio_out
  - capability.bank_select

requires:
  - capability.audio_context

dependencies: []

constraints:
  - constraint_id:  pads.C-1
    predicate:      audio_context must be initialized before first pad trigger
    failure_mode:   MOUNT_002
    blocking:       true

  - constraint_id:  pads.C-2
    predicate:      each bank must have exactly 16 pads
    failure_mode:   MOUNT_005
    blocking:       true

  - constraint_id:  pads.C-3
    predicate:      no two hooks share the same event_type in the same direction
    failure_mode:   MOUNT_006
    blocking:       true

hooks:

  - hook_id:         pads.hook.pad_trigger_out
    hook_type:       emitter
    direction:       out
    intent: >
      Emits a pad trigger event whenever a pad is activated
      by press, keyboard, or MIDI input.
    event_type:      pad:trigger
    wire_type:       event_bus
    schema:
      type:          object
      required:      [index, sound, velocity, bank, timestamp]
      properties:
        index:       { type: integer, minimum: 0, maximum: 15 }
        sound:       { type: string }
        velocity:    { type: number, minimum: 0, maximum: 1 }
        bank:        { type: integer, minimum: 0, maximum: 2 }
        timestamp:   { type: number }
    contract_version: 1.0.0
    auth_required:   false
    failure_mode:    RUNTIME_002

  - hook_id:         pads.hook.seq_fire_in
    hook_type:       receiver
    direction:       in
    intent: >
      Receives a sequencer fire event and lights the corresponding
      pad without triggering audio (audio is handled by sequencer).
    event_type:      seq:fire
    wire_type:       event_bus
    schema:
      type:          object
      required:      [track, step]
      properties:
        track:       { type: integer }
        step:        { type: integer }
        sound:       { type: string }
        timestamp:   { type: number }
    contract_version: 1.0.0
    auth_required:   false
    failure_mode:    RUNTIME_003

  - hook_id:         pads.hook.midi_in
    hook_type:       receiver
    direction:       in
    intent: >
      Receives MIDI note-on events and maps them to pad indices
      for triggering. Note 36 = pad 0, note 51 = pad 15.
    event_type:      midi:note
    wire_type:       event_bus
    schema:
      type:          object
      required:      [note, velocity, channel]
      properties:
        note:        { type: integer, minimum: 0, maximum: 127 }
        velocity:    { type: number, minimum: 0, maximum: 1 }
        channel:     { type: integer, minimum: 1, maximum: 16 }
    contract_version: 1.0.0
    auth_required:   false
    failure_mode:    RUNTIME_003

  - hook_id:         pads.hook.bank_change_out
    hook_type:       emitter
    direction:       out
    intent: >
      Emits the full pad configuration of the selected bank
      whenever the active bank changes.
    event_type:      pad:bank-change
    wire_type:       event_bus
    schema:
      type:          object
      required:      [bank, pads]
      properties:
        bank:        { type: integer }
        pads:
          type:      array
          items:
            type:    object
            required: [sound, color, note]
            properties:
              sound: { type: string }
              color: { type: string }
              note:  { type: integer }
    contract_version: 1.0.0
    auth_required:   false
    failure_mode:    RUNTIME_002

  - hook_id:         pads.hook.audio_out
    hook_type:       emitter
    direction:       out
    intent: >
      Routes synthesized audio output to the master bus
      or a connected channel strip.
    event_type:      audio:signal
    wire_type:       event_bus
    schema:
      type:          object
      required:      [source_id, gain]
      properties:
        source_id:   { type: string }
        gain:        { type: number }
    contract_version: 1.0.0
    auth_required:   false
    failure_mode:    RUNTIME_004

relations:

  - to:              eravos.sequencer
    wire:
      from:          pads.hook.seq_fire_in
      to:            sequencer.hook.fire_out
    wire_type:       event_bus
    auto:            true
    priority:        high
    label:           Sequencer fires pads

  - to:              eravos.channel
    wire:
      from:          pads.hook.audio_out
      to:            channel.hook.audio_in
    wire_type:       event_bus
    auto:            false
    priority:        normal
    label:           Route audio to channel strip

  - to:              eravos.timeline
    wire:
      from:          pads.hook.pad_trigger_out
      to:            timeline.hook.record_in
    wire_type:       event_bus
    auto:            false
    priority:        low
    label:           Record pad triggers to timeline

mutations: []

projections:

  - space_id:        canvas
    component:       ui/pads.html
    default:         true
    min_width:       240
    min_height:      360
    resizable:       true
    collapsible:     true
    accent:          "#00ff88"

  - space_id:        compact
    component:       ui/pads-mini.html
    default:         false
    min_width:       120
    min_height:      120
    resizable:       false
    collapsible:     false
    accent:          "#00ff88"

  - space_id:        graph
    component:       null
    default:         false
    node_type:       audio_source

config:

  - key:             bank
    type:            enum
    default:         A
    options:         [A, B, C]
    label:           Active Bank
    group:           playback

  - key:             volume
    type:            number
    default:         0.88
    min:             0
    max:             1
    step:            0.01
    label:           Master Volume
    group:           playback

  - key:             pitch
    type:            number
    default:         0
    min:             -12
    max:             12
    step:            1
    unit:            st
    label:           Global Pitch
    group:           playback

  - key:             decay
    type:            number
    default:         0.3
    min:             0.01
    max:             2
    step:            0.01
    unit:            s
    label:           Global Decay
    group:           playback

  - key:             voices_pack
    type:            string
    default:         voices/drum-machine-voices.js
    label:           Voices File
    group:           engine

modes:

  - mode_id:         performance
    label:           Performance
    description:     Low-latency, no scope rendering, audio priority
    mutations:
      disable:       [ui.scope, ui.waveform]
      set:
        audio.buffer_size:  128
        ui.refresh_rate:    10

  - mode_id:         edit
    label:           Edit
    description:     Full UI, non-realtime safe
    mutations:
      enable:        [ui.scope, ui.waveform]
      set:
        audio.buffer_size:  512
        ui.refresh_rate:    60

imports:

  - mime:            audio/wav
    role:            pad_sample
    auto_mount:      false

  - mime:            audio/mpeg
    role:            pad_sample
    auto_mount:      false

exports:

  - format:          json
    from:            banks
    label:           Save bank configuration

  - format:          wav
    from:            audio_out
    label:           Bounce to WAV

ui_hooks:

  - hook_id:         ui.pad_press
    direction:       ui_to_organism
    event_type:      ui:pad_press
    schema:
      type:          object
      required:      [index, velocity]
      properties:
        index:       { type: integer }
        velocity:    { type: number }
    description:     User pressed a pad in the UI

  - hook_id:         ui.bank_select
    direction:       ui_to_organism
    event_type:      ui:bank_select
    schema:
      type:          object
      required:      [bank]
      properties:
        bank:        { type: integer }
    description:     User selected a bank

  - hook_id:         ui.pad_assign
    direction:       ui_to_organism
    event_type:      ui:pad_assign
    schema:
      type:          object
      required:      [index, sound]
      properties:
        index:       { type: integer }
        sound:       { type: string }
        color:       { type: string }
    description:     User reassigned a pad sound or color

  - hook_id:         ui.config_change
    direction:       ui_to_organism
    event_type:      ui:config_change
    schema:
      type:          object
      required:      [key, value]
      properties:
        key:         { type: string }
        value:       {}
    description:     User changed a config parameter

  - hook_id:         ui.pad_lit
    direction:       organism_to_ui
    event_type:      org:pad_lit
    schema:
      type:          object
      required:      [index, color]
      properties:
        index:       { type: integer }
        color:       { type: string }
        duration_ms: { type: integer }
    description:     Organism tells UI to light a pad

  - hook_id:         ui.state_sync
    direction:       organism_to_ui
    event_type:      org:state_sync
    schema:
      type:          object
      required:      [bank, pads, config]
      properties:
        bank:        { type: integer }
        pads:        { type: array }
        config:      { type: object }
    description:     Full state sync to UI on mount or bank change

files:
  ui:              ui/pads.html
  voices:          voices/drum-machine-voices.js
  schema:          schema/pads.schema.json
  data:            data/banks.json
  styles:          ui/pads.css

zip_structure:
  manifest.json:              this spec as JSON
  ui/pads.html:               canvas projection
  ui/pads-mini.html:          compact projection
  ui/pads.css:                scoped styles
  voices/drum-machine-voices.js: synthesis engine
  data/banks.json:            default bank configurations
  schema/pads.schema.json:    JSON Schema for validation
  tests/pads.test.js:         hook and fault mode tests

# ============================================================
# FAULT MODES THIS ORGANISM CAN RAISE
# ============================================================

raises_faults:
  - MOUNT_002   # capability.audio_context not found
  - MOUNT_005   # invalid bank data — not 16 pads
  - RUNTIME_002 # payload schema invalid on emit
  - RUNTIME_003 # handler error on seq:fire or midi:note
  - RUNTIME_004 # audio output timeout
  - ASSET_001   # pad sample import failed

# ============================================================
# NEXUS BUILD INSTRUCTIONS
# ============================================================

nexus:
  build_order:
    1: voices/drum-machine-voices.js   # synthesis — no deps
    2: data/banks.json                 # static data — no deps
    3: schema/pads.schema.json         # schema — no deps
    4: organism logic                  # hooks, bus, audio routing
    5: ui/pads.css                     # styles — after schema known
    6: ui/pads.html                    # UI last — after logic proven
    7: ui/pads-mini.html               # compact — after full UI done
    8: tests/pads.test.js              # tests — every hook exercised
    9: manifest.json                   # pack manifest — after all files exist

  test_coverage_required:
    - Every hook emits with valid schema
    - Every hook receives invalid schema → RUNTIME_002 raised
    - MIDI note 36 → pad 0 trigger
    - MIDI note 51 → pad 15 trigger
    - Bank change emits full pad config
    - Audio context missing → MOUNT_002 raised
    - Pad press with no voice → silent fail logged, not thrown
    - Performance mode disables scope
    - Edit mode enables scope

---

# specs/ERAVOS.kernel.spec

# ============================================================
# ERAVOS KERNEL SPEC
# spec_id:      eravos.kernel
# version:      1.0.0
# author:       James Brooks
# status:       canonical · source of truth · immutable core
# ============================================================
#
# This file is the contract that governs the entire ERAVOS
# universe. Everything the kernel builds is derived from this
# spec and specs that conform to it.
#
# NEXUS reads this spec and can build any conforming organism,
# workspace, behavior, genome, or ecosystem from it.
#
# If it is not in a spec, it does not exist.
# If it is in the spec, it must be implemented exactly.
# Nothing aspirational lives here.

# ============================================================
# LAYER 0 — KERNEL AXIOMS
# Immutable. Never overridden by any organism or spec.
# ============================================================

axioms:

  K-1:  Nothing exists until registered in the organism registry
  K-2:  Nothing silently fails — every fault is loud, named, traceable
  K-3:  No organism touches another organism directly
  K-4:  Every connection between organisms is a wire
  K-5:  Every wire is owned by the wire registry, not the organisms
  K-6:  Every mutation is recorded in the causal ledger before it applies
  K-7:  Hook contracts must match on both ends before a wire goes live
  K-8:  Permissions are enforced by the kernel — never self-reported as trusted
  K-9:  Everything that exists can be removed — no organism is permanent
  K-10: The spec is the source of truth — not the runtime state
  K-11: The canvas is one space — the universe owns the organisms
  K-12: A wire owns the relationship — removing an organism removes its wires
  K-13: Build order is bottom-up — dependencies mount before dependents
  K-14: No stubs in production — unresolved dependencies block mount
  K-15: Session context before build — NEXUS reads full spec before any output

# ============================================================
# LAYER 1 — PRIMITIVE TYPES
# The smallest things the kernel understands.
# Everything else is composed from these.
# ============================================================

primitives:

  Organism:
    description: >
      A thing that exists in the universe. Has identity, hooks,
      permissions, and projections. Never touches other organisms
      directly. Communicates only through wires and the bus.
    required_fields:
      - uuid
      - spec_id
      - schema_version
      - hooks
      - permissions

  Space:
    description: >
      A topology that organisms can inhabit. Defines how organisms
      are arranged, navigated, and related within it. The canvas
      is one space. The timeline is another.
    topologies:
      euclidean:    2D pan/zoom — the canvas
      temporal:     1D seek/scroll — the timeline
      hierarchical: fold/jump — the editor/tree
      directed:     traverse — the node graph
      sequential:   scroll — the notebook
      matrix:       row/col — the dataframe
      terminal:     stream — the console

  Hook:
    description: >
      A named, typed, versioned connection point on an organism.
      The only surface another organism can connect to.
      Has a declared schema. Has a declared failure mode.
      Has a contract version that must match before wire goes live.
    required_fields:
      - hook_id
      - hook_type
      - direction
      - event_type
      - wire_type
      - schema
      - contract_version
      - failure_mode

  Wire:
    description: >
      A connection between exactly two hooks.
      Owned by the wire registry — never by either organism.
      Validates contract versions on both ends before going live.
      Removed automatically when either organism unmounts.
    required_fields:
      - wire_id
      - source_hook
      - target_hook
      - wire_type
      - validated_at

  Projection:
    description: >
      How an organism appears in a specific space.
      An organism can have multiple projections.
      Projections are views — they do not own data.
      The organism owns data. The projection renders it.
    required_fields:
      - space_id
      - component
      - default

  Constraint:
    description: >
      An invariant that must hold for the universe to be valid.
      Constraints are checked before and after every mutation.
      A failing constraint blocks the mutation and names the fault.
    required_fields:
      - constraint_id
      - predicate
      - failure_mode
      - blocking

  Mutation:
    description: >
      A declared, reversible change to an existing organism's
      surface or config. Written to the causal ledger before
      it applies. Rolled back if the mutating organism unmounts.
    required_fields:
      - mutation_id
      - target_organism
      - operation
      - reason
      - reversible

  Event:
    description: >
      Something that happened on the bus.
      Has a topic, payload schema, and timestamp.
      Routed by the bus to all subscribers of that topic.
      Never delivered directly organism-to-organism.
    required_fields:
      - topic
      - payload_schema
      - emitter_hook

  Asset:
    description: >
      An imported file or data object.
      Has identity, hash, mime type, and lineage.
      Can have multiple representations (waveform, hex, table).
      Lineage tracks every transformation applied to it.
    required_fields:
      - uuid
      - hash
      - source
      - mime
      - asset_type
      - representations

  Permission:
    description: >
      A declared capability grant.
      Requested in the manifest. Granted by the kernel.
      Enforced at runtime — not self-reported.
      Violations kill the organism, log the fault.

# ============================================================
# LAYER 2 — SPEC FILE FORMAT
# Every .spec file must conform to this structure.
# ============================================================

spec_file:

  # --- Required header on every spec file ---

  header:
    spec_id:          string    # unique — reverse domain notation
    spec_version:     semver    # organism version
    spec_type:        enum      # see spec_types below
    kernel_target:    semver    # minimum kernel version required
    author:           string
    created_at:       iso8601
    updated_at:       iso8601
    schema:           string    # which schema validates this spec
    status:           enum      # draft | review | canonical | deprecated

  spec_types:
    organism:         A single mountable component
    workspace:        A saved universe snapshot
    behavior:         An environment modifier (no UI)
    genome:           A species definition (preferred archetypes + behaviors)
    recipe:           A composition — how to assemble multiple organisms
    ecosystem:        A culture — genome + behaviors + constraints + theme
    theme:            Visual token overrides
    agent:            An AI or automated worker
    asset:            An imported file with lineage
    pack:             A zip containing multiple specs + assets

  # --- Shared blocks present on every spec_type ---

  shared:

    identity:
      id:             string    # organism identifier
      version:        semver
      label:          string    # human display name
      icon:           string    # emoji or path to svg
      description:    string
      author:         string
      comp_type:      enum      # engine | module | plugin | service |
                                # gateway | adapter | interface | behavior
      comp_intent:    string    # one sentence — what this exists to do
      comp_lineage:   string[]  # ancestry chain, root first
      node_id:        string    # type.domain.name — unique in registry
      tags:           string[]
      domains:        string[]  # music | coding | video | research | etc
      traits:         string[]  # temporal | stateful | realtime | visual | etc

    permissions:
      # Requested permissions — kernel grants or denies
      # Anything not listed here is denied at runtime
      values:
        - audio_out
        - audio_in
        - midi_in
        - midi_out
        - bus_publish
        - bus_subscribe
        - filesystem_read
        - filesystem_write
        - network
        - canvas_write
        - registry_read
        - registry_write
        - ledger_read
        - worker_spawn
        - peer_connect

    provides:
      # Capability identifiers this organism emits into the universe
      # Other organisms can list these in their requires[]
      type: string[]
      example:
        - capability.audio_out
        - capability.pad_trigger
        - capability.clock
        - capability.seek

    requires:
      # Capabilities that must exist before this organism mounts
      # If not satisfied — mount blocks with named fault
      type: string[]

    dependencies:
      # Organism IDs that must be mounted before this one
      # Order is resolved by the kernel — not the author
      type: string[]

    constraints:
      # Invariants that must hold for this organism to function
      # Checked before mount and after every mutation
      fields:
        constraint_id:    string
        predicate:        string    # declarative expression
        failure_mode:     string    # named fault class
        blocking:         boolean   # true = hard block | false = warning

# ============================================================
# LAYER 3 — ORGANISM SPEC
# Full contract for a single mountable organism.
# ============================================================

organism_spec:

  # Inherits all shared blocks from Layer 2

  hooks:
    # Every addressable surface this organism exposes
    # Wires connect to hooks — nothing else
    fields:
      hook_id:          string    # uuid — permanent
      hook_type:        enum      # endpoint | emitter | receiver | bidirectional
      direction:        enum      # in | out | inout
      intent:           string    # one sentence
      event_type:       string    # signal signature — unique per direction
      wire_type:        enum      # event_bus | callto | api
      schema:           object    # JSON Schema for payload — required
      contract_version: semver    # must match counterparty
      auth_required:    boolean
      failure_mode:     string    # named fault — declared before build
      rate_limit:       object    # optional — max events/sec
      middleware:       string[]  # optional transform chain

  relations:
    # Preferred connections to other organisms
    # The wire registry reads these — auto-wires when both present
    fields:
      to:               string    # organism id or capability
      wire:
        from:           string    # self.hook_id
        to:             string    # target.hook_id
      wire_type:        enum
      auto:             boolean   # true = wire on mount | false = offer only
      priority:         enum      # high | normal | low
      label:            string    # shown in wire registry UI

  mutations:
    # Declared changes this organism makes to others on mount
    # Rolled back on unmount — recorded in causal ledger
    fields:
      mutation_id:      string
      target:           string    # organism id
      operation:        enum      # add_hook | remove_hook | set_config |
                                  # add_projection | add_constraint
      payload:          object    # operation-specific
      reason:           string
      reversible:       boolean   # always true in canonical spec

  projections:
    # How this organism appears in different spaces
    fields:
      space_id:         string    # canvas | timeline | graph | notebook | etc
      component:        string    # path to UI component inside zip
      default:          boolean   # true = mount this projection on spawn
      min_width:        integer
      min_height:       integer
      resizable:        boolean
      collapsible:      boolean
      accent:           string    # css color or token

  config:
    # Default parameters — user adjustable
    # Every key must have a type, default, and range if numeric
    fields:
      key:              string
      type:             enum      # number | string | boolean | enum | object
      default:          any
      min:              number    # if type: number
      max:              number    # if type: number
      step:             number    # if type: number
      unit:             string    # Hz | ms | dB | st | etc
      options:          string[]  # if type: enum
      label:            string
      group:            string    # for UI grouping

  modes:
    # Alternate behavioral states
    # Broadcast by kernel — organism switches if mode is declared
    fields:
      mode_id:          string
      label:            string
      description:      string
      mutations:
        disable:        string[]  # feature ids to disable
        enable:         string[]
        set:            object    # config overrides

  imports:
    # File/asset types this organism ingests on drop
    fields:
      mime:             string    # mime type or glob
      role:             string    # how the asset is used
      auto_mount:       boolean   # true = spawn organism on file drop

  exports:
    # What this organism can serialize out
    fields:
      format:           string    # wav | mid | json | zip | png | etc
      from:             string    # hook or state key
      label:            string    # shown in export UI

  files:
    # All files in the zip this organism needs
    # Paths relative to zip root
    fields:
      ui:               string    # canvas projection component
      voices:           string    # audio engine
      schema:           string    # JSON Schema file
      data:             string    # default data (banks, patterns, etc)
      styles:           string    # scoped CSS
      worker:           string    # AudioWorklet or Web Worker

  ui_hooks:
    # The interaction contract between UI and organism logic
    # UI publishes to these — organism subscribes
    # Organism publishes to these — UI subscribes
    # Nothing in the UI touches organism internals directly
    fields:
      hook_id:          string
      direction:        enum      # ui_to_organism | organism_to_ui
      event_type:       string
      schema:           object
      description:      string

# ============================================================
# LAYER 4 — WORKSPACE SPEC
# A saved universe snapshot. Drop to restore exactly.
# ============================================================

workspace_spec:

  # Inherits header from Layer 2

  genome:           string    # genome id this workspace expresses

  organisms:
    fields:
      organism_id:    string
      instance_id:    string    # uuid — this specific instance
      position:
        space:        string
        x:            number
        y:            number
        width:        number
        height:       number
      config:         object    # instance-level config overrides
      mode:           string    # active mode id

  wires:
    fields:
      wire_id:        string
      from:
        instance_id:  string
        hook_id:      string
      to:
        instance_id:  string
        hook_id:      string
      wire_type:      string
      validated:      boolean

  assets:
    fields:
      asset_id:       string
      path:           string    # relative to workspace zip
      loaded_into:    string    # instance_id

  behaviors:        string[]  # behavior ids active in this workspace
  theme:            string    # theme id
  mode:             string    # workspace-wide mode
  history:          string    # path to causal ledger snapshot

# ============================================================
# LAYER 5 — BEHAVIOR SPEC
# Modifies environment — no UI — no window
# ============================================================

behavior_spec:

  # Inherits header + shared from Layer 2

  triggers:
    # What causes this behavior to activate
    fields:
      event_type:     string
      condition:      string    # predicate expression

  effects:
    # What the behavior does when triggered
    fields:
      effect_id:      string
      operation:      string
      target:         string
      payload:        object

  config:           object    # user-adjustable behavior params

# ============================================================
# LAYER 6 — GENOME SPEC
# A species definition — preferred archetypes + behaviors
# ============================================================

genome_spec:

  archetypes:       string[]  # preferred organism types
  behaviors:        string[]  # auto-mounted behaviors
  spaces:           string[]  # available spaces
  default_space:    string
  constraints:      string[]  # genome-level constraint ids
  recipes:          string[]  # available recipes

  layout_rules:
    # If X exists, prefer Y position
    fields:
      if_present:     string
      prefer_position: object
      prefer_space:   string

# ============================================================
# LAYER 7 — RECIPE SPEC
# A composition — how to assemble multiple organisms
# ============================================================

recipe_spec:

  steps:
    fields:
      step_id:        string
      operation:      enum      # mount | wire | configure | mutate | wait
      target:         string
      payload:        object
      depends_on:     string[]  # step_ids that must complete first

  result:
    # What this recipe produces
    provides:         string[]
    workspace:        string    # optional — saves result as workspace

# ============================================================
# LAYER 8 — ECOSYSTEM SPEC
# A culture — genome + behaviors + constraints + theme
# ============================================================

ecosystem_spec:

  genome:           string
  behaviors:        string[]
  recipes:          string[]
  theme:            string
  constraints:      string[]

  defaults:
    mode:           string
    bpm:            number
    space:          string

# ============================================================
# LAYER 9 — AGENT SPEC
# An AI or automated worker — first-class organism
# ============================================================

agent_spec:

  # Inherits organism spec

  worker_type:      enum      # transcriber | composer | librarian |
                              # refactorer | colorist | assistant | custom

  model:            string    # model identifier
  endpoint:         string    # local | remote url

  capabilities:
    reads:          string[]  # asset types it can read
    writes:         string[]  # asset types it can produce
    listens:        string[]  # event types it monitors
    emits:          string[]  # event types it produces

  ui:
    # Agent IS a canvas object — drag, resize, pause, connect
    shows_thinking: boolean
    shows_progress: boolean
    pauseable:      boolean

# ============================================================
# LAYER 10 — PACK SPEC
# A zip containing multiple specs + assets
# ============================================================

pack_spec:

  contents:
    organisms:      string[]  # organism spec paths inside zip
    behaviors:      string[]
    assets:         string[]
    workspace:      string    # optional starter workspace
    theme:          string

  install_order:    string[]  # explicit mount sequence if needed

  provides:
    capabilities:   string[]
    genomes:        string[]

  conflicts:        string[]  # organism ids this pack replaces

# ============================================================
# LAYER 11 — ASSET SPEC
# Every imported file becomes an AssetSeam
# ============================================================

asset_spec:

  uuid:             string
  hash:             string    # FNV-32 of first 4KB
  source:           string    # original filename
  mime:             string
  size_bytes:       integer
  imported_at:      iso8601

  asset_type:       enum      # audio | midi | image | video |
                              # code | data | model | document

  metadata:
    # Type-specific metadata
    audio:
      duration:     number
      sample_rate:  number
      channels:     number
      bpm:          number     # if detected
      key:          string     # if detected
    midi:
      tracks:       integer
      duration:     number
      tempo:        number
    image:
      width:        integer
      height:       integer
      color_space:  string

  lineage:
    # Every transformation — git for media
    fields:
      step_id:      string
      operation:    string    # granulate | reverb | pitchshift | etc
      source:       string    # asset uuid
      result:       string    # asset uuid
      params:       object
      timestamp:    iso8601

  representations:
    # Different ways to view this asset
    values:
      - waveform
      - spectrogram
      - hex
      - table
      - piano_roll   # midi
      - node         # in graph space
      - card         # compact

# ============================================================
# LAYER 12 — WIRE REGISTRY SPEC
# The kernel's wire registry contract
# ============================================================

wire_registry:

  operations:

    register_wire:
      inputs:
        source:
          instance_id:  string
          hook_id:      string
        target:
          instance_id:  string
          hook_id:      string
        wire_type:      string
      validation:
        - Source hook must exist and be registered
        - Target hook must exist and be registered
        - Contract versions must match
        - Direction must be compatible (out → in)
        - No duplicate wire between same hook pair
      on_fail:          WIRE_001 — contract_mismatch
                        WIRE_002 — hook_not_found
                        WIRE_003 — direction_incompatible
                        WIRE_004 — duplicate_wire

    remove_wire:
      inputs:
        wire_id:        string
      effects:
        - Wire removed from registry
        - Organisms notified via bus
        - Ledger entry written

    get_edges:
      inputs:
        node_id:        string
      returns:
        upstream:       string[]
        downstream:     string[]

# ============================================================
# LAYER 13 — CAUSAL LEDGER SPEC
# Every mutation, mount, unmount, wire, fault — recorded
# ============================================================

causal_ledger:

  entry_types:
    organism_mounted:
      fields: [instance_id, organism_id, timestamp, position]
    organism_unmounted:
      fields: [instance_id, organism_id, timestamp, reason]
    wire_registered:
      fields: [wire_id, source, target, timestamp]
    wire_removed:
      fields: [wire_id, reason, timestamp]
    mutation_applied:
      fields: [mutation_id, target, operation, payload, timestamp]
    mutation_rolled_back:
      fields: [mutation_id, reason, timestamp]
    fault_raised:
      fields: [fault_class, organism_id, hook_id, message, timestamp]
    permission_denied:
      fields: [organism_id, permission, timestamp]
    mode_changed:
      fields: [mode_id, scope, timestamp]
    asset_imported:
      fields: [asset_id, source, mime, timestamp]
    asset_transformed:
      fields: [asset_id, operation, result_id, timestamp]

  guarantees:
    - Entries are append-only
    - Entries are written before the operation applies
    - Every fault has a ledger entry
    - Ledger can reconstruct full universe state at any timestamp

# ============================================================
# LAYER 14 — FAULT TAXONOMY
# Every failure has a name before the system is built
# ============================================================

faults:

  MOUNT:
    MOUNT_001: dependency_not_found
    MOUNT_002: capability_not_satisfied
    MOUNT_003: permission_denied
    MOUNT_004: schema_version_mismatch
    MOUNT_005: manifest_invalid
    MOUNT_006: duplicate_organism_id
    MOUNT_007: constraint_violated_on_mount

  WIRE:
    WIRE_001: contract_mismatch
    WIRE_002: hook_not_found
    WIRE_003: direction_incompatible
    WIRE_004: duplicate_wire
    WIRE_005: wire_type_unsupported

  RUNTIME:
    RUNTIME_001: permission_violation
    RUNTIME_002: payload_schema_invalid
    RUNTIME_003: handler_error
    RUNTIME_004: timeout
    RUNTIME_005: rate_limit_exceeded

  MUTATION:
    MUTATION_001: target_not_found
    MUTATION_002: operation_not_supported
    MUTATION_003: constraint_violated
    MUTATION_004: rollback_failed

  ASSET:
    ASSET_001: import_failed
    ASSET_002: decode_failed
    ASSET_003: hash_mismatch
    ASSET_004: mime_unsupported

  CONSTRAINT:
    CONSTRAINT_001: predicate_failed
    CONSTRAINT_002: blocking_constraint_violated

# ============================================================
# LAYER 15 — NEXUS BUILD CONTRACT
# What NEXUS does with a spec file
# ============================================================

nexus_build:

  phases:
    0: Orient       — read full spec, validate schema, check kernel_target
    1: Hostile      — find every ambiguity, gap, assumption — surface before build
    2: Spec         — confirm spec is complete, all faults named, all hooks typed
    3: Build        — bottom-up only — kernel primitives first, UI last
    4: Test         — every hook has a test, every fault mode is exercised
    5: UI           — projections rendered only after logic is proven
    6: Verify       — hostile review of output against spec — no drift allowed

  rules:
    - Read full spec before writing any code (K-15)
    - Ask 5 FORGE questions before Phase 3: phase / last state / bugs / intent / SISO+Jaa
    - No stubs in production output (K-14)
    - Every file produced is listed in a manifest
    - Output is a zip conforming to pack_spec
    - Version bumps +0.1 per phase
    - If spec is ambiguous — stop and surface — never assume

  output:
    structure:
      manifest.json:    pack_spec conforming
      organisms/:       one directory per organism
      behaviors/:       behavior components
      assets/:          included assets
      schemas/:         JSON Schema files
      workspace/:       optional starter workspace
      tests/:           one test file per organism
      CHANGELOG.md:     phase-by-phase build log

# ============================================================
# LAYER 16 — INTERACTION CONTRACT
# How UI and organism logic are isolated
# ============================================================

interaction_contract:

  principle: >
    The UI never touches organism internals directly.
    The organism never touches UI internals directly.
    All communication is through declared ui_hooks.
    The wire validates the schema on every message.

  ui_to_organism:
    # UI publishes — organism subscribes
    examples:
      - event: ui:knob_change    payload: { hook_id, value }
      - event: ui:button_press   payload: { hook_id }
      - event: ui:pad_trigger    payload: { index, velocity }
      - event: ui:select_change  payload: { hook_id, value }

  organism_to_ui:
    # Organism publishes — UI subscribes
    examples:
      - event: org:state_update  payload: { key, value }
      - event: org:meter_update  payload: { level }
      - event: org:error         payload: { fault_class, message }
      - event: org:mode_change   payload: { mode_id }

  enforcement:
    - Any UI event not declared in ui_hooks is dropped with RUNTIME_002
    - Any organism event not declared in ui_hooks is dropped with RUNTIME_002
    - Schema validation on every message — invalid payload = RUNTIME_002
    - UI components are sandboxed — no access to organism scope

# ============================================================
# END KERNEL SPEC
# ============================================================
#
# Everything in ERAVOS is derived from this document.
# Kernel, organisms, workspaces, behaviors, genomes,
# agents, assets, wires, mutations, constraints — all of it.
#
# The kernel never learns what music is.
# It only knows what is written here.
#
# Same kernel.
# Different organism.
# ============================================================

---

# specs/eravos.nexus.build-contract.spec

# ============================================================
# ERAVOS NEXUS BUILD CONTRACT
# spec_id:      eravos.nexus.build-contract
# version:      1.0.0
# author:       James Brooks
# status:       canonical
# conforms_to:  ERAVOS.kernel.spec v1.0.0
# ============================================================
#
# This document defines exactly how NEXUS reads an ERAVOS spec
# and produces a conforming zip output.
#
# Loading this spec into NEXUS gives it everything it needs
# to build any organism, workspace, behavior, genome,
# ecosystem, recipe, or pack from a spec file.
#
# NEXUS axioms still apply:
#   §1.1 nothing exists until proven
#   §1.2 nothing silently fails
#   §1.3 no stubs in production
#   §3.1 bottom-up only
#   §8.1 session context before build
#   §8.2 hostile review before spec
#   §8.3 SISO+Jaa are prerequisites

# ============================================================
# FORGE SKILL PROTOCOL — applied to every spec
# ============================================================

forge_protocol:

  before_phase_3:
    ask:
      1: What phase are we in / what was the last completed phase?
      2: What was the last state of the build?
      3: What bugs or failures are outstanding?
      4: What is the intent of this build session?
      5: Are SISO and Jaa present and confirmed?

  phases:
    0: Orient       — read full spec top to bottom, validate, surface gaps
    1: Brainstorm   — enumerate all components, hooks, wires, files needed
    2: Hostile      — find every assumption, ambiguity, missing fault mode
    3: Spec         — confirm spec is complete before any code written
    4: Build        — bottom-up: schema → engine → hooks → UI last
    5: Test         — every hook tested, every fault mode exercised
    6: UI           — projections built only after logic is proven
    7: Verify       — hostile review of output against spec, zero drift

  version_bump:     +0.1 per completed phase

  output_format:    zip conforming to eravos.pack.format.spec

# ============================================================
# NEXUS BUILD STEPS — for any organism spec
# ============================================================

nexus_build_organism:

  phase_0_orient:
    read:
      - Full spec file top to bottom
      - Kernel spec (ERAVOS.kernel.spec)
      - All referenced dependency specs
    validate:
      - spec_type is known
      - kernel_target is satisfiable
      - All hooks have schemas
      - All hooks have failure_modes
      - All relations reference real hook_ids
      - All config keys have types and defaults
      - All files listed in files{} are accounted for
      - All faults in raises_faults[] are in fault taxonomy
    surface:
      - Any ambiguous intent
      - Any hook without a declared schema
      - Any failure mode that is unnamed
      - Any dependency that has no spec
      - Any UI hook without a corresponding logic hook

  phase_1_brainstorm:
    enumerate:
      - All files to be produced
      - All hooks to implement
      - All bus topics to publish/subscribe
      - All config keys to wire to UI
      - All fault paths to handle
      - All test cases needed

  phase_2_hostile:
    challenge:
      - Can this hook receive an invalid payload? What happens?
      - What if audio_context is not ready when first trigger fires?
      - What if a dependency unmounts mid-session?
      - What if a wire target is removed?
      - What if a config value is out of range?
      - What if the UI sends an undeclared event_type?
      - What if two instances of this organism mount?
      - Does the UI leak any state to organism internals?
      - Does the organism reach into the UI DOM directly?
    resolution:
      - Every challenge must be answered with a named fault or explicit handling
      - No "it won't happen" answers accepted

  phase_3_spec_confirm:
    confirm:
      - Every hook is typed, directed, and has a schema
      - Every config key has a default, type, and range
      - Every fault in the taxonomy is handled
      - UI hooks are isolated — no direct DOM access
      - Build order is declared and bottom-up
      - Test coverage requirements are listed

  phase_4_build:
    order:
      1:  schema/[organism].schema.json
          - JSON Schema file for payload validation
          - Derived directly from hook schemas in spec
          - No hardcoded values

      2:  data/[organism].data.json
          - Static default data (banks, patterns, presets)
          - No logic — pure data

      3:  [organism].engine.js
          - Core organism logic
          - Imports: bus, audio, clock (from kernel)
          - No DOM access
          - No direct organism-to-organism calls
          - Every hook registered with bus
          - Every publish uses declared schema
          - Every subscribe validates payload schema
          - Every fault raises named error to bus

      4:  [organism].hooks.js
          - Hook registration and wire validation
          - Contract version checking
          - Rate limiting if declared

      5:  [organism].ui-bridge.js
          - Translates ui_hook events to organism calls
          - Translates organism state to ui_hook events
          - Schema validation on every message in both directions
          - No business logic — pure translation

      6:  ui/[organism].css
          - Scoped to organism root class
          - Uses only CSS custom properties from token system
          - No hardcoded colors

      7:  ui/[organism].html
          - Canvas projection
          - Only publishes ui_hook event_types
          - Only subscribes to organism_to_ui event_types
          - No access to organism engine scope
          - No global state
          - Every interactive element has a declared ui_hook

      8:  tests/[organism].test.js
          - One describe block per hook
          - Every hook: valid payload passes
          - Every hook: invalid payload raises RUNTIME_002
          - Every fault mode: exercise and confirm named fault
          - Every config key: out-of-range value handled
          - Performance mode: scope disabled confirmed
          - Edit mode: scope enabled confirmed

      9:  manifest.json
          - Generated last — after all files confirmed present
          - Lists every file in contents{}
          - Version matches spec_version

  phase_5_test:
    requirements:
      - All tests pass before UI is built
      - Every hook has at least one passing test
      - Every fault mode in raises_faults[] is exercised
      - No test stubs — real implementations only
      - Test output is deterministic

  phase_6_ui:
    requirements:
      - Built only after phase_5 passes
      - UI communicates only via ui_hooks
      - No direct calls to engine functions
      - No DOM manipulation from engine
      - Every control maps to exactly one ui_hook
      - Every display maps to exactly one organism_to_ui hook
      - Resizable, no content clip-off
      - × button wired to kernel:remove-organism

  phase_7_verify:
    checklist:
      - Every hook in spec exists in implementation
      - Every ui_hook in spec exists in UI
      - No undeclared bus.publish calls
      - No undeclared bus.subscribe calls
      - No DOM access from engine
      - No engine access from UI
      - manifest.json contents{} matches actual zip files
      - Version is bumped correctly
      - No stubs anywhere in output

# ============================================================
# NEXUS BUILD STEPS — for a workspace spec
# ============================================================

nexus_build_workspace:

  phase_0_orient:
    - Read workspace spec
    - Verify all organism_ids exist in registry or are in pack
    - Verify all wire hook_ids exist on declared organisms
    - Verify all positions are within canvas bounds

  phase_4_build:
    order:
      1: Resolve organism dependency order
      2: Produce organism mount sequence
      3: Produce wire registration sequence
      4: Produce config application sequence
      5: Produce workspace.json (the loadable snapshot)

  output:
    workspace.json:   loadable snapshot conforming to workspace_spec

# ============================================================
# NEXUS PROMPT TEMPLATES
# How to invoke NEXUS to build any spec
# ============================================================

nexus_invocation:

  build_organism: |
    NEXUS FORGE — BUILD ORGANISM
    Spec: [paste organism spec here]
    Kernel Spec: ERAVOS.kernel.spec v1.0.0
    Session Context: [what phase, what's done, what's outstanding]
    Intent: Build conforming zip output for this organism
    SISO: present
    Jaa: present

    Apply FORGE phases 0-7.
    Output: zip conforming to eravos.pack.format.spec
    Version: [current version]
    No stubs. No assumptions. Surface all gaps before phase 3.

  build_workspace: |
    NEXUS FORGE — BUILD WORKSPACE
    Spec: [paste workspace spec here]
    Active Organisms: [list mounted organism ids]
    Intent: Produce loadable workspace snapshot
    Apply FORGE phases 0-7.

  build_pack: |
    NEXUS FORGE — BUILD PACK
    Organisms to include: [list spec ids]
    Pack type: [organism | ecosystem | voice_pack | etc]
    Author: James Brooks
    Intent: [what this pack does]
    Apply FORGE phases 0-7.
    Output: zip with manifest.json + all organism zips

  build_from_description: |
    NEXUS FORGE — BUILD FROM DESCRIPTION
    Description: [natural language description of what to build]

    Before phase 3, NEXUS must:
    1. Generate a complete organism spec from the description
    2. Run phase 2 hostile review on that spec
    3. Confirm with James before proceeding to build
    4. Apply FORGE phases 3-7

    Kernel Spec: ERAVOS.kernel.spec v1.0.0
    No stubs. No guessing. Surface every ambiguity.

# ============================================================
# CANONICAL WIRE TYPE REFERENCE
# ============================================================

wire_types:

  event_bus:
    description:  Fire-and-forget via the bus
    latency:      async
    delivery:     best-effort
    use_when:     pad triggers, state updates, UI events, most hooks

  callto:
    description:  Direct invocation, awaited — like a function call
    latency:      sync or promise
    delivery:     guaranteed or throws
    use_when:     capability queries, request-response patterns

  api:
    description:  HTTP or WebSocket boundary crossing
    latency:      network
    delivery:     http semantics
    use_when:     remote organisms, distributed plugins, agents on other machines

# ============================================================
# CANONICAL CAPABILITY REFERENCE
# ============================================================

capabilities:

  # Audio
  capability.audio_context:    AudioContext is initialized and running
  capability.audio_out:        Organism produces audio signal
  capability.audio_in:         Organism consumes audio signal
  capability.sample_source:    Organism can supply decoded audio buffers

  # MIDI
  capability.midi_in:          Organism receives MIDI messages
  capability.midi_out:         Organism sends MIDI messages

  # Rhythm / Time
  capability.clock_source:     Organism provides BPM clock
  capability.sequencer:        Organism provides step-sequenced trigger events
  capability.pad_trigger:      Organism provides pad trigger events
  capability.bank_select:      Organism provides bank selection

  # Arrangement
  capability.timeline:         Organism provides temporal clip arrangement
  capability.clip_store:       Organism stores and retrieves clips
  capability.seek:             Organism provides playhead seek capability
  capability.transport:        Organism provides play/stop/seek controls

  # Modulation
  capability.lfo:              Organism provides periodic modulation signal
  capability.envelope:         Organism provides ADSR envelope

  # Mixing
  capability.channel_strip:    Organism provides gain/pan/send routing
  capability.master_bus:       Organism provides master mix output

  # Intelligence
  capability.transcription:    Organism can transcribe speech to text
  capability.generation:       Organism can generate audio or MIDI

  # Meta
  capability.autosave:         Behavior provides automatic workspace save
  capability.clip_snap:        Behavior provides quantized clip positioning

---

# specs/eravos.organism.timeline.spec

# ============================================================
# ERAVOS ORGANISM SPEC — TIMELINE
# spec_id:      eravos.organism.timeline
# version:      1.0.0
# author:       James Brooks
# status:       canonical
# conforms_to:  ERAVOS.kernel.spec v1.0.0
# ============================================================

header:
  spec_id:         eravos.organism.timeline
  spec_version:    1.0.0
  spec_type:       organism
  kernel_target:   1.0.0
  author:          James Brooks
  created_at:      2026-06-22
  schema:          organism.schema.v1
  status:          canonical

identity:
  id:              eravos.timeline
  label:           Timeline
  icon:            📼
  description: >
    Multi-lane temporal arrangement surface. Clips placed by
    clicking lanes or dropping audio. Playhead driven by
    AudioContext clock. Zoom, scroll, seek, record, waveform
    rendering per clip.
  comp_type:       engine
  comp_intent: >
    Provide a temporal space for arranging audio clips across
    named lanes, with a sample-accurate playhead driven by
    the master audio clock.
  node_id:         engine.temporal.timeline
  tags:            [audio, timeline, arrangement, clips, temporal]
  domains:         [music, video, podcasting]
  traits:          [temporal, stateful, realtime]

permissions:
  - audio_out
  - audio_in
  - bus_publish
  - bus_subscribe
  - filesystem_read

provides:
  - capability.timeline
  - capability.clip_store
  - capability.seek

requires:
  - capability.audio_context

dependencies: []

hooks:

  - hook_id:         tl.hook.transport_in
    hook_type:       receiver
    direction:       in
    intent:          Receives play/stop from external transport or sequencer
    event_type:      seq:play
    wire_type:       event_bus
    schema:
      type:          object
      required:      [BPM]
      properties:
        BPM:         { type: number }
    contract_version: 1.0.0
    failure_mode:    RUNTIME_003

  - hook_id:         tl.hook.stop_in
    hook_type:       receiver
    direction:       in
    intent:          Receives stop signal
    event_type:      seq:stop
    wire_type:       event_bus
    schema:
      type:          object
      properties: {}
    contract_version: 1.0.0
    failure_mode:    RUNTIME_003

  - hook_id:         tl.hook.seek_out
    hook_type:       emitter
    direction:       out
    intent:          Broadcasts current playhead position
    event_type:      timeline:seek
    wire_type:       event_bus
    schema:
      type:          object
      required:      [position_sec, bar, beat]
      properties:
        position_sec: { type: number }
        bar:          { type: integer }
        beat:         { type: integer }
    contract_version: 1.0.0
    failure_mode:    RUNTIME_002

  - hook_id:         tl.hook.record_in
    hook_type:       receiver
    direction:       in
    intent:          Records incoming pad trigger events as clips when recording
    event_type:      pad:trigger
    wire_type:       event_bus
    schema:
      type:          object
      required:      [index, sound, velocity, timestamp]
      properties:
        index:       { type: integer }
        sound:       { type: string }
        velocity:    { type: number }
        timestamp:   { type: number }
    contract_version: 1.0.0
    failure_mode:    RUNTIME_003

  - hook_id:         tl.hook.clip_play_out
    hook_type:       emitter
    direction:       out
    intent:          Fires when the playhead crosses a clip boundary
    event_type:      timeline:clip_play
    wire_type:       event_bus
    schema:
      type:          object
      required:      [clip_id, lane_id, asset_id, position_sec]
      properties:
        clip_id:     { type: string }
        lane_id:     { type: string }
        asset_id:    { type: string }
        position_sec: { type: number }
    contract_version: 1.0.0
    failure_mode:    RUNTIME_002

relations:

  - to:              eravos.sequencer
    wire:
      from:          tl.hook.transport_in
      to:            seq.hook.play_out
    auto:            true
    priority:        high
    label:           Sync to sequencer transport

  - to:              eravos.channel
    wire:
      from:          tl.hook.clip_play_out
      to:            channel.hook.audio_in
    auto:            false
    label:           Route clip output to channel

projections:

  - space_id:        canvas
    component:       ui/timeline.html
    default:         true
    min_width:       480
    min_height:      200
    resizable:       true
    collapsible:     true
    accent:          "#00d4ff"

  - space_id:        timeline
    component:       ui/timeline-full.html
    default:         false

config:

  - key:             px_per_sec
    type:            number
    default:         80
    min:             20
    max:             400
    step:            1
    label:           Zoom
    group:           view

  - key:             snap
    type:            enum
    default:         beat
    options:         [none, beat, bar, 1/8, 1/16]
    label:           Snap
    group:           edit

  - key:             loop
    type:            boolean
    default:         false
    label:           Loop
    group:           playback

imports:

  - mime:            audio/wav
    role:            clip_source
    auto_mount:      false

  - mime:            audio/mpeg
    role:            clip_source
    auto_mount:      false

  - mime:            audio/ogg
    role:            clip_source
    auto_mount:      false

exports:

  - format:          wav
    from:            mix_out
    label:           Bounce timeline to WAV

  - format:          json
    from:            arrangement
    label:           Export arrangement

ui_hooks:

  - hook_id:         ui.ruler_click
    direction:       ui_to_organism
    event_type:      ui:ruler_click
    schema:
      type:          object
      required:      [position_sec]
      properties:
        position_sec: { type: number }
    description:     User clicked ruler to seek

  - hook_id:         ui.clip_place
    direction:       ui_to_organism
    event_type:      ui:clip_place
    schema:
      type:          object
      required:      [lane_id, position_sec, asset_id]
      properties:
        lane_id:     { type: string }
        position_sec: { type: number }
        asset_id:    { type: string }
    description:     User placed a clip on a lane

  - hook_id:         ui.clip_move
    direction:       ui_to_organism
    event_type:      ui:clip_move
    schema:
      type:          object
      required:      [clip_id, position_sec]
      properties:
        clip_id:     { type: string }
        position_sec: { type: number }
    description:     User dragged a clip

  - hook_id:         ui.clip_remove
    direction:       ui_to_organism
    event_type:      ui:clip_remove
    schema:
      type:          object
      required:      [clip_id]
      properties:
        clip_id:     { type: string }
    description:     User removed a clip

  - hook_id:         ui.lane_add
    direction:       ui_to_organism
    event_type:      ui:lane_add
    schema:
      type:          object
      required:      [name, icon, color]
      properties:
        name:        { type: string }
        icon:        { type: string }
        color:       { type: string }
    description:     User added a lane

  - hook_id:         ui.lane_remove
    direction:       ui_to_organism
    event_type:      ui:lane_remove
    schema:
      type:          object
      required:      [lane_id]
      properties:
        lane_id:     { type: string }
    description:     User removed a lane

  - hook_id:         ui.playhead_update
    direction:       organism_to_ui
    event_type:      org:playhead_update
    schema:
      type:          object
      required:      [position_sec, bar, beat]
      properties:
        position_sec: { type: number }
        bar:          { type: integer }
        beat:         { type: integer }
    description:     Organism updates playhead position

  - hook_id:         ui.clip_sync
    direction:       organism_to_ui
    event_type:      org:clip_sync
    schema:
      type:          object
      required:      [lanes, clips]
      properties:
        lanes:       { type: array }
        clips:       { type: array }
    description:     Full clip state sync

files:
  ui:              ui/timeline.html
  schema:          schema/timeline.schema.json

raises_faults:
  - MOUNT_002
  - RUNTIME_002
  - RUNTIME_003
  - ASSET_002

---

# specs/eravos.pack.format.spec

# ============================================================
# ERAVOS PACK SPEC — ZIP MANIFEST FORMAT
# spec_id:      eravos.pack.format
# version:      1.0.0
# author:       James Brooks
# status:       canonical
# conforms_to:  ERAVOS.kernel.spec v1.0.0
# ============================================================
#
# Every drop-in zip must contain a manifest.json at its root.
# The kernel reads manifest.json first.
# If manifest.json is missing or invalid — MOUNT_005.
# Nothing in the zip executes before the manifest is validated.
#
# A pack can be:
#   single organism    — one organism + its files
#   organism pack      — multiple related organisms
#   workspace          — saved universe snapshot
#   ecosystem          — genome + behaviors + organisms + theme
#   behavior           — environment modifier, no window
#   theme              — visual token overrides only
#   recipe             — composition instructions
#   asset pack         — audio, MIDI, samples with lineage
#   voice pack         — sample player presets + audio files

# ============================================================
# MANIFEST.JSON FORMAT
# This is the exact JSON structure the kernel parses.
# ============================================================

manifest_json_schema:

  required:
    - manifest_version
    - pack_id
    - pack_type
    - kernel_target
    - author
    - permissions
    - contents

  fields:

    manifest_version:
      type:       string
      value:      "1.0.0"
      description: Version of the manifest format itself

    pack_id:
      type:       string
      pattern:    "[a-z][a-z0-9-.]+"
      description: Unique identifier — reverse domain notation
      example:    "eravos.pack.drum-machine"

    pack_version:
      type:       string
      format:     semver

    pack_type:
      type:       string
      enum:
        - organism
        - organism_pack
        - workspace
        - ecosystem
        - behavior
        - theme
        - recipe
        - asset_pack
        - voice_pack

    label:
      type:       string
      description: Human display name

    icon:
      type:       string
      description: Emoji or path to SVG inside zip

    description:
      type:       string

    author:
      type:       string

    kernel_target:
      type:       string
      format:     semver
      description: Minimum kernel version required

    permissions:
      type:       array
      description: All permissions any organism in this pack needs
      items:
        type:     string
        enum:
          - audio_out
          - audio_in
          - midi_in
          - midi_out
          - bus_publish
          - bus_subscribe
          - filesystem_read
          - filesystem_write
          - network
          - canvas_write
          - registry_read
          - registry_write
          - ledger_read
          - worker_spawn
          - peer_connect

    provides:
      type:       array
      items:      string
      description: Capabilities this pack makes available after install

    requires:
      type:       array
      items:      string
      description: Capabilities that must exist before any organism mounts

    dependencies:
      type:       array
      items:      string
      description: Pack IDs or organism IDs that must be installed first

    conflicts:
      type:       array
      items:      string
      description: Pack IDs this pack replaces or is incompatible with

    contents:
      type:       object
      description: All files in the zip, by role
      properties:

        manifest:
          type:   string
          value:  "manifest.json"

        organisms:
          type:   array
          items:  string
          description: Paths to organism spec files inside zip

        behaviors:
          type:   array
          items:  string

        genomes:
          type:   array
          items:  string

        recipes:
          type:   array
          items:  string

        workspaces:
          type:   array
          items:  string

        themes:
          type:   array
          items:  string

        assets:
          type:   array
          items:
            type: object
            properties:
              path:     string
              mime:     string
              role:     string
              hash:     string

        ui:
          type:   object
          description: UI component files by organism id
          additionalProperties:
            type: string

        voices:
          type:   object
          description: Audio engine files by organism id

        schemas:
          type:   object
          description: JSON Schema files

        data:
          type:   object
          description: Static data files (banks, patterns, presets)

        tests:
          type:   object
          description: Test files by organism id

    install_order:
      type:       array
      items:      string
      description: >
        Explicit organism mount sequence if deps require it.
        If omitted, kernel resolves order from dependencies.

    auto_mount:
      type:       array
      items:      string
      description: Organism IDs to mount immediately on install

    starter_workspace:
      type:       string
      description: Path to workspace spec to load after install

# ============================================================
# KERNEL INSTALL SEQUENCE
# What the kernel does step by step when a zip drops
# ============================================================

kernel_install_sequence:

  1:
    name:          detect
    action:        Intake identifies file as zip by magic bytes PK..
    fault:         ASSET_001 if unreadable

  2:
    name:          extract_manifest
    action:        Read manifest.json from zip root
    fault:         MOUNT_005 if missing or unparseable

  3:
    name:          validate_manifest
    action:        Validate manifest against manifest_json_schema
    fault:         MOUNT_005 if schema invalid

  4:
    name:          check_kernel_target
    action:        Compare manifest.kernel_target to running kernel version
    fault:         MOUNT_004 if incompatible

  5:
    name:          check_conflicts
    action:        Check conflicts[] against registry — block if conflict mounted
    fault:         MOUNT_006 if conflict found

  6:
    name:          present_permissions
    action: >
      Show user the permissions[] list.
      User grants or denies.
      If denied — abort install, no files executed.
    fault:         MOUNT_003 if denied

  7:
    name:          check_requires
    action:        Verify all requires[] capabilities exist in registry
    fault:         MOUNT_002 if capability missing

  8:
    name:          check_dependencies
    action:        Verify all dependencies[] are mounted
    fault:         MOUNT_001 if dependency missing

  9:
    name:          resolve_order
    action: >
      If install_order[] provided — use it.
      Otherwise kernel resolves from dependency graph.
      Bottom-up always.

  10:
    name:          register_assets
    action: >
      Register all assets[] in the asset registry with hash,
      mime, and lineage. Write to causal ledger.
    fault:         ASSET_003 if hash mismatch

  11:
    name:          mount_organisms
    action: >
      For each organism in resolved order:
        - Register in organism registry
        - Validate constraints[]
        - Apply auto-wires from relations[]
        - Mount default projection at drop position
        - Write to causal ledger
    fault:         MOUNT_002 through MOUNT_007 per organism

  12:
    name:          apply_mutations
    action: >
      For each organism's mutations[]:
        - Validate target exists
        - Apply operation
        - Write to causal ledger
    fault:         MUTATION_001 through MUTATION_003

  13:
    name:          mount_behaviors
    action:        Mount all behaviors[] — no windows, bus hooks only
    fault:         MOUNT_002 if capability missing

  14:
    name:          load_workspace
    action: >
      If starter_workspace defined:
        - Apply workspace spec — positions, wires, config
    fault:         MOUNT_005 if workspace spec invalid

  15:
    name:          publish_installed
    action: >
      Publish kernel:pack-installed on bus with pack_id.
      Write complete install record to causal ledger.

# ============================================================
# EXAMPLE — RAVEN VOICE PACK
# A voice pack containing Raven's audio samples
# as a drop-in zip that auto-mounts sample players
# ============================================================

example_raven_voice_pack:

  manifest.json: |
    {
      "manifest_version": "1.0.0",
      "pack_id": "eravos.pack.raven-voices",
      "pack_version": "1.0.0",
      "pack_type": "voice_pack",
      "label": "Raven Voice Pack",
      "icon": "🌙",
      "description": "Voice samples — loaded into sample players on drop",
      "author": "James Brooks",
      "kernel_target": "1.0.0",

      "permissions": [
        "audio_out",
        "bus_publish",
        "bus_subscribe",
        "filesystem_read"
      ],

      "provides": [
        "capability.audio_out",
        "capability.sample_source"
      ],

      "requires": [
        "capability.audio_context"
      ],

      "dependencies": [],

      "contents": {
        "manifest": "manifest.json",
        "organisms": [],
        "assets": [
          { "path": "audio/Always_be_here_for_you.mp3",           "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/Days_when_were_quiet.mp3",             "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/I_really_need_you_to_believe.mp3",     "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/just_listen_to_me.mp3",                "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/Please_just_come_to_me.mp3",           "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/sometimes.mp3",                        "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/Todays_going_to_be_a_better_day.mp3",  "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/we_got_this.mp3",                      "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/were_fine.mp3",                        "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/what_ever_negative_stuff.mp3",         "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/yesterdays_not_even_a_thing.mp3",      "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/youre_fine.mp3",                       "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/youre_not_your_thoughts.mp3",          "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/I_just_want_you_to_know.mp3",          "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/Give_your_fucking_head_a_shake.mp3",   "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/Im_not_fucking_going_anywhere.mp3",    "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/I_love_the_shit_out_of_you.mp3",       "mime": "audio/mpeg", "role": "voice_sample" },
          { "path": "audio/Youre_fucking_stuck_with_me.mp3",      "mime": "audio/mpeg", "role": "voice_sample" }
        ]
      },

      "auto_mount": [],

      "install_behavior": {
        "on_asset_drop": "spawn_sample_player_per_file",
        "layout": "cascade",
        "cascade_offset": { "x": 24, "y": 20 }
      }
    }

  zip_structure: |
    raven-voices.zip
    ├── manifest.json
    └── audio/
        ├── Always_be_here_for_you.mp3
        ├── Days_when_were_quiet.mp3
        ├── I_really_need_you_to_believe.mp3
        ├── just_listen_to_me.mp3
        ├── Please_just_come_to_me.mp3
        ├── sometimes.mp3
        ├── Todays_going_to_be_a_better_day.mp3
        ├── we_got_this.mp3
        ├── were_fine.mp3
        ├── what_ever_negative_stuff.mp3
        ├── yesterdays_not_even_a_thing.mp3
        ├── youre_fine.mp3
        ├── youre_not_your_thoughts.mp3
        ├── I_just_want_you_to_know.mp3
        ├── Give_your_fucking_head_a_shake.mp3
        ├── Im_not_fucking_going_anywhere.mp3
        ├── I_love_the_shit_out_of_you.mp3
        └── Youre_fucking_stuck_with_me.mp3

# ============================================================
# EXAMPLE — DRUM MACHINE ZIP
# The pads organism as a self-contained drop-in zip
# ============================================================

example_drum_machine_zip:

  zip_structure: |
    eravos.pads.zip
    ├── manifest.json                     ← kernel reads this first
    ├── spec/
    │   └── pads.spec                     ← full organism spec
    ├── ui/
    │   ├── pads.html                     ← canvas projection
    │   └── pads-mini.html                ← compact projection
    ├── voices/
    │   └── drum-machine-voices.js        ← synthesis engine
    ├── data/
    │   └── banks.json                    ← default pad banks A/B/C
    ├── schema/
    │   └── pads.schema.json              ← JSON Schema for validation
    └── tests/
        └── pads.test.js                  ← every hook tested

  manifest.json: |
    {
      "manifest_version": "1.0.0",
      "pack_id": "eravos.pack.drum-machine",
      "pack_version": "1.0.0",
      "pack_type": "organism",
      "label": "Drum Machine",
      "icon": "🥁",
      "description": "16-pad drum machine with 19 synthesis voices and 3 banks",
      "author": "James Brooks",
      "kernel_target": "1.0.0",

      "permissions": [
        "audio_out",
        "midi_in",
        "bus_publish",
        "bus_subscribe",
        "filesystem_read"
      ],

      "provides": [
        "capability.pad_trigger",
        "capability.audio_out",
        "capability.bank_select"
      ],

      "requires": [
        "capability.audio_context"
      ],

      "dependencies": [],

      "contents": {
        "manifest": "manifest.json",
        "organisms": ["spec/pads.spec"],
        "ui": {
          "eravos.pads": "ui/pads.html",
          "eravos.pads.compact": "ui/pads-mini.html"
        },
        "voices": {
          "eravos.pads": "voices/drum-machine-voices.js"
        },
        "schemas": {
          "eravos.pads": "schema/pads.schema.json"
        },
        "data": {
          "eravos.pads.banks": "data/banks.json"
        },
        "tests": {
          "eravos.pads": "tests/pads.test.js"
        }
      },

      "auto_mount": ["eravos.pads"],

      "install_behavior": {
        "spawn_at_drop_position": true
      }
    }

---

# specs/eravos.organism.sequencer.spec

# ============================================================
# ERAVOS ORGANISM SPEC — SEQUENCER
# spec_id:      eravos.organism.sequencer
# version:      1.0.0
# author:       James Brooks
# status:       canonical
# conforms_to:  ERAVOS.kernel.spec v1.0.0
# ============================================================

header:
  spec_id:         eravos.organism.sequencer
  spec_version:    1.0.0
  spec_type:       organism
  kernel_target:   1.0.0
  author:          James Brooks
  created_at:      2026-06-22
  updated_at:      2026-06-22
  schema:          organism.schema.v1
  status:          canonical

identity:
  id:              eravos.sequencer
  version:         1.0.0
  label:           Sequencer
  icon:            ⬛
  description: >
    16/32-step pattern sequencer with up to 16 tracks,
    swing, record mode, random pattern generation,
    BPM control, and phase bar display.
  comp_type:       engine
  comp_intent: >
    Step-sequence pad trigger events across multiple tracks,
    broadcasting fire events on the bus in tempo with the
    master clock.
  node_id:         engine.audio.sequencer
  tags:            [audio, sequencer, pattern, rhythm, midi]
  domains:         [music, performance]
  traits:          [stateful, realtime, temporal]

permissions:
  - audio_out
  - bus_publish
  - bus_subscribe

provides:
  - capability.sequencer
  - capability.clock_source
  - capability.pattern_store

requires:
  - capability.audio_context
  - capability.pad_trigger

dependencies:
  - eravos.pads

constraints:
  - constraint_id:  seq.C-1
    predicate:      step_count must be 16 or 32
    failure_mode:   MOUNT_005
    blocking:       true
  - constraint_id:  seq.C-2
    predicate:      BPM must be between 40 and 240
    failure_mode:   RUNTIME_001
    blocking:       false

hooks:

  - hook_id:         seq.hook.fire_out
    hook_type:       emitter
    direction:       out
    intent:          Emits on every active step for every track
    event_type:      seq:fire
    wire_type:       event_bus
    schema:
      type:          object
      required:      [track, step, sound, timestamp]
      properties:
        track:       { type: integer }
        step:        { type: integer }
        sound:       { type: string }
        timestamp:   { type: number }
    contract_version: 1.0.0
    failure_mode:    RUNTIME_002

  - hook_id:         seq.hook.play_out
    hook_type:       emitter
    direction:       out
    intent:          Signals playback start with current BPM
    event_type:      seq:play
    wire_type:       event_bus
    schema:
      type:          object
      required:      [BPM]
      properties:
        BPM:         { type: number }
    contract_version: 1.0.0
    failure_mode:    RUNTIME_002

  - hook_id:         seq.hook.stop_out
    hook_type:       emitter
    direction:       out
    intent:          Signals playback stop
    event_type:      seq:stop
    wire_type:       event_bus
    schema:
      type:          object
      properties: {}
    contract_version: 1.0.0
    failure_mode:    RUNTIME_002

  - hook_id:         seq.hook.bank_in
    hook_type:       receiver
    direction:       in
    intent:          Receives pad bank change — updates track list to match
    event_type:      pad:bank-change
    wire_type:       event_bus
    schema:
      type:          object
      required:      [bank, pads]
      properties:
        bank:        { type: integer }
        pads:        { type: array }
    contract_version: 1.0.0
    failure_mode:    RUNTIME_003

  - hook_id:         seq.hook.record_in
    hook_type:       receiver
    direction:       in
    intent:          Records pad trigger to active step when in record mode
    event_type:      pad:trigger
    wire_type:       event_bus
    schema:
      type:          object
      required:      [index, velocity]
      properties:
        index:       { type: integer }
        velocity:    { type: number }
    contract_version: 1.0.0
    failure_mode:    RUNTIME_003

relations:

  - to:              eravos.pads
    wire:
      from:          seq.hook.fire_out
      to:            pads.hook.seq_fire_in
    auto:            true
    priority:        high
    label:           Fire events light pads

  - to:              eravos.timeline
    wire:
      from:          seq.hook.play_out
      to:            timeline.hook.transport_in
    auto:            false
    label:           Sync timeline to sequencer play

projections:

  - space_id:        canvas
    component:       ui/sequencer.html
    default:         true
    min_width:       400
    min_height:      280
    resizable:       true
    collapsible:     true
    accent:          "#00d4ff"

  - space_id:        timeline
    component:       ui/sequencer-lane.html
    default:         false

config:

  - key:             bpm
    type:            number
    default:         128
    min:             40
    max:             240
    step:            1
    unit:            bpm
    label:           Tempo
    group:           clock

  - key:             steps
    type:            enum
    default:         16
    options:         [16, 32]
    label:           Step Count
    group:           pattern

  - key:             swing
    type:            boolean
    default:         false
    label:           Swing
    group:           timing

modes:

  - mode_id:         performance
    label:           Performance
    mutations:
      set:
        ui.phase_bars: false

  - mode_id:         edit
    label:           Edit
    mutations:
      set:
        ui.phase_bars: true

imports:

  - mime:            audio/midi
    role:            pattern_source
    auto_mount:      true

  - mime:            application/json
    role:            pattern_import
    auto_mount:      false

exports:

  - format:          json
    from:            pattern
    label:           Export pattern

  - format:          mid
    from:            midi_out
    label:           Export MIDI

ui_hooks:

  - hook_id:         ui.play_press
    direction:       ui_to_organism
    event_type:      ui:play_press
    schema:
      type:          object
      properties: {}
    description:     User pressed play/pause

  - hook_id:         ui.step_toggle
    direction:       ui_to_organism
    event_type:      ui:step_toggle
    schema:
      type:          object
      required:      [track, step, value]
      properties:
        track:       { type: integer }
        step:        { type: integer }
        value:       { type: integer, enum: [0, 1] }
    description:     User toggled a step cell

  - hook_id:         ui.bpm_change
    direction:       ui_to_organism
    event_type:      ui:bpm_change
    schema:
      type:          object
      required:      [bpm]
      properties:
        bpm:         { type: number }
    description:     User dragged BPM

  - hook_id:         ui.step_cursor
    direction:       organism_to_ui
    event_type:      org:step_cursor
    schema:
      type:          object
      required:      [step, bar]
      properties:
        step:        { type: integer }
        bar:         { type: integer }
    description:     Organism tells UI which step is active

  - hook_id:         ui.grid_sync
    direction:       organism_to_ui
    event_type:      org:grid_sync
    schema:
      type:          object
      required:      [tracks, steps]
      properties:
        tracks:      { type: array }
        steps:       { type: integer }
    description:     Full grid state sync on mount or pattern change

files:
  ui:              ui/sequencer.html
  schema:          schema/sequencer.schema.json
  data:            data/default-pattern.json

raises_faults:
  - MOUNT_002
  - MOUNT_005
  - RUNTIME_002
  - RUNTIME_003

---

# organisms/sample-player/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.sample-player",
  "label": "Sample Player",
  "icon": "\ud83c\udfb5",
  "accent": "#aa44ff",
  "domain": [
    "music",
    "audio",
    "playback"
  ],
  "description": "Single-file sample player. Waveform IS the interface. Drag start/end handles. Pitch shift. Loop. Reverse.",
  "permissions": [
    "audio_out",
    "bus_publish",
    "bus_subscribe",
    "filesystem_read"
  ],
  "provides": [
    "capability.audio_out",
    "capability.sample_source"
  ],
  "requires": [
    "capability.audio_context"
  ],
  "hooks": [
    {
      "hook_id": "samp.hook.audio_out",
      "direction": "out",
      "event_type": "audio:signal",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "samp.hook.trigger_in",
      "direction": "in",
      "event_type": "pad:trigger",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "gain": {
      "type": "float",
      "min": 0,
      "max": 2,
      "default": 1.0,
      "unit": ""
    },
    "pitch": {
      "type": "float",
      "min": -24,
      "max": 24,
      "default": 0,
      "unit": "semitones"
    },
    "start": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0,
      "unit": "normalized"
    },
    "end": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 1,
      "unit": "normalized"
    },
    "loop": {
      "type": "bool",
      "default": false
    },
    "reverse": {
      "type": "bool",
      "default": false
    }
  },
  "ui": {
    "type": "waveform_full",
    "handles": [
      "start",
      "end"
    ],
    "scrub": true
  },
  "spawn_on": [
    "audio:sample"
  ]
}

---

# organisms/sample-player/sample-player.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: SAMPLE PLAYER  v3.1.0
   ═══════════════════════════════════════════════════════════ */
window.SamplePlayerOrganism = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}, intakeResult = null) {
  const gBus = KERNEL.bus;
  let _buf=null, _src=null, _playing=false;
  let _looping=config.loop??false, _reverse=config.reverse??false;
  let gain=config.gain??1, pitch=config.pitch??0, start=config.start??0, end=config.end??1;
  let _name = intakeResult?.name ?? '(no file)';

  function _load(result) {
    _name = result.name;
    const AC = audio.boot();
    AC.decodeAudioData(result.arrayBuffer.slice(0)).then(ab => {
      _buf = ab;
      const peaks = _buildPeaks(ab, 200);
      sBus.publish('org:waveform_ready', { peaks, duration_sec: ab.duration, name: _name });
      sBus.publish('org:state_sync', { name: _name, duration_sec: ab.duration });
    }).catch(e => KERNEL.fault('ASSET_002', instanceId, `decode failed: ${e.message}`));
  }

  function _play() {
    if (!_buf) return;
    _stop();
    const AC = audio.AC;
    _src = AC.createBufferSource();
    _src.buffer = _buf;
    _src.loop   = _looping;
    _src.playbackRate.value = Math.pow(2, pitch/12) * (_reverse ? -1 : 1);
    const g = AC.createGain(); g.gain.value = gain;
    _src.connect(g); audio.send(g);
    const s = start * _buf.duration, dur = (end - start) * _buf.duration;
    _src.start(0, s, _looping ? undefined : dur);
    _playing = true;
    sBus.publish('org:state_sync', { playing: true });
    const startedAt = AC.currentTime;
    let frame;
    (function track() {
      if (!_playing) return;
      const pos = (AC.currentTime - startedAt) / _buf.duration;
      sBus.publish('org:playhead_update', { position_normalized: Math.min(1, Math.max(0, pos)) });
      frame = requestAnimationFrame(track);
    })();
    _src.onended = () => { _playing=false; cancelAnimationFrame(frame); sBus.publish('org:state_sync',{playing:false}); };
  }

  function _stop() {
    if (_src) { try { _src.stop(); } catch(e) {} _src=null; }
    _playing = false;
    sBus.publish('org:state_sync', { playing: false });
  }

  function _buildPeaks(ab, count) {
    const data=ab.getChannelData(0), step=Math.ceil(data.length/count), peaks=[];
    for(let i=0;i<count;i++){let max=0;for(let j=0;j<step;j++)max=Math.max(max,Math.abs(data[i*step+j]||0));peaks.push(max);}
    return peaks;
  }

  if (intakeResult?.arrayBuffer) setTimeout(()=>_load(intakeResult), 10);

  const _unsubs = [
    gBus.subscribe('ui:play_press:'+instanceId,   ()=>_playing?_stop():_play()),
    gBus.subscribe('ui:stop_press:'+instanceId,   ()=>_stop()),
    gBus.subscribe('ui:config_change:'+instanceId,({key,value})=>{
      if(key==='gain')gain=value; if(key==='pitch')pitch=value;
      if(key==='start')start=value; if(key==='end')end=value;
      if(key==='loop')_looping=value; if(key==='reverse')_reverse=value;
    }),
    gBus.subscribe('intake:file', result=>{
      if(result.id==='audio:sample' && result._targetInstanceId===instanceId) _load(result);
    }),
  ];

  KERNEL.registry.register({
    instanceId, id:'eravos.sample-player', label:_name,
    provides:['capability.audio_out','capability.sample_source'],
    requires:['capability.audio_context'],
    permissions:['audio_out','bus_publish','bus_subscribe','filesystem_read'],
    hooks:[
      {hook_id:'samp.hook.audio_out',  direction:'out',event_type:'audio:signal',contract_version:'1.0.0'},
      {hook_id:'samp.hook.trigger_in', direction:'in', event_type:'pad:trigger', contract_version:'1.0.0'},
    ],
  });

  return {
    unmount(){_stop();_unsubs.forEach(u=>u());KERNEL.registry.unregister(instanceId);},
    play:_play, stop:_stop, load:_load,
  };
}
return { mount };
})();

---

# organisms/nexus-bridge/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.nexus-bridge",
  "label": "NEXUS_BRIDGE",
  "icon": "⬡",
  "accent": "#00d4ff",
  "domain": ["diagnostic", "monitoring", "nexus"],
  "description": "Live status card for NEXUS NEXUS_BRIDGE (port 9999). Polling is driven by the global transport (play/stop), not its own clock. Diagnose routes through the Orchestrator.",
  "permissions": ["network_fetch", "bus_publish", "bus_subscribe"],
  "provides": ["capability.nexus_diagnostic"],
  "requires": [],
  "hooks": [
    { "hook_id": "nn.hook.bus_out", "direction": "out", "event_type": "org:state_sync", "contract_version": "1.0.0" }
  ],
  "params": {
    "statusPath":    { "type": "string", "default": "/api/status" },
    "snapshotsPath": { "type": "string", "default": "/snapshots" },
    "diagnosePath":  { "type": "string", "default": "/diagnose" }
  },
  "ui": { "type": "nexus_diagnostic_card" }
}

---

# organisms/nexus-bridge/nexus-bridge.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: NEXUS_BRIDGE  v1.0.0
   id: eravos.nexus-bridge

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusBridgeEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'bridge',
    label: 'NEXUS_BRIDGE',
    icon: '⬡',
    accent: '#00d4ff',
    base: 'http://127.0.0.1:9999',
    statusPath: '/api/status',
    snapshotsPath: '/snapshots',
    orchestratorBase: 'http://127.0.0.1:9000',
    diagnosePath: '/diagnose',
    idLink: 'http://127.0.0.1:4800',
    isOrchestrator: false,
    ...config,
  });
}

return { mount };
})();

---

# organisms/master-fx/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.master-fx",
  "label": "Master FX",
  "icon": "🎛",
  "accent": "#00ff88",
  "domain": ["music", "mixing", "master", "fx"],
  "description": "Control surface for the kernel's shared master bus: reverb send (procedurally generated impulse response, size + decay + mix), delay send (time + feedback + mix), and the final master compressor (threshold/ratio/attack/release). Every organism's audio.send() call routes through this bus.",
  "permissions": ["audio_out", "bus_publish", "bus_subscribe"],
  "provides": ["capability.master_fx_control"],
  "requires": ["capability.audio_context"],
  "dependencies": {
    "runtime": ["kernel/kernel.js"],
    "browser_apis": ["Web Audio API (ConvolverNode, DelayNode, DynamicsCompressorNode)"],
    "external_libs": []
  },
  "hooks": [],
  "params": {
    "reverbMix":   { "type": "float", "min": 0,    "max": 1,    "default": 0.35,  "unit": "" },
    "reverbTime":  { "type": "float", "min": 0.2,  "max": 6,    "default": 2.4,   "unit": "s" },
    "reverbDecay": { "type": "float", "min": 0.5,  "max": 8,    "default": 3.2,   "unit": "" },
    "delayMix":    { "type": "float", "min": 0,    "max": 1,    "default": 0.28,  "unit": "" },
    "delayTime":   { "type": "float", "min": 0.02, "max": 1.5,  "default": 0.32,  "unit": "s" },
    "delayFB":     { "type": "float", "min": 0,    "max": 0.92, "default": 0.35,  "unit": "" },
    "compThresh":  { "type": "float", "min": -60,  "max": 0,    "default": -24,   "unit": "dB" },
    "compRatio":   { "type": "float", "min": 1,    "max": 20,   "default": 12,    "unit": ":1" }
  }
}

---

# organisms/master-fx/master-fx.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: MASTER FX  v1.0.0
   id: eravos.master-fx

   Control surface for KERNEL.audio's shared send buses.
   Every voice organism that calls audio.send(node, withReverb,
   withDelay, withComp) reaches this bus — turning these knobs
   changes the reverb/delay/compressor for the whole mix at once.
   ═══════════════════════════════════════════════════════════ */

window.MasterFXEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    reverbMix:   config.reverbMix   != null ? config.reverbMix   : 0.35,
    reverbTime:  config.reverbTime  != null ? config.reverbTime  : 2.4,
    reverbDecay: config.reverbDecay != null ? config.reverbDecay : 3.2,
    delayMix:    config.delayMix    != null ? config.delayMix    : 0.28,
    delayTime:   config.delayTime   != null ? config.delayTime   : 0.32,
    delayFB:     config.delayFB     != null ? config.delayFB     : 0.35,
    compThresh:  config.compThresh  != null ? config.compThresh  : -24,
    compRatio:   config.compRatio   != null ? config.compRatio   : 12,
  };

  function _apply(key, val) {
    _params[key] = val;
    audio.boot();
    switch (key) {
      case 'reverbMix':   audio.setReverb({ mix: val }); break;
      case 'reverbTime':  audio.setReverb({ time: val, decay: _params.reverbDecay }); break;
      case 'reverbDecay': audio.setReverb({ time: _params.reverbTime, decay: val }); break;
      case 'delayMix':    audio.setDelay({ mix: val }); break;
      case 'delayTime':   audio.setDelay({ time: val }); break;
      case 'delayFB':     audio.setDelay({ feedback: val }); break;
      case 'compThresh':  audio.setCompressor({ threshold: val }); break;
      case 'compRatio':   audio.setCompressor({ ratio: val }); break;
    }
  }

  function _applyAll() {
    audio.boot();
    audio.setReverb({ mix: _params.reverbMix, time: _params.reverbTime, decay: _params.reverbDecay });
    audio.setDelay({ mix: _params.delayMix, time: _params.delayTime, feedback: _params.delayFB });
    audio.setCompressor({ threshold: _params.compThresh, ratio: _params.compRatio });
  }

  function _syncUI() {
    sBus.publish('org:state_sync', { params: { ..._params } });
  }

  const _unsubs = [
    gBus.subscribe('ui:config_change:' + instanceId, ({ key, value }) => _apply(key, value)),
  ];

  _applyAll();
  _syncUI();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.master-fx',
    label:    'Master FX',
    provides: ['capability.master_fx_control'],
    requires: ['capability.audio_context'],
    permissions: ['audio_out', 'bus_publish', 'bus_subscribe'],
    hooks: [],
  });

  return {
    unmount() { _unsubs.forEach(u => u()); KERNEL.registry.unregister(instanceId); },
    get params() { return { ..._params }; },
  };
}

return { mount };
})();

---

# organisms/channel/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.channel",
  "label": "Channel Strip",
  "icon": "\ud83c\udf9a",
  "accent": "#6a88a8",
  "domain": [
    "music",
    "mixing",
    "routing"
  ],
  "description": "Audio channel strip. Gain, pan, mute, solo. VU metering. Receives audio:signal from any organism.",
  "permissions": [
    "audio_out",
    "audio_in",
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.channel_strip"
  ],
  "requires": [],
  "hooks": [
    {
      "hook_id": "ch.hook.audio_in",
      "direction": "in",
      "event_type": "audio:signal",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "ch.hook.bus_out",
      "direction": "out",
      "event_type": "bus:send",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "gain": {
      "type": "float",
      "min": 0,
      "max": 2,
      "default": 1.0,
      "unit": ""
    },
    "pan": {
      "type": "float",
      "min": -1,
      "max": 1,
      "default": 0,
      "unit": ""
    },
    "send_rev": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.2,
      "unit": ""
    },
    "send_del": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0,
      "unit": ""
    },
    "mute": {
      "type": "bool",
      "default": false
    },
    "solo": {
      "type": "bool",
      "default": false
    }
  },
  "ui": {
    "type": "channel_strip_vertical",
    "vu_meter": true
  }
}

---

# organisms/channel/channel.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: CHANNEL STRIP  v1.0.0
   id: eravos.channel

   Receives audio:signal events on the bus, applies
   gain, pan, mute, solo. Routes to master output.
   Publishes metering data for UI VU meter animation.
   ═══════════════════════════════════════════════════════════ */

window.ChannelEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    gain:    config.gain    || 1.0,
    pan:     config.pan     || 0,
    sendRev: config.sendRev || 0.2,
    sendDel: config.sendDel || 0.0,
    mute:    config.mute    || false,
    solo:    config.solo    || false,
    name:    config.name    || 'CHANNEL',
  };

  let _level    = 0;
  let _peakHold = 0;
  let _peakTimer= null;

  /* Build audio graph when AC is ready */
  let _gainNode = null;
  let _panNode  = null;

  function _ensureGraph() {
    if (_gainNode) return;
    const AC = audio.boot();
    _gainNode = AC.createGain(); _gainNode.gain.value = _params.mute ? 0 : _params.gain;
    _panNode  = AC.createStereoPanner ? AC.createStereoPanner() : AC.createPanner();
    if (_panNode.pan) _panNode.pan.value = _params.pan;
    _gainNode.connect(_panNode);
    audio.send(_panNode, false, false, true);
    if (_params.sendRev > 0) _panNode.connect(audio.reverbSend);
    if (_params.sendDel > 0) _panNode.connect(audio.delaySend);
  }

  /* Metering — simulated from level updates */
  const _meterInterval = setInterval(() => {
    _level = Math.max(0, _level - 0.04);
    if (_level > _peakHold) {
      _peakHold = _level;
      clearTimeout(_peakTimer);
      _peakTimer = setTimeout(() => { _peakHold = 0; }, 1800);
    }
    sBus.publish('org:meter', { level: _level, peak: _peakHold });
  }, 33);

  function _updateGain() {
    if (!_gainNode) return;
    const target = _params.mute ? 0 : _params.gain;
    _gainNode.gain.setTargetAtTime(target, audio.AC?.currentTime || 0, 0.02);
  }

  function _syncUI() {
    sBus.publish('org:state_sync', { params: { ..._params } });
  }

  const _unsubs = [
    gBus.subscribe('ui:config_change:' + instanceId, ({ key, value }) => {
      if (key in _params) _params[key] = value;
      if (key === 'gain' || key === 'mute') _updateGain();
      if (key === 'pan' && _panNode?.pan) _panNode.pan.setTargetAtTime(value, audio.AC?.currentTime || 0, 0.02);
    }),

    /* Receive audio signals from other organisms and meter them */
    gBus.subscribe('audio:signal', ({ source }) => {
      _ensureGraph();
      _level = Math.min(1, _level + 0.15 + Math.random() * 0.1);
    }),
  ];

  _syncUI();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.channel',
    label:    _params.name,
    provides: ['capability.channel_strip'],
    requires: [],
    permissions: ['audio_out', 'audio_in', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'ch.hook.audio_in',  direction: 'in',  event_type: 'audio:signal', contract_version: '1.0.0' },
      { hook_id: 'ch.hook.bus_out',   direction: 'out', event_type: 'bus:send',     contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() {
      clearInterval(_meterInterval);
      clearTimeout(_peakTimer);
      _unsubs.forEach(u => u());
      if (_gainNode) { try { _gainNode.disconnect(); _panNode.disconnect(); } catch(e){} }
      KERNEL.registry.unregister(instanceId);
    },
    get params() { return { ..._params }; },
  };
}

return { mount };
})();

---

# organisms/sequencer/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.sequencer",
  "label": "Sequencer",
  "icon": "\u2b1b",
  "accent": "#00d4ff",
  "domain": [
    "music",
    "rhythm",
    "pattern"
  ],
  "description": "16/32-step probabilistic sequencer. 16 tracks. Swing. Record mode. BPM clock source.",
  "permissions": [
    "audio_out",
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.sequencer",
    "capability.clock_source"
  ],
  "requires": [
    "capability.audio_context"
  ],
  "hooks": [
    {
      "hook_id": "seq.hook.fire_out",
      "direction": "out",
      "event_type": "seq:fire",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "seq.hook.play_out",
      "direction": "out",
      "event_type": "seq:play",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "seq.hook.stop_out",
      "direction": "out",
      "event_type": "seq:stop",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "seq.hook.bank_in",
      "direction": "in",
      "event_type": "pad:bank-change",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "bpm": {
      "type": "int",
      "min": 40,
      "max": 240,
      "default": 128,
      "unit": "BPM"
    },
    "steps": {
      "type": "int",
      "min": 16,
      "max": 32,
      "default": 16,
      "unit": "steps"
    },
    "swing": {
      "type": "bool",
      "default": false
    }
  },
  "ui": {
    "type": "step_grid",
    "tracks": 16,
    "steps": 32
  },
  "nexus_build_hints": {
    "engine_pattern": "clock_driven_grid",
    "bpm_sync": true
  }
}

---

# organisms/sequencer/sequencer.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: SEQUENCER  v4.0.0
   id: eravos.sequencer

   Timing: PrecisionClock (AudioWorklet lookahead scheduler).
   All synthesis scheduled against AudioContext.currentTime.
   No setTimeout for audio. setTimeout only for UI cursor.
   ═══════════════════════════════════════════════════════════ */
window.SequencerOrganism = (() => {
'use strict';

function mount(instanceId, sBus, audio, clock, config = {}) {
  const gBus = KERNEL.bus;

  let bpm        = config.bpm    ?? 128;
  let stepCount  = config.steps  ?? 16;
  let swing      = 0;
  let playing    = false;
  let recording  = false;

  const tracks = [
    {sound:'kick',   color:'#00ff88',steps:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,...Array(16).fill(0)]},
    {sound:'snare',  color:'#00ff88',steps:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,...Array(16).fill(0)]},
    {sound:'hat',    color:'#00d4ff',steps:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,...Array(16).fill(0)]},
    {sound:'clap',   color:'#00ff88',steps:Array(32).fill(0)},
    {sound:'808',    color:'#ff2266',steps:Array(32).fill(0)},
    {sound:'rim',    color:'#6a88a8',steps:Array(32).fill(0)},
    {sound:'reese',  color:'#aa44ff',steps:Array(32).fill(0)},
    {sound:'wobble', color:'#aa44ff',steps:Array(32).fill(0)},
    {sound:'acid',   color:'#ffaa00',steps:Array(32).fill(0)},
    {sound:'stab',   color:'#00d4ff',steps:Array(32).fill(0)},
    {sound:'openhat',color:'#00d4ff',steps:Array(32).fill(0)},
    {sound:'crash',  color:'#00d4ff',steps:Array(32).fill(0)},
    {sound:'laser',  color:'#00ff88',steps:Array(32).fill(0)},
    {sound:'glitch', color:'#6a88a8',steps:Array(32).fill(0)},
    {sound:'noise',  color:'#6a88a8',steps:Array(32).fill(0)},
    {sound:'riser',  color:'#aa44ff',steps:Array(32).fill(0)},
  ];

  /* ── PrecisionClock ──────────────────────────────────── */
  let _pclock = null;
  let _cursorTimer = null;

  async function _initClock() {
    const AC = audio.boot();
    _pclock = new PrecisionClock(AC);
    await _pclock.boot();

    /* onStep fires from lookahead scheduler at a precise future time t */
    _pclock.onStep = (stepIdx, t) => {
      tracks.forEach((track, ti) => {
        if (!track.steps[stepIdx]) return;

        /* Schedule voice at exact AudioContext time t — NOT currentTime */
        const voices = window.PadsOrganism?.VOICES || window.EDMLabEngine?.VOICES;
        if (voices?.[track.sound]) {
          voices[track.sound](t, 0.88, {}, audio);
        }

        /* Bus publish — UI only, timing not critical */
        gBus.publish('seq:fire', {
          track: ti, step: stepIdx, sound: track.sound,
          timestamp: t,
        });
      });

      /* Schedule UI cursor update to fire at the right wall-clock time */
      const msFromNow = Math.max(0, (t - audio.AC.currentTime) * 1000);
      const capturedStep = stepIdx;
      clearTimeout(_cursorTimer);
      _cursorTimer = setTimeout(() => {
        sBus.publish('org:step_cursor', {
          step: capturedStep,
          bar:  Math.floor(capturedStep / 4),
        });
      }, msFromNow);
    };
  }

  async function _play() {
    if (!audio.AC) return;
    if (!_pclock) await _initClock();
    playing = true;
    clock.BPM = bpm;
    _pclock.start(bpm, stepCount, 4, swing);
    gBus.publish('seq:play', { BPM: bpm });
    sBus.publish('org:state_sync', { playing: true, bpm });
  }

  function _stop() {
    playing = false;
    if (_pclock) _pclock.stop();
    clearTimeout(_cursorTimer);
    gBus.publish('seq:stop', {});
    sBus.publish('org:state_sync', { playing: false, step: 0 });
  }

  function _syncUI() {
    sBus.publish('org:grid_sync', {
      tracks: tracks.map(t => ({
        sound: t.sound, color: t.color,
        steps: t.steps.slice(0, stepCount),
      })),
      steps: stepCount, playing, bpm: clock.BPM, swing,
    });
  }

  const _unsubs = [
    gBus.subscribe('ui:play_press:' + instanceId, () => playing ? _stop() : _play()),
    gBus.subscribe('ui:step_toggle:' + instanceId, ({ track, step, value }) => {
      if (tracks[track]) tracks[track].steps[step] = value ? 1 : 0;
    }),
    gBus.subscribe('ui:bpm_change:' + instanceId, ({ bpm: v }) => {
      bpm = Math.max(40, Math.min(240, Math.round(v)));
      clock.BPM = bpm;
      if (_pclock) _pclock.setBPM(bpm);
    }),
    gBus.subscribe('ui:step_count_change:' + instanceId, ({ steps }) => {
      stepCount = steps === 32 ? 32 : 16;
      if (_pclock && playing) { _stop(); _play(); } /* restart with new count */
      _syncUI();
    }),
    gBus.subscribe('ui:swing_toggle:' + instanceId, ({ value }) => {
      swing = value ? 0.12 : 0; /* 12% swing — Tranki feel */
      if (_pclock) _pclock.setSwing(swing);
    }),
    gBus.subscribe('ui:randomize:' + instanceId, () => {
      tracks.forEach((t,ti) => {
        t.steps = t.steps.map(() => Math.random() < .22 ? 1 : 0);
        if (ti === 0) { t.steps[0]=1; if(stepCount>8) t.steps[8]=1; }
      });
      _syncUI();
    }),
    gBus.subscribe('ui:clear_pattern:' + instanceId, () => {
      tracks.forEach(t => t.steps.fill(0));
      _syncUI();
    }),
    gBus.subscribe('pad:bank-change', ({ pads }) => {
      pads.forEach((p,i) => {
        if (tracks[i]) { tracks[i].sound=p.sound; tracks[i].color=p.color; }
      });
      _syncUI();
    }),
    gBus.subscribe('pad:trigger', ({ index }) => {
      if (recording && playing && tracks[index] && _pclock) {
        const s = _pclock.stepIdx;
        tracks[index].steps[s] = 1;
        sBus.publish('org:step_set', { track: index, step: s, value: 1 });
      }
    }),
    gBus.subscribe('seq:play', ({ BPM }) => {
      if (!playing) { bpm = BPM || bpm; _play(); }
    }),
    gBus.subscribe('seq:stop', () => { if (playing) _stop(); }),
    gBus.subscribe('kernel:bpm-change', ({ BPM }) => {
      bpm = BPM;
      if (_pclock) _pclock.setBPM(bpm);
      if (playing) { _stop(); _play(); }
    }),
  ];

  const _keyHandler = ev => {
    if (ev.target.tagName==='SELECT'||ev.target.tagName==='INPUT') return;
    if (ev.code==='Space') { ev.preventDefault(); playing ? _stop() : _play(); }
  };
  document.addEventListener('keydown', _keyHandler);

  _syncUI();

  KERNEL.registry.register({
    instanceId, id: 'eravos.sequencer', label: 'Sequencer',
    provides: ['capability.sequencer', 'capability.clock_source'],
    requires: ['capability.audio_context'],
    permissions: ['audio_out', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id:'seq.hook.fire_out',  direction:'out', event_type:'seq:fire',        contract_version:'1.0.0' },
      { hook_id:'seq.hook.play_out',  direction:'out', event_type:'seq:play',        contract_version:'1.0.0' },
      { hook_id:'seq.hook.stop_out',  direction:'out', event_type:'seq:stop',        contract_version:'1.0.0' },
      { hook_id:'seq.hook.bank_in',   direction:'in',  event_type:'pad:bank-change', contract_version:'1.0.0' },
      { hook_id:'seq.hook.record_in', direction:'in',  event_type:'pad:trigger',     contract_version:'1.0.0' },
    ],
  });

  return {
    unmount() {
      _stop();
      _unsubs.forEach(u => u());
      document.removeEventListener('keydown', _keyHandler);
      KERNEL.registry.unregister(instanceId);
    },
    play: _play, stop: _stop, syncUI: _syncUI,
  };
}

return { mount };
})();

---

# organisms/serial-bridge/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.serial-bridge",
  "label": "Serial Bridge",
  "icon": "🤖",
  "accent": "#00ff88",
  "domain": ["robotics", "hardware", "automation", "serial"],
  "description": "Real hardware I/O over Web Serial. Connects to GRBL/Arduino/stepper-controller style devices over USB-serial, sends raw or G-code lines, streams incoming telemetry to the bus, and can be wired (via the wire system) so any organism's output — sequencer steps, XY pad, LFO — drives a physical device. Requires a Chromium-based browser (Web Serial is not implemented in Firefox or Safari) and a user gesture to grant port access.",
  "permissions": ["serial_access", "bus_publish", "bus_subscribe"],
  "provides": ["capability.serial_io", "capability.hardware_control"],
  "requires": [],
  "dependencies": {
    "runtime": ["kernel/kernel.js"],
    "browser_apis": ["Web Serial API (navigator.serial)"],
    "external_libs": [],
    "constraints": [
      "Chromium-based browsers only (Chrome, Edge, Opera) — Web Serial has no Firefox/Safari implementation.",
      "Requires a direct user click to call navigator.serial.requestPort() — cannot be triggered programmatically.",
      "Runs over a secure context; file:// origins are treated as secure by Chromium so the packaged shell works, but confirm on the target browser version."
    ]
  },
  "hooks": [
    { "hook_id": "serial.hook.data_in",  "direction": "in",  "event_type": "mod:xy",       "contract_version": "1.0.0" },
    { "hook_id": "serial.hook.trig_in",  "direction": "in",  "event_type": "pad:trigger",  "contract_version": "1.0.0" },
    { "hook_id": "serial.hook.rx_out",   "direction": "out", "event_type": "serial:rx",    "contract_version": "1.0.0" }
  ],
  "params": {
    "baudRate":   { "type": "enum", "options": [9600, 19200, 38400, 57600, 115200, 250000], "default": 115200 },
    "lineEnding": { "type": "enum", "options": ["\n", "\r\n"], "default": "\n" },
    "mapMode":    { "type": "enum", "options": ["off", "xy_to_gcode", "trigger_to_line"], "default": "off" }
  }
}

---

# organisms/serial-bridge/serial-bridge.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: SERIAL BRIDGE  v1.0.0
   id: eravos.serial-bridge

   Real hardware I/O via the Web Serial API. Connects to a
   GRBL/Arduino/stepper-controller style device over USB-serial.
   Other organisms can wire into this one (via the wire system)
   so their bus output drives physical hardware:
     mod:xy        → mapMode 'xy_to_gcode'    → streamed G-code moves
     pad:trigger   → mapMode 'trigger_to_line'→ one line per trigger
   Incoming bytes are parsed into lines and republished as
   'serial:rx' so any organism can react to device telemetry.

   Requires a Chromium-based browser and a direct user click to
   request the port — this cannot be done programmatically.
   ═══════════════════════════════════════════════════════════ */

window.SerialBridgeEngine = (() => {
'use strict';

function mount(instanceId, sBus, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    baudRate:   config.baudRate   || 115200,
    lineEnding: config.lineEnding || '\n',
    mapMode:    config.mapMode    || 'off',
  };

  let _port      = null;
  let _writer    = null;
  let _reader    = null;
  let _connected = false;
  let _rxBuf     = '';
  let _readLoopStop = false;

  function supported() {
    return typeof navigator !== 'undefined' && !!navigator.serial;
  }

  async function connect() {
    if (!supported()) {
      sBus.publish('org:error', { message: 'Web Serial is not available in this browser (needs Chrome/Edge/Opera).' });
      return false;
    }
    try {
      _port = await navigator.serial.requestPort();
      await _port.open({ baudRate: _params.baudRate });
      _writer = _port.writable.getWriter();
      _connected = true;
      _readLoopStop = false;
      sBus.publish('org:connected', { baudRate: _params.baudRate });
      _readLoop();
      return true;
    } catch (err) {
      sBus.publish('org:error', { message: 'Connection failed or cancelled: ' + err.message });
      return false;
    }
  }

  async function _readLoop() {
    const decoder = new TextDecoderStream();
    const readable = _port.readable.pipeThrough(decoder);
    _reader = readable.getReader();
    try {
      while (!_readLoopStop) {
        const { value, done } = await _reader.read();
        if (done) break;
        if (value) {
          _rxBuf += value;
          let idx;
          while ((idx = _rxBuf.indexOf('\n')) >= 0) {
            const line = _rxBuf.slice(0, idx).replace(/\r$/, '');
            _rxBuf = _rxBuf.slice(idx + 1);
            if (line.length) {
              gBus.publish('serial:rx', { instanceId, line });
              sBus.publish('org:rx', { line });
            }
          }
        }
      }
    } catch (err) {
      sBus.publish('org:error', { message: 'Read error: ' + err.message });
    }
  }

  async function send(line) {
    if (!_connected || !_writer) {
      sBus.publish('org:error', { message: 'Not connected — click CONNECT and choose a port first.' });
      return;
    }
    const encoder = new TextEncoder();
    await _writer.write(encoder.encode(line + _params.lineEnding));
    sBus.publish('org:tx', { line });
  }

  async function disconnect() {
    _readLoopStop = true;
    try { if (_reader) { await _reader.cancel(); _reader.releaseLock(); } } catch (e) {}
    try { if (_writer) { _writer.releaseLock(); } } catch (e) {}
    try { if (_port)   { await _port.close(); } } catch (e) {}
    _connected = false;
    sBus.publish('org:disconnected', {});
  }

  /* Map an XY pad value (0..1, 0..1) into a bounded G-code jog move.
     Kept intentionally simple/general — a real rig would customize
     bounds per its own travel limits via config. */
  function _xyToGcode(x, y) {
    const maxTravel = config.travelMM || 100;
    const gx = (x * maxTravel).toFixed(2);
    const gy = (y * maxTravel).toFixed(2);
    return `G1 X${gx} Y${gy} F${config.feedRate || 3000}`;
  }

  function _updateParam(key, val) { if (key in _params) _params[key] = val; }

  function _syncUI() {
    sBus.publish('org:state_sync', { connected: _connected, params: { ..._params }, supported: supported() });
  }

  const _unsubs = [
    gBus.subscribe('ui:serial_connect:'    + instanceId, connect),
    gBus.subscribe('ui:serial_disconnect:' + instanceId, disconnect),
    gBus.subscribe('ui:serial_send:'       + instanceId, ({ line }) => send(line)),
    gBus.subscribe('ui:config_change:'     + instanceId, ({ key, value }) => _updateParam(key, value)),
    gBus.subscribe('mod:xy', ({ x, y }) => { if (_params.mapMode === 'xy_to_gcode' && _connected) send(_xyToGcode(x, y)); }),
    gBus.subscribe('pad:trigger', ({ sound }) => {
      if (_params.mapMode === 'trigger_to_line' && _connected) send(config.triggerLine || `M/${sound}`);
    }),
  ];

  _syncUI();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.serial-bridge',
    label:    'Serial Bridge',
    provides: ['capability.serial_io', 'capability.hardware_control'],
    requires: [],
    permissions: ['serial_access', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'serial.hook.data_in', direction: 'in',  event_type: 'mod:xy',      contract_version: '1.0.0' },
      { hook_id: 'serial.hook.trig_in', direction: 'in',  event_type: 'pad:trigger', contract_version: '1.0.0' },
      { hook_id: 'serial.hook.rx_out',  direction: 'out', event_type: 'serial:rx',   contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() { disconnect(); _unsubs.forEach(u => u()); KERNEL.registry.unregister(instanceId); },
    connect, disconnect, send, supported,
    get connected() { return _connected; },
    get params()    { return { ..._params }; },
  };
}

return { mount };
})();

---

# organisms/xy-pad/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.xy-pad",
  "label": "XY Controller",
  "icon": "\u271b",
  "accent": "#00d4ff",
  "domain": [
    "music",
    "modulation",
    "control",
    "performance"
  ],
  "description": "Two-axis modulation surface. Publishes mod:xy globally. Trail fades. Snap-to-center mode.",
  "permissions": [
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.mod_signal"
  ],
  "requires": [],
  "hooks": [
    {
      "hook_id": "xy.hook.mod_out",
      "direction": "out",
      "event_type": "mod:xy",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "x_dest": {
      "type": "string",
      "default": "cutoff",
      "description": "Parameter name for X axis"
    },
    "y_dest": {
      "type": "string",
      "default": "depth",
      "description": "Parameter name for Y axis"
    },
    "snap_center": {
      "type": "bool",
      "default": false
    }
  },
  "ui": {
    "type": "xy_surface",
    "trail": true,
    "snap": true
  }
}

---

# organisms/xy-pad/xy-pad.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: XY CONTROLLER  v1.0.0
   id: eravos.xy-pad

   Two-dimensional modulation surface.
   Broadcasts mod:xy on bus with x, y, xDest, yDest.
   Other organisms subscribe to mod:xy and route the value
   to whichever parameter is declared as the destination.
   Leaves a fading trail in the UI.
   ═══════════════════════════════════════════════════════════ */

window.XYPadEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    x:     config.x     || 0.5,
    y:     config.y     || 0.5,
    xDest: config.xDest || 'cutoff',
    yDest: config.yDest || 'depth',
    snapCenter: config.snapCenter || false,
  };

  /* Publish trail for UI — last N positions */
  const _trail = [];
  const TRAIL_MAX = 24;

  function _move(x, y) {
    _params.x = Math.max(0, Math.min(1, x));
    _params.y = Math.max(0, Math.min(1, y));

    _trail.push({ x: _params.x, y: _params.y, t: Date.now() });
    if (_trail.length > TRAIL_MAX) _trail.shift();

    /* Broadcast modulation */
    gBus.publish('mod:xy', {
      instanceId,
      x:     _params.x,
      y:     _params.y,
      xDest: _params.xDest,
      yDest: _params.yDest,
    });

    sBus.publish('org:xy_update', {
      x:     _params.x,
      y:     _params.y,
      trail: _trail.slice(),
    });
  }

  function _release() {
    if (!_params.snapCenter) return;
    _move(0.5, 0.5);
  }

  function _syncUI() {
    sBus.publish('org:state_sync', {
      params: { ..._params },
      x: _params.x,
      y: _params.y,
    });
  }

  const _unsubs = [
    gBus.subscribe('ui:xy_move:' + instanceId, ({ x, y }) => _move(x, y)),
    gBus.subscribe('ui:xy_release:' + instanceId, _release),
    gBus.subscribe('ui:config_change:' + instanceId, ({ key, value }) => {
      if (key in _params) _params[key] = value;
    }),
  ];

  _syncUI();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.xy-pad',
    label:    'XY Controller',
    provides: ['capability.mod_signal'],
    requires: [],
    permissions: ['bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'xy.hook.mod_out', direction: 'out', event_type: 'mod:xy', contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() { _unsubs.forEach(u => u()); KERNEL.registry.unregister(instanceId); },
    move: _move, release: _release,
    get params() { return { ..._params }; },
    get trail() { return _trail.slice(); },
  };
}

return { mount };
})();

---

# organisms/nexus-cortex/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.nexus-cortex",
  "label": "NEXUS_CORTEX",
  "icon": "🧠",
  "accent": "#00ff88",
  "domain": ["diagnostic", "monitoring", "nexus"],
  "description": "Live status card for NEXUS NEXUS_CORTEX (port 3748). Polling is driven by the global transport (play/stop), not its own clock. Diagnose routes through the Orchestrator.",
  "permissions": ["network_fetch", "bus_publish", "bus_subscribe"],
  "provides": ["capability.nexus_diagnostic"],
  "requires": [],
  "hooks": [
    { "hook_id": "nn.hook.bus_out", "direction": "out", "event_type": "org:state_sync", "contract_version": "1.0.0" }
  ],
  "params": {
    "statusPath":    { "type": "string", "default": "/api/status" },
    "snapshotsPath": { "type": "string", "default": "/snapshots" },
    "diagnosePath":  { "type": "string", "default": "/diagnose" }
  },
  "ui": { "type": "nexus_diagnostic_card" }
}

---

# organisms/nexus-cortex/nexus-cortex.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: NEXUS_CORTEX  v1.0.0
   id: eravos.nexus-cortex

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusCortexEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'cortex',
    label: 'NEXUS_CORTEX',
    icon: '🧠',
    accent: '#00ff88',
    base: 'http://127.0.0.1:3748',
    statusPath: '/api/status',
    snapshotsPath: '/snapshots',
    orchestratorBase: 'http://127.0.0.1:9000',
    diagnosePath: '/diagnose',
    idLink: 'http://127.0.0.1:4800',
    isOrchestrator: false,
    ...config,
  });
}

return { mount };
})();

---

# organisms/bass-drop-builder/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.bass-drop-builder",
  "label": "Bass Drop Builder",
  "icon": "\ud83d\udd3b",
  "accent": "#ff2266",
  "domain": [
    "music",
    "production",
    "bass",
    "drop"
  ],
  "description": "Horizontal timeline with draggable stage boundaries TENSION-SLOPE-BUILD-DROP. Vocal clip lane. Full synthesis sequence on FIRE.",
  "permissions": [
    "audio_out",
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.audio_out"
  ],
  "requires": [
    "capability.audio_context"
  ],
  "hooks": [
    {
      "hook_id": "drop.hook.fire",
      "direction": "in",
      "event_type": "ui:fire",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "drop.hook.vocal_in",
      "direction": "in",
      "event_type": "audio:buffer",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "drop.hook.stage_out",
      "direction": "out",
      "event_type": "bass-drop:stage",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "bpm": {
      "type": "int",
      "min": 60,
      "max": 220,
      "default": 128,
      "unit": "BPM"
    },
    "tension_dur": {
      "type": "float",
      "min": 0.5,
      "max": 8,
      "default": 4.0,
      "unit": "seconds"
    },
    "slope_dur": {
      "type": "float",
      "min": 0.5,
      "max": 4,
      "default": 2.0,
      "unit": "seconds"
    },
    "build_dur": {
      "type": "float",
      "min": 0.5,
      "max": 8,
      "default": 4.0,
      "unit": "seconds"
    },
    "freq": {
      "type": "float",
      "min": 20,
      "max": 220,
      "default": 55,
      "unit": "Hz"
    },
    "drive": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.6,
      "unit": ""
    },
    "vocal_stage": {
      "type": "enum",
      "values": [
        "tension",
        "slope",
        "build",
        "drop",
        "after"
      ],
      "default": "drop"
    },
    "vocal_offset": {
      "type": "float",
      "min": -2,
      "max": 4,
      "default": 0,
      "unit": "seconds"
    }
  },
  "ui": {
    "type": "horizontal_stage_timeline",
    "vocal_lane": true,
    "stage_count": 4
  }
}

---

# organisms/bass-drop-builder/bass-drop-builder.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: BASS DROP BUILDER  v1.0.0
   id: eravos.bass-drop-builder

   Builds complete drop sequences:
     TENSION   — rising harmonic dissonance, filter sweep up
     SLOPE     — BPM feel acceleration, density increase
     BUILD     — layered riser + neuro wobble + sub roll
     DROP      — impact + full bass + rhythm explosion
     VOCAL     — trigger loaded Raven voice clip at any stage

   The whole system is parameter-driven.
   Load a voice clip, set the drop point, fire.
   ═══════════════════════════════════════════════════════════ */

window.BassDropBuilderEngine = (() => {
'use strict';

/* ── Synthesis helpers ──────────────────────────────────── */
function _distort(AC, amount = 0.5) {
  const s = AC.createWaveShaper();
  const n = 256, c = new Float32Array(n), k = amount * 100;
  for (let i = 0; i < n; i++) { const x = (i*2)/n-1; c[i] = ((Math.PI+k)*x)/(Math.PI+k*Math.abs(x)); }
  s.curve = c; s.oversample = '4x'; return s;
}

/* ── Stage engines ──────────────────────────────────────── */

/* TENSION — rising dissonant pad + filter squeeze */
function _tension(AC, t, dur, params, masterGain) {
  const { freq = 110, intensity = 0.6 } = params;
  const nodes = [];

  /* Tritone dissonance (the most unstable interval) */
  [1, 1.414, 2, 2.828].forEach((ratio, i) => {
    const o  = AC.createOscillator();
    const g  = AC.createGain();
    const lfo = AC.createOscillator();
    const lg = AC.createGain();
    o.type      = 'sawtooth';
    o.frequency.value = freq * ratio;
    lfo.type    = 'sine';
    lfo.frequency.value = 0.3 + i * 0.1;
    lg.gain.value = freq * ratio * 0.005;
    lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(intensity * 0.15 / (i + 1), t + dur * 0.3);
    g.gain.linearRampToValueAtTime(intensity * 0.22 / (i + 1), t + dur);
    o.connect(g); g.connect(masterGain);
    lfo.start(t); o.start(t);
    lfo.stop(t + dur + 0.1); o.stop(t + dur + 0.1);
    nodes.push(o, g, lfo, lg);
  });

  /* Filter sweep — closes to near-DC then explodes at drop */
  const nb  = AC.createBufferSource();
  const len = Math.ceil(AC.sampleRate * (dur + 0.1));
  const buf = AC.createBuffer(1, len, AC.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  nb.buffer = buf;
  const nf  = AC.createBiquadFilter(); nf.type = 'lowpass';
  const ng  = AC.createGain();
  nf.frequency.setValueAtTime(800, t);
  nf.frequency.linearRampToValueAtTime(200 + (1 - intensity) * 600, t + dur * 0.8);
  nf.frequency.exponentialRampToValueAtTime(4000, t + dur);
  nf.Q.value = 8 + intensity * 10;
  ng.gain.setValueAtTime(0, t);
  ng.gain.linearRampToValueAtTime(intensity * 0.2, t + dur * 0.4);
  ng.gain.linearRampToValueAtTime(intensity * 0.35, t + dur);
  nb.connect(nf); nf.connect(ng); ng.connect(masterGain);
  nb.start(t); nb.stop(t + dur + 0.15);
  nodes.push(nb, nf, ng);

  return nodes;
}

/* SLOPE — density build. Rapid-fire percussion ghosts. */
function _slope(AC, t, dur, params, masterGain) {
  const { density = 0.7, bpm = 128 } = params;
  const beatSec  = 60 / bpm;
  const step16   = beatSec / 4;
  const numHits  = Math.floor(dur / step16 * density);
  const nodes    = [];

  for (let i = 0; i < numHits; i++) {
    const hitT  = t + (i / numHits) * dur;
    const vel   = 0.15 + (i / numHits) * 0.5; /* velocity crescendo */
    const freq  = 6000 + Math.random() * 4000;

    const nb  = AC.createBufferSource();
    const len = Math.ceil(AC.sampleRate * 0.025);
    const buf = AC.createBuffer(1, len, AC.sampleRate);
    const d   = buf.getChannelData(0);
    for (let j = 0; j < len; j++) d[j] = Math.random() * 2 - 1;
    nb.buffer = buf;

    const nf  = AC.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = freq;
    const ng  = AC.createGain();
    ng.gain.setValueAtTime(vel * 0.25, hitT);
    ng.gain.exponentialRampToValueAtTime(0.001, hitT + 0.025);
    nb.connect(nf); nf.connect(ng); ng.connect(masterGain);
    nb.start(hitT); nb.stop(hitT + 0.03);
    nodes.push(nb, nf, ng);
  }

  /* BPM feel: increase perceived tempo via pitch-up riser */
  const riserO = AC.createOscillator();
  const riserG = AC.createGain();
  riserO.type  = 'sawtooth';
  riserO.frequency.setValueAtTime(55, t);
  riserO.frequency.exponentialRampToValueAtTime(880, t + dur);
  const riserF = AC.createBiquadFilter(); riserF.type = 'lowpass';
  riserF.frequency.setValueAtTime(300, t);
  riserF.frequency.exponentialRampToValueAtTime(8000, t + dur);
  riserG.gain.setValueAtTime(0, t);
  riserG.gain.linearRampToValueAtTime(density * 0.3, t + dur * 0.6);
  riserG.gain.linearRampToValueAtTime(density * 0.5, t + dur);
  riserO.connect(riserF); riserF.connect(riserG); riserG.connect(masterGain);
  riserO.start(t); riserO.stop(t + dur + 0.05);
  nodes.push(riserO, riserF, riserG);

  return nodes;
}

/* BUILD — full pre-drop layer stack */
function _build(AC, t, dur, params, masterGain) {
  const { freq = 110, cutoff = 600, res = 8, rate = 6, depth = 800 } = params;
  const nodes = [];

  /* Neuro wobble growing */
  const wO   = AC.createOscillator(); wO.type = 'sawtooth'; wO.frequency.value = freq;
  const wO2  = AC.createOscillator(); wO2.type = 'sawtooth'; wO2.frequency.value = freq * 1.006;
  const wLFO = AC.createOscillator(); wLFO.type = 'sine'; wLFO.frequency.value = rate;
  const wLG  = AC.createGain(); wLG.gain.value = depth;
  const wF   = AC.createBiquadFilter(); wF.type = 'lowpass'; wF.frequency.value = cutoff; wF.Q.value = res;
  const wDist= _distort(AC, 0.5);
  const wG   = AC.createGain();
  wLFO.connect(wLG); wLG.connect(wF.frequency);
  wO.connect(wDist); wO2.connect(wDist); wDist.connect(wF); wF.connect(wG); wG.connect(masterGain);
  wG.gain.setValueAtTime(0, t);
  wG.gain.linearRampToValueAtTime(0.4, t + dur * 0.4);
  wG.gain.linearRampToValueAtTime(0.65, t + dur);
  wO.start(t); wO2.start(t); wLFO.start(t);
  wO.stop(t + dur + 0.1); wO2.stop(t + dur + 0.1); wLFO.stop(t + dur + 0.1);
  nodes.push(wO, wO2, wLFO, wLG, wF, wDist, wG);

  /* Sub roll growing under the wobble */
  const sO  = AC.createOscillator(); sO.type = 'sine'; sO.frequency.value = freq * 0.5;
  const sF  = AC.createBiquadFilter(); sF.type = 'lowpass'; sF.frequency.value = 180;
  const sG  = AC.createGain();
  sG.gain.setValueAtTime(0, t);
  sG.gain.linearRampToValueAtTime(0.5, t + dur * 0.5);
  sG.gain.linearRampToValueAtTime(0.8, t + dur);
  sO.connect(sF); sF.connect(sG); sG.connect(masterGain);
  sO.start(t); sO.stop(t + dur + 0.05);
  nodes.push(sO, sF, sG);

  /* White noise sweep */
  const nBuf = AC.createBuffer(1, Math.ceil(AC.sampleRate * (dur + 0.1)), AC.sampleRate);
  const nD   = nBuf.getChannelData(0);
  for (let i = 0; i < nD.length; i++) nD[i] = Math.random() * 2 - 1;
  const nSrc = AC.createBufferSource(); nSrc.buffer = nBuf;
  const nF   = AC.createBiquadFilter(); nF.type = 'highpass';
  const nG   = AC.createGain();
  nF.frequency.setValueAtTime(8000, t);
  nF.frequency.exponentialRampToValueAtTime(200, t + dur);
  nG.gain.setValueAtTime(0, t);
  nG.gain.linearRampToValueAtTime(0.18, t + dur * 0.7);
  nG.gain.linearRampToValueAtTime(0.3, t + dur);
  nSrc.connect(nF); nF.connect(nG); nG.connect(masterGain);
  nSrc.start(t); nSrc.stop(t + dur + 0.15);
  nodes.push(nSrc, nF, nG);

  return nodes;
}

/* DROP — the moment */
function _drop(AC, t, params, masterGain) {
  const { freq = 55, drive = 0.6, bpm = 128 } = params;
  const beatSec = 60 / bpm;
  const nodes   = [];

  /* Sub boom */
  const subO = AC.createOscillator(); subO.type = 'sine';
  const subG = AC.createGain();
  subO.frequency.setValueAtTime(freq * 2, t);
  subO.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 0.5);
  subG.gain.setValueAtTime(1.3, t);
  subG.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
  subO.connect(subG); subG.connect(masterGain);
  subO.start(t); subO.stop(t + 0.75);
  nodes.push(subO, subG);

  /* Distorted body thud */
  const thudO = AC.createOscillator(); thudO.type = 'sine';
  const thudD = _distort(AC, drive);
  const thudF = AC.createBiquadFilter(); thudF.type = 'lowpass'; thudF.frequency.value = freq * 6;
  const thudG = AC.createGain();
  thudO.frequency.setValueAtTime(freq * 3, t);
  thudO.frequency.exponentialRampToValueAtTime(freq, t + 0.18);
  thudG.gain.setValueAtTime(1.0, t);
  thudG.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  thudO.connect(thudD); thudD.connect(thudF); thudF.connect(thudG); thudG.connect(masterGain);
  thudO.start(t); thudO.stop(t + 0.25);
  nodes.push(thudO, thudD, thudF, thudG);

  /* Air crack */
  const crBuf = AC.createBuffer(1, Math.ceil(AC.sampleRate * 0.018), AC.sampleRate);
  const crD   = crBuf.getChannelData(0);
  for (let i = 0; i < crD.length; i++) crD[i] = Math.random() * 2 - 1;
  const crSrc = AC.createBufferSource(); crSrc.buffer = crBuf;
  const crF   = AC.createBiquadFilter(); crF.type = 'highpass'; crF.frequency.value = 8000;
  const crG   = AC.createGain();
  crG.gain.setValueAtTime(0.9, t);
  crG.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
  crSrc.connect(crF); crF.connect(crG); crG.connect(masterGain);
  crSrc.start(t); crSrc.stop(t + 0.02);
  nodes.push(crSrc, crF, crG);

  /* Reese bass drop — two detuned saws sweep in */
  const rO1 = AC.createOscillator(); rO1.type = 'sawtooth'; rO1.frequency.value = freq * 1.006;
  const rO2 = AC.createOscillator(); rO2.type = 'sawtooth'; rO2.frequency.value = freq * 0.994;
  const rF  = AC.createBiquadFilter(); rF.type = 'lowpass';
  const rG  = AC.createGain();
  const rDur = beatSec * 2;
  rF.frequency.setValueAtTime(freq * 0.8, t);
  rF.frequency.exponentialRampToValueAtTime(freq * 6, t + 0.05);
  rF.frequency.exponentialRampToValueAtTime(freq * 2.5, t + rDur);
  rF.Q.value = 2;
  rG.gain.setValueAtTime(0, t);
  rG.gain.linearRampToValueAtTime(0.85, t + 0.02);
  rG.gain.exponentialRampToValueAtTime(0.001, t + rDur);
  rO1.connect(rF); rO2.connect(rF); rF.connect(rG); rG.connect(masterGain);
  rO1.start(t); rO2.start(t);
  rO1.stop(t + rDur + 0.05); rO2.stop(t + rDur + 0.05);
  nodes.push(rO1, rO2, rF, rG);

  /* Neuro wobble burst after the impact */
  const wDelay = 0.03;
  const wO  = AC.createOscillator(); wO.type = 'sawtooth'; wO.frequency.value = freq;
  const wLFO= AC.createOscillator(); wLFO.type = 'sine'; wLFO.frequency.value = 8;
  const wLG = AC.createGain(); wLG.gain.value = 900;
  const wF  = AC.createBiquadFilter(); wF.type = 'lowpass'; wF.frequency.value = 800; wF.Q.value = 10;
  const wDst= _distort(AC, 0.55);
  const wG  = AC.createGain();
  wLFO.connect(wLG); wLG.connect(wF.frequency);
  wO.connect(wDst); wDst.connect(wF); wF.connect(wG); wG.connect(masterGain);
  wG.gain.setValueAtTime(0, t + wDelay);
  wG.gain.linearRampToValueAtTime(0.7, t + wDelay + 0.02);
  wG.gain.exponentialRampToValueAtTime(0.001, t + wDelay + beatSec * 4);
  wO.start(t + wDelay); wLFO.start(t + wDelay);
  wO.stop(t + wDelay + beatSec * 4 + 0.1); wLFO.stop(t + wDelay + beatSec * 4 + 0.1);
  nodes.push(wO, wLFO, wLG, wF, wDst, wG);

  return nodes;
}

/* VOCAL TRIGGER — plays loaded buffer at specified time */
function _triggerVocal(AC, t, audioBuffer, params, masterGain) {
  if (!audioBuffer) return [];
  const { gain = 0.9, pitch = 0, reverse = false } = params;
  const src = AC.createBufferSource();
  src.buffer = audioBuffer;
  src.playbackRate.value = Math.pow(2, pitch / 12) * (reverse ? -1 : 1);
  const g = AC.createGain(); g.gain.value = gain;
  src.connect(g); g.connect(masterGain);
  src.start(t);
  return [src, g];
}

/* ── MOUNT ──────────────────────────────────────────────── */
function mount(instanceId, sBus, audio, config = {}) {
  const gBus = KERNEL.bus;

  /* Stage params */
  const params = {
    bpm:         config.bpm         || KERNEL.clock.BPM,
    freq:        config.freq        || 55,
    drive:       config.drive       || 0.6,
    tensionDur:  config.tensionDur  || 4.0,
    slopeDur:    config.slopeDur    || 2.0,
    buildDur:    config.buildDur    || 4.0,
    tensionIntensity: config.tensionIntensity || 0.6,
    slopeDensity:     config.slopeDensity     || 0.7,
    wobbleFreq:  config.wobbleFreq  || 110,
    wobbleCutoff:config.wobbleCutoff|| 600,
    wobbleRes:   config.wobbleRes   || 8,
    wobbleRate:  config.wobbleRate  || 6,
    wobbleDepth: config.wobbleDepth || 800,
    vocalGain:   config.vocalGain   || 0.9,
    vocalPitch:  config.vocalPitch  || 0,
    vocalStage:  config.vocalStage  || 'build', /* tension|slope|build|drop|after */
    vocalOffset: config.vocalOffset || 0,      /* seconds offset within stage */
  };

  /* Loaded vocal buffer */
  let _vocalBuffer = null;
  let _vocalName   = null;

  /* Running state */
  let _running     = false;
  let _activeNodes = [];

  /* Master gain for the whole sequence */
  let _masterGain  = null;

  function _getMasterGain() {
    const AC = audio.boot();
    if (!_masterGain || _masterGain.context !== AC) {
      _masterGain = AC.createGain();
      _masterGain.gain.value = 0.85;
      audio.send(_masterGain, false, false, true);
    }
    return _masterGain;
  }

  function _stopAll() {
    _activeNodes.forEach(n => { try { if (n.stop) n.stop(0); } catch(e) {} });
    _activeNodes = [];
    _running = false;
    sBus.publish('org:state-sync', { running: false });
  }

  function _fire() {
    if (_running) { _stopAll(); return; }
    const AC  = audio.boot();
    const mg  = _getMasterGain();
    const bpm = params.bpm || KERNEL.clock.BPM;
    let   t   = AC.currentTime + 0.05;
    const nodes = [];

    /* Stage timing */
    const stageStart = {
      tension: t,
      slope:   t + params.tensionDur,
      build:   t + params.tensionDur + params.slopeDur,
      drop:    t + params.tensionDur + params.slopeDur + params.buildDur,
      after:   t + params.tensionDur + params.slopeDur + params.buildDur + 0.1,
    };

    /* Fire each stage */
    nodes.push(..._tension(AC, stageStart.tension, params.tensionDur, { freq: params.freq * 2, intensity: params.tensionIntensity }, mg));
    nodes.push(..._slope(  AC, stageStart.slope,   params.slopeDur,   { density: params.slopeDensity, bpm }, mg));
    nodes.push(..._build(  AC, stageStart.build,   params.buildDur,   { freq: params.wobbleFreq, cutoff: params.wobbleCutoff, res: params.wobbleRes, rate: params.wobbleRate, depth: params.wobbleDepth }, mg));
    nodes.push(..._drop(   AC, stageStart.drop,    { freq: params.freq, drive: params.drive, bpm }, mg));

    /* Vocal */
    if (_vocalBuffer) {
      const vocalT = stageStart[params.vocalStage] + params.vocalOffset;
      nodes.push(..._triggerVocal(AC, vocalT, _vocalBuffer, { gain: params.vocalGain, pitch: params.vocalPitch }, mg));
    }

    _activeNodes = nodes;
    _running = true;

    const totalDur = params.tensionDur + params.slopeDur + params.buildDur + 6;
    sBus.publish('org:state-sync', {
      running: true,
      stageTimings: stageStart,
      totalDur,
      bpm,
      vocalLoaded: !!_vocalBuffer,
      vocalName: _vocalName,
    });

    /* Broadcast stage events for UI progress bar */
    Object.entries(stageStart).forEach(([stage, time]) => {
      const delay = (time - AC.currentTime) * 1000;
      setTimeout(() => {
        if (_running) sBus.publish('org:stage-active', { stage });
        gBus.publish('bass-drop:stage', { stage, instanceId });
      }, Math.max(0, delay));
    });

    /* Auto-stop after sequence */
    setTimeout(() => {
      _running = false;
      sBus.publish('org:state-sync', { running: false });
    }, totalDur * 1000);
  }

  /* ── UI hooks ── */
  const _unsubs = [
    gBus.subscribe('ui:fire:' + instanceId, _fire),
    gBus.subscribe('ui:stop:' + instanceId, _stopAll),
    gBus.subscribe('ui:config-change:' + instanceId, ({ key, value }) => {
      if (key in params) {
        params[key] = value;
        if (key === 'bpm') KERNEL.clock.BPM = value;
      }
    }),
    gBus.subscribe('ui:load-vocal:' + instanceId, ({ arrayBuffer, name }) => {
      if (!arrayBuffer) return;
      const AC = audio.boot();
      AC.decodeAudioData(arrayBuffer.slice(0)).then(ab => {
        _vocalBuffer = ab;
        _vocalName   = name;
        sBus.publish('org:vocal-loaded', { name, duration: ab.duration });
      }).catch(e => KERNEL.fault('ASSET_002', instanceId, `vocal decode failed: ${e.message}`));
    }),

    /* Accept audio drops directly */
    gBus.subscribe('intake:file', result => {
      if (result.id !== 'audio:sample') return;
      gBus.publish('ui:load-vocal:' + instanceId, { arrayBuffer: result.arrayBuffer, name: result.name });
    }),

    /* Receive BPM updates */
    gBus.subscribe('kernel:bpm-change', ({ BPM }) => { params.bpm = BPM; }),
  ];

  /* Initial state push */
  setTimeout(() => {
    sBus.publish('org:state-sync', {
      running: false,
      params: { ...params },
      vocalLoaded: !!_vocalBuffer,
      vocalName: _vocalName,
    });
  }, 50);

  KERNEL.registry.register({
    instanceId, id: 'eravos.bass-drop-builder', label: 'Bass Drop Builder',
    provides: ['capability.audio_out'],
    requires: ['capability.audio_context'],
    permissions: ['audio_out', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'drop.hook.fire',       direction: 'in',  event_type: 'ui:fire',           contract_version: '1.0.0' },
      { hook_id: 'drop.hook.vocal-in',   direction: 'in',  event_type: 'audio:buffer',      contract_version: '1.0.0' },
      { hook_id: 'drop.hook.stage-out',  direction: 'out', event_type: 'bass-drop:stage',   contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() { _stopAll(); _unsubs.forEach(u => u()); KERNEL.registry.unregister(instanceId); },
    fire: _fire, stop: _stopAll,
  };
}

return { mount };
})();

---

# organisms/macro-automation/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.macro-automation",
  "label": "Macro Automation",
  "icon": "⏺",
  "accent": "#ffaa00",
  "domain": ["automation", "control", "recording"],
  "description": "Records every parameter change made to a chosen organism in real time — turning any knob, toggle, or select is captured with its exact timing — then plays the whole macro back, re-driving that organism's parameters at the original timing. Loopable, speed-adjustable. This is in-app automation: it drives other ERAVOS organisms over the bus, not anything outside the sandbox.",
  "permissions": ["bus_publish", "bus_subscribe"],
  "provides": ["capability.automation_record", "capability.automation_playback"],
  "requires": [],
  "dependencies": {
    "runtime": ["kernel/kernel.js", "KERNEL.registry (to list target organisms)"],
    "browser_apis": ["performance.now()"],
    "external_libs": []
  },
  "hooks": [
    { "hook_id": "macro.hook.drive_out", "direction": "out", "event_type": "ui:config_change", "contract_version": "1.0.0" }
  ],
  "params": {
    "targetInstanceId": { "type": "string", "default": null },
    "loop":  { "type": "bool",  "default": true },
    "speed": { "type": "float", "min": 0.25, "max": 4, "default": 1 }
  }
}

---

# organisms/macro-automation/macro-automation.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: MACRO AUTOMATION  v1.0.0
   id: eravos.macro-automation

   In-app parameter automation. While armed, listens to
   'ui:config_change:<targetInstanceId>' events destined for a
   chosen organism and records { key, value, tMs }. On playback,
   re-publishes those same events at the same relative offsets —
   a real automation lane, not a demo: it genuinely drives the
   target organism's knobs over time.
   ═══════════════════════════════════════════════════════════ */

window.MacroAutomationEngine = (() => {
'use strict';

function mount(instanceId, sBus, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    targetInstanceId: config.targetInstanceId || null,
    loop:  config.loop !== false,
    speed: config.speed || 1,
  };

  let _recording  = false;
  let _playing    = false;
  let _events     = [];   /* { key, value, tMs } relative to record start */
  let _recStartAt = 0;
  let _playTimers = [];
  let _targetSub  = null;

  function _clearTargetSub() { if (_targetSub) { _targetSub(); _targetSub = null; } }

  function setTarget(id) {
    _params.targetInstanceId = id;
    _clearTargetSub();
    if (!id) return;
    _targetSub = gBus.subscribe('ui:config_change:' + id, ({ key, value }) => {
      if (!_recording) return;
      _events.push({ key, value, tMs: performance.now() - _recStartAt });
    });
  }

  function arm() {
    if (!_params.targetInstanceId) { sBus.publish('org:error', { message: 'Pick a target organism first.' }); return; }
    _events = [];
    _recStartAt = performance.now();
    _recording = true;
    sBus.publish('org:state_sync', { recording: true, playing: _playing, count: 0 });
  }

  function stopRecording() {
    _recording = false;
    sBus.publish('org:state_sync', { recording: false, playing: _playing, count: _events.length });
  }

  function _clearPlayTimers() { _playTimers.forEach(t => clearTimeout(t)); _playTimers = []; }

  function play() {
    if (!_params.targetInstanceId || !_events.length) return;
    _clearPlayTimers();
    _playing = true;
    const targetTopic = 'ui:config_change:' + _params.targetInstanceId;
    const duration = _events[_events.length - 1].tMs / _params.speed;

    _events.forEach(ev => {
      const t = ev.tMs / _params.speed;
      _playTimers.push(setTimeout(() => {
        gBus.publish(targetTopic, { key: ev.key, value: ev.value });
        sBus.publish('org:step', { key: ev.key, value: ev.value });
      }, t));
    });

    _playTimers.push(setTimeout(() => {
      if (_params.loop) { play(); } else { _playing = false; sBus.publish('org:state_sync', { recording: false, playing: false, count: _events.length }); }
    }, duration + 20));

    sBus.publish('org:state_sync', { recording: false, playing: true, count: _events.length });
  }

  function stopPlayback() {
    _clearPlayTimers();
    _playing = false;
    sBus.publish('org:state_sync', { recording: _recording, playing: false, count: _events.length });
  }

  function clearMacro() {
    _events = [];
    sBus.publish('org:state_sync', { recording: _recording, playing: _playing, count: 0 });
  }

  function _updateParam(key, val) {
    if (key === 'targetInstanceId') { setTarget(val); return; }
    if (key in _params) _params[key] = val;
  }

  const _unsubs = [
    gBus.subscribe('ui:macro_arm:'    + instanceId, arm),
    gBus.subscribe('ui:macro_stop_rec:' + instanceId, stopRecording),
    gBus.subscribe('ui:macro_play:'   + instanceId, play),
    gBus.subscribe('ui:macro_stop:'   + instanceId, stopPlayback),
    gBus.subscribe('ui:macro_clear:'  + instanceId, clearMacro),
    gBus.subscribe('ui:config_change:' + instanceId, ({ key, value }) => _updateParam(key, value)),
  ];

  if (_params.targetInstanceId) setTarget(_params.targetInstanceId);
  sBus.publish('org:state_sync', { recording: false, playing: false, count: 0 });

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.macro-automation',
    label:    'Macro Automation',
    provides: ['capability.automation_record', 'capability.automation_playback'],
    requires: [],
    permissions: ['bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'macro.hook.drive_out', direction: 'out', event_type: 'ui:config_change', contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() { _clearPlayTimers(); _clearTargetSub(); _unsubs.forEach(u => u()); KERNEL.registry.unregister(instanceId); },
    setTarget, arm, stopRecording, play, stopPlayback, clearMacro,
    get events() { return _events.slice(); },
    get params() { return { ..._params }; },
  };
}

return { mount };
})();

---

# organisms/reese-bass/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.reese-bass",
  "label": "Reese Bass",
  "icon": "\ud83d\udd08",
  "accent": "#ff2266",
  "domain": [
    "music",
    "synthesis",
    "bass",
    "dnb"
  ],
  "description": "Two detuned sawtooth oscillators through sweeping lowpass. Sub octave oscillator.",
  "permissions": [
    "audio_out",
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.audio_out"
  ],
  "requires": [
    "capability.audio_context"
  ],
  "hooks": [
    {
      "hook_id": "reese.hook.trig_in",
      "direction": "in",
      "event_type": "pad:trigger",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "reese.hook.audio_out",
      "direction": "out",
      "event_type": "audio:signal",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "pitch": {
      "type": "float",
      "min": 20,
      "max": 220,
      "default": 55,
      "unit": "Hz"
    },
    "detune": {
      "type": "float",
      "min": 0,
      "max": 50,
      "default": 10,
      "unit": "cents"
    },
    "cutoff": {
      "type": "float",
      "min": 50,
      "max": 4000,
      "default": 400,
      "unit": "Hz"
    },
    "sweep": {
      "type": "float",
      "min": 0.1,
      "max": 4,
      "default": 0.9,
      "unit": "seconds"
    },
    "gain": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.85,
      "unit": ""
    },
    "sub": {
      "type": "bool",
      "default": true
    }
  },
  "ui": {
    "type": "dual_osc_scope",
    "detuning_visual": true
  }
}

---

# organisms/reese-bass/reese-bass.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: REESE BASS  v1.0.0
   id: eravos.reese-bass

   Two slightly detuned sawtooth oscillators through a sweeping
   lowpass filter. Sub oscillator at half frequency for weight.
   The DNB/neuro foundation sound.
   Continuous or one-shot triggered.
   ═══════════════════════════════════════════════════════════ */

window.ReeseBassEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    pitch:  config.pitch  || 55,   /* Hz */
    detune: config.detune || 10,   /* cents */
    cutoff: config.cutoff || 400,
    sweep:  config.sweep  || 0.9,  /* filter sweep duration */
    gain:   config.gain   || 0.85,
    sub:    config.sub !== false,
    active: false,
  };

  let _nodes = null;

  function _start() {
    if (_nodes) _stop();
    const AC = audio.boot();

    const o1   = AC.createOscillator(); o1.type = 'sawtooth';
    const o2   = AC.createOscillator(); o2.type = 'sawtooth';
    const filt = AC.createBiquadFilter(); filt.type = 'lowpass'; filt.Q.value = 1.8;
    const gain = AC.createGain(); gain.gain.value = _params.gain;

    o1.frequency.value = _params.pitch * Math.pow(2,  _params.detune / 1200);
    o2.frequency.value = _params.pitch * Math.pow(2, -_params.detune / 1200);

    /* Continuous slow sweep */
    filt.frequency.value = _params.cutoff * 0.4;

    o1.connect(filt); o2.connect(filt); filt.connect(gain); audio.send(gain, false, false, true);

    if (_params.sub) {
      const subO = AC.createOscillator(); subO.type = 'sine';
      subO.frequency.value = _params.pitch * 0.5;
      const subG = AC.createGain(); subG.gain.value = 0.4;
      subO.connect(subG); audio.send(subG, false, false, true);
      subO.start(); _nodes = { o1, o2, filt, gain, subO, subG };
    } else {
      _nodes = { o1, o2, filt, gain };
    }

    [o1, o2].forEach(n => n.start());
    _params.active = true;
    sBus.publish('org:state_sync', { active: true, params: { ..._params } });
  }

  function _stop() {
    if (!_nodes) return;
    Object.values(_nodes).forEach(n => { try { if (n.stop) n.stop(0); n.disconnect(); } catch(e){} });
    _nodes = null;
    _params.active = false;
    sBus.publish('org:state_sync', { active: false });
  }

  function _trigger(vel = 1) {
    const AC = audio.boot();
    const t  = AC.currentTime + 0.01;
    const dur = _params.sweep + 0.1;

    const o1 = AC.createOscillator(); o1.type = 'sawtooth';
    const o2 = AC.createOscillator(); o2.type = 'sawtooth';
    o1.frequency.value = _params.pitch * Math.pow(2,  _params.detune / 1200);
    o2.frequency.value = _params.pitch * Math.pow(2, -_params.detune / 1200);

    const filt = AC.createBiquadFilter(); filt.type = 'lowpass'; filt.Q.value = 1.8;
    filt.frequency.setValueAtTime(_params.cutoff * 0.4, t);
    filt.frequency.linearRampToValueAtTime(_params.cutoff * 2.6, t + _params.sweep * 0.4);
    filt.frequency.exponentialRampToValueAtTime(_params.cutoff * 0.5, t + _params.sweep);

    const gain = AC.createGain();
    gain.gain.setValueAtTime(vel * _params.gain, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    o1.connect(filt); o2.connect(filt); filt.connect(gain); audio.send(gain, true, false, true);
    [o1, o2].forEach(n => { n.start(t); n.stop(t + dur + 0.05); });

    if (_params.sub) {
      const subO = AC.createOscillator(); subO.type = 'sine';
      subO.frequency.value = _params.pitch * 0.5;
      const subG = AC.createGain();
      subG.gain.setValueAtTime(vel * 0.4, t);
      subG.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.05);
      subO.connect(subG); audio.send(subG, false, false, true);
      subO.start(t); subO.stop(t + dur + 0.1);
    }
  }

  function _updateParam(key, val) {
    _params[key] = val;
    if (!_nodes) return;
    const { o1, o2, filt, gain } = _nodes;
    if (key === 'pitch') {
      o1.frequency.setTargetAtTime(val * Math.pow(2, _params.detune/1200), audio.AC.currentTime, 0.05);
      o2.frequency.setTargetAtTime(val * Math.pow(2, -_params.detune/1200), audio.AC.currentTime, 0.05);
    }
    if (key === 'cutoff') filt.frequency.setTargetAtTime(val * 0.4, audio.AC.currentTime, 0.05);
    if (key === 'gain')   gain.gain.setTargetAtTime(val, audio.AC.currentTime, 0.05);
  }

  function _syncUI() {
    sBus.publish('org:state_sync', { active: _params.active, params: { ..._params } });
  }

  const _unsubs = [
    gBus.subscribe('ui:reese_toggle:' + instanceId, () => _params.active ? _stop() : _start()),
    gBus.subscribe('ui:reese_trigger:' + instanceId, ({ vel }) => _trigger(vel || 1)),
    gBus.subscribe('ui:config_change:' + instanceId, ({ key, value }) => _updateParam(key, value)),
    gBus.subscribe('pad:trigger', ({ sound }) => { if (sound === 'reese') _trigger(0.88); }),
  ];

  _syncUI();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.reese-bass',
    label:    'Reese Bass',
    provides: ['capability.audio_out'],
    requires: ['capability.audio_context'],
    permissions: ['audio_out', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'reese.hook.trig_in',   direction: 'in',  event_type: 'pad:trigger',  contract_version: '1.0.0' },
      { hook_id: 'reese.hook.audio_out', direction: 'out', event_type: 'audio:signal', contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() { _stop(); _unsubs.forEach(u => u()); KERNEL.registry.unregister(instanceId); },
    start: _start, stop: _stop, trigger: _trigger,
    get params() { return { ..._params }; },
  };
}

return { mount };
})();

---

# organisms/photo-editor/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.photo-editor",
  "label": "Photo Editor",
  "icon": "🖼",
  "accent": "#00d4ff",
  "domain": ["image", "photo", "editing", "raster"],
  "description": "Drop-in raster image editor. Load a photo, adjust brightness/contrast/saturation/hue/blur/grayscale/invert/sepia live on canvas, crop by drag-rectangle, export as PNG. Fully client-side, no upload.",
  "permissions": ["filesystem_read", "bus_publish", "bus_subscribe"],
  "provides": ["capability.image_edit", "capability.image_export"],
  "requires": [],
  "dependencies": {
    "runtime": ["kernel/kernel.js"],
    "browser_apis": ["Canvas2D (CanvasRenderingContext2D.filter)", "File API", "URL.createObjectURL"],
    "external_libs": []
  },
  "hooks": [
    { "hook_id": "photo.hook.exported", "direction": "out", "event_type": "photo:exported", "contract_version": "1.0.0" }
  ],
  "params": {
    "brightness": { "type": "float", "min": 0, "max": 2,   "default": 1,   "unit": "" },
    "contrast":   { "type": "float", "min": 0, "max": 2,   "default": 1,   "unit": "" },
    "saturation": { "type": "float", "min": 0, "max": 3,   "default": 1,   "unit": "" },
    "hue":        { "type": "float", "min": 0, "max": 360, "default": 0,   "unit": "deg" },
    "blur":       { "type": "float", "min": 0, "max": 20,  "default": 0,   "unit": "px" },
    "grayscale":  { "type": "float", "min": 0, "max": 1,   "default": 0,   "unit": "" },
    "invert":     { "type": "float", "min": 0, "max": 1,   "default": 0,   "unit": "" },
    "sepia":      { "type": "float", "min": 0, "max": 1,   "default": 0,   "unit": "" }
  }
}

---

# organisms/photo-editor/photo-editor.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: PHOTO EDITOR  v1.0.0
   id: eravos.photo-editor

   Raster image editor. Holds the loaded image + params; the
   canvas element and file/drag UI live in organism-factory.js
   buildUI, which calls back into these pure helpers so the
   filter/crop/export logic has exactly one implementation.
   ═══════════════════════════════════════════════════════════ */

window.PhotoEditorEngine = (() => {
'use strict';

function mount(instanceId, sBus, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    brightness: 1, contrast: 1, saturation: 1, hue: 0,
    blur: 0, grayscale: 0, invert: 0, sepia: 0,
  };

  let _image = null; /* HTMLImageElement, natural size preserved */

  function filterString(p = _params) {
    return [
      `brightness(${p.brightness})`,
      `contrast(${p.contrast})`,
      `saturate(${p.saturation})`,
      `hue-rotate(${p.hue}deg)`,
      `blur(${p.blur}px)`,
      `grayscale(${p.grayscale})`,
      `invert(${p.invert})`,
      `sepia(${p.sepia})`,
    ].join(' ');
  }

  function loadFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { _image = img; sBus.publish('org:image_loaded', { w: img.naturalWidth, h: img.naturalHeight }); resolve(img); };
      img.onerror = reject;
      img.src = url;
    });
  }

  function draw(canvas) {
    if (!_image) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = _image.naturalWidth;
    canvas.height = _image.naturalHeight;
    ctx.filter = filterString();
    ctx.drawImage(_image, 0, 0);
    ctx.filter = 'none';
  }

  /* Crop to a rect given in canvas pixel coords, replacing the working image */
  function applyCrop(canvas, rect) {
    const x = Math.max(0, Math.round(rect.x)), y = Math.max(0, Math.round(rect.y));
    const w = Math.max(1, Math.round(rect.w)), h = Math.max(1, Math.round(rect.h));
    const src = document.createElement('canvas');
    src.width = canvas.width; src.height = canvas.height;
    src.getContext('2d').drawImage(canvas, 0, 0);

    const out = document.createElement('canvas');
    out.width = w; out.height = h;
    out.getContext('2d').drawImage(src, x, y, w, h, 0, 0, w, h);

    const img = new Image();
    return new Promise(resolve => {
      img.onload = () => { _image = img; sBus.publish('org:image_loaded', { w, h }); resolve(img); };
      img.src = out.toDataURL('image/png');
    });
  }

  function exportPNG(canvas, filename = 'eravos-photo-export.png') {
    /* Bake current filter into the exported pixels, not just the on-screen preview */
    const out = document.createElement('canvas');
    out.width = canvas.width; out.height = canvas.height;
    const octx = out.getContext('2d');
    octx.filter = filterString();
    octx.drawImage(_image, 0, 0, out.width, out.height);

    const url = out.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();

    gBus.publish('photo:exported', { instanceId, filename, w: out.width, h: out.height });
    sBus.publish('org:exported', { filename });
  }

  function _updateParam(key, val) {
    if (key in _params) _params[key] = val;
  }

  function _syncUI() {
    sBus.publish('org:state_sync', { params: { ..._params } });
  }

  const _unsubs = [
    gBus.subscribe('ui:config_change:' + instanceId, ({ key, value }) => _updateParam(key, value)),
  ];

  _syncUI();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.photo-editor',
    label:    'Photo Editor',
    provides: ['capability.image_edit', 'capability.image_export'],
    requires: [],
    permissions: ['filesystem_read', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'photo.hook.exported', direction: 'out', event_type: 'photo:exported', contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() { _unsubs.forEach(u => u()); KERNEL.registry.unregister(instanceId); },
    loadFile, draw, applyCrop, exportPNG, filterString,
    get image()  { return _image; },
    get params() { return { ..._params }; },
  };
}

return { mount };
})();

---

# organisms/nexus-shared/nexus-node-core.js

/* ═══════════════════════════════════════════════════════════
   NEXUS NODE CORE  v1.0.0
   organisms/nexus-shared/nexus-node-core.js

   Shared engine logic for the 7 separate NEXUS diagnostic
   organisms (cortex, guardian, bridge, orchestrator,
   diagnostic, architect, idearium). Each organism is a thin
   per-system wrapper (its own engine.js + schema.json, its
   own window) that calls into this core with its own config —
   same pattern pads/wobble-bass/acid-synth/reese-bass share
   VOICES from pads.engine.js.

   AGNOSTIC BY DESIGN — no own clock/interval:
   Status polling is driven entirely by the existing global
   MasterTransport (the ▶ ⏺ bar already wired for audio):
     transport:play         -> start polling this node
     transport:stop         -> stop polling this node
     transport:record-start -> also write every poll result
                                into KERNEL.ledger, tagged
                                'nexus_diagnostic_snapshot'
     transport:record-stop  -> stop writing to ledger
                                (polling keeps going if still
                                playing)
   A node never owns its own timer. It just reacts to the same
   wires every other organism already reacts to.

   REPLAY — not fully built yet. The ledger entries written
   during record are real, queryable history
   (KERNEL.ledger.entries().filter(e=>e.type==='nexus_diagnostic_snapshot')),
   which is the data a future scrub/replay UI (e.g. feeding the
   existing Timeline organism) would consume. No playback UI
   exists yet — this just lays the ledger groundwork honestly.

   DIAGNOSE — every node's Diagnose button POSTs to the
   Orchestrator (not directly to the target system), since the
   Orchestrator is the existing interconnect/verifier for the
   other subsystems. The Orchestrator's own card diagnoses
   itself directly. Endpoint paths are config, not guesses —
   they default to placeholders and should be set to whatever
   NEXUS actually exposes.
   ═══════════════════════════════════════════════════════════ */

window.NexusNodeCore = (() => {
'use strict';

function mount(instanceId, sBus, config = {}) {
  const gBus = KERNEL.bus;

  const cfg = {
    key:              config.key              || 'unknown',
    label:            config.label             || 'NEXUS NODE',
    icon:             config.icon              || '◆',
    accent:           config.accent            || '#00ff88',
    base:             config.base              || 'http://127.0.0.1:9000',
    statusPath:       config.statusPath        || '/api/status',
    snapshotsPath:    config.snapshotsPath     || '/snapshots',
    orchestratorBase: config.orchestratorBase  || 'http://127.0.0.1:9000',
    diagnosePath:     config.diagnosePath      || '/diagnose',
    idLink:           config.idLink            || 'http://127.0.0.1:4800',
    pollMs:           config.pollMs            || 4000,
    timeoutMs:        config.timeoutMs         || 2500,
    isOrchestrator:   !!config.isOrchestrator,
  };

  let _state = {
    online: null, latencyMs: null, error: null, payload: null, lastCheckedAt: null,
    diagnosing: false, lastDiagnose: null,
    playing: false, recording: false,
  };
  let _interval = null;

  function _withTimeout(p, ms) {
    return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), ms))]);
  }

  function _sync() { sBus.publish('org:state_sync', { ..._state }); }

  async function _pollOnce() {
    const t0 = performance.now();
    try {
      const res = await _withTimeout(fetch(cfg.base + cfg.statusPath, { cache: 'no-store', mode: 'cors' }), cfg.timeoutMs);
      const latencyMs = Math.round(performance.now() - t0);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let payload = null;
      try { payload = await res.json(); } catch (_) {}
      _state = { ..._state, online: true, latencyMs, error: null, payload, lastCheckedAt: Date.now() };
    } catch (e) {
      _state = { ..._state, online: false, latencyMs: null, error: e.message || 'UNREACHABLE', payload: null, lastCheckedAt: Date.now() };
    }
    _sync();
    if (_state.recording) {
      KERNEL.ledger._write({
        type: 'nexus_diagnostic_snapshot',
        instanceId, key: cfg.key, label: cfg.label,
        online: _state.online, latencyMs: _state.latencyMs, error: _state.error,
      });
    }
  }

  async function _diagnose() {
    if (_state.diagnosing) return;
    _state = { ..._state, diagnosing: true }; _sync();
    const targetBase = cfg.isOrchestrator ? cfg.base : cfg.orchestratorBase;
    const t0 = performance.now();
    try {
      const res = await _withTimeout(
        fetch(targetBase + cfg.diagnosePath, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: cfg.key }),
        }),
        Math.max(cfg.timeoutMs, 8000)
      );
      const ms = Math.round(performance.now() - t0);
      let body = null; try { body = await res.json(); } catch (_) {}
      _state = { ..._state, diagnosing: false, lastDiagnose: { ok: res.ok, ms, body, at: Date.now() } };
    } catch (e) {
      _state = { ..._state, diagnosing: false, lastDiagnose: { ok: false, error: e.message, at: Date.now() } };
    }
    _sync();
    KERNEL.ledger._write({ type: 'nexus_diagnose_run', instanceId, key: cfg.key, result: _state.lastDiagnose });
  }

  function _openSnapshots() {
    window.open(cfg.base + cfg.snapshotsPath, '_blank');
  }

  function _openIdearium() {
    window.open(`${cfg.idLink}/?focus=${encodeURIComponent(cfg.key)}`, '_blank');
  }

  function _startPolling() {
    if (_interval) return;
    _state = { ..._state, playing: true }; _sync();
    _pollOnce();
    _interval = setInterval(_pollOnce, cfg.pollMs);
  }

  function _stopPolling() {
    if (_interval) { clearInterval(_interval); _interval = null; }
    _state = { ..._state, playing: false }; _sync();
  }

  const _unsubs = [
    gBus.subscribe('transport:play',         () => _startPolling()),
    gBus.subscribe('transport:stop',         () => _stopPolling()),
    gBus.subscribe('transport:record-start', () => { _state = { ..._state, recording: true };  _sync(); }),
    gBus.subscribe('transport:record-stop',  () => { _state = { ..._state, recording: false }; _sync(); }),
    gBus.subscribe('ui:diagnose:'      + instanceId, () => _diagnose()),
    gBus.subscribe('ui:open-snapshots:' + instanceId, () => _openSnapshots()),
    gBus.subscribe('ui:open-idearium:'  + instanceId, () => _openIdearium()),
  ];

  /* One check immediately on mount so the card isn't blank
     before anyone presses play — doesn't start the interval. */
  _pollOnce();
  if (window.MasterTransport?.playing) _startPolling();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.nexus-' + cfg.key,
    label:    cfg.label,
    provides: ['capability.nexus_diagnostic'],
    requires: [],
    permissions: ['network_fetch', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'nn.hook.bus_out', direction: 'out', event_type: 'org:state_sync', contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() {
      _stopPolling();
      _unsubs.forEach(u => u());
      KERNEL.registry.unregister(instanceId);
    },
    get state() { return { ..._state }; },
    diagnose: _diagnose,
  };
}

return { mount };
})();

---

# organisms/wobble-bass/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.wobble-bass",
  "label": "Wobble Bass",
  "icon": "\ud83d\udd0a",
  "accent": "#ff2266",
  "domain": [
    "music",
    "synthesis",
    "bass",
    "dubstep"
  ],
  "description": "Detuned sawtooth through LFO-swept resonant lowpass with distortion. Continuous or one-shot.",
  "permissions": [
    "audio_out",
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.audio_out"
  ],
  "requires": [
    "capability.audio_context"
  ],
  "hooks": [
    {
      "hook_id": "wobble.hook.trig_in",
      "direction": "in",
      "event_type": "pad:trigger",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "wobble.hook.audio_out",
      "direction": "out",
      "event_type": "audio:signal",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "freq": {
      "type": "float",
      "min": 20,
      "max": 220,
      "default": 110,
      "unit": "Hz"
    },
    "cutoff": {
      "type": "float",
      "min": 80,
      "max": 4000,
      "default": 600,
      "unit": "Hz"
    },
    "res": {
      "type": "float",
      "min": 0.5,
      "max": 20,
      "default": 8,
      "unit": ""
    },
    "rate": {
      "type": "float",
      "min": 0.1,
      "max": 16,
      "default": 4,
      "unit": "Hz"
    },
    "depth": {
      "type": "float",
      "min": 0,
      "max": 2000,
      "default": 600,
      "unit": "Hz"
    },
    "drive": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.4,
      "unit": ""
    },
    "waveform": {
      "type": "enum",
      "values": [
        "sawtooth",
        "square",
        "triangle"
      ],
      "default": "sawtooth"
    }
  },
  "ui": {
    "type": "filter_scope",
    "continuous_mode": true
  }
}

---

# organisms/wobble-bass/wobble-bass.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: WOBBLE BASS  v1.0.0
   id: eravos.wobble-bass

   Sawtooth oscillator through a fast LFO-swept resonant
   lowpass filter with distortion. Classic dubstep wobble.
   Triggered by pad:trigger(sound=wobble) or ui:fire.
   Continuous mode: runs until stopped.
   ═══════════════════════════════════════════════════════════ */

window.WobbleBassEngine = (() => {
'use strict';

function _dist(AC, amt) {
  const s = AC.createWaveShaper();
  const n = 256, c = new Float32Array(n), k = amt * 100;
  for (let i = 0; i < n; i++) { const x=(i*2)/n-1; c[i]=((Math.PI+k)*x)/(Math.PI+k*Math.abs(x)); }
  s.curve = c; s.oversample = '4x'; return s;
}

function mount(instanceId, sBus, audio, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    freq:     config.freq     || 110,
    cutoff:   config.cutoff   || 600,
    res:      config.res      || 8,
    rate:     config.rate     || 4,
    depth:    config.depth    || 600,
    drive:    config.drive    || 0.4,
    waveform: config.waveform || 'sawtooth',
    active:   false,
  };

  let _nodes = null;

  function _start() {
    if (_nodes) _stop();
    const AC = audio.boot();

    const o1   = AC.createOscillator(); o1.type = _params.waveform; o1.frequency.value = _params.freq;
    const o2   = AC.createOscillator(); o2.type = _params.waveform; o2.frequency.value = _params.freq * 1.006;
    const lfo  = AC.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = _params.rate;
    const lfoG = AC.createGain(); lfoG.gain.value = _params.depth;
    const filt = AC.createBiquadFilter(); filt.type = 'lowpass';
    filt.frequency.value = _params.cutoff; filt.Q.value = _params.res;
    const dist = _dist(AC, _params.drive);
    const gain = AC.createGain(); gain.gain.value = 0.75;

    lfo.connect(lfoG); lfoG.connect(filt.frequency);
    o1.connect(dist); o2.connect(dist); dist.connect(filt); filt.connect(gain);
    audio.send(gain, false, false, true);

    [o1, o2, lfo].forEach(n => n.start());
    _nodes = { o1, o2, lfo, lfoG, filt, dist, gain };
    _params.active = true;
    sBus.publish('org:state_sync', { active: true, params: { ..._params } });
  }

  function _stop() {
    if (!_nodes) return;
    Object.values(_nodes).forEach(n => { try { if (n.stop) n.stop(0); n.disconnect(); } catch(e){} });
    _nodes = null;
    _params.active = false;
    sBus.publish('org:state_sync', { active: false });
  }

  function _trigger(vel = 1) {
    /* One-shot trigger — plays for 0.9s */
    const AC = audio.boot();
    const t = AC.currentTime + 0.01;
    const o = AC.createOscillator(); o.type = _params.waveform; o.frequency.value = _params.freq;
    const lfo = AC.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = _params.rate;
    const lG  = AC.createGain(); lG.gain.value = _params.depth;
    const f   = AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=_params.cutoff; f.Q.value=_params.res;
    const d   = _dist(AC, _params.drive);
    const g   = AC.createGain();
    lfo.connect(lG); lG.connect(f.frequency);
    o.connect(d); d.connect(f); f.connect(g); audio.send(g, true, false, true);
    g.gain.setValueAtTime(vel * 0.75, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    [o, lfo].forEach(n => n.start(t));
    [o, lfo].forEach(n => n.stop(t + 1));
  }

  function _updateParam(key, val) {
    _params[key] = val;
    if (!_nodes) return;
    const { o1, o2, lfo, lfoG, filt } = _nodes;
    if (key === 'freq')   { o1.frequency.setTargetAtTime(val, audio.AC.currentTime, 0.02); o2.frequency.setTargetAtTime(val*1.006, audio.AC.currentTime, 0.02); }
    if (key === 'cutoff') filt.frequency.setTargetAtTime(val, audio.AC.currentTime, 0.02);
    if (key === 'res')    filt.Q.setTargetAtTime(val, audio.AC.currentTime, 0.02);
    if (key === 'rate')   lfo.frequency.setTargetAtTime(val, audio.AC.currentTime, 0.02);
    if (key === 'depth')  lfoG.gain.setTargetAtTime(val, audio.AC.currentTime, 0.02);
  }

  function _syncUI() {
    sBus.publish('org:state_sync', { active: _params.active, params: { ..._params } });
  }

  const _unsubs = [
    gBus.subscribe('ui:wobble_toggle:' + instanceId, () => _params.active ? _stop() : _start()),
    gBus.subscribe('ui:wobble_trigger:' + instanceId, ({ vel }) => _trigger(vel || 1)),
    gBus.subscribe('ui:config_change:' + instanceId, ({ key, value }) => _updateParam(key, value)),
    gBus.subscribe('pad:trigger', ({ sound }) => { if (sound === 'wobble') _trigger(0.9); }),
  ];

  _syncUI();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.wobble-bass',
    label:    'Wobble Bass',
    provides: ['capability.audio_out'],
    requires: ['capability.audio_context'],
    permissions: ['audio_out', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'wobble.hook.trig_in',  direction: 'in',  event_type: 'pad:trigger',    contract_version: '1.0.0' },
      { hook_id: 'wobble.hook.audio_out',direction: 'out', event_type: 'audio:signal',   contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() { _stop(); _unsubs.forEach(u => u()); KERNEL.registry.unregister(instanceId); },
    start: _start, stop: _stop, trigger: _trigger,
  };
}

return { mount };
})();

---

# organisms/supersaw/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.supersaw",
  "label": "Supersaw",
  "icon": "🌟",
  "accent": "#ffd400",
  "domain": ["music", "synthesis", "lead", "edm"],
  "description": "7-voice detuned sawtooth unison lead/pluck synth. The classic EDM supersaw stack — wide, bright, festival-lead sound. One-shot trigger or sustained hold.",
  "permissions": ["audio_out", "midi_in", "bus_publish", "bus_subscribe"],
  "provides": ["capability.audio_out", "capability.lead_voice"],
  "requires": ["capability.audio_context"],
  "dependencies": {
    "runtime": ["kernel/kernel.js"],
    "browser_apis": ["Web Audio API (OscillatorNode, GainNode, BiquadFilterNode)"],
    "external_libs": []
  },
  "hooks": [
    { "hook_id": "supersaw.hook.trig_in",   "direction": "in",  "event_type": "pad:trigger",  "contract_version": "1.0.0" },
    { "hook_id": "supersaw.hook.midi_in",   "direction": "in",  "event_type": "midi:note",    "contract_version": "1.0.0" },
    { "hook_id": "supersaw.hook.audio_out", "direction": "out", "event_type": "audio:signal", "contract_version": "1.0.0" }
  ],
  "params": {
    "pitch":    { "type": "int",   "min": 24,  "max": 96,   "default": 60,   "unit": "MIDI note" },
    "voices":   { "type": "int",   "min": 3,   "max": 7,    "default": 7,    "unit": "" },
    "detune":   { "type": "float", "min": 0,   "max": 50,   "default": 18,   "unit": "cents" },
    "spread":   { "type": "float", "min": 0,   "max": 1,    "default": 0.6,  "unit": "" },
    "cutoff":   { "type": "float", "min": 200, "max": 12000,"default": 5000, "unit": "Hz" },
    "attack":   { "type": "float", "min": 0,   "max": 1,    "default": 0.01, "unit": "s" },
    "decay":    { "type": "float", "min": 0.05,"max": 3,    "default": 0.6,  "unit": "s" }
  }
}

---

# organisms/supersaw/supersaw.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: SUPERSAW  v1.0.0
   id: eravos.supersaw

   7-voice detuned sawtooth unison through a lowpass filter.
   Classic festival/EDM lead stack. Voices spread across the
   stereo field via per-voice panners. One-shot trigger or
   sustained hold (start/stop).
   ═══════════════════════════════════════════════════════════ */

window.SupersawEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    pitch:  config.pitch  || 60,
    voices: config.voices || 7,
    detune: config.detune != null ? config.detune : 18,
    spread: config.spread != null ? config.spread : 0.6,
    cutoff: config.cutoff || 5000,
    attack: config.attack != null ? config.attack : 0.01,
    decay:  config.decay  || 0.6,
    active: false,
  };

  let _nodes = null; /* sustained voice set, when active */

  function _midiToHz(note) { return 440 * Math.pow(2, (note - 69) / 12); }

  function _buildStack(AC, freq, gainNode) {
    const filt = AC.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = _params.cutoff;
    filt.Q.value = 0.7;
    filt.connect(gainNode);

    const n = _params.voices;
    const oscs = [];
    for (let i = 0; i < n; i++) {
      const o = AC.createOscillator();
      o.type = 'sawtooth';
      /* Spread detune symmetrically across voices: center voice = 0 detune */
      const pos = n === 1 ? 0 : (i / (n - 1)) * 2 - 1; /* -1..1 */
      o.detune.value = pos * _params.detune;
      o.frequency.value = freq;

      const pan = AC.createStereoPanner ? AC.createStereoPanner() : null;
      if (pan) { pan.pan.value = pos * _params.spread; o.connect(pan); pan.connect(filt); }
      else       { o.connect(filt); }

      oscs.push(o);
    }
    return { oscs, filt };
  }

  function _trigger(vel = 1) {
    const AC = audio.boot();
    const t  = AC.currentTime + 0.01;
    const freq = _midiToHz(_params.pitch);

    const g = AC.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel * 0.55, t + Math.max(0.005, _params.attack));
    g.gain.exponentialRampToValueAtTime(0.001, t + _params.attack + _params.decay);

    const { oscs, filt } = _buildStack(AC, freq, g);
    audio.send(g, true, false, true);

    oscs.forEach(o => { o.start(t); o.stop(t + _params.attack + _params.decay + 0.1); });

    sBus.publish('org:triggered', { freq, vel });
    gBus.publish('audio:signal', { instanceId, source: 'supersaw' });
  }

  function _start() {
    if (_nodes) return;
    const AC = audio.boot();
    const freq = _midiToHz(_params.pitch);
    const g = AC.createGain();
    g.gain.setValueAtTime(0, AC.currentTime);
    g.gain.linearRampToValueAtTime(0.5, AC.currentTime + Math.max(0.005, _params.attack));

    const { oscs, filt } = _buildStack(AC, freq, g);
    audio.send(g, true, false, true);
    oscs.forEach(o => o.start());

    _nodes = { oscs, filt, g };
    _params.active = true;
    sBus.publish('org:state_sync', { active: true, params: { ..._params } });
    gBus.publish('audio:signal', { instanceId, source: 'supersaw' });
  }

  function _stop() {
    if (!_nodes) return;
    const AC = audio.boot();
    const { oscs, g } = _nodes;
    g.gain.setTargetAtTime(0, AC.currentTime, 0.05);
    oscs.forEach(o => { try { o.stop(AC.currentTime + 0.2); } catch (e) {} });
    _nodes = null;
    _params.active = false;
    sBus.publish('org:state_sync', { active: false });
  }

  function _updateParam(key, val) {
    _params[key] = val;
    if (_nodes && key === 'cutoff') _nodes.filt.frequency.setTargetAtTime(val, audio.AC.currentTime, 0.02);
  }

  function _syncUI() {
    sBus.publish('org:state_sync', { active: _params.active, params: { ..._params } });
  }

  const _unsubs = [
    gBus.subscribe('ui:supersaw_trigger:' + instanceId, ({ vel }) => _trigger(vel || 1)),
    gBus.subscribe('ui:supersaw_toggle:'  + instanceId, () => _params.active ? _stop() : _start()),
    gBus.subscribe('ui:config_change:'    + instanceId, ({ key, value }) => _updateParam(key, value)),
    gBus.subscribe('pad:trigger', ({ sound }) => { if (sound === 'supersaw') _trigger(0.9); }),
    gBus.subscribe('midi:note',  ({ note, velocity, on }) => {
      if (on === false) return;
      _params.pitch = note;
      _trigger((velocity || 100) / 127);
    }),
  ];

  _syncUI();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.supersaw',
    label:    'Supersaw',
    provides: ['capability.audio_out', 'capability.lead_voice'],
    requires: ['capability.audio_context'],
    permissions: ['audio_out', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'supersaw.hook.trig_in',   direction: 'in',  event_type: 'pad:trigger',  contract_version: '1.0.0' },
      { hook_id: 'supersaw.hook.audio_out', direction: 'out', event_type: 'audio:signal', contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() { _stop(); _unsubs.forEach(u => u()); KERNEL.registry.unregister(instanceId); },
    trigger: _trigger, start: _start, stop: _stop,
    get params() { return { ..._params }; },
  };
}

return { mount };
})();

---

# organisms/timeline/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.timeline",
  "label": "Timeline",
  "icon": "\ud83d\udcfc",
  "accent": "#00d4ff",
  "domain": [
    "music",
    "arrangement",
    "composition"
  ],
  "description": "Multi-lane audio arrangement timeline. Drag clips. Zoom. Waveform display.",
  "permissions": [
    "audio_out",
    "audio_in",
    "bus_publish",
    "bus_subscribe",
    "filesystem_read"
  ],
  "provides": [
    "capability.timeline",
    "capability.clip_store",
    "capability.seek"
  ],
  "requires": [
    "capability.audio_context"
  ],
  "hooks": [
    {
      "hook_id": "tl.hook.transport_in",
      "direction": "in",
      "event_type": "seq:play",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "tl.hook.stop_in",
      "direction": "in",
      "event_type": "seq:stop",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "tl.hook.clip_play_out",
      "direction": "out",
      "event_type": "timeline:clip_play",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "px_per_sec": {
      "type": "float",
      "min": 20,
      "max": 400,
      "default": 80,
      "unit": "px/s"
    }
  },
  "ui": {
    "type": "horizontal_timeline",
    "lanes": "dynamic",
    "waveform": true
  }
}

---

# organisms/timeline/timeline.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: TIMELINE  v3.1.0
   ═══════════════════════════════════════════════════════════ */
window.TimelineOrganism = (() => {
'use strict';

function mount(instanceId, sBus, audio, clock, config = {}) {
  const gBus = KERNEL.bus;
  let pxPerSec = 80, offset = 0, cursor = 0;
  let playing = false, startedAt = 0, cursorAtPlay = 0, _timer = null;
  let _lanes = [], _clipCount = 0;
  function _uid() { return Math.random().toString(36).slice(2,9); }

  function _addLane(opts) {
    const { name='Track', icon='♪', color='#00d4ff' } = opts;
    const laneId = 'lane-' + _uid();
    _lanes.push({ laneId, name, icon, color, clips: [] });
    _syncUI(); return laneId;
  }

  function _addClip(laneId, opts) {
    const lane = _lanes.find(l => l.laneId === laneId); if (!lane) return null;
    const clipId = 'clip-' + _uid();
    const { name, icon='♪', startSec=0, durSec=4, assetId=null } = opts;
    lane.clips.push({ clipId, name: name||lane.name, icon, startSec, durSec, assetId });
    _clipCount++;
    sBus.publish('org:clip_added', { clipId, laneId, startSec, durSec, name });
    return clipId;
  }

  function _play() {
    if (!audio.AC) return;
    playing=true; startedAt=audio.AC.currentTime; cursorAtPlay=cursor;
    gBus.publish('seq:play',{BPM:clock.BPM});
    sBus.publish('org:state_sync',{playing:true});
    _tick();
  }

  function _stop() {
    playing=false; clearTimeout(_timer); cursor=0; cursorAtPlay=0;
    gBus.publish('seq:stop',{});
    sBus.publish('org:state_sync',{playing:false,position_sec:0});
    _emitPH();
  }

  function _tick() {
    if (!playing) return;
    cursor = cursorAtPlay + (audio.AC.currentTime - startedAt);
    _emitPH();
    _timer = setTimeout(_tick, 16);
  }

  function _emitPH() {
    const t=cursor, beatSec=60/clock.BPM, bar=Math.floor(t/(beatSec*4))+1, beat=Math.floor((t%(beatSec*4))/beatSec)+1;
    sBus.publish('org:playhead_update',{position_sec:t,bar,beat,pxPerSec,offset});
  }

  function _syncUI() {
    sBus.publish('org:clip_sync',{
      lanes: _lanes.map(l=>({laneId:l.laneId,name:l.name,icon:l.icon,color:l.color})),
      clips: _lanes.flatMap(l=>l.clips.map(c=>({...c,laneId:l.laneId}))),
      pxPerSec, offset, cursor, bpm: clock.BPM,
    });
  }

  const _unsubs = [
    gBus.subscribe('ui:play_press:'+instanceId,  ()=>playing?_stop():_play()),
    gBus.subscribe('ui:ruler_click:'+instanceId, ({position_sec})=>{cursor=Math.max(0,position_sec);cursorAtPlay=cursor;_emitPH();}),
    gBus.subscribe('ui:zoom_change:'+instanceId, ({px_per_sec})=>{pxPerSec=Math.max(20,Math.min(400,px_per_sec));_syncUI();}),
    gBus.subscribe('ui:clip_place:'+instanceId,  ({laneId,position_sec,assetId,name})=>_addClip(laneId,{startSec:position_sec,name,assetId})),
    gBus.subscribe('ui:clip_move:'+instanceId,   ({clipId,position_sec})=>{_lanes.forEach(l=>{const c=l.clips.find(c=>c.clipId===clipId);if(c)c.startSec=Math.max(0,position_sec);});}),
    gBus.subscribe('ui:clip_remove:'+instanceId, ({clipId})=>{_lanes.forEach(l=>{l.clips=l.clips.filter(c=>c.clipId!==clipId);});sBus.publish('org:clip_removed',{clipId});}),
    gBus.subscribe('ui:lane_add:'+instanceId,    opts=>_addLane(opts)),
    gBus.subscribe('ui:lane_remove:'+instanceId, ({laneId})=>{_lanes=_lanes.filter(l=>l.laneId!==laneId);_syncUI();}),
    gBus.subscribe('intake:file', result=>{
      if(result.id==='audio:sample'){
        const laneId=_addLane({name:result.name,icon:'🎵',color:'#00d4ff'});
        _addClip(laneId,{startSec:cursor,name:result.name,durSec:4,assetId:result.hash});
        sBus.publish('org:asset_loaded',{laneId,assetId:result.hash,arrayBuffer:result.arrayBuffer,name:result.name});
      }
    }),
    gBus.subscribe('seq:play',()=>{if(!playing)_play();}),
    gBus.subscribe('seq:stop',()=>{if(playing)_stop();}),
  ];

  const _keyHandler = ev => {
    if(ev.target.tagName==='SELECT'||ev.target.tagName==='INPUT') return;
    if(ev.code==='Space'){ev.preventDefault();playing?_stop():_play();}
  };
  document.addEventListener('keydown', _keyHandler);

  _syncUI();

  KERNEL.registry.register({
    instanceId, id:'eravos.timeline', label:'Timeline',
    provides:['capability.timeline','capability.clip_store','capability.seek'],
    requires:['capability.audio_context'],
    permissions:['audio_out','audio_in','bus_publish','bus_subscribe','filesystem_read'],
    hooks:[
      {hook_id:'tl.hook.transport_in', direction:'in',  event_type:'seq:play',           contract_version:'1.0.0'},
      {hook_id:'tl.hook.stop_in',      direction:'in',  event_type:'seq:stop',           contract_version:'1.0.0'},
      {hook_id:'tl.hook.seek_out',     direction:'out', event_type:'timeline:seek',      contract_version:'1.0.0'},
      {hook_id:'tl.hook.clip_play_out',direction:'out', event_type:'timeline:clip_play', contract_version:'1.0.0'},
    ],
  });

  return {
    unmount(){_stop();_unsubs.forEach(u=>u());document.removeEventListener('keydown',_keyHandler);KERNEL.registry.unregister(instanceId);},
    play:_play, stop:_stop, addLane:_addLane, syncUI:_syncUI,
  };
}
return { mount };
})();

/* ── RECORDING extension — appended to timeline engine ──────
   Listens for transport:recorded and creates a new lane+clip
   with the captured buffer. Also listens to transport:play/stop
   to sync with master transport.                              */
(function _patchTimelineRecording() {
  const gBus = KERNEL.bus;

  gBus.subscribe('transport:recorded', ({ arrayBuffer, duration, mimeType }) => {
    /* Find any mounted timeline instance and give it the recording */
    const timelines = KERNEL.registry.getById('eravos.timeline');
    if (!timelines.length) return;
    /* Route to the first timeline that's alive */
    const tl = timelines[0];
    gBus.publish('intake:file', {
      id:          'audio:sample',
      name:        `recording_${new Date().toISOString().slice(11,19)}.webm`,
      arrayBuffer,
      hash:        Math.random().toString(36).slice(2),
      mimeType,
      icon:        '⏺',
      sizeBytes:   arrayBuffer.byteLength,
      file:        null,
    });
  });

  gBus.subscribe('transport:play', ({ BPM }) => {
    KERNEL.clock.BPM = BPM;
  });
})();

---

# organisms/nexus-guardian/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.nexus-guardian",
  "label": "NEXUS_GUARDIAN",
  "icon": "🛡️",
  "accent": "#ffaa00",
  "domain": ["diagnostic", "monitoring", "nexus"],
  "description": "Live status card for NEXUS NEXUS_GUARDIAN (port 7820). Polling is driven by the global transport (play/stop), not its own clock. Diagnose routes through the Orchestrator.",
  "permissions": ["network_fetch", "bus_publish", "bus_subscribe"],
  "provides": ["capability.nexus_diagnostic"],
  "requires": [],
  "hooks": [
    { "hook_id": "nn.hook.bus_out", "direction": "out", "event_type": "org:state_sync", "contract_version": "1.0.0" }
  ],
  "params": {
    "statusPath":    { "type": "string", "default": "/api/status" },
    "snapshotsPath": { "type": "string", "default": "/snapshots" },
    "diagnosePath":  { "type": "string", "default": "/diagnose" }
  },
  "ui": { "type": "nexus_diagnostic_card" }
}

---

# organisms/nexus-guardian/nexus-guardian.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: NEXUS_GUARDIAN  v1.0.0
   id: eravos.nexus-guardian

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusGuardianEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'guardian',
    label: 'NEXUS_GUARDIAN',
    icon: '🛡️',
    accent: '#ffaa00',
    base: 'http://127.0.0.1:7820',
    statusPath: '/api/status',
    snapshotsPath: '/snapshots',
    orchestratorBase: 'http://127.0.0.1:9000',
    diagnosePath: '/diagnose',
    idLink: 'http://127.0.0.1:4800',
    isOrchestrator: false,
    ...config,
  });
}

return { mount };
})();

---

# organisms/nexus-orchestrator/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.nexus-orchestrator",
  "label": "ORCHESTRATOR",
  "icon": "🌐",
  "accent": "#ff2266",
  "domain": ["diagnostic", "monitoring", "nexus"],
  "description": "Live status card for NEXUS ORCHESTRATOR (port 9000). Polling is driven by the global transport (play/stop), not its own clock. Diagnose routes through the Orchestrator.",
  "permissions": ["network_fetch", "bus_publish", "bus_subscribe"],
  "provides": ["capability.nexus_diagnostic"],
  "requires": [],
  "hooks": [
    { "hook_id": "nn.hook.bus_out", "direction": "out", "event_type": "org:state_sync", "contract_version": "1.0.0" }
  ],
  "params": {
    "statusPath":    { "type": "string", "default": "/api/status" },
    "snapshotsPath": { "type": "string", "default": "/snapshots" },
    "diagnosePath":  { "type": "string", "default": "/diagnose" }
  },
  "ui": { "type": "nexus_diagnostic_card" }
}

---

# organisms/nexus-orchestrator/nexus-orchestrator.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: ORCHESTRATOR  v1.0.0
   id: eravos.nexus-orchestrator

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusOrchestratorEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'orchestrator',
    label: 'ORCHESTRATOR',
    icon: '🌐',
    accent: '#ff2266',
    base: 'http://127.0.0.1:9000',
    statusPath: '/api/status',
    snapshotsPath: '/snapshots',
    orchestratorBase: 'http://127.0.0.1:9000',
    diagnosePath: '/diagnose',
    idLink: 'http://127.0.0.1:4800',
    isOrchestrator: true,
    ...config,
  });
}

return { mount };
})();

---

# organisms/edm-lab/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.edm-lab",
  "label": "EDM Lab",
  "icon": "\u26a1",
  "accent": "#ff2266",
  "domain": [
    "music",
    "synthesis",
    "bass",
    "electronic"
  ],
  "description": "Three concurrent engines: Bass filter visualiser, Rhythm density canvas, Tension dissonance dial. Drop trigger fires all.",
  "permissions": [
    "audio_out",
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.audio_out"
  ],
  "requires": [
    "capability.audio_context"
  ],
  "hooks": [
    {
      "hook_id": "edm.hook.audio_out",
      "direction": "out",
      "event_type": "audio:signal",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "edm.hook.drop_out",
      "direction": "out",
      "event_type": "edm:drop-fired",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "edm.hook.step_out",
      "direction": "out",
      "event_type": "edm:rhythm-step",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "bpm": {
      "type": "int",
      "min": 60,
      "max": 220,
      "default": 128,
      "unit": "BPM"
    },
    "bass_freq": {
      "type": "float",
      "min": 20,
      "max": 220,
      "default": 55,
      "unit": "Hz"
    },
    "bass_cutoff": {
      "type": "float",
      "min": 80,
      "max": 4000,
      "default": 600,
      "unit": "Hz"
    },
    "lfo_rate": {
      "type": "float",
      "min": 0.1,
      "max": 16,
      "default": 4,
      "unit": "Hz"
    },
    "tension": {
      "type": "float",
      "min": 0,
      "max": 100,
      "default": 0,
      "unit": "%"
    }
  },
  "ui": {
    "type": "three_column_lab",
    "sections": [
      "bass_engine",
      "rhythm_engine",
      "tension_engine"
    ]
  },
  "nexus_build_hints": {
    "engine_pattern": "multi_engine_lab",
    "engines": 3
  }
}

---

# organisms/edm-lab/edm-lab.engine.js

/* ═══════════════════════════════════════════════════════════
   ERAVOS EDM LAB ENGINE  v2.0.0
   id: eravos.edm-lab

   Three concurrent engines:
     BASS    — oscillator + LFO filter, plays continuously
     RHYTHM  — density-painted UKG kit, internal clock
     TENSION — harmonic dissonance stack, filter squeeze

   Drop trigger fires all three simultaneously with impact.
   State published to UI via sBus for visualisation.
   ═══════════════════════════════════════════════════════════ */

window.EDMLabEngine = (() => {
'use strict';

/* ── Waveshaper distortion ──────────────────────────────── */
function _dist(AC, amt = 0.5) {
  const s = AC.createWaveShaper();
  const n = 256, c = new Float32Array(n), k = amt * 100;
  for (let i = 0; i < n; i++) { const x = (i*2)/n-1; c[i]=((Math.PI+k)*x)/(Math.PI+k*Math.abs(x)); }
  s.curve = c; s.oversample = '4x'; return s;
}

/* ═══════════════════════════════════════════════════════
   BASS ENGINE
   Continuous oscillator + resonant filter controlled by LFO.
   Parameters: freq, cutoff, resonance, lfoRate, lfoDepth,
               drive, waveform, subLevel.
   Publishes filter position every frame for visualisation.
═══════════════════════════════════════════════════════ */
function BassEngine(AC, masterOut) {
  let _running = false;
  let _nodes = {};
  let _params = { freq:55, cutoff:600, res:8, lfoRate:4, lfoDepth:800, drive:0.5, wave:'sawtooth', subLevel:0.6 };
  let _filterPos = 0.5; /* 0-1 for UI */
  let _rafId = null;

  function start() {
    if (_running) return;
    _running = true;

    const o1  = AC.createOscillator(); o1.type = _params.wave; o1.frequency.value = _params.freq;
    const o2  = AC.createOscillator(); o2.type = _params.wave; o2.frequency.value = _params.freq * 1.006;
    const sub = AC.createOscillator(); sub.type = 'sine';      sub.frequency.value = _params.freq * 0.5;
    const lfo = AC.createOscillator(); lfo.type = 'sine';      lfo.frequency.value = _params.lfoRate;
    const lfoG = AC.createGain();       lfoG.gain.value = _params.lfoDepth;
    const filt = AC.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = _params.cutoff; filt.Q.value = _params.res;
    const dist = _dist(AC, _params.drive);
    const gMain = AC.createGain(); gMain.gain.value = 0.7;
    const gSub  = AC.createGain(); gSub.gain.value  = _params.subLevel * 0.6;

    lfo.connect(lfoG); lfoG.connect(filt.frequency);
    o1.connect(dist); o2.connect(dist); dist.connect(filt); filt.connect(gMain);
    sub.connect(gSub);
    gMain.connect(masterOut); gSub.connect(masterOut);

    [o1, o2, sub, lfo].forEach(n => n.start());
    _nodes = { o1, o2, sub, lfo, lfoG, filt, dist, gMain, gSub };

    /* Track filter position for UI */
    function trackFilter() {
      if (!_running) return;
      /* filt.frequency is modulated — read approximate position */
      const min = Math.max(20, _params.cutoff - _params.lfoDepth);
      const max = Math.min(20000, _params.cutoff + _params.lfoDepth);
      /* Smooth approximation using AC time */
      const phase = (AC.currentTime * _params.lfoRate * Math.PI * 2) % (Math.PI * 2);
      const raw = _params.cutoff + Math.sin(phase) * _params.lfoDepth;
      _filterPos = Math.max(0, Math.min(1, (raw - 20) / (20000 - 20)));
      _rafId = requestAnimationFrame(trackFilter);
    }
    trackFilter();
  }

  function stop() {
    if (!_running) return;
    _running = false;
    cancelAnimationFrame(_rafId);
    Object.values(_nodes).forEach(n => { try { if (n.stop) n.stop(0); n.disconnect(); } catch(e){} });
    _nodes = {};
  }

  function set(key, val) {
    _params[key] = val;
    if (!_running) return;
    const { o1, o2, sub, lfo, lfoG, filt, dist, gSub } = _nodes;
    if (key === 'freq'     && o1) { o1.frequency.value = val; o2.frequency.value = val*1.006; sub.frequency.value = val*0.5; }
    if (key === 'cutoff'   && filt) filt.frequency.setTargetAtTime(val, AC.currentTime, 0.02);
    if (key === 'res'      && filt) filt.Q.setTargetAtTime(val, AC.currentTime, 0.02);
    if (key === 'lfoRate'  && lfo) lfo.frequency.setTargetAtTime(val, AC.currentTime, 0.02);
    if (key === 'lfoDepth' && lfoG) lfoG.gain.setTargetAtTime(val, AC.currentTime, 0.02);
    if (key === 'subLevel' && gSub) gSub.gain.setTargetAtTime(val * 0.6, AC.currentTime, 0.02);
  }

  function impact(t) {
    /* Hard filter close → snap open on the drop */
    const { filt } = _nodes; if (!filt) return;
    filt.frequency.setValueAtTime(80, t);
    filt.frequency.exponentialRampToValueAtTime(_params.cutoff * 3, t + 0.04);
    filt.frequency.exponentialRampToValueAtTime(_params.cutoff, t + 0.4);
  }

  return { start, stop, set, impact, get filterPos() { return _filterPos; }, get params() { return _params; }, get running() { return _running; } };
}

/* ═══════════════════════════════════════════════════════
   RHYTHM ENGINE
   Internal clock. Density map: 8 kit pieces × 32 positions.
   Each cell has a density value 0–1.
   On each 16th note, fires if Math.random() < density[track][step].
   This produces probabilistic rhythm, not deterministic steps.
   Publishes beat events for UI cursor.
═══════════════════════════════════════════════════════ */
const KIT_NAMES = ['KICK','SNARE','GALLOP','GALLOP2','OPEN HAT','CLAP','808','RISER'];
const KIT_COLORS = ['#00ff88','#00ff88','#00d4ff','#00d4ff','#6a88a8','#00ff88','#ff2266','#aa44ff'];

function RhythmEngine(AC, masterOut, bus) {
  let _running = false;
  let _step    = 0;
  let _timer   = null;
  let _bpm     = 128;
  const STEPS  = 32;
  const TRACKS = 8;

  /* Density map — float32 0-1 per cell */
  const density = Array.from({ length: TRACKS }, (_, ti) => {
    const row = new Float32Array(STEPS).fill(0);
    /* Default patterns */
    if (ti === 0) { row[0]=.9; row[8]=.9; row[16]=.9; row[24]=.9; }
    if (ti === 1) { row[4]=.85; row[12]=.85; row[20]=.85; row[28]=.85; }
    if (ti === 2) { [0,2,3,6,8,10,11,14,16,18,19,22,24,26,27,30].forEach(s=>row[s]=.7); }
    if (ti === 3) { [1,5,9,13,17,21,25,29].forEach(s=>row[s]=.4); }
    return row;
  });

  function _fireKit(track, vel) {
    const t = AC.currentTime + 0.01;
    switch(track) {
      case 0: { /* KICK */
        const g=AC.createGain(),o=AC.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(160,t); o.frequency.exponentialRampToValueAtTime(40,t+0.18); g.gain.setValueAtTime(vel*1.2,t); g.gain.exponentialRampToValueAtTime(.001,t+0.22); o.connect(g); g.connect(masterOut); o.start(t); o.stop(t+.25); break; }
      case 1: { /* SNARE */
        const nb=AC.createBufferSource(),buf=AC.createBuffer(1,Math.ceil(AC.sampleRate*.18),AC.sampleRate),d=buf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1; nb.buffer=buf; const nf=AC.createBiquadFilter(); nf.type='bandpass'; nf.frequency.value=2000; nf.Q.value=0.9; const ng=AC.createGain(); ng.gain.setValueAtTime(vel*.85,t); ng.gain.exponentialRampToValueAtTime(.001,t+.18); nb.connect(nf); nf.connect(ng); ng.connect(masterOut); nb.start(t); nb.stop(t+.2); break; }
      case 2: case 3: { /* GALLOP HAT */
        const nb=AC.createBufferSource(),buf=AC.createBuffer(1,Math.ceil(AC.sampleRate*.03),AC.sampleRate),d=buf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1; nb.buffer=buf; const nf=AC.createBiquadFilter(); nf.type='highpass'; nf.frequency.value=9000; const ng=AC.createGain(); ng.gain.setValueAtTime(vel*(track===2?.48:.3),t); ng.gain.exponentialRampToValueAtTime(.001,t+.03); nb.connect(nf); nf.connect(ng); ng.connect(masterOut); nb.start(t); nb.stop(t+.04); break; }
      case 4: { /* OPEN HAT */
        const nb=AC.createBufferSource(),buf=AC.createBuffer(1,Math.ceil(AC.sampleRate*.34),AC.sampleRate),d=buf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1; nb.buffer=buf; const nf=AC.createBiquadFilter(); nf.type='highpass'; nf.frequency.value=7000; const ng=AC.createGain(); ng.gain.setValueAtTime(vel*.44,t); ng.gain.exponentialRampToValueAtTime(.001,t+.34); nb.connect(nf); nf.connect(ng); ng.connect(masterOut); nb.start(t); nb.stop(t+.38); break; }
      case 5: { /* CLAP */
        [0,.01,.022].forEach(d=>{ const nb=AC.createBufferSource(),buf=AC.createBuffer(1,Math.ceil(AC.sampleRate*.1),AC.sampleRate),dd=buf.getChannelData(0); for(let i=0;i<dd.length;i++)dd[i]=Math.random()*2-1; nb.buffer=buf; const nf=AC.createBiquadFilter(); nf.type='bandpass'; nf.frequency.value=1500; nf.Q.value=1.1; const ng=AC.createGain(); ng.gain.setValueAtTime(vel*.68,t+d); ng.gain.exponentialRampToValueAtTime(.001,t+d+.1); nb.connect(nf); nf.connect(ng); ng.connect(masterOut); nb.start(t+d); nb.stop(t+d+.12); }); break; }
      case 6: { /* 808 */
        const o=AC.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(110,t); o.frequency.exponentialRampToValueAtTime(55*.85,t+.06); const g=AC.createGain(); g.gain.setValueAtTime(vel*.95,t); g.gain.exponentialRampToValueAtTime(.001,t+.6); const clip=AC.createWaveShaper(); const cv=new Float32Array(256); for(let i=0;i<256;i++){const x=(i*2)/256-1;cv[i]=Math.max(-.7,Math.min(.7,x*2))/.7;} clip.curve=cv; o.connect(clip); clip.connect(g); g.connect(masterOut); o.start(t); o.stop(t+.65); break; }
      case 7: { /* RISER TEXTURE */
        const o=AC.createOscillator(); o.type='sawtooth'; o.frequency.value=440+Math.random()*220; const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=2000; const g=AC.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vel*.15,t+.04); g.gain.exponentialRampToValueAtTime(.001,t+.12); o.connect(f); f.connect(g); g.connect(masterOut); o.start(t); o.stop(t+.15); break; }
    }
  }

  /* PrecisionClock replaces setTimeout — audio-thread scheduling */
  let _pclock = null;

  async function _bootClock() {
    if (_pclock) return;
    _pclock = new PrecisionClock(AC);
    await _pclock.boot();
    _pclock.onStep = (stepIdx, t) => {
      /* t is a precise future AudioContext time — schedule synthesis there */
      for (let ti = 0; ti < TRACKS; ti++) {
        const d = density[ti][stepIdx];
        if (d > 0 && Math.random() < d) {
          _fireKitAt(ti, 0.7 + Math.random() * 0.3, t);
        }
      }
      bus.publish('edm:rhythm-step', {
        step: stepIdx,
        density: Array.from({ length: TRACKS }, (_, ti) => density[ti][stepIdx]),
      });
      _step = stepIdx;
    };
  }

  /* _fireKitAt: same as _fireKit but uses precise time t instead of AC.currentTime+0.01 */
  function _fireKitAt(track, vel, t) {
    switch(track) {
      case 0: { const g=AC.createGain(),o=AC.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(160,t); o.frequency.exponentialRampToValueAtTime(40,t+0.18); g.gain.setValueAtTime(vel*1.2,t); g.gain.exponentialRampToValueAtTime(.001,t+0.22); o.connect(g); g.connect(masterOut); o.start(t); o.stop(t+.25); break; }
      case 1: { const nb=AC.createBufferSource(),buf=AC.createBuffer(1,Math.ceil(AC.sampleRate*.18),AC.sampleRate),d=buf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1; nb.buffer=buf; const nf=AC.createBiquadFilter(); nf.type='bandpass'; nf.frequency.value=2000; nf.Q.value=0.9; const ng=AC.createGain(); ng.gain.setValueAtTime(vel*.85,t); ng.gain.exponentialRampToValueAtTime(.001,t+.18); nb.connect(nf); nf.connect(ng); ng.connect(masterOut); nb.start(t); nb.stop(t+.2); break; }
      case 2: case 3: { const nb=AC.createBufferSource(),buf=AC.createBuffer(1,Math.ceil(AC.sampleRate*.03),AC.sampleRate),d=buf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1; nb.buffer=buf; const nf=AC.createBiquadFilter(); nf.type='highpass'; nf.frequency.value=9000; const ng=AC.createGain(); ng.gain.setValueAtTime(vel*(track===2?.48:.3),t); ng.gain.exponentialRampToValueAtTime(.001,t+.03); nb.connect(nf); nf.connect(ng); ng.connect(masterOut); nb.start(t); nb.stop(t+.04); break; }
      case 4: { const nb=AC.createBufferSource(),buf=AC.createBuffer(1,Math.ceil(AC.sampleRate*.34),AC.sampleRate),d=buf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1; nb.buffer=buf; const nf=AC.createBiquadFilter(); nf.type='highpass'; nf.frequency.value=7000; const ng=AC.createGain(); ng.gain.setValueAtTime(vel*.44,t); ng.gain.exponentialRampToValueAtTime(.001,t+.34); nb.connect(nf); nf.connect(ng); ng.connect(masterOut); nb.start(t); nb.stop(t+.38); break; }
      case 5: { [0,.01,.022].forEach(d=>{ const nb=AC.createBufferSource(),buf=AC.createBuffer(1,Math.ceil(AC.sampleRate*.1),AC.sampleRate),dd=buf.getChannelData(0); for(let i=0;i<dd.length;i++)dd[i]=Math.random()*2-1; nb.buffer=buf; const nf=AC.createBiquadFilter(); nf.type='bandpass'; nf.frequency.value=1500; nf.Q.value=1.1; const ng=AC.createGain(); ng.gain.setValueAtTime(vel*.68,t+d); ng.gain.exponentialRampToValueAtTime(.001,t+d+.1); nb.connect(nf); nf.connect(ng); ng.connect(masterOut); nb.start(t+d); nb.stop(t+d+.12); }); break; }
      case 6: { const o=AC.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(110,t); o.frequency.exponentialRampToValueAtTime(55*.85,t+.06); const g=AC.createGain(); g.gain.setValueAtTime(vel*.95,t); g.gain.exponentialRampToValueAtTime(.001,t+.6); const clip=AC.createWaveShaper(); const cv=new Float32Array(256); for(let i=0;i<256;i++){const x=(i*2)/256-1;cv[i]=Math.max(-.7,Math.min(.7,x*2))/.7;} clip.curve=cv; o.connect(clip); clip.connect(g); g.connect(masterOut); o.start(t); o.stop(t+.65); break; }
      case 7: { const o=AC.createOscillator(); o.type='sawtooth'; o.frequency.value=440+Math.random()*220; const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=2000; const g=AC.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vel*.15,t+.04); g.gain.exponentialRampToValueAtTime(.001,t+.12); o.connect(f); f.connect(g); g.connect(masterOut); o.start(t); o.stop(t+.15); break; }
    }
  }

  async function start() {
    if (_running) return;
    _running = true; _step = 0;
    await _bootClock();
    _pclock.start(_bpm, STEPS, 4, 0);
  }
  function stop() {
    _running = false;
    if (_pclock) _pclock.stop();
    _step = 0;
  }

  function setDensity(track, step, val) {
    if (density[track]) density[track][step] = Math.max(0, Math.min(1, val));
  }

  function getDensityMap() {
    return Array.from({ length: TRACKS }, (_, ti) => Array.from(density[ti]));
  }

  function paintBrush(track, step, radius, val) {
    /* Paint with falloff around (track, step) */
    for (let ti = Math.max(0, track-1); ti <= Math.min(TRACKS-1, track+1); ti++) {
      for (let si = Math.max(0, step-radius); si <= Math.min(STEPS-1, step+radius); si++) {
        const dist = Math.hypot(ti-track, si-step);
        const falloff = Math.max(0, 1 - dist / (radius + 1));
        density[ti][si] = Math.max(0, Math.min(1, density[ti][si] + val * falloff * 0.8));
      }
    }
  }

  function setBPM(bpm) { _bpm = Math.max(60, Math.min(220, bpm)); if (_pclock) _pclock.setBPM(_bpm); }

  return { start, stop, setDensity, getDensityMap, paintBrush, setBPM,
           get running() { return _running; }, get step() { return _step; },
           KIT_NAMES, KIT_COLORS, STEPS, TRACKS };
}

/* ═══════════════════════════════════════════════════════
   TENSION ENGINE
   Harmonic dissonance stack. Consonance=0 → Dissonance=100.
   Overtones spread apart as tension increases.
   Publishes overtone positions for visualisation.
═══════════════════════════════════════════════════════ */
function TensionEngine(AC, masterOut) {
  let _running  = false;
  let _tension  = 0; /* 0-100 */
  let _nodes    = [];
  let _masterG  = null;
  let _baseFreq = 110;

  /* Interval table: tension 0=consonant, 100=dissonant cluster */
  function _intervals(t) {
    /* t 0-1. At 0: octaves/fifths. At 1: semitone clusters. */
    const consonant = [1, 1.5, 2, 3, 4];           /* root, 5th, oct, oct+5th, 2oct */
    const dissonant = [1, 1.059, 1.122, 1.189, 1.414]; /* root, m2, M2, m3, tritone */
    return consonant.map((c, i) => c * (1-t) + dissonant[i] * t);
  }

  function start() {
    if (_running) return;
    _running = true;
    _masterG = AC.createGain(); _masterG.gain.value = 0;
    _masterG.connect(masterOut);
    _rebuild();
  }

  function _rebuild() {
    _nodes.forEach(n => { try { if(n.stop) n.stop(0); n.disconnect(); } catch(e){} });
    _nodes = [];
    if (!_running) return;

    const ratios = _intervals(_tension / 100);
    ratios.forEach((r, i) => {
      const o   = AC.createOscillator(); o.type = 'sawtooth';
      const lfo = AC.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.2 + i * 0.07;
      const lg  = AC.createGain(); lg.gain.value = _baseFreq * r * 0.003;
      const f   = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 800 - i * 80;
      const g   = AC.createGain(); g.gain.value = 0.12 / (i + 1);
      o.frequency.value = _baseFreq * r;
      lfo.connect(lg); lg.connect(o.frequency);
      o.connect(f); f.connect(g); g.connect(_masterG);
      [o, lfo].forEach(n => n.start());
      _nodes.push(o, lfo, lg, f, g);
    });
  }

  function setTension(val) {
    _tension = Math.max(0, Math.min(100, val));
    _rebuild();
  }

  function setLevel(val) {
    if (_masterG) _masterG.gain.setTargetAtTime(val * 0.4, AC.currentTime, 0.05);
  }

  function setBaseFreq(f) { _baseFreq = f; if (_running) _rebuild(); }

  function stop() {
    _running = false;
    _nodes.forEach(n => { try { if(n.stop) n.stop(0); n.disconnect(); } catch(e){} });
    _nodes = [];
    if (_masterG) { _masterG.gain.setTargetAtTime(0, AC.currentTime, 0.1); }
  }

  function impact(t) {
    /* Tension peaks then releases */
    if (!_masterG) return;
    _masterG.gain.setValueAtTime(_masterG.gain.value, t);
    _masterG.gain.linearRampToValueAtTime(0.6, t + 0.02);
    _masterG.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  }

  function getOvertones() {
    return _intervals(_tension / 100).map((r, i) => ({
      freq:      _baseFreq * r,
      ratio:     r,
      amplitude: 1 / (i + 1),
    }));
  }

  return { start, stop, setTension, setLevel, setBaseFreq, impact, getOvertones,
           get tension() { return _tension; }, get running() { return _running; } };
}

/* ═══════════════════════════════════════════════════════
   MOUNT
═══════════════════════════════════════════════════════ */
function mount(instanceId, sBus, audio, config = {}) {
  const gBus = KERNEL.bus;

  const AC = audio.boot();

  /* Shared master gain for all three engines */
  const masterGain = AC.createGain(); masterGain.gain.value = 0.85;
  audio.send(masterGain, false, false, true);

  const bass    = BassEngine(AC, masterGain);
  const rhythm  = RhythmEngine(AC, masterGain, gBus);
  const tension = TensionEngine(AC, masterGain);

  let _bpm = KERNEL.clock.BPM;
  rhythm.setBPM(_bpm);

  /* State sync loop — 30fps */
  let _syncTimer = setInterval(() => {
    sBus.publish('org:state-sync', {
      bass: {
        running:   bass.running,
        filterPos: bass.filterPos,
        params:    { ...bass.params },
      },
      rhythm: {
        running:    rhythm.running,
        step:       rhythm.step,
        densityMap: rhythm.getDensityMap(),
      },
      tension: {
        running:   tension.running,
        value:     tension.tension,
        overtones: tension.getOvertones(),
      },
      bpm: _bpm,
    });
  }, 33);

  /* ── Drop trigger ── */
  function _drop() {
    const t = AC.currentTime + 0.05;
    /* Impact synthesis */
    const subO = AC.createOscillator(); subO.type = 'sine';
    const subG = AC.createGain();
    subO.frequency.setValueAtTime(80, t); subO.frequency.exponentialRampToValueAtTime(30, t + .5);
    subG.gain.setValueAtTime(1.4, t); subG.gain.exponentialRampToValueAtTime(.001, t + .65);
    subO.connect(subG); subG.connect(masterGain); subO.start(t); subO.stop(t + .7);

    const nb = AC.createBufferSource();
    const buf = AC.createBuffer(1, Math.ceil(AC.sampleRate * .015), AC.sampleRate);
    const d = buf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    nb.buffer = buf;
    const nf = AC.createBiquadFilter(); nf.type='highpass'; nf.frequency.value=8000;
    const ng = AC.createGain(); ng.gain.setValueAtTime(1.1, t); ng.gain.exponentialRampToValueAtTime(.001, t+.015);
    nb.connect(nf); nf.connect(ng); ng.connect(masterGain); nb.start(t); nb.stop(t+.02);

    bass.impact(t);
    tension.impact(t);

    gBus.publish('edm:drop-fired', { timestamp: t });
    sBus.publish('org:drop-fired', { timestamp: t });
  }

  /* ── UI subscriptions ── */
  const _unsubs = [
    /* Bass */
    gBus.subscribe('ui:bass-toggle:' + instanceId, () => { bass.running ? bass.stop() : bass.start(); }),
    gBus.subscribe('ui:bass-param:' + instanceId,  ({ key, val }) => bass.set(key, val)),

    /* Rhythm */
    gBus.subscribe('ui:rhythm-toggle:' + instanceId, () => { rhythm.running ? rhythm.stop() : rhythm.start(); }),
    gBus.subscribe('ui:rhythm-paint:' + instanceId,  ({ track, step, radius, val }) => rhythm.paintBrush(track, step, radius, val)),
    gBus.subscribe('ui:rhythm-clear:' + instanceId,  ({ track }) => { if (track !== undefined) { for(let s=0;s<rhythm.STEPS;s++) rhythm.setDensity(track,s,0); } }),
    gBus.subscribe('ui:rhythm-preset:' + instanceId, ({ preset }) => _loadRhythmPreset(preset)),

    /* Tension */
    gBus.subscribe('ui:tension-toggle:' + instanceId, () => { tension.running ? tension.stop() : tension.start(); }),
    gBus.subscribe('ui:tension-val:' + instanceId,    ({ val }) => tension.setTension(val)),
    gBus.subscribe('ui:tension-level:' + instanceId,  ({ val }) => tension.setLevel(val)),
    gBus.subscribe('ui:tension-freq:' + instanceId,   ({ val }) => tension.setBaseFreq(val)),

    /* Drop + BPM */
    gBus.subscribe('ui:drop:' + instanceId, _drop),
    gBus.subscribe('ui:bpm:' + instanceId, ({ val }) => { _bpm = val; KERNEL.clock.BPM = val; rhythm.setBPM(val); }),
  ];

  function _loadRhythmPreset(preset) {
    const map = {
      'tranki': [[0,8,16,24],[4,12,20,28],[0,2,3,6,8,10,11,14],[1,5,9,13],[],[4,12],[],[],],
      'drop':   [[0,4,8,10,12],[4,12,28],[0,1,2,3,4,5,6,7],[8,16,24],[2,6,10,14],[4,12],[0,16],[],],
      'build':  [[0,8,16],[4,20],[0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30],[2,10,18,26],[],[],[0,8,16,24],[7,15,23,31],],
    };
    const pat = map[preset];
    if (!pat) return;
    for (let ti = 0; ti < rhythm.TRACKS; ti++) {
      for (let si = 0; si < rhythm.STEPS; si++) rhythm.setDensity(ti, si, 0);
      (pat[ti] || []).forEach(s => rhythm.setDensity(ti, s, 0.85));
    }
    sBus.publish('org:density-reset', { densityMap: rhythm.getDensityMap() });
  }

  KERNEL.registry.register({
    instanceId, id: 'eravos.edm-lab', label: 'EDM Lab',
    provides: ['capability.audio_out'],
    requires: ['capability.audio_context'],
    permissions: ['audio_out', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'edm.hook.audio_out',   direction: 'out', event_type: 'audio:signal',    contract_version: '1.0.0' },
      { hook_id: 'edm.hook.drop-out',    direction: 'out', event_type: 'edm:drop-fired',  contract_version: '1.0.0' },
      { hook_id: 'edm.hook.step-out',    direction: 'out', event_type: 'edm:rhythm-step', contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() {
      clearInterval(_syncTimer);
      bass.stop(); rhythm.stop(); tension.stop();
      _unsubs.forEach(u => u());
      KERNEL.registry.unregister(instanceId);
    },
    bass, rhythm, tension, drop: _drop,
  };
}

return { mount };
})();

---

# organisms/nexus-architect/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.nexus-architect",
  "label": "ARCHITECT",
  "icon": "📐",
  "accent": "#00ff88",
  "domain": ["diagnostic", "monitoring", "nexus"],
  "description": "Live status card for NEXUS ARCHITECT (port 3747). Polling is driven by the global transport (play/stop), not its own clock. Diagnose routes through the Orchestrator.",
  "permissions": ["network_fetch", "bus_publish", "bus_subscribe"],
  "provides": ["capability.nexus_diagnostic"],
  "requires": [],
  "hooks": [
    { "hook_id": "nn.hook.bus_out", "direction": "out", "event_type": "org:state_sync", "contract_version": "1.0.0" }
  ],
  "params": {
    "statusPath":    { "type": "string", "default": "/api/status" },
    "snapshotsPath": { "type": "string", "default": "/snapshots" },
    "diagnosePath":  { "type": "string", "default": "/diagnose" }
  },
  "ui": { "type": "nexus_diagnostic_card" }
}

---

# organisms/nexus-architect/nexus-architect.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: ARCHITECT  v1.0.0
   id: eravos.nexus-architect

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusArchitectEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'architect',
    label: 'ARCHITECT',
    icon: '📐',
    accent: '#00ff88',
    base: 'http://127.0.0.1:3747',
    statusPath: '/api/status',
    snapshotsPath: '/snapshots',
    orchestratorBase: 'http://127.0.0.1:9000',
    diagnosePath: '/diagnose',
    idLink: 'http://127.0.0.1:4800',
    isOrchestrator: false,
    ...config,
  });
}

return { mount };
})();

---

# organisms/contrast-analyser/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.contrast-analyser",
  "label": "Contrast Analyser",
  "icon": "\u27fa",
  "accent": "#00d4ff",
  "domain": [
    "music",
    "analysis",
    "mixing"
  ],
  "description": "Three-mode audio contrast analyser. FREQUENCY: clash score. DYNAMIC: RMS comparison. RHYTHMIC: transient grid with tension arcs.",
  "permissions": [
    "audio_in",
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.audio_analysis"
  ],
  "requires": [],
  "hooks": [
    {
      "hook_id": "ca.hook.slot_a_in",
      "direction": "in",
      "event_type": "audio:buffer",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "ca.hook.slot_b_in",
      "direction": "in",
      "event_type": "audio:buffer",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "ca.hook.analysis_out",
      "direction": "out",
      "event_type": "contrast:analysis",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "mode": {
      "type": "enum",
      "values": [
        "frequency",
        "dynamic",
        "rhythmic"
      ],
      "default": "frequency"
    },
    "bpm": {
      "type": "int",
      "min": 60,
      "max": 220,
      "default": 128,
      "unit": "BPM"
    },
    "sensitivity": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.3,
      "unit": ""
    }
  },
  "ui": {
    "type": "dual_slot_analyser",
    "modes": 3,
    "canvas_driven": true
  }
}

---

# organisms/contrast-analyser/contrast-analyser.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: CONTRAST ANALYSER  v1.0.0
   id: eravos.contrast-analyser

   Three analysis modes:
     FREQUENCY — dual FFT spectrum, clash score
     DYNAMIC   — dual RMS waveform, dynamic contrast
     RHYTHMIC  — transient grid, displacement score

   No DOM. Communicates only via sBus.
   ═══════════════════════════════════════════════════════════ */

window.ContrastAnalyserEngine = (() => {
'use strict';

/* ── Transient detector ────────────────────────────────────
   Peak-picks energy spikes above adaptive threshold.
   Returns array of { time_sec, amplitude } objects.      */
function detectTransients(audioBuffer, sensitivity = 0.3) {
  const data     = audioBuffer.getChannelData(0);
  const sr       = audioBuffer.sampleRate;
  const hop      = Math.floor(sr * 0.005);   /* 5ms hop */
  const win      = Math.floor(sr * 0.02);    /* 20ms window */
  const transients = [];

  let maxEnergy = 0;
  const energies = [];

  for (let i = 0; i < data.length - win; i += hop) {
    let e = 0;
    for (let j = 0; j < win; j++) e += data[i + j] ** 2;
    e = Math.sqrt(e / win);
    energies.push({ time: i / sr, e });
    if (e > maxEnergy) maxEnergy = e;
  }

  const threshold = maxEnergy * (0.1 + sensitivity * 0.5);
  let lastPeak = -1;
  const minGapSec = 0.05; /* min 50ms between transients */

  for (let i = 1; i < energies.length - 1; i++) {
    const { time, e } = energies[i];
    if (
      e > threshold &&
      e > energies[i - 1].e &&
      e >= energies[i + 1].e &&
      time - lastPeak > minGapSec
    ) {
      transients.push({ time_sec: time, amplitude: e / maxEnergy });
      lastPeak = time;
    }
  }

  return transients;
}

/* ── BPM from transients (autocorrelation) ─────────────── */
function detectBPM(transients) {
  if (transients.length < 4) return null;
  const times = transients.map(t => t.time_sec);
  const gaps  = [];
  for (let i = 1; i < times.length; i++) gaps.push(times[i] - times[i - 1]);

  /* Find most common gap */
  const buckets = {};
  const bpmRes  = 0.02; /* 20ms resolution */
  gaps.forEach(g => {
    const key = Math.round(g / bpmRes) * bpmRes;
    buckets[key] = (buckets[key] || 0) + 1;
  });

  let bestGap = 0, bestCount = 0;
  Object.entries(buckets).forEach(([k, v]) => {
    if (v > bestCount) { bestCount = v; bestGap = +k; }
  });

  if (!bestGap) return null;
  const bpm = Math.round(60 / bestGap);
  const confidence = Math.min(1, bestCount / gaps.length);
  return { bpm: Math.max(60, Math.min(220, bpm)), confidence };
}

/* ── RMS peaks (for dynamic waveform) ─────────────────── */
function buildRMSPeaks(audioBuffer, buckets = 300) {
  const data  = audioBuffer.getChannelData(0);
  const step  = Math.ceil(data.length / buckets);
  const peaks = [];
  for (let i = 0; i < buckets; i++) {
    let rms = 0, count = 0;
    for (let j = 0; j < step; j++) {
      const s = data[i * step + j] || 0;
      rms += s * s; count++;
    }
    peaks.push(Math.sqrt(rms / count));
  }
  return peaks;
}

/* ── Peak amplitude ─────────────────────────────────────── */
function peakDb(audioBuffer) {
  const data = audioBuffer.getChannelData(0);
  let peak = 0;
  for (let i = 0; i < data.length; i++) {
    const a = Math.abs(data[i]);
    if (a > peak) peak = a;
  }
  return peak > 0 ? 20 * Math.log10(peak) : -Infinity;
}

/* ── Average RMS ────────────────────────────────────────── */
function avgRMS(peaks) {
  const sum = peaks.reduce((a, b) => a + b * b, 0);
  return Math.sqrt(sum / peaks.length);
}

/* ── Clash score (spectral overlap) ──────────────────────
   Computes how much two FFT snapshots overlap.
   Returns 0–100. 0 = total separation. 100 = identical.  */
function clashScore(fftA, fftB) {
  let overlap = 0, totalA = 0, totalB = 0;
  const len = Math.min(fftA.length, fftB.length);
  for (let i = 0; i < len; i++) {
    const a = fftA[i] / 255;
    const b = fftB[i] / 255;
    overlap += Math.min(a, b);
    totalA  += a;
    totalB  += b;
  }
  const denom = Math.max(totalA, totalB, 0.001);
  return Math.round((overlap / denom) * 100);
}

/* ── Displacement score (rhythmic tension) ───────────────
   How far apart are A and B transients from each other
   relative to a beat grid.
   0 = locked. 100 = maximum fight.                       */
function displacementScore(transientsA, transientsB, bpm) {
  if (!transientsA.length || !transientsB.length) return 0;
  const beatSec = 60 / bpm;
  const grid16  = beatSec / 4;
  let totalDisp = 0, count = 0;

  transientsA.forEach(ta => {
    /* Find nearest B transient */
    let nearestDist = Infinity;
    transientsB.forEach(tb => {
      const dist = Math.abs(ta.time_sec - tb.time_sec) % grid16;
      const wrapped = Math.min(dist, grid16 - dist);
      if (wrapped < nearestDist) nearestDist = wrapped;
    });
    totalDisp += nearestDist / (grid16 * 0.5); /* normalise 0–1 */
    count++;
  });

  return Math.round(Math.min(100, (totalDisp / count) * 100));
}

/* ── Dynamic contrast score ─────────────────────────────── */
function dynamicContrastScore(peaksA, peaksB) {
  const rmsA = avgRMS(peaksA);
  const rmsB = avgRMS(peaksB);
  const ratio = Math.max(rmsA, rmsB) / Math.max(Math.min(rmsA, rmsB), 0.001);
  return Math.round(Math.min(100, (ratio - 1) * 30));
}

/* ── Analysis text generator ────────────────────────────── */
function analysisText(mode, scoreA, scoreB, clash, displacement, dynContrast, bpmResult) {
  if (mode === 'frequency') {
    if (clash > 80) return 'Heavy spectral overlap — both clips fighting the same frequencies. EQ one to carve space.';
    if (clash > 50) return 'Moderate clash in the mids. Consider a high-pass on the lighter track.';
    if (clash < 20) return 'Strong spectral separation — these layer cleanly. A provides body, B provides air.';
    return 'Reasonable separation. Some overlap in the low-mids — watch for muddiness at high volumes.';
  }
  if (mode === 'dynamic') {
    if (dynContrast > 60) return 'A dominates in level. B will be masked at high volumes — sidechain or duck B under A.';
    if (dynContrast < 15) return 'Similar RMS levels — these will compete directly in the mix. Consider panning or EQ separation.';
    return 'Good dynamic contrast. Use the louder clip for the drop, the quieter for the build.';
  }
  if (mode === 'rhythmic') {
    const bpmStr = bpmResult ? `Detected BPM: ${bpmResult.bpm}.` : '';
    if (displacement > 70) return `${bpmStr} Maximum rhythmic tension — these are fighting hard. That's the Tranki effect. Keep it.`;
    if (displacement > 40) return `${bpmStr} Moderate displacement — productive tension. The clips agree sometimes but not always.`;
    if (displacement < 15) return `${bpmStr} Locked to the same grid — tight and punchy. No tension. Try offsetting one clip.`;
    return `${bpmStr} Light displacement — some tension present. Increase sensitivity to reveal more.`;
  }
  return '';
}

/* ── MOUNT ──────────────────────────────────────────────── */
function mount(instanceId, sBus, audio, config = {}) {
  const gBus = KERNEL.bus;

  let mode   = config.mode || 'frequency';
  let bpm    = config.bpm  || KERNEL.clock.BPM;
  let sensitivity = config.sensitivity || 0.3;

  /* Slot state */
  const slots = {
    A: { buffer: null, name: null, peaks: [], transients: [], peakDb: 0 },
    B: { buffer: null, name: null, peaks: [], transients: [], peakDb: 0 },
  };

  /* Live FFT analysers */
  let analyserA = null, analyserB = null;
  const fftSize = 2048;

  function _bootAnalysers() {
    const AC = audio.boot();
    if (!analyserA) {
      analyserA = AC.createAnalyser(); analyserA.fftSize = fftSize;
      analyserB = AC.createAnalyser(); analyserB.fftSize = fftSize;
    }
  }

  function _loadSlot(slot, result) {
    const AC = audio.boot();
    _bootAnalysers();

    AC.decodeAudioData(result.arrayBuffer.slice(0)).then(ab => {
      slots[slot].buffer     = ab;
      slots[slot].name       = result.name;
      slots[slot].peaks      = buildRMSPeaks(ab, 300);
      slots[slot].transients = detectTransients(ab, sensitivity);
      slots[slot].peakDb     = peakDb(ab);

      const bpmResult = detectBPM(slots[slot].transients);
      if (bpmResult && bpmResult.confidence > 0.4) {
        bpm = bpmResult.bpm;
        sBus.publish('org:bpm-detected', { bpm: bpmResult.bpm, confidence: bpmResult.confidence });
      }

      sBus.publish('org:slot-loaded', {
        slot,
        name:       result.name,
        duration:   ab.duration,
        peaks:      slots[slot].peaks,
        transients: slots[slot].transients,
        peakDb:     slots[slot].peakDb,
        bpmResult,
      });

      _runAnalysis();
    }).catch(e => {
      KERNEL.fault('ASSET_002', instanceId, `contrast analyser decode failed: ${e.message}`);
    });
  }

  function _runAnalysis() {
    if (!slots.A.buffer && !slots.B.buffer) return;

    const peaksA      = slots.A.peaks;
    const peaksB      = slots.B.peaks;
    const transientsA = slots.A.transients;
    const transientsB = slots.B.transients;

    /* Displacement always uses current bpm */
    const displacement = (transientsA.length && transientsB.length)
      ? displacementScore(transientsA, transientsB, bpm)
      : 0;

    const dynContrast = (peaksA.length && peaksB.length)
      ? dynamicContrastScore(peaksA, peaksB)
      : 0;

    /* Clash needs live FFT — approximate from buffer FFT if not live */
    let clash = 0;
    if (slots.A.buffer && slots.B.buffer) {
      /* Approximate: take centre-point FFT from each buffer */
      const fftA = _bufferFFT(slots.A.buffer, fftSize);
      const fftB = _bufferFFT(slots.B.buffer, fftSize);
      clash = clashScore(fftA, fftB);
    }

    const bpmResult = detectBPM([...transientsA, ...transientsB].sort((a, b) => a.time_sec - b.time_sec));
    const text = analysisText(mode, 0, 0, clash, displacement, dynContrast, bpmResult);

    sBus.publish('org:analysis-ready', {
      mode, clash, displacement, dynContrast, text,
      peaksA: peaksA.slice(0, 300),
      peaksB: peaksB.slice(0, 300),
      transientsA, transientsB,
      peakDbA: slots.A.peakDb,
      peakDbB: slots.B.peakDb,
      bpm, bpmResult,
      nameA: slots.A.name, nameB: slots.B.name,
    });

    /* Publish on global bus for other organisms */
    gBus.publish('contrast:analysis', { mode, clash, displacement, dynContrast, text });
  }

  /* Approximate centre-frame FFT from a decoded buffer */
  function _bufferFFT(ab, size) {
    const data   = ab.getChannelData(0);
    const centre = Math.floor(data.length / 2);
    const half   = size / 2;
    const fft    = new Uint8Array(half);
    /* Very lightweight: just map raw amplitude to frequency bins */
    for (let i = 0; i < half; i++) {
      let sum = 0;
      const span = Math.max(1, Math.floor(data.length / half));
      for (let j = 0; j < span; j++) {
        sum += Math.abs(data[Math.min(centre + i * span + j, data.length - 1)] || 0);
      }
      fft[i] = Math.round(Math.min(255, (sum / span) * 255 * 8));
    }
    return fft;
  }

  /* ── UI hook subscribers ── */
  const _unsubs = [
    gBus.subscribe('ui:slot-load:' + instanceId, ({ slot, arrayBuffer, name }) => {
      if (!arrayBuffer) return;
      _loadSlot(slot, { arrayBuffer, name });
    }),
    gBus.subscribe('ui:mode-change:' + instanceId, ({ mode: m }) => {
      mode = m;
      _runAnalysis();
      sBus.publish('org:mode-changed', { mode });
    }),
    gBus.subscribe('ui:config-change:' + instanceId, ({ key, value }) => {
      if (key === 'bpm')         { bpm = value; _runAnalysis(); }
      if (key === 'sensitivity') { sensitivity = value; }
    }),
    gBus.subscribe('ui:tap-bpm:' + instanceId, _tapBPM),
    gBus.subscribe('ui:reanalyse:' + instanceId, _runAnalysis),

    /* Accept drops from intake directly */
    gBus.subscribe('intake:file', result => {
      if (result.id !== 'audio:sample') return;
      const slot = (!slots.A.buffer) ? 'A' : (!slots.B.buffer) ? 'B' : null;
      if (!slot) return;
      _loadSlot(slot, result);
    }),
  ];

  /* Tap BPM */
  const _taps = [];
  function _tapBPM() {
    const now = performance.now();
    _taps.push(now);
    if (_taps.length > 8) _taps.shift();
    if (_taps.length >= 2) {
      const gaps = [];
      for (let i = 1; i < _taps.length; i++) gaps.push(_taps[i] - _taps[i - 1]);
      const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      bpm = Math.round(60000 / avg);
      bpm = Math.max(60, Math.min(220, bpm));
      KERNEL.clock.BPM = bpm;
      sBus.publish('org:bpm-detected', { bpm, confidence: 0.9, source: 'tap' });
      _runAnalysis();
    }
  }

  KERNEL.registry.register({
    instanceId, id: 'eravos.contrast-analyser', label: 'Contrast Analyser',
    provides: ['capability.audio_analysis'],
    requires: [],
    permissions: ['audio_in', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'contrast.hook.slot-a-in',   direction: 'in',  event_type: 'audio:buffer',       contract_version: '1.0.0' },
      { hook_id: 'contrast.hook.slot-b-in',   direction: 'in',  event_type: 'audio:buffer',       contract_version: '1.0.0' },
      { hook_id: 'contrast.hook.analysis-out',direction: 'out', event_type: 'contrast:analysis',  contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() { _unsubs.forEach(u => u()); KERNEL.registry.unregister(instanceId); },
    loadSlot: _loadSlot, runAnalysis: _runAnalysis,
  };
}

return { mount, detectTransients, detectBPM, buildRMSPeaks, clashScore, displacementScore };
})();

---

# organisms/lfo/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.lfo",
  "label": "LFO",
  "icon": "\u3030",
  "accent": "#aa44ff",
  "domain": [
    "music",
    "modulation",
    "control"
  ],
  "description": "Low-frequency oscillator. Publishes mod:signal globally. BPM sync mode.",
  "permissions": [
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.lfo",
    "capability.mod_signal"
  ],
  "requires": [],
  "hooks": [
    {
      "hook_id": "lfo.hook.mod_out",
      "direction": "out",
      "event_type": "mod:signal",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "shape": {
      "type": "enum",
      "values": [
        "sine",
        "triangle",
        "square",
        "sawtooth",
        "S&H"
      ],
      "default": "sine"
    },
    "rate": {
      "type": "float",
      "min": 0.01,
      "max": 32,
      "default": 4,
      "unit": "Hz"
    },
    "depth": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.5,
      "unit": ""
    },
    "phase": {
      "type": "float",
      "min": 0,
      "max": 360,
      "default": 0,
      "unit": "degrees"
    },
    "bipolar": {
      "type": "bool",
      "default": true
    },
    "sync": {
      "type": "bool",
      "default": false
    }
  },
  "ui": {
    "type": "oscilloscope_interactive"
  }
}

---

# organisms/lfo/lfo.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: LFO  v1.0.0
   id: eravos.lfo

   Generates a continuous low-frequency modulation signal.
   Publishes mod:signal on the bus every animation frame.
   Other organisms can subscribe to mod:signal and apply
   the value to any parameter.

   Shapes: sine, triangle, square, sawtooth, S&H (random)
   ═══════════════════════════════════════════════════════════ */

window.LFOEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    shape:   config.shape   || 'sine',
    rate:    config.rate    || 4,      /* Hz */
    depth:   config.depth   || 0.5,   /* 0-1 */
    phase:   config.phase   || 0,     /* degrees */
    bipolar: config.bipolar !== false, /* true = -1 to 1, false = 0 to 1 */
    sync:    config.sync    || false,  /* sync to BPM */
    xDest:   config.xDest   || 'cutoff',
    yDest:   config.yDest   || 'depth',
  };

  let _running  = false;
  let _phase    = (_params.phase / 360) * Math.PI * 2;
  let _shValue  = 0; /* S&H hold value */
  let _rafId    = null;
  let _lastTime = 0;

  function _compute(dt) {
    const rate = _params.sync
      ? (KERNEL.clock.BPM / 60) * (_params.rate)
      : _params.rate;

    _phase += rate * Math.PI * 2 * dt;
    if (_phase > Math.PI * 2) {
      _phase -= Math.PI * 2;
      if (_params.shape === 'S&H') _shValue = Math.random() * 2 - 1;
    }

    let raw = 0;
    switch (_params.shape) {
      case 'sine':     raw = Math.sin(_phase); break;
      case 'triangle': raw = (2 / Math.PI) * Math.asin(Math.sin(_phase)); break;
      case 'square':   raw = Math.sign(Math.sin(_phase)); break;
      case 'sawtooth': raw = (_phase / Math.PI) - 1; break;
      case 'S&H':      raw = _shValue; break;
      default:         raw = Math.sin(_phase);
    }

    const value = _params.bipolar
      ? raw * _params.depth
      : (raw * 0.5 + 0.5) * _params.depth;

    return { value, phase: _phase, raw };
  }

  function _tick(timestamp) {
    if (!_running) return;
    const dt = _lastTime ? Math.min((timestamp - _lastTime) / 1000, 0.05) : 0;
    _lastTime = timestamp;

    const { value, phase, raw } = _compute(dt);

    /* Publish scoped — for UI visualisation */
    sBus.publish('org:lfo_tick', { value, phase, raw, shape: _params.shape, depth: _params.depth });

    /* Publish global — for other organisms to modulate */
    gBus.publish('mod:signal', {
      instanceId,
      value,
      xDest: _params.xDest,
      yDest: _params.yDest,
    });

    _rafId = requestAnimationFrame(_tick);
  }

  function start() {
    if (_running) return;
    _running  = true;
    _lastTime = 0;
    _rafId    = requestAnimationFrame(_tick);
    sBus.publish('org:state_sync', { running: true, params: { ..._params } });
  }

  function stop() {
    _running = false;
    cancelAnimationFrame(_rafId);
    sBus.publish('org:state_sync', { running: false });
  }

  function _syncUI() {
    sBus.publish('org:state_sync', {
      running: _running,
      params:  { ..._params },
    });
  }

  const _unsubs = [
    gBus.subscribe('ui:lfo_toggle:' + instanceId, () => _running ? stop() : start()),
    gBus.subscribe('ui:config_change:' + instanceId, ({ key, value }) => {
      if (key in _params) _params[key] = value;
    }),
  ];

  _syncUI();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.lfo',
    label:    'LFO',
    provides: ['capability.lfo', 'capability.mod_signal'],
    requires: [],
    permissions: ['bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'lfo.hook.mod_out', direction: 'out', event_type: 'mod:signal', contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() {
      stop();
      _unsubs.forEach(u => u());
      KERNEL.registry.unregister(instanceId);
    },
    start, stop,
    get params() { return { ..._params }; },
  };
}

return { mount };
})();

---

# organisms/video-editor/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.video-editor",
  "label": "Video Editor",
  "icon": "🎬",
  "accent": "#ff2266",
  "domain": ["video", "editing", "media"],
  "description": "Trim, live-filter, and re-export video clips entirely client-side. Loads a local video file, plays it through a canvas with brightness/contrast/saturation/hue/blur/grayscale filters applied per frame, trims to an in/out range, and records the filtered result (with audio) to a downloadable WebM via MediaRecorder + canvas.captureStream().",
  "permissions": ["filesystem_read", "bus_publish", "bus_subscribe"],
  "provides": ["capability.video_edit", "capability.video_export"],
  "requires": [],
  "dependencies": {
    "runtime": ["kernel/kernel.js"],
    "browser_apis": ["HTMLVideoElement", "Canvas2D (filter)", "canvas.captureStream()", "HTMLMediaElement.captureStream()", "MediaRecorder"],
    "external_libs": [],
    "constraints": ["MediaRecorder codec support (vp9/opus) varies by browser — falls back to vp8 if vp9 is unavailable.", "Chromium-based browsers have the most complete captureStream + MediaRecorder support."]
  },
  "hooks": [
    { "hook_id": "video.hook.exported", "direction": "out", "event_type": "video:exported", "contract_version": "1.0.0" }
  ],
  "params": {
    "brightness": { "type": "float", "min": 0, "max": 2,   "default": 1 },
    "contrast":   { "type": "float", "min": 0, "max": 2,   "default": 1 },
    "saturation": { "type": "float", "min": 0, "max": 3,   "default": 1 },
    "hue":        { "type": "float", "min": 0, "max": 360, "default": 0 },
    "blur":       { "type": "float", "min": 0, "max": 12,  "default": 0 },
    "grayscale":  { "type": "float", "min": 0, "max": 1,   "default": 0 },
    "inPoint":    { "type": "float", "min": 0, "max": null,"default": 0 },
    "outPoint":   { "type": "float", "min": 0, "max": null,"default": null }
  }
}

---

# organisms/video-editor/video-editor.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: VIDEO EDITOR  v1.0.0
   id: eravos.video-editor

   Loads a local video into a hidden <video> element, draws each
   frame through a Canvas2D filter pipeline, trims to [in,out],
   and re-encodes the filtered range (with original audio) to
   WebM via canvas.captureStream() + MediaRecorder. No server,
   no external transcoder.
   ═══════════════════════════════════════════════════════════ */

window.VideoEditorEngine = (() => {
'use strict';

function mount(instanceId, sBus, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    brightness: 1, contrast: 1, saturation: 1, hue: 0, blur: 0, grayscale: 0,
    inPoint: 0, outPoint: null,
  };

  let _video    = null; /* hidden HTMLVideoElement, the decode source */
  let _recorder = null;
  let _chunks   = [];
  let _rafId    = null;

  function filterString(p = _params) {
    return [
      `brightness(${p.brightness})`,
      `contrast(${p.contrast})`,
      `saturate(${p.saturation})`,
      `hue-rotate(${p.hue}deg)`,
      `blur(${p.blur}px)`,
      `grayscale(${p.grayscale})`,
    ].join(' ');
  }

  function loadFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const v = document.createElement('video');
      v.src = url; v.muted = false; v.playsInline = true; v.crossOrigin = 'anonymous';
      v.addEventListener('loadedmetadata', () => {
        _video = v;
        _params.outPoint = v.duration;
        sBus.publish('org:video_loaded', { duration: v.duration, w: v.videoWidth, h: v.videoHeight });
        resolve(v);
      }, { once: true });
      v.addEventListener('error', reject, { once: true });
    });
  }

  /* Draw current video frame into canvas with live filters. Caller drives
     the requestAnimationFrame loop from buildUI (so it can stop cleanly
     when the window is closed) and calls this once per frame. */
  function drawFrame(canvas) {
    if (!_video) return;
    const ctx = canvas.getContext('2d');
    if (canvas.width !== _video.videoWidth || canvas.height !== _video.videoHeight) {
      canvas.width = _video.videoWidth; canvas.height = _video.videoHeight;
    }
    ctx.filter = filterString();
    ctx.drawImage(_video, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
  }

  function _pickMime() {
    const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    for (const c of candidates) if (window.MediaRecorder && MediaRecorder.isTypeSupported(c)) return c;
    return 'video/webm';
  }

  /* Play [inPoint, outPoint] once, recording the filtered canvas + original
     audio track to a WebM blob, then trigger a download. */
  function exportClip(canvas, onDone) {
    if (!_video) return;
    const mime = _pickMime();
    const canvasStream = canvas.captureStream(30);
    let audioTracks = [];
    try { audioTracks = _video.captureStream ? _video.captureStream().getAudioTracks() : []; } catch (e) { audioTracks = []; }
    const combined = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);

    _chunks = [];
    _recorder = new MediaRecorder(combined, { mimeType: mime });
    _recorder.ondataavailable = e => { if (e.data.size) _chunks.push(e.data); };
    _recorder.onstop = () => {
      const blob = new Blob(_chunks, { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'eravos-video-export.webm'; a.click();
      gBus.publish('video:exported', { instanceId, size: blob.size, mime });
      sBus.publish('org:exported', { size: blob.size, mime });
      if (onDone) onDone();
    };

    _video.currentTime = _params.inPoint;
    const outT = _params.outPoint ?? _video.duration;

    const pump = () => {
      drawFrame(canvas);
      if (_video.currentTime >= outT || _video.paused && _video.currentTime >= outT - 0.02) {
        _video.pause();
        _recorder.stop();
        cancelAnimationFrame(_rafId);
        return;
      }
      _rafId = requestAnimationFrame(pump);
    };

    _recorder.start();
    _video.play().then(() => { _rafId = requestAnimationFrame(pump); });
  }

  function _updateParam(key, val) {
    if (key in _params) _params[key] = val;
  }

  function _syncUI() {
    sBus.publish('org:state_sync', { params: { ..._params } });
  }

  const _unsubs = [
    gBus.subscribe('ui:config_change:' + instanceId, ({ key, value }) => _updateParam(key, value)),
  ];

  _syncUI();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.video-editor',
    label:    'Video Editor',
    provides: ['capability.video_edit', 'capability.video_export'],
    requires: [],
    permissions: ['filesystem_read', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'video.hook.exported', direction: 'out', event_type: 'video:exported', contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() {
      cancelAnimationFrame(_rafId);
      if (_video) { try { _video.pause(); } catch (e) {} }
      _unsubs.forEach(u => u());
      KERNEL.registry.unregister(instanceId);
    },
    loadFile, drawFrame, exportClip, filterString,
    get video()  { return _video; },
    get params() { return { ..._params }; },
  };
}

return { mount };
})();

---

# organisms/nexus-diagnostic/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.nexus-diagnostic",
  "label": "DIAGNOSTIC",
  "icon": "🩹",
  "accent": "#aa44ff",
  "domain": ["diagnostic", "monitoring", "nexus"],
  "description": "Live status card for NEXUS DIAGNOSTIC (port 7825). Polling is driven by the global transport (play/stop), not its own clock. Diagnose routes through the Orchestrator.",
  "permissions": ["network_fetch", "bus_publish", "bus_subscribe"],
  "provides": ["capability.nexus_diagnostic"],
  "requires": [],
  "hooks": [
    { "hook_id": "nn.hook.bus_out", "direction": "out", "event_type": "org:state_sync", "contract_version": "1.0.0" }
  ],
  "params": {
    "statusPath":    { "type": "string", "default": "/api/status" },
    "snapshotsPath": { "type": "string", "default": "/snapshots" },
    "diagnosePath":  { "type": "string", "default": "/diagnose" }
  },
  "ui": { "type": "nexus_diagnostic_card" }
}

---

# organisms/nexus-diagnostic/nexus-diagnostic.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: DIAGNOSTIC  v1.0.0
   id: eravos.nexus-diagnostic

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusDiagnosticEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'diagnostic',
    label: 'DIAGNOSTIC',
    icon: '🩹',
    accent: '#aa44ff',
    base: 'http://127.0.0.1:7825',
    statusPath: '/api/status',
    snapshotsPath: '/snapshots',
    orchestratorBase: 'http://127.0.0.1:9000',
    diagnosePath: '/diagnose',
    idLink: 'http://127.0.0.1:4800',
    isOrchestrator: false,
    ...config,
  });
}

return { mount };
})();

---

# organisms/nexus-idearium/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.nexus-idearium",
  "label": "IDEARIUM",
  "icon": "💡",
  "accent": "#ffaa00",
  "domain": ["diagnostic", "monitoring", "nexus"],
  "description": "Live status card for NEXUS IDEARIUM (port 4800). Polling is driven by the global transport (play/stop), not its own clock. Diagnose routes through the Orchestrator.",
  "permissions": ["network_fetch", "bus_publish", "bus_subscribe"],
  "provides": ["capability.nexus_diagnostic"],
  "requires": [],
  "hooks": [
    { "hook_id": "nn.hook.bus_out", "direction": "out", "event_type": "org:state_sync", "contract_version": "1.0.0" }
  ],
  "params": {
    "statusPath":    { "type": "string", "default": "/api/status" },
    "snapshotsPath": { "type": "string", "default": "/snapshots" },
    "diagnosePath":  { "type": "string", "default": "/diagnose" }
  },
  "ui": { "type": "nexus_diagnostic_card" }
}

---

# organisms/nexus-idearium/nexus-idearium.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: IDEARIUM  v1.0.0
   id: eravos.nexus-idearium

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusIdeariumEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'idearium',
    label: 'IDEARIUM',
    icon: '💡',
    accent: '#ffaa00',
    base: 'http://127.0.0.1:4800',
    statusPath: '/api/status',
    snapshotsPath: '/snapshots',
    orchestratorBase: 'http://127.0.0.1:9000',
    diagnosePath: '/diagnose',
    idLink: 'http://127.0.0.1:4800',
    isOrchestrator: false,
    ...config,
  });
}

return { mount };
})();

---

# organisms/webhook-automation/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.webhook-automation",
  "label": "Webhook Automation",
  "icon": "🌐",
  "accent": "#ff2266",
  "domain": ["automation", "integration", "external"],
  "description": "Bridges ERAVOS bus events to the outside world. Fires an HTTP request to a webhook URL whenever a chosen bus event occurs (a kick trigger, a pattern change, incoming serial telemetry, etc.) — the standard integration point for external/OS-level automation tools that expose a webhook or HTTP-trigger endpoint (Home Assistant, n8n, Shortcuts' HTTP triggers, Keyboard Maestro web triggers, IFTTT Webhooks, a local script listener). A browser sandbox cannot execute shell commands or control the OS directly — this organism intentionally goes through HTTP so any such external automation can subscribe on its own end. The target server must allow CORS from this page's origin, or the request will be blocked by the browser.",
  "permissions": ["network_fetch", "bus_publish", "bus_subscribe"],
  "provides": ["capability.external_automation"],
  "requires": [],
  "dependencies": {
    "runtime": ["kernel/kernel.js"],
    "browser_apis": ["fetch()"],
    "external_libs": [],
    "constraints": [
      "Requires the target endpoint to send permissive CORS headers, or the browser blocks the response (the request itself may still be delivered server-side even if the browser can't read the response — a no-cors fallback mode is available for fire-and-forget cases).",
      "Cannot execute local shell commands or control the OS directly from the browser sandbox — this is an HTTP bridge, not a code-exec bridge."
    ]
  },
  "hooks": [
    { "hook_id": "webhook.hook.trig_in", "direction": "in", "event_type": "pad:trigger", "contract_version": "1.0.0" }
  ],
  "params": {
    "url":         { "type": "string", "default": "" },
    "method":      { "type": "enum", "options": ["POST", "GET"], "default": "POST" },
    "triggerTopic":{ "type": "enum", "options": ["pad:trigger", "kernel:bpm-change", "serial:rx", "photo:exported", "video:exported", "org:pumped"], "default": "pad:trigger" },
    "soundFilter": { "type": "string", "default": "" },
    "noCors":      { "type": "bool", "default": false },
    "rateLimitMs": { "type": "int",  "min": 0, "max": 60000, "default": 250 }
  }
}

---

# organisms/webhook-automation/webhook-automation.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: WEBHOOK AUTOMATION  v1.0.0
   id: eravos.webhook-automation

   External/OS-level automation bridge. A browser sandbox cannot
   exec shell commands — so this organism fires an HTTP request
   to a configured webhook URL whenever a chosen bus event fires.
   That's the real, honest bridge point: external automation
   tools (Home Assistant, n8n, Shortcuts HTTP triggers, Keyboard
   Maestro web triggers, IFTTT Webhooks, a local listener script)
   all consume webhooks the same way.
   ═══════════════════════════════════════════════════════════ */

window.WebhookAutomationEngine = (() => {
'use strict';

function mount(instanceId, sBus, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    url:          config.url          || '',
    method:       config.method       || 'POST',
    triggerTopic: config.triggerTopic || 'pad:trigger',
    soundFilter:  config.soundFilter  || '',
    noCors:       !!config.noCors,
    rateLimitMs:  config.rateLimitMs != null ? config.rateLimitMs : 250,
  };

  let _topicSub   = null;
  let _lastFireAt = 0;
  let _fireCount  = 0;

  async function _fire(payload) {
    if (!_params.url) { sBus.publish('org:log', { level: 'error', message: 'No webhook URL set.' }); return; }
    const now = Date.now();
    if (now - _lastFireAt < _params.rateLimitMs) return; /* rate limit */
    _lastFireAt = now;

    const body = JSON.stringify({ ...payload, source: 'eravos', instanceId, ts: now });
    const opts = {
      method: _params.method,
      headers: _params.method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
      body: _params.method === 'POST' ? body : undefined,
      mode: _params.noCors ? 'no-cors' : 'cors',
    };
    const url = _params.method === 'GET'
      ? _params.url + (_params.url.includes('?') ? '&' : '?') + 'payload=' + encodeURIComponent(body)
      : _params.url;

    try {
      const res = await fetch(url, opts);
      _fireCount++;
      sBus.publish('org:log', { level: 'ok', message: `Fired (${_fireCount}) → ${_params.noCors ? 'sent (no-cors, response opaque)' : res.status} `, count: _fireCount });
    } catch (err) {
      sBus.publish('org:log', { level: 'error', message: 'Fetch failed: ' + err.message });
    }
  }

  function _resubscribe() {
    if (_topicSub) { _topicSub(); _topicSub = null; }
    _topicSub = gBus.subscribe(_params.triggerTopic, (payload) => {
      if (_params.triggerTopic === 'pad:trigger' && _params.soundFilter && payload.sound !== _params.soundFilter) return;
      _fire(payload || {});
    });
  }

  function testFire() { _fire({ test: true }); }

  function _updateParam(key, val) {
    if (!(key in _params)) return;
    _params[key] = val;
    if (key === 'triggerTopic' || key === 'soundFilter') _resubscribe();
  }

  function _syncUI() {
    sBus.publish('org:state_sync', { params: { ..._params }, fireCount: _fireCount });
  }

  const _unsubs = [
    gBus.subscribe('ui:webhook_test:'  + instanceId, testFire),
    gBus.subscribe('ui:config_change:' + instanceId, ({ key, value }) => _updateParam(key, value)),
  ];

  _resubscribe();
  _syncUI();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.webhook-automation',
    label:    'Webhook Automation',
    provides: ['capability.external_automation'],
    requires: [],
    permissions: ['network_fetch', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'webhook.hook.trig_in', direction: 'in', event_type: 'pad:trigger', contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() { if (_topicSub) _topicSub(); _unsubs.forEach(u => u()); KERNEL.registry.unregister(instanceId); },
    testFire,
    get params() { return { ..._params }; },
    get fireCount() { return _fireCount; },
  };
}

return { mount };
})();

---

# organisms/acid-synth/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.acid-synth",
  "label": "Acid Synth",
  "icon": "\u26a1",
  "accent": "#00ff88",
  "domain": [
    "music",
    "synthesis",
    "acid",
    "303"
  ],
  "description": "303-style resonant sawtooth with filter envelope. Accent and glide modes.",
  "permissions": [
    "audio_out",
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.audio_out"
  ],
  "requires": [
    "capability.audio_context"
  ],
  "hooks": [
    {
      "hook_id": "acid.hook.trig_in",
      "direction": "in",
      "event_type": "pad:trigger",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "acid.hook.audio_out",
      "direction": "out",
      "event_type": "audio:signal",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "pitch": {
      "type": "int",
      "min": 24,
      "max": 96,
      "default": 45,
      "unit": "MIDI note"
    },
    "cutoff": {
      "type": "float",
      "min": 80,
      "max": 8000,
      "default": 300,
      "unit": "Hz"
    },
    "res": {
      "type": "float",
      "min": 0,
      "max": 30,
      "default": 6,
      "unit": ""
    },
    "env": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.4,
      "unit": ""
    },
    "decay": {
      "type": "float",
      "min": 0.01,
      "max": 2,
      "default": 0.3,
      "unit": "seconds"
    },
    "accent": {
      "type": "bool",
      "default": false
    },
    "glide": {
      "type": "bool",
      "default": false
    },
    "wave": {
      "type": "enum",
      "values": [
        "sawtooth",
        "square"
      ],
      "default": "sawtooth"
    }
  },
  "ui": {
    "type": "synth_scope",
    "accent_glide_toggles": true
  }
}

---

# organisms/acid-synth/acid-synth.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: ACID SYNTH  v1.0.0
   id: eravos.acid-synth

   303-style acid synthesizer. Sawtooth through a resonant
   lowpass with filter envelope. Accent + glide modes.
   One-shot trigger per pad event or ui:fire.
   ═══════════════════════════════════════════════════════════ */

window.AcidSynthEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    pitch:    config.pitch    || 45,   /* MIDI note */
    cutoff:   config.cutoff   || 300,
    res:      config.res      || 6,
    env:      config.env      || 0.4,  /* env amount */
    decay:    config.decay    || 0.3,
    accent:   config.accent   || false,
    glide:    config.glide    || false,
    wave:     config.wave     || 'sawtooth',
  };

  let _lastFreq = null;

  function _midiToHz(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  function _trigger(vel = 1) {
    const AC   = audio.boot();
    const t    = AC.currentTime + 0.01;
    const freq = _midiToHz(_params.pitch);
    const accentMult = _params.accent ? 1.4 : 1.0;
    const decay = _params.decay * (1 + (_params.accent ? 0.5 : 0));

    const o  = AC.createOscillator(); o.type = _params.wave;
    const f  = AC.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = _params.res;
    const g  = AC.createGain();

    /* Glide from last frequency */
    if (_params.glide && _lastFreq) {
      o.frequency.setValueAtTime(_lastFreq, t);
      o.frequency.exponentialRampToValueAtTime(freq, t + 0.08);
    } else {
      o.frequency.value = freq;
    }
    _lastFreq = freq;

    /* Filter envelope */
    const envCutoff = _params.cutoff * (1 + _params.env * 8);
    f.frequency.setValueAtTime(envCutoff * accentMult, t);
    f.frequency.exponentialRampToValueAtTime(_params.cutoff, t + decay);

    /* Amplitude */
    g.gain.setValueAtTime(vel * 0.85 * accentMult, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + decay + 0.04);

    o.connect(f); f.connect(g); audio.send(g, true, false, true);
    o.start(t); o.stop(t + decay + 0.06);

    sBus.publish('org:triggered', { freq, vel, accent: _params.accent });
    gBus.publish('audio:signal', { instanceId, source: 'acid-synth' });
  }

  function _syncUI() {
    sBus.publish('org:state_sync', { params: { ..._params } });
  }

  const _unsubs = [
    gBus.subscribe('ui:acid_trigger:' + instanceId, ({ vel }) => _trigger(vel || 1)),
    gBus.subscribe('ui:config_change:' + instanceId, ({ key, value }) => {
      if (key in _params) _params[key] = value;
    }),
    gBus.subscribe('pad:trigger', ({ sound }) => { if (sound === 'acid') _trigger(0.88); }),
  ];

  _syncUI();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.acid-synth',
    label:    'Acid Synth',
    provides: ['capability.audio_out'],
    requires: ['capability.audio_context'],
    permissions: ['audio_out', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'acid.hook.trig_in',   direction: 'in',  event_type: 'pad:trigger',  contract_version: '1.0.0' },
      { hook_id: 'acid.hook.audio_out', direction: 'out', event_type: 'audio:signal', contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() { _unsubs.forEach(u => u()); KERNEL.registry.unregister(instanceId); },
    trigger: _trigger,
    get params() { return { ..._params }; },
  };
}

return { mount };
})();

---

# organisms/sidechain-compressor/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.sidechain-compressor",
  "label": "Sidechain",
  "icon": "🫀",
  "accent": "#00d4ff",
  "domain": ["music", "dynamics", "sidechain", "mixing"],
  "description": "Ducks the master bus gain on every trigger from a chosen source sound (default: kick). Produces the classic EDM sidechain 'pump'. Real-time gain envelope, no external plugin.",
  "permissions": ["audio_out", "bus_publish", "bus_subscribe"],
  "provides": ["capability.sidechain_duck"],
  "requires": ["capability.audio_context"],
  "dependencies": {
    "runtime": ["kernel/kernel.js"],
    "browser_apis": ["Web Audio API (GainNode.gain automation)"],
    "external_libs": []
  },
  "hooks": [
    { "hook_id": "sidechain.hook.trig_in", "direction": "in", "event_type": "pad:trigger", "contract_version": "1.0.0" }
  ],
  "params": {
    "source":  { "type": "enum",  "options": ["kick", "808", "snare", "clap"], "default": "kick" },
    "amount":  { "type": "float", "min": 0,    "max": 1,   "default": 0.7,  "unit": "" },
    "attack":  { "type": "float", "min": 0.001,"max": 0.2, "default": 0.005,"unit": "s" },
    "release": { "type": "float", "min": 0.02, "max": 1.5, "default": 0.28, "unit": "s" },
    "enabled": { "type": "bool",  "default": true }
  }
}

---

# organisms/sidechain-compressor/sidechain-compressor.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: SIDECHAIN COMPRESSOR  v1.0.0
   id: eravos.sidechain-compressor

   A control organism, not a voice — it has no sound of its own.
   Ducks KERNEL.audio's master gain node every time the chosen
   source sound fires on the bus. Fast attack down, exponential
   release back up to unity: the classic EDM "pump".
   ═══════════════════════════════════════════════════════════ */

window.SidechainCompressorEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  const gBus = KERNEL.bus;

  let _params = {
    source:  config.source  || 'kick',
    amount:  config.amount != null ? config.amount : 0.7,
    attack:  config.attack != null ? config.attack : 0.005,
    release: config.release || 0.28,
    enabled: config.enabled !== false,
  };

  let _pumpCount = 0;

  function _duck() {
    if (!_params.enabled) return;
    const AC = audio.boot();
    const master = audio.masterGainNode;
    if (!master) return;
    const now = AC.currentTime;
    const base = 0.88; /* kernel's default master gain level */
    const floor = base * (1 - _params.amount);

    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(floor, now + _params.attack);
    master.gain.exponentialRampToValueAtTime(Math.max(0.001, base), now + _params.attack + _params.release);

    _pumpCount++;
    sBus.publish('org:pumped', { count: _pumpCount });
  }

  function _updateParam(key, val) {
    _params[key] = val;
  }

  function _syncUI() {
    sBus.publish('org:state_sync', { params: { ..._params } });
  }

  const _unsubs = [
    gBus.subscribe('pad:trigger', ({ sound }) => { if (sound === _params.source) _duck(); }),
    gBus.subscribe('ui:sidechain_test:'  + instanceId, _duck),
    gBus.subscribe('ui:config_change:'   + instanceId, ({ key, value }) => _updateParam(key, value)),
  ];

  _syncUI();

  KERNEL.registry.register({
    instanceId,
    id:       'eravos.sidechain-compressor',
    label:    'Sidechain',
    provides: ['capability.sidechain_duck'],
    requires: ['capability.audio_context'],
    permissions: ['audio_out', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'sidechain.hook.trig_in', direction: 'in', event_type: 'pad:trigger', contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() { _unsubs.forEach(u => u()); KERNEL.registry.unregister(instanceId); },
    duck: _duck,
    get params() { return { ..._params }; },
  };
}

return { mount };
})();

---

# organisms/pads/schema/schema.json

{
  "schema_version": "1.0.0",
  "id": "eravos.pads",
  "label": "Drum Machine",
  "icon": "\ud83e\udd41",
  "accent": "#00ff88",
  "domain": [
    "music",
    "rhythm",
    "percussion"
  ],
  "description": "16-pad velocity-sensitive drum machine. Three banks A/B/C. 19 synthesis voices. Keyboard mapped. MIDI receive.",
  "permissions": [
    "audio_out",
    "midi_in",
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.pad_trigger",
    "capability.audio_out",
    "capability.bank_select"
  ],
  "requires": [
    "capability.audio_context"
  ],
  "hooks": [
    {
      "hook_id": "pads.hook.pad_trigger_out",
      "direction": "out",
      "event_type": "pad:trigger",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "pads.hook.bank_change_out",
      "direction": "out",
      "event_type": "pad:bank-change",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "pads.hook.midi_in",
      "direction": "in",
      "event_type": "midi:note",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "volume": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.88,
      "unit": ""
    },
    "pitch": {
      "type": "float",
      "min": -12,
      "max": 12,
      "default": 0,
      "unit": "semitones"
    },
    "decay": {
      "type": "float",
      "min": 0.01,
      "max": 2,
      "default": 0.3,
      "unit": "seconds"
    }
  },
  "ui": {
    "type": "pad_grid",
    "cols": 4,
    "rows": 4,
    "banks": 3
  },
  "nexus_build_hints": {
    "engine_pattern": "trigger_voice_bank",
    "voices_required": true,
    "keyboard_map": true
  }
}

---

# organisms/pads/pads.engine.js

/* ═══════════════════════════════════════════════════════════
   ORGANISM: DRUM MACHINE  v3.1.0
   Publishes org:* events on scoped sBus (instanceId-scoped).
   Global events (pad:trigger, pad:bank-change) on KERNEL.bus.
   ═══════════════════════════════════════════════════════════ */

window.PadsOrganism = (() => {
'use strict';

const BANKS = [
  { id:'A', pads:[
    {sound:'kick',color:'#00ff88'},{sound:'snare',color:'#00ff88'},
    {sound:'hat',color:'#00d4ff'},{sound:'clap',color:'#00ff88'},
    {sound:'808',color:'#ff2266'},{sound:'rim',color:'#6a88a8'},
    {sound:'reese',color:'#aa44ff'},{sound:'wobble',color:'#aa44ff'},
    {sound:'acid',color:'#ffaa00'},{sound:'stab',color:'#00d4ff'},
    {sound:'openhat',color:'#00d4ff'},{sound:'crash',color:'#00d4ff'},
    {sound:'laser',color:'#00ff88'},{sound:'glitch',color:'#6a88a8'},
    {sound:'noise',color:'#6a88a8'},{sound:'riser',color:'#aa44ff'},
  ]},
  { id:'B', pads:[
    {sound:'kick',color:'#ff2266'},{sound:'snare',color:'#ff2266'},
    {sound:'hat',color:'#6a88a8'},{sound:'clap',color:'#ff2266'},
    {sound:'808',color:'#ffaa00'},{sound:'rim',color:'#6a88a8'},
    {sound:'wobble',color:'#aa44ff'},{sound:'acid',color:'#ffaa00'},
    {sound:'stab',color:'#00d4ff'},{sound:'drone',color:'#aa44ff'},
    {sound:'openhat',color:'#00d4ff'},{sound:'crash',color:'#6a88a8'},
    {sound:'laser',color:'#ff2266'},{sound:'glitch',color:'#6a88a8'},
    {sound:'scream',color:'#ff2266'},{sound:'riser',color:'#aa44ff'},
  ]},
  { id:'C', pads:[
    {sound:'kick',color:'#aa44ff'},{sound:'snare',color:'#aa44ff'},
    {sound:'hat',color:'#00d4ff'},{sound:'clap',color:'#aa44ff'},
    {sound:'808',color:'#ff2266'},{sound:'rim',color:'#6a88a8'},
    {sound:'reese',color:'#aa44ff'},{sound:'wobble',color:'#00d4ff'},
    {sound:'acid',color:'#ffaa00'},{sound:'stab',color:'#00ff88'},
    {sound:'drone',color:'#aa44ff'},{sound:'crash',color:'#6a88a8'},
    {sound:'laser',color:'#00ff88'},{sound:'glitch',color:'#6a88a8'},
    {sound:'vinyl',color:'#6a88a8'},{sound:'riser',color:'#aa44ff'},
  ]},
];

const VOICES = {
  kick(t,v,p,a){const pitch=p.pitch??55,decay=p.decay??0.32;const g=a.gain(v*1.3),o=a.osc(pitch*3.2);o.frequency.setValueAtTime(pitch*3.6,t);o.frequency.exponentialRampToValueAtTime(pitch*0.33,t+decay);o.connect(g);a.send(g,false,false,true);g.gain.setValueAtTime(v*1.3,t);g.gain.exponentialRampToValueAtTime(0.001,t+decay+0.08);o.start(t);o.stop(t+decay+0.12);const nb=a.noise(0.015),ng=a.gain(v*0.5),nf=a.filter('bandpass',120,0.4);nb.connect(nf);nf.connect(ng);a.send(ng);ng.gain.setValueAtTime(v*0.5,t);ng.gain.exponentialRampToValueAtTime(0.001,t+0.015);nb.start(t);nb.stop(t+0.02);},
  snare(t,v,p,a){const tone=p.tone??220,decay=p.decay??0.21;const nb=a.noise(0.22),nf=a.filter('bandpass',1800,0.85),ng=a.gain(v*0.9);nb.connect(nf);nf.connect(ng);a.send(ng,true);ng.gain.setValueAtTime(v*0.9,t);ng.gain.exponentialRampToValueAtTime(0.001,t+decay);nb.start(t);nb.stop(t+decay+0.04);const o=a.osc(tone,'triangle'),og=a.gain(v*0.45);o.frequency.exponentialRampToValueAtTime(tone*0.35,t+0.14);o.connect(og);a.send(og);og.gain.setValueAtTime(v*0.45,t);og.gain.exponentialRampToValueAtTime(0.001,t+0.17);o.start(t);o.stop(t+0.2);},
  hat(t,v,p,a){const tone=p.tone??8500,decay=p.decay??0.04;const nb=a.noise(decay+0.01),nf=a.filter('highpass',tone),ng=a.gain(v*0.52);nb.connect(nf);nf.connect(ng);a.send(ng);ng.gain.setValueAtTime(v*0.52,t);ng.gain.exponentialRampToValueAtTime(0.001,t+decay);nb.start(t);nb.stop(t+decay+0.01);},
  clap(t,v,p,a){[0,0.011,0.024].forEach(d=>{const nb=a.noise(0.1),nf=a.filter('bandpass',1500,1.1),ng=a.gain(v*0.68);nb.connect(nf);nf.connect(ng);a.send(ng,true);ng.gain.setValueAtTime(v*0.68,t+d);ng.gain.exponentialRampToValueAtTime(0.001,t+d+0.1);nb.start(t+d);nb.stop(t+d+0.12);});},
  '808'(t,v,p,a){const pitch=p.pitch??55,decay=p.decay??0.6;const o=a.osc(pitch*2,'sine'),of=a.filter('lowpass',280+pitch*0.5),og=a.gain(v*0.95);o.frequency.exponentialRampToValueAtTime(pitch*0.84,t+0.08);o.connect(of);of.connect(og);a.send(og,true,true);og.gain.setValueAtTime(v*0.95,t);og.gain.exponentialRampToValueAtTime(0.001,t+decay);o.start(t);o.stop(t+decay+0.1);},
  rim(t,v,p,a){const nb=a.noise(0.035),nf=a.filter('bandpass',2600,2.4),ng=a.gain(v*0.6);nb.connect(nf);nf.connect(ng);a.send(ng);ng.gain.setValueAtTime(v*0.6,t);ng.gain.exponentialRampToValueAtTime(0.001,t+0.035);nb.start(t);nb.stop(t+0.045);},
  reese(t,v,p,a){const pitch=p.pitch??55,cutoff=p.cutoff??400,sweep=p.sweep??0.9;const o1=a.osc(pitch,'sawtooth'),o2=a.osc(pitch*1.013,'sawtooth');const of=a.filter('lowpass',cutoff,2),og=a.gain(v*0.85);of.frequency.setValueAtTime(cutoff*0.45,t);of.frequency.linearRampToValueAtTime(cutoff*2.2,t+sweep*0.5);of.frequency.linearRampToValueAtTime(cutoff*0.45,t+sweep);o1.connect(of);o2.connect(of);of.connect(og);a.send(og,true,true);og.gain.setValueAtTime(v*0.85,t);og.gain.exponentialRampToValueAtTime(0.001,t+sweep+0.1);o1.start(t);o2.start(t);o1.stop(t+sweep+0.15);o2.stop(t+sweep+0.15);},
  wobble(t,v,p,a){const pitch=p.pitch??110,rate=p.rate??4,depth=p.depth??600;const o=a.osc(pitch,'sawtooth'),lfo=a.osc(rate,'sine'),lfoG=a.gain(depth);const of=a.filter('lowpass',600,4),og=a.gain(v*0.75);lfo.connect(lfoG);lfoG.connect(of.frequency);o.connect(of);of.connect(og);a.send(og,true,true);og.gain.setValueAtTime(v*0.75,t);og.gain.exponentialRampToValueAtTime(0.001,t+0.9);o.start(t);lfo.start(t);o.stop(t+1);lfo.stop(t+1);},
  acid(t,v,p,a){const pitch=p.pitch??110,cutoff=p.cutoff??300,res=p.res??6;const o=a.osc(pitch,'sawtooth'),of=a.filter('lowpass',cutoff,res),og=a.gain(v*0.8);of.frequency.setValueAtTime(cutoff,t);of.frequency.exponentialRampToValueAtTime(cutoff*16,t+0.04);of.frequency.exponentialRampToValueAtTime(cutoff*1.3,t+0.3);o.connect(of);of.connect(og);a.send(og,false,true);og.gain.setValueAtTime(v*0.8,t);og.gain.exponentialRampToValueAtTime(0.001,t+0.32);o.start(t);o.stop(t+0.38);},
  stab(t,v,p,a){const pitch=p.pitch??220,detune=p.detune??5;[-detune,-detune*0.4,0,detune*0.4,detune].forEach(det=>{const f=pitch*Math.pow(2,det/100),o=a.osc(f,'sawtooth'),og=a.gain(v*0.12);const fl=a.filter('lowpass',2400,1.5);o.connect(fl);fl.connect(og);a.send(og,true);og.gain.setValueAtTime(v*0.12,t);og.gain.exponentialRampToValueAtTime(0.001,t+0.08);o.start(t);o.stop(t+0.1);});},
  openhat(t,v,p,a){const decay=p.decay??0.34;const nb=a.noise(decay+0.04),nf=a.filter('highpass',7000),ng=a.gain(v*0.48);nb.connect(nf);nf.connect(ng);a.send(ng,true);ng.gain.setValueAtTime(v*0.48,t);ng.gain.exponentialRampToValueAtTime(0.001,t+decay);nb.start(t);nb.stop(t+decay+0.04);},
  crash(t,v,p,a){const nb=a.noise(1),nf=a.filter('highpass',4400),ng=a.gain(v*0.48);nb.connect(nf);nf.connect(ng);a.send(ng,true);ng.gain.setValueAtTime(v*0.48,t);ng.gain.exponentialRampToValueAtTime(0.001,t+0.9);nb.start(t);nb.stop(t+1);},
  laser(t,v,p,a){const o=a.osc(180,'sine'),og=a.gain(v*0.8);o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(3400,t+0.04);o.frequency.exponentialRampToValueAtTime(80,t+0.22);o.connect(og);a.send(og,true,true);og.gain.setValueAtTime(v*0.8,t);og.gain.exponentialRampToValueAtTime(0.001,t+0.25);o.start(t);o.stop(t+0.3);},
  glitch(t,v,p,a){for(let i=0;i<5;i++){const d=i*0.018;const nb=a.noise(0.035),nf=a.filter('bandpass',800+i*900,2.2),ng=a.gain(v*0.38*(1-i*0.14));nb.connect(nf);nf.connect(ng);a.send(ng);ng.gain.setValueAtTime(v*0.38,t+d);ng.gain.exponentialRampToValueAtTime(0.001,t+d+0.035);nb.start(t+d);nb.stop(t+d+0.045);}},
  noise(t,v,p,a){const nb=a.noise(0.08),nf=a.filter('bandpass',2800,0.85),ng=a.gain(v*0.6);nb.connect(nf);nf.connect(ng);a.send(ng,true);ng.gain.setValueAtTime(v*0.6,t);ng.gain.exponentialRampToValueAtTime(0.001,t+0.08);nb.start(t);nb.stop(t+0.1);},
  riser(t,v,p,a){const o=a.osc(55,'sawtooth'),of=a.filter('lowpass',200),og=a.gain(0.45);o.frequency.exponentialRampToValueAtTime(4400,t+2);of.frequency.exponentialRampToValueAtTime(12000,t+2);o.connect(of);of.connect(og);a.send(og,true);og.gain.setValueAtTime(0.001,t);og.gain.linearRampToValueAtTime(0.5,t+1.6);og.gain.exponentialRampToValueAtTime(0.001,t+2);o.start(t);o.stop(t+2.1);},
  drone(t,v,p,a){const pitch=p.pitch??55;[1,2,3].forEach((h,i)=>{const o=a.osc(pitch*h*(1+(Math.random()-0.5)*0.005),'sawtooth');const og=a.gain(v*0.22/(i+1)),fl=a.filter('lowpass',200+pitch*h*0.8,1.5);o.connect(fl);fl.connect(og);a.send(og,true);og.gain.setValueAtTime(0,t);og.gain.linearRampToValueAtTime(v*0.2/(i+1),t+0.3);og.gain.exponentialRampToValueAtTime(0.001,t+2);o.start(t);o.stop(t+2.2);});},
  scream(t,v,p,a){const nb=a.noise(0.3),nf=a.filter('bandpass',1200+Math.random()*400,6),ng=a.gain(v*0.6);nb.connect(nf);nf.connect(ng);a.send(ng,true,false,true);ng.gain.setValueAtTime(0,t);ng.gain.linearRampToValueAtTime(v*0.7,t+0.04);ng.gain.exponentialRampToValueAtTime(0.001,t+0.32);nb.start(t);nb.stop(t+0.38);},
  vinyl(t,v,p,a){const nb=a.noise(0.18),nf=a.filter('highpass',2000),ng=a.gain(v*0.2);nb.connect(nf);nf.connect(ng);a.send(ng);ng.gain.setValueAtTime(v*0.2,t);ng.gain.exponentialRampToValueAtTime(0.001,t+0.18);nb.start(t);nb.stop(t+0.2);},
};

function mount(instanceId, sBus, audio, config = {}) {
  /* sBus.publish → org:EVENT:instanceId (scoped to this instance)
     KERNEL.bus.publish → global (heard by all organisms)       */
  const gBus = KERNEL.bus;

  let curBank = 0;
  let volume  = config.volume ?? 0.88;
  let pitch   = config.pitch  ?? 0;
  let decay   = config.decay  ?? 0.3;
  const banks = BANKS.map(b => ({ ...b, pads: b.pads.map(p => ({ ...p })) }));

  function _fire(index, velocity) {
    if (!audio.AC) return;
    const pad = banks[curBank].pads[index];
    if (!pad) return;
    const voice = VOICES[pad.sound];
    if (voice) {
      const t = audio.AC.currentTime + 0.01;
      voice(t, velocity * volume, { pitch: Math.pow(2, pitch/12), decay }, audio);
    }
    gBus.publish('pad:trigger', { index, sound: pad.sound, velocity, bank: curBank, timestamp: audio.AC?.currentTime });
    sBus.publish('org:pad_lit', { index, color: pad.color, duration_ms: 130 });
  }

  function _setBank(bankIdx) {
    curBank = Math.max(0, Math.min(banks.length - 1, bankIdx));
    gBus.publish('pad:bank-change', { bank: curBank, pads: banks[curBank].pads });
    _syncUI();
  }

  function _syncUI() {
    sBus.publish('org:state_sync', {
      bank: curBank,
      pads: banks[curBank].pads,
      config: { volume, pitch, decay },
      voiceNames: Object.keys(VOICES),
    });
  }

  const _unsubs = [
    sBus.global.subscribe('ui:pad_press:' + instanceId,   ({ index, velocity }) => { if (typeof index === 'number') _fire(index, velocity ?? 0.9); }),
    sBus.global.subscribe('ui:bank_select:' + instanceId, ({ bank }) => _setBank(bank)),
    sBus.global.subscribe('ui:pad_assign:' + instanceId,  ({ index, sound, color }) => {
      if (typeof index === 'number' && sound) {
        banks[curBank].pads[index].sound = sound;
        if (color) banks[curBank].pads[index].color = color;
        _syncUI();
      }
    }),
    sBus.global.subscribe('ui:config_change:' + instanceId, ({ key, value }) => {
      if (key === 'volume') volume = value;
      if (key === 'pitch')  pitch  = value;
      if (key === 'decay')  decay  = value;
    }),
    gBus.subscribe('seq:fire', ({ track }) => {
      const pad = banks[curBank].pads[track];
      if (pad) sBus.publish('org:pad_lit', { index: track, color: pad.color, duration_ms: 100 });
    }),
    gBus.subscribe('midi:note', ({ note, velocity }) => {
      const idx = note - 36;
      if (idx >= 0 && idx < 16) _fire(idx, velocity);
    }),
  ];

  const KEY_MAP = { q:0,w:1,e:2,r:3,a:4,s:5,d:6,f:7,z:8,x:9,c:10,v:11,'1':12,'2':13,'3':14,'4':15 };
  const _keyHandler = ev => {
    if (ev.target.tagName === 'SELECT' || ev.target.tagName === 'INPUT') return;
    const i = KEY_MAP[ev.key?.toLowerCase()];
    if (i !== undefined) { KERNEL.audio.boot(); _fire(i, 0.9); }
  };
  document.addEventListener('keydown', _keyHandler);

  /* Push initial state — UI is already subscribed at this point */
  _syncUI();

  KERNEL.registry.register({
    instanceId, id: 'eravos.pads', label: 'Drum Machine',
    provides: ['capability.pad_trigger', 'capability.audio_out', 'capability.bank_select'],
    requires: ['capability.audio_context'],
    permissions: ['audio_out', 'midi_in', 'bus_publish', 'bus_subscribe'],
    hooks: [
      { hook_id: 'pads.hook.pad_trigger_out',  direction: 'out', event_type: 'pad:trigger',     contract_version: '1.0.0' },
      { hook_id: 'pads.hook.seq_fire_in',      direction: 'in',  event_type: 'seq:fire',        contract_version: '1.0.0' },
      { hook_id: 'pads.hook.midi_in',          direction: 'in',  event_type: 'midi:note',       contract_version: '1.0.0' },
      { hook_id: 'pads.hook.bank_change_out',  direction: 'out', event_type: 'pad:bank-change', contract_version: '1.0.0' },
    ],
  });

  return {
    unmount() {
      _unsubs.forEach(u => u());
      document.removeEventListener('keydown', _keyHandler);
      KERNEL.registry.unregister(instanceId);
    },
    fire: _fire, setBank: _setBank, syncUI: _syncUI,
  };
}

return { mount, BANKS, VOICES };
})();

---

# kernel/kernel.js

/* ═══════════════════════════════════════════════════════════
   ERAVOS KERNEL  v3.0.0
   ═══════════════════════════════════════════════════════════

   Axioms (from ERAVOS.kernel.spec):
   K-1  Nothing exists until registered
   K-2  Nothing silently fails
   K-3  No organism touches another directly
   K-4  Every connection is a wire
   K-5  Wires owned by wire registry
   K-6  Every mutation recorded before it applies
   K-7  Contracts match before wire goes live
   K-8  Permissions enforced, never trusted
   K-9  Everything removable
   K-10 Spec is source of truth

   Exports:  window.KERNEL
   Requires: nothing
   ═══════════════════════════════════════════════════════════ */

window.KERNEL = (() => {
'use strict';

/* ──────────────────────────────────────────────────────────
   BUS  — publish/subscribe event backbone
   No organism talks to another organism directly.
   Everything goes through here.
────────────────────────────────────────────────────────── */
const _subs = {};

const bus = {
  publish(topic, payload = {}) {
    if (!topic) return;
    (_subs[topic] || []).slice().forEach(fn => {
      try { fn(payload); }
      catch(e) { _fault('RUNTIME_003', null, `bus handler error on ${topic}: ${e.message}`); }
    });
  },
  subscribe(topic, fn) {
    (_subs[topic] = _subs[topic] || []).push(fn);
    return () => { _subs[topic] = (_subs[topic] || []).filter(f => f !== fn); };
  },
  once(topic, fn) {
    const unsub = bus.subscribe(topic, payload => { unsub(); fn(payload); });
    return unsub;
  },
};

/* ──────────────────────────────────────────────────────────
   FAULT  — named, loud, traced (K-2)
────────────────────────────────────────────────────────── */
function _fault(code, organismId, message) {
  const entry = { code, organismId, message, timestamp: Date.now() };
  ledger._write({ type: 'fault_raised', ...entry });
  bus.publish('kernel:fault', entry);
  console.error(`[ERAVOS FAULT ${code}]${organismId ? ' organism:'+organismId : ''} ${message}`);
  return entry;
}

/* ──────────────────────────────────────────────────────────
   CAUSAL LEDGER  — append-only, every mutation recorded (K-6)
────────────────────────────────────────────────────────── */
const _ledgerEntries = [];

const ledger = {
  _write(entry) {
    _ledgerEntries.push({ ...entry, ts: Date.now() });
    bus.publish('kernel:ledger-entry', entry);
  },
  entries() { return _ledgerEntries.slice(); },
  since(ts)  { return _ledgerEntries.filter(e => e.ts >= ts); },
};

/* ──────────────────────────────────────────────────────────
   PERMISSION ENFORCER  (K-8)
   Granted permissions stored per organism instance.
   Kernel checks before any privileged operation.
────────────────────────────────────────────────────────── */
const _grants = new Map(); /* instanceId → Set<permission> */

const permissions = {
  grant(instanceId, permList) {
    _grants.set(instanceId, new Set(permList));
    ledger._write({ type: 'permissions_granted', instanceId, permissions: permList });
  },
  check(instanceId, perm) {
    const g = _grants.get(instanceId);
    if (!g || !g.has(perm)) {
      _fault('MOUNT_003', instanceId, `permission denied: ${perm}`);
      return false;
    }
    return true;
  },
  revoke(instanceId) {
    _grants.delete(instanceId);
  },
  list(instanceId) {
    return [...(_grants.get(instanceId) || [])];
  },
};

/* ──────────────────────────────────────────────────────────
   ORGANISM REGISTRY  (K-1, K-9)
   Everything that exists is registered here.
   If it's not here, it doesn't exist.
────────────────────────────────────────────────────────── */
const _organisms = new Map(); /* instanceId → descriptor */

const registry = {
  register(descriptor) {
    const { instanceId, id, label, hooks, permissions: perms, provides, requires } = descriptor;
    if (_organisms.has(instanceId)) {
      _fault('MOUNT_006', instanceId, `duplicate instance id: ${instanceId}`);
      return false;
    }
    _organisms.set(instanceId, {
      ...descriptor,
      mountedAt: Date.now(),
      state: 'mounted',
    });
    permissions.grant(instanceId, perms || []);
    ledger._write({ type: 'organism_mounted', instanceId, id, label });
    bus.publish('kernel:organism-mounted', { instanceId, id, label, provides });
    return true;
  },

  unregister(instanceId) {
    const org = _organisms.get(instanceId);
    if (!org) return false;
    wireRegistry.removeAll(instanceId);
    permissions.revoke(instanceId);
    _organisms.delete(instanceId);
    ledger._write({ type: 'organism_unmounted', instanceId, id: org.id });
    bus.publish('kernel:organism-unmounted', { instanceId, id: org.id });
    return true;
  },

  get(instanceId)   { return _organisms.get(instanceId) || null; },
  getById(id)       { return [..._organisms.values()].filter(o => o.id === id); },
  all()             { return [..._organisms.values()]; },
  has(instanceId)   { return _organisms.has(instanceId); },

  /* Check all required capabilities are satisfied */
  checkRequires(requires = []) {
    const provided = new Set();
    _organisms.forEach(org => (org.provides || []).forEach(c => provided.add(c)));
    const missing = requires.filter(r => !provided.has(r));
    return { ok: missing.length === 0, missing };
  },
};

/* ──────────────────────────────────────────────────────────
   WIRE REGISTRY  (K-4, K-5, K-7)
   Wires connect hooks between organisms.
   Validates contract versions before going live.
   Owned here — never by organisms.
────────────────────────────────────────────────────────── */
const _wires = new Map(); /* wireId → descriptor */

const wireRegistry = {
  register(wire) {
    const { sourceInstanceId, sourceHookId, targetInstanceId, targetHookId, wireType = 'event_bus' } = wire;

    /* Validate both endpoints exist */
    if (!registry.has(sourceInstanceId)) {
      _fault('WIRE_002', sourceInstanceId, `source organism not found: ${sourceInstanceId}`);
      return null;
    }
    if (!registry.has(targetInstanceId)) {
      _fault('WIRE_002', targetInstanceId, `target organism not found: ${targetInstanceId}`);
      return null;
    }

    /* Validate hook contract versions if both declare them */
    const src = registry.get(sourceInstanceId);
    const tgt = registry.get(targetInstanceId);
    const srcHook = (src.hooks || []).find(h => h.hook_id === sourceHookId);
    const tgtHook = (tgt.hooks || []).find(h => h.hook_id === targetHookId);
    if (srcHook && tgtHook && srcHook.contract_version && tgtHook.contract_version) {
      if (srcHook.contract_version !== tgtHook.contract_version) {
        _fault('WIRE_001', sourceInstanceId,
          `contract version mismatch: ${srcHook.contract_version} vs ${tgtHook.contract_version}`);
        return null;
      }
    }

    /* No duplicate */
    const key = `${sourceInstanceId}:${sourceHookId}→${targetInstanceId}:${targetHookId}`;
    if ([..._wires.values()].find(w => w.key === key)) {
      _fault('WIRE_004', sourceInstanceId, `duplicate wire: ${key}`);
      return null;
    }

    const wireId = _uuid();
    _wires.set(wireId, {
      wireId, key, wireType,
      sourceInstanceId, sourceHookId,
      targetInstanceId, targetHookId,
      registeredAt: Date.now(),
    });

    ledger._write({ type: 'wire_registered', wireId, sourceInstanceId, sourceHookId, targetInstanceId, targetHookId });
    bus.publish('kernel:wire-registered', { wireId, sourceInstanceId, targetInstanceId });
    return wireId;
  },

  remove(wireId) {
    const wire = _wires.get(wireId);
    if (!wire) return false;
    _wires.delete(wireId);
    ledger._write({ type: 'wire_removed', wireId });
    bus.publish('kernel:wire-removed', { wireId });
    return true;
  },

  removeAll(instanceId) {
    const toRemove = [..._wires.entries()]
      .filter(([, w]) => w.sourceInstanceId === instanceId || w.targetInstanceId === instanceId)
      .map(([id]) => id);
    toRemove.forEach(id => this.remove(id));
  },

  get(wireId)    { return _wires.get(wireId) || null; },
  all()          { return [..._wires.values()]; },
  forOrganism(instanceId) {
    return [..._wires.values()].filter(
      w => w.sourceInstanceId === instanceId || w.targetInstanceId === instanceId
    );
  },
};

/* ──────────────────────────────────────────────────────────
   AUDIO  — single AudioContext, node factories, master bus
────────────────────────────────────────────────────────── */
let _AC = null;
let _masterGain = null;
let _reverbNode = null;
let _delayNode  = null;
let _compressor = null;
let _reverbSend = null;  /* gain: dry voices connect here to reach the reverb */
let _reverbRet  = null;  /* gain: reverb tail level into the master chain */
let _delaySend  = null;  /* gain: dry voices connect here to reach the delay */
let _delayRet   = null;  /* gain: delay tail level into the master chain */
let _delayFB    = null;  /* gain: feedback loop amount */

function _buildImpulse(AC, seconds = 2.4, decay = 3.2) {
  /* Procedurally generated stereo impulse response — no external IR file
     available in a file:// pack, so synthesize exponentially-decaying
     noise per channel (classic algorithmic-reverb IR technique). */
  const len = Math.max(1, Math.floor(AC.sampleRate * seconds));
  const buf = AC.createBuffer(2, len, AC.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

const audio = {
  get AC() { return _AC; },
  get dry() { return _masterGain; },
  get reverbSend() { return _reverbSend; },
  get delaySend()  { return _delaySend; },

  boot() {
    if (_AC) return _AC;
    _AC = new (window.AudioContext || window.webkitAudioContext)();
    _compressor  = _AC.createDynamicsCompressor();
    _masterGain  = _AC.createGain(); _masterGain.gain.value = 0.88;
    _masterGain.connect(_compressor);
    _compressor.connect(_AC.destination);

    /* ── Reverb send bus: send gain → convolver → return gain → compressor ── */
    _reverbNode  = _AC.createConvolver();
    _reverbNode.buffer = _buildImpulse(_AC);
    _reverbSend  = _AC.createGain(); _reverbSend.gain.value = 1;
    _reverbRet   = _AC.createGain(); _reverbRet.gain.value  = 0.35;
    _reverbSend.connect(_reverbNode);
    _reverbNode.connect(_reverbRet);
    _reverbRet.connect(_compressor);

    /* ── Delay send bus: send gain → delay → return gain → compressor,
       with a feedback loop (delay → feedback gain → delay) for repeats ── */
    _delayNode   = _AC.createDelay(2.0); _delayNode.delayTime.value = 0.32;
    _delaySend   = _AC.createGain(); _delaySend.gain.value = 1;
    _delayRet    = _AC.createGain(); _delayRet.gain.value  = 0.28;
    _delayFB     = _AC.createGain(); _delayFB.gain.value   = 0.35;
    _delaySend.connect(_delayNode);
    _delayNode.connect(_delayFB);
    _delayFB.connect(_delayNode);
    _delayNode.connect(_delayRet);
    _delayRet.connect(_compressor);

    bus.publish('kernel:audio-ready', { sampleRate: _AC.sampleRate });
    return _AC;
  },

  /* Master FX parameter access — used by the Master FX organism */
  setReverb({ mix, time, decay } = {}) {
    if (!_AC) this.boot();
    if (mix  != null) _reverbRet.gain.value = mix;
    if (time != null || decay != null) _reverbNode.buffer = _buildImpulse(_AC, time ?? 2.4, decay ?? 3.2);
  },
  setDelay({ mix, time, feedback } = {}) {
    if (!_AC) this.boot();
    if (mix      != null) _delayRet.gain.value = mix;
    if (time     != null) _delayNode.delayTime.setTargetAtTime(time, _AC.currentTime, 0.01);
    if (feedback != null) _delayFB.gain.value = Math.min(0.92, feedback);
  },
  setCompressor({ threshold, ratio, attack, release, knee } = {}) {
    if (!_AC) this.boot();
    if (threshold != null) _compressor.threshold.setTargetAtTime(threshold, _AC.currentTime, 0.01);
    if (ratio     != null) _compressor.ratio.setTargetAtTime(ratio, _AC.currentTime, 0.01);
    if (attack    != null) _compressor.attack.setTargetAtTime(attack, _AC.currentTime, 0.01);
    if (release   != null) _compressor.release.setTargetAtTime(release, _AC.currentTime, 0.01);
    if (knee      != null) _compressor.knee.setTargetAtTime(knee, _AC.currentTime, 0.01);
  },
  get compressor() { return _compressor; },
  get masterGainNode() { return _masterGain; },

  osc(freq = 440, type = 'sine') {
    if (!_AC) this.boot();
    const o = _AC.createOscillator(); o.type = type; o.frequency.value = freq; return o;
  },
  gain(val = 1) {
    if (!_AC) this.boot();
    const g = _AC.createGain(); g.gain.value = val; return g;
  },
  filter(type = 'lowpass', freq = 1000, Q = 1) {
    if (!_AC) this.boot();
    const f = _AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = Q; return f;
  },
  noise(dur = 0.1) {
    if (!_AC) this.boot();
    const len = Math.ceil(_AC.sampleRate * dur);
    const buf = _AC.createBuffer(1, len, _AC.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const s = _AC.createBufferSource(); s.buffer = buf; return s;
  },
  send(node, withReverb = false, withDelay = false, withComp = false) {
    if (!_masterGain) this.boot();
    node.connect(withComp ? _compressor : _masterGain);
    if (withReverb) node.connect(_reverbSend);
    if (withDelay)  node.connect(_delaySend);
  },
  analyser() {
    if (!_AC) this.boot();
    const a = _AC.createAnalyser(); a.fftSize = 256;
    _masterGain.connect(a);
    return a;
  },
};

/* ──────────────────────────────────────────────────────────
   CLOCK  — master BPM, step timing
────────────────────────────────────────────────────────── */
let _bpm = 128;

const clock = {
  get BPM()    { return _bpm; },
  set BPM(v)   {
    _bpm = Math.max(40, Math.min(240, Math.round(v)));
    bus.publish('kernel:bpm-change', { BPM: _bpm });
  },
  stepMs(swing = false, stepIdx = 0) {
    const base = (60 / _bpm / 4) * 1000;
    if (!swing) return base;
    return stepIdx % 2 === 0 ? base * 1.12 : base * 0.88;
  },
  beatSec()  { return 60 / _bpm; },
  barSec()   { return (60 / _bpm) * 4; },
};

/* ──────────────────────────────────────────────────────────
   MANIFEST PARSER  — reads pack manifest.json
────────────────────────────────────────────────────────── */
const manifestParser = {
  validate(manifest) {
    const required = ['manifest_version', 'pack_id', 'pack_type', 'permissions', 'contents'];
    const missing  = required.filter(k => !(k in manifest));
    if (missing.length) {
      _fault('MOUNT_005', null, `manifest missing required fields: ${missing.join(', ')}`);
      return false;
    }
    return true;
  },

  parse(jsonText) {
    try {
      const m = JSON.parse(jsonText);
      if (!this.validate(m)) return null;
      return m;
    } catch(e) {
      _fault('MOUNT_005', null, `manifest JSON parse failed: ${e.message}`);
      return null;
    }
  },
};

/* ──────────────────────────────────────────────────────────
   ZIP IMPORTER  — handles drop-in zip install
   Reads manifest.json, validates, checks permissions,
   routes to organism spawner.
────────────────────────────────────────────────────────── */
const zipImporter = {
  async install(arrayBuffer, dropPos, onPermissionRequest) {
    /* Read zip — use JSZip if available, otherwise treat as signal */
    let manifest = null;
    let files    = {};

    if (window.JSZip) {
      try {
        const zip = await JSZip.loadAsync(arrayBuffer);
        const mf  = zip.file('manifest.json');
        if (!mf) { _fault('MOUNT_005', null, 'manifest.json not found in zip'); return null; }
        const mfText = await mf.async('string');
        manifest = manifestParser.parse(mfText);
        if (!manifest) return null;
        /* Read all declared files */
        for (const [role, path] of Object.entries(manifest.contents?.ui || {})) {
          const f = zip.file(path);
          if (f) files[path] = await f.async('string');
        }
      } catch(e) {
        _fault('ASSET_001', null, `zip read failed: ${e.message}`);
        return null;
      }
    } else {
      _fault('ASSET_001', null, 'JSZip not available — zip install requires JSZip');
      return null;
    }

    /* Check kernel_target */
    if (manifest.kernel_target && manifest.kernel_target > '3.0.0') {
      _fault('MOUNT_004', null, `requires kernel ${manifest.kernel_target}, running 3.0.0`);
      return null;
    }

    /* Request permissions */
    const perms = manifest.permissions || [];
    if (perms.length > 0 && onPermissionRequest) {
      const granted = await onPermissionRequest(manifest.pack_id, manifest.label, perms);
      if (!granted) {
        _fault('MOUNT_003', null, `user denied permissions for ${manifest.pack_id}`);
        return null;
      }
    }

    /* Check requires */
    const req = manifest.requires || [];
    if (req.length) {
      const { ok, missing } = registry.checkRequires(req);
      if (!ok) {
        _fault('MOUNT_002', null, `missing capabilities: ${missing.join(', ')}`);
        return null;
      }
    }

    ledger._write({ type: 'pack_installed', packId: manifest.pack_id, label: manifest.label });
    bus.publish('kernel:pack-installed', { packId: manifest.pack_id, manifest, files, dropPos });
    return { manifest, files };
  },
};

/* ──────────────────────────────────────────────────────────
   INTERACTION CONTRACT BRIDGE
   Validates event schemas on the UI ↔ organism boundary.
   UI publishes ui:* events. Organism publishes org:* events.
   Both validated here before delivery.
────────────────────────────────────────────────────────── */
const _uiSchemas = new Map(); /* eventType → schema */

const contractBridge = {
  registerSchema(eventType, schema) {
    _uiSchemas.set(eventType, schema);
  },
  validate(eventType, payload) {
    const schema = _uiSchemas.get(eventType);
    if (!schema) return true; /* no schema registered = pass */
    /* Basic required field check */
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in payload)) {
          _fault('RUNTIME_002', null, `${eventType} missing required field: ${key}`);
          return false;
        }
      }
    }
    return true;
  },
  /* Wrap bus.publish with contract validation */
  publish(eventType, payload, instanceId) {
    if (!this.validate(eventType, payload)) return;
    bus.publish(eventType, payload);
  },
};

/* ──────────────────────────────────────────────────────────
   UTIL
────────────────────────────────────────────────────────── */
function _uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/* ──────────────────────────────────────────────────────────
   PUBLIC API
────────────────────────────────────────────────────────── */
return {
  /* Core primitives */
  bus,
  audio,
  clock,
  ledger,
  permissions,

  /* Registries */
  registry,
  wireRegistry,

  /* Install */
  zipImporter,
  manifestParser,

  /* Contract */
  contractBridge,

  /* Fault */
  fault: _fault,

  /* Util */
  uuid: _uuid,

  /* Version */
  version: '3.0.0',
};

})();

---

# kernel/intake.js

/* ═══════════════════════════════════════════════════════════
   ERAVOS INTAKE  v3.0.0
   File identification, FNV hash, MIME detection, type routing.
   Every file entering ERAVOS goes through here first.
   ═══════════════════════════════════════════════════════════ */

window.Intake = (() => {
'use strict';

const TYPES = [
  { id:'audio:sample', label:'Audio Sample', icon:'🎵',
    exts:['wav','mp3','ogg','flac','aiff','aif','m4a','opus'],
    mimes:['audio/'] },
  { id:'audio:midi', label:'MIDI', icon:'🎹',
    exts:['mid','midi'], mimes:['audio/midi','audio/x-midi'],
    magic:[0x4D,0x54,0x68,0x64] },
  { id:'image', label:'Image', icon:'🖼️',
    exts:['png','jpg','jpeg','gif','webp','svg','bmp'], mimes:['image/'] },
  { id:'video', label:'Video', icon:'🎬',
    exts:['mp4','webm','mov','avi'], mimes:['video/'] },
  { id:'zip', label:'Plugin Pack', icon:'📦',
    exts:['zip'], mimes:['application/zip'],
    magic:[0x50,0x4B,0x03,0x04] },
  { id:'json:preset',  label:'Preset',  icon:'🎛️', exts:['json'], mimes:['application/json'],
    jsonDetect: p => !!(p && (p._eravos || p.comp_id || p.manifest_version)) },
  { id:'json:pattern', label:'Pattern', icon:'🥁', exts:['json'], mimes:['application/json'],
    jsonDetect: p => !!(p && p.tracks && Array.isArray(p.tracks)) },
  { id:'json:generic', label:'JSON',    icon:'{ }', exts:['json'], mimes:['application/json'],
    jsonDetect: () => true },
  { id:'text', label:'Text', icon:'📄',
    exts:['txt','md','csv','spec','log'], mimes:['text/'] },
];

function _fnv32(bytes) {
  let h = 0x811c9dc5;
  const view = new Uint8Array(bytes);
  const len  = Math.min(view.length, 4096);
  for (let i = 0; i < len; i++) { h ^= view[i]; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

function _matchMagic(bytes, magic) {
  if (!magic || !bytes || bytes.byteLength < magic.length) return false;
  const v = new Uint8Array(bytes);
  return magic.every((b, i) => v[i] === b);
}

async function _identify(file) {
  const ext  = (file.name.split('.').pop() || '').toLowerCase();
  const mime = file.type || '';
  let buf = null, parsed = null;

  try { buf = await file.arrayBuffer(); }
  catch(e) { return { id:'error', name:file.name, icon:'⚠', error:`Read failed: ${e.message}`, file }; }

  const hash = _fnv32(buf);

  if (ext === 'json' || mime.includes('json')) {
    try { parsed = JSON.parse(new TextDecoder().decode(buf)); }
    catch(e) { return { id:'error', name:file.name, icon:'⚠', error:'JSON parse failed', file, hash, sizeBytes:file.size }; }
    for (const t of TYPES) {
      if (t.exts?.includes('json') && t.jsonDetect?.(parsed))
        return { id:t.id, name:file.name, label:t.label, icon:t.icon, hash, sizeBytes:file.size, mimeType:mime, arrayBuffer:buf, file, meta:{ parsed } };
    }
  }

  for (const t of TYPES) {
    if (t.magic && _matchMagic(buf, t.magic))
      return { id:t.id, name:file.name, label:t.label, icon:t.icon, hash, sizeBytes:file.size, mimeType:mime, arrayBuffer:buf, file };
  }

  for (const t of TYPES) {
    if (t.mimes?.some(m => mime.startsWith(m)))
      return { id:t.id, name:file.name, label:t.label, icon:t.icon, hash, sizeBytes:file.size, mimeType:mime, arrayBuffer:buf, file };
  }

  for (const t of TYPES) {
    if (t.exts?.includes(ext))
      return { id:t.id, name:file.name, label:t.label, icon:t.icon, hash, sizeBytes:file.size, mimeType:mime, arrayBuffer:buf, file };
  }

  return { id:'unknown', name:file.name, label:'Unknown', icon:'?', hash, sizeBytes:file.size, mimeType:mime, arrayBuffer:buf, file };
}

async function ingestAll(fileList, bus) {
  const results = [];
  for (const file of Array.from(fileList)) {
    const r = await _identify(file);
    if (bus) bus.publish('intake:file', r);
    results.push(r);
  }
  return results;
}

async function ingestOne(file, bus) {
  const r = await _identify(file);
  if (bus) bus.publish('intake:file', r);
  return r;
}

function types() { return TYPES.map(t => ({ id:t.id, label:t.label, icon:t.icon })); }

return { ingestAll, ingestOne, types };
})();

---

# index.html

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ERAVOS v3</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">

<!-- ════════════════════════════════════════════════════════
     LOAD ORDER — bottom-up, no ES modules, no build step
     L0: Kernel primitives (bus, audio, clock, registry)
     L1: Runtime (WM, ALK-GL, canvas-CFR)
     L2: Organism engines (logic only, no DOM)
     L3: Organism factory (UI projections)
     L4: Shell script (wires everything, locked after this)
     ════════════════════════════════════════════════════════ -->

<!-- L0: Kernel -->
<script src="kernel/kernel.js"></script>
<script src="kernel/intake.js"></script>

<!-- L1: Runtime -->
<script src="runtime/canvas-wm.js"></script>
<script src="runtime/alk-gl.js"></script>
<script src="runtime/canvas-cfr.js"></script>
<script src="runtime/master-transport.js"></script>
<script src="runtime/wire-system.js"></script>
<script src="runtime/precision-clock.js"></script>

<!-- L2: Engines -->
<script src="organisms/pads/pads.engine.js"></script>
<script src="organisms/sequencer/sequencer.engine.js"></script>
<script src="organisms/timeline/timeline.engine.js"></script>
<script src="organisms/sample-player/sample-player.engine.js"></script>
<script src="organisms/edm-lab/edm-lab.engine.js"></script>
<script src="organisms/contrast-analyser/contrast-analyser.engine.js"></script>
<script src="organisms/bass-drop-builder/bass-drop-builder.engine.js"></script>
<script src="organisms/lfo/lfo.engine.js"></script>
<script src="organisms/wobble-bass/wobble-bass.engine.js"></script>
<script src="organisms/acid-synth/acid-synth.engine.js"></script>
<script src="organisms/reese-bass/reese-bass.engine.js"></script>
<script src="organisms/channel/channel.engine.js"></script>
<script src="organisms/xy-pad/xy-pad.engine.js"></script>
<script src="organisms/nexus-shared/nexus-node-core.js"></script>
<script src="organisms/nexus-cortex/nexus-cortex.engine.js"></script>
<script src="organisms/nexus-guardian/nexus-guardian.engine.js"></script>
<script src="organisms/nexus-bridge/nexus-bridge.engine.js"></script>
<script src="organisms/nexus-orchestrator/nexus-orchestrator.engine.js"></script>
<script src="organisms/nexus-diagnostic/nexus-diagnostic.engine.js"></script>
<script src="organisms/nexus-architect/nexus-architect.engine.js"></script>
<script src="organisms/nexus-idearium/nexus-idearium.engine.js"></script>

<script src="organisms/supersaw/supersaw.engine.js"></script>
<script src="organisms/sidechain-compressor/sidechain-compressor.engine.js"></script>
<script src="organisms/master-fx/master-fx.engine.js"></script>
<script src="organisms/photo-editor/photo-editor.engine.js"></script>
<script src="organisms/video-editor/video-editor.engine.js"></script>
<script src="organisms/serial-bridge/serial-bridge.engine.js"></script>
<script src="organisms/macro-automation/macro-automation.engine.js"></script>
<script src="organisms/webhook-automation/webhook-automation.engine.js"></script>

<!-- L3: Factory -->
<script src="runtime/organism-factory.js"></script>

<style>
/* ══════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════ */
:root {
  --accent:     #00ff88;
  --accent2:    #00d4ff;
  --accent3:    #ff2266;
  --accent4:    #aa44ff;
  --accent-rgb: 0,255,136;

  --bg0:#010308; --bg1:#060a12; --bg2:#0b1020;
  --bg3:#101828; --bg4:#161f30;
  --b1: #182035; --b2: #243048; --b3: #2e3d58;
  --white:#eef4ff; --dim:#4a6080; --dim2:#6a88a8;

  --orb:  'Orbitron', monospace;
  --raj:  'Rajdhani', sans-serif;
  --mono: 'Share Tech Mono', monospace;
  --tr:   0.12s cubic-bezier(.4,0,.2,1);
  --bar:  40px;
}

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
html,body { width:100%;height:100%;background:var(--bg0);color:var(--white);font-family:var(--raj,sans-serif);overflow:hidden;user-select:none; }

/* ── MENU BAR ── */
#menubar {
  position:fixed;top:0;left:0;right:0;height:var(--bar);
  background:rgba(6,10,18,.96);backdrop-filter:blur(8px);
  border-bottom:1px solid var(--b1);
  display:flex;align-items:center;
  z-index:9000;
}
.mb-logo {
  display:flex;align-items:center;gap:8px;
  padding:0 16px;height:100%;border-right:1px solid var(--b1);flex-shrink:0;
}
.mb-logo-name { font-family:var(--orb);font-size:12px;font-weight:900;letter-spacing:.24em;color:var(--accent); }
.mb-logo-ver  { font-family:var(--mono);font-size:6px;letter-spacing:.2em;color:var(--dim);align-self:flex-end;margin-bottom:3px; }


.mb-item {
  height:100%;display:flex;align-items:center;padding:0 14px;
  font-family:var(--mono);font-size:8px;letter-spacing:.12em;color:var(--dim2);
  cursor:pointer;border-right:1px solid var(--b1);
  transition:color var(--tr),background var(--tr);flex-shrink:0;
}
.mb-item:hover { color:var(--accent);background:rgba(var(--accent-rgb),.04); }
.mb-item.on    { color:var(--accent); }

#mb-accent { width:2px;height:24px;border-radius:1px;background:var(--accent);box-shadow:0 0 8px var(--accent);margin:0 6px;transition:background .1s,box-shadow .1s;flex-shrink:0; }

#mb-right { margin-left:auto;display:flex;align-items:center;height:100%;border-left:1px solid var(--b1); }
#mb-drop  { height:100%;display:flex;align-items:center;padding:0 14px;gap:8px;font-family:var(--mono);font-size:8px;letter-spacing:.12em;color:var(--dim);border-left:1px solid var(--b1);cursor:default;transition:color var(--tr); }
#mb-drop.active { color:var(--accent); }

/* ── OPTIONS PANEL ── */
#opts-panel {
  position:fixed;top:var(--bar);right:0;width:260px;
  background:var(--bg1);border:1px solid var(--b2);border-top:none;border-radius:0 0 0 6px;
  z-index:8999;display:none;flex-direction:column;padding:12px;gap:10px;
  box-shadow:-4px 8px 32px rgba(0,0,0,.5);
}
#opts-panel.open { display:flex; }
.opts-title { font-family:var(--orb);font-size:8px;font-weight:700;letter-spacing:.2em;color:var(--accent);margin-bottom:2px; }
.opts-row   { display:flex;align-items:center;gap:8px; }
.opts-btn   { flex:1;height:24px;border-radius:3px;border:1px solid var(--b2);background:transparent;color:var(--dim2);font-family:var(--mono);font-size:7.5px;letter-spacing:.08em;cursor:pointer;transition:all var(--tr);outline:none; }
.opts-btn:hover { border-color:var(--accent);color:var(--accent); }
.opts-div   { height:1px;background:var(--b1); }

/* ── CANVAS — CFR particle field replaces dot-grid ── */
#canvas {
  position:fixed;top:var(--bar);left:0;right:0;bottom:0;
  overflow:hidden;
  background-color:var(--bg0);
  /* dot-grid removed by canvas-cfr.js when WebGL2 is available */
  background-image:radial-gradient(circle,rgba(42,60,88,.42) 1px,transparent 1px);
  background-size:24px 24px;
}

/* ── HINT (over particle field) ── */
#hint {
  position:absolute;inset:0;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;
  pointer-events:none;transition:opacity .6s;z-index:1;
}
#hint.gone { opacity:0; }
.hint-word { font-family:var(--orb);font-size:72px;font-weight:900;letter-spacing:.18em;color:rgba(var(--accent-rgb),.035); }
.hint-line { font-family:var(--mono);font-size:9px;letter-spacing:.2em;color:rgba(255,255,255,.12);text-align:center;line-height:2.6; }

/* ── DROP OVERLAY ── */
#drop-overlay {
  position:fixed;inset:0;
  background:rgba(1,3,8,.82);border:2px dashed var(--accent);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
  z-index:9900;opacity:0;pointer-events:none;transition:opacity .15s;
}
#drop-overlay.active { opacity:1; }
.drop-icon  { font-size:56px;animation:bob .9s ease-in-out infinite alternate; }
@keyframes bob { from{transform:translateY(-8px);}to{transform:translateY(8px);} }
.drop-label { font-family:var(--orb);font-size:13px;font-weight:900;letter-spacing:.3em;color:var(--accent); }
.drop-sub   { font-family:var(--mono);font-size:8.5px;letter-spacing:.14em;color:var(--dim2);text-align:center;line-height:2.4; }

/* ── PERMISSIONS DIALOG ── */
#perm-dialog {
  position:fixed;inset:0;display:none;align-items:center;justify-content:center;
  background:rgba(0,0,0,.7);z-index:99990;
}
#perm-dialog.open { display:flex; }
.perm-box { background:var(--bg1);border:1px solid var(--b2);border-radius:6px;padding:24px;max-width:380px;width:90%;display:flex;flex-direction:column;gap:14px;box-shadow:0 16px 64px rgba(0,0,0,.6); }
.perm-title { font-family:var(--orb);font-size:11px;font-weight:900;letter-spacing:.18em;color:var(--accent); }
.perm-desc  { font-family:var(--mono);font-size:8px;color:var(--dim2);line-height:2; }
.perm-list  { display:flex;flex-direction:column;gap:4px; }
.perm-item  { font-family:var(--mono);font-size:8px;color:var(--white);padding:3px 8px;border-radius:3px;background:var(--bg3);border:1px solid var(--b1); }
.perm-btns  { display:flex;gap:8px; }
.perm-allow { flex:1;height:28px;border-radius:4px;border:1px solid var(--accent);background:rgba(var(--accent-rgb),.1);color:var(--accent);font-family:var(--mono);font-size:8px;letter-spacing:.1em;cursor:pointer;transition:all var(--tr);outline:none; }
.perm-allow:hover { background:rgba(var(--accent-rgb),.2); }
.perm-deny  { flex:1;height:28px;border-radius:4px;border:1px solid var(--b2);background:transparent;color:var(--dim2);font-family:var(--mono);font-size:8px;letter-spacing:.1em;cursor:pointer;transition:all var(--tr);outline:none; }
.perm-deny:hover  { border-color:var(--accent3);color:var(--accent3); }

/* ── NOTIFICATION ── */
#notif {
  position:fixed;bottom:18px;left:50%;
  transform:translateX(-50%) translateY(40px);
  background:rgba(6,10,18,.96);border:1px solid var(--accent);
  color:var(--accent);font-family:var(--mono);font-size:9px;letter-spacing:.12em;
  padding:5px 18px;border-radius:3px;z-index:9999;opacity:0;
  transition:all .22s cubic-bezier(.34,1.56,.64,1);pointer-events:none;white-space:nowrap;
}
#notif.show { opacity:1;transform:translateX(-50%) translateY(0); }
</style>
</head>
<body>

<!-- ══ MENU BAR ══ -->
<header id="menubar">
  <div class="mb-logo">
    <span class="mb-logo-name">ERAVOS</span>
    <span class="mb-logo-ver">v3</span>
  </div>

  <!-- Master transport -->
  <div id="mb-transport" style="display:flex;align-items:center;gap:0;height:100%;border-right:1px solid var(--b1);">
    <button id="tp-play"   title="Play / Stop (Space)" style="height:100%;width:38px;border:none;border-right:1px solid var(--b1);background:transparent;color:var(--dim2);font-size:13px;cursor:pointer;transition:all .12s;outline:none;">▶</button>
    <button id="tp-record" title="Record canvas output" style="height:100%;width:38px;border:none;border-right:1px solid var(--b1);background:transparent;color:var(--accent3);font-size:11px;cursor:pointer;transition:all .12s;outline:none;">⏺</button>
    <div id="tp-time" style="height:100%;display:flex;align-items:center;padding:0 12px;font-family:var(--mono);font-size:10px;color:var(--dim2);letter-spacing:.06em;border-right:1px solid var(--b1);min-width:72px;">0:00.0</div>
  </div>

  <!-- Add organism -->
  <div id="mb-add" class="mb-item" title="Add an organism" style="height:100%;display:flex;align-items:center;gap:5px;padding:0 12px;cursor:pointer;border-right:1px solid var(--b1);font-family:var(--mono);font-size:9px;letter-spacing:.1em;color:var(--accent);">
    <span style="font-size:12px;">+</span><span>ADD ORGANISM</span>
  </div>

  <!-- Tabs (open instances) -->
  <div id="mb-tabs" class="mb-item" title="Open organisms" style="height:100%;display:flex;align-items:center;gap:5px;padding:0 12px;cursor:pointer;border-right:1px solid var(--b1);font-family:var(--mono);font-size:9px;letter-spacing:.1em;color:var(--dim2);position:relative;">
    <span>TABS</span><span id="mb-tabs-count" style="color:var(--dim);">(0)</span><span style="font-size:8px;color:var(--dim);">▾</span>
  </div>

  <div id="mb-accent"></div>
  <div id="mb-right">
    <div class="mb-item" id="mb-opts">OPTIONS</div>
    <div id="mb-drop"><span>⬇</span><span id="mb-drop-txt">DROP ANYTHING</span></div>
  </div>
</header>

<!-- ══ OPTIONS PANEL ══ -->
<div id="opts-panel">
  <div class="opts-title">CANVAS</div>
  <div class="opts-row">
    <button class="opts-btn" id="opts-clear">CLEAR ALL</button>
    <button class="opts-btn" id="opts-close">CLOSE</button>
  </div>
  <div class="opts-div"></div>
  <div class="opts-title">REGISTRY <span id="opts-reg-count" style="color:var(--dim2);font-weight:400;font-size:7px;"></span></div>
  <div id="opts-reg-list" style="display:flex;flex-direction:column;gap:3px;max-height:220px;overflow-y:auto;"></div>
</div>

<!-- ══ CANVAS — organisms live here, CFR field behind ══ -->
<div id="canvas">
  <div id="hint">
    <div class="hint-word">ERAVOS</div>
    <div class="hint-line">
      Drop audio · drag to canvas<br>
      Everything opens where you drop it<br>
      Organisms in the menu → controls + I/O
    </div>
  </div>
</div>

<!-- ══ DROP OVERLAY ══ -->
<div id="drop-overlay">
  <div class="drop-icon">⬇</div>
  <div class="drop-label">DROP TO OPEN</div>
  <div class="drop-sub">audio · MIDI · plugin zip</div>
</div>

<!-- ══ PERMISSIONS DIALOG ══ -->
<div id="perm-dialog">
  <div class="perm-box">
    <div class="perm-title" id="perm-title">PERMISSION REQUEST</div>
    <div class="perm-desc"  id="perm-desc"></div>
    <div class="perm-list"  id="perm-list"></div>
    <div class="perm-btns">
      <button class="perm-allow" id="perm-allow">ALLOW</button>
      <button class="perm-deny"  id="perm-deny">DENY</button>
    </div>
  </div>
</div>

<!-- ══ NOTIFICATION ══ -->
<div id="notif"></div>

<!-- ══ ORGANISM CATALOG ══ -->
<div id="catalog-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9500;display:none;align-items:center;justify-content:center;">
  <div id="catalog-box" style="width:min(880px,92vw);max-height:84vh;display:flex;flex-direction:column;background:var(--bg1);border:1px solid var(--b2);border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.7);overflow:hidden;">
    <div style="display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--b1);background:var(--bg2);">
      <span style="font-family:var(--orb);font-size:11px;font-weight:700;letter-spacing:.14em;color:var(--accent);flex:1;">ORGANISM CATALOG</span>
      <button id="catalog-create-btn" style="background:transparent;border:1px solid var(--accent)55;color:var(--accent);font-family:var(--mono);font-size:8px;letter-spacing:.08em;padding:6px 10px;border-radius:4px;cursor:pointer;">+ CREATE NEW ORGANISM</button>
      <button id="catalog-close" style="background:transparent;border:none;color:var(--dim2);font-size:16px;cursor:pointer;padding:0 4px;">×</button>
    </div>
    <div id="catalog-body" style="flex:1;overflow-y:auto;padding:14px 18px;display:flex;flex-direction:column;gap:18px;"></div>
  </div>
</div>

<!-- ══ CREATE NEW ORGANISM ══ -->
<div id="create-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9600;display:none;align-items:center;justify-content:center;">
  <div style="width:min(420px,90vw);background:var(--bg1);border:1px solid var(--b2);border-radius:8px;padding:18px;display:flex;flex-direction:column;gap:10px;">
    <div style="font-family:var(--orb);font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--accent);">NEW ORGANISM TEMPLATE</div>
    <div style="font-family:var(--mono);font-size:7px;color:var(--dim2);line-height:1.6;">Downloads a starter engine.js + schema.json scaffold, matching the convention every other organism follows. Drop them into organisms/&lt;id&gt;/ to build from.</div>
    <label style="font-family:var(--mono);font-size:7px;color:var(--dim);letter-spacing:.08em;">ID (kebab-case)<input id="create-id" placeholder="my-organism" style="width:100%;margin-top:3px;background:var(--bg3);border:1px solid var(--b2);border-radius:3px;color:var(--white);font-family:var(--mono);font-size:9px;padding:6px 8px;"></label>
    <label style="font-family:var(--mono);font-size:7px;color:var(--dim);letter-spacing:.08em;">LABEL<input id="create-label" placeholder="My Organism" style="width:100%;margin-top:3px;background:var(--bg3);border:1px solid var(--b2);border-radius:3px;color:var(--white);font-family:var(--mono);font-size:9px;padding:6px 8px;"></label>
    <div style="display:flex;gap:8px;">
      <label style="flex:1;font-family:var(--mono);font-size:7px;color:var(--dim);letter-spacing:.08em;">ICON<input id="create-icon" placeholder="◆" style="width:100%;margin-top:3px;background:var(--bg3);border:1px solid var(--b2);border-radius:3px;color:var(--white);font-family:var(--mono);font-size:9px;padding:6px 8px;"></label>
      <label style="flex:1;font-family:var(--mono);font-size:7px;color:var(--dim);letter-spacing:.08em;">ACCENT<input id="create-accent" type="color" value="#00ff88" style="width:100%;margin-top:3px;height:30px;background:var(--bg3);border:1px solid var(--b2);border-radius:3px;cursor:pointer;"></label>
    </div>
    <label style="font-family:var(--mono);font-size:7px;color:var(--dim);letter-spacing:.08em;">CATEGORY<input id="create-category" placeholder="Audio — Synths" style="width:100%;margin-top:3px;background:var(--bg3);border:1px solid var(--b2);border-radius:3px;color:var(--white);font-family:var(--mono);font-size:9px;padding:6px 8px;"></label>
    <div style="display:flex;gap:8px;margin-top:6px;">
      <button id="create-download" style="flex:1;background:var(--accent);border:none;color:#000;font-family:var(--mono);font-size:8px;font-weight:700;letter-spacing:.08em;padding:8px;border-radius:4px;cursor:pointer;">⬇ DOWNLOAD TEMPLATE</button>
      <button id="create-cancel" style="background:transparent;border:1px solid var(--b2);color:var(--dim2);font-family:var(--mono);font-size:8px;letter-spacing:.08em;padding:8px 12px;border-radius:4px;cursor:pointer;">CANCEL</button>
    </div>
  </div>
</div>

<!-- ══ SPAWN CONFIG PROMPT (for organisms with declared 'needs') ══ -->
<div id="needs-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9700;display:none;align-items:center;justify-content:center;">
  <div id="needs-box" style="width:min(380px,90vw);background:var(--bg1);border:1px solid var(--b2);border-radius:8px;padding:18px;display:flex;flex-direction:column;gap:10px;">
    <div id="needs-title" style="font-family:var(--orb);font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--accent);">CONFIGURE BEFORE ADDING</div>
    <div id="needs-fields" style="display:flex;flex-direction:column;gap:9px;"></div>
    <div style="display:flex;gap:8px;margin-top:6px;">
      <button id="needs-confirm" style="flex:1;background:var(--accent);border:none;color:#000;font-family:var(--mono);font-size:8px;font-weight:700;letter-spacing:.08em;padding:8px;border-radius:4px;cursor:pointer;">+ ADD</button>
      <button id="needs-cancel" style="background:transparent;border:1px solid var(--b2);color:var(--dim2);font-family:var(--mono);font-size:8px;letter-spacing:.08em;padding:8px 12px;border-radius:4px;cursor:pointer;">CANCEL</button>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════
     L4 SHELL — locked. Do not edit after this point.
     Wires everything. Canvas, drops, menu, CFR field.
     ══════════════════════════════════════════════════════ -->
<script>
'use strict';

/* ── Elements ── */
const canvasEl  = document.getElementById('canvas');
const hintEl    = document.getElementById('hint');
const notifEl   = document.getElementById('notif');
const mbDropEl  = document.getElementById('mb-drop');
const dropOvEl  = document.getElementById('drop-overlay');

/* ── Init ── */
CanvasWM.init(canvasEl);
WireSystem.init(canvasEl);
let _windowCount = 0;

/* ── Master transport UI ── */
const tpPlay   = document.getElementById('tp-play');
const tpRecord = document.getElementById('tp-record');
const tpTime   = document.getElementById('tp-time');

tpPlay.addEventListener('click', () => { bootAudio(); MasterTransport.togglePlay(); });
tpRecord.addEventListener('click', () => { bootAudio(); MasterTransport.record(); });

/* Space = play/stop */
document.addEventListener('keydown',e=>{
  if(e.code==='Space'&&e.target.tagName!=='INPUT'&&e.target.tagName!=='SELECT'){
    e.preventDefault(); bootAudio(); MasterTransport.togglePlay();
  }
});

/* Transport state bus */
KERNEL.bus.subscribe('transport:play',()=>{
  tpPlay.textContent='⏹'; tpPlay.style.color='var(--accent)';
  CanvasCFR.setFieldPreset('active');
});
KERNEL.bus.subscribe('transport:stop',()=>{
  tpPlay.textContent='▶'; tpPlay.style.color='var(--dim2)';
  CanvasCFR.setFieldPreset('calm');
});
KERNEL.bus.subscribe('transport:record-start',()=>{
  tpRecord.style.color='#ff2266'; tpRecord.style.textShadow='0 0 8px #ff2266';
});
KERNEL.bus.subscribe('transport:record-stop',()=>{
  tpRecord.style.color='var(--accent3)'; tpRecord.style.textShadow='';
});

/* Clock display */
let _clockStart=0, _clockRunning=false;
KERNEL.bus.subscribe('seq:play',()=>{_clockRunning=true;_clockStart=performance.now();});
KERNEL.bus.subscribe('seq:stop',()=>{_clockRunning=false;tpTime.textContent='0:00.0';});
(function _clockLoop(){
  requestAnimationFrame(_clockLoop);
  if(!_clockRunning) return;
  const t=(performance.now()-_clockStart)/1000;
  const m=Math.floor(t/60),s=Math.floor(t%60),d=Math.floor((t%1)*10);
  tpTime.textContent=`${m}:${String(s).padStart(2,'0')}.${d}`;
})();

/* ── Raven voice loader ──────────────────────────────────
   Drop any of Raven's MP3s and they spawn as named
   sample players arranged in a grid, ready to wire
   into the bass drop builder vocal slot.              ── */
const RAVEN_NAMES = [
  'Always_be_here_for_you','Days_when_we_re_quiet',
  'I_really_need_you_to_believe_that','just_listen_to_me_okay',
  'Please_just_know_matter_what','sometimes',
  'Todays_going_to_be_a_better_day','we_got_this','we_re_fine',
  'what_ever_negative_stuff','yesterdays_not_even_a_thing_anymore',
  'you_re_fine','you_re_not_your_thoughts','I_just_want_you_to_know_that',
  'Give_your_fucking_head_a_shake','I_m_not_fucking_going_anywhere',
  'I_love_the_shit_out_of_you','Your_fucking_stuck_with_me'
];

function _isRavenVoice(name) {
  const n = name.toLowerCase().replace(/[^a-z0-9]/g,'_');
  return RAVEN_NAMES.some(r => n.includes(r.toLowerCase().slice(0,12)) || r.toLowerCase().slice(0,12).includes(n.slice(0,8)));
}

/* When Raven files drop, arrange them in a grid on the right */
let _ravenGrid = [];
function _placeRavenSample(result, index) {
  const cols = 3;
  const w    = 220, h = 100, gapX = 10, gapY = 8;
  const cr   = canvasEl.getBoundingClientRect();
  const col  = index % cols;
  const row  = Math.floor(index / cols);
  const x    = cr.width - (cols * (w + gapX)) - 20 + col*(w+gapX);
  const y    = 30 + row*(h+gapY);
  return { x: Math.max(10, x), y };
}


let _audioBooted = false;
function bootAudio() {
  if (_audioBooted) return;
  _audioBooted = true;
  const AC = KERNEL.audio.boot();
  /* SNR master bus chain — boot immediately after AC */
  SNRChain.boot(AC, KERNEL.audio.dry);
  setTimeout(() => {
    const analyser = KERNEL.audio.analyser();
    CanvasCFR.connectAnalyser(analyser);
    _startAccentPulse(analyser);
  }, 200);
}
document.addEventListener('pointerdown', bootAudio, { once:true });

/* ── CFR canvas boot — fires immediately, no interaction needed ── */
CanvasCFR.boot(canvasEl);

/* ── Notify ── */
let _nTimer;
function notify(msg, col) {
  notifEl.textContent = msg;
  notifEl.style.borderColor = col || 'var(--accent)';
  notifEl.style.color       = col || 'var(--accent)';
  notifEl.classList.add('show');
  clearTimeout(_nTimer);
  _nTimer = setTimeout(() => notifEl.classList.remove('show'), 2600);
}
notify('Drop anything to begin');

/* ── Accent pulse (audio → accent colour + mb-accent bar) ── */
function _startAccentPulse(analyser) {
  const data  = new Uint8Array(analyser.frequencyBinCount);
  const bar   = document.getElementById('mb-accent');
  const logo  = document.querySelector('.mb-logo-name');
  (function loop() {
    requestAnimationFrame(loop);
    analyser.getByteFrequencyData(data);
    let maxB=0, maxV=0, rms=0;
    for(let i=2;i<data.length;i++) { if(data[i]>maxV){maxV=data[i];maxB=i;} rms+=data[i]*data[i]; }
    rms = Math.sqrt(rms/data.length)/255;
    if(rms>.015) {
      const hue = Math.round(152-(maxB/data.length)*110);
      const hex  = _hsl2hex(hue, Math.round(80+rms*20), Math.round(50+rms*18));
      document.documentElement.style.setProperty('--accent', hex);
      document.documentElement.style.setProperty('--accent-rgb', _hex2rgb(hex));
      if(bar)  { bar.style.background=hex; bar.style.boxShadow=`0 0 ${6+rms*14}px ${hex}`; }
      if(logo)   logo.style.color = hex;
    }
  })();
}
function _hsl2hex(h,s,l){s/=100;l/=100;const a=s*Math.min(l,1-l);const f=n=>{const k=(n+h/30)%12;const c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0');};return`#${f(0)}${f(8)}${f(4)}`;}
function _hex2rgb(h){return`${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)}`;}

/* ── Permission dialog ── */
let _permResolve = null;
function requestPermission(packId, label, perms) {
  return new Promise(resolve => {
    _permResolve = resolve;
    document.getElementById('perm-title').textContent = 'PERMISSION REQUEST';
    document.getElementById('perm-desc').textContent  = `"${label}" (${packId}) requests:`;
    const list = document.getElementById('perm-list'); list.innerHTML='';
    perms.forEach(p=>{const d=document.createElement('div');d.className='perm-item';d.textContent=p;list.appendChild(d);});
    document.getElementById('perm-dialog').classList.add('open');
  });
}
document.getElementById('perm-allow').addEventListener('click',()=>{document.getElementById('perm-dialog').classList.remove('open');if(_permResolve){_permResolve(true);_permResolve=null;}});
document.getElementById('perm-deny').addEventListener('click', ()=>{document.getElementById('perm-dialog').classList.remove('open');if(_permResolve){_permResolve(false);_permResolve=null;}});

/* ── Drop routing ── */
const NAME_MAP = {
  'pads':              ['drum','drums','pads','beat','kit'],
  'sequencer':         ['seq','sequencer','pattern','groove'],
  'timeline':          ['timeline','tl','arrangement','arrange'],
  'sample-player':     ['sample','player'],
  'lfo':               ['lfo','modulate'],
  'wobble-bass':       ['wobble','wub'],
  'acid-synth':        ['acid','303'],
  'reese-bass':        ['reese','dnb'],
  'channel':           ['channel','mixer','strip','ch'],
  'xy-pad':            ['xy','xypad','joystick'],
  'edm-lab':           ['edm','lab','bass','dubstep','neuro'],
  'contrast-analyser': ['contrast','analyse','analyser','spectrum','compare'],
  'bass-drop-builder': ['drop','builder'],
};
function _nameToOrg(name) {
  const n = name.toLowerCase();
  for(const [id,aliases] of Object.entries(NAME_MAP)){if(aliases.some(a=>n.includes(a)))return id;}
  return null;
}

let _dc = 0;
document.addEventListener('dragenter', e=>{e.preventDefault();_dc++;dropOvEl.classList.add('active');mbDropEl.classList.add('active');});
document.addEventListener('dragleave', ()=>{_dc=Math.max(0,_dc-1);if(!_dc){dropOvEl.classList.remove('active');mbDropEl.classList.remove('active');}});
document.addEventListener('dragover',  e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';});

document.addEventListener('drop', async e=>{
  e.preventDefault();
  _dc=0; dropOvEl.classList.remove('active'); mbDropEl.classList.remove('active');
  bootAudio();
  const files = e.dataTransfer.files; if(!files.length) return;
  const cr  = canvasEl.getBoundingClientRect();
  const pos = { x:Math.max(8,e.clientX-cr.left-120), y:Math.max(8,e.clientY-cr.top-20) };
  notify(`⬇ reading ${files.length} file${files.length>1?'s':''}…`);
  const results = await Intake.ingestAll(files, KERNEL.bus);
  results.forEach((result,i)=>{
    const p = { x:pos.x+i*28, y:pos.y+i*22 };
    if(result.id==='error')       { notify(`⚠ ${result.error}`,'var(--accent3)'); return; }
    if(result.id==='zip')         { KERNEL.zipImporter.install(result.arrayBuffer,p,requestPermission).then(pack=>{if(pack)notify(`📦 ${pack.manifest.label||result.name} installed`);else notify(`⚠ zip install failed`,'var(--accent3)');});return; }
    if(result.id==='audio:sample'){
      if(_isRavenVoice(result.name)){
        const idx=_ravenGrid.length; _ravenGrid.push(result.name);
        const rp=_placeRavenSample(result,idx);
        OrganismFactory.spawn('sample-player',rp,result);
      } else {
        OrganismFactory.spawn('sample-player',p,result);
      }
      return;
    }
    if(result.id==='audio:midi'||result.id==='json:pattern'){ OrganismFactory.spawn('sequencer',p,result); return; }
    if(result.id==='json:preset'&&result.meta?.parsed?.comp_id){ const pid=result.meta.parsed.comp_id; if(OrganismFactory.defs().find(d=>d.id===pid)){OrganismFactory.spawn(pid,p,result);return;} }
    const pid = _nameToOrg(result.name);
    if(pid){ OrganismFactory.spawn(pid,p,result); return; }
    notify(`${result.icon} ${result.name} (${result.id})`,'var(--dim2)');
  });
});

/* ══════════════════════════════════════════════════════
   DYNAMIC MENU — dropdowns populate on spawn
   ══════════════════════════════════════════════════════ */
const tabsBtn      = document.getElementById('mb-tabs');
const tabsCountEl  = document.getElementById('mb-tabs-count');
const _instances   = new Map(); /* instanceId → { id, label, icon, accent } */
let   _openPanel   = null;

function _closeAll() {
  if(_openPanel){_openPanel.style.display='none';_openPanel._trigger?.classList.remove('on');_openPanel=null;}
}

/* ── Device lists ── */
const _audioOutputs = [{id:'default',label:'System Default'}];
const _audioInputs  = [{id:'default',label:'System Default'}];
const _midiInputs   = [{id:'none',label:'— none —'}];

function _refreshDevices() {
  if(navigator.mediaDevices?.enumerateDevices){
    navigator.mediaDevices.enumerateDevices().then(devices=>{
      _audioOutputs.length=0; _audioInputs.length=0;
      _audioOutputs.push({id:'default',label:'System Default'});
      _audioInputs.push( {id:'default',label:'System Default'});
      devices.forEach(d=>{
        if(d.kind==='audiooutput') _audioOutputs.push({id:d.deviceId,label:d.label||`Output ${_audioOutputs.length}`});
        if(d.kind==='audioinput')  _audioInputs.push( {id:d.deviceId,label:d.label||`Input ${_audioInputs.length}`});
      });
    }).catch(()=>{});
  }
  if(navigator.requestMIDIAccess){
    navigator.requestMIDIAccess().then(access=>{
      _midiInputs.length=0; _midiInputs.push({id:'none',label:'— none —'});
      access.inputs.forEach(input=>{
        _midiInputs.push({id:input.id,label:input.name});
        input.onmidimessage=e=>{
          const [status,note,vel]=e.data;
          if((status&0xF0)===0x90&&vel>0) KERNEL.bus.publish('midi:note',{note,velocity:vel/127,channel:(status&0x0F)+1,deviceId:input.id});
        };
      });
      if(_openPanel===tabsListEl) _renderTabs();
    }).catch(()=>{});
  }
}
_refreshDevices();

/* ── Tabs dropdown — one row per open instance ── */
const _ioSelections = {};

function _mkIORow(instanceId, labelText, devices, attrName, color) {
  const row = document.createElement('div'); row.style.cssText='display:flex;flex-direction:column;gap:3px;';
  const lbl = document.createElement('div'); lbl.style.cssText=`font-family:var(--mono);font-size:6.5px;letter-spacing:.14em;color:${color};opacity:.7;`; lbl.textContent=labelText;
  const sel = document.createElement('select'); sel.style.cssText=`background:var(--bg3);border:1px solid ${color}44;border-radius:3px;color:var(--white);font-family:var(--mono);font-size:8px;padding:4px 6px;outline:none;cursor:pointer;width:100%;`;
  if(attrName) sel.dataset[attrName]='1';
  const savedVal = _ioSelections[instanceId]?.[labelText];
  devices.forEach(d=>{const o=document.createElement('option');o.value=d.id;o.textContent=d.label;if(d.id===savedVal)o.selected=true;sel.appendChild(o);});
  sel.addEventListener('click',e=>e.stopPropagation());
  sel.addEventListener('change',()=>{
    if(!_ioSelections[instanceId]) _ioSelections[instanceId]={};
    _ioSelections[instanceId][labelText]=sel.value;
    KERNEL.bus.publish('organism:io-change',{instanceId,label:labelText,deviceId:sel.value});
  });
  row.appendChild(lbl); row.appendChild(sel);
  return row;
}

function _raiseInstance(instanceId) {
  const win=canvasEl.querySelector(`[data-wm-id="${instanceId}"]`);
  if(win){
    const z=Math.max(0,...Array.from(canvasEl.querySelectorAll('.wm-win')).map(w=>+w.style.zIndex||0));
    win.style.zIndex=z+1;
    win.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
  }
}
function _collapseInstance(instanceId) {
  const win=canvasEl.querySelector(`[data-wm-id="${instanceId}"]`);
  if(win){const btn=win.querySelector('.wm-bar button'); if(btn) btn.click();}
}
function _closeInstance(instanceId) {
  const win=canvasEl.querySelector(`[data-wm-id="${instanceId}"]`);
  if(win){win.remove();KERNEL.registry.unregister(instanceId);KERNEL.bus.publish('canvas:window-closed',{id:instanceId});}
}

const tabsListEl = document.createElement('div');
tabsListEl.dataset.ddPanel='1';
tabsListEl.style.cssText = `position:fixed;top:var(--bar);display:none;flex-direction:column;min-width:260px;max-height:72vh;overflow-y:auto;background:var(--bg1);border:1px solid var(--b2);border-top:2px solid var(--accent);border-radius:0 0 5px 5px;z-index:9100;box-shadow:0 8px 32px rgba(0,0,0,.6);`;
tabsListEl._trigger = tabsBtn;
document.body.appendChild(tabsListEl);

function _renderTabs() {
  tabsListEl.innerHTML='';
  tabsCountEl.textContent = `(${_instances.size})`;
  if(_instances.size===0){
    const empty=document.createElement('div');
    empty.style.cssText='padding:14px;font-family:var(--mono);font-size:8px;color:var(--dim);text-align:center;letter-spacing:.06em;';
    empty.textContent='No organisms open — use + ADD ORGANISM';
    tabsListEl.appendChild(empty);
    return;
  }
  _instances.forEach((inst, instanceId) => {
    const color = inst.accent || 'var(--accent)';
    const row=document.createElement('div');
    row.style.cssText=`display:flex;align-items:center;gap:7px;padding:7px 10px;cursor:pointer;border-bottom:1px solid var(--b1);font-family:var(--mono);font-size:8px;letter-spacing:.08em;color:${color};transition:background .1s;`;
    row.addEventListener('mouseenter',()=>row.style.background=`${color}0a`);
    row.addEventListener('mouseleave',()=>row.style.background='');

    const ic=document.createElement('span'); ic.textContent=inst.icon||'◆'; ic.style.fontSize='11px';
    const lb=document.createElement('span'); lb.textContent=inst.label.toUpperCase(); lb.style.cssText='flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    row.appendChild(ic); row.appendChild(lb);

    const actions=document.createElement('div'); actions.style.cssText='display:flex;gap:3px;';
    function mkIcoBtn(sym,title,onClick,col){
      const b=document.createElement('span'); b.textContent=sym; b.title=title;
      b.style.cssText=`padding:2px 5px;border-radius:3px;color:${col||'var(--dim2)'};opacity:.7;font-size:9px;`;
      b.addEventListener('mouseenter',()=>{b.style.opacity='1';b.style.background=`${col||color}1a`;});
      b.addEventListener('mouseleave',()=>{b.style.opacity='.7';b.style.background='';});
      b.addEventListener('click',e=>{e.stopPropagation();onClick();});
      return b;
    }
    actions.appendChild(mkIcoBtn('⊙','Raise window',()=>{_raiseInstance(instanceId);_closeAll();}));
    actions.appendChild(mkIcoBtn('▬','Collapse',()=>_collapseInstance(instanceId)));
    actions.appendChild(mkIcoBtn('×','Close',()=>{_closeInstance(instanceId);},'#ff2266'));
    row.appendChild(actions);
    row.addEventListener('click',()=>{_raiseInstance(instanceId);_closeAll();});
    tabsListEl.appendChild(row);

    const org=KERNEL.registry.get(instanceId);
    const perms=org?.permissions||[];
    if(perms.includes('audio_out')||perms.includes('audio_in')||perms.includes('midi_in')){
      const ioWrap=document.createElement('div');
      ioWrap.style.cssText='padding:5px 10px 9px 27px;display:flex;flex-direction:column;gap:5px;border-bottom:1px solid var(--b1);background:var(--bg2);';
      if(perms.includes('audio_out')) ioWrap.appendChild(_mkIORow(instanceId,'AUDIO OUTPUT',_audioOutputs,null,color));
      if(perms.includes('audio_in'))  ioWrap.appendChild(_mkIORow(instanceId,'AUDIO INPUT', _audioInputs, null,color));
      if(perms.includes('midi_in'))   ioWrap.appendChild(_mkIORow(instanceId,'MIDI INPUT',  _midiInputs,  'midiSel',color));
      tabsListEl.appendChild(ioWrap);
    }
  });
}

tabsBtn.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen=(_openPanel===tabsListEl);
  _closeAll();
  if(!isOpen){
    const r=tabsBtn.getBoundingClientRect();
    tabsListEl.style.left=r.left+'px';
    tabsListEl.style.display='flex';
    tabsBtn.classList.add('on');
    _openPanel=tabsListEl;
    _renderTabs();
  }
});

/* Close on outside click / ESC */
document.addEventListener('click',e=>{if(!e.target.closest('#mb-tabs')&&!e.target.closest('#mb-add')&&!e.target.closest('[data-dd-panel]'))_closeAll();});
document.addEventListener('keydown',e=>{if(e.code==='Escape')_closeAll();});

/* ── Bus wiring ── */
KERNEL.bus.subscribe('canvas:organism-spawned',({instanceId,id,label,icon,accent})=>{
  _windowCount++;
  hintEl.classList.add('gone');
  const def = OrganismFactory.defs().find(d=>d.id===id);
  _instances.set(instanceId, { id, label, icon: icon||def?.icon||'', accent: accent||def?.accent||'var(--accent)' });
  tabsCountEl.textContent = `(${_instances.size})`;
  if(_openPanel===tabsListEl) _renderTabs();
  /* CFR attractor */
  const win = canvasEl.querySelector(`[data-wm-id="${instanceId}"]`);
  if(win){const r=win.getBoundingClientRect(),cr=canvasEl.getBoundingClientRect();CanvasCFR.onSpawn(instanceId,r.left-cr.left+r.width/2,r.top-cr.top+r.height/2,def?.accent);}
  /* Wire system */
  WireSystem.onSpawn(instanceId);
});

KERNEL.bus.subscribe('canvas:window-closed',({id})=>{
  _instances.delete(id);
  tabsCountEl.textContent = `(${_instances.size})`;
  if(_openPanel===tabsListEl) _renderTabs();
  CanvasCFR.onClose(id);
  WireSystem.onClose(id);
  _windowCount--;
  if(_windowCount<=0){_windowCount=0;hintEl.classList.remove('gone');}
});

KERNEL.bus.subscribe('kernel:fault',({code,message})=>{
  notify(`⚠ ${code}: ${message}`,'var(--accent3)');
  CanvasCFR.onFault();
});
KERNEL.bus.subscribe('kernel:notify',({message})=>notify(message));

/* ── OPTIONS panel ── */
let _optsOpen=false;
document.getElementById('mb-opts').addEventListener('click',()=>{
  _optsOpen=!_optsOpen;
  document.getElementById('opts-panel').classList.toggle('open',_optsOpen);
  if(_optsOpen) _updateRegistry();
});
document.getElementById('opts-close').addEventListener('click',()=>{_optsOpen=false;document.getElementById('opts-panel').classList.remove('open');});
document.getElementById('opts-clear').addEventListener('click',()=>{
  canvasEl.querySelectorAll('.wm-win').forEach(w=>w.remove());
  _windowCount=0; hintEl.classList.remove('gone');
  notify('Canvas cleared');
});
function _updateRegistry(){
  const orgs=KERNEL.registry.all();
  document.getElementById('opts-reg-count').textContent=`(${orgs.length})`;
  const list=document.getElementById('opts-reg-list'); list.innerHTML='';
  orgs.forEach(o=>{const item=document.createElement('div');item.style.cssText='font-family:var(--mono);font-size:6.5px;color:var(--dim2);padding:2px 4px;border-radius:2px;border:1px solid var(--b1);background:var(--bg3);display:flex;align-items:center;gap:6px;';item.innerHTML=`<span style="color:var(--accent)">${o.label}</span><span style="flex:1;color:var(--dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${o.id}</span>`;list.appendChild(item);});
}
document.addEventListener('click',e=>{if(!e.target.closest('#opts-panel')&&!e.target.closest('#mb-opts')){document.getElementById('opts-panel').classList.remove('open');_optsOpen=false;}});
KERNEL.bus.subscribe('kernel:organism-mounted',  ()=>{if(_optsOpen)_updateRegistry();});
KERNEL.bus.subscribe('kernel:organism-unmounted',()=>{if(_optsOpen)_updateRegistry();});

/* ══════════════════════════════════════════════════════
   ORGANISM CATALOG — categories, summaries, "thumbnails"
   (icon tile in the organism's own accent colour), Add,
   and Create-New-Organism template download.
   ══════════════════════════════════════════════════════ */
const catalogOverlay = document.getElementById('catalog-overlay');
const catalogBody     = document.getElementById('catalog-body');

function _openCatalog() {
  catalogBody.innerHTML = '';
  const defs = OrganismFactory.defs();
  const byCategory = new Map();
  defs.forEach(d => {
    const cat = d.category || 'Uncategorized';
    if(!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(d);
  });
  const cats = Array.from(byCategory.keys()).sort();
  cats.forEach(cat => {
    const section = document.createElement('div');
    const hdr = document.createElement('div');
    hdr.style.cssText = 'font-family:var(--mono);font-size:8px;letter-spacing:.14em;color:var(--dim);margin-bottom:8px;';
    hdr.textContent = cat.toUpperCase();
    section.appendChild(hdr);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;';

    byCategory.get(cat).forEach(d => {
      const color = d.accent || 'var(--accent)';
      const card = document.createElement('div');
      card.style.cssText = `border:1px solid var(--b2);border-radius:6px;background:var(--bg2);overflow:hidden;display:flex;flex-direction:column;`;

      const thumb = document.createElement('div');
      thumb.style.cssText = `height:64px;display:flex;align-items:center;justify-content:center;font-size:26px;background:linear-gradient(135deg, ${color}22, ${color}05);border-bottom:1px solid ${color}33;`;
      thumb.textContent = d.icon || '◆';

      const body = document.createElement('div');
      body.style.cssText = 'padding:9px 10px;display:flex;flex-direction:column;gap:6px;flex:1;';

      const title = document.createElement('div');
      title.style.cssText = `font-family:var(--mono);font-size:8.5px;font-weight:700;letter-spacing:.06em;color:${color};`;
      title.textContent = d.label;

      const summary = document.createElement('div');
      summary.style.cssText = 'font-family:var(--mono);font-size:6.5px;color:var(--dim2);line-height:1.5;flex:1;';
      summary.textContent = d.summary || 'No summary declared yet.';

      body.appendChild(title); body.appendChild(summary);

      if(d.needs && d.needs.length){
        const needsTag = document.createElement('div');
        needsTag.style.cssText = 'font-family:var(--mono);font-size:6px;color:var(--dim);letter-spacing:.04em;';
        needsTag.textContent = 'NEEDS: ' + d.needs.map(n=>n.label).join(', ');
        body.appendChild(needsTag);
      } else {
        const noNeeds = document.createElement('div');
        noNeeds.style.cssText = 'font-family:var(--mono);font-size:6px;color:var(--dim);opacity:.6;';
        noNeeds.textContent = 'NEEDS: nothing extra';
        body.appendChild(noNeeds);
      }

      const addBtn = document.createElement('button');
      addBtn.textContent = '+ ADD';
      addBtn.style.cssText = `background:transparent;border:1px solid ${color}55;color:${color};font-family:var(--mono);font-size:7.5px;letter-spacing:.08em;padding:6px;border-radius:4px;cursor:pointer;`;
      addBtn.addEventListener('click', () => _addOrganism(d));
      body.appendChild(addBtn);

      card.appendChild(thumb); card.appendChild(body);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    catalogBody.appendChild(section);
  });
  catalogOverlay.style.display = 'flex';
}

function _addOrganism(def) {
  if(def.needs && def.needs.length){
    _openNeedsPrompt(def);
  } else {
    bootAudio();
    OrganismFactory.spawn(def.id, { x: 80+Math.random()*300, y: 80+Math.random()*140 });
    catalogOverlay.style.display = 'none';
  }
}

document.getElementById('mb-add').addEventListener('click', _openCatalog);
document.getElementById('catalog-close').addEventListener('click', ()=>catalogOverlay.style.display='none');
catalogOverlay.addEventListener('click', e => { if(e.target===catalogOverlay) catalogOverlay.style.display='none'; });

/* ── Spawn-config prompt — only shown for organisms that
   explicitly declare what they need ── */
const needsOverlay = document.getElementById('needs-overlay');
const needsFields   = document.getElementById('needs-fields');
const needsTitle    = document.getElementById('needs-title');
let   _pendingDef   = null;

function _openNeedsPrompt(def) {
  _pendingDef = def;
  needsTitle.textContent = `CONFIGURE ${def.label.toUpperCase()}`;
  needsFields.innerHTML = '';
  def.needs.forEach(n => {
    const wrap = document.createElement('label');
    wrap.style.cssText = 'font-family:var(--mono);font-size:7px;color:var(--dim);letter-spacing:.06em;display:flex;flex-direction:column;gap:3px;';
    wrap.textContent = n.label;
    const input = document.createElement('input');
    input.value = n.default ?? '';
    input.dataset.key = n.key;
    input.style.cssText = 'background:var(--bg3);border:1px solid var(--b2);border-radius:3px;color:var(--white);font-family:var(--mono);font-size:9px;padding:6px 8px;';
    wrap.appendChild(input);
    needsFields.appendChild(wrap);
  });
  needsOverlay.style.display = 'flex';
}

document.getElementById('needs-confirm').addEventListener('click', () => {
  if(!_pendingDef) return;
  const config = {};
  needsFields.querySelectorAll('input').forEach(inp => { config[inp.dataset.key] = inp.value; });
  bootAudio();
  OrganismFactory.spawn(_pendingDef.id, { x: 80+Math.random()*300, y: 80+Math.random()*140 }, null, config);
  needsOverlay.style.display = 'none';
  catalogOverlay.style.display = 'none';
  _pendingDef = null;
});
document.getElementById('needs-cancel').addEventListener('click', () => { needsOverlay.style.display='none'; _pendingDef=null; });
needsOverlay.addEventListener('click', e => { if(e.target===needsOverlay){needsOverlay.style.display='none';_pendingDef=null;} });

/* ── Create New Organism — downloads a starter schema.json
   + engine.js scaffold, same shape every other organism uses ── */
const createOverlay = document.getElementById('create-overlay');
document.getElementById('catalog-create-btn').addEventListener('click', () => { createOverlay.style.display='flex'; });
document.getElementById('create-cancel').addEventListener('click', () => { createOverlay.style.display='none'; });
createOverlay.addEventListener('click', e => { if(e.target===createOverlay) createOverlay.style.display='none'; });

function _downloadText(filename, text) {
  const blob = new Blob([text], {type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
}

document.getElementById('create-download').addEventListener('click', () => {
  const id      = (document.getElementById('create-id').value || 'my-organism').trim();
  const label   = (document.getElementById('create-label').value || 'My Organism').trim();
  const icon    = (document.getElementById('create-icon').value || '◆').trim();
  const accent  = document.getElementById('create-accent').value || '#00ff88';
  const category= (document.getElementById('create-category').value || 'Uncategorized').trim();
  const exportName = 'Organism_' + id.replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');

  const engineTpl = `/* ═══════════════════════════════════════════════════════════
   ORGANISM: ${label}  v0.1.0
   id: eravos.${id}

   Starter scaffold. Fill in real engine logic, then register
   it in runtime/organism-factory.js with reg('${id}', {...}),
   declaring category/summary/needs explicitly (K-8 — state
   what you require, never assume it).
   ═══════════════════════════════════════════════════════════ */

window.${exportName} = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  const gBus = KERNEL.bus;

  /* TODO: real state + logic */
  let _state = {};

  KERNEL.registry.register({
    instanceId,
    id: 'eravos.${id}',
    label: '${label}',
    provides: [],
    requires: [],
    permissions: [], // declare explicitly — bus_publish, bus_subscribe, network_fetch, audio_out, etc.
    hooks: [],
  });

  return {
    unmount() {
      KERNEL.registry.unregister(instanceId);
    },
    get state() { return { ..._state }; },
  };
}

return { mount };
})();
`;

  const schemaTpl = JSON.stringify({
    schema_version: '1.0.0',
    id: `eravos.${id}`,
    label,
    icon,
    accent,
    domain: [category],
    description: 'TODO — describe what this organism does.',
    permissions: [],
    provides: [],
    requires: [],
    hooks: [],
    params: {},
    ui: { type: 'TODO' },
  }, null, 2);

  _downloadText(`${id}.engine.js`, engineTpl);
  _downloadText('schema.json', schemaTpl);
  createOverlay.style.display = 'none';
  notify(`⬇ Downloaded ${id}.engine.js + schema.json — drop into organisms/${id}/`);
});

/* ── F-key spawner ── */
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='SELECT'||e.target.tagName==='INPUT') return;
  const map={F1:'pads',F2:'sequencer',F3:'timeline',F4:'sample-player',F5:'lfo',F6:'wobble-bass',F7:'acid-synth',F8:'reese-bass',F9:'channel',F10:'xy-pad',F11:'edm-lab',F12:'contrast-analyser'};
  if(map[e.key]){e.preventDefault();bootAudio();OrganismFactory.spawn(map[e.key],{x:60+Math.random()*320,y:60+Math.random()*120});}
});

/* ── Nexus diagnostic nodes — no free F-keys (F1-F12 taken).
   Spawn manually via the catalog (+ ADD ORGANISM), or call
   window.spawnNexusNodes() from console for the full set,
   tiled across the canvas. Nothing auto-spawns anymore —
   the canvas boots blank. */
window.spawnNexusNodes = () => {
  const nodes = ['nexus-cortex','nexus-guardian','nexus-bridge','nexus-orchestrator','nexus-diagnostic','nexus-architect','nexus-idearium'];
  nodes.forEach((id, i) => OrganismFactory.spawn(id, { x: 40 + i * 270, y: 40 }));
};

</script>
</body>
</html>

---

# manifest.json

{
  "manifest_version": "1.0.0",
  "pack_id": "eravos.core",
  "pack_version": "3.0.0",
  "pack_type": "organism_pack",
  "label": "ERAVOS Core",
  "icon": "🎛",
  "description": "ERAVOS kernel + 28 organisms. Drop-in zip. Opens as file://.",
  "author": "James Brooks",
  "kernel_target": "3.0.0",
  "status": "canonical",

  "permissions": [
    "audio_out", "audio_in",
    "midi_in", "midi_out",
    "bus_publish", "bus_subscribe",
    "filesystem_read",
    "network_fetch",
    "serial_access"
  ],

  "provides": [
    "capability.audio_context",
    "capability.pad_trigger",
    "capability.sequencer",
    "capability.timeline",
    "capability.sample_source",
    "capability.lfo",
    "capability.audio_out",
    "capability.channel_strip",
    "capability.lead_voice",
    "capability.sidechain_duck",
    "capability.master_fx_control",
    "capability.image_edit",
    "capability.image_export",
    "capability.video_edit",
    "capability.video_export",
    "capability.serial_io",
    "capability.hardware_control",
    "capability.automation_record",
    "capability.automation_playback",
    "capability.external_automation"
  ],

  "requires": [],
  "dependencies": [],

  "contents": {
    "manifest": "manifest.json",
    "shell": "index.html",
    "kernel": [
      "kernel/kernel.js",
      "kernel/intake.js"
    ],
    "runtime": [
      "runtime/canvas-wm.js",
      "runtime/organism-factory.js"
    ],
    "organisms": [
      {
        "id": "eravos.pads",
        "label": "Drum Machine",
        "engine": "organisms/pads/pads.engine.js"
      },
      {
        "id": "eravos.sequencer",
        "label": "Sequencer",
        "engine": "organisms/sequencer/sequencer.engine.js"
      },
      {
        "id": "eravos.timeline",
        "label": "Timeline",
        "engine": "organisms/timeline/timeline.engine.js"
      },
      {
        "id": "eravos.sample-player",
        "label": "Sample Player",
        "engine": "organisms/sample-player/sample-player.engine.js"
      },
      {
        "id": "eravos.lfo",
        "label": "LFO",
        "engine": "organisms/lfo/lfo.engine.js"
      },
      {
        "id": "eravos.wobble-bass",
        "label": "Wobble Bass",
        "engine": "organisms/wobble-bass/wobble-bass.engine.js"
      },
      {
        "id": "eravos.acid-synth",
        "label": "Acid Synth",
        "engine": "organisms/acid-synth/acid-synth.engine.js"
      },
      {
        "id": "eravos.reese-bass",
        "label": "Reese Bass",
        "engine": "organisms/reese-bass/reese-bass.engine.js"
      },
      {
        "id": "eravos.channel",
        "label": "Channel",
        "engine": "organisms/channel/channel.engine.js"
      },
      {
        "id": "eravos.xy-pad",
        "label": "XY Controller",
        "engine": "organisms/xy-pad/xy-pad.engine.js"
      },
      {
        "id": "eravos.edm-lab",
        "label": "EDM Lab",
        "engine": "organisms/edm-lab/edm-lab.engine.js"
      },
      {
        "id": "eravos.contrast-analyser",
        "label": "Contrast Analyser",
        "engine": "organisms/contrast-analyser/contrast-analyser.engine.js"
      },
      {
        "id": "eravos.bass-drop-builder",
        "label": "Bass Drop Builder",
        "engine": "organisms/bass-drop-builder/bass-drop-builder.engine.js"
      },
      {
        "id": "eravos.nexus-cortex",
        "label": "Nexus Cortex",
        "engine": "organisms/nexus-cortex/nexus-cortex.engine.js"
      },
      {
        "id": "eravos.nexus-guardian",
        "label": "Nexus Guardian",
        "engine": "organisms/nexus-guardian/nexus-guardian.engine.js"
      },
      {
        "id": "eravos.nexus-bridge",
        "label": "Nexus Bridge",
        "engine": "organisms/nexus-bridge/nexus-bridge.engine.js"
      },
      {
        "id": "eravos.nexus-orchestrator",
        "label": "Nexus Orchestrator",
        "engine": "organisms/nexus-orchestrator/nexus-orchestrator.engine.js"
      },
      {
        "id": "eravos.nexus-diagnostic",
        "label": "Nexus Diagnostic",
        "engine": "organisms/nexus-diagnostic/nexus-diagnostic.engine.js"
      },
      {
        "id": "eravos.nexus-architect",
        "label": "Nexus Architect",
        "engine": "organisms/nexus-architect/nexus-architect.engine.js"
      },
      {
        "id": "eravos.nexus-idearium",
        "label": "Nexus Idearium",
        "engine": "organisms/nexus-idearium/nexus-idearium.engine.js"
      },
      {
        "id": "eravos.supersaw",
        "label": "Supersaw",
        "engine": "organisms/supersaw/supersaw.engine.js"
      },
      {
        "id": "eravos.sidechain-compressor",
        "label": "Sidechain",
        "engine": "organisms/sidechain-compressor/sidechain-compressor.engine.js"
      },
      {
        "id": "eravos.master-fx",
        "label": "Master FX",
        "engine": "organisms/master-fx/master-fx.engine.js"
      },
      {
        "id": "eravos.photo-editor",
        "label": "Photo Editor",
        "engine": "organisms/photo-editor/photo-editor.engine.js"
      },
      {
        "id": "eravos.video-editor",
        "label": "Video Editor",
        "engine": "organisms/video-editor/video-editor.engine.js"
      },
      {
        "id": "eravos.serial-bridge",
        "label": "Serial Bridge",
        "engine": "organisms/serial-bridge/serial-bridge.engine.js"
      },
      {
        "id": "eravos.macro-automation",
        "label": "Macro Automation",
        "engine": "organisms/macro-automation/macro-automation.engine.js"
      },
      {
        "id": "eravos.webhook-automation",
        "label": "Webhook Automation",
        "engine": "organisms/webhook-automation/webhook-automation.engine.js"
      }
    ],
    "specs": [
      "specs/ERAVOS.kernel.spec",
      "specs/eravos.organism.pads.spec",
      "specs/eravos.organism.sequencer.spec",
      "specs/eravos.organism.timeline.spec",
      "specs/eravos.organism.sample-player.spec",
      "specs/eravos.pack.format.spec",
      "specs/eravos.nexus.build-contract.spec"
    ]
  },

  "auto_mount": ["eravos.pads"],

  "install_behavior": {
    "spawn_at_drop_position": true,
    "audio_files": "spawn_sample_player",
    "midi_files":  "spawn_sequencer",
    "zip_files":   "install_pack"
  }
}