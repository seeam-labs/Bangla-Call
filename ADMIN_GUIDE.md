# Admin Guide

Open the admin panel from the site (the CMS / shield icon) and sign in with your
admin credentials. On first login you are prompted to change the bootstrap password —
do this before anything else.

## Tabs

- **Widgets** — Reorder, show/hide, rename (BN/EN), set column span, and set the
  default collapsed state for each homepage section. Changes save live. "Reset"
  restores the default layout.
- **Leads** — All applications, newest first. Filter by status and search. Each lead
  shows contact details, the AI first-recharge amount, and — when provided —
  thumbnails of the customer's live photo and NID (opened via signed, expiring URLs).
  Update status, add a manual lead, delete, or export CSV.
- **Theme** — Pick the global color palette; it updates for all visitors instantly.
- **Settings (CMS)** — Brand names, company, license text, hotlines, WhatsApp number,
  emails, address, KYC/order URLs, taglines, and analytics IDs (Google Analytics
  `G-XXXX`, Meta Pixel). Also here: the **Number Availability API** URL (the Bangla
  Call/amarip endpoint the server calls to check numbers — editable without a redeploy),
  and the **Live-stats banner** (on/off toggle plus the displayed "active users" and
  "calls today" baseline figures; real live visitors are added to the active count).
  All of this drives the public site.
- **Telegram** — Enter the bot token and chat id. Use **Get Chat ID** (message the
  bot or add it to your group first) to auto-fill the id, then **Send Test Message**
  to confirm delivery. New leads trigger an alert with signed photo/NID links.
- **API Keys & AI** — Configure Gemini and other secret keys. Fields are write-only:
  leave blank to keep the current value. Under **AI Model Configuration** you can
  **Load** available models, pick one, set a **daily limit**, toggle AI on/off,
  **Save**, and run a live **Test AI** call. Without a key the site automatically
  uses the built-in deterministic valuation.
- **Visitors** — Recent visitor logs (privacy-aware, hashed IPs) with a clear option.
- **Marketing & Tracking** — structured, code-free integrations: Google Tag Manager,
  GA4, Meta Pixel, and Google Search Console verification (client-side), plus Meta
  Conversions API and the GA4 Measurement Protocol (server-side). Lead submissions
  fire a deduplicated `Lead` conversion from both browser and server. Secret tokens
  (CAPI, GA4 MP) are stored write-only. See MARKETING_SETUP.md for per-platform steps.
- **Storage & Monitoring** — a four-part dashboard:
  - *Storage*: real usage (bytes + object count) for photos/NID, a used-vs-free-tier
    bar, D1 row counts, KV keys, and one-click **purge orphans** / **purge all uploads**
    (deletes the underlying R2/KV objects — no leftovers).
  - *Edge Status*: Worker health, serving datacenter/region, runtime, and (with a
    Cloudflare token) 24h requests/errors/CPU time. There is no RAM/OS to show —
    the backend is serverless; the panel explains the real edge equivalents.
  - *Visitors*: live "active now" counter (auto-refresh), total/today/7-day pageviews,
    a 14-day trend, and breakdowns by device, browser, OS, country, city, ISP, top
    pages and referrers — plus CSV/JSON export of leads and visitors.
  - *Retention*: auto-delete windows for photos/NID and visitor logs (run daily by a
    cron trigger, or "Run now"), a storage-alert threshold, and the optional
    **Cloudflare API** field (Account ID + read-only token) that unlocks authoritative
    R2/D1/Workers numbers. Without it, everything still works from self-tracked data.
- **Security** — Change your password.

## Secrets & environment

Anything set as an environment variable (dashboard or `wrangler secret put`) overrides
the panel value. Panel secrets are stored write-only and never sent back to the
browser — you'll see a "configured" indicator rather than the value.

## Tips

- The audit log records logins and configuration changes.
- If a session expires you'll be returned to the login screen; just sign in again.
