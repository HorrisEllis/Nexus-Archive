# 0.60.7 — 2026-10-13
Fix: ChatGPT NCP flapping (3 disconnects / 60 s, a reload every ~3 s).
Cause: signed-out ChatGPT is a normal page, but its userscript reports "signed-out" on every load; Guardian raised a sign-in attention, Clear Glass reloaded chatgpt.com (0.60.2 loginOptional), the reload dropped the NCP connection, the next load reported again.
- `clear-glass/src/providers/attention.js`: a loginOptional tab already off a sign-in URL is left alone; at most one send-back reload per provider per minute.
- `guardian/lib/provider-attention.js`: no signin raise for a loginOptional provider unless its URL is really a sign-in page.
