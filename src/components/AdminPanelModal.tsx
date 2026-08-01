import React, { useState, useEffect } from 'react';
import {
  X, ShieldCheck, Lock, User, Key, Save, AlertCircle, Send,
  Download, RefreshCw, Database, Bot, Settings, Code,
  Eye, Sparkles, Trash2, Palette, Menu, Plus, EyeOff, LayoutDashboard, ChevronUp, ChevronDown, SlidersHorizontal
} from 'lucide-react';
import { Language, ColorPaletteId, COLOR_PALETTES, WidgetConfig } from '../types';
import { useToast } from './Toast';
import { getAdminToken, setAdminToken, clearAdminToken } from '../lib/api';
import { MonitoringDashboard } from './MonitoringDashboard';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentPalette: ColorPaletteId;
  onSelectPalette: (paletteId: ColorPaletteId) => void;
  onUpdateWidgets?: (widgets: WidgetConfig[]) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentPalette,
  onSelectPalette,
  onUpdateWidgets,
}) => {
  const isBn = lang === 'bn';
  const { showToast } = useToast();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'widgets' | 'leads' | 'theme' | 'settings' | 'telegram' | 'visitors' | 'security' | 'custom_code' | 'api_keys' | 'monitoring'>('widgets');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Admin Data States
  const [leads, setLeads] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Manual Lead Modal state
  const [isManualLeadOpen, setIsManualLeadOpen] = useState(false);
  const [manualLeadName, setManualLeadName] = useState('');
  const [manualLeadPhone, setManualLeadPhone] = useState('');
  const [manualLeadNumber, setManualLeadNumber] = useState('');
  const [manualLeadService, setManualLeadService] = useState<'personal' | 'corporate' | 'reseller'>('personal');

  // Site Settings
  // Site Settings
  const [settings, setSettings] = useState({
    brandNameBn: 'বাংলা কল',
    brandNameEn: 'Bangla Call',
    companyNameBn: 'Sarker Communication (সরকার কমিউনিকেশন)',
    companyNameEn: 'Sarker Communication',
    licenseNo: 'Govt Permit: 09649 (IPTSP)',
    prefix: '09649',
    callRate: '30 Paisa / Min',
    callRateBn: 'মাত্র 30 পয়সা / মিনিট',
    helpline1: '09649000005',
    helpline2: '09649000006',
    whatsappNumber: '+8801550059293',
    salesEmail: 'sales@sarkercommunication.com',
    technicalEmail: 'iptsp@sarkercommunication.com',
    billingEmail: 'billing@sarkercommunication.com',
    officialWebsite: 'www.banglacalls.com',
    addressBn: '05, বি-বাড়িয়া স্কুল মার্কেট, ব্রাহ্মণবাড়িয়া',
    addressEn: '05, B-Baria School Market, Brahmanbaria',
    kycUrl: 'https://kyc.amarip.net',
    orderUrl: 'https://amarip.ihp.bd/telephone',
    numberAvailabilityApi: 'https://amarip.net/api/sip-username-available',
    liveStatsEnabled: 'true',
    liveStatsActiveBase: '12000',
    liveStatsCallsBase: '85000',
    taglineBn: 'বিটিআরসি অনুমোদিত আইপি টেলিফোনি সেবা',
    taglineEn: 'BTRC Licensed IP Telephony Service',
    phone: '09649000005',
    email: 'iptsp@sarkercommunication.com',
    btrcLicenseNo: 'Govt Permit: 09649 (IPTSP)',
    telegramBotToken: '',
    telegramChatId: '',
    telegramAlertsEnabled: false,
    geminiApiKey: '',
    smsApiKey: '',
    paymentApiKey: '',
    gtmContainerId: '',
    gaMeasurementId: '',
    metaPixelId: '',
    googleSiteVerification: '',
    metaTestEventCode: '',
    serverTrackingEnabled: 'true',
    metaCapiToken: '',
    ga4ApiSecret: '',
    activePalette: currentPalette,
  });

  // Change Password State
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // First-run setup wizard state
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [setupUsername, setSetupUsername] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupError, setSetupError] = useState('');

  // Telegram Test State
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  // Which write-only secrets are configured on the server (values never sent).
  const [secretStatus, setSecretStatus] = useState<Record<string, boolean>>({});

  // AI provider config + model list + test result
  const [aiConfig, setAiConfig] = useState<{ model: string; enabled: boolean; daily_limit: number; used_today: number; keyConfigured: boolean }>({ model: 'gemini-2.5-flash', enabled: true, daily_limit: 500, used_today: 0, keyConfigured: false });
  const [aiModels, setAiModels] = useState<string[]>([]);
  const [aiBusy, setAiBusy] = useState(false);

  // Auth-injecting fetch: adds the Bearer token when present so every admin
  // request is authenticated. Login (no token yet) falls through as a plain call.
  const authFetch = (path: string, init: RequestInit = {}) => {
    const token = getAdminToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...((init.headers as Record<string, string>) || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(path, { ...init, headers });
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when login state flips
  }, [isLoggedIn]);

  // On open (when not logged in), determine whether first-run setup is needed.
  useEffect(() => {
    if (isOpen && !isLoggedIn) {
      fetch('/api/admin/setup-status')
        .then((r) => (r.ok ? r.json() : { needsSetup: false }))
        .then((d) => setNeedsSetup(!!d.needsSetup))
        .catch(() => setNeedsSetup(false));
    }
  }, [isOpen, isLoggedIn]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    if (setupPassword !== setupConfirm) {
      setSetupError(isBn ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: setupUsername, password: setupPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setAdminToken(data.token);
        setNeedsSetup(false);
        setIsLoggedIn(true);
        showToast(
          isBn ? 'ওনার একাউন্ট তৈরি হয়েছে!' : 'Owner account created!',
          isBn ? 'আপনি এখন এডমিন প্যানেলে প্রবেশ করেছেন' : 'You are now signed in',
          'success'
        );
      } else {
        setSetupError(data.error || (isBn ? 'সেটআপ ব্যর্থ' : 'Setup failed'));
        if (res.status === 409) setNeedsSetup(false);
      }
    } catch {
      setSetupError(isBn ? 'সার্ভার কানেকশন ত্রুটি' : 'Server connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Settings ({ settings, secretStatus } — secrets are write-only)
      const setRes = await authFetch('/api/admin/settings');
      if (setRes.ok) {
        const ct = setRes.headers.get("content-type"); 
        if (ct && ct.includes("application/json")) { 
          const setJson = await setRes.json();
          if (setJson.settings) {
            setSettings((prev) => ({
              ...prev,
              ...setJson.settings,
              telegramAlertsEnabled: String(setJson.settings.telegramAlertsEnabled) === 'true',
            }));
          }
          if (setJson.secretStatus) setSecretStatus(setJson.secretStatus);
        }
      }

      // Fetch AI config
      try {
        const aiRes = await authFetch('/api/admin/ai/config');
        if (aiRes.ok) setAiConfig(await aiRes.json());
      } catch { /* ignore */ }

      // Fetch Widgets
      const widgetRes = await authFetch('/api/admin/widgets');
      if (widgetRes.ok) {
        const ct = widgetRes.headers.get("content-type");
        if (ct && ct.includes("application/json")) {
          const wJson = await widgetRes.json();
          if (wJson.widgets && Array.isArray(wJson.widgets)) {
            setWidgets(wJson.widgets);
          }
        }
      }

      // Fetch Leads
      const leadsRes = await authFetch('/api/admin/leads');
      if (leadsRes.ok) {
        const ct = leadsRes.headers.get("content-type"); 
        if (ct && ct.includes("application/json")) { 
          const leadsJson = await leadsRes.json();
          setLeads(Array.isArray(leadsJson?.leads) ? leadsJson.leads : []);
        }
      }

      // Fetch Visitor Logs
      const visRes = await authFetch('/api/admin/visitors');
      if (visRes.ok) {
        const ct = visRes.headers.get("content-type"); 
        if (ct && ct.includes("application/json")) { 
          const visJson = await visRes.json();
          setVisitors(Array.isArray(visJson?.visitors) ? visJson.visitors : []);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Widget management functions
  const handleSaveWidgets = async (updatedList?: WidgetConfig[]) => {
    const targetList = updatedList || widgets;
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: targetList }),
      });
      if (res.ok) {
        showToast(
          isBn ? 'উইজেট লেআউট সেভ হয়েছে!' : 'Widget Layout Saved!',
          isBn ? 'ভিজিটরদের জন্য নতুন সাজানো অবস্থান ও দৃশ্যমানতা সেভ করা হয়েছে' : 'New widget ordering & visibility updated live for visitors',
          'success'
        );
        if (onUpdateWidgets) {
          onUpdateWidgets(targetList);
        }
      }
    } catch (err) {
      showToast(isBn ? 'সেভ করতে ব্যর্থ' : 'Failed to save layout', '', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetWidgets = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin/widgets/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.widgets) {
        setWidgets(data.widgets);
        if (onUpdateWidgets) onUpdateWidgets(data.widgets);
        showToast(
          isBn ? 'ডিফল্ট লেআউট রিস্টোর হয়েছে' : 'Default Layout Restored',
          '',
          'info'
        );
      }
    } catch (err) {
      showToast(isBn ? 'রিসেট করতে ব্যর্থ' : 'Reset failed', '', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= widgets.length) return;
    const list = [...widgets];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;
    
    // Update order ranks
    const reordered = list.map((item, idx) => ({ ...item, order: idx }));
    setWidgets(reordered);
    handleSaveWidgets(reordered);
  };

  const handleToggleWidgetVisible = (id: string) => {
    const updated = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    setWidgets(updated);
    handleSaveWidgets(updated);
  };

  const handleToggleWidgetCollapsed = (id: string) => {
    const updated = widgets.map(w => w.id === id ? { ...w, defaultCollapsed: !w.defaultCollapsed } : w);
    setWidgets(updated);
    handleSaveWidgets(updated);
  };

  const handleChangeWidgetSpan = (id: string, colSpan: '1' | '2' | '3' | 'full') => {
    const updated = widgets.map(w => w.id === id ? { ...w, colSpan } : w);
    setWidgets(updated);
    handleSaveWidgets(updated);
  };

  const handleChangeWidgetTitle = (id: string, field: 'titleBn' | 'titleEn', val: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, [field]: val } : w));
  };

  // Lead Actions
  const handleDeleteLead = async (id: string) => {
    try {
      const res = await authFetch('/api/admin/leads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== id));
        showToast(isBn ? 'লিড ডিলিট করা হয়েছে' : 'Lead Deleted', '', 'info');
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleClearAllLeads = async () => {
    if (!window.confirm(isBn ? 'আপনি কি নিশ্চিত যে সমস্ত লিড মুছে ফেলতে চান?' : 'Are you sure you want to clear all leads?')) return;
    try {
      const res = await authFetch('/api/admin/leads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'ALL' }),
      });
      if (res.ok) {
        setLeads([]);
        showToast(isBn ? 'সমস্ত লিড মোছা হয়েছে' : 'All Leads Cleared', '', 'info');
      }
    } catch (err) {
      console.error('Clear leads failed', err);
    }
  };

  const handleAddManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLeadName || !manualLeadPhone) {
      showToast(isBn ? 'নাম ও ফোন নম্বর প্রয়োজন' : 'Name & Phone required', '', 'warning');
      return;
    }
    try {
      const res = await authFetch('/api/admin/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: manualLeadName,
          phone: manualLeadPhone,
          numberChoice: manualLeadNumber,
          serviceType: manualLeadService,
        }),
      });
      const data = await res.json();
      if (res.ok && data.lead) {
        setLeads(prev => [data.lead, ...prev]);
        showToast(isBn ? 'নতুন লিড যুক্ত হয়েছে!' : 'Manual Lead Added!', '', 'success');
        setManualLeadName('');
        setManualLeadPhone('');
        setManualLeadNumber('');
        setIsManualLeadOpen(false);
      }
    } catch (err) {
      console.error('Manual lead failed', err);
    }
  };

  const handleClearVisitorLogs = async () => {
    try {
      const res = await authFetch('/api/admin/visitors/clear', { method: 'POST' });
      if (res.ok) {
        setVisitors([]);
        showToast(isBn ? 'ভিজিটর লগ ক্লিয়ার করা হয়েছে' : 'Visitor Logs Cleared', '', 'info');
      }
    } catch (err) {
      console.error('Clear logs failed', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const res = await authFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || contentType.indexOf("application/json") === -1) {
        throw new Error("Non-JSON response");
      }
      const data = await res.json();

      if (res.ok && data.success && data.token) {
        setAdminToken(data.token);
        setIsLoggedIn(true);
        if (data.user?.mustChangePw) {
          setActiveTab('security');
          showToast(isBn ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Change your password', isBn ? 'ডিফল্ট পাসওয়ার্ড এখনই পরিবর্তন করুন' : 'Please change the default password now', 'warning', 6000);
        } else {
          showToast(
            isBn ? 'এডমিন প্যানেলে স্বাগতম!' : 'Welcome to Admin Control Panel!',
            isBn ? 'সকল সাইট কন্ট্রোল প্যানেল আনলক হয়েছে' : 'All dashboard management features unlocked',
            'success'
          );
        }
      } else {
        setLoginError(data.error || (isBn ? 'লগইন ব্যর্থ হয়েছে' : 'Login failed'));
      }
    } catch (err) {
      setLoginError(isBn ? 'সার্ভার কানেকশন ত্রুটি' : 'Server connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast(
          isBn ? 'সাইট সেটিংস সেভ হয়েছে!' : 'Settings Saved Successfully!',
          isBn ? 'নতুন পরিবর্তন ওয়েবসাইটে প্রয়োগ করা হয়েছে' : 'Changes updated live on the website',
          'success'
        );
      }
    } catch (err) {
      showToast(isBn ? 'সেভ করতে ব্যর্থ' : 'Failed to save', '', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLeadStatus = async (id: string, newStatus: string) => {
    try {
      const res = await authFetch('/api/admin/leads/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
        showToast(
          isBn ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status Updated',
          `${id} -> ${newStatus}`,
          'info'
        );
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleTestTelegramBot = async () => {
    // Token/chat id are configured server-side (env or write-only secret) — no
    // secrets are sent from the browser. Save first if you just entered them.
    setIsTestingTelegram(true);
    try {
      const res = await authFetch('/api/admin/telegram/test', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          isBn ? 'টেলিগ্রাম বার্তা প্রেরিত হয়েছে!' : 'Telegram Test Message Sent!',
          isBn ? 'আপনার টেলিগ্রাম অ্যাপ বা চ্যানেলে চেক করুন' : 'Check your Telegram group or channel',
          'success'
        );
      } else {
        showToast(
          isBn ? 'টেলিগ্রাম টেস্ট ব্যর্থ' : 'Telegram Test Failed',
          data.error || '',
          'warning'
        );
      }
    } catch (err) {
      showToast(isBn ? 'টেলিগ্রাম কানেকশন ত্রুটি' : 'Connection Error', '', 'warning');
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      showToast(isBn ? 'নতুন পাসওয়ার্ড মিলছে না' : 'New passwords do not match', '', 'warning');
      return;
    }

    try {
      const res = await authFetch('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isBn ? 'পাসওয়ার্ড পরিবর্তন সফল!' : 'Password Changed Successfully!', '', 'success');
        setOldPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        showToast(isBn ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ' : 'Password Change Failed', data.error || '', 'warning');
      }
    } catch (err) {
      showToast(isBn ? 'ত্রুটি ঘটেছে' : 'Error occurred', '', 'warning');
    }
  };

  // ---- AI provider handlers ----
  const handleLoadAiModels = async () => {
    setAiBusy(true);
    try {
      const res = await authFetch('/api/admin/ai/models');
      const data = await res.json();
      if (res.ok && Array.isArray(data.models)) {
        setAiModels(data.models);
        showToast(isBn ? 'মডেল লোড হয়েছে' : 'Models loaded', `${data.models.length}`, 'info');
      } else {
        showToast(isBn ? 'মডেল লোড ব্যর্থ' : 'Could not load models', data.error || '', 'warning');
      }
    } catch { showToast(isBn ? 'ত্রুটি' : 'Error', '', 'warning'); }
    finally { setAiBusy(false); }
  };

  const handleSaveAiConfig = async () => {
    setAiBusy(true);
    try {
      const res = await authFetch('/api/admin/ai/config', {
        method: 'POST',
        body: JSON.stringify({ model: aiConfig.model, enabled: aiConfig.enabled, dailyLimit: aiConfig.daily_limit }),
      });
      if (res.ok) showToast(isBn ? 'AI সেটিংস সেভ হয়েছে' : 'AI settings saved', '', 'success');
      else showToast(isBn ? 'সেভ ব্যর্থ' : 'Save failed', '', 'warning');
    } catch { showToast(isBn ? 'ত্রুটি' : 'Error', '', 'warning'); }
    finally { setAiBusy(false); }
  };

  const handleTestAi = async () => {
    setAiBusy(true);
    try {
      const res = await authFetch('/api/admin/ai/test', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) showToast(isBn ? 'AI টেস্ট সফল' : 'AI test OK', `${data.model}: ${data.sample || ''}`, 'success');
      else showToast(isBn ? 'AI টেস্ট ব্যর্থ' : 'AI test failed', data.error || '', 'warning');
    } catch { showToast(isBn ? 'ত্রুটি' : 'Error', '', 'warning'); }
    finally { setAiBusy(false); }
  };

  const handleGetTelegramChatId = async () => {
    try {
      const res = await authFetch('/api/admin/telegram/chat-id');
      const data = await res.json();
      if (res.ok && data.chatId) {
        setSettings((s) => ({ ...s, telegramChatId: data.chatId }));
        showToast(isBn ? 'চ্যাট আইডি পাওয়া গেছে' : 'Chat ID found', data.chatId, 'success');
      } else {
        showToast(isBn ? 'চ্যাট আইডি পাওয়া যায়নি' : 'Chat ID not found', data.error || '', 'warning');
      }
    } catch { showToast(isBn ? 'ত্রুটি' : 'Error', '', 'warning'); }
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsLoggedIn(false);
    setPassword('');
  };

  const handleExportCsv = () => {
    if (leads.length === 0) {
      showToast(isBn ? 'কোনো লিড নেই' : 'No leads to export', '', 'warning');
      return;
    }

    const headers = ['ID', 'Name', 'Phone', 'Service Type', 'Number Choice', 'AI 1st Recharge', 'Status', 'Timestamp'];
    const rows = leads.map((l) => [
      l.id,
      `"${l.name || ''}"`,
      `"${l.phone || ''}"`,
      l.serviceType || 'personal',
      l.numberChoice || 'None',
      l.aiRechargeAmount || 'N/A',
      l.status || 'New',
      new Date(l.createdAt || l.timestamp || Date.now()).toLocaleString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bangla_call_admin_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const filteredLeads = leads.filter((l) => {
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      (l.name && l.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.phone && l.phone.includes(searchQuery)) ||
      (l.numberChoice && l.numberChoice.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-950 w-full h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0 relative z-40">
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors sm:hidden"
              >
                <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </button>
            )}
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary hidden sm:block">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2 font-heading tracking-tight">
                <span>{isBn ? 'বাংলা কল সিএমএস প্যানেল' : 'Bangla Call CMS Suite'}</span>
                {isLoggedIn && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold hidden sm:inline-block">
                    Super Admin
                  </span>
                )}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {isBn ? 'ওয়েবসাইট ডেটা, লিড, টেলিগ্রাম বট নোটিফিকেশন ও সাইট সেটিংস নিয়ন্ত্রণ করুন' : 'Live site data, customer bookings, Telegram bot alerts & site preferences'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-950/70 transition-colors text-xs font-bold flex items-center gap-1.5"
                title={isBn ? 'লগ আউট' : 'Log out'}
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isBn ? 'লগ আউট' : 'Log out'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex-shrink-0 bg-slate-50 dark:bg-slate-900 sm:bg-transparent border border-slate-200 dark:border-slate-800 sm:border-transparent"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        {!isLoggedIn ? (
          /* Login View */
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full space-y-6 my-auto text-slate-900 dark:text-white">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center mx-auto text-slate-500">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold font-heading">{needsSetup ? (isBn ? 'ওনার একাউন্ট তৈরি করুন' : 'Create Owner Account') : (isBn ? 'এডমিন লগইন' : 'Admin Portal Authentication')}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {needsSetup
                  ? (isBn ? 'এখনো কোনো এডমিন নেই — প্রথম ওনার একাউন্টটি তৈরি করুন।' : 'No admin exists yet — create the first owner account.')
                  : (isBn ? 'সাইট পরিচালনা করতে সাইন ইন করুন।' : 'Sign in to manage your site.')}
              </p>
            </div>

            {needsSetup ? (
              <>
                {setupError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{setupError}</span>
                  </div>
                )}
                <form onSubmit={handleSetup} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      {isBn ? 'ইউজারনেম' : 'Username'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={setupUsername}
                        onChange={(e) => setSetupUsername(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-300 dark:border-slate-800 focus:border-slate-500 focus:outline-none"
                        placeholder={isBn ? 'যেমন: owner' : 'e.g. owner'}
                        autoComplete="username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      {isBn ? 'পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)' : 'Password (min 8 chars)'}
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={setupPassword}
                        onChange={(e) => setSetupPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-300 dark:border-slate-800 focus:border-slate-500 focus:outline-none"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      {isBn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={setupConfirm}
                        onChange={(e) => setSetupConfirm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-300 dark:border-slate-800 focus:border-slate-500 focus:outline-none"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /><span>{isBn ? 'একাউন্ট তৈরি করুন' : 'Create Account'}</span></>}
                  </button>
                </form>
              </>
            ) : (
              <>
                {loginError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      {isBn ? 'ইউজারনেম (Username):' : 'Username:'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-300 dark:border-slate-800 focus:border-slate-500 focus:outline-none"
                        placeholder="owner"
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      {isBn ? 'পাসওয়ার্ড (Password):' : 'Password:'}
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-300 dark:border-slate-800 focus:border-slate-500 focus:outline-none"
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>{isBn ? 'প্যানেলে প্রবেশ করুন' : 'Sign In to Dashboard'}</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          /* Logged In Workspace with Navigation Tabs */
          <div className="flex-1 flex overflow-hidden relative bg-slate-50 dark:bg-slate-900">
            
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
              <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-20 sm:hidden transition-opacity" 
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Professional Sidebar Navigation */}
            <div className={`
              absolute sm:relative z-30 sm:z-auto
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
              transition-transform duration-300 ease-in-out
              w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 
              flex flex-col h-full shrink-0 shadow-2xl sm:shadow-none
            `}>
              <div className="p-5 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between sm:hidden">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white font-heading">
                    {isBn ? 'মেইন মেনু' : 'Main Menu'}
                  </span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                
                {/* Section: Overview */}
                <div className="space-y-1.5">
                  <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    {isBn ? 'ওভারভিউ' : 'Overview'}
                  </h4>
                  
                  <button
                    onClick={() => { setActiveTab('leads'); setIsSidebarOpen(false); }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-all w-full text-left group ${
                      activeTab === 'leads'
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <Database className={`w-5 h-5 transition-colors ${activeTab === 'leads' ? 'text-brand-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    <span>{isBn ? 'বুকিং লিড' : 'Booking Leads'}</span>
                    {leads.length > 0 && (
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black ${
                        activeTab === 'leads' ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {leads.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { setActiveTab('visitors'); setIsSidebarOpen(false); }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-all w-full text-left group ${
                      activeTab === 'visitors'
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <Eye className={`w-5 h-5 transition-colors ${activeTab === 'visitors' ? 'text-brand-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    <span>{isBn ? 'ভিজিটর অ্যানালিটিক্স' : 'Visitor Analytics'}</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('monitoring'); setIsSidebarOpen(false); }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-all w-full text-left group ${
                      activeTab === 'monitoring'
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <Database className={`w-5 h-5 transition-colors ${activeTab === 'monitoring' ? 'text-brand-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    <span>{isBn ? 'স্টোরেজ ও মনিটরিং' : 'Storage & Monitoring'}</span>
                  </button>
                </div>

                {/* Section: Customization */}
                <div className="space-y-1.5">
                  <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    {isBn ? 'কাস্টমাইজেশন' : 'Customization'}
                  </h4>

                  <button
                    onClick={() => { setActiveTab('widgets'); setIsSidebarOpen(false); }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-all w-full text-left group ${
                      activeTab === 'widgets'
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <LayoutDashboard className={`w-5 h-5 transition-colors ${activeTab === 'widgets' ? 'text-brand-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    <span>{isBn ? 'উইজেট ও লেআউট ম্যানেজার' : 'Widget & Layout Manager'}</span>
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      LIVE
                    </span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('theme'); setIsSidebarOpen(false); }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-all w-full text-left group ${
                      activeTab === 'theme'
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <Palette className={`w-5 h-5 transition-colors ${activeTab === 'theme' ? 'text-brand-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    <span>{isBn ? 'কালার থিম' : 'Color Theme'}</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-all w-full text-left group ${
                      activeTab === 'settings'
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <Settings className={`w-5 h-5 transition-colors ${activeTab === 'settings' ? 'text-brand-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    <span>{isBn ? 'সাইট কন্টেন্ট' : 'Site Content'}</span>
                  </button>
                </div>

                {/* Section: Advanced */}
                <div className="space-y-1.5">
                  <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    {isBn ? 'অ্যাডভান্সড' : 'Advanced'}
                  </h4>

                  <button
                    onClick={() => { setActiveTab('telegram'); setIsSidebarOpen(false); }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-all w-full text-left group ${
                      activeTab === 'telegram'
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <Bot className={`w-5 h-5 transition-colors ${activeTab === 'telegram' ? 'text-brand-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    <span>{isBn ? 'টেলিগ্রাম ইন্টিগ্রেশন' : 'Telegram Bot'}</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('api_keys'); setIsSidebarOpen(false); }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-all w-full text-left group ${
                      activeTab === 'api_keys'
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <Key className={`w-5 h-5 transition-colors ${activeTab === 'api_keys' ? 'text-brand-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    <span>{isBn ? 'এপিআই ও সিক্রেট কিজ' : 'API Keys & Secrets'}</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('custom_code'); setIsSidebarOpen(false); }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-all w-full text-left group ${
                      activeTab === 'custom_code'
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <Code className={`w-5 h-5 transition-colors ${activeTab === 'custom_code' ? 'text-brand-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    <span>{isBn ? 'মার্কেটিং ও ট্র্যাকিং' : 'Marketing & Tracking'}</span>
                  </button>
                </div>
              </div>
              
              {/* User / Footer Profile Area */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
                <button
                  onClick={() => { setActiveTab('security'); setIsSidebarOpen(false); }}
                  className={`px-3 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all w-full text-left group ${
                    activeTab === 'security'
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Lock className={`w-5 h-5 transition-colors ${activeTab === 'security' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  <div className="flex flex-col">
                    <span>{isBn ? 'পাসওয়ার্ড পরিবর্তন' : 'Admin Security'}</span>
                    <span className="text-[10px] font-normal text-slate-400">{username || 'admin'}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Main Workspace Area */}
            <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
              <div className="max-w-5xl mx-auto space-y-8">
              {/* TAB 0: WIDGET & LAYOUT MANAGER */}
              {activeTab === 'widgets' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h4 className="text-xl font-black font-heading flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6 text-brand-primary" />
                        <span>{isBn ? 'উইজেট অবস্থান, সিকোয়েন্স ও ভিজিবিলিটি ম্যানেজার' : 'Widget Positioning, Order & Visibility Manager'}</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {isBn ? 'ওয়েবসাইটের উইজেটগুলোর ক্রমানুসারে অবস্থান পরিবর্তন (Reorder), প্রদর্শন/গোপন (Show/Hide), ডিফল্ট খোলা/বন্ধ অবস্থা ও কলাম স্প্যান সেট করুন।' : 'Modify widget positioning, toggle show/hide, set default collapsed/expanded states, and change grid width.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleResetWidgets}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{isBn ? 'ডিফল্ট লেআউট রিসেট' : 'Reset Default'}</span>
                      </button>

                      <button
                        onClick={() => handleSaveWidgets()}
                        className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isBn ? 'লেআউট সেভ করুন' : 'Save Layout'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Status Info Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-blue-950/40 border border-blue-200/60 dark:border-blue-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-brand-primary text-white shadow-md">
                        <SlidersHorizontal className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {isBn ? 'ডাইনামিক রিয়েল-টাইম উইজেট স্টোরেজ' : 'Live Persistent Widget Configuration'}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isBn ? `মোট ${widgets.length} টি উইজেট সেভ করা আছে। (${widgets.filter(w=>w.visible !== false).length} টি সক্রিয়)` : `Total ${widgets.length} widgets configured. (${widgets.filter(w=>w.visible !== false).length} active)`}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 w-fit">
                      {isBn ? '✓ লাইভ ভিজিটর সিঙ্ক চালু' : '✓ Live Synced'}
                    </span>
                  </div>

                  {/* Widget List */}
                  <div className="space-y-3">
                    {widgets.sort((a,b) => a.order - b.order).map((widget, index) => {
                      const isFirst = index === 0;
                      const isLast = index === widgets.length - 1;
                      const isVisible = widget.visible !== false;
                      const isCollapsed = widget.defaultCollapsed === true;

                      return (
                        <div
                          key={widget.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isVisible
                              ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-brand-primary/40 shadow-sm'
                              : 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            
                            {/* Order Controls & Rank */}
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="flex flex-col gap-1">
                                <button
                                  disabled={isFirst}
                                  onClick={() => handleMoveWidget(index, 'up')}
                                  className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                  title={isBn ? 'উপরে সরান' : 'Move Up'}
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                  disabled={isLast}
                                  onClick={() => handleMoveWidget(index, 'down')}
                                  className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                  title={isBn ? 'নিচে সরান' : 'Move Down'}
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black font-mono text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                #{index + 1}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    id: {widget.id}
                                  </span>
                                  {isVisible ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      {isBn ? 'দৃশ্যমান (Visible)' : 'Visible'}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                      {isBn ? 'লুকানো (Hidden)' : 'Hidden'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Title Editors */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                                  {isBn ? 'বাংলা শিরোনাম (Title BN)' : 'Title BN'}
                                </label>
                                <input
                                  type="text"
                                  value={widget.titleBn}
                                  onChange={(e) => handleChangeWidgetTitle(widget.id, 'titleBn', e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                                  {isBn ? 'ইংরেজি শিরোনাম (Title EN)' : 'Title EN'}
                                </label>
                                <input
                                  type="text"
                                  value={widget.titleEn}
                                  onChange={(e) => handleChangeWidgetTitle(widget.id, 'titleEn', e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                                />
                              </div>
                            </div>

                            {/* Right Side Options & Toggles */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              {/* Visibility Toggle */}
                              <button
                                onClick={() => handleToggleWidgetVisible(widget.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                                  isVisible
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                <span>{isVisible ? (isBn ? 'হাইড করুন' : 'Hide') : (isBn ? 'শো করুন' : 'Show')}</span>
                              </button>

                              {/* Default Collapsed Toggle */}
                              <button
                                onClick={() => handleToggleWidgetCollapsed(widget.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                                  isCollapsed
                                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                    : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                                }`}
                              >
                                <span>{isCollapsed ? (isBn ? '📁 ডিফল্ট ফোল্ডেড' : '📁 Collapsed') : (isBn ? '📂 ডিফল্ট বিস্তৃত' : '📂 Expanded')}</span>
                              </button>

                              {/* Column Span Select */}
                              <select
                                value={widget.colSpan || 'full'}
                                onChange={(e) => handleChangeWidgetSpan(widget.id, e.target.value as any)}
                                className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                              >
                                <option value="full">{isBn ? 'ফুল উইডথ (3 Cols)' : 'Full Width (3 Cols)'}</option>
                                <option value="2">{isBn ? '2 কলাম (2 Cols)' : '2 Columns'}</option>
                                <option value="1">{isBn ? '1 কলাম (1 Col)' : '1 Column'}</option>
                              </select>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 1: Customer Booking Leads */}
              {activeTab === 'leads' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h4 className="text-lg font-black font-heading">{isBn ? 'কাস্টমার বুকিং লিড তালিকা' : 'Customer Connection Booking Leads'}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isBn ? 'ওয়েবসাইট থেকে প্রেরিত সকল গ্রাহকের আবেদন ও যোগাযোগ তথ্য' : 'Real-time list of customer applications submitted through form'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setIsManualLeadOpen(!isManualLeadOpen)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isBn ? 'ম্যানুয়াল লিড যোগ' : 'Add Lead'}</span>
                      </button>

                      <button
                        onClick={handleClearAllLeads}
                        className="p-2 rounded-xl border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5"
                        title={isBn ? 'সব লিড মুছুন' : 'Clear All Leads'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={fetchData}
                        className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
                      </button>

                      <button
                        onClick={handleExportCsv}
                        className="px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-slate-500/20"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isBn ? 'CSV ডাউনলোড' : 'Export CSV'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual Lead Inline Form */}
                  {isManualLeadOpen && (
                    <form onSubmit={handleAddManualLead} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                      <h5 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 font-heading">
                        {isBn ? 'ম্যানুয়ালি কাস্টমার লিড যুক্ত করুন' : 'Add Customer Lead Manually'}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder={isBn ? 'গ্রাহকের নাম' : 'Customer Name'}
                          value={manualLeadName}
                          onChange={(e) => setManualLeadName(e.target.value)}
                          className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder={isBn ? 'ফোন নম্বর' : 'Phone Number'}
                          value={manualLeadPhone}
                          onChange={(e) => setManualLeadPhone(e.target.value)}
                          className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder={isBn ? 'পছন্দের নম্বর (ঐচ্ছিক)' : 'Preferred Number'}
                          value={manualLeadNumber}
                          onChange={(e) => setManualLeadNumber(e.target.value)}
                          className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <select
                          value={manualLeadService}
                          onChange={(e) => setManualLeadService(e.target.value as any)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                          <option value="personal">{isBn ? 'পার্সোনাল ইউজ' : 'Personal'}</option>
                          <option value="corporate">{isBn ? 'কর্পোরেট পিবিএক্স' : 'Corporate PBX'}</option>
                          <option value="reseller">{isBn ? 'রিসেলার / ট্রাঙ্ক' : 'Reseller / SIP Trunk'}</option>
                        </select>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsManualLeadOpen(false)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700"
                          >
                            {isBn ? 'বাতিল' : 'Cancel'}
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                          >
                            {isBn ? 'সেভ করুন' : 'Save Lead'}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder={isBn ? 'নাম বা মোবাইল নম্বর দিয়ে খুঁজুন...' : 'Search leads by name or phone...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 font-bold"
                    >
                      <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
                      <option value="new">{isBn ? 'নতুন' : 'New'}</option>
                      <option value="contacted">{isBn ? 'যোগাযোগ হয়েছে' : 'Contacted'}</option>
                      <option value="converted">{isBn ? 'কনভার্টেড' : 'Converted'}</option>
                      <option value="closed">{isBn ? 'ক্লোজড' : 'Closed'}</option>
                      <option value="junk">{isBn ? 'জাঙ্ক' : 'Junk'}</option>
                    </select>
                  </div>

                  {isLoading ? (
                    <div className="py-12 flex justify-center">
                      <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
                    </div>
                  ) : filteredLeads.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                      <Database className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="font-bold">{isBn ? 'কোনো লিড পাওয়া যায়নি' : 'No leads found'}</p>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                              <th className="p-3">{isBn ? 'গ্রাহকের নাম' : 'Customer Name'}</th>
                              <th className="p-3">{isBn ? 'মোবাইল নম্বর' : 'Phone'}</th>
                              <th className="p-3">{isBn ? 'পছন্দের 09649' : '09649 Choice'}</th>
                              <th className="p-3">{isBn ? '1ম রিচার্জ' : '1st Recharge'}</th>
                              <th className="p-3">{isBn ? 'সেবার ধরন' : 'Service'}</th>
                              <th className="p-3">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                              <th className="p-3 text-right">{isBn ? 'সময়' : 'Time'}</th>
                              <th className="p-3 text-center">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                            {filteredLeads.map((l) => (
                              <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="p-3 font-bold">
                                  <div>{l.name}</div>
                                  {(l.photoUrl || l.nidUrl) && (
                                    <div className="flex items-center gap-1.5 mt-1">
                                      {l.photoUrl && (
                                        <a href={l.photoUrl} target="_blank" rel="noreferrer" title={isBn ? 'লাইভ ছবি' : 'Live photo'}>
                                          <img src={l.photoUrl} alt="photo" className="w-8 h-8 rounded-md object-cover border border-slate-300 dark:border-slate-700 hover:ring-2 ring-sky-400" />
                                        </a>
                                      )}
                                      {l.nidUrl && (
                                        <a href={l.nidUrl} target="_blank" rel="noreferrer" title="NID">
                                          <img src={l.nidUrl} alt="nid" className="w-8 h-8 rounded-md object-cover border border-violet-300 dark:border-violet-800 hover:ring-2 ring-violet-400" />
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 font-mono font-bold text-brand-primary dark:text-brand-primary-hover">{l.phone}</td>
                                <td className="p-3 font-mono">{l.numberChoice || 'যেকোনো'}</td>
                                <td className="p-3 font-mono font-black text-amber-500">BDT {l.aiRechargeAmount || '100'}</td>
                                <td className="p-3 uppercase text-[10px] font-bold">{l.serviceType}</td>
                                <td className="p-3">
                                  <select
                                    value={l.status || 'new'}
                                    onChange={(e) => handleUpdateLeadStatus(l.id, e.target.value)}
                                    className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold rounded-lg px-2 py-1 border border-slate-300 dark:border-slate-700"
                                  >
                                    <option value="new">{isBn ? 'নতুন' : 'New'}</option>
                                    <option value="contacted">{isBn ? 'যোগাযোগ হয়েছে' : 'Contacted'}</option>
                                    <option value="converted">{isBn ? 'কনভার্টেড' : 'Converted'}</option>
                                    <option value="closed">{isBn ? 'ক্লোজড' : 'Closed'}</option>
                                    <option value="junk">{isBn ? 'জাঙ্ক' : 'Junk'}</option>
                                  </select>
                                </td>
                                <td className="p-3 text-right text-slate-400 font-mono text-[10px]">
                                  {new Date(l.createdAt || l.timestamp || Date.now()).toLocaleTimeString()}
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleDeleteLead(l.id)}
                                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-500 transition-colors"
                                    title={isBn ? 'লিড ডিলিট করুন' : 'Delete Lead'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Theme & Color Palette CMS */}
              {activeTab === 'theme' && (
                <div className="space-y-6 max-w-3xl">
                  <div>
                    <h4 className="text-lg font-black flex items-center gap-2 font-heading">
                      <Palette className="w-5 h-5 text-blue-500" />
                      <span>{isBn ? 'ওয়েবসাইট কালার থিম ও ডিজাইন প্যালেট' : 'Website Theme & Color Palette Management'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isBn
                        ? 'এডমিন যেকোনো সময় ওয়েবসাইটের ডিফল্ট থিম কালার সিলেক্ট করতে পারবেন। পরিবর্তনটি সাথে সাথে সকল ভিজিটরদের কাছে ডাইনামিকালি আপডেট হবে।'
                        : 'Change the global color palette for all visitors. The layout automatically updates with smooth transitions.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {COLOR_PALETTES.map((pal) => {
                      const isSelected = pal.id === currentPalette;
                      return (
                        <div
                          key={pal.id}
                          onClick={() => {
                            onSelectPalette(pal.id);
                            setSettings({ ...settings, activePalette: pal.id });
                          }}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-brand-primary text-white border-brand-primary shadow-lg ring-2 ring-brand-primary/30 scale-[1.01]'
                              : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-extrabold text-sm flex items-center gap-2 font-heading">
                              <span>{isBn ? pal.nameBn : pal.nameEn}</span>
                            </h5>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                                {isBn ? 'সক্রিয় (Active)' : 'Active'}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 mb-4 font-normal leading-relaxed">
                            {isBn ? pal.descriptionBn : pal.descriptionEn}
                          </p>

                          {/* Palette Color Swatches */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/20">
                            {pal.previewColors.map((hex, i) => (
                              <div key={i} className="flex-1 text-center">
                                <div
                                  className="h-8 rounded-lg border border-black/10 shadow-inner mb-1"
                                  style={{ backgroundColor: hex }}
                                />
                                <span className="text-[9px] font-mono opacity-60 uppercase">{hex}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {isBn ? 'ডিফল্ট সাইট থিম হিসেবে সেভ করুন' : 'Save Default Theme for All Site Visitors'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isBn ? 'বর্তমান নির্বাচিত প্যালেটটি নতুন সকল ভিজিটরের কাছে ডিফল্ট থিম হিসেবে দেখাবে।' : 'Persists this color palette on the backend.'}
                      </p>
                    </div>

                    <button
                      onClick={handleSaveSettings}
                      disabled={isLoading}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all shrink-0"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isBn ? 'সেভ করুন' : 'Save Theme'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Telegram Bot Configuration */}
              {activeTab === 'telegram' && (
                <div className="space-y-5 max-w-2xl">
                  <div>
                    <h4 className="text-lg font-black flex items-center gap-2 font-heading">
                      <Bot className="w-5 h-5 text-slate-500" />
                      <span>{isBn ? 'ইনস্ট্যান্ট টেলিগ্রাম বট এলার্ট কনফিগারেশন' : 'Instant Telegram Bot Integration'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isBn ? 'গ্রাহক বুকিং ফর্ম সাবমিট করা মাত্রই সরাসরি আপনার টেলিগ্রাম গ্রূপ বা চ্যানেলে নোটিফিকেশন পৌঁছে যাবে।' : 'Get live instant notifications on your phone via Telegram whenever a customer registers.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-500/30 text-xs space-y-2">
                    <label className="flex items-center gap-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.telegramAlertsEnabled}
                        onChange={(e) => setSettings({ ...settings, telegramAlertsEnabled: e.target.checked })}
                        className="w-4 h-4 accent-slate-500 rounded"
                      />
                      <span>{isBn ? 'নতুন লিড সাবমিশনে টেলিগ্রাম এলার্ট চালু রাখুন' : 'Enable Live Telegram Notifications for New Leads'}</span>
                    </label>
                  </div>

                  <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        Telegram Bot Token:
                      </label>
                      <input
                        type="text"
                        value={settings.telegramBotToken}
                        onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                        placeholder="e.g., 7123456789:AAFg8XYZ..."
                        className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        Telegram Chat ID / Group ID:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.telegramChatId}
                          onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                          placeholder="e.g., -100123456789 or 987654321"
                          className="flex-1 bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleGetTelegramChatId}
                          className="px-3 py-2.5 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs font-bold whitespace-nowrap hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors"
                          title={isBn ? 'বটকে মেসেজ পাঠিয়ে তারপর এটি চাপুন' : 'Message the bot first, then click this'}
                        >
                          {isBn ? 'চ্যাট আইডি আনুন' : 'Get Chat ID'}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {isBn ? 'প্রথমে বট বা গ্রুপে একটি মেসেজ পাঠান, তারপর "চ্যাট আইডি আনুন" চাপুন। টোকেন সেভ করার পর কাজ করবে।' : 'Send a message to the bot/group first, then click "Get Chat ID". Save the token first.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleTestTelegramBot}
                        disabled={isTestingTelegram}
                        className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
                      >
                        {isTestingTelegram ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{isBn ? 'টেস্ট মেসেজ পাঠান' : 'Send Test Telegram Message'}</span>
                      </button>

                      <button
                        onClick={handleSaveSettings}
                        className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-slate-500/20"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isBn ? 'সেটিংস সংরক্ষণ করুন' : 'Save Bot Settings'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'monitoring' && (
                <MonitoringDashboard lang={lang} />
              )}

              {/* TAB: API Keys & Secrets Manager */}
              {activeTab === 'api_keys' && (
                <div className="space-y-6 max-w-3xl">
                  <div>
                    <h4 className="text-lg font-black font-heading flex items-center gap-2">
                      <Key className="w-5 h-5 text-brand-primary" />
                      <span>{isBn ? 'এপিআই ও সিক্রেট কিজ ম্যানেজার' : 'API Keys & Secrets Manager'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isBn ? 'জেমিনি এআই, এসএমএস গেটওয়ে, পেমেন্ট ও অন্যান্য সিক্রেট এপিআই কি এখানে নিরাপদে কনফিগার করুন।' : 'Securely configure Gemini AI, SMS gateway, payment processor, and other secret keys for open-source deployment.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <strong className="block font-black mb-1">{isBn ? 'ওপেন সোর্স সিকিউরিটি নোটিশ' : 'Open Source Security Notice'}</strong>
                      {isBn ? 'এই প্যানেলের মাধ্যমে সেভ করা সিক্রেট কিগুলো ব্যাকএন্ড স্টোরেজে (db.json) নিরাপদে সংরক্ষিত হয় এবং কোডবেসে হার্ডকোড করা থাকে না। ফলে গিটহাবে প্রজেক্ট পাবলিক করলেও কি নিরাপদ থাকে।' : 'Secrets saved here are stored write-only in the Cloudflare D1 database — values are never returned to the browser. Leave a field blank to keep the existing value unchanged. Environment variables (wrangler secrets) always take precedence.'}
                    </div>
                  </div>

                  <div className="space-y-5 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {/* Gemini API Key */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center justify-between">
                        <span>{isBn ? 'জেমিনি এআই এপিআই কি (Gemini API Key)' : 'Google Gemini AI API Key'}</span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 lowercase">server-side protected</span>
                      </label>
                      <input
                        type="password"
                        value={settings.geminiApiKey || ''}
                        onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                        placeholder="AIzaSy..."
                        className="w-full bg-slate-50 dark:bg-slate-900 font-mono text-xs rounded-xl px-4 py-3 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        {isBn ? 'স্মার্ট নাম্বার ফাইন্ডার, এআই ভ্যালুয়েশন এবং সিজনাল ব্যানার জেনারেটর এপিআই কল করার জন্য প্রয়োজন।' : 'Required for AI-powered number valuation, smart IVR assistant, and seasonal banner generation.'}
                      </p>
                    </div>

                    {/* AI Provider Controls */}
                    <div className="pt-5 border-t border-slate-100 dark:border-slate-900 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-brand-primary" />
                          {isBn ? 'এআই মডেল কনফিগারেশন' : 'AI Model Configuration'}
                        </label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${aiConfig.keyConfigured ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                          {aiConfig.keyConfigured ? (isBn ? 'কি কনফিগারড \u2713' : 'Key configured \u2713') : (isBn ? 'কি সেট করা নেই' : 'No key set')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 items-end">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-[11px] text-slate-500 mb-1">{isBn ? 'মডেল' : 'Model'}</label>
                          <div className="flex gap-2">
                            <select
                              value={aiConfig.model}
                              onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                              className="flex-1 bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-300 dark:border-slate-700"
                            >
                              {[aiConfig.model, ...aiModels.filter((m) => m !== aiConfig.model)].map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <button type="button" onClick={handleLoadAiModels} disabled={aiBusy} className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold disabled:opacity-50">
                              {isBn ? 'মডেল লোড' : 'Load'}
                            </button>
                          </div>
                        </div>
                        <div className="w-32">
                          <label className="block text-[11px] text-slate-500 mb-1">{isBn ? 'দৈনিক লিমিট' : 'Daily limit'}</label>
                          <input type="number" min={0} value={aiConfig.daily_limit} onChange={(e) => setAiConfig({ ...aiConfig, daily_limit: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-300 dark:border-slate-700" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input type="checkbox" checked={aiConfig.enabled} onChange={(e) => setAiConfig({ ...aiConfig, enabled: e.target.checked })} className="accent-brand-primary" />
                          {isBn ? 'এআই চালু' : 'AI enabled'}
                        </label>
                        <span className="text-[11px] text-slate-500">{isBn ? 'আজ ব্যবহৃত:' : 'Used today:'} <strong>{aiConfig.used_today}</strong> / {aiConfig.daily_limit || '\u221e'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={handleSaveAiConfig} disabled={aiBusy} className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold disabled:opacity-50 inline-flex items-center gap-1.5"><Save className="w-3.5 h-3.5" />{isBn ? 'AI সেভ' : 'Save AI'}</button>
                        <button type="button" onClick={handleTestAi} disabled={aiBusy} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold disabled:opacity-50 inline-flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" />{isBn ? 'AI টেস্ট' : 'Test AI'}</button>
                      </div>
                    </div>

                    {/* SMS Gateway API Key */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'এসএমএস গেটওয়ে এপিআই কি (SMS Gateway API Key)' : 'SMS Gateway API Key'}
                      </label>
                      <input
                        type="password"
                        value={settings.smsApiKey || ''}
                        onChange={(e) => setSettings({ ...settings, smsApiKey: e.target.value })}
                        placeholder="e.g., sms_live_..."
                        className="w-full bg-slate-50 dark:bg-slate-900 font-mono text-xs rounded-xl px-4 py-3 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        {isBn ? 'গ্রাহক নিবন্ধনের পর তাৎক্ষণিক কনফার্মেশন এসএমএস পাঠানোর জন্য।' : 'Used for sending automated SMS confirmation to registered customers.'}
                      </p>
                    </div>

                    {/* Payment Gateway API Key */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'পেমেন্ট গেটওয়ে মার্চেন্ট কি (bKash/SSLCommerz Key)' : 'Payment Gateway Merchant API Key'}
                      </label>
                      <input
                        type="password"
                        value={settings.paymentApiKey || ''}
                        onChange={(e) => setSettings({ ...settings, paymentApiKey: e.target.value })}
                        placeholder="e.g., merchant_key_..."
                        className="w-full bg-slate-50 dark:bg-slate-900 font-mono text-xs rounded-xl px-4 py-3 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        {isBn ? 'অনলাইন রিচার্জ ও বিল পরিশোধের জন্য।' : 'Used for online balance top-up and invoice payments.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex justify-end">
                      <button
                        onClick={handleSaveSettings}
                        className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isBn ? 'সকল এপিআই কি সেভ করুন' : 'Save All API Keys'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Site Branding & Info CMS */}
              {activeTab === 'settings' && (
                <div className="space-y-5 max-w-3xl">
                  <div>
                    <h4 className="text-lg font-black font-heading">{isBn ? 'সাইট কন্টেন্ট ও ইনফরমেশন সিএমএস' : 'Site Branding & Contact CMS'}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isBn ? 'ওয়েবসাইটের শিরোনাম, ফোন নম্বর, বিটিআরসি লাইসেন্স ও ঠিকানা আপডেট করুন' : 'Update company brand names, support hotline, address, and license text'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'ব্র্যান্ড নেম (বাংলা):' : 'Brand Name (Bangla):'}
                      </label>
                      <input
                        type="text"
                        value={settings.brandNameBn}
                        onChange={(e) => setSettings({ ...settings, brandNameBn: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'ব্র্যান্ড নেম (ইংরেজি):' : 'Brand Name (English):'}
                      </label>
                      <input
                        type="text"
                        value={settings.brandNameEn}
                        onChange={(e) => setSettings({ ...settings, brandNameEn: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'কোম্পানি নাম (বাংলা):' : 'Company Name (Bangla):'}
                      </label>
                      <input
                        type="text"
                        value={settings.companyNameBn}
                        onChange={(e) => setSettings({ ...settings, companyNameBn: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'কোম্পানি নাম (ইংরেজি):' : 'Company Name (English):'}
                      </label>
                      <input
                        type="text"
                        value={settings.companyNameEn}
                        onChange={(e) => setSettings({ ...settings, companyNameEn: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'ট্যাগলাইন / বিটিআরসি বর্ণনা:' : 'Tagline / Subheading:'}
                      </label>
                      <input
                        type="text"
                        value={settings.taglineBn}
                        onChange={(e) => setSettings({ ...settings, taglineBn: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'নম্বর প্রিফিক্স (যেমন: 09649):' : 'Number Prefix (e.g. 09649):'}
                      </label>
                      <input
                        type="text"
                        value={settings.prefix}
                        onChange={(e) => setSettings({ ...settings, prefix: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'বিটিআরসি লাইসেন্স / পারমিট নম্বর:' : 'BTRC License / Permit No:'}
                      </label>
                      <input
                        type="text"
                        value={settings.btrcLicenseNo}
                        onChange={(e) => setSettings({ ...settings, btrcLicenseNo: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'হেল্পলাইন ১ (প্রধান):' : 'Helpline 1 (Primary):'}
                      </label>
                      <input
                        type="text"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'হেল্পলাইন ২ (বিকল্প):' : 'Helpline 2 (Secondary):'}
                      </label>
                      <input
                        type="text"
                        value={settings.helpline2}
                        onChange={(e) => setSettings({ ...settings, helpline2: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'হোয়াটসঅ্যাপ চ্যাট নম্বর:' : 'WhatsApp Chat Number:'}
                      </label>
                      <input
                        type="text"
                        value={settings.whatsappNumber}
                        onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'অফিসিয়াল ওয়েবসাইট:' : 'Official Website:'}
                      </label>
                      <input
                        type="text"
                        value={settings.officialWebsite}
                        onChange={(e) => setSettings({ ...settings, officialWebsite: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'সেলস ইমেইল:' : 'Sales Email:'}
                      </label>
                      <input
                        type="text"
                        value={settings.salesEmail}
                        onChange={(e) => setSettings({ ...settings, salesEmail: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'টেকনিক্যাল ইমেইল:' : 'Technical Email:'}
                      </label>
                      <input
                        type="text"
                        value={settings.technicalEmail}
                        onChange={(e) => setSettings({ ...settings, technicalEmail: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'কেওয়াইসি (KYC) লিংক:' : 'KYC Portal URL:'}
                      </label>
                      <input
                        type="text"
                        value={settings.kycUrl}
                        onChange={(e) => setSettings({ ...settings, kycUrl: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'অর্ডার / পোর্টাল লিংক:' : 'Order Portal URL:'}
                      </label>
                      <input
                        type="text"
                        value={settings.orderUrl}
                        onChange={(e) => setSettings({ ...settings, orderUrl: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'নম্বর এভেইলেবিলিটি API (Bangla Call):' : 'Number Availability API (Bangla Call):'}
                      </label>
                      <input
                        type="text"
                        value={settings.numberAvailabilityApi || ''}
                        onChange={(e) => setSettings({ ...settings, numberAvailabilityApi: e.target.value.trim() })}
                        placeholder="https://amarip.net/api/sip-username-available"
                        className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">{isBn ? 'সার্ভার এটিকে ?q=<নম্বর> দিয়ে কল করে এবং {"available": true/false} আশা করে।' : 'The server calls this with ?q=<number> and expects {"available": true/false}.'}</p>
                    </div>

                    <div className="sm:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/60 dark:bg-slate-950/40">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                          {isBn ? 'লাইভ-স্ট্যাটস ব্যানার' : 'Live-stats banner'}
                        </label>
                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                          <input
                            type="checkbox"
                            checked={String(settings.liveStatsEnabled) !== 'false'}
                            onChange={(e) => setSettings({ ...settings, liveStatsEnabled: e.target.checked ? 'true' : 'false' })}
                          />
                          {isBn ? 'দেখান' : 'Show'}
                        </label>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-2">{isBn ? 'এই সংখ্যাগুলো আপনার প্রদর্শিত বেসলাইন (মার্কেটিং ফিগার); "সক্রিয় ব্যবহারকারী"-তে বাস্তব লাইভ ভিজিটর যোগ হয়।' : 'These are your displayed baseline (marketing figures); real live visitors are added to "Active Users".'}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="block text-[11px] text-slate-500 mb-1">{isBn ? 'সক্রিয় ব্যবহারকারী বেস' : 'Active users base'}</span>
                          <input type="number" min={0} value={settings.liveStatsActiveBase || ''} onChange={(e) => setSettings({ ...settings, liveStatsActiveBase: e.target.value })} className="w-full bg-white dark:bg-slate-900 text-xs rounded-lg px-3 py-2 border border-slate-300 dark:border-slate-700" />
                        </div>
                        <div>
                          <span className="block text-[11px] text-slate-500 mb-1">{isBn ? 'আজকের কল বেস' : 'Calls today base'}</span>
                          <input type="number" min={0} value={settings.liveStatsCallsBase || ''} onChange={(e) => setSettings({ ...settings, liveStatsCallsBase: e.target.value })} className="w-full bg-white dark:bg-slate-900 text-xs rounded-lg px-3 py-2 border border-slate-300 dark:border-slate-700" />
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'অফিস ঠিকানা (বাংলা):' : 'Office Address (Bangla):'}
                      </label>
                      <input
                        type="text"
                        value={settings.addressBn}
                        onChange={(e) => setSettings({ ...settings, addressBn: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-xs flex items-center gap-2 shadow-md shadow-slate-500/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isBn ? 'সকল পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
                  </button>
                </div>
              )}

              {/* TAB 4: Visitor Logs */}
              {activeTab === 'visitors' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-lg font-black font-heading">{isBn ? 'রিয়েলটাইম ভিজিটর ট্র্যাকিং লগ' : 'Live Visitor Traffic Logs'}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isBn ? 'ওয়েবসাইটে আসা সর্বশেষ ট্রাফিক ও ব্রাউজার ডিভাইস রিয়েলটাইম রেকর্ড' : 'Live record of user session visits, referrers and device details'}
                      </p>
                    </div>
                    {visitors.length > 0 && (
                      <button
                        onClick={handleClearVisitorLogs}
                        className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isBn ? 'লগ মুছুন' : 'Clear Logs'}</span>
                      </button>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                    <strong>{isBn ? 'মোট ধারণকৃত সেশন:' : 'Total Logged Visits:'}</strong> {visitors.length}
                  </div>

                  {visitors.length === 0 ? (
                    <p className="text-xs text-slate-400">{isBn ? 'এখনো কোনো ভিজিটর লগ রেকর্ড হয়নি।' : 'No visitor logs captured yet.'}</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {visitors.map((v, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1 font-mono">
                          <div className="flex justify-between text-slate-400 text-[10px]">
                            <span>IP: {v.ip}</span>
                            <span>{new Date(v.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="text-brand-primary dark:text-brand-primary-hover font-bold truncate">Referrer: {v.referrer}</div>
                          <div className="text-slate-500 text-[10px] truncate">{v.userAgent}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: Marketing & Tracking */}
              {activeTab === 'custom_code' && (
                <div className="space-y-5 max-w-2xl">
                  <div>
                    <h4 className="text-lg font-black font-heading">{isBn ? 'মার্কেটিং ও ট্র্যাকিং' : 'Marketing & Tracking'}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isBn
                        ? 'GA4, Google Tag Manager, Meta Pixel, Meta Conversions API (সার্ভার-সাইড) এবং Google Search Console যুক্ত করুন। শুধু আইডি/টোকেন দিন — কোড লেখার দরকার নেই।'
                        : 'Connect GA4, Google Tag Manager, Meta Pixel, Meta Conversions API (server-side) and Google Search Console. Just enter the IDs/tokens — no code required.'}
                    </p>
                  </div>

                  {/* Client-side tags */}
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">{isBn ? 'ক্লায়েন্ট-সাইড ট্যাগ' : 'Client-side tags'}</p>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Google Tag Manager ID</label>
                      <input value={settings.gtmContainerId || ''} onChange={(e) => setSettings({ ...settings, gtmContainerId: e.target.value.trim() })} placeholder="GTM-XXXXXXX" className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">GA4 Measurement ID</label>
                      <input value={settings.gaMeasurementId || ''} onChange={(e) => setSettings({ ...settings, gaMeasurementId: e.target.value.trim() })} placeholder="G-XXXXXXXXXX" className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Meta Pixel ID</label>
                      <input value={settings.metaPixelId || ''} onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value.trim() })} placeholder="123456789012345" className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">{isBn ? 'Google Search Console ভেরিফিকেশন' : 'Google Search Console verification'}</label>
                      <input value={settings.googleSiteVerification || ''} onChange={(e) => setSettings({ ...settings, googleSiteVerification: e.target.value.trim() })} placeholder="verification token" className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700" />
                      <p className="text-[10px] text-slate-400 mt-1">{isBn ? 'HTML-ট্যাগ পদ্ধতির content অংশ। বিকল্প: GA4/GTM দিয়েও ভেরিফাই করা যায়।' : 'The content value from the HTML-tag method. Alternatively, verify via the GA4/GTM association.'}</p>
                    </div>
                    <button onClick={handleSaveSettings} disabled={isLoading} className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-xs inline-flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5" /><span>{isBn ? 'ট্যাগ সেভ করুন' : 'Save tags'}</span>
                    </button>
                  </div>

                  {/* Server-side */}
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">{isBn ? 'সার্ভার-সাইড ট্র্যাকিং' : 'Server-side tracking'}</p>
                      <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        <input type="checkbox" checked={String(settings.serverTrackingEnabled) !== 'false'} onChange={(e) => setSettings({ ...settings, serverTrackingEnabled: e.target.checked ? 'true' : 'false' })} />
                        {isBn ? 'চালু' : 'Enabled'}
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1 flex items-center gap-2">
                        {isBn ? 'Meta Conversions API টোকেন' : 'Meta Conversions API token'}
                        {secretStatus.metaCapiToken && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{isBn ? 'সেট ✓' : 'Configured ✓'}</span>}
                      </label>
                      <input type="password" value={settings.metaCapiToken || ''} onChange={(e) => setSettings({ ...settings, metaCapiToken: e.target.value })} placeholder={secretStatus.metaCapiToken ? '•••• (unchanged)' : 'EAAG... access token'} className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700" />
                      <p className="text-[10px] text-slate-400 mt-1">{isBn ? 'Events Manager → Settings → Conversions API। উপরের Pixel ID ব্যবহৃত হবে।' : 'From Events Manager → Settings → Conversions API. Uses the Pixel ID above.'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">{isBn ? 'Meta টেস্ট ইভেন্ট কোড (ঐচ্ছিক)' : 'Meta test event code (optional)'}</label>
                      <input value={settings.metaTestEventCode || ''} onChange={(e) => setSettings({ ...settings, metaTestEventCode: e.target.value.trim() })} placeholder="TEST12345" className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1 flex items-center gap-2">
                        {isBn ? 'GA4 Measurement Protocol API সিক্রেট' : 'GA4 Measurement Protocol API secret'}
                        {secretStatus.ga4ApiSecret && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{isBn ? 'সেট ✓' : 'Configured ✓'}</span>}
                      </label>
                      <input type="password" value={settings.ga4ApiSecret || ''} onChange={(e) => setSettings({ ...settings, ga4ApiSecret: e.target.value })} placeholder={secretStatus.ga4ApiSecret ? '•••• (unchanged)' : 'GA4 MP api_secret'} className="w-full bg-white dark:bg-slate-900 font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700" />
                      <p className="text-[10px] text-slate-400 mt-1">{isBn ? 'GA4 → Admin → Data Streams → Measurement Protocol API secrets।' : 'GA4 → Admin → Data Streams → Measurement Protocol API secrets.'}</p>
                    </div>
                    <button onClick={handleSaveSettings} disabled={isLoading} className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-xs inline-flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5" /><span>{isBn ? 'সার্ভার-সাইড সেভ করুন' : 'Save server-side'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                    {isBn
                      ? 'Meta Pixel ও Conversions API একই event_id দিয়ে ডিডুপ্লিকেট হয় — লিড জমা হলে ক্লায়েন্ট ও সার্ভার দুই দিক থেকেই "Lead" যায়, কিন্তু Meta একবারই গণনা করে।'
                      : 'Meta Pixel and the Conversions API are deduplicated by a shared event_id — when a lead is submitted, both client and server send the "Lead" event, but Meta counts it once.'}
                  </div>
                </div>
              )}

              {/* TAB 6: Security & Admin Password */}
              {activeTab === 'security' && (
                <div className="space-y-5 max-w-md">
                  <div>
                    <h4 className="text-lg font-black font-heading">{isBn ? 'এডমিন সিকিউরিটি ও পাসওয়ার্ড' : 'Admin Security & Password Change'}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isBn ? 'প্যানেলের নিরাপত্তা রক্ষায় নতুন পাসওয়ার্ড সেট করুন' : 'Update admin authentication credentials'}
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'পুরাতন পাসওয়ার্ড:' : 'Current Password:'}
                      </label>
                      <input
                        type="password"
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                        required
                        className="w-full bg-white dark:bg-slate-900 text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'নতুন পাসওয়ার্ড:' : 'New Password:'}
                      </label>
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        required
                        className="w-full bg-white dark:bg-slate-900 text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        {isBn ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন:' : 'Confirm New Password:'}
                      </label>
                      <input
                        type="password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        required
                        className="w-full bg-white dark:bg-slate-900 text-xs rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-slate-500/20"
                    >
                      <Key className="w-4 h-4" />
                      <span>{isBn ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Update Password'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
