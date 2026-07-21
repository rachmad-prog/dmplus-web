import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { useAdminRole } from "../../lib/useAdminRole.js";

const OPTIONS = [
  {
    value: "PAYMENT_GATEWAY",
    icon: "💳",
    title: "Payment Gateway",
    desc: "Tombol paket mengarah ke halaman checkout — bayar via Midtrans (VA/e-wallet/kartu) atau transfer bank manual.",
    previewDest: "Halaman Checkout",
  },
  {
    value: "CTWA",
    icon: "💬",
    title: "CTWA (Click to WhatsApp)",
    desc: "Tombol paket langsung membuka chat WhatsApp dengan pesan yang sudah terisi nama paket & harga. Cocok untuk iklan Click-to-WhatsApp.",
    previewDest: "Chat WhatsApp",
  },
];

export default function AdminPricingSettings() {
  const token = localStorage.getItem("admin_token");
  const { isDemo } = useAdminRole();
  const [form, setForm] = useState({
    pricingMode: "PAYMENT_GATEWAY",
    ctwaWhatsapp: "",
    ctwaMessage: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSiteSettings().then((data) => {
      setForm({
        pricingMode: data.pricingMode || "PAYMENT_GATEWAY",
        ctwaWhatsapp: data.ctwaWhatsapp || "",
        ctwaMessage: data.ctwaMessage || "",
      });
    }).finally(() => setLoading(false));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSiteSettings(form, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  const active = OPTIONS.find((o) => o.value === form.pricingMode) || OPTIONS[0];

  return (
    <div>
      <h2 style={{ fontSize: 24 }}>Mode Pricing Card</h2>
      <p style={{ marginBottom: 20 }}>
        Pilih tombol "Ambil Paket Ini" di halaman depan diarahkan ke mana. Perubahan berlaku
        langsung untuk semua paket di halaman depan.
      </p>

      <form className="card" style={{ maxWidth: 620 }} onSubmit={submit}>
        <div className="mode-preview">
          <span className="mode-preview-label">Preview</span>
          <span className="mode-preview-btn">Ambil Paket Ini</span>
          <span className="mode-preview-arrow">→</span>
          <span className="mode-preview-dest">{active.previewDest}</span>
        </div>

        <div className="form-group">
          <label>Mode Pricing Card</label>
          <div className="mode-options">
            {OPTIONS.map((opt) => {
              const isSelected = form.pricingMode === opt.value;
              return (
                <div
                  key={opt.value}
                  className={`mode-option ${isSelected ? "selected" : ""}`}
                  onClick={() => setForm({ ...form, pricingMode: opt.value })}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setForm({ ...form, pricingMode: opt.value });
                    }
                  }}
                >
                  <span className="mode-option-icon">{opt.icon}</span>
                  <span className="mode-option-body">
                    <span className="mode-option-title-row">
                      <span className="mode-option-title">{opt.title}</span>
                      {isSelected && <span className="mode-option-tag">Aktif</span>}
                    </span>
                    <span className="mode-option-desc">{opt.desc}</span>
                  </span>
                  <span className="mode-option-radio" />
                </div>
              );
            })}
          </div>
        </div>

        {form.pricingMode === "CTWA" && (
          <div className="mode-ctwa-fields">
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Nomor WhatsApp CTWA (opsional)</label>
              <input
                value={form.ctwaWhatsapp}
                onChange={(e) => setForm({ ...form, ctwaWhatsapp: e.target.value })}
                placeholder="contoh: 628111848185 (kosongkan = pakai nomor WA default)"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Template Pesan WhatsApp (opsional)</label>
              <textarea
                rows={3}
                value={form.ctwaMessage}
                onChange={(e) => setForm({ ...form, ctwaMessage: e.target.value })}
                placeholder="Halo, saya mau ambil paket {paket} seharga {harga}. Bisa dibantu lanjut prosesnya?"
              />
              <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                Gunakan <code>{"{paket}"}</code> dan <code>{"{harga}"}</code> untuk isi otomatis nama paket & harga.
              </span>
            </div>
          </div>
        )}

        <div className="mode-save-row">
          {isDemo ? (
            <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>👁️ Mode demo — tidak dapat menyimpan perubahan.</p>
          ) : (
            <>
              <button className="btn btn-primary" disabled={saving}>
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
              {saved && <span className="mode-saved-toast">✓ Tersimpan</span>}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
