import { Hono } from "hono";
import type { Env, Vars } from "./lib/types";
import { ensureInitialized, audit } from "./lib/db";
import { requireAdmin, issueToken } from "./lib/auth";
import { hashPassword, verifyPassword, sha256Hex } from "./lib/crypto";
import { rateLimit, clientIp } from "./lib/ratelimit";
import { sendTelegramMessage, getUpdatesChatId, escapeHtml } from "./lib/telegram";
import { evaluateNumber, generateBanner, listModels, testAi, getAiConfig } from "./lib/ai";
import {
  storeUpload, readUpload, verifyFileToken, signedFileUrl,
  deleteUpload, attachUploadsToLead, getStorageUsage, findOrphans, purgeAllUploads,
} from "./lib/storage";
import { getClientInfo } from "./lib/clientinfo";
import { cfR2Usage, cfD1Size, cfWorkerMetrics, cfVerifyToken, getCfCreds } from "./lib/cfapi";
import { trackServerSide } from "./lib/tracking";
import {
  getPublicSettings, getSecretStatus, saveSettings, getSecretValue,
} from "./lib/settings";
import {
  leadSchema, loginSchema, changePasswordSchema, widgetsArraySchema,
  numberQuerySchema, evaluateSchema, aiConfigSchema, setupSchema, trackSchema,
} from "./lib/validation";

const app = new Hono<{ Bindings: Env; Variables: Vars }>().basePath("/api");

// Security headers on all API responses (static assets get theirs from _headers).
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Cache-Control", "no-store");
});

// Ensure DB is seeded (cheap; guarded by KV flag).
app.use("*", async (c, next) => {
  try { await ensureInitialized(c.env); } catch { /* surfaced on first real query */ }
  await next();
});

const ipHash = async (c: { req: { raw: Request } }) => sha256Hex("bc-salt|" + clientIp(c.req.raw));

// Fire-and-forget: run a promise without delaying the response.
function bg(c: { executionCtx?: { waitUntil(p: Promise<unknown>): void } }, p: Promise<unknown>): void {
  try { c.executionCtx?.waitUntil(p.catch(() => {})); } catch { p.catch(() => {}); }
}

async function resolveGeminiKey(c: { env: Env }) {
  return c.env.GEMINI_API_KEY || (await getSecretValue(c.env.DB, "geminiApiKey"));
}
async function resolveTelegram(c: { env: Env }) {
  const token = c.env.TELEGRAM_BOT_TOKEN || (await getSecretValue(c.env.DB, "telegramBotToken"));
  const chatId = c.env.TELEGRAM_CHAT_ID || (await getSecretValue(c.env.DB, "telegramChatId"));
  return { token, chatId };
}

/* ============================== PUBLIC ============================== */

app.get("/settings", async (c) => c.json(await getPublicSettings(c.env.DB)));

app.get("/widgets", async (c) => {
  const rows = await c.env.DB
    .prepare("SELECT * FROM widgets WHERE visible = 1 ORDER BY sort_order ASC")
    .all<any>();
  const widgets = (rows.results ?? []).map((w) => ({
    id: w.id, titleBn: w.title_bn, titleEn: w.title_en, iconName: w.icon_name,
    visible: !!w.visible, defaultCollapsed: !!w.default_collapsed, order: w.sort_order, colSpan: w.col_span,
  }));
  return c.json({ widgets });
});

app.get("/live-stats", async (c) => {
  const s = await getPublicSettings(c.env.DB);
  if (s.liveStatsEnabled === "false") return c.json({ enabled: false, activeUsers: 0, callsToday: 0 });
  // Ground "active users" in the REAL count of visitors active in the last 5 min,
  // on top of an owner-configured display baseline (their marketing figure).
  let live = 0;
  try {
    const row = await c.env.DB
      .prepare("SELECT COUNT(*) AS c FROM live_sessions WHERE last_seen >= datetime('now','-5 minutes')")
      .first<{ c: number }>();
    live = row?.c ?? 0;
  } catch { /* table may not exist yet on very first hit */ }
  const activeBase = Number(s.liveStatsActiveBase) || 0;
  const callsBase = Number(s.liveStatsCallsBase) || 0;
  const now = new Date();
  const dayProgress = now.getUTCHours() * 60 + now.getUTCMinutes(); // grows through the day
  return c.json({
    enabled: true,
    activeUsers: activeBase + live,
    callsToday: callsBase + dayProgress,
  });
});

async function checkAvailability(c: any, raw: string) {
  const q = (raw || "").replace(/\D/g, "");
  if (!q) return { number: raw, available: null as boolean | null, error: "empty" };
  const settings = await getPublicSettings(c.env.DB);
  const base = settings.numberAvailabilityApi || "https://amarip.net/api/sip-username-available";
  const url = `${base}?q=${encodeURIComponent(q)}`;
  const attempt = async (): Promise<boolean | null> => {
    const res = await fetch(url, {
      headers: { "User-Agent": "BanglaCall/1.0 (+availability-check)", Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error("upstream " + res.status);
    const data = (await res.json()) as { available?: boolean };
    // Only trust a real boolean; anything else is "unknown" (null), never a guess.
    return typeof data.available === "boolean" ? data.available : null;
  };
  try {
    return { number: q, available: await attempt() };
  } catch {
    try {
      return { number: q, available: await attempt() }; // one retry for transient failures
    } catch {
      return { number: q, available: null as boolean | null, error: "unreachable" };
    }
  }
}

app.get("/number/check", async (c) => c.json(await checkAvailability(c, c.req.query("q") || "")));
app.post("/number/availability", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = numberQuerySchema.safeParse(body);
  if (!parsed.success) return c.json({ available: null, error: "invalid" }, 400);
  return c.json(await checkAvailability(c, parsed.data.number));
});

app.post("/ai/evaluate-number", async (c) => {
  const rl = await rateLimit(c.env, "ai", await ipHash(c), 30, 60);
  const body = await c.req.json().catch(() => ({}));
  const parsed = evaluateSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Valid phone number is required" }, 400);
  if (!rl.allowed) {
    const { fallbackEvaluateNumber } = await import("./lib/ai");
    return c.json(fallbackEvaluateNumber(parsed.data.number));
  }
  const env = { ...c.env, GEMINI_API_KEY: await resolveGeminiKey(c) };
  return c.json(await evaluateNumber(env, c.env.DB, parsed.data.number));
});

app.post("/seasonal-banner", async (c) => {
  const rl = await rateLimit(c.env, "banner", await ipHash(c), 10, 60);
  if (!rl.allowed) return c.json({ banner: "" });
  const body = await c.req.json().catch(() => ({}));
  const env = { ...c.env, GEMINI_API_KEY: await resolveGeminiKey(c) };
  const banner = await generateBanner(env, c.env.DB, body);
  return c.json({ banner: banner || "" });
});

app.post("/visitor/log", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const info = getClientInfo(c.req.raw);
  await c.env.DB.prepare(
    `INSERT INTO visitors (ip_hash, page, referrer, user_agent, ua_browser, ua_os, device_type, country, city, region, timezone, asn, isp, colo)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14)`
  ).bind(
    await ipHash(c),
    String(body?.page || "/").slice(0, 200),
    (c.req.header("referer") || "Direct").slice(0, 300),
    (c.req.header("user-agent") || "Unknown").slice(0, 400),
    info.browser, info.os, info.deviceType, info.country, info.city, info.region,
    info.timezone, info.asn, info.isp, info.colo
  ).run();
  // Cap table size cheaply.
  await c.env.DB.prepare(
    "DELETE FROM visitors WHERE id NOT IN (SELECT id FROM visitors ORDER BY id DESC LIMIT 5000)"
  ).run();
  await c.env.DB.prepare(
    "INSERT INTO counters (name, value) VALUES ('pageviews', 1) ON CONFLICT(name) DO UPDATE SET value = value + 1"
  ).run();
  return c.json({ ok: true });
});

// Server-side tracking relay (Meta CAPI + GA4 MP) for client events.
app.post("/track", async (c) => {
  const rl = await rateLimit(c.env, "track", await ipHash(c), 60, 60);
  if (!rl.allowed) return c.json({ ok: false }, 429);
  const body = await c.req.json().catch(() => ({}));
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) return c.json({ ok: false, error: "invalid" }, 400);
  const t = parsed.data;
  bg(c, trackServerSide(c.env, {
    eventName: t.event,
    eventId: t.eventId,
    eventSourceUrl: t.url,
    clientIp: clientIp(c.req.raw),
    userAgent: c.req.header("user-agent") || "",
    email: t.email,
    phone: t.phone,
    fbp: t.fbp,
    fbc: t.fbc,
    clientId: t.clientId,
    value: t.value,
    currency: t.currency,
  }));
  return c.json({ ok: true });
});

// Lightweight heartbeat for the live (active-now) counter.
app.post("/visitor/ping", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const info = getClientInfo(c.req.raw);
  const session = await sha256Hex("live|" + clientIp(c.req.raw) + "|" + (c.req.header("user-agent") || ""));
  await c.env.DB.prepare(
    `INSERT INTO live_sessions (session_hash, last_seen, page, country)
     VALUES (?1, datetime('now'), ?2, ?3)
     ON CONFLICT(session_hash) DO UPDATE SET last_seen=datetime('now'), page=?2`
  ).bind(session, String(body?.page || "/").slice(0, 200), info.country).run();
  return c.json({ ok: true });
});

// Image upload (live selfie / NID). Returns an opaque R2 key.
app.post("/uploads", async (c) => {
  const rl = await rateLimit(c.env, "upload", await ipHash(c), 20, 300);
  if (!rl.allowed) return c.json({ error: "Too many uploads, please wait." }, 429);
  const form = await c.req.raw.formData().catch(() => null);
  if (!form) return c.json({ error: "Invalid form data" }, 400);
  const kind = form.get("kind") === "nid" ? "nid" : "photo";
  const fileEntry = form.get("file");
  if (!fileEntry || typeof fileEntry === "string") return c.json({ error: "No file" }, 400);
  const file = fileEntry as unknown as File;
  const res = await storeUpload(c.env, kind, file.type, await file.arrayBuffer());
  if (!res.ok) return c.json({ error: res.error }, 400);
  return c.json({ ok: true, key: res.key });
});

// Serve a stored file via signed token (admin links / Telegram).
app.get("/files/:key{.+}", async (c) => {
  const key = c.req.param("key");
  const token = c.req.query("token") || "";
  if (!(await verifyFileToken(c.env, key, token))) return c.text("Forbidden", 403);
  const file = await readUpload(c.env, key);
  if (!file) return c.text("Not found", 404);
  return new Response(file.body as BodyInit, {
    headers: { "Content-Type": file.contentType, "Cache-Control": "private, max-age=3600" },
  });
});

app.post("/leads/submit", async (c) => {
  const rl = await rateLimit(c.env, "lead", await ipHash(c), 8, 300);
  if (!rl.allowed) return c.json({ error: "Too many submissions, please wait." }, 429);
  const body = await c.req.json().catch(() => ({}));
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid submission", details: parsed.error.flatten() }, 400);
  const d = parsed.data;

  const id = "LEAD-" + Date.now().toString(36).toUpperCase();
  await c.env.DB.prepare(
    `INSERT INTO leads (id, status, name, phone, email, number_choice, ai_recharge_amount,
       ai_tier_name, service_type, notes, source, photo_key, nid_key, ip_hash, user_agent)
     VALUES (?1,'new',?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14)`
  ).bind(
    id, d.name, d.phone, d.email || null, d.numberChoice || null,
    d.aiRechargeAmount ?? null, d.aiTierName || null, d.serviceType, d.notes || null,
    d.source || "Direct", d.photoKey || null, d.nidKey || null, await ipHash(c),
    (c.req.header("user-agent") || "Unknown").slice(0, 400)
  ).run();

  await attachUploadsToLead(c.env, id, [d.photoKey, d.nidKey]);

  // Server-side conversion (Meta CAPI + GA4 MP). Deduped with the client Pixel
  // via the shared eventId. Runs in the background so the response stays fast.
  bg(c, trackServerSide(c.env, {
    eventName: "Lead",
    eventId: d.eventId,
    eventSourceUrl: d.pageUrl,
    clientIp: clientIp(c.req.raw),
    userAgent: c.req.header("user-agent") || "",
    email: d.email || undefined,
    phone: d.phone,
    fbp: d.fbp,
    fbc: d.fbc,
    clientId: d.clientId,
    value: d.aiRechargeAmount,
    currency: "BDT",
    customData: { lead_id: id, service_type: d.serviceType },
  }));

  // Telegram alert (escaped; secrets resolved from env/D1).
  const { token, chatId } = await resolveTelegram(c);
  const settings = await getPublicSettings(c.env.DB);
  if (settings.telegramAlertsEnabled === "true" && token && chatId) {
    const origin = new URL(c.req.url).origin;
    const photoUrl = d.photoKey ? await signedFileUrl(c.env, origin, d.photoKey) : null;
    const nidUrl = d.nidKey ? await signedFileUrl(c.env, origin, d.nidKey) : null;
    const lines = [
      "🔔 <b>নতুন বাংলা কল আবেদন</b>",
      "",
      `👤 <b>নাম:</b> ${escapeHtml(d.name)}`,
      `📱 <b>ফোন:</b> ${escapeHtml(d.phone)}`,
      d.email ? `✉️ <b>ইমেইল:</b> ${escapeHtml(d.email)}` : "",
      `🔢 <b>পছন্দের নম্বর:</b> ${escapeHtml(d.numberChoice || "যেকোনো")}`,
      `💰 <b>১ম রিচার্জ (AI):</b> BDT ${escapeHtml(String(d.aiRechargeAmount ?? "N/A"))}`,
      `💼 <b>সার্ভিস:</b> ${escapeHtml(d.serviceType)}`,
      d.notes ? `📝 <b>নোট:</b> ${escapeHtml(d.notes)}` : "",
      photoUrl ? `📸 <a href="${photoUrl}">লাইভ ছবি</a>` : "",
      nidUrl ? `🆔 <a href="${nidUrl}">NID</a>` : "",
      `🆔 <b>Lead:</b> ${escapeHtml(id)}`,
    ].filter(Boolean);
    await sendTelegramMessage(token, chatId, lines.join("\n"));
  }

  return c.json({ success: true, id });
});

/* ============================== ADMIN ============================== */

// First-run setup: whether an owner account still needs to be created.
app.get("/admin/setup-status", async (c) => {
  const row = await c.env.DB.prepare("SELECT COUNT(*) AS c FROM admin_users").first<{ c: number }>();
  return c.json({ needsSetup: (row?.c ?? 0) === 0 });
});

// Create the first owner account. Only works while no admin exists.
app.post("/admin/setup", async (c) => {
  const rl = await rateLimit(c.env, "setup", await ipHash(c), 10, 300);
  if (!rl.allowed) return c.json({ error: "Too many attempts. Try again shortly." }, 429);
  const existing = await c.env.DB.prepare("SELECT COUNT(*) AS c FROM admin_users").first<{ c: number }>();
  if ((existing?.c ?? 0) > 0) return c.json({ error: "Setup already completed. Please sign in." }, 409);

  const body = await c.req.json().catch(() => ({}));
  const parsed = setupSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, 400);

  const { randomId } = await import("./lib/crypto");
  const id = randomId("usr_");
  const hash = await hashPassword(parsed.data.password);
  try {
    await c.env.DB.prepare(
      `INSERT INTO admin_users (id, username, password_hash, role, name, must_change_pw)
       VALUES (?1, ?2, ?3, 'Super Admin', 'Owner', 0)`
    ).bind(id, parsed.data.username, hash).run();
  } catch {
    return c.json({ error: "Could not create account (username may be taken)." }, 400);
  }
  const token = await issueToken(c.env, { id, username: parsed.data.username, role: "Super Admin" });
  await audit(c.env, parsed.data.username, "setup-owner", undefined, await ipHash(c));
  return c.json({ success: true, token, user: { username: parsed.data.username, role: "Super Admin", name: "Owner", mustChangePw: false } });
});

app.post("/admin/login", async (c) => {
  const rl = await rateLimit(c.env, "login", await ipHash(c), 8, 300);
  if (!rl.allowed) return c.json({ error: "Too many attempts. Try again later." }, 429);
  const body = await c.req.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "ভুল ইউজারনেম বা পাসওয়ার্ড" }, 400);
  const user = await c.env.DB
    .prepare("SELECT * FROM admin_users WHERE username = ?")
    .bind(parsed.data.username)
    .first<any>();
  if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) {
    return c.json({ error: "ভুল ইউজারনেম বা পাসওয়ার্ড" }, 401);
  }
  const token = await issueToken(c.env, { id: user.id, username: user.username, role: user.role });
  await audit(c.env, user.username, "login", undefined, await ipHash(c));
  return c.json({
    success: true, token,
    user: { username: user.username, role: user.role, name: user.name, mustChangePw: !!user.must_change_pw },
  });
});

const admin = new Hono<{ Bindings: Env; Variables: Vars }>();
admin.use("*", requireAdmin());

admin.get("/me", (c) => c.json({ user: c.get("admin") }));

admin.post("/change-password", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.issues[0]?.message || "Invalid" }, 400);
  const me = c.get("admin")!;
  const user = await c.env.DB.prepare("SELECT * FROM admin_users WHERE id = ?").bind(me.sub).first<any>();
  if (!user || !(await verifyPassword(parsed.data.oldPassword, user.password_hash))) {
    return c.json({ error: "পুরাতন পাসওয়ার্ড সঠিক নয়" }, 400);
  }
  await c.env.DB.prepare("UPDATE admin_users SET password_hash = ?, must_change_pw = 0 WHERE id = ?")
    .bind(await hashPassword(parsed.data.newPassword), me.sub).run();
  await audit(c.env, me.username, "change-password");
  return c.json({ success: true });
});

admin.get("/settings", async (c) =>
  c.json({ settings: await getPublicSettings(c.env.DB), secretStatus: await getSecretStatus(c.env.DB) })
);

admin.post("/settings", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  if (typeof body !== "object" || body === null) return c.json({ error: "Invalid" }, 400);
  await saveSettings(c.env.DB, body as Record<string, unknown>);
  await audit(c.env, c.get("admin")!.username, "update-settings");
  return c.json({ success: true, settings: await getPublicSettings(c.env.DB), secretStatus: await getSecretStatus(c.env.DB) });
});

admin.get("/widgets", async (c) => {
  const rows = await c.env.DB.prepare("SELECT * FROM widgets ORDER BY sort_order ASC").all<any>();
  const widgets = (rows.results ?? []).map((w) => ({
    id: w.id, titleBn: w.title_bn, titleEn: w.title_en, iconName: w.icon_name,
    visible: !!w.visible, defaultCollapsed: !!w.default_collapsed, order: w.sort_order, colSpan: w.col_span,
  }));
  return c.json({ widgets });
});

admin.post("/widgets", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = widgetsArraySchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid widget array" }, 400);
  const stmts = parsed.data.widgets.map((w, i) =>
    c.env.DB.prepare(
      `INSERT INTO widgets (id, title_bn, title_en, icon_name, visible, default_collapsed, sort_order, col_span)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8)
       ON CONFLICT(id) DO UPDATE SET title_bn=?2,title_en=?3,icon_name=?4,visible=?5,default_collapsed=?6,sort_order=?7,col_span=?8`
    ).bind(w.id, w.titleBn, w.titleEn, w.iconName, w.visible ? 1 : 0, w.defaultCollapsed ? 1 : 0, w.order ?? i, w.colSpan)
  );
  if (stmts.length) await c.env.DB.batch(stmts);
  await audit(c.env, c.get("admin")!.username, "update-widgets");
  return c.json({ success: true });
});

admin.post("/widgets/reset", async (c) => {
  const { DEFAULT_WIDGETS } = await import("./lib/db");
  await c.env.DB.prepare("DELETE FROM widgets").run();
  const stmts = DEFAULT_WIDGETS.map((w, i) =>
    c.env.DB.prepare(
      `INSERT INTO widgets (id, title_bn, title_en, icon_name, visible, default_collapsed, sort_order, col_span)
       VALUES (?1,?2,?3,?4,1,0,?5,?6)`
    ).bind(w.id, w.title_bn, w.title_en, w.icon_name, i, w.col_span)
  );
  await c.env.DB.batch(stmts);
  return c.json({ success: true });
});

admin.get("/leads", async (c) => {
  const rows = await c.env.DB.prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 1000").all<any>();
  const origin = new URL(c.req.url).origin;
  const leads = await Promise.all((rows.results ?? []).map(async (l) => ({
    id: l.id, createdAt: l.created_at, status: l.status, name: l.name, phone: l.phone,
    email: l.email, numberChoice: l.number_choice, aiRechargeAmount: l.ai_recharge_amount,
    aiTierName: l.ai_tier_name, serviceType: l.service_type, notes: l.notes, source: l.source,
    photoUrl: l.photo_key ? await signedFileUrl(c.env, origin, l.photo_key) : null,
    nidUrl: l.nid_key ? await signedFileUrl(c.env, origin, l.nid_key) : null,
  })));
  return c.json({ leads });
});

admin.post("/leads/status", async (c) => {
  const { id, status } = await c.req.json().catch(() => ({}));
  const allowed = ["new", "contacted", "converted", "closed", "junk"];
  if (!id || !allowed.includes(status)) return c.json({ error: "Invalid status" }, 400);
  await c.env.DB.prepare("UPDATE leads SET status = ? WHERE id = ?").bind(status, id).run();
  return c.json({ success: true });
});

admin.post("/leads/delete", async (c) => {
  const { id } = await c.req.json().catch(() => ({}));
  if (id === "ALL") {
    await purgeAllUploads(c.env);
    await c.env.DB.prepare("DELETE FROM leads").run();
  } else if (id) {
    const lead = await c.env.DB.prepare("SELECT photo_key, nid_key FROM leads WHERE id = ?").bind(id).first<{ photo_key: string; nid_key: string }>();
    if (lead?.photo_key) await deleteUpload(c.env, lead.photo_key);
    if (lead?.nid_key) await deleteUpload(c.env, lead.nid_key);
    await c.env.DB.prepare("DELETE FROM leads WHERE id = ?").bind(id).run();
  } else return c.json({ error: "Invalid" }, 400);
  await audit(c.env, c.get("admin")!.username, "delete-lead", String(id));
  return c.json({ success: true });
});

admin.post("/leads/create", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid", details: parsed.error.flatten() }, 400);
  const d = parsed.data;
  const id = "LEAD-" + Date.now().toString(36).toUpperCase();
  await c.env.DB.prepare(
    `INSERT INTO leads (id, status, name, phone, email, number_choice, ai_recharge_amount,
       ai_tier_name, service_type, notes, source)
     VALUES (?1,'new',?2,?3,?4,?5,?6,?7,?8,?9,'Admin Manual Entry')`
  ).bind(id, d.name, d.phone, d.email || null, d.numberChoice || null, d.aiRechargeAmount ?? null,
    d.aiTierName || null, d.serviceType, d.notes || null).run();
  return c.json({ success: true, id });
});

admin.get("/visitors", async (c) => {
  const rows = await c.env.DB.prepare("SELECT ts, page, referrer, user_agent FROM visitors ORDER BY id DESC LIMIT 500").all<any>();
  const total = await c.env.DB.prepare("SELECT COUNT(*) AS c FROM visitors").first<{ c: number }>();
  return c.json({ visitors: rows.results ?? [], totalCount: total?.c ?? 0 });
});

admin.post("/visitors/clear", async (c) => {
  await c.env.DB.prepare("DELETE FROM visitors").run();
  return c.json({ success: true });
});

/* ---- Telegram admin ---- */
admin.post("/telegram/test", async (c) => {
  const { token, chatId } = await resolveTelegram(c);
  if (!token || !chatId) return c.json({ error: "Configure the bot token and chat id first." }, 400);
  const r = await sendTelegramMessage(token, chatId,
    "🤖 <b>বাংলা কল এডমিন টেস্ট</b>\n\nটেলিগ্রাম সংযোগ সফল হয়েছে।");
  return r.ok ? c.json({ success: true }) : c.json({ error: r.error }, 400);
});

admin.get("/telegram/chat-id", async (c) => {
  const { token } = await resolveTelegram(c);
  if (!token) return c.json({ error: "Set the bot token first." }, 400);
  const r = await getUpdatesChatId(token);
  return r.ok ? c.json({ chatId: r.chatId }) : c.json({ error: r.error }, 400);
});

/* ---- AI admin ---- */
admin.get("/ai/config", async (c) => {
  const cfg = await getAiConfig(c.env.DB);
  const keyConfigured = !!(await resolveGeminiKey(c));
  return c.json({ ...cfg, enabled: !!cfg.enabled, keyConfigured });
});

admin.post("/ai/config", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = aiConfigSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid" }, 400);
  const d = parsed.data;
  const cur = await getAiConfig(c.env.DB);
  await c.env.DB.prepare("UPDATE ai_config SET model=?1, enabled=?2, daily_limit=?3 WHERE id=1")
    .bind(d.model ?? cur.model, (d.enabled ?? !!cur.enabled) ? 1 : 0, d.dailyLimit ?? cur.daily_limit).run();
  await audit(c.env, c.get("admin")!.username, "update-ai-config");
  return c.json({ success: true });
});

admin.get("/ai/models", async (c) => {
  const key = await resolveGeminiKey(c);
  const r = await listModels(key);
  return r.ok ? c.json({ models: r.models }) : c.json({ error: r.error }, 400);
});

admin.post("/ai/test", async (c) => {
  const env = { ...c.env, GEMINI_API_KEY: await resolveGeminiKey(c) };
  const r = await testAi(env, c.env.DB);
  return r.ok ? c.json(r) : c.json(r, 400);
});

admin.get("/audit", async (c) => {
  const rows = await c.env.DB.prepare("SELECT ts, actor, action, target FROM audit_log ORDER BY id DESC LIMIT 200").all<any>();
  return c.json({ log: rows.results ?? [] });
});

/* ---- Storage management ---- */
admin.get("/storage", async (c) => {
  const usage = await getStorageUsage(c.env);
  const settings = await getPublicSettings(c.env.DB);

  // D1 row counts (real).
  const tables = ["leads", "visitors", "uploads", "live_sessions", "audit_log", "content_items", "widgets"];
  const rowCounts: Record<string, number> = {};
  for (const t of tables) {
    const r = await c.env.DB.prepare(`SELECT COUNT(*) AS c FROM ${t}`).first<{ c: number }>();
    rowCounts[t] = r?.c ?? 0;
  }

  // KV upload-fallback key count (bounded).
  let kvUploadKeys = 0;
  try {
    const list = await c.env.KV.list({ prefix: "upload:", limit: 1000 });
    kvUploadKeys = list.keys.length;
  } catch { /* ignore */ }

  // Authoritative Cloudflare numbers (only if a token is configured).
  const creds = await getCfCreds(c.env);
  let cf: { r2?: { bytes: number; objects: number } | null; d1?: { bytes: number; tables: number } | null } | null = null;
  if (creds) {
    cf = {
      r2: c.env.UPLOADS ? await cfR2Usage(c.env, "banglacall-uploads") : null,
      d1: await cfD1Size(c.env, "banglacall-db"),
    };
  }

  const orphans = await findOrphans(c.env);
  return c.json({
    store: usage.store,
    self: { totalBytes: usage.totalBytes, totalObjects: usage.totalObjects, byKind: usage.byKind },
    allowances: { r2FreeGb: Number(settings.r2FreeGb) || 10, d1FreeGb: Number(settings.d1FreeGb) || 5 },
    d1: { rowCounts },
    kv: { uploadKeys: kvUploadKeys },
    orphans: { count: orphans.length, bytes: orphans.reduce((s, o) => s + (o.bytes || 0), 0) },
    cf,
    cfConfigured: !!creds,
  });
});

admin.post("/uploads/delete", async (c) => {
  const { key } = await c.req.json().catch(() => ({}));
  if (!key) return c.json({ error: "key required" }, 400);
  await deleteUpload(c.env, String(key));
  // Detach from any lead that referenced it.
  await c.env.DB.prepare("UPDATE leads SET photo_key = NULL WHERE photo_key = ?").bind(key).run();
  await c.env.DB.prepare("UPDATE leads SET nid_key = NULL WHERE nid_key = ?").bind(key).run();
  await audit(c.env, c.get("admin")!.username, "delete-upload", String(key));
  return c.json({ success: true });
});

admin.post("/storage/purge", async (c) => {
  const { scope } = await c.req.json().catch(() => ({}));
  if (scope === "all") {
    const n = await purgeAllUploads(c.env);
    await c.env.DB.prepare("UPDATE leads SET photo_key = NULL, nid_key = NULL").run();
    await audit(c.env, c.get("admin")!.username, "purge-all-uploads", String(n));
    return c.json({ success: true, deleted: n });
  }
  // default: orphans only
  const orphans = await findOrphans(c.env);
  for (const o of orphans) await deleteUpload(c.env, o.key);
  await audit(c.env, c.get("admin")!.username, "purge-orphans", String(orphans.length));
  return c.json({ success: true, deleted: orphans.length });
});

/* ---- Visitor analytics ---- */
admin.get("/analytics/overview", async (c) => {
  const pv = await c.env.DB.prepare("SELECT value FROM counters WHERE name = 'pageviews'").first<{ value: number }>();
  const totalLeads = await c.env.DB.prepare("SELECT COUNT(*) AS c FROM leads").first<{ c: number }>();
  const unique = await c.env.DB.prepare("SELECT COUNT(DISTINCT ip_hash) AS c FROM visitors").first<{ c: number }>();
  const today = await c.env.DB.prepare("SELECT COUNT(*) AS c FROM visitors WHERE ts >= datetime('now','-1 day')").first<{ c: number }>();
  const week = await c.env.DB.prepare("SELECT COUNT(*) AS c FROM visitors WHERE ts >= datetime('now','-7 day')").first<{ c: number }>();

  // Prune stale live sessions, then count active in the last 5 minutes.
  await c.env.DB.prepare("DELETE FROM live_sessions WHERE last_seen < datetime('now','-30 minutes')").run();
  const live = await c.env.DB.prepare("SELECT COUNT(*) AS c FROM live_sessions WHERE last_seen >= datetime('now','-5 minutes')").first<{ c: number }>();

  const grp = async (col: string, limit = 8) => {
    const r = await c.env.DB.prepare(
      `SELECT ${col} AS k, COUNT(*) AS c FROM visitors WHERE ${col} IS NOT NULL AND ${col} != '' GROUP BY ${col} ORDER BY c DESC LIMIT ?`
    ).bind(limit).all<{ k: string; c: number }>();
    return r.results ?? [];
  };
  const series = await c.env.DB.prepare(
    "SELECT date(ts) AS d, COUNT(*) AS c FROM visitors WHERE ts >= datetime('now','-14 day') GROUP BY date(ts) ORDER BY d"
  ).all<{ d: string; c: number }>();

  return c.json({
    totals: { pageviews: pv?.value ?? 0, uniqueRecent: unique?.c ?? 0, leads: totalLeads?.c ?? 0, today: today?.c ?? 0, week: week?.c ?? 0 },
    live: live?.c ?? 0,
    series: series.results ?? [],
    devices: await grp("device_type"),
    browsers: await grp("ua_browser"),
    os: await grp("ua_os"),
    countries: await grp("country"),
    cities: await grp("city"),
    isps: await grp("isp"),
    topPages: await grp("page"),
    referrers: await grp("referrer"),
  });
});

/* ---- Edge health & runtime status ---- */
admin.get("/health", async (c) => {
  const info = getClientInfo(c.req.raw);
  const creds = await getCfCreds(c.env);
  const workers = creds ? await cfWorkerMetrics(c.env, "bangla-call") : null;
  return c.json({
    status: "healthy",
    runtime: "Cloudflare Workers (V8 isolate)",
    memoryLimitMb: 128,
    serving: { colo: info.colo, country: info.country, region: info.region, timezone: info.timezone },
    time: new Date().toISOString(),
    workers, // {requests, errors, cpuP50, cpuP99} when a CF token is configured
    cfConfigured: !!creds,
  });
});

/* ---- Retention (run now) ---- */
admin.post("/retention/run", async (c) => {
  const { purgeRetention } = await import("./lib/retention");
  const res = await purgeRetention(c.env);
  await audit(c.env, c.get("admin")!.username, "retention-run", JSON.stringify(res));
  return c.json({ success: true, ...res });
});

/* ---- Export ---- */
admin.get("/export", async (c) => {
  const type = c.req.query("type") === "visitors" ? "visitors" : "leads";
  const format = c.req.query("format") === "json" ? "json" : "csv";
  const rows = await c.env.DB.prepare(`SELECT * FROM ${type} ORDER BY 1 DESC LIMIT 10000`).all<any>();
  const data = rows.results ?? [];
  if (format === "json") {
    return new Response(JSON.stringify(data, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="${type}.json"` },
    });
  }
  const cols = data.length ? Object.keys(data[0]) : [];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...data.map((r) => cols.map((k) => esc(r[k])).join(","))].join("\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${type}.csv"` },
  });
});

/* ---- Cloudflare API token test ---- */
admin.post("/cf/test", async (c) => {
  const r = await cfVerifyToken(c.env);
  return r.ok ? c.json({ success: true }) : c.json({ error: r.error }, 400);
});

app.route("/admin", admin);

app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
  console.error("API error:", err);
  return c.json({ error: "Internal error" }, 500);
});

// Workers entry. Static assets + SPA fallback are handled by the platform;
// this Worker runs for /api/* (fetch) and on the retention cron (scheduled).
export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil((async () => {
      try {
        await ensureInitialized(env);
        const { purgeRetention } = await import("./lib/retention");
        await purgeRetention(env);
      } catch (e) {
        console.error("scheduled retention failed:", e);
      }
    })());
  },
};
