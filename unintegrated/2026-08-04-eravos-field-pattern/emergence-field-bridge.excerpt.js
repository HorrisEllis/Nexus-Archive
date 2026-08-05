// ── EMERGENCE FIELD BRIDGE (v0.21.0) ──────────────────────────────
// Emergence is a SEPARATE PROJECT, attached rather than vendored — the same
// relationship WARP has. This polls its relational field and publishes it on
// the ALK bus so the lattice's `field` dimension can read it.
//
// §1.2 — if Emergence is not there, this does nothing and says so once. It
// does not retry forever, and it never fabricates a field. Eravos runs
// completely without it; the dimension reports silent and that is honest
// rather than broken.
const EMERGENCE_BASE = (window.EravosConfig && window.EravosConfig.emergence &&
                        window.EravosConfig.emergence.base) || '/emergence';
let _emergenceState = 'unknown';   // unknown | attached | absent

async function refreshEmergenceField() {
  if (_emergenceState === 'absent') return null;
  try {
    const res = await fetch(EMERGENCE_BASE + '/field', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const field = await res.json();
    if (_emergenceState !== 'attached') {
      _emergenceState = 'attached';
      console.info('[eravos] Emergence attached — the field dimension is live');
    }
    if (window.ALK && window.ALK.stack && window.ALK.stack.bus) {
      window.ALK.stack.bus.emit('alk.field.state', field);
    }
    return field;
  } catch (e) {
    if (_emergenceState === 'unknown') {
      _emergenceState = 'absent';
      // Said ONCE. Not an error — a stated absence.
      console.info('[eravos] Emergence not attached (' + e.message + '). ' +
        'The field dimension abstains; everything else is unaffected.');
    }
    return null;
  }
}
function emergenceStatus() { return _emergenceState; }
if (typeof window !== 'undefined') {
  Object.assign(window, { refreshEmergenceField, emergenceStatus, EMERGENCE_BASE });
  // Once at boot, then on the events that would actually move a field.
  window.addEventListener('load', () => setTimeout(refreshEmergenceField, 2500));
  appStream.onEmit(ev => {
    if (['rupture:save', 'feeling:set', 'growth:save'].indexOf(ev.type) !== -1) {
      refreshEmergenceField();
    }
  });
}
