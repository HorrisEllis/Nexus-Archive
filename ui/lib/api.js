/**
 * ui/lib/api.js — shared fetch helpers
 *
 * Extracted from ui/home/index.html (lines 706-708) per DECOMP.md's own
 * plan: "1609-1611 get/post/del helpers → ui/lib/api.js (shared utility)."
 * These three functions have zero dependency on home's state, channels, or
 * DOM — they're a pure HTTP tool, usable by any UI surface in the system,
 * which is exactly what belongs in lib/ rather than baked into one page.
 *
 * All three fail soft (return null on any error/timeout) rather than throw
 * — every existing call site across the UI already assumes that contract,
 * so it's preserved exactly, not "improved" as part of this extraction.
 */
async function get(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return await r.json();
  } catch { return null; }
}

async function post(url, body) {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    return await r.json();
  } catch { return null; }
}

async function del(url) {
  try {
    const r = await fetch(url, { method: 'DELETE', signal: AbortSignal.timeout(3000) });
    return await r.json();
  } catch { return null; }
}
