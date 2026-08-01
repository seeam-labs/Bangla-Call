// Extract real device + geo/network info from the request. No dependencies.

export interface ClientInfo {
  browser: string;
  os: string;
  deviceType: string; // mobile | tablet | desktop | bot
  country: string;
  city: string;
  region: string;
  timezone: string;
  asn: string;
  isp: string;
  colo: string;
}

export function parseUserAgent(ua: string): { browser: string; os: string; deviceType: string } {
  const s = ua || "";
  // Browser
  let browser = "Unknown";
  if (/Edg\//.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/.test(s)) browser = "Opera";
  else if (/SamsungBrowser/.test(s)) browser = "Samsung Internet";
  else if (/Chrome\//.test(s)) browser = "Chrome";
  else if (/CriOS/.test(s)) browser = "Chrome (iOS)";
  else if (/Firefox\//.test(s) || /FxiOS/.test(s)) browser = "Firefox";
  else if (/Safari\//.test(s) && /Version\//.test(s)) browser = "Safari";
  else if (/bot|crawler|spider|crawling/i.test(s)) browser = "Bot";

  // OS
  let os = "Unknown";
  if (/Windows NT 10/.test(s)) os = "Windows";
  else if (/Windows/.test(s)) os = "Windows";
  else if (/Android/.test(s)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(s)) os = "iOS";
  else if (/Mac OS X/.test(s)) os = "macOS";
  else if (/Linux/.test(s)) os = "Linux";

  // Device type
  let deviceType = "desktop";
  if (/bot|crawler|spider/i.test(s)) deviceType = "bot";
  else if (/iPad|Tablet/.test(s)) deviceType = "tablet";
  else if (/Mobi|Android|iPhone/.test(s)) deviceType = "mobile";

  return { browser, os, deviceType };
}

export function getClientInfo(req: Request): ClientInfo {
  const cf = (req as unknown as { cf?: Record<string, unknown> }).cf || {};
  const ua = req.headers.get("user-agent") || "";
  const parsed = parseUserAgent(ua);
  const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));
  return {
    ...parsed,
    country: str(cf.country),
    city: str(cf.city),
    region: str(cf.region),
    timezone: str(cf.timezone),
    asn: str(cf.asn),
    isp: str(cf.asOrganization),
    colo: str(cf.colo),
  };
}
