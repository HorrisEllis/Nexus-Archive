#!/usr/bin/env node
'use strict';
/**
 * cos/src/cli/index.js — COS CLI
 * UUID: cos-cli-v1-0000-0000-000000000017
 * Phase: 2 — Host CLI
 *
 * All commands read from the COS Host API (:7705).
 * CLI = consumer of API. CLI does not talk to kernel directly.
 *
 * Usage:
 *   cos create --type browser --name "myapp" --url https://example.com
 *   cos start <id>
 *   cos stop <id>
 *   cos list
 *   cos status <id>
 *   cos snapshot <id>
 *   cos swap <fromId> <toId>
 *   cos destroy <id>
 *   cos cmd <id> <eventType> [--data '{}']
 *   cos map
 */

const fetch = require('node-fetch');

const COS_URL = process.env.COS_URL || 'http://localhost:7705';

async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' }, timeout: 30000 };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${COS_URL}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function print(data) { console.log(JSON.stringify(data, null, 2)); }

async function run() {
  const [,, cmd, ...args] = process.argv;

  switch (cmd) {
    case 'create': {
      const flags = parseFlags(args);
      if (!flags.type) { console.error('--type required'); process.exit(1); }
      if (!flags.name) { console.error('--name required'); process.exit(1); }
      const result = await api('POST', '/api/compartments', {
        type: flags.type, name: flags.name,
        url:  flags.url,
        config: flags.config ? JSON.parse(flags.config) : {},
      });
      console.log(`Created: ${result.compartmentId} (${flags.type}: ${flags.name})`);
      break;
    }

    case 'start': {
      const id = args[0];
      if (!id) { console.error('id required'); process.exit(1); }
      const result = await api('POST', `/api/compartments/${id}/start`);
      console.log(`Started: ${id}`);
      print(result);
      break;
    }

    case 'stop': {
      const id = args[0];
      if (!id) { console.error('id required'); process.exit(1); }
      await api('POST', `/api/compartments/${id}/stop`);
      console.log(`Stopped: ${id}`);
      break;
    }

    case 'destroy': {
      const id = args[0];
      if (!id) { console.error('id required'); process.exit(1); }
      await api('DELETE', `/api/compartments/${id}`);
      console.log(`Destroyed: ${id}`);
      break;
    }

    case 'list': {
      const { compartments } = await api('GET', '/api/compartments');
      if (!compartments.length) { console.log('No compartments.'); break; }
      const pad = (s, n) => String(s).padEnd(n);
      console.log(pad('ID', 38) + pad('TYPE', 12) + pad('NAME', 20) + pad('STATE', 12) + 'AGE');
      for (const c of compartments) {
        const age = Math.round((Date.now() - c.createdAt) / 1000) + 's';
        console.log(pad(c.id, 38) + pad(c.type, 12) + pad(c.name, 20) + pad(c.state, 12) + age);
      }
      break;
    }

    case 'status': {
      const id = args[0];
      if (!id) { console.error('id required'); process.exit(1); }
      const record = await api('GET', `/api/compartments/${id}`);
      print(record);
      break;
    }

    case 'snapshot': {
      const id = args[0];
      if (!id) { console.error('id required'); process.exit(1); }
      const result = await api('POST', `/api/compartments/${id}/snapshot`);
      print(result);
      break;
    }

    case 'swap': {
      const [fromId, toId] = args;
      if (!fromId || !toId) { console.error('fromId and toId required'); process.exit(1); }
      await api('POST', '/api/compartments/swap', { fromId, toId });
      console.log(`Swapped: ${fromId} → ${toId}`);
      break;
    }

    case 'cmd': {
      const [id, eventType, ...rest] = args;
      if (!id || !eventType) { console.error('id and eventType required'); process.exit(1); }
      const flags = parseFlags(rest);
      const data  = flags.data ? JSON.parse(flags.data) : {};
      const result = await api('POST', `/api/compartments/${id}/cmd`, { event: eventType, data });
      print(result);
      break;
    }

    case 'map': {
      const map = await api('GET', '/api/system-map');
      const { compartments, drivers, ts } = map;
      console.log(`\nCOS System Map (${new Date(ts).toISOString()})`);
      console.log(`Drivers: ${drivers.join(', ')}`);
      console.log(`Compartments: ${compartments.length}`);
      for (const c of compartments) {
        const icon = { running: '●', stopped: '○', error: '✗', starting: '◐', pending: '·' }[c.state] || '?';
        console.log(`  ${icon} [${c.type.padEnd(10)}] ${c.id.slice(0, 12)}… ${c.name} (${c.state})`);
      }
      console.log('');
      break;
    }

    case 'health': {
      const h = await api('GET', '/health');
      print(h);
      break;
    }

    default:
      console.log(`COS CLI — Compartment OS

Commands:
  cos create --type <type> --name <name> [--url <url>] [--config '{}']
  cos start <id>
  cos stop <id>
  cos destroy <id>
  cos list
  cos status <id>
  cos snapshot <id>
  cos swap <fromId> <toId>
  cos cmd <id> <eventType> [--data '{}']
  cos map
  cos health

Compartment types: browser, cdp, node, python, shell, electron, html, composite

Examples:
  cos create --type browser --name "claude-agent" --url https://claude.ai
  cos create --type cdp     --name "scraper" --url https://example.com
  cos create --type node    --name "server" --config '{"cmd":"node","args":["server.js"]}'
  cos start <id>
  cos cmd <id> browser.navigate --data '{"url":"https://google.com"}'
  cos map
`);
  }
}

function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      flags[key] = args[i + 1] || true;
      i++;
    }
  }
  return flags;
}

run().catch(err => { console.error('COS CLI error:', err.message); process.exit(1); });
