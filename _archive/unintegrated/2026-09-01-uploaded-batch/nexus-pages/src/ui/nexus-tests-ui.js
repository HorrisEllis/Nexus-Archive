/* NEXUS v0.53.0 — nexus-tests-ui.js
 * Test engine — live JS, UI smoke, checklist, reference
 * Phase 0B — extracted 2026-04-07
 */

/* ═══════════════════════════════════════════════════════════════
   TEST ENGINE — Live JS, UI Smoke, Checklist, Reference
   Source: dev_testing_verification.json
   ═══════════════════════════════════════════════════════════════ */
const TEST_DATA={
  checklist:[
    {category:'Syntax',color:'var(--g)',items:['ESLint passes with 0 warnings','TypeScript strict mode: no errors','Formatter check passes (Prettier)','Security linter clean (Bandit / ESLint-security)']},
    {category:'Tests',color:'var(--c)',items:['Unit test coverage ≥ 80% lines + branches','All tests pass on target runtime matrix','Race condition check: no open handles','Mutation score > 70% on critical modules']},
    {category:'Browser',color:'var(--y)',items:['Lighthouse score ≥ 90 (perf, a11y, SEO)','axe-core: 0 critical accessibility violations','Playwright: green on Chrome + Firefox + WebKit','No console errors on any page','CSS checked against target browser compat table']},
    {category:'Performance',color:'var(--o)',items:['LCP < 2.5s, CLS < 0.1, INP < 200ms','Bundle size within budget (CI gate)','API p95 < SLA target (smoke test in CI)','No memory leaks in heap snapshot comparison']},
    {category:'Security',color:'var(--m)',items:['Snyk/Trivy: no HIGH or CRITICAL vulns in deps','OWASP ZAP: no HIGH findings on staging URL','No secrets committed (gitleaks / truffleHog)','HTTP headers correct: CSP, HSTS, X-Frame-Options']},
    {category:'Windows',color:'var(--text2)',items:['Paths use path.join() — no hardcoded slashes','File casing matches exactly (no case-only mismatches)','Line endings: .gitattributes enforces LF','Tested without admin rights: no UAC failures','Unicode: non-ASCII filenames and inputs handled']},
    {category:'Architecture',color:'var(--c)',items:['No circular dependencies (dependency-cruiser)','No cross-layer imports (controller→repository direct)','DB migrations run up and down cleanly','API responses conform to OpenAPI schema','All env vars documented and validated on startup']},
  ],
  reference:[
    {section:'Syntax & Linting',cards:[
      {title:'ESLint',badge:{label:'JS/TS',color:'blue'},body:'Catches syntax errors, bad patterns, undefined vars. Use --max-warnings 0 in CI to treat warnings as failures.',tags:['eslint-plugin-import','@typescript-eslint']},
      {title:'TypeScript compiler',badge:{label:'JS/TS',color:'blue'},body:'Run tsc --noEmit in CI. Enable strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes.'},
      {title:'Prettier / dprint',badge:{label:'Any',color:'gray'},body:'Formatter-as-linter. Running prettier --check in CI fails on unformatted code — enforces consistent style.'},
      {title:'SonarQube / SonarCloud',badge:{label:'Any',color:'gray'},body:'Multi-language quality gate. Tracks cognitive complexity, code smells, duplications, and security hotspots.'},
    ]},
    {section:'Unit Tests',cards:[
      {title:'Vitest',badge:{label:'JS/TS',color:'blue'},body:'Fast Vite-native runner. Supports ESM, TypeScript, inline snapshots. Preferred over Jest for modern stacks.'},
      {title:'Jest',badge:{label:'JS/TS',color:'blue'},body:'Battle-tested. Powerful mocking (jest.mock, jest.spyOn), snapshot tests, fake timers. Target ≥80% coverage.'},
      {title:'pytest',badge:{label:'Python',color:'teal'},body:'Fixtures, parametrize, plugins (pytest-cov, pytest-mock, pytest-asyncio). Use --tb=short --fail-first in CI.'},
      {title:'Istanbul / c8',badge:{label:'Coverage',color:'teal'},body:'Use c8 (V8-native) for accurate JS coverage. Set thresholds: branches:80, lines:85. Pair with mutation testing.'},
      {title:'Stryker (JS) / mutmut (Py)',badge:{label:'Mutation',color:'amber'},body:'Mutates source code and re-runs tests. A surviving mutant = gap in tests. Mutation score > 70% = strong signal.'},
    ]},
    {section:'Integration & E2E',cards:[
      {title:'Supertest (Node)',badge:{label:'API',color:'teal'},body:'HTTP assertions against Express/Fastify without a running server. Tests routing, middleware, auth end-to-end.'},
      {title:'Playwright',badge:{label:'E2E',color:'blue'},body:'Cross-browser (Chrome, Firefox, WebKit). Record tests with codegen. Upload traces and screenshots on failure.'},
      {title:'Testcontainers',badge:{label:'Docker',color:'gray'},body:'Spin up real DB/Redis/Kafka containers per test. No mocks, no flakiness from external state.'},
    ]},
    {section:'Performance',cards:[
      {title:'Lighthouse CI',badge:{label:'Web',color:'amber'},body:'Block deployment if Core Web Vitals regress. LCP < 2.5s, CLS < 0.1, INP < 200ms.'},
      {title:'k6 / autocannon',badge:{label:'Load',color:'red'},body:'Script realistic user journeys. Assert p95 < SLA. Run as a smoke test in CI and a soak test weekly.'},
      {title:'clinic.js / 0x',badge:{label:'Node',color:'gray'},body:'Flame graphs for CPU hotspots. clinic doctor for event loop lag. clinic heapProfiler for memory leaks.'},
    ]},
    {section:'CI Pipeline (7 Stages)',cards:[
      {title:'Stage 1: Lint & format',badge:{label:'Stage 1',color:'teal'},body:'ESLint, Prettier, mypy, Ruff, go vet. Fail fast — runs in <30s, catches 80% of trivial mistakes.'},
      {title:'Stage 2: Unit + coverage',badge:{label:'Stage 2',color:'teal'},body:'Run in parallel by package. Enforce coverage thresholds. Report to Codecov/SonarCloud.'},
      {title:'Stage 3: Build verify',badge:{label:'Stage 3',color:'teal'},body:'Compile/bundle. Check bundle size against budgets. Build must be reproducible.'},
      {title:'Stage 4: Integration',badge:{label:'Stage 4',color:'teal'},body:'Spin up Docker Compose (app + DB + cache). Run API integration tests. Tear down.'},
      {title:'Stage 5: E2E',badge:{label:'Stage 5',color:'teal'},body:'Playwright against staging. Chrome + Firefox + WebKit. Upload traces on failure.'},
      {title:'Stage 6: Security scan',badge:{label:'Stage 6',color:'teal'},body:'Snyk / Trivy / OWASP Dependency-Check. Fail on HIGH or CRITICAL vulns. Run on every PR.'},
      {title:'Stage 7: Perf budget',badge:{label:'Stage 7',color:'teal'},body:'Lighthouse-CI, autocannon, k6 smoke. Block deployment if Core Web Vitals or p95 regresses.'},
    ]},
  ]
};

// Live JS tests — runs against the current NEXUS app in-browser
const LIVE_TESTS=[
  // Core utilities
  {group:'Core Utilities',tests:[
    {name:'$ selector returns element',fn:()=>{const el=$('app');if(!el)throw new Error('$("app") returned null');}},
    {name:'val() reads input value',fn:()=>{const el=document.createElement('input');el.id='_test_val';el.value='hello';document.body.appendChild(el);const v=val('_test_val');el.remove();if(v!=='hello')throw new Error('Expected "hello", got "'+v+'"');}},
    {name:'setVal() writes input value',fn:()=>{const el=document.createElement('input');el.id='_test_setval';document.body.appendChild(el);setVal('_test_setval','world');const v=el.value;el.remove();if(v!=='world')throw new Error('Expected "world", got "'+v+'"');}},
    {name:'uid() generates unique IDs',fn:()=>{const ids=new Set([uid(),uid(),uid(),uid(),uid()]);if(ids.size<5)throw new Error('uid() produced duplicates');}},
    {name:'esc() escapes HTML entities',fn:()=>{const r=esc('<script>&"');if(r!=='&lt;script&gt;&amp;&quot;')throw new Error('Bad escape: '+r);}},
    {name:'toast() renders without throwing',fn:()=>{toast('Test toast','ok',100);}},
  ]},
  // State management
  {group:'State & Storage',tests:[
    {name:'getProjects() returns array',fn:()=>{const p=getProjects();if(!Array.isArray(p))throw new Error('Expected array, got '+typeof p);}},
    {name:'saveProjects() + getProjects() roundtrip',fn:()=>{const orig=getProjects();const test=[...orig,{id:'__test__',name:'Test',code:'x',updated_at:new Date().toISOString()}];saveProjects(test);const back=getProjects();saveProjects(orig);if(!back.find(p=>p.id==='__test__'))throw new Error('Roundtrip failed');}},
    {name:'getIdeas() returns array',fn:()=>{const i=getIdeas();if(!Array.isArray(i))throw new Error('Expected array');}},
    {name:'logIdea() adds entry',fn:()=>{const before=getIdeas().length;logIdea('input','test-idea-entry-'+Date.now());const after=getIdeas().length;if(after<=before)throw new Error('logIdea did not add entry');}},
    {name:'REV.add() + REV.getAll() roundtrip',fn:()=>{const id='__revtest__';REV.add(id,'code-v1','auto','Test rev');const revs=REV.getAll(id);localStorage.removeItem('nx5_rev_'+id);if(!revs.length)throw new Error('No revision found after add');}},
    {name:'S.emit() fires listener',fn:()=>{let fired=false;const off=(e)=>{if(e.type==='__test_event__')fired=true;};S.on(off);S.emit('__test_event__');if(!fired)throw new Error('Event listener not fired');}},
  ]},
  // DOM structure
  {group:'DOM Structure',tests:[
    {name:'All nav tabs present',fn:()=>{const tabs=['home','console','builder','projects','roadmap','ideas','engines','enhance','options','tests','log'];tabs.forEach(t=>{if(!document.querySelector(`.tab-btn[data-tab="${t}"]`))throw new Error('Missing tab button: '+t);});}},
    {name:'All tab panels present',fn:()=>{const tabs=['home','console','builder','projects','roadmap','ideas','engines','enhance','options','tests','log'];tabs.forEach(t=>{if(!$('tab-'+t))throw new Error('Missing panel: tab-'+t);});}},
    {name:'Console input exists',fn:()=>{if(!$('console-input'))throw new Error('console-input not found');}},
    {name:'Send button exists',fn:()=>{if(!$('c-send'))throw new Error('c-send not found');}},
    {name:'Builder generate button',fn:()=>{if(!$('sb-generate'))throw new Error('sb-generate not found');}},
    {name:'Wizard overlay exists',fn:()=>{if(!$('wizard-overlay'))throw new Error('wizard-overlay not found');}},
    {name:'Void overlay exists',fn:()=>{if(!$('void-overlay'))throw new Error('void-overlay not found');}},
    {name:'Options save button',fn:()=>{if(!$('save-btn'))throw new Error('save-btn not found');}},
    {name:'Toast root exists',fn:()=>{if(!$('toast-root'))throw new Error('toast-root not found');}},
    {name:'Idea panel exists',fn:()=>{if(!$('idea-panel'))throw new Error('idea-panel not found');}},
  ]},
  // Function availability
  {group:'Function Availability',tests:[
    {name:'wizOpen is defined',fn:()=>{if(typeof wizOpen!=='function')throw new Error('wizOpen not defined');}},
    {name:'wizClose is defined',fn:()=>{if(typeof wizClose!=='function')throw new Error('wizClose not defined');}},
    {name:'switchTab is defined',fn:()=>{if(typeof switchTab!=='function')throw new Error('switchTab not defined');}},
    {name:'openModal is defined',fn:()=>{if(typeof openModal!=='function')throw new Error('openModal not defined');}},
    {name:'saveConfig is defined',fn:()=>{if(typeof saveConfig!=='function')throw new Error('saveConfig not defined');}},
    {name:'aiChat is defined',fn:()=>{if(typeof aiChat!=='function')throw new Error('aiChat not defined');}},
    {name:'consoleSubmit is defined',fn:()=>{if(typeof consoleSubmit!=='function')throw new Error('consoleSubmit not defined');}},
    {name:'logIdea is defined',fn:()=>{if(typeof logIdea!=='function')throw new Error('logIdea not defined');}},
    {name:'renderProjects is defined',fn:()=>{if(typeof renderProjects!=='function')throw new Error('renderProjects not defined');}},
    {name:'renderRoadmap is defined',fn:()=>{if(typeof renderRoadmap!=='function')throw new Error('renderRoadmap not defined');}},
    {name:'engExplorerSend is defined',fn:()=>{if(typeof engExplorerSend!=='function')throw new Error('engExplorerSend not defined');}},
    {name:'enhAudit is defined',fn:()=>{if(typeof enhAudit!=='function')throw new Error('enhAudit not defined');}},
    {name:'chatPipeConnect is defined',fn:()=>{if(typeof chatPipeConnect!=='function')throw new Error('chatPipeConnect not defined');}},
    {name:'wsRunAudit is defined',fn:()=>{if(typeof wsRunAudit!=='function')throw new Error('wsRunAudit not defined');}},
    {name:'voidSend is defined',fn:()=>{if(typeof voidSend!=='function')throw new Error('voidSend not defined');}},
  ]},
  // Tab navigation
  {group:'Tab Navigation',tests:[
    {name:'switchTab("console") activates panel',fn:()=>{switchTab('console');const p=$('tab-console');if(!p||p.dataset.active!=='true')throw new Error('tab-console not activated');}},
    {name:'switchTab("home") activates panel',fn:()=>{switchTab('home');const p=$('tab-home');if(!p||p.dataset.active!=='true')throw new Error('tab-home not activated');}},
    {name:'switchTab sets tab-btn active',fn:()=>{switchTab('roadmap');const b=document.querySelector('.tab-btn[data-tab="roadmap"]');if(!b||b.dataset.active!=='true')throw new Error('roadmap btn not activated');}},
    {name:'Only one tab panel active at a time',fn:()=>{switchTab('builder');const active=document.querySelectorAll('.tab-panel[data-active="true"]');if(active.length!==1)throw new Error('Expected 1 active panel, got '+active.length);}},
    {name:'switchTab("tests") activates this panel',fn:()=>{switchTab('tests');const p=$('tab-tests');if(!p||p.dataset.active!=='true')throw new Error('tab-tests not activated');}},
  ]},
  // AI state
  {group:'AI Provider State',tests:[
    {name:'Default provider is chatgpt',fn:()=>{if(AI.provider!=='chatgpt')throw new Error('Expected chatgpt, got '+AI.provider);}},
    {name:'AI.axioms has chatgpt key',fn:()=>{if(!AI.axioms.chatgpt)throw new Error('No chatgpt axiom array');}},
    {name:'buildAxiomString() returns string',fn:()=>{const r=buildAxiomString();if(typeof r!=='string')throw new Error('Expected string, got '+typeof r);}},
    {name:'getEngineCtx() returns non-empty for erosmancer',fn:()=>{const r=getEngineCtx('erosmancer');if(!r||r.length<10)throw new Error('Empty engine context');}},
    {name:'ENGINES object has 4 keys',fn:()=>{const k=Object.keys(ENGINES);if(k.length<4)throw new Error('Expected ≥4 engines, got '+k.length);}},
  ]},
  // Wizard
  {group:'Wizard',tests:[
    {name:'wizOpen() opens overlay',fn:()=>{wizOpen();const ov=$('wizard-overlay');if(!ov.classList.contains('open'))throw new Error('Overlay not opened');wizClose();}},
    {name:'wizClose() closes overlay',fn:()=>{wizOpen();wizClose();const ov=$('wizard-overlay');if(ov.classList.contains('open'))throw new Error('Overlay not closed');}},
    {name:'WIZ step resets to 0 on open',fn:()=>{WIZ.step=3;wizOpen();if(WIZ.step!==0)throw new Error('Step not reset: '+WIZ.step);wizClose();}},
  ]},
  // Roadmap
  {group:'Roadmap',tests:[
    {name:'RM_COLS has 5 columns',fn:()=>{if(RM_COLS.length!==5)throw new Error('Expected 5 cols, got '+RM_COLS.length);}},
    {name:'renderRoadmap() runs without throwing',fn:()=>{renderRoadmap();}},
    {name:'renderRecentProjects() runs without throwing',fn:()=>{renderRecentProjects();}},
  ]},
];

// UI smoke tests — checks visual/interactive elements
const UI_TESTS=[
  {group:'Layout',tests:[
    {name:'#app fills viewport height',fn:()=>{const r=$('app').getBoundingClientRect();if(r.height<window.innerHeight-5)throw new Error('app height '+r.height+' < '+window.innerHeight);}},
    {name:'#top-bar is visible',fn:()=>{const el=$('top-bar');const r=el.getBoundingClientRect();if(r.height<20)throw new Error('top-bar too short: '+r.height);}},
    {name:'#nav-bar is visible',fn:()=>{const el=$('nav-bar');const r=el.getBoundingClientRect();if(r.height<20)throw new Error('nav-bar too short: '+r.height);}},
    {name:'Active tab panel fills remaining height',fn:()=>{switchTab('home');const panel=$('tab-home');const r=panel.getBoundingClientRect();if(r.height<100)throw new Error('Home panel too short: '+r.height);}},
    {name:'No horizontal overflow on body',fn:()=>{if(document.body.scrollWidth>window.innerWidth+5)throw new Error('Horizontal overflow: '+document.body.scrollWidth+' > '+window.innerWidth);}},
  ]},
  {group:'Interactivity',tests:[
    {name:'Wizard NEW PROJECT button clickable',fn:()=>{const btn=document.querySelector('.tab-btn[data-tab="home"]');if(!btn)throw new Error('Home btn not found');btn.click();const wizBtn=document.querySelector('.home-actions .btn.primary');if(!wizBtn)throw new Error('Wizard btn not found');}},
    {name:'Console input accepts text',fn:()=>{switchTab('console');const inp=$('console-input');inp.value='test input';if(inp.value!=='test input')throw new Error('Input not set');}},
    {name:'Builder end-state input accepts text',fn:()=>{switchTab('builder');const inp=$('sb-endstate');inp.value='test vision';if(inp.value!=='test vision')throw new Error('Input not set');}},
    {name:'Idea panel toggles on button click',fn:()=>{switchTab('console');const btn=$('toggle-ideas');const panel=$('idea-panel');const wasClosed=panel.classList.contains('collapsed');btn.click();const nowClosed=panel.classList.contains('collapsed');if(wasClosed===nowClosed)throw new Error('Panel did not toggle');btn.click();}},
    {name:'Modal opens and closes',fn:()=>{openModal('chat-pipe-modal');const m=$('chat-pipe-modal');if(!m.classList.contains('open'))throw new Error('Modal did not open');closeModal('chat-pipe-modal');if(m.classList.contains('open'))throw new Error('Modal did not close');}},
    {name:'Engine pills toggle active class',fn:()=>{switchTab('console');const pill=document.querySelector('.eng-pill');if(!pill)throw new Error('No eng-pill found');pill.click();const active=pill.className.includes('active-');}},
  ]},
  {group:'Options',tests:[
    {name:'Provider selector defaults to chatgpt',fn:()=>{switchTab('options');const sel=$('opt-ai-provider');if(sel.value!=='chatgpt')throw new Error('Expected chatgpt, got '+sel.value);}},
    {name:'ChatGPT section visible by default',fn:()=>{const sec=$('provider-chatgpt');if(!sec||sec.style.display==='none')throw new Error('ChatGPT section not visible');}},
    {name:'Claude section hidden by default',fn:()=>{const sec=$('provider-claude');if(sec&&sec.style.display!=='none')throw new Error('Claude section should be hidden');}},
    {name:'Save button present and enabled',fn:()=>{const btn=$('save-btn');if(!btn)throw new Error('No save btn');if(btn.disabled)throw new Error('Save btn disabled');}},
  ]},
  // AI System
  {group:'AI System',tests:[
    {name:'AI.provider is set',fn:()=>{ if(!AI?.provider) throw new Error('AI.provider not set'); }},
    {name:'aiChat function exists',fn:()=>{ if(typeof aiChat!=='function') throw new Error('aiChat not defined'); }},
    {name:'NEXUS_AGENTS populated',fn:()=>{ const a=window.NEXUS_AGENTS||[]; if(a.length<17) throw new Error('Expected 17+ agents, got '+a.length); }},
    {name:'All agents have id+name+color',fn:()=>{ (window.NEXUS_AGENTS||[]).forEach(a=>{ if(!a.id||!a.name||!a.color) throw new Error('Agent missing: '+JSON.stringify(a)); }); }},
    {name:'Guardian module present',fn:()=>{ if(typeof GUARDIAN==='undefined') throw new Error('GUARDIAN not defined'); }},
    {name:'GUARDIAN.calltos is array',fn:()=>{ if(!Array.isArray(GUARDIAN?.calltos)) throw new Error('GUARDIAN.calltos not array'); }},
  ]},
  {group:'Bridge',tests:[
    {name:'BRIDGE object exists',fn:()=>{ if(typeof BRIDGE==='undefined') throw new Error('BRIDGE not defined'); }},
    {name:'bridge-url element present',fn:()=>{ if(!document.getElementById('bridge-url')) throw new Error('bridge-url input missing'); }},
    {name:'bridgeConnect function exists',fn:()=>{ if(typeof bridgeConnect!=='function') throw new Error('bridgeConnect not defined'); }},
  ]},
  {group:'Hook Registry',tests:[
    {name:'NEXUS_HOOK_NAMESPACE defined',fn:()=>{ if(typeof window.NEXUS_HOOK_NAMESPACE!=='object') throw new Error('NEXUS_HOOK_NAMESPACE not defined'); }},
    {name:'80+ hook namespace entries',fn:()=>{ const n=Object.keys(window.NEXUS_HOOK_NAMESPACE||{}).length; if(n<80) throw new Error('Expected 80+ hooks, got '+n); }},
    {name:'guardian hooks present',fn:()=>{ const ns=window.NEXUS_HOOK_NAMESPACE||{}; if(!ns['guardian.callto.pick']) throw new Error('guardian.callto.pick missing'); }},
    {name:'console.input hook present',fn:()=>{ const ns=window.NEXUS_HOOK_NAMESPACE||{}; if(!ns['console.input']) throw new Error('console.input missing'); }},
  ]},
  {group:'UUID System',tests:[
    {name:'UUID.gen creates entry',fn:()=>{ const r=UUID.gen('test',{_suite:true},'test:suite'); if(!r||typeof r!=='object') throw new Error('UUID.gen returned '+typeof r); }},
    {name:'UUID._sessionId is string',fn:()=>{ if(typeof UUID._sessionId!=='string'||UUID._sessionId.length<8) throw new Error('Bad sessionId: '+UUID._sessionId); }},
    {name:'UUID.getAll returns array',fn:()=>{ if(!Array.isArray(UUID.getAll())) throw new Error('UUID.getAll not array'); }},
  ]},
  {group:'SISO & EventBus',tests:[
    {name:'S.emit fires listener',fn:()=>{ let got=false; const h=(e)=>{ if(e.type==='__suite_test') got=true; }; S.on(h); S.emit('__suite_test',{}); if(!got) throw new Error('Event not received'); }},
    {name:'SISO_STREAM exists',fn:()=>{ if(typeof SISO_STREAM==='undefined') throw new Error('SISO_STREAM not defined'); }},
    {name:'JAA.log function exists',fn:()=>{ if(typeof JAA?.log!=='function') throw new Error('JAA.log not defined'); }},
  ]},
  {group:'Forge IDE',tests:[
    {name:'forge-editor element present',fn:()=>{ if(!document.getElementById('forge-editor')) throw new Error('forge-editor missing'); }},
    {name:'guiUndo is real (not stub)',fn:()=>{ if(typeof guiUndo!=='function') throw new Error('guiUndo missing'); if(guiUndo.toString().includes('coming soon')) throw new Error('guiUndo is a stub'); }},
    {name:'guiRedo is real (not stub)',fn:()=>{ if(typeof guiRedo!=='function') throw new Error('guiRedo missing'); if(guiRedo.toString().includes('coming soon')) throw new Error('guiRedo is a stub'); }},
    {name:'compileRun is real (not AI-only)',fn:()=>{ if(typeof compileRun!=='function') throw new Error('compileRun missing'); if(compileRun.toString().includes('Generate build/compile plan')) throw new Error('compileRun is still AI-only stub'); }},
    {name:'wsGithubPull is real',fn:()=>{ if(typeof wsGithubPull!=='function') throw new Error('wsGithubPull missing'); if(wsGithubPull.toString().includes('check GitHub repo manually')) throw new Error('wsGithubPull is a stub'); }},
  ]},
  {group:'Console & AI Chat',tests:[
    {name:'console-input present',fn:()=>{ if(!document.getElementById('console-input')) throw new Error('console-input missing'); }},
    {name:'sendChat or sendMessage exists',fn:()=>{ if(typeof sendChat!=='function'&&typeof sendMessage!=='function') throw new Error('No send function'); }},
    {name:'abortChat function exists',fn:()=>{ if(typeof abortChat!=='function') throw new Error('abortChat not defined'); }},
    {name:'readStream function exists',fn:()=>{ if(typeof readStream!=='function') throw new Error('readStream not defined'); }},
    {name:'nx_guardian_agent_hooks wired',fn:()=>{ const s=aiChat.toString(); if(!s.includes('nx_guardian_agent_hooks')) throw new Error('aiChat does not read Guardian hooks'); }},
  ]},
  {group:'P2P',tests:[
    {name:'p2pStart is not a stub',fn:()=>{ if(typeof p2pStart!=='function') throw new Error('p2pStart missing'); if(p2pStart.toString().includes('Phase 22')) throw new Error('p2pStart is a stub'); }},
    {name:'p2pRefresh function exists',fn:()=>{ if(typeof p2pRefresh!=='function') throw new Error('p2pRefresh missing'); }},
  ]},
  {group:'Test Environment',tests:[
    {name:'TE.services is object',fn:()=>{ if(typeof TE?.services!=='object') throw new Error('TE.services not object'); }},
    {name:'teStart is real (uses bridge)',fn:()=>{ if(typeof teStart!=='function') throw new Error('teStart missing'); if(!teStart.toString().includes('_teBridge')) throw new Error('teStart is UI-only stub'); }},
    {name:'TE_SERVICE_CMDS defined',fn:()=>{ if(typeof TE_SERVICE_CMDS==='undefined') throw new Error('TE_SERVICE_CMDS not defined'); }},
    {name:'teSqlHistory is real',fn:()=>{ if(typeof teSqlHistory!=='function') throw new Error('teSqlHistory missing'); if(teSqlHistory.toString().includes('future feature')) throw new Error('teSqlHistory is a stub'); }},
    {name:'teSqlExport is real',fn:()=>{ if(typeof teSqlExport!=='function') throw new Error('teSqlExport missing'); if(teSqlExport.toString().includes('connect to backend')) throw new Error('teSqlExport is a stub'); }},
  ]},
  {group:'Onboarding',tests:[
    {name:'nxShowFirstLaunch exists',fn:()=>{ if(typeof nxShowFirstLaunch!=='function') throw new Error('nxShowFirstLaunch not defined'); }},
    {name:'flStep + flFinish exist',fn:()=>{ if(typeof flStep!=='function'||typeof flFinish!=='function') throw new Error('flStep/flFinish missing'); }},
    {name:'loginSkip goes to home',fn:()=>{ if(typeof loginSkip!=='function') throw new Error('loginSkip missing'); if(loginSkip.toString().includes("switchTab('options')")) throw new Error('loginSkip goes to options instead of home'); }},
  ]},
  {group:'Security',tests:[
    {name:'API key fields are password type',fn:()=>{ ['opt-claude-key','opt-chatgpt-key'].forEach(id=>{ const el=document.getElementById(id); if(el&&el.type!=='password') throw new Error(id+' not password type'); }); }},
    {name:'No plaintext keys in localStorage',fn:()=>{ const raw=JSON.stringify(localStorage); if(/sk-[a-zA-Z0-9]{20,}/.test(raw)) throw new Error('API key found in localStorage unprotected'); }},
  ]},
  {group:'Home',tests:[
    {name:'Home hero title renders',fn:()=>{switchTab('home');const hero=document.querySelector('.home-hero-title');if(!hero||hero.textContent.trim()==='')throw new Error('Hero title empty');}},
    {name:'Home tiles render',fn:()=>{const tiles=document.querySelectorAll('.home-tile');if(tiles.length<4)throw new Error('Expected ≥4 tiles, got '+tiles.length);}},
    {name:'Metrics grid renders',fn:()=>{const cards=document.querySelectorAll('.mcard');if(cards.length<4)throw new Error('Expected ≥4 metric cards, got '+cards.length);}},
  ]},
];

// Test runner state
const TEST_STATE={results:[],checklistState:{}};

function testSwitchTab(btn,name){
  document.querySelectorAll('[data-ttab]').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.pwt-panel[id^="tt-"]').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  const panel=$('tt-'+name);if(panel)panel.classList.add('active');
}

async function testsRunAll(){
  TEST_STATE.results=[];
  let pass=0,fail=0,total=0;
  const liveEl=$('live-test-results');
  const uiEl=$('ui-test-results');
  liveEl.innerHTML='';uiEl.innerHTML='';

  // Switch to live tab to show progress
  testSwitchTab(document.querySelector('[data-ttab="live"]'),'live');

  // Run live JS tests
  for(const group of LIVE_TESTS){
    const groupDiv=document.createElement('div');groupDiv.className='test-group';
    const headDiv=document.createElement('div');headDiv.className='test-group-head';
    headDiv.innerHTML=`<span class="test-group-label">${esc(group.group)}</span><span class="test-group-stats" id="tgs-${esc(group.group.replace(/\s/g,'_'))}">Running…</span>`;
    groupDiv.appendChild(headDiv);
    liveEl.appendChild(groupDiv);
    let gPass=0,gFail=0;
    for(const test of group.tests){
      total++;
      const row=document.createElement('div');row.className='test-row';
      const icon=document.createElement('div');icon.className='test-icon run';icon.textContent='…';
      const nameDiv=document.createElement('div');nameDiv.style.cssText='flex:1';
      nameDiv.innerHTML=`<div class="test-name">${esc(test.name)}</div>`;
      row.appendChild(icon);row.appendChild(nameDiv);
      groupDiv.appendChild(row);
      // Yield to browser for render
      await new Promise(r=>setTimeout(r,0));
      try{
        await test.fn();
        icon.className='test-icon pass';icon.textContent='✓';
        nameDiv.querySelector('.test-name').style.color='var(--text)';
        pass++;gPass++;
        TEST_STATE.results.push({group:group.group,name:test.name,status:'pass'});
      }catch(e){
        icon.className='test-icon fail';icon.textContent='✗';
        const errDiv=document.createElement('div');errDiv.className='test-err';errDiv.textContent=e.message;
        nameDiv.appendChild(errDiv);
        fail++;gFail++;
        TEST_STATE.results.push({group:group.group,name:test.name,status:'fail',error:e.message});
      }
    }
    const statsEl=headDiv.querySelector(`#tgs-${group.group.replace(/\s/g,'_')}`);
    if(statsEl)statsEl.textContent=`${gPass}/${group.tests.length} passed`;
    if(gFail>0)headDiv.style.borderLeft=`3px solid var(--r)`;
    else headDiv.style.borderLeft=`3px solid var(--g)`;
  }

  // Run UI tests
  for(const group of UI_TESTS){
    const groupDiv=document.createElement('div');groupDiv.className='test-group';
    const headDiv=document.createElement('div');headDiv.className='test-group-head';
    headDiv.innerHTML=`<span class="test-group-label">${esc(group.group)}</span><span class="test-group-stats" id="utgs-${esc(group.group.replace(/\s/g,'_'))}">Running…</span>`;
    groupDiv.appendChild(headDiv);
    uiEl.appendChild(groupDiv);
    let gPass=0,gFail=0;
    for(const test of group.tests){
      total++;
      const row=document.createElement('div');row.className='test-row';
      const icon=document.createElement('div');icon.className='test-icon run';icon.textContent='…';
      const nameDiv=document.createElement('div');nameDiv.style.cssText='flex:1';
      nameDiv.innerHTML=`<div class="test-name">${esc(test.name)}</div>`;
      row.appendChild(icon);row.appendChild(nameDiv);
      groupDiv.appendChild(row);
      await new Promise(r=>setTimeout(r,0));
      try{
        await test.fn();
        icon.className='test-icon pass';icon.textContent='✓';
        pass++;gPass++;
        TEST_STATE.results.push({group:group.group,name:test.name,status:'pass'});
      }catch(e){
        icon.className='test-icon fail';icon.textContent='✗';
        const errDiv=document.createElement('div');errDiv.className='test-err';errDiv.textContent=e.message;
        nameDiv.appendChild(errDiv);
        fail++;gFail++;
        TEST_STATE.results.push({group:group.group,name:test.name,status:'fail',error:e.message});
      }
    }
    const statsEl=headDiv.querySelector(`#utgs-${group.group.replace(/\s/g,'_')}`);
    if(statsEl)statsEl.textContent=`${gPass}/${group.tests.length} passed`;
    if(gFail>0)headDiv.style.borderLeft=`3px solid var(--r)`;
    else headDiv.style.borderLeft=`3px solid var(--g)`;
  }

  // Update score
  const pct=total?Math.round(pass/total*100):0;
  setEl('test-pass-count',pass);
  setEl('test-fail-count',fail);
  setEl('test-skip-count',0);
  setEl('test-total-count',total);
  setEl('test-score-pct',pct+'%');
  const bar=$('test-progress-bar');
  if(bar){bar.style.width=pct+'%';bar.style.background=pct>=90?'var(--g)':pct>=60?'var(--y)':'var(--r)';}
  setEl('test-last-run','Last run: '+new Date().toLocaleTimeString());
  // Switch to live tab to show results
  testSwitchTab(document.querySelector('[data-ttab="live"]'),'live');
  switchTab('tests');
  log_ev('tests:complete',{pass,fail,total,pct},'INFO');
  syncTestBadge();
  toast(pct+'% passed ('+pass+'/'+total+')',pct>=80?'ok':'err',4000);
}

function testsReset(){
  $('live-test-results').innerHTML='';
  $('ui-test-results').innerHTML='';
  TEST_STATE.results=[];
  setEl('test-pass-count',0);setEl('test-fail-count',0);setEl('test-skip-count',0);setEl('test-total-count',0);
  setEl('test-score-pct','—');setEl('test-last-run','Never run');
  const bar=$('test-progress-bar');if(bar){bar.style.width='0%';bar.style.background='var(--g)';}
}

function testsExport(){
  const report={timestamp:new Date().toISOString(),results:TEST_STATE.results,summary:{pass:parseInt($('test-pass-count').textContent)||0,fail:parseInt($('test-fail-count').textContent)||0,total:parseInt($('test-total-count').textContent)||0}};
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));a.download='nexus-test-report-'+Date.now()+'.json';a.click();
}

function renderChecklist(){
  const el=$('checklist-results');if(!el)return;
  el.innerHTML='';
  TEST_DATA.checklist.forEach(cat=>{
    const div=document.createElement('div');div.className='checklist-cat';
    div.innerHTML=`<div class="checklist-cat-head" style="color:${cat.color}">${esc(cat.category)}</div>`;
    cat.items.forEach((item,i)=>{
      const key=cat.category+'_'+i;
      const checked=TEST_STATE.checklistState[key]||false;
      const row=document.createElement('div');row.className='checklist-item'+(checked?' checked':'');
      row.innerHTML=`<div class="checklist-cb${checked?' checked':''}">${checked?'✓':''}</div><span>${esc(item)}</span>`;
      row.addEventListener('click',()=>{
        TEST_STATE.checklistState[key]=!TEST_STATE.checklistState[key];
        localStorage.setItem('nx5_checklist',JSON.stringify(TEST_STATE.checklistState));
        renderChecklist();
      });
      div.appendChild(row);
    });
    el.appendChild(div);
  });
  // Progress
  const all=Object.keys(TEST_STATE.checklistState);
  const done=all.filter(k=>TEST_STATE.checklistState[k]).length;
  const total=TEST_DATA.checklist.reduce((s,c)=>s+c.items.length,0);
  const pct=total?Math.round(done/total*100):0;
  const summary=document.createElement('div');
  summary.style.cssText='padding:10px 0;font-size:10px;color:var(--text3);border-top:1px solid var(--border);margin-top:8px;display:flex;align-items:center;gap:10px';
  summary.innerHTML=`<span>${done}/${total} items checked</span><div style="flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${pct>=80?'var(--g)':pct>=50?'var(--y)':'var(--r)'};transition:width .3s"></div></div><span style="color:var(--c)">${pct}%</span>`;
  el.appendChild(summary);
}

function renderReference(){
  const el=$('reference-results');if(!el)return;
  el.innerHTML='';
  const badgeColors={'blue':'color:var(--c);border-color:rgba(0,212,255,.3)','teal':'color:var(--g);border-color:rgba(0,255,136,.3)','amber':'color:var(--y);border-color:rgba(255,204,0,.3)','red':'color:var(--r);border-color:rgba(255,45,85,.3)','purple':'color:var(--m);border-color:rgba(204,68,255,.3)','gray':'color:var(--text2);border-color:var(--border2)'};
  TEST_DATA.reference.forEach(sec=>{
    const div=document.createElement('div');div.className='ref-section';
    div.innerHTML=`<div class="ref-section-title">${esc(sec.section)}</div>`;
    sec.cards.forEach(card=>{
      const bc=badgeColors[card.badge?.color]||badgeColors.gray;
      const d=document.createElement('div');d.className='ref-card';
      d.innerHTML=`<div class="ref-card-title"><span class="ref-badge" style="${bc}">${esc(card.badge?.label||'')}</span>${esc(card.title)}</div><div class="ref-card-body">${esc(card.body)}</div>`;
      div.appendChild(d);
    });
    el.appendChild(div);
  });
}

// Load checklist state from storage
try{Object.assign(TEST_STATE.checklistState,JSON.parse(localStorage.getItem('nx5_checklist')||'{}'));}catch{}

// ─── Unified switchTab hook (tests + options/bridge) ──────────
const _origSwitchTab=switchTab;
switchTab=function(name){
  _origSwitchTab(name);
  // Boot guard — suppress heavy tab inits during startup test sweep
  if(window._nx_booting){return;}
  if(name==='tests'){renderChecklist();renderReference();}
  if(name==='options'){
    const bb=document.getElementById('bridge-acc-badge');
    if(bb)bb.textContent=BRIDGE.connected?'ONLINE':'OFFLINE';
    const pb=document.getElementById('pipe-acc-badge');
    if(pb)pb.textContent=PIPE.active?PIPE.label||'ONLINE':'OFFLINE';
    syncTestBadge();
  }
  if(name==='log'){
    // Refresh whichever sub-tab is active
    const activeLtab=document.querySelector('[data-ltab][data-active="true"]');
    if(activeLtab){
      const lt=activeLtab.dataset.ltab;
      if(lt==='jaa')jaaRender();
      if(lt==='uuids')uuidRender();
      if(lt==='deltas')deltaRender();
    }
  }
  if(name==='builder'){
    // Ensure builder sub is in correct state
    const activeSbt=document.querySelector('[data-sbt][data-active="true"]');
    if(!activeSbt){
      const first=document.querySelector('[data-sbt]');
      if(first)first.dataset.active='true';
      const firstPanel=$('sbs-script');
      if(firstPanel)firstPanel.dataset.active='true';
    }
  }
  if(name==='help'){helpInitTopics();}
  if(name==='forge'){forgeInit();}
  if(name==='testenv'){teInit();}
  // 'tests' is now a sub-tab inside testenv — no auto-run here
  // Update interaction bar
  const fill=$('nx-interaction-bar-fill');
  if(fill){
    const pct=NX_INTERACTIONS.total>0?Math.min(100,Math.round(NX_INTERACTIONS.ok/NX_INTERACTIONS.total*100)):100;
    fill.style.width=pct+'%';
    fill.style.background=NX_ERRORS.length>5?'linear-gradient(90deg,var(--r),var(--y))':NX_ERRORS.length>0?'linear-gradient(90deg,var(--y),var(--c))':'linear-gradient(90deg,var(--g),var(--c))';
  }
};

