# Marketing & Analytics Setup

All of this is configured in the admin panel under **Marketing & Tracking** — no
code or redeploy needed. Every field is optional; each integration activates only
when its ID/token is present and correctly formatted.

## What's included

| Integration | Type | Where the ID/token goes |
|---|---|---|
| Google Tag Manager (GTM) | client | GTM Container ID (`GTM-XXXXXXX`) |
| Google Analytics 4 (GA4) | client | GA4 Measurement ID (`G-XXXXXXXXXX`) |
| Meta Pixel | client | Meta Pixel ID (numeric) |
| Google Search Console | verification | Verification token (HTML-tag method) |
| Meta Conversions API (CAPI) | **server** | Meta CAPI token (secret) |
| GA4 Measurement Protocol | **server** | GA4 API secret (secret) |

## How client + server work together (deduplication)

For conversions the app sends the event from **both** the browser (Pixel/GA4) and
the Cloudflare Worker (CAPI/GA4 MP), sharing one `event_id` so Meta counts it once.
This "redundant, deduplicated" setup is what makes server-side tracking resilient to
ad-blockers and iOS restrictions while avoiding double-counting.

- **Meta:** the client Pixel `Lead` and the server CAPI `Lead` use the same
  `event_id`; Meta deduplicates automatically. The server also sends hashed phone/
  email (SHA-256), the client IP, user agent, and the `_fbp`/`_fbc` cookies for match
  quality.
- **GA4:** the client `gtag` sends events; the GA4 Measurement Protocol (server) is
  optional and used mainly to confirm the server-side `generate_lead` conversion.

## Setup steps

### Google Tag Manager
1. Create a container at tagmanager.google.com → copy the `GTM-XXXXXXX` ID.
2. Paste it into **Marketing & Tracking → Google Tag Manager ID** → Save.

### GA4
1. In GA4 → Admin → Data Streams → your web stream → copy the `G-XXXXXXXXXX` ID.
2. Paste into **GA4 Measurement ID** → Save.
3. (Optional, server-side) In the same stream → *Measurement Protocol API secrets* →
   create a secret → paste into **GA4 Measurement Protocol API secret** → Save.

### Meta Pixel + Conversions API
1. In Meta Events Manager → copy your **Pixel ID** → paste into **Meta Pixel ID**.
2. Events Manager → Settings → **Conversions API** → *Generate access token* → paste
   into **Meta Conversions API token** (stored write-only).
3. (Optional) While testing, paste a **Test event code** to see events under
   Events Manager → Test Events.

### Google Search Console
1. In Search Console → add your property → choose the **HTML tag** method → copy just
   the `content` token value.
2. Paste into **Google Search Console verification** → Save → click Verify in Search
   Console.
3. Alternatively, if GA4 or GTM is already set up, you can verify via the
   **Google Analytics / Tag Manager** method in Search Console instead.

## Notes

- **Server-side toggle:** *Server-side tracking* can be turned off in the panel to
  disable CAPI/GA4-MP sending without removing tokens.
- **Env override:** `META_CAPI_TOKEN` and `GA4_API_SECRET` can also be set as Worker
  environment variables (dashboard or `.dev.vars`); env values take precedence.
- **Privacy:** user data sent to CAPI is SHA-256 hashed; IPs are hashed in the app's
  own visitor logs. Review your consent/analytics disclosures before enabling.
- **CSP:** the Content-Security-Policy already allows Google (Tag Manager/Analytics)
  and Meta (connect.facebook.net/facebook.com). If you add other vendors via GTM,
  extend the CSP in `public/_headers`.
