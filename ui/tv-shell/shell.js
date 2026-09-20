'use strict';
/**
 * ui/tv-shell/shell.js — first-principles rebuild.
 *
 * §REBUILT 2026-09-20 — the old shell loaded menu.js, spotlight.js/css,
 * nerve.js/css, warp-ui/*, forge-shell/index.html and tutorial.js
 * alongside a 2784-line index.html — most of it agent-dispatch, spec-
 * building and copilot UI that belongs to ui/home (see ui/tv-shell/
 * DECOMP.md), not to a channel-switching TV shell. Deleting files out
 * of that web broke it because it was one web. This is not a patch of
 * that file; it is a new, minimal one with none of those dependencies —
 * a channel is an iframe pointed at a system's own real UI folder, full
 * stop.
 *
 * §NO ORCHESTRATOR — the old shell fetched window.NEXUS_PORTS from
 * http://localhost:9000/ports.js and polled http://localhost:9000/health
 * for the heartbeat dots. Neither exists here. This file makes zero
 * network calls of its own; every channel URL below is a plain relative
 * path, resolved by whatever actually serves this directory (which does
 * not have to be the orchestrator). A channel that happens to be its
 * own separate server (idearium, on its own port) is that channel's own
 * concern once loaded into the iframe — this shell never talks to it.
 */

// ── channel registry — one entry per real system UI folder, verified to
// exist on disk before being listed here. Not every ui/ folder is a
// channel: ui/copilot has no page of its own (a bar widget, embedded
// elsewhere), ui/consent/lib/themes/channels are utility folders with
// no page, ui/import-project is a one-shot upload flow (not a place to
// sit), ui/brainos-float is a 21-line stub. Agent consoles (ui/agents/
// claude, chatgpt, gemini, perplexity) are a different kind of thing —
// AI chat surfaces, not system dashboards — deliberately left out of
// this pass; say the word and they get their own channel numbers.
const CHANNELS = [
  { num: 1, id: 'guardian',      name: 'GUARDIAN',      accent: '--sys-gd',   url: '../guardian/index.html' },
  { num: 2, id: 'cortex',        name: 'CORTEX',         accent: '--sys-cx',   url: '../cortex/index.html' },
  { num: 3, id: 'idearium',      name: 'IDEARIUM',       accent: '--sys-idr',  url: '../../idearium/ui/index.html' },
  { num: 4, id: 'emerge',        name: 'EMERGE',         accent: '--sys-em',   url: '../emerge/emerge-ide.html' },
  { num: 5, id: 'eravos',        name: 'ERAVOS',         accent: '--sys-er',   url: '../eravos/index.html' },
  { num: 6, id: 'overview',      name: 'OVERVIEW',       accent: '--sys-orch', url: '../home/nexus-home.html' },
  { num: 7, id: 'brainos',       name: 'BRAINOS',        accent: '--sys-cp',   url: '../brainos/index.html' },
  { num: 8, id: 'library',       name: 'LIBRARY',        accent: '--sys-ol',   url: '../library/index.html' },
  { num: 9, id: 'control-panel', name: 'CONTROL PANEL',  accent: '--sys-dg',   url: '../control-panel/index.html' },
  { num: 0, id: 'forge',         name: 'FORGE',          accent: '--sys-arch', url: '../forge-shell/index.html' },
];

const LAST_CHANNEL_KEY = 'nexus.tv.lastChannel';

// ── elements ───────────────────────────────────────────────────────────
const screen   = document.getElementById('screen');
const ciNum    = document.getElementById('ci-num');
const ciName   = document.getElementById('ci-name');
const menuBtn  = document.getElementById('menu-btn');
const menuNum  = document.getElementById('menu-btn-num');
const rail     = document.getElementById('channel-rail');

let current = null; // the CHANNELS entry currently tuned

// ── tune ───────────────────────────────────────────────────────────────
function tuneById(id) {
  const ch = CHANNELS.find(c => c.id === id);
  if (!ch) { console.warn(`[tv-shell] no such channel: ${id}`); return; }
  current = ch;
  screen.src = ch.url;
  ciNum.textContent = String(ch.num).padStart(2, '0');
  ciName.textContent = ch.name;
  menuNum.textContent = String(ch.num).padStart(2, '0');
  document.documentElement.style.setProperty('--current-accent', `var(${ch.accent})`);
  try { localStorage.setItem(LAST_CHANNEL_KEY, id); } catch { /* private mode — fine, just won't restore */ }
  renderRail(); // refresh active-state highlighting
}

function tuneByNum(n) {
  const ch = CHANNELS.find(c => c.num === n);
  if (ch) tuneById(ch.id);
}

function step(delta) {
  if (!current) return tuneByNum(CHANNELS[0].num);
  const idx = CHANNELS.findIndex(c => c.id === current.id);
  const next = CHANNELS[(idx + delta + CHANNELS.length) % CHANNELS.length];
  tuneById(next.id);
}

// ── channel rail (the menu button opens this — a numbered list, same
// idea as picking a channel on a TV) ────────────────────────────────────
function renderRail() {
  rail.innerHTML = '';
  for (const ch of CHANNELS) {
    const btn = document.createElement('button');
    btn.className = 'rail-item' + (current && current.id === ch.id ? ' active' : '');
    btn.style.setProperty('--accent', `var(${ch.accent})`);
    btn.innerHTML = `<span class="rail-num">${String(ch.num).padStart(2, '0')}</span><span class="rail-name">${ch.name}</span>`;
    btn.addEventListener('click', () => { tuneById(ch.id); closeMenu(); });
    rail.appendChild(btn);
  }
}

function openMenu() {
  rail.hidden = false;
  menuBtn.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  rail.hidden = true;
  menuBtn.setAttribute('aria-expanded', 'false');
}
function toggleMenu() { rail.hidden ? openMenu() : closeMenu(); }

menuBtn.addEventListener('click', toggleMenu);

// ── keyboard — TV remote metaphor: number keys jump directly, arrows
// step one channel at a time, 'm' and Escape toggle the channel list ───
window.addEventListener('keydown', (e) => {
  if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
  if (/^[0-9]$/.test(e.key)) { tuneByNum(Number(e.key)); return; }
  if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { step(1); return; }
  if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { step(-1); return; }
  if (e.key === 'm' || e.key === 'M') { toggleMenu(); return; }
  if (e.key === 'Escape') { closeMenu(); return; }
});

// ── particle void — pure decoration, unchanged visual language from the
// original (same palette, same density, same connective-line effect).
// §FIX 2026-06-21 (carried forward) — a canvas whose getContext('2d')
// fails (privacy-hardened browsers, some ad-blockers) must not throw
// uncaught here: this file has real logic below the void's own IIFE in
// source order in spirit even though it doesn't literally today, and an
// uncaught throw during init previously took down everything declared
// after it in the same script. try/catch stays, on purpose, forever.
(function initVoid() {
  try {
    const canvas = document.getElementById('void');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');

    let w, h;
    const resize = () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const HUES = [195, 145, 260, 210];
    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * w; this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.25; this.vy = (Math.random() - 0.5) * 0.25;
        this.phase = Math.random() * Math.PI * 2;
        this.r = Math.random() * 1.4 + 0.3;
        this.hue = HUES[Math.floor(Math.random() * HUES.length)];
      }
      tick() {
        this.x += this.vx; this.y += this.vy; this.phase += 0.018;
        if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue},70%,65%,${0.06 + Math.sin(this.phase) * 0.05})`;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 70 }, () => new Particle());

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(120,140,200,${(1 - d / 130) * 0.05})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
        particles[i].tick();
        particles[i].draw();
      }
      requestAnimationFrame(frame);
    }
    frame();
  } catch (e) {
    console.warn(`[tv-shell] background effect disabled (canvas unavailable): ${e.message}`);
  }
})();

// ── boot — restore last channel if it still exists, else channel 1 ─────
(function boot() {
  renderRail();
  let startId = CHANNELS[0].id;
  try {
    const last = localStorage.getItem(LAST_CHANNEL_KEY);
    if (last && CHANNELS.some(c => c.id === last)) startId = last;
  } catch { /* fine — default stands */ }
  tuneById(startId);
})();

// exposed for the console / for a future menu module that wants it —
// not required by anything in this file itself
window.tuneById = tuneById;
window.tuneByNum = tuneByNum;
