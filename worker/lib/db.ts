import type { Env } from "./types";
import { hashPassword, randomId } from "./crypto";
import { SCHEMA_STATEMENTS } from "./schema";

export const DEFAULT_WIDGETS = [
  { id: "hero", title_bn: "প্রধান সেকশন", title_en: "Main View", icon_name: "Sparkles", col_span: "full" },
  { id: "ai-valuation", title_bn: "স্মার্ট নাম্বার ফাইন্ডার", title_en: "Smart Number Finder", icon_name: "Sparkles", col_span: "full" },
  { id: "lead-form-section", title_bn: "আবেদন ফর্ম", title_en: "Application Form", icon_name: "FileText", col_span: "full" },
  { id: "trust", title_bn: "আস্থা ও নিরাপত্তা", title_en: "Trust & Security", icon_name: "ShieldCheck", col_span: "full" },
  { id: "coverage", title_bn: "কভারেজ ম্যাপ", title_en: "Coverage Map", icon_name: "Map", col_span: "1" },
  { id: "onboarding", title_bn: "অনবোর্ডিং রোডম্যাপ", title_en: "Onboarding Roadmap", icon_name: "Route", col_span: "2" },
  { id: "pricing", title_bn: "প্রাইসিং পলিসি", title_en: "Pricing Policy", icon_name: "CreditCard", col_span: "full" },
  { id: "comparison", title_bn: "তুলনামূলক বিশ্লেষণ", title_en: "Comparison Analysis", icon_name: "BarChart2", col_span: "2" },
  { id: "calculator", title_bn: "রেট ক্যালকুলেটর", title_en: "Rate Calculator", icon_name: "Calculator", col_span: "1" },
  { id: "offers", title_bn: "অফার সমূহ", title_en: "Special Offers", icon_name: "Sparkles", col_span: "2" },
  { id: "corporate", title_bn: "কর্পোরেট সমাধান", title_en: "Corporate Solutions", icon_name: "ShieldCheck", col_span: "full" },
  { id: "success-stories", title_bn: "সাফল্যের গল্প", title_en: "Success Stories", icon_name: "Sparkles", col_span: "full" },
  { id: "refer", title_bn: "রেফার করুন", title_en: "Refer a Friend", icon_name: "Share2", col_span: "2" },
  { id: "faq", title_bn: "সাধারণ প্রশ্ন উত্তর", title_en: "FAQs", icon_name: "HelpCircle", col_span: "full" },
];

/**
 * Idempotent bootstrap. Creates the schema (no migration tooling needed),
 * seeds widgets, and — only if BOOTSTRAP env vars are set — an admin user.
 * Otherwise the first-run setup wizard creates the owner account.
 * Guarded by a KV flag so it's near-free after the first request.
 */
export async function ensureInitialized(env: Env): Promise<void> {
  const flag = await env.KV.get("init:v2");
  if (flag === "1") return;

  // 1) Schema (idempotent). Run each statement individually rather than in a
  //    single batch/transaction, to avoid any DDL-in-transaction edge cases.
  for (const sql of SCHEMA_STATEMENTS) {
    await env.DB.prepare(sql).run();
  }

  // 1b) Best-effort column adds for deploys created before v2 (SQLite has no
  //     ADD COLUMN IF NOT EXISTS, so run each individually and ignore dupes).
  const ALTERS = [
    "ALTER TABLE visitors ADD COLUMN ua_browser TEXT",
    "ALTER TABLE visitors ADD COLUMN ua_os TEXT",
    "ALTER TABLE visitors ADD COLUMN device_type TEXT",
    "ALTER TABLE visitors ADD COLUMN country TEXT",
    "ALTER TABLE visitors ADD COLUMN city TEXT",
    "ALTER TABLE visitors ADD COLUMN region TEXT",
    "ALTER TABLE visitors ADD COLUMN timezone TEXT",
    "ALTER TABLE visitors ADD COLUMN asn TEXT",
    "ALTER TABLE visitors ADD COLUMN isp TEXT",
    "ALTER TABLE visitors ADD COLUMN colo TEXT",
  ];
  for (const sql of ALTERS) {
    try { await env.DB.prepare(sql).run(); } catch { /* column already exists */ }
  }

  // 2) Seed widgets if none exist.
  const wc = await env.DB.prepare("SELECT COUNT(*) AS c FROM widgets").first<{ c: number }>();
  if (!wc || wc.c === 0) {
    const stmts = DEFAULT_WIDGETS.map((w, i) =>
      env.DB.prepare(
        `INSERT OR IGNORE INTO widgets
           (id, title_bn, title_en, icon_name, visible, default_collapsed, sort_order, col_span)
         VALUES (?1, ?2, ?3, ?4, 1, 0, ?5, ?6)`
      ).bind(w.id, w.title_bn, w.title_en, w.icon_name, i, w.col_span)
    );
    await env.DB.batch(stmts);
  }

  // 3) OPTIONAL admin bootstrap via env (advanced). Normally the setup wizard
  //    creates the first owner, so we do NOT create a default-password admin.
  if (env.ADMIN_BOOTSTRAP_USER && env.ADMIN_BOOTSTRAP_PASSWORD) {
    const ac = await env.DB.prepare("SELECT COUNT(*) AS c FROM admin_users").first<{ c: number }>();
    if (!ac || ac.c === 0) {
      const hash = await hashPassword(env.ADMIN_BOOTSTRAP_PASSWORD);
      await env.DB.prepare(
        `INSERT INTO admin_users (id, username, password_hash, role, name, must_change_pw)
         VALUES (?1, ?2, ?3, 'Super Admin', 'System Administrator', 1)`
      ).bind(randomId("usr_"), env.ADMIN_BOOTSTRAP_USER, hash).run();
    }
  }

  await env.KV.put("init:v2", "1");
}

export async function audit(
  env: Env,
  actor: string | undefined,
  action: string,
  target?: string,
  ipHash?: string
): Promise<void> {
  try {
    await env.DB.prepare(
      "INSERT INTO audit_log (actor, action, target, ip_hash) VALUES (?1, ?2, ?3, ?4)"
    ).bind(actor ?? "system", action, target ?? null, ipHash ?? null).run();
  } catch {
    /* non-fatal */
  }
}
