'use strict';
/**
 * engines/lib/dns-zones.js — multi-zone authoritative DNS data model
 * ─────────────────────────────────────────────────────────────────────────────
 * §3.4 raw logic before interfaces. The original dns.js was single-zone: one
 * `origin`, one flat `records` array, full stop — it could serve exactly one
 * domain. "DNS manager for domains" (plural) requires actually hosting
 * multiple independent zones, each with its own SOA/NS/records, looked up by
 * longest-suffix match against the query name. That's what this module is.
 *
 * State shape (lives in dns.conf as `zones`):
 *   {
 *     "example.com": { ttl: 300, ns1: "ns1", ns2: "ns2", records: [...] },
 *     "other.net":   { ttl: 300, ns1: "ns1", ns2: "ns2", records: [...] }
 *   }
 * Zone keys are bare domains, no trailing dot, lowercase — normalized on the
 * way in so callers never have to think about it.
 *
 * Every function here is pure with respect to the `zones` object passed in —
 * no module-level state, no I/O. dns.js (the wire-protocol shell) owns the
 * actual `cfg` and calls these functions against it.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DNS_TYPES = { A: 1, NS: 2, CNAME: 5, SOA: 6, MX: 15, TXT: 16, AAAA: 28, SRV: 33, CAA: 257 };
const DNS_TYPES_INV = Object.fromEntries(Object.entries(DNS_TYPES).map(([k, v]) => [v, k]));
const VALID_TYPES = new Set(Object.keys(DNS_TYPES));

function normDomain(d) {
  return String(d || '').replace(/\.$/, '').toLowerCase().trim();
}

/**
 * One-time migration from the old single-zone shape ({origin, records} at
 * the top level of cfg) into the new `zones` map. Idempotent — a no-op if
 * `zones` already exists or there's nothing to migrate. Never drops data
 * (§0.3): the old records become the primary zone's records verbatim.
 * Returns { zones, primaryDomain, migrated: bool } — caller decides whether
 * to persist.
 */
function migrateLegacyConfig(cfg) {
  if (cfg.zones && Object.keys(cfg.zones).length > 0) {
    return { zones: cfg.zones, primaryDomain: cfg.primaryDomain || normDomain(cfg.origin), migrated: false };
  }
  const origin = normDomain(cfg.origin || 'localhost');
  const zones = {
    [origin]: {
      ttl: cfg.ttl || 300,
      ns1: cfg.ns1 || 'ns1',
      ns2: cfg.ns2 || 'ns2',
      records: Array.isArray(cfg.records) ? cfg.records : [],
    },
  };
  return { zones, primaryDomain: origin, migrated: true };
}

/** Find which configured zone a query name belongs to — longest match wins,
 * so a query for "foo.sub.example.com" prefers a zone for "sub.example.com"
 * over one for "example.com" if both exist. */
function findZone(zones, qname) {
  const q = normDomain(qname);
  let best = null, bestLen = -1;
  for (const origin of Object.keys(zones)) {
    if (q === origin || q.endsWith('.' + origin)) {
      if (origin.length > bestLen) { best = origin; bestLen = origin.length; }
    }
  }
  return best;
}

function fqdn(name, zoneOrigin) {
  if (name === '@' || name === '') return zoneOrigin;
  if (String(name).endsWith('.')) return normDomain(name);
  return `${name}.${zoneOrigin}`.toLowerCase();
}

function getSyntheticRecords(zones, qname, qtype) {
  const zoneOrigin = findZone(zones, qname);
  if (!zoneOrigin || normDomain(qname) !== zoneOrigin) return [];
  const zone = zones[zoneOrigin];
  const ns1fqdn = `${zone.ns1 || 'ns1'}.${zoneOrigin}`;
  const ns2fqdn = `${zone.ns2 || 'ns2'}.${zoneOrigin}`;
  const synth = [];
  if (qtype === DNS_TYPES.NS || qtype === 255) {
    synth.push({ name: '@', type: 'NS', value: ns1fqdn + '.', ttl: 3600 });
    synth.push({ name: '@', type: 'NS', value: ns2fqdn + '.', ttl: 3600 });
  }
  if (qtype === DNS_TYPES.SOA || qtype === 255) {
    const serial = Math.floor(Date.now() / 1000);
    synth.push({
      name: '@', type: 'SOA', ttl: 3600,
      value: `${ns1fqdn}. hostmaster.${zoneOrigin}. ${serial} 3600 900 604800 300`,
    });
  }
  return synth;
}

/** Full recursive lookup (follows CNAME chains), scoped to whichever zone
 * the qname falls in. Returns [] if qname doesn't match any configured
 * zone at all (not even a synthetic NXDOMAIN — caller decides that).
 * Falls back to a `*` wildcard record when nothing else in the zone
 * matches the exact name — standard DNS wildcard semantics, previously
 * never implemented despite the UI advertising a "Wildcard" quick template
 * that wrote a `*` record nothing ever actually matched against. */
function lookupRecords(zones, qname, qtype, _depth = 0) {
  if (_depth > 8) return []; // CNAME loop guard
  const zoneOrigin = findZone(zones, qname);
  if (!zoneOrigin) return [];
  const zone = zones[zoneOrigin];
  const qnameNorm = normDomain(qname);
  const results = [];
  let exactNameMatched = false;

  for (const r of zone.records) {
    if (r.name === '*') continue; // handled in the wildcard fallback pass below
    const rName = fqdn(r.name, zoneOrigin);
    if (rName !== qnameNorm) continue;
    exactNameMatched = true;
    if (qtype === 255 || r.type === DNS_TYPES_INV[qtype] || r.type === qtype) {
      results.push(r);
    }
    if (r.type === 'CNAME' && qtype !== DNS_TYPES.CNAME) {
      const target = fqdn(r.value.replace(/\.$/, ''), zoneOrigin);
      results.push(...lookupRecords(zones, target, qtype, _depth + 1));
    }
  }

  if (!exactNameMatched && qnameNorm !== zoneOrigin) {
    for (const r of zone.records) {
      if (r.name !== '*') continue;
      if (qtype === 255 || r.type === DNS_TYPES_INV[qtype] || r.type === qtype) {
        results.push(r);
      }
      if (r.type === 'CNAME' && qtype !== DNS_TYPES.CNAME) {
        const target = fqdn(r.value.replace(/\.$/, ''), zoneOrigin);
        results.push(...lookupRecords(zones, target, qtype, _depth + 1));
      }
    }
  }

  results.push(...getSyntheticRecords(zones, qname, qtype));
  return results;
}

// ─── zone/record CRUD — all return a new verdict, caller persists ───────────

function createZone(zones, domain, opts = {}) {
  const origin = normDomain(domain);
  if (!origin) return { ok: false, error: 'domain required' };
  if (zones[origin]) return { ok: false, error: `zone "${origin}" already exists` };
  const newZones = { ...zones };
  newZones[origin] = {
    ttl: opts.ttl || 300,
    ns1: opts.ns1 || 'ns1',
    ns2: opts.ns2 || 'ns2',
    records: opts.records || [],
  };
  return { ok: true, zones: newZones };
}

function removeZone(zones, domain, primaryDomain) {
  const origin = normDomain(domain);
  if (!zones[origin]) return { ok: false, error: `zone "${origin}" does not exist` };
  if (origin === normDomain(primaryDomain)) {
    return { ok: false, error: 'cannot remove the primary platform domain — change primaryDomain first if this is intentional' };
  }
  const newZones = { ...zones };
  delete newZones[origin];
  return { ok: true, zones: newZones };
}

function listZones(zones) {
  return Object.entries(zones).map(([domain, z]) => ({
    domain, recordCount: z.records.length, ttl: z.ttl, ns1: z.ns1, ns2: z.ns2,
  }));
}

function upsertRecord(zones, domain, rec) {
  const origin = normDomain(domain);
  if (!zones[origin]) return { ok: false, error: `zone "${origin}" does not exist — create it first` };
  if (!rec.name || !rec.type || !rec.value) return { ok: false, error: 'name, type, and value are required' };
  if (!VALID_TYPES.has(rec.type)) return { ok: false, error: `unsupported record type "${rec.type}" — must be one of ${[...VALID_TYPES].join(', ')}` };
  const newZones = { ...zones, [origin]: { ...zones[origin] } };
  newZones[origin].records = zones[origin].records
    .filter(r => !(r.name === rec.name && r.type === rec.type))
    .concat([{ name: rec.name, type: rec.type, value: rec.value, ...(rec.ttl ? { ttl: rec.ttl } : {}) }]);
  return { ok: true, zones: newZones };
}

function deleteRecord(zones, domain, name, type) {
  const origin = normDomain(domain);
  if (!zones[origin]) return { ok: false, error: `zone "${origin}" does not exist` };
  const before = zones[origin].records.length;
  const newZones = { ...zones, [origin]: { ...zones[origin] } };
  newZones[origin].records = zones[origin].records.filter(r => !(r.name === name && r.type === type));
  const removed = before - newZones[origin].records.length;
  return { ok: true, zones: newZones, removed };
}

module.exports = {
  DNS_TYPES, DNS_TYPES_INV, VALID_TYPES,
  normDomain, findZone, fqdn, getSyntheticRecords, lookupRecords,
  migrateLegacyConfig, createZone, removeZone, listZones, upsertRecord, deleteRecord,
};
