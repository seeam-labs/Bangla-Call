// Zero-config secret resolution. Order of precedence:
//   1) environment variable (recommended for production; set in the dashboard)
//   2) a value previously generated and stored in KV
//   3) freshly generated strong random value, persisted to KV
// This lets the app run immediately after a one-click deploy with no secrets set,
// while still honouring explicit env values when present.

import type { Env } from "./types";

function randomSecret(bytes = 48): string {
  const buf = crypto.getRandomValues(new Uint8Array(bytes));
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function resolve(env: Env, envVal: string | undefined, kvKey: string): Promise<string> {
  if (envVal && envVal.length >= 16) return envVal;
  const existing = await env.KV.get(kvKey);
  if (existing) return existing;
  const generated = randomSecret();
  // Persist without expiry so tokens/URLs stay valid across requests.
  await env.KV.put(kvKey, generated);
  return generated;
}

export function resolveJwtSecret(env: Env): Promise<string> {
  return resolve(env, env.JWT_SECRET, "secret:jwt");
}

export function resolveUploadSecret(env: Env): Promise<string> {
  return resolve(env, env.UPLOAD_SIGNING_SECRET, "secret:upload");
}
