spec:
  meta:
    name:        opportunity
    version:     1.0.0
    uuid:        nexus-lib-opportunity-v1-0000-2026-0927-jamesbrooks-001
    status:      active
    since:       0.39.259
    purpose: >
      The job / freelance / lead pipeline. Finds opportunities (public job APIs and any page Clear Glass has open),
      scores them against James's profile with every point explained, drafts cover letters / proposals / Fiverr
      replies from templates he edits, fills applications in Clear Glass, and stops where James decides. James,
      2026-09-27: "do anything you can to help me automate job applications, fiverr, etc. expand it as much as
      possible."

  components:
    - comp_id: nexus.lib.opportunity            # facade: profile, cycle, capture, draft, approve, prepare, submit, followups, status
      path: lib/opportunity/index.js
    - comp_id: nexus.lib.opportunity.stages     # pure: the gated state machine
      path: lib/opportunity/stages.js
    - comp_id: nexus.lib.opportunity.score      # pure: explained scoring + dedupe key
      path: lib/opportunity/score.js
    - comp_id: nexus.lib.opportunity.sources    # 8 source types; normalize* pure
      path: lib/opportunity/sources.js
    - comp_id: nexus.lib.opportunity.answers    # the answer bank + profile rules
      path: lib/opportunity/answers.js
    - comp_id: nexus.lib.opportunity.draft      # editable templates, render (pure), send via copilot resolve
      path: lib/opportunity/draft.js
    - comp_id: nexus.lib.opportunity.apply      # pure: planFill, platform policy, submit/login/confirmation detection
      path: lib/opportunity/apply.js
    - comp_id: nexus.lib.opportunity.store      # JAA tables + ledger
      path: lib/opportunity/store.js
    - comp_id: nexus.agent-tools.opportunity    # nexus.opportunity.tool
      path: lib/agent-tools/tools/opportunity/opportunity.js
    - comp_id: nexus.cli.opportunity
      path: cli/opportunity.js
    - comp_id: copilot.routes.opportunity       # /api/opportunity/* on :3750 + the optional scheduler
      path: copilot/routes/opportunity.js

  stages:
    order: [DISCOVERED, SCORED, SHORTLISTED, DRAFTED, APPROVED, PREPARING, READY, SUBMITTED, RESPONDED, INTERVIEW, OFFER]
    side:  [DISMISSED, NEEDS_LOGIN, NEEDS_INPUT, FAILED, FOLLOW_UP_DUE, REJECTED, ARCHIVED]
    user_only: [APPROVED, OFFER]
    needs_you: [SHORTLISTED, DRAFTED, NEEDS_LOGIN, NEEDS_INPUT, READY, FOLLOW_UP_DUE, INTERVIEW, RESPONDED]

  invariants:
    - APPROVED is by:'user' only. The agent tool refuses approve in code; the HTTP route hard-codes by:'user'.
      autoApproveAbove is James's own policy and is recorded as approvedByPolicy.
    - An agent submits only when approvedBy is 'user' AND policy mode is 'auto' AND (on linkedin.com, indeed.com,
      upwork.com, fiverr.com, freelancer.com) acknowledgeTos is true AND no required field is empty.
    - Nothing is sent to a model that James cannot edit: drafting prompts are templates (opportunity_templates),
      placeholders are data; copilot only picks the backend (GET /api/prompt/resolve).
    - Only an approved answer (approvedBy 'user') is filled automatically; drafted answers are candidates until James
      submits the application that used them.
    - Every transition and action is a row in opportunity_ledger: shortid | ts | type | shape | tags | context | progress.
    - An illegal transition is refused and ledgered (transition.refused), never coerced.
    - A source that returns rows but normalises none is reported as a shape change, not as zero jobs.
    - The CLI flushes the JAA store before exit (writes are debounced 1.5s).

  channels:
    opportunity:  { id: string, dedupeKey: string, source: string, externalId: string, kind: job|gig|brief|lead,
                    title: string, company: string|null, location: string|null, remote: bool|null, url: string,
                    applyUrl: string|null, description: string, salary: {min,max,currency,period}|null, tags: string[],
                    postedAt: iso|null, stage: STAGE, score: 0-100, scoreReasons: [{w,why}], drafts: {kind: {text,at,backend,edited}},
                    fillReport: {planned,generated,open,skipped,unfilledRequired,stepErrors,screenshotBytes}, agentId: string,
                    approvedBy: user|null, retry_count: int, failure_log: [{at,stage,error}], history: [{from,to,by,note,ts}] }
    profile:      { contact, links, headline, summary, resumeText, resumePath, coverLetterPath, skills[], roles[], mustHave[],
                    avoid[], excludeCompanies[], locations[], remoteOnly, minSalary, maxAgeDays, kinds[], eligibility,
                    preferences, experience, autofillProfileId, autoConsent, partition, shortlistAbove, draftTop,
                    followUpDays, draftBackend, voice, sources[], policy{platform|source|default: {mode, acknowledgeTos, autoApproveAbove}},
                    schedule{everyMinutes} }

  sources: [remotive, remoteok, arbeitnow, greenhouse(board), lever(company), ashby(org), hn, rss(url)]

  cli: >
    node cli/opportunity.js status | profile show|set k=v…|import <file> | sources | source add <type> k=v… | policy <key> k=v… |
    cycle [--draft N] | list [STAGE] | show <id> | draft <id> [kind] | edit-draft <id> <kind> <file> | approve <id> |
    dismiss <id> | prepare <id> [--force] | reply <id> | submit <id> | mark <id> <STAGE> | capture [agentId] |
    followups | rescore | answers … | templates … | recipe <host> k=v… | watch --every N

  api: "copilot :3750 — /api/opportunity/{status,profile,import-resume,sources,cycle,rescore,followups,list,capture,answers,templates,recipes/:host,:id,:id/approve,:id/dismiss,:id/draft,:id/draft/:kind,:id/prepare,:id/prepare-reply,:id/submit,:id/mark}"

  failure_modes:
    - login wall → NEEDS_LOGIN, naming the tab (opp-<id>) and partition (persist:opportunity); James logs in once.
    - required fields left empty → NEEDS_INPUT listing them.
    - validation text after submit on the same URL → FAILED with the matched text; retry_count++; 3 → escalated.
    - no submit button → refused with the page's button texts; fix with a recipe submitSelector.
    - no confirmation text after submit → SUBMITTED with submitConfirmed:false (check the tab).

  not_done:
    - The job APIs' field names are from their published shapes; this build environment's egress allowlist blocked
      them, so normalizers are fixture-tested, not live-tested.
    - No live Electron run: prepare/submit are tested against the real page reader in jsdom and a scripted browser.
    - Fiverr/Upwork page selectors are heuristic (largest labelled textarea); recipes let James pin them per host.
    - Email/inbox monitoring for responses is not built — RESPONDED/INTERVIEW/REJECTED are marked by James or an agent.

  tests: tests/modules/test-opportunity.test.js (27)
