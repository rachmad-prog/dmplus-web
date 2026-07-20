import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

export default function AdminPixels() {
  const token = localStorage.getItem("admin_token");
  const [form, setForm] = useState({
    metaPixelId: "",
    googleAdsId: "",
    googleAdsLabel: "",
    tiktokPixelId: "",
    gtmContainerId: "",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPixels().then((data) => {
      setForm({
        metaPixelId: data.metaPixelId || "",
        googleAdsId: data.googleAdsId || "",
        googleAdsLabel: data.googleAdsLabel || "",
        tiktokPixelId: data.tiktokPixelId || "",
        gtmContainerId: data.gtmContainerId || "",
      });
    }).finally(() => setLoading(false));
  }, []);

  async function submit(e) {
    e.preventDefault();
    await api.updatePixels(form, token);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return null;

  return (
    <div>
      <h2 style={{ fontSize: 24 }}>Pixel Ads</h2>
      <p style={{ marginBottom: 20 }}>
        ID pixel di bawah akan otomatis disuntikkan ke seluruh halaman website untuk keperluan
        tracking & retargeting Meta Ads, Google Ads, dan TikTok Ads.
      </p>
      <p style={{ marginTop: -10, marginBottom: 20, fontSize: 13.5, color: "var(--ink-soft)" }}>
        ℹ️ Event <b>PageView</b> otomatis terkirim di setiap halaman begitu ID di bawah diisi —
        tidak perlu setting tambahan. Event <b>AddToCart</b> otomatis terkirim saat pengunjung
        klik "Ambil Paket Ini", dan event <b>Purchase</b> otomatis terkirim saat pengunjung
        klik tombol bayar di halaman checkout.
      </p>

      <form className="card" style={{ maxWidth: 520 }} onSubmit={submit}>
        <div className="form-group">
          <label>Meta (Facebook) Pixel ID</label>
          <input value={form.metaPixelId} onChange={(e) => setForm({ ...form, metaPixelId: e.target.value })} placeholder="contoh: 1234567890123456" />
        </div>
        <div className="form-group">
          <label>Google Ads / GA4 Measurement ID</label>
          <input value={form.googleAdsId} onChange={(e) => setForm({ ...form, googleAdsId: e.target.value })} placeholder="contoh: AW-123456789 atau G-XXXXXXX" />
        </div>
        <div className="form-group">
          <label>Google Ads Conversion Label (opsional)</label>
          <input value={form.googleAdsLabel} onChange={(e) => setForm({ ...form, googleAdsLabel: e.target.value })} placeholder="contoh: AbCdEfGhIj" />
        </div>
        <div className="form-group">
          <label>TikTok Pixel ID</label>
          <input value={form.tiktokPixelId} onChange={(e) => setForm({ ...form, tiktokPixelId: e.target.value })} placeholder="contoh: CXXXXXXXXXXXXXXXXXXX" />
        </div>
        <div className="form-group">
          <label>Google Tag Manager Container ID (opsional)</label>
          <input value={form.gtmContainerId} onChange={(e) => setForm({ ...form, gtmContainerId: e.target.value })} placeholder="contoh: GTM-XXXXXXX" />
        </div>
        <button className="btn btn-primary">Simpan</button>
        {saved && <span style={{ marginLeft: 12, color: "var(--moss-dark)" }}>✓ Tersimpan</span>}
      </form>
    </div>
  );
}
