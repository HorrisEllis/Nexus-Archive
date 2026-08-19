'use strict';
/**
 * clear-glass/src/providers/download-capture.js — a file downloaded from a
 * provider tab is announced to Guardian, with the chat it came from attached.
 * comp_id: clear-glass.providers.download-capture
 * UUID: cg-download-capture-v1-0000-2026-0818-001
 * Version: 1.0.0
 *
 * WHY (James, 2026-08-18): "guardian to listen for the downloads from your
 * chat and move them to the compartment with the contract or repo/spec."
 *
 * §WHY HERE AND NOT A FOLDER WATCHER
 * A watcher on Downloads sees bytes and a filename. This sees the download
 * ITEM: the URL it came from, the tab that requested it, the provider that
 * served it, and the moment it finished. That provenance is the difference
 * between "a file called hat-forge.js appeared" and "claude, in this chat,
 * at this time, produced this file" — and provenance is the whole reason to
 * capture at all, since the drop is a CLAIM whose author matters.
 *
 * §1.1 — this rebuilds nothing. providers/host.js:141 already holds each
 * provider's own `session.fromPartition('persist:ncp-<id>')`. `will-download`
 * was hooked nowhere in the tree (checked, not assumed), so the capture point
 * existed and was simply unused. This is the wire, not a new mechanism.
 *
 * §NOTHING IS APPLIED HERE. This announces. Guardian stages. A gate decides.
 * A user promotes. See lib/intake.js for why arrival must not equal
 * acceptance.
 */

const path = require('path');
const http = require('http');

const GUARDIAN_HOST = process.env.GUARDIAN_HOST || '127.0.0.1';
const GUARDIAN_PORT = parseInt(process.env.GUARDIAN_HTTP_PORT || '7820', 10);
const VERSION = '1.0.0';

function _announce(payload, log) {
  const body = Buffer.from(JSON.stringify(payload));
  const req = http.request({
    host: GUARDIAN_HOST, port: GUARDIAN_PORT, path: '/api/intake', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
    timeout: 5000,
  }, res => {
    let out = '';
    res.on('data', d => (out += d));
    res.on('end', () => {
      // §1.2 — a failed announce is stated. A download that guardian never
      // heard about is a file sitting in Downloads that nobody is tracking,
      // and silence there looks exactly like success.
      if (res.statusCode >= 400) log(`[download-capture] guardian refused (${res.statusCode}): ${out.slice(0, 200)}`);
      else {
        let parsed = null; try { parsed = JSON.parse(out); } catch (_) {}
        log(`[download-capture] staged ${payload.filename} → drop ${parsed && parsed.dropId ? parsed.dropId : '(no id returned)'}`);
      }
    });
  });
  req.on('error', e => log(`[download-capture] guardian unreachable on :${GUARDIAN_PORT} — ${e.message}. File is on disk at ${payload.savePath}, untracked.`));
  req.on('timeout', () => { req.destroy(); log('[download-capture] guardian timed out — download is on disk, untracked'); });
  req.write(body);
  req.end();
}

/**
 * attach({ session, providerId, log }) — watch one provider session.
 *
 * @param {Electron.Session} session  the provider's own partition session
 * @param {string} providerId         'claude' | 'chatgpt' | 'gemini' | 'perplexity'
 * @param {function} [log]
 * @returns {{detach:function}}
 */
function attach({ session, providerId, log = console.log } = {}) {
  if (!session || typeof session.on !== 'function') throw new Error('download-capture.attach needs a real Electron session');
  if (!providerId) throw new Error('download-capture.attach needs a providerId — a drop with no author is not provenance');

  const handler = (event, item, webContents) => {
    const filename = item.getFilename();
    // The page the download was requested FROM — this is the chat URL, and it
    // is the field that makes a drop traceable back to the exchange that
    // produced it. Captured before the item completes, since webContents can
    // navigate away while a large file is still downloading.
    let chatUrl = null;
    try { chatUrl = webContents && typeof webContents.getURL === 'function' ? webContents.getURL() : null; } catch (_) {}
    const startedAt = Date.now();

    item.once('done', (_e, state) => {
      if (state !== 'completed') {
        log(`[download-capture] ${providerId}: "${filename}" ended as ${state} — not announced`);
        return;
      }
      const savePath = item.getSavePath();
      _announce({
        source:   savePath,
        provider: providerId,
        chatUrl,
        filename,
        url:          item.getURL(),
        mimeType:     item.getMimeType(),
        bytes:        item.getTotalBytes(),
        startedAt,
        downloadedAt: Date.now(),
        capturedBy:   `clear-glass.download-capture@${VERSION}`,
      }, log);
    });
  };

  session.on('will-download', handler);
  log(`[download-capture] armed for ${providerId} → guardian :${GUARDIAN_PORT}/api/intake`);
  return { detach() { try { session.removeListener('will-download', handler); } catch (_) {} } };
}

module.exports = { attach, VERSION, MODULE_ID: 'clear-glass.providers.download-capture' };
