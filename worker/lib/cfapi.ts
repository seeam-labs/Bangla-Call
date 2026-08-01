// Optional Cloudflare API integration. Only used when the admin has configured
// an Account ID + a read-only API token. Every call fails soft (returns null),
// so the dashboard always works from self-tracked data without a token.

import type { Env } from "./types";
import { getSecretValue } from "./settings";

const API = "https://api.cloudflare.com/client/v4";
const GQL = "https://api.cloudflare.com/client/v4/graphql";

export async function getCfCreds(env: Env): Promise<{ accountId: string; token: string } | null> {
  const token = await getSecretValue(env.DB, "cfApiToken");
  const acc = await env.DB.prepare("SELECT value FROM settings WHERE key = 'cfAccountId'").first<{ value: string }>();
  const accountId = acc?.value || "";
  if (!token || !accountId) return null;
  return { accountId, token };
}

async function cfFetch(url: string, token: string): Promise<any | null> {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Authoritative R2 bucket usage: payload bytes + object count. */
export async function cfR2Usage(env: Env, bucket: string): Promise<{ bytes: number; objects: number } | null> {
  const creds = await getCfCreds(env);
  if (!creds) return null;
  const data = await cfFetch(`${API}/accounts/${creds.accountId}/r2/buckets/${bucket}/usage`, creds.token);
  const r = data?.result;
  if (!r) return null;
  return { bytes: r.payloadSize ?? r.payload_size ?? 0, objects: r.objectCount ?? r.object_count ?? 0 };
}

/** Authoritative D1 database size (bytes) + table count, matched by name. */
export async function cfD1Size(env: Env, dbName: string): Promise<{ bytes: number; tables: number } | null> {
  const creds = await getCfCreds(env);
  if (!creds) return null;
  const list = await cfFetch(`${API}/accounts/${creds.accountId}/d1/database?name=${encodeURIComponent(dbName)}`, creds.token);
  const db = list?.result?.[0];
  if (!db?.uuid) return null;
  const detail = await cfFetch(`${API}/accounts/${creds.accountId}/d1/database/${db.uuid}`, creds.token);
  const r = detail?.result;
  if (!r) return null;
  return { bytes: r.file_size ?? 0, tables: r.num_tables ?? 0 };
}

/** Workers request/error/CPU metrics for the last 24h (GraphQL Analytics). */
export async function cfWorkerMetrics(
  env: Env,
  scriptName: string
): Promise<{ requests: number; errors: number; cpuP50: number; cpuP99: number } | null> {
  const creds = await getCfCreds(env);
  if (!creds) return null;
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const query = `query ($tag:string!,$script:string!,$since:Time!){
    viewer { accounts(filter:{accountTag:$tag}){
      workersInvocationsAdaptive(limit:1, filter:{scriptName:$script, datetime_geq:$since}){
        sum { requests errors }
        quantiles { cpuTimeP50 cpuTimeP99 }
      }
    }}
  }`;
  try {
    const res = await fetch(GQL, {
      method: "POST",
      headers: { Authorization: `Bearer ${creds.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { tag: creds.accountId, script: scriptName, since } }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const node = data?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive?.[0];
    if (!node) return null;
    return {
      requests: node.sum?.requests ?? 0,
      errors: node.sum?.errors ?? 0,
      cpuP50: node.quantiles?.cpuTimeP50 ?? 0,
      cpuP99: node.quantiles?.cpuTimeP99 ?? 0,
    };
  } catch {
    return null;
  }
}

/** Validate the configured token (used by the admin "Test" button). */
export async function cfVerifyToken(env: Env): Promise<{ ok: boolean; error?: string }> {
  const creds = await getCfCreds(env);
  if (!creds) return { ok: false, error: "Account ID and API token required" };
  const data = await cfFetch(`${API}/user/tokens/verify`, creds.token);
  return data?.success ? { ok: true } : { ok: false, error: "Token invalid or lacks permissions" };
}
