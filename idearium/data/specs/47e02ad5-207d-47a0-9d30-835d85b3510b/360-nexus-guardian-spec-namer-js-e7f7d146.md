---
chunk_uuid: e7f7d146-d082-451b-afb1-e252f94b0946
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-guardian-spec-namer-js
title: nexus/guardian/spec-namer.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-guardian-spec-namer-js
contract_id: spec-contract:47e02ad5:nexus-guardian-spec-namer-js:e7f7d146
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:07:20.293Z
---

'use strict';
// spec-namer.js — stub
// Infers filenames from spec content + lang context
// UUID: guardian-spec-namer-stub-v1
function inferFilename(content, lang, jobId) {
  if (!content) return null;
  const extMap = { typescript:'ts', javascript:'js', python:'py', rust:'rs', css:'css',
    html:'html', json:'json', bash:'sh', shell:'sh', sql:'sql', markdown:'md' };
  const ext = extMap[lang] || lang || 'txt';
  const firstLine = content.split('\n')[0].trim();
  const nameMatch = firstLine.match(/(?:\/\/|#|--|<!--)\s*@?file[:\s]+([^\s]+)/i);
  if (nameMatch) return nameMatch[1].endsWith('.' + ext) ? nameMatch[1] : nameMatch[1] + '.' + ext;
  return (jobId ? jobId.slice(0,8) : 'output') + '.' + ext;
}
function inferSpecFilename(content, jobId) {
  if (!content) return null;
  const nameMatch = content.match(/name:\s*([^\n]+)/i);
  if (nameMatch) return nameMatch[1].trim().replace(/\s+/g, '-').toLowerCase() + '.spec';
  return (jobId ? jobId.slice(0,8) : 'spec') + '.spec';
}
module.exports = { inferFilename, inferSpecFilename };