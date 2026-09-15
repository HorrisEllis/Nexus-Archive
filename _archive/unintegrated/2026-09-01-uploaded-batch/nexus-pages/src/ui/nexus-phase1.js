/* NEXUS v0.53.0 — nexus-phase1.js
 * Phase 1 Bedrock — EventBus, HookRegistry, Module, Toast, NexusCore, DiagnosticsModule
 * Phase 0B — extracted 2026-04-07
 */

/* ── EventBus ──────────────────────────────────────────────────────────────── */
(function(){
'use strict';
const CORE_EVENT_TYPES=new Set(['nexus:module:ready','nexus:module:error','nexus:module:destroy','nexus:hook:registered','nexus:hook:deregistered','nexus:hook:test:run','nexus:hook:test:result','nexus:toast','nexus:navigate:settings','nexus:bridge:status','nexus:bridge:route','nexus:bridge:connect','nexus:bridge:disconnect','nexus:ai:response','nexus:ai:error','nexus:ai:session:start','nexus:ai:session:end','nexus:compiler:step','nexus:compiler:complete','nexus:compiler:fail','nexus:file:save','nexus:file:revision','nexus:pipeline:step','nexus:pipeline:complete','nexus:pipeline:fail','nexus:appearance:change','nexus:workspace:mode','nexus:workspace:datadir','nexus:agent:start','nexus:agent:stop','nexus:agent:gate:pass','nexus:agent:gate:fail','nexus:orchestrator:route','nexus:orchestrator:queue','nexus:extension:connected','nexus:extension:profile','nexus:guardian:hook','nexus:ui:tab:change','nexus:ui:modal:open','nexus:ui:modal:close']);
class EventBus{
  constructor({sessionId,maxHistory=5000}={}){
    this._listeners=new Map();this._wildcards=new Set();
    this._history=[];this._maxHistory=maxHistory;
    this._sessionId=sessionId||_uuid();this._seq=0;
    this._paused=false;this._queue=[];
  }
  on(type,handler,{hookId=null,once=false}={}){
    if(type==='*'){const e={handler,hookId,once};this._wildcards.add(e);return()=>this._wildcards.delete(e);}
    if(!this._listeners.has(type))this._listeners.set(type,new Set());
    const e={handler,hookId,once};this._listeners.get(type).add(e);
    return()=>this._listeners.get(type)?.delete(e);
  }
  once(type,handler,opts={}){return this.on(type,handler,{...opts,once:true});}
  off(type,handler){
    if(type==='*'){for(const e of this._wildcards){if(e.handler===handler){this._wildcards.delete(e);break;}}return;}
    const s=this._listeners.get(type);if(!s)return;
    for(const e of s){if(e.handler===handler){s.delete(e);break;}}
  }
  emit(type,{sourceHookId=null,targetHookId=null,payload={}}={}){
    const event={id:_uuid(),seq:this._seq++,type,sourceHookId,targetHookId,payload,ts:new Date().toISOString(),sessionId:this._sessionId};
    if(this._paused){this._queue.push(event);return event;}
    this._dispatch(event);return event;
  }
  _dispatch(event){
    this._history.push(event);if(this._history.length>this._maxHistory)this._history.shift();
    const{type,targetHookId}=event;const s=this._listeners.get(type);
    if(s){const rm=[];for(const e of s){if(targetHookId&&e.hookId&&e.hookId!==targetHookId)continue;try{e.handler(event);}catch(err){console.error('[EventBus]',err);}if(e.once)rm.push(e);}rm.forEach(e=>s.delete(e));}
    for(const e of this._wildcards){try{e.handler(event);}catch{}if(e.once)this._wildcards.delete(e);}
  }
  pause(){this._paused=true;}
  resume(){this._paused=false;const q=this._queue.splice(0);q.forEach(e=>this._dispatch(e));}
  history({type,limit=200}={}){let e=this._history;if(type)e=e.filter(x=>x.type===type);return e.slice(-limit);}
  get sessionId(){return this._sessionId;}
  get eventCount(){return this._seq;}
  waitFor(type,{timeout=10000}={}){
    return new Promise((res,rej)=>{
      const t=setTimeout(()=>{u();rej(new Error(`waitFor(${type}) timeout`));},timeout);
      const u=this.once(type,e=>{clearTimeout(t);res(e);});
    });
  }
}
window.NexusEventBus=EventBus;

/* ── HookRegistry ──────────────────────────────────────────────────────────── */
const HOOK_NAMESPACE={
  'bridge.health':          {status:'active', prefix:'bridge',       label:'Bridge Health',            settingsPath:'options.bridge.nexus',      builderFields:['bridge_url','bridge_port']},
  'bridge.accounts':        {status:'active', prefix:'bridge',       label:'Accounts',                 settingsPath:'options.bridge.accounts',   builderFields:['account_provider','account_id']},
  'bridge.cookies':         {status:'active', prefix:'bridge',       label:'Cookie Capture',           settingsPath:'options.bridge.accounts',   builderFields:[]},
  'bridge.profiles':        {status:'active', prefix:'bridge',       label:'Browser Profiles',         settingsPath:'options.bridge.playwright', builderFields:['profile_path','profile_browser']},
  'bridge.intent.code':     {status:'active', prefix:'bridge',       label:'Intent: Code',             settingsPath:'options.bridge.routing',    builderFields:['intent_provider']},
  'bridge.intent.research': {status:'active', prefix:'bridge',       label:'Intent: Research',         settingsPath:'options.bridge.routing',    builderFields:['intent_provider']},
  'bridge.intent.creative': {status:'active', prefix:'bridge',       label:'Intent: Creative',         settingsPath:'options.bridge.routing',    builderFields:['intent_provider']},
  'bridge.intent.fast':     {status:'active', prefix:'bridge',       label:'Intent: Fast',             settingsPath:'options.bridge.routing',    builderFields:['intent_provider']},
  'bridge.intent.local':    {status:'active', prefix:'bridge',       label:'Intent: Local',            settingsPath:'options.bridge.routing',    builderFields:['intent_provider']},
  'bridge.ai.route':        {status:'active', prefix:'bridge',       label:'AI Route',                 settingsPath:'options.bridge.routing',    builderFields:[]},
  'bridge.ssh':             {status:'active', prefix:'bridge',       label:'SSH',                      settingsPath:'options.bridge.ssh',        builderFields:['ssh_host','ssh_port','ssh_user','ssh_auth']},
  'bridge.sftp.push':       {status:'active', prefix:'bridge',       label:'SFTP Push',                settingsPath:'options.bridge.ssh',        builderFields:['sftp_remote_path']},
  'bridge.sftp.pull':       {status:'active', prefix:'bridge',       label:'SFTP Pull',                settingsPath:'options.bridge.ssh',        builderFields:['sftp_local_path']},
  'bridge.webrtc':          {status:'active', prefix:'bridge',       label:'WebRTC P2P',               settingsPath:'options.bridge.webrtc',     builderFields:['webrtc_peer_id','webrtc_stun']},
  'bridge.webrtc.encrypt':  {status:'active', prefix:'bridge',       label:'WebRTC Encryption',        settingsPath:'options.bridge.webrtc',     builderFields:[]},
  'bridge.cli':             {status:'active', prefix:'bridge',       label:'CLI Executor',             settingsPath:'options.bridge.cli',        builderFields:['cli_command','cli_cwd']},
  'bridge.cli.allowed':     {status:'active', prefix:'bridge',       label:'CLI Allowlist',            settingsPath:'options.bridge.cli',        builderFields:[]},
  'bridge.apt.install':     {status:'active', prefix:'bridge',       label:'APT Install',              settingsPath:'options.bridge.apt',        builderFields:['apt_packages']},
  'bridge.apt.remove':      {status:'active', prefix:'bridge',       label:'APT Remove',               settingsPath:'options.bridge.apt',        builderFields:[]},
  'bridge.git.clone':       {status:'active', prefix:'bridge',       label:'Git Clone',                settingsPath:'options.bridge.git',        builderFields:['git_remote','git_branch']},
  'bridge.git.push':        {status:'active', prefix:'bridge',       label:'Git Push',                 settingsPath:'options.bridge.git',        builderFields:['git_remote','git_branch','git_message']},
  'bridge.git.pull':        {status:'active', prefix:'bridge',       label:'Git Pull',                 settingsPath:'options.bridge.git',        builderFields:[]},
  'bridge.git.status':      {status:'active', prefix:'bridge',       label:'Git Status',               settingsPath:'options.bridge.git',        builderFields:[]},
  'bridge.github.push':     {status:'active', prefix:'bridge',       label:'GitHub Push',              settingsPath:'options.bridge.github',     builderFields:['github_token','github_repo']},
  'bridge.github.pr':       {status:'active', prefix:'bridge',       label:'GitHub PR',                settingsPath:'options.bridge.github',     builderFields:[]},
  'bridge.gitlab.push':     {status:'active', prefix:'bridge',       label:'GitLab Push',              settingsPath:'options.bridge.gitlab',     builderFields:['gitlab_token','gitlab_project']},
  'bridge.webui':           {status:'active', prefix:'bridge',       label:'Open WebUI',               settingsPath:'options.bridge.webui',      builderFields:['webui_url','webui_key']},
  'bridge.playwright.launch':{status:'active',prefix:'bridge',       label:'Guardian Launch',        settingsPath:'options.bridge.playwright', builderFields:['pw_browser','pw_profile','pw_headless']},
  'bridge.playwright.send': {status:'active', prefix:'bridge',       label:'Guardian Send',          settingsPath:'options.bridge.playwright', builderFields:['pw_action','pw_selector']},
  'bridge.deltalog':        {status:'active', prefix:'bridge',       label:'Delta Log',                settingsPath:'options.bridge.delta',      builderFields:[]},
  'bridge.route':           {status:'active', prefix:'bridge',       label:'Dynamic Router',           settingsPath:'options.bridge.routing',    builderFields:['route_intent','route_module']},
  'ai.provider.ollama':     {status:'active', prefix:'ai',           label:'Ollama',                   settingsPath:'options.bridge.ai',         builderFields:['ollama_url','ollama_model']},
  'ai.provider.claude':     {status:'active', prefix:'ai',           label:'Claude / Anthropic',       settingsPath:'options.bridge.ai',         builderFields:['claude_key','claude_model']},
  'ai.provider.chatgpt':    {status:'active', prefix:'ai',           label:'ChatGPT / OpenAI',         settingsPath:'options.bridge.ai',         builderFields:['chatgpt_key','chatgpt_model']},
  'ai.provider.deepseek':   {status:'active', prefix:'ai',           label:'DeepSeek',                 settingsPath:'options.bridge.ai',         builderFields:['deepseek_key','deepseek_model']},
  'ai.provider.lmstudio':   {status:'active', prefix:'ai',           label:'LM Studio',                settingsPath:'options.bridge.ai',         builderFields:['lmstudio_url','lmstudio_model']},
  'ai.provider.webui':      {status:'active', prefix:'ai',           label:'Open WebUI',               settingsPath:'options.bridge.ai',         builderFields:['webui_url','webui_key']},
  'ai.fallback':            {status:'active', prefix:'ai',           label:'AI Fallback Provider',     settingsPath:'options.bridge.ai',         builderFields:[]},
  'ai.intent.code':         {status:'active', prefix:'ai',           label:'AI Intent: Code',          settingsPath:'options.bridge.routing',    builderFields:[]},
  'ai.intent.research':     {status:'active', prefix:'ai',           label:'AI Intent: Research',      settingsPath:'options.bridge.routing',    builderFields:[]},
  'ai.intent.creative':     {status:'active', prefix:'ai',           label:'AI Intent: Creative',      settingsPath:'options.bridge.routing',    builderFields:[]},
  'ai.intent.fast':         {status:'active', prefix:'ai',           label:'AI Intent: Fast',          settingsPath:'options.bridge.routing',    builderFields:[]},
  'ai.modelmap.fast':       {status:'active', prefix:'ai',           label:'Model Alias: fast',        settingsPath:'options.bridge.ai',         builderFields:[]},
  'ai.modelmap.smart':      {status:'active', prefix:'ai',           label:'Model Alias: smart',       settingsPath:'options.bridge.ai',         builderFields:[]},
  'ai.modelmap.local':      {status:'active', prefix:'ai',           label:'Model Alias: local',       settingsPath:'options.bridge.ai',         builderFields:[]},
  'compiler.step.clean':    {status:'active', prefix:'compiler',     label:'Build: Clean',             settingsPath:'options.compiler.steps',    builderFields:['output_dir','clean_before_build']},
  'compiler.step.install':  {status:'active', prefix:'compiler',     label:'Build: Install Deps',      settingsPath:'options.compiler.steps',    builderFields:['package_manager','install_flags','node_version']},
  'compiler.step.build':    {status:'active', prefix:'compiler',     label:'Build: Build',             settingsPath:'options.compiler.steps',    builderFields:['entry_point','build_script','env_vars','target_platform']},
  'compiler.step.sign':     {status:'active', prefix:'compiler',     label:'Build: Sign',              settingsPath:'options.compiler.steps',    builderFields:['cert_path','cert_password','timestamp_url','bundle_id']},
  'compiler.step.package':  {status:'active', prefix:'compiler',     label:'Build: Package',           settingsPath:'options.compiler.steps',    builderFields:['product_name','version','publisher','icon_path','output_format']},
  'compiler.step.test':     {status:'active', prefix:'compiler',     label:'Build: Test',              settingsPath:'options.compiler.steps',    builderFields:['test_script','test_timeout','fail_on_error']},
  'compiler.step.deploy':   {status:'active', prefix:'compiler',     label:'Build: Deploy',            settingsPath:'options.compiler.steps',    builderFields:['deploy_target','deploy_key','deploy_path','deploy_command']},
  'compiler.target.win.nsis':    {status:'active',  prefix:'compiler',label:'Target: Windows NSIS',   settingsPath:'options.compiler.targets',  builderFields:['installer_name','one_click','allow_elevation']},
  'compiler.target.win.portable':{status:'active',  prefix:'compiler',label:'Target: Win Portable',   settingsPath:'options.compiler.targets',  builderFields:['output_dir']},
  'compiler.target.mac.dmg':     {status:'active',  prefix:'compiler',label:'Target: macOS DMG',      settingsPath:'options.compiler.targets',  builderFields:['bundle_id','entitlements','hardened_runtime']},
  'compiler.target.linux.appimage':{status:'active', prefix:'compiler',label:'Target: Linux AppImage',settingsPath:'options.compiler.targets',  builderFields:['category','desktop_name','icon']},
  'compiler.target.android.apk': {status:'planned', prefix:'compiler',label:'Target: Android APK',   settingsPath:'options.compiler.targets',  builderFields:['sdk_path','keystore_path']},
  'compiler.target.ios.ipa':     {status:'planned', prefix:'compiler',label:'Target: iOS IPA',        settingsPath:'options.compiler.targets',  builderFields:[]},
  'compiler.target.web.static':  {status:'planned', prefix:'compiler',label:'Target: Web Static',     settingsPath:'options.compiler.targets',  builderFields:[]},
  'compiler.target.wasm':        {status:'planned', prefix:'compiler',label:'Target: WASM',           settingsPath:'options.compiler.targets',  builderFields:[]},
  'filebrowser.navigate':   {status:'planned', prefix:'filebrowser',  label:'File Browser: Navigate',  settingsPath:'options.filebrowser',       builderFields:['fb_root_dir']},
  'filebrowser.edit':       {status:'planned', prefix:'filebrowser',  label:'File Browser: Edit',      settingsPath:'options.filebrowser',       builderFields:['fb_file_path']},
  'filebrowser.revision':   {status:'planned', prefix:'filebrowser',  label:'File Browser: Revision',  settingsPath:'options.filebrowser',       builderFields:[]},
  'filebrowser.diff':       {status:'planned', prefix:'filebrowser',  label:'File Browser: Diff',      settingsPath:'options.filebrowser',       builderFields:[]},
  'filebrowser.snapshot':   {status:'planned', prefix:'filebrowser',  label:'File Browser: Snapshot',  settingsPath:'options.filebrowser',       builderFields:[]},
  'filebrowser.ssh.push':   {status:'planned', prefix:'filebrowser',  label:'File Browser: SSH Push',  settingsPath:'options.bridge.ssh',        builderFields:[]},
  'filebrowser.git.commit': {status:'planned', prefix:'filebrowser',  label:'File Browser: Git Commit',settingsPath:'options.bridge.git',        builderFields:[]},
  'diag.indicators':        {status:'active',  prefix:'diag',         label:'Diagnostics: Indicators', settingsPath:'options.diagnostics',       builderFields:[]},
  'diag.health.score':      {status:'active',  prefix:'diag',         label:'Diagnostics: Health Score',settingsPath:'options.diagnostics',      builderFields:[]},
  'diag.test.all':          {status:'active',  prefix:'diag',         label:'Diagnostics: Test All',   settingsPath:'options.diagnostics',       builderFields:[]},
  'diag.export.uuids':      {status:'active',  prefix:'diag',         label:'Diagnostics: Export UUIDs',settingsPath:'options.diagnostics',      builderFields:[]},
  'pipeline.run':           {status:'planned', prefix:'pipeline',     label:'Pipeline: Run',           settingsPath:'options.pipeline',          builderFields:['pipeline_id']},
  'pipeline.node.ai':       {status:'planned', prefix:'pipeline',     label:'Pipeline: AI Node',       settingsPath:'options.pipeline',          builderFields:['pipeline_ai_intent']},
  'pipeline.node.compiler': {status:'planned', prefix:'pipeline',     label:'Pipeline: Compiler Node', settingsPath:'options.pipeline',          builderFields:[]},
  'pipeline.node.file':     {status:'planned', prefix:'pipeline',     label:'Pipeline: File Node',     settingsPath:'options.pipeline',          builderFields:[]},
  'pipeline.node.ssh':      {status:'planned', prefix:'pipeline',     label:'Pipeline: SSH Node',      settingsPath:'options.pipeline',          builderFields:[]},
  'pipeline.node.condition':{status:'planned', prefix:'pipeline',     label:'Pipeline: Condition',     settingsPath:'options.pipeline',          builderFields:[]},
  'console.chat':           {status:'active',  prefix:'console',      label:'Console: Chat',           settingsPath:'options.console',           builderFields:[]},
  'console.history':        {status:'active',  prefix:'console',      label:'Console: History',        settingsPath:'options.console',           builderFields:[]},
  'workspace.datadir':      {status:'active',  prefix:'workspace',    label:'Data Directory',          settingsPath:'options.workspace',         builderFields:['data_dir']},
  'workspace.mode':         {status:'active',  prefix:'workspace',    label:'Workspace Mode',          settingsPath:'options.workspace',         builderFields:[]},
  'workspace.roadmap':      {status:'active',  prefix:'workspace',    label:'Roadmap',                 settingsPath:'options.workspace',         builderFields:[]},
  'appearance.accent':      {status:'active',  prefix:'appearance',   label:'Accent Color',            settingsPath:'options.appearance',        builderFields:[]},
  'appearance.particles':   {status:'active',  prefix:'appearance',   label:'Particle System',         settingsPath:'options.appearance',        builderFields:[]},
  'appearance.theme':       {status:'active',  prefix:'appearance',   label:'Theme Preset',            settingsPath:'options.appearance',        builderFields:[]},
  'appearance.font':        {status:'active',  prefix:'appearance',   label:'Font',                    settingsPath:'options.appearance',        builderFields:[]},
  'appearance.rgb':         {status:'active',  prefix:'appearance',   label:'RGB Mode',                settingsPath:'options.appearance',        builderFields:[]},
  'ext.connection':         {status:'active',  prefix:'ext',          label:'Extension: Connection',   settingsPath:'options.bridge.extension',  builderFields:['ext_browser','ext_bridge_url']},
  'ext.profile':            {status:'active',  prefix:'ext',          label:'Extension: Profile Push', settingsPath:'options.bridge.extension',  builderFields:['ext_profile_path']},
  'ext.playwright':         {status:'active',  prefix:'ext',          label:'Extension: Guardian',   settingsPath:'options.bridge.playwright', builderFields:[]},
  'ext.permissions':        {status:'active',  prefix:'ext',          label:'Extension: Permissions',  settingsPath:'options.bridge.extension',  builderFields:[]},
  'orch.gate':              {status:'planned', prefix:'orch',          label:'Orchestrator: Gate',      settingsPath:'options.orchestrator',      builderFields:['gate_id','gate_intent']},
  'orch.queue':             {status:'planned', prefix:'orch',          label:'Orchestrator: Queue',     settingsPath:'options.orchestrator',      builderFields:[]},
  'orch.sn.filter':         {status:'planned', prefix:'orch',          label:'S/N Filter',              settingsPath:'options.orchestrator',      builderFields:[]},
  'agent.start':            {status:'planned', prefix:'agent',         label:'Agent: Start',            settingsPath:'options.orchestrator',      builderFields:['agent_name','agent_gate','agent_engine']},
  'agent.stop':             {status:'planned', prefix:'agent',         label:'Agent: Stop',             settingsPath:'options.orchestrator',      builderFields:[]},
  'agent.gate.pass':        {status:'planned', prefix:'agent',         label:'Agent: Gate Pass',        settingsPath:'options.orchestrator',      builderFields:[]},
  'agent.gate.fail':        {status:'planned', prefix:'agent',         label:'Agent: Gate Fail',        settingsPath:'options.orchestrator',      builderFields:[]},
  'crypt.encrypt':          {status:'planned', prefix:'crypt',         label:'Crypt: Encrypt',          settingsPath:'options.crypt',             builderFields:[]},
  'crypt.license':          {status:'planned', prefix:'crypt',         label:'Crypt: License',          settingsPath:'options.crypt',             builderFields:[]},
  'crypt.antipiracy':       {status:'planned', prefix:'crypt',         label:'Crypt: Anti-Piracy',      settingsPath:'options.crypt',             builderFields:[]},
  'crypt.killswitch':       {status:'planned', prefix:'crypt',         label:'Crypt: Kill Switch',      settingsPath:'options.crypt',             builderFields:[]},
  'scriptbuilder.intent':   {status:'planned', prefix:'scriptbuilder', label:'Script Builder: Intent',  settingsPath:'options.scriptbuilder',     builderFields:['sb_intent','sb_platform']},
  'scriptbuilder.build':    {status:'planned', prefix:'scriptbuilder', label:'Script Builder: Build',   settingsPath:'options.scriptbuilder',     builderFields:[]},
  'testenv.apache':         {status:'planned', prefix:'testenv',       label:'Test Env: Apache',        settingsPath:'options.testenv',           builderFields:['te_port','te_docroot']},
  'testenv.mysql':          {status:'planned', prefix:'testenv',       label:'Test Env: MySQL',         settingsPath:'options.testenv',           builderFields:['te_db_name','te_db_user']},
  'testenv.wordpress':      {status:'planned', prefix:'testenv',       label:'Test Env: WordPress',     settingsPath:'options.testenv',           builderFields:[]},

  // ── GUARDIAN v3 hooks (all active) ───────────────────────────────────────
  'guardian.bridge_url':        {status:'active', prefix:'guardian', label:'Guardian: Bridge URL',          settingsPath:'options.bridge.guardian',   builderFields:['bridge_url']},
  'guardian.pulse_interval':    {status:'active', prefix:'guardian', label:'Guardian: Pulse Interval',      settingsPath:'options.bridge.guardian',   builderFields:['pulse_ms']},
  'guardian.token_ttl':         {status:'active', prefix:'guardian', label:'Guardian: Token TTL',           settingsPath:'options.bridge.guardian',   builderFields:['token_ttl_ms']},
  'guardian.instance_id':       {status:'active', prefix:'guardian', label:'Guardian: Instance ID',         settingsPath:'options.bridge.guardian',   builderFields:[]},
  'guardian.session_token':     {status:'active', prefix:'guardian', label:'Guardian: Session Token',       settingsPath:'options.bridge.guardian',   builderFields:[]},
  'guardian.connected':         {status:'active', prefix:'guardian', label:'Guardian: Connection State',    settingsPath:'options.bridge.guardian',   builderFields:[]},
  'guardian.callto_store':      {status:'active', prefix:'guardian', label:'Guardian: Callto Store',        settingsPath:'options.bridge.guardian',   builderFields:[]},
  'guardian.agent.chatgpt':     {status:'active', prefix:'guardian', label:'Guardian: ChatGPT Hook',        settingsPath:'options.bridge.guardian',   builderFields:['callto_id','intent']},
  'guardian.agent.claude':      {status:'active', prefix:'guardian', label:'Guardian: Claude Hook',         settingsPath:'options.bridge.guardian',   builderFields:['callto_id','intent']},
  'guardian.agent.ollama':      {status:'active', prefix:'guardian', label:'Guardian: Ollama Hook',         settingsPath:'options.bridge.guardian',   builderFields:['callto_id','intent']},
  'guardian.agent.deepseek':    {status:'active', prefix:'guardian', label:'Guardian: DeepSeek Hook',       settingsPath:'options.bridge.guardian',   builderFields:['callto_id','intent']},
  'guardian.agent.gemini':      {status:'active', prefix:'guardian', label:'Guardian: Gemini Hook',         settingsPath:'options.bridge.guardian',   builderFields:['callto_id','intent']},
  'guardian.agent.grok':        {status:'active', prefix:'guardian', label:'Guardian: Grok Hook',           settingsPath:'options.bridge.guardian',   builderFields:['callto_id','intent']},
  'guardian.agent.mistral':     {status:'active', prefix:'guardian', label:'Guardian: Mistral Hook',        settingsPath:'options.bridge.guardian',   builderFields:['callto_id','intent']},
  'guardian.diag.last_run':     {status:'active', prefix:'guardian', label:'Guardian: Last Diag Run',       settingsPath:'options.bridge.guardian',   builderFields:[]},
  'guardian.diag.jitter':       {status:'active', prefix:'guardian', label:'Guardian: RTT Jitter',          settingsPath:'options.bridge.guardian',   builderFields:[]},
  'guardian.diag.fidelity':     {status:'active', prefix:'guardian', label:'Guardian: Echo Fidelity',       settingsPath:'options.bridge.guardian',   builderFields:[]},

  // ── CONSOLE hooks ─────────────────────────────────────────────────────────
  'console.provider':           {status:'active', prefix:'console',  label:'Console: AI Provider',          settingsPath:'options.console',           builderFields:['provider']},
  'console.temperature':        {status:'active', prefix:'console',  label:'Console: Temperature',          settingsPath:'options.console',           builderFields:['temperature']},
  'console.max_tokens':         {status:'active', prefix:'console',  label:'Console: Max Tokens',           settingsPath:'options.console',           builderFields:['max_tokens']},
  'console.depth':              {status:'active', prefix:'console',  label:'Console: Depth Mode',           settingsPath:'options.console',           builderFields:['depth']},
  'console.pipe_enabled':       {status:'active', prefix:'console',  label:'Console: Chat Pipe Enabled',    settingsPath:'options.console',           builderFields:[]},
  'console.pipe_url':           {status:'active', prefix:'console',  label:'Console: Chat Pipe URL',        settingsPath:'options.console',           builderFields:['pipe_url']},
  'console.system_prompt':      {status:'active', prefix:'console',  label:'Console: System Prompt',        settingsPath:'options.console',           builderFields:['system_prompt']},
  'console.export_format':      {status:'active', prefix:'console',  label:'Console: Export Format',        settingsPath:'options.console',           builderFields:['export_format']},
  'console.history_max':        {status:'active', prefix:'console',  label:'Console: History Max',          settingsPath:'options.console',           builderFields:['history_max']},

  // ── BRIDGE config hooks ────────────────────────────────────────────────────
  'bridge.port':                {status:'active', prefix:'bridge',   label:'Bridge: Port',                  settingsPath:'options.bridge',            builderFields:['bridge_port']},
  'bridge.api_key':             {status:'active', prefix:'bridge',   label:'Bridge: API Key',               settingsPath:'options.bridge',            builderFields:[]},
  'bridge.cors_origin':         {status:'active', prefix:'bridge',   label:'Bridge: CORS Origin',           settingsPath:'options.bridge',            builderFields:[]},
  'bridge.cli_enabled':         {status:'active', prefix:'bridge',   label:'Bridge: CLI Enabled',           settingsPath:'options.bridge',            builderFields:[]},
  'bridge.p2p_enabled':         {status:'active', prefix:'bridge',   label:'Bridge: P2P Enabled',           settingsPath:'options.bridge',            builderFields:[]},
  'bridge.delta_enabled':       {status:'active', prefix:'bridge',   label:'Bridge: Delta Sync',            settingsPath:'options.bridge',            builderFields:[]},
  'bridge.version':             {status:'active', prefix:'bridge',   label:'Bridge: Version',               settingsPath:'options.bridge',            builderFields:[]},
  'bridge.connected':           {status:'active', prefix:'bridge',   label:'Bridge: Connected State',       settingsPath:'options.bridge',            builderFields:[]},

  // ── NSM service hooks ──────────────────────────────────────────────────────
  'nsm.bridge.running':         {status:'active', prefix:'nsm',      label:'NSM: Bridge Service Running',   settingsPath:'options.bridge.service',    builderFields:[]},
  'nsm.bridge.pid':             {status:'active', prefix:'nsm',      label:'NSM: Bridge PID',               settingsPath:'options.bridge.service',    builderFields:[]},
  'nsm.bridge.restarts':        {status:'active', prefix:'nsm',      label:'NSM: Bridge Restart Count',     settingsPath:'options.bridge.service',    builderFields:[]},
  'nsm.testenv.running':        {status:'active', prefix:'nsm',      label:'NSM: TestEnv Running',          settingsPath:'options.bridge.service',    builderFields:[]},
  'nsm.ollama.running':         {status:'active', prefix:'nsm',      label:'NSM: Ollama Service Running',   settingsPath:'options.bridge.service',    builderFields:[]},
  'nsm.startup_enabled':        {status:'active', prefix:'nsm',      label:'NSM: Run at Startup',           settingsPath:'options.bridge.service',    builderFields:[]},

  // ── BUILDER options ────────────────────────────────────────────────────────
  'builder.stack':              {status:'active', prefix:'builder',  label:'Builder: Default Stack',        settingsPath:'options.builder',           builderFields:['stack_type']},
  'builder.ai_override':        {status:'active', prefix:'builder',  label:'Builder: AI Override',          settingsPath:'options.builder',           builderFields:['ai_provider']},
  'builder.github_token':       {status:'active', prefix:'builder',  label:'Builder: GitHub Token',         settingsPath:'options.builder.github',    builderFields:[]},
  'builder.github_repo':        {status:'active', prefix:'builder',  label:'Builder: GitHub Repo',          settingsPath:'options.builder.github',    builderFields:['repo']},
  'builder.github_branch':      {status:'active', prefix:'builder',  label:'Builder: GitHub Branch',        settingsPath:'options.builder.github',    builderFields:['branch']},
  'builder.gate.validate':      {status:'active', prefix:'builder',  label:'Builder: Gate — validate',      settingsPath:'options.builder.siso',      builderFields:[]},
  'builder.gate.prepare':       {status:'active', prefix:'builder',  label:'Builder: Gate — prepare',       settingsPath:'options.builder.siso',      builderFields:[]},
  'builder.gate.install':       {status:'active', prefix:'builder',  label:'Builder: Gate — install',       settingsPath:'options.builder.siso',      builderFields:[]},
  'builder.gate.execute':       {status:'active', prefix:'builder',  label:'Builder: Gate — execute',       settingsPath:'options.builder.siso',      builderFields:[]},
  'builder.gate.verify':        {status:'active', prefix:'builder',  label:'Builder: Gate — verify',        settingsPath:'options.builder.siso',      builderFields:[]},
  'builder.gate.output':        {status:'active', prefix:'builder',  label:'Builder: Gate — output',        settingsPath:'options.builder.siso',      builderFields:[]},

  // ── FORGE hooks ────────────────────────────────────────────────────────────
  'forge.active_file':          {status:'active', prefix:'forge',    label:'Forge: Active File',            settingsPath:'options.forge',             builderFields:['file_path']},
  'forge.mode':                 {status:'active', prefix:'forge',    label:'Forge: View Mode',              settingsPath:'options.forge',             builderFields:['mode']},
  'forge.auto_snapshot':        {status:'active', prefix:'forge',    label:'Forge: Auto Snapshot',          settingsPath:'options.forge',             builderFields:[]},
  'forge.deepscan_key':         {status:'active', prefix:'forge',    label:'Forge: DeepScan API Key',       settingsPath:'options.forge',             builderFields:[]},

  // ── TESTENV service hooks ──────────────────────────────────────────────────
  'testenv.apache.running':     {status:'active', prefix:'testenv',  label:'TestEnv: Apache Running',       settingsPath:'options.testenv',           builderFields:[]},
  'testenv.mysql.running':      {status:'active', prefix:'testenv',  label:'TestEnv: MySQL Running',        settingsPath:'options.testenv',           builderFields:[]},
  'testenv.php.version':        {status:'active', prefix:'testenv',  label:'TestEnv: PHP Version',          settingsPath:'options.testenv',           builderFields:['php_version']},
  'testenv.redis.running':      {status:'active', prefix:'testenv',  label:'TestEnv: Redis Running',        settingsPath:'options.testenv',           builderFields:[]},
  'testenv.node.port':          {status:'active', prefix:'testenv',  label:'TestEnv: Node Sandbox Port',    settingsPath:'options.testenv',           builderFields:['port']},
  'testenv.sandbox.docroot':    {status:'active', prefix:'testenv',  label:'TestEnv: PHP Sandbox Docroot',  settingsPath:'options.testenv',           builderFields:['docroot']},
  'testenv.auto_start':         {status:'active', prefix:'testenv',  label:'TestEnv: Auto Start Services',  settingsPath:'options.testenv',           builderFields:[]},
};
window.NEXUS_HOOK_NAMESPACE=HOOK_NAMESPACE;

class HookRegistry{
  constructor({sessionId,bus}={}){
    this._hooks=new Map();this._modules=new Map();
    this._session=sessionId||_uuid();this._bus=bus||null;
    this._dirty=false;this._flushTimer=null;this._persistedUuids={};
  }
  register(featureId,moduleId,module,uuid){
    const spec=HOOK_NAMESPACE[featureId];
    if(!spec)throw new Error(`Unknown featureId: "${featureId}"`);
    const instanceUuid=uuid||_uuid();
    const hashSuffix=instanceUuid.replace(/-/g,'').slice(-5);
    const hookId=`${featureId}:${instanceUuid}:${hashSuffix}`;
    const entry={hookId,featureId,instanceUuid,hashSuffix,moduleId,label:spec.label,prefix:spec.prefix,status:spec.status,settingsPath:spec.settingsPath,builderFields:spec.builderFields,registeredAt:new Date().toISOString(),sessionId:this._session,lastTested:null,lastResult:null,failCount:0,module};
    this._hooks.set(hookId,entry);
    if(!this._modules.has(moduleId))this._modules.set(moduleId,{hookIds:[],module});
    this._modules.get(moduleId).hookIds.push(hookId);
    this._markDirty();
    this._bus?.emit('nexus:hook:registered',{sourceHookId:hookId,payload:{hookId,featureId,moduleId}});
    return hookId;
  }
  deregister(hookId){
    const e=this._hooks.get(hookId);if(!e)return false;
    this._hooks.delete(hookId);
    const m=this._modules.get(e.moduleId);
    if(m){m.hookIds=m.hookIds.filter(id=>id!==hookId);if(!m.hookIds.length)this._modules.delete(e.moduleId);}
    this._markDirty();
    this._bus?.emit('nexus:hook:deregistered',{payload:{hookId,featureId:e.featureId}});
    return true;
  }
  get(hookId){return this._hooks.get(hookId)||null;}
  getByFeature(fid){return[...this._hooks.values()].filter(e=>e.featureId===fid);}
  getByModule(mid){return(this._modules.get(mid)?.hookIds||[]).map(id=>this._hooks.get(id)).filter(Boolean);}
  getByPrefix(p){return[...this._hooks.values()].filter(e=>e.prefix===p);}
  all(){return[...this._hooks.values()];}
  async test(hookId){
    const entry=this._hooks.get(hookId);
    if(!entry)return{ok:false,message:`Hook not found: ${hookId}`};
    this._bus?.emit('nexus:hook:test:run',{sourceHookId:'diag.test.all',targetHookId:hookId,payload:{hookId,featureId:entry.featureId}});
    let result;
    try{result=typeof entry.module?.test==='function'?await entry.module.test(hookId):{ok:true,message:'No test function (passive hook)'};}
    catch(err){result={ok:false,message:err.message,detail:err.stack};}
    entry.lastTested=new Date().toISOString();entry.lastResult=result;
    if(!result.ok)entry.failCount=(entry.failCount||0)+1;
    this._markDirty();
    this._bus?.emit('nexus:hook:test:result',{sourceHookId:hookId,payload:{hookId,featureId:entry.featureId,result}});
    if(!result.ok){
      this._bus?.emit('nexus:toast',{sourceHookId:hookId,payload:{level:'error',hookId,code:'HOOK_TEST_FAIL',title:`Test failed: ${entry.label}`,message:result.message,ts:new Date().toISOString(),actions:['Retry','Details','Settings'],detail:result.detail||null,settingsPath:entry.settingsPath}});
    }
    return result;
  }
  async testAll(){const results=[];for(const[id]of this._hooks){results.push({hookId:id,...await this.test(id)});}return results;}
  getSettings(hookId){const e=this._hooks.get(hookId);if(!e)return null;return e.module?.getSettings?.(hookId)||e.settingsPath;}
  getBuilderFields(hookId){const e=this._hooks.get(hookId);if(!e)return[];return e.module?.getBuilderFields?.(hookId)||e.builderFields||[];}
  healthScore(){
    const hooks=this.all();const active=hooks.filter(h=>h.status==='active');
    const tested=active.filter(h=>h.lastTested!==null);const passing=tested.filter(h=>h.lastResult?.ok===true);
    return{total:hooks.length,active:active.length,planned:hooks.filter(h=>h.status==='planned').length,tested:tested.length,passing:passing.length,failing:tested.filter(h=>h.lastResult?.ok===false).length,untested:active.length-tested.length,score:active.length>0?Math.round(passing.length/active.length*100):0};
  }
  exportNamespace(){
    return Object.entries(HOOK_NAMESPACE).map(([featureId,spec])=>({featureId,...spec,registered:[...this._hooks.values()].filter(e=>e.featureId===featureId).map(e=>e.hookId)}));
  }
  exportJSON(){
    const hooks={};
    for(const[hookId,e]of this._hooks){hooks[hookId]={hookId:e.hookId,featureId:e.featureId,instanceUuid:e.instanceUuid,hashSuffix:e.hashSuffix,moduleId:e.moduleId,label:e.label,prefix:e.prefix,status:e.status,settingsPath:e.settingsPath,builderFields:e.builderFields,registeredAt:e.registeredAt,sessionId:e.sessionId,lastTested:e.lastTested,lastResult:e.lastResult,failCount:e.failCount};}
    return JSON.stringify({version:'0.1.0',sessionId:this._session,savedAt:new Date().toISOString(),hookCount:this._hooks.size,health:this.healthScore(),hooks},null,2);
  }
  exportCSV(){
    const rows=[['hookId','featureId','moduleId','label','prefix','status','settingsPath','lastTested','lastResult','failCount']];
    for(const e of this._hooks.values())rows.push([e.hookId,e.featureId,e.moduleId,e.label,e.prefix,e.status,e.settingsPath,e.lastTested||'',e.lastResult?(e.lastResult.ok?'pass':'fail'):'',e.failCount]);
    return rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  }
  getPersistedUuid(fid){return this._persistedUuids[fid]||null;}
  _markDirty(){this._dirty=true;if(!this._flushTimer)this._flushTimer=setTimeout(()=>this._flush(),800);}
  _flush(){
    this._flushTimer=null;if(!this._dirty)return;this._dirty=false;
    // Persist to localStorage (browser) since no fs in renderer
    try{localStorage.setItem('nexus_hook_registry',this.exportJSON());}catch{}
  }
  load(){
    try{const raw=localStorage.getItem('nexus_hook_registry');if(!raw)return this;const data=JSON.parse(raw);for(const[,e]of Object.entries(data.hooks||{})){this._persistedUuids[e.featureId]=e.instanceUuid;}
    }catch{}return this;
  }
}
window.NexusHookRegistry=HookRegistry;

/* ── Module base ───────────────────────────────────────────────────────────── */
class NexusModule{
  constructor({id,hookPrefix,featureIds=[]}){
    if(!id)throw new Error('NexusModule: id required');
    this.id=id;this.hookPrefix=hookPrefix;this.featureIds=featureIds;
    this._bus=null;this._registry=null;this._hookIds=[];this._ready=false;this._ctx=null;
  }
  async init(context){
    this._ctx=context;this._bus=context.bus;this._registry=context.registry;
    for(const fid of this.featureIds){
      const uuid=context.registry?.getPersistedUuid?.(fid);
      const hid=context.registry?.register(fid,this.id,this,uuid);
      if(hid)this._hookIds.push(hid);
    }
    let result;
    try{result=await this._onInit(context);}
    catch(err){
      this._emitToast({level:'error',code:'MODULE_INIT_FAIL',title:`Module init failed: ${this.id}`,message:err.message,detail:err.stack});
      this._bus?.emit('nexus:module:error',{sourceHookId:this._hookIds[0]||null,payload:{moduleId:this.id,error:err.message}});
      return{ok:false,hookIds:this._hookIds,error:err.message};
    }
    this._ready=true;
    this._bus?.emit('nexus:module:ready',{sourceHookId:this._hookIds[0]||null,payload:{moduleId:this.id,hookIds:this._hookIds}});
    return{ok:true,hookIds:this._hookIds,...(result||{})};
  }
  async destroy(){
    try{await this._onDestroy();}catch{}
    for(const hid of this._hookIds)this._registry?.deregister(hid);
    this._hookIds=[];this._ready=false;
  }
  async test(hookId){if(!this._ready)return{ok:false,message:`${this.id} not initialized`};try{return await this._onTest(hookId);}catch(e){return{ok:false,message:e.message,detail:e.stack};}}
  getSettings(hookId){return this._getSettingsPath(hookId)||`options.${this.hookPrefix}`;}
  getBuilderFields(hookId){return this._getBuilderFields(hookId)||[];}
  _emitToast({level='error',code,title,message,detail,actions,hookId}){
    const hId=hookId||this._hookIds[0]||null;
    this._bus?.emit('nexus:toast',{sourceHookId:hId,payload:{level,hookId:hId,code:code||'NEXUS_ERROR',title:title||`Error in ${this.id}`,message,ts:new Date().toISOString(),actions:actions||['Retry','Details','Dismiss'],detail:detail||null}});
  }
  _emit(type,payload={},targetHookId=null){return this._bus?.emit(type,{sourceHookId:this._hookIds[0]||null,targetHookId,payload});}
  async _onInit(ctx){return{ok:true};}
  async _onDestroy(){}
  async _onTest(hookId){return{ok:true,message:`${this.id} alive`};}
  _getSettingsPath(hookId){return null;}
  _getBuilderFields(hookId){return[];}
  get ready(){return this._ready;}
  get hookIds(){return[...this._hookIds];}
}
window.NexusModule=NexusModule;

/* ── Toast system ──────────────────────────────────────────────────────────── */
const TOAST_LEVELS={success:{icon:'✓',color:'#00ff88',duration:4000},info:{icon:'ℹ',color:'#0088ff',duration:5000},warn:{icon:'⚠',color:'#ffaa00',duration:7000},error:{icon:'✕',color:'#ff3333',duration:0}};
class ToastSystem{
  constructor({bus,registry}={}){
    this._bus=bus;this._registry=registry;this._toasts=new Map();this._container=null;
    this._mount();this._listen();
  }
  _listen(){
    if(!this._bus)return;
    this._bus.on('nexus:toast',e=>{const p=e.payload||{};this.show({level:p.level||'info',hookId:p.hookId,code:p.code,title:p.title||'NEXUS',message:p.message||'',ts:p.ts,actions:p.actions,detail:p.detail,settingsPath:p.settingsPath});});
  }
  _mount(){
    if(document.getElementById('nexus-toast-root'))return;
    this._container=document.createElement('div');
    this._container.id='nexus-toast-root';
    Object.assign(this._container.style,{position:'fixed',bottom:'20px',right:'20px',zIndex:'99999',display:'flex',flexDirection:'column-reverse',gap:'8px',maxWidth:'400px',width:'100%',fontFamily:"'DM Mono',monospace",pointerEvents:'none'});
    document.body.appendChild(this._container);
    if(!document.getElementById('nxt-style')){
      const s=document.createElement('style');s.id='nxt-style';
      s.textContent=`.nxt{background:#0e1628;border:1px solid #1a2a40;border-left:3px solid var(--nxt-c,#0088ff);border-radius:3px;padding:9px 11px;pointer-events:all;animation:nxt-in .18s ease forwards;max-width:400px;box-shadow:0 4px 20px rgba(0,0,0,.7);overflow:hidden;}.nxt.out{animation:nxt-out .18s ease forwards;}@keyframes nxt-in{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}@keyframes nxt-out{from{opacity:1}to{opacity:0;transform:translateX(16px)}}.nxt-h{display:flex;align-items:center;gap:7px;margin-bottom:3px;}.nxt-icon{font-size:12px;flex-shrink:0;width:14px;text-align:center;color:var(--nxt-c)}.nxt-title{flex:1;font-weight:700;font-size:11px;color:#b8cfe0;letter-spacing:.04em}.nxt-close{background:none;border:none;color:#2e4a60;cursor:pointer;font-size:13px;padding:0 2px;line-height:1}.nxt-close:hover{color:#b8cfe0}.nxt-msg{font-size:10px;color:#5a7a96;margin-left:21px;line-height:1.4}.nxt-hook{font-size:9px;color:#1a2e42;margin-left:21px;margin-top:1px}.nxt-code{font-size:9px;color:#1a2e42;margin-left:auto}.nxt-btns{display:flex;gap:5px;margin-top:7px;margin-left:21px}.nxt-btn{background:transparent;border:1px solid #1a2a40;border-radius:2px;color:#2e4a60;font-family:inherit;font-size:9px;font-weight:700;padding:2px 8px;cursor:pointer;letter-spacing:.05em;transition:color .1s,border-color .1s}.nxt-btn:hover{color:#b8cfe0;border-color:#2e4a60}.nxt-btn.p{border-color:var(--nxt-c);color:var(--nxt-c)}.nxt-detail{display:none;margin:7px 0 0 21px;background:#05080f;border:1px solid #1a2a40;border-radius:2px;padding:6px;font-size:9px;color:#2e4a60;max-height:100px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;line-height:1.4}.nxt-detail.v{display:block}`;
      document.head.appendChild(s);
    }
  }
  show({level='info',hookId,code,title,message,ts,actions=['Dismiss'],detail,settingsPath}){
    const id='nxt-'+Math.random().toString(36).slice(2,8);
    const spec=TOAST_LEVELS[level]||TOAST_LEVELS.info;
    const c=spec.color;
    // Console output always
    if(level==='error')console.error(`[NEXUS ${code||'ERR'}] ${title}: ${message}`,detail||'');
    else if(level==='warn')console.warn(`[NEXUS ${code||'WARN'}] ${title}: ${message}`);
    else console.log(`[NEXUS ${code||'INFO'}] ${title}: ${message}`);
    if(!this._container)return id;
    const el=document.createElement('div');
    el.className='nxt';el.dataset.id=id;el.style.setProperty('--nxt-c',c);
    const detailStr=[detail?`Error: ${detail}`:null,hookId?`Hook: ${hookId}`:null].filter(Boolean).join('\n');
    el.innerHTML=`<div class="nxt-h"><span class="nxt-icon">${_esc(spec.icon)}</span><span class="nxt-title">${_esc(title)}</span><span class="nxt-code">${_esc(code||'')}</span><button class="nxt-close" data-d="${id}">×</button></div><div class="nxt-msg">${_esc(message)}</div>${hookId?`<div class="nxt-hook">${_esc(hookId.slice(0,48)+(hookId.length>48?'…':''))}</div>`:''}<div class="nxt-btns">${actions.map((a,i)=>`<button class="nxt-btn${i===0&&level!=='error'?' p':''}" data-a="${_esc(a)}" data-id="${id}">${_esc(a)}</button>`).join('')}</div>${detailStr?`<div class="nxt-detail" id="nxt-d-${id}">${_esc(detailStr)}</div>`:''}`;
    el.querySelector(`[data-d="${id}"]`)?.addEventListener('click',()=>this._dismiss(id));
    el.querySelectorAll('[data-a]').forEach(btn=>btn.addEventListener('click',()=>this._action(btn.dataset.a,id,{hookId,settingsPath})));
    this._container.appendChild(el);
    this._toasts.set(id,{el,level});
    if(spec.duration>0)setTimeout(()=>this._dismiss(id),spec.duration);
    return id;
  }
  _action(action,id,{hookId,settingsPath}={}){
    switch(action.toLowerCase()){
      case'dismiss':this._dismiss(id);break;
      case'retry':this._dismiss(id);if(hookId)NEXUS.testHook(hookId).catch(()=>{});break;
      case'details':document.getElementById(`nxt-d-${id}`)?.classList.toggle('v');break;
      case'settings':this._dismiss(id);if(settingsPath)NEXUS.bus?.emit('nexus:navigate:settings',{payload:{path:settingsPath}});break;
    }
  }
  _dismiss(id){
    const t=this._toasts.get(id);if(!t)return;
    t.el.classList.add('out');setTimeout(()=>{t.el.remove();this._toasts.delete(id);},200);
  }
  dismiss(id){this._dismiss(id);}
  dismissAll(){for(const id of this._toasts.keys())this._dismiss(id);}
}
window.NexusToastSystem=ToastSystem;

/* ── Diagnostics Indicators panel ──────────────────────────────────────────── */
class DiagnosticsModule extends NexusModule{
  constructor(){super({id:'diagnostics',hookPrefix:'diag',featureIds:['diag.indicators','diag.health.score','diag.test.all','diag.export.uuids']});this._panel=null;this._filter={prefix:'all',status:'all',search:''};this._running=new Set();}
  async _onInit(ctx){
    ctx.bus.on('nexus:hook:test:result',e=>{this._running.delete(e.payload?.hookId);this._schedRender();});
    ctx.bus.on('nexus:hook:test:run',e=>{this._running.add(e.payload?.hookId||'');this._schedRender();});
    ctx.bus.on('nexus:hook:registered',()=>this._schedRender());
    return{ok:true};
  }
  async _onTest(hookId){const h=this._registry?.healthScore();return{ok:true,message:`Diagnostics: ${h?.passing??0}/${h?.active??0} hooks passing (${h?.score??0}%)`,detail:h};}
  _getSettingsPath(){return'options.diagnostics';}
  mount(el){this._panel=el;this._render();}
  _schedRender(){clearTimeout(this._rt);this._rt=setTimeout(()=>this._render(),80);}
  _render(){
    if(!this._panel)return;
    const reg=this._registry;const ns=reg?reg.exportNamespace():[];const all=reg?reg.all():[];
    const h=reg?reg.healthScore():{score:0,active:0,passing:0,failing:0,planned:0,untested:0};
    const {prefix:pf,status:sf,search:sq}=this._filter;
    // Build rows: registered first, then planned-only from namespace
    const rows=ns.map(spec=>{
      const registered=all.filter(x=>x.featureId===spec.featureId);
      if(registered.length)return registered.map(x=>({...x,fromReg:true}));
      return[{featureId:spec.featureId,label:spec.label,prefix:spec.prefix,status:spec.status,fromReg:false,hookId:null,lastTested:null,lastResult:null,failCount:0,settingsPath:spec.settingsPath}];
    }).flat().filter(r=>{
      if(pf!=='all'&&r.prefix!==pf)return false;
      if(sf==='active'&&r.status!=='active')return false;
      if(sf==='planned'&&r.status!=='planned')return false;
      if(sf==='fail'&&r.lastResult?.ok!==false)return false;
      if(sf==='pass'&&r.lastResult?.ok!==true)return false;
      if(sq&&!r.label?.toLowerCase().includes(sq)&&!r.featureId?.toLowerCase().includes(sq))return false;
      return true;
    });
    const sections={};for(const r of rows){if(!sections[r.prefix])sections[r.prefix]=[];sections[r.prefix].push(r);}
    const prefixes=[...new Set(ns.map(s=>s.prefix))];
    const scoreColor=h.score>=80?'#00ff88':h.score>=50?'#ffcc00':'#ff2d55';
    this._panel.innerHTML=`<div style="font-family:'DM Mono',monospace;font-size:12px;color:#b8cfe0;display:flex;flex-direction:column;height:100%;overflow:hidden;background:#05080f;">
    <div style="flex-shrink:0;padding:10px 16px 8px;background:#080d17;border-bottom:1px solid #1a2a40;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <span style="font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:.2em;color:#00d4ff">INDICATORS</span>
      <span style="font-size:10px;color:#5a7a96">Health: <span style="font-weight:700;color:${scoreColor}">${h.score}%</span> · ${h.passing}/${h.active} passing${h.failing?` · <span style="color:#ff2d55">${h.failing} failing</span>`:''} · ${h.planned} planned</span>
      <div style="margin-left:auto;display:flex;gap:6px;align-items:center;">
        <button id="nx-diag-test-all-btn" style="background:none;border:1px solid #1a3a5a;border-radius:2px;color:#00d4ff;font-family:'Bebas Neue',sans-serif;font-size:10px;letter-spacing:.13em;padding:3px 10px;cursor:pointer;">▶ TEST ALL</button>
        <button id="nx-diag-export-json" style="background:none;border:1px solid #1a2a40;border-radius:2px;color:#5a7a96;font-family:'DM Mono',monospace;font-size:9px;padding:3px 8px;cursor:pointer;">↓ JSON</button>
        <button id="nx-diag-export-csv" style="background:none;border:1px solid #1a2a40;border-radius:2px;color:#5a7a96;font-family:'DM Mono',monospace;font-size:9px;padding:3px 8px;cursor:pointer;">↓ CSV</button>
      </div>
    </div>
    <div style="flex-shrink:0;padding:6px 16px;background:#080d17;border-bottom:1px solid #1a2a40;display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
      <input id="nx-diag-search" type="text" placeholder="Search hooks…" value="${_esc(sq)}" style="flex:1;min-width:120px;background:#0e1628;border:1px solid #1a2a40;border-radius:2px;color:#b8cfe0;font-family:'DM Mono',monospace;font-size:10px;padding:4px 7px;outline:none;">
      <select id="nx-diag-pf" style="background:#0e1628;border:1px solid #1a2a40;border-radius:2px;color:#5a7a96;font-family:'DM Mono',monospace;font-size:9px;padding:4px 5px;outline:none;"><option value="all">All modules</option>${prefixes.map(p=>`<option value="${p}"${p===pf?' selected':''}>${p}</option>`).join('')}</select>
      <select id="nx-diag-sf" style="background:#0e1628;border:1px solid #1a2a40;border-radius:2px;color:#5a7a96;font-family:'DM Mono',monospace;font-size:9px;padding:4px 5px;outline:none;"><option value="all"${sf==='all'?' selected':''}>All status</option><option value="active"${sf==='active'?' selected':''}>Active</option><option value="planned"${sf==='planned'?' selected':''}>Planned</option><option value="pass"${sf==='pass'?' selected':''}>Passing</option><option value="fail"${sf==='fail'?' selected':''}>Failing</option></select>
    </div>
    <div id="nx-diag-list" style="flex:1;overflow-y:auto;padding:6px 0;">${
      rows.length===0?'<div style="padding:24px;text-align:center;color:#1a2e42;font-size:11px;">No hooks match filter.</div>':
      Object.entries(sections).map(([prefix,items])=>
        `<div style="padding:5px 16px 2px;font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:#1a2e42;border-top:1px solid #0e1628;margin-top:2px;">${_esc(prefix)}</div>`+
        items.map(r=>{
          const running=this._running.has(r.hookId);
          const isPlanned=r.status==='planned';
          let dotC='#1a2e42';
          if(running)dotC='#ffcc00';
          else if(isPlanned)dotC='#1a2a40';
          else if(r.lastTested&&r.lastResult?.ok)dotC='#00ff88';
          else if(r.lastTested&&!r.lastResult?.ok)dotC='#ff2d55';
          const ago=r.lastTested?_ago(r.lastTested):'';
          const res=r.lastTested?(r.lastResult?.ok?'pass':'fail'):'';
          return`<div class="nx-hr" data-hid="${_esc(r.hookId||r.featureId)}" style="display:flex;align-items:center;gap:7px;padding:5px 16px;opacity:${isPlanned?.4:1};transition:background .1s;" onmouseenter="this.style.background='#080d17'" onmouseleave="this.style.background=''">`+
            `<div style="width:7px;height:7px;border-radius:50%;background:${dotC};flex-shrink:0;${running?'animation:pulse .6s step-end infinite':''}${dotC==='#00ff88'?';box-shadow:0 0 5px #00ff88':dotC==='#ff2d55'?';box-shadow:0 0 5px #ff2d55':''}"></div>`+
            `<div style="flex:1;min-width:0;"><div style="font-size:10px;font-weight:600;color:#7a9ab8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(r.label||r.featureId)}${isPlanned?'<span style="background:#0e1628;color:#1a3050;font-size:8px;padding:0 3px;border-radius:2px;margin-left:4px;">PLANNED</span>':''}${r.failCount?`<span style="background:rgba(255,45,85,.12);color:#ff2d55;font-size:8px;padding:0 3px;border-radius:2px;margin-left:3px;">×${r.failCount}</span>`:''}</div>`+
            `<div style="font-size:9px;color:#1a2e42;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(r.hookId?r.hookId.slice(0,50)+(r.hookId.length>50?'…':''):r.featureId)}</div></div>`+
            `<div style="font-size:9px;color:${res==='pass'?'#00ff88':res==='fail'?'#ff2d55':'#1a2e42'};flex-shrink:0;text-align:right;white-space:nowrap;">${res?res+' · '+ago:'—'}</div>`+
            `<div style="display:flex;gap:3px;flex-shrink:0;">`+
            `<button class="nx-test-btn" data-hid="${_esc(r.hookId||'')}" style="background:none;border:1px solid #1a2a40;border-radius:2px;color:#1a2e42;font-family:'DM Mono',monospace;font-size:9px;font-weight:700;padding:2px 6px;cursor:pointer;letter-spacing:.04em;transition:color .1s,border-color .1s;" ${!r.hookId||isPlanned||running?'disabled':''} onmouseenter="if(!this.disabled){this.style.color='#00ff88';this.style.borderColor='#00ff88';}" onmouseleave="this.style.color='#1a2e42';this.style.borderColor='#1a2a40';">TEST</button>`+
            `<button class="nx-gear-btn" data-sp="${_esc(r.settingsPath||'')}" style="background:none;border:1px solid #1a2a40;border-radius:2px;color:#1a2e42;font-family:'DM Mono',monospace;font-size:9px;padding:2px 5px;cursor:pointer;transition:color .1s,border-color .1s;" ${!r.settingsPath?'disabled':''} onmouseenter="if(!this.disabled){this.style.color='#00d4ff';this.style.borderColor='#00d4ff';}" onmouseleave="this.style.color='#1a2e42';this.style.borderColor='#1a2a40';">⚙</button>`+
            `</div></div>`;
        }).join('')
      ).join('')
    }</div></div>`;
    // Bind controls
    this._panel.querySelector('#nx-diag-search')?.addEventListener('input',e=>{this._filter.search=e.target.value.toLowerCase().trim();this._render();});
    this._panel.querySelector('#nx-diag-pf')?.addEventListener('change',e=>{this._filter.prefix=e.target.value;this._render();});
    this._panel.querySelector('#nx-diag-sf')?.addEventListener('change',e=>{this._filter.status=e.target.value;this._render();});
    this._panel.querySelector('#nx-diag-test-all-btn')?.addEventListener('click',async e=>{
      e.target.textContent='…TESTING';e.target.disabled=true;
      await NEXUS.testAll();
      e.target.textContent='▶ TEST ALL';e.target.disabled=false;this._render();
    });
    this._panel.querySelector('#nx-diag-export-json')?.addEventListener('click',()=>NEXUS.downloadUUIDs('json'));
    this._panel.querySelector('#nx-diag-export-csv')?.addEventListener('click',()=>NEXUS.downloadUUIDs('csv'));
    this._panel.querySelectorAll('.nx-test-btn').forEach(btn=>btn.addEventListener('click',async e=>{
      const hid=e.target.dataset.hid;if(!hid)return;
      e.target.disabled=true;this._running.add(hid);this._schedRender();
      await NEXUS.testHook(hid).catch(()=>{});
      this._running.delete(hid);e.target.disabled=false;this._schedRender();
    }));
    this._panel.querySelectorAll('.nx-gear-btn').forEach(btn=>btn.addEventListener('click',e=>{
      const sp=e.target.dataset.sp;if(!sp)return;
      NEXUS.bus?.emit('nexus:navigate:settings',{payload:{path:sp}});
      // Best-effort: navigate to options tab and sub-section
      if(typeof switchTab==='function')switchTab('options');
      const section=sp.split('.')[1];
      if(section&&typeof optSwitchTab==='function'){const btn=document.querySelector(`[onclick*="optSwitchTab('${section}'"]`);if(btn)optSwitchTab(section,btn);}
    }));
  }
}
window.NexusDiagnosticsModule=DiagnosticsModule;

/* ── NexusCore ──────────────────────────────────────────────────────────────── */
class NexusCore{
  constructor(){this._modules=new Map();this._bus=null;this._registry=null;this._toast=null;this._sessionId=null;this._ready=false;this._version='0.1.0';}
  async init({sessionId}={}){
    if(this._ready)return this;
    this._sessionId=sessionId||_uuid();
    this._bus=new EventBus({sessionId:this._sessionId});
    this._registry=new HookRegistry({sessionId:this._sessionId,bus:this._bus});
    this._registry.load();
    this._toast=new ToastSystem({bus:this._bus,registry:this._registry});
    const ctx={bus:this._bus,registry:this._registry,toast:this._toast,sessionId:this._sessionId};
    for(const[id,mod]of this._modules){
      try{const r=await mod.init(ctx);if(!r.ok)console.warn(`[NEXUS] Module init partial: ${id}`,r.error);}
      catch(e){console.error(`[NEXUS] Module init failed: ${id}`,e);this._toast.show({level:'error',code:'MODULE_INIT_FAIL',title:`Failed to init: ${id}`,message:e.message});}
    }
    this._registry._markDirty();this._ready=true;
    console.log(`%c[NEXUS v${this._version}] Ready — session: ${this._sessionId.slice(0,8)} — ${this._registry.all().length} hooks registered`,'color:#00d4ff;font-family:monospace');
    return this;
  }
  registerModule(mod){if(!mod?.id)throw new Error('Module needs id');this._modules.set(mod.id,mod);return this;}
  getModule(id){return this._modules.get(id)||null;}
  async testHook(hookId){return this._registry?.test(hookId)||{ok:false,message:'Not initialized'};}
  async testAll(){return this._registry?.testAll()||[];}
  getSettings(hookId){return this._registry?.getSettings(hookId)||null;}
  getBuilderFields(hookId){return this._registry?.getBuilderFields(hookId)||[];}
  healthScore(){return this._registry?.healthScore()||{score:0,total:0,active:0,passing:0,failing:0};}
  allHooks(){return this._registry?.all()||[];}
  hookNamespace(){return this._registry?.exportNamespace()||[];}
  exportUUIDs(fmt='json'){return fmt==='csv'?this._registry?.exportCSV():this._registry?.exportJSON();}
  downloadUUIDs(fmt='json'){
    const content=this.exportUUIDs(fmt);if(!content)return;
    const mime=fmt==='csv'?'text/csv':'application/json';
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:mime}));a.download=`nexus-hooks-${Date.now()}.${fmt}`;a.click();URL.revokeObjectURL(a.href);
  }
  toast(opts){return this._toast?.show(opts);}
  get bus(){return this._bus;}
  get registry(){return this._registry;}
  get session(){return this._sessionId;}
  get version(){return this._version;}
  get ready(){return this._ready;}
  on(type,handler,opts){return this._bus?.on(type,handler,opts);}
  emit(type,opts){return this._bus?.emit(type,opts);}
}
const NEXUS=new NexusCore();
window.NEXUS=NEXUS;

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function _uuid(){if(typeof crypto!=='undefined'&&crypto.randomUUID)return crypto.randomUUID();if(typeof crypto!=='undefined'&&crypto.getRandomValues)return([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:r&0x3|0x8).toString(16);});}
function _esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function _ago(iso){const d=Date.now()-new Date(iso).getTime();if(d<60000)return`${Math.round(d/1000)}s`;if(d<3600000)return`${Math.round(d/60000)}m`;return`${Math.round(d/3600000)}h`;}

/* ── Boot ───────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{},false);
window.addEventListener('load',async()=>{
  // Register core modules
  const diagMod=new DiagnosticsModule();
  NEXUS.registerModule(diagMod);

  // Init everything
  await NEXUS.init();

  // ── Mount Indicators into the existing diagnose panel ──────────────────────
  const diagContainer=document.getElementById('optsub-diagnose');
  if(diagContainer){
    // Replace the old static diagnose content with live Indicators
    // Preserve the header row (RUN ALL CHECKS button)
    const oldContent=diagContainer.querySelector('div[style*="flex:1"]')||diagContainer.children[1];
    if(oldContent){
      oldContent.style.cssText='flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0;';
      diagMod.mount(oldContent);
    }
  }

  // ── Wire UUID export in Log tab (UUID REGISTRY sub-tab) ───────────────────
  const uuidExportBtn=document.querySelector('#log-sub-uuids [onclick="uuidExport()"]');
  if(uuidExportBtn){
    uuidExportBtn.addEventListener('click',e=>{e.stopImmediatePropagation();NEXUS.downloadUUIDs('json');},true);
  }
  // Add hook registry export buttons next to existing UUID export btn
  const uuidBtnRow=document.querySelector('#log-sub-uuids [style*="margin-left:auto"]');
  if(uuidBtnRow){
    const jsonBtn=document.createElement('button');
    jsonBtn.className='btn';jsonBtn.style.cssText='font-size:9px;color:#00ff88;border-color:rgba(0,255,136,.3)';
    jsonBtn.textContent='⬇ HOOKS JSON';jsonBtn.title='Export hook-registry.json (Axiom A9)';
    jsonBtn.addEventListener('click',()=>NEXUS.downloadUUIDs('json'));
    const csvBtn=document.createElement('button');
    csvBtn.className='btn';csvBtn.style.cssText='font-size:9px;color:#00ff88;border-color:rgba(0,255,136,.3)';
    csvBtn.textContent='⬇ HOOKS CSV';csvBtn.title='Export hook-registry.csv (Axiom A9)';
    csvBtn.addEventListener('click',()=>NEXUS.downloadUUIDs('csv'));
    uuidBtnRow.prepend(csvBtn);uuidBtnRow.prepend(jsonBtn);
  }

  // ── Bridge error listener → toast (replaces crash dialog) ─────────────────
  if(window.nexus?.on){
    window.nexus.on('nexus:bridge-error',err=>{
      NEXUS.toast({level:'error',code:'BRIDGE_SPAWN_ENOENT',title:'Bridge failed to start',message:err.hint||err.message,detail:`Node binary: ${err.nodeBin}\nCode: ${err.code}`,actions:['Details','Dismiss']});
    });
  }

  // ── Navigate:settings handler → route to OPTIONS sub-section ──────────────
  NEXUS.on('nexus:navigate:settings',e=>{
    const sp=e.payload?.path;if(!sp)return;
    // Navigate to options tab
    if(typeof switchTab==='function')switchTab('options');
    // Extract sub-section: 'options.bridge.ssh' → 'diagnose' or find mapping
    const parts=sp.split('.');const sub=parts[1];
    const subMap={'diagnostics':'diagnose','compiler':'data','filebrowser':'data','workspace':'data','console':'data','appearance':'appearance','bridge':'data','ai':'data','orchestrator':'data','crypt':'data','testenv':'data','scriptbuilder':'data','pipeline':'data'};
    const target=subMap[sub]||'diagnose';
    setTimeout(()=>{if(typeof optSwitchTab==='function'){const btn=document.querySelector(`[onclick*="optSwitchTab('${target}'"]`);if(btn){optSwitchTab(target,btn);}}},120);
  });

  NEXUS.toast({level:'success',code:'NEXUS_READY',title:'NEXUS v0.53.0 — Phase 1',message:`${NEXUS.allHooks().length} hooks registered · Bedrock online`,actions:['Dismiss']});

  // ── A0: System-wide AXIOM — Bottom-Up Build Order ────────────────────────
  // Every build, gate, or pipeline in NEXUS starts from bedrock upward.
  // Dependencies are resolved before consumers. Never top-down. Never skipped.
  window.NEXUS_AXIOM_BOTTOM_UP = {
    id: 'A0',
    label: 'Build Bottom-Up',
    rule: 'Always build from dependencies first. Foundation → Gates → Modules → Features. Never skip a layer. If a dependency is unstable, rebuild it before proceeding.',
    credit: 'Powered by SISO Framework — siso-framework.org',
    enforce: (step) => {
      if (window.NEXUS_BUILD_LAYER !== undefined && step < window.NEXUS_BUILD_LAYER) {
        throw new Error(`[A0] Bottom-up violation: attempted to build step ${step} before layer ${window.NEXUS_BUILD_LAYER} is complete.`);
      }
      window.NEXUS_BUILD_LAYER = step;
    },
  };

  // ── SISO Credit injection ─────────────────────────────────────────────────
  // Every script output gets the SISO credit footer appended
  const _origSbGenerate = typeof sbGenerate === 'function' ? sbGenerate : null;
  const SISO_CREDIT = `\n\n/*\n * Built with NEXUS SISO Framework\n * Architecture: siso-framework.org\n * Bottom-up gate pipeline | Event-driven | Production-ready\n */`;

  // ── Header pill overhaul ─────────────────────────────────────────────────
  // Hide bridge pill when local LLM (ollama/lmstudio) is active
  // Show model name + status in the AI pill instead
  function nxUpdateHeaderPills() {
    const provider = localStorage.getItem('nx6_last_provider') || AI?.provider || 'chatgpt';
    const isLocal  = provider === 'ollama' || provider === 'lmstudio' || provider === 'local';
    const bridgePill = document.getElementById('bridge-status-pill');
    const aiPill     = document.getElementById('pill-ai');
    const aiTxt      = document.getElementById('pill-ai-txt');
    const modelBadge = document.getElementById('active-model-badge');

    // Hide bridge pill for local — it's irrelevant and confusing
    if (bridgePill) bridgePill.style.display = isLocal ? 'none' : '';

    if (isLocal) {
      // Show model name in AI pill
      const ollamaModel = localStorage.getItem('nx6_cfg') ?
        (() => { try { return JSON.parse(localStorage.getItem('nx6_cfg')).ollamaModel || 'llama3'; } catch { return 'llama3'; } })() :
        (document.getElementById('opt-ollama-model')?.value || document.getElementById('opt-ollama-model-v3')?.value || 'llama3');

      const lmModel = document.getElementById('opt-lmstudio-model')?.value || '';
      const modelName = provider === 'ollama' ? ollamaModel : (lmModel || 'local');

      if (aiTxt) aiTxt.textContent = provider === 'ollama' ? 'OLLAMA' : 'LM STUDIO';
      if (modelBadge) modelBadge.textContent = modelName.split(':')[0].toUpperCase().slice(0,12);

      // Poll ollama status
      nxPollOllamaStatus();
    }
  }

  let _ollamaStatusTimer = null;
  async function nxPollOllamaStatus() {
    if (_ollamaStatusTimer) return; // already polling
    const aiPill = document.getElementById('pill-ai');
    const aiTxt  = document.getElementById('pill-ai-txt');
    _ollamaStatusTimer = setInterval(async () => {
      const provider = localStorage.getItem('nx6_last_provider') || AI?.provider || '';
      if (provider !== 'ollama' && provider !== 'lmstudio') { clearInterval(_ollamaStatusTimer); _ollamaStatusTimer = null; return; }
      const url = provider === 'ollama'
        ? (document.getElementById('opt-ollama-url')?.value || 'http://localhost:11434')
        : (document.getElementById('opt-lmstudio-url')?.value || 'http://localhost:1234');
      try {
        const r = await fetch(url + (provider === 'ollama' ? '/api/tags' : '/v1/models'), { signal: AbortSignal.timeout(2000) });
        if (r.ok) {
          if (aiPill) aiPill.className = 'pill pill-ok';
          const data = await r.json().catch(() => ({}));
          // Update model list if available
          if (provider === 'ollama' && data.models) {
            const modelName = document.getElementById('opt-ollama-model')?.value ||
              document.getElementById('opt-ollama-model-v3')?.value ||
              (data.models[0]?.name || 'llama3');
            const badge = document.getElementById('active-model-badge');
            if (badge) badge.textContent = modelName.split(':')[0].toUpperCase().slice(0,12);
          }
        } else {
          if (aiPill) aiPill.className = 'pill pill-err';
        }
      } catch {
        if (aiPill) aiPill.className = 'pill pill-err';
      }
    }, 8000);
  }

  // Run pill update on load and on provider change
  nxUpdateHeaderPills();
  // Hook into provider changes
  const _origOnProviderChange = typeof onProviderChange === 'function' ? onProviderChange : null;
  if (_origOnProviderChange) {
    window.onProviderChange = function() {
      _origOnProviderChange();
      setTimeout(nxUpdateHeaderPills, 100);
    };
  }

  // ── Beautiful dropdown menus for Engine/Quick bars ────────────────────────
  function nxBuildDropdowns() {
    // Replace the flat engine pills with a tidy dropdown menu system
    const enginesBar = document.querySelector('.engine-pills-bar, #engine-pills, .engines-row');
    if (!enginesBar) return;
    // Already processed
    if (enginesBar.dataset.nxDropdown) return;
    enginesBar.dataset.nxDropdown = '1';

    const style = document.createElement('style');
    style.id = 'nx-dropdown-styles';
    if (!document.getElementById('nx-dropdown-styles')) {
      style.textContent = `
        .nx-dd-wrap{position:relative;display:inline-block;}
        .nx-dd-btn{background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.2);border-radius:3px;color:var(--c);font-family:var(--mono);font-size:9px;letter-spacing:.1em;padding:4px 10px;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .15s;white-space:nowrap;}
        .nx-dd-btn:hover{background:rgba(0,212,255,.12);border-color:rgba(0,212,255,.45);}
        .nx-dd-btn::after{content:'▾';font-size:8px;margin-left:2px;opacity:.6;}
        .nx-dd-menu{position:absolute;top:calc(100% + 4px);left:0;min-width:160px;background:#0b1120;border:1px solid var(--border2);border-radius:4px;padding:3px 0;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.7);display:none;flex-direction:column;}
        .nx-dd-menu.open{display:flex;}
        .nx-dd-item{padding:6px 12px;font-family:var(--mono);font-size:9px;color:var(--text2);cursor:pointer;letter-spacing:.07em;transition:all .12s;display:flex;align-items:center;gap:7px;border-left:2px solid transparent;}
        .nx-dd-item:hover{background:rgba(0,212,255,.07);color:var(--c);border-left-color:var(--c);}
        .nx-dd-item.active{color:var(--g);border-left-color:var(--g);}
        .nx-dd-sep{height:1px;background:var(--border);margin:3px 0;}
        .nx-dd-label{padding:4px 12px;font-family:var(--mono);font-size:8px;color:var(--text4);letter-spacing:.14em;text-transform:uppercase;}
      `;
      document.head.appendChild(style);
    }
  }

  // ── Right-click context menu on forge file tabs ───────────────────────────
  function nxInitFileContextMenu() {
    const menuId = 'nx-file-ctx-menu';
    if (document.getElementById(menuId)) return;

    // Create menu element
    const menu = document.createElement('div');
    menu.id = menuId;
    menu.style.cssText = `
      position:fixed;z-index:99999;
      background:#0b1120;border:1px solid var(--border2);border-radius:5px;
      padding:4px 0;min-width:200px;display:none;
      box-shadow:0 12px 40px rgba(0,0,0,.8);
      font-family:var(--mono);font-size:10px;
    `;
    document.body.appendChild(menu);

    let _ctxFileId = null;

    const menuItems = [
      { label:'📋  Copy to Clipboard',    action: () => { const f=FORGE?.files?.[_ctxFileId]; if(f) navigator.clipboard.writeText(f.content||'').then(()=>toast('Copied','ok')); } },
      { label:'💾  Save to Projects',     action: () => nxCtxSaveToProject(_ctxFileId) },
      { label:'🔧  Send to FORGE Compiler',action: () => nxCtxSendToForge(_ctxFileId) },
      { label:'🔍  Validate / Audit',     action: () => nxCtxValidate(_ctxFileId) },
      { label:'⚡  Run Hostile Test',     action: () => nxCtxHostile(_ctxFileId) },
      { sep: true },
      { label:'📝  Rename',              action: () => nxCtxRename(_ctxFileId) },
      { label:'🔀  Duplicate',           action: () => nxCtxDuplicate(_ctxFileId) },
      { sep: true },
      { label:'🌐  Compile → Windows',   action: () => nxCtxCompile(_ctxFileId,'windows') },
      { label:'🍎  Compile → macOS',     action: () => nxCtxCompile(_ctxFileId,'macos') },
      { label:'🐧  Compile → Linux',     action: () => nxCtxCompile(_ctxFileId,'linux') },
      { label:'🧩  Package Extension',   action: () => nxCtxCompile(_ctxFileId,'webext') },
      { sep: true },
      { label:'❌  Close File',           action: () => { if(_ctxFileId && typeof forgeCloseFile==='function') forgeCloseFile(_ctxFileId); }, danger:true },
    ];

    menu.innerHTML = menuItems.map((item,i) => {
      if (item.sep) return `<div style="height:1px;background:var(--border);margin:3px 0"></div>`;
      return `<div class="nx-ctx-item" data-idx="${i}" style="padding:7px 14px;cursor:pointer;color:${item.danger?'var(--r)':'var(--text2)'};display:flex;align-items:center;gap:8px;transition:all .1s;" onmouseenter="this.style.background='rgba(0,212,255,.07)';this.style.color='${item.danger?'var(--r)':'var(--c)'}'" onmouseleave="this.style.background='';this.style.color='${item.danger?'var(--r)':'var(--text2)'}'">
        ${_escHtml(item.label)}
      </div>`;
    }).join('');

    // Bind actions
    menu.querySelectorAll('.nx-ctx-item').forEach(el => {
      const idx = parseInt(el.dataset.idx);
      if (!isNaN(idx) && menuItems[idx]?.action) {
        el.addEventListener('click', () => { hideCtxMenu(); menuItems[idx].action(); });
      }
    });

    function showCtxMenu(x, y, fileId) {
      _ctxFileId = fileId;
      menu.style.display = 'block';
      // Position
      const mw = 210, mh = menu.offsetHeight || 280;
      menu.style.left = (x + mw > window.innerWidth ? x - mw : x) + 'px';
      menu.style.top  = (y + mh > window.innerHeight ? y - mh : y) + 'px';
    }

    function hideCtxMenu() {
      menu.style.display = 'none';
      _ctxFileId = null;
    }

    document.addEventListener('click', hideCtxMenu);
    document.addEventListener('keydown', e => { if(e.key==='Escape') hideCtxMenu(); });

    // Attach to file tabs via delegation on forge-file-tabs bar
    const tabsBar = document.getElementById('forge-file-tabs');
    if (tabsBar) {
      tabsBar.addEventListener('contextmenu', e => {
        e.preventDefault();
        // Find which file tab was right-clicked
        const tab = e.target.closest('.forge-file-tab');
        if (!tab) return;
        // Extract file ID from the tab's span onclick
        const span = tab.querySelector('span[onclick]');
        const match = span?.getAttribute('onclick')?.match(/'([^']+)'/);
        const fileId = match?.[1];
        if (fileId) showCtxMenu(e.clientX, e.clientY, fileId);
      });
    }

    // Also attach to file tree
    const fileTree = document.getElementById('forge-file-tree');
    if (fileTree) {
      fileTree.addEventListener('contextmenu', e => {
        e.preventDefault();
        const item = e.target.closest('.forge-tree-item');
        if (!item) return;
        // Find fileId from active or clicked item
        const files = FORGE?.files || {};
        const name = item.querySelector('.forge-tree-item-name')?.textContent;
        const file = Object.values(files).find(f => f.name === name);
        if (file) showCtxMenu(e.clientX, e.clientY, file.id);
      });
    }
  }

  // Context menu actions
  function nxCtxSaveToProject(fileId) {
    const f = FORGE?.files?.[fileId]; if (!f) return;
    const name = f.name.replace(/\.[^.]+$/, '');
    const pid = typeof saveNewProject === 'function' ? saveNewProject(name, f.content || '', 'Saved from FORGE IDE') : null;
    if (pid) {
      JAA?.log?.('project:saved', { name, source:'forge-ide', fileId }, pid, 'OK');
      toast('Saved to Projects: ' + name, 'ok');
    }
  }

  function nxCtxSendToForge(fileId) {
    const f = FORGE?.files?.[fileId]; if (!f) return;
    const endstate = document.getElementById('sb-endstate');
    if (endstate) endstate.value = f.content?.slice(0, 300) || f.name;
    switchTab('builder');
    toast('File sent to Builder — click Generate to compile', 'ok');
  }

  function nxCtxValidate(fileId) {
    const f = FORGE?.files?.[fileId]; if (!f) return;
    if (typeof forgeActivateFile === 'function') forgeActivateFile(fileId);
    if (typeof sbValidate === 'function') {
      window._generatedCode = f.content || '';
      sbValidate();
    }
  }

  function nxCtxHostile(fileId) {
    const f = FORGE?.files?.[fileId]; if (!f) return;
    if (typeof forgeActivateFile === 'function') forgeActivateFile(fileId);
    window._generatedCode = f.content || '';
    if (typeof sbHostileAttack === 'function') sbHostileAttack();
  }

  function nxCtxRename(fileId) {
    const f = FORGE?.files?.[fileId]; if (!f) return;
    const newName = prompt('Rename file:', f.name);
    if (newName && newName.trim()) {
      f.name = newName.trim();
      if (typeof forgeRenderTabs === 'function') forgeRenderTabs();
      if (typeof forgeRenderFileTree === 'function') forgeRenderFileTree();
    }
  }

  function nxCtxDuplicate(fileId) {
    const f = FORGE?.files?.[fileId]; if (!f || !FORGE?.files) return;
    const newId = 'file-' + Date.now();
    FORGE.files[newId] = { id:newId, name:'copy-'+f.name, content:f.content, lang:f.lang, modified:true };
    if (typeof forgeActivateFile === 'function') forgeActivateFile(newId);
    if (typeof forgeRenderTabs === 'function') forgeRenderTabs();
    toast('Duplicated: ' + f.name, 'ok');
  }

  async function nxCtxCompile(fileId, platform) {
    const f = FORGE?.files?.[fileId]; if (!f) return;
    nxShowBuildProgress(f.name, platform);
    toast('Compiling ' + f.name + ' → ' + platform + '…', 'info');
    // Delegate to compiler module if available
    if (window.NexusCompiler) {
      try {
        const result = await window.NexusCompiler.build({
          projectDir: window._nexusWorkDir || '.',
          platform,
          productName: f.name.replace(/\.[^.]+$/,''),
          generateMain: true,
          onProgress: (entry) => nxUpdateBuildProgress(entry.message || entry.step),
        });
        nxFinishBuildProgress(result.ok, result.outDir);
        if (result.ok) toast('Build complete → ' + (result.outDir||'dist'), 'ok');
        else toast('Build failed: ' + result.error, 'err');
      } catch(e) { nxFinishBuildProgress(false, null); toast('Build error: '+e.message,'err'); }
    } else {
      setTimeout(() => nxFinishBuildProgress(false, null), 1500);
      toast('Compiler module not loaded', 'warn');
    }
  }

  // ── Build progress modal ───────────────────────────────────────────────────
  function nxInjectBuildProgressModal() {
    if (document.getElementById('nx-build-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'nx-build-modal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:99998;
      background:rgba(5,8,15,.92);backdrop-filter:blur(12px);
      display:none;align-items:center;justify-content:center;
      font-family:var(--mono);
    `;
    modal.innerHTML = `
      <div id="nx-build-inner" style="
        width:540px;max-height:80vh;
        background:linear-gradient(135deg,#080d17,#0b1120);
        border:1px solid var(--border2);border-radius:8px;
        box-shadow:0 0 60px rgba(0,212,255,.15),0 24px 80px rgba(0,0,0,.8);
        overflow:hidden;display:flex;flex-direction:column;
      ">
        <!-- Header -->
        <div style="padding:16px 20px 12px;background:rgba(0,212,255,.04);border-bottom:1px solid var(--border2);display:flex;align-items:center;gap:10px;">
          <div id="nx-bm-orb" style="width:32px;height:32px;border-radius:50%;border:2px solid var(--c);display:flex;align-items:center;justify-content:center;font-size:14px;animation:bm-orb-pulse 1.5s ease-in-out infinite;">⚡</div>
          <div>
            <div style="font-family:var(--display);font-size:14px;letter-spacing:.2em;color:var(--c)" id="nx-bm-title">BUILDING</div>
            <div style="font-size:9px;color:var(--text3);margin-top:1px" id="nx-bm-subtitle">Initializing pipeline…</div>
          </div>
          <div style="margin-left:auto;font-family:var(--display);font-size:11px;color:var(--text3)" id="nx-bm-timer">0s</div>
        </div>
        <!-- Progress bar -->
        <div style="height:3px;background:var(--bg3);position:relative;overflow:hidden;">
          <div id="nx-bm-bar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--c),var(--m));transition:width .4s ease;position:relative;">
            <div style="position:absolute;top:0;right:0;width:30px;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.4));animation:bm-shimmer .8s ease-in-out infinite;"></div>
          </div>
        </div>
        <!-- Gate pipeline -->
        <div id="nx-bm-gates" style="padding:12px 20px;display:flex;gap:8px;border-bottom:1px solid var(--border2);flex-wrap:wrap;"></div>
        <!-- Log -->
        <div id="nx-bm-log" style="flex:1;overflow-y:auto;padding:10px 20px;max-height:240px;display:flex;flex-direction:column;gap:2px;"></div>
        <!-- Footer -->
        <div style="padding:10px 20px;border-top:1px solid var(--border2);display:flex;align-items:center;gap:10px;">
          <div id="nx-bm-status" style="font-size:9px;color:var(--text3);flex:1;">Running…</div>
          <div style="font-size:9px;color:var(--text4)" id="nx-bm-siso">⬡ SISO Framework · siso-framework.org</div>
          <button id="nx-bm-close" onclick="document.getElementById('nx-build-modal').style.display='none'" style="background:none;border:1px solid var(--border2);border-radius:3px;color:var(--text3);font-family:var(--mono);font-size:9px;padding:3px 10px;cursor:pointer;display:none;">CLOSE</button>
        </div>
      </div>
      <style>
        @keyframes bm-orb-pulse{0%,100%{box-shadow:0 0 8px rgba(0,212,255,.3)}50%{box-shadow:0 0 24px rgba(0,212,255,.7),0 0 40px rgba(140,60,255,.3)}}
        @keyframes bm-shimmer{0%{opacity:0}50%{opacity:1}100%{opacity:0}}
        .bm-gate{padding:3px 9px;border-radius:3px;font-size:8px;letter-spacing:.1em;border:1px solid;transition:all .3s;}
        .bm-gate.pending{color:var(--text4);border-color:var(--border2);}
        .bm-gate.running{color:var(--y);border-color:rgba(255,204,0,.4);animation:bm-orb-pulse 1s infinite;}
        .bm-gate.done{color:var(--g);border-color:rgba(0,255,136,.3);background:rgba(0,255,136,.05);}
        .bm-gate.failed{color:var(--r);border-color:rgba(255,45,85,.35);background:rgba(255,45,85,.05);}
        .bm-log-line{font-size:9px;line-height:1.5;color:var(--text3);display:flex;gap:6px;}
        .bm-log-line.ok{color:var(--g);}.bm-log-line.err{color:var(--r);}.bm-log-line.gate{color:var(--c);font-weight:700;}
        #nx-bm-log::-webkit-scrollbar{width:3px;}#nx-bm-log::-webkit-scrollbar-thumb{background:var(--border2);}
      </style>
    `;
    document.body.appendChild(modal);
  }

  let _buildTimerInterval = null;
  const _bmGates = ['VALIDATE','PREPARE','INSTALL','EXECUTE','VERIFY','OUTPUT'];

  function nxShowBuildProgress(fileName, platform) {
    nxInjectBuildProgressModal();
    const modal = document.getElementById('nx-build-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    // Reset
    document.getElementById('nx-bm-title').textContent = 'BUILDING';
    document.getElementById('nx-bm-subtitle').textContent = `${fileName} → ${platform.toUpperCase()}`;
    document.getElementById('nx-bm-bar').style.width = '0%';
    document.getElementById('nx-bm-log').innerHTML = '';
    document.getElementById('nx-bm-close').style.display = 'none';
    document.getElementById('nx-bm-status').textContent = 'Running SISO pipeline…';
    // Gates
    document.getElementById('nx-bm-gates').innerHTML = _bmGates.map((g,i) =>
      `<div class="bm-gate pending" id="bm-gate-${i}">${g}</div>`
    ).join('');
    // Timer
    let secs = 0;
    clearInterval(_buildTimerInterval);
    _buildTimerInterval = setInterval(() => {
      secs++;
      const el = document.getElementById('nx-bm-timer');
      if (el) el.textContent = secs < 60 ? secs+'s' : Math.floor(secs/60)+'m '+secs%60+'s';
    }, 1000);
    window._bmStep = 0;
    nxUpdateBuildProgress('Pipeline initialised', 'gate');
  }

  function nxUpdateBuildProgress(msg, type='info') {
    const log = document.getElementById('nx-bm-log');
    if (!log) return;
    const line = document.createElement('div');
    line.className = 'bm-log-line ' + (type||'info');
    line.innerHTML = `<span style="color:var(--text4);flex-shrink:0">${new Date().toLocaleTimeString('en',{hour12:false})}</span><span>${_escHtml(String(msg).slice(0,180))}</span>`;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;

    // Advance gate indicator
    const step = window._bmStep || 0;
    if (step < _bmGates.length) {
      // Mark previous done
      if (step > 0) {
        const prev = document.getElementById('bm-gate-'+(step-1));
        if (prev) { prev.className='bm-gate done'; }
      }
      const cur = document.getElementById('bm-gate-'+step);
      if (cur) cur.className = 'bm-gate running';
      // Progress bar
      const bar = document.getElementById('nx-bm-bar');
      if (bar) bar.style.width = Math.round((step/(_bmGates.length)) * 90) + '%';
    }
    // Detect step advancement from message
    const stepWords = ['prepare','install','execute','verify','output'];
    const lower = msg.toLowerCase();
    stepWords.forEach((w,i) => { if (lower.includes(w)) window._bmStep = i+1; });
  }

  function nxFinishBuildProgress(ok, outDir) {
    clearInterval(_buildTimerInterval);
    // Mark all remaining gates
    _bmGates.forEach((_, i) => {
      const el = document.getElementById('bm-gate-'+i);
      if (el) el.className = 'bm-gate ' + (ok ? 'done' : (i === (window._bmStep||0) ? 'failed' : 'done'));
    });
    const bar = document.getElementById('nx-bm-bar');
    if (bar) {
      bar.style.width = '100%';
      bar.style.background = ok ? 'linear-gradient(90deg,var(--g),var(--c))' : 'linear-gradient(90deg,var(--r),#ff6b35)';
    }
    const title  = document.getElementById('nx-bm-title');
    const status = document.getElementById('nx-bm-status');
    const orb    = document.getElementById('nx-bm-orb');
    const close  = document.getElementById('nx-bm-close');
    if (title)  title.textContent  = ok ? 'BUILD COMPLETE' : 'BUILD FAILED';
    if (orb)    orb.textContent    = ok ? '✓' : '✕';
    if (orb)    orb.style.borderColor = ok ? 'var(--g)' : 'var(--r)';
    if (status) status.textContent = ok
      ? ('Output: ' + (outDir || 'dist/') + ' · Powered by SISO — siso-framework.org')
      : 'Build failed — check log above';
    if (close)  close.style.display = 'block';
    nxUpdateBuildProgress(ok ? '✓ Build complete' : '✕ Build failed', ok ? 'ok' : 'err');
  }

  // ── Ideas dedup check before building ────────────────────────────────────
  // Wrap sbGenerate to check ideas log first
  if (typeof sbGenerate === 'function') {
    const _origGen = sbGenerate;
    window.sbGenerate = async function() {
      const vision = document.getElementById('sb-endstate')?.value?.trim() || '';
      if (!vision) { _origGen(); return; }

      // Search ideas log for matching outputs
      const ideas = typeof getIdeas === 'function' ? getIdeas() : [];
      const lower  = vision.toLowerCase();
      const words  = lower.split(/\s+/).filter(w => w.length > 4);
      const matches = ideas.filter(idea => {
        if (idea.type !== 'input' && idea.type !== 'output') return false;
        const c = (idea.content || '').toLowerCase();
        const score = words.filter(w => c.includes(w)).length;
        return score >= Math.max(2, Math.floor(words.length * 0.4));
      });

      if (matches.length > 0) {
        // Show dedup modal
        const matched = matches[0];
        const useExisting = await nxShowDedupModal(vision, matched);
        if (useExisting) {
          // Restore existing output
          const out = document.getElementById('sb-output');
          if (out) { out.textContent = matched.content; out.style.color = 'var(--text)'; }
          toast('Loaded existing output from Ideas log — no redundant build needed', 'ok');
          JAA?.log?.('build:dedup', { vision: vision.slice(0,80), matched: matched.id }, '', 'INFO');
          return;
        }
      }
      // Proceed with normal build
      await _origGen();
      // Auto-save to projects after build
      setTimeout(() => {
        const code = window._generatedCode;
        if (code && code.length > 100) {
          const name = vision.slice(0, 50).replace(/[^a-z0-9 ]/gi, '').trim() || 'Generated Project';
          if (typeof saveNewProject === 'function') {
            const pid = saveNewProject(name, code + SISO_CREDIT, 'Auto-saved from NEXUS Builder');
            JAA?.log?.('project:saved', { name, auto:true, chars:code.length }, pid, 'OK');
            toast('Auto-saved to Projects: ' + name, 'ok');
          }
        }
      }, 500);
    };
  }

  function nxShowDedupModal(vision, match) {
    return new Promise(resolve => {
      const id = 'nx-dedup-modal';
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.style.cssText = `position:fixed;inset:0;z-index:99997;background:rgba(5,8,15,.88);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;font-family:var(--mono);`;
        document.body.appendChild(el);
      }
      el.style.display = 'flex';
      el.innerHTML = `
        <div style="width:480px;background:#080d17;border:1px solid var(--border2);border-radius:8px;overflow:hidden;box-shadow:0 0 60px rgba(204,68,255,.15),0 24px 80px rgba(0,0,0,.8);">
          <div style="padding:14px 18px;background:rgba(204,68,255,.05);border-bottom:1px solid var(--border2);display:flex;align-items:center;gap:8px;">
            <span style="font-size:16px">⟡</span>
            <span style="font-family:var(--display);font-size:12px;letter-spacing:.2em;color:var(--m)">SIMILAR OUTPUT FOUND</span>
          </div>
          <div style="padding:16px 18px;">
            <div style="font-size:9px;color:var(--text3);margin-bottom:8px;letter-spacing:.06em">IDEAS LOG MATCH — Avoid redundant build?</div>
            <div style="background:var(--bg2);border:1px solid var(--border2);border-radius:4px;padding:10px;font-size:10px;color:var(--text2);max-height:120px;overflow-y:auto;line-height:1.6;margin-bottom:12px;">${_escHtml(match.content.slice(0,400))}${match.content.length>400?'…':''}</div>
            <div style="font-size:8px;color:var(--text4);margin-bottom:14px;">Logged: ${match.ts?.slice(0,16)||'?'} · Type: ${match.type}</div>
            <div style="display:flex;gap:8px;">
              <button onclick="document.getElementById('nx-dedup-modal').style.display='none';window._dedupResolve(true)" style="flex:1;padding:9px;background:rgba(204,68,255,.1);border:1px solid rgba(204,68,255,.35);border-radius:4px;color:var(--m);font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:.1em;cursor:pointer;">USE EXISTING</button>
              <button onclick="document.getElementById('nx-dedup-modal').style.display='none';window._dedupResolve(false)" style="flex:1;padding:9px;background:rgba(0,212,255,.07);border:1px solid rgba(0,212,255,.3);border-radius:4px;color:var(--c);font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:.1em;cursor:pointer;">BUILD NEW</button>
            </div>
          </div>
        </div>`;
      window._dedupResolve = (val) => { el.style.display = 'none'; resolve(val); };
    });
  }

  // ── Gate settings panel ────────────────────────────────────────────────────
  function nxInjectGateSettings() {
    // Inject gate settings into the SETTINGS sidebar panel (forge-stab-settings is the DIV panel)
    const sideSettings = document.getElementById('forge-stab-settings');
    if (!sideSettings) return;
    if (document.getElementById('nx-gate-settings')) return;

    const gs = document.createElement('div');
    gs.id = 'nx-gate-settings';
    gs.style.cssText = 'padding:10px 12px;border-top:1px solid var(--border2);flex-shrink:0;';
    gs.innerHTML = `
      <div style="font-family:var(--display);font-size:9px;letter-spacing:.18em;color:var(--c);margin-bottom:8px;">⬡ GATE SETTINGS</div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:9px;color:var(--text3)">Bottom-Up Enforce</span>
          <label class="chk on" id="gate-bottomup" onclick="this.classList.toggle('on');window.NEXUS_AXIOM_BOTTOM_UP._enabled=this.classList.contains('on')"><div class="chk-dot"></div></label>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:9px;color:var(--text3)">SISO Credit Footer</span>
          <label class="chk on" id="gate-siso-credit" onclick="this.classList.toggle('on');window.NEXUS_GATE_SISO_CREDIT=this.classList.contains('on')"><div class="chk-dot"></div></label>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:9px;color:var(--text3)">Ideas Dedup Check</span>
          <label class="chk on" id="gate-dedup" onclick="this.classList.toggle('on');window.NEXUS_GATE_DEDUP=this.classList.contains('on')"><div class="chk-dot"></div></label>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:9px;color:var(--text3)">Auto-Save Projects</span>
          <label class="chk on" id="gate-autosave" onclick="this.classList.toggle('on');window.NEXUS_GATE_AUTOSAVE=this.classList.contains('on')"><div class="chk-dot"></div></label>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:9px;color:var(--text3)">Build Progress Modal</span>
          <label class="chk on" id="gate-modal" onclick="this.classList.toggle('on');window.NEXUS_GATE_MODAL=this.classList.contains('on')"><div class="chk-dot"></div></label>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:9px;color:var(--text3)">Auto Revision on Save</span>
          <label class="chk on" id="gate-revision" onclick="this.classList.toggle('on');window.NEXUS_GATE_REVISION=this.classList.contains('on')"><div class="chk-dot"></div></label>
        </div>
        <div style="margin-top:4px;padding:6px 8px;background:rgba(0,212,255,.03);border:1px solid rgba(0,212,255,.12);border-radius:3px;">
          <div style="font-size:8px;color:var(--text4);line-height:1.5">Axiom A0: Build bottom-up.<br>Architecture → Gates → Modules → Features.<br><a href="https://siso-framework.org" target="_blank" style="color:var(--text3);text-decoration:none;">siso-framework.org</a></div>
        </div>
      </div>
    `;
    sideSettings.appendChild(gs);

    // Init gate state flags
    window.NEXUS_GATE_SISO_CREDIT = true;
    window.NEXUS_GATE_DEDUP       = true;
    window.NEXUS_GATE_AUTOSAVE    = true;
    window.NEXUS_GATE_MODAL       = true;
    window.NEXUS_GATE_REVISION    = true;
  }

  // Fix forgeSideTab — ensure it calls nxInjectGateSettings lazily when SETTINGS opens
  const _origForgeSideTab = typeof window.forgeSideTab === 'function' ? window.forgeSideTab : null;
  window.forgeSideTab = function(tab, btn) {
    if (_origForgeSideTab) _origForgeSideTab(tab, btn);
    else {
      // Fallback implementation in case original not yet defined
      ['files','settings','uce'].forEach(t => {
        const el = document.getElementById('forge-stab-'+t);
        if (el) el.style.display = t===tab ? 'flex' : 'none';
      });
      document.querySelectorAll('.forge-stab').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
    }
    if (tab === 'settings') {
      nxInjectGateSettings();
      nxInjectNpmPanel();
    }
  };

  // ── Init all systems ──────────────────────────────────────────────────────
  // Wire PW/tests tab
  const diagPanel = document.getElementById('nx-diag-tabs');
  if (diagPanel && !document.querySelector('[onclick*="nxDiagTab(\'tests\'"]')) {
    const tb = document.createElement('button');
    tb.className = 'nx-dtab';
    tb.setAttribute('onclick', "nxDiagTab('tests',this)");
    tb.textContent = 'TESTS';
    const clearBtn = diagPanel.querySelector('[onclick*="nxDiagClear"]');
    if (clearBtn) diagPanel.insertBefore(tb, clearBtn);
    else diagPanel.appendChild(tb);
  }

  // Build tests panel
  const existingDpPw = document.getElementById('nx-dp-pw');
  if (existingDpPw && !document.getElementById('nx-dp-tests')) {
    const tp = document.createElement('div');
    tp.className = 'nx-dpanel';
    tp.id = 'nx-dp-tests';
    tp.innerHTML = _buildTestsPanelHTML();
    existingDpPw.after(tp);
    _bindTestsPanel();
  }

  const statsPanel = document.getElementById('nx-dp-stats');
  if (statsPanel) {
    statsPanel.innerHTML += _buildExtProfileHTML();
    _startExtensionMonitor();
  }

  // File context menu
  setTimeout(nxInitFileContextMenu, 500);

  // Gate settings injected lazily when SETTINGS tab is opened (nxEnsureGateSettings)
  // (handled in forgeSideTab override above)

  // ── npm install panel injected into COMPILE mode ───────────────────────
  // Hook into forgeSwitchMode to inject npm panel when compile mode opens
  const _origForgeSwitchMode = typeof window.forgeSwitchMode === 'function' ? window.forgeSwitchMode : null;
  window.forgeSwitchMode = function(mode, btn) {
    if (_origForgeSwitchMode) _origForgeSwitchMode(mode, btn);
    if (mode === 'compile') setTimeout(nxInjectNpmPanel, 100);
  };

  // ── Auto-revision on project save ─────────────────────────────────────
  const _origSaveNewProject = typeof saveNewProject === 'function' ? saveNewProject : null;
  if (_origSaveNewProject) {
    window.saveNewProject = function(name, code, description='') {
      const proj = _origSaveNewProject(name, code, description);
      if (proj && window.NEXUS_GATE_REVISION !== false) {
        // Add revision immediately after save
        try {
          REV.add(proj.id, code, 'auto', 'Initial save');
          // Also add snapshot entry
          const snapKey = 'nx_snapshots_' + proj.id;
          const snaps = (() => { try { return JSON.parse(localStorage.getItem(snapKey)||'[]'); } catch { return []; } })();
          snaps.unshift({ id: uid(), ts: new Date().toISOString(), label: 'Auto snapshot — ' + name.slice(0,40), code, chars: code.length });
          if (snaps.length > 50) snaps.length = 50;
          localStorage.setItem(snapKey, JSON.stringify(snaps));
          log_ev('revision:auto', { projectId: proj.id, name }, 'INFO');
        } catch(e) { console.warn('[NEXUS] Auto-revision failed:', e.message); }
      }
      return proj;
    };
  }

  // Also wrap forgeCompileRun to auto-save + revision when compile succeeds
  const _origForgeCompileRun = typeof window.forgeCompileRun === 'function' ? window.forgeCompileRun : null;
  if (_origForgeCompileRun) {
    window.forgeCompileRun = async function(silent) {
      await _origForgeCompileRun(silent);
      const f = FORGE?.activeFile ? FORGE.files[FORGE.activeFile] : null;
      if (f && window.NEXUS_GATE_AUTOSAVE !== false) {
        const name = f.name.replace(/\.[^.]+$/, '') + ' (compiled)';
        if (typeof saveNewProject === 'function') saveNewProject(name, f.content || '', 'Auto-saved after compile');
      }
    };
  }

  // Build progress modal DOM (pre-create)
  nxInjectBuildProgressModal();

  // Dropdowns
  nxBuildDropdowns();

  // Project import button (added to projects tab)
  setTimeout(nxInjectProjectImport, 600);
});

/* ═══════════════════════════════════════════════════════════════════════════
   NEXUS PHASE 2 — UI Startup Flow Refactor
   v0.53.0 | 2026-04-04
   Skip wizard if AI configured. Welcome-back screen. Live header dots.
   ═══════════════════════════════════════════════════════════════════════════ */

(function phase2Startup(){
  'use strict';

  // ── P2.1: Skip AI selection if already configured ─────────────────────────
  // If a provider was last used AND it's local or has a key, skip the wizard.
  const lastProvider = localStorage.getItem('nx6_last_provider');
  const cfg = (() => { try{ return JSON.parse(localStorage.getItem('nx6_cfg')||'{}'); }catch{ return {}; } })();
  const hasKey = !!(cfg.chatgptKey || cfg.claudeKey || cfg.deepseekKey || cfg.geminiKey);
  const isLocal = lastProvider === 'ollama' || lastProvider === 'lmstudio' || lastProvider === 'local';
  const isConfigured = lastProvider && (hasKey || isLocal);

  // First launch check
  const isFirstLaunch = !localStorage.getItem('nx6_setup_complete');

  if(isFirstLaunch){
    // Intercept bootLoginFlow — show first-launch wizard
    window.bootLoginFlow = function(){
      nxShowFirstLaunch();
    };
  } else if(isConfigured){
    // Intercept bootLoginFlow — show welcome-back instead
    const _origBoot = typeof bootLoginFlow === 'function' ? bootLoginFlow : null;
    window.bootLoginFlow = function(){
      // Don't show AI login wizard — skip directly to welcome-back
      nxShowWelcomeBack(lastProvider, cfg);
    };
  }

  // ── P2.1: First-launch onboarding wizard ────────────────────────────────
  function nxShowFirstLaunch(){
    let fl = document.getElementById('nx-first-launch');
    if(!fl){
      fl = document.createElement('div');
      fl.id = 'nx-first-launch';
      document.body.appendChild(fl);
    }
    fl.style.cssText = 'position:fixed;inset:0;z-index:2100;background:#020510;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;font-family:var(--mono);';

    fl.innerHTML = `
      <canvas id="fl-canvas" style="position:absolute;inset:0;z-index:0;pointer-events:none;"></canvas>

      <!-- Step 1: WHO IS THIS FOR? -->
      <div id="fl-step-1" style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;max-width:780px;width:90%;padding:40px 20px;text-align:center;">

        <!-- Progress dots -->
        <div style="display:flex;gap:8px;margin-bottom:48px;animation:fl-in .8s ease both;">
          <div id="fl-dot-1" style="width:10px;height:10px;border-radius:50%;background:var(--c);box-shadow:0 0 8px rgba(0,212,255,.6);transition:all .3s;"></div>
          <div id="fl-dot-2" style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);transition:all .3s;"></div>
          <div id="fl-dot-3" style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);transition:all .3s;"></div>
          <div id="fl-dot-4" style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);transition:all .3s;"></div>
          <div id="fl-dot-5" style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);transition:all .3s;"></div>
        </div>

        <div style="font-family:var(--display);font-size:13px;letter-spacing:.3em;color:var(--text3);margin-bottom:12px;animation:fl-in .8s .1s ease both;">NEXUS</div>
        <div style="font-family:var(--display);font-size:46px;letter-spacing:.15em;color:var(--c);text-shadow:0 0 60px rgba(0,212,255,.35);margin-bottom:12px;animation:fl-in .8s .15s ease both;">WHO IS THIS FOR?</div>
        <div style="font-size:11px;color:var(--text3);letter-spacing:.1em;margin-bottom:48px;animation:fl-in .8s .2s ease both;">This determines the entire direction of the build.</div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;width:100%;margin-bottom:32px;animation:fl-in .8s .25s ease both;" id="fl-audience-grid">
          <div class="fl-card" id="fl-c-personal" onclick="flSelectAudience('personal',this)" style="padding:28px 20px;border:1px solid rgba(255,255,255,.1);border-radius:6px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:center;gap:12px;">
            <div style="font-size:28px;">⚡</div>
            <div style="font-family:var(--display);font-size:14px;letter-spacing:.15em;color:var(--text);">PERSONAL</div>
            <div style="font-size:10px;color:var(--text3);line-height:1.6;text-align:center;">Maximum creative freedom. Your rules, your architecture.</div>
          </div>
          <div class="fl-card" id="fl-c-team" onclick="flSelectAudience('team',this)" style="padding:28px 20px;border:1px solid rgba(255,255,255,.1);border-radius:6px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:center;gap:12px;">
            <div style="font-size:28px;">⊕</div>
            <div style="font-family:var(--display);font-size:14px;letter-spacing:.15em;color:var(--text);">TEAM</div>
            <div style="font-size:10px;color:var(--text3);line-height:1.6;text-align:center;">Building with others. Shared conventions and stability.</div>
          </div>
          <div class="fl-card" id="fl-c-client" onclick="flSelectAudience('client',this)" style="padding:28px 20px;border:1px solid rgba(255,255,255,.1);border-radius:6px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:center;gap:12px;">
            <div style="font-size:28px;">△</div>
            <div style="font-family:var(--display);font-size:14px;letter-spacing:.15em;color:var(--text);">CLIENT</div>
            <div style="font-size:10px;color:var(--text3);line-height:1.6;text-align:center;">Spec-driven. Documentation, testing, and handoff-ready.</div>
          </div>
        </div>

        <button id="fl-continue-1" onclick="flStep(2)" disabled
          style="font-family:var(--display);font-size:12px;letter-spacing:.2em;padding:13px 44px;border:1.5px solid rgba(0,212,255,.2);border-radius:4px;background:rgba(0,212,255,.04);color:rgba(0,212,255,.3);cursor:not-allowed;transition:all .25s;animation:fl-in .8s .35s ease both;">
          CONTINUE →
        </button>
      </div>

      <!-- Step 2: AI PROVIDER -->
      <div id="fl-step-2" style="position:relative;z-index:1;display:none;flex-direction:column;align-items:center;max-width:780px;width:90%;padding:40px 20px;text-align:center;">
        <div style="display:flex;gap:8px;margin-bottom:48px;">
          <div id="fl-dot-1b" style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:var(--c);box-shadow:0 0 8px rgba(0,212,255,.6);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
        </div>
        <div style="font-family:var(--display);font-size:46px;letter-spacing:.15em;color:var(--c);text-shadow:0 0 60px rgba(0,212,255,.35);margin-bottom:12px;">YOUR AI</div>
        <div style="font-size:11px;color:var(--text3);letter-spacing:.1em;margin-bottom:40px;">How will NEXUS think? Start local, add cloud later.</div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;width:100%;margin-bottom:16px;">
          <div class="fl-card" id="fl-ai-ollama" onclick="flSelectAI('ollama',this)" style="padding:22px 16px;border:1px solid rgba(0,255,136,.3);border-radius:6px;cursor:pointer;transition:all .2s;background:rgba(0,255,136,.04);display:flex;flex-direction:column;align-items:center;gap:10px;">
            <div style="font-size:20px;color:var(--g)">⬡</div>
            <div style="font-family:var(--display);font-size:12px;letter-spacing:.12em;color:var(--g);">OLLAMA</div>
            <div style="font-size:9px;color:var(--text3);line-height:1.5;text-align:center;">Local · Free · No API key<br>Runs on your machine</div>
            <div style="font-size:8px;padding:2px 8px;border:1px solid rgba(0,255,136,.3);border-radius:2px;color:var(--g);">RECOMMENDED</div>
          </div>
          <div class="fl-card" id="fl-ai-claude" onclick="flSelectAI('claude',this)" style="padding:22px 16px;border:1px solid rgba(255,255,255,.1);border-radius:6px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:center;gap:10px;">
            <div style="font-size:20px;color:var(--o)">◈</div>
            <div style="font-family:var(--display);font-size:12px;letter-spacing:.12em;color:var(--o);">CLAUDE</div>
            <div style="font-size:9px;color:var(--text3);line-height:1.5;text-align:center;">Strongest reasoning<br>API key required</div>
          </div>
          <div class="fl-card" id="fl-ai-chatgpt" onclick="flSelectAI('chatgpt',this)" style="padding:22px 16px;border:1px solid rgba(255,255,255,.1);border-radius:6px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:center;gap:10px;">
            <div style="font-size:20px;color:var(--g)">⬢</div>
            <div style="font-family:var(--display);font-size:12px;letter-spacing:.12em;color:var(--g);">CHATGPT</div>
            <div style="font-size:9px;color:var(--text3);line-height:1.5;text-align:center;">Broad capability<br>API key required</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;width:100%;margin-bottom:32px;">
          <div class="fl-card" id="fl-ai-deepseek" onclick="flSelectAI('deepseek',this)" style="padding:22px 16px;border:1px solid rgba(255,255,255,.1);border-radius:6px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:center;gap:10px;">
            <div style="font-size:20px;color:var(--c)">◉</div>
            <div style="font-family:var(--display);font-size:12px;letter-spacing:.12em;color:var(--c);">DEEPSEEK</div>
            <div style="font-size:9px;color:var(--text3);line-height:1.5;text-align:center;">Best code model<br>Cheapest API</div>
          </div>
          <div class="fl-card" id="fl-ai-gemini" onclick="flSelectAI('gemini',this)" style="padding:22px 16px;border:1px solid rgba(255,255,255,.1);border-radius:6px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:center;gap:10px;">
            <div style="font-size:20px;color:var(--m)">◇</div>
            <div style="font-family:var(--display);font-size:12px;letter-spacing:.12em;color:var(--m);">GEMINI</div>
            <div style="font-size:9px;color:var(--text3);line-height:1.5;text-align:center;">Google · Multimodal<br>Massive context</div>
          </div>
          <div class="fl-card" id="fl-ai-skip" onclick="flSelectAI('skip',this)" style="padding:22px 16px;border:1px solid rgba(255,255,255,.08);border-radius:6px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.01);display:flex;flex-direction:column;align-items:center;gap:10px;">
            <div style="font-size:20px;color:var(--text4)">⟳</div>
            <div style="font-family:var(--display);font-size:12px;letter-spacing:.12em;color:var(--text3);">DECIDE LATER</div>
            <div style="font-size:9px;color:var(--text4);line-height:1.5;text-align:center;">Configure in Options<br>anytime</div>
          </div>
        </div>
        <div style="display:flex;gap:12px;">
          <button onclick="flStep(1)" style="font-family:var(--display);font-size:11px;letter-spacing:.15em;padding:11px 28px;border:1px solid rgba(255,255,255,.1);border-radius:4px;background:transparent;color:var(--text3);cursor:pointer;transition:all .2s;" onmouseenter="this.style.color='var(--text)'" onmouseleave="this.style.color='var(--text3)'">← BACK</button>
          <button id="fl-continue-2" onclick="flStep(3)" disabled style="font-family:var(--display);font-size:12px;letter-spacing:.2em;padding:13px 44px;border:1.5px solid rgba(0,212,255,.2);border-radius:4px;background:rgba(0,212,255,.04);color:rgba(0,212,255,.3);cursor:not-allowed;transition:all .25s;">CONTINUE →</button>
        </div>
      </div>

      <!-- Step 3: WHAT WILL YOU BUILD? -->
      <div id="fl-step-3" style="position:relative;z-index:1;display:none;flex-direction:column;align-items:center;max-width:780px;width:90%;padding:40px 20px;text-align:center;">
        <div style="display:flex;gap:8px;margin-bottom:48px;">
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:var(--c);box-shadow:0 0 8px rgba(0,212,255,.6);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
        </div>
        <div style="font-family:var(--display);font-size:46px;letter-spacing:.15em;color:var(--c);text-shadow:0 0 60px rgba(0,212,255,.35);margin-bottom:12px;">WHAT WILL YOU BUILD?</div>
        <div style="font-size:11px;color:var(--text3);letter-spacing:.1em;margin-bottom:40px;">Sets your default workspace and engine configuration.</div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;width:100%;margin-bottom:32px;">
          <div class="fl-card" id="fl-b-apps" onclick="flSelectBuild('apps',this)" style="padding:24px 20px;border:1px solid rgba(255,255,255,.1);border-radius:6px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:flex-start;gap:8px;text-align:left;">
            <div style="font-size:22px;">◉</div>
            <div style="font-family:var(--display);font-size:12px;letter-spacing:.12em;color:var(--text);">APPS & TOOLS</div>
            <div style="font-size:9px;color:var(--text3);line-height:1.6;">Web apps, Electron, APIs, scripts. Full SISO pipeline with build targets.</div>
          </div>
          <div class="fl-card" id="fl-b-scripts" onclick="flSelectBuild('scripts',this)" style="padding:24px 20px;border:1px solid rgba(255,255,255,.1);border-radius:6px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:flex-start;gap:8px;text-align:left;">
            <div style="font-size:22px;">⟁</div>
            <div style="font-family:var(--display);font-size:12px;letter-spacing:.12em;color:var(--text);">SCRIPTS & AUTOMATION</div>
            <div style="font-size:9px;color:var(--text3);line-height:1.6;">Shell scripts, automations, Guardian hooks, browser calltos.</div>
          </div>
          <div class="fl-card" id="fl-b-systems" onclick="flSelectBuild('systems',this)" style="padding:24px 20px;border:1px solid rgba(255,255,255,.1);border-radius:6px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:flex-start;gap:8px;text-align:left;">
            <div style="font-size:22px;">⬡</div>
            <div style="font-family:var(--display);font-size:12px;letter-spacing:.12em;color:var(--text);">SYSTEMS & PLATFORMS</div>
            <div style="font-size:9px;color:var(--text3);line-height:1.6;">Multi-module architectures, APIs, P2P meshes, bridge-connected services.</div>
          </div>
          <div class="fl-card" id="fl-b-research" onclick="flSelectBuild('research',this)" style="padding:24px 20px;border:1px solid rgba(255,255,255,.1);border-radius:6px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:flex-start;gap:8px;text-align:left;">
            <div style="font-size:22px;">∞</div>
            <div style="font-family:var(--display);font-size:12px;letter-spacing:.12em;color:var(--m);">RESEARCH & IDEAS</div>
            <div style="font-size:9px;color:var(--text3);line-height:1.6;">Spatial Void mode. Explore, synthesize, spar with AI. No build pipeline.</div>
          </div>
        </div>
        <div style="display:flex;gap:12px;">
          <button onclick="flStep(2)" style="font-family:var(--display);font-size:11px;letter-spacing:.15em;padding:11px 28px;border:1px solid rgba(255,255,255,.1);border-radius:4px;background:transparent;color:var(--text3);cursor:pointer;transition:all .2s;" onmouseenter="this.style.color='var(--text)'" onmouseleave="this.style.color='var(--text3)'">← BACK</button>
          <button id="fl-continue-3" onclick="flStep(4)" disabled style="font-family:var(--display);font-size:12px;letter-spacing:.2em;padding:13px 44px;border:1.5px solid rgba(0,212,255,.2);border-radius:4px;background:rgba(0,212,255,.04);color:rgba(0,212,255,.3);cursor:not-allowed;transition:all .25s;">CONTINUE →</button>
        </div>
      </div>

      <!-- Step 4: NAME -->
      <div id="fl-step-4" style="position:relative;z-index:1;display:none;flex-direction:column;align-items:center;max-width:520px;width:90%;padding:40px 20px;text-align:center;">
        <div style="display:flex;gap:8px;margin-bottom:48px;">
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:var(--c);box-shadow:0 0 8px rgba(0,212,255,.6);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
        </div>
        <div style="font-family:var(--display);font-size:46px;letter-spacing:.15em;color:var(--c);text-shadow:0 0 60px rgba(0,212,255,.35);margin-bottom:12px;">WHO ARE YOU?</div>
        <div style="font-size:11px;color:var(--text3);letter-spacing:.1em;margin-bottom:40px;">How should NEXUS address you? (Optional)</div>
        <div style="display:flex;flex-direction:column;gap:14px;width:100%;margin-bottom:32px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="font-size:10px;color:var(--text3);letter-spacing:.1em;width:80px;text-align:left;flex-shrink:0;">YOUR NAME</div>
            <input id="fl-name-you" class="finp" placeholder="JAMES" style="flex:1;font-size:13px;font-family:var(--display);letter-spacing:.15em;text-transform:uppercase;text-align:center;" oninput="document.getElementById('fl-name-you').value=this.value.toUpperCase()"/>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="font-size:10px;color:var(--text3);letter-spacing:.1em;width:80px;text-align:left;flex-shrink:0;">USERNAME</div>
            <input id="fl-username" class="finp" placeholder="VISIONARY" style="flex:1;font-size:13px;font-family:var(--display);letter-spacing:.15em;text-transform:uppercase;text-align:center;" oninput="document.getElementById('fl-username').value=this.value.toUpperCase()"/>
          </div>
        </div>
        <div style="display:flex;gap:12px;">
          <button onclick="flStep(3)" style="font-family:var(--display);font-size:11px;letter-spacing:.15em;padding:11px 28px;border:1px solid rgba(255,255,255,.1);border-radius:4px;background:transparent;color:var(--text3);cursor:pointer;transition:all .2s;" onmouseenter="this.style.color='var(--text)'" onmouseleave="this.style.color='var(--text3)'">← BACK</button>
          <button onclick="flStep(5)" style="font-family:var(--display);font-size:12px;letter-spacing:.2em;padding:13px 44px;border:1.5px solid rgba(0,212,255,.4);border-radius:4px;background:rgba(0,212,255,.08);color:var(--c);cursor:pointer;transition:all .25s;" onmouseenter="this.style.background='rgba(0,212,255,.16)'" onmouseleave="this.style.background='rgba(0,212,255,.08)'">CONTINUE →</button>
        </div>
      </div>

      <!-- Step 5: READY -->
      <div id="fl-step-5" style="position:relative;z-index:1;display:none;flex-direction:column;align-items:center;max-width:580px;width:90%;padding:40px 20px;text-align:center;">
        <div style="display:flex;gap:8px;margin-bottom:48px;">
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.15);"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:var(--g);box-shadow:0 0 8px rgba(0,255,136,.6);"></div>
        </div>
        <div style="font-family:var(--display);font-size:66px;letter-spacing:.25em;background:linear-gradient(135deg,var(--c),var(--m));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-shadow:none;margin-bottom:8px;animation:fl-in .8s ease both;">NEXUS</div>
        <div id="fl-ready-name" style="font-family:var(--display);font-size:20px;letter-spacing:.3em;color:var(--text);margin-bottom:32px;animation:fl-in .8s .1s ease both;"></div>
        <div id="fl-ready-summary" style="font-size:10px;color:var(--text3);line-height:2;margin-bottom:40px;animation:fl-in .8s .2s ease both;"></div>
        <button onclick="flFinish()" style="font-family:var(--display);font-size:14px;letter-spacing:.25em;padding:16px 60px;border:1.5px solid rgba(0,212,255,.5);border-radius:4px;background:linear-gradient(135deg,rgba(0,212,255,.12),rgba(204,68,255,.1));color:var(--c);cursor:pointer;transition:all .3s;animation:fl-in .8s .3s ease both;box-shadow:0 0 40px rgba(0,212,255,.12);" onmouseenter="this.style.background='linear-gradient(135deg,rgba(0,212,255,.22),rgba(204,68,255,.18))';this.style.boxShadow='0 0 60px rgba(0,212,255,.25)'" onmouseleave="this.style.background='linear-gradient(135deg,rgba(0,212,255,.12),rgba(204,68,255,.1))';this.style.boxShadow='0 0 40px rgba(0,212,255,.12)'">
          ENTER NEXUS
        </button>
        <div onclick="flFinish()" style="margin-top:16px;font-size:9px;color:var(--text4);cursor:pointer;letter-spacing:.12em;text-transform:uppercase;transition:color .2s;animation:fl-in .8s .4s ease both;" onmouseenter="this.style.color='var(--text2)'" onmouseleave="this.style.color='var(--text4)'">ENTER NEXUS →</div>
      </div>

      <style>
        @keyframes fl-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .fl-card:hover{border-color:rgba(0,212,255,.4)!important;background:rgba(0,212,255,.04)!important;}
        .fl-card-sel{border-color:rgba(0,212,255,.6)!important;background:rgba(0,212,255,.08)!important;box-shadow:0 0 20px rgba(0,212,255,.1);}
      </style>
    `;

    nxWelcomeCanvas('fl-canvas');

    // State
    window._fl = { audience:null, ai:null, build:null };
  }

  window.flSelectAudience = function(val, el) {
    window._fl.audience = val;
    document.querySelectorAll('#fl-audience-grid .fl-card').forEach(c => c.classList.remove('fl-card-sel'));
    el.classList.add('fl-card-sel');
    const btn = document.getElementById('fl-continue-1');
    if(btn){ btn.disabled=false; btn.style.cursor='pointer'; btn.style.color='var(--c)'; btn.style.borderColor='rgba(0,212,255,.5)'; btn.style.background='rgba(0,212,255,.08)'; }
  };

  window.flSelectAI = function(val, el) {
    window._fl.ai = val;
    document.querySelectorAll('#fl-step-2 .fl-card').forEach(c => c.classList.remove('fl-card-sel'));
    el.classList.add('fl-card-sel');
    const btn = document.getElementById('fl-continue-2');
    if(btn){ btn.disabled=false; btn.style.cursor='pointer'; btn.style.color='var(--c)'; btn.style.borderColor='rgba(0,212,255,.5)'; btn.style.background='rgba(0,212,255,.08)'; }
  };

  window.flSelectBuild = function(val, el) {
    window._fl.build = val;
    document.querySelectorAll('#fl-step-3 .fl-card').forEach(c => c.classList.remove('fl-card-sel'));
    el.classList.add('fl-card-sel');
    const btn = document.getElementById('fl-continue-3');
    if(btn){ btn.disabled=false; btn.style.cursor='pointer'; btn.style.color='var(--c)'; btn.style.borderColor='rgba(0,212,255,.5)'; btn.style.background='rgba(0,212,255,.08)'; }
  };

  window.flStep = function(n) {
    for(let i=1;i<=5;i++){
      const s = document.getElementById('fl-step-'+i);
      if(s) s.style.display = i===n ? 'flex' : 'none';
    }
    if(n===5) _flPopulateReady();
  };

  function _flPopulateReady(){
    const name = (document.getElementById('fl-name-you')?.value||'').trim() || 'VISIONARY';
    const username = (document.getElementById('fl-username')?.value||'').trim() || name;
    const aiLabels = {ollama:'Ollama (local)',claude:'Claude',chatgpt:'ChatGPT',deepseek:'DeepSeek',gemini:'Gemini',skip:'Configure later'};
    const buildLabels = {apps:'Apps & Tools',scripts:'Scripts & Automation',systems:'Systems & Platforms',research:'Research & Ideas'};
    const audienceLabels = {personal:'Personal',team:'Team',client:'Client'};
    const nameEl = document.getElementById('fl-ready-name');
    const sumEl  = document.getElementById('fl-ready-summary');
    if(nameEl) nameEl.textContent = name;
    if(sumEl) sumEl.innerHTML =
      `<span style="color:var(--c)">${audienceLabels[window._fl.audience]||'—'}</span> build · ` +
      `<span style="color:var(--g)">${aiLabels[window._fl.ai]||'—'}</span> · ` +
      `<span style="color:var(--m)">${buildLabels[window._fl.build]||'—'}</span>`;
    window._fl.name = name;
    window._fl.username = username;
  }

  window.flFinish = function(){
    const fl = document.getElementById('nx-first-launch');
    // Save choices
    const cfg = {};
    if(window._fl.name) { cfg.userName = window._fl.name; localStorage.setItem('nx_welcome_name', window._fl.name); }
    if(window._fl.username) { cfg.username = window._fl.username; localStorage.setItem('nx6_username', window._fl.username); }
    if(window._fl.audience) localStorage.setItem('nx6_audience', window._fl.audience);
    if(window._fl.build) localStorage.setItem('nx6_build_type', window._fl.build);
    if(window._fl.ai && window._fl.ai !== 'skip') {
      localStorage.setItem('nx6_last_provider', window._fl.ai);
      if(typeof AI !== 'undefined') AI.provider = window._fl.ai;
    }
    // Set username in header
    const uEl = document.getElementById('opt-username');
    if(uEl && window._fl.username) uEl.value = window._fl.username;
    // Mark setup complete
    localStorage.setItem('nx6_setup_complete', '1');
    // Save to config
    try {
      const existing = JSON.parse(localStorage.getItem('nx6_cfg')||'{}');
      localStorage.setItem('nx6_cfg', JSON.stringify({...existing,...cfg}));
    } catch {}
    // Dismiss
    if(fl){ fl.style.transition='opacity .7s'; fl.style.opacity='0'; setTimeout(()=>{ fl.style.display='none'; fl.remove(); },800); }
    // Proceed to normal login flow (AI login picker or home)
    setTimeout(()=>{
      if(window._fl.ai && window._fl.ai !== 'skip'){
        // Skip login, go straight to home with chosen provider
        if(typeof loginSkip === 'function') loginSkip();
      } else {
        if(typeof bootLoginFlow === 'function') {
          // Restore original bootLoginFlow (show AI picker)
          const orig = typeof showLoginFlow === 'function' ? showLoginFlow : null;
          if(orig) orig();
          else if(typeof bootLoginFlow === 'function') {
            const overlay = document.getElementById('ai-login-overlay');
            if(overlay){ overlay.style.display='flex'; if(typeof loginInitCanvas==='function') loginInitCanvas(); if(typeof loginRenderProviders==='function') loginRenderProviders(); }
          }
        }
      }
    }, 900);
    log_ev('startup:first-launch',{audience:window._fl.audience,ai:window._fl.ai,build:window._fl.build},'INFO');
  };

  // ── P2.2: Beautiful welcome-back screen ──────────────────────────────────
  function nxShowWelcomeBack(provider, cfg){
    // Get names from profile or defaults
    const name1 = cfg.userName || localStorage.getItem('nx_welcome_name') || 'JAMES';
    const name2 = cfg.partnerName || localStorage.getItem('nx_partner_name') || 'RAVEN';
    const providerLabel = {
      chatgpt:'ChatGPT', claude:'Claude', ollama:'Ollama', lmstudio:'LM Studio',
      gemini:'Gemini', grok:'Grok', deepseek:'DeepSeek', local:'Local AI'
    }[provider] || provider?.toUpperCase() || 'AI';
    const providerColor = {
      chatgpt:'var(--g)', claude:'var(--o)', ollama:'var(--c)', lmstudio:'var(--m)',
      gemini:'var(--c)', grok:'var(--y)', deepseek:'var(--c)', local:'var(--text2)'
    }[provider] || 'var(--c)';

    // Inject welcome-back overlay if not already present
    let wb = document.getElementById('nx-welcome-back');
    if(!wb){
      wb = document.createElement('div');
      wb.id = 'nx-welcome-back';
      wb.style.cssText = `
        position:fixed;inset:0;z-index:1950;
        background:#020510;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        overflow:hidden;font-family:var(--mono);
      `;
      document.body.appendChild(wb);
    }

    wb.style.display = 'flex';
    wb.innerHTML = `
      <canvas id="wb-canvas" style="position:absolute;inset:0;z-index:0;pointer-events:none;"></canvas>
      <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:0;text-align:center;max-width:600px;padding:40px;">

        <!-- Logo -->
        <div style="font-family:var(--display);font-size:60px;letter-spacing:.35em;
          background:linear-gradient(135deg,var(--c),var(--m));-webkit-background-clip:text;
          -webkit-text-fill-color:transparent;background-clip:text;
          animation:wb-fade-in 1s ease both;margin-bottom:4px;">NEXUS</div>

        <!-- Version -->
        <div style="font-size:9px;color:var(--text3);letter-spacing:.25em;margin-bottom:32px;animation:wb-fade-in .9s .1s ease both;">
          v0.53.0 · NEXUS Cognitive OS · Ollama Ready
        </div>

        <!-- Welcome greeting -->
        <div style="font-size:11px;color:var(--text3);letter-spacing:.2em;text-transform:uppercase;margin-bottom:8px;animation:wb-fade-in .9s .2s ease both;">
          Welcome back
        </div>

        <!-- Names -->
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:36px;animation:wb-fade-in .9s .3s ease both;">
          <div style="font-family:var(--display);font-size:32px;letter-spacing:.25em;color:var(--c);
            text-shadow:0 0 30px rgba(0,212,255,.5);" id="wb-name1">${name1}</div>
          <div style="color:var(--text4);font-size:20px;">+</div>
          <div style="font-family:var(--display);font-size:32px;letter-spacing:.25em;color:var(--m);
            text-shadow:0 0 30px rgba(204,68,255,.4);" id="wb-name2">${name2}</div>
        </div>

        <!-- AI status -->
        <div style="display:flex;align-items:center;gap:8px;padding:8px 18px;
          background:rgba(0,212,255,.04);border:1px solid rgba(0,212,255,.15);border-radius:4px;
          margin-bottom:28px;animation:wb-fade-in .9s .4s ease both;">
          <div style="width:7px;height:7px;border-radius:50%;background:${providerColor};
            box-shadow:0 0 8px ${providerColor};animation:pulse .8s ease-in-out infinite;flex-shrink:0;"></div>
          <span style="font-size:10px;color:var(--text2);">
            <span style="color:${providerColor};font-weight:700;">${providerLabel}</span>
            <span style="color:var(--text3);"> · ready</span>
          </span>
        </div>

        <!-- Hook health -->
        <div id="wb-health" style="font-size:9px;color:var(--text4);margin-bottom:28px;animation:wb-fade-in .9s .5s ease both;">
          Loading systems…
        </div>

        <!-- Enter button -->
        <button id="wb-enter-btn" onclick="nxWelcomeEnter()"
          style="font-family:var(--display);font-size:14px;letter-spacing:.25em;
            padding:14px 48px;background:linear-gradient(135deg,rgba(0,212,255,.12),rgba(204,68,255,.12));
            border:1.5px solid rgba(0,212,255,.4);border-radius:4px;color:var(--c);
            cursor:pointer;transition:all .25s;animation:wb-fade-in .9s .6s ease both;
            box-shadow:0 0 40px rgba(0,212,255,.1);"
          onmouseenter="this.style.background='linear-gradient(135deg,rgba(0,212,255,.22),rgba(204,68,255,.18))';this.style.boxShadow='0 0 60px rgba(0,212,255,.25)'"
          onmouseleave="this.style.background='linear-gradient(135deg,rgba(0,212,255,.12),rgba(204,68,255,.12))';this.style.boxShadow='0 0 40px rgba(0,212,255,.1)'">
          ENTER
        </button>

        <!-- Skip/switch links -->
        <div style="margin-top:16px;display:flex;gap:14px;animation:wb-fade-in .9s .7s ease both;">
          <span onclick="nxWelcomeEnter()" style="font-size:9px;color:var(--text4);cursor:pointer;letter-spacing:.12em;text-transform:uppercase;transition:color .2s" onmouseenter="this.style.color='var(--text2)'" onmouseleave="this.style.color='var(--text4)'">ENTER NEXUS →</span>
          <span onclick="nxWelcomeSwitch()" style="font-size:9px;color:var(--text4);cursor:pointer;letter-spacing:.12em;text-transform:uppercase;transition:color .2s" onmouseenter="this.style.color='var(--text2)'" onmouseleave="this.style.color='var(--text4)'">SWITCH AI</span>
        </div>
      </div>
      <style>
        @keyframes wb-fade-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      </style>
    `;

    // Star canvas
    nxWelcomeCanvas('wb-canvas');

    // Update health once NEXUS is ready
    setTimeout(()=>{
      if(window.NEXUS?.ready){
        const h = NEXUS.healthScore();
        const el = document.getElementById('wb-health');
        if(el) el.innerHTML =
          `<span style="color:${h.score>=80?'var(--g)':h.score>=50?'var(--y)':'var(--r)'}">${h.score}%</span>` +
          ` health · ${h.passing}/${h.active} hooks passing · ${NEXUS.allHooks().length} registered`;
      }
    }, 1200);

    // No auto-enter — user must click ENTER (removed 8s timer, was firing before user read screen)
  }

  function nxWelcomeCanvas(canvasId){
    const c = document.getElementById(canvasId); if(!c) return;
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const pts = Array.from({length:120},()=>({
      x:Math.random()*c.width, y:Math.random()*c.height,
      r:Math.random()*1.2+.2, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
      o:Math.random()*.6+.1,
    }));
    let raf;
    function draw(){
      if(!document.getElementById(canvasId)){ cancelAnimationFrame(raf); return; }
      ctx.clearRect(0,0,c.width,c.height);
      // Nebula
      const ng=ctx.createRadialGradient(c.width*.3,c.height*.4,0,c.width*.3,c.height*.4,c.width*.6);
      ng.addColorStop(0,'rgba(0,212,255,.035)'); ng.addColorStop(1,'transparent');
      ctx.fillStyle=ng; ctx.fillRect(0,0,c.width,c.height);
      const ng2=ctx.createRadialGradient(c.width*.7,c.height*.6,0,c.width*.7,c.height*.6,c.width*.5);
      ng2.addColorStop(0,'rgba(204,68,255,.025)'); ng2.addColorStop(1,'transparent');
      ctx.fillStyle=ng2; ctx.fillRect(0,0,c.width,c.height);
      // Stars
      pts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=c.width; if(p.x>c.width)p.x=0;
        if(p.y<0)p.y=c.height; if(p.y>c.height)p.y=0;
        p.o+=.008*(Math.random()>.5?1:-1); p.o=Math.max(.05,Math.min(.7,p.o));
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(0,212,255,${p.o})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
  }

  window.nxWelcomeEnter = function(){
    const wb = document.getElementById('nx-welcome-back');
    if(wb){ wb.style.transition='opacity .6s'; wb.style.opacity='0'; setTimeout(()=>{ wb.style.display='none'; wb.remove(); },700); }
    // Set AI provider from saved config
    if(lastProvider && typeof onProviderChange==='function'){
      const provEl = document.getElementById('opt-ai-provider');
      if(provEl){ provEl.value=lastProvider; onProviderChange(); }
    }
    log_ev('startup:welcome-back',{provider:lastProvider||'none'},'INFO');
  };

  window.nxWelcomeSwitch = function(){
    const wb = document.getElementById('nx-welcome-back');
    if(wb){ wb.style.display='none'; }
    if(typeof showLoginFlow==='function') showLoginFlow();
  };

  // ── P2.3: Hook-connected header dots ─────────────────────────────────────
  // Replace static pills with live hook dots (click → open settings)
  function nxInjectHeaderDots(){
    // Only inject once
    if(document.getElementById('nx-header-dots')) return;
    const topbar = document.getElementById('top-bar');
    if(!topbar) return;

    const dotBar = document.createElement('div');
    dotBar.id = 'nx-header-dots';
    dotBar.style.cssText = 'display:flex;align-items:center;gap:4px;margin-left:6px;';

    // Dot definitions: [hookPrefix, label, settingsPath, color]
    const dotDefs = [
      ['bridge', 'BRIDGE', 'options.bridge.nexus',  'var(--c)'],
      ['ai',     'AI',     'options.bridge.ai',     'var(--g)'],
      ['ext',    'EXT',    'options.bridge.extension','var(--m)'],
      ['diag',   'DIAG',   'options.diagnostics',   'var(--y)'],
    ];

    dotDefs.forEach(([prefix, label, path, color])=>{
      const dot = document.createElement('div');
      dot.id = 'nxhd-'+prefix;
      dot.title = label+' — click to open settings';
      dot.style.cssText = `
        width:8px;height:8px;border-radius:50%;background:var(--text4);
        cursor:pointer;transition:all .3s;flex-shrink:0;
        border:1px solid rgba(255,255,255,.1);
      `;
      dot.addEventListener('click',()=>{
        NEXUS?.bus?.emit('nexus:navigate:settings',{payload:{path}});
        if(typeof switchTab==='function') switchTab('options');
      });
      dot.addEventListener('mouseenter',()=>{
        dot.style.transform='scale(1.4)';
        // tooltip
        let tt=document.getElementById('nxhd-tt');
        if(!tt){tt=document.createElement('div');tt.id='nxhd-tt';tt.style.cssText='position:fixed;background:var(--bg1);border:1px solid var(--border2);border-radius:3px;padding:3px 8px;font-family:var(--mono);font-size:9px;color:var(--text2);z-index:9999;pointer-events:none;';document.body.appendChild(tt);}
        tt.textContent=label;
        const r=dot.getBoundingClientRect();
        tt.style.left=(r.left-10)+'px'; tt.style.top=(r.bottom+4)+'px'; tt.style.display='';
      });
      dot.addEventListener('mouseleave',()=>{
        dot.style.transform='';
        const tt=document.getElementById('nxhd-tt'); if(tt) tt.style.display='none';
      });
      dotBar.appendChild(dot);
    });

    // Insert after the logo/ver
    const logo = topbar.querySelector('.nxlogo');
    if(logo?.nextSibling) topbar.insertBefore(dotBar, logo.nextSibling.nextSibling);
    else topbar.prepend(dotBar);

    // Dot updates now owned by nexus-bridge-sync.js (NexusBridgeSync)
    // It drives all dots from live BroadcastChannel state — not hook test results.
  }

  // Run after DOM ready
  if(document.readyState==='complete'||document.readyState==='interactive'){
    setTimeout(nxInjectHeaderDots, 600);
  } else {
    window.addEventListener('load',()=>setTimeout(nxInjectHeaderDots,600));
  }

})();

// ── Project Import System ─────────────────────────────────────────────────────
function nxImportProject(){
  const inp = document.getElementById('nx-import-file-input');
  if(inp){ inp.value=''; inp.click(); }
}

async function nxHandleImportFiles(event){
  const files = Array.from(event.target.files||[]);
  if(!files.length) return;
  let imported = 0;
  for(const file of files){
    try{
      if(file.name.endsWith('.json')){
        const text = await file.text();
        let data;
        try{ data = JSON.parse(text); }catch{ toast('Invalid JSON: '+file.name,'err'); continue; }
        // NEXUS project export format
        if(Array.isArray(data)){
          data.forEach(p=>{ if(p.name&&(p.code||p.content)) saveNewProject(p.name,p.code||p.content||'',p.description||'Imported'); imported++; });
        } else if(data.name&&(data.code||data.content)){
          saveNewProject(data.name,data.code||data.content||'',data.description||'Imported from JSON');
          imported++;
        } else {
          // Treat as code file
          saveNewProject(file.name.replace('.json',''), text, 'Imported JSON');
          imported++;
        }
      } else if(file.name.endsWith('.zip')){
        // Load into FORGE editor + save as project
        const text = `[ZIP] ${file.name} (${(file.size/1024).toFixed(1)}KB)\n\nZIP contents require extraction. Drag this file into FORGE IDE to analyze, or use the COMPILE panel to process.`;
        const pid = saveNewProject(file.name.replace('.zip',''), text, 'Imported ZIP — extract via FORGE');
        // Also open in FORGE if forgeLoadPath is available
        if(window.FORGE?.analyze){ toast('ZIP imported — open FORGE IDE to analyze','info'); }
        imported++;
      } else {
        // Source files — open in FORGE editor AND save to projects
        const text = await file.text();
        const ext = file.name.split('.').pop();
        const langMap = {js:'javascript',ts:'typescript',py:'python',html:'html',css:'css',md:'markdown',json:'json',go:'go',rs:'rust'};
        const lang = langMap[ext]||'auto';
        // Open in FORGE editor
        if(window.FORGE?.files){
          const fid = 'file-'+Date.now()+'-'+Math.random().toString(36).slice(2,6);
          FORGE.files[fid] = {id:fid, name:file.name, content:text, lang, modified:false};
          if(typeof forgeActivateFile==='function') forgeActivateFile(fid);
          if(typeof forgeRenderTabs==='function') forgeRenderTabs();
          if(typeof forgeRenderFileTree==='function') forgeRenderFileTree();
        }
        // Save to projects
        saveNewProject(file.name, text, 'Imported from file');
        imported++;
      }
    } catch(e){ toast('Import failed: '+file.name+' — '+e.message,'err'); }
  }
  if(imported>0){
    toast(imported+' file'+(imported>1?'s':'')+' imported to Projects','ok');
    switchTab('projects');
  }
}

// ── nxUpdateHeaderPills also called on login ──────────────────────────────────
// Hook into loginSuccess to update pills immediately
const _origLoginSuccess = typeof loginSuccess === 'function' ? loginSuccess : null;
if(_origLoginSuccess){
  window.loginSuccess = function(provider, mode){
    _origLoginSuccess(provider, mode);
    setTimeout(nxUpdateHeaderPills, 200);
  };
}

// ── npm install / compile runner panel ───────────────────────────────────────
function nxInjectNpmPanel() {
  const compilePanel = document.getElementById('forge-mode-compile');
  if (!compilePanel) return;
  if (document.getElementById('nx-npm-panel')) return;

  const wrap = document.createElement('div');
  wrap.id = 'nx-npm-panel';
  wrap.style.cssText = 'border-top:1px solid var(--border2);padding:12px 16px;flex-shrink:0;background:var(--bg2);';
  wrap.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
      <span style="font-family:var(--display);font-size:10px;letter-spacing:.18em;color:var(--o)">⬡ NPM RUNNER</span>
      <div id="nx-npm-status-dot" style="width:7px;height:7px;border-radius:50%;background:var(--text4);flex-shrink:0;"></div>
      <span id="nx-npm-status-txt" style="font-size:9px;color:var(--text3);">idle</span>
      <button onclick="nxNpmAbort()" id="nx-npm-abort-btn" style="display:none;margin-left:auto;background:none;border:1px solid rgba(255,45,85,.3);border-radius:2px;color:var(--r);font-family:var(--mono);font-size:8px;padding:2px 7px;cursor:pointer;">■ ABORT</button>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
      <button onclick="nxNpmRun('install')" class="btn" style="font-size:9px;color:var(--g);border-color:rgba(0,255,136,.3);">npm install</button>
      <button onclick="nxNpmRun('install --legacy-peer-deps')" class="btn" style="font-size:9px;">+ legacy-peer-deps</button>
      <button onclick="nxNpmRun('run build')" class="btn" style="font-size:9px;color:var(--o);border-color:rgba(255,107,53,.3);">npm run build</button>
      <button onclick="nxNpmRun('run start')" class="btn" style="font-size:9px;color:var(--c);">npm start</button>
      <button onclick="nxNpmRun('run test')" class="btn" style="font-size:9px;color:var(--m);">npm test</button>
    </div>
    <div style="display:flex;gap:4px;margin-bottom:6px;">
      <input id="nx-npm-custom" class="finp" placeholder="custom command… e.g. install express" style="flex:1;font-size:9px;"/>
      <button onclick="nxNpmRunCustom()" class="btn" style="font-size:9px;color:var(--c);">▶ RUN</button>
    </div>
    <div id="nx-npm-log" style="background:var(--bg);border:1px solid var(--border);border-radius:3px;padding:8px;font-family:var(--mono);font-size:9px;color:var(--text2);max-height:160px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;line-height:1.6;">Ready.</div>
  `;
  compilePanel.appendChild(wrap);
}

let _npmAbortCtrl = null;
async function nxNpmRun(cmd) {
  const dot = document.getElementById('nx-npm-status-dot');
  const txt = document.getElementById('nx-npm-status-txt');
  const log = document.getElementById('nx-npm-log');
  const abortBtn = document.getElementById('nx-npm-abort-btn');
  if (!log) return;

  if (dot) { dot.style.background='var(--y)'; dot.style.animation='pulse .6s infinite'; }
  if (txt) txt.textContent = 'running: npm ' + cmd;
  if (abortBtn) abortBtn.style.display = 'inline-block';
  log.textContent = '$ npm ' + cmd + '\n';

  // Use bridge if available, else show instructions
  try {
    const bridgeUrl = document.getElementById('bridge-url')?.value || 'http://127.0.0.1:3747';
    const f = FORGE?.activeFile ? FORGE.files[FORGE.activeFile] : null;
    const cwd = window._nexusWorkDir || '.';

    _npmAbortCtrl = new AbortController();
    const r = await fetch(bridgeUrl + '/bridge/cli', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'npm ' + cmd, cwd }),
      signal: _npmAbortCtrl.signal,
    });

    if (r.ok) {
      const data = await r.json();
      log.textContent += (data.output || data.stdout || 'Done.') + '\n';
      if (dot) { dot.style.background = data.ok===false ? 'var(--r)' : 'var(--g)'; dot.style.animation=''; }
      if (txt) txt.textContent = data.ok===false ? 'failed' : 'complete';
    } else {
      throw new Error('Bridge returned ' + r.status);
    }
  } catch(e) {
    if (e.name === 'AbortError') {
      log.textContent += '\n[ABORTED]';
      if (dot) { dot.style.background='var(--y)'; dot.style.animation=''; }
      if (txt) txt.textContent = 'aborted';
    } else {
      log.textContent += '\n[Bridge offline] — open a terminal and run:\n  npm ' + cmd + '\n\nOr start the NEXUS bridge first.';
      if (dot) { dot.style.background='var(--r)'; dot.style.animation=''; }
      if (txt) txt.textContent = 'bridge offline';
    }
  }
  if (abortBtn) abortBtn.style.display = 'none';
  _npmAbortCtrl = null;
  const el = document.getElementById('nx-npm-log');
  if (el) el.scrollTop = el.scrollHeight;
}

function nxNpmRunCustom() {
  const cmd = document.getElementById('nx-npm-custom')?.value?.trim();
  if (!cmd) return;
  nxNpmRun(cmd);
}

function nxNpmAbort() {
  _npmAbortCtrl?.abort();
}

// ── Import projects into NEXUS ────────────────────────────────────────────────
function nxInjectProjectImport() {
  // Add import button to the projects tab if not already there
  const projHeader = document.querySelector('#tab-projects [style*="display:flex"]') ||
                     document.querySelector('#tab-projects .scroll-area');
  if (!projHeader || document.getElementById('nx-proj-import-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'nx-proj-import-btn';
  btn.className = 'btn accent';
  btn.style.cssText = 'font-size:9px;padding:3px 10px;';
  btn.textContent = '⬇ IMPORT PROJECT';
  btn.onclick = nxImportProjectDialog;
  projHeader.insertBefore(btn, projHeader.firstChild);
}

async function nxImportProjectDialog() {
  // Create a hidden file input for project import
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.zip,.html,.js,.ts,.py,.md,.nexus';
  input.multiple = true;
  input.style.display = 'none';
  document.body.appendChild(input);

  input.addEventListener('change', async () => {
    for (const file of input.files) {
      await nxImportProjectFile(file);
    }
    document.body.removeChild(input);
  });
  input.click();
}

async function nxImportProjectFile(file) {
  const name = file.name.replace(/\.[^.]+$/, '');
  const ext  = file.name.split('.').pop().toLowerCase();

  try {
    const text = await file.text();

    if (ext === 'json') {
      // Try parsing as NEXUS project export
      let data;
      try { data = JSON.parse(text); } catch { data = null; }

      if (data && Array.isArray(data)) {
        // Array of projects
        let count = 0;
        data.forEach(p => {
          if (p.name && (p.code || p.content)) {
            saveNewProject(p.name, p.code||p.content, p.description||'Imported from '+file.name);
            count++;
          }
        });
        toast(`Imported ${count} projects from ${file.name}`, 'ok');
        return;
      }
      if (data && data.name && (data.code || data.content)) {
        saveNewProject(data.name, data.code||data.content, data.description||'Imported');
        toast('Imported: ' + data.name, 'ok');
        return;
      }
      // Generic JSON — save as data project
      saveNewProject(name, text, 'Imported JSON: ' + file.name);
      toast('Imported JSON: ' + name, 'ok');
      return;
    }

    if (ext === 'zip') {
      // Can't unzip in browser without library — open in FORGE IDE instead
      toast('ZIP: drag into FORGE IDE drop zone to open files directly', 'info');
      return;
    }

    // Source file — open in FORGE IDE + save to projects
    if (['html','js','ts','jsx','tsx','py','go','rs','php','css','md'].includes(ext)) {
      // Open in FORGE IDE
      if (typeof FORGE !== 'undefined' && FORGE.files !== undefined) {
        const fileId = 'file-' + Date.now();
        FORGE.files[fileId] = { id:fileId, name:file.name, content:text, lang:ext, modified:false };
        FORGE.activeFile = fileId;
        if (typeof forgeActivateFile === 'function') forgeActivateFile(fileId);
        if (typeof forgeRenderTabs === 'function') forgeRenderTabs();
        switchTab('forge');
      }
      saveNewProject(name, text, 'Imported: ' + file.name);
      toast('Imported + opened: ' + file.name, 'ok');
      return;
    }

    // Fallback
    saveNewProject(name, text, 'Imported: ' + file.name);
    toast('Imported: ' + name, 'ok');

  } catch(e) {
    toast('Import failed: ' + e.message, 'err');
    nxError('IMPORT_FAIL', 'Project import failed: ' + file.name, e.message);
  }
}

// ── Shared helper ─────────────────────────────────────────────────────────────
function _escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // Replace static tabs with full TEST tab including Bridge + Extension sections
  const diagPanel = document.getElementById('nx-diag-tabs');
  if (diagPanel) {
    // Add the TESTS tab if not present
    if (!document.querySelector('[onclick*="nxDiagTab(\'tests\'"]')) {
      const testsBtn = document.createElement('button');
      testsBtn.className = 'nx-dtab';
      testsBtn.setAttribute('onclick', "nxDiagTab('tests',this)");
      testsBtn.textContent = 'TESTS';
      diagPanel.insertBefore(testsBtn, diagPanel.querySelector('[onclick*="nxDiagClear"]'));
    }
  }

  // ── Build the TESTS panel content ────────────────────────────────────────
  const existingDpPw = document.getElementById('nx-dp-pw');
  if (existingDpPw) {
    // Inject tests panel after pw panel
    const testsPanel = document.createElement('div');
    testsPanel.className = 'nx-dpanel';
    testsPanel.id = 'nx-dp-tests';
    testsPanel.innerHTML = _buildTestsPanelHTML();
    existingDpPw.after(testsPanel);
    _bindTestsPanel();
  }

  // ── Extension + Profile indicator in diag panel stats ────────────────────
  const statsPanel = document.getElementById('nx-dp-stats');
  if (statsPanel) {
    statsPanel.innerHTML += _buildExtProfileHTML();
    _startExtensionMonitor();
  }
});

// ── Tests panel HTML ─────────────────────────────────────────────────────────
function _buildTestsPanelHTML() {
  return `
  <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;">
    <!-- Bridge section -->
    <div style="flex-shrink:0;padding:8px 10px;background:var(--bg2);border-bottom:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-family:var(--display);font-size:10px;letter-spacing:.14em;color:var(--c)">⬡ BRIDGE</span>
        <div id="nxt-bridge-dot" style="width:7px;height:7px;border-radius:50%;background:var(--text4);flex-shrink:0"></div>
        <span id="nxt-bridge-status" style="font-size:9px;color:var(--text3)">checking…</span>
        <div style="margin-left:auto;display:flex;gap:4px;">
          <button onclick="nxtBridgePing()" style="background:none;border:1px solid var(--border2);border-radius:2px;color:var(--text3);font-family:var(--mono);font-size:8px;padding:2px 7px;cursor:pointer;" onmouseenter="this.style.borderColor='var(--c)';this.style.color='var(--c)'" onmouseleave="this.style.borderColor='var(--border2)';this.style.color='var(--text3)'">PING</button>
          <button onclick="nxtBridgeStart()" id="nxt-bridge-start-btn" style="background:none;border:1px solid rgba(0,255,136,.3);border-radius:2px;color:var(--g);font-family:var(--mono);font-size:8px;padding:2px 7px;cursor:pointer;" onmouseenter="this.style.background='rgba(0,255,136,.08)'" onmouseleave="this.style.background='none'">START</button>
          <button onclick="nxtBridgeRestart()" style="background:none;border:1px solid rgba(255,204,0,.25);border-radius:2px;color:var(--y);font-family:var(--mono);font-size:8px;padding:2px 7px;cursor:pointer;" onmouseenter="this.style.background='rgba(255,204,0,.06)'" onmouseleave="this.style.background='none'">RESTART</button>
        </div>
      </div>
      <div id="nxt-bridge-detail" style="font-size:9px;color:var(--text3);font-family:var(--mono);line-height:1.5;"></div>
    </div>
    <!-- Extension section -->
    <div style="flex-shrink:0;padding:8px 10px;background:var(--bg1);border-bottom:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <span style="font-family:var(--display);font-size:10px;letter-spacing:.14em;color:var(--c)">🦊 EXTENSION</span>
        <div id="nxt-ext-dot" style="width:7px;height:7px;border-radius:50%;background:var(--text4);flex-shrink:0"></div>
        <span id="nxt-ext-status" style="font-size:9px;color:var(--text3)">not connected</span>
        <button onclick="nxtExtCheck()" style="margin-left:auto;background:none;border:1px solid var(--border2);border-radius:2px;color:var(--text3);font-family:var(--mono);font-size:8px;padding:2px 7px;cursor:pointer;" onmouseenter="this.style.borderColor='var(--c)'" onmouseleave="this.style.borderColor='var(--border2)'">CHECK</button>
      </div>
      <div id="nxt-ext-profile" style="font-size:9px;color:var(--text3);font-family:var(--mono);line-height:1.5;"></div>
    </div>
    <!-- Hook tests section -->
    <div style="flex-shrink:0;padding:6px 10px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;gap:6px;align-items:center;">
      <span style="font-family:var(--display);font-size:10px;letter-spacing:.14em;color:var(--c)">⬡ HOOK TESTS</span>
      <span id="nxt-hook-score" style="font-size:9px;color:var(--text3)">—</span>
      <button onclick="nxtRunAllHooks()" style="margin-left:auto;background:none;border:1px solid rgba(0,212,255,.3);border-radius:2px;color:var(--c);font-family:var(--mono);font-size:8px;font-weight:700;padding:3px 10px;cursor:pointer;" onmouseenter="this.style.background='rgba(0,212,255,.06)'" onmouseleave="this.style.background='none'">▶ RUN ALL</button>
      <button onclick="nxtExportHooks('json')" style="background:none;border:1px solid var(--border2);border-radius:2px;color:var(--text3);font-family:var(--mono);font-size:8px;padding:3px 7px;cursor:pointer;">↓ JSON</button>
      <button onclick="nxtExportHooks('csv')" style="background:none;border:1px solid var(--border2);border-radius:2px;color:var(--text3);font-family:var(--mono);font-size:8px;padding:3px 7px;cursor:pointer;">↓ CSV</button>
    </div>
    <!-- Hook filter -->
    <div style="flex-shrink:0;padding:4px 10px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;gap:5px;">
      <input id="nxt-hook-search" type="text" placeholder="Filter hooks…" style="flex:1;background:var(--bg3);border:1px solid var(--border2);border-radius:2px;color:var(--text);font-family:var(--mono);font-size:9px;padding:3px 6px;outline:none;" oninput="nxtRenderHooks()">
      <select id="nxt-hook-prefix" onchange="nxtRenderHooks()" style="background:var(--bg3);border:1px solid var(--border2);border-radius:2px;color:var(--text3);font-family:var(--mono);font-size:9px;padding:3px 5px;outline:none;">
        <option value="">All</option>
        <option value="bridge">bridge</option>
        <option value="ai">ai</option>
        <option value="compiler">compiler</option>
        <option value="ext">ext</option>
        <option value="diag">diag</option>
      </select>
      <select id="nxt-hook-status" onchange="nxtRenderHooks()" style="background:var(--bg3);border:1px solid var(--border2);border-radius:2px;color:var(--text3);font-family:var(--mono);font-size:9px;padding:3px 5px;outline:none;">
        <option value="">All status</option>
        <option value="active">Active</option>
        <option value="planned">Planned</option>
        <option value="fail">Failing</option>
        <option value="pass">Passing</option>
      </select>
    </div>
    <!-- Hook list -->
    <div id="nxt-hook-list" style="flex:1;overflow-y:auto;padding:4px 0;font-family:var(--mono);font-size:9px;"></div>
    <!-- Guardian current page test -->
    <div style="flex-shrink:0;padding:7px 10px;background:var(--bg2);border-top:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <span style="font-family:var(--display);font-size:10px;letter-spacing:.14em;color:var(--c)">⬡ GUARDIAN</span>
        <span id="nxt-pw-page" style="font-size:9px;color:var(--text3);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">current page</span>
        <button onclick="nxtPwTestPage()" style="background:none;border:1px solid rgba(204,68,255,.3);border-radius:2px;color:var(--m);font-family:var(--mono);font-size:8px;padding:2px 7px;cursor:pointer;" onmouseenter="this.style.background='rgba(204,68,255,.06)'" onmouseleave="this.style.background='none'">TEST PAGE</button>
      </div>
      <div id="nxt-pw-result" style="font-size:9px;color:var(--text3);font-family:var(--mono);"></div>
    </div>
  </div>`;
}

function _buildExtProfileHTML() {
  return `
  <div id="nxt-ext-profile-card" style="padding:8px 10px;border-top:1px solid var(--border);">
    <div style="font-family:var(--display);font-size:10px;letter-spacing:.14em;color:var(--c);margin-bottom:6px;">🦊 FIREFOX PROFILE</div>
    <div id="nxt-profile-data" style="font-size:9px;color:var(--text3);font-family:var(--mono);line-height:1.6;">
      No profile received yet. Install the NEXUS Firefox extension to push profile data.
    </div>
  </div>`;
}

// ── Test panel logic ──────────────────────────────────────────────────────────
function _bindTestsPanel() {
  // Initial state
  nxtBridgePing();
  nxtRenderHooks();
  nxtExtCheck();
  // Poll bridge every 15s
  setInterval(nxtBridgePing, 15000);
  // Poll extension every 10s
  setInterval(nxtExtCheck, 10000);
  // Update page URL display
  setInterval(() => {
    const el = document.getElementById('nxt-pw-page');
    if (el) el.textContent = window.location.href || document.title || 'NEXUS';
  }, 3000);
}

async function nxtBridgePing() {
  const dot = document.getElementById('nxt-bridge-dot');
  const txt = document.getElementById('nxt-bridge-status');
  const det = document.getElementById('nxt-bridge-detail');
  if (!dot) return;
  dot.style.background = 'var(--y)';
  if (txt) txt.textContent = 'pinging…';
  try {
    const r = await fetch('http://127.0.0.1:3747/health', { signal: AbortSignal.timeout(2500) });
    if (r.ok) {
      const data = await r.json().catch(() => ({}));
      dot.style.background = 'var(--g)';
      dot.style.boxShadow = '0 0 5px var(--g)';
      if (txt) txt.textContent = `ONLINE v${data.version || '?'} · port ${data.port || 3747}`;
      if (det) det.textContent = `uptime: ${data.uptime ? Math.floor(data.uptime/60)+'m' : '?'} · memory: ${data.memory ? Math.round(data.memory.heapUsed/1024/1024)+'MB' : '?'}`;
      return true;
    }
  } catch {}
  dot.style.background = 'var(--r)';
  dot.style.boxShadow = '0 0 5px var(--r)';
  if (txt) txt.textContent = 'OFFLINE — not reachable on :3747';
  if (det) det.innerHTML = '<span style="color:var(--y)">Click START to launch bridge, or check bridge/nexus-bridge-server.js</span>';
  return false;
}

async function nxtBridgeStart() {
  const btn = document.getElementById('nxt-bridge-start-btn');
  if (btn) { btn.textContent = '…'; btn.disabled = true; }
  try {
    if (window.nexus?.bridgeStart) {
      await window.nexus.bridgeStart();
      await new Promise(r => setTimeout(r, 1500));
    }
  } catch {}
  await nxtBridgePing();
  if (btn) { btn.textContent = 'START'; btn.disabled = false; }
}

async function nxtBridgeRestart() {
  try { if (window.nexus?.bridgeStop) await window.nexus.bridgeStop(); } catch {}
  await new Promise(r => setTimeout(r, 800));
  await nxtBridgeStart();
}

async function nxtExtCheck() {
  const dot = document.getElementById('nxt-ext-dot');
  const txt = document.getElementById('nxt-ext-status');
  const prof = document.getElementById('nxt-ext-profile');
  if (!dot) return;
  try {
    const r = await fetch('http://127.0.0.1:3747/extension/status', { signal: AbortSignal.timeout(2000) });
    if (r.ok) {
      const data = await r.json().catch(() => ({}));
      const connected = data.sessions > 0;
      dot.style.background = connected ? 'var(--g)' : 'var(--text4)';
      dot.style.boxShadow  = connected ? '0 0 5px var(--g)' : 'none';
      if (txt) txt.textContent = connected ? `Connected · ${data.sessions} session(s)` : 'Not connected';
      // Profile data
      if (connected && data.profileExists) {
        const pr = await fetch('http://127.0.0.1:3747/extension/sessions', { signal: AbortSignal.timeout(2000) });
        if (pr.ok) {
          const sd = await pr.json().catch(() => ({}));
          const session = (sd.sessions || [])[0];
          if (session && prof) {
            prof.innerHTML = [
              session.browser ? `browser: <span style="color:var(--c)">${session.browser}</span>` : '',
              session.version ? `ext v${session.version}` : '',
              session.hookId  ? `hook: <span style="color:var(--text2)">${session.hookId.slice(0,30)}…</span>` : '',
              session.connectedAt ? `connected: ${new Date(session.connectedAt).toLocaleTimeString()}` : '',
            ].filter(Boolean).join('<br>');
          }
          // Also update stats profile card
          const pc = document.getElementById('nxt-profile-data');
          if (pc && session) {
            pc.innerHTML = `<span style="color:var(--g)">✓ Profile synced</span><br>` +
              (session.browser ? `browser: ${session.browser}<br>` : '') +
              (session.hookId  ? `hookId: ${session.hookId.slice(0,36)}<br>` : '') +
              `<button onclick="nxtPushProfile()" style="margin-top:4px;background:none;border:1px solid rgba(0,212,255,.3);border-radius:2px;color:var(--c);font-family:var(--mono);font-size:8px;padding:2px 8px;cursor:pointer;">↑ RE-PUSH PROFILE</button>`;
          }
        }
      } else {
        if (prof) prof.textContent = 'No profile data yet';
      }
      return;
    }
  } catch {}
  if (dot) { dot.style.background = 'var(--text4)'; dot.style.boxShadow = 'none'; }
  if (txt) txt.textContent = 'Bridge offline — cannot check extension';
  if (prof) prof.textContent = '—';
}

async function nxtPushProfile() {
  try {
    await fetch('http://127.0.0.1:3747/extension/profile', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ hookId:'diag.manual', sessionId:'manual', browser:'manual', profile:{}, timestamp:Date.now() }) });
    NEXUS?.toast({ level:'info', code:'PROFILE_PUSH', title:'Profile push triggered', message:'Extension will re-push on next heartbeat' });
  } catch {}
}

function nxtRenderHooks() {
  const container = document.getElementById('nxt-hook-list');
  const scoreEl   = document.getElementById('nxt-hook-score');
  if (!container || !NEXUS?.registry) return;

  const search = (document.getElementById('nxt-hook-search')?.value || '').toLowerCase().trim();
  const prefix = document.getElementById('nxt-hook-prefix')?.value || '';
  const status = document.getElementById('nxt-hook-status')?.value || '';

  const ns = NEXUS.hookNamespace();
  const registered = NEXUS.allHooks();

  const rows = ns.map(spec => {
    const reg = registered.find(h => h.featureId === spec.featureId);
    return reg ? { ...reg, fromReg:true } : { featureId:spec.featureId, label:spec.label, prefix:spec.prefix, status:spec.status, fromReg:false, hookId:null, lastTested:null, lastResult:null, failCount:0, settingsPath:spec.settingsPath };
  }).filter(r => {
    if (prefix && r.prefix !== prefix) return false;
    if (status === 'active'  && r.status !== 'active') return false;
    if (status === 'planned' && r.status !== 'planned') return false;
    if (status === 'fail' && r.lastResult?.ok !== false) return false;
    if (status === 'pass' && r.lastResult?.ok !== true)  return false;
    if (search && !r.label?.toLowerCase().includes(search) && !r.featureId?.toLowerCase().includes(search)) return false;
    return true;
  });

  const h = NEXUS.healthScore();
  if (scoreEl) {
    const c = h.score >= 80 ? 'var(--g)' : h.score >= 50 ? 'var(--y)' : 'var(--r)';
    scoreEl.innerHTML = `<span style="color:${c};font-weight:700">${h.score}%</span> · ${h.passing}/${h.active} passing`;
  }

  if (!rows.length) { container.innerHTML = '<div style="padding:12px;text-align:center;color:var(--text4);font-size:9px;">No hooks match filter</div>'; return; }

  // Group by prefix
  const sections = {};
  rows.forEach(r => { if (!sections[r.prefix]) sections[r.prefix] = []; sections[r.prefix].push(r); });

  container.innerHTML = Object.entries(sections).map(([pfx, items]) => {
    const rows_html = items.map(r => {
      const isPlanned = r.status === 'planned';
      const hasFail   = r.lastResult?.ok === false;
      const hasPass   = r.lastResult?.ok === true;
      const dotC      = !r.lastTested ? 'var(--text4)' : hasFail ? 'var(--r)' : hasPass ? 'var(--g)' : 'var(--text4)';
      const dotShadow = hasPass ? ';box-shadow:0 0 4px var(--g)' : hasFail ? ';box-shadow:0 0 4px var(--r)' : '';
      const ago       = r.lastTested ? _ago(r.lastTested) : '';
      const res       = r.lastTested ? (r.lastResult?.ok ? 'pass' : 'fail') : '';
      const resC      = res === 'pass' ? 'var(--g)' : res === 'fail' ? 'var(--r)' : 'var(--text4)';
      return `<div style="display:flex;align-items:center;gap:6px;padding:4px 10px;opacity:${isPlanned?.45:1}" onmouseenter="this.style.background='var(--bg1)'" onmouseleave="this.style.background=''">
        <div style="width:6px;height:6px;border-radius:50%;background:${dotC}${dotShadow};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.label||r.featureId}${isPlanned?'<span style="background:var(--bg3);color:var(--text4);font-size:7px;padding:0 3px;border-radius:2px;margin-left:3px">PLANNED</span>':''}</div>
          <div style="font-size:8px;color:var(--text4);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.hookId ? r.hookId.slice(0,50) : r.featureId}</div>
        </div>
        <div style="font-size:8px;color:${resC};flex-shrink:0">${res ? res+' '+ago : '—'}</div>
        <button ${!r.hookId||isPlanned?'disabled':''} onclick="nxtTestHook('${r.hookId||''}')" style="background:none;border:1px solid var(--border2);border-radius:2px;color:var(--text4);font-family:var(--mono);font-size:8px;padding:1px 5px;cursor:pointer;flex-shrink:0" onmouseenter="if(!this.disabled){this.style.color='var(--g)';this.style.borderColor='var(--g)';}" onmouseleave="this.style.color='var(--text4)';this.style.borderColor='var(--border2)';">TEST</button>
        <button ${!r.settingsPath?'disabled':''} onclick="nxtOpenSettings('${r.settingsPath||''}')" style="background:none;border:1px solid var(--border2);border-radius:2px;color:var(--text4);font-family:var(--mono);font-size:8px;padding:1px 5px;cursor:pointer;flex-shrink:0">⚙</button>
      </div>`;
    }).join('');
    return `<div style="font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:var(--text4);padding:4px 10px 2px;border-top:1px solid var(--border)">${pfx}</div>${rows_html}`;
  }).join('');
}

async function nxtRunAllHooks() {
  if (!NEXUS?.testAll) return;
  NEXUS.toast({ level:'info', code:'TEST_ALL', title:'Running all hook tests…', message:'Results will appear in TESTS tab', actions:['Dismiss'] });
  await NEXUS.testAll();
  nxtRenderHooks();
}

async function nxtTestHook(hookId) {
  if (!hookId || !NEXUS?.testHook) return;
  await NEXUS.testHook(hookId);
  nxtRenderHooks();
}

function nxtOpenSettings(settingsPath) {
  if (!settingsPath) return;
  NEXUS?.bus?.emit('nexus:navigate:settings', { payload:{ path:settingsPath } });
  if (typeof switchTab === 'function') switchTab('options');
}

function nxtExportHooks(fmt) { NEXUS?.downloadUUIDs(fmt); }

async function nxtPwTestPage() {
  const res = document.getElementById('nxt-pw-result');
  if (res) res.textContent = '⟳ Testing current page…';
  const checks = [
    ['Page title', () => !!document.title],
    ['document.body exists', () => !!document.body],
    ['window.NEXUS loaded', () => !!window.NEXUS],
    ['NEXUS.ready', () => window.NEXUS?.ready === true],
    ['Bridge hook registered', () => (NEXUS?.allHooks()||[]).some(h => h.featureId.startsWith('bridge'))],
    ['HookRegistry live', () => !!NEXUS?.registry],
    ['EventBus live', () => !!NEXUS?.bus],
    ['Toast system live', () => typeof NEXUS?.toast === 'function'],
    ['localStorage available', () => { try { localStorage.setItem('__nxt','1'); localStorage.removeItem('__nxt'); return true; } catch { return false; } }],
    ['No console errors (last 5s)', () => { const recent = NX_ERRORS?.filter(e => Date.now()-new Date(e.ts).getTime() < 5000); return !recent?.length; }],
  ];
  const results = [];
  for (const [label, fn] of checks) {
    try { const ok = await fn(); results.push({ label, ok }); }
    catch(e) { results.push({ label, ok:false, err:e.message }); }
  }
  const pass = results.filter(r => r.ok).length;
  if (res) {
    res.innerHTML = results.map(r => `<div style="display:flex;gap:5px;padding:1px 0"><span style="color:${r.ok?'var(--g)':'var(--r)'}">${r.ok?'✓':'✕'}</span><span style="color:var(--text2)">${r.label}</span>${r.err?`<span style="color:var(--r)">${r.err}</span>`:''}</div>`).join('') +
      `<div style="margin-top:4px;color:${pass===results.length?'var(--g)':'var(--y)'};font-weight:700">${pass}/${results.length} passed</div>`;
  }
}

function _startExtensionMonitor() {
  // Listen for extension events on NEXUS bus
  NEXUS?.on('nexus:extension:connected', () => nxtExtCheck());
  NEXUS?.on('nexus:extension:profile',   () => nxtExtCheck());
}

// Add nxDiagTab handler for 'tests'
const _origNxDiagTab = typeof nxDiagTab === 'function' ? nxDiagTab : null;
window.nxDiagTab = function(tab, btn) {
  // Hide all panels including tests
  document.querySelectorAll('.nx-dpanel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nx-dtab').forEach(b => b.classList.remove('active'));
  // Show the correct panel
  const panel = document.getElementById('nx-dp-' + tab);
  if(panel) panel.classList.add('active');
  if(btn) btn.classList.add('active');
  // Run original for stats/pw side-effects
  if(tab === 'stats' && _origNxDiagTab) _origNxDiagTab(tab, btn);
  if(tab === 'pw' && _origNxDiagTab) _origNxDiagTab(tab, btn);
  // Refresh tests panel on open
  if(tab === 'tests') {
    nxtRenderHooks();
    nxtBridgePing();
    nxtExtCheck();
  }
};

function _ago(iso) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60000) return Math.round(d/1000)+'s ago';
  if (d < 3600000) return Math.round(d/60000)+'m ago';
  return Math.round(d/3600000)+'h ago';
}



/* ═══════════════════════════════════════════════════════════════════════════
   NEXUS PHASE 2 COMPLETION — v0.53.0
   P2.4 Profile names · P2.5 Header dots · P2.6 Workspace mode
   P2.7 Build mode launch · P2.8 AI→Bridge link · P2.9 Sidebar fix
   ═══════════════════════════════════════════════════════════════════════════ */
(function phase2Complete(){
  'use strict';

  function whenReady(fn){ if(document.readyState==='complete'||document.readyState==='interactive') setTimeout(fn,100); else window.addEventListener('load',()=>setTimeout(fn,100)); }

  // ── P2.4: Profile names from saved config ──────────────────────────────────
  // Reads cfg.userName + cfg.partnerName and persists editable names
  function p24_profileNames(){
    const cfg = _loadCfg();
    const name1 = cfg.userName    || localStorage.getItem('nx_user_name')    || 'JAMES';
    const name2 = cfg.partnerName || localStorage.getItem('nx_partner_name') || 'RAVEN';

    // Patch welcome-back overlay names if it already rendered
    const wb1 = document.getElementById('wb-name1');
    const wb2 = document.getElementById('wb-name2');
    if(wb1) wb1.textContent = name1;
    if(wb2) wb2.textContent = name2;

    // Patch the welcome screen name display (original welcome overlay)
    const wn = document.getElementById('welcome-name');
    if(wn && !wn.textContent) wn.textContent = name1;

    // Expose setter so Options can save names and they propagate
    window.nxSetProfileName = function(field, value){
      const c = _loadCfg();
      c[field] = value.trim().toUpperCase();
      _saveCfg(c);
      if(field==='userName')   localStorage.setItem('nx_user_name',    c.userName);
      if(field==='partnerName')localStorage.setItem('nx_partner_name', c.partnerName);
      const t = document.getElementById(field==='userName'?'wb-name1':'wb-name2');
      if(t) t.textContent = c[field];
      toast('Name saved: '+c[field],'ok');
    };

    // [REMOVED] Profile name injection block removed — names managed via USERNAME field in OPTIONS header
  }

  // ── P2.5: Header — remove static pills, show only dots + model badge ────────
  function p25_headerCleanup(){
    // Hide the old static BRIDGE pill (error/offline state handled in diag tab)
    const bridgePill = document.getElementById('bridge-status-pill');
    if(bridgePill){
      // Keep it but collapse — it gets shown/hidden by nxUpdateHeaderPills already
      bridgePill.style.display = 'none';
    }

    // Ensure dots are present (nxInjectHeaderDots may not have run yet)
    if(!document.getElementById('nx-header-dots')){
      const dotBar = document.createElement('div');
      dotBar.id = 'nx-header-dots';
      dotBar.style.cssText = 'display:flex;align-items:center;gap:5px;margin-left:6px;-webkit-app-region:no-drag;';
      const defs = [
        ['bridge','BRIDGE','options.bridge.nexus','var(--c)'],
        ['ai',    'AI',    'options.bridge.ai',  'var(--g)'],
        ['ext',   'EXT',   'options.bridge.extension','var(--m)'],
        ['diag',  'DIAG',  'options.diagnostics','var(--y)'],
      ];
      defs.forEach(([prefix,label,path,color])=>{
        const d = document.createElement('div');
        d.id = 'nxhd2-'+prefix;
        d.title = label + ' — click to open settings';
        d.style.cssText = `width:8px;height:8px;border-radius:50%;background:var(--text4);cursor:pointer;transition:all .3s;flex-shrink:0;border:1px solid rgba(255,255,255,.08);`;
        d.addEventListener('click',()=>{
          window.NEXUS?.bus?.emit('nexus:navigate:settings',{payload:{path}});
          if(typeof switchTab==='function') switchTab('options');
        });
        // Hover tooltip
        let _tt;
        d.addEventListener('mouseenter',()=>{
          d.style.transform='scale(1.5)';
          _tt=document.createElement('div');
          _tt.style.cssText='position:fixed;background:var(--bg1);border:1px solid var(--border2);border-radius:3px;padding:3px 8px;font-family:var(--mono);font-size:9px;color:var(--text2);z-index:9999;pointer-events:none;';
          _tt.textContent=label;
          document.body.appendChild(_tt);
          const r=d.getBoundingClientRect();
          _tt.style.left=(r.left-10)+'px';_tt.style.top=(r.bottom+5)+'px';
        });
        d.addEventListener('mouseleave',()=>{ d.style.transform=''; _tt?.remove(); _tt=null; });
        dotBar.appendChild(d);
      });
      const logo = document.querySelector('#top-bar .nxlogo');
      const ver  = document.querySelector('#top-bar .nxver');
      if(ver?.nextSibling) document.getElementById('top-bar').insertBefore(dotBar, ver.nextSibling);
      else if(logo) logo.after(dotBar);
    }

    // Poll and update dot colours every 5s
    function updateDots2(){
      const reg = window.NEXUS?.registry;
      const defs2 = {bridge:'var(--c)',ai:'var(--g)',ext:'var(--m)',diag:'var(--y)'};
      Object.entries(defs2).forEach(([prefix,color])=>{
        const dot = document.getElementById('nxhd2-'+prefix) || document.getElementById('nxhd-'+prefix);
        if(!dot) return;
        if(!reg){ dot.style.background='var(--text4)'; return; }
        const hooks   = reg.getByPrefix(prefix);
        const failing = hooks.filter(h=>h.lastResult?.ok===false).length;
        const passing = hooks.filter(h=>h.lastResult?.ok===true).length;
        const active  = hooks.filter(h=>h.status==='active'&&!h.lastTested).length;
        if(failing>0){ dot.style.background='var(--r)'; dot.style.boxShadow='0 0 5px var(--r)'; }
        else if(passing>0){ dot.style.background=color; dot.style.boxShadow='0 0 5px '+color; }
        else if(active>0){ dot.style.background='var(--y)'; dot.style.boxShadow='none'; dot.style.animation='p25-blink 2s infinite'; }
        else { dot.style.background='var(--text4)'; dot.style.boxShadow='none'; dot.style.animation=''; }
      });
    }
    // Add blink animation once
    if(!document.getElementById('p25-style')){
      const s=document.createElement('style');
      s.id='p25-style';
      s.textContent='@keyframes p25-blink{0%,100%{opacity:1}50%{opacity:.3}}';
      document.head.appendChild(s);
    }
    // updateDots2 disabled — NexusBridgeSync owns all dot state.
  }

  // ── P2.6: Workspace mode card — clean selection + persist ───────────────────
  function p26_workspaceModeCard(){
    // Ensure cards visually reflect saved mode on load
    const saved = localStorage.getItem('nx5_workspace_mode') || 'unity';
    const uc = document.getElementById('mode-card-unity');
    const bc = document.getElementById('mode-card-build');
    if(uc) uc.classList.toggle('active', saved==='unity');
    if(bc) bc.classList.toggle('active', saved==='build');

    // Wrap setWorkspaceMode for clean card visual + persistence
    const _origSWM = typeof setWorkspaceMode === 'function' ? setWorkspaceMode : null;
    window.setWorkspaceMode = function(mode){
      // Visual: remove active from all mode-cards, add to clicked
      document.querySelectorAll('.mode-card[id^="mode-card-"]').forEach(c=>{
        c.classList.remove('active');
        c.style.transform='';
      });
      const chosen = document.getElementById('mode-card-'+mode);
      if(chosen){ chosen.classList.add('active'); chosen.style.transform='translateY(-2px)'; setTimeout(()=>{ chosen.style.transform=''; },200); }
      // Save immediately
      localStorage.setItem('nx5_workspace_mode', mode);
      // Run original
      if(_origSWM) _origSWM(mode);
      else {
        // Fallback if not yet defined
        window._workspaceMode = mode;
        const uh=document.getElementById('unity-mode-home'), bh=document.getElementById('build-mode-home');
        if(uh) uh.style.display = mode==='unity'?'':'none';
        if(bh) bh.style.display = mode==='build'?'flex':'none';
        if(mode==='build' && typeof buildModeRender==='function') buildModeRender();
      }
      // Update badge
      const badge=document.getElementById('mode-acc-badge');
      if(badge){ badge.textContent=mode==='build'?'BUILD':'UNITY'; badge.style.color=mode==='build'?'var(--y)':'var(--c)'; }
      toast('Workspace: '+(mode==='build'?'Build Mode — project launcher active':'Unity Mode'),'ok',2000);
      log_ev('p26:workspace-mode',{mode},'INFO');
    };
  }

  // ── P2.7: Build mode — FORGE IDE tab also populated on project load ─────────
  function p27_buildModeForgePop(){
    const _origLoad = typeof buildModeLoad === 'function' ? buildModeLoad : null;
    if(!_origLoad) return;
    window.buildModeLoad = async function(projId){
      await _origLoad(projId);
      // Also populate FORGE IDE with project code
      const proj = (typeof getProjects==='function' ? getProjects() : []).find(p=>p.id===projId);
      if(!proj || !proj.code) return;
      if(typeof FORGE !== 'undefined' && FORGE.files !== undefined){
        const ext  = _guessExt(proj.code);
        const fid  = 'proj-'+proj.id;
        FORGE.files[fid] = { id:fid, name:(proj.name.replace(/[^a-z0-9]/gi,'_').slice(0,40)||'project')+'.'+ext, content:proj.code, lang:ext, modified:false };
        FORGE.activeFile = fid;
        if(typeof forgeActivateFile==='function') forgeActivateFile(fid);
        if(typeof forgeRenderTabs==='function')   forgeRenderTabs();
        if(typeof forgeRenderFileTree==='function') forgeRenderFileTree();
      }
      // Also open project workspace panel if not open
      if(typeof openProjectWorkspace==='function') openProjectWorkspace(projId);
      toast('✓ '+proj.name+' loaded into all tabs + FORGE IDE','ok',3000);
    };
  }

  // ── P2.8: AI settings cross-link in Bridge tab ──────────────────────────────
  function p28_aiLinkInBridge(){
    // Add a shortcut link in the bridge options area pointing to AI provider settings
    const bridgeOptSection = document.getElementById('bridge-status-pill-opt')?.closest('.acc-item') ||
                             document.querySelector('#tab-options .acc-item');
    if(!bridgeOptSection || document.getElementById('p28-ai-link')) return;
    const link = document.createElement('div');
    link.id = 'p28-ai-link';
    link.style.cssText = 'padding:6px 14px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;cursor:pointer;transition:background .15s;';
    link.innerHTML = `<span style="font-size:11px;">⚡</span><span style="font-family:var(--mono);font-size:9px;color:var(--c);letter-spacing:.1em;">AI PROVIDER SETTINGS →</span><span style="font-size:9px;color:var(--text3);">Configure API keys, models, fallback</span>`;
    link.addEventListener('mouseenter',()=>link.style.background='rgba(0,212,255,.04)');
    link.addEventListener('mouseleave',()=>link.style.background='');
    link.addEventListener('click',()=>{
      const provSec = document.getElementById('provider-chatgpt')?.closest('.acc-item') ||
                      document.querySelector('[id*="provider"]')?.closest('.acc-item');
      if(provSec){ provSec.scrollIntoView({behavior:'smooth',block:'start'}); }
      else { document.getElementById('opt-ai-provider')?.scrollIntoView({behavior:'smooth',block:'start'}); }
    });
    bridgeOptSection.appendChild(link);
  }

  // ── P2.9: Forge sidebar tab timing fix ──────────────────────────────────────
  // The sidebar tabs (FILES/SETTINGS/UCE) need forgeSideTab to be defined before
  // they are clicked. We register a delegated click handler as a safe fallback.
  function p29_forgeSidebarFix(){
    const sidebar = document.getElementById('forge-sidebar');
    if(!sidebar || sidebar.dataset.p29) return;
    sidebar.dataset.p29 = '1';
    sidebar.addEventListener('click', e=>{
      const btn = e.target.closest('.forge-stab');
      if(!btn) return;
      if(typeof window.forgeSideTab !== 'function') return;
      // Determine which tab from button text or id
      const id = btn.id || '';
      const tab = id.includes('files')?'files':id.includes('settings')?'settings':id.includes('uce')?'uce':null;
      if(tab){ window.forgeSideTab(tab, btn); }
    });
  }

  // ── Run all P2 completions ────────────────────────────────────────────────
  whenReady(()=>{
    p24_profileNames();
    p25_headerCleanup();
    p26_workspaceModeCard();
    p27_buildModeForgePop();
    setTimeout(p28_aiLinkInBridge, 1000);
    setTimeout(p29_forgeSidebarFix, 300);
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  function _loadCfg(){ try{ return JSON.parse(localStorage.getItem('nx6_cfg')||'{}'); }catch{ return {}; } }
  function _saveCfg(c){ try{ localStorage.setItem('nx6_cfg',JSON.stringify(c)); }catch{} }
  function _escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function _guessExt(code){
    if(!code) return 'txt';
    if(code.includes('<!DOCTYPE')||code.includes('<html')) return 'html';
    if(code.includes('import React')||code.includes('jsx')) return 'jsx';
    if(code.includes('def ')||code.includes('import sys')) return 'py';
    if(code.includes('package main')) return 'go';
    if(code.includes('fn main()')||code.includes('use std::')) return 'rs';
    if(code.startsWith('{')||code.startsWith('[')) return 'json';
    return 'js';
  }

})();

