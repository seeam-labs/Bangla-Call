export type Language = 'bn' | 'en';

export type ColorPaletteId = 'royal-blue' | 'soft-lavender' | 'warm-amber' | 'porcelain-indigo';

export interface ColorPalette {
  id: ColorPaletteId;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  descriptionEn: string;
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  bgHex: string;
  previewColors: string[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'royal-blue',
    nameBn: 'গুগল ব্র্যান্ড রয়্যাল ব্লু (স্ম্যাশিং অরেঞ্জ)',
    nameEn: 'Google Brand Modern Blue & Orange',
    descriptionBn: 'উজ্জ্বল রয়্যাল ব্লু, স্ম্যাশিং অরেঞ্জ এবং মারিগোল্ড গোল্ডের আধুনিক ও বিশ্বাসযোগ্য কালার স্কিম',
    descriptionEn: 'Vibrant Bright Navy Blue (#1976D2), Orange (#FF571F) & Marigold (#FFC107)',
    primaryHex: '#1976D2',
    secondaryHex: '#FF571F',
    accentHex: '#FFC107',
    bgHex: '#F8FAFC',
    previewColors: ['#1976D2', '#FF571F', '#FFC107', '#98C0E3'],
  },
  {
    id: 'soft-lavender',
    nameBn: 'ওশেন ব্রিয ও সফ্ট ল্যাভেন্ডার (প্যাস্টেল)',
    nameEn: 'Ocean Breeze & Lavender Pastel',
    descriptionBn: 'সফ্ট ল্যাভেন্ডার, ওশেন ব্রিয ব্লু এবং বুডিং পিচ এর চোখ জুড়ানো শান্ত কালার স্কিম',
    descriptionEn: 'Soft Purplish White (#E0D1E2), Ocean Breeze (#D3E5EB) & Peach (#F3D4BE)',
    primaryHex: '#8B5CF6',
    secondaryHex: '#0284C7',
    accentHex: '#F3D4BE',
    bgHex: '#F6F5F6',
    previewColors: ['#8B5CF6', '#0284C7', '#F3D4BE', '#97969A'],
  },
  {
    id: 'warm-amber',
    nameBn: 'মডার্ন ওয়ার্ম স্লেট ও ক্রাঞ্চ গোল্ড',
    nameEn: 'Modern Warm Slate & Crunch Amber',
    descriptionBn: 'ক্রাঞ্চ গোল্ডেন অ্যাম্বার, অ্যারাবিক ওয়ার্ম হেয এবং লেড গ্রে এর প্রিমিয়াম কর্পোরেট লুক',
    descriptionEn: 'Crunch Gold (#F3BA60), Chinese Silver (#E0DBF3) & Lead (#202022)',
    primaryHex: '#D97706',
    secondaryHex: '#4B5563',
    accentHex: '#F3BA60',
    bgHex: '#FAF9F6',
    previewColors: ['#D97706', '#4B5563', '#F3BA60', '#B6B1C0'],
  },
  {
    id: 'porcelain-indigo',
    nameBn: 'ফ্রেঞ্চ পোরসেলিন ও রয়্যাল ইন্ডিগো',
    nameEn: 'French Porcelain & Royal Indigo',
    descriptionBn: 'ফ্রেঞ্চ পোরসেলিন গ্রে, বুটিক ইন্ডিগো এবং হাডসন কোরাল এর বিলাসবহুল লাইট মোড লুক',
    descriptionEn: 'French Porcelain (#F5F4F7), Royal Indigo (#2563EB) & Hudson Peach (#EBDBD3)',
    primaryHex: '#2563EB',
    secondaryHex: '#EA580C',
    accentHex: '#BAC8E0',
    bgHex: '#F5F4F7',
    previewColors: ['#2563EB', '#EA580C', '#BAC8E0', '#1F1F1F'],
  },
];

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
  isAiGenerated?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  numberChoice?: string;
  aiRechargeAmount?: number;
  aiTierName?: string;
  serviceType: 'personal' | 'corporate' | 'reseller';
  notes?: string;
  source: string;
  timestamp: string;
  status: 'new' | 'contacted' | 'converted';
  photoKey?: string;
  nidKey?: string;
}

export interface AnalyticsEvent {
  id: string;
  eventType: 'pageview' | 'cta_click' | 'whatsapp_click' | 'call_click' | 'lead_submission' | 'number_search' | 'calc_use' | 'copy_click';
  label: string;
  details?: string;
  source: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalPageviews: number;
  totalCtaClicks: number;
  totalWhatsappClicks: number;
  totalLeadSubmissions: number;
  conversionRate: number;
  topSource: string;
}

export interface OfferFeature {
  id: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  iconName: string;
  badgeBn?: string;
  badgeEn?: string;
  highlight?: boolean;
}

export interface WidgetConfig {
  id: string;
  titleBn: string;
  titleEn: string;
  iconName: string;
  visible: boolean;
  defaultCollapsed: boolean;
  order: number;
  colSpan?: '1' | '2' | '3' | 'full';
}

