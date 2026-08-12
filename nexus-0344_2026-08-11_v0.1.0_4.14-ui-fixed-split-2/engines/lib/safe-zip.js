'use strict';
/**
 * engines/lib/safe-zip.js — hostile-input-safe ZIP archive parser
 * ─────────────────────────────────────────────────────────────────────────────
 * §3.4 raw execution before interfaces: this is step one, pure code, no HTTP,
 * no filesystem writes, no knowledge of sites/vhosts. It takes bytes and
 * budgets and returns a verdict + decompressed entries in memory.
 *
 * §5.5 (what does not exist must be built — no runtime deps): zero-dependency
 * ZIP parser using only Node's builtin zlib for DEFLATE. Supports store (0)
 * and deflate (8) — the two methods every real-world zip tool produces. Any
 * other method is rejected, not guessed at.
 *
 * This module REJECTS on suspicion. It does not sanitize-and-continue for:
 *   - entries whose normalized path escapes the extraction root (zip slip)
 *   - symlink entries (unix mode bits in the external attributes field)
 *   - entry count over budget
 *   - any single entry's declared or actual uncompressed size over budget
 *   - total uncompressed size over budget
 *   - single-entry compression ratio over a hard ceiling (catches ratio
 *     bombs that a size budget alone won't, e.g. a 1KB file "declaring"
 *     10MB uncompressed but actually inflating to gigabytes)
 *   - malformed/truncated archives, bad EOCD, bad central directory
 *
 * Exported: inspectZip(buffer, budgets) -> { ok, entries[], warnings[], error }
 *   entries: [{ name, isDir, size, data (Buffer) }]  — already decompressed,
 *   in memory, ready for a caller to write to a staging dir. This module
 *   never touches disk itself.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const zlib = require('zlib');

const DEFAULT_BUDGETS = {
  maxEntries:       20000,
  maxTotalBytes:    2 * 1024 * 1024 * 1024,   // 2 GB decompressed, total
  maxEntryBytes:    512 * 1024 * 1024,        // 512 MB decompressed, per file
  maxRatio:         300,                      // decompressed:compressed ceiling per entry
  maxPathLength:    4096,
};

const EOCD_SIG = 0x06054b50;
const CEN_SIG  = 0x02014b50;
const LOC_SIG  = 0x04034b50;

function err(code, message, extra) {
  return { ok: false, error: { code, message, ...extra } };
}

// ─── locate End Of Central Directory (search from the tail — comment is variable length) ───
function findEOCD(buf) {
  const minLen = 22;
  if (buf.length < minLen) return -1;
  const maxCommentLen = 65535;
  const searchStart = Math.max(0, buf.length - minLen - maxCommentLen);
  for (let i = buf.length - minLen; i >= searchStart; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) return i;
  }
  return -1;
}

// ─── parse central directory into a flat entry list ─────────────────────────
function parseCentralDirectory(buf, eocdOffset) {
  const totalEntries = buf.readUInt16LE(eocdOffset + 10);
  const cdSize       = buf.readUInt32LE(eocdOffset + 12);
  const cdOffset     = buf.readUInt32LE(eocdOffset + 16);

  if (cdOffset + cdSize > eocdOffset || cdOffset < 0) {
    throw new Error('central directory offsets inconsistent with EOCD — likely corrupt or crafted');
  }

  const entries = [];
  let p = cdOffset;
  const cdEnd = cdOffset + cdSize;

  while (p < cdEnd) {
    if (p + 46 > buf.length) throw new Error('central directory entry truncated');
    if (buf.readUInt32LE(p) !== CEN_SIG) throw new Error('bad central directory signature — corrupt or crafted zip');

    const method          = buf.readUInt16LE(p + 10);
    const compressedSize  = buf.readUInt32LE(p + 20);
    const uncompressedSize= buf.readUInt32LE(p + 24);
    const nameLen         = buf.readUInt16LE(p + 28);
    const extraLen        = buf.readUInt16LE(p + 30);
    const commentLen      = buf.readUInt16LE(p + 32);
    const externalAttrs   = buf.readUInt32LE(p + 38);
    const localHeaderOff  = buf.readUInt32LE(p + 42);

    const nameStart = p + 46;
    if (nameStart + nameLen > buf.length) throw new Error('central directory filename field truncated');
    const name = buf.slice(nameStart, nameStart + nameLen).toString('utf8');

    entries.push({
      name, method, compressedSize, uncompressedSize,
      externalAttrs, localHeaderOff,
    });

    p = nameStart + nameLen + extraLen + commentLen;
  }

  if (entries.length !== totalEntries) {
    throw new Error(`central directory entry count mismatch (header said ${totalEntries}, parsed ${entries.length})`);
  }
  return entries;
}

// ─── read the local file header to find the real data offset ────────────────
// (central directory offsets can lie; we still trust the local header's own
//  declared sizes only for locating data — decompression is verified against
//  the actual inflate output length, never trusted from headers alone.)
function localDataOffset(buf, localHeaderOff) {
  if (localHeaderOff + 30 > buf.length) throw new Error('local file header truncated');
  if (buf.readUInt32LE(localHeaderOff) !== LOC_SIG) throw new Error('bad local file header signature');
  const nameLen  = buf.readUInt16LE(localHeaderOff + 26);
  const extraLen = buf.readUInt16LE(localHeaderOff + 28);
  return localHeaderOff + 30 + nameLen + extraLen;
}

// ─── path safety: reject, never sanitize-and-continue ────────────────────────
function isSafeEntryPath(name, maxLen) {
  if (!name || name.length === 0) return false;
  if (name.length > maxLen) return false;
  if (name.includes('\0')) return false;                 // embedded null
  if (/^([a-zA-Z]:)?[\\/]/.test(name)) return false;      // absolute path (unix or windows drive)
  const norm = name.replace(/\\/g, '/');
  const parts = norm.split('/');
  let depth = 0;
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') { depth--; if (depth < 0) return false; continue; }
    depth++;
  }
  return true;
}

function isSymlinkEntry(externalAttrs) {
  // Unix mode bits live in the high 16 bits of external attrs when the
  // "version made by" host is unix. S_IFLNK = 0xA000.
  const unixMode = (externalAttrs >>> 16) & 0xFFFF;
  return (unixMode & 0xF000) === 0xA000;
}

/**
 * inspectZip(buffer, budgets?) -> { ok, entries, warnings, error }
 * Pure, synchronous, no I/O. Caller decides what to do with entries.
 */
function inspectZip(buf, budgetsIn) {
  const budgets = { ...DEFAULT_BUDGETS, ...(budgetsIn || {}) };

  if (!Buffer.isBuffer(buf)) return err('ARCHIVE_INVALID', 'input is not a buffer');
  if (buf.length < 22) return err('ARCHIVE_INVALID', 'file too small to be a zip');
  if (buf.readUInt32LE(0) !== LOC_SIG && buf.length > 4) {
    // Not fatal by itself (empty zips have only EOCD), but a completely
    // unrelated file type will fail the EOCD search below anyway.
  }

  const eocdOffset = findEOCD(buf);
  if (eocdOffset === -1) return err('ARCHIVE_INVALID', 'no End Of Central Directory record found — not a valid zip');

  let rawEntries;
  try {
    rawEntries = parseCentralDirectory(buf, eocdOffset);
  } catch (e) {
    return err('ARCHIVE_INVALID', 'central directory parse failed: ' + e.message);
  }

  if (rawEntries.length > budgets.maxEntries) {
    return err('BUDGET_EXCEEDED', `entry count ${rawEntries.length} exceeds max ${budgets.maxEntries}`);
  }

  const entries = [];
  const warnings = [];
  let totalUncompressed = 0;

  for (const re of rawEntries) {
    const isDir = re.name.endsWith('/') || (re.uncompressedSize === 0 && re.method === 0 && re.name.endsWith('/'));

    if (!isSafeEntryPath(re.name, budgets.maxPathLength)) {
      return err('PATH_ESCAPE', `entry resolves outside extraction root: "${re.name}"`);
    }

    if (isSymlinkEntry(re.externalAttrs)) {
      return err('PATH_ESCAPE', `symlink entries are not permitted: "${re.name}"`);
    }

    if (re.name.endsWith('/')) {
      entries.push({ name: re.name, isDir: true, size: 0, data: null });
      continue;
    }

    // declared-size budget check BEFORE we spend CPU decompressing
    if (re.uncompressedSize > budgets.maxEntryBytes) {
      return err('BUDGET_EXCEEDED', `entry "${re.name}" declares ${re.uncompressedSize} bytes uncompressed, exceeds per-file max ${budgets.maxEntryBytes}`);
    }
    totalUncompressed += re.uncompressedSize;
    if (totalUncompressed > budgets.maxTotalBytes) {
      return err('BUDGET_EXCEEDED', `cumulative declared uncompressed size exceeds max ${budgets.maxTotalBytes}`);
    }
    if (re.compressedSize > 0) {
      const declaredRatio = re.uncompressedSize / re.compressedSize;
      if (declaredRatio > budgets.maxRatio) {
        return err('BUDGET_EXCEEDED', `entry "${re.name}" declares a ${declaredRatio.toFixed(0)}:1 compression ratio, exceeds ceiling ${budgets.maxRatio}:1 — refusing as a probable decompression bomb`);
      }
    }

    let dataOffset;
    try {
      dataOffset = localDataOffset(buf, re.localHeaderOff);
    } catch (e) {
      return err('ARCHIVE_INVALID', `local header for "${re.name}" invalid: ${e.message}`);
    }
    const compressedSlice = buf.slice(dataOffset, dataOffset + re.compressedSize);
    if (compressedSlice.length !== re.compressedSize) {
      return err('ARCHIVE_INVALID', `entry "${re.name}" data truncated in archive`);
    }

    let data;
    if (re.method === 0) {
      data = compressedSlice; // stored, no compression
    } else if (re.method === 8) {
      try {
        // maxOutputLength enforces the real decompressed-size ceiling — this
        // is the actual bomb defense, not just the declared-size check above,
        // because declared sizes in a crafted zip cannot be trusted.
        data = zlib.inflateRawSync(compressedSlice, { maxOutputLength: budgets.maxEntryBytes });
      } catch (e) {
        return err('ARCHIVE_INVALID', `entry "${re.name}" failed to inflate: ${e.message}`);
      }
    } else {
      return err('ARCHIVE_INVALID', `entry "${re.name}" uses unsupported compression method ${re.method} (only store/deflate allowed)`);
    }

    if (data.length !== re.uncompressedSize) {
      // Header lied about the size — treat as hostile, not a warning.
      return err('ARCHIVE_INVALID', `entry "${re.name}" actual decompressed size (${data.length}) does not match header (${re.uncompressedSize})`);
    }

    entries.push({ name: re.name, isDir: false, size: data.length, data });
  }

  return { ok: true, entries, warnings, error: null };
}

module.exports = { inspectZip, isSafeEntryPath, isSymlinkEntry, DEFAULT_BUDGETS };
