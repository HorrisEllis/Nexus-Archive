# Redactions and exclusions

What the git history deliberately does not contain. The original archives are unchanged.

## Redacted secrets

Key-shaped strings were replaced with `[REDACTED:<type>:<first 8 hex of SHA-256 of the value>]` the first time each file version entered history.

- snap-0011 — guardian/guardian-key.pem (1 x private-key)
- snap-0072 — auth/keys/nexus-private.pem (1 x private-key)
- snap-0091 — auth/keys/nexus-private.pem (1 x private-key)
- snap-0344 — conf/peer/identity.json (1 x private-key)
- snap-0344 — conf/relay/relay.crt (1 x private-key)
- snap-0344 — conf/smtp/dkim/private.key (1 x private-key)
- snap-0344 — conf/tls/acme/account.key (1 x private-key)
- snap-0344 — conf/tls/certs/anonymousservers.info.key (1 x private-key)
- snap-0344 — conf/tls/certs/anonymoussservers.info.crt (1 x private-key)
- snap-0344 — conf/tls/certs/phase5test.local.key (1 x private-key)
- snap-0344 — conf/tls/certs/realcustomer.com.key (1 x private-key)
- snap-0344 — conf/tls/certs/tlstest.local.key (1 x private-key)
- snap-0344 — conf/tls/certs/wildcard.anonymousservers.info.key (1 x private-key)
- snap-0344 — conf/tls/certs/wildcard.anonymoussservers.info.crt (1 x private-key)
- snap-0344 — conf/tls/certs/wildcard.realcustomer.com.key (1 x private-key)
- snap-0668 — tests/modules/test-cookie-vault-jaa.test.js (1 x sk-key)
- snap-0744 — tests/modules/test-nexus-read.test.js (1 x sk-key)
- snap-0761 — tests/modules/test-cookie-vault-jaa.test.js (1 x sk-key)

## Files of 50 MB or more (excluded)

- snap-0132 — cortex/data/baseline-events.ndjson (67 MB)
- snap-0133 — cortex/data/baseline-events.ndjson (67 MB)
- snap-0134 — cortex/data/baseline-events.ndjson (67 MB)
- snap-0135 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0135 — cortex/data/memory_index.jsonl (52 MB)
- snap-0136 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0136 — cortex/data/memory_index.jsonl (52 MB)
- snap-0137 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0137 — cortex/data/memory_index.jsonl (52 MB)
- snap-0138 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0138 — cortex/data/memory_index.jsonl (52 MB)
- snap-0139 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0139 — cortex/data/memory_index.jsonl (52 MB)
- snap-0140 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0140 — cortex/data/memory_index.jsonl (52 MB)
- snap-0140 — nexus-integrated-13/cortex/data/baseline-events.ndjson (81 MB)
- snap-0140 — nexus-integrated-13/cortex/data/memory_index.jsonl (52 MB)
- snap-0140 — nexus-v0_9_8/cortex/data/baseline-events.ndjson (81 MB)
- snap-0140 — nexus-v0_9_8/cortex/data/memory_index.jsonl (52 MB)
- snap-0141 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0141 — cortex/data/memory_index.jsonl (52 MB)
- snap-0142 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0142 — cortex/data/memory_index.jsonl (52 MB)
- snap-0143 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0143 — cortex/data/memory_index.jsonl (52 MB)
- snap-0144 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0144 — cortex/data/memory_index.jsonl (52 MB)
- snap-0145 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0145 — cortex/data/memory_index.jsonl (52 MB)
- snap-0146 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0146 — cortex/data/memory_index.jsonl (52 MB)
- snap-0147 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0147 — cortex/data/memory_index.jsonl (52 MB)
- snap-0148 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0148 — cortex/data/memory_index.jsonl (52 MB)
- snap-0161 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0161 — cortex/data/memory_index.jsonl (52 MB)
- snap-0162 — cortex/data/baseline-events.ndjson (81 MB)
- snap-0162 — cortex/data/memory_index.jsonl (52 MB)
- snap-0170 — cortex/data/baseline-events.ndjson (67 MB)
- snap-0565 — cortex/data/snapshots/07c4277a-a18b-40b7-be81-85cb0f39814f.nex (50 MB)
- snap-0565 — cortex/data/snapshots/0a7b3aec-7705-4852-a2d2-32b1d6ac675f.nex (50 MB)
- snap-0565 — cortex/data/snapshots/3c31e99e-1a8b-41f9-9b48-d8491aca6bc9.nex (50 MB)
- snap-0565 — cortex/data/snapshots/60e82bdc-fa6e-407b-bc25-488b85778834.nex (50 MB)
- snap-0565 — cortex/data/snapshots/75bc3509-e17d-4009-9ab7-da32f363fe8d.nex (50 MB)
- snap-0565 — cortex/data/snapshots/b276901b-6a68-48f4-be02-09209ec77df2.nex (50 MB)
- snap-0565 — cortex/data/snapshots/d8fe24e5-1bb0-45bf-abeb-b8579ee13185.nex (50 MB)
- snap-0565 — cortex/data/snapshots/eae41436-fe82-437b-89ab-0161fc10835c.nex (50 MB)
- snap-0590 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0590 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0591 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0591 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0593 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0593 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0597 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0597 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0598 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0598 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0599 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0599 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0600 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0600 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0601 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0601 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0602 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0602 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0603 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0603 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0604 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0604 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0605 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0605 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0606 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0606 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0607 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0607 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0608 — cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0608 — cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0609 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0609 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0610 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0610 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0611 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0611 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0612 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0612 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0613 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0613 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0614 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0614 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0615 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0615 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0616 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0616 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0617 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0617 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0618 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0618 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0619 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0619 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0620 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0620 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0621 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0621 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0622 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0622 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0623 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0623 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0624 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0624 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0625 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0625 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0626 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0626 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0627 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0627 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0628 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0628 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0629 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0629 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0630 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0630 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0631 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0631 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0632 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0632 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0634 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0634 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0635 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0635 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0636 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0636 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0638 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0638 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0639 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0639 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0640 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0640 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0641 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0641 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0642 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0642 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0643 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0643 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0644 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0644 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0645 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0645 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0646 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0646 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0647 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0647 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0648 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0648 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0649 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0649 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0650 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0650 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0651 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0651 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0652 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0652 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0653 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0653 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0654 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0654 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0655 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0655 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0656 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0656 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0660 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0660 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0661 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0661 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0662 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0662 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0663 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0663 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0664 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0664 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0666 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0666 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0669 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0669 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0670 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0670 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0671 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0671 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0672 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0672 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0673 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0673 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0674 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0674 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0675 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0675 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0678 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0678 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0680 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0680 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)
- snap-0701 — versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)
- snap-0701 — versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)

## Embedded git repositories and node_modules (excluded)

| Snapshot | Archive | .git files | Embedded HEAD | node_modules files |
|---|---|---|---|---|
| 0072 | `nexus-system-8 - 1.zip` | 0 |  | 2563 |
| 0073 | `nexus-system-8 - 2.zip` | 0 |  | 2563 |
| 0074 | `nexus-system-8 - 3.zip` | 0 |  | 2563 |
| 0115 | `nexus-080-v0_8_1-uifix.zip` | 0 |  | 2567 |
| 0116 | `nexus-080-v0_8_1-uifix (1).zip` | 0 |  | 2567 |
| 0223 | `nexus-consolidated__30_-refactored (2).zip` | 0 |  | 8003 |
| 0224 | `nexus-consolidated__31.zip` | 0 |  | 8003 |
| 0228 | `nexus-consolidated__36.zip` | 0 |  | 8003 |
| 0232 | `nexus-consolidated - 1.zip` | 0 |  | 9435 |
| 0242 | `nexus-consolidated-8 - 1.zip` | 0 |  | 17438 |
| 0276 | `nexus-merged-0.9.13.zip` | 1235 | fb8a00dff536db06759f613b6e33e42bc887af6a (master) | 0 |
| 0277 | `nexus-merged-0.9.13 (1).zip` | 1637 | fb8a00dff536db06759f613b6e33e42bc887af6a (master) | 0 |
| 0278 | `nexus-merged-0.9.13 (2).zip` | 1640 | 0cfd7f7ad887c50f0558d083a8f1fe35d87caa3d (master) | 0 |
| 0279 | `nexus-merged-0.9.13 (3).zip` | 1654 | a158a25c9eb15c585dda2c3af6a8646b6b995d29 (master) | 0 |
| 0293 | `nexus-working-memory-v10.zip` | 2238 | 7ef832ab5d6455d9f2928928ac7b46f2ae4a2795 (master) | 0 |
| 0294 | `nexus-working-memory-v13.zip` | 2433 | 33f28a25be24e4bed57c7f11dbad89dbbdecab27 (master) | 0 |
| 0295 | `nexus-working-memory-v13 (1).zip` | 2433 | 33f28a25be24e4bed57c7f11dbad89dbbdecab27 (master) | 0 |
| 0296 | `nexus-working-memory-v15.zip` | 2593 | 8364397baba2c480e92c3cafb600d693017ca3a6 (master) | 0 |
| 0297 | `nexus-working-memory-v16.zip` | 2646 | 054d8241a74bf76821a80b5f641a26b0189109bd (master) | 0 |
| 0298 | `nexus-working-memory-v20.zip` | 2809 | 94cf23800492830033915517a4a864f6037eae69 (master) | 0 |
| 0299 | `nexus-working-memory-v21.zip` | 2850 | 0ba006d2ec707e30b33e3f101e6d2f5a0a7be69f (master) | 0 |
| 0300 | `nexus-working-memory-v24.zip` | 2989 | 37957e880a11d47cd0bbe59e8b4b93b5333e1da1 (master) | 0 |
| 0301 | `nexus-working-memory-v28.zip` | 3247 | 841c3134f59920ceda3cb880a1848b531dcf8ac6 (master) | 0 |
| 0302 | `nexus-working-memory-v30.zip` | 3358 | 0e13d93c9a5afac7263ad9c618e28956f5b2e5f7 (master) | 0 |
| 0303 | `nexus-working-memory-v31.zip` | 3402 | b85ddfeb9a15dd47007de73b08ad84d064814b56 (master) | 0 |
| 0304 | `nexus-working-memory-v34.zip` | 3533 | 7ec60e983d9051a7f0942dab90ee3acf172e86b4 (master) | 0 |
| 0305 | `nexus-working-memory-v36.zip` | 3628 | 763a11b16041b43850c385b590474d29bcb5c7fd (master) | 0 |
| 0306 | `nexus-working-memory-v42.zip` | 3914 | 7a553ed14ed27a823a399c526609c28b2fb56ac7 (master) | 0 |
| 0307 | `nexus-working-memory-v43.zip` | 3958 | b394d7b9cb976db9b9199e2bde5df8aae7f04d3f (master) | 0 |
| 0308 | `nexus-working-memory-v52.zip` | 4476 | a0b6b8227c4ee46e43d74282d21f2a5275d971f1 (master) | 0 |
| 0309 | `nexus-working-memory-v56.zip` | 4664 | dd705ecd255fb332a5431672bcb94f5820ac29c0 (master) | 0 |
| 0310 | `nexus-working-memory-v44.zip` | 4084 | 48a1c1115183df83a0572af7029b521a2487442d (master) | 0 |
| 0311 | `nexus-working-memory-v57 (1).zip` | 4690 | 9c125f342baf7e2bc4faff554accd1dbe627e472 (master) | 0 |
| 0312 | `nexus-working-memory-v57.zip` | 4739 | 0d25259d8f005e2fe47213a99ec72e5790cca7d0 (master) | 0 |
| 0313 | `nexus-working-memory-v57-merged.zip` | 4851 | 4f3dd8734d48f4bab29f2f6e3dd85e0966fa6bcb (master) | 0 |
| 0314 | `nexus-working-memory-v57-merged-1.zip` | 4902 | 6fc273a00788df700632fe8abde35b428cb063ca (master) | 0 |
| 0315 | `nexus-working-memory-v57-merged-2.zip` | 4952 | 7d0bcad8361e29dbb47c914122e975b8dfd42b0b (master) | 0 |
| 0316 | `nexus-working-memory-v59.zip` | 4726 | bed5728193683ba906d668d6899636f08b0c452a (master) | 0 |
| 0317 | `nexus-copilot-omniscience-p1.zip` | 4963 | 2b17979f13130d824f355b36db0f878155582142 (master) | 0 |
| 0318 | `nexus-copilot-omniscience-p2-ready.zip` | 5028 | b97874fc61f01c032f0b126067bb7ad8ad5fe240 (master) | 0 |
| 0319 | `nexus-copilot-omniscience-p1-p3.zip` | 4981 | 6f355327d085637e3028e398b409089e48ea1f60 (master) | 0 |
| 0320 | `nexus-raid-verification-p1-p2.zip` | 5074 | 27eeab0e944dfd2fe5f028d458bb1a158608ca09 (master) | 0 |
| 0321 | `nexus-schema-usermodel-um2.zip` | 5168 | bb075ebebe4b5777db39fc1141e80882642f4129 (master) | 0 |
| 0322 | `nexus-raid-p6-full.zip` | 5214 | 507d8a0b5690875c919ee769c059ff41ebf7f68b (master) | 0 |
| 0323 | `nexus-bridge-complete.zip` | 5260 | 746969a99d9d5fb5079e65f8919b5eca912124ea (master) | 0 |
| 0324 | `nexus-copilot-window.zip` | 5271 | 85b5326734b10c6434b52e39661cf2f81bfff55f (master) | 0 |
| 0325 | `nexus-cli-consolidated.zip` | 5281 | 264edf91d4de5a17f952cb9ed22cd1ed484b4654 (master) | 0 |
| 0326 | `nexus-awareness-routing-complete.zip` | 5361 | 323f5746c9a133e932295c6fe33d255a7910d81e (master) | 0 |
| 0327 | `nexus-observability-phasemap.zip` | 5372 | d6ea9bbc1ad27db2b1e58f253b6692d57f3dc0eb (master) | 0 |
| 0328 | `nexus (1).zip` | 5481 | f2bd28a32efa0443119d66e474e4d485e7f766c2 (master) | 0 |
| 0329 | `nexus-0.20.4.zip` | 5910 | cca9caca1c24531607555fcc9fc69fff798762a7 (master) | 0 |
| 0330 | `nexus (3).zip` | 5706 | 80deb87be15479b8482587fdac17ec1264520ee4 (master) | 0 |
| 0331 | `nexus (4).zip` | 5766 | d6ef3acd907461bac6fe161d97540cb44c5a98d2 (master) | 0 |
| 0332 | `nexus (5).zip` | 5919 | e254b4214f5033a0e94d118222f4fd35d80e1c56 (master) | 0 |
| 0333 | `nexus (8).zip` | 5968 | f0bbab68c2c2f0859b3f57a1b1507682534ba83e (master) | 0 |
| 0334 | `nexus (9).zip` | 5992 | 833e789a6ebd61e13fd2aa5f437d0fee85f87dee (master) | 0 |
| 0335 | `nexus (10).zip` | 6102 | d2c5707b3274386612aec5780a9226ba9bc4ecf2 (master) | 0 |
| 0337 | `nexus (11).zip` | 6293 | 5d611df0578b4e2aece0ac8b0c8e0baea2893b8b (master) | 0 |
| 0338 | `nexus (12).zip` | 6314 | 4362fb63990777d9b1e6bfb4423b5237022f6f74 (master) | 0 |
| 0339 | `nexus (13).zip` | 6367 | 0356999fa7776e3770e39b817c2a9cdab27a2eec (master) | 0 |
| 0340 | `nexus-full-2026-08-08.zip` | 6367 | 0356999fa7776e3770e39b817c2a9cdab27a2eec (master) | 0 |
| 0341 | `nexus-full-2026-08-08-1.zip` | 6407 | 185725ce3e576fe6197514a04c32a07ea142ee67 (master) | 0 |
| 0342 | `nexus-full-2026-08-09.zip` | 6438 | 5b3dd004e5bb407f24cfd21abdf371ff4e25014b (master) | 0 |
| 0343 | `nexus-full-2026-08-11.zip` | 6582 | e161ac21fa6851d92e32bb033cfbf4256e61fd44 (master) | 0 |
| 0345 | `nexus-full-2026-08-12.zip` | 6666 | 091a552123f0965d8b942398466e9a462e12e282 (master) | 0 |
| 0346 | `nexus-full-2026-08-12-final.zip` | 6826 | cc37f21d449a473c46df128d61faec98d07fee3d (master) | 0 |
| 0347 | `nexus-complete-2026-08-12.zip` | 6849 | 6a0dfcb46fc705ec5bb908ffa116d3eb52a38f63 (master) | 0 |
| 0348 | `nexus-complete-2026-08-12-1.zip` | 6849 | 6a0dfcb46fc705ec5bb908ffa116d3eb52a38f63 (master) | 0 |
| 0349 | `nexus-complete-2026-08-12-updated.zip` | 6959 | ece7cfed8f8b629f601e2eaf3762ce696e54c494 (master) | 0 |
| 0350 | `nexus-complete-2026-08-12-final.zip` | 7004 | ea81e3ee084ab65b16f715107c6682021aaab1cb (master) | 0 |
| 0351 | `nexus-complete-2026-08-12-conversations.zip` | 7025 | 2d24d089aad9108ae890f1181f33044e7b232823 (master) | 0 |
| 0352 | `nexus-complete-2026-08-12-console-fix.zip` | 7062 | fd79cdf5234119072f77ac79cd894ab1a5fea147 (master) | 0 |
| 0353 | `nexus-complete-2026-08-13-danglinghook-fix.zip` | 7067 | ac916c1550613792d15d55db61cbb2e68d032475 (master) | 0 |
| 0354 | `nexus-complete-2026-08-13-p4-loom-tab.zip` | 7203 | 9b9d3edf4d798cde404abfd6efc0fc841f8f8d61 (master) | 0 |
| 0355 | `nexus-complete-2026-08-13-p4-complete.zip` | 7212 | 1b58e980a2b2bd7d05671d1a53df6e92094e58dd (master) | 0 |
| 0356 | `nexus-complete-2026-08-13-loom-deferral.zip` | 7222 | dc0c132808f6dcb6a15c8f0fa67c9773c44f37fe (master) | 0 |
| 0358 | `nexus-copilot-routes-2026-08-13.zip` | 7267 | 0f0647e49aaf5ca95e6632c21d3ad6f8aa5ec830 (master) | 0 |
| 0359 | `nexus-2026-08-14.zip` | 7314 | b19e040c6a5c1c4126168321136e6cd0da3840ad (master) | 0 |
| 0360 | `nexus-2026-08-14-1.zip` | 7421 | 51cc66e60f2e22e6fbe4a295823f35b841b0e28f (master) | 0 |
| 0361 | `nexus-2026-08-14-2.zip` | 7429 | fd73b88b7cf32d386d8891a1c350e9b8a4108126 (master) | 0 |
| 0363 | `nexus-2026-08-14-wired-full.zip` | 48 | 8aedd64be4078d61cf5e6870b19c6f97b7c5ee97 (master) | 0 |
| 0364 | `nexus-0.39.5-AM1-AM6-done.zip` | 389 | 539b429b23aaebc9f3c711ef3a0e2bd6b4f09dce (master) | 53 |
| 0365 | `nexus-2026-08-14-3.zip` | 104 | 780d4d7bce10f53326a2b39fe6db654dba348c3b (master) | 0 |
| 0366 | `nexus-2026-08-17-checklist-enforced.zip` | 167 | 49e0a13407df6700c25595733ea220846cb26d23 (master) | 0 |
| 0367 | `nexus-2026-08-17-final.zip` | 178 | 445f4648c1a0c30826c39318660d3ff7f37b590a (master) | 0 |
| 0368 | `nexus - current.zip` | 177 | d1b53702ab3091b922bac3396a8a0e7cdcf246c2 (master) | 0 |
| 0369 | `nexus-2026-08-17-guardian-fix.zip` | 183 | e2e85e315f1706bd7b593454ca3ac0272bb2f5d7 (master) | 0 |
| 0370 | `nexus-2026-08-17-diagnostic-report.zip` | 186 | 52af4cf72dfea6f4e64f10ebe7aa4c513cbb0850 (master) | 0 |
| 0371 | `nexus-2026-08-17-sse-announcements.zip` | 204 | 6f398b38699f6f742e4b257cfe546e315231c7f1 (master) | 0 |
| 0372 | `nexus-2026-08-17-final-1.zip` | 229 | 81729710dd0d473af6112688e49a3d06eb039705 (master) | 0 |
| 0373 | `nexus-2026-08-17-phase-history.zip` | 229 | 81729710dd0d473af6112688e49a3d06eb039705 (master) | 0 |
| 0374 | `nexus-2026-08-17-ledger-wire-person-model.zip` | 201 | e6dae51ecc3f7f49c8bd45fc352341f9cf4ded54 (master) | 0 |
| 0375 | `nexus-2026-08-17-merged-current.zip` | 277 | a46807653f97f0740554fbe7b94b7d2cb116001a (master) | 55 |
| 0376 | `nexus-2026-08-17-ga3-ga9.zip` | 292 | 0392abc7c89a6dadf0f64b10274d2400103395d8 (master) | 55 |
| 0377 | `nexus-2026-08-17-mapped-v2.zip` | 229 | 81729710dd0d473af6112688e49a3d06eb039705 (master) | 0 |
| 0378 | `nexus-2026-08-17-ram-fixes.zip` | 326 | 3b6ab6a8bf7fe5babaae0e68c68ce5432bd36e33 (master) | 55 |
| 0379 | `nexus-2026-08-17-bottom-up-qa.zip` | 330 | 2b12e942a659d78515062f49487683ad841576b4 (master) | 55 |
| 0380 | `nexus-2026-08-17-full-sweep.zip` | 335 | 54b3fa16418a308c0bc3c3dc140da1ff34d2f70e (master) | 55 |
| 0381 | `nexus-2026-08-18-foundation.zip` | 340 | 72e894324c204500582726a38cc83c540a4acef2 (master) | 55 |
| 0382 | `nexus-2026-08-18-intelligence-v2.zip` | 363 | b8ab046e23ba4d63fe93aa515061cbd8f4d894af (master) | 55 |
| 0383 | `nexus-2026-08-18-cross-system.zip` | 368 | d580f9e1ceab3d296848def039eb086c3260e2ce (master) | 55 |
| 0384 | `nexus-2026-08-18-adaptive-threshold.zip` | 373 | c56c726195f845dae8c343608175066b346c4c4a (master) | 55 |
| 0385 | `nexus-2026-08-18-escalation-tools.zip` | 385 | 69f1330d9e469a872675e3392a357358912f8245 (master) | 55 |
| 0386 | `nexus-2026-08-18-self-repair.zip` | 400 | ac8cc525d28e0b6c2ea7b33994c4ae6149ea5681 (master) | 55 |
| 0387 | `nexus-2026-08-18-self-repair-pipeline.zip` | 413 | 97c7c848a90b40ce35de26b6b82ac16d99270fae (master) | 55 |
| 0388 | `nexus-2026-08-18-copilot-tools-default.zip` | 417 | 9013b3693af21f3237eb147ac26afc90ec4f7b22 (master) | 55 |
| 0389 | `nexus-2026-08-18-agent-ids.zip` | 477 | 6e9051cd543e2c70006aa5d0384cd56c23c081cc (master) | 55 |
| 0391 | `nexus-2026-08-18-freeze-thaw.zip` | 493 | 0ea4fc83136dd1c006ac77a864c203bbf6e7b2ba (master) | 55 |
| 0396 | `nexus-2026-08-19-agents-converse.zip` | 567 | cdde8efa4932f2fe2ea522dbc25b949237c26e76 (master) | 55 |
| 0397 | `nexus-2026-08-19-intake-toolconfig.zip` | 610 | 4feafaea6fe70af62935bef36798613a5b5e4ecd (master) | 55 |
| 0398 | `nexus-2026-08-22-sse-leak-fix.zip` | 615 | af5c690838b9aa484278f273cda401a90556052a (master) | 55 |
| 0399 | `nexus-2026-08-22-shutdown-fix.zip` | 621 | a071e5996af98f0bf94f063c6434c653d5844af8 (master) | 55 |
| 0400 | `nexus-2026-08-22-chat-history-fix.zip` | 626 | dee6b9ce0c9bf2d948851bb91226405431027f02 (master) | 55 |
| 0401 | `nexus-2026-08-22-copilot-tools-fix.zip` | 630 | 6d6c1f1f6e853ffe77ffc94c899142b1eded0b0a (master) | 55 |
| 0402 | `nexus-2026-08-22-merged.zip` | 633 | 4a879b24ad46f15f59c041325d65fc138efd5362 (master) | 55 |
| 0403 | `nexus-2026-08-22-merged-1.zip` | 637 | 1518a5e6ea719ad22b39e32bfa7837de937b5f71 (master) | 55 |
| 0404 | `nexus-2026-08-22-current (1).zip` | 827 | 2d3d8073f549de81cf2a896da762586b83570cde (master) | 55 |
| 0405 | `nexus-2026-08-22-wake-relay.zip` | 850 | 682b5f0005a19477badd4444b1e05e8112be390f (master) | 55 |
| 0406 | `nexus-2026-08-22-current (2).zip` | 1043 | 8d7f636bf58ac25678001f8cab83eeabe3819b68 (master) | 55 |
| 0407 | `nexus-2026-08-22-versionium-spec-v2.zip` | 1043 | 8d7f636bf58ac25678001f8cab83eeabe3819b68 (master) | 0 |
| 0408 | `nexus-2026-08-22-step0-logical-clock.zip` | 1043 | 8d7f636bf58ac25678001f8cab83eeabe3819b68 (master) | 0 |
| 0409 | `nexus-migrated.zip` | 0 |  | 55 |
| 0410 | `nexus-migrated-1.zip` | 0 |  | 55 |
| 0412 | `nexus-migrated-2026-08-22-in-progress.zip` | 1047 | 9403b8113e6718331433270ca886238a9f8e8fa4 (master) | 0 |
| 0413 | `nexus-2026-08-22-current.zip` | 1107 | fdf586e33188b7eed43d3aa0caea39ed3c90b313 (master) | 55 |
| 0414 | `nexus-2026-08-22-current-1.zip` | 1270 | e2836f5e87340af14ab600715cc8fd9b98c03d05 (master) | 55 |
| 0415 | `nexus-2026-08-22-current-1-migrated.zip` | 1299 | 4fe7f12944b915581dcbdd0e3c03f588c6374a31 (master) | 55 |
| 0416 | `nexus-2026-08-22-current-1-migrated-1.zip` | 1336 | 2f54b7d0ebb3d8be15b8d019dcb7253dd1c448c3 (master) | 55 |
| 0417 | `nexus-2026-08-22-current-1-migrated-2.zip` | 1353 | 6c267630f2bdf9d1e7b5d834d1428f26716fa5ae (master) | 55 |
| 0418 | `nexus-2026-08-22-current-1-migrated-3.zip` | 1382 | 9b8671f8b042b153d6c0075c89c0040bfc86a67a (master) | 55 |
| 0419 | `nexus-2026-08-23-merged.zip` | 1440 | 5a0eaef92e7e6d51f24f66219c00f23a1fea2a42 (master) | 0 |
| 0420 | `nexus-2026-08-22-current-1-migrated-4.zip` | 1426 | 8fd9a096db268dbe8573ece9b4f112dd8a6d2720 (master) | 55 |
| 0421 | `nexus-2026-08-22-current-1-migrated-6.zip` | 1524 | 16320216dfae4b7ad4407d7784dac082a696fc05 (master) | 55 |
| 0422 | `nexus-2026-08-22-current-1-migrated-7.zip` | 1548 | 82feaa4ecce12cb5af53295f744f88543d24058d (master) | 55 |
| 0423 | `nexus-2026-08-23-current.zip` | 1696 | b4e842ca12c64573a0b181cd91e98e5b9279770a (master) | 55 |
| 0424 | `nexus-2026-08-23-current-updated.zip` | 1708 | 34148ec47f617fae9673aae8156ed011595024d4 (master) | 55 |
| 0425 | `nexus-2026-08-23-phase3-complete.zip` | 0 |  | 8175 |
| 0426 | `nexus-2026-08-23-current (1).zip` | 1788 | 924196a9001b69a8bbbab2fdb23b6fe3e5a0967b (master) | 55 |
| 0430 | `nexus-2026-08-23-current (2).zip` | 1891 | 7c284eccc02bc94f70fba939b06dc57940dbf053 (master) | 55 |
| 0431 | `nexus-2026-08-23-current (5).zip` | 1891 | 7c284eccc02bc94f70fba939b06dc57940dbf053 (master) | 55 |
| 0432 | `nexus-2026-08-24-handoff.zip` | 1905 | 16c0fba3d2b32c85f87e0494666575ff54b1efbf (master) | 55 |
| 0433 | `nexus-2026-08-24-handoff (1).zip` | 1956 | cbb799a0dad4f7c5ccb9319345d2177ad9ca69a4 (master) | 0 |
| 0434 | `nexus-2026-08-24-handoff (2).zip` | 2095 | 7e418e1891c2d554f0bd6ebd2b573dc56c52cd39 (master) | 0 |
| 0435 | `nexus-2026-08-24-handoff (3).zip` | 2122 | 6a9b87007576189d54ac4e1c94c79be15daeedcb (master) | 0 |
| 0436 | `nexus-2026-08-24-handoff (4).zip` | 2128 | d8e9507d368d2c33a02ec9e0be8bf94579e80f58 (master) | 0 |
| 0437 | `nexus-2026-08-24-handoff (5).zip` | 2145 | 7e925f855812bf991687af096a34f905184378ae (master) | 0 |
| 0438 | `nexus-2026-08-24-handoff-updated.zip` | 2182 | baf48be9be81848a7520eebc8c05acf880a80346 (master) | 0 |
| 0439 | `nexus-2026-08-24-handoff-updated-1.zip` | 2190 | 01b1c1af89df1ee765e48b2c08df565ceac45ab4 (master) | 0 |
| 0440 | `nexus-2026-08-27-handoff.zip` | 2205 | 7d6493596241b8f8a8f19035571bce4bf94c27f3 (master) | 0 |
| 0441 | `nexus-2026-08-27-handoff-1.zip` | 2250 | 1a06d8e78c5ddae516bea1de421791774d634215 (master) | 0 |
| 0442 | `nexus-2026-08-27-handoff-2.zip` | 2261 | 8c60ad93fc67095753a40ff54fc7d15ccef72cd1 (master) | 0 |
| 0443 | `nexus-2026-08-27-handoff-5.zip` | 2265 | 8e916fe316836d3b7d34cfa1429dc71fe40ebe18 (master) | 0 |
| 0444 | `nexus-2026-08-27-handoff-6.zip` | 2269 | f34282ca536ed5b3f7d8ca3f0cd40dabf02cf039 (master) | 0 |
| 0445 | `nexus-2026-08-28-handoff.zip` | 2339 | b9a120cfdbd8baa8fa2789a9a2a5ce15d3bb4579 (master) | 0 |
| 0446 | `nexus-v0.39.0.zip` | 2344 | 5d50b38b9e8084f3a21eeb76ee49720cab37cd50 (master) | 0 |
| 0447 | `nexus-v0.39.0-1.zip` | 2352 | 28fc66cf42bbf454cb90d58801390f5000f2644e (master) | 0 |
| 0448 | `nexus-0.39.1.zip` | 2404 | d22493b5d93be13c4fff1cfe46c2bcf7a79ff9fe (master) | 0 |
| 0449 | `nexus-v0.39.1.zip` | 2428 | 759f4adc498f39894bb95f2f731cf7133b0e9ae1 (master) | 0 |
| 0450 | `nexus-v0.39.2.zip` | 2433 | 943b26b17517396902808a9c54d8aedf574f885d (master) | 0 |
| 0451 | `nexus-0.39.4.zip` | 2467 | 23c67460cfd01b4dc30811103c60a0e10311f52e (master) | 0 |
| 0453 | `nexus-v0.39.8.zip` | 2493 | 7ef06512cb331dec0e018f75445d6bf2984ecadf (master) | 0 |
| 0454 | `nexus-0.39.10.zip` | 2517 | 869058591d2b1b0cfded0af0cec41ea0d2954f4d (master) | 0 |
| 0455 | `nexus-v0.39.12.zip` | 2541 | 5861efcb92fad908e308df0ed4e2b14fd3987734 (master) | 0 |
| 0456 | `nexus-v0.39.15.zip` | 2618 | d123f5baca1d91991eb9e517edb425e3f092d69a (master) | 0 |
| 0457 | `nexus-v0.39.15-1.zip` | 2625 | b8b3e3d7a349865be39c1826f93779c6146e5af3 (master) | 0 |
| 0458 | `nexus-0.39.16.zip` | 2635 | 6c6c0c55f0d312a60fa19e418661f428a2b1612d (master) | 0 |
| 0459 | `nexus-0.39.21.zip` | 2682 | f55866a349066acffa0969378b795b502e0f0f04 (master) | 0 |
| 0460 | `nexus-0_39_21-updated.zip` | 2682 | f55866a349066acffa0969378b795b502e0f0f04 (master) | 39 |
| 0461 | `nexus-v0.39.23.zip` | 2821 | a464d8f8d69cd59c6cadf30e106a9cc03629df89 (master) | 0 |
| 0462 | `nexus-0.39.37.zip` | 2809 | 790e17d1551b527727ba622b5ccf844b4ee674a5 (master) | 0 |
| 0463 | `nexus-v0.39.38.zip` | 2891 | 017201377ffe65283c4be5341253db9fde1d209a (master) | 0 |
| 0464 | `nexus-v0.39.38-d.zip` | 2964 | 89269470b891cda17fa9fe6947f7cc56c761e7d7 (master) | 0 |
| 0465 | `nexus-v0.39.38-f.zip` | 2974 | 7da8ff8ef7c57123a95d81fe8b920908b5d9c417 (master) | 0 |
| 0466 | `nexus-v0.39.38-g.zip` | 2983 | 02c75a4a615909748b6668f4ea292caf2fce8d51 (master) | 0 |
| 0467 | `nexus-v0.39.38-h.zip` | 2990 | a05630e992039ced9cc258f566429a9b15797868 (master) | 0 |
| 0468 | `nexus-v0.39.38-i.zip` | 3009 | 1d0a2de00e5132c6017d59b7cc45e7e713deb86c (master) | 0 |
| 0469 | `nexus-v0.39.38-j.zip` | 3077 | 796b8438f8fa2c337ef0c2e84056871b816c1c8f (master) | 0 |
| 0470 | `nexus-v0_39_38-k.zip` | 3096 | 171b428b7757f701b40d7b1c686f4f69b770d83d (master) | 0 |
| 0471 | `nexus-v0_39_38-m.zip` | 3134 | 65476c9d2e6ea6584499d2e7b57a1b1241321172 (master) | 0 |
| 0474 | `nexus-v0_39_38-m-fixed.zip` | 3145 | c258cf7fff26c75d9b6ad6e8da9450c0b594b764 (master) | 0 |
| 0475 | `nexus-v0_39_38-m-fixed (2).zip` | 3145 | c258cf7fff26c75d9b6ad6e8da9450c0b594b764 (master) | 39 |
| 0476 | `nexus-v0_39_38-o.zip` | 3201 | ba8f2519fff84af7fabddb57878327f08b1fc38d (master) | 0 |
| 0477 | `nexus-v0_39_38-p.zip` | 3225 | 6ae0e8f9e377c02726ca55bf165a6ef99d82c0c1 (master) | 0 |
| 0478 | `nexus-v0_39_38-r.zip` | 3291 | e549975fa1f440ea5b478825a61b191d61742369 (master) | 0 |
| 0479 | `nexus-v0_39_38-s.zip` | 3296 | f5d98cc66cc62212adbd416468dfdbd72a30adda (master) | 0 |
| 0480 | `nexus-v0_39_38-w.zip` | 3372 | e27acef5d859113283c27286db1200c596254d2e (master) | 0 |
| 0481 | `nexus-merged.zip` | 3402 | 37229770f96322be64a245ae11f05717191368cc (master) | 0 |
| 0482 | `Nexus v0.39.39.zip` | 3418 | 159d364608cc8f956363782b1bb3c9b013e71355 (master) | 0 |
| 0483 | `nexus-v0_39_43.zip` | 3499 | 16f512e95051bb1c6281a60102cf08dd308ae1b4 (master) | 0 |
| 0486 | `nexus-v0_39_46-leading-token-match (2).zip` | 3499 | 16f512e95051bb1c6281a60102cf08dd308ae1b4 (master) | 39 |
| 0487 | `nexus-v0_39_46-handoff.zip` | 3548 | 827a72f19915c5fe28d6208e01aef6db973fbb22 (master) | 0 |
| 0488 | `nexus.zip` | 3605 | 60465c79913ed4387ae82e3050d619c02f15704e (master) | 0 |
| 0490 | `nexus-merged-with-git.zip` | 3605 | 60465c79913ed4387ae82e3050d619c02f15704e (master) | 53 |
| 0491 | `nexus-merged-with-git-1.zip` | 3605 | 60465c79913ed4387ae82e3050d619c02f15704e (master) | 53 |
| 0492 | `nexus-merged-with-git-2.zip` | 3605 | 60465c79913ed4387ae82e3050d619c02f15704e (master) | 53 |
| 0494 | `nexus-full-3.3.0.zip` | 3907 | 7ea8b496e18de9b1a4579451913419112765c8c1 (master) | 39 |
| 0495 | `nexus-v0.39.47.zip` | 3911 | 0827333602d476799024c9b957bb73bef8259d58 (master) | 39 |
| 0496 | `nexus-merged-with-git-history.zip` | 3978 | c730bbdb30231f433f7efbbc99617d38b12fb5aa (master) | 55 |
| 0497 | `nexus-v0_39_46-merge-safety.zip` | 3645 | f66c6f434bd997c38ccef6de34109805a2767ee8 (master) | 0 |
| 0498 | `nexus-v0.39.48.zip` | 4043 | 906b6c56ebeed992a7b131d53eab0d2af8fad8c3 (master) | 55 |
| 0499 | `nexus-v0.39.49.zip` | 4054 | 4b8248c0278299107cb48e8b469f0448407d142f (master) | 55 |
| 0500 | `nexus-v0_39_49-chatlog-fix.zip` | 4064 | d66cfb6fcaab702a36ab683580a38c9e0e5910da (master) | 0 |
| 0501 | `nexus-v0.39.50.zip` | 4101 | 60656ad6cafc09303bf0110240514ee96bfe4a08 (master) | 0 |
| 0502 | `nexus-v0.39.50 (2).zip` | 4105 | 630ea01f92ef1d695073e1d4107e11dd186c1b03 (master) | 0 |
| 0503 | `nexus-v0.39.51.zip` | 4126 | c086065486c9635e2709d350a8acc97442d24e2a (master) | 0 |
| 0504 | `nexus-merged-wired-with-git-history.zip` | 4008 | 6f317b8583242826797a253866ef33915e7663ec (master) | 55 |
| 0505 | `nexus-v0.39.51-1.zip` | 4186 | 3cfb330f3d6ef57b0fed3ae0a6b2da7d4bf04ab7 (master) | 0 |
| 0506 | `nexus-v0.39.51-2.zip` | 4219 | 6ece3181e270d7079892a609fea37e02d2295980 (master) | 0 |
| 0508 | `nexus-v0.39.52.zip` | 4243 | 18311db2128f82752e6b715023c07213367c88f3 (master) | 0 |
| 0509 | `nexus-v0_39_52-consolidated.zip` | 4243 | 18311db2128f82752e6b715023c07213367c88f3 (master) | 0 |
| 0511 | `nexus-full-2026-09-06.zip` | 4243 | 18311db2128f82752e6b715023c07213367c88f3 (master) | 39 |
| 0512 | `nexus-v0_39_53.zip` | 4243 | 18311db2128f82752e6b715023c07213367c88f3 (master) | 39 |
| 0513 | `nexus-v0.39.53.zip` | 4301 | 2e6f93f5bfb273bea20852b6970d3e003366745c (master) | 0 |
| 0514 | `nexus-v0_39_57.zip` | 4243 | 18311db2128f82752e6b715023c07213367c88f3 (master) | 39 |
| 0515 | `nexus-v0.39.55.zip` | 4367 | c2536aa9f9484ee55c24ae820e592e1d6f77f57f (master) | 0 |
| 0516 | `nexus-v0_39_59-merged.zip` | 4428 | 509731d8849c490794278457d6403b46b95fdfa6 (master) | 0 |
| 0517 | `nexus-v0_39_60.zip` | 4442 | fdeeec38945e220f7d3ad3adc46941ab2bb4cb6c (master) | 0 |
| 0518 | `nexus-v0.39.61.zip` | 4453 | bb4adb19db68566b17e85f855c4bc710cf335e42 (master) | 0 |
| 0519 | `nexus-v0.39.62.zip` | 4502 | d1b46c6e750d380058dfd0ac30c81e2290434cd0 (master) | 0 |
| 0520 | `nexus-v0_39_63.zip` | 4524 | 3e0edf9132b4483743845c51bbc4177583cd1cc8 (master) | 0 |
| 0521 | `nexus-v0_39_64.zip` | 4537 | 21eeee95cd950dce8d9f0cac6552fb2e60c0acba (master) | 0 |
| 0522 | `nexus-v0.39.65.zip` | 4566 | f86c0ed0fd16563483186b763360849cef6e40ea (master) | 0 |
| 0523 | `nexus-v0.39.66.zip` | 4600 | a56a4d33fd9cf546b3cf2d58d1df89171a576823 (master) | 0 |
| 0524 | `nexus-v0_39_67.zip` | 4618 | 7c5365059431d88013b6689d179ad23584504d93 (master) | 0 |
| 0525 | `nexus-v0_39_68.zip` | 4632 | 0dd2b05fad12724a29fb9f99cb618f7406c05136 (master) | 0 |
| 0526 | `nexus-v0.39.68.zip` | 4638 | fb769699867364ad88a88fadad5cd463b90b561e (master) | 0 |
| 0527 | `nexus-v0.39.69.zip` | 4654 | 45b4b863134b6e966eceea71257da405bb8c7be1 (master) | 0 |
| 0528 | `nexus-v0.39.73.zip` | 4940 | cb644b7f97270bd2e529c618e0f92a1ca7107005 (master) | 0 |
| 0531 | `nexus-v0.39.75.zip` | 5014 | 05fd02d5c9414dbce82799fabb39f085e7a7e9b5 (master) | 0 |
| 0532 | `nexus-v0_39_75-merged.zip` | 5024 | 9418a6cdfd27deef8daa2a4f7b0486469324d12a (master) | 0 |
| 0533 | `nexus-v0_39_75-merged-1.zip` | 5050 | 31f24c6a77eb4916b51377db8deca10c530476d3 (master) | 0 |
| 0534 | `nexus-v0_39_76.zip` | 5083 | b96dd64156cf59f62976a92499c07055a376ac4e (master) | 53 |
| 0535 | `nexus-v0_39_77.zip` | 5136 | 93134df089c8ec7b8b19533242a3c1dc11629c1d (master) | 53 |
| 0536 | `nexus-v0_39_78.zip` | 5161 | a9c567ec3c5d1337e203f3280de7c78c93e27005 (master) | 53 |
| 0537 | `nexus-v0_39_79.zip` | 5172 | 627af2764d867df9de203f01d9a7b4c1377ae246 (master) | 53 |
| 0538 | `nexus-v0_39_81 - Copy.zip` | 0 |  | 53 |
| 0539 | `nexus-v0_39_81.zip` | 5223 | 501aa552cae1a246dab5a5834a874dd7933a1fb5 (master) | 53 |
| 0540 | `nexus-v0_39_83.zip` | 5247 | 73ad8d5b37b3c31fe2cada9efc54e9054cab7c46 (master) | 53 |
| 0541 | `nexus-v0_39_84.zip` | 5285 | 0ee477fe4e0cba972b12671cfa250f8519e10a3b (master) | 53 |
| 0542 | `nexus-v0.39.83.zip` | 5253 | 729733d8dad9d45b836db2e71feafa3ab1efa473 (master) | 53 |
| 0543 | `nexus-v0_39_84-1.zip` | 5293 | c20702354d38f53b7b0ebebf2c7e2efc61e2c185 (master) | 53 |
| 0544 | `nexus-v0_39_84-fixed.zip` | 5293 | c20702354d38f53b7b0ebebf2c7e2efc61e2c185 (master) | 53 |
| 0545 | `nexus-v0_39_84-fixed-1.zip` | 5293 | c20702354d38f53b7b0ebebf2c7e2efc61e2c185 (master) | 53 |
| 0547 | `nexus-v0_39_89.zip` | 5429 | d2aa84d7eccf31f53f660a470f9309bec6bacc25 (master) | 53 |
| 0548 | `nexus-v0_39_91.zip` | 5457 | b6c3a7bfd50f27515024ce71922740e7e80674db (master) | 53 |
| 0549 | `nexus_v0_39_93.zip` | 5495 | f4d7d30ff7b9b93f9e5290fd932e75a882578700 (master) | 39 |
| 0550 | `nexus_v0_39_94.zip` | 5506 | 6ce7273c9dbf559c47433daa4408a08716af2c2e (master) | 39 |
| 0551 | `nexus_v0_39_95.zip` | 5514 | 597b2ddbeaac1c719bfaf9914e7a774cd5fcacb4 (master) | 39 |
| 0552 | `nexus_v0_39_98.zip` | 5563 | b72cab5ba5ed07326bddffc2b021f827a6a33a7f (master) | 39 |
| 0553 | `nexus_v0_39_98_reorg-final.zip` | 5738 | b0a5c1e6366effdd1d5c90ea0be0f533c1b7cadd (master) | 0 |
| 0555 | `nexus-v0_39_112-updated.zip` | 5752 | cb91b415574cb7953d1b239bbc5afc0295689429 (master) | 16 |
| 0558 | `nexus-handoff.zip` | 5752 | cb91b415574cb7953d1b239bbc5afc0295689429 (master) | 0 |
| 0559 | `nexus-v0.39.113-merged.zip` | 0 |  | 53 |
| 0560 | `nexus-v0.39.113-nodes-built.zip` | 6124 | 9f14b69dea80e5a96a08d569a9c78609b9e9535f (master) | 53 |
| 0561 | `nexus-v0.39.113-memory-migrated.zip` | 6124 | 9f14b69dea80e5a96a08d569a9c78609b9e9535f (master) | 53 |
| 0562 | `nexus-v0.39.116-failure-mode-forensics.zip` | 6186 | 7fe8ee3130bd8386c32fad59e212b9a03e49bb98 (master) | 53 |
| 0563 | `nexus-v0.39.119-ping-gate.zip` | 6237 | 98943d9b08581703382e1fe5b8a8ec3fc012e1ee (master) | 53 |
| 0564 | `nexus-v0.39.121-pollution-fix.zip` | 6269 | ee344d6e0a4feaf93df34a3b646ce6851f0376bb (master) | 53 |
| 0565 | `nexus-v0_39_126.zip` | 6363 | f359f2a96ee50879528b45f08f361a247f888372 (master) | 53 |
| 0566 | `nexus-v0.39.130-mco0-6.zip` | 6479 | 84bd3990f7ada4b85c8e529715423a2305ae4f12 (master) | 53 |
| 0567 | `nexus-v0_39_130-mco0-8.zip` | 6497 | 810790fab8f4d9dd9bb18b2bd7813a5bc73d36f7 (master) | 53 |
| 0568 | `nexus-v0_39_130-phase6.zip` | 6497 | 810790fab8f4d9dd9bb18b2bd7813a5bc73d36f7 (master) | 0 |
| 0569 | `nexus-v0_39_131-track-d.zip` | 6497 | 810790fab8f4d9dd9bb18b2bd7813a5bc73d36f7 (master) | 0 |
| 0570 | `nexus-v0_39_134-mco15-track-c.zip` | 6497 | 810790fab8f4d9dd9bb18b2bd7813a5bc73d36f7 (master) | 0 |
| 0571 | `nexus-v0_39_138-FINAL.zip` | 6497 | 810790fab8f4d9dd9bb18b2bd7813a5bc73d36f7 (master) | 0 |
| 0572 | `nexus-v0_39_138-idearium-wired.zip` | 6512 | c0910326aca66c61c42fc443d0f9376d80009aa1 (master) | 0 |
| 0573 | `nexus-v0_39_137-mco19-clearglass.zip` | 6497 | 810790fab8f4d9dd9bb18b2bd7813a5bc73d36f7 (master) | 0 |
| 0574 | `nexus-v0_39_134-mco-track-c-session.zip` | 6738 | bddfb954870d0d8ee5de01974e6c86ab94ff0e55 (master) | 53 |
| 0575 | `nexus-v0_39_134-mco-track-c-session-updated.zip` | 6753 | 4f7e79b7d76f8370217b79de207d52017aad2b15 (master) | 53 |
| 0578 | `nexus-v0_39_135-session.zip` | 6776 | d0daec39322ea3de2c8456095ad1a082f276f8b6 (master) | 53 |
| 0579 | `nexus-guardian-abandoned-fix.zip` | 6776 | d0daec39322ea3de2c8456095ad1a082f276f8b6 (master) | 53 |
| 0580 | `nexus-guardian-phase0-4-integrated.zip` | 0 |  | 53 |
| 0581 | `nexus-v0_39_138-idearium-wired-1-1.zip` | 6512 | c0910326aca66c61c42fc443d0f9376d80009aa1 (master) | 0 |
| 0583 | `nexus-v0_39_139-idearium-repo-delete.zip` | 6512 | c0910326aca66c61c42fc443d0f9376d80009aa1 (master) | 0 |
| 0587 | `Nexus_v0_39_139-integrated.zip` | 6548 | a802e49289e9d45fbaf20c6c2ba50f0d4f021e6a (main) | 55 |
| 0590 | `Nexus_0_39_142-1.zip` | 7747 | 45f0a115c34389d2563df5f5d3a43c9c21a7a94d (master) | 278 |
| 0591 | `Nexus_0_39_142-fixed.zip` | 7757 | 7f6b021c6d3189c88091dfe24a5f6a7a6788056e (master) | 278 |
| 0593 | `Nexus_0_39_142-specs-in-docs.zip` | 7757 | 7f6b021c6d3189c88091dfe24a5f6a7a6788056e (master) | 278 |
| 0596 | `nexus-wired.zip` | 7757 | 7f6b021c6d3189c88091dfe24a5f6a7a6788056e (master) | 0 |
| 0597 | `nexus-wired-1.zip` | 7757 | 7f6b021c6d3189c88091dfe24a5f6a7a6788056e (master) | 0 |
| 0598 | `Nexus_0_39_142.zip` | 7776 | 145791cf033c9ee1126c0080db4b36d5f89344c3 (master) | 278 |
| 0599 | `Nexus_0_39_143.zip` | 7879 | cf33429beb3510785fa1ceecd1faa9d5928aebe4 (master) | 276 |
| 0602 | `nexus-v0_39_149.zip` | 61 | 5678c11e06ff088daf367a3c21acf02344126693 (master) | 0 |
| 0603 | `Nexus v0.39.149.zip` | 61 | 5678c11e06ff088daf367a3c21acf02344126693 (master) | 0 |
| 0604 | `Nexus v0.39.147.zip` | 4386 | debf424e7712ed2695604c729d0c53b40f64c3c0 (master) | 276 |
| 0605 | `nexus-v0_39_150-unified.zip` | 4434 | 6a8faac1a662ca363508b8a5e91f87dbdf0ef8d1 (master) | 0 |
| 0606 | `nexus-v0_39_150-unified-2.zip` | 4443 | 18757c6b22cdf7b90b826d5526cf7da44b28b245 (master) | 0 |
| 0607 | `Nexus v0.39.151.zip` | 4623 | 0e32204ee785ec75937a361d8b6ca969fa2d6db9 (master) | 0 |
| 0608 | `nexus-v0_39_152.zip` | 4675 | d61d833a1fdd8bfd336e75c6ea80876f7d668a48 (master) | 276 |
| 0609 | `Nexus_v0_39_153.zip` | 5437 | 87edf489749c6895ec57c0040eb44900d2283672 (master) | 260 |
| 0610 | `Nexus_v0_39_153_patched.zip` | 5437 | 87edf489749c6895ec57c0040eb44900d2283672 (master) | 260 |
| 0611 | `Nexus_v0_39_153_patched-1.zip` | 5437 | 87edf489749c6895ec57c0040eb44900d2283672 (master) | 260 |
| 0612 | `nexus-v0_39_154.zip` | 4671 | 572ed6598c1d03cf9df994541992f8cb2c719d98 (master) | 0 |
| 0613 | `nexus-v0_39_155.zip` | 4747 | 39bfc9bc5dbb4af64ee2b0add2bc43234c4ed582 (master) | 0 |
| 0614 | `nexus-v0_39_156.zip` | 4790 | cb174730009d8e0ced1739fbd95b0f5175bed5f3 (master) | 0 |
| 0615 | `nexus-v0_39_162.zip` | 4990 | 62f31c9ce8543a986fde9c47eb9caa4405564193 (master) | 0 |
| 0616 | `nexus-v0_39_163-1.zip` | 4997 | 62f31c9ce8543a986fde9c47eb9caa4405564193 (master) | 0 |
| 0617 | `Nexus v0.39.164.zip` | 5248 | 186d5d11e22ae8876f9b54e0b564db62b2d7f066 (master) | 256 |
| 0618 | `Nexus_v0_39_170.zip` | 5284 | 3b1929430e07b7a960876bd9f4ef041fe31a9910 (master) | 256 |
| 0619 | `Nexus v0.39.171.zip` | 5296 | d21b7edefbb15c865198691497577f4370f9ac83 (master) | 256 |
| 0620 | `nexus_v0.39.172.zip` | 5468 | babc971794413721a78fa509a3b492559a3090c7 (master) | 256 |
| 0621 | `nexus_v0.39.173.zip` | 5481 | 5774cf483ebcd4585f80d3d86a7b9875d257ab86 (master) | 256 |
| 0622 | `Nexus_v0_39_178.zip` | 5632 | 070535f9c77f695b3f387de3907f37382f11be45 (master) | 256 |
| 0623 | `Nexus_v0_39_179.zip` | 5666 | 0195cd5842762b141a948b28c6e964dcafecac5a (master) | 256 |
| 0624 | `Nexus_v0_39_180.zip` | 5673 | b15f03a5bf3fde9f90442572b79cafb1b2168867 (master) | 256 |
| 0625 | `nexus_v0.39.181.zip` | 5694 | 56cdb0f8ef628519253c9a5c94812d9918e72acc (master) | 256 |
| 0626 | `nexus_v0.39.182.zip` | 5706 | f711ab0107d18dbfbbe74d335a8c0087e8e9369f (master) | 256 |
| 0627 | `nexus_v0.39.184.zip` | 5726 | d3e509b4c611fd5ccdd134afb8f46a1bc2b46138 (master) | 256 |
| 0628 | `nexus_v0.39.186.zip` | 5745 | 6106e28f9674e38207ad0cef0382107cb00de7d4 (master) | 256 |
| 0629 | `nexus_v0.39.187.zip` | 5754 | 64cf40700523c770f7cb17214edd2baaa2869180 (master) | 256 |
| 0630 | `nexus_v0_39_188.zip` | 5784 | 6d95acfec14d52a5058853f87f34524f16a43362 (master) | 0 |
| 0631 | `nexus_v0_39_189.zip` | 5805 | 822fa9d7bb1e699187d9d83bbf1661ac99be73dc (master) | 0 |
| 0632 | `Nexus_v0_39_194.zip` | 5933 | 475a67b572a4a4e6a05bfe353c5cf050fb7a6030 (master) | 0 |
| 0634 | `Nexus_v0_39_196.zip` | 5969 | cf0a815ad5e459e52c672686e9d9239188b6e5cd (master) | 0 |
| 0635 | `Nexus_v0_39_199.zip` | 6049 | 8001e2d7361ab7279285ed6c067dc7ebab639e27 (master) | 0 |
| 0636 | `Nexus_v0_39_203.zip` | 6151 | a4f9bfb7bfc06ba1f31e51d608f7de55f287a14b (master) | 0 |
| 0638 | `Nexus_v0_39_204.zip` | 6173 | 278063e48d863b7b3ca2ef5516af7f4fdc740d44 (master) | 256 |
| 0639 | `Nexus_v0_39_206.zip` | 6203 | 596554cef91205717f9a0ebc99f3d296361c96fa (master) | 256 |
| 0640 | `Nexus_v0_39_210.zip` | 137 | a4ee01a7a8ae5ffe035d9c7bdb4d7788edaba459 (master) | 256 |
| 0641 | `Nexus_v0_39_212.zip` | 191 | f872cf0560b9c4078441e496205d97209875d0d9 (master) | 256 |
| 0642 | `Nexus_v0_39_213.zip` | 213 | 05f31c7bb2b4f67633d8ea2b9a92e254c8a31ef9 (master) | 256 |
| 0643 | `Nexus_v0_39_214.zip` | 228 | 3c2609687991caa136fa07f654a18fbea053cbc3 (master) | 256 |
| 0644 | `Nexus_v0_39_214_patched.zip` | 279 | 838d3c8a6e81a094da3f803367c0ba64823bd67e (master) | 256 |
| 0645 | `nexus-1.zip` | 304 | 4c9ff136161c511475ccd1a3ff645195efe8b927 (master) | 0 |
| 0646 | `nexus-2.zip` | 309 | 2628bb70f62e453262c8c85e8f3188a8903ff1c4 (master) | 0 |
| 0647 | `nexus-an1.zip` | 320 | c8df70ce6b29723bec0758180eae447d3450a34b (master) | 0 |
| 0648 | `Nexus_v0_39_214_patched-1.zip` | 292 | 439fc8af5424b6350163e103f31e13c6d2055ff3 (master) | 256 |
| 0649 | `nexus-3.zip` | 348 | 48d5edf37b179a1f84af8d2d7a75486d35afa4b5 (master) | 0 |
| 0650 | `Nexus_v0_39_219.zip` | 367 | a51c8a942da84f2da19026de8cc4144f2e119d6f (master) | 256 |
| 0651 | `Nexus_v0_39_220.zip` | 384 | a3109f93cc004fc0875f33979c6d20d983be1111 (master) | 256 |
| 0652 | `Nexus_v0_39_221.zip` | 401 | e3110b781af973c615adbeb22ea3cbba02c50100 (master) | 256 |
| 0653 | `Nexus_v0_39_222.zip` | 428 | 48eed8d1096cc58c68d277d9c21fd98e7cc31a42 (master) | 256 |
| 0654 | `Nexus_v0_39_223-1.zip` | 532 | c6549af05c583265abd3600bbaa67b6a0ef85c93 (master) | 0 |
| 0655 | `Nexus_v0_39_228.zip` | 0 |  | 256 |
| 0656 | `Nexus_v0_39_229.zip` | 0 |  | 256 |
| 0660 | `Nexus_v0_39_235.zip` | 883 | e51d912bdcf6a03ce3f4e2d610f90703468aa08a (master) | 256 |
| 0661 | `Nexus_v0_39_236.zip` | 966 | c45cf00df406d1018f2ca3a8ef84b53c77f0cec0 (master) | 256 |
| 0662 | `Nexus_v0_39_237.zip` | 1023 | 397edd7904d377f76aed847083fee19066eb1011 (master) | 256 |
| 0663 | `Nexus_v0_39_239.zip` | 1101 | 594f5ba58d114cb7d91d13e6e2af7c70f2ea3ff2 | 256 |
| 0664 | `Nexus_v0_39_240.zip` | 1129 | 53b8e385bc820954d39c1eb9bc4d870fcca385d2 | 256 |
| 0666 | `Nexus_v0_39_241.zip` | 1129 | 53b8e385bc820954d39c1eb9bc4d870fcca385d2 | 256 |
| 0669 | `Nexus_v0_39_244_patched.zip` | 1294 | 53b8e385bc820954d39c1eb9bc4d870fcca385d2 | 9706 |
| 0670 | `Nexus_v0_39_245.zip` | 1294 | 66f633cfe44d2a1b48166acb8f43266be674dc4d (main) | 9706 |
| 0671 | `Nexus_v0_39_246.zip` | 1294 | 66f633cfe44d2a1b48166acb8f43266be674dc4d (main) | 9706 |
| 0672 | `Nexus_v0_39_247.zip` | 1294 | 66f633cfe44d2a1b48166acb8f43266be674dc4d (main) | 9706 |
| 0673 | `Nexus_v0_39_251.zip` | 1851 | 66f633cfe44d2a1b48166acb8f43266be674dc4d (main) | 9706 |
| 0674 | `Nexus_v0_39_252.zip` | 1900 | 66f633cfe44d2a1b48166acb8f43266be674dc4d (main) | 9706 |
| 0675 | `Nexus_v0_39_253.zip` | 1934 | 66f633cfe44d2a1b48166acb8f43266be674dc4d (main) | 9706 |
| 0678 | `Nexus_v0_39_257_code.zip` | 165 | 66f633cfe44d2a1b48166acb8f43266be674dc4d (main) | 244 |
| 0679 | `Nexus_v0_39_257_repo.zip` | 205 | 66f633cfe44d2a1b48166acb8f43266be674dc4d (main) | 244 |
| 0680 | `Nexus_v0_39_258_repo.zip` | 165 | 66f633cfe44d2a1b48166acb8f43266be674dc4d (main) | 260 |
| 0690 | `nexus-git-part1.zip` | 36 | ce93817ff82b9f3c0aeb9a6ec1b97c6f8dfb9952 | 0 |
| 0691 | `nexus-git-part2.zip` | 3 |  | 0 |
| 0701 | `Nexus_v0_39_259_repo.zip` | 165 | 66f633cfe44d2a1b48166acb8f43266be674dc4d (main) | 260 |
| 0702 | `nexus-0.39.272.zip` | 0 |  | 203 |
| 0703 | `nexus v0.39.273.zip` | 0 |  | 203 |
| 0704 | `nexus v0.39.274.zip` | 0 |  | 203 |
| 0705 | `nexus-6.zip` | 0 |  | 203 |
| 0706 | `nexus-7.zip` | 0 |  | 203 |
| 0707 | `nexus_v0_39_276.zip` | 0 |  | 203 |
| 0709 | `nexus-8.zip` | 0 |  | 203 |
