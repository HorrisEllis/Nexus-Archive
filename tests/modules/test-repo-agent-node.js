'use strict';
/**
 * tests/modules/test-repo-agent-node.js
 * UUID: nexus-test-repo-agent-node-v1-0000-2026-0920-jamesbrooks-001
 *
 * §BUILT 2026-09-20 — covers lib/repo-agent-node.js: the compartment agent
 * materialised as portable node files and restored on the far side.
 *
 * The real claim is a ROUND TRIP — export from one repo, import into a
 * genuinely different one, and confirm the learned model arrived while the
 * identity did not. Both halves matter: an import that carried the source
 * uuid would be a false claim of continuity, and an import that dropped the
 * observations would be portability in name only.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const RAN = require(path.join(ROOT, 'lib', 'repo-agent-node.js'));
const RH  = require(path.join(ROOT, 'lib', 'repo-hat.js'));
const MEM = require(path.join(ROOT, 'lib', 'repo-hat-memory.js'));
const NX  = require(path.join(ROOT, 'lib', 'node-export.js'));

let pass = 0, fail = 0;
function check(name, cond, detail = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`); }
}

const STAMP = Date.now();
const SRC = { uuid: `ran-src-${STAMP}`, name: 'source project', compartmentId: 'cos.test.src' };
const DST = { uuid: `ran-dst-${STAMP}`, name: 'target project', compartmentId: 'cos.test.dst' };
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-agent-node-'));

function run() {
  console.log('\ntest-repo-agent-node\n');
  try {
    // ── Type registration ────────────────────────────────────────────────────
    check('repo_agent is a registered node type', NX.KNOWN_TYPES.includes('repo_agent'));
    check('repo_agent did NOT displace the existing agent type — both exist',
      NX.KNOWN_TYPES.includes('agent') && NX.KNOWN_TYPES.includes('repo_agent'));
    check('the repo_agent schema was authored',
      fs.existsSync(path.join(ROOT, 'lib', 'node-schemas', 'schema.repo_agent')));

    // ── Refuses to serialise nothing ─────────────────────────────────────────
    const none = RAN.materialise({ repo: SRC, repoDir: null, destDir: DIR });
    check('a repo with no hat cannot be materialised', none.ok === false);
    check('the refusal says why', /no hat forged/.test((none.errors || []).join(' ')));

    // ── Build a real source agent ────────────────────────────────────────────
    const forged = RH.ensureRepoHat({ repo: SRC, repoDir: null });
    check('source hat forged', forged.ok === true, JSON.stringify(forged.errors));

    RH.learn({ repo: SRC, repoDir: null, kind: 'correction', text: 'the poller lives in api/index.js', source: 'james', evidence: 'api/index.js:3298' });
    RH.learn({ repo: SRC, repoDir: null, kind: 'convention', text: 'routes are declared in a table, not app.get()' });
    RH.learn({ repo: SRC, repoDir: null, kind: 'convention', text: 'routes are declared in a table, not app.get()' }); // occurrences -> 2
    check('source has 2 distinct observations, one seen twice',
      MEM.list(SRC.uuid).length === 2 && MEM.list(SRC.uuid).some(o => o.occurrences === 2));

    // ── Export ───────────────────────────────────────────────────────────────
    const out = RAN.materialise({ repo: SRC, repoDir: null, destDir: DIR });
    check('materialise succeeds', out.ok === true, JSON.stringify(out.errors));
    check('a real .hat file is written', !!out.hatFile && fs.existsSync(out.hatFile));
    check('a real .repo_agent file is written', !!out.agentFile && fs.existsSync(out.agentFile));
    check('the .repo_agent file carries the repo_agent extension', /\.repo_agent$/.test(out.agentFile));
    check('export reports what it carried', out.observations === 2);

    const env = NX.importFromFile(out.agentFile);
    check('the export is a valid node envelope of the right type', env.type === 'repo_agent');
    check('the bundle declares its own schema version', env.payload.schema === 'nexus.repo_agent/1');
    check('the hat DEFINITION travels', !!env.payload.hat.baseAgent && typeof env.payload.hat.personaPrompt === 'string');
    check('the hat uuid travels as provenance only, under _originUuid',
      !!env.payload.hat._originUuid && env.payload.hat.uuid === undefined);
    check('every observation travels', (env.payload.observations || []).length === 2);
    check('dedupKey travels so an import can merge rather than duplicate',
      env.payload.observations.every(o => typeof o.dedupKey === 'string' && o.dedupKey.length));
    check('the index the persona was grounded against travels', !!env.payload.indexAtExport);

    // ── Import into a genuinely different repo ───────────────────────────────
    const imp = RAN.importAgent(out.agentFile, { repo: DST, repoDir: null });
    check('import succeeds into a different repo', imp.ok === true, JSON.stringify(imp.errors));
    check('a hat was forged for the TARGET, not reused from the source', imp.hatReused === false);
    check('both observations were restored', imp.restored === 2 && imp.merged === 0);

    const dstHat = RH.getRepoHat(DST.uuid);
    const srcHat = RH.getRepoHat(SRC.uuid);
    check('the target agent exists', !!dstHat);
    check('the target hat has its OWN uuid — no false claim of continuity',
      dstHat.uuid !== srcHat.uuid && dstHat.uuid !== env.payload.hat._originUuid);
    check('the target hat carries the target repo\'s own role, not the source\'s',
      dstHat.seedKey === RH.seedKeyFor(DST.uuid));

    // The whole point: the learned model arrived and is live in the persona.
    check('the learned model arrived', MEM.list(DST.uuid).length === 2);
    check('the imported learning is LIVE in the target persona',
      (dstHat.personaPrompt || '').includes('the poller lives in api/index.js'));
    check('the persona was re-grounded against the target, not the exported string',
      imp.personaRegrounded === true && (dstHat.personaPrompt || '').includes(DST.compartmentId));
    check('the target persona does not claim the source compartment',
      !(dstHat.personaPrompt || '').includes(SRC.compartmentId));

    // ── Idempotence ──────────────────────────────────────────────────────────
    const twice = RAN.importAgent(out.agentFile, { repo: DST, repoDir: null });
    check('a second import reuses the existing hat', twice.hatReused === true);
    check('a second import MERGES rather than duplicating', twice.merged === 2 && twice.restored === 0);
    check('memory did not double', MEM.list(DST.uuid).length === 2);

    // ── Guards ───────────────────────────────────────────────────────────────
    check('import refuses a missing file', RAN.importAgent(path.join(DIR, 'nope.repo_agent'), { repo: DST }).ok === false);
    check('import refuses a node file of the wrong type',
      RAN.importAgent(out.hatFile, { repo: DST }).ok === false);
    check('import refuses without a target repo', RAN.importAgent(out.agentFile, {}).ok === false);

  } finally {
    for (const r of [SRC, DST]) { try { RH.revokeRepoHat(r.uuid); } catch (_) {} MEM.clear(r.uuid); }
    fs.rmSync(DIR, { recursive: true, force: true });
    check('no hats left behind', !RH.getRepoHat(SRC.uuid) && !RH.getRepoHat(DST.uuid));
    check('no observations left behind', MEM.list(SRC.uuid).length === 0 && MEM.list(DST.uuid).length === 0);
  }

  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  process.exitCode = fail === 0 ? 0 : 1;
}

setTimeout(run, 2500);
