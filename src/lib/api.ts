// Centralised API client. Handles admin JWT storage + auth headers + 401s.

const TOKEN_KEY = "bangla_call_admin_token";

export function getAdminToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setAdminToken(token: string): void {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
}
export function clearAdminToken(): void {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

async function parse<T>(res: Response): Promise<T> {
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : (await res.text());
  if (!res.ok) {
    const msg = (data && typeof data === "object" && "error" in data) ? (data as any).error : `HTTP ${res.status}`;
    throw new ApiError(msg || "Request failed", res.status, data);
  }
  return data as T;
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public body?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

/** Public (unauthenticated) API call. */
export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  return parse<T>(res);
}

/** Authenticated admin API call. Throws ApiError(401) if the session is gone. */
export async function adminApi<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  if (!token) throw new ApiError("Not authenticated", 401);
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init?.headers || {}) },
  });
  if (res.status === 401) { clearAdminToken(); throw new ApiError("Session expired", 401); }
  return parse<T>(res);
}

/** Upload a File (selfie / NID) and return its R2 key. */
export async function uploadImage(kind: "photo" | "nid", file: File | Blob): Promise<string> {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file, kind + ".jpg");
  const res = await fetch("/api/uploads", { method: "POST", body: form });
  const data = await parse<{ key: string }>(res);
  return data.key;
}
