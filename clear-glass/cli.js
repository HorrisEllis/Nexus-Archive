#!/usr/bin/env node
'use strict';
/**
 * clear-glass/cli.js — Clear Glass CLI
 * UUID: cg-cli-v1-0000-2026-0702-jamesbrooks-001
 *
 * Sovereign CLI for Clear Glass — launch, status, health, config.
 * Does NOT start Electron; that's autopilot's job.
 * This is the human-facing control surface for the Clear Glass service.
 *
 * Usage:
 *   node clear-glass/cli.js status        — check wire server health
 *   node clear-glass/cli.js config        — show current config
 *   node clear-glass/cli.js agents        — list connected agents
 */

const http    = require('http');
const path    = require('path');

const WIRE_PORT = parseInt(process.env.WIRE_PORT || '7704');
const cmd       = process.argv[2] || 'status';

function get(path_) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${WIRE_PORT}${path_}`, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(_) { resolve({ raw: d }); } });
    }).on('error', reject);
  });
}

async function run() {
  if (cmd === 'status' || cmd === 'health') {
    try {
      const r = await get('/health');
      console.log('[Clear Glass] wire server:', r.ok ? 'ONLINE' : 'ERROR', `port=${r.port || WIRE_PORT}`);
      process.exit(r.ok ? 0 : 1);
    } catch(_) {
      console.log('[Clear Glass] wire server: OFFLINE (not running or port', WIRE_PORT, ')');
      process.exit(1);
    }
  } else if (cmd === 'contract') {
    const r = await get('/contract');
    console.log(JSON.stringify(r, null, 2));
  } else if (cmd === 'config') {
    console.log({
      wirePort:  WIRE_PORT,
      guardianDir: process.env.GUARDIAN_DIR || '(not set)',
      ssePort:   process.env.SSE_PORT || '7702',
      ipcPort:   process.env.IPC_PORT || '7703',
    });
  } else {
    console.log('Usage: node clear-glass/cli.js [status|health|contract|config]');
    process.exit(1);
  }
}

run().catch(e => { console.error(e.message); process.exit(1); });
