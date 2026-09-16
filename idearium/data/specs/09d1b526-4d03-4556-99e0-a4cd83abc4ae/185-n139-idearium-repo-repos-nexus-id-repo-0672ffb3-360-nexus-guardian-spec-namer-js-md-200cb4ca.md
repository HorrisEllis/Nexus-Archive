---
chunk_uuid: 200cb4ca-bc94-4578-95bd-0ca3a15e2f64
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-360-nexus-guardian-spec-namer-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/360-nexus-guardian-spec-namer-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-360-nexus-guardian-spec-namer-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-360-nexus-guardian-spec-namer-js-md:200cb4ca
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:19:52.534Z
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