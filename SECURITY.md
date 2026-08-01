# Security Policy

## Reporting a vulnerability

Please report security issues privately to **iptsp@sarkercommunication.com** rather
than opening a public issue. Include reproduction steps and impact. We aim to
acknowledge within 72 hours.

## Security model

- **Authentication.** All `/api/admin/*` routes require a valid JWT (HS256, 8h TTL).
  Passwords are hashed with PBKDF2-SHA256 (100k iterations, per-user salt) via Web
  Crypto. The first-run admin is forced to change the bootstrap password.
- **Secrets.** No secrets are committed. Runtime secrets come from environment
  variables (dashboard or `wrangler secret put`) and take precedence over any values saved
  in the admin panel. Panel-saved secrets are stored **write-only** in D1 — their
  values are never returned to any client; only a "configured" boolean is exposed.
- **Public vs. private data.** The public `/api/settings` endpoint returns only
  non-secret fields. API keys are never sent to the browser.
- **Input validation.** All write endpoints validate input with Zod; the Telegram
  integration HTML-escapes every interpolated value.
- **Rate limiting.** Login, uploads, lead submission, AI, and banner endpoints are
  rate-limited per client IP via KV fixed windows.
- **Uploads.** Live photos / NID images are stored privately (KV by default, or a
  private R2 bucket if R2 is enabled). They are served only through signed,
  time-limited HMAC URLs — never public.
- **Privacy.** Visitor and lead records store a salted hash of the IP, not the raw
  address. The visitor table is capped.
- **Transport & headers.** A strict Content-Security-Policy plus
  `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`, and HSTS are applied via `public/_headers`.
- **No arbitrary script injection.** Analytics are loaded from a validated
  measurement ID; the site never injects operator-supplied `<script>` markup.

## Hardening checklist for operators

1. Set a long random `JWT_SECRET` and a separate `UPLOAD_SIGNING_SECRET`.
2. Change the bootstrap admin password on first login.
3. If you enable R2, keep the bucket private (default). Otherwise images live in KV,
   which is private and only reachable via signed URLs.
4. Rotate `GEMINI_API_KEY` / `TELEGRAM_BOT_TOKEN` if they were ever exposed.
5. Review the audit log periodically (admin panel).
