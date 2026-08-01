// Provider-agnostic AI layer. Currently implements Gemini via the REST API
// (works on the Workers runtime — no node SDK). Falls back to a deterministic
// engine when no key/model is available or the daily limit is hit.

import type { Env } from "./types";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export interface AiConfig {
  provider: string;
  model: string;
  enabled: boolean;
  daily_limit: number;
  used_today: number;
  usage_date: string;
}

export async function getAiConfig(db: D1Database): Promise<AiConfig> {
  const row = await db.prepare("SELECT * FROM ai_config WHERE id = 1").first<AiConfig>();
  return (
    row ?? { provider: "gemini", model: "gemini-2.5-flash", enabled: true, daily_limit: 500, used_today: 0, usage_date: "" }
  );
}

async function bumpUsage(db: D1Database): Promise<void> {
  await db
    .prepare(
      `UPDATE ai_config
         SET used_today = CASE WHEN usage_date = date('now') THEN used_today + 1 ELSE 1 END,
             usage_date = date('now')
       WHERE id = 1`
    )
    .run();
}

async function canUseAi(env: Env, db: D1Database): Promise<{ ok: boolean; cfg: AiConfig }> {
  const cfg = await getAiConfig(db);
  if (!env.GEMINI_API_KEY || !cfg.enabled) return { ok: false, cfg };
  const used = cfg.usage_date === new Date().toISOString().slice(0, 10) ? cfg.used_today : 0;
  if (cfg.daily_limit > 0 && used >= cfg.daily_limit) return { ok: false, cfg };
  return { ok: true, cfg };
}

/** List available Gemini models (for the admin model picker). */
export async function listModels(apiKey: string): Promise<{ ok: boolean; models?: string[]; error?: string }> {
  if (!apiKey) return { ok: false, error: "No API key configured" };
  try {
    const res = await fetch(`${GEMINI_BASE}/models?key=${encodeURIComponent(apiKey)}`, {
      signal: AbortSignal.timeout(10000),
    });
    const data = (await res.json()) as {
      models?: Array<{ name: string; supportedGenerationMethods?: string[] }>;
      error?: { message?: string };
    };
    if (data.error) return { ok: false, error: data.error.message || "Gemini error" };
    const models = (data.models ?? [])
      .filter((m) => (m.supportedGenerationMethods ?? []).includes("generateContent"))
      .map((m) => m.name.replace(/^models\//, ""))
      .sort();
    return { ok: true, models };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Request failed" };
  }
}

async function geminiGenerate(
  apiKey: string,
  model: string,
  body: Record<string, unknown>
): Promise<string | null> {
  const res = await fetch(
    `${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

export interface NumberValuation {
  number: string;
  tierNameBn: string;
  tierNameEn: string;
  qualityScore: number;
  estimatedRechargeBdt: number;
  bonusBdt: number;
  totalUsableBalanceBdt: number;
  explanationBn: string;
  explanationEn: string;
  isAiGenerated: boolean;
}

/** Deterministic fallback valuation (no external calls). */
export function fallbackEvaluateNumber(numStr: string): NumberValuation {
  const cleanNum = numStr.replace(/\D/g, "");
  const digits = cleanNum.slice(-6);
  let score = 3;
  let tierBn = "র‍্যান্ডম স্ট্যান্ডার্ড";
  let tierEn = "Random Standard";
  let recharge = 100;

  const uniqueCount = new Set(digits.split("")).size;
  const isSequential = "0123456789876543210".includes(digits) && digits.length >= 4;
  const isAllSame = uniqueCount === 1 && digits.length > 0;
  const isTripleSame = /(.)\1\1/.test(digits);
  const isQuadSame = /(.)\1\1\1/.test(digits);

  if (isAllSame || /(777777|888888|999999)$/.test(cleanNum)) {
    score = 10; tierBn = "VIP ডায়মন্ড রয়্যাল"; tierEn = "VIP Diamond Royal"; recharge = 500;
  } else if (isQuadSame || isSequential) {
    score = 8; tierBn = "ভিআইপি প্রিমিয়াম প্যাটার্ন"; tierEn = "VIP Premium Pattern"; recharge = 500;
  } else if (isTripleSame || uniqueCount <= 4) {
    score = 6; tierBn = "ভিআইপি প্যাটার্ন"; tierEn = "VIP Pattern"; recharge = 500;
  }

  const bonus = Math.round(recharge * 0.1);
  const totalBalance = recharge + bonus;
  return {
    number: numStr,
    tierNameBn: tierBn,
    tierNameEn: tierEn,
    qualityScore: score,
    estimatedRechargeBdt: recharge,
    bonusBdt: bonus,
    totalUsableBalanceBdt: totalBalance,
    explanationBn: `বাংলা কল এআই প্যাটার্ন বিশ্লেষণ অনুযায়ী নম্বরটির মান ${tierBn}। কোনো অতিরিক্ত রেজিস্ট্রেশন ফি নেই (০ BDT)। ১ম রিচার্জ মাত্র ${recharge} BDT করলেই আজীবন একাউন্ট সক্রিয় এবং ১০% বোনাস সহ মোট ${totalBalance} BDT ব্যালেন্স পাবেন।`,
    explanationEn: `Bangla Call AI evaluates this pattern as ${tierEn}. Zero connection fee (0 BDT). Activate your lifetime account with a first recharge of ${recharge} BDT and get a 10% bonus (${totalBalance} BDT total balance).`,
    isAiGenerated: false,
  };
}

export async function evaluateNumber(env: Env, db: D1Database, number: string): Promise<NumberValuation> {
  const gate = await canUseAi(env, db);
  if (!gate.ok) return fallbackEvaluateNumber(number);

  const systemInstruction = `You are the Official Valuation Engine for "Bangla Call AI" (a BTRC-licensed IPTSP service in Bangladesh).
Evaluate phone-number patterns per policy:
- Connection Fee: FREE (0 BDT)
- Lifetime validity unlocked on first recharge
- First recharge MUST be exactly 100 BDT or 500 BDT
- Random standard numbers = 100 BDT; any good/repeating/premium pattern = 500 BDT
- 10% bonus on first recharge
Return valid JSON only.`;

  const body = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: `Evaluate this Bangla Call IPTSP number: "${number}"` }] }],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          number: { type: "STRING" },
          tierNameBn: { type: "STRING" },
          tierNameEn: { type: "STRING" },
          qualityScore: { type: "NUMBER" },
          estimatedRechargeBdt: { type: "NUMBER" },
          bonusBdt: { type: "NUMBER" },
          totalUsableBalanceBdt: { type: "NUMBER" },
          explanationBn: { type: "STRING" },
          explanationEn: { type: "STRING" },
        },
        required: [
          "number", "tierNameBn", "tierNameEn", "qualityScore", "estimatedRechargeBdt",
          "bonusBdt", "totalUsableBalanceBdt", "explanationBn", "explanationEn",
        ],
      },
    },
  };

  try {
    const text = await geminiGenerate(env.GEMINI_API_KEY!, gate.cfg.model, body);
    if (!text) return fallbackEvaluateNumber(number);
    await bumpUsage(db);
    const parsed = JSON.parse(text.trim());
    return { ...parsed, isAiGenerated: true };
  } catch {
    return fallbackEvaluateNumber(number);
  }
}

export async function generateBanner(
  env: Env,
  db: D1Database,
  opts: { location?: string; date?: string; language?: string }
): Promise<string | null> {
  const gate = await canUseAi(env, db);
  if (!gate.ok) return null;
  const prompt = `You are a marketing copywriter for Bangla Call, a BTRC-licensed IP telephony service in Bangladesh.
Write a short (1-2 sentence) seasonal promotional banner for date ${opts.date || "today"} and location ${opts.location || "Bangladesh"}.
Create urgency about buying a new '09649' number. No quotes. Language: ${opts.language === "bn" ? "Bengali" : "English"}.`;
  try {
    const text = await geminiGenerate(env.GEMINI_API_KEY!, gate.cfg.model, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 120 },
    });
    if (text) await bumpUsage(db);
    return text?.trim() ?? null;
  } catch {
    return null;
  }
}

/** Live end-to-end test used by the admin "Test AI" button. */
export async function testAi(env: Env, db: D1Database): Promise<{ ok: boolean; model?: string; sample?: string; error?: string }> {
  if (!env.GEMINI_API_KEY) return { ok: false, error: "GEMINI_API_KEY not configured" };
  const cfg = await getAiConfig(db);
  try {
    const text = await geminiGenerate(env.GEMINI_API_KEY, cfg.model, {
      contents: [{ role: "user", parts: [{ text: 'Reply with the single word: OK' }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 10 },
    });
    if (!text) return { ok: false, error: "No response from model", model: cfg.model };
    return { ok: true, model: cfg.model, sample: text.trim() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Request failed", model: cfg.model };
  }
}
