import React, { useState, useEffect, Suspense, lazy } from 'react';
import { NetworkBackground } from './components/NetworkBackground';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AiNumberValuator } from './components/AiNumberValuator';
import { ActivationPricingPolicy } from './components/ActivationPricingPolicy';
import { ComparisonTable } from './components/ComparisonTable';
import { OffersGrid } from './components/OffersGrid';
import { RateCalculator } from './components/RateCalculator';
import { LeadCaptureForm } from './components/LeadCaptureForm';
import { CorporateSolutions } from './components/CorporateSolutions';
import { GlassmorphismBottomNav } from './components/GlassmorphismBottomNav';
import { Footer } from './components/Footer';
import { TrustIndicators } from './components/TrustIndicators';
import { SocialProofPopup } from './components/SocialProofPopup';
import { SuccessStories } from './components/SuccessStories';
import { SEO } from './components/SEO';
import { LiveStatsBanner } from './components/LiveStatsBanner';
import { OnboardingRoadmap } from './components/OnboardingRoadmap';
import { ReferAFriend } from './components/ReferAFriend';
import { PatternBackground } from './components/PatternBackground';
import { CoverageMap } from './components/CoverageMap';
import { Language, NumberValuation, ColorPaletteId, WidgetConfig } from './types';
import { Theme } from './lib/theme';
import { FAQS, OFFICIAL_INFO } from './data/banglaCallData';
import { trackEvent } from './lib/analytics';
import { initTracking } from './lib/tracking';
import { playScrollTickSound, playModalOpenSound, playModalCloseSound, playClickSound } from './lib/sounds';
import { GlobalSoundHandler } from './components/SoundController';
import { HelpCircle, ChevronDown, Sparkles, ShieldCheck, Map, Route, CreditCard, BarChart2, Calculator, FileText, Share2 } from 'lucide-react';
import { motion, useScroll } from 'motion/react';
import { Widget } from './components/Widget';
import { ExitIntentModal } from './components/ExitIntentModal';

// Lazy loaded components
const AnalyticsDashboardModal = lazy(() => import('./components/AnalyticsDashboardModal').then(module => ({ default: module.AnalyticsDashboardModal })));
const AdminPanelModal = lazy(() => import('./components/AdminPanelModal').then(module => ({ default: module.AdminPanelModal })));

const defaultWidgetConfigs: WidgetConfig[] = [
  { id: 'hero', titleBn: 'প্রধান সেকশন', titleEn: 'Main View', iconName: 'Sparkles', visible: true, defaultCollapsed: false, order: 0, colSpan: 'full' },
  { id: 'ai-valuation', titleBn: 'স্মার্ট নাম্বার ফাইন্ডার', titleEn: 'Smart Number Finder', iconName: 'Sparkles', visible: true, defaultCollapsed: false, order: 1, colSpan: 'full' },
  { id: 'lead-form-section', titleBn: 'আবেদন ফর্ম', titleEn: 'Application Form', iconName: 'FileText', visible: true, defaultCollapsed: false, order: 2, colSpan: 'full' },
  { id: 'trust', titleBn: 'আস্থা ও নিরাপত্তা', titleEn: 'Trust & Security', iconName: 'ShieldCheck', visible: true, defaultCollapsed: false, order: 3, colSpan: 'full' },
  { id: 'coverage', titleBn: 'কভারেজ ম্যাপ', titleEn: 'Coverage Map', iconName: 'Map', visible: true, defaultCollapsed: false, order: 4, colSpan: '1' },
  { id: 'onboarding', titleBn: 'অনবোর্ডিং রোডম্যাপ', titleEn: 'Onboarding Roadmap', iconName: 'Route', visible: true, defaultCollapsed: false, order: 5, colSpan: '2' },
  { id: 'pricing', titleBn: 'প্রাইসিং পলিসি', titleEn: 'Pricing Policy', iconName: 'CreditCard', visible: true, defaultCollapsed: false, order: 6, colSpan: 'full' },
  { id: 'comparison', titleBn: 'তুলনামূলক বিশ্লেষণ', titleEn: 'Comparison Analysis', iconName: 'BarChart2', visible: true, defaultCollapsed: false, order: 7, colSpan: '2' },
  { id: 'calculator', titleBn: 'রেট ক্যালকুলেটর', titleEn: 'Rate Calculator', iconName: 'Calculator', visible: true, defaultCollapsed: false, order: 8, colSpan: '1' },
  { id: 'offers', titleBn: 'অফার সমূহ', titleEn: 'Special Offers', iconName: 'Sparkles', visible: true, defaultCollapsed: false, order: 9, colSpan: '2' },
  { id: 'corporate', titleBn: 'কর্পোরেট সমাধান', titleEn: 'Corporate Solutions', iconName: 'ShieldCheck', visible: true, defaultCollapsed: false, order: 10, colSpan: 'full' },
  { id: 'success-stories', titleBn: 'সাফল্যের গল্প', titleEn: 'Success Stories', iconName: 'Sparkles', visible: true, defaultCollapsed: false, order: 11, colSpan: 'full' },
  { id: 'refer', titleBn: 'রেফার করুন', titleEn: 'Refer a Friend', iconName: 'Share2', visible: true, defaultCollapsed: false, order: 12, colSpan: '2' },
  { id: 'faq', titleBn: 'সাধারণ প্রশ্ন উত্তর', titleEn: 'FAQs', iconName: 'HelpCircle', visible: true, defaultCollapsed: false, order: 13, colSpan: 'full' }
];

// Wrapper for animated sections

export default function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [lang, setLang] = useState<Language>('bn');
  const [palette, setPalette] = useState<ColorPaletteId>('royal-blue');
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [lockedValuation, setLockedValuation] = useState<NumberValuation | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [widgetsConfig, setWidgetsConfig] = useState<WidgetConfig[]>(defaultWidgetConfigs);

  const { scrollYProgress } = useScroll();

  // Sync Dark/Light theme attribute
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync Color Palette attribute on <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette);
  }, [palette]);

  // Fetch initial PUBLIC site settings (never contains secrets/API keys)
  useEffect(() => {
    fetch('/api/settings')
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        }
        throw new Error("Non-JSON response");
      })
      .then((data) => {
        if (data) {
          if (data.activePalette) {
            setPalette(data.activePalette as ColorPaletteId);
          }
          if (OFFICIAL_INFO) {
            if (data.brandNameBn) OFFICIAL_INFO.brandNameBn = data.brandNameBn;
            if (data.brandNameEn) OFFICIAL_INFO.brandNameEn = data.brandNameEn;
            if (data.companyNameBn) OFFICIAL_INFO.companyNameBn = data.companyNameBn;
            if (data.companyNameEn) OFFICIAL_INFO.companyNameEn = data.companyNameEn;
            if (data.licenseNo) OFFICIAL_INFO.licenseNo = data.licenseNo;
            if (data.prefix) OFFICIAL_INFO.prefix = data.prefix;
            if (data.callRate) OFFICIAL_INFO.callRate = data.callRate;
            if (data.callRateBn) OFFICIAL_INFO.callRateBn = data.callRateBn;
            if (data.helpline1) OFFICIAL_INFO.helpline1 = data.helpline1;
            else if (data.phone) OFFICIAL_INFO.helpline1 = data.phone;
            if (data.helpline2) OFFICIAL_INFO.helpline2 = data.helpline2;
            if (data.whatsappNumber) {
              OFFICIAL_INFO.whatsappNumber = data.whatsappNumber;
              OFFICIAL_INFO.whatsappNumberClean = data.whatsappNumber.replace(/\D/g, '');
              OFFICIAL_INFO.whatsappAgentNumber = data.whatsappNumber;
            }
            if (data.officialWebsite) OFFICIAL_INFO.officialWebsite = data.officialWebsite;
            if (data.addressBn) OFFICIAL_INFO.addressBn = data.addressBn;
            if (data.addressEn) OFFICIAL_INFO.addressEn = data.addressEn;
            if (data.kycUrl) OFFICIAL_INFO.kycUrl = data.kycUrl;
            if (data.orderUrl) OFFICIAL_INFO.orderUrl = data.orderUrl;
            if (data.salesEmail || data.email) {
              OFFICIAL_INFO.emails.sales = data.salesEmail || data.email;
            }
            if (data.technicalEmail) {
              OFFICIAL_INFO.emails.technical = data.technicalEmail;
            }
            if (data.billingEmail) {
              OFFICIAL_INFO.emails.billing = data.billingEmail;
            }
          }
        }
        // Initialize marketing tags (GTM, GA4, Meta Pixel, Search Console)
        // from admin-configured, format-validated IDs. Safe no-op if unset.
        initTracking({
          gtmContainerId: data?.gtmContainerId,
          gaMeasurementId: data?.gaMeasurementId,
          metaPixelId: data?.metaPixelId,
          googleSiteVerification: data?.googleSiteVerification,
        });
      })
      .catch(() => {});
      
    // Fetch active widgets
    fetch('/api/widgets')
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          if (data.widgets && Array.isArray(data.widgets)) {
            setWidgetsConfig(data.widgets);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    trackEvent('pageview', 'Landing Page Loaded', window.location.href);
    setIsDataLoading(false);

    // Server-side visitor log (device/geo) + live heartbeat (fire-and-forget).
    const page = window.location.pathname || '/';
    const post = (path: string) =>
      fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page }) }).catch(() => {});
    post('/api/visitor/log');
    post('/api/visitor/ping');
    const pingInterval = window.setInterval(() => post('/api/visitor/ping'), 45000);

    // Throttle the scroll tick sound (was firing on every scroll event).
    let lastTick = 0;
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastTick > 350) { lastTick = now; playScrollTickSound(); }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Shift+A toggles Owner Analytics — but NOT while typing in a field.
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (!typing && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        setIsAnalyticsOpen((prev) => {
          if (!prev) playModalOpenSound(); else playModalCloseSound();
          return !prev;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      window.clearInterval(pingInterval);
    };
  }, []);

  const scrollToLeadForm = () => {
    const el = document.getElementById('lead-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLockValuation = (valuation: NumberValuation) => {
    setLockedValuation(valuation);
    setSelectedNumber(valuation.number);
    scrollToLeadForm();
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-white font-sans selection:bg-sky-500 selection:text-white pb-16 sm:pb-0 relative overflow-x-clip">
      <SEO 
        title={lang === 'bn' ? 'বাংলা কল - বাংলাদেশের সেরা আইপি টেলিফোনি সার্ভিস' : 'Bangla Call - Best IP Telephony Service in Bangladesh'} 
        description={lang === 'bn' ? 'সর্বনিম্ন কল রেট, ফ্রি রেজিস্ট্রেশন, এবং ক্রিস্টাল ক্লিয়ার ভয়েস কোয়ালিটি নিয়ে বাংলা কল। আজই আপনার 09649 নম্বর বেছে নিন।' : 'Bangla Call with lowest call rates, free registration, and crystal clear voice quality. Choose your 09649 number today.'} 
      />

      <LiveStatsBanner lang={lang} />

      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-brand-primary z-[60] origin-left pointer-events-none"
        style={{ scaleX: scrollYProgress }}
      />
      
      <NetworkBackground />
      <PatternBackground />
      {/* Global Background Textures */}
      
      
      
      <div className="relative z-10">
        {/* Navbar */}
      <Navbar
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        currentPalette={palette}
        onSelectPalette={setPalette}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenLeadForm={scrollToLeadForm}
      />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 w-full min-w-0 max-w-full overflow-x-clip">
          
          {/* Render widgets dynamically based on configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 min-w-0 w-full">
            {widgetsConfig
              .filter(w => w.visible)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(widget => {
                const getColSpanClass = (span?: string) => {
                  if (span === '1') return 'md:col-span-1 xl:col-span-1';
                  if (span === '2') return 'md:col-span-2 xl:col-span-2';
                  return 'md:col-span-2 xl:col-span-3';
                };

                const IconComponent = () => {
                  switch (widget.iconName) {
                    case 'Sparkles': return <Sparkles className="w-4 h-4" />;
                    case 'FileText': return <FileText className="w-4 h-4" />;
                    case 'ShieldCheck': return <ShieldCheck className="w-4 h-4" />;
                    case 'Map': return <Map className="w-4 h-4" />;
                    case 'Route': return <Route className="w-4 h-4" />;
                    case 'CreditCard': return <CreditCard className="w-4 h-4" />;
                    case 'BarChart2': return <BarChart2 className="w-4 h-4" />;
                    case 'Calculator': return <Calculator className="w-4 h-4" />;
                    case 'Share2': return <Share2 className="w-4 h-4" />;
                    case 'HelpCircle': return <HelpCircle className="w-4 h-4" />;
                    default: return <Sparkles className="w-4 h-4" />;
                  }
                };

                const commonProps = {
                  id: widget.id,
                  titleBn: widget.titleBn,
                  titleEn: widget.titleEn,
                  icon: <IconComponent />,
                  lang,
                  className: getColSpanClass(widget.colSpan),
                  defaultCollapsed: widget.defaultCollapsed,
                };

                const renderWidgetContent = () => {
                  switch (widget.id) {
                    case 'hero':
                      return <Hero lang={lang} onLockValuation={handleLockValuation} onOpenLeadForm={scrollToLeadForm} />;
                    case 'ai-valuation':
                      return <AiNumberValuator lang={lang} onLockValuation={handleLockValuation} />;
                    case 'lead-form-section':
                      return (
                        <LeadCaptureForm
                          lang={lang}
                          selectedNumber={selectedNumber}
                          lockedValuation={lockedValuation}
                          onSuccess={() => {
                            trackEvent('lead_submission', 'Form Submit Success');
                          }}
                        />
                      );
                    case 'trust':
                      return <TrustIndicators lang={lang} />;
                    case 'coverage':
                      return <CoverageMap lang={lang} />;
                    case 'onboarding':
                      return <OnboardingRoadmap lang={lang} />;
                    case 'pricing':
                      return <ActivationPricingPolicy lang={lang} onOpenLeadForm={scrollToLeadForm} />;
                    case 'comparison':
                      return <ComparisonTable lang={lang} onOpenLeadForm={scrollToLeadForm} isLoading={isDataLoading} />;
                    case 'calculator':
                      return <RateCalculator lang={lang} onClaimSavings={scrollToLeadForm} />;
                    case 'offers':
                      return <OffersGrid lang={lang} onSelectOffer={() => scrollToLeadForm()} isLoading={isDataLoading} />;
                    case 'corporate':
                      return <CorporateSolutions lang={lang} onRequestQuote={scrollToLeadForm} />;
                    case 'success-stories':
                      return <SuccessStories lang={lang} />;
                    case 'refer':
                      return <ReferAFriend lang={lang} />;
                    case 'faq':
                      return (
                        <div className="space-y-3 p-4">
                          {FAQS.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                              <div
                                key={index}
                                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
                              >
                                <button
                                  onClick={() => {
                                    playClickSound();
                                    setOpenFaq(isOpen ? null : index);
                                    trackEvent('cta_click', `FAQ Toggle: ${index}`);
                                  }}
                                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4 hover:text-emerald-600 dark:text-emerald-400 transition-colors"
                                >
                                  <span>{lang === 'bn' ? faq.qBn : faq.qEn}</span>
                                  <ChevronDown
                                    className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-200 shrink-0 ${
                                      isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                                    }`}
                                  />
                                </button>

                                {isOpen && (
                                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/60 leading-relaxed bg-slate-50 dark:bg-slate-950/40">
                                    {lang === 'bn' ? faq.aBn : faq.aEn}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    default:
                      return null;
                  }
                };

                return (
                  <Widget key={widget.id} {...commonProps}>
                    {renderWidgetContent()}
                  </Widget>
                );
              })}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer lang={lang} />

      {/* Glassmorphism Bottom Nav Menu */}
      <GlassmorphismBottomNav lang={lang} onOpenLeadForm={scrollToLeadForm} />

      {/* Owner/Marketer Analytics Tracker Modal */}
      <Suspense fallback={null}>
        <AnalyticsDashboardModal
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          lang={lang}
        />
      </Suspense>

      {/* Admin Panel & CMS Modal */}
      <Suspense fallback={null}>
        <AdminPanelModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          lang={lang}
          currentPalette={palette}
          onSelectPalette={setPalette}
        />
      </Suspense>

      {/* Exit Intent Modal */}
      <ExitIntentModal lang={lang} onOpenLeadForm={scrollToLeadForm} />

      {/* Social Proof Popup */}
      <SocialProofPopup lang={lang} />

      {/* Global Sound Effects Handler */}
      <GlobalSoundHandler />
    </div>
  );
}
