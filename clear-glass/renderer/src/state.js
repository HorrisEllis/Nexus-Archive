/**
 * renderer/ui/state.js — the small amount of state shared across modules.
 * Extracted from browser.html's inline <script> ("State" section).
 * Kept as a single mutable object (not per-module globals) so every
 * module reads/writes the same source of truth, same as the monolith did
 * via closure — just made explicit instead of implicit.
 */

const params = new URLSearchParams(window.location.search);

export const agentId = params.get('agentId') || 'default';
export const ssePort = params.get('ssePort') || 7701;
export const initialUrl = params.get('url') || '';

export const state = {
  pickerActive: false,
  picks: [],
  domPanelVisible: false,
  copilotVisible: true,
  ctxDom: true,
  ctxPicks: false,
  ctxCookies: false,
  es: null, // EventSource — assigned by sse.js's connectSSE()
};
