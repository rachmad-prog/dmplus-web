import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

export default function AdminPricingSettings() {
  const token = localStorage.getItem("admin_token");
  const [form, setForm] = useState({
    pricingMode: "PAYMENT_GATEWAY",
    ctwaWhatsapp: "",
    ctwaMessage: "",
  });
  const [saved, setSaved] = useState(false);
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
    await api.updateSiteSettings(form, token);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return null;

  return (
    <div>
      <h2 style={{ fontSize: 24 }}>Mode Pricing Card</h2>
      <p style={{ marginBottom: 20 }}>
        Pilih tombol "Ambil Paket Ini" di halaman depan diarahkan ke mana. Perubahan berlaku
        langsung untuk semua paket di halaman depan.
      </p>

      <form className="card" style={{ maxWidth: 560 }} onSubmit={submit}>
        <div className="form-group">
          <label>Mode Pricing Card</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
            <label style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer", fontWeight: 400 }}>
              <input
                type="radio"
                name="pricingMode"
                checked={form.pricingMode === "PAYMENT_GATEWAY"}
                onChange={() => setForm({ ...form, pricingMode: "PAYMENT_GATEWAY" })}
                style={{ marginTop: 3 }}
              />
              <span>
                <b>Payment Gateway</b>
                <br />
                <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                  Tombol paket mengarah ke halaman checkout — bayar via Midtrans (VA/e-wallet/kartu)
                  atau transfer bank manual.
                </span>
              </span>
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer", fontWeight: 400 }}>
              <input
                type="radio"
                name="pricingMode"
                checked={form.pricingMode === "CTWA"}
                onChange={() => setForm({ ...form, pricingMode: "CTWA" })}
                style={{ marginTop: 3 }}
              />
              <span>
                <b>CTWA (Click to WhatsApp)</b>
                <br />
                <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                  Tombol paket langsung membuka chat WhatsApp dengan pesan yang sudah terisi nama
                  paket & harga. Cocok untuk iklan Click-to-WhatsApp.
                </span>
              </span>
            </label>
          </div>
        </div>

        {form.pricingMode === "CTWA" && (
          <>
            <div className="form-group">
              <label>Nomor WhatsApp CTWA (opsional)</label>
              <input
                value={form.ctwaWhatsapp}
                onChange={(e) => setForm({ ...form, ctwaWhatsapp: e.target.value })}
                placeholder="contoh: 628111848185 (kosongkan = pakai nomor WA default)"
              />
            </div>
            <div className="form-group">
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
          </>
        )}

        <button className="btn btn-primary">Simpan</button>
        {saved && <span style={{ marginLeft: 12, color: "var(--moss-dark)" }}>✓ Tersimpan</span>}
      </form>
    </div>
  );
}
