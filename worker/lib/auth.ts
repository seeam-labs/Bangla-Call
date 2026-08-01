import { sign, verify } from "hono/jwt";
import type { Context, Next } from "hono";
import type { Env, Vars, JwtPayload } from "./types";
import { resolveJwtSecret } from "./appsecrets";

const TOKEN_TTL_SECONDS = 60 * 60 * 8; // 8h

export async function issueToken(
  env: Env,
  user: { id: string; username: string; role: string }
): Promise<string> {
  const secret = await resolveJwtSecret(env);
  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  return sign(payload as unknown as Record<string, unknown>, secret);
}

/** Hono middleware: requires a valid admin bearer token. */
export function requireAdmin() {
  return async (c: Context<{ Bindings: Env; Variables: Vars }>, next: Next) => {
    const header = c.req.header("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return c.json({ error: "Unauthorized" }, 401);
    try {
      const secret = await resolveJwtSecret(c.env);
      const payload = (await verify(token, secret, "HS256")) as unknown as JwtPayload;
      c.set("admin", { sub: payload.sub, username: payload.username, role: payload.role });
      await next();
    } catch {
      return c.json({ error: "Invalid or expired session" }, 401);
    }
  };
}
