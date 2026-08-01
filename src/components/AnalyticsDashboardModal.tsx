import React, { useState, useEffect } from 'react';
import {
  X,
  BarChart3,
  Users,
  MousePointerClick,
  MessageCircle,
  Download,
  TrendingUp,
  Search,
  Trash2,
} from 'lucide-react';
import { Language } from '../types';
import {
  getAnalyticsSummary,
  getLeads,
  getAnalyticsEvents,
  exportLeadsCsv,
  trackEvent,
} from '../lib/analytics';

interface AnalyticsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const AnalyticsDashboardModal: React.FC<AnalyticsDashboardModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'events'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const summary = getAnalyticsSummary();
  const leads = getLeads();
  const events = getAnalyticsEvents();

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      (l.numberChoice && l.numberChoice.includes(searchQuery))
  );

  const handleClearAnalytics = () => {
    if (confirm('Are you sure you want to clear stored analytics and lead logs?')) {
      localStorage.removeItem('bangla_call_analytics_v1');
      localStorage.removeItem('bangla_call_leads_v1');
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-500/20 dark:border-slate-500/20 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-500/10 text-brand-primary dark:text-brand-primary-hover border border-slate-500/20 dark:border-slate-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 font-heading">
                <span>{isBn ? 'ক্যাম্পেইন অ্যানালিটিক্স ও লিড ট্র্যাকার' : 'Campaign Analytics & Lead Tracker'}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-500/20 text-brand-primary-hover dark:text-brand-light border border-slate-500/20 dark:border-slate-500/20">
                  Live
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'ভিজিটর অ্যাক্টিভিটি, সিটিএ ক্লিক ও কাস্টমার লিড ট্র্যাকিং ড্যাশবোর্ড'
                  : 'Track conversion rate, CTA clicks, WhatsApp taps, and customer leads'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-900 border-slate-500/20 dark:border-slate-500/20 text-brand-primary dark:text-brand-primary-hover'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
              }`}
            >
              {isBn ? 'সংক্ষিপ্ত তথ্য' : 'Overview KPIs'}
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-colors flex items-center gap-1.5 ${
                activeTab === 'leads'
                  ? 'bg-white dark:bg-slate-900 border-slate-500/20 dark:border-slate-500/20 text-brand-primary dark:text-brand-primary-hover'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>{isBn ? 'গ্রাহক লিডসমূহ' : 'Customer Leads'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-500/20 text-brand-primary-hover dark:text-brand-light text-[10px]">
                {leads.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-colors ${
                activeTab === 'events'
                  ? 'bg-white dark:bg-slate-900 border-slate-500/20 dark:border-slate-500/20 text-brand-primary dark:text-brand-primary-hover'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
              }`}
            >
              {isBn ? 'ইভেন্ট লগ' : 'Behavior Logs'} ({events.length})
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <button
              onClick={exportLeadsCsv}
              className="px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-slate-500 text-slate-900 dark:text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isBn ? 'লিড সিএসভি ডাউনলোড' : 'Export Leads CSV'}</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-semibold">{isBn ? 'মোট পেজভিউ' : 'Page Views'}</span>
                    <Users className="w-4 h-4 text-brand-primary dark:text-brand-primary-hover" />
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {summary.totalPageviews}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    {isBn ? 'ভিজিটর অ্যাক্টিভিটি' : 'Recorded views'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-semibold">{isBn ? 'সিটিএ ক্লিক' : 'CTA Clicks'}</span>
                    <MousePointerClick className="w-4 h-4 text-brand-primary dark:text-brand-primary-hover" />
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {summary.totalCtaClicks}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    {isBn ? 'বাটন ইন্টারঅ্যাকশন' : 'Button engagement'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-semibold">{isBn ? 'হোয়াটসঅ্যাপ চ্যাট' : 'WhatsApp Taps'}</span>
                    <MessageCircle className="w-4 h-4 text-brand-primary dark:text-brand-primary-hover" />
                  </div>
                  <div className="text-2xl font-black font-mono text-brand-primary dark:text-brand-primary-hover">
                    {summary.totalWhatsappClicks}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    {isBn ? 'সরাসরি প্রশ্ন' : 'Direct queries'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-500/20 dark:border-slate-500/20">
                  <div className="flex items-center justify-between text-brand-primary-hover dark:text-brand-light mb-2">
                    <span className="text-xs font-semibold">{isBn ? 'কনভার্সন রেট' : 'Conversion Rate'}</span>
                    <TrendingUp className="w-4 h-4 text-brand-primary dark:text-brand-primary-hover" />
                  </div>
                  <div className="text-2xl font-black font-mono text-brand-primary dark:text-brand-primary-hover">
                    {summary.conversionRate}%
                  </div>
                  <p className="text-[11px] text-brand-primary-hover dark:text-brand-light mt-1">
                    {summary.totalLeadSubmissions} {isBn ? 'টি লিড সাবমিশন' : 'total lead signups'}
                  </p>
                </div>
              </div>

              {/* Traffic Source Breakdown */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 font-heading">
                  {isBn ? 'ট্রাফিক সোর্স ট্র্যাকিং' : 'Top Traffic Channels'}
                </h4>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {isBn ? 'প্রধান বিজ্ঞাপন সোর্স:' : 'Primary Acquisition Source:'}
                  </div>
                  <div className="text-xs font-mono font-bold text-brand-primary dark:text-brand-primary-hover px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-500/20 dark:border-slate-500/20">
                    {summary.topSource}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isBn ? 'নাম, ফোন বা নম্বর দিয়ে খুঁজুন...' : 'Search leads by name, phone, or custom number...'}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 focus:border-slate-500 focus:outline-none"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">{isBn ? 'তারিখ' : 'Date'}</th>
                      <th className="p-3">{isBn ? 'নাম' : 'Name'}</th>
                      <th className="p-3">{isBn ? 'ফোন নম্বর' : 'Phone'}</th>
                      <th className="p-3">{isBn ? 'পছন্দের 09649' : 'VIP Number'}</th>
                      <th className="p-3">{isBn ? 'টাইপ' : 'Type'}</th>
                      <th className="p-3">{isBn ? 'সোর্স' : 'Source'}</th>
                      <th className="p-3 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-white dark:bg-slate-900/50">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-500">
                          {isBn ? 'কোনো লিড পাওয়া যায়নি' : 'No leads captured yet'}
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-white dark:bg-slate-900 transition-colors">
                          <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(lead.timestamp).toLocaleDateString()}
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {lead.name}
                          </td>
                          <td className="p-3 font-mono text-brand-primary dark:text-brand-primary-hover font-bold whitespace-nowrap">
                            {lead.phone}
                          </td>
                          <td className="p-3 font-mono text-amber-300 whitespace-nowrap">
                            {lead.numberChoice || '-'}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {lead.serviceType}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {lead.source}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <a
                              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => trackEvent('whatsapp_click', `Lead Direct WA Chat: ${lead.phone}`)}
                              className="px-2.5 py-1 rounded bg-brand-primary hover:bg-slate-500 text-slate-900 dark:text-white font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span>{isBn ? 'সর্বশেষ 200টি ভিজিটর অ্যাকশন' : 'Recent visitor interaction timeline'}</span>
                <button
                  onClick={handleClearAnalytics}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBn ? 'লগ মুছুন' : 'Clear Logs'}</span>
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-50 dark:bg-slate-950 text-brand-primary dark:text-brand-primary-hover border border-slate-500/20 dark:border-slate-500/20">
                          {evt.eventType}
                        </span>
                        <span>{evt.label}</span>
                      </div>
                      {evt.details && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">{evt.details}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
