# Bangla Call — IPTSP Landing & Lead Portal

A production-ready, fully self-hostable landing site and lead portal for a
BTRC-licensed IP-telephony (IPTSP) service. **Deploys to Cloudflare in one click** —
no CLI, no config editing, no IDs to paste. Everything a visitor sees (branding,
contacts, pricing, widgets, theme) is edited from the admin panel. No secrets live
in the repo, so it's safe to publish.

- **Frontend:** React 19 + Vite 6 + TypeScript + Tailwind CSS 4
- **Backend:** a single Cloudflare Worker (Hono) with static assets
- **Data:** Cloudflare D1 (SQLite) · KV · R2 (private image storage)
- **AI:** Google Gemini via REST, with a deterministic offline fallback
- **Alerts:** Telegram Bot API

---

## 🚀 One-click deploy

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR_GITHUB_USERNAME/bangla-call)

> Replace `YOUR_GITHUB_USERNAME/bangla-call` in the button link (and push this repo to
> your GitHub) so the button points at your fork.

When you click it, Cloudflare will:

1. Fork the repo into your GitHub and connect CI/CD (auto-deploy on every push).
2. **Auto-provision** the D1 database, KV namespace, and R2 bucket declared in
   `wrangler.jsonc` — no IDs to create or paste.
3. Build and deploy the Worker + static site.

### Then finish in the browser (no terminal)

1. Open your new `*.workers.dev` URL.
2. Click the **admin** icon → you'll see **"Create Owner Account"** → set your username
   and password. (This screen only appears once; the first person to reach it becomes
   the owner, so claim it right after deploying.)
3. Optionally, in the panel, paste your **Gemini API key** and **Telegram** bot
   token/chat-id, and edit branding, widgets, and theme.

That's it. The app **configures itself on first run**: the database schema is created
automatically, and the signing secrets are generated and stored for you. Nothing else
is required.

#### One caveat: R2

The live-photo / NID capture feature uses **R2**. R2 is free (10 GB) but must be
**enabled once** on your Cloudflare account (Dashboard → *Storage & Databases → R2* →
enable). If R2 isn't enabled, the rest of the site still works and uploads transparently
fall back to KV storage.

---

## Local development

Requirements: Node.js 20+ (the `wrangler` CLI is a dev dependency).

```bash
npm install

# Frontend only (fast HMR; API calls need the Worker below to respond)
npm run dev

# Full stack locally (Worker + static assets + local D1/KV/R2, auto-created)
npm run build && npm run cf:dev
```

Local secrets are **optional** — copy `.dev.vars.example` to `.dev.vars` only if you
want to override the auto-generated defaults. The schema self-initializes on the first
request; there is no migration step.

---

## How the zero-config works

| Concern | Behavior |
|---|---|
| **Database schema** | Created automatically on the first request (idempotent). No `db:migrate`. |
| **Resources (D1/KV/R2)** | Auto-provisioned by the Deploy button from `wrangler.jsonc` (bindings declared without IDs). |
| **Signing secrets** | `JWT_SECRET` / `UPLOAD_SIGNING_SECRET` auto-generated and stored in KV if unset. Env vars override. |
| **Admin account** | First-run setup wizard creates the owner. No default password ships. |
| **Gemini / Telegram** | Optional; configured in the admin panel (stored write-only) or via env vars. |

For production hardening you *may* set `JWT_SECRET` / `UPLOAD_SIGNING_SECRET` explicitly
in the dashboard (Worker → Settings → Variables), but it isn't required. See
[SECURITY.md](./SECURITY.md).

---

## Project layout

```
worker/
  index.ts        # Hono router — all /api routes (the Worker entry)
  lib/            # auth, crypto, db, schema, settings, validation, ratelimit,
                  # telegram, ai, storage, appsecrets
migrations/       # D1 schema (reference; the app self-initializes)
public/           # static assets + _headers (CSP/security)
src/              # React app (components, lib, data, types)
wrangler.jsonc    # Worker + static-assets + auto-provisioned bindings
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server (frontend) |
| `npm run build` | Production build to `dist/` |
| `npm run cf:dev` | `wrangler dev` — full stack locally |
| `npm run deploy` | Build and deploy the Worker (`wrangler deploy`) |
| `npm run lint` | ESLint (flat config) over `src` + `worker` |
| `npm run typecheck` | `tsc --noEmit` for frontend + worker |

See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md), [USER_GUIDE.md](./USER_GUIDE.md),
[MARKETING_SETUP.md](./MARKETING_SETUP.md), [CONTRIBUTING.md](./CONTRIBUTING.md),
and [SECURITY.md](./SECURITY.md).

---

## Marketing & analytics

Built-in, admin-configurable integrations (no code, no redeploy) under
**Marketing & Tracking** in the admin panel:

- **Client-side:** Google Tag Manager, Google Analytics 4, Meta Pixel, and Google
  Search Console verification.
- **Server-side:** Meta **Conversions API** and the GA4 **Measurement Protocol**,
  with Pixel↔CAPI **event deduplication** (shared `event_id`), SHA-256-hashed user
  data, and `_fbp`/`_fbc` attribution — resilient to ad-blockers and iOS limits.

Lead submissions fire a deduplicated `Lead` conversion from both the browser and the
Worker automatically. Full setup steps per platform are in
[MARKETING_SETUP.md](./MARKETING_SETUP.md).

---

## Testing

An end-to-end test suite boots the Worker locally (via Wrangler's `unstable_dev`
with local D1/KV/R2) and exercises every API — setup wizard, auth, leads, the
storage ledger (upload → delete), analytics, retention, export, and admin CRUD:

```bash
npm test
```

The suite covers 45+ assertions and requires no cloud account (everything runs
locally). CI can run `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test`.

---

## Troubleshooting

- **Live photo / NID upload does nothing.** R2 must be enabled on your account
  (Dashboard → *Storage & Databases → R2* → enable — it's free). Until then,
  uploads transparently fall back to KV, but enabling R2 is recommended.
- **"Create Owner Account" doesn't appear / I see a login screen instead.** An owner
  already exists. If you're locked out, delete the row in the `admin_users` table
  (Dashboard → D1 → your database → Console) and reload.
- **AI valuation returns generic results.** No Gemini key is set — it's using the
  built-in deterministic engine. Add a key in the admin panel (API Keys tab).
- **Storage/analytics show self-tracked numbers only.** Add a Cloudflare Account ID
  + read-only API token in the admin *Retention* tab for authoritative account-level
  metrics (Account Analytics Read, R2 Read, D1 Read scopes).
- **Changes don't appear after a deploy.** The service worker is network-first for
  HTML, so a normal reload picks up new builds; a hard refresh forces it.

---

## License

[MIT](./LICENSE).
