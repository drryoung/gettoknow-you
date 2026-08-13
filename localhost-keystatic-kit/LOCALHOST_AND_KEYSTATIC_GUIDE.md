# Localhost and Keystatic — Standard Recovery Guide

This guide assumes the following fixed arrangement:

- **MandarinOS.app** → `http://localhost:3000`
- **GetToKnow.You** → `http://localhost:3001`
- **MandarinOS Keystatic** → `http://localhost:3000/keystatic`
- **GetToKnow.You Keystatic** → `http://localhost:3001/keystatic`

Repository locations:

- `C:\Users\drryo\OneDrive\Documents\GitHub\Website\MandarinOS.app`
- `C:\Users\drryo\OneDrive\Documents\GitHub\Website\gettoknow-you`

## The most important rule

A localhost site exists only while its development-server PowerShell window remains open and running.

Closing the PowerShell window, restarting Windows, putting the computer to sleep, or stopping the command will stop that localhost. This is normal. It does not mean the website or repository has been lost.

---

## Normal start-up procedure

### 1. Open PowerShell for MandarinOS.app

```powershell
cd "C:\Users\drryo\OneDrive\Documents\GitHub\Website\MandarinOS.app"
npm run dev -- --port 3000
```

Wait until the terminal reports that the server is ready.

Open:

- Site: `http://localhost:3000`
- Keystatic: `http://localhost:3000/keystatic`

Keep this PowerShell window open.

### 2. Open a second PowerShell window for GetToKnow.You

```powershell
cd "C:\Users\drryo\OneDrive\Documents\GitHub\Website\gettoknow-you"
npm run dev -- --port 3001
```

Wait until the terminal reports that the server is ready.

Open:

- Site: `http://localhost:3001`
- Keystatic: `http://localhost:3001/keystatic`

Keep this PowerShell window open.

---

## Fastest method

Run the included `start-local-sites.ps1` script. It opens one PowerShell window for each repository and assigns the correct port.

From PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File ".\start-local-sites.ps1"
```

Do not close the two server windows that appear.

---

## When a localhost cannot be found

Work through these checks in order.

### Check 1 — Is the server PowerShell window still open?

Look for the PowerShell window running `npm run dev`.

- If it is closed, restart the site.
- If it shows an error, read the last red error message.
- If it says `Ready`, the server should be available.

### Check 2 — Try 127.0.0.1 instead of localhost

Use:

- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

This bypasses occasional Windows localhost-name resolution problems.

### Check 3 — Confirm that the expected port is listening

```powershell
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
Where-Object LocalPort -In 3000,3001 |
Select-Object LocalAddress,LocalPort,OwningProcess
```

Expected result:

- port `3000` is listening for MandarinOS.app
- port `3001` is listening for GetToKnow.You

If a port is absent, its development server is not running.

### Check 4 — Stop stale processes using the ports

```powershell
foreach ($port in 3000,3001) {
    Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object {
        if ($_ -and $_ -ne $PID) {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
    }
}
```

Then restart both sites using the normal procedure.

### Check 5 — Clear the Next.js build cache

For MandarinOS.app:

```powershell
cd "C:\Users\drryo\OneDrive\Documents\GitHub\Website\MandarinOS.app"
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
npm run dev -- --port 3000
```

For GetToKnow.You:

```powershell
cd "C:\Users\drryo\OneDrive\Documents\GitHub\Website\gettoknow-you"
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
npm run dev -- --port 3001
```

Deleting `.next` is safe. Next.js rebuilds it automatically.

The included `reset-local-sites.ps1` script performs the stale-port and `.next` cleanup for both repositories, then restarts them.

---

## When `npm run dev` fails

### “npm is not recognized”

Confirm Node.js is installed:

```powershell
node --version
npm --version
```

If both commands fail, Node.js is unavailable or its PATH setting is broken.

### Missing packages or module errors

From the affected repository:

```powershell
npm install
npm run dev -- --port 3000
```

For GetToKnow.You, use port `3001`.

Run `npm install` after:

- initially cloning a repository;
- changing branches where dependencies changed;
- pulling a commit that changed `package.json` or `package-lock.json`;
- deleting `node_modules`.

Do not routinely delete `node_modules`.

### Port already in use

Either stop the stale process using the port-recovery command above, or run the included reset script.

Do not allow Next.js to silently move MandarinOS.app or GetToKnow.You to a random port. Keep the fixed assignment of `3000` and `3001`.

---

## When the website works but Keystatic does not

### Correct local addresses

- MandarinOS.app: `http://localhost:3000/keystatic`
- GetToKnow.You: `http://localhost:3001/keystatic`

Do not use the public production domain for the local Keystatic editor unless remote editing has explicitly been configured. A production `/keystatic` route may intentionally return `404`.

### First checks

1. Confirm the normal website loads on the same port.
2. Confirm the server was started with `npm run dev`, not `npm start`.
3. Watch the server terminal while opening `/keystatic`.
4. Hard-refresh the browser with `Ctrl + Shift + R`.
5. Try the equivalent `127.0.0.1` URL.

### If `/keystatic` returns 404 locally

The repository should contain its Keystatic configuration and Next.js route integration. Typical files include:

```text
keystatic.config.ts
app/keystatic/[[...params]]/page.tsx
app/api/keystatic/[...params]/route.ts
```

The exact route structure may differ slightly, but a local 404 usually means one of these:

- the wrong repository or port is running;
- the Keystatic route files are missing;
- the development server started before a branch change and needs restarting;
- `.next` contains stale output;
- the current branch intentionally does not include Keystatic.

Use the reset procedure first. Investigate source files only if the reset does not solve it.

### If Keystatic opens but cannot save

Check:

- the repository and content files are not read-only;
- OneDrive has finished syncing;
- the files are stored locally, not cloud placeholders;
- no Git operation or editor process is locking the content file;
- the PowerShell terminal shows no write-permission error.

In File Explorer, right-click each repository folder and select **Always keep on this device**. This reduces OneDrive hydration and file-lock problems.

---

## One-command full recovery

Open PowerShell in the folder containing the scripts and run:

```powershell
powershell -ExecutionPolicy Bypass -File ".\reset-local-sites.ps1"
```

This will:

1. stop processes listening on ports 3000 and 3001;
2. remove the `.next` cache from both repositories;
3. open a fresh development-server window for each site;
4. restore the fixed port assignment.

Then open:

```text
http://localhost:3000
http://localhost:3000/keystatic
http://localhost:3001
http://localhost:3001/keystatic
```

---

## Daily habit

At the start of a work session:

1. Run `start-local-sites.ps1`.
2. Keep both server PowerShell windows open.
3. Use fixed ports 3000 and 3001.
4. Use `/keystatic` on the matching port.
5. After sleep or restart, assume both servers need to be started again.
6. If either site fails, run `reset-local-sites.ps1`.

## What not to do

- Do not repeatedly reinstall all dependencies unless an error indicates it is necessary.
- Do not delete repository content files.
- Do not use `npm start` for normal local editing.
- Do not close the development-server PowerShell windows.
- Do not assume a localhost survives a Windows restart or sleep cycle.
- Do not confuse a production Keystatic 404 with a local Keystatic failure.
