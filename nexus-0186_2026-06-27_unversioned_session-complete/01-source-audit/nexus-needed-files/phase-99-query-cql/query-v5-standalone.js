/**
 * @module       query
 * @uuid         e3bca332-8937-441f-a2a0-9babae81afb6
 * @project      causal-nexus
 * @project-uuid eecaa718-c6a6-4433-b02a-11ecbefd4740
 * @version      1.0.0
 * @file         modules/query/query.js
 *
 * @description
 *   Causal Query Language (CQL) engine for Causal Nexus.
 *
 *   CQL is a small declarative query language for the causal event graph.
 *   It compiles to index-assisted scans where possible, falling back to
 *   O(n) filter scans. The kernel's existing O(1) structures (idIndex,
 *   typeIndex) are used as seed sets before filtering.
 *
 *   Grammar (EBNF):
 *
 *     query      = "FIND" scope "WHERE" conditions [order] [limit]
 *     scope      = "events" | "edges" | "chains"
 *     conditions = condition ( ("AND" | "OR") condition )*
 *     condition  = field comparator value | "NOT" condition
 *                | "WITHIN" number "ticks" "OF" eventRef
 *                | "CAUSED_BY" eventRef
 *                | "HAS_CHILD" condition
 *     field      = "type" | "payload." ident | "source" | "seq"
 *               | "eventTs" | "ts" | "causedBy" | "edgeType"
 *               | "instability" | "depth"
 *     comparator = "=" | "!=" | ">" | "<" | ">=" | "<=" | "~=" | "IN"
 *     value      = string | number | array
 *     eventRef   = quoted type string | "$selected"
 *     order      = "ORDER BY" field ("ASC" | "DESC")
 *     limit      = "LIMIT" number
 *
 *   Examples:
 *
 *     FIND events WHERE type = 'command:failed' LIMIT 20
 *
 *     FIND events WHERE type = 'command:failed'
 *       AND payload.retryCount >= 3
 *       AND source = 'bridge:element-api'
 *
 *     FIND events WHERE type = 'dom:changed'
 *       WITHIN 500 ticks OF 'page:navigated'
 *       ORDER BY eventTs DESC LIMIT 10
 *
 *     FIND events WHERE CAUSED_BY type = 'command:running'
 *       AND type = 'command:success'
 *
 *     FIND chains WHERE type = 'alert:critical'
 *       ORDER BY depth DESC LIMIT 5
 *
 * @hooks
 * @hook 5cc1be94-7745-4587-8fdd-a5cc8438fc6f  parseQuery        kind:function
 * @hook e19f0811-1eb6-4a79-83eb-284301a1d090  execQuery         kind:function
 * @hook 5c3dd26c-4514-4792-b22f-88b7f0ff5ee5  createQueryIndex  kind:function
 * @hook 27d96495-ec9a-478f-99f3-bb23633440b6  query             kind:function
 * @hook 7363e176-91fc-49a1-ada7-568cc2554fbb  QueryResult       kind:constant
 * @hook 9d1e6545-276d-475c-8ddb-dcc6429108c6  CQLSyntaxError    kind:constant
 */

'use strict';

// ── Error type ────────────────────────────────────────────────────────────────

// @hook 9d1e6545-276d-475c-8ddb-dcc6429108c6  query:CQLSyntaxError  kind:constant
export class CQLSyntaxError extends Error {
  constructor(message, pos) {
    super(`CQL syntax error${pos != null ? ` at position ${pos}` : ''}: ${message}`);
    this.name    = 'CQLSyntaxError';
    this.cqlPos  = pos;
  }
}

// ── QueryResult ────────────────────────────────────────────────────────────────

// @hook 7363e176-91fc-49a1-ada7-568cc2554fbb  query:QueryResult  kind:constant
export const QueryResult = {
  create(fields) {
    return Object.freeze({
      ok:          true,
      events:      [],
      total:       0,
      durationMs:  0,
      scope:       'events',
      plan:        null,    // { strategy, seedSize, filterCount }
      error:       null,
      ...fields,
    });
  },
};

// ── Lexer ─────────────────────────────────────────────────────────────────────

const TK = {
  FIND:'FIND', WHERE:'WHERE', AND:'AND', OR:'OR', NOT:'NOT',
  WITHIN:'WITHIN', TICKS:'ticks', OF:'OF', CAUSED_BY:'CAUSED_BY',
  HAS_CHILD:'HAS_CHILD', ORDER:'ORDER', BY:'BY', ASC:'ASC', DESC:'DESC',
  LIMIT:'LIMIT', EVENTS:'events', EDGES:'edges', CHAINS:'chains',
  EQ:'=', NEQ:'!=', GT:'>', LT:'<', GTE:'>=', LTE:'<=', FUZZY:'~=', IN:'IN',
  DOT:'.', LPAREN:'(', RPAREN:')',
  IDENT:'IDENT', STRING:'STRING', NUMBER:'NUMBER', ARRAY:'ARRAY', EOF:'EOF',
};

function lex(src) {
  const tokens = [];
  let i = 0;

  while (i < src.length) {
    // whitespace
    if (/\s/.test(src[i])) { i++; continue; }

    // string literals
    if (src[i] === "'") {
      let s = ''; i++;
      while (i < src.length && src[i] !== "'") {
        if (src[i] === '\\') { i++; }
        s += src[i++];
      }
      i++; // closing '
      tokens.push({ type: TK.STRING, val: s });
      continue;
    }

    // numbers
    if (/[0-9]/.test(src[i]) || (src[i] === '-' && /[0-9]/.test(src[i+1]))) {
      let n = '';
      if (src[i] === '-') n += src[i++];
      while (i < src.length && /[0-9.]/.test(src[i])) n += src[i++];
      tokens.push({ type: TK.NUMBER, val: parseFloat(n) });
      continue;
    }

    // operators
    if (src.slice(i, i+2) === '!=') { tokens.push({ type: TK.NEQ }); i+=2; continue; }
    if (src.slice(i, i+2) === '>=') { tokens.push({ type: TK.GTE }); i+=2; continue; }
    if (src.slice(i, i+2) === '<=') { tokens.push({ type: TK.LTE }); i+=2; continue; }
    if (src.slice(i, i+2) === '~=') { tokens.push({ type: TK.FUZZY }); i+=2; continue; }
    if (src[i] === '=')  { tokens.push({ type: TK.EQ  }); i++; continue; }
    if (src[i] === '>')  { tokens.push({ type: TK.GT  }); i++; continue; }
    if (src[i] === '<')  { tokens.push({ type: TK.LT  }); i++; continue; }
    if (src[i] === '.')  { tokens.push({ type: TK.DOT }); i++; continue; }
    if (src[i] === '(')  { tokens.push({ type: TK.LPAREN }); i++; continue; }
    if (src[i] === ')')  { tokens.push({ type: TK.RPAREN }); i++; continue; }

    // identifiers and keywords
    if (/[a-zA-Z_$]/.test(src[i])) {
      let w = '';
      while (i < src.length && /[a-zA-Z0-9_$:.-]/.test(src[i])) w += src[i++];
      const KW = {
        FIND:TK.FIND, WHERE:TK.WHERE, AND:TK.AND, OR:TK.OR, NOT:TK.NOT,
        WITHIN:TK.WITHIN, OF:TK.OF, CAUSED_BY:TK.CAUSED_BY, HAS_CHILD:TK.HAS_CHILD,
        ORDER:TK.ORDER, BY:TK.BY, ASC:TK.ASC, DESC:TK.DESC, LIMIT:TK.LIMIT,
        IN:TK.IN, events:TK.EVENTS, edges:TK.EDGES, chains:TK.CHAINS,
        ticks:TK.TICKS,
      };
      tokens.push({ type: KW[w] || TK.IDENT, val: w });
      continue;
    }

    i++; // skip unknown chars
  }
  tokens.push({ type: TK.EOF });
  return tokens;
}

// ── Parser ────────────────────────────────────────────────────────────────────

function parse(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const eat  = t => {
    const tok = tokens[pos];
    if (t && tok.type !== t) throw new CQLSyntaxError(`expected ${t}, got ${tok.type}`, pos);
    pos++;
    return tok;
  };
  const maybe = t => { if (tokens[pos].type === t) { pos++; return true; } return false; };

  function parseQuery() {
    eat(TK.FIND);
    const scope = parseScope();
    eat(TK.WHERE);
    const conditions = parseConditions();
    const orderBy    = parseOrderBy();
    const limit      = parseLimit();
    eat(TK.EOF);
    return { scope, conditions, orderBy, limit };
  }

  function parseScope() {
    const tok = peek();
    if (tok.type === TK.EVENTS || tok.type === TK.EDGES || tok.type === TK.CHAINS) {
      pos++;
      return tok.val || tok.type.toLowerCase();
    }
    throw new CQLSyntaxError('expected events, edges, or chains', pos);
  }

  function parseConditions() {
    const left = parseSingleCondition();
    if (peek().type === TK.AND) { eat(TK.AND); return { op: 'AND', left, right: parseConditions() }; }
    if (peek().type === TK.OR)  { eat(TK.OR);  return { op: 'OR',  left, right: parseConditions() }; }
    return left;
  }

  function parseSingleCondition() {
    if (maybe(TK.NOT)) return { op: 'NOT', child: parseSingleCondition() };

    if (peek().type === TK.WITHIN) {
      eat(TK.WITHIN);
      const ticks = eat(TK.NUMBER).val;
      eat(TK.TICKS);
      eat(TK.OF);
      const ref = parseEventRef();
      return { op: 'WITHIN', ticks, ref };
    }

    if (peek().type === TK.CAUSED_BY) {
      eat(TK.CAUSED_BY);
      const cond = parseSingleCondition();
      return { op: 'CAUSED_BY', child: cond };
    }

    if (peek().type === TK.HAS_CHILD) {
      eat(TK.HAS_CHILD);
      const cond = parseSingleCondition();
      return { op: 'HAS_CHILD', child: cond };
    }

    // field comparator value
    const field = parseField();
    const cmp   = parseComparator();

    if (cmp === 'IN') {
      eat(TK.LPAREN);
      const vals = [];
      while (peek().type !== TK.RPAREN && peek().type !== TK.EOF) {
        vals.push(parseLiteral());
        if (peek().type !== TK.RPAREN) pos++; // skip comma
      }
      eat(TK.RPAREN);
      return { op: 'CMP', field, cmp, value: vals };
    }

    const value = parseLiteral();
    return { op: 'CMP', field, cmp, value };
  }

  function parseField() {
    const parts = [eat(TK.IDENT).val];
    while (peek().type === TK.DOT) { eat(TK.DOT); parts.push(eat(TK.IDENT).val); }
    return parts.join('.');
  }

  function parseComparator() {
    const tok = peek(); pos++;
    const MAP = { [TK.EQ]:'=', [TK.NEQ]:'!=', [TK.GT]:'>', [TK.LT]:'<',
                  [TK.GTE]:'>=', [TK.LTE]:'<=', [TK.FUZZY]:'~=', [TK.IN]:'IN' };
    if (!MAP[tok.type]) throw new CQLSyntaxError(`expected comparator, got ${tok.type}`, pos);
    return MAP[tok.type];
  }

  function parseLiteral() {
    const tok = peek();
    if (tok.type === TK.STRING) { pos++; return tok.val; }
    if (tok.type === TK.NUMBER) { pos++; return tok.val; }
    throw new CQLSyntaxError(`expected string or number literal`, pos);
  }

  function parseEventRef() {
    if (peek().type === TK.STRING) return { kind: 'type', val: eat(TK.STRING).val };
    if (peek().type === TK.IDENT && peek().val === '$selected') {
      pos++;
      return { kind: 'selected' };
    }
    throw new CQLSyntaxError('expected event type string or $selected', pos);
  }

  function parseOrderBy() {
    if (peek().type !== TK.ORDER) return null;
    eat(TK.ORDER); eat(TK.BY);
    const field = parseField();
    const dir   = maybe(TK.DESC) ? 'DESC' : (maybe(TK.ASC) ? 'ASC' : 'ASC');
    return { field, dir };
  }

  function parseLimit() {
    if (peek().type !== TK.LIMIT) return 1000;
    eat(TK.LIMIT);
    return eat(TK.NUMBER).val;
  }

  return parseQuery();
}

// ── Execution engine ──────────────────────────────────────────────────────────

function resolveField(ev, field) {
  if (field === 'type')        return ev.type;
  if (field === 'source')      return ev.source;
  if (field === 'seq')         return ev.seq;
  if (field === 'eventTs')     return ev.eventTs;
  if (field === 'ts')          return ev.ts;
  if (field === 'causedBy')    return ev.causedBy;
  if (field === 'edgeType')    return ev.edgeType;
  if (field === 'id')          return ev.id;
  if (field === 'contentHash') return ev.contentHash;
  if (field.startsWith('payload.')) {
    const key = field.slice('payload.'.length);
    return ev.payload?.[key];
  }
  return undefined;
}

function evalCmp(actual, cmp, expected) {
  if (actual === undefined || actual === null) return cmp === '!=' && expected !== null;
  switch (cmp) {
    case '=':  return actual === expected;
    case '!=': return actual !== expected;
    case '>':  return actual >  expected;
    case '<':  return actual <  expected;
    case '>=': return actual >= expected;
    case '<=': return actual <= expected;
    case '~=': return String(actual).toLowerCase().includes(String(expected).toLowerCase());
    case 'IN': return Array.isArray(expected) && expected.includes(actual);
  }
  return false;
}

function evalCondition(ev, cond, ctx) {
  if (!cond) return true;

  if (cond.op === 'CMP') {
    return evalCmp(resolveField(ev, cond.field), cond.cmp, cond.value);
  }

  if (cond.op === 'AND') {
    return evalCondition(ev, cond.left, ctx) && evalCondition(ev, cond.right, ctx);
  }

  if (cond.op === 'OR') {
    return evalCondition(ev, cond.left, ctx) || evalCondition(ev, cond.right, ctx);
  }

  if (cond.op === 'NOT') {
    return !evalCondition(ev, cond.child, ctx);
  }

  if (cond.op === 'WITHIN') {
    // Find anchor events matching the ref type
    const anchor = ctx.anchorEvent;
    if (!anchor) return false;
    return Math.abs(ev.eventTs - anchor.eventTs) <= cond.ticks;
  }

  if (cond.op === 'CAUSED_BY') {
    if (!ev.causedBy) return false;
    const parent = ctx.findById(ev.causedBy);
    if (!parent) return false;
    return evalCondition(parent, cond.child, ctx);
  }

  if (cond.op === 'HAS_CHILD') {
    const children = ctx.getChildren(ev.id);
    for (const childId of children) {
      const child = ctx.findById(childId);
      if (child && evalCondition(child, cond.child, ctx)) return true;
    }
    return false;
  }

  return false;
}

function extractTypeHint(cond) {
  // If the root condition is "type = 'something'" return that type for fast seeding
  if (!cond) return null;
  if (cond.op === 'CMP' && cond.field === 'type' && cond.cmp === '=') return cond.value;
  if (cond.op === 'AND') return extractTypeHint(cond.left) || extractTypeHint(cond.right);
  return null;
}

function extractAnchor(cond, events) {
  // Find WITHIN clause ref — locate the anchor event for the WITHIN operator
  if (!cond) return null;
  if (cond.op === 'WITHIN') {
    if (cond.ref.kind === 'type') {
      return events.find(e => e.type === cond.ref.val) || null;
    }
  }
  if (cond.op === 'AND') return extractAnchor(cond.left, events) || extractAnchor(cond.right, events);
  return null;
}

function sortResults(results, orderBy, kernel) {
  if (!orderBy) return results;
  const { field, dir } = orderBy;
  const mul = dir === 'DESC' ? -1 : 1;

  // Special case: depth requires traceToRoot
  if (field === 'depth') {
    return [...results].sort((a, b) => {
      const da = kernel.traceToRoot(a.id).depth;
      const db = kernel.traceToRoot(b.id).depth;
      return (da - db) * mul;
    });
  }

  return [...results].sort((a, b) => {
    const va = resolveField(a, field);
    const vb = resolveField(b, field);
    if (va === vb) return 0;
    if (va == null) return mul;
    if (vb == null) return -mul;
    return (va < vb ? -1 : 1) * mul;
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

// @hook 5cc1be94-7745-4587-8fdd-a5cc8438fc6f  query:parseQuery  kind:function
/**
 * Parse a CQL string into an AST.
 *
 * Throws CQLSyntaxError on parse failure.
 *
 * @param {string} cql
 * @returns {QueryAST}
 */
export function parseQuery(cql) {
  if (typeof cql !== 'string' || !cql.trim()) {
    throw new CQLSyntaxError('query string is empty');
  }
  const tokens = lex(cql.trim());
  return parse(tokens);
}

// @hook e19f0811-1eb6-4a79-83eb-284301a1d090  query:execQuery  kind:function
/**
 * Execute a parsed query AST against a kernel.
 *
 * Execution plan:
 *   1. Seed candidate set: if condition has `type = 'X'`, use typeIndex O(1)
 *      Otherwise seed from all events O(n).
 *   2. Apply all conditions via evalCondition()
 *   3. Handle CHAINS scope: expand each result to its full causal chain
 *   4. Sort and limit
 *
 * @param {QueryAST} ast   — from parseQuery()
 * @param {object}   kernel
 * @param {object}   [opts]
 *   opts.selected  {object}  — selected event for $selected refs
 *   opts.deltas    {Map}     — optional event → delta map for instability queries
 * @returns {QueryResult}
 */
export function execQuery(ast, kernel, opts = {}) {
  const t0 = performance.now();

  try {
    const { scope, conditions, orderBy, limit } = ast;
    const events = kernel.getAll();
    const anchor = extractAnchor(conditions, events);

    const ctx = {
      findById:   id => kernel.findById(id),
      getChildren: id => kernel.getChildren(id),
      anchorEvent: anchor,
      selected:    opts.selected || null,
    };

    // Seed candidates
    const typeHint  = extractTypeHint(conditions);
    let   candidates;
    let   strategy  = 'full-scan';
    let   seedSize  = events.length;

    if (typeHint) {
      const typeIds = kernel._typeIndex?.get(typeHint);
      if (typeIds?.size) {
        candidates = [...typeIds].map(id => kernel.findById(id)).filter(Boolean);
        strategy   = 'typeIndex';
        seedSize   = candidates.length;
      }
    }

    if (!candidates) candidates = events;

    // Filter
    const filtered = candidates.filter(ev => evalCondition(ev, conditions, ctx));

    // Handle CHAINS scope — expand each result to its full root→ev chain
    let results = filtered;
    if (scope === 'chains') {
      const seen = new Set();
      results = [];
      for (const ev of filtered) {
        const chain = kernel.traceToRoot(ev.id);
        const chainEvents = chain.path
          .map(id => kernel.findById(id))
          .filter(Boolean);
        for (const ce of chainEvents) {
          if (!seen.has(ce.id)) { seen.add(ce.id); results.push(ce); }
        }
      }
    }

    // Sort and limit
    const sorted  = sortResults(results, orderBy, kernel);
    const limited = sorted.slice(0, limit);

    return QueryResult.create({
      ok: true,
      events: limited,
      total:  filtered.length,
      durationMs: Math.round(performance.now() - t0),
      scope,
      plan: { strategy, seedSize, filterCount: filtered.length },
    });
  } catch (e) {
    return QueryResult.create({
      ok: false,
      error: e.message,
      durationMs: Math.round(performance.now() - t0),
    });
  }
}

// @hook 5c3dd26c-4514-4792-b22f-88b7f0ff5ee5  query:createQueryIndex  kind:factory
/**
 * Build a secondary index map over a set of events.
 * Useful for repeated queries on a stable snapshot.
 *
 * Returns a Map<field+value, Event[]> that can be used to seed queries
 * without full O(n) scans.
 *
 * @param {Event[]}  events
 * @param {string[]} fields   — which fields to index (e.g. ['type','source'])
 * @returns {QueryIndex}
 */
export function createQueryIndex(events, fields = ['type', 'source']) {
  const index = new Map();

  for (const ev of events) {
    for (const field of fields) {
      const val = resolveField(ev, field);
      if (val == null) continue;
      const key = `${field}:${val}`;
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(ev);
    }
  }

  return {
    get(field, value)  { return index.get(`${field}:${value}`) || []; },
    has(field, value)  { return index.has(`${field}:${value}`); },
    keys()             { return index.keys(); },
    size:              index.size,
  };
}

// @hook 27d96495-ec9a-478f-99f3-bb23633440b6  query:query  kind:function
/**
 * Parse and execute a CQL query string in one call.
 *
 * @param {string}   cql
 * @param {object}   kernel
 * @param {object}   [opts]   — passed to execQuery
 * @returns {QueryResult}
 */
export function query(cql, kernel, opts = {}) {
  let ast;
  try {
    ast = parseQuery(cql);
  } catch (e) {
    return QueryResult.create({
      ok:    false,
      error: e.message,
    });
  }
  return execQuery(ast, kernel, opts);
}
