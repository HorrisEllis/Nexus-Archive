'use strict';
// Minimal ZIP writer for building test fixtures, including deliberately
// malformed/hostile ones. Not used in production — test tooling only.
const zlib = require('zlib');

function crc32(buf) {
  let c, crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xFF;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * entries: [{ name, content: Buffer|string, method: 0|8, isDir, externalAttrs,
 *             overrideUncompressedSize, overrideCompressedSize }]
 * Overrides let tests craft headers that lie about size (for hostile cases).
 */
function buildZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const e of entries) {
    const name = Buffer.from(e.name, 'utf8');
    const isDir = !!e.isDir;
    const rawContent = isDir ? Buffer.alloc(0) : Buffer.from(e.content || '', 'binary');
    const method = e.method === undefined ? (isDir ? 0 : 8) : e.method;
    const compressed = method === 8 ? zlib.deflateRawSync(rawContent) : rawContent;
    const crc = isDir ? 0 : crc32(rawContent);

    const uncompressedSize = e.overrideUncompressedSize !== undefined ? e.overrideUncompressedSize : rawContent.length;
    const compressedSize   = e.overrideCompressedSize   !== undefined ? e.overrideCompressedSize   : compressed.length;

    const localHeaderOffset = offset;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressedSize, 18);
    local.writeUInt32LE(uncompressedSize, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);

    localParts.push(local, name, compressed);
    offset += local.length + name.length + compressed.length;

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4); // version made by: unix (needed for external attrs mode bits)
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressedSize, 20);
    central.writeUInt32LE(uncompressedSize, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(e.externalAttrs || 0, 38);
    central.writeUInt32LE(localHeaderOffset, 42);

    centralParts.push(central, name);
  }

  const centralDir = Buffer.concat(centralParts);
  const cdOffset = offset;

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDir, eocd]);
}

// unix symlink mode bits: S_IFLNK (0xA000) | perms, shifted into high 16 bits
const SYMLINK_ATTR = (0xA1FF << 16) >>> 0;

module.exports = { buildZip, SYMLINK_ATTR, crc32 };
