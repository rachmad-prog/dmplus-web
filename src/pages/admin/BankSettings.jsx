import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

export default function AdminBankSettings() {
  const token = localStorage.getItem("admin_token");
  const [form, setForm] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBankSettings(token).then((data) => {
      setForm({
        bankName: data.bankName || "",
        accountNumber: data.accountNumber || "",
        accountHolder: data.accountHolder || "",
      });
    }).finally(() => setLoading(false));
  }, []);

  async function submit(e) {
    e.preventDefault();
    await api.updateBankSettings(form, token);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return null;

  return (
    <div>
      <h2 style={{ fontSize: 24 }}>Rekening Bank</h2>
      <p style={{ marginBottom: 20 }}>
        Rekening ini yang akan ditampilkan ke customer saat memilih metode pembayaran
        Transfer Bank Manual di halaman checkout.
      </p>

      <form className="card" style={{ maxWidth: 520 }} onSubmit={submit}>
        <div className="form-group">
          <label>Nama Bank</label>
          <input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="contoh: Bank Mandiri" />
        </div>
        <div className="form-group">
          <label>Nomor Rekening</label>
          <input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} placeholder="contoh: 1234567890" />
        </div>
        <div className="form-group">
          <label>Nama Pemilik Rekening</label>
          <input value={form.accountHolder} onChange={(e) => setForm({ ...form, accountHolder: e.target.value })} placeholder="contoh: PT Web Studio Indonesia" />
        </div>
        <button className="btn btn-primary">Simpan</button>
        {saved && <span style={{ marginLeft: 12, color: "var(--moss-dark)" }}>✓ Tersimpan</span>}
      </form>
    </div>
  );
}
