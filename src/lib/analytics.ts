import { AnalyticsEvent, AnalyticsSummary, Lead } from '../types';
import { trackLeadClient } from './tracking';

const ANALYTICS_KEY = 'bangla_call_analytics_v1';
const LEADS_KEY = 'bangla_call_leads_v1';
const VISITOR_ID_KEY = 'bangla_call_visitor_id';

// Helper to get UTM source or default to Meta Ads / Direct
export function getUtmSource(): string {
  if (typeof window === 'undefined') return 'Direct';
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const fbclid = urlParams.get('fbclid');
  const gclid = urlParams.get('gclid');

  if (fbclid) return 'Facebook Ads';
  if (gclid) return 'Google Ads';
  if (utmSource) return `${utmSource}${utmMedium ? ` / ${utmMedium}` : ''}`;
  return 'Direct Search / Boosted Post';
}

// Get or create unique visitor ID
export function getVisitorId(): string {
  if (typeof window === 'undefined') return 'anon';
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = 'vis_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

// Log an analytics event
export function trackEvent(
  eventType: AnalyticsEvent['eventType'],
  label: string,
  details?: string
): void {
  try {
    const existingEvents: AnalyticsEvent[] = JSON.parse(
      localStorage.getItem(ANALYTICS_KEY) || '[]'
    );

    const newEvent: AnalyticsEvent = {
      id: 'evt_' + Math.random().toString(36).substr(2, 9),
      eventType,
      label,
      details,
      source: getUtmSource(),
      timestamp: new Date().toISOString(),
    };

    existingEvents.unshift(newEvent);
    // Keep last 300 events
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(existingEvents.slice(0, 300)));
  } catch (err) {
    console.error('Analytics track failed:', err);
  }
}

// Save a new lead
export function saveLead(leadData: Omit<Lead, 'id' | 'timestamp' | 'status' | 'source'>): Lead {
  let leads: Lead[];
  try {
    leads = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
  } catch {
    leads = [];
  }
  
  const newLead: Lead = {
    ...leadData,
    id: 'lead_' + Math.random().toString(36).substr(2, 9),
    source: getUtmSource(),
    timestamp: new Date().toISOString(),
    status: 'new',
  };

  leads.unshift(newLead);
  try {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  } catch (err) {
    console.error('Failed to save lead to localStorage', err);
  }

  // Log lead event
  trackEvent('lead_submission', `Lead: ${newLead.name}`, `${newLead.phone} (${newLead.serviceType})`);

  // Fire the client-side Lead conversion (GA4 + Meta Pixel) and capture the
  // shared eventId + Meta cookies so the server can fire a deduped CAPI event.
  const attribution = trackLeadClient(
    typeof newLead.aiRechargeAmount === 'number' ? newLead.aiRechargeAmount : undefined
  );

  // Post to backend for database persistence, CAPI, & Telegram notification
  fetch('/api/leads/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...newLead, ...attribution }),
  }).catch((err) => console.warn('Backend lead sync error:', err));

  return newLead;
}

// Get all leads
export function getLeads(): Lead[] {
  try {
    const data = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Get all analytics events
export function getAnalyticsEvents(): AnalyticsEvent[] {
  try {
    const data = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Compute analytics summary
export function getAnalyticsSummary(): AnalyticsSummary {
  const events = getAnalyticsEvents();
  const leads = getLeads();

  const pageviews = events.filter((e) => e.eventType === 'pageview').length;
  const ctaClicks = events.filter((e) => e.eventType === 'cta_click').length;
  const whatsappClicks = events.filter((e) => e.eventType === 'whatsapp_click').length;
  const leadCount = leads.length;

  const totalVisitors = Math.max(1, pageviews);
  const conversionRate = Number(((leadCount / totalVisitors) * 100).toFixed(1));

  // Count traffic sources
  const sourceCounts: Record<string, number> = {};
  events.forEach((e) => {
    sourceCounts[e.source] = (sourceCounts[e.source] || 0) + 1;
  });

  let topSource = 'Direct / Facebook Ads';
  let maxCount = 0;
  Object.entries(sourceCounts).forEach(([src, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topSource = src;
    }
  });

  return {
    totalVisitors,
    totalPageviews: pageviews,
    totalCtaClicks: ctaClicks,
    totalWhatsappClicks: whatsappClicks,
    totalLeadSubmissions: leadCount,
    conversionRate,
    topSource,
  };
}

// Export leads to CSV format
export function exportLeadsCsv(): void {
  const leads = getLeads();
  if (leads.length === 0) {
    alert('No leads collected yet.');
    return;
  }

  const headers = ['ID', 'Name', 'Phone', 'Service Type', 'Custom Number', 'Source', 'Date', 'Status', 'Notes'];
  const rows = leads.map((l) => [
    l.id,
    `"${l.name}"`,
    `"${l.phone}"`,
    l.serviceType,
    l.numberChoice || 'None',
    `"${l.source}"`,
    new Date(l.timestamp).toLocaleString(),
    l.status,
    `"${l.notes || ''}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `bangla_call_leads_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
