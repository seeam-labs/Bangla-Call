import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().regex(/^(?:\+?88)?01[3-9]\d{8}$/, "Invalid Bangladeshi mobile number"),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  numberChoice: z.string().trim().max(20).optional(),
  aiRechargeAmount: z.number().nonnegative().max(100000).optional(),
  aiTierName: z.string().trim().max(80).optional(),
  serviceType: z.enum(["personal", "corporate", "reseller"]).default("personal"),
  notes: z.string().trim().max(2000).optional(),
  source: z.string().trim().max(160).optional(),
  photoKey: z.string().trim().max(200).optional(),
  nidKey: z.string().trim().max(200).optional(),
  // Optional marketing attribution (for Pixel/CAPI dedup + match quality).
  eventId: z.string().trim().max(100).optional(),
  fbp: z.string().trim().max(120).optional(),
  fbc: z.string().trim().max(300).optional(),
  clientId: z.string().trim().max(80).optional(),
  pageUrl: z.string().trim().max(500).optional(),
});
export type LeadInput = z.infer<typeof leadSchema>;

// Generic server-side tracking event (from the client tracker).
export const trackSchema = z.object({
  event: z.string().trim().min(1).max(60),
  eventId: z.string().trim().max(100).optional(),
  url: z.string().trim().max(500).optional(),
  email: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  value: z.number().nonnegative().max(10000000).optional(),
  currency: z.string().trim().max(8).optional(),
  fbp: z.string().trim().max(120).optional(),
  fbc: z.string().trim().max(300).optional(),
  clientId: z.string().trim().max(80).optional(),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(200),
});

export const setupSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(80).regex(/^[a-zA-Z0-9._-]+$/, "Letters, numbers, . _ - only"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const widgetSchema = z.object({
  id: z.string().trim().min(1).max(60),
  titleBn: z.string().max(200).default(""),
  titleEn: z.string().max(200).default(""),
  iconName: z.string().max(60).default("Sparkles"),
  visible: z.boolean().default(true),
  defaultCollapsed: z.boolean().default(false),
  order: z.number().int().default(0),
  colSpan: z.enum(["1", "2", "3", "full"]).default("full"),
});
export const widgetsArraySchema = z.object({ widgets: z.array(widgetSchema) });

export const numberQuerySchema = z.object({
  number: z.string().trim().min(3).max(20),
});

export const evaluateSchema = z.object({
  number: z.string().trim().min(3).max(20),
  lang: z.enum(["bn", "en"]).optional(),
});

export const contentItemSchema = z.object({
  id: z.string().trim().max(60).optional(),
  kind: z.string().trim().min(1).max(40),
  data: z.record(z.string(), z.unknown()).default({}),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const aiConfigSchema = z.object({
  model: z.string().trim().max(80).optional(),
  enabled: z.boolean().optional(),
  dailyLimit: z.number().int().min(0).max(1000000).optional(),
});
