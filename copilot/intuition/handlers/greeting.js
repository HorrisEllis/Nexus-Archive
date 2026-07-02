'use strict';
// copilot/intuition/handlers/greeting.js — greeting / "you there?" fast-path

const GREETING_RE = /^(hi|hello|hey|sup|yo|what's up|good (morning|evening|afternoon))\b/i;
const CONVERSATIONAL_RE = /^(how are you|you there|you online|you awake)\b/i;

async function handle(prompt, lower) {
  if (!GREETING_RE.test(lower) && !CONVERSATIONAL_RE.test(lower)) return null;
  const greets = [
    'Online. What do you need?',
    'Here. What are you working on?',
    'Co-pilot active. Go.',
    'Ready.',
  ];
  return { text: greets[Math.floor(Math.random() * greets.length)],
    modelUsed: 'data-only', intent: 'greeting', source: 'intuition.greeting' };
}

module.exports = { handle };
