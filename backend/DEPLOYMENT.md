# Yusra Synthetic Intelligence — Backend Deployment

## What this backend now expects

- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `ADMIN_EMAILS`
- `PAYMENT_PHONE`

Optional AI providers:

- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`
- `TOGETHER_API_KEY`
- `COHERE_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `CEREBRAS_API_KEY`
- `HUGGINGFACE_API_KEY`
- `LLM7_API_KEY`
- `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (both required together — Workers AI needs the account ID in the request path, not just the token)

## Production checklist

1. Create a real `.env` from `.env.example`.
2. Replace every placeholder secret with a real production value.
3. Point `ALLOWED_ORIGINS` at your live frontend domain. Same-origin requests (the single-service deployment this app uses) are never blocked by CORS regardless of this list — see "Same-origin CORS" below.
4. Set `NODE_ENV=production`.
5. Configure your hosting platform to run `npm start` inside `backend/`.
6. Add a health check to `/api/health`.
7. Add a readiness check to `/api/ready`.
8. Create the Supabase tables used by auth, chat, image, slides, audio, tools, subscriptions, and admin analytics (`database/schema.sql`), then apply `database/migrations/002_orchestration.sql` on top (adds multi-model fusion columns — additive, safe to run on an existing database).

## Same-origin CORS (fixed 2026-07-13)

`server.js` now strips the `Origin` header before the CORS check whenever it
equals the request's own `protocol://host`. Browsers attach an `Origin` header
even to same-origin `type="module"` script fetches — without this, the app's
own `/assets/app.js` was rejected by the CORS allowlist the moment
frontend+backend were served from one origin (exactly how this app deploys),
producing a blank page in production with no visible error beyond a console
CORS warning. If you ever see the built app fail to load only when accessed
through its real domain (but work as two separate dev servers), check this
first.

## Static asset caching (fixed 2026-07-13)

This build does not content-hash output filenames (`/assets/app.js` and
`/assets/app.css` never change name between deploys). `server.js` therefore
serves those — and `index.html`, `runtime-config.js`, `sw.js`,
`site.webmanifest` — with `Cache-Control: no-cache` (always revalidate with
the server) rather than a long max-age, so a redeploy is actually visible to
returning visitors. Only genuinely immutable files (images, icons, fonts) get
a 1-year cache. If you add real content hashing to the build later, the
app-shell files can switch to a long immutable cache too.

## PWA / installability

The app ships a real manifest (`frontend/public/site.webmanifest`, 5 icons
including maskable variants) and service worker
(`frontend/public/sw.js`, network-first for the app shell, network-only for
`/api/*`, cache-first for static assets). Installability requires HTTPS in
real deployment (localhost is exempt for local testing). The install button
in the app shell (`Layout.tsx`) uses `beforeinstallprompt`, which only Chromium
browsers fire — iOS Safari users install via the native "Add to Home Screen"
share-sheet action instead (no code hook exists for that; it's OS-level).

## Sales flow

- Free users can register and use the trial limits.
- Paid users submit a manual bKash/Nagad/Rocket/bank payment request.
- Admin approves the request and the backend upgrades the account.
- Chat, image generation, slides, audio, and tools only work when the needed AI provider key is present.

## Useful endpoints

- `GET /api/health`
- `GET /api/ready`
- `GET /api/models`
- `GET /api/subscriptions/plans`
- `GET /api/subscriptions/payment-methods`
