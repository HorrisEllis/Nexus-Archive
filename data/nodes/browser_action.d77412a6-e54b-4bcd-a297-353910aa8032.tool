envelope: 1
uuid: nexus-export-tool-browser_action.d77412a6-e54b-4bcd-a297-353910aa8032
type: tool
id: browser_action.d77412a6-e54b-4bcd-a297-353910aa8032
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862039
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862039
lastSeenAt: 1789332862039
fingerprint: null
payload:
  name: browser_action
  description: >-
    Control NEXUS' real browser (Clear Glass) — navigate to a URL, take a screenshot, show a real
    toast notification, read/mutate the DOM, manage cookies, or register a backend URL listener that
    fires a hook on matching traffic. This is a real browser, not a simulation; actions take real
    time and can fail for real reasons (page not loaded, element not found). Params: action
    (required — one of: navigate, navigate_provider, dom_query, dom_mutate, dom_pick, driver_exec,
    cookies_save, cookies_restore, screenshot, get_url, get_title, toast, url_listen, url_unlisten),
    data (object — action-specific: navigate needs {url}, screenshot needs {} (optional {rect} to
    capture a specific region), get_url/get_title need {}, toast needs {msg,
    type?("info"|"error"|"success"|"warn"), durationMs?}, dom_query needs {selector}, dom_mutate
    needs {selector, value}, cookies_save/restore need {agentId}, url_listen needs {pattern, hook,
    agentId?, intercept?, capture?, label?}, url_unlisten needs {listenerId}).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - navigate
          - navigate_provider
          - dom_query
          - dom_mutate
          - dom_pick
          - driver_exec
          - cookies_save
          - cookies_restore
          - screenshot
          - get_url
          - get_title
          - toast
          - url_listen
          - url_unlisten
        description: Which browser action to perform
      data:
        type: object
        description: Action-specific parameters
    required:
      - action
