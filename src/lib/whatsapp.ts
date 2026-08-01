// WhatsApp-friendly formatting. WhatsApp only supports *bold*, _italic_,
// ~strike~, ```mono``` — so we keep formatting minimal and lean on clean,
// well-labelled plain text with plenty of useful detail.

import type { Language, NumberValuation } from "../types";
import { OFFICIAL_INFO } from "../data/banglaCallData";

function digits(s: string): string {
  return (s || "").replace(/\D/g, "");
}

export function buildWhatsAppUrl(text: string, phoneClean?: string): string {
  const num = phoneClean || OFFICIAL_INFO.whatsappNumberClean;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

/** Rich message for a single number the user wants to buy/enquire about. */
export function formatNumberEnquiry(number: string, valuation: NumberValuation | null, lang: Language): string {
  const isBn = lang === "bn";
  const recharge = valuation?.estimatedRechargeBdt ?? 100;
  const bonus = valuation?.bonusBdt ?? Math.round(recharge * 0.1);
  const total = valuation?.totalUsableBalanceBdt ?? recharge + bonus;
  const tier = isBn ? valuation?.tierNameBn : valuation?.tierNameEn;

  if (isBn) {
    return [
      `আসসালামু আলাইকুম, বাংলা কল! 👋`,
      `আমি এই নম্বরটি নিতে আগ্রহী:`,
      ``,
      `📞 নম্বর: ${number}`,
      tier ? `⭐ ক্যাটাগরি: ${tier}` : ``,
      `💰 ১ম রিচার্জ: ${recharge} টাকা`,
      `🎁 বোনাস (১০%): ${bonus} টাকা`,
      `💎 মোট ব্যালেন্স: ${total} টাকা`,
      `🆓 সংযোগ ফি: ০ টাকা (ফ্রি)`,
      ``,
      `অনুগ্রহ করে অ্যাক্টিভেশন প্রক্রিয়া জানান।`,
    ].filter(Boolean).join("\n");
  }
  return [
    `Hello Bangla Call! 👋`,
    `I'm interested in this number:`,
    ``,
    `📞 Number: ${number}`,
    tier ? `⭐ Category: ${tier}` : ``,
    `💰 First recharge: BDT ${recharge}`,
    `🎁 Bonus (10%): BDT ${bonus}`,
    `💎 Total balance: BDT ${total}`,
    `🆓 Connection fee: BDT 0 (Free)`,
    ``,
    `Please guide me through activation.`,
  ].filter(Boolean).join("\n");
}

/** Full application/booking message sent from the lead form. */
export function formatApplication(
  input: {
    name: string;
    phone: string;
    numberChoice?: string;
    serviceType: string;
    notes?: string;
    recharge: number;
    hasPhoto?: boolean;
    hasNid?: boolean;
  },
  lang: Language
): string {
  const isBn = lang === "bn";
  const bonus = Math.round(input.recharge * 0.1);
  const total = input.recharge + bonus;
  const service = isBn
    ? input.serviceType === "corporate" ? "কর্পোরেট PBX" : input.serviceType === "reseller" ? "রিসেলার" : "ব্যক্তিগত"
    : input.serviceType;

  const lines = isBn
    ? [
        `আসসালামু আলাইকুম, বাংলা কল! 👋`,
        `আমি নতুন ${OFFICIAL_INFO.prefix} সংযোগের জন্য আবেদন করছি।`,
        ``,
        `👤 নাম: ${input.name}`,
        `📱 মোবাইল: ${input.phone}`,
        `💼 সেবার ধরন: ${service}`,
        `🔢 পছন্দের নম্বর: ${input.numberChoice || "যেকোনো"}`,
        ``,
        `💰 ১ম রিচার্জ: ${input.recharge} টাকা`,
        `🎁 বোনাস (১০%): ${bonus} টাকা`,
        `💎 মোট ব্যালেন্স: ${total} টাকা`,
        input.notes ? `📝 নোট: ${input.notes}` : ``,
        input.hasPhoto ? `📸 লাইভ ছবি সংযুক্ত করা হয়েছে` : ``,
        input.hasNid ? `🆔 NID সংযুক্ত করা হয়েছে` : `🆔 NID (এই চ্যাটে পাঠাচ্ছি)`,
      ]
    : [
        `Hello Bangla Call! 👋`,
        `I'd like to apply for a new ${OFFICIAL_INFO.prefix} connection.`,
        ``,
        `👤 Name: ${input.name}`,
        `📱 Mobile: ${input.phone}`,
        `💼 Service: ${service}`,
        `🔢 Preferred number: ${input.numberChoice || "Any"}`,
        ``,
        `💰 First recharge: BDT ${input.recharge}`,
        `🎁 Bonus (10%): BDT ${bonus}`,
        `💎 Total balance: BDT ${total}`,
        input.notes ? `📝 Notes: ${input.notes}` : ``,
        input.hasPhoto ? `📸 Live photo attached` : ``,
        input.hasNid ? `🆔 NID attached` : `🆔 NID (sending in this chat)`,
      ];
  return lines.filter(Boolean).join("\n");
}

export { digits };
