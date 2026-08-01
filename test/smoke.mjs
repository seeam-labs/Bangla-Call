import { unstable_dev } from "wrangler";

let pass = 0, fail = 0;
const results = [];
function chk(name, cond, detail = "") {
  if (cond) { pass++; results.push(`PASS: ${name}`); }
  else { fail++; results.push(`FAIL: ${name} ${detail ? "=> " + String(detail).slice(0, 200) : ""}`); }
}

const worker = await unstable_dev("worker/index.ts", {
  local: true,
  experimental: { disableExperimentalWarning: true },
});

const j = async (res) => { try { return await res.json(); } catch { return null; } };
const bearer = (t) => ({ Authorization: `Bearer ${t}` });

try {
  // ---- PUBLIC ----
  let r = await worker.fetch("/api/settings"); let d = await j(r);
  chk("GET /api/settings 200 + brand", r.status === 200 && d?.brandNameBn, JSON.stringify(d).slice(0,80));
  chk("settings has NO secrets", d && !("geminiApiKey" in d) && !("telegramBotToken" in d));

  r = await worker.fetch("/api/widgets"); d = await j(r);
  chk("GET /api/widgets has array", Array.isArray(d?.widgets) && d.widgets.length > 0);

  r = await worker.fetch("/api/live-stats"); d = await j(r);
  chk("GET /api/live-stats", typeof d?.activeUsers === "number");

  r = await worker.fetch("/api/admin/setup-status"); d = await j(r);
  chk("setup-status needsSetup=true", d?.needsSetup === true, JSON.stringify(d));

  // ---- SETUP + AUTH ----
  r = await worker.fetch("/api/admin/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "owner", password: "supersecret123" }) });
  d = await j(r);
  chk("POST setup creates owner", r.status === 200 && d?.success && d?.token, JSON.stringify(d));
  const token = d?.token || "";

  r = await worker.fetch("/api/admin/setup-status"); d = await j(r);
  chk("setup-status needsSetup=false after", d?.needsSetup === false);

  r = await worker.fetch("/api/admin/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "x", password: "password123" }) });
  chk("second setup blocked 409", r.status === 409);

  r = await worker.fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "owner", password: "supersecret123" }) });
  d = await j(r);
  chk("login ok", r.status === 200 && d?.success && d?.token);

  r = await worker.fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "owner", password: "WRONG" }) });
  chk("login wrong pw 401", r.status === 401);

  r = await worker.fetch("/api/admin/leads");
  chk("no-token admin 401", r.status === 401);

  r = await worker.fetch("/api/admin/leads", { headers: bearer("garbage.token") });
  chk("bad-token admin 401", r.status === 401);

  // ---- ADMIN GET ----
  r = await worker.fetch("/api/admin/me", { headers: bearer(token) }); d = await j(r);
  chk("GET /me", d?.user?.username === "owner", JSON.stringify(d));

  r = await worker.fetch("/api/admin/settings", { headers: bearer(token) }); d = await j(r);
  chk("GET admin settings {settings,secretStatus}", d?.settings && d?.secretStatus);

  r = await worker.fetch("/api/admin/storage", { headers: bearer(token) }); d = await j(r);
  chk("GET storage baseline", typeof d?.self?.totalBytes === "number" && d?.d1?.rowCounts, JSON.stringify(d).slice(0,120));
  const baseBytes = d?.self?.totalBytes ?? 0;

  r = await worker.fetch("/api/admin/analytics/overview", { headers: bearer(token) }); d = await j(r);
  chk("GET analytics", typeof d?.totals?.pageviews === "number" && Array.isArray(d?.devices));

  r = await worker.fetch("/api/admin/health", { headers: bearer(token) }); d = await j(r);
  chk("GET health healthy", d?.status === "healthy" && d?.memoryLimitMb === 128);

  r = await worker.fetch("/api/admin/ai/config", { headers: bearer(token) }); d = await j(r);
  chk("GET ai/config", "keyConfigured" in (d || {}) && d?.model);

  r = await worker.fetch("/api/admin/audit", { headers: bearer(token) }); d = await j(r);
  chk("GET audit log array", Array.isArray(d?.log));

  // ---- VISITOR + ANALYTICS ----
  r = await worker.fetch("/api/visitor/log", { method: "POST", headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605 Version/16 Mobile Safari/604", "referer": "https://google.com" }, body: JSON.stringify({ page: "/" }) });
  chk("POST visitor/log", (await j(r))?.ok === true);
  r = await worker.fetch("/api/visitor/ping", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page: "/" }) });
  chk("POST visitor/ping", (await j(r))?.ok === true);
  r = await worker.fetch("/api/admin/analytics/overview", { headers: bearer(token) }); d = await j(r);
  chk("analytics counted pageview", d?.totals?.pageviews >= 1, `pv=${d?.totals?.pageviews}`);
  chk("analytics live>=1", d?.live >= 1, `live=${d?.live}`);
  chk("analytics device breakdown parsed", (d?.devices || []).some(x => x.k === "mobile"), JSON.stringify(d?.devices));

  // ---- LEAD SUBMIT + STATUS (the fixed enum bug) ----
  r = await worker.fetch("/api/leads/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Test User", phone: "01712345678", serviceType: "personal", aiRechargeAmount: 100 }) });
  d = await j(r);
  chk("POST leads/submit success", r.status === 200 && d?.success && d?.id, JSON.stringify(d));
  const leadId = d?.id;

  r = await worker.fetch("/api/leads/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Bad", phone: "12345" }) });
  chk("leads/submit bad phone 400", r.status === 400);

  r = await worker.fetch("/api/admin/leads", { headers: bearer(token) }); d = await j(r);
  chk("GET leads shows submitted", (d?.leads || []).some(l => l.id === leadId));

  r = await worker.fetch("/api/admin/leads/status", { method: "POST", headers: { "Content-Type": "application/json", ...bearer(token) }, body: JSON.stringify({ id: leadId, status: "contacted" }) });
  chk("leads/status contacted OK (was the bug)", r.status === 200);
  r = await worker.fetch("/api/admin/leads/status", { method: "POST", headers: { "Content-Type": "application/json", ...bearer(token) }, body: JSON.stringify({ id: leadId, status: "closed" }) });
  chk("leads/status closed OK", r.status === 200);
  r = await worker.fetch("/api/admin/leads/status", { method: "POST", headers: { "Content-Type": "application/json", ...bearer(token) }, body: JSON.stringify({ id: leadId, status: "bogus" }) });
  chk("leads/status invalid 400", r.status === 400);

  // ---- UPLOAD (R2 local) + STORAGE LEDGER + DELETE ----
  // 1x1 PNG
  const pngB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const bin = Uint8Array.from(atob(pngB64), c => c.charCodeAt(0));
  const form = new FormData();
  form.append("kind", "photo");
  form.append("file", new Blob([bin], { type: "image/png" }), "p.png");
  r = await worker.fetch("/api/uploads", { method: "POST", body: form });
  d = await j(r);
  chk("POST uploads returns key", r.status === 200 && d?.key, JSON.stringify(d));
  const upKey = d?.key;

  r = await worker.fetch("/api/admin/storage", { headers: bearer(token) }); d = await j(r);
  chk("storage ledger incremented", (d?.self?.totalObjects ?? 0) >= 1 && (d?.self?.totalBytes ?? 0) > baseBytes, `obj=${d?.self?.totalObjects} bytes=${d?.self?.totalBytes}`);

  r = await worker.fetch("/api/admin/uploads/delete", { method: "POST", headers: { "Content-Type": "application/json", ...bearer(token) }, body: JSON.stringify({ key: upKey }) });
  chk("delete upload OK", r.status === 200);
  r = await worker.fetch("/api/admin/storage", { headers: bearer(token) }); d = await j(r);
  chk("ledger decremented after delete", (d?.self?.totalObjects ?? 0) === 0, `obj=${d?.self?.totalObjects}`);

  // ---- WIDGETS update round-trip ----
  r = await worker.fetch("/api/admin/widgets", { headers: bearer(token) }); d = await j(r);
  const widgets = d?.widgets || [];
  chk("admin widgets list", widgets.length > 0);
  if (widgets.length) {
    const modified = widgets.map((w, i) => ({ ...w, visible: i === 0 ? false : w.visible }));
    r = await worker.fetch("/api/admin/widgets", { method: "POST", headers: { "Content-Type": "application/json", ...bearer(token) }, body: JSON.stringify({ widgets: modified }) });
    chk("POST widgets save", r.status === 200);
    r = await worker.fetch("/api/widgets"); d = await j(r);
    chk("public widgets reflect hidden", !(d?.widgets || []).some(w => w.id === modified[0].id));
  }

  // ---- CHANGE PASSWORD ----
  r = await worker.fetch("/api/admin/change-password", { method: "POST", headers: { "Content-Type": "application/json", ...bearer(token) }, body: JSON.stringify({ oldPassword: "supersecret123", newPassword: "newpass456789" }) });
  chk("change-password OK", r.status === 200, JSON.stringify(await j(r)));
  r = await worker.fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "owner", password: "newpass456789" }) });
  chk("login with new password", (await j(r))?.success === true);

  // ---- SETTINGS SAVE (incl secret write-only) ----
  r = await worker.fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json", ...bearer(token) }, body: JSON.stringify({ brandNameEn: "Renamed Co", geminiApiKey: "AIza-test-secret" }) });
  d = await j(r);
  chk("settings save returns secretStatus", d?.secretStatus?.geminiApiKey === true, JSON.stringify(d?.secretStatus));
  r = await worker.fetch("/api/settings"); d = await j(r);
  chk("public settings updated (brand) + no secret leak", d?.brandNameEn === "Renamed Co" && !("geminiApiKey" in d));

  // ---- RETENTION run ----
  r = await worker.fetch("/api/admin/retention/run", { method: "POST", headers: bearer(token) }); d = await j(r);
  chk("retention/run", r.status === 200 && d?.success);

  // ---- EXPORT ----
  r = await worker.fetch("/api/admin/export?type=leads&format=csv", { headers: bearer(token) });
  const csv = await r.text();
  chk("export leads csv", r.status === 200 && csv.includes("id"), csv.slice(0, 60));

  // ---- number availability (external will fail -> graceful null) ----
  r = await worker.fetch("/api/number/availability", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number: "09649777777" }) });
  d = await j(r);
  chk("number/availability graceful", r.status === 200 && "available" in (d || {}));

  // ---- MARKETING / TRACKING ----
  r = await worker.fetch("/api/settings"); d = await j(r);
  chk("public exposes tracking IDs, hides CAPI/GA4 secrets",
    d && "gtmContainerId" in d && "metaPixelId" in d && !("metaCapiToken" in d) && !("ga4ApiSecret" in d));
  r = await worker.fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "Contact", eventId: "e1", url: "http://x/" }) });
  chk("POST /api/track ok", r.status === 200 && (await j(r))?.ok === true);
  r = await worker.fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
  chk("POST /api/track invalid -> 400", r.status === 400);
  r = await worker.fetch("/api/leads/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Attr", phone: "01712345678", eventId: "el1", fbp: "fb.1.1.1", fbc: "fb.1.1.c", clientId: "1.2" }) });
  chk("lead submit with attribution ok", r.status === 200 && (await j(r))?.success);
  r = await worker.fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json", ...bearer(token) }, body: JSON.stringify({ metaCapiToken: "EAAG-x", ga4ApiSecret: "mp-x", metaPixelId: "123456789012345" }) });
  d = await j(r);
  chk("CAPI + GA4 secrets marked configured", d?.secretStatus?.metaCapiToken === true && d?.secretStatus?.ga4ApiSecret === true);

  // ---- 404 ----
  r = await worker.fetch("/api/does-not-exist");
  chk("unknown api 404", r.status === 404);

} catch (e) {
  results.push("EXCEPTION: " + (e?.stack || e));
  fail++;
} finally {
  await worker.stop();
}

console.log(results.join("\n"));
console.log(`\n==== RESULT: ${pass} passed, ${fail} failed ====`);
process.exit(fail > 0 ? 1 : 0);
