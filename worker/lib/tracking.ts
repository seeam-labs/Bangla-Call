import type { Env } from "./types";
import { sha256Hex } from "./crypto";
import { getPublicSettings, getSecretValue } from "./settings";

const FB_API_VERSION = "v19.0";

export interface ServerEvent {
  eventName: string;               // "Lead", "Contact", "PageView", ...
  eventId?: string;                // shared with client Pixel for dedup
  eventSourceUrl?: string;
  clientIp?: string;
  userAgent?: string;
  email?: string;
  phone?: string;
  fbp?: string;                    // _fbp cookie
  fbc?: string;                    // _fbc cookie
  clientId?: string;               // GA client id (from _ga cookie)
  value?: number;
  currency?: string;
  customData?: Record<string, unknown>;
}

function normalizeEmail(e: string): string {
  return e.trim().toLowerCase();
}

// Meta expects E.164-style digits with country code, no "+". BD: 01XXXXXXXXX -> 8801XXXXXXXXX
function normalizePhone(p: string): string {
  let d = (p || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "88" + d.slice(1);        // local 01... -> 8801...
  else if (d.length === 10 && d.startsWith("1")) d = "880" + d; // 1XXXXXXXXX
  return d;
}

/** Meta Conversions API (server-side). Fails soft when unconfigured. */
export async function sendMetaCapi(env: Env, ev: ServerEvent): Promise<{ ok: boolean; error?: string }> {
  const settings = await getPublicSettings(env.DB);
  const pixelId = settings.metaPixelId;
  const token = env.META_CAPI_TOKEN || (await getSecretValue(env.DB, "metaCapiToken"));
  if (!pixelId || !token) return { ok: false, error: "Meta CAPI not configured" };

  const userData: Record<string, unknown> = {};
  if (ev.email) userData.em = [await sha256Hex(normalizeEmail(ev.email))];
  if (ev.phone) userData.ph = [await sha256Hex(normalizePhone(ev.phone))];
  if (ev.clientIp) userData.client_ip_address = ev.clientIp;
  if (ev.userAgent) userData.client_user_agent = ev.userAgent;
  if (ev.fbp) userData.fbp = ev.fbp;
  if (ev.fbc) userData.fbc = ev.fbc;

  const customData: Record<string, unknown> = { ...(ev.customData || {}) };
  if (ev.value != null) { customData.value = ev.value; customData.currency = ev.currency || "BDT"; }

  const payload: Record<string, unknown> = {
    data: [{
      event_name: ev.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: ev.eventId,
      event_source_url: ev.eventSourceUrl,
      action_source: "website",
      user_data: userData,
      custom_data: customData,
    }],
  };
  const testCode = settings.metaTestEventCode;
  if (testCode) payload.test_event_code = testCode;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${FB_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, error: `CAPI ${res.status}: ${t.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "CAPI request failed" };
  }
}

// GA4 event names must be snake_case. Map common standard names.
function ga4EventName(name: string): string {
  const map: Record<string, string> = {
    Lead: "generate_lead", Contact: "contact", PageView: "page_view",
    CompleteRegistration: "sign_up", Purchase: "purchase", Search: "search",
  };
  return map[name] || name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
}

/** GA4 Measurement Protocol (server-side). Fails soft when unconfigured. */
export async function sendGa4Mp(env: Env, ev: ServerEvent): Promise<{ ok: boolean; error?: string }> {
  const settings = await getPublicSettings(env.DB);
  const mid = settings.gaMeasurementId;
  const secret = env.GA4_API_SECRET || (await getSecretValue(env.DB, "ga4ApiSecret"));
  if (!mid || !secret) return { ok: false, error: "GA4 MP not configured" };

  const clientId = ev.clientId || `${Math.floor(Math.random() * 1e10)}.${Math.floor(Date.now() / 1000)}`;
  const params: Record<string, unknown> = { engagement_time_msec: 100, ...(ev.customData || {}) };
  if (ev.value != null) { params.value = ev.value; params.currency = ev.currency || "BDT"; }

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(mid)}&api_secret=${encodeURIComponent(secret)}`,
      { method: "POST", body: JSON.stringify({ client_id: clientId, events: [{ name: ga4EventName(ev.eventName), params }] }), signal: AbortSignal.timeout(8000) }
    );
    return { ok: res.ok };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "GA4 MP request failed" };
  }
}

/** Fire all configured server-side destinations. */
export async function trackServerSide(env: Env, ev: ServerEvent): Promise<{ capi: boolean; ga4: boolean }> {
  const settings = await getPublicSettings(env.DB);
  if (settings.serverTrackingEnabled === "false") return { capi: false, ga4: false };
  const [capi, ga4] = await Promise.all([sendMetaCapi(env, ev), sendGa4Mp(env, ev)]);
  return { capi: capi.ok, ga4: ga4.ok };
}
