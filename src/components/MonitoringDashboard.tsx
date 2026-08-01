import React, { useState, useEffect, useCallback } from "react";
import {
  HardDrive, Activity, Users, Shield, Trash2, RefreshCw, Loader2, Download,
  Globe, Smartphone, Monitor, Server, AlertTriangle, CheckCircle2, Zap, Save, Wifi,
} from "lucide-react";
import { Language } from "../types";
import { adminApi, getAdminToken } from "../lib/api";
import { useToast } from "./Toast";

interface Props { lang: Language; }

type SubTab = "storage" | "monitoring" | "analytics" | "privacy";

const fmtBytes = (b: number) => {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(b) / Math.log(1024)));
  return `${(b / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${u[i]}`;
};
const fmtNum = (n: number) => (n ?? 0).toLocaleString();

const Card: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
  <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 ${className || ""}`}>
    <div className="flex items-center gap-2 mb-3 text-slate-500 dark:text-slate-400">
      {icon}<span className="text-xs font-bold uppercase tracking-wider">{title}</span>
    </div>
    {children}
  </div>
);

const BarList: React.FC<{ rows: Array<{ k: string; c: number }>; empty: string }> = ({ rows, empty }) => {
  const max = Math.max(1, ...rows.map((r) => r.c));
  if (!rows.length) return <p className="text-xs text-slate-400">{empty}</p>;
  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-28 truncate text-slate-600 dark:text-slate-300" title={r.k}>{r.k || "—"}</span>
          <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${(r.c / max) * 100}%` }} />
          </div>
          <span className="w-10 text-right font-mono font-bold text-slate-500">{fmtNum(r.c)}</span>
        </div>
      ))}
    </div>
  );
};

export const MonitoringDashboard: React.FC<Props> = ({ lang }) => {
  const isBn = lang === "bn";
  const { showToast } = useToast();
  const [tab, setTab] = useState<SubTab>("storage");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [storage, setStorage] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Retention/privacy form
  const [ret, setRet] = useState({ retentionPhotoDays: "90", retentionVisitorDays: "180", storageAlertPct: "80", r2FreeGb: "10", d1FreeGb: "5", cfAccountId: "" });
  const [cfToken, setCfToken] = useState("");

  const load = useCallback(async (which: SubTab) => {
    setLoading(true);
    try {
      if (which === "storage") setStorage(await adminApi("/api/admin/storage"));
      else if (which === "monitoring") setHealth(await adminApi("/api/admin/health"));
      else if (which === "analytics") setAnalytics(await adminApi("/api/admin/analytics/overview"));
      else if (which === "privacy") {
        const s = await adminApi<{ settings: any }>("/api/admin/settings");
        const g = s.settings || {};
        setRet({
          retentionPhotoDays: String(g.retentionPhotoDays ?? "90"),
          retentionVisitorDays: String(g.retentionVisitorDays ?? "180"),
          storageAlertPct: String(g.storageAlertPct ?? "80"),
          r2FreeGb: String(g.r2FreeGb ?? "10"),
          d1FreeGb: String(g.d1FreeGb ?? "5"),
          cfAccountId: String(g.cfAccountId ?? ""),
        });
      }
    } catch (e: any) {
      showToast(isBn ? "লোড ব্যর্থ" : "Load failed", e?.message || "", "warning");
    } finally {
      setLoading(false);
    }
  }, [isBn, showToast]);

  useEffect(() => { load(tab); }, [tab, load]);

  // Auto-refresh the live counter while on analytics.
  useEffect(() => {
    if (tab !== "analytics") return;
    const id = window.setInterval(() => adminApi("/api/admin/analytics/overview").then(setAnalytics).catch(() => {}), 20000);
    return () => window.clearInterval(id);
  }, [tab]);

  const purge = async (scope: "orphans" | "all") => {
    const msg = scope === "all"
      ? (isBn ? "সব ছবি/NID স্থায়ীভাবে মুছে ফেলা হবে। নিশ্চিত?" : "Permanently delete ALL stored photos/NID. Continue?")
      : (isBn ? "অনাথ ফাইলগুলো মুছবেন?" : "Delete orphaned files?");
    if (!window.confirm(msg)) return;
    setBusy(true);
    try {
      const r = await adminApi<{ deleted: number }>("/api/admin/storage/purge", { method: "POST", body: JSON.stringify({ scope }) });
      showToast(isBn ? "সম্পন্ন" : "Done", `${r.deleted} ${isBn ? "ফাইল মুছে ফেলা হয়েছে" : "files deleted"}`, "success");
      load("storage");
    } catch (e: any) { showToast(isBn ? "ব্যর্থ" : "Failed", e?.message || "", "warning"); }
    finally { setBusy(false); }
  };

  const runRetention = async () => {
    setBusy(true);
    try {
      const r = await adminApi<any>("/api/admin/retention/run", { method: "POST" });
      showToast(isBn ? "রিটেনশন চালানো হয়েছে" : "Retention ran", `${r.photosDeleted} photos, ${r.visitorsPurged} logs`, "success");
    } catch (e: any) { showToast(isBn ? "ব্যর্থ" : "Failed", e?.message || "", "warning"); }
    finally { setBusy(false); }
  };

  const savePrivacy = async () => {
    setBusy(true);
    try {
      const body: any = { ...ret };
      if (cfToken) body.cfApiToken = cfToken;
      await adminApi("/api/admin/settings", { method: "POST", body: JSON.stringify(body) });
      setCfToken("");
      showToast(isBn ? "সেভ হয়েছে" : "Saved", "", "success");
    } catch (e: any) { showToast(isBn ? "ব্যর্থ" : "Failed", e?.message || "", "warning"); }
    finally { setBusy(false); }
  };

  const testCf = async () => {
    setBusy(true);
    try {
      await adminApi("/api/admin/cf/test", { method: "POST" });
      showToast(isBn ? "টোকেন বৈধ ✓" : "Token valid ✓", "", "success");
    } catch (e: any) { showToast(isBn ? "টোকেন অবৈধ" : "Token invalid", e?.message || "", "warning"); }
    finally { setBusy(false); }
  };

  const download = async (type: "leads" | "visitors", format: "csv" | "json") => {
    try {
      const res = await fetch(`/api/admin/export?type=${type}&format=${format}`, { headers: { Authorization: `Bearer ${getAdminToken()}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${type}.${format}`; a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) { showToast(isBn ? "এক্সপোর্ট ব্যর্থ" : "Export failed", e?.message || "", "warning"); }
  };

  const tabs: Array<{ id: SubTab; label: string; icon: React.ReactNode }> = [
    { id: "storage", label: isBn ? "স্টোরেজ" : "Storage", icon: <HardDrive className="w-4 h-4" /> },
    { id: "monitoring", label: isBn ? "সার্ভার স্ট্যাটাস" : "Edge Status", icon: <Activity className="w-4 h-4" /> },
    { id: "analytics", label: isBn ? "ভিজিটর" : "Visitors", icon: <Users className="w-4 h-4" /> },
    { id: "privacy", label: isBn ? "রিটেনশন" : "Retention", icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${tab === t.id ? "bg-brand-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
            {t.icon}{t.label}
          </button>
        ))}
        <button onClick={() => load(tab)} className="ml-auto px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 inline-flex items-center gap-1.5">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}{isBn ? "রিফ্রেশ" : "Refresh"}
        </button>
      </div>

      {/* STORAGE */}
      {tab === "storage" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card title={isBn ? "ব্যবহৃত স্টোরেজ" : "Storage Used"} icon={<HardDrive className="w-4 h-4" />}>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{fmtBytes(storage?.self?.totalBytes || 0)}</div>
            <div className="text-xs text-slate-500 mt-1">{fmtNum(storage?.self?.totalObjects || 0)} {isBn ? "টি ফাইল" : "objects"} · {storage?.store === "r2" ? "R2" : "KV"}</div>
            {storage && (() => {
              const free = (storage.allowances?.r2FreeGb || 10) * 1024 ** 3;
              const pct = Math.min(100, ((storage.self?.totalBytes || 0) / free) * 100);
              return (
                <div className="mt-3">
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${pct > 80 ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{pct.toFixed(1)}% {isBn ? "ব্যবহৃত" : "used"} · {fmtBytes(free - (storage.self?.totalBytes || 0))} {isBn ? "অবশিষ্ট (ফ্রি টিয়ার)" : "free-tier remaining"}</div>
                </div>
              );
            })()}
            {storage?.cf?.r2 && (
              <div className="text-[11px] text-emerald-600 mt-2">{isBn ? "ক্লাউডফ্লেয়ার অনুযায়ী:" : "Per Cloudflare:"} {fmtBytes(storage.cf.r2.bytes)} · {fmtNum(storage.cf.r2.objects)} obj</div>
            )}
          </Card>

          <Card title={isBn ? "ফাইলের ধরন" : "By Type"} icon={<HardDrive className="w-4 h-4" />}>
            <BarList rows={(storage?.self?.byKind || []).map((k: any) => ({ k: k.kind, c: k.count }))} empty={isBn ? "কোনো ফাইল নেই" : "No files yet"} />
            <div className="mt-3 text-[11px] text-slate-400">
              {(storage?.self?.byKind || []).map((k: any) => `${k.kind}: ${fmtBytes(k.bytes)}`).join(" · ")}
            </div>
          </Card>

          <Card title={isBn ? "ডাটাবেস (D1)" : "Database (D1)"} icon={<Server className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {Object.entries(storage?.d1?.rowCounts || {}).map(([t, n]) => (
                <div key={t} className="flex justify-between"><span className="text-slate-500">{t}</span><span className="font-mono font-bold">{fmtNum(n as number)}</span></div>
              ))}
            </div>
            {storage?.cf?.d1 && <div className="text-[11px] text-emerald-600 mt-2">{isBn ? "সাইজ:" : "Size:"} {fmtBytes(storage.cf.d1.bytes)}</div>}
          </Card>

          <Card title={isBn ? "পরিষ্কার করুন" : "Cleanup"} icon={<Trash2 className="w-4 h-4" />}>
            <p className="text-xs text-slate-500 mb-3">
              {isBn ? "অনাথ ফাইল:" : "Orphaned files:"} <strong>{fmtNum(storage?.orphans?.count || 0)}</strong> ({fmtBytes(storage?.orphans?.bytes || 0)})
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => purge("orphans")} disabled={busy} className="py-2 rounded-xl bg-amber-500 text-white text-xs font-bold disabled:opacity-50">{isBn ? "অনাথ ফাইল মুছুন" : "Purge orphans"}</button>
              <button onClick={() => purge("all")} disabled={busy} className="py-2 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-50">{isBn ? "সব আপলোড মুছুন" : "Purge ALL uploads"}</button>
            </div>
          </Card>
        </div>
      )}

      {/* EDGE STATUS (honest replacement for RAM/OS) */}
      {tab === "monitoring" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card title={isBn ? "সার্ভার স্ট্যাটাস" : "Worker Status"} icon={<Activity className="w-4 h-4" />}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-black text-emerald-600 dark:text-emerald-400">{health ? (isBn ? "সচল" : "Healthy") : "…"}</span>
            </div>
            <div className="mt-3 text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between"><span className="text-slate-400">Runtime</span><span>{health?.runtime || "—"}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">{isBn ? "ডেটাসেন্টার" : "Datacenter"}</span><span className="font-mono">{health?.serving?.colo || "—"}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">{isBn ? "অঞ্চল" : "Region"}</span><span>{health?.serving?.region || "—"} {health?.serving?.country ? `(${health.serving.country})` : ""}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Memory limit</span><span>{health?.memoryLimitMb || 128} MB / isolate</span></div>
            </div>
          </Card>

          <Card title={isBn ? "রিকোয়েস্ট (২৪ঘ)" : "Requests (24h)"} icon={<Zap className="w-4 h-4" />}>
            {health?.workers ? (
              <div className="text-xs space-y-1">
                <div className="flex justify-between"><span className="text-slate-400">Requests</span><span className="font-mono font-bold">{fmtNum(health.workers.requests)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Errors</span><span className="font-mono font-bold text-rose-500">{fmtNum(health.workers.errors)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">CPU p50</span><span className="font-mono">{health.workers.cpuP50?.toFixed?.(2)} ms</span></div>
                <div className="flex justify-between"><span className="text-slate-400">CPU p99</span><span className="font-mono">{health.workers.cpuP99?.toFixed?.(2)} ms</span></div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                {isBn
                  ? "রিকোয়েস্ট/এরর/CPU মেট্রিক্সের জন্য রিটেনশন ট্যাবে ক্লাউডফ্লেয়ার API টোকেন যোগ করুন।"
                  : "Add a Cloudflare API token in the Retention tab to see requests, errors and CPU time."}
              </p>
            )}
          </Card>

          <Card title={isBn ? "কেন RAM/OS নেই?" : "Why no RAM/OS?"} icon={<Server className="w-4 h-4" />} className="sm:col-span-2">
            <p className="text-xs text-slate-500 leading-relaxed">
              {isBn
                ? "এই ব্যাকএন্ড Cloudflare Workers-এ চলে — কোনো নির্দিষ্ট সার্ভার, RAM স্টিক, ডিস্ক বা OS নেই। কোড ৩০০+ ডেটাসেন্টারে ছড়িয়ে থাকা আইসোলেটে চলে। তাই এখানে RAM/OS-এর বদলে বাস্তব এজ মেট্রিক্স দেখানো হয়: ডেটাসেন্টার, CPU টাইম, রিকোয়েস্ট ভলিউম এবং স্টোরেজ।"
                : "This backend runs on Cloudflare Workers — there is no fixed server, RAM stick, disk or OS. Code runs in isolates spread across 300+ datacenters. So instead of RAM/OS we show the real edge metrics: serving datacenter, CPU time, request volume and storage usage."}
            </p>
          </Card>
        </div>
      )}

      {/* VISITOR ANALYTICS */}
      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold opacity-90"><Wifi className="w-3.5 h-3.5" />{isBn ? "লাইভ এখন" : "Live now"}</div>
              <div className="text-3xl font-black mt-1">{fmtNum(analytics?.live || 0)}</div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-xs font-bold text-slate-400">{isBn ? "মোট পেজভিউ" : "Total pageviews"}</div>
              <div className="text-2xl font-black mt-1">{fmtNum(analytics?.totals?.pageviews || 0)}</div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-xs font-bold text-slate-400">{isBn ? "আজ / ৭ দিন" : "Today / 7d"}</div>
              <div className="text-2xl font-black mt-1">{fmtNum(analytics?.totals?.today || 0)} <span className="text-sm text-slate-400">/ {fmtNum(analytics?.totals?.week || 0)}</span></div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-xs font-bold text-slate-400">{isBn ? "মোট লিড" : "Total leads"}</div>
              <div className="text-2xl font-black mt-1">{fmtNum(analytics?.totals?.leads || 0)}</div>
            </div>
          </div>

          <Card title={isBn ? "শেষ ১৪ দিন" : "Last 14 days"} icon={<Activity className="w-4 h-4" />}>
            {analytics?.series?.length ? (
              <div className="flex items-end gap-1 h-24">
                {analytics.series.map((d: any, i: number) => {
                  const max = Math.max(1, ...analytics.series.map((x: any) => x.c));
                  return <div key={i} title={`${d.d}: ${d.c}`} className="flex-1 bg-brand-primary/80 rounded-t" style={{ height: `${(d.c / max) * 100}%` }} />;
                })}
              </div>
            ) : <p className="text-xs text-slate-400">{isBn ? "ডেটা নেই" : "No data yet"}</p>}
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card title={isBn ? "ডিভাইস" : "Device"} icon={<Smartphone className="w-4 h-4" />}><BarList rows={analytics?.devices || []} empty={isBn ? "ডেটা নেই" : "No data"} /></Card>
            <Card title={isBn ? "ব্রাউজার" : "Browser"} icon={<Monitor className="w-4 h-4" />}><BarList rows={analytics?.browsers || []} empty={isBn ? "ডেটা নেই" : "No data"} /></Card>
            <Card title={isBn ? "অপারেটিং সিস্টেম" : "OS"} icon={<Monitor className="w-4 h-4" />}><BarList rows={analytics?.os || []} empty={isBn ? "ডেটা নেই" : "No data"} /></Card>
            <Card title={isBn ? "দেশ" : "Country"} icon={<Globe className="w-4 h-4" />}><BarList rows={analytics?.countries || []} empty={isBn ? "ডেটা নেই" : "No data"} /></Card>
            <Card title={isBn ? "শহর" : "City"} icon={<Globe className="w-4 h-4" />}><BarList rows={analytics?.cities || []} empty={isBn ? "ডেটা নেই" : "No data"} /></Card>
            <Card title={isBn ? "আইএসপি / নেটওয়ার্ক" : "ISP / Network"} icon={<Wifi className="w-4 h-4" />}><BarList rows={analytics?.isps || []} empty={isBn ? "ডেটা নেই" : "No data"} /></Card>
            <Card title={isBn ? "শীর্ষ পেজ" : "Top pages"} icon={<Activity className="w-4 h-4" />}><BarList rows={analytics?.topPages || []} empty={isBn ? "ডেটা নেই" : "No data"} /></Card>
            <Card title={isBn ? "রেফারার" : "Referrers"} icon={<Globe className="w-4 h-4" />}><BarList rows={analytics?.referrers || []} empty={isBn ? "ডেটা নেই" : "No data"} /></Card>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => download("leads", "csv")} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold inline-flex items-center gap-1.5"><Download className="w-4 h-4" />{isBn ? "লিড CSV" : "Leads CSV"}</button>
            <button onClick={() => download("leads", "json")} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold inline-flex items-center gap-1.5"><Download className="w-4 h-4" />Leads JSON</button>
            <button onClick={() => download("visitors", "csv")} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold inline-flex items-center gap-1.5"><Download className="w-4 h-4" />{isBn ? "ভিজিটর CSV" : "Visitors CSV"}</button>
          </div>
          <p className="text-[11px] text-slate-400">{isBn ? "গোপনীয়তা: IP হ্যাশ করা হয়; বেনামী ভিজিটরের কোনো কন্টাক্ট সংরক্ষণ করা হয় না। কন্টাক্ট শুধুমাত্র জমা দেওয়া লিড থেকে আসে।" : "Privacy: IPs are hashed; anonymous visitors have no contact data stored. Contact details come only from submitted leads."}</p>
        </div>
      )}

      {/* RETENTION & PRIVACY + CLOUDFLARE API */}
      {tab === "privacy" && (
        <div className="space-y-4">
          <Card title={isBn ? "ডেটা রিটেনশন (স্বয়ংক্রিয় ডিলিট)" : "Data Retention (auto-delete)"} icon={<Shield className="w-4 h-4" />}>
            <p className="text-xs text-slate-500 mb-3">{isBn ? "নির্ধারিত দিনের পর সংবেদনশীল ডেটা প্রতিদিন স্বয়ংক্রিয়ভাবে মুছে যায় (0 = রাখুন)।" : "Sensitive data is auto-deleted daily after the set number of days (0 = keep forever). Runs on a cron trigger."}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { k: "retentionPhotoDays", l: isBn ? "ছবি/NID (দিন)" : "Photo/NID (days)" },
                { k: "retentionVisitorDays", l: isBn ? "ভিজিটর লগ (দিন)" : "Visitor logs (days)" },
                { k: "storageAlertPct", l: isBn ? "স্টোরেজ এলার্ট (%)" : "Storage alert (%)" },
                { k: "r2FreeGb", l: "R2 free (GB)" },
                { k: "d1FreeGb", l: "D1 free (GB)" },
              ].map((f) => (
                <label key={f.k} className="text-xs">
                  <span className="block text-slate-400 mb-1">{f.l}</span>
                  <input type="number" min={0} value={(ret as any)[f.k]} onChange={(e) => setRet({ ...ret, [f.k]: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-300 dark:border-slate-700 text-sm" />
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={savePrivacy} disabled={busy} className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"><Save className="w-4 h-4" />{isBn ? "সেভ" : "Save"}</button>
              <button onClick={runRetention} disabled={busy} className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"><Trash2 className="w-4 h-4" />{isBn ? "এখনই চালান" : "Run now"}</button>
            </div>
          </Card>

          <Card title={isBn ? "ক্লাউডফ্লেয়ার API (ঐচ্ছিক)" : "Cloudflare API (optional)"} icon={<CheckCircle2 className="w-4 h-4" />}>
            <p className="text-xs text-slate-500 mb-3">{isBn ? "অথরিটেটিভ R2/D1/Workers মেট্রিক্সের জন্য অ্যাকাউন্ট আইডি ও একটি রিড-অনলি টোকেন দিন। টোকেন write-only ভাবে সংরক্ষিত হয়।" : "For authoritative R2/D1/Workers metrics, add your Account ID and a read-only API token. The token is stored write-only."}</p>
            <div className="space-y-2">
              <input value={ret.cfAccountId} onChange={(e) => setRet({ ...ret, cfAccountId: e.target.value })} placeholder={isBn ? "অ্যাকাউন্ট আইডি" : "Account ID"}
                className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-300 dark:border-slate-700 text-xs font-mono" />
              <input value={cfToken} onChange={(e) => setCfToken(e.target.value)} type="password" placeholder={isBn ? "API টোকেন (ফাঁকা রাখলে অপরিবর্তিত)" : "API token (blank = unchanged)"}
                className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-300 dark:border-slate-700 text-xs font-mono" />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={savePrivacy} disabled={busy} className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"><Save className="w-4 h-4" />{isBn ? "সেভ" : "Save"}</button>
              <button onClick={testCf} disabled={busy} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"><Zap className="w-4 h-4" />{isBn ? "টোকেন টেস্ট" : "Test token"}</button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-start gap-1"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{isBn ? "টোকেন স্কোপ: Account Analytics Read, R2 Read, D1 Read।" : "Token scopes: Account Analytics Read, R2 Read, D1 Read."}</p>
          </Card>
        </div>
      )}
    </div>
  );
};
