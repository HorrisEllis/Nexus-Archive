# nexus-patch-2026-08-12

No `.spec` exists in this export for this to append to (flagged separately,
still open). This file is the ledger entry until one exists — copy it in
when it does.

| shortid | ts | type | shape | context |
|---|---|---|---|---|
| np20260812a | 2026-08-12T03:18Z | fix | registrar.js: idempotency gate | duplicate `realcustomer.com` row found in `state/jaa/domains.json`, `_id:1`/`_id:2`, identical content, no pre-insert check existed |
| np20260812b | 2026-08-12T03:18Z | fix | dns.js + firewall.js + upnp.js: port propagation | `anonymousservers.info` NS records point here; router forwarded ext:53 -> int:53 while dns.js actually bound TCP:5353 / UDP:5354 (mDNS conflict on UDP only) — traced from your real boot log, not reproduced synthetically |

## Root cause this does NOT fix

`anonymousservers.info` itself was never run through `registrar.addDomainToPlatform()` —
only the misspelled `anonymoussservers.info` was, by manual entry (confirmed:
`ui-assets/app.js`'s `addDomain()` posts the form field verbatim, no
transform in the path). That's a data fix, not a code fix — see the two
API calls below, or use the panel's Domains tab directly.

```powershell
Invoke-RestMethod -Method Delete -Uri http://localhost:4007/registrar/domains `
  -ContentType "application/json" -Body '{"domain":"anonymoussservers.info"}'

Invoke-RestMethod -Method Post -Uri http://localhost:4007/registrar/domains `
  -ContentType "application/json" -Body '{"domain":"anonymousservers.info","tenantId":"default"}'
```

## What's verified, and how

- `node --check` clean on all four files.
- Pre-existing suites (`deploy-store`, `dns-zones`, `safe-zip`,
  `setup-orchestrator` — 60 tests, none of which cover these four files)
  still pass unchanged after the edit.
- **Live-booted `node nexus.js up dns firewall` in a sandbox** (no real
  router present) — confirmed real, not asserted:
  - `dns.js` binds, calls `reportPortsToFirewall()`
  - `firewall.js`'s `dns:ports` handler receives it over the real IPC/route
    path (not mocked)
  - the correction call fires exactly once per real port-pair change (fixed
    a duplicate-fire bug found in this same verification pass — first
    version fired twice per boot, harmless but wasteful against a real
    router's UPnP daemon)
  - the actual `AddPortMapping` SOAP call was never reached in this
    sandbox — no UPnP gateway to answer it. That call is UNVERIFIED against
    a real router.

## What to watch for on your real box

After `apply.ps1` + restart, look for in the firewall log:

```
upnp: DNS mapping corrected to real bound ports
```

If instead you see the correction attempt fail while the boot-time pass
for port 80/443/etc. succeeded, the likely cause: some UPnP daemons refuse
a second `AddPortMapping` on an external port that already has a mapping,
even to change the internal port — needs a `DeletePortMapping` first. Not
handled here; tell me and I'll add it rather than guessing blind.

## Files in this patch

```
engines/registrar.js       — idempotency gate on addDomainToPlatform()
engines/dns.js              — reports real bound ports (reportPortsToFirewall)
engines/firewall.js         — consumes them, corrects the UPnP DNS mapping once
engines/components/upnp.js  — addPortMapping/openPorts accept an explicit internal port
```

## Apply

From your `nexus/` root (same folder as `nexus.js`):

```powershell
.\apply.ps1
```

Backs up whatever's currently at each path under `_patch-backups\` before
overwriting — nothing lost, re-runnable.
