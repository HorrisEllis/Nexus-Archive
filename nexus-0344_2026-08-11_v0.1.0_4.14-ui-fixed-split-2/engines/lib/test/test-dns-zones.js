'use strict';
const assert = require('assert');
const dz = require('../dns-zones');

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log(`  ok  — ${name}`); }
  catch (e) { fail++; console.log(`FAIL  — ${name}\n        ${e.stack}`); }
}

console.log('dns-zones.js — multi-zone tests\n');

test('migration: old single-zone config becomes a one-entry zones map, no data lost', () => {
  const cfg = { origin: 'example.com.', ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: '@', type: 'A', value: '1.2.3.4' }] };
  const { zones, primaryDomain, migrated } = dz.migrateLegacyConfig(cfg);
  assert.strictEqual(migrated, true);
  assert.strictEqual(primaryDomain, 'example.com');
  assert.strictEqual(zones['example.com'].records.length, 1);
  assert.strictEqual(zones['example.com'].records[0].value, '1.2.3.4');
});

test('migration is idempotent — already-migrated config is untouched', () => {
  const cfg = { zones: { 'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [] } }, primaryDomain: 'a.com' };
  const { migrated } = dz.migrateLegacyConfig(cfg);
  assert.strictEqual(migrated, false);
});

test('two zones stay completely isolated — same record name resolves differently per zone', () => {
  const zones = {
    'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: '@', type: 'A', value: '1.1.1.1' }] },
    'b.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: '@', type: 'A', value: '2.2.2.2' }] },
  };
  const a = dz.lookupRecords(zones, 'a.com', dz.DNS_TYPES.A);
  const b = dz.lookupRecords(zones, 'b.com', dz.DNS_TYPES.A);
  assert.strictEqual(a.find(r => r.type === 'A').value, '1.1.1.1');
  assert.strictEqual(b.find(r => r.type === 'A').value, '2.2.2.2');
});

test('longest-suffix match: a query for a subdomain zone prefers the more specific zone', () => {
  const zones = {
    'example.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: 'foo', type: 'A', value: '9.9.9.9' }] },
    'sub.example.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: 'foo', type: 'A', value: '8.8.8.8' }] },
  };
  const r = dz.lookupRecords(zones, 'foo.sub.example.com', dz.DNS_TYPES.A);
  assert.strictEqual(r.find(x => x.type === 'A').value, '8.8.8.8');
});

test('a query for a completely unconfigured domain returns nothing (not another zone\'s data)', () => {
  const zones = { 'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: '@', type: 'A', value: '1.1.1.1' }] } };
  const r = dz.lookupRecords(zones, 'totally-unrelated-domain.net', dz.DNS_TYPES.A);
  assert.deepStrictEqual(r, []);
});

test('CNAME chasing stays within the zone it targets, using the "@" apex convention the rest of the codebase already uses', () => {
  const zones = {
    'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: 'www', type: 'CNAME', value: '@' }, { name: '@', type: 'A', value: '5.5.5.5' }] },
  };
  const r = dz.lookupRecords(zones, 'www.a.com', dz.DNS_TYPES.A);
  assert.ok(r.find(x => x.type === 'A' && x.value === '5.5.5.5'));
});

test('CNAME loop does not infinite-loop or crash', () => {
  const zones = {
    'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [
      { name: 'x', type: 'CNAME', value: 'y.a.com' },
      { name: 'y', type: 'CNAME', value: 'x.a.com' },
    ] },
  };
  const r = dz.lookupRecords(zones, 'x.a.com', dz.DNS_TYPES.A);
  assert.ok(Array.isArray(r)); // must return, not hang or throw
});

test('synthetic NS/SOA are per-zone — each zone reports its own ns1/ns2', () => {
  const zones = {
    'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [] },
    'b.com': { ttl: 300, ns1: 'dns1', ns2: 'dns2', records: [] },
  };
  const nsA = dz.getSyntheticRecords(zones, 'a.com', dz.DNS_TYPES.NS);
  const nsB = dz.getSyntheticRecords(zones, 'b.com', dz.DNS_TYPES.NS);
  assert.ok(nsA.some(r => r.value === 'ns1.a.com.'));
  assert.ok(nsB.some(r => r.value === 'dns1.b.com.'));
});

test('createZone rejects a duplicate domain', () => {
  const zones = { 'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [] } };
  const r = dz.createZone(zones, 'a.com');
  assert.strictEqual(r.ok, false);
});

test('createZone adds a new isolated zone without touching existing ones', () => {
  const zones = { 'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: '@', type: 'A', value: '1.1.1.1' }] } };
  const r = dz.createZone(zones, 'NEW-Domain.COM');
  assert.strictEqual(r.ok, true);
  assert.ok(r.zones['new-domain.com']); // normalized to lowercase
  assert.strictEqual(r.zones['a.com'].records.length, 1); // untouched
});

test('removeZone refuses to remove the primary platform domain', () => {
  const zones = { 'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [] }, 'b.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [] } };
  const r = dz.removeZone(zones, 'a.com', 'a.com');
  assert.strictEqual(r.ok, false);
});

test('removeZone succeeds for a non-primary domain and leaves others intact', () => {
  const zones = { 'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [] }, 'b.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [] } };
  const r = dz.removeZone(zones, 'b.com', 'a.com');
  assert.strictEqual(r.ok, true);
  assert.ok(r.zones['a.com']);
  assert.ok(!r.zones['b.com']);
});

test('upsertRecord rejects an unknown record type instead of silently accepting it', () => {
  const zones = { 'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [] } };
  const r = dz.upsertRecord(zones, 'a.com', { name: '@', type: 'BOGUS', value: 'x' });
  assert.strictEqual(r.ok, false);
});

test('upsertRecord rejects writing into a zone that does not exist', () => {
  const zones = {};
  const r = dz.upsertRecord(zones, 'ghost.com', { name: '@', type: 'A', value: '1.2.3.4' });
  assert.strictEqual(r.ok, false);
});

test('upsertRecord replaces an existing same name+type record rather than duplicating it', () => {
  const zones = { 'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: 'www', type: 'A', value: '1.1.1.1' }] } };
  const r = dz.upsertRecord(zones, 'a.com', { name: 'www', type: 'A', value: '2.2.2.2' });
  assert.strictEqual(r.ok, true);
  const matches = r.zones['a.com'].records.filter(x => x.name === 'www' && x.type === 'A');
  assert.strictEqual(matches.length, 1);
  assert.strictEqual(matches[0].value, '2.2.2.2');
});

test('deleteRecord only removes the matching zone\'s record, others untouched', () => {
  const zones = {
    'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: 'x', type: 'A', value: '1.1.1.1' }] },
    'b.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: 'x', type: 'A', value: '2.2.2.2' }] },
  };
  const r = dz.deleteRecord(zones, 'a.com', 'x', 'A');
  assert.strictEqual(r.removed, 1);
  assert.strictEqual(r.zones['a.com'].records.length, 0);
  assert.strictEqual(r.zones['b.com'].records.length, 1); // untouched
});

test('listZones reports per-zone metadata without leaking record contents', () => {
  const zones = { 'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: '@', type: 'A', value: '1.1.1.1' }, { name: 'www', type: 'A', value: '1.1.1.1' }] } };
  const list = dz.listZones(zones);
  assert.strictEqual(list[0].domain, 'a.com');
  assert.strictEqual(list[0].recordCount, 2);
});

test('wildcard record matches an unconfigured subdomain (previously never worked — no code path handled "*" at all)', () => {
  const zones = { 'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: '*', type: 'A', value: '7.7.7.7' }] } };
  const r = dz.lookupRecords(zones, 'anything.a.com', dz.DNS_TYPES.A);
  assert.ok(r.find(x => x.type === 'A' && x.value === '7.7.7.7'));
});

test('wildcard does NOT override a more specific explicit record', () => {
  const zones = { 'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [
    { name: '*', type: 'A', value: '7.7.7.7' },
    { name: 'specific', type: 'A', value: '9.9.9.9' },
  ] } };
  const r = dz.lookupRecords(zones, 'specific.a.com', dz.DNS_TYPES.A);
  assert.strictEqual(r.find(x => x.type === 'A').value, '9.9.9.9');
});

test('wildcard does not match the zone apex itself', () => {
  const zones = { 'a.com': { ttl: 300, ns1: 'ns1', ns2: 'ns2', records: [{ name: '*', type: 'A', value: '7.7.7.7' }] } };
  const r = dz.lookupRecords(zones, 'a.com', dz.DNS_TYPES.A);
  assert.strictEqual(r.find(x => x.type === 'A'), undefined);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
