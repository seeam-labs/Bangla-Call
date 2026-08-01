// Telegram Bot API helpers. All interpolated user input is HTML-escaped to
// prevent Telegram HTML-parse-mode injection.

export function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendTelegramMessage(
  token: string,
  chatId: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  if (!token || !chatId) return { ok: false, error: "Telegram not configured" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { ok: boolean; description?: string };
    return data.ok ? { ok: true } : { ok: false, error: data.description || "Telegram API error" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Telegram request failed" };
  }
}

/** Resolve the most recent chat id the bot has seen (admin "Get Chat ID" helper). */
export async function getUpdatesChatId(token: string): Promise<{ ok: boolean; chatId?: string; error?: string }> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as {
      ok: boolean;
      description?: string;
      result?: Array<{ message?: { chat?: { id?: number } }; my_chat_member?: { chat?: { id?: number } } }>;
    };
    if (!data.ok) return { ok: false, error: data.description || "Telegram API error" };
    const updates = data.result ?? [];
    for (let i = updates.length - 1; i >= 0; i--) {
      const id = updates[i].message?.chat?.id ?? updates[i].my_chat_member?.chat?.id;
      if (id !== undefined) return { ok: true, chatId: String(id) };
    }
    return { ok: false, error: "No recent chats. Send a message to the bot / add it to your group first." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Telegram request failed" };
  }
}
