spec:
  meta:
    name:        clear-glass-tab-per-repo-and-ui-expansion
    version:     0.1.0-phasemap
    status:      PHASEMAP 2026-09-22. James: "What if each container gets a
                 dedicated tab, for each repo. Make sure it's all wired in
                 correctly end to end." / "clearglasses ui needs to be built
                 more, almost none of it is here in the index.html file. have
                 been told its been build three times now."
    uuid:        nexus-cg-tabperrepo-ui-v0-0000-2026-0922-001

  diagnosis_verified_2026_09_22:
    tab_per_repo:
      symptom: >-
        Reported alongside "the agent isn't working — creates the job,
        dispatches, gets ack, no completion" (fixed 0.39.212/0.39.213 —
        unrelated root causes, a JAA cross-process staleness bug and a
        silently-swallowed exception). Tab-per-repo is a SEPARATE, real
        proposal, not a symptom of that bug — checked directly, not assumed.
      root_cause: >-
        clear-glass/src/main/index.js's own windows Map IS already keyed by
        agentId (windows.set(agentId, win) — line 2046) — the mechanism
        tab-per-repo needs already exists and is exercised elsewhere (screen-
        qa, autofill both take an explicit agentId). What's missing is
        upstream: lib/repo-agent.js — the module idearium's whole repo-
        compartment agent dispatch goes through — has ZERO references to
        agentId anywhere in the file (grepped directly). Its routeFor()
        resolves to {backend:'guardian', agent: provider}, and guardian's own
        NCP dispatch then picks whichever pre-warmed provider tab happens to
        be live — one shared chatgpt tab, one shared claude tab, system-wide.
        Every repo compartment's "conversation" is a real, separate
        sessionId (sessionIdFor(repoUuid) — already correct, server-side
        history genuinely is per-repo) layered on top of a SHARED browser
        tab per provider. Concurrent dispatches from two repos to the same
        provider interleave through the one tab; nothing is currently
        wrong about this until James works two repos' agents at once, at
        which point they contend for and can visibly interrupt each other
        in the one live tab.
      distinct_from_ui_expansion: >-
        This diagnosis is about DISPATCH ROUTING (which browser tab a
        repo's prompt goes to), not about how many browser WINDOWS exist —
        a "dedicated tab" does not have to mean a permanently open, visible
        window per repo; it can mean a per-repo background tab (clear-glass
        already has this concept — bgTabs, "same chrome as an agent window,
        never shown", clear-glass/src/main/index.js's own background-tabs
        section) that guardian's dispatch targets by a real, repo-derived
        agentId instead of falling through to whatever's live.

    ui_expansion:
      symptom: >-
        "almost none of it is here in the index.html file... told it's been
        built three times." Checked directly, not from memory or changelog
        claims: clear-glass has NO index.html of its own at all — its real
        UI files are renderer/browser.html (514 lines, the main chrome) and
        renderer/settings.html (483 lines). The closest thing to an "index"
        is ui/library/index.html (137 lines + library-app.js 394 lines),
        built THIS session (0.39.207) specifically because it had existed as
        an empty shell with a <script src> pointing at a file that did not
        exist — the exact shape of "claimed built, not actually there" this
        symptom describes. Total real UI code across clear-glass + its two
        satellite pages (library, settings): ~25.4k lines of .js across
        renderer/src, but concentrated almost entirely in ONE file —
        renderer/browser.js is the vast majority of it, a monolith the
        library page was deliberately built OUTSIDE of ("James: 'library
        ui... its own file. no monoliths.'" — already a stated, existing
        principle this phasemap extends, not invents).
      root_cause: >-
        Every clear-glass capability built across this whole session
        (macros, autofill, screen-qa's hotkey/right-click/picker/settings)
        landed as MORE code added to the SAME renderer/browser.js monolith
        (now over the size where "almost none of it is here" reads as true
        for any one capability someone goes looking for — it is there, but
        buried in one enormous file alongside everything else, not in its
        own discoverable place). The one deliberate exception is ui/library,
        already following the "own file, no monoliths" principle. No other
        UI surface (autofill profile management partially lives in
        library's Autofill tab already; screen-qa's settings section lives
        in settings.html; macros' management lives in library) currently
        gets that treatment consistently — this phasemap is about applying
        it as policy, not inventing a new pattern.

    downloads_manager_redundant_record:
      status: >-
        SUBSTANTIALLY ALREADY BUILT, not a gap — checked before phasemapping
        it as one. guardian/lib/response-sink.js's DOWNLOADS sink (wired to
        ncp-handler's completion path this session, 0.39.213) already posts
        every real NCP-dispatched provider response into Clear Glass's
        downloads manager as a durable, independent record — exactly "the
        downloads manager for the provider chats, as a redundant record."
        ui/library's Downloads tab already lists it. What's NOT yet true:
        the standalone library UI doesn't yet surface these as
        provider-CHAT records specifically (it shows them mixed with real
        file downloads) — a real, smaller, separate polish item, not a new
        system. Named here so it isn't silently re-built from scratch.

  governing_principles:
    - "reuse before build — windows Map's agentId keying and lib/repo-agent's sessionIdFor already exist; TR1 wires them together, it does not invent per-repo isolation from nothing."
    - "one implementation, not two — a monolith growing forever is itself a form of duplication (the same concerns re-solved inline each time); UI1 stops that, it doesn't introduce a second UI framework."
    - "nothing silently fails — TR1's dispatch must fail loudly (a named error) if a repo's dedicated tab can't be reached, never silently fall back to the shared one without saying so."
    - "gaps are addressed, not assumed — the downloads-manager item's real, already-built status was verified by reading response-sink.js and its own test file directly before this phasemap claimed anything about it, either way."

  phases:

    TR1_repo_derived_agentId_in_dispatch:
      does: >-
        lib/repo-agent.js's dispatch() gains a real, derived agentId
        (`repo-${repo.uuid}`, matching sessionIdFor's own naming
        convention) and passes it through routeFor()'s guardian path,
        instead of leaving it unset. Guardian's NCP dispatch resolves that
        agentId to a real clear-glass background tab (clear-glass's own
        bgTabs mechanism — "same chrome as an agent window, never shown" —
        already exists for exactly this: a tab that isn't a visible window
        but is a real, isolated browsing context) rather than the shared
        provider tab.
      reuse: "clear-glass's windows/bgTabs Maps (already agentId-keyed), lib/repo-agent's existing sessionIdFor naming."
      gate: "two repos dispatching to the same provider concurrently do not interleave in one tab — verified by a real concurrent-dispatch test, not just code inspection."
      drift: "one tab per repo, kept open indefinitely, is real memory/process cost per open compartment — a cap or idle-close policy is the live tuning surface, not solved by this phase."

    TR2_tab_lifecycle_and_visibility:
      does: >-
        Decide and build the actual lifecycle: does a repo's dedicated tab
        open on first dispatch and stay open, or open-dispatch-close per
        call? Does the person ever SEE it (a real visible window, toggle-
        able like "bring this repo's tab forward"), or does it stay a
        background tab always? This is a real product decision TR1 doesn't
        make on its own — this phase is where James's own answer determines
        the design, not an assumption made here.
      reuse: "clear-glass's existing window show()/hide() and bgTab promotion (already used for 'move to background tab')."
      gate: "a person can find and look at a specific repo's live tab on demand, if TR2's decision says they should be able to."
      drift: "purely a design decision, not a technical unknown — the phasemap defers it rather than guessing."

    UI1_one_file_per_ui_area:
      does: >-
        Extract each real, distinct clear-glass UI capability currently
        living inside renderer/browser.js's monolith into its own file,
        following ui/library's already-established pattern (own HTML/CSS/
        JS, served the same real way, no framework change). Candidates,
        by what's genuinely separable: the Co-pilot panel, the macros run-
        modal + agent-picker, the screen-qa preview/settings UI currently
        split between browser.js and settings.html, the context-menu/
        picker system. Each extraction is verified against real, existing
        behavior (a before/after functional diff), not a rewrite.
      reuse: "ui/library/index.html + library-app.js's own real, working split as the template — not a new pattern invented for this phase."
      gate: "renderer/browser.js's own line count goes DOWN by a real, measured amount per extraction; each extracted UI is independently loadable/testable the way library-app.js already is (jsdom-smoke-testable, proven this session)."
      drift: "how many pieces this splits into, and where the line falls between 'core chrome' (stays in browser.js) and 'a real separable feature' (gets its own file), is the actual design work here — not a fixed number decided in advance."

    UI2_downloads_manager_chat_view:
      does: >-
        ui/library's Downloads tab distinguishes provider-chat records
        (guardian's response-sink DOWNLOADS sink) from real file downloads
        — a real, small filter/label, not a new capture system (already
        built and wired, per diagnosis above).
      reuse: "response-sink.js's existing kind:'chat' field on every record it already writes."
      gate: "a person can filter the Downloads tab to 'provider chats only' and see exactly what response-sink has been recording since 0.39.213."
      drift: "none named — this is the smallest, most mechanical phase here."

  ordering_rationale: >
    TR1 first: it's the concrete, already-diagnosed bug-shaped gap (agentId
    never derived) with an existing mechanism to wire into — the highest-
    confidence, most bounded piece. TR2 second because it needs TR1's real
    behavior in front of James before the lifecycle question can be answered
    for real rather than guessed. UI1 is independent of TR1/TR2 and can run
    in parallel, but is sequenced after because it's the larger, more open-
    ended piece (design judgment on where files split) and benefits from
    not being rushed alongside a dispatch-routing change to the same
    codebase. UI2 last: smallest, lowest-risk, no dependency on the others.

  honest_risks:
    - "TR1/TR2 touch guardian's live dispatch path — the same class of code the 0.39.212/213 fixes just touched. Needs real regression coverage against those fixes specifically, not just new tests for the new behavior."
    - "UI1's file-count is a judgment call, not a formula — over-splitting (one file per tiny widget) recreates the coordination cost monoliths avoid; this phasemap does not pre-decide the granularity."
    - "TR2 is explicitly unresolved — building TR1 without a real answer to TR2 risks either leaking hidden windows or building a toggle nobody asked for."
