# Little Lingo — Deploy as a Real, Live App

This package is ready to deploy to **Vercel** (free tier is enough) with a
working AI backend. Once deployed, you get a real public URL — no Claude.ai
involved, no login required for visitors, and the AI quiz/coding features
work using your own Anthropic API key, kept safely on the server.

## What's in this folder
- `index.html` — the app itself
- `api/generate.js` — a serverless function that holds your API key and
  talks to Anthropic on the app's behalf (your key is never exposed to visitors)
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — makes the app
  installable (Add to Home Screen / Install App) once hosted
- `package.json` — tells Vercel this is a Node project

## Step 1 — Get an Anthropic API key
1. Go to https://console.anthropic.com and sign in (or create an account).
2. Go to **Settings → API Keys → Create Key**.
3. Copy the key (starts with `sk-ant-...`). You'll paste it into Vercel in Step 3.
4. Note: API usage is billed by Anthropic based on how much the app is used —
   check https://console.anthropic.com/settings/billing to set spending limits.

## Step 2 — Put this folder in a GitHub repo
1. Create a new repository on GitHub (or use GitHub Desktop / any Git client).
2. Upload/push everything in this folder to that repo.
   (If you don't want to use GitHub, Vercel also supports dragging a folder
   directly in some flows, but connecting a GitHub repo is the most reliable
   path and lets you redeploy easily later by just pushing changes.)

## Step 3 — Deploy on Vercel
1. Go to https://vercel.com and sign up/log in (free — GitHub login is easiest).
2. Click **Add New → Project**, then import the GitHub repo from Step 2.
3. Vercel will auto-detect it as a static site with a serverless function —
   you don't need to change any build settings.
4. Before clicking Deploy, open **Environment Variables** and add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** the key you copied in Step 1
5. Click **Deploy**. In about a minute you'll get a live URL like
   `https://little-lingo-yourname.vercel.app`.

That's it — visit that URL and the app is fully live, with working AI-generated
quizzes, coding challenges, and code review, all backed by your own API key
sitting safely on Vercel's servers (never visible to anyone using the app).

## How the app decides which backend to use
`index.html` first tries calling Anthropic directly (which only succeeds
inside Claude.ai's own sandbox). If that's blocked — which it will be once
you're hosted on your own domain — it automatically falls back to calling
`/api/generate` on whatever domain the app is running on. So the same
`index.html` file works both inside Claude.ai for quick testing *and* on your
live Vercel deployment, with no code changes needed between the two.

## Updating the app later
Make edits to `index.html`, push to your GitHub repo, and Vercel automatically
redeploys within a minute or two.

## Installing it as an app once live
- **Android (Chrome):** visit the link → tap "Install app" banner or menu →
  Add to Home screen.
- **iPhone (Safari):** visit the link → Share icon → "Add to Home Screen."
- **Windows/Mac (Chrome/Edge):** visit the link → click the install icon (⊕)
  in the address bar.

## Cost & usage notes
- Vercel's free "Hobby" tier easily covers a small/medium personal app.
- Anthropic API costs scale with usage (each quiz/challenge/code-review
  generates one API call). Set a spending limit in the Anthropic console if
  you want a hard cap.
- If you ever see errors in the app, check Vercel's **Deployments → Functions
  → Logs** for `api/generate` — that's where server-side errors (like a
  missing or invalid API key) will show up.

## Alternative hosts
The same `api/generate.js` pattern works on **Netlify Functions** or
**Cloudflare Workers** too, with minor syntax differences for how the
function reads the request body and environment variables. Ask if you'd like
a version adapted for either of those instead of Vercel.
