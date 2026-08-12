'use strict';
// [NEXUS-COMPONENT-ID]
const COMPONENT_ID   = '636117b2';
const COMPONENT_UUID = 'a64cf1e0-c837-5fd1-9802-0c294401b9c8';
const COMPONENT_NAME = 'ui';
// [/NEXUS-COMPONENT-ID]
/**
 * engines/ui.js — NexusPanel v2 (full cPanel-grade control panel)
 * anonymousservers.info
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { ipc, conf, log, claimPort, isInit, NAME } = require('./_engine');

const DEFAULTS = { listenPort: 9000, domain: 'anonymousservers.info', siteTitle: 'NexusPanel' };
if (isInit()) { conf.init(DEFAULTS); log('ui: wrote default conf'); process.exit(0); }
let cfg = conf.load(DEFAULTS);

// ─── static UI assets — loaded once at startup, not per-request ──────────────
// These used to be embedded as escaped strings inside shell()'s giant
// template literal, which is exactly what made the panel's escaping bugs so
// hard to find (a mistake anywhere in ~2000 lines of embedded CSS/JS was
// invisible to any syntax checker until a browser actually hit it at
// runtime). They're real, independently-checkable files now — `node -c
// engines/ui-assets/app.js` catches a broken edit instantly, no extraction
// gymnastics required.
const UI_ASSETS_DIR = path.join(__dirname, 'ui-assets');
let UI_APP_JS, UI_STYLE_CSS;
try {
  UI_APP_JS   = fs.readFileSync(path.join(UI_ASSETS_DIR, 'app.js'), 'utf8');
  UI_STYLE_CSS = fs.readFileSync(path.join(UI_ASSETS_DIR, 'style.css'), 'utf8');
  log(`ui: loaded static assets — app.js (${UI_APP_JS.length}B), style.css (${UI_STYLE_CSS.length}B)`);
} catch (e) {
  log(`ui: FATAL — could not load ui-assets: ${e.message}`, 'ERROR');
  throw e; // fail loud and immediately, not with a blank/broken panel later
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function proxyReq(res, port, urlPath, method, body) {
  return new Promise(resolve => {
    const d = body ? JSON.stringify(body) : null;
    const req2 = http.request({
      host: '127.0.0.1', port, method, path: urlPath,
      headers: { 'Content-Type': 'application/json', ...(d ? { 'Content-Length': Buffer.byteLength(d) } : {}) }
    }, r => {
      res.writeHead(r.statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      r.pipe(res); resolve();
    });
    req2.on('error', () => { try { jsonR(res, 502, { error: 'engine unavailable' }); } catch {} resolve(); });
    if (d) req2.write(d);
    req2.end();
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = '';
    req.on('data', d => { b += d; if (b.length > 1048576) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve({}); } });
    req.on('error', reject);
  });
}

function jsonR(res, status, obj) {
  if (res.headersSent) return;
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
}

function ipcReq(engine, type, payload, ms = 4000) {
  return new Promise((resolve, reject) => {
    const requestId = `ui-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const replyType = type + ':reply';
    let done = false;

    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      ipc.off(replyType, handler);
      reject(new Error(`${type} timeout`));
    }, ms);

    function handler(msg) {
      if (msg?.requestId !== requestId) return;
      if (done) return;
      done = true;
      clearTimeout(timer);
      ipc.off(replyType, handler);
      resolve(msg);
    }

    ipc.on(replyType, handler);
    ipc.send('route', { type, ...payload, requestId }, engine);
  });
}

const ENGINE_PORTS = {
  dns:5353,ddns:0,tls:80,proxy:8080,relay:0,firewall:0,auth:4001,signal:0,
  smtp:2525,cache:4002,storage:9100,queue:0,billing:4003,monitor:4004,
  optimizer:4006,catalog:4005,registrar:4007,provisioner:4008,glue:4009,
  peer:7800,tunnel:7801,autodns:7802,ui:9000
};

// ─── HTML shell ───────────────────────────────────────────────────────────────
function shell() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NexusPanel — ${cfg.domain}</title>
<link rel="stylesheet" href="/ui-assets/style.css">
</head>
<body>
<div class="shell">
<div class="sidebar">
  <div class="sidebar-logo">
    <div class="name">⬡ NexusPanel</div>
    <div class="domain">${cfg.domain}</div>
    <div class="ipbadge" id="sb-ip">…</div>
  </div>
  <nav>
    <div class="section">Overview</div>
    <div class="section">Get Started</div>
    <a class="navlink active" data-p="wizard"><span class="icon">🚀</span>Setup Wizard</a>
    <a class="navlink" data-p="docs"><span class="icon">📖</span>Documentation</a>
    <div class="section">Overview</div>
    <a class="navlink" data-p="dashboard"><span class="icon">◈</span>Dashboard</a>
    <a class="navlink" data-p="engines"><span class="icon">⚙</span>Engines</a>
    <a class="navlink" data-p="monitor"><span class="icon">◉</span>Monitor</a>
    <a class="navlink" data-p="logs"><span class="icon">▤</span>Log Viewer</a>
    <div class="section">Hosting</div>
    <a class="navlink" data-p="users"><span class="icon">⊕</span>Users</a>
    <a class="navlink" data-p="domains"><span class="icon">◎</span>Domains</a>
    <a class="navlink" data-p="dns"><span class="icon">⌬</span>DNS Zone</a>
    <a class="navlink" data-p="ssl"><span class="icon">🔐</span>SSL / TLS</a>
    <a class="navlink" data-p="apps"><span class="icon">⬡</span>App Catalog</a>
    <a class="navlink" data-p="sites"><span class="icon">🌐</span>Sites</a>
    <a class="navlink" data-p="files"><span class="icon">📁</span>File Manager</a>
    <div class="section">Services</div>
    <a class="navlink" data-p="mail"><span class="icon">✉</span>Mail</a>
    <a class="navlink" data-p="storage"><span class="icon">◫</span>Storage</a>
    <a class="navlink" data-p="cron"><span class="icon">⏰</span>Cron Jobs</a>
    <div class="section">Security</div>
    <a class="navlink" data-p="firewall"><span class="icon">🛡</span>Firewall</a>
    <a class="navlink" data-p="vpn"><span class="icon">🔒</span>VPN</a>
    <a class="navlink" data-p="apikeys"><span class="icon">⌘</span>API Keys</a>
    <div class="section">Network</div>
    <a class="navlink" data-p="network"><span class="icon">⬡</span>Auto DNS</a>
    <a class="navlink" data-p="tunnel"><span class="icon">⛓</span>Tunnel</a>
    <a class="navlink" data-p="peer"><span class="icon">◈</span>Peer / P2P</a>
    <div class="section">Admin</div>
    <a class="navlink" data-p="billing"><span class="icon">💳</span>Billing</a>
    <a class="navlink" data-p="settings"><span class="icon">⊙</span>Settings</a>
  </nav>
</div>
<div class="main">

<div id="drift-banner" style="display:none;background:rgba(210,153,34,.12);border:1px solid var(--yellow);border-radius:8px;padding:12px 16px;margin-bottom:16px;align-items:center;justify-content:space-between;gap:12px">
  <div style="font-size:13px;color:var(--yellow)" id="drift-banner-text">⚠ Setup drift detected</div>
  <button class="sec sm" onclick="navigate('wizard')">Review in Setup Wizard</button>
</div>

<!-- SETUP WIZARD -->
<div id="page-wizard" class="page active">
  <div class="topbar"><div><div class="page-title">🚀 Setup Wizard</div><div class="page-sub">Get fully online in one pass — DNS, port forwarding, firewall, TLS</div></div></div>

  <div class="card">
    <div class="card-title">1. Domain &amp; Registrar</div>
    <div style="font-size:13px;color:var(--dim);margin-bottom:14px">
      GoDaddy API credentials are optional — without them the wizard still syncs your local DNS
      zone and shows you exact manual steps for your registrar.
    </div>
    <div class="frow c2">
      <div><label>Domain</label><input id="wiz-domain" placeholder="yourdomain.com"></div>
      <div><label>Registrar</label>
        <select id="wiz-registrar" onchange="$('wiz-godaddy-creds').style.display=this.value==='godaddy'?'block':'none'">
          <option value="godaddy">GoDaddy</option>
          <option value="namecheap">Namecheap</option>
          <option value="porkbun">Porkbun</option>
          <option value="cloudflare">Cloudflare</option>
          <option value="generic">Other / Generic</option>
        </select>
      </div>
    </div>
    <div id="wiz-godaddy-creds" class="frow c2">
      <div><label>GoDaddy API Key <span style="color:var(--dim);font-weight:400">(optional)</span></label><input id="wiz-godaddy-key" placeholder="leave blank for manual steps"></div>
      <div><label>GoDaddy API Secret</label><input id="wiz-godaddy-secret" type="password"></div>
    </div>
    <div class="actions" style="margin-top:10px"><button class="sec" onclick="saveWizardConfig()">Save Domain Config</button></div>
    <div id="wiz-config-result" style="margin-top:10px;font-size:13px"></div>
  </div>

  <div class="card" style="border-color:var(--accent)">
    <div class="card-title">2. One-Click Full Setup</div>
    <div style="font-size:13px;color:var(--dim);margin-bottom:16px;line-height:1.6">
      Runs every automated step in the right order: opens your router ports via UPnP, applies OS firewall rules,
      verifies DNS is pointed correctly, and requests a TLS certificate. Takes about 30–60 seconds.
      If a step can't be automated on your network, the wizard tells you exactly what to do instead.
    </div>
    <div class="actions"><button onclick="runFullWizard()" style="font-size:14px;padding:10px 24px">▶ Run Full Setup</button></div>
    <div id="wizard-progress" style="margin-top:18px;display:none">
      <div class="pbar" style="height:6px"><div class="pbar-fill" id="wizard-bar" style="width:0%"></div></div>
      <div id="wizard-steps" style="margin-top:14px"></div>
    </div>
  </div>

  <div class="grid2">
    <div class="card">
      <div class="card-title">⬡ Router Port Forwarding (UPnP)</div>
      <div id="wiz-upnp-status" style="font-size:13px;color:var(--dim);margin-bottom:12px">Not checked yet</div>
      <div class="actions">
        <button class="sec sm" onclick="wizCheckUpnp()">Check Status</button>
        <button class="sec sm" onclick="wizOpenUpnp()">Forward Ports Now</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">🛡 OS Firewall (sysfw)</div>
      <div id="wiz-sysfw-status" style="font-size:13px;color:var(--dim);margin-bottom:12px">Not checked yet</div>
      <div class="actions">
        <button class="sec sm" onclick="wizDetectSysfw()">Detect Tool</button>
        <button class="sec sm" onclick="wizApplySysfw()">Apply Rules</button>
      </div>
    </div>
  </div>

  <div class="grid2">
    <div class="card">
      <div class="card-title">🌐 DNS Pointing</div>
      <div id="wiz-dns-status" style="font-size:13px;color:var(--dim);margin-bottom:12px">Not checked yet</div>
      <div class="actions"><button class="sec sm" onclick="wizCheckDns()">Check DNS</button></div>
    </div>
    <div class="card">
      <div class="card-title">🔐 TLS Certificate</div>
      <div id="wiz-tls-status" style="font-size:13px;color:var(--dim);margin-bottom:12px">Not checked yet</div>
      <div class="actions"><button class="sec sm" onclick="wizCheckTls()">Check Certificate</button></div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">Manual Fallback — if automation can't reach your router</div>
    <div style="font-size:13px;color:var(--dim);line-height:1.9">
      Some routers (especially ISP-locked or corporate ones) disable UPnP. If the wizard reports
      "no gateway found," forward these ports manually in your router's admin panel
      (usually <code>192.168.1.1</code> or <code>192.168.0.1</code>):<br><br>
      <table style="margin-top:8px">
        <thead><tr><th>Port</th><th>Protocol</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td><code>80</code></td><td>TCP</td><td>HTTP + ACME certificate challenge</td></tr>
          <tr><td><code>443</code></td><td>TCP</td><td>HTTPS</td></tr>
          <tr><td><code>53</code></td><td>TCP+UDP</td><td>DNS (only if you're running your own nameservers)</td></tr>
          <tr><td><code>587</code></td><td>TCP</td><td>SMTP submission (sending mail)</td></tr>
          <tr><td><code>2525</code></td><td>TCP</td><td>SMTP inbound (receiving mail)</td></tr>
        </tbody>
      </table>
      Full walkthrough with screenshots for common routers is in <a href="#" onclick="navigate('docs');return false">Documentation → Port Forwarding</a>.
    </div>
  </div>
</div>

<!-- DOCUMENTATION -->
<div id="page-docs" class="page">
  <div class="topbar"><div><div class="page-title">📖 Documentation</div><div class="page-sub">Everything you need to run, secure, and grow your own platform</div></div></div>

  <div class="tabs">
    <div class="tab active" onclick="docsTab(this,'start')">Getting Started</div>
    <div class="tab" onclick="docsTab(this,'dns')">DNS &amp; Domains</div>
    <div class="tab" onclick="docsTab(this,'network')">Networking</div>
    <div class="tab" onclick="docsTab(this,'apps')">Apps &amp; Hosting</div>
    <div class="tab" onclick="docsTab(this,'security')">Security</div>
    <div class="tab" onclick="docsTab(this,'cli')">CLI Reference</div>
    <div class="tab" onclick="docsTab(this,'api')">API Reference</div>
    <div class="tab" onclick="docsTab(this,'troubleshoot')">Troubleshooting</div>
  </div>

  <div id="dtab-start" class="docpane active">
    <div class="card">
      <div class="card-title">What is Nexus?</div>
      <div class="doc-body">
        <p>Nexus is a self-hosting platform that runs your own DNS, web server, mail server, firewall,
        and app installer from a single machine you control — no cloud provider, no monthly hosting bill,
        no third party holding your data. Twenty-three independent engines work together: one handles DNS,
        one handles TLS certificates, one routes web traffic, one runs email, and so on. The kernel
        (<code>nexus.js</code>) starts, monitors, and restarts each engine automatically.</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title">First-Time Setup (5 steps)</div>
      <div class="doc-body">
        <ol class="doc-steps">
          <li><strong>Install.</strong> Run <code>node install.js</code> in the nexus-build folder. Answer the prompts
          (domain, admin email, ports) or press Enter to accept the defaults.</li>
          <li><strong>Point your domain.</strong> In your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.),
          set an A record pointing your domain to your public IP — or better, delegate nameservers to Nexus itself
          so you manage DNS yourself. See <a href="#" onclick="docsTab(null,'dns');return false">DNS &amp; Domains</a>.</li>
          <li><strong>Start the platform.</strong> Run <code>node nexus.js up</code>. All 23 engines boot in a few seconds.</li>
          <li><strong>Run the Setup Wizard.</strong> Open the <a href="#" onclick="navigate('wizard');return false">Setup Wizard</a> tab
          in this panel and click "Run Full Setup." It handles port forwarding, firewall rules, and certificate issuance automatically.</li>
          <li><strong>Open the panel.</strong> You're looking at it — <code>http://localhost:9000</code>. Bookmark it.</li>
        </ol>
      </div>
    </div>
    <div class="card">
      <div class="card-title">System Requirements</div>
      <div class="doc-body">
        <ul class="doc-list">
          <li>Node.js 18 or newer (you have this if Nexus is running)</li>
          <li>A machine that stays on — a desktop, a mini PC, a Raspberry Pi 4+, or a cheap VPS</li>
          <li>A router that supports UPnP (most consumer routers do, enabled by default) — or willingness to forward ports manually</li>
          <li>A registered domain name (any registrar works)</li>
          <li>Optional but recommended: OpenSSL installed for stronger TLS key generation (Nexus falls back to a JS implementation if it's missing)</li>
        </ul>
      </div>
    </div>
  </div>

  <div id="dtab-dns" class="docpane">
    <div class="card">
      <div class="card-title">Two ways to handle DNS</div>
      <div class="doc-body">
        <p><strong>Option A — Simple A record (easiest).</strong> Keep your registrar's default nameservers and
        just add an A record pointing your domain to your public IP. Works immediately, no propagation delay
        for nameserver changes. Best if you just want one domain pointed at your server.</p>
        <p><strong>Option B — Delegate nameservers to Nexus (full control).</strong> Run your own authoritative DNS.
        You manage every record — subdomains, MX, TXT, anything — from this panel's DNS Zone Editor, with no
        registrar dashboard required after the initial setup. Best if you plan to host multiple domains or
        subdomains and want them to "just work" without separate DNS configuration each time.</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Setting up custom nameservers (Option B) — GoDaddy example</div>
      <div class="doc-body">
        <ol class="doc-steps">
          <li>In GoDaddy: Domain Settings → DNS → <strong>Hostnames</strong> tab. Add two hostnames:
          <code>ns1</code> → your public IP, and <code>ns2</code> → your public IP. This creates glue records.</li>
          <li>Go to the <strong>Nameservers</strong> tab → "Change Nameservers" → enter
          <code>ns1.yourdomain.com</code> and <code>ns2.yourdomain.com</code>.</li>
          <li>Save. Propagation can take anywhere from a few minutes to 48 hours.</li>
          <li>In this panel, go to <strong>Domains → Nameserver Setup</strong>, select your registrar, and
          click "Apply to DNS Engine" — this loads the matching NS/SOA/glue records into Nexus's own DNS engine.</li>
        </ol>
        <p>Other registrars (Namecheap, Cloudflare, Porkbun) follow the same pattern — set glue records first,
        then point the domain's nameservers at them. The Nameserver Setup tab in <strong>Domains</strong> generates
        exact instructions for your specific registrar.</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Auto DNS — keeping your IP record current</div>
      <div class="doc-body">
        <p>Home internet IPs usually change periodically. The <strong>Auto DNS</strong> page configures a provider
        to automatically update your DNS record whenever your IP changes — GoDaddy API, Cloudflare, DuckDNS (free),
        or dynv6 (free). Configure one and Nexus checks your IP every 60 seconds, pushing an update only when it
        actually changes.</p>
      </div>
    </div>
  </div>

  <div id="dtab-network" class="docpane">
    <div class="card">
      <div class="card-title">Why port forwarding matters</div>
      <div class="doc-body">
        <p>Your router sits between your home network and the public internet and blocks all incoming connections
        by default — this is normal and good for security. For the world to reach your Nexus server, your router
        needs an explicit rule saying "send traffic on port 80 to this machine." Without it, even a perfectly
        configured Nexus install is invisible from outside your home network.</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Automatic forwarding via UPnP</div>
      <div class="doc-body">
        <p>Nexus's <code>firewall</code> engine automatically discovers UPnP-capable routers on your network at
        startup and requests port mappings for 80, 443, 53, 587, and 2525 — no router login required. This works
        on the large majority of home routers, since UPnP is on by default on most consumer hardware.</p>
        <p>If your network doesn't support UPnP (common on corporate networks, some ISP-locked routers, or
        carrier-grade NAT setups), Nexus logs a clear warning and you'll need to forward ports manually — see the
        <a href="#" onclick="navigate('wizard');return false">Setup Wizard</a> page for the exact port list, or your
        router manufacturer's port forwarding guide.</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title">OS-level firewall (sysfw)</div>
      <div class="doc-body">
        <p>Separately from your router, your computer's own firewall (Windows Firewall, ufw on Linux, etc.) can
        also block incoming traffic. The <code>firewall</code> engine applies OS-level allow rules for the same
        port set automatically on startup, using <code>netsh</code> on Windows or <code>ufw</code>/<code>iptables</code>
        on Linux — whichever is available.</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Tunnel fallback — when port forwarding isn't possible</div>
      <div class="doc-body">
        <p>If neither UPnP nor manual port forwarding work for your network (e.g. you're behind CGNAT with no
        public IP at all), the <strong>Tunnel</strong> page provides an alternative: it probes multiple tunnel
        strategies (Cloudflare, ngrok, serveo, localhost.run) and finds one that exposes your server through an
        outbound-only connection, no inbound ports required at all.</p>
      </div>
    </div>
  </div>

  <div id="dtab-apps" class="docpane">
    <div class="card">
      <div class="card-title">App Catalog — one-click installs</div>
      <div class="doc-body">
        <p>The <strong>App Catalog</strong> page installs full applications with one click — WordPress, Ghost,
        Nextcloud, Gitea, n8n, Vaultwarden, and more. Each install automatically configures a DNS record, a TLS
        certificate, and a reverse proxy route for the subdomain you choose. No manual server configuration.</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title">File Manager</div>
      <div class="doc-body">
        <p>Browse, view, and edit files directly under your Nexus install — site content, configs, logs — from
        the <strong>File Manager</strong> page. Paths are relative to the Nexus root folder; <code>sites/</code>
        holds your hosted site content by default.</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Multi-tenant hosting</div>
      <div class="doc-body">
        <p>The <strong>Users</strong> page provisions new accounts with their own subdomain, plan tier, and
        optional database — useful if you're hosting for other people, not just yourself. Each user's plan and
        billing status is tracked under <strong>Billing</strong>.</p>
      </div>
    </div>
  </div>

  <div id="dtab-security" class="docpane">
    <div class="card">
      <div class="card-title">Firewall &amp; rate limiting</div>
      <div class="doc-body">
        <p>The <strong>Firewall</strong> page lets you manually ban or allow specific IPs, and configure automatic
        rate limiting — requests per window, and auto-ban after repeated violations. This is in-process (handled
        by the proxy itself) and works alongside the OS-level and router-level rules described in Networking.</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title">API keys</div>
      <div class="doc-body">
        <p>Generate scoped API keys under <strong>API Keys</strong> for programmatic access — read-only, write,
        DNS management, or full admin. Keys are shown once at creation; store them securely, as Nexus does not
        display them again.</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title">TLS certificates</div>
      <div class="doc-body">
        <p>Nexus automatically requests a free Let's Encrypt certificate via ACME for your primary domain on
        startup, and renews it daily once it's close to expiry. This requires port 80 to be reachable from the
        internet for the HTTP-01 challenge to succeed — see Networking above. Until a real certificate is issued,
        Nexus falls back to a self-signed certificate so HTTPS still works locally (with a browser warning).</p>
      </div>
    </div>
  </div>

  <div id="dtab-cli" class="docpane">
    <div class="card">
      <div class="card-title">Core commands</div>
      <pre>node nexus.js up                start all engines
node nexus.js stop              graceful shutdown
node nexus.js status            engine health summary
node nexus.js restart &lt;name&gt;    hot-restart one engine
node nexus.js logs &lt;name&gt;       last 100 lines of an engine's log</pre>
    </div>
    <div class="card">
      <div class="card-title">Networking commands</div>
      <pre>node nexus.js upnp:open         auto-forward ports via UPnP
node nexus.js upnp:close        remove UPnP port forwards
node nexus.js upnp:status       check if a UPnP gateway is reachable
node nexus.js firewall:apply    apply OS firewall rules
node nexus.js firewall:remove   remove OS firewall rules
node nexus.js firewall:list     show current OS firewall rules
node nexus.js firewall:detect   show which OS firewall tool is active</pre>
    </div>
  </div>

  <div id="dtab-api" class="docpane">
    <div class="card">
      <div class="card-title">Base URL &amp; Authentication</div>
      <div class="doc-body">
        <p>Base URL: <code>http://localhost:9000</code> (or your domain once DNS/TLS are live).
        Authenticate with <code>Authorization: Bearer YOUR_API_KEY</code>, generated from the
        <strong>API Keys</strong> page.</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Endpoint reference</div>
      <table>
        <thead><tr><th>Method</th><th>Path</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td>GET</td><td><code>/ui/status</code></td><td>All engine health/uptime</td></tr>
          <tr><td>GET/POST/DELETE</td><td><code>/ui/dns</code></td><td>DNS zone records</td></tr>
          <tr><td>GET</td><td><code>/ui/catalog</code></td><td>List available apps</td></tr>
          <tr><td>POST</td><td><code>/ui/catalog/install</code></td><td>Install an app</td></tr>
          <tr><td>POST</td><td><code>/provision/user</code></td><td>Create a hosted user account</td></tr>
          <tr><td>GET</td><td><code>/ui/tunnel/status</code></td><td>Active tunnel URL/strategy</td></tr>
          <tr><td>GET</td><td><code>/ui/peer/identity</code></td><td>This node's P2P identity</td></tr>
          <tr><td>POST</td><td><code>/ui/sysfw/apply</code></td><td>Apply OS firewall rules</td></tr>
          <tr><td>POST</td><td><code>/ui/upnp/open</code></td><td>Forward router ports automatically</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div id="dtab-troubleshoot" class="docpane">
    <div class="card">
      <div class="card-title">"ACME failed: NXDOMAIN"</div>
      <div class="doc-body"><p>Your domain has no DNS record pointing to your server yet, or you configured Nexus
      for a different domain than the one you set up at your registrar. Check <strong>Settings</strong> for the
      configured domain and compare it against your registrar's DNS records. Run the Setup Wizard's
      "Check DNS" step to confirm.</p></div>
    </div>
    <div class="card">
      <div class="card-title">"HTTP port 80 already in use"</div>
      <div class="doc-body"><p>Another process on your machine (often Skype, IIS, or a previous Nexus instance)
      is holding port 80. Stop it, or run <code>node nexus.js stop</code> first if a previous Nexus process didn't
      shut down cleanly.</p></div>
    </div>
    <div class="card">
      <div class="card-title">Monitor shows engines as DOWN that are actually running</div>
      <div class="doc-body"><p>This is usually a health-check timing issue — the monitor's first check fires
      before all engines finish booting. It self-corrects within 30–60 seconds. If it persists, check
      <code>node nexus.js logs monitor</code> for the specific failure.</p></div>
    </div>
    <div class="card">
      <div class="card-title">UPnP: "no UPnP gateway responded"</div>
      <div class="doc-body"><p>Your router either has UPnP disabled or doesn't support it. Enable UPnP in your
      router's admin panel (often under Advanced → NAT or Security settings), or forward the ports listed in the
      Setup Wizard manually.</p></div>
    </div>
    <div class="card">
      <div class="card-title">'wmic' is not recognized</div>
      <div class="doc-body"><p>Harmless. This is a legacy Windows process-check that silently fails on newer
      Windows builds where <code>wmic</code> was removed; Nexus uses PowerShell's <code>Get-Process</code> as the
      real check. No action needed.</p></div>
    </div>
  </div>
</div>

<!-- DASHBOARD -->
<div id="page-dashboard" class="page">
  <div class="topbar"><div><div class="page-title">Dashboard</div><div class="page-sub" id="dash-ts"></div></div><button onclick="refreshDashboard()">↻ Refresh</button></div>
  <div class="grid4" id="dash-stats"></div>
  <div class="card"><div class="card-title">⚙ Engine Health</div><div class="eng-grid" id="dash-engines"></div></div>
  <div class="grid2">
    <div class="card"><div class="card-title">🌐 Tunnel</div><div id="dash-tunnel" style="font-size:13px;color:var(--dim)">Loading…</div></div>
    <div class="card"><div class="card-title">📡 Network</div><div id="dash-net" style="font-size:13px"></div></div>
  </div>
</div>

<!-- ENGINES -->
<div id="page-engines" class="page">
  <div class="topbar"><div><div class="page-title">Engines</div><div class="page-sub">All 23 nexus engines — status, ports, restart</div></div>
    <div style="display:flex;gap:8px"><button class="sec" onclick="loadEngines()">↻ Refresh</button></div></div>
  <div id="engines-grid" class="eng-grid"></div>
  <div class="card"><div class="card-title">Port Map</div>
    <table><thead><tr><th>Engine</th><th>Port</th><th>Component ID</th><th>Description</th></tr></thead><tbody id="port-map-table"></tbody></table>
  </div>
</div>

<!-- MONITOR -->
<div id="page-monitor" class="page">
  <div class="topbar"><div><div class="page-title">Monitor</div></div><button onclick="loadMonitor()">↻ Refresh</button></div>
  <div class="grid4" id="mon-stats"></div>
  <div class="card"><div class="card-title">Service Status</div>
    <table><thead><tr><th>Service</th><th>Status</th><th>Latency</th><th>Last Check</th></tr></thead><tbody id="mon-table"></tbody></table>
  </div>
  <div class="card"><div class="card-title">Add HTTP Monitor</div>
    <div class="frow c3">
      <div><label>Name</label><input id="mon-name" placeholder="My Site"></div>
      <div><label>URL</label><input id="mon-url" placeholder="https://example.com"></div>
      <div><label>Webhook</label><input id="mon-hook" placeholder="https://…"></div>
    </div>
    <div class="actions"><button onclick="addMonitor()">Add Monitor</button></div>
  </div>
</div>

<!-- LOGS -->
<div id="page-logs" class="page">
  <div class="topbar"><div><div class="page-title">Log Viewer</div></div>
    <div style="display:flex;gap:8px;align-items:center">
      <select id="log-engine" onchange="loadLogs()" style="width:140px">
        <option>proxy</option><option>dns</option><option>tls</option><option>auth</option>
        <option>smtp</option><option>tunnel</option><option>peer</option><option>autodns</option>
        <option>monitor</option><option>billing</option><option>firewall</option><option>catalog</option>
        <option>ddns</option><option>glue</option><option>ui</option>
      </select>
      <select id="log-lines" onchange="loadLogs()" style="width:90px">
        <option value="50">50 lines</option><option value="100" selected>100 lines</option><option value="500">500 lines</option>
      </select>
      <button onclick="loadLogs()">↻ Tail</button>
    </div>
  </div>
  <div class="logviewer" id="log-content" style="min-height:500px">Select engine and click Tail</div>
</div>

<!-- USERS -->
<div id="page-users" class="page">
  <div class="topbar"><div><div class="page-title">Users &amp; Provisioning</div></div><button onclick="loadUserList()">↻ Refresh</button></div>
  <div class="card"><div class="card-title">Create New User</div>
    <div class="frow c3">
      <div><label>Username</label><input id="u-handle" placeholder="alice"></div>
      <div><label>Password</label><input id="u-pass" type="password" placeholder="strong password"></div>
      <div><label>Email</label><input id="u-email" placeholder="alice@example.com"></div>
    </div>
    <div class="frow c3">
      <div><label>Subdomain</label><input id="u-sub" placeholder="alice"></div>
      <div><label>Plan</label><select id="u-plan"><option value="starter">Starter</option><option value="pro">Pro</option><option value="unlimited">Unlimited</option></select></div>
      <div><label>Create DB?</label><select id="u-db"><option value="true">Yes</option><option value="false">No</option></select></div>
    </div>
    <div id="u-progress" style="margin-top:12px;display:none"><div class="pbar"><div class="pbar-fill" id="u-bar" style="width:0%"></div></div><div id="u-steps" style="margin-top:10px;font-size:13px;color:var(--dim)"></div></div>
    <div class="actions"><button onclick="createUser()">⊕ Create User</button></div>
  </div>
  <div class="card"><div class="card-title">Active Users</div>
    <table><thead><tr><th>Handle</th><th>Email</th><th>Plan</th><th>Subdomain</th><th>Created</th><th></th></tr></thead><tbody id="user-table"></tbody></table>
  </div>
</div>

<!-- DOMAINS -->
<div id="page-domains" class="page">
  <div class="topbar"><div><div class="page-title">Domains</div></div><button onclick="loadDomainList()">↻ Refresh</button></div>
  <div class="tabs">
    <div class="tab active" onclick="domTab(this,'search')">Search</div>
    <div class="tab" onclick="domTab(this,'add')">Add Domain</div>
    <div class="tab" onclick="domTab(this,'ns')">Nameserver Setup</div>
    <div class="tab" onclick="domTab(this,'list')">My Domains</div>
  </div>
  <div id="dtab-search" class="tabpane active">
    <div class="card"><div class="card-title">Check Availability</div>
      <div class="frow c2"><div><label>Domain</label><input id="dom-name" placeholder="mysite"></div><div><label>TLDs</label><input id="dom-tlds" value="com,net,org,io,app,dev"></div></div>
      <div class="actions"><button onclick="searchDomains()">Search</button></div>
      <div id="dom-results" style="margin-top:16px"></div>
    </div>
  </div>
  <div id="dtab-add" class="tabpane">
    <div class="card"><div class="card-title">Add Domain to Platform</div>
      <div class="frow c2"><div><label>Domain</label><input id="add-domain" placeholder="yourdomain.com"></div><div><label>Tenant</label><input id="add-tenant" value="default"></div></div>
      <div class="actions"><button onclick="addDomain()">Add &amp; Configure</button></div>
      <div id="add-domain-result" style="margin-top:12px;font-size:13px"></div>
    </div>
  </div>
  <div id="dtab-ns" class="tabpane">
    <div class="card"><div class="card-title">Nameserver Setup</div>
      <div class="frow c2">
        <div><label>Domain</label><input id="ns-domain" placeholder="${cfg.domain}"></div>
        <div><label>Registrar</label><select id="ns-registrar"><option value="godaddy">GoDaddy</option><option value="namecheap">Namecheap</option><option value="cloudflare">Cloudflare</option><option value="generic">Other</option></select></div>
      </div>
      <div class="actions"><button onclick="getNsInstructions()">Get Instructions</button><button class="sec" onclick="applyNsGlue()">Apply to DNS Engine</button></div>
      <div id="ns-instructions" style="margin-top:16px"></div>
    </div>
  </div>
  <div id="dtab-list" class="tabpane">
    <div class="card"><div class="card-title">Registered Domains</div>
      <table><thead><tr><th>Domain</th><th>Tenant</th><th>Nameservers</th><th>Added</th><th></th></tr></thead><tbody id="domain-table"></tbody></table>
    </div>
  </div>
</div>

<!-- DNS -->
<div id="page-dns" class="page">
  <div class="topbar"><div><div class="page-title">DNS Manager</div><div class="page-sub" id="dns-domain-sub">Multi-domain authoritative DNS — add any domain, manage its full zone</div></div><button onclick="loadDnsDomains()">↻ Refresh</button></div>

  <div class="card">
    <div class="card-title">Domains</div>
    <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px">
      <div style="flex:1;min-width:200px"><label>Active domain</label>
        <select id="dns-domain-select" onchange="switchDnsDomain()"></select>
      </div>
      <div style="flex:1;min-width:200px"><label>Add a new domain</label><input id="dns-new-domain" placeholder="example.com"></div>
      <button class="sec" onclick="addDnsDomain()">+ Add Domain</button>
      <button class="sec" onclick="removeDnsDomain()" style="color:var(--red)">✕ Remove Domain</button>
    </div>
    <table><thead><tr><th>Domain</th><th>Records</th><th>NS hostnames</th><th></th></tr></thead><tbody id="dns-domains-table"></tbody></table>
  </div>

  <div class="card">
    <div class="card-title">NS Delegation — point this domain here</div>
    <div style="font-size:13px;color:var(--dim);line-height:1.6">
      At the registrar for <span id="dns-delegate-domain" style="font-family:monospace">—</span>, set the nameservers to:
      <div style="font-family:monospace;margin-top:8px;background:var(--surface2);padding:10px;border-radius:6px" id="dns-ns-list">—</div>
    </div>
  </div>

  <div class="card"><div class="card-title">Add Record</div>
    <div class="frow c3">
      <div><label>Name</label><input id="dns-name" placeholder="@ or subdomain"></div>
      <div><label>Type</label><select id="dns-type" onchange="dnsTypeChanged()"><option>A</option><option>AAAA</option><option>CNAME</option><option>MX</option><option>TXT</option><option>NS</option><option>SRV</option><option>CAA</option></select></div>
      <div><label>Value</label><input id="dns-val" placeholder="1.2.3.4 or hostname"></div>
    </div>
    <div class="frow c2">
      <div><label>TTL (s)</label><input id="dns-ttl" type="number" value="300"></div>
      <div id="dns-prio-wrap" style="display:none"><label>Priority</label><input id="dns-prio" type="number" placeholder="10"></div>
    </div>
    <div class="actions"><button onclick="addDnsRecord()">Add Record</button></div>
  </div>
  <div class="card"><div class="card-title">Zone Records</div>
    <table><thead><tr><th>Name</th><th>Type</th><th>Value</th><th>TTL</th><th></th></tr></thead><tbody id="zone-table"></tbody></table>
  </div>
  <div class="card"><div class="card-title">Quick Templates</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="sec" onclick="applyTemplate('email')">📧 Email</button>
      <button class="sec" onclick="applyTemplate('spf')">✉ SPF+DMARC</button>
      <button class="sec" onclick="applyTemplate('wildcard')">✱ Wildcard</button>
    </div>
    <div id="template-result" style="margin-top:10px;font-size:12px;color:var(--green)"></div>
  </div>
</div>

<!-- SSL -->
<div id="page-ssl" class="page">
  <div class="topbar"><div><div class="page-title">SSL / TLS Certificates</div></div><button onclick="loadSsl()">↻ Refresh</button></div>
  <div class="card"><div class="card-title">Certificate Status</div><div id="ssl-certs"></div></div>
  <div class="card"><div class="card-title">Issue / Renew Certificate</div>
    <div class="frow c2"><div><label>Domain</label><input id="ssl-domain" placeholder="example.com"></div><div><label>Type</label><select id="ssl-type"><option value="http01">HTTP-01</option><option value="wildcard">Wildcard *.</option></select></div></div>
    <div class="actions"><button onclick="issueCert()">Issue Certificate</button></div>
    <div id="ssl-result" style="margin-top:12px;font-size:13px"></div>
  </div>
</div>

<!-- APPS -->
<div id="page-apps" class="page">
  <div class="topbar"><div><div class="page-title">App Catalog</div><div class="page-sub">One-click install — auto-configures DNS, TLS, proxy</div></div></div>
  <div id="apps-grid" class="gridAuto"></div>
  <div id="install-progress"></div>
  <div class="card"><div class="card-title">Installed Apps</div>
    <table><thead><tr><th>App</th><th>Domain</th><th>Status</th><th>Installed</th><th></th></tr></thead><tbody id="installs-table"></tbody></table>
  </div>
</div>

<!-- SITES -->
<div id="page-sites" class="page">
  <div class="topbar">
    <div><div class="page-title">Sites</div><div class="page-sub">Vhosts, stacks, domains — all managed here</div></div>
    <div style="display:flex;gap:8px">
      <button onclick="loadSites()">↻ Refresh</button>
      <button onclick="showAddSite()">+ Add Site</button>
    </div>
  </div>

  <!-- Add Site Wizard -->
  <div id="add-site-form" class="card" style="display:none;border-color:var(--accent)">
    <div class="card-title">➕ New Site</div>
    <div class="frow c2">
      <div><label>Hostname / Domain</label><input id="site-hostname" placeholder="mysite.anonymousservers.info"></div>
      <div><label>Stack type</label>
        <select id="site-stack" onchange="siteStackChange()">
          <option value="static">Static (HTML/CSS/JS)</option>
          <option value="php">PHP</option>
          <option value="proxy">Node.js / Python (port proxy)</option>
          <option value="wordpress">WordPress</option>
        </select>
      </div>
    </div>
    <div class="frow c2">
      <div><label>Document root (leave blank for default)</label><input id="site-root" placeholder="auto"></div>
      <div id="site-proxy-port-wrap" style="display:none"><label>Backend port</label><input id="site-proxy-port" type="number" placeholder="3000"></div>
    </div>
    <div class="frow c2">
      <div><label>Index files</label><input id="site-index" value="index.html,index.htm,index.php"></div>
      <div><label>Directory listing</label><select id="site-listing"><option value="false">Disabled</option><option value="true">Enabled</option></select></div>
    </div>
    <div class="hint">DNS record, TLS certificate, and proxy route will be configured automatically.</div>
    <div id="site-add-progress" style="display:none;margin-top:12px">
      <div class="pbar"><div class="pbar-fill" id="site-add-bar" style="width:0%"></div></div>
      <div id="site-add-steps" style="margin-top:10px;font-size:13px;color:var(--dim)"></div>
    </div>
    <div class="actions">
      <button onclick="addSite()">Create Site</button>
      <button class="sec" onclick="hideAddSite()">Cancel</button>
    </div>
  </div>

  <!-- Site list -->
  <div id="sites-list"></div>

  <!-- PHP status -->
  <div class="card">
    <div class="card-title">PHP Status</div>
    <div id="php-status" style="font-size:13px;color:var(--dim)">Checking…</div>
    <div class="hint" style="margin-top:8px">
      PHP passthrough requires <code>php-cgi</code> (Windows: <code>php-cgi.exe</code>) to be installed and in your PATH.
      Download from <a href="https://windows.php.net/download/" target="_blank">windows.php.net</a> (Thread Safe x64).
      After installing, restart the webserver engine.
    </div>
  </div>

  <!-- Stack reference -->
  <div class="card">
    <div class="card-title">Stack Reference</div>
    <table>
      <thead><tr><th>Stack</th><th>Serves</th><th>Requires</th><th>Use for</th></tr></thead>
      <tbody>
        <tr><td><span class="badge info">static</span></td><td>HTML, CSS, JS, images</td><td>Nothing</td><td>Landing pages, SPAs, documentation</td></tr>
        <tr><td><span class="badge info">php</span></td><td>PHP files + static</td><td>php-cgi installed</td><td>WordPress, Laravel, custom PHP apps</td></tr>
        <tr><td><span class="badge info">proxy</span></td><td>Proxies to a port</td><td>App running on that port</td><td>Node.js, Python, Ruby, any backend</td></tr>
        <tr><td><span class="badge info">wordpress</span></td><td>WordPress</td><td>php-cgi + catalog install</td><td>WordPress sites (auto-installs via catalog)</td></tr>
      </tbody>
    </table>
  </div>
</div>

<!-- SITE DETAIL (rendered inline when a site is expanded) -->
<div id="page-site-detail" class="page">
  <div class="topbar">
    <div>
      <button class="sec sm" onclick="navigate('sites')" style="margin-bottom:8px">← Back to Sites</button>
      <div class="page-title" id="detail-title">Site Detail</div>
      <div class="page-sub" id="detail-sub"></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="sec" id="detail-visit-btn" onclick="visitSite()" target="_blank">↗ Visit</button>
      <button class="danger sm" onclick="deleteSite()">Delete Site</button>
    </div>
  </div>

  <div class="tabs">
    <div class="tab active" onclick="siteTab(this,'overview')">Overview</div>
    <div class="tab" onclick="siteTab(this,'files')">Files</div>
    <div class="tab" onclick="siteTab(this,'config')">Config</div>
    <div class="tab" onclick="siteTab(this,'logs')">Logs</div>
    <div class="tab" onclick="siteTab(this,'upload')">Upload</div>
    <div class="tab" onclick="siteTab(this,'deploy')">Deploy</div>
  </div>

  <div id="stab-overview" class="tabpane active">
    <div class="grid3" id="detail-stats"></div>
    <div class="card"><div class="card-title">Vhost Configuration</div><pre id="detail-config"></pre></div>
    <div class="card">
      <div class="card-title">Quick Actions</div>
      <div class="actions">
        <button class="sec" onclick="restartEngine('webserver')">↻ Restart Web Server</button>
        <button class="sec" onclick="siteTab(null,'upload')">⬆ Upload Files</button>
        <button class="sec" onclick="siteTab(null,'config')">⚙ Edit Config</button>
      </div>
    </div>
  </div>

  <div id="stab-files" class="tabpane">
    <div class="card">
      <div class="card-title">Files <span id="detail-path-display" style="font-size:12px;color:var(--dim);font-family:monospace"></span></div>
      <div style="display:flex;gap:8px;margin-bottom:14px">
        <input id="detail-fm-path" style="width:300px" placeholder="path">
        <button class="sec" onclick="detailFmBrowse()">Browse</button>
      </div>
      <div id="detail-fm-content"></div>
    </div>
  </div>

  <div id="stab-config" class="tabpane">
    <div class="card">
      <div class="card-title">Edit Vhost Config</div>
      <div class="frow c2">
        <div><label>Stack</label>
          <select id="detail-stack">
            <option value="static">Static</option>
            <option value="php">PHP</option>
            <option value="proxy">Port Proxy</option>
            <option value="wordpress">WordPress</option>
          </select>
        </div>
        <div><label>Backend Port (proxy only)</label><input id="detail-proxy-port" type="number" placeholder="3000"></div>
      </div>
      <div class="frow c2">
        <div><label>Index files (comma separated)</label><input id="detail-index"></div>
        <div><label>Directory listing</label><select id="detail-listing"><option value="false">Disabled</option><option value="true">Enabled</option></select></div>
      </div>
      <div class="actions"><button onclick="updateSiteConfig()">Save Config</button></div>
    </div>
    <div class="card">
      <div class="card-title">.htaccess Rules</div>
      <div style="font-size:13px;color:var(--dim);line-height:1.8;margin-bottom:12px">
        Edit <code>.htaccess</code> in your site root for access control, rate limiting, redirects, and CORS.
        Reloaded live — no restart needed.
      </div>
      <pre style="font-size:12px">deny  1.2.3.4              # block an IP
allow 192.168.0.0/24       # allow only local network
block /admin               # block a path
rate_limit 60              # max 60 requests/minute per IP
cors_origin *              # CORS header
noindex                    # tell crawlers to skip
redirect /old /new         # 301 redirect</pre>
    </div>
  </div>

  <div id="stab-logs" class="tabpane">
    <div class="card">
      <div class="card-title">Web Server Log</div>
      <div id="detail-log" class="logviewer" style="min-height:300px">Select the Logs tab to load</div>
    </div>
  </div>

  <div id="stab-upload" class="tabpane">
    <div class="card">
      <div class="card-title">⬆ Drag &amp; Drop Upload</div>
      <div id="upload-zone" style="border:2px dashed var(--border);border-radius:10px;padding:48px;text-align:center;cursor:pointer;transition:border-color .15s"
        ondragover="event.preventDefault();this.style.borderColor='var(--accent)'"
        ondragleave="this.style.borderColor='var(--border)'"
        ondrop="handleDrop(event)"
        onclick="$('upload-input').click()">
        <div style="font-size:32px;margin-bottom:12px">📁</div>
        <div style="font-size:14px;color:var(--dim)">Drop files here or click to browse</div>
        <div style="font-size:12px;color:var(--dim);margin-top:6px">Files are placed in this site's document root</div>
        <input type="file" id="upload-input" multiple style="display:none" onchange="handleFileInput(event)">
      </div>
      <div id="upload-progress" style="margin-top:14px"></div>
    </div>
    <div class="card">
      <div class="card-title">Uploaded Files</div>
      <table><thead><tr><th>Name</th><th>Size</th><th>nexus://</th><th>Uploaded</th><th></th></tr></thead>
      <tbody id="upload-files-table"></tbody></table>
    </div>
  </div>

  <div id="stab-deploy" class="tabpane">
    <div class="card">
      <div class="card-title">🚀 Deploy Project</div>
      <div style="font-size:13px;color:var(--dim);line-height:1.6;margin-bottom:14px">
        Drop a <code>.zip</code> of a built site, app, or static export. Files are extracted with
        their real paths intact — this is different from the Upload tab, which stores files
        individually and doesn't preserve a project's folder structure.
      </div>
      <div id="deploy-zone" style="border:2px dashed var(--border);border-radius:10px;padding:48px;text-align:center;cursor:pointer;transition:border-color .15s"
        ondragover="event.preventDefault();this.style.borderColor='var(--accent)'"
        ondragleave="this.style.borderColor='var(--border)'"
        ondrop="handleDeployDrop(event)"
        onclick="$('deploy-input').click()">
        <div style="font-size:32px;margin-bottom:12px" id="deploy-zone-icon">📦</div>
        <div style="font-size:14px;color:var(--dim)" id="deploy-zone-label">Drop a .zip here or click to browse</div>
        <input type="file" id="deploy-input" accept=".zip" style="display:none" onchange="handleDeployFileInput(event)">
      </div>
      <div class="frow c2" style="margin-top:16px">
        <div><label>Placement</label>
          <select id="deploy-mode" onchange="$('deploy-subfolder-wrap').style.display=this.value==='subfolder'?'block':'none'">
            <option value="replace">Replace — full swap, old release kept in history</option>
            <option value="merge">Merge — overlay onto current content</option>
            <option value="subfolder">Subfolder — namespace under a path</option>
          </select>
        </div>
        <div id="deploy-subfolder-wrap" style="display:none"><label>Subfolder name</label><input id="deploy-subfolder" placeholder="widget"></div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;margin-top:10px;font-size:13px;color:var(--dim)">
        <input type="checkbox" id="deploy-skip-health" style="width:auto"> Skip post-deploy health check (site intentionally doesn't answer plain HTTP on <code>/</code>)
      </label>
      <div class="actions" style="margin-top:14px">
        <button id="deploy-run-btn" onclick="runDeploy()" disabled>Deploy</button>
      </div>
      <div id="deploy-result" style="margin-top:14px"></div>
    </div>
    <div class="card">
      <div class="card-title">Release History</div>
      <div style="font-size:12px;color:var(--dim);margin-bottom:10px">Nothing here is deleted by a deploy — roll back to any prior release instantly.</div>
      <table><thead><tr><th>Release</th><th>Deployed</th><th>Status</th><th></th></tr></thead>
      <tbody id="deploy-releases-table"></tbody></table>
    </div>
  </div>
</div>

<!-- FILE MANAGER -->
<div id="page-files" class="page">
  <div class="topbar"><div><div class="page-title">File Manager</div><div class="page-sub" id="fm-path-display">/ sites</div></div>
    <div style="display:flex;gap:8px"><input id="fm-path" value="sites" style="width:200px"><button onclick="fmBrowse()">Browse</button></div>
  </div>
  <div class="card"><div id="fm-content"><div style="color:var(--dim);font-size:13px">Enter a path and click Browse.</div></div></div>
  <div class="card"><div class="card-title">Create / Edit File</div>
    <div class="frow"><div><label>Path (relative to nexus root)</label><input id="fm-newname" placeholder="sites/mysite/index.html"></div></div>
    <textarea id="fm-newcontent" rows="8" placeholder="File content…" style="font-family:monospace;font-size:12px;margin-bottom:10px"></textarea>
    <div class="actions"><button onclick="fmCreate()">Save File</button></div>
  </div>
</div>

<!-- MAIL -->
<div id="page-mail" class="page">
  <div class="topbar"><div><div class="page-title">Mail</div></div></div>
  <div class="tabs">
    <div class="tab active" onclick="mailTab(this,'accounts')">Accounts</div>
    <div class="tab" onclick="mailTab(this,'disposable')">Disposable</div>
    <div class="tab" onclick="mailTab(this,'dkim')">DKIM</div>
  </div>
  <div id="mtab-accounts" class="tabpane active">
    <div class="card"><div class="card-title">Create Mailbox</div>
      <div class="frow c3"><div><label>Address</label><input id="mail-addr" placeholder="you@${cfg.domain}"></div><div><label>Password</label><input id="mail-pw" type="password"></div><div><label>Quota (MB)</label><input id="mail-quota" type="number" value="500"></div></div>
      <div class="actions"><button onclick="createMailbox()">Create Mailbox</button></div>
    </div>
  </div>
  <div id="mtab-disposable" class="tabpane">
    <div class="card"><div class="card-title">Create Disposable Address</div>
      <div class="frow c2"><div><label>Forward to</label><input id="disp-fwd" placeholder="you@example.com"></div><div><label>Expires (hours)</label><input id="disp-ttl" type="number" value="24"></div></div>
      <div class="actions"><button onclick="createDisposable()">Create</button></div>
      <div id="disp-result" style="margin-top:12px;color:var(--accent);font-size:14px;font-family:monospace"></div>
    </div>
  </div>
  <div id="mtab-dkim" class="tabpane">
    <div class="card"><div class="card-title">DKIM Configuration</div>
      <div style="font-size:13px;color:var(--dim);line-height:1.8">DKIM key is generated automatically on startup. Copy the TXT record from startup logs and add it to your DNS zone:<br><br><code>default._domainkey.${cfg.domain}  TXT  "v=DKIM1; k=rsa; p=…"</code></div>
    </div>
  </div>
</div>

<!-- STORAGE -->
<div id="page-storage" class="page">
  <div class="topbar"><div><div class="page-title">Object Storage</div></div><button onclick="loadBuckets()">↻ Refresh</button></div>
  <div class="grid3" id="storage-stats"></div>
  <div class="card"><div class="card-title">Buckets</div>
    <div class="frow c2"><div><label>Bucket name</label><input id="bucket-name" placeholder="my-bucket"></div><div><label>Access</label><select id="bucket-access"><option value="private">Private</option><option value="public">Public</option></select></div></div>
    <div class="actions"><button onclick="createBucket()">Create Bucket</button></div>
    <table style="margin-top:16px"><thead><tr><th>Name</th><th>Objects</th><th>Access</th><th></th></tr></thead><tbody id="buckets-table"></tbody></table>
  </div>
  <div class="card"><div class="card-title">S3 Endpoint</div><pre>http://${cfg.domain}:9100</pre><div class="hint">Use with AWS CLI, rclone, or Cyberduck.</div></div>
</div>

<!-- CRON -->
<div id="page-cron" class="page">
  <div class="topbar"><div><div class="page-title">Cron Jobs</div></div><button onclick="loadCron()">↻ Refresh</button></div>
  <div class="card"><div class="card-title">Add Cron Job</div>
    <div class="frow c2"><div><label>Name</label><input id="cron-name" placeholder="daily-backup"></div><div><label>Schedule</label><input id="cron-expr" placeholder="0 2 * * *"></div></div>
    <div class="frow c2"><div><label>Type</label><select id="cron-type"><option value="webhook">Webhook</option><option value="command">Shell command</option></select></div><div><label>Target</label><input id="cron-target" placeholder="https://…"></div></div>
    <div class="hint">Examples: <code>0 * * * *</code> hourly · <code>*/5 * * * *</code> every 5min · <code>0 2 * * *</code> 2am daily</div>
    <div class="actions"><button onclick="addCron()">Schedule Job</button></div>
  </div>
  <div class="card"><div class="card-title">Scheduled Jobs</div>
    <table><thead><tr><th>Name</th><th>Schedule</th><th>Action</th><th>Last Run</th><th></th></tr></thead><tbody id="cron-table"></tbody></table>
  </div>
</div>

<!-- FIREWALL -->
<div id="page-firewall" class="page">
  <div class="topbar"><div><div class="page-title">Firewall</div></div><button onclick="loadFirewall()">↻ Refresh</button></div>
  <div class="grid3" id="fw-stats"></div>
  <div class="card"><div class="card-title">Block / Allow IP</div>
    <div class="frow c3"><div><label>IP or CIDR</label><input id="fw-ip" placeholder="1.2.3.4 or 10.0.0.0/8"></div><div><label>Action</label><select id="fw-action"><option value="ban">Ban</option><option value="allow">Allow</option></select></div><div><label>Reason</label><input id="fw-reason" placeholder="manual block"></div></div>
    <div class="actions"><button onclick="addFwRule()">Apply Rule</button></div>
  </div>
  <div class="card"><div class="card-title">Active Bans</div>
    <table><thead><tr><th>IP</th><th>Reason</th><th>Hits</th><th>Banned At</th><th></th></tr></thead><tbody id="fw-bans-table"></tbody></table>
  </div>
  <div class="card"><div class="card-title">OS Firewall Rules (sysfw)</div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button class="sec" onclick="sysfwDetect()">Detect Tool</button>
      <button class="sec" onclick="sysfwApply()">Apply NEXUS Rules</button>
      <button class="sec" onclick="sysfwList()">List OS Rules</button>
    </div>
    <div id="sysfw-result" style="font-size:13px;color:var(--dim)">Click a button above to manage OS-level firewall rules (netsh / ufw / iptables).</div>
  </div>
</div>

<!-- VPN -->
<div id="page-vpn" class="page">
  <div class="topbar"><div><div class="page-title">VPN Manager</div></div></div>
  <div class="card"><div class="card-title">Install WireGuard</div>
    <div class="frow c2"><div><label>Domain</label><input id="vpn-domain" placeholder="vpn.${cfg.domain}"></div><div><label>UDP Port</label><input id="vpn-port" type="number" value="51820"></div></div>
    <div class="actions"><button onclick="installWireguard()">Install via App Catalog</button></div>
    <div id="vpn-install-result" style="margin-top:12px"></div>
  </div>
  <div class="card"><div class="card-title">Add VPN Client</div>
    <div class="frow c2"><div><label>Client name</label><input id="vpn-cname" placeholder="alice-phone"></div><div><label>IP</label><input id="vpn-cip" placeholder="10.8.0.2/32"></div></div>
    <div class="actions"><button onclick="addVpnClient()">Generate Config</button></div>
    <div id="vpn-client-result" style="margin-top:12px"></div>
  </div>
</div>

<!-- API KEYS -->
<div id="page-apikeys" class="page">
  <div class="topbar"><div><div class="page-title">API Keys</div></div></div>
  <div class="card"><div class="card-title">Create API Key</div>
    <div class="frow c2"><div><label>Label</label><input id="key-label" placeholder="my-integration"></div><div><label>Scopes</label><select id="key-scopes" multiple style="height:80px"><option value="hosting:read" selected>hosting:read</option><option value="hosting:write" selected>hosting:write</option><option value="dns:write">dns:write</option><option value="admin">admin</option></select></div></div>
    <div class="actions"><button onclick="createApiKey()">Create Key</button></div>
    <div id="key-result" style="margin-top:12px;word-break:break-all;font-family:monospace;font-size:13px;color:var(--green)"></div>
    <div id="key-note" style="font-size:12px;color:var(--dim);margin-top:4px;display:none">⚠ Shown once — copy now</div>
  </div>
  <div class="card"><div class="card-title">API Reference</div>
    <div style="font-size:13px;color:var(--dim);line-height:2">
      Base URL: <code>http://localhost:9000</code><br>
      Auth: <code>Authorization: Bearer YOUR_KEY</code><br>
      DNS: <code>GET/POST/DELETE /ui/dns</code><br>
      Catalog: <code>GET /ui/catalog</code> · <code>POST /ui/catalog/install</code><br>
      Provision: <code>POST /provision/user</code><br>
      Status: <code>GET /ui/status</code><br>
      Tunnel: <code>GET /ui/tunnel/status</code> · <code>POST /ui/tunnel/restart</code><br>
      Peer: <code>GET /ui/peer/identity</code> · <code>GET /ui/peer/peers</code>
    </div>
  </div>
</div>

<!-- NETWORK / AUTO DNS -->
<div id="page-network" class="page">
  <div class="topbar"><div><div class="page-title">Auto DNS</div></div><button onclick="loadAdns()">↻ Refresh</button></div>
  <div class="grid3" id="net-stats"></div>
  <div class="card"><div class="card-title">DNS Methods</div><div id="autodns-methods" style="font-size:13px;color:var(--dim)">Loading…</div></div>
  <div class="card"><div class="card-title">Configure Provider</div>
    <div class="frow c2"><div><label>Method</label><select id="autodns-pick" onchange="adnsFormSwitch()"><option value="godaddy">GoDaddy API</option><option value="cloudflare">Cloudflare</option><option value="duckdns">DuckDNS (free)</option><option value="dynv6">dynv6 (free)</option></select></div></div>
    <div id="adns-form-godaddy"><div class="frow c2"><div><label>API Key</label><input id="gd-key" placeholder="GoDaddy API key"></div><div><label>Secret</label><input id="gd-secret" type="password"></div></div></div>
    <div id="adns-form-cloudflare" style="display:none"><div class="frow c2"><div><label>API Token</label><input id="cf-tok"></div><div><label>Zone ID</label><input id="cf-zone"></div></div></div>
    <div id="adns-form-duckdns" style="display:none"><div class="frow c2"><div><label>Token</label><input id="duck-tok"></div><div><label>Subdomain</label><input id="duck-sub"></div></div></div>
    <div id="adns-form-dynv6" style="display:none"><div class="frow c2"><div><label>Token</label><input id="dv6-tok"></div><div><label>Zone</label><input id="dv6-zone"></div></div></div>
    <div class="actions"><button onclick="saveAdnsConfig()">Save &amp; Activate</button><button class="sec" onclick="runAdns()">Update Now</button></div>
  </div>
</div>

<!-- TUNNEL -->
<div id="page-tunnel" class="page">
  <div class="topbar"><div><div class="page-title">Tunnel</div></div></div>
  <div class="card"><div class="card-title">Active Tunnel</div>
    <div id="tunnel-active" style="font-size:15px;margin-bottom:12px;color:var(--dim)">Loading…</div>
    <div class="actions"><button onclick="copyTunnelUrl()" class="sec">Copy URL</button><button onclick="restartTunnel()" class="sec">↻ Re-probe</button></div>
  </div>
  <div class="card"><div class="card-title">Strategy Results</div><div id="tunnel-strategies"></div></div>
  <div class="card"><div class="card-title">Premium Tokens</div>
    <div class="frow c2"><div><label>Cloudflare Tunnel Token</label><input id="cf-tunnel-tok" placeholder="from Zero Trust → Tunnels"></div><div><label>Ngrok Token</label><input id="ngrok-tok" placeholder="from dashboard.ngrok.com"></div></div>
    <div class="actions"><button onclick="saveTunnelConfig()">Save &amp; Re-probe</button></div>
  </div>
</div>

<!-- PEER -->
<div id="page-peer" class="page">
  <div class="topbar"><div><div class="page-title">Peer Network / P2P</div></div></div>
  <div class="card"><div class="card-title">Your Identity</div>
    <div class="grid2">
      <div>
        <div style="font-size:11px;color:var(--dim);margin-bottom:4px">FINGERPRINT</div>
        <div id="peer-fp" style="font-family:monospace;font-size:14px;color:var(--accent)">Loading…</div>
        <div style="font-size:11px;color:var(--dim);margin-top:12px;margin-bottom:4px">NEXUS:// URI</div>
        <div id="peer-uri" style="font-family:monospace;font-size:12px;word-break:break-all">Loading…</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--dim);margin-bottom:4px">PUBLIC IP</div>
        <div id="peer-ip" style="font-family:monospace;font-size:22px;color:var(--green)">—</div>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button onclick="copyPeerUri()" class="sec">Copy URI</button>
          <button onclick="reannounce()" class="sec">↻ Re-announce</button>
        </div>
      </div>
    </div>
  </div>
  <div class="card"><div class="card-title">Known Peers <span id="peer-count" style="font-size:12px;color:var(--dim)"></span></div>
    <table><thead><tr><th>Fingerprint</th><th>IP</th><th>Port</th><th>Last Seen</th><th></th></tr></thead><tbody id="peers-table"></tbody></table>
    <div class="frow" style="margin-top:14px"><div><label>Connect to nexus:// URI</label><input id="peer-connect-val" placeholder="nexus://…"></div></div>
    <div class="actions"><button onclick="connectPeer()">Connect</button></div>
  </div>
</div>

<!-- BILLING -->
<div id="page-billing" class="page">
  <div class="topbar"><div><div class="page-title">Billing &amp; Plans</div></div></div>
  <div class="card"><div class="card-title">Account</div><div id="billing-info">Loading…</div></div>
</div>

<!-- SETTINGS -->
<div id="page-settings" class="page">
  <div class="topbar"><div><div class="page-title">Settings</div></div></div>
  <div class="card"><div class="card-title">Engine Config Files</div>
    <div class="frow c2"><div><label>Engine</label><select id="settings-engine" onchange="loadSettings()"><option value="">All</option><option>proxy</option><option>dns</option><option>tls</option><option>auth</option><option>smtp</option><option>tunnel</option><option>peer</option><option>autodns</option><option>billing</option></select></div></div>
    <div id="settings-dump" style="margin-top:14px"></div>
  </div>
  <div class="card"><div class="card-title">Platform Info</div>
    <div style="font-size:13px;color:var(--dim);line-height:2">
      <div>Domain: <code>${cfg.domain}</code></div>
      <div>Component ID: <code>${COMPONENT_ID}</code></div>
      <div>Component UUID: <code>${COMPONENT_UUID}</code></div>
      <div>NexusPanel: v2.0.0</div>
    </div>
  </div>
</div>

</div><!-- /main -->
</div><!-- /shell -->

<!-- INSTALL MODAL -->
<div id="install-modal" class="modal">
  <div class="modal-box">
    <div style="font-size:16px;font-weight:700;margin-bottom:16px" id="modal-title">Install App</div>
    <input type="hidden" id="modal-app-id">
    <div class="frow"><label>Domain</label><input id="modal-domain" placeholder="app.${cfg.domain}"></div>
    <div class="frow c2"><div><label>Tenant</label><input id="modal-tenant" value="default"></div><div><label>Git URL (optional)</label><input id="modal-giturl" placeholder="https://github.com/…"></div></div>
    <div class="actions"><button onclick="submitInstall()">Install</button><button class="sec" onclick="closeModal()">Cancel</button></div>
  </div>
</div>
<div id="toast"></div>

<script src="/ui-assets/app.js"></script>
</body></html>`;
}

// ─── HTTP server ──────────────────────────────────────────────────────────────
// Flat router — exact matches first, prefix catches last.
// Never nest a startsWith inside another startsWith.

const ROOT2 = process.env.NEXUS_ROOT || path.join(__dirname, '..');

async function router(req, res) {
  const method = req.method.toUpperCase();
  const rawUrl = req.url;
  const url    = rawUrl.split('?')[0];
  const qs     = new URL(rawUrl, 'http://x').searchParams;
  const body   = (['POST','PUT','PATCH','DELETE'].includes(method) && url !== '/ui/deploy/run')
    ? await readBody(req) : {};

  // ── static UI assets (real files now, not embedded strings) ────────────────
  if (method === 'GET' && url === '/ui-assets/app.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(UI_APP_JS);
  }
  if (method === 'GET' && url === '/ui-assets/style.css') {
    res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(UI_STYLE_CSS);
  }

  // ── SPA shell (non-API GET) ──────────────────────────────────────────────────
  if (method === 'GET'
      && !url.startsWith('/ui/') && !url.startsWith('/auth/')
      && !url.startsWith('/provision/') && !url.startsWith('/registrar/')
      && !url.startsWith('/catalog/') && !url.startsWith('/storage/')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(shell());
  }

  // ── Exact GET routes ──────────────────────────────────────────────────────────
  if (method === 'GET') {
    if (url === '/ui/status')       { try { return jsonR(res, 200, await ipcReq('monitor','monitor:status',{},4000)); } catch { return jsonR(res,200,{status:'unknown',services:[]}); } }
    if (url === '/ui/dns')          { try { return jsonR(res, 200, await ipcReq('dns','zone:get',{domain:qs.get('domain')},3000)); } catch { return jsonR(res,200,{records:[]}); } }
    if (url === '/ui/dns/domains')  { try { return jsonR(res, 200, await ipcReq('dns','zone:list',{},3000)); } catch { return jsonR(res,200,{zones:[]}); } }
    if (url === '/ui/catalog')      { try { return jsonR(res, 200, await ipcReq('catalog','catalog:list',{},3000)); } catch { return jsonR(res,200,{apps:[]}); } }
    if (url === '/ui/installs')     { return jsonR(res, 200, { installs: await ipc.db?.all('installs').catch(()=>[]) || [] }); }
    if (url === '/ui/storage')      { return jsonR(res, 200, { buckets: await ipc.db?.all('buckets').catch(()=>[]) || [] }); }
    if (url === '/ui/ssl/certs')    {
      const certsDir = path.join(ROOT2, 'conf', 'tls', 'certs');
      const certs = [];
      try { for (const f of fs.readdirSync(certsDir).filter(f=>f.endsWith('.crt'))) certs.push({ domain: f.replace('.crt',''), valid: true, type: 'ACME/JS-fallback' }); } catch {}
      return jsonR(res, 200, { certs });
    }
    if (url === '/ui/billing')      { const t = await ipc.db?.query('tenants',r=>r.tenantId==='default').catch(()=>[]) || []; return jsonR(res,200,{tenant:t[0]||null}); }
    if (url === '/ui/settings')     {
      const confDir = path.join(ROOT2, 'conf'); const out = {};
      try { for (const f of fs.readdirSync(confDir).filter(f=>f.endsWith('.conf'))) { try { out[f]=JSON.parse(fs.readFileSync(path.join(confDir,f),'utf8')); } catch {} } } catch {}
      if (out['auth.conf'])    delete out['auth.conf'].jwtSecret;
      if (out['billing.conf']) delete out['billing.conf'].encryptionKey;
      return jsonR(res, 200, out);
    }
    if (url === '/ui/webserver/vhosts') { try { return jsonR(res,200,await ipcReq('webserver','webserver:vhost:list',{},4000)); } catch { return jsonR(res,200,{vhosts:[]}); } }
    if (url === '/ui/webserver/php')    { try { return jsonR(res,200,await ipcReq('webserver','webserver:php:check',{},4000)); } catch { return jsonR(res,200,{available:false,path:null}); } }
    if (url === '/ui/deploy/sites')     { return proxyReq(res,4010,'/deploy/sites','GET',null); }
    if (url === '/ui/setup/status')     { return proxyReq(res,4011,'/setup/status','GET',null); }
    if (url === '/ui/setup/drift-check'){ return proxyReq(res,4011,'/setup/drift-check','GET',null); }
    if (url === '/ui/files')       {
      const p = qs.get('path') || 'sites';
      const full = path.join(ROOT2, p.replace(/\.\./g,''));
      try { return jsonR(res,200,{ entries: fs.readdirSync(full).map(name=>{const s=fs.statSync(path.join(full,name));return{name,type:s.isDirectory()?'dir':'file',size:s.size};}), path: p }); }
      catch { return jsonR(res,200,{entries:[]}); }
    }
    if (url === '/ui/files/read')  {
      const full = path.join(ROOT2, (qs.get('path')||'').replace(/\.\./g,''));
      try { return jsonR(res,200,{content:fs.readFileSync(full,'utf8')}); } catch { return jsonR(res,404,{error:'not found'}); }
    }
  }

  // ── Exact POST routes ─────────────────────────────────────────────────────────
  if (method === 'POST') {
    if (url === '/ui/dns')                { try { return jsonR(res,200,await ipcReq('dns','zone:update',{domain:body.domain,name:body.name,type2:body.type,value:body.value,ttl:body.ttl},4000)); } catch(e) { return jsonR(res,500,{ok:false,error:e.message}); } }
    if (url === '/ui/dns/domains')        { try { return jsonR(res,200,await ipcReq('dns','zone:create',{domain:body.domain,ns1:body.ns1,ns2:body.ns2,ttl:body.ttl},4000)); } catch(e) { return jsonR(res,500,{ok:false,error:e.message}); } }
    if (url === '/ui/catalog/install')    { const rid=`ui-${Date.now()}`; ipc.send('route',{type:'catalog:install',...body,requestId:rid},'catalog'); return jsonR(res,202,{requestId:rid}); }
    if (url === '/ui/storage/bucket')     {
      const r = await new Promise(resolve => {
        const r2=http.request({hostname:'127.0.0.1',port:9100,path:'/'+body.bucket,method:'PUT',headers:{'x-tenant-id':'default','Content-Length':0}},rs=>{rs.resume();resolve({ok:true});});
        r2.on('error',e=>resolve({error:e.message})); r2.end();
      });
      return jsonR(res,200,r);
    }
    if (url === '/ui/mail/disposable')    { try { return jsonR(res,200,await ipcReq('smtp','smtp:disposable:create',body,5000)); } catch(e) { return jsonR(res,500,{error:e.message}); } }
    if (url === '/ui/monitor/add')        { return proxyReq(res,4004,'/api/monitors','POST',body); }
    if (url === '/ui/engine/restart')     { ipc.send('route',{type:'engine:restart',engine:body.engine},'kernel'); return jsonR(res,200,{ok:true}); }
    if (url === '/ui/glue/apply')         { return proxyReq(res,4009,'/glue/apply','POST',body); }
    if (url === '/ui/sysfw/detect')       { try { return jsonR(res,200,await ipcReq('firewall','sysfw:detect',{},6000)); } catch(e) { return jsonR(res,500,{error:e.message}); } }
    if (url === '/ui/sysfw/apply')        { try { return jsonR(res,200,await ipcReq('firewall','sysfw:apply',{},10000)); } catch(e) { return jsonR(res,500,{error:e.message}); } }
    if (url === '/ui/sysfw/list')         { try { return jsonR(res,200,await ipcReq('firewall','sysfw:list',{},10000)); } catch(e) { return jsonR(res,500,{error:e.message}); } }
    if (url === '/ui/upnp/status')        { try { return jsonR(res,200,await ipcReq('firewall','upnp:status',{},6000)); } catch(e) { return jsonR(res,500,{error:e.message}); } }
    if (url === '/ui/upnp/open')          { try { return jsonR(res,200,await ipcReq('firewall','upnp:open',{},15000)); } catch(e) { return jsonR(res,500,{error:e.message}); } }
    if (url === '/ui/upnp/close')         { try { return jsonR(res,200,await ipcReq('firewall','upnp:close',{},15000)); } catch(e) { return jsonR(res,500,{error:e.message}); } }
    if (url === '/ui/webserver/vhost')    {
      try {
        const r = await ipcReq('webserver','webserver:vhost:add',{vhost:body.vhost},6000);
        if (r?.ok) { ipc.send('route',{type:'proxy:vhost:add',hostname:body.vhost?.hostname,target:'http://127.0.0.1:7700'},'proxy'); ipc.send('route',{type:'tls:issue',domain:body.vhost?.hostname},'tls'); ipc.send('route',{type:'zone:update',name:(body.vhost?.hostname||'').split('.')[0],type2:'A',value:'76.115.163.201',ttl:300},'dns'); }
        return jsonR(res,200,r);
      } catch(e) { return jsonR(res,500,{error:e.message}); }
    }
    if (url === '/ui/webserver/vhost/update') { try { return jsonR(res,200,await ipcReq('webserver','webserver:vhost:update',{vhost:body.vhost},6000)); } catch(e) { return jsonR(res,500,{error:e.message}); } }
    if (url === '/ui/deploy/run') {
      // NOT proxyReq — this is a raw multipart stream, deliberately excluded
      // from readBody() above so req's bytes reach deploy.js untouched.
      return new Promise(resolve => {
        const r2 = http.request({ hostname:'127.0.0.1', port:4010, path:'/deploy/run', method:'POST', headers: req.headers }, rs => {
          let d=''; rs.on('data',c=>d+=c);
          rs.on('end',()=>{ try{jsonR(res,rs.statusCode,JSON.parse(d));}catch{jsonR(res,502,{ok:false,error:{code:'INTERNAL',message:'bad response from deploy engine'}});} resolve(); });
        });
        r2.on('error',e=>{jsonR(res,502,{ok:false,error:{code:'INTERNAL',message:e.message}}); resolve();});
        req.pipe(r2);
      });
    }
    if (url === '/ui/deploy/rollback')  { return proxyReq(res,4010,'/deploy/rollback','POST',body); }
    if (url === '/ui/deploy/prune')     { return proxyReq(res,4010,'/deploy/prune','POST',body); }
    if (url === '/ui/setup/configure')  { return proxyReq(res,4011,'/setup/configure','POST',body); }
    if (url === '/ui/setup/run')        { return proxyReq(res,4011,'/setup/run','POST',body); }
    if (url === '/ui/setup/resume')     { return proxyReq(res,4011,'/setup/resume','POST',body); }
    if (url === '/ui/files/write') {
      const full = path.join(ROOT2, (body.path||'').replace(/\.\./g,''));
      try { fs.mkdirSync(path.dirname(full),{recursive:true}); fs.writeFileSync(full,body.content||''); return jsonR(res,200,{ok:true}); }
      catch(e) { return jsonR(res,500,{error:e.message}); }
    }
    if (url === '/ui/cron') { await ipc.db?.insert('cron_jobs',{...body,createdAt:Date.now()}).catch(()=>{}); ipc.send('route',{type:'cron:schedule',...body},'queue'); return jsonR(res,200,{ok:true}); }
  }

  // ── Exact DELETE routes ───────────────────────────────────────────────────────
  if (method === 'DELETE') {
    if (url === '/ui/dns') { try { return jsonR(res,200,await ipcReq('dns','zone:delete',{domain:body.domain,name:body.name,type2:body.type},4000)); } catch(e) { return jsonR(res,500,{ok:false,error:e.message}); } }
    if (url === '/ui/dns/domains') { try { return jsonR(res,200,await ipcReq('dns','zone:remove',{domain:body.domain},4000)); } catch(e) { return jsonR(res,500,{ok:false,error:e.message}); } }
    if (url === '/ui/cron') { await ipc.db?.delete('cron_jobs',`r => r.name === '${body.name}'`).catch(()=>{}); return jsonR(res,200,{ok:true}); }
  }

  // ── Prefix GET routes ─────────────────────────────────────────────────────────
  if (method === 'GET') {
    if (url.startsWith('/ui/logs/')) {
      const engine = url.slice('/ui/logs/'.length).split('?')[0];
      const lines  = parseInt(qs.get('lines'))||100;
      const lf     = path.join(ROOT2,'logs',engine+'.log');
      try { return jsonR(res,200,{lines:fs.readFileSync(lf,'utf8').split('\n').filter(Boolean).slice(-lines)}); }
      catch { return jsonR(res,200,{lines:[]}); }
    }
    if (url.startsWith('/catalog/status/')) return proxyReq(res,4005,url,'GET',null);
    if (url.startsWith('/ui/deploy/releases/')) return proxyReq(res,4010,url.replace('/ui/deploy','/deploy'),'GET',null);
    if (url.startsWith('/ui/webserver/files/')) {
      const hostname = decodeURIComponent(url.replace('/ui/webserver/files/',''));
      return new Promise(resolve => {
        const r2=http.request({hostname:'127.0.0.1',port:7700,path:'/__nexus__/files',method:'GET',headers:{host:hostname}},rs=>{
          let d=''; rs.on('data',c=>d+=c); rs.on('end',()=>{jsonR(res,rs.statusCode,JSON.parse(d||'{}')); resolve();});
        }); r2.on('error',()=>{jsonR(res,502,{files:[]}); resolve();}); r2.end();
      });
    }
  }

  // ── Prefix POST routes ────────────────────────────────────────────────────────
  if (method === 'POST') {
    if (url.startsWith('/ui/webserver/upload/')) {
      const hostname = decodeURIComponent(url.replace('/ui/webserver/upload/',''));
      return new Promise(resolve => {
        const r2=http.request({hostname:'127.0.0.1',port:7700,path:'/__nexus__/upload',method:'POST',headers:{...req.headers,host:hostname}},rs=>{
          let d=''; rs.on('data',c=>d+=c); rs.on('end',()=>{ try{jsonR(res,rs.statusCode,{ok:true,...JSON.parse(d)});}catch{jsonR(res,200,{ok:true});} resolve();});
        }); r2.on('error',e=>{jsonR(res,502,{ok:false,error:e.message}); resolve();}); req.pipe(r2);
      });
    }
  }

  // ── Prefix DELETE routes ──────────────────────────────────────────────────────
  if (method === 'DELETE') {
    if (url.startsWith('/ui/webserver/vhost/')) {
      const hostname = decodeURIComponent(url.replace('/ui/webserver/vhost/',''));
      try { return jsonR(res,200,await ipcReq('webserver','webserver:vhost:remove',{hostname},4000)); } catch(e) { return jsonR(res,500,{error:e.message}); }
    }
    if (url.startsWith('/ui/webserver/file/')) {
      const parts = url.replace('/ui/webserver/file/','').split('/');
      const hostname = decodeURIComponent(parts[0]); const fileId = parts[1];
      return new Promise(resolve => {
        const r2=http.request({hostname:'127.0.0.1',port:7700,path:`/__nexus__/files/${fileId}`,method:'DELETE',headers:{host:hostname}},rs=>{rs.resume(); jsonR(res,200,{ok:true}); resolve();});
        r2.on('error',()=>{jsonR(res,502,{ok:false}); resolve();}); r2.end();
      });
    }
  }

  // ── Any-method prefix proxy passes ────────────────────────────────────────────
  if (url.startsWith('/auth/'))       return proxyReq(res,4001,url,method,body);
  if (url.startsWith('/provision/'))  return proxyReq(res,4008,url,method,body);
  if (url.startsWith('/registrar/'))  return proxyReq(res,4007,rawUrl,method,body);
  if (url.startsWith('/storage/'))    return proxyReq(res,9100,url,method,body);
  if (url.startsWith('/ui/peer'))     return proxyReq(res,7800,url.replace('/ui/peer','/peer'),method,body);
  if (url.startsWith('/ui/tunnel'))   return proxyReq(res,7801,url.replace('/ui/tunnel','/tunnel'),method,body);
  if (url.startsWith('/ui/autodns'))  return proxyReq(res,7802,url.replace('/ui/autodns','/autodns'),method,body);
  if (url.startsWith('/ui/firewall')) return proxyReq(res,4000,url.replace('/ui/firewall','/firewall'),method,body);
  if (url.startsWith('/ui/cron'))     { const jobs = await ipc.db?.all('cron_jobs').catch(()=>[])||[]; return jsonR(res,200,{jobs}); }

  jsonR(res, 404, { error: 'not found', url });
}

const server = http.createServer((req, res) => {
  router(req, res).catch(e => {
    log(`ui error: ${e.message}`, 'ERROR');
    try { if (!res.headersSent) { res.writeHead(500); res.end(JSON.stringify({error:e.message})); } } catch {}
  });
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    const next = cfg.listenPort + 1;
    log(`port ${cfg.listenPort} in use — trying :${next}`, 'WARN');
    server.listen(next, () => { log(`ui on :${next}`); claimPort(next); });
  } else { throw err; }
});

server.listen(cfg.listenPort, () => {
  log(`ui engine ready`);
  log(`ui control panel on :${cfg.listenPort}`);
  log(`open: http://localhost:${cfg.listenPort}`);
  claimPort(cfg.listenPort);
});

ipc.on('status:ping', payload => {
  ipc.send('status:pong', { requestId: payload?.requestId, engine: NAME, alive: true, ts: Date.now() });
});

log('ui engine ready');
