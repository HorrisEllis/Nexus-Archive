# Confirm the build — 2 minutes

The backend is verified: `node scripts/confirm-build.mjs` passes **12/12**, including
every bug you reported (add idea, spec library, promote→repo, click-spec, files as
components, .spec import). If you still see problems, they're **browser/UI**, and the
steps below isolate which.

## The one thing that was wrong in your screenshots

You were opening the UI from **`file:///D:/Backups/Downloads/nexus-full-2/...`** — a
STALE download, served as a local file. Two problems with that:
1. It's an old copy from before ~6 turns of fixes.
2. `file://` pages are fragile for talking to a local server.

## Do this instead

1. **Unzip THIS `nexus-full.zip` fresh** (not the old `nexus-full-2` folder).
2. Start the idearium service:
   ```
   cd nexus
   node idearium/api/index.js
   ```
   (or `npm run start:all` for the whole system)
3. Open **`http://127.0.0.1:4800`** in your browser — NOT the `file://` path.
   The top bar should read `nexus · :4800` in green.
4. Try the three things that failed before:
   - **Add idea** → click `+ idea`, type, `add idea`. It should appear in the list.
   - **Brainstorm → promote** → capture a thought, click `promote → idea`.
   - **Click a promoted spec** → its repository opens with files listed as components.

## If it STILL fails

The loaders now show a red error toast naming the failure (they used to fail
silently — that's why it looked "blank"). **Screenshot the toast.** It will say
exactly what broke, e.g. `failed to load ideas: <reason>`, and I can fix the real
bug instead of guessing against a stale copy.

## Backend proof (run anytime)

```
node scripts/confirm-build.mjs
```
Spawns the service, exercises the full loop, prints pass/fail per reported bug.
