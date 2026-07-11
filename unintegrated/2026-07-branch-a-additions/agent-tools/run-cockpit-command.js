'use strict';
/**
 * lib/agent-tools/tools/run-cockpit-command.js — run_cockpit_command tool
 * UUID: nexus-agent-tools-run-cockpit-v1-0000-2026-0707-jamesbrooks-001
 *
 * The keyword->command layer from forge.spec, built real. Lets a model
 * (via lib/agent-tools/'s loop) resolve a plain-text request to a real
 * cockpit CLI command and run it — "list the pipelines" -> `forge
 * pipeline list`, executed through the actual ForgeCLI.exec() that
 * guardian/server.js already uses.
 *
 * §KEY DESIGN — the tool's advertised command list is READ FROM cockpit's
 * own INTERACTION_CONTRACT, never hand-copied. This is the direct lesson
 * of this session's single most common bug (a declared surface drifting
 * from the real implementation — copilot's hooks vs. its routes, the
 * registry vs. cortex's real paths). By sourcing the command list from
 * the same contract ForgeCLI itself routes against, the tool's schema
 * physically cannot drift from the real commands: if a command is added
 * or renamed in cockpit, this reflects it automatically.
 *
 * §DEPENDENCY — needs a live ForgeCLI instance (with its bus/jaa/registry
 * wired). Injected by the caller, not constructed here — same
 * dependency-injection discipline as every other real piece this
 * session. A caller without a wired ForgeCLI gets a clear error, not a
 * fabricated success.
 */

let _forgeCLI = null;       // injected live instance
let _contractCommands = null;

/**
 * wireCockpit(forgeCLIInstance) — called once at startup by whatever
 * owns the real ForgeCLI (guardian/server.js already constructs one).
 * Also pulls the real command list from cockpit's contract so the tool
 * schema reflects reality.
 */
function wireCockpit(forgeCLIInstance) {
  _forgeCLI = forgeCLIInstance;
  try {
    const { INTERACTION_CONTRACT } = require('../../../cockpit/cli.js');
    _contractCommands = INTERACTION_CONTRACT.commands.map(c => ({ cmd: c.cmd, description: c.description }));
  } catch (_) { _contractCommands = null; }
}

function _describeCommands() {
  if (!_contractCommands) return 'Cockpit command list unavailable (not wired).';
  return _contractCommands.map(c => `  ${c.cmd} — ${c.description}`).join('\n');
}

module.exports = {
  name: 'run_cockpit_command',
  get description() {
    // Dynamic — the real command list is embedded in the description so
    // the model always sees the current, real command set.
    return 'Run a cockpit/forge CLI command. Available commands (exact strings, pick the one matching the user\'s intent):\n' + _describeCommands();
  },
  parameters: {
    type: 'object',
    properties: {
      command: { type: 'string', description: 'The exact cockpit command string to run, e.g. "forge pipeline list"' },
      opts: { type: 'object', description: 'Optional command arguments (name, payload, etc.) — command-specific' },
    },
    required: ['command'],
  },
  execute: async ({ command, opts }) => {
    if (!_forgeCLI) return { error: 'cockpit not wired — no live ForgeCLI instance available to execute against' };
    if (!command) return { error: 'command is required' };
    // §safety — only run commands that actually exist in the real
    // contract, not arbitrary strings a model might hallucinate. Prefix-
    // match against the real command list (args come after the 3-word
    // command stem, same as ForgeCLI._route's own parsing).
    if (_contractCommands) {
      const stem = command.trim().split(/\s+/).slice(0, 3).join(' ');
      const known = _contractCommands.some(c => c.cmd === stem || c.cmd.startsWith(stem));
      if (!known && stem !== 'forge help') {
        return { error: `'${command}' is not a known cockpit command. Run "forge help" to see the real list.` };
      }
    }
    try {
      const result = await _forgeCLI.exec(command, opts || {});
      return { command, result };
    } catch (e) {
      return { error: `cockpit command failed: ${e.message}` };
    }
  },
  wireCockpit, // exposed so the owner can inject the live instance
};
