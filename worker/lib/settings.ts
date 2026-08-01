// Settings: strict split between PUBLIC (safe to serve to any visitor) and
// SECRET (write-only; values NEVER returned to any client).

export const DEFAULT_PUBLIC_SETTINGS: Record<string, string> = {
  brandNameBn: "বাংলা কল (Bangla Call)",
  brandNameEn: "Bangla Call IPTSP",
  companyNameBn: "Sarker Communication (সরকার কমিউনিকেশন)",
  companyNameEn: "Sarker Communication",
  licenseNo: "Govt Permit: 09649 (IPTSP)",
  btrcLicenseNo: "Govt Permit: 09649 (IPTSP)",
  prefix: "09649",
  callRate: "30 Paisa / Min",
  callRateBn: "মাত্র ৩০ পয়সা / মিনিট",
  helpline1: "09649000005",
  helpline2: "09649000006",
  phone: "09649000005",
  whatsappNumber: "+8801550059293",
  salesEmail: "sales@sarkercommunication.com",
  technicalEmail: "iptsp@sarkercommunication.com",
  billingEmail: "billing@sarkercommunication.com",
  email: "iptsp@sarkercommunication.com",
  officialWebsite: "www.banglacalls.com",
  addressBn: "05, বি-বাড়িয়া স্কুল মার্কেট, ব্রাহ্মণবাড়িয়া",
  addressEn: "05, B-Baria School Market, Brahmanbaria",
  kycUrl: "https://kyc.amarip.net",
  orderUrl: "https://amarip.ihp.bd/telephone",
  taglineBn: "বিটিআরসি অনুমোদিত আইপি টেলিফোনি সেবা",
  taglineEn: "BTRC Licensed IP Telephony Service",
  activePalette: "royal-blue",
  // Analytics snippet IDs (safer than raw script injection). Optional.
  gaMeasurementId: "",
  metaPixelId: "",
  gtmContainerId: "",
  googleSiteVerification: "",
  metaTestEventCode: "",
  serverTrackingEnabled: "true",
  // Non-secret feature flags
  telegramAlertsEnabled: "true",
  requireLivePhoto: "false",
  requireNid: "false",
  numberAvailabilityApi: "https://amarip.net/api/sip-username-available",
  // Live-stats social-proof banner (owner-configured display figures).
  liveStatsEnabled: "true",
  liveStatsActiveBase: "12000",
  liveStatsCallsBase: "85000",
  // Storage / retention / monitoring
  retentionPhotoDays: "90",       // auto-delete live photo/NID after N days (0 = keep)
  retentionVisitorDays: "180",    // auto-purge visitor logs after N days (0 = keep)
  r2FreeGb: "10",                 // free-tier allowance shown as "remaining" context
  d1FreeGb: "5",
  storageAlertPct: "80",          // Telegram alert when usage crosses this %
  cfAccountId: "",                // Cloudflare Account ID (for authoritative metrics)
};

// Secret settings live in D1 with is_secret=1. Their VALUES are never returned;
// only a boolean "configured" status is exposed to the authenticated admin.
export const SECRET_SETTING_KEYS = [
  "geminiApiKey",
  "telegramBotToken",
  "telegramChatId",
  "smsApiKey",
  "paymentApiKey",
  "cfApiToken",
  "metaCapiToken",
  "ga4ApiSecret",
] as const;
export type SecretSettingKey = (typeof SECRET_SETTING_KEYS)[number];

export type PublicSettings = Record<string, string>;

/** Merge DB public rows over defaults. Secret rows are excluded. */
export async function getPublicSettings(db: D1Database): Promise<PublicSettings> {
  const out: PublicSettings = { ...DEFAULT_PUBLIC_SETTINGS };
  const rows = await db
    .prepare("SELECT key, value FROM settings WHERE is_secret = 0")
    .all<{ key: string; value: string }>();
  for (const r of rows.results ?? []) out[r.key] = r.value;
  return out;
}

/** Which secret keys are configured (booleans only, never values). */
export async function getSecretStatus(db: D1Database): Promise<Record<string, boolean>> {
  const status: Record<string, boolean> = {};
  for (const k of SECRET_SETTING_KEYS) status[k] = false;
  const rows = await db
    .prepare("SELECT key, value FROM settings WHERE is_secret = 1")
    .all<{ key: string; value: string }>();
  for (const r of rows.results ?? []) status[r.key] = !!r.value;
  return status;
}

/** Persist a settings patch. Secret keys are stored with is_secret=1. */
export async function saveSettings(db: D1Database, patch: Record<string, unknown>): Promise<void> {
  const stmts: D1PreparedStatement[] = [];
  for (const [key, raw] of Object.entries(patch)) {
    if (raw === undefined || raw === null) continue;
    const isSecret = (SECRET_SETTING_KEYS as readonly string[]).includes(key) ? 1 : 0;
    // For secrets, an empty string means "leave unchanged" (write-only fields).
    if (isSecret && String(raw) === "") continue;
    const value = typeof raw === "string" ? raw : JSON.stringify(raw);
    stmts.push(
      db
        .prepare(
          `INSERT INTO settings (key, value, is_secret, updated_at)
           VALUES (?1, ?2, ?3, datetime('now'))
           ON CONFLICT(key) DO UPDATE SET value=?2, is_secret=?3, updated_at=datetime('now')`
        )
        .bind(key, value, isSecret)
    );
  }
  if (stmts.length) await db.batch(stmts);
}

/** Read one secret value server-side (for SMS/payment integrations). */
export async function getSecretValue(db: D1Database, key: SecretSettingKey): Promise<string> {
  const row = await db
    .prepare("SELECT value FROM settings WHERE key = ? AND is_secret = 1")
    .bind(key)
    .first<{ value: string }>();
  return row?.value ?? "";
}
