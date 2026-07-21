import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { useAdminRole } from "../../lib/useAdminRole.js";

export default function AdminPaymentMethods() {
  const token = localStorage.getItem("admin_token");
  const { isDemo } = useAdminRole();
  const [form, setForm] = useState({
    enableBankTransfer: true,
    enableMidtrans: true,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getSiteSettings().then((data) => {
      setForm({
        enableBankTransfer: data.enableBankTransfer ?? true,
        enableMidtrans: data.enableMidtrans ?? true,
      });
    }).finally(() => setLoading(false));
  }, []);

  async function toggle(field) {
    setError("");
    const next = { ...form, [field]: !form[field] };

    // Minimal satu metode harus tetap aktif
    if (!next.enableBankTransfer && !next.enableMidtrans) {
      setError("Minimal satu metode pembayaran harus tetap aktif. Aktifkan metode lain terlebih dahulu.");
      return;
    }

    setForm(next);
    setSaving(true);
    try {
      await api.updateSiteSettings(next, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
      setForm(form); // rollback kalau gagal
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  const bothActive = form.enableBankTransfer && form.enableMidtrans;

  return (
    <div>
      <h2 style={{ fontSize: 24 }}>Metode Pembayaran</h2>
      <p style={{ marginBottom: 20 }}>
        Aktifkan atau nonaktifkan metode pembayaran yang muncul di halaman checkout customer.
        {" "}Jika kedua metode aktif, customer bisa memilih salah satu. Jika hanya satu yang aktif,
        halaman checkout otomatis menampilkan metode itu saja tanpa pilihan.
      </p>

      <div className="card" style={{ maxWidth: 620 }}>
        <div className="pm-toggle-list">
          <div className={`pm-toggle-card ${form.enableBankTransfer ? "active" : "inactive"}`}>
            <span className="pm-toggle-icon">🏦</span>
            <span className="pm-toggle-body">
              <span className="pm-toggle-title-row">
                <span className="pm-toggle-title">Transfer Bank Manual</span>
                <span className={`pm-toggle-tag ${form.enableBankTransfer ? "on" : "off"}`}>
                  {form.enableBankTransfer ? "Aktif" : "Nonaktif"}
                </span>
              </span>
              <span className="pm-toggle-desc">
                Customer transfer manual ke rekening bank, lalu konfirmasi diverifikasi admin.
                Pengaturan rekening ada di menu "Rekening Bank".
              </span>
            </span>
            <button
              type="button"
              className={`pm-switch ${form.enableBankTransfer ? "on" : ""}`}
              onClick={() => toggle("enableBankTransfer")}
              disabled={saving || isDemo}
              aria-label="Aktifkan/nonaktifkan Transfer Bank Manual"
            />
          </div>

          <div className={`pm-toggle-card ${form.enableMidtrans ? "active" : "inactive"}`}>
            <span className="pm-toggle-icon">💳</span>
            <span className="pm-toggle-body">
              <span className="pm-toggle-title-row">
                <span className="pm-toggle-title">Bayar Otomatis (Midtrans)</span>
                <span className={`pm-toggle-tag ${form.enableMidtrans ? "on" : "off"}`}>
                  {form.enableMidtrans ? "Aktif" : "Nonaktif"}
                </span>
              </span>
              <span className="pm-toggle-desc">
                Pembayaran otomatis via Virtual Account, E-wallet, atau Kartu Kredit/Debit
                melalui Midtrans Snap.
              </span>
            </span>
            <button
              type="button"
              className={`pm-switch ${form.enableMidtrans ? "on" : ""}`}
              onClick={() => toggle("enableMidtrans")}
              disabled={saving || isDemo}
              aria-label="Aktifkan/nonaktifkan Midtrans"
            />
          </div>
        </div>

        {error && <div className="pm-warning" style={{ marginTop: 14 }}>{error}</div>}
        {isDemo && <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 12 }}>👁️ Mode demo — tidak dapat mengubah pengaturan.</p>}

        <div className="mode-save-row" style={{ marginTop: 16 }}>
          {saving && <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>Menyimpan…</span>}
          {saved && <span className="mode-saved-toast">✓ Tersimpan</span>}
        </div>

        {!bothActive && !error && (
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>
            Halaman checkout saat ini hanya menampilkan{" "}
            <b>{form.enableBankTransfer ? "Transfer Bank Manual" : "Bayar Otomatis (Midtrans)"}</b>.
          </p>
        )}
      </div>
    </div>
  );
}
