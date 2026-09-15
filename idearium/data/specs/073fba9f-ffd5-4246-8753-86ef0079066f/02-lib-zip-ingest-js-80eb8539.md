---
chunk_uuid: 80eb8539-49e9-4862-ae63-d625d0a1421f
spec_uuid: 073fba9f-ffd5-4246-8753-86ef0079066f
section: lib-zip-ingest-js
title: lib/zip-ingest.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:073fba9f:lib-zip-ingest-js
contract_id: spec-contract:073fba9f:lib-zip-ingest-js:80eb8539
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:05:08.384Z
---

'use strict';
/**
 * lib/zip-ingest.js — shared zip → bounded text-file extraction.
 *
 * §EXTRACTED 2026-09-15 — this exact logic (adm-zip, SKIP_DIRS/TEXT_EXT
 * filtering, maxFiles/maxBytesPerFile/maxTotalBytes bounds) previously
 * lived inline in idearium/api/index.js's `repo.import-archive` case —
 * the only caller, until lib/project-container.js needed the identical
 * behavior for the "Import Repository" step of the Upload Project
 * pipeline. Two inline copies of the same bounded-extraction logic is
 * exactly what DECOMP.md's law ("never inline what belongs in a
 * module") exists to prevent — this file is that module. The original
 * route is refactored to call it (see that diff), behavior unchanged —
 * same bounds, same omission reasons, same dedup-relevant shape.
 *
 * §DEPENDENCY — adm-zip is a real, already-declared dependency
 * (package.json), not newly added here. This is the one deliberate
 * exception to the zero-npm-dependency default elsewhere in lib/ —
 * reading arbitrary zip byte layouts (central directory, deflate) by
 * hand is a correctness risk not worth taking for an already-solved,
 * already-vetted problem; contrast with lib/intake.js's expandArchive(),
 * which shells out to the system `unzip` binary instead because it
 * only needs "put these files somewhere," not in-memory entry reads.
 */

const fs   = require('fs');
const path = require('path');

/**
 * extractZipToFiles({ buf, maxFiles, maxBytesPerFile, maxTotalBytes,
 *   skipDirs, textExt }) — buf is the raw zip bytes (a Buffer).
 * Returns { ok:true, included, omitted } or { ok:false, error }.
 *
 * included: [{ path, bytes, content, truncated }]
 * omitted:  [{ path, why }]
 */
function extractZipToFiles({
  buf,
  maxFiles,
  maxBytesPerFile,
  maxTotalBytes,
  skipDirs = ['node_modules', '.git', '.svn', 'dist', 'build', '__pycache__', '.next'],
  textExt  = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt', '.py', '.html', '.css', '.yml', '.yaml', '.spec', '.sh'],
} = {}) {
  if (!buf || !buf.length) return { ok: false, error: 'empty zip buffer' };

  const SKIP_DIRS = new Set(skipDirs);
  const TEXT_EXT  = new Set(textExt);

  let AdmZip;
  try { AdmZip = require('adm-zip'); }
  catch (e) { return { ok: false, error: `adm-zip unavailable: ${e.message}` }; }

  // §MATCHED, NOT SHARED — the original handler wrote a temp file to
  // disk before handing the path to AdmZip; adm-zip also accepts a
  // Buffer directly (`new AdmZip(buf)`), which is simpler and avoids
  // the tmp-file write/cleanup entirely. Confirmed against adm-zip's
  // own README before relying on it — this is a real, documented
  // constructor overload, not an assumption.
  let zip, entries;
  try {
    zip = new AdmZip(buf);
    entries = zip.getEntries().filter(e => !e.isDirectory);
  } catch (e) {
    return { ok: false, error: `could not read zip (adm-zip): ${e.message}` };
  }

  const included = [];
  const omitted  = [];
  let totalBytes = 0;

  for (const entry of entries) {
    const rel = entry.entryName;
    if (SKIP_DIRS.has(rel.split('/')[0]) || rel.split('/').some(seg => SKIP_DIRS.has(seg))) {
      omitted.push({ path: rel, why: 'skipped dir (node_modules/.git/etc.)' }); continue;
    }
    if (included.length >= maxFiles) { omitted.push({ path: rel, why: 'maxFiles reached' }); continue; }
    const ext = path.extname(rel).toLowerCase();
    if (!TEXT_EXT.has(ext)) { omitted.push({ path: rel, why: `binary/unlisted extension (${ext || 'none'})` }); continue; }
    if (totalBytes >= maxTotalBytes) { omitted.push({ path: rel, why: 'maxTotalBytes reached' }); continue; }

    let text;
    try { text = zip.readAsText(entry); }
    catch (e) { omitted.push({ path: rel, why: `read failed: ${e.message}` }); continue; }

    const truncated = text.length > maxBytesPerFile;
    const slice = truncated ? text.slice(0, maxBytesPerFile) : text;
    totalBytes += slice.length;
    included.push({ path: rel, bytes: entry.header.size, content: slice, truncated });
  }

  return { ok: true, included, omitted };
}

module.exports = { extractZipToFiles };