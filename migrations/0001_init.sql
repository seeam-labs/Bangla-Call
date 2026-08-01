-- Bangla Call — reference schema (the app also self-initializes this on first
-- request from worker/lib/schema.ts, so running migrations is optional).

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '',
  is_secret INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS widgets (
  id TEXT PRIMARY KEY, title_bn TEXT NOT NULL DEFAULT '', title_en TEXT NOT NULL DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT 'Sparkles', visible INTEGER NOT NULL DEFAULT 1,
  default_collapsed INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0,
  col_span TEXT NOT NULL DEFAULT 'full'
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'new', name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '',
  email TEXT, number_choice TEXT, ai_recharge_amount INTEGER, ai_tier_name TEXT,
  service_type TEXT NOT NULL DEFAULT 'personal', notes TEXT, source TEXT NOT NULL DEFAULT 'Direct',
  photo_key TEXT, nid_key TEXT, ip_hash TEXT, user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);

CREATE TABLE IF NOT EXISTS visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL DEFAULT (datetime('now')),
  ip_hash TEXT, page TEXT, referrer TEXT, user_agent TEXT,
  ua_browser TEXT, ua_os TEXT, device_type TEXT, country TEXT, city TEXT,
  region TEXT, timezone TEXT, asn TEXT, isp TEXT, colo TEXT
);
CREATE INDEX IF NOT EXISTS idx_visitors_ts ON visitors (ts DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors (country);

CREATE TABLE IF NOT EXISTS live_sessions (
  session_hash TEXT PRIMARY KEY, last_seen TEXT NOT NULL DEFAULT (datetime('now')),
  page TEXT, country TEXT
);
CREATE INDEX IF NOT EXISTS idx_live_seen ON live_sessions (last_seen DESC);

CREATE TABLE IF NOT EXISTS uploads (
  key TEXT PRIMARY KEY, kind TEXT NOT NULL, bytes INTEGER NOT NULL DEFAULT 0,
  store TEXT NOT NULL DEFAULT 'r2', lead_id TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_uploads_lead ON uploads (lead_id);
CREATE INDEX IF NOT EXISTS idx_uploads_created ON uploads (created_at DESC);

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Super Admin', name TEXT NOT NULL DEFAULT 'Administrator',
  must_change_pw INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_config (
  id INTEGER PRIMARY KEY CHECK (id = 1), provider TEXT NOT NULL DEFAULT 'gemini',
  model TEXT NOT NULL DEFAULT 'gemini-2.5-flash', enabled INTEGER NOT NULL DEFAULT 1,
  daily_limit INTEGER NOT NULL DEFAULT 500, used_today INTEGER NOT NULL DEFAULT 0,
  usage_date TEXT NOT NULL DEFAULT (date('now'))
);
INSERT OR IGNORE INTO ai_config (id) VALUES (1);

CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL, data TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0, visible INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_content_kind ON content_items (kind, sort_order);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL DEFAULT (datetime('now')),
  actor TEXT, action TEXT NOT NULL, target TEXT, ip_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_log (ts DESC);

CREATE TABLE IF NOT EXISTS counters (name TEXT PRIMARY KEY, value INTEGER NOT NULL DEFAULT 0);
