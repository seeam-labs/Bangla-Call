# Audit & Test Report — Bangla Call

Full read/analyze/audit/verify pass across the frontend (React/Vite) and the
Cloudflare Worker backend, including the marketing/analytics stack, followed by
fixes and re-verification.

## Verification performed

| Check | Command | Result |
|---|---|---|
| Lint (ESLint flat config) | `eslint src worker` | **0 problems** (0 errors, 0 warnings) |
| Frontend type safety | `tsc --noEmit` (src) | clean |
| Worker type safety (strict) | `tsc --noEmit -p worker/tsconfig.json` | clean |
| Production build | `vite build` | success |
| Deploy config + Worker bundle | `wrangler deploy --dry-run` | valid (D1 + KV bound; R2 optional/off; cron accepted) |
| End-to-end API suite | real bundled Worker + local SQLite/KV/R2 | **52/52 passed** |
| Live number-availability API | proxy vs `amarip.net` | **3/3** (available/taken/empty) |

The E2E suite covers public settings/widgets/live-stats, first-run setup wizard
(create owner + 409 repeat), auth (login + 401 on wrong/missing/bad token), all admin
GETs, visitor logging + live heartbeat + device/browser parsing, lead submit +
validation, all lead-status transitions, image upload -> storage ledger +1 ->
delete -> ledger -1, widget save reflected publicly, change-password + re-login,
settings save with write-only secrets (no leak), retention, CSV/JSON export,
Cloudflare-token test, 404s, and the marketing stack (below).

> Cloudflare's `workerd` runtime is blocked in the build sandbox, so the suite runs
> the real esbuild-bundled Worker on Node with a `node:sqlite`-backed D1 shim and
> in-memory KV/R2. On a normal machine, `npm test` runs the same flow via
> `wrangler unstable_dev` with local bindings.

## Marketing & analytics — added and verified

Integrated GA4, Google Tag Manager, Meta Pixel, Google Search Console (client) and
Meta Conversions API + GA4 Measurement Protocol (server), with Pixel<->CAPI
deduplication via a shared `event_id`, SHA-256-hashed user data, and `_fbp`/`_fbc`
attribution. Verified by tests:

- Public `/api/settings` exposes client tracking IDs (GTM/GA4/Pixel/GSC) and hides
  the CAPI token and GA4 MP secret.
- `/api/track` accepts valid events (200) and rejects invalid ones (400).
- Lead submit accepts attribution (`eventId`/`fbp`/`fbc`/`clientId`) and still succeeds.
- Saving the CAPI token + GA4 secret marks them configured (write-only) without leaking.
- Server-side calls fail soft when unconfigured (no exceptions).

## Code quality & lint pass (this round)

- Added a proper **ESLint 9 flat config** (typescript-eslint + react-hooks +
  unused-imports) and wired `npm run lint` / `npm run lint:fix` / `npm run typecheck`.
- Cleared **all 120 initial lint findings → 0**: auto-removed unused imports,
  fixed `prefer-const` / `no-useless-assignment`, removed genuinely dead code
  (unused components/functions/state: `FadeInSection`, `handleSelectNumber`,
  `handleCopyNumber`, Footer `handleCopy`, `handleNameChange`, dead `useState` halves,
  stray `regex`/`isAmbientPlaying`, unused props), and annotated intentional
  single-trigger `useEffect` hooks with scoped `exhaustive-deps` disables + reasons.
- Swept the app: **no** `console.log`/`debugger`, **no** `dangerouslySetInnerHTML`,
  **no** hardcoded secrets, **no** real TODO/FIXME. Removed the two orphaned
  `customHeaderScript`/`customFooterScript` state keys left by the old injector tab.
- Six component files exist but are not currently mounted (`WhatsAppWidget`,
  `SeasonalBanner`, `MobileStickyBar`, `QuickAccessMenu`, `KycGuide`,
  `KycCheckerModal`). They are tree-shaken out (zero runtime cost) and left in place as
  optional/buildable features rather than deleted.
- Added `eslint-plugin-react` with **`react/jsx-key`** and other correctness rules;
  the entire tree passes with **0 problems**.

## Fake/misleading data — fixed

- **Live-stats banner** previously returned hardcoded, per-second-incrementing fake
  figures (`12540 + seconds` "active users", `85400 + …` "calls today"). Reworked so
  the numbers are an **owner-configured baseline** (admin → Site Settings → Live-stats
  banner) with an **on/off toggle**, and "active users" is now **grounded in the real
  count of visitors active in the last 5 minutes**. The banner stays hidden until real
  data loads and when disabled. Verified 5/5.
- **Number Availability API URL** is now **editable in the admin panel** (Site
  Settings) instead of only a hardcoded default — so if the upstream endpoint changes,
  the owner updates it without a redeploy. (The Worker already read this setting.)



Root causes:
1. **Direct `amarip.net` calls from the browser** (VIP regenerate, Valuation modal)
   were blocked by the site CSP/CORS, so they silently failed and fell back to
   **unverified random numbers presented as "available."**
2. **"Unknown = available" everywhere** — every checker used `data.available ?? true`
   / returned `true` on error and defaulted state to `true`, so any slow/failed/null
   API response **falsely showed the number as available.** (Confirmed against the live
   API: the screenshot's `09649888999` is actually `available:false` — the old UI
   showed it "Available".)

Fixes:
- All availability checks now go through the Worker proxy (`/api/number/check`,
  `/api/number/availability`) — never `amarip.net` directly. Removed every direct call.
- The Worker proxy trusts **only a real boolean** (`typeof === "boolean"`), returns
  `null` otherwise, and now uses a proper User-Agent, an 8s timeout, and one retry.
- The main checker, predictive suggestions, VIP generator, Generator/Serial/Bulk
  modals, and the Valuation modal now treat non-boolean as **"unverified"** (never
  "available"). The main input shows an amber "Couldn't verify — recheck" state; the
  VIP generator reports honestly when no verified-available number is found instead of
  inventing one; generators list **only** API-confirmed-available numbers.
- Verified end-to-end against the **live Bangla Call API**: available number → true,
  taken number → false, empty → null (3/3).



## Bugs fixed in the prior audit (still in effect)

1. Lead status contract mismatch (admin sent labels the backend rejected; "All" filter
   hid every lead) — reconciled to one canonical set.
2. CSP blocked Google Analytics — GA/GTM/Meta domains now allowed while staying strict.
3. Orphaned uploads on lead delete — objects + index rows are now removed.

## Hardening

- Schema initializes statement-by-statement (no DDL-in-transaction risk on D1).
- Server-side tracking runs via `waitUntil` (never delays responses) and fails soft.
- All tracking IDs are format-validated before any script is injected; no arbitrary
  script injection is possible from settings.
- Secrets (Gemini, Telegram, Cloudflare, Meta CAPI, GA4 MP) are write-only: never
  returned by any endpoint; only a boolean "configured" status is exposed.
- Vite strips `process.env.NODE_ENV` from the bundle (service worker can't throw).

## Deployment readiness

- One-click Deploy to Cloudflare; bindings auto-provision (no IDs to paste).
- DB self-initializes; signing secrets auto-generate; owner created via first-run wizard.
- Daily retention cron; uploads default to KV (R2 optional, one-line enable); strict security headers; marketing
  integrations all optional and admin-configurable.

## Deployment note — R2 disabled by default

To avoid the common `[code: 10042] Please enable R2` deploy failure on accounts that
haven't activated R2, the `r2_buckets` binding is commented out in `wrangler.jsonc`.
Photo/NID uploads use the **KV fallback** (verified end-to-end, 6/6). To use R2, enable
it in the dashboard and uncomment the binding — the code already reads/writes whichever
store is present.

**Status: green. No known bugs or errors.**
