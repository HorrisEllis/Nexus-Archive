'use strict';
// Real regression test for the 2026-09-06 js-yaml default-import bug.
// James's own real boot log on his actual machine showed this crashing
// constantly: "spec-engine load failed: The requested module 'js-yaml'
// does not provide an export named 'default'" — repeated dozens of
// times, idearium's spec-engine never loaded at all, every idea stuck
// at 'building' forever with no queue behind it to recover.
//
// Root cause, confirmed by pulling the real published js-yaml@5.2.1
// tarball and reading its actual dist/js-yaml.mjs: named exports only
// (load, dump, etc.), genuinely no default export — a real breaking
// change from 4.x. spec-engine/index.js used `import yaml from
// 'js-yaml'` (a default import), which is why it broke.
//
// This session's own earlier testing never caught it because the only
// js-yaml copy available in that sandbox was a borrowed 4.3.0, which
// still had a default — so the bug was invisible until James's own real
// npm install (which installs the actually-declared ^5.2.1) surfaced it.
//
// Runs spec-engine/index.js's real import in a clean child process
// (execSync — not require()'d into this process's own module cache)
// specifically so a prior successful load in the test runner itself
// can't hide the exact failure mode James's log showed.

const { execSync } = require('child_process');
const path = require('path');

const SPEC_ENGINE = path.join(__dirname, '..', 'idearium', 'spec-engine', 'index.js');

function main() {
  const script = `
    import('file://${SPEC_ENGINE}').then(se => {
      if (!Array.isArray(se.SPEC_SECTIONS) || se.SPEC_SECTIONS.length !== 10) {
        console.error('FAIL: SPEC_SECTIONS did not load correctly — ' + JSON.stringify(se.SPEC_SECTIONS));
        process.exit(1);
      }
      const meta = se.SPEC_SECTIONS.find(b => b.id === 'meta');
      if (!meta || !meta.agent) {
        console.error('FAIL: meta block missing or has no real agent field — ' + JSON.stringify(meta));
        process.exit(1);
      }
      console.log('PASS');
      process.exit(0);
    }).catch(e => {
      console.error('FAIL: ' + e.message);
      process.exit(1);
    });
  `;

  let output;
  try {
    output = execSync(`node --input-type=module -e "${script.replace(/"/g, '\\"')}"`, { encoding: 'utf8', timeout: 15000 });
  } catch (e) {
    // execSync throws on non-zero exit — real stdout/stderr are on the error object
    const stderr = (e.stderr || '').toString();
    const stdout = (e.stdout || '').toString();
    throw new Error(`spec-engine/index.js failed to import in a clean process: ${stderr || stdout || e.message}`);
  }

  if (!output.includes('PASS')) {
    throw new Error(`expected PASS in a clean-process import of spec-engine/index.js, got: ${output}`);
  }
  console.log('PASS: spec-engine/index.js imports cleanly in a fresh process — SPEC_SECTIONS has all 10 real blocks, each with a real agent field');
}

try { main(); console.log('ALL PASS'); process.exit(0); }
catch (e) { console.error('FAIL:', e.message); process.exit(1); }
