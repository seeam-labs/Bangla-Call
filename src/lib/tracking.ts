// Unified client-side marketing tracking.
// Injects (only when configured, format-validated): Google Tag Manager, GA4
// (gtag), Meta Pixel, and the Google Search Console verification meta tag.
// Dispatches events to GA4 + Pixel + dataLayer AND the server-side relay
// (/api/track → Meta CAPI + GA4 MP) using a shared event_id for deduplication.

type Dict = Record<string, unknown>;
interface TrackingSettings {
  gtmContainerId?: string;
  gaMeasurementId?: string;
  metaPixelId?: string;
  googleSiteVerification?: string;
}

let initialized = false;

function getCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
}

export function getFbp(): string | undefined {
  return getCookie("_fbp");
}

export function getFbc(): string | undefined {
  const existing = getCookie("_fbc");
  if (existing) return existing;
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}

// GA client id is the last two dot-parts of the _ga cookie (GA1.1.<cid>).
export function getGaClientId(): string | undefined {
  const ga = getCookie("_ga");
  if (!ga) return undefined;
  const parts = ga.split(".");
  return parts.length >= 4 ? parts.slice(-2).join(".") : undefined;
}

export function newEventId(): string {
  try { if (crypto?.randomUUID) return crypto.randomUUID(); } catch { /* noop */ }
  return `${Date.now()}.${Math.random().toString(16).slice(2)}`;
}

function ga4Name(event: string): string {
  const map: Record<string, string> = { Lead: "generate_lead", Contact: "contact", PageView: "page_view", Search: "search" };
  return map[event] || event.toLowerCase().replace(/[^a-z0-9_]/g, "_");
}

/** Inject configured tags. Safe to call once after the app mounts. */
export function initTracking(settings: TrackingSettings): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const w = window as unknown as Dict & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; fbq?: any; _fbq?: unknown };
  w.dataLayer = (w.dataLayer as unknown[]) || [];

  // Google Search Console verification meta tag.
  const gsc = settings.googleSiteVerification;
  if (gsc && /^[A-Za-z0-9_-]{10,100}$/.test(gsc) && !document.querySelector('meta[name="google-site-verification"]')) {
    const m = document.createElement("meta");
    m.name = "google-site-verification";
    m.content = gsc;
    document.head.appendChild(m);
  }

  // Google Tag Manager.
  const gtm = settings.gtmContainerId;
  if (gtm && /^GTM-[A-Z0-9]+$/.test(gtm)) {
    (w.dataLayer as unknown[]).push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${gtm}`;
    document.head.appendChild(s);
    const ns = document.createElement("noscript");
    const ifr = document.createElement("iframe");
    ifr.src = `https://www.googletagmanager.com/ns.html?id=${gtm}`;
    ifr.height = "0"; ifr.width = "0"; ifr.style.display = "none"; ifr.style.visibility = "hidden";
    ns.appendChild(ifr);
    document.body.insertBefore(ns, document.body.firstChild);
  }

  // GA4 (gtag.js) — works standalone or alongside GTM.
  const ga = settings.gaMeasurementId;
  if (ga && /^G-[A-Z0-9]+$/.test(ga)) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
    document.head.appendChild(s);
    const gtag = function (...args: unknown[]) { (w.dataLayer as unknown[]).push(args); };
    w.gtag = w.gtag || gtag;
    w.gtag("js", new Date());
    w.gtag("config", ga);
  }

  // Meta Pixel.
  const pixel = settings.metaPixelId;
  if (pixel && /^\d{6,20}$/.test(pixel)) {
    /* eslint-disable */
    (function (f: any, b: Document, e: string, v: string) {
      if (f.fbq) return;
      const n: any = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement; t.async = true; t.src = v;
      const s = b.getElementsByTagName(e)[0]; s.parentNode!.insertBefore(t, s);
    })(w, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    w.fbq("init", pixel);
    w.fbq("track", "PageView");
  }
}

/**
 * Dispatch an event to all destinations with a shared event_id.
 * Pass userData (email/phone) for higher CAPI match quality on conversions.
 */
export function track(event: string, params: Dict = {}, userData?: { email?: string; phone?: string }): string {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: any; dataLayer?: unknown[] };
  const eventId = newEventId();
  try { w.gtag?.("event", ga4Name(event), params); } catch { /* noop */ }
  try { w.fbq?.("track", event, params, { eventID: eventId }); } catch { /* noop */ }
  try { (w.dataLayer = w.dataLayer || []).push({ event, ...params }); } catch { /* noop */ }
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        event,
        eventId,
        url: window.location.href,
        value: params.value,
        currency: params.currency,
        email: userData?.email,
        phone: userData?.phone,
        fbp: getFbp(),
        fbc: getFbc(),
        clientId: getGaClientId(),
      }),
    }).catch(() => {});
  } catch { /* noop */ }
  return eventId;
}

/**
 * Lead conversion. Fires the client Pixel/GA4 "Lead" and returns the attribution
 * bundle (with the shared eventId) to POST alongside the lead so the server can
 * fire the deduped Meta CAPI event. Does NOT hit /api/track (leads/submit does).
 */
export function trackLeadClient(value?: number): {
  eventId: string; fbp?: string; fbc?: string; clientId?: string; pageUrl: string;
} {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: any; dataLayer?: unknown[] };
  const eventId = newEventId();
  const params: Dict = value != null ? { value, currency: "BDT" } : {};
  try { w.gtag?.("event", "generate_lead", params); } catch { /* noop */ }
  try { w.fbq?.("track", "Lead", params, { eventID: eventId }); } catch { /* noop */ }
  try { (w.dataLayer = w.dataLayer || []).push({ event: "Lead", ...params }); } catch { /* noop */ }
  return { eventId, fbp: getFbp(), fbc: getFbc(), clientId: getGaClientId(), pageUrl: window.location.href };
}
