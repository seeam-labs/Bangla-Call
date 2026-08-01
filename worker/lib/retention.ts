import type { Env } from "./types";
import { getPublicSettings, getSecretValue } from "./settings";
import { deleteUpload, getStorageUsage } from "./storage";
import { sendTelegramMessage } from "./telegram";

export interface RetentionResult {
  photosDeleted: number;
  visitorsPurged: number;
  liveCleaned: number;
}

/** Enforce configured retention windows. Safe to run repeatedly. */
export async function purgeRetention(env: Env): Promise<RetentionResult> {
  const settings = await getPublicSettings(env.DB);
  const photoDays = Number(settings.retentionPhotoDays) || 0;
  const visitorDays = Number(settings.retentionVisitorDays) || 0;

  let photosDeleted = 0;
  if (photoDays > 0) {
    const stale = await env.DB
      .prepare("SELECT key FROM uploads WHERE created_at < datetime('now', ?1)")
      .bind(`-${photoDays} days`)
      .all<{ key: string }>();
    for (const row of stale.results ?? []) {
      await deleteUpload(env, row.key);
      // Detach from any lead referencing it.
      await env.DB.prepare("UPDATE leads SET photo_key = NULL WHERE photo_key = ?").bind(row.key).run();
      await env.DB.prepare("UPDATE leads SET nid_key = NULL WHERE nid_key = ?").bind(row.key).run();
      photosDeleted++;
    }
  }

  let visitorsPurged = 0;
  if (visitorDays > 0) {
    const res = await env.DB
      .prepare("DELETE FROM visitors WHERE ts < datetime('now', ?1)")
      .bind(`-${visitorDays} days`)
      .run();
    visitorsPurged = res.meta?.changes ?? 0;
  }

  const liveRes = await env.DB
    .prepare("DELETE FROM live_sessions WHERE last_seen < datetime('now','-30 minutes')")
    .run();
  const liveCleaned = liveRes.meta?.changes ?? 0;

  // Optional storage-threshold alert to Telegram.
  try {
    const pct = Number(settings.storageAlertPct) || 0;
    if (pct > 0) {
      const usage = await getStorageUsage(env);
      const freeBytes = (Number(settings.r2FreeGb) || 10) * 1024 * 1024 * 1024;
      if (freeBytes > 0 && usage.totalBytes / freeBytes >= pct / 100) {
        const token = env.TELEGRAM_BOT_TOKEN || (await getSecretValue(env.DB, "telegramBotToken"));
        const chat = env.TELEGRAM_CHAT_ID || (await getSecretValue(env.DB, "telegramChatId"));
        if (token && chat) {
          const usedMb = (usage.totalBytes / 1024 / 1024).toFixed(1);
          await sendTelegramMessage(token, chat, `⚠️ <b>Storage alert</b>\nUsed ${usedMb} MB (over ${pct}% of allowance).`);
        }
      }
    }
  } catch { /* non-fatal */ }

  return { photosDeleted, visitorsPurged, liveCleaned };
}
