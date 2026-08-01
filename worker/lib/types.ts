// Cloudflare bindings + shared server types.

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  UPLOADS?: R2Bucket;   // optional — falls back to KV if R2 isn't provisioned

  APP_ENV?: string;

  // Secrets (set via `wrangler pages secret put`)
  JWT_SECRET?: string;
  UPLOAD_SIGNING_SECRET?: string;
  GEMINI_API_KEY?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  META_CAPI_TOKEN?: string;
  GA4_API_SECRET?: string;
  ADMIN_BOOTSTRAP_USER?: string;
  ADMIN_BOOTSTRAP_PASSWORD?: string;
}

// Hono context variables
export type Vars = {
  admin?: { sub: string; username: string; role: string };
};

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  exp: number;
}
