/**
 * foundation/runtime-enum.js
 * COMPARTMENT OS — Supported Runtime Definitions
 * IMMUTABLE after v1.0.0 (COS-5)
 *
 * Author: James Brooks (Erosmancer)
 * Status: pre-release
 */

'use strict';

const RUNTIMES = Object.freeze([
  { id: 'node',     displayName: 'Node.js',    minVersion: '18.0.0',  entryPattern: ['index.js', 'main.js', 'server.js', 'app.js'] },
  { id: 'python',   displayName: 'Python',     minVersion: '3.10.0',  entryPattern: ['main.py', 'app.py', 'server.py', 'run.py']  },
  { id: 'deno',     displayName: 'Deno',       minVersion: '1.30.0',  entryPattern: ['main.ts', 'mod.ts', 'index.ts']              },
  { id: 'bun',      displayName: 'Bun',        minVersion: '1.0.0',   entryPattern: ['index.ts', 'index.js', 'server.ts']          },
  { id: 'html',     displayName: 'HTML/Browser', minVersion: null,    entryPattern: ['index.html', 'app.html']                     },
  { id: 'electron', displayName: 'Electron',   minVersion: '25.0.0',  entryPattern: ['main.js', 'electron.js']                    },
  { id: 'go',       displayName: 'Go',         minVersion: '1.20.0',  entryPattern: ['main.go']                                   },
  { id: 'rust',     displayName: 'Rust',       minVersion: '1.70.0',  entryPattern: ['src/main.rs']                               },
  { id: 'php',      displayName: 'PHP',        minVersion: '8.1.0',   entryPattern: ['index.php', 'server.php']                   },
  { id: 'ruby',     displayName: 'Ruby',       minVersion: '3.0.0',   entryPattern: ['app.rb', 'server.rb', 'config.ru']          },
  { id: 'java',     displayName: 'Java',       minVersion: '17.0.0',  entryPattern: ['pom.xml', 'build.gradle']                   },
  { id: 'dotnet',   displayName: '.NET',       minVersion: '7.0.0',   entryPattern: ['*.csproj', 'Program.cs']                    },
  { id: 'shell',    displayName: 'Shell',      minVersion: null,      entryPattern: ['run.sh', 'start.sh', 'Makefile']            },
  { id: 'wasm',     displayName: 'WASM',       minVersion: null,      entryPattern: ['*.wasm']                                    },
]);

const RUNTIME_MAP = new Map(RUNTIMES.map(r => [r.id, r]));

const RUNTIME_IDS = Object.freeze(RUNTIMES.map(r => r.id));

// ─── Full RuntimeID type enum (spec §59.1) ────────────────────────────────────
// RUNTIMES above is the OPERATIONAL set — runtimes COS can actually detect and
// spawn today (14 entries, each with a manifest). RUNTIME_ID_ENUM is the full
// TYPE-LEVEL set from §59.1 — it includes three values with no operational
// entry yet:
//   'exe'    — Phase 24 (EXE Runner) builds the manifest + spawn logic
//   'wine'   — spec marks this "v2.x", explicitly not yet in scope
//   'plugin' — not a concrete runtime; marks a runtime contributed by a plugin
// isKnownRuntimeId() validates against this full set. isOperationalRuntimeId()
// validates against the narrower spawnable set.
const RUNTIME_ID_ENUM = Object.freeze([...RUNTIME_IDS, 'exe', 'wine', 'plugin']);
const RUNTIME_ID_SET  = new Set(RUNTIME_ID_ENUM);

/** @param {string} id @returns {boolean} */
function isKnownRuntimeId(id) {
  return RUNTIME_ID_SET.has(id);
}

/** @param {string} id @returns {boolean} */
function isOperationalRuntimeId(id) {
  return RUNTIME_MAP.has(id);
}

module.exports = Object.freeze({
  RUNTIMES, RUNTIME_MAP, RUNTIME_IDS,
  RUNTIME_ID_ENUM, isKnownRuntimeId, isOperationalRuntimeId,
});
