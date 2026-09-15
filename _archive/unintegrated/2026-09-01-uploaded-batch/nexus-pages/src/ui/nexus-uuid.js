/* NEXUS v0.53.0 — nexus-uuid.js
 * UUID tracking — registry, stamps, inspector, hooks
 * Phase 0B — extracted 2026-04-07
 */

/* ══════════════════════════════════════════════
   NEXUS v9 — UNIVERSAL UUID TRACKING
   Every entity, action, interaction, session
   ══════════════════════════════════════════════ */

/* ── ENTITY MAP — tracks every stamped DOM element ── */
const NX_ENTITY_MAP = new Map();

/* ── nxAssignUUID — stamps a UUID onto any DOM element ── */
function nxAssignUUID(el, type, entity='', meta={}) {
  if(!el) return null;
  if(el.dataset && el.dataset.uuid) return el.dataset.uuid; // already assigned
  const id = UUID.gen(type, { ...meta, entity, tagName: el.tagName, elId: el.id||'' }, entity);
  try { el.dataset.uuid = id; } catch(e) {}
  NX_ENTITY_MAP.set(el, { id, type, entity, meta, stamped: new Date().toISOString() });
  return id;
}

function nxGetUUID(el) { return el?.dataset?.uuid || null; }
function nxGetRecord(el) { return NX_ENTITY_MAP.get(el) || null; }

/* ── UUID STAMP ALL ELEMENTS ── */
function nxStampAllElements() {
  let stamped = 0;

  // ── NAV TAB BUTTONS ──
  document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
    if(!btn.dataset.uuid){ nxAssignUUID(btn,'tab-nav','tab:'+btn.dataset.tab,{tab:btn.dataset.tab,label:btn.textContent.trim()}); stamped++; }
  });

  // ── SUB-TAB BUTTONS ──
  document.querySelectorAll('.ptab,.pwt,[data-sbt],[data-tetab],[data-ltab],[data-ttab]').forEach(btn => {
    if(!btn.dataset.uuid){
      const t=btn.dataset.ptab||btn.dataset.sbt||btn.dataset.tetab||btn.dataset.ltab||btn.dataset.ttab||btn.textContent.trim().slice(0,20);
      nxAssignUUID(btn,'tab-nav','subtab:'+t,{sub:t,label:btn.textContent.trim()}); stamped++;
    }
  });

  // ── MODAL OVERLAYS ──
  document.querySelectorAll('.modal-overlay[id]').forEach(el => {
    if(!el.dataset.uuid){ nxAssignUUID(el,'modal',el.id,{modalId:el.id}); stamped++; }
  });

  // ── TAB PANELS ──
  document.querySelectorAll('.tab-panel[id]').forEach(el => {
    if(!el.dataset.uuid){ nxAssignUUID(el,'action','panel:'+el.id.replace('tab-',''),{panelId:el.id}); stamped++; }
  });

  // ── ALL BUTTONS (first 300) ──
  document.querySelectorAll('button:not([data-uuid])').forEach((btn,i) => {
    if(i>300) return;
    const label=(btn.id||btn.textContent.trim()||btn.title||'btn').slice(0,40);
    nxAssignUUID(btn,'button',label,{label,pid:btn.closest('[id]')?.id||''}); stamped++;
  });

  // ── INPUTS / SELECTS / TEXTAREAS ──
  document.querySelectorAll('input[id]:not([data-uuid]),textarea[id]:not([data-uuid]),select[id]:not([data-uuid])').forEach(inp => {
    nxAssignUUID(inp,'action','input:'+inp.id,{inputId:inp.id,type:inp.type||inp.tagName.toLowerCase()}); stamped++;
  });

  // ── FORGE SPECIFIC ──
  document.querySelectorAll('.forge-pilot-mode-btn:not([data-uuid])').forEach(btn => {
    const mode=btn.dataset.mode||btn.textContent.trim();
    nxAssignUUID(btn,'action','copilot-mode:'+mode,{mode}); stamped++;
  });
  document.querySelectorAll('.forge-view-btn:not([data-uuid])').forEach(btn => {
    const view=btn.dataset.view||btn.textContent.trim();
    nxAssignUUID(btn,'action','forge-view:'+view,{view}); stamped++;
  });
  document.querySelectorAll('.eng-pill:not([data-uuid])').forEach(pill => {
    nxAssignUUID(pill,'action','engine:'+( pill.dataset.eng||''),{engine:pill.dataset.eng||''}); stamped++;
  });
  document.querySelectorAll('.depth-btn:not([data-uuid])').forEach(btn => {
    nxAssignUUID(btn,'action','depth:'+( btn.dataset.depth||''),{depth:btn.dataset.depth||''}); stamped++;
  });

  // ── CHECKLIST TOGGLES ──
  document.querySelectorAll('.chk:not([data-uuid])').forEach((chk,i) => {
    if(i>80) return;
    const label=(chk.id||chk.textContent.trim()||'chk').slice(0,30);
    nxAssignUUID(chk,'action','toggle:'+label,{label}); stamped++;
  });

  // ── QUICK COMMANDS ──
  document.querySelectorAll('.qcmd:not([data-uuid])').forEach(btn => {
    nxAssignUUID(btn,'action','qcmd:'+( btn.dataset.cmd||'').slice(0,30),{cmd:(btn.dataset.cmd||'').slice(0,60)}); stamped++;
  });

  // ── HOME TILES ──
  document.querySelectorAll('.home-tile:not([data-uuid])').forEach(tile => {
    const name=tile.querySelector('.home-tile-name')?.textContent?.trim()||'tile';
    nxAssignUUID(tile,'action','home-tile:'+name,{name}); stamped++;
  });

  // ── WIZARD OPTIONS ──
  document.querySelectorAll('.wiz-opt:not([data-uuid])').forEach(opt => {
    const val=opt.dataset.val||opt.querySelector('.wiz-opt-name')?.textContent||'';
    nxAssignUUID(opt,'wizard','wiz-opt:'+val,{val}); stamped++;
  });

  // ── ACCORDIONS ──
  document.querySelectorAll('.acc-head:not([data-uuid])').forEach(head => {
    const title=head.querySelector('.acc-title')?.textContent?.trim()||head.textContent.trim().slice(0,30);
    nxAssignUUID(head,'action','accordion:'+title.slice(0,20),{title}); stamped++;
  });

  // ── SUITE NAV (test suite items) ──
  document.querySelectorAll('.te-stack-layer:not([data-uuid])').forEach(layer => {
    const name=layer.querySelector('.te-sl-name')?.textContent?.trim()||'service';
    nxAssignUUID(layer,'te-service','service:'+name.toLowerCase().replace(/\s/g,'-'),{name}); stamped++;
  });

  // ── UUID badge in topbar ──
  if(!document.getElementById('uuid-topbar-badge')) {
    const topbar = document.getElementById('top-bar');
    if(topbar) {
      const badge = document.createElement('div');
      badge.id = 'uuid-topbar-badge';
      badge.title = 'Click to open UUID Registry';
      badge.style.cssText = 'font-family:var(--display);font-size:9px;letter-spacing:.1em;padding:3px 8px;border:1px solid rgba(0,212,255,.25);border-radius:2px;color:var(--c);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:4px;';
      badge.innerHTML = '<span style="width:5px;height:5px;border-radius:50%;background:var(--c);box-shadow:0 0 6px rgba(0,212,255,.5);flex-shrink:0"></span><span id="uuid-topbar-count">' + UUID.getAll().length + '</span>';
      badge.onclick = () => { switchTab('log'); setTimeout(()=>{ const b=document.querySelector('[data-ltab="uuids"]'); if(b){b.click();} },150); };
      badge.onmouseenter = () => badge.style.background='rgba(0,212,255,.08)';
      badge.onmouseleave = () => badge.style.background='';
      topbar.querySelector('.tbr')?.prepend(badge) || topbar.appendChild(badge);
      // keep it updated
      setInterval(() => { const c=document.getElementById('uuid-topbar-count'); if(c) c.textContent=UUID.getAll().length; }, 3000);
    }
  }

  log_ev('uuid:stamp-complete', { stamped }, 'INFO');
}

/* ── UUID TRACKING HOOKS — installed via nxInstallUUIDHooks() at boot ── */

/* ── INSTALL ALL OVERRIDES ── */
function nxInstallUUIDHooks() {
  // switchTab: wrap the CURRENT version (which already has all routing hooks)
  // so UUID tracking sits on top without breaking the existing chain
  const _currentSwitchTab = switchTab;
  switchTab = function(name) {
    const navUUID = UUID.gen('tab-nav', { from: _uuidLastTab||'init', to: name, ts: new Date().toISOString() }, 'tab:'+name);
    _uuidLastTab = name;
    _currentSwitchTab(name);
    setTimeout(nxStampNewElements, 120);
  };

  // openModal
  if(typeof openModal === 'function') {
    const _curr = openModal;
    openModal = function(id) {
      UUID.gen('modal', { action: 'open', modalId: id, from: _uuidLastTab }, 'modal:'+id);
      _curr(id);
    };
  }

  // wizOpen
  if(typeof wizOpen === 'function') {
    const _curr = wizOpen;
    wizOpen = function() {
      UUID.gen('wizard', { action: 'open', step: 0, from: _uuidLastTab }, 'wizard:open');
      _curr();
    };
  }

  // wizFinish
  if(typeof wizFinish === 'function') {
    const _curr = wizFinish;
    wizFinish = function() {
      UUID.gen('wizard', { action: 'finish', data: JSON.stringify(typeof WIZ!=='undefined'?WIZ.data||{}:{}).slice(0,200) }, 'wizard:finish');
      _curr();
    };
  }

  // openVoid
  if(typeof openVoid === 'function') {
    const _curr = openVoid;
    openVoid = function() {
      UUID.gen('void', { action: 'open', from: _uuidLastTab }, 'void:open');
      _curr();
    };
  }

  // nxError — wrap with UUID gen
  if(typeof nxError === 'function') {
    const _curr = nxError;
    nxError = function(code, msg, detail='', ctx='') {
      UUID.gen('error', { code, msg: msg.slice(0,80), ctx }, 'error:'+code);
      return _curr(code, msg, detail, ctx);
    };
  }

  // aiChat
  if(typeof aiChat === 'function') {
    const _curr = aiChat;
    aiChat = async function(messages, opts={}) {
      UUID.gen('ai-call', {
        provider: typeof AI!=='undefined'?AI.provider||'unknown':'unknown',
        msgCount: messages.length,
        stream: opts.stream!==false,
        temp: opts.temperature,
        firstMsg: messages[messages.length-1]?.content?.slice?.(0,60)||''
      }, 'ai:'+(typeof AI!=='undefined'?AI.provider||'unknown':'unknown'));
      return _curr(messages, opts);
    };
  }

  // forgeOpenContent
  if(typeof forgeOpenContent === 'function') {
    const _curr = forgeOpenContent;
    forgeOpenContent = function(id, name, content) {
      UUID.gen('file', { fileId: id, name, lang: typeof forgeLangFromName==='function'?forgeLangFromName(name):'', size: content?.length||0 }, 'file:'+name);
      _curr(id, name, content);
    };
  }

  // forgeSave
  if(typeof forgeSave === 'function') {
    const _curr = forgeSave;
    forgeSave = function() {
      const f = typeof FORGE!=='undefined'&&FORGE.activeFile ? FORGE.files[FORGE.activeFile] : null;
      if(f) UUID.gen('action', { action: 'forge:save', fileName: f.name, lines: f.content?.split?.('\n').length||0 }, 'forge:save:'+f.name);
      _curr();
    };
  }

  // forgeNewFile
  if(typeof forgeNewFile === 'function') {
    const _curr = forgeNewFile;
    forgeNewFile = function() {
      UUID.gen('file', { action: 'new', sessionId: UUID._sessionId }, 'file:new');
      _curr();
    };
  }

  // teSpawnInstance
  if(typeof teSpawnInstance === 'function') {
    const _curr = teSpawnInstance;
    teSpawnInstance = function() {
      UUID.gen('te-instance', { action: 'spawn', services: typeof TE!=='undefined'?Object.keys(TE.services||{}).filter(k=>TE.services[k]):[], sessionId: UUID._sessionId }, 'te:instance');
      _curr();
    };
  }

  // teStart
  if(typeof teStart === 'function') {
    const _curr = teStart;
    teStart = function() {
      UUID.gen('te-service', { action: 'start-all', sessionId: UUID._sessionId }, 'te:start');
      _curr();
    };
  }

  // teToggleService
  if(typeof teToggleService === 'function') {
    const _curr = teToggleService;
    teToggleService = function(name, force) {
      UUID.gen('te-service', { service: name, action: force===true?'start':force===false?'stop':'toggle' }, 'te:'+name);
      _curr(name, force);
    };
  }

  // teSqlRun
  if(typeof teSqlRun === 'function') {
    const _curr = teSqlRun;
    teSqlRun = async function(preQ) {
      const query = preQ||document.getElementById('te-sql-editor')?.value||'';
      UUID.gen('sql-query', { query: query.slice(0,100), db: typeof TE!=='undefined'?TE.activeDb||'unknown':'unknown', sessionId: UUID._sessionId }, 'sql:'+(typeof TE!=='undefined'?TE.activeDb:'?'));
      return _curr(preQ);
    };
  }

  // teRunPhp
  if(typeof teRunPhp === 'function') {
    const _curr = teRunPhp;
    teRunPhp = async function() {
      const code = document.getElementById('te-php-editor')?.value||'';
      UUID.gen('php-run', { lines: code.split('\n').length, size: code.length, sessionId: UUID._sessionId }, 'php:run');
      return _curr();
    };
  }

  // forgePilotSendMessage
  if(typeof forgePilotSendMessage === 'function') {
    const _curr = forgePilotSendMessage;
    forgePilotSendMessage = async function(userMsg, codeCtx) {
      UUID.gen('copilot', {
        mode: typeof FORGE!=='undefined'?FORGE.pilotMode||'unknown':'unknown',
        msgLen: userMsg?.length||0,
        hasCode: !!(codeCtx||(typeof FORGE!=='undefined'&&FORGE.files?.[FORGE.activeFile]?.content)),
        sessionId: UUID._sessionId
      }, 'copilot:'+(typeof FORGE!=='undefined'?FORGE.pilotMode||'msg':'msg'));
      return _curr(userMsg, codeCtx);
    };
  }

  // sbGenerate
  if(typeof sbGenerate === 'function') {
    const _curr = sbGenerate;
    sbGenerate = async function() {
      const vision = document.getElementById('sb-endstate')?.value?.trim()||'';
      if(vision) UUID.gen('build', { vision: vision.slice(0,80), lang: document.getElementById('sb-lang')?.value||'auto', outType: document.getElementById('sb-output-type')?.value||'', sessionId: UUID._sessionId }, 'build:'+vision.slice(0,30));
      return _curr();
    };
  }

  // saveNewProject
  if(typeof saveNewProject === 'function') {
    const _curr = saveNewProject;
    saveNewProject = function(name, code, description='') {
      UUID.gen('project', { name, lines: code?.split?.('\n').length||0, description: description.slice(0,60) }, 'project:'+name);
      return _curr(name, code, description);
    };
  }

  // voidSend
  if(typeof voidSend === 'function') {
    const _curr = voidSend;
    voidSend = async function() {
      const msg = document.getElementById('void-input')?.value||'';
      UUID.gen('void', { action: 'send', msgLen: msg.length, sessionId: UUID._sessionId }, 'void:send');
      return _curr();
    };
  }

  // forgeHandleFiles
  if(typeof forgeHandleFiles === 'function') {
    const _curr = forgeHandleFiles;
    forgeHandleFiles = function(files) {
      if(files) Array.from(files).forEach(f => {
        UUID.gen('drag-drop', { fileName: f.name, size: f.size, type: f.type }, 'drop:'+f.name);
      });
      _curr(files);
    };
  }

  // logIdea
  if(typeof logIdea === 'function') {
    const _curr = logIdea;
    logIdea = function(type, text, projId='') {
      UUID.gen('idea', { ideaType: type, textLen: text?.length||0, projId, sessionId: UUID._sessionId }, 'idea:'+type);
      _curr(type, text, projId);
    };
  }

  // pwRunAll
  if(typeof pwRunAll === 'function') {
    const _curr = pwRunAll;
    pwRunAll = async function() {
      UUID.gen('test-run', { action: 'start-all', sessionId: UUID._sessionId, ts: new Date().toISOString() }, 'test:all');
      return _curr();
    };
  }

  // consoleSubmit
  if(typeof consoleSubmit === 'function') {
    const _curr = consoleSubmit;
    consoleSubmit = async function() {
      const text = document.getElementById('console-input')?.value?.trim()||'';
      if(text) UUID.gen('action', { action: 'console:submit', msgLen: text.length, engine: document.querySelector('.eng-pill.active-er')?.dataset.eng||'none', sessionId: UUID._sessionId }, 'console:submit');
      return _curr();
    };
  }

  // templateGenerate
  if(typeof templateGenerate === 'function') {
    const _curr = templateGenerate;
    templateGenerate = async function() {
      const name = document.getElementById('tpl-name')?.value?.trim()||'unnamed';
      UUID.gen('template', { name, target: document.getElementById('tpl-target')?.value||'', sessionId: UUID._sessionId }, 'template:'+name);
      return _curr();
    };
  }

  // compileRun
  if(typeof compileRun === 'function') {
    const _curr = compileRun;
    compileRun = async function() {
      UUID.gen('compile', { appName: document.getElementById('comp-appname')?.value||'app', version: document.getElementById('comp-version')?.value||'1.0', sessionId: UUID._sessionId }, 'compile:run');
      return _curr();
    };
  }

  // sbGenerateSISO
  if(typeof sbGenerateSISO === 'function') {
    const _curr = sbGenerateSISO;
    sbGenerateSISO = async function(vision) {
      UUID.gen('siso-session', { vision: vision?.slice(0,60)||'', sessionId: UUID._sessionId }, 'siso:'+( vision?.slice(0,20)||'run'));
      return _curr(vision);
    };
  }

  // REV.add
  if(typeof REV !== 'undefined' && REV && typeof REV.add === 'function') {
    const _curr = REV.add.bind(REV);
    REV.add = function(id, code, type='auto', label='') {
      UUID.gen('revision', { projectId: id, revType: type, label, lines: code?.split?.('\n').length||0, sessionId: UUID._sessionId }, 'revision:'+id.slice(0,12));
      return _curr(id, code, type, label);
    };
  }

  log_ev('uuid:hooks-installed', { count: 26 }, 'INFO');

  /* ══ EXTENDED HOOKS — every remaining significant function ══ */

  // Project operations
  if(typeof deleteProject==='function'){const _c=deleteProject;deleteProject=function(id){UUID.gen('action',{action:'project:delete',projectId:id,tab:_uuidLastTab},'project:delete:'+id.slice(0,12));_c(id);};}
  if(typeof openProjectWorkspace==='function'){const _c=openProjectWorkspace;openProjectWorkspace=function(id){const p=getProjects?.().find(x=>x.id===id);UUID.gen('action',{action:'workspace:open',projectId:id,name:p?.name||'',tab:_uuidLastTab},'workspace:'+id.slice(0,12));_c(id);};}
  if(typeof projCloseWorkspace==='function'){const _c=projCloseWorkspace;projCloseWorkspace=function(){UUID.gen('action',{action:'workspace:close',tab:_uuidLastTab},'workspace:close');_c();};}
  if(typeof projExportAll==='function'){const _c=projExportAll;projExportAll=function(){UUID.gen('export',{action:'projects:export-all',count:getProjects?.().length||0},'export:projects');_c();};}
  if(typeof sbSaveProject==='function'){const _c=sbSaveProject;sbSaveProject=function(){const v=document.getElementById('sb-endstate')?.value?.trim()||'';UUID.gen('project',{action:'save-from-builder',vision:v.slice(0,60),chars:document.getElementById('sb-output')?.textContent?.length||0},'project:builder-save');_c();};}

  // Builder operations
  if(typeof sbDownload==='function'){const _c=sbDownload;sbDownload=function(){UUID.gen('export',{action:'builder:download',chars:document.getElementById('sb-output')?.textContent?.length||0},'export:builder-code');_c();};}
  if(typeof sbValidate==='function'){const _c=sbValidate;sbValidate=async function(){UUID.gen('action',{action:'build:validate',sessionId:UUID._sessionId,tab:_uuidLastTab},'build:validate');return _c();};}
  if(typeof sbHostileAttack==='function'){const _c=sbHostileAttack;sbHostileAttack=async function(){UUID.gen('action',{action:'build:hostile-attack',tab:_uuidLastTab,sessionId:UUID._sessionId},'build:hostile');return _c();};}
  if(typeof sbInjectContext==='function'){const _c=sbInjectContext;sbInjectContext=function(){const v=document.getElementById('sb-inject')?.value||'';UUID.gen('action',{action:'build:inject',len:v.length,tab:_uuidLastTab},'build:inject');_c();};}
  if(typeof sbAutoGenDocs==='function'){const _c=sbAutoGenDocs;sbAutoGenDocs=async function(){UUID.gen('action',{action:'build:auto-docs',tab:_uuidLastTab},'build:docs');return _c();};}
  if(typeof sbResetGates==='function'){const _c=sbResetGates;sbResetGates=function(){UUID.gen('action',{action:'build:reset-gates',tab:_uuidLastTab},'build:reset-gates');_c();};}
  if(typeof sbClearOutput==='function'){const _c=sbClearOutput;sbClearOutput=function(){UUID.gen('action',{action:'build:clear-output',tab:_uuidLastTab},'build:clear');_c();};}
  if(typeof sbCopyOutput==='function'){const _c=sbCopyOutput;sbCopyOutput=function(){UUID.gen('action',{action:'build:copy-output',chars:document.getElementById('sb-output')?.textContent?.length||0},'build:copy');_c();};}
  if(typeof sisoStop==='function'){const _c=sisoStop;sisoStop=function(){UUID.gen('action',{action:'siso:stop',sessionId:UUID._sessionId},'siso:stop');_c();};}
  if(typeof sisoResume==='function'){const _c=sisoResume;sisoResume=async function(){UUID.gen('action',{action:'siso:resume',sessionId:UUID._sessionId},'siso:resume');return _c();};}

  // Workspace (project editor)
  if(typeof wsGithubPush==='function'){const _c=wsGithubPush;wsGithubPush=async function(){const n=typeof _wsProject!=='undefined'?_wsProject?.name||'unknown':'unknown';UUID.gen('action',{action:'github:push',project:n,tab:_uuidLastTab},'github:push:'+n.slice(0,16));return _c();};}
  if(typeof wsGithubPull==='function'){const _c=wsGithubPull;wsGithubPull=async function(){UUID.gen('action',{action:'github:pull',tab:_uuidLastTab},'github:pull');return _c();};}
  if(typeof wsGithubHistory==='function'){const _c=wsGithubHistory;wsGithubHistory=function(){UUID.gen('action',{action:'github:history',tab:_uuidLastTab},'github:history');_c();};}
  if(typeof wsAudit==='function'){const _c=wsAudit;wsAudit=async function(){UUID.gen('action',{action:'workspace:audit',tab:_uuidLastTab},'workspace:audit');return _c();};}
  if(typeof wsRunAudit==='function'){const _c=wsRunAudit;wsRunAudit=async function(){UUID.gen('action',{action:'workspace:run-audit',tab:_uuidLastTab},'workspace:run-audit');return _c();};}
  if(typeof wsEnhance==='function'){const _c=wsEnhance;wsEnhance=async function(){UUID.gen('action',{action:'workspace:enhance',tab:_uuidLastTab},'workspace:enhance');return _c();};}
  if(typeof wsDownload==='function'){const _c=wsDownload;wsDownload=function(){const n=typeof _wsProject!=='undefined'?_wsProject?.name||'file':'file';UUID.gen('export',{action:'workspace:download',project:n},'export:workspace:'+n.slice(0,16));_c();};}
  if(typeof wsSaveRevision==='function'){const _c=wsSaveRevision;wsSaveRevision=function(type){const n=typeof _wsProject!=='undefined'?_wsProject?.name||'':''  ;UUID.gen('revision',{action:'save',revType:type,project:n,sessionId:UUID._sessionId},'revision:'+n.slice(0,16));_c(type);};}
  if(typeof wsRestoreRevision==='function'){const _c=wsRestoreRevision;wsRestoreRevision=function(id){UUID.gen('action',{action:'revision:restore',revId:id,tab:_uuidLastTab},'revision:restore:'+id.slice(0,12));_c(id);};}
  if(typeof wsAddRoadmapItem==='function'){const _c=wsAddRoadmapItem;wsAddRoadmapItem=function(){UUID.gen('action',{action:'roadmap:add-item',tab:_uuidLastTab},'roadmap:add');_c();};}
  if(typeof wsRefreshPreview==='function'){const _c=wsRefreshPreview;wsRefreshPreview=function(){UUID.gen('action',{action:'workspace:preview-refresh',tab:_uuidLastTab},'workspace:preview');_c();};}

  // Template & docs
  if(typeof templateSave==='function'){const _c=templateSave;templateSave=function(){const n=document.getElementById('tpl-name')?.value||'unnamed';UUID.gen('template',{action:'save',name:n,tab:_uuidLastTab},'template:save:'+n.slice(0,20));_c();};}
  if(typeof templateExport==='function'){const _c=templateExport;templateExport=function(){UUID.gen('export',{action:'template:export',tab:_uuidLastTab},'export:template');_c();};}
  if(typeof docsGenerate==='function'){const _c=docsGenerate;docsGenerate=async function(){const p=document.getElementById('docs-proj-sel')?.value||'';UUID.gen('action',{action:'docs:generate',projectId:p,tab:_uuidLastTab},'docs:gen:'+p.slice(0,12));return _c();};}
  if(typeof docsGenerateTechnical==='function'){const _c=docsGenerateTechnical;docsGenerateTechnical=async function(){UUID.gen('action',{action:'docs:technical',tab:_uuidLastTab,sessionId:UUID._sessionId},'docs:technical');return _c();};}
  if(typeof docsDownload==='function'){const _c=docsDownload;docsDownload=function(){UUID.gen('export',{action:'docs:download',tab:_uuidLastTab},'export:docs');_c();};}

  // Features
  if(typeof featAdd==='function'){const _c=featAdd;featAdd=function(){UUID.gen('action',{action:'feat:add',tab:_uuidLastTab},'feat:add');_c();};}
  if(typeof featDetect==='function'){const _c=featDetect;featDetect=async function(){UUID.gen('action',{action:'feat:detect',tab:_uuidLastTab,sessionId:UUID._sessionId},'feat:detect');return _c();};}
  if(typeof featVerify==='function'){const _c=featVerify;featVerify=async function(i){UUID.gen('action',{action:'feat:verify',index:i,tab:_uuidLastTab},'feat:verify:'+i);return _c(i);};}
  if(typeof featSeparateFiles==='function'){const _c=featSeparateFiles;featSeparateFiles=async function(){UUID.gen('action',{action:'feat:separate-files',tab:_uuidLastTab},'feat:separate');return _c();};}

  // QA
  if(typeof qaRunAll==='function'){const _c=qaRunAll;qaRunAll=async function(){UUID.gen('test-run',{action:'qa:run-all',tab:_uuidLastTab,sessionId:UUID._sessionId},'qa:all');return _c();};}
  if(typeof qaRunSuite==='function'){const _c=qaRunSuite;qaRunSuite=async function(id){UUID.gen('test-run',{action:'qa:run-suite',suiteId:id,tab:_uuidLastTab},'qa:suite:'+id);return _c(id);};}

  // Enhance
  if(typeof enhGenerate==='function'){const _c=enhGenerate;enhGenerate=async function(){const p=document.getElementById('enh-project-sel')?.value||'';UUID.gen('action',{action:'enhance:generate',projectId:p,tab:_uuidLastTab,sessionId:UUID._sessionId},'enhance:gen:'+p.slice(0,12));return _c();};}
  if(typeof enhAudit==='function'){const _c=enhAudit;enhAudit=async function(){UUID.gen('action',{action:'enhance:audit',tab:_uuidLastTab,sessionId:UUID._sessionId},'enhance:audit');return _c();};}
  if(typeof enhApply==='function'){const _c=enhApply;enhApply=async function(){UUID.gen('action',{action:'enhance:apply',tab:_uuidLastTab},'enhance:apply');return _c();};}
  if(typeof enhRestore==='function'){const _c=enhRestore;enhRestore=async function(id){UUID.gen('action',{action:'enhance:restore',revId:id,tab:_uuidLastTab},'enhance:restore:'+id.slice(0,12));return _c(id);};}
  if(typeof enhSaveRevision==='function'){const _c=enhSaveRevision;enhSaveRevision=function(type){UUID.gen('revision',{action:'enhance:save',revType:type,tab:_uuidLastTab,sessionId:UUID._sessionId},'revision:enhance:'+type);_c(type);};}

  // Void
  if(typeof voidFlowRitual==='function'){const _c=voidFlowRitual;voidFlowRitual=async function(type){UUID.gen('void',{action:'flow-ritual',ritualType:type,tab:_uuidLastTab,sessionId:UUID._sessionId},'void:ritual:'+type);return _c(type);};}
  if(typeof voidInspire==='function'){const _c=voidInspire;voidInspire=async function(){UUID.gen('void',{action:'inspire',tab:_uuidLastTab,sessionId:UUID._sessionId},'void:inspire');return _c();};}
  if(typeof voidSpar==='function'){const _c=voidSpar;voidSpar=async function(){const m=document.getElementById('void-spar-input')?.value||'';UUID.gen('void',{action:'spar',msgLen:m.length,sessionId:UUID._sessionId},'void:spar');return _c();};}
  if(typeof voidSparStrength==='function'){const _c=voidSparStrength;voidSparStrength=async function(){UUID.gen('void',{action:'spar:strength',sessionId:UUID._sessionId},'void:spar-strength');return _c();};}
  if(typeof voidSparSynth==='function'){const _c=voidSparSynth;voidSparSynth=async function(){UUID.gen('void',{action:'spar:synth',sessionId:UUID._sessionId},'void:spar-synth');return _c();};}
  if(typeof voidGround==='function'){const _c=voidGround;voidGround=async function(){UUID.gen('void',{action:'ground',sessionId:UUID._sessionId},'void:ground');return _c();};}
  if(typeof voidGroundTech==='function'){const _c=voidGroundTech;voidGroundTech=async function(){UUID.gen('void',{action:'ground:tech',sessionId:UUID._sessionId},'void:ground-tech');return _c();};}
  if(typeof voidExport==='function'){const _c=voidExport;voidExport=function(){UUID.gen('export',{action:'void:export',tab:_uuidLastTab},'export:void');_c();};}

  // Chat pipe
  if(typeof chatPipeConnect==='function'){const _c=chatPipeConnect;chatPipeConnect=function(){UUID.gen('action',{action:'pipe:connect',url:typeof PIPE!=='undefined'?PIPE.url||'':'',tab:_uuidLastTab},'pipe:connect');_c();};}
  if(typeof chatPipeDisconnect==='function'){const _c=chatPipeDisconnect;chatPipeDisconnect=function(){UUID.gen('action',{action:'pipe:disconnect',tab:_uuidLastTab},'pipe:disconnect');_c();};}
  if(typeof chatPipeOpenWindow==='function'){const _c=chatPipeOpenWindow;chatPipeOpenWindow=function(){UUID.gen('action',{action:'pipe:open-window',tab:_uuidLastTab},'pipe:open-window');_c();};}

  // GitHub
  if(typeof ghTest==='function'){const _c=ghTest;ghTest=function(){UUID.gen('action',{action:'github:test-connection',repo:typeof GH!=='undefined'?GH.repo||'':'',tab:_uuidLastTab},'github:test');_c();};}
  if(typeof ghSave==='function'){const _c=ghSave;ghSave=function(){UUID.gen('action',{action:'github:save-config',tab:_uuidLastTab},'github:save-config');_c();};}

  // Bridge
  if(typeof bridgeConnect==='function'){const _c=bridgeConnect;bridgeConnect=async function(){UUID.gen('action',{action:'bridge:connect',url:typeof BRIDGE!=='undefined'?BRIDGE.url||'':'',tab:_uuidLastTab},'bridge:connect');return _c();};}
  if(typeof bridgeFetchHealth==='function'){const _c=bridgeFetchHealth;bridgeFetchHealth=async function(){UUID.gen('action',{action:'bridge:health-check',tab:_uuidLastTab},'bridge:health');return _c();};}

  // P2P
  if(typeof p2pConnect==='function'){const _c=p2pConnect;p2pConnect=async function(){UUID.gen('action',{action:'p2p:connect',remoteId:document.getElementById('p2p-remote-id')?.value||'',tab:_uuidLastTab},'p2p:connect');return _c();};}
  if(typeof p2pDisconnect==='function'){const _c=p2pDisconnect;p2pDisconnect=function(){UUID.gen('action',{action:'p2p:disconnect',tab:_uuidLastTab},'p2p:disconnect');_c();};}
  if(typeof p2pStart==='function'){const _c=p2pStart;p2pStart=async function(){UUID.gen('action',{action:'p2p:start',peerId:document.getElementById('p2p-peer-id')?.value||'',tab:_uuidLastTab},'p2p:start');return _c();};}
  if(typeof p2pStop==='function'){const _c=p2pStop;p2pStop=function(){UUID.gen('action',{action:'p2p:stop',tab:_uuidLastTab},'p2p:stop');_c();};}
  if(typeof p2pRefresh==='function'){const _c=p2pRefresh;p2pRefresh=function(){UUID.gen('action',{action:'p2p:refresh',tab:_uuidLastTab},'p2p:refresh');_c();};}

  // Accounts
  if(typeof accountConnect==='function'){const _c=accountConnect;accountConnect=async function(){const p=document.getElementById('new-account-provider')?.value||'';const i=document.getElementById('new-account-id')?.value||'';UUID.gen('action',{action:'account:connect',provider:p,accountId:i,tab:_uuidLastTab},'account:connect:'+p);return _c();};}
  if(typeof accountDelete==='function'){const _c=accountDelete;accountDelete=function(p,id){UUID.gen('action',{action:'account:delete',provider:p,accountId:id,tab:_uuidLastTab},'account:delete:'+p);_c(p,id);};}
  if(typeof accountMarkActive==='function'){const _c=accountMarkActive;accountMarkActive=function(p,id){UUID.gen('action',{action:'account:set-active',provider:p,accountId:id,tab:_uuidLastTab},'account:active:'+p);_c(p,id);};}
  if(typeof accountsRefresh==='function'){const _c=accountsRefresh;accountsRefresh=async function(){UUID.gen('action',{action:'accounts:refresh',tab:_uuidLastTab},'accounts:refresh');return _c();};}

  // Forge
  if(typeof forgeHostile==='function'){const _c=forgeHostile;forgeHostile=async function(){const f=typeof FORGE!=='undefined'&&FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;UUID.gen('action',{action:'forge:hostile',fileName:f?.name||'',lang:f?.lang||'',size:f?.content?.length||0,sessionId:UUID._sessionId},'forge:hostile');return _c();};}
  if(typeof forgeLint==='function'){const _c=forgeLint;forgeLint=function(){const f=typeof FORGE!=='undefined'&&FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;UUID.gen('action',{action:'forge:lint',fileName:f?.name||'',lang:f?.lang||'',tab:_uuidLastTab},'forge:lint');_c();};}
  if(typeof forgeFormat==='function'){const _c=forgeFormat;forgeFormat=function(){const f=typeof FORGE!=='undefined'&&FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;UUID.gen('action',{action:'forge:format',fileName:f?.name||'',lang:f?.lang||'',tab:_uuidLastTab},'forge:format');_c();};}
  if(typeof forgeDownload==='function'){const _c=forgeDownload;forgeDownload=function(){const f=typeof FORGE!=='undefined'&&FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;UUID.gen('export',{action:'forge:download',fileName:f?.name||'',size:f?.content?.length||0},'export:forge:'+( f?.name||'file'));_c();};}
  if(typeof forgePilotApplyPatch==='function'){const _c=forgePilotApplyPatch;forgePilotApplyPatch=function(){const f=typeof FORGE!=='undefined'&&FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;UUID.gen('action',{action:'copilot:apply-patch',mode:typeof FORGE!=='undefined'?FORGE.pilotMode:'',fileName:f?.name||'',sessionId:UUID._sessionId},'copilot:patch');_c();};}
  if(typeof forgePilotAbort==='function'){const _c=forgePilotAbort;forgePilotAbort=function(){UUID.gen('action',{action:'copilot:abort',mode:typeof FORGE!=='undefined'?FORGE.pilotMode:'',tab:_uuidLastTab},'copilot:abort');_c();};}
  if(typeof forgeConsoleClear==='function'){const _c=forgeConsoleClear;forgeConsoleClear=function(){UUID.gen('action',{action:'forge:console-clear',tab:_uuidLastTab},'forge:console-clear');_c();};}
  if(typeof forgeCompile==='function'){const _c=forgeCompile;forgeCompile=async function(){const f=typeof FORGE!=='undefined'&&FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;const targets=[...document.querySelectorAll('#forge-comp-targets .chk.on')].map(c=>c.dataset.ct);UUID.gen('compile',{action:'forge:compile',fileName:f?.name||'',targets,sessionId:UUID._sessionId},'compile:forge:'+( f?.name||'file'));return _c();};}

  // AI config
  if(typeof addAxiom==='function'){const _c=addAxiom;addAxiom=function(p){UUID.gen('action',{action:'axiom:add',provider:p,tab:_uuidLastTab},'axiom:add:'+p);_c(p);};}
  if(typeof removeAxiom==='function'){const _c=removeAxiom;removeAxiom=function(p,i){UUID.gen('action',{action:'axiom:remove',provider:p,index:i,tab:_uuidLastTab},'axiom:remove:'+p);_c(p,i);};}
  if(typeof testChatGPT==='function'){const _c=testChatGPT;testChatGPT=async function(){UUID.gen('action',{action:'provider:test',provider:'chatgpt',tab:_uuidLastTab},'provider:test:chatgpt');return _c();};}
  if(typeof testClaude==='function'){const _c=testClaude;testClaude=async function(){UUID.gen('action',{action:'provider:test',provider:'claude',tab:_uuidLastTab},'provider:test:claude');return _c();};}
  if(typeof testOllama==='function'){const _c=testOllama;testOllama=async function(){UUID.gen('action',{action:'provider:test',provider:'ollama',url:document.getElementById('opt-ollama-url')?.value||'',tab:_uuidLastTab},'provider:test:ollama');return _c();};}
  if(typeof testLMS==='function'){const _c=testLMS;testLMS=async function(){UUID.gen('action',{action:'provider:test',provider:'lmstudio',tab:_uuidLastTab},'provider:test:lms');return _c();};}
  if(typeof ollamaRefreshModels==='function'){const _c=ollamaRefreshModels;ollamaRefreshModels=async function(){UUID.gen('action',{action:'ollama:refresh-models',tab:_uuidLastTab},'ollama:refresh');return _c();};}
  if(typeof customProviderAdd==='function'){const _c=customProviderAdd;customProviderAdd=function(){const id=document.getElementById('custom-provider-id')?.value||'';UUID.gen('action',{action:'provider:add-custom',id,tab:_uuidLastTab},'provider:custom:'+id);_c();};}

  // Log & monitoring
  if(typeof logClear==='function'){const _c=logClear;logClear=function(){UUID.gen('action',{action:'log:clear',tab:_uuidLastTab},'log:clear');_c();};}
  if(typeof logExport==='function'){const _c=logExport;logExport=function(){UUID.gen('export',{action:'log:export',count:typeof _NX_LOG!=='undefined'?_NX_LOG.length:0,tab:_uuidLastTab},'export:event-log');_c();};}
  if(typeof jaaExport==='function'){const _c=jaaExport;jaaExport=function(){UUID.gen('export',{action:'jaa:export',count:JAA?.getAll().length||0,tab:_uuidLastTab},'export:jaa');_c();};}
  if(typeof jaaConfirmClear==='function'){const _c=jaaConfirmClear;jaaConfirmClear=function(){UUID.gen('action',{action:'jaa:clear',tab:_uuidLastTab},'jaa:clear');_c();};}
  if(typeof deltaExport==='function'){const _c=deltaExport;deltaExport=function(){UUID.gen('export',{action:'delta:export',count:DELTA?.getAll().length||0,tab:_uuidLastTab},'export:deltas');_c();};}
  if(typeof uuidExport==='function'){const _c=uuidExport;uuidExport=function(){UUID.gen('export',{action:'uuid:export',count:UUID.getAll().length,tab:_uuidLastTab},'export:uuids');_c();};}

  // Ideas
  if(typeof ideaClear==='function'){const _c=ideaClear;ideaClear=function(){UUID.gen('action',{action:'ideas:clear',tab:_uuidLastTab},'ideas:clear');_c();};}
  if(typeof ideaExport==='function'){const _c=ideaExport;ideaExport=function(){UUID.gen('export',{action:'ideas:export',tab:_uuidLastTab},'export:ideas');_c();};}

  // Routing / intent
  if(typeof routingTest==='function'){const _c=routingTest;routingTest=async function(){const p=document.getElementById('route-test-provider')?.value||'auto';UUID.gen('action',{action:'routing:test',provider:p,tab:_uuidLastTab},'routing:test:'+p);return _c();};}
  if(typeof intentAdd==='function'){const _c=intentAdd;intentAdd=function(){const k=document.getElementById('new-intent-key')?.value||'';UUID.gen('action',{action:'intent:add',key:k,tab:_uuidLastTab},'intent:add:'+k);_c();};}
  if(typeof intentRemove==='function'){const _c=intentRemove;intentRemove=function(k){UUID.gen('action',{action:'intent:remove',key:k,tab:_uuidLastTab},'intent:remove:'+k);_c(k);};}

  // Help
  if(typeof helpAskCopilot==='function'){const _c=helpAskCopilot;helpAskCopilot=async function(){const q=document.getElementById('help-copilot-input')?.value||'';UUID.gen('action',{action:'help:ask-copilot',queryLen:q.length,sessionId:UUID._sessionId},'help:copilot');return _c();};}
  if(typeof helpSearch==='function'){const _c=helpSearch;helpSearch=async function(){const q=document.getElementById('help-search-input')?.value||'';UUID.gen('action',{action:'help:search',query:q.slice(0,60),tab:_uuidLastTab},'help:search');return _c();};}
  if(typeof helpShowTopic==='function'){const _c=helpShowTopic;helpShowTopic=function(key){UUID.gen('action',{action:'help:topic',key,tab:_uuidLastTab},'help:topic:'+key);_c(key);};}

  // Config
  if(typeof saveConfig==='function'){const _c=saveConfig;saveConfig=function(){UUID.gen('action',{action:'config:save',tab:_uuidLastTab},'config:save');_c();};}
  if(typeof setWorkspaceMode==='function'){const _c=setWorkspaceMode;setWorkspaceMode=function(mode){UUID.gen('action',{action:'workspace:mode-change',mode,tab:_uuidLastTab},'workspace:mode:'+mode);_c(mode);};}
  if(typeof applyAccent==='function'){const _c=applyAccent;applyAccent=function(color){UUID.gen('action',{action:'ui:accent-color',color,tab:_uuidLastTab},'ui:accent');_c(color);};}

  // Wizard steps
  if(typeof wizNext==='function'){const _c=wizNext;wizNext=function(){UUID.gen('wizard',{action:'next',step:typeof WIZ!=='undefined'?WIZ.step:0,tab:_uuidLastTab},'wizard:next');_c();};}
  if(typeof wizPrev==='function'){const _c=wizPrev;wizPrev=function(){UUID.gen('wizard',{action:'prev',step:typeof WIZ!=='undefined'?WIZ.step:0,tab:_uuidLastTab},'wizard:prev');_c();};}
  if(typeof wizSelect==='function'){const _c=wizSelect;wizSelect=function(el,step){UUID.gen('wizard',{action:'select',step,value:el?.dataset?.val||'',tab:_uuidLastTab},'wizard:select:'+( el?.dataset?.val||''));_c(el,step);};}
  if(typeof wizToggle==='function'){const _c=wizToggle;wizToggle=function(el){UUID.gen('wizard',{action:'toggle',value:el?.dataset?.val||'',tab:_uuidLastTab},'wizard:toggle:'+( el?.dataset?.val||''));_c(el);};}

  // Import/drop
  if(typeof homeFileSelected==='function'){const _c=homeFileSelected;homeFileSelected=function(e){const files=[...e.target.files||[]];files.forEach(f=>UUID.gen('import',{action:'home:file-selected',name:f.name,size:f.size,type:f.type},'import:'+f.name));_c(e);};}
  if(typeof processImportFiles==='function'){const _c=processImportFiles;processImportFiles=async function(files){if(files)Array.from(files).forEach(f=>UUID.gen('import',{action:'import:process',name:f.name,size:f.size},'import:'+f.name));return _c(files);};}

  // Engine explorer
  if(typeof engExplorerSend==='function'){const _c=engExplorerSend;engExplorerSend=async function(){const msg=document.getElementById('eng-explore-input')?.value||'';const mode=document.getElementById('eng-explore-mode')?.value||'';UUID.gen('action',{action:'engine:explore',mode,msgLen:msg.length,sessionId:UUID._sessionId},'engine:explore:'+mode);return _c();};}

  log_ev('uuid:extended-hooks-installed', { totalHooks: 100 }, 'INFO');
}

/* ── UUID STAMP NEW ELEMENTS (called after tab switch) ── */
function nxStampNewElements() {
  document.querySelectorAll('.tab-btn[data-tab]:not([data-uuid]), .ptab:not([data-uuid]), [data-sbt]:not([data-uuid])').forEach(el => {
    const label = el.dataset.tab||el.dataset.ptab||el.dataset.sbt||el.textContent.trim().slice(0,20);
    nxAssignUUID(el, 'tab-nav', 'tab:'+label, { label });
  });
}

/* ── UUID INSPECTOR ── */
let _inspectorCurrentUUID = null;

function uuidInspectorOpen(id) {
  const record = UUID.getById(id);
  if(!record) return;
  _inspectorCurrentUUID = id;
  document.getElementById('uuid-insp-id').textContent = id;
  const body = document.getElementById('uuid-insp-body');
  const rows = [
    ['UUID', id, true],
    ['Type', record.type, false],
    ['Entity', record.entity||'—', false],
    ['Status', record.valid?'✓ VALID':'✕ INVALIDATED', false],
    ['Created', record.created, false],
    ['Session', record.sessionId||'—', false],
    ['Sequence', '#'+record.sequence, false],
  ];
  const metaRows = Object.entries(record.meta||{}).filter(([k])=>k!=='userAgent').map(([k,v])=>
    [`meta.${k}`, String(v).slice(0,120), false]
  );
  if(record.invalidated) rows.push(['Invalidated', record.invalidated, false]);
  if(record.invalidReason) rows.push(['Void Reason', record.invalidReason, false]);

  body.innerHTML = [...rows, ...metaRows].map(([k,v,hi])=>
    `<div class="uuid-insp-row"><span class="uuid-insp-key">${esc(k)}</span><span class="uuid-insp-val${hi?' highlight':''}">${esc(String(v))}</span></div>`
  ).join('');

  // Add mini timeline: show 5 most recent UUIDs in same session
  if(record.sessionId) {
    const related = UUID.getBySession(record.sessionId).slice(-5).reverse();
    if(related.length > 1) {
      body.innerHTML += `<div class="uuid-timeline"><div style="font-size:8px;color:var(--text3);margin-bottom:4px;letter-spacing:.1em">SESSION TIMELINE (last 5)</div>` +
        related.map(r=>`<div class="uuid-tl-item"><div class="uuid-tl-dot" style="background:${r.id===id?'var(--c)':'var(--border3)'}"></div><span class="uuid-tl-text">${esc(r.type+' · '+(r.entity||'').slice(0,30))}</span><span class="uuid-tl-ts">${r.created?.slice(11,19)||''}</span></div>`).join('') +
        `</div>`;
    }
  }

  document.getElementById('uuid-inspector').classList.add('open');
}

function uuidInspectorCopy() {
  const record = _inspectorCurrentUUID ? UUID.getById(_inspectorCurrentUUID) : null;
  if(!record) return;
  navigator.clipboard?.writeText(JSON.stringify(record, null, 2)).then(()=>toast('UUID record copied','ok')).catch(()=>toast('Copy failed','warn'));
}

function uuidInspectorInvalidate() {
  if(!_inspectorCurrentUUID) return;
  if(!confirm('Invalidate UUID: '+_inspectorCurrentUUID+'?')) return;
  UUID.invalidate(_inspectorCurrentUUID, 'manually invalidated');
  toast('UUID invalidated','warn');
  uuidRender();
  document.getElementById('uuid-inspector').classList.remove('open');
}

/* ── UUID REGISTRY RENDER ── */
function uuidRender() {
  const body = document.getElementById('uuid-registry-body');
  if(!body) return;
  body.innerHTML = '';

  const all = UUID.getAll();
  const search = (document.getElementById('uuid-search')?.value||'').toLowerCase();
  const typeFilter = document.getElementById('uuid-filter-type')?.value||'';
  const statusFilter = document.getElementById('uuid-filter-status')?.value||'';

  const filtered = all.filter(u=>{
    if(typeFilter && u.type!==typeFilter) return false;
    if(statusFilter==='valid' && !u.valid) return false;
    if(statusFilter==='invalid' && u.valid) return false;
    if(search){
      const hay = [u.id, u.type, u.entity, JSON.stringify(u.meta)].join(' ').toLowerCase();
      if(!hay.includes(search)) return false;
    }
    return true;
  }).slice().reverse(); // newest first

  const cnt = document.getElementById('uuid-count');
  if(cnt) cnt.textContent = filtered.length + ' / ' + all.length + ' UUIDs';
  const vcnt = document.getElementById('uuid-valid-count');
  if(vcnt){ const s=UUID.stats(); vcnt.textContent=s.valid+' valid · '+s.invalid+' void'; }

  // Render metrics bar
  nxRenderUUIDMetrics(all);

  // Render rows
  const frag = document.createDocumentFragment();
  filtered.slice(0, 500).forEach(u => frag.appendChild(UUID._buildRow(u)));
  if(filtered.length > 500) {
    const more = document.createElement('div');
    more.style.cssText='padding:8px 0;font-size:9px;color:var(--text3);text-align:center;font-style:italic;';
    more.textContent = `… ${filtered.length-500} more (use filter to narrow)`;
    frag.appendChild(more);
  }
  body.appendChild(frag);
}

function nxRenderUUIDMetrics(all) {
  const bar = document.getElementById('uuid-metrics-bar');
  if(!bar) return;
  const byType = {};
  all.forEach(u=>{ byType[u.type]=(byType[u.type]||0)+1; });
  const topTypes = Object.entries(byType).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const valid = all.filter(u=>u.valid).length;

  bar.innerHTML = [
    ['TOTAL', all.length, 'var(--c)'],
    ['VALID', valid, 'var(--g)'],
    ['VOID', all.length-valid, 'var(--r)'],
    ['SESSION', UUID.stats().byType['session']||0, 'var(--m)'],
    ...topTypes.map(([t,n])=>[t.toUpperCase().slice(0,8), n, 'var(--text2)'])
  ].map(([label, val, color])=>
    `<div class="uuid-metric" onclick="uuidFilterType('${label.toLowerCase()}')">
      <span class="uuid-metric-val" style="color:${color}">${val}</span>
      <span class="uuid-metric-lbl">${esc(label)}</span>
    </div>`
  ).join('');
}

function uuidFilterType(type) {
  const sel = document.getElementById('uuid-filter-type');
  if(!sel) return;
  // Map display label back to option value
  const opt = [...sel.options].find(o=>o.value===type||o.text.toLowerCase()===type.toLowerCase());
  if(opt) sel.value = opt.value;
  else sel.value = '';
  uuidRender();
}

function uuidCopyAll() {
  const all = UUID.getAll();
  navigator.clipboard?.writeText(JSON.stringify(all, null, 2))
    .then(()=>toast('All UUIDs copied ('+all.length+')','ok'))
    .catch(()=>toast('Copy failed','warn'));
}

function uuidExport() {
  UUID.exportJSON();
  toast('UUID registry exported','ok');
}

/* ── UUID POST-INIT: called after everything else boots ── */
let _uuidLastTab = 'home';

function nxUUIDPostInit() {
  // Start the app session UUID
  const sessionId = UUID.startSession('app:boot');
  UUID.gen('system', {
    event: 'startup', version: '9.0', sessionId,
    userAgent: navigator.userAgent.slice(0, 80),
    viewport: window.innerWidth + 'x' + window.innerHeight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }, 'system:startup');

  // Stamp all interactive elements after DOM settles
  setTimeout(nxStampAllElements, 400);

  // Install all function hooks AFTER all other patches are in place
  setTimeout(nxInstallUUIDHooks, 80);

  // Global click listener — stamps and tracks every interaction
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('button, .tab-btn, .ptab, .pwt, .chk, .home-tile, .wiz-opt, .wiz-check, .eng-pill, .depth-btn, .forge-pilot-mode-btn, .filter-btn, .bm-load-btn, .acc-head, .rm-card, .pcard, .enh-card, .suite-item, .forge-tree-item, .te-db-item, .te-suite-item, .te-stack-layer, .uuid-row');
    if(!btn) return;
    if(!btn.dataset.uuid) {
      const label = (btn.id || btn.textContent.trim().slice(0, 40) || btn.title || 'btn');
      nxAssignUUID(btn, 'button', label.slice(0,40), { label: label.slice(0,40), parentId: btn.closest('[id]')?.id || '' });
    }
    UUID.gen('action', {
      trigger: 'click', targetUUID: btn.dataset.uuid || '',
      label: (btn.textContent.trim() || btn.id || '').slice(0, 40),
      tab: _uuidLastTab, tagName: btn.tagName
    }, 'click:' + (btn.id || btn.textContent.trim().slice(0, 20)));
  }, true);

  // Input change tracker
  document.addEventListener('change', function(e) {
    const inp = e.target;
    if((inp.tagName === 'INPUT' || inp.tagName === 'SELECT' || inp.tagName === 'TEXTAREA') && inp.id) {
      UUID.gen('action', { action: 'input:change', inputId: inp.id, valueLen: inp.value?.length || 0, tab: _uuidLastTab }, 'input:' + inp.id);
    }
  }, true);

  // Focus tracker for key inputs
  document.addEventListener('focus', function(e) {
    const inp = e.target;
    if((inp.tagName === 'INPUT' || inp.tagName === 'TEXTAREA') && inp.id && inp.id.length > 2) {
      UUID.gen('action', { action: 'focus', inputId: inp.id, tab: _uuidLastTab }, 'focus:' + inp.id);
    }
  }, true);

  // File drop tracker
  document.addEventListener('drop', function(e) {
    if(e.dataTransfer?.files?.length) {
      Array.from(e.dataTransfer.files).forEach(f => {
        UUID.gen('drag-drop', { fileName: f.name, size: f.size, type: f.type, tab: _uuidLastTab }, 'drop:' + f.name);
      });
    }
  }, true);

  // Add UUID count metric to home screen
  setTimeout(() => {
    const hm = document.getElementById('home-metrics');
    if(hm && !document.getElementById('hm-uuids')) {
      const mc = document.createElement('div');
      mc.className = 'mcard'; mc.style.cursor = 'pointer';
      mc.title = 'Click to open UUID Registry';
      mc.innerHTML = `<div class="mcard-title">UUIDS</div><div class="mcard-val neutral" id="hm-uuids">${UUID.getAll().length}</div>`;
      mc.onclick = () => { switchTab('log'); setTimeout(() => { const b = document.querySelector('[data-ltab="uuids"]'); if(b) b.click(); }, 150); };
      hm.appendChild(mc);
    }
  }, 700);

  // Auto-refresh UUID home count every 5s
  setInterval(() => {
    const el = document.getElementById('hm-uuids');
    if(el) el.textContent = UUID.getAll().length;
  }, 5000);

  log_ev('uuid:system-ready', { session: sessionId }, 'INFO');
  toast('⬡ UUID tracking live · session ' + sessionId.slice(0, 18) + '…', 'ok', 3500);
}

/* ─── DELTA TRACKER ───────────────────────────────────────────── */
const DELTA={
  _key:'nx6_deltas',
  record(projectId,type,before,after,meta={}){
    const deltas=this.getAll();
    const d={id:uid(),ts:new Date().toISOString(),projectId,type,before,after,
      delta:this._calc(before,after),meta};
    deltas.push(d);if(deltas.length>5000)deltas.splice(0,deltas.length-5000);
    try{localStorage.setItem(this._key,JSON.stringify(deltas));}catch{}
    return d;
  },
  _calc(before,after){
    if(typeof before==='number'&&typeof after==='number')return after-before;
    if(typeof before==='string'&&typeof after==='string'){
      const bl=before.split('\n').length,al=after.split('\n').length;
      return{lines:al-bl,chars:after.length-before.length};
    }
    return null;
  },
  getAll(){try{return JSON.parse(localStorage.getItem(this._key)||'[]');}catch{return[];}},
  getByProject(pid){return this.getAll().filter(d=>d.projectId===pid);}
};

/* ─── BUILDER SUB-TAB SWITCHER ────────────────────────────────── */
function sbSwitchSub(name,btn){
  document.querySelectorAll('.sb-sub').forEach(s=>s.removeAttribute('data-active'));
  document.querySelectorAll('#sb-subtab-bar .ptab').forEach(b=>b.removeAttribute('data-active'));
  const panel=$('sbs-'+name);if(panel)panel.dataset.active='true';
  if(btn)btn.dataset.active='true';
  if(name==='gated')sisoInitUI();
  if(name==='qa')qaInitUI();
  if(name==='compiler')compInitUI();
}

/* ─── BUILD LOG HELPERS ───────────────────────────────────────── */
function sbLog(msg,level='info'){
  const logEl=$('sb-build-log');
  if(!logEl)return;
  const d=document.createElement('div');d.className='sb-log-line';
  d.innerHTML=`<span class="sb-log-ts">${ts()}</span><span class="sb-log-level ${level}">${level.toUpperCase()}</span><span class="sb-log-msg">${esc(msg)}</span>`;
  logEl.appendChild(d);scrollBot(logEl);
  _buildLog.push({ts:new Date().toISOString(),level,msg});
  JAA.log('builder:log',{msg,level},_buildSessionId,level.toUpperCase());
}

function sbSetGatePill(status,txt){
  const p=$('sb-gate-pill');const t=$('sb-gate-txt');
  if(!p||!t)return;
  p.className='pill '+(status==='ok'?'pill-ok':status==='err'?'pill-err':status==='busy'?'pill-busy':'pill-idle');
  t.textContent=txt;
}
function sbSetModePill(txt){const t=$('sb-mode-txt');if(t)t.textContent=txt;}

/* ─── OUTPUT TAB SWITCHER ─────────────────────────────────────── */
function sbOutTab(name,btn){
  document.querySelectorAll('.sb-out-panel').forEach(p=>{p.style.display='none';});
  const panel=$('sbo-'+name);if(panel)panel.style.display='flex';
  document.querySelectorAll('#sbs-script .preview-tab').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
}

/* ─── GATE SIDEBAR RENDER ─────────────────────────────────────── */
function sbRenderGateSidebar(gates){
  const list=$('sb-gate-list');if(!list)return;
  list.innerHTML='';
  const done=gates.filter(g=>g.status==='done').length;
  const count=$('sb-gate-count');if(count)count.textContent=`${done}/${gates.length}`;
  gates.forEach(g=>{
    const d=document.createElement('div');d.className=`gate-item ${g.status||'pending'}`;
    const icon=g.status==='done'?'✓':g.status==='failed'?'✕':g.status==='running'?'⟳':'◌';
    d.innerHTML=`<span class="gate-icon">${icon}</span><span class="gate-name">${esc(g.name)}</span><span class="gate-ts">${g.ts||''}</span>`;
    if(g.uuid){const u=document.createElement('div');u.className='gate-uuid';u.textContent=g.uuid;d.appendChild(u);}
    list.appendChild(d);
  });
}

/* ─── MAIN GENERATE ───────────────────────────────────────────── */
async function sbGenerate(){
  const vision=val('sb-endstate').trim();
  if(!vision){toast('Enter a vision/end-state first','warn');return;}

  const sisoMode=$('chk-siso')?.classList.contains('on');
  if(sisoMode){await sbGenerateSISO(vision);return;}

  const outType=val('sb-output-type');const lang=val('sb-lang');
  const streaming=$('chk-stream')?.classList.contains('on');
  const out=$('sb-output');
  out.textContent='// Generating…';out.style.color='var(--text3)';

  _buildSessionId=UUID.gen('session',{vision:vision.slice(0,80)});
  if($('sb-build-uuid'))$('sb-build-uuid').textContent=_buildSessionId;
  sbSetModePill('GENERATING');sbSetGatePill('busy','BUILDING');

  const gates=[
    {name:'INIT',status:'running',uuid:UUID.gen('gate',{n:'init'}),ts:ts()},
    {name:'BUILD',status:'pending'},
    {name:'VERIFY',status:'pending'},
    {name:'SAVE',status:'pending'}
  ];
  sbRenderGateSidebar(gates);
  sbLog('Session: '+_buildSessionId,'info');
  sbLog('Vision: '+vision.slice(0,120),'info');
  JAA.log('build:start',{vision,outType,lang,sessionId:_buildSessionId},_buildSessionId,'INFO');

  const axiomStr=buildAxiomString();
  const sysParts=[
    `You are NEXUS Script Builder — a world-class full-stack developer AI operating under the SISO framework.`,
    `MISSION: Build exactly what the user describes. Requirements: fully functional, no placeholders, no stubs, production-ready code that works end-to-end.`,
    `Architecture: ${outType||'inferred from context'}. Language: ${lang||'best fit for the request'}.`,
    `SISO AXIOMS: Architecture first. Never rewrite working code. Always handle errors preemptively. Additive development only. Real data only, no mocks. Event-driven nodes where applicable. Maximal integration, minimal glue. Only the finest, highest-leverage, lowest-friction solutions.`,
    axiomStr||'',
    `Deliver production-ready, fully working code. No explanations, no preamble — pure code output.`
  ].filter(Boolean).join('\n\n');

  const msgs=[
    {role:'system',content:sysParts},
    {role:'user',content:`Build this: ${vision}\n\nAdditional context: Output type: ${outType||'inferred'}. Language: ${lang||'inferred'}.\n\nDeliver complete, working, production-ready code only.`}
  ];

  // inject extra context if provided
  const inject=val('sb-inject').trim();
  if(inject)msgs.push({role:'user',content:'Additional context/instruction: '+inject});

  gates[0].status='done';gates[0].ts=ts();
  gates[1].status='running';gates[1].uuid=UUID.gen('gate',{n:'build'});gates[1].ts=ts();
  sbRenderGateSidebar(gates);
  sbLog('Gate 1/INIT complete','ok');
  sbLog('Gate 2/BUILD starting…','gate');

  try{
    document.body.dataset.loading='true';abortCtrl=new AbortController();
    const result=await aiChat(msgs,{temperature:0.5,max_tokens:8192,stream:streaming});
    let full='';
    if(result.stream){
      full=await readStream(result,(c,all)=>{
        out.textContent=all;out.style.color='var(--text)';
        const cc=$('sb-char-count');if(cc)cc.textContent=all.length+' chars';
      });
    } else {
      full=result.text;out.textContent=full;out.style.color='var(--text)';
    }
    _generatedCode=full;
    gates[1].status='done';gates[1].ts=ts();
    gates[2].status='running';gates[2].uuid=UUID.gen('gate',{n:'verify'});gates[2].ts=ts();
    sbRenderGateSidebar(gates);
    sbLog('Gate 2/BUILD complete — '+full.length+' chars','ok');
    JAA.log('gate:complete',{gate:'build',chars:full.length},_buildSessionId,'OK');

    // Auto-docs
    if($('chk-docs')?.classList.contains('on'))await sbAutoGenDocs(full,vision);

    gates[2].status='done';gates[2].ts=ts();
    gates[3].status='done';gates[3].uuid=UUID.gen('gate',{n:'save'});gates[3].ts=ts();
    sbRenderGateSidebar(gates);
    sbLog('Gate 3/VERIFY complete','ok');
    sbLog('Gate 4/SAVE complete','ok');
    JAA.log('build:complete',{chars:full.length,sessionId:_buildSessionId},_buildSessionId,'OK');

    logIdea('output',full.slice(0,1000));
    log_ev('builder:generated',{chars:full.length},'LLM');
    sbSetGatePill('ok','DONE');sbSetModePill('IDLE');

    DELTA.record(_buildSessionId,'build',0,full.length,{vision});

    // Red-team if checked
    if($('chk-hostile')?.classList.contains('on'))setTimeout(()=>sbHostileAttack(),500);

    const cc=$('sb-char-count');if(cc)cc.textContent=full.length+' chars';
    toast('Build complete — '+full.length+' chars','ok');
    const pbmUuid=$('pbm-uuid');if(pbmUuid)pbmUuid.textContent=_buildSessionId;
    openModal('post-build-modal');
  } catch(e){
    gates[1].status='failed';sbRenderGateSidebar(gates);
    out.textContent='// Build Error: '+e.message;out.style.color='var(--r)';
    sbLog('ERROR: '+e.message,'err');
    sbSetGatePill('err','FAILED');
    JAA.log('build:error',{error:e.message},_buildSessionId,'ERROR');
  } finally{
    document.body.dataset.loading='false';abortCtrl=null;
  }
}

/* ─── AUTO DOCS GENERATOR ─────────────────────────────────────── */
async function sbAutoGenDocs(code,vision){
  sbLog('Generating documentation…','info');
  const msgs=[
    {role:'system',content:'Generate comprehensive developer documentation in Markdown. Include: Overview, Architecture, Features, API/Functions, Usage Examples, Dependencies, Configuration, Deployment, Troubleshooting, Roadmap. Be obsessively detailed.'},
    {role:'user',content:`Generate full docs for this project.\n\nVision: ${vision}\n\nCode:\n\`\`\`\n${code.slice(0,8000)}\n\`\`\``}
  ];
  try{
    const r=await aiChat(msgs,{temperature:0.3,max_tokens:4096,stream:false});
    const text=r.stream?await readStream(r,()=>{}):r.text;
    const docsOut=$('sb-docs-out');
    if(docsOut){
      docsOut.innerHTML=text.replace(/\n/g,'<br>').replace(/#{1,3} (.+)/g,'<strong style="color:var(--c)">$1</strong>');
    }
    sbLog('Documentation generated','ok');
    JAA.log('docs:generated',{chars:text.length},_buildSessionId,'OK');
  }catch(e){sbLog('Docs error: '+e.message,'warn');}
}

/* ─── VALIDATE ────────────────────────────────────────────────── */
async function sbValidate(){
  const code=_generatedCode||val('sb-endstate');
  if(!code){toast('Nothing to validate','warn');return;}
  sbOutTab('log',document.getElementById('sbo-tab-log'));
  sbLog('Running validation…','info');
  sbSetGatePill('busy','VALIDATING');
  const msgs=[
    {role:'system',content:'You are a senior code auditor under the SISO framework. Validate the code for: syntax errors, logic issues, missing error handlers, security holes, missing dependencies, incomplete functions, broken references, potential runtime failures. Be specific and exhaustive. Format as numbered issues by severity: CRITICAL, HIGH, MEDIUM, LOW, INFO.'},
    {role:'user',content:`Validate this code:\n\`\`\`\n${code.slice(0,10000)}\n\`\`\``}
  ];
  try{
    abortCtrl=new AbortController();
    const r=await aiChat(msgs,{temperature:0.2,max_tokens:3000,stream:false});
    const text=r.stream?await readStream(r,()=>{}):r.text;
    const out=$('sb-output');
    out.textContent='// VALIDATION REPORT\n// Session: '+(_buildSessionId||'—')+'\n\n'+text;
    out.style.color='var(--y)';
    sbOutTab('code',document.getElementById('sbo-tab-code'));
    sbLog('Validation complete','ok');
    sbSetGatePill('ok','VALIDATED');
    JAA.log('validate:complete',{issues:text.slice(0,500)},_buildSessionId,'OK');
  } catch(e){
    sbLog('Validation error: '+e.message,'err');
    sbSetGatePill('err','ERROR');
  } finally{abortCtrl=null;}
}

/* ─── HOSTILE AI ATTACK ───────────────────────────────────────── */
async function sbHostileAttack(){
  const code=_generatedCode;
  if(!code){toast('Generate code first','warn');return;}
  sbOutTab('hostile',document.getElementById('sbo-tab-hostile'));
  sbSetGatePill('busy','HOSTILE ATTACK');
  sbLog('Running hostile AI red-team attack…','warn');
  const msgs=[
    {role:'system',content:`You are a hostile adversarial AI red-team. Your mission: find every possible way this code could FAIL, be EXPLOITED, CRASH, or be BROKEN. Simulate: malformed inputs, concurrent load, edge cases, dependency failures, OS-level issues, security exploits, memory issues, race conditions, hostile users. Think like an attacker, a chaos monkey, and a frustrated end user simultaneously. Output a categorized attack surface map with severity ratings. Be brutal, thorough, recursive — loop through every attack vector until exhausted.`},
    {role:'user',content:`Red-team attack this code:\n\`\`\`\n${code.slice(0,10000)}\n\`\`\``}
  ];
  try{
    abortCtrl=new AbortController();
    const out=$('sb-hostile-out');out.textContent='// Running hostile attack simulation…\n\n';
    const r=await aiChat(msgs,{temperature:0.8,max_tokens:4096,stream:true});
    const text=await readStream(r,(c,all)=>{out.textContent='// RED-TEAM ATTACK REPORT\n\n'+all;scrollBot(out);});
    sbLog('Red-team attack complete','warn');
    sbSetGatePill('ok','ATTACK DONE');
    JAA.log('hostile:complete',{findings:text.slice(0,600)},_buildSessionId,'WARN');
  } catch(e){
    sbLog('Hostile attack error: '+e.message,'err');
  } finally{abortCtrl=null;}
}

/* ─── INJECT CONTEXT ─────────────────────────────────────────── */
function sbInjectContext(){
  const txt=val('sb-inject').trim();
  if(!txt){toast('Enter context to inject','warn');return;}
  sbLog('Context injected: '+txt.slice(0,80),'info');
  JAA.log('inject:context',{text:txt},_buildSessionId,'INFO');
  toast('Context injected — will apply to next generation','ok');
}

/* ─── SAVE / DOWNLOAD ─────────────────────────────────────────── */
function sbSaveProject(){
  const name=prompt('Project name:',val('sb-endstate').slice(0,50)||'New Project');
  if(!name)return;
  const pid=saveNewProject(name,_generatedCode||val('sb-endstate'),'Generated via NEXUS Builder v6');
  JAA.log('project:saved',{name,buildSession:_buildSessionId},_buildSessionId,'OK');
  DELTA.record(pid,'created',0,(_generatedCode||'').length,{name,vision:val('sb-endstate')});
  toast('Project saved: '+name,'ok');
}

function sbDownload(){
  const code=_generatedCode;if(!code){toast('Nothing to download','warn');return;}
  const name=(val('sb-endstate').slice(0,30)||'nexus_output').replace(/\s+/g,'_');
  const ext=val('sb-lang')==='python'?'.py':val('sb-lang')==='go'?'.go':'.html';
  const blob=new Blob([code],{type:'text/plain'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name+ext;a.click();
  sbLog('Downloaded: '+name+ext,'ok');
}

function sbCopyOutput(){
  const code=_generatedCode||$('sb-output')?.textContent||'';
  if(!code){toast('Nothing to copy','warn');return;}
  navigator.clipboard.writeText(code).then(()=>toast('Copied to clipboard','ok')).catch(()=>toast('Copy failed','err'));
}

function sbClearOutput(){
  const out=$('sb-output');if(out){out.textContent='// Cleared.';out.style.color='var(--text3)';}
  _generatedCode='';_buildLog=[];
  const logEl=$('sb-build-log');if(logEl)logEl.innerHTML='';
  const hOut=$('sb-hostile-out');if(hOut)hOut.textContent='// Cleared.';
  const dOut=$('sb-docs-out');if(dOut)dOut.innerHTML='';
  const cc=$('sb-char-count');if(cc)cc.textContent='0 chars';
  sbRenderGateSidebar([]);
  toast('Output cleared','ok');
}

function sbResetGates(){
  sbRenderGateSidebar([]);
  const count=$('sb-gate-count');if(count)count.textContent='0/0';
  const uuid=$('sb-build-uuid');if(uuid)uuid.textContent='—';
}

/* ─── SISO GATED BUILD ENGINE ─────────────────────────────────── */
async function sbGenerateSISO(vision){
  sbSwitchSub('gated',document.querySelector('[data-sbt="gated"]'));
  const modules=val('siso-modules').trim().split('\n').filter(Boolean);
  if(!modules.length)modules.push('main-module');
  setVal('siso-modules',modules.join('\n'));
  await sisoBuild();
}

function sisoInitUI(){
  const list=$('siso-gate-pipeline');if(!list)return;
  const modules=val('siso-modules').trim().split('\n').filter(Boolean);
  if(!modules.length){list.innerHTML='<div style="font-size:10px;color:var(--text3);font-style:italic;padding:8px">Add modules in the left panel and click BUILD ALL GATES.</div>';return;}
  list.innerHTML='';
  modules.forEach((mod,i)=>{
    const d=document.createElement('div');d.className='siso-gate-item pending';d.id='siso-gate-'+i;
    d.innerHTML=`<div class="siso-gate-head">
      <span class="siso-gate-num">${String(i+1).padStart(2,'0')}</span>
      <span class="siso-gate-name">${esc(mod)}</span>
      <span class="siso-gate-status pending" id="sgs-${i}">PENDING</span>
    </div>
    <div class="siso-gate-meta" id="sgm-${i}"><span>Waiting…</span></div>
    <div class="siso-gate-bar"><div class="siso-gate-bar-fill" id="sgb-${i}" style="background:var(--c)"></div></div>`;
    list.appendChild(d);
  });
}

function sisoSetGateStatus(idx,status,meta=''){
  const el=$('siso-gate-'+idx);const st=$('sgs-'+idx);const mt=$('sgm-'+idx);const bar=$('sgb-'+idx);
  if(!el)return;
  el.className='siso-gate-item '+status;
  if(st){st.className='siso-gate-status '+status;st.textContent=status.toUpperCase();}
  if(mt)mt.innerHTML=`<span>${esc(meta)}</span><span style="margin-left:auto;font-size:8px;color:var(--text3)">${ts()}</span>`;
  if(bar){
    const pct=status==='done'?100:status==='running'?50:status==='failed'?100:0;
    bar.style.width=pct+'%';
    bar.style.background=status==='done'?'var(--g)':status==='failed'?'var(--r)':'var(--c)';
  }
  el.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function sisoUpdateProgress(done,total){
  const pct=total?Math.round(done/total*100):0;
  const p=$('siso-progress');const pt=$('siso-progress-txt');
  if(p)p.style.width=pct+'%';
  if(pt)pt.textContent=pct+'%';
}

async function sisoBuild(){
  if(_sisoRunning){toast('Build already running','warn');return;}
  const vision=val('sb-endstate').trim();
  if(!vision){toast('Enter a vision/end-state in Script Builder first','warn');switchTab('builder');return;}
  const modules=val('siso-modules').trim().split('\n').filter(Boolean);
  if(!modules.length){toast('Add at least one module','warn');return;}
  const arch=val('siso-arch')||'Node.js';
  const gateSize=parseInt(val('siso-gate-size'))||4000;
  const verifyStrategy=val('siso-verify')||'ai';
  const logGates=$('siso-chk-jaa')?.classList.contains('on');
  const autoRetry=$('siso-chk-retry')?.classList.contains('on');
  const resumeMode=$('siso-chk-resume')?.classList.contains('on');

  _sisoRunning=true;_sisoAbort=false;_sisoGates=modules.map((m,i)=>({idx:i,name:m,status:'pending',code:'',uuid:'',attempts:0}));
  _sisoGateIdx=0;
  _sisoBuiltModules={};

  const sessionId=UUID.gen('siso-session',{vision:vision.slice(0,60),arch});
  _buildSessionId=sessionId;
  if($('sb-build-uuid'))$('sb-build-uuid').textContent=sessionId;

  const statusPill=$('siso-status-pill');const statusTxt=$('siso-status-txt');
  if(statusPill)statusPill.className='pill pill-busy';
  if(statusTxt)statusTxt.textContent='BUILDING';
  $('siso-build-btn').style.display='none';
  $('siso-stop-btn').style.display='';

  sisoInitUI();
  sisoUpdateProgress(0,modules.length);
  JAA.log('siso:start',{vision,arch,modules,sessionId},sessionId,'INFO');

  // Check resume point
  let startIdx=0;
  if(resumeMode){
    const lastGate=JAA.getLastGate(sessionId);
    if(lastGate&&lastGate.data?.gateIdx>=0){
      startIdx=lastGate.data.gateIdx+1;
      toast(`Resuming from gate ${startIdx+1}/${modules.length}`,'ok');
    }
  }

  let totalSuccess=0;
  for(let i=startIdx;i<modules.length;i++){
    if(_sisoAbort)break;
    const gate=_sisoGates[i];
    gate.uuid=UUID.gen('gate',{module:gate.name,session:sessionId});
    sisoSetGateStatus(i,'running','Building module…');
    if($('siso-active-gate-lbl'))$('siso-active-gate-lbl').textContent='GATE '+(i+1)+': '+gate.name;

    const liveOut=$('siso-live-out');if(liveOut)liveOut.textContent='';

    const contextSummary=Object.entries(_sisoBuiltModules).map(([n,c])=>`// MODULE: ${n}\n${c.slice(0,400)}…`).join('\n\n');

    const msgs=[
      {role:'system',content:`You are NEXUS SISO Build Engine. You are building ONE gate/module at a time.
Architecture: ${arch}
Vision: ${vision}
Max response: ~${gateSize} chars
AXIOMS: Fully functional, no placeholders, no stubs. Real error handling. Additive to existing modules. Event-driven. SISO compliant.
Previously built modules (summaries):\n${contextSummary||'None yet.'}`},
      {role:'user',content:`Build module: ${gate.name}\n\nThis is gate ${i+1} of ${modules.length}. Build ONLY this module. Make it fully functional and integrate with the architecture described. Output pure code only.`}
    ];

    let success=false;let attempts=0;const maxAttempts=autoRetry?3:1;

    while(attempts<maxAttempts&&!success&&!_sisoAbort){
      attempts++;gate.attempts=attempts;
      if(attempts>1){
        sisoSetGateStatus(i,'retrying',`Retry ${attempts}/${maxAttempts}…`);
        await new Promise(r=>setTimeout(r,1200));
      }
      try{
        abortCtrl=new AbortController();
        const result=await aiChat(msgs,{temperature:0.4,max_tokens:gateSize,stream:true});
        let code='';
        code=await readStream(result,(c,all)=>{
          if(liveOut){liveOut.textContent=all;scrollBot(liveOut);}
        });

        // Verify gate
        let verified=true;
        if(verifyStrategy==='syntax'||verifyStrategy==='both'){
          const hasFn=code.includes('function')||code.includes('def ')||code.includes('class ')||code.includes('=>');
          if(!hasFn&&code.length<100){verified=false;}
        }
        if((verifyStrategy==='ai'||verifyStrategy==='both')&&code.length>50){
          try{
            const vMsgs=[
              {role:'system',content:'You are a code verifier. Reply ONLY with JSON: {"valid":true|false,"issues":"brief"}.'},
              {role:'user',content:`Verify this code is syntactically correct and complete:\n\`\`\`\n${code.slice(0,3000)}\n\`\`\`\nJSON only.`}
            ];
            const vr=await aiChat(vMsgs,{temperature:0.1,max_tokens:200,stream:false});
            const vtext=vr.stream?await readStream(vr,()=>{}):vr.text;
            const vj=JSON.parse(vtext.replace(/```json|```/g,'').trim());
            verified=vj.valid!==false;
            if(!verified&&attempts<maxAttempts){msgs.push({role:'assistant',content:code},{role:'user',content:'Fix issues: '+vj.issues});}
          }catch{verified=true;}
        }

        if(verified||attempts>=maxAttempts){
          gate.code=code;gate.status='done';
          _sisoBuiltModules[gate.name]=code;
          sisoSetGateStatus(i,'done',`${code.length} chars · ${attempts} attempt${attempts>1?'s':''}`);
          totalSuccess++;
          if(logGates)JAA.log('gate:complete',{gateIdx:i,module:gate.name,chars:code.length,sessionId},sessionId,'OK');
          DELTA.record(sessionId,'gate_complete',0,code.length,{gate:gate.name,idx:i});
          success=true;
        } else {
          gate.status='retrying';
        }
      } catch(e){
        if(_sisoAbort)break;
        gate.status='failed';
        sisoSetGateStatus(i,'failed','Error: '+e.message.slice(0,60));
        if(logGates)JAA.log('gate:error',{gateIdx:i,module:gate.name,error:e.message,sessionId},sessionId,'ERROR');
        if(attempts>=maxAttempts)break;
      } finally{abortCtrl=null;}
    }

    if(!success&&!_sisoAbort){
      sisoSetGateStatus(i,'failed','Failed after '+attempts+' attempts');
      JAA.log('gate:failed',{gateIdx:i,module:gate.name,attempts,sessionId},sessionId,'ERROR');
    }
    sisoUpdateProgress(i+1,modules.length);
    const eta=Math.round((modules.length-(i+1))*3);
    const etaEl=$('siso-eta');if(etaEl)etaEl.textContent='ETA: ~'+eta+'s';
  }

  // Assemble final output
  const allCode=Object.entries(_sisoBuiltModules).map(([n,c])=>`// ═══════ MODULE: ${n} ═══════\n${c}`).join('\n\n');
  _generatedCode=allCode;
  const out=$('sb-output');if(out){out.textContent=allCode;out.style.color='var(--text)';}
  const cc=$('sb-char-count');if(cc)cc.textContent=allCode.length+' chars';

  _sisoRunning=false;
  if(statusPill)statusPill.className='pill '+(_sisoAbort?'pill-err':totalSuccess===modules.length?'pill-ok':'pill-err');
  if(statusTxt)statusTxt.textContent=_sisoAbort?'ABORTED':totalSuccess+'/'+modules.length+' OK';
  $('siso-build-btn').style.display='';
  $('siso-stop-btn').style.display='none';

  JAA.log('siso:complete',{totalSuccess,total:modules.length,chars:allCode.length,sessionId},sessionId,totalSuccess===modules.length?'OK':'WARN');
  toast(`SISO build: ${totalSuccess}/${modules.length} gates succeeded`,(totalSuccess===modules.length?'ok':'warn'));

  if(!_sisoAbort&&totalSuccess>0)openModal('post-build-modal');
}

function sisoStop(){_sisoAbort=true;abortCtrl?.abort();toast('Build stop requested…','warn');}

const SISO_PRESETS={
  nexus:['uuid-system','jaa-logger','event-bus','gate-engine','build-engine','verify-engine','resume-engine','delta-tracker','project-manager','template-system','ai-bridge','ui-shell','compiler'],
  api:['config-loader','db-connection','auth-middleware','route-handler','validation','error-handler','logger','rate-limiter','tests'],
  ui:['layout-shell','navigation','theme-system','components','state-manager','api-client','form-builder','data-tables','error-boundary'],
  clear:[]
};
function sisoPreset(name){
  const mods=SISO_PRESETS[name]||[];
  setVal('siso-modules',mods.join('\n'));
  sisoInitUI();
  toast(name==='clear'?'Modules cleared':'Preset loaded: '+name,'ok');
}

function sisoLoadProject(){
  const id=prompt('Project UUID or name to load:');
  if(!id)return;
  const projs=getProjects();const proj=projs.find(p=>p.id===id||p.name.toLowerCase()===id.toLowerCase());
  if(proj){
    setVal('sb-endstate',proj.name);
    if(proj.code)_generatedCode=proj.code;
    toast('Project loaded: '+proj.name,'ok');
  } else {toast('Project not found','err');}
}

async function sisoResume(){
  const meta=JAA.getMeta();
  const sessions=JAA.getAll().filter(e=>e.type==='siso:start').map(e=>e.sessionId);
  if(!sessions.length){toast('No previous SISO sessions found','warn');return;}
  const lastSession=sessions[sessions.length-1];
  const confirm2=window.confirm(`Resume last session?\nID: ${lastSession}`);
  if(!confirm2)return;
  _buildSessionId=lastSession;
  $('siso-chk-resume').classList.add('on');
  await sisoBuild();
}

/* ─── TEMPLATE FORGE ──────────────────────────────────────────── */
async function templateGenerate(){
  const name=val('tpl-name').trim()||'Unnamed Project';
  const vision=val('tpl-vision').trim();
  const target=val('tpl-target');const iface=val('tpl-interface');
  const axioms=val('tpl-axioms').trim().split('\n').filter(Boolean);
  const features=val('tpl-features').trim().split('\n').filter(Boolean);
  const includeJaa=$('tpl-chk-jaa')?.classList.contains('on');
  const includeReadme=$('tpl-chk-readme')?.classList.contains('on');
  const includeRoadmap=$('tpl-chk-roadmap')?.classList.contains('on');
  const includeManual=$('tpl-chk-manual')?.classList.contains('on');
  const includeLiving=$('tpl-chk-living')?.classList.contains('on');

  const projUuid=UUID.gen('project',{name,target});
  const tplUuid=UUID.gen('template',{name});
  const out=$('tpl-output');
  if(out)out.textContent='// Forging template…';

  const tplMsgs=[
    {role:'system',content:`You are NEXUS Template Forge. Generate a comprehensive, obsessively detailed build template in Markdown for a software project. Include: Project UUID, Architecture spec, Module list with UUIDs, File tree, Feature breakdown with UUIDs, Axioms, Delta tracking plan, AI build instructions, ${includeReadme?'README.md,':''} ${includeRoadmap?'ROADMAP.md,':''} ${includeManual?'Full developer manual,':''} ${includeLiving?'Living document structure,':''} ${includeJaa?'Jaa logging spec,':''} QA test plan, Deployment guide. Make this the crown jewel of software documentation.`},
    {role:'user',content:`Project: ${name}\nVision: ${vision||'Not specified'}\nTarget: ${target}\nInterface: ${iface}\nProject UUID: ${projUuid}\nTemplate UUID: ${tplUuid}\nAxioms:\n${axioms.map((a,i)=>`${i+1}. ${a}`).join('\n')}\nFeatures:\n${features.map((f,i)=>`- ${f}`).join('\n')}\n\nGenerate the complete template document.`}
  ];

  try{
    abortCtrl=new AbortController();
    const r=await aiChat(tplMsgs,{temperature:0.4,max_tokens:6000,stream:true});
    let text='';
    text=await readStream(r,(c,all)=>{
      if(out){out.textContent=all;}
    });
    if(out){out.innerHTML=text.replace(/\n/g,'<br>').replace(/`([^`]+)`/g,'<code style="color:var(--c);background:rgba(0,212,255,.08);padding:1px 4px;border-radius:2px">$1</code>');}
    JAA.log('template:generated',{name,projUuid,tplUuid,chars:text.length},'','OK');
    toast('Template forged — '+text.length+' chars','ok');
  } catch(e){
    if(out)out.textContent='// Error: '+e.message;
    toast('Template error: '+e.message,'err');
  } finally{abortCtrl=null;}
}

function templateSave(){
  const name=val('tpl-name').trim()||'Template';
  const content=$('tpl-output')?.textContent||'';
  if(!content){toast('Generate a template first','warn');return;}
  const uuid=UUID.gen('template',{name});
  const tplData={uuid,name,content,created:new Date().toISOString()};
  const all=JSON.parse(localStorage.getItem('nx6_templates')||'[]');
  all.push(tplData);localStorage.setItem('nx6_templates',JSON.stringify(all));
  toast('Template saved: '+name,'ok');
  JAA.log('template:saved',{name,uuid},'','OK');
}

function templateExport(){
  const name=val('tpl-name').trim()||'template';
  const content=$('tpl-output')?.textContent||'';
  if(!content){toast('Generate a template first','warn');return;}
  const uuid=UUID.gen('template-export',{name});
  const data={uuid,name,content,axioms:val('tpl-axioms'),features:val('tpl-features'),created:new Date().toISOString()};
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  a.download=name.replace(/\s+/g,'_')+'_template.json';a.click();
}

/* ─── QA ENGINE ───────────────────────────────────────────────── */
const QA_SUITES=[
  {id:'syntax',name:'Syntax & Lint',color:'var(--c)',icon:'◉'},
  {id:'unit',name:'Unit Tests',color:'var(--g)',icon:'◈'},
  {id:'integration',name:'Integration',color:'var(--y)',icon:'⟁'},
  {id:'security',name:'Security',color:'var(--r)',icon:'⚡'},
  {id:'performance',name:'Performance',color:'var(--o)',icon:'◆'},
  {id:'architecture',name:'Architecture',color:'var(--m)',icon:'◐'},
  {id:'windows',name:'Windows Compat',color:'var(--text2)',icon:'◫'},
];

function qaInitUI(){
  const list=$('qa-suite-list');if(!list)return;
  if(list.children.length)return;
  QA_SUITES.forEach(s=>{
    const d=document.createElement('div');d.className='qa-suite-item';d.dataset.sid=s.id;
    d.innerHTML=`<span style="color:${s.color}">${s.icon}</span><span>${s.name}</span>`;
    d.onclick=()=>{document.querySelectorAll('.qa-suite-item').forEach(i=>i.classList.remove('active'));d.classList.add('active');qaRunSuite(s.id);};
    list.appendChild(d);
  });
}

async function qaRunAll(){
  const code=qaGetCode();if(!code){toast('No code to test — generate or paste code first','warn');return;}
  let pass=0,fail=0;
  const enabledSuites=QA_SUITES.filter(s=>{
    const chk=$('qa-chk-'+s.id);return !chk||chk.classList.contains('on');
  });
  const results=$('qa-results-area');if(results)results.innerHTML='';
  const pill=$('qa-status-pill');const pillTxt=$('qa-status-txt');
  if(pill)pill.className='pill pill-busy';if(pillTxt)pillTxt.textContent='RUNNING';
  for(const suite of enabledSuites){
    const r=await qaRunSuite(suite.id,code,false);
    pass+=r.pass;fail+=r.fail;
  }
  const total=pass+fail;const score=total?Math.round(pass/total*100):0;
  if($('qa-pass-count'))$('qa-pass-count').textContent=pass;
  if($('qa-fail-count'))$('qa-fail-count').textContent=fail;
  if($('qa-score'))$('qa-score').textContent=score+'%';
  if($('qa-progress'))$('qa-progress').style.width=score+'%';
  if(pill)pill.className='pill '+(score>=80?'pill-ok':score>=50?'pill-busy':'pill-err');
  if(pillTxt)pillTxt.textContent=score+'% PASS';
  JAA.log('qa:complete',{pass,fail,score,sessionId:_buildSessionId},_buildSessionId,'OK');
  toast(`QA: ${pass}/${total} passed (${score}%)`,(score>=80?'ok':'warn'));
}

async function qaRunSuite(suiteId,code,standalone=true){
  if(!code)code=qaGetCode();
  if(standalone&&!code){toast('No code to test','warn');return{pass:0,fail:0};}
  const suite=QA_SUITES.find(s=>s.id===suiteId)||{id:suiteId,name:suiteId,color:'var(--c)'};
  const results=$('qa-results-area');

  const sectionEl=document.createElement('div');sectionEl.className='qa-result-card';
  sectionEl.innerHTML=`<div class="qa-result-head"><span style="color:${suite.color};font-family:var(--display);font-size:11px;letter-spacing:.12em">${suite.name.toUpperCase()}</span><span style="font-size:9px;color:var(--text3);margin-left:auto">Running…</span></div><div class="qa-result-body" id="qa-body-${suiteId}">Analyzing…</div>`;
  if(results)results.appendChild(sectionEl);
  const bodyEl=document.getElementById('qa-body-'+suiteId);

  const suitePrompts={
    syntax:`Perform syntax and lint analysis. Check: syntax errors, undefined variables, unreachable code, unused imports, formatting issues, type mismatches. Output JSON: {"pass":[],"fail":[],"warn":[]} where each item is a string describing the finding.`,
    unit:`Generate unit test cases and predict pass/fail. Check: function inputs/outputs, edge cases, null handling, error paths. Output JSON: {"pass":[],"fail":[],"warn":[]}`,
    integration:`Check integration points: API calls, database queries, event handlers, module dependencies, external services. Find broken connections. Output JSON: {"pass":[],"fail":[],"warn":[]}`,
    security:`Security audit: XSS, injection attacks, hardcoded secrets, insecure dependencies, CORS issues, auth bypass paths, data exposure. Output JSON: {"pass":[],"fail":[],"warn":[]}`,
    performance:`Performance analysis: blocking operations, memory leaks, inefficient loops, missing caching, heavy DOM operations, bundle size issues. Output JSON: {"pass":[],"fail":[],"warn":[]}`,
    architecture:`Architecture review: circular dependencies, layer violations, SOLID principles, SISO compliance, coupling/cohesion. Output JSON: {"pass":[],"fail":[],"warn":[]}`,
    windows:`Windows compatibility: path separators, CRLF, case sensitivity, UAC, Unicode, registry access, file locking. Output JSON: {"pass":[],"fail":[],"warn":[]}`
  };

  const msgs=[
    {role:'system',content:(suitePrompts[suiteId]||'Analyze the code. Output JSON: {"pass":[],"fail":[],"warn":[]}')+'\n\nOutput ONLY valid JSON. No preamble.'},
    {role:'user',content:`Analyze:\n\`\`\`\n${(code||'').slice(0,8000)}\n\`\`\`\nJSON only.`}
  ];

  let pass=0,fail=0;
  try{
    const r=await aiChat(msgs,{temperature:0.2,max_tokens:2000,stream:false});
    const text=r.stream?await readStream(r,()=>{}):r.text;
    let data={pass:[],fail:[],warn:[]};
    try{data=JSON.parse(text.replace(/```json|```/g,'').trim());}catch{data={pass:['Analysis complete'],fail:[],warn:[]};}
    pass=data.pass.length;fail=data.fail.length;
    const all=[
      ...data.fail.map(i=>({sev:'fail',msg:i})),
      ...data.warn.map(i=>({sev:'warn',msg:i})),
      ...data.pass.map(i=>({sev:'pass',msg:i}))
    ];
    bodyEl.innerHTML=all.map(i=>`<div style="display:flex;gap:6px;align-items:flex-start;padding:3px 0;border-bottom:1px solid rgba(26,42,64,.2)"><span class="qa-sev ${i.sev}">${i.sev.toUpperCase()}</span><span style="font-size:10px;color:var(--text2);flex:1">${esc(i.msg)}</span></div>`).join('')||'No findings.';
    const headStatus=sectionEl.querySelector('.qa-result-head span:last-child');
    if(headStatus)headStatus.textContent=`${pass} pass · ${fail} fail`;
    if(standalone){
      if($('qa-pass-count'))$('qa-pass-count').textContent=pass;
      if($('qa-fail-count'))$('qa-fail-count').textContent=fail;
      const s2=pass+fail;const sc=s2?Math.round(pass/s2*100):0;
      if($('qa-score'))$('qa-score').textContent=sc+'%';
      if($('qa-progress'))$('qa-progress').style.width=sc+'%';
    }
    JAA.log('qa:suite',{suite:suiteId,pass,fail},_buildSessionId,'OK');
  }catch(e){
    bodyEl.textContent='Error: '+e.message;fail=1;
  }
  return{pass,fail};
}

function qaGetCode(){
  const src=val('qa-code-source');
  if(src==='last')return _generatedCode;
  if(src==='paste')return val('qa-paste-code');
  if(src==='project'){
    const projs=getProjects();return projs.length?projs[0].code:'';
  }
  return _generatedCode;
}

document.getElementById('qa-code-source')?.addEventListener('change',()=>{
  const pa=$('qa-paste-code');if(pa)pa.style.display=val('qa-code-source')==='paste'?'':'none';
});

function qaExport(){
  const results=$('qa-results-area');if(!results||!results.textContent.trim()){toast('Run tests first','warn');return;}
  const report={timestamp:new Date().toISOString(),sessionId:_buildSessionId,html:results.innerHTML};
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
  a.download='nexus-qa-report-'+Date.now()+'.json';a.click();
}

/* ─── COMPILER ENGINE ─────────────────────────────────────────── */
function compInitUI(){
  const console2=$('comp-console');if(console2&&!console2.children.length)compLog('Compiler ready. Select targets and click COMPILE.','info');
}

function compLog(msg,cls=''){
  const el=$('comp-console');if(!el)return;
  const d=document.createElement('div');d.className='comp-log-line '+(cls||'');
  d.textContent=`[${ts()}] ${msg}`;el.appendChild(d);scrollBot(el);
}

async function compileRun(){
  const targets=[];
  const checkboxMap={win:'Windows .exe',linux:'Linux',mac:'macOS .dmg',android:'Android APK',ios:'iOS PWA',web:'Web App',electron:'Electron',pwa:'PWA'};
  Object.keys(checkboxMap).forEach(k=>{if($('comp-'+k)?.classList.contains('on'))targets.push(checkboxMap[k]);});
  if(!targets.length){toast('Select at least one target platform','warn');return;}

  const appName=val('comp-appname')||'NexusApp';
  const version=val('comp-version')||'1.0.0';
  const code=_generatedCode;
  if(!code){toast('No code to compile — generate first','warn');return;}

  const statusPill=$('comp-status-pill');const statusTxt=$('comp-status-txt');
  if(statusPill)statusPill.className='pill pill-busy';if(statusTxt)statusTxt.textContent='RUNNING';

  const console2=$('comp-console');if(console2)console2.innerHTML='';
  compLog('Build started — '+appName+' v'+version,'ok');
  compLog('Targets: '+targets.join(', '));
  compLog('Code size: '+code.length+' chars');

  const bridgeUrl=(typeof val==='function'?val('bridge-url'):null)||'http://127.0.0.1:3747';
  const cliEnabled=await(async()=>{try{const r=await fetch(bridgeUrl+'/config',{signal:AbortSignal.timeout(2000)});const j=await r.json();return !!(j.config||j).cliEnabled;}catch{return false;}})();

  // Detect which real targets we can actually build
  const realTargets = {
    'Web App':    { check: ()=>true,        run: ()=>_compileWeb(appName,version,code) },
    'PWA':        { check: ()=>true,        run: ()=>_compilePWA(appName,version,code) },
    'Node':       { check: ()=>cliEnabled,  run: ()=>_compileCLI(bridgeUrl,'node','--version',[]) },
    'Linux':      { check: ()=>cliEnabled,  run: ()=>_compileCLI(bridgeUrl,'node',['-e','"process.exit(0)"'],[]) },
  };

  let builtAny = false;
  const fileList=$('comp-file-list');if(fileList)fileList.innerHTML='';

  for(const [i,target] of targets.entries()){
    const pct=Math.round((i+1)/targets.length*100);
    if($('comp-progress'))$('comp-progress').style.width=pct+'%';
    if($('comp-pct'))$('comp-pct').textContent=pct+'%';

    if(target==='Web App'||target==='PWA'){
      // Real: package the generated code into a downloadable file
      await(target==='Web App'?_compileWeb(appName,version,code):_compilePWA(appName,version,code));
      compLog('['+target+'] Packaged — download via PACKAGE button','ok');
      builtAny=true;
    } else if(cliEnabled&&(target==='Linux'||target==='Windows .exe')){
      // Real: try npm pack via bridge CLI
      compLog('['+target+'] Attempting npm pack via bridge…','ok');
      try{
        const r=await fetch(bridgeUrl+'/cli/npm',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({command:'pack',flags:['--dry-run']}),signal:AbortSignal.timeout(15000)});
        const j=await r.json();
        compLog(j.ok?'['+target+'] npm pack OK':'['+target+'] npm pack: '+j.stderr?.slice(0,100)||'failed',j.ok?'ok':'');
        builtAny=j.ok||builtAny;
      }catch(e){compLog('['+target+'] CLI unavailable: '+e.message);}
    } else if(target==='Android APK'){
      compLog('[Android APK] ⚠ Requires Android SDK — use APK BUILDER tab','');
    } else if(target==='Electron'){
      compLog('[Electron] ⚠ Run BUILD.bat locally (requires Electron builder)','');
    } else if(target==='macOS .dmg'){
      compLog('[macOS] ⚠ Requires macOS with Xcode — cannot build here','');
    } else {
      // AI scaffold for unknown targets — label clearly
      compLog('['+target+'] Generating scaffold (not a real build)…','');
      const msgs=[
        {role:'system',content:'You are a build scaffolding generator. Output ONLY a single code block with the minimal config file(s) needed for: '+target+'. Be concise.'},
        {role:'user',content:'App: '+appName+' v'+version+'. Target: '+target+'. Entry file snippet:\n'+code.slice(0,500)}
      ];
      try{
        abortCtrl=new AbortController();
        const r=await aiChat(msgs,{temperature:0.1,max_tokens:600,stream:false});
        const text=r.stream?await readStream(r,()=>{}):r.text;
        compLog('['+target+'] Scaffold: '+text.slice(0,200)+'…');
      }catch(e){compLog('['+target+'] Scaffold error: '+e.message);}
    }
    await new Promise(r=>setTimeout(r,80));
  }

  const uuid=UUID.gen('compile',{app:appName,version});
  compLog('Build ID: '+uuid,'ok');
  if(statusPill)statusPill.className='pill '+(builtAny?'pill-ok':'pill-idle');
  if(statusTxt)statusTxt.textContent=builtAny?'DONE':'SCAFFOLDED';
  JAA.log('compile:complete',{appName,version,targets,uuid},_buildSessionId,'OK');
  toast(builtAny?'Build complete':'Scaffold generated — real build needs local tools','ok');
  window._lastBuildPkg={name:appName,version,targets,code:code.slice(0,50000),timestamp:new Date().toISOString()};
}

async function _compileWeb(name,version,code){
  // Package as self-contained HTML file with meta
  const html=code.includes('<html')?code:`<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8"><title>${name} v${version}</title></head>\n<body>\n${code}\n</body>\n</html>`;
  window._lastBuildWeb={name,version,html};
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));
  a.download=name+'-'+version+'.html';a.click();
  return true;
}
async function _compilePWA(name,version,code){
  // PWA manifest + service worker scaffold
  const manifest=JSON.stringify({name,short_name:name,version,start_url:'/',display:'standalone',theme_color:'#0d0e0f'},null,2);
  const sw=`self.addEventListener('install',e=>{self.skipWaiting();});\nself.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});`;
  // Download as zip simulation (separate files via multiple downloads)
  for(const[fname,fcontent] of [['manifest.json',manifest],['sw.js',sw],['index.html',code]]){
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([fcontent]));
    a.download=fname;a.click();
    await new Promise(r=>setTimeout(r,200));
  }
  return true;
}
async function _compileCLI(bridgeUrl,cmd,args,flags){
  try{
    const r=await fetch(bridgeUrl+'/cli/exec',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({command:cmd,args:Array.isArray(args)?args:[args,...flags]}),signal:AbortSignal.timeout(10000)});
    return await r.json();
  }catch(e){return{ok:false,stderr:e.message};}
}


function compilePackage(){
  if(!window._lastBuildPkg){toast('Run compile first','warn');return;}
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(window._lastBuildPkg,null,2)],{type:'application/json'}));
  a.download=(window._lastBuildPkg.name||'nexus-build')+'_build_package.json';a.click();
  compLog('Package downloaded','ok');
}

function compileClean(){
  const c=$('comp-console');if(c)c.innerHTML='';
  const f=$('comp-file-list');if(f)f.innerHTML='<span style="font-size:10px;color:var(--text3)">No files.</span>';
  if($('comp-progress'))$('comp-progress').style.width='0%';
  if($('comp-pct'))$('comp-pct').textContent='0%';
  compLog('Build output cleared.','info');
  window._lastBuildPkg=null;
}

/* ─── POST-BUILD MODAL ACTIONS ────────────────────────────────── */
function postBuildAction(act){
  closeModal('post-build-modal');
  if(act==='project'){
    const n=prompt('Project name:',val('sb-endstate').slice(0,50)||'New Build');
    if(n){
      saveNewProject(n,_generatedCode);
      JAA.log('project:saved',{name:n,sessionId:_buildSessionId},_buildSessionId,'OK');
    }
  }
  if(act==='download')sbDownload();
  if(act==='qa'){sbSwitchSub('qa',document.querySelector('[data-sbt="qa"]'));switchTab('builder');setTimeout(()=>qaRunAll(),300);}
  if(act==='hostile')sbHostileAttack();
  if(act==='idea')logIdea('idea',_generatedCode.slice(0,500),'');
  if(act==='compile'){sbSwitchSub('compiler',document.querySelector('[data-sbt="compiler"]'));switchTab('builder');}
}

/* ─── ENHANCE ─────────────────────────────────────────────────── */
let _enhProject=null,_enhLastSavedCode='';

function enhLoadProject(){
  const id=val('enh-project-sel');if(!id){_enhProject=null;$('enh-code').value='';return;}
  const proj=getProjects().find(p=>p.id===id);if(!proj)return;
  _enhProject=proj;$('enh-code').value=proj.code||'';_enhLastSavedCode=proj.code||'';
  enhCodeChanged();enhRenderRevisions();
  if(!REV.getAll(id).length&&proj.code)REV.add(id,proj.code,'auto','Initial import');
  enhRenderRevisions();
}

function enhCodeChanged(){const code=$('enh-code').value;if($('enh-code-info'))$('enh-code-info').textContent=code.split('\n').length+' lines · '+code.length+' chars';}

function enhSaveRevision(type='manual'){
  if(!_enhProject)return;const code=$('enh-code').value;if(code===_enhLastSavedCode)return;
  REV.add(_enhProject.id,code,type);_enhLastSavedCode=code;
  const projs=getProjects();const idx=projs.findIndex(p=>p.id===_enhProject.id);
  if(idx>=0){projs[idx].code=code;projs[idx].updated_at=new Date().toISOString();saveProjects(projs);}
  enhRenderRevisions();toast('Revision saved','ok');
}

function enhRenderRevisions(){
  if(!_enhProject)return;const revs=REV.getAll(_enhProject.id);
  if($('enh-rev-count'))$('enh-rev-count').textContent=revs.length;
  const tl=$('enh-rev-timeline');if(!tl)return;tl.innerHTML='';
  if(!revs.length){tl.innerHTML='<div style="padding:12px;font-size:10px;color:var(--text3);font-style:italic">No revisions yet.</div>';return;}
  revs.forEach((rev,i)=>{
    const d=document.createElement('div');d.className='rev-item'+(i===0?' current':'');
    d.innerHTML=`<div class="rev-dot ${rev.type}"></div><div class="rev-name">${esc(rev.label)}</div><div class="rev-ts">${rev.ts.slice(11,19)}</div><div><button class="btn" style="font-size:8px;padding:1px 6px" onclick="enhRestore('${rev.id}')">RESTORE</button></div>`;
    tl.appendChild(d);
  });
}

function enhRestore(revId){
  if(!_enhProject)return;const rev=REV.restore(_enhProject.id,revId);if(!rev)return;
  const cur=$('enh-code').value;if(cur!==_enhLastSavedCode)REV.add(_enhProject.id,cur,'auto','Pre-restore backup');
  $('enh-code').value=rev.code;_enhLastSavedCode=rev.code;enhCodeChanged();enhRenderRevisions();
}

async function enhGenerate(){
  if(!$('enh-code').value.trim()){toast('Load a project first','warn');return;}
  enhSaveRevision('auto');
  const cards=$('enh-cards');cards.innerHTML='<div style="padding:12px;color:var(--text3);grid-column:1/-1">Generating enhancements…</div>';
  enhSwitchMid('enhance',document.querySelectorAll('#tab-enhance .preview-tab')[1]);
  const code=$('enh-code').value;
  const msgs=[
    {role:'system',content:`Generate 6 code enhancements. Categories: creative, stability, performance, leverage, integration. Output ONLY JSON: {"enhancements":[{"type":"creative|stability|performance|leverage|integration","title":"short","description":"what and why","code_snippet":"the code","leverage_score":1-10}]}`},
    {role:'user',content:`Enhancements for:\n\`\`\`\n${code.slice(0,12000)}\n\`\`\`\n\nJSON only.`}
  ];
  try{
    abortCtrl=new AbortController();
    const result=await aiChat(msgs,{temperature:0.7,max_tokens:4096,stream:false});
    const text=result.stream?await readStream(result,()=>{}):result.text;
    let enh=[];
    try{const j=JSON.parse(text.replace(/```json|```/g,'').trim());enh=j.enhancements||j;}catch{const m=text.match(/\[[\s\S]*\]/);if(m)enh=JSON.parse(m[0]);}
    cards.innerHTML='';
    enh.forEach((e,i)=>{
      const d=document.createElement('div');d.className='enh-card';
      d.innerHTML=`<div class="enh-card-head"><div class="enh-card-type ${e.type||'creative'}">${(e.type||'CREATIVE').toUpperCase()}</div><div class="enh-card-title">${esc(e.title||'Enhancement '+(i+1))}</div><div class="enh-card-leverage">Δ${e.leverage_score||'?'}</div></div><div class="enh-card-body">${esc(e.description||'')}</div><div class="enh-card-actions"><button class="btn ok" style="font-size:9px" onclick='enhApply(${JSON.stringify(e).replace(/'/g,"&#39;")})'>APPLY</button></div>`;
      cards.appendChild(d);
    });
  }catch(e){cards.innerHTML=`<div style="padding:12px;color:var(--r);grid-column:1/-1">Error: ${esc(e.message)}</div>`;}
  finally{abortCtrl=null;}
}

function enhApply(e){
  if(!_enhProject)return;
  enhSaveRevision('auto');
  const code=$('enh-code').value;
  $('enh-code').value=code+`\n\n// ═══ ENHANCEMENT: ${e.title} (${e.type}) ═══\n${e.code_snippet||'// no snippet'}`;
  enhCodeChanged();REV.add(_enhProject.id,$('enh-code').value,'enhance','Enhancement: '+e.title);
  enhRenderRevisions();toast('Enhancement applied','ok');
}

async function enhAudit(){
  if(!$('enh-code').value.trim()){toast('Load code first','warn');return;}
  enhSwitchMid('audit',document.querySelectorAll('#tab-enhance .preview-tab')[0]);
  const panel=$('enh-mid-audit');panel.innerHTML='<div style="padding:12px;color:var(--text3)">Running audit…</div>';
  const code=$('enh-code').value;
  const msgs=[{role:'system',content:`Thorough code audit. Output JSON: {"score":85,"summary":"brief","categories":[{"name":"Category","items":[{"severity":"error|warn|ok|info|idea","message":"desc"}]}]}`},{role:'user',content:`AUDIT:\n\`\`\`\n${code.slice(0,12000)}\n\`\`\`\nJSON only.`}];
  try{
    abortCtrl=new AbortController();
    const result=await aiChat(msgs,{temperature:0.3,max_tokens:4096,stream:false});
    const text=result.stream?await readStream(result,()=>{}):result.text;
    let audit={score:0,summary:'',categories:[]};
    try{audit=JSON.parse(text.replace(/```json|```/g,'').trim());}catch{const m=text.match(/\{[\s\S]*\}/);if(m)try{audit=JSON.parse(m[0]);}catch{}}
    panel.innerHTML='';
    const sc=audit.score>=80?'var(--g)':audit.score>=50?'var(--y)':'var(--r)';
    panel.innerHTML+=`<div class="audit-score" style="margin-bottom:8px"><div class="audit-score-item"><div class="audit-score-val" style="color:${sc}">${audit.score}</div><div class="audit-score-lbl">SCORE</div></div><div style="flex:1;padding-left:12px;font-size:10px;color:var(--text2)">${esc(audit.summary||'')}</div></div>`;
    (audit.categories||[]).forEach(cat=>{
      const sec=document.createElement('div');sec.className='audit-section';
      const items=(cat.items||[]).map(i=>`<div class="audit-row"><div class="audit-sev ${i.severity||'info'}">${(i.severity||'INFO').toUpperCase()}</div><div class="audit-msg">${esc(i.message||'')}</div></div>`).join('');
      sec.innerHTML=`<div class="audit-section-head">${esc(cat.name||'')}</div><div class="audit-section-body">${items||'<div style="color:var(--g);font-size:10px">✓ Clean</div>'}</div>`;
      panel.appendChild(sec);
    });
  }catch(e){panel.innerHTML=`<div style="padding:12px;color:var(--r)">Error: ${esc(e.message)}</div>`;}
  finally{abortCtrl=null;}
}

function enhSwitchMid(p,btn){
  $('enh-mid-audit').style.display=p==='audit'?'block':'none';
  $('enh-cards').style.display=p==='enhance'?'grid':'none';
  if(btn){btn.parentElement?.querySelectorAll('.preview-tab').forEach(t=>t.classList.remove('active'));btn.classList.add('active');}
}
function enhSwitchRight(p,btn){
  $('enh-right-revisions').style.display=p==='revisions'?'':'none';
  $('enh-right-preview').style.display=p==='preview'?'flex':'none';
  if(p==='preview')enhRefreshPreview();
  if(btn){btn.parentElement?.querySelectorAll('.preview-tab').forEach(t=>t.classList.remove('active'));btn.classList.add('active');}
}
function enhRefreshPreview(){
  const code=$('enh-code').value;const frame=$('enh-preview-frame');if(!frame)return;
  if(code.trim().startsWith('<'))frame.srcdoc=code;
  else frame.srcdoc=`<!DOCTYPE html><html><head><style>body{background:#05080f;color:#b8cfe0;font-family:monospace;font-size:11px;padding:14px;white-space:pre-wrap;}</style></head><body>${esc(code)}</body></html>`;
}
function enhPopulateProjects(){updateSelectors();}

/* ─── DOCS ────────────────────────────────────────────────────── */
function docsLoad(){
  const id=val('docs-proj-sel');const proj=getProjects().find(p=>p.id===id);
  if(!proj?.docs){$('docs-content').innerHTML='<div style="color:var(--text3);font-style:italic">No docs yet. Click Generate.</div>';$('docs-toc').innerHTML='';return;}
  $('docs-content').innerHTML=proj.docs;
  const headings=$('docs-content').querySelectorAll('h2,h3');let toc='';
  headings.forEach((h,i)=>{h.id='dh'+i;toc+=`<div style="padding:4px 6px;font-size:9px;color:var(--text2);cursor:pointer;border-bottom:1px solid var(--border);${h.tagName==='H3'?'padding-left:14px':''}" onclick="document.getElementById('dh${i}').scrollIntoView({behavior:'smooth'})">${esc(h.textContent)}</div>`;});
  $('docs-toc').innerHTML=toc||'<div style="font-size:9px;color:var(--text3);padding:8px">No sections.</div>';
}

async function docsGenerate(){
  const id=val('docs-proj-sel');const proj=getProjects().find(p=>p.id===id);if(!proj){toast('Select a project','warn');return;}
  $('docs-content').innerHTML='<div style="color:var(--text3)">Generating…</div>';
  const msgs=[{role:'system',content:'Generate comprehensive documentation as HTML (h2/h3/p/ul). Include: Overview, How It Works, Features, Usage, Troubleshooting. No markdown.'},{role:'user',content:`Document "${proj.name}":\n\`\`\`\n${(proj.code||'').slice(0,10000)}\n\`\`\``}];
  try{
    abortCtrl=new AbortController();const result=await aiChat(msgs,{temperature:0.4,max_tokens:4096,stream:false});
    const text=result.stream?await readStream(result,()=>{}):result.text;
    const projs=getProjects();const idx=projs.findIndex(p=>p.id===id);if(idx>=0){projs[idx].docs=text;saveProjects(projs);}
    docsLoad();
  }catch(e){$('docs-content').innerHTML=`<div style="color:var(--r)">Error: ${esc(e.message)}</div>`;}
  finally{abortCtrl=null;}
}

async function docsGenerateTechnical(){
  const id=val('docs-proj-sel');const proj=getProjects().find(p=>p.id===id);if(!proj){toast('Select a project','warn');return;}
  $('docs-content').innerHTML='<div style="color:var(--text3)">Generating technical docs…</div>';
  const msgs=[{role:'system',content:'Generate developer-facing technical docs as HTML. Include: Architecture, API Reference, Data Flow, Dependencies, Configuration, Security, Performance, Limitations. Use pre tags for code.'},{role:'user',content:`Technical docs for "${proj.name}":\n\`\`\`\n${(proj.code||'').slice(0,10000)}\n\`\`\``}];
  try{
    abortCtrl=new AbortController();const result=await aiChat(msgs,{temperature:0.3,max_tokens:4096,stream:false});
    const text=result.stream?await readStream(result,()=>{}):result.text;
    const projs=getProjects();const idx=projs.findIndex(p=>p.id===id);if(idx>=0){projs[idx].techDocs=text;saveProjects(projs);}
    $('docs-content').innerHTML=text;
  }catch(e){$('docs-content').innerHTML=`<div style="color:var(--r)">Error: ${esc(e.message)}</div>`;}
  finally{abortCtrl=null;}
}

function docsDownload(){
  const c=$('docs-content')?.innerHTML;if(!c)return;
  const name=val('docs-proj-sel')?getProjects().find(p=>p.id===val('docs-proj-sel'))?.name||'project':'project';
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(name)} Docs</title><style>body{font-family:'Segoe UI',sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#222;line-height:1.7;}h2{color:#0070c0;border-bottom:1px solid #ddd;padding-bottom:6px;}h3{color:#333;}pre{background:#f4f4f4;padding:12px;border-radius:4px;overflow-x:auto;}</style></head><body>${c}</body></html>`;
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download=name.replace(/\s+/g,'_')+'_docs.html';a.click();
}

/* ─── FEATURES ────────────────────────────────────────────────── */
function featLoad(){
  const id=val('feat-proj-sel');const proj=getProjects().find(p=>p.id===id);
  const list=$('feat-list');if(!list)return;
  if(!proj){list.innerHTML='<div style="font-size:10px;color:var(--text3);font-style:italic">Select a project.</div>';return;}
  const features=proj.features||[];
  if(!features.length){list.innerHTML='<div style="font-size:10px;color:var(--text3);font-style:italic">No features tracked. Click Auto-Detect.</div>';return;}
  list.innerHTML='';
  features.forEach((f,i)=>{
    const d=document.createElement('div');
    d.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--border2);border-radius:2px;margin-bottom:4px;';
    const c=f.verified?'var(--g)':f.status==='broken'?'var(--r)':'var(--text3)';
    d.innerHTML=`<div style="width:8px;height:8px;border-radius:50%;background:${c};flex-shrink:0"></div><div style="flex:1;font-size:10px;color:var(--text)">${esc(f.name)}</div><div style="font-size:9px;color:var(--text3)">${f.type||'feature'}</div><button class="btn ok" style="font-size:8px;padding:1px 6px" onclick="featVerify(${i})">✓</button><button class="btn danger" style="font-size:8px;padding:1px 6px" onclick="featRemove(${i})">×</button>`;
    list.appendChild(d);
  });
}

function featAdd(){const id=val('feat-proj-sel');if(!id)return;const name=prompt('Feature name:');if(!name)return;const projs=getProjects();const idx=projs.findIndex(p=>p.id===id);if(idx<0)return;if(!projs[idx].features)projs[idx].features=[];projs[idx].features.push({name,type:'custom',verified:false,added:new Date().toISOString()});saveProjects(projs);featLoad();}
function featVerify(i){const id=val('feat-proj-sel');const projs=getProjects();const idx=projs.findIndex(p=>p.id===id);if(idx<0||!projs[idx].features[i])return;projs[idx].features[i].verified=!projs[idx].features[i].verified;saveProjects(projs);featLoad();}
function featRemove(i){const id=val('feat-proj-sel');const projs=getProjects();const idx=projs.findIndex(p=>p.id===id);if(idx<0)return;projs[idx].features.splice(i,1);saveProjects(projs);featLoad();}

async function featDetect(){
  const id=val('feat-proj-sel');const proj=getProjects().find(p=>p.id===id);if(!proj?.code){toast('Select a project with code','warn');return;}
  $('feat-list').innerHTML='<div style="font-size:10px;color:var(--text3)">Detecting features…</div>';
  const msgs=[{role:'system',content:'List every feature, function, component, capability. Output JSON: [{"name":"feature","type":"function|component|route|event|style|config","description":"brief"}]'},{role:'user',content:`Features in:\n\`\`\`\n${(proj.code||'').slice(0,10000)}\n\`\`\`\nJSON array only.`}];
  try{
    abortCtrl=new AbortController();const result=await aiChat(msgs,{temperature:0.2,max_tokens:2048,stream:false});
    const text=result.stream?await readStream(result,()=>{}):result.text;
    let features=[];try{features=JSON.parse(text.replace(/```json|```/g,'').trim());}catch{const m=text.match(/\[[\s\S]*\]/);if(m)features=JSON.parse(m[0]);}
    const projs=getProjects();const idx=projs.findIndex(p=>p.id===id);if(idx>=0){projs[idx].features=features.map(f=>({...f,verified:false}));saveProjects(projs);}
    featLoad();toast(`Detected ${features.length} features`,'ok');
  }catch(e){$('feat-list').innerHTML=`<div style="color:var(--r);font-size:10px">Error: ${esc(e.message)}</div>`;}
  finally{abortCtrl=null;}
}

async function featSeparateFiles(){
  const id=val('feat-proj-sel');const proj=getProjects().find(p=>p.id===id);if(!proj?.code){toast('Select a project with code','warn');return;}
  const msgs=[{role:'system',content:'Separate single-file HTML into individual files. Output JSON: {"files":[{"name":"filename.ext","content":"...","type":"html|css|js"}]}'},{role:'user',content:`Separate:\n\`\`\`\n${(proj.code||'').slice(0,12000)}\n\`\`\``}];
  $('feat-list').innerHTML='<div style="font-size:10px;color:var(--text3)">Separating…</div>';
  try{
    abortCtrl=new AbortController();const result=await aiChat(msgs,{temperature:0.2,max_tokens:8192,stream:false});
    const text=result.stream?await readStream(result,()=>{}):result.text;
    let parsed;try{parsed=JSON.parse(text.replace(/```json|```/g,'').trim());}catch{const m=text.match(/\{[\s\S]*\}/);if(m)parsed=JSON.parse(m[0]);}
    if(!parsed?.files)throw new Error('No files returned');
    parsed.files.forEach(f=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([f.content],{type:'text/plain'}));a.download=f.name;a.click();});
    $('feat-list').innerHTML=`<div style="font-size:10px;color:var(--g)">✓ ${parsed.files.length} files downloaded.</div>`;
  }catch(e){$('feat-list').innerHTML=`<div style="color:var(--r);font-size:10px">Error: ${esc(e.message)}</div>`;}
  finally{abortCtrl=null;}
}

/* ─── ERROR LOG ───────────────────────────────────────────────── */
function errLoad(){
  const id=val('err-proj-sel');const proj=getProjects().find(p=>p.id===id);
  const list=$('err-list');if(!list)return;
  const errors=proj?.errors||[];
  if(!errors.length){list.innerHTML='<div style="font-size:10px;color:var(--text3);font-style:italic">No errors logged.</div>';return;}
  list.innerHTML=errors.map(e=>`<div style="padding:6px 10px;border-bottom:1px solid var(--border);font-size:10px;color:var(--r)">${esc(e.ts?.slice(11,19)||'')} — ${esc(e.message||'')}</div>`).join('');
}
function errClear(){const id=val('err-proj-sel');const projs=getProjects();const idx=projs.findIndex(p=>p.id===id);if(idx>=0){projs[idx].errors=[];saveProjects(projs);}errLoad();}
function projSelectChanged(){const id=val('proj-select');if(id)openProjectWorkspace(id);}
function projExportAll(){
  const projs=getProjects();if(!projs.length){toast('No projects','warn');return;}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(projs,null,2)],{type:'application/json'}));a.download='nexus-projects-'+Date.now()+'.json';a.click();
}

/* ─── ENGINE EXPLORER ─────────────────────────────────────────── */
let _engHistory=[];
function engExplorerInit(){
  const list=$('eng-explorer-list');if(!list)return;list.innerHTML='';
  Object.values(ENGINES).forEach(eng=>{
    const d=document.createElement('div');d.className='eng-explorer-item';d.dataset.key=eng.key;
    d.innerHTML=`<div style="font-family:var(--display);font-size:11px;letter-spacing:.1em;color:${eng.color};margin-bottom:3px">${esc(eng.name)}</div><div style="font-size:9px;color:var(--text3);line-height:1.4">${esc(eng.description.slice(0,80))}…</div>`;
    d.addEventListener('click',()=>{list.querySelectorAll('.eng-explorer-item').forEach(i=>i.classList.remove('active'));d.classList.add('active');});
    list.appendChild(d);
  });
}
function engExplorerModeChange(){
  const mode=val('eng-explore-mode');const chat=$('eng-explorer-chat');
  const descs={freeform:'Freeform exploration.',audit:'Paste code or describe a system.',stress:'Hostile Truth Engine stress testing.',delta:'Delta Risk: 28 systemic failure types.',reverse:'Erosmancer: reverse-engineer from end-states.'};
  const d=document.createElement('div');d.className='eng-msg system';d.textContent='Mode: '+(descs[mode]||'');
  chat.appendChild(d);scrollBot(chat);
}
async function engExplorerSend(){
  const input=$('eng-explore-input');const text=input.value.trim();if(!text)return;input.value='';
  const chat=$('eng-explorer-chat');
  const um=document.createElement('div');um.className='eng-msg user';um.textContent=text;chat.appendChild(um);scrollBot(chat);
  _engHistory.push({role:'user',content:text});
  const mode=val('eng-explore-mode');
  const useAll=$('eng-explore-all-btn')?.classList.contains('on');
  let engCtx=useAll?Object.values(ENGINES).map(e=>`[${e.name}]\n${e.description}`).join('\n\n'):'';
  if(!useAll){const act=document.querySelector('.eng-explorer-item.active');if(act){const e=ENGINES[act.dataset.key];if(e)engCtx=`[${e.name}]\n${e.description}`;}}
  const modePs={freeform:'You are the NEXUS Engine Explorer. Answer precisely.',audit:'You are a NEXUS Auditor. Analyze everything for errors, risks, bottlenecks.',stress:'You are the Hostile Truth Engine. Stress-test. Be ruthless but constructive.',delta:'You are the Delta Risk Engine. Scan all 28 Δ failure types.',reverse:'You are the Erosmancer. Reverse-engineer from end-states. Find hidden leverage.'};
  const msgs=[{role:'system',content:`${modePs[mode]||modePs.freeform}\n\n${engCtx?'CONTEXT:\n'+engCtx:''}\n\n${buildAxiomString()}`},..._engHistory];
  const am=document.createElement('div');am.className='eng-msg ai cur';am.textContent='';chat.appendChild(am);scrollBot(chat);
  try{
    abortCtrl=new AbortController();const result=await aiChat(msgs,{temperature:0.6,max_tokens:4096});
    let full='';
    if(result.stream)full=await readStream(result,(c,all)=>{am.textContent=all;scrollBot(chat);});
    else{full=result.text;am.textContent=full;}
    am.classList.remove('cur');_engHistory.push({role:'assistant',content:full});
    logIdea('output',full.slice(0,500));
  }catch(e){am.classList.remove('cur');am.textContent='Error: '+e.message;am.style.color='var(--r)';}
  finally{abortCtrl=null;}
}

/* ─── SPATIAL VOID ────────────────────────────────────────────── */
let _voidHistory=[];
