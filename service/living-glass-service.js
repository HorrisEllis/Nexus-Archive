'use strict';
// service/living-glass-service.js — Living Glass Service Wrapper
// UUID: living-glass-service-v1-0000-0000-000000000007
//
// Thin wrapper that boots living-glass/index.js as a managed service.
// Usage:
//   node service/living-glass-service.js          — start
//   node service/living-glass-service.js status   — check
//   node service/living-glass-service.js stop     — stop

const path = require('path');
const fs   = require('fs');
const http = require('http');

const ROOT     = path.join(__dirname, '..');
const PORT     = parseInt(process.env.LIVING_GLASS_PORT || '7800');
const PID_FILE = path.join(ROOT, 'data/living-glass/living-glass.pid');
const cmd      = process.argv[2];

if      (cmd === 'status') checkStatus();
else if (cmd === 'stop')   stopService();
else                       startService();

function checkStatus() {
  if (!fs.existsSync(PID_FILE)) { console.log('NOT RUNNING'); process.exit(1); }
  const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim());
  try {
    process.kill(pid, 0);
    const req = http.get(`http://127.0.0.1:${PORT}/health`, { timeout: 2000 }, res => {
      let b = ''; res.on('data', d => b += d); res.on('end', () => {
        try { const data = JSON.parse(b); console.log(`RUNNING pid=${pid} systems=${data.field?.systems?.online || '?'} fires=${data.fires || 0}`); }
        catch { console.log(`RUNNING pid=${pid} status=${res.statusCode}`); }
        process.exit(0);
      });
    });
    req.on('error', () => { console.log(`RUNNING pid=${pid} (port not responding)`); process.exit(0); });
  } catch { fs.unlinkSync(PID_FILE); console.log('NOT RUNNING (stale pid)'); process.exit(1); }
}

function stopService() {
  if (!fs.existsSync(PID_FILE)) { console.log('NOT RUNNING'); process.exit(0); }
  const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim());
  try { process.kill(pid, 'SIGTERM'); console.log(`SIGTERM -> pid=${pid}`); }
  catch { console.log('Failed to stop'); }
  if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
  process.exit(0);
}

function startService() {
  fs.mkdirSync(path.join(ROOT, 'data/living-glass'), { recursive: true });
  fs.writeFileSync(PID_FILE, String(process.pid));

  process.on('SIGTERM', () => {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    process.exit(0);
  });
  process.on('SIGINT', () => {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    process.exit(0);
  });

  console.log(`[living-glass-service] starting living-glass/index.js pid=${process.pid} port=${PORT}`);
  require('../living-glass/index.js');
}
