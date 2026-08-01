import type { Env } from "./types";
import { hmacSign, hmacVerify, randomId } from "./crypto";
import { resolveUploadSecret } from "./appsecrets";

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024; // 6MB per image
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface UploadResult {
  ok: boolean;
  key?: string;
  bytes?: number;
  error?: string;
}

/**
 * Store an uploaded image. R2 is the primary store; if the R2 binding is not
 * present (e.g. R2 not enabled on the account) we transparently fall back to KV
 * so the feature still works after a zero-config deploy.
 */
export async function storeUpload(
  env: Env,
  kind: "photo" | "nid",
  contentType: string,
  bytes: ArrayBuffer
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(contentType)) return { ok: false, error: "Only JPEG/PNG/WebP images are allowed" };
  if (bytes.byteLength === 0) return { ok: false, error: "Empty file" };
  if (bytes.byteLength > MAX_UPLOAD_BYTES) return { ok: false, error: "File too large (max 6MB)" };
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const key = `${kind}/${new Date().toISOString().slice(0, 10)}/${randomId()}.${ext}`;
  const store = env.UPLOADS ? "r2" : "kv";
  try {
    if (env.UPLOADS) {
      await env.UPLOADS.put(key, bytes, { httpMetadata: { contentType } });
    } else {
      const b64 = arrayBufferToBase64(bytes);
      await env.KV.put(`upload:${key}`, JSON.stringify({ contentType, b64 }));
    }
    // Record in the upload index (this is the self-tracked storage ledger).
    try {
      await env.DB.prepare(
        "INSERT OR REPLACE INTO uploads (key, kind, bytes, store, lead_id, created_at) VALUES (?1,?2,?3,?4,NULL,datetime('now'))"
      ).bind(key, kind, bytes.byteLength, store).run();
    } catch { /* index is best-effort */ }
    return { ok: true, key, bytes: bytes.byteLength };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed" };
  }
}

/** Delete a stored object (R2 or KV) and its index row. */
export async function deleteUpload(env: Env, key: string): Promise<void> {
  try { if (env.UPLOADS) await env.UPLOADS.delete(key); } catch { /* ignore */ }
  try { await env.KV.delete(`upload:${key}`); } catch { /* ignore */ }
  try { await env.DB.prepare("DELETE FROM uploads WHERE key = ?").bind(key).run(); } catch { /* ignore */ }
}

/** Attach uploaded keys to a lead (called on lead submit). */
export async function attachUploadsToLead(env: Env, leadId: string, keys: (string | undefined | null)[]): Promise<void> {
  const valid = keys.filter((k): k is string => !!k);
  for (const k of valid) {
    try { await env.DB.prepare("UPDATE uploads SET lead_id = ? WHERE key = ?").bind(leadId, k).run(); } catch { /* ignore */ }
  }
}

/** Real storage usage per kind, computed from the upload index. */
export async function getStorageUsage(env: Env): Promise<{
  totalBytes: number; totalObjects: number; store: "r2" | "kv" | "mixed";
  byKind: Array<{ kind: string; bytes: number; count: number }>;
}> {
  const rows = await env.DB
    .prepare("SELECT kind, SUM(bytes) AS bytes, COUNT(*) AS count FROM uploads GROUP BY kind")
    .all<{ kind: string; bytes: number; count: number }>();
  const byKind = (rows.results ?? []).map((r) => ({ kind: r.kind, bytes: r.bytes || 0, count: r.count || 0 }));
  const totalBytes = byKind.reduce((s, r) => s + r.bytes, 0);
  const totalObjects = byKind.reduce((s, r) => s + r.count, 0);
  return { totalBytes, totalObjects, store: env.UPLOADS ? "r2" : "kv", byKind };
}

/** Objects uploaded but never attached to a submitted lead, or whose lead is gone. */
export async function findOrphans(env: Env, olderThanHours = 6): Promise<Array<{ key: string; bytes: number; kind: string }>> {
  const rows = await env.DB.prepare(
    `SELECT u.key, u.bytes, u.kind FROM uploads u
     LEFT JOIN leads l ON l.id = u.lead_id
     WHERE (u.lead_id IS NULL AND u.created_at < datetime('now', ?1))
        OR (u.lead_id IS NOT NULL AND l.id IS NULL)`
  ).bind(`-${olderThanHours} hours`).all<{ key: string; bytes: number; kind: string }>();
  return rows.results ?? [];
}

/** Delete every stored object (used by "purge all uploads"). Returns count. */
export async function purgeAllUploads(env: Env): Promise<number> {
  const rows = await env.DB.prepare("SELECT key FROM uploads").all<{ key: string }>();
  const keys = (rows.results ?? []).map((r) => r.key);
  for (const k of keys) await deleteUpload(env, k);
  return keys.length;
}

/** Read a stored object from R2 (preferred) or the KV fallback. */
export async function readUpload(
  env: Env,
  key: string
): Promise<{ body: ArrayBuffer | ReadableStream; contentType: string } | null> {
  if (env.UPLOADS) {
    const obj = await env.UPLOADS.get(key);
    if (obj) {
      const ct = obj.httpMetadata?.contentType || "application/octet-stream";
      return { body: obj.body, contentType: ct };
    }
  }
  const raw = await env.KV.get(`upload:${key}`);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { contentType: string; b64: string };
      return { body: base64ToArrayBuffer(parsed.b64), contentType: parsed.contentType };
    } catch {
      return null;
    }
  }
  return null;
}

/** Create a signed, time-limited access token for a stored object. */
export async function signFileToken(env: Env, key: string, ttlSeconds = 60 * 60 * 24 * 7): Promise<string> {
  const secret = await resolveUploadSecret(env);
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = await hmacSign(secret, `${key}:${exp}`);
  return `${exp}.${sig}`;
}

export async function verifyFileToken(env: Env, key: string, token: string): Promise<boolean> {
  const [expStr, sig] = (token || "").split(".");
  const exp = parseInt(expStr, 10);
  if (!exp || Date.now() / 1000 > exp || !sig) return false;
  const secret = await resolveUploadSecret(env);
  return hmacVerify(secret, `${key}:${exp}`, sig);
}

/** Absolute signed URL an admin/Telegram can open to view a stored file. */
export async function signedFileUrl(env: Env, origin: string, key: string): Promise<string | null> {
  if (!key) return null;
  const token = await signFileToken(env, key);
  return `${origin}/api/files/${encodeURIComponent(key)}?token=${encodeURIComponent(token)}`;
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}
