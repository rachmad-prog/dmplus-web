import { useEffect, useState } from "react";
import { api, formatRupiah } from "../../lib/api.js";
import { useAdminRole } from "../../lib/useAdminRole.js";

const EMPTY_FORM = {
  slug: "",
  name: "",
  subtitle: "",
  domainType: "",
  pageCount: 1,
  priceOriginal: "",
  priceFinal: "",
  workingDays: "",
  features: "",
  isPopular: false,
  isActive: true,
};

function serviceToForm(s) {
  return {
    slug: s.slug || "",
    name: s.name || "",
    subtitle: s.subtitle || "",
    domainType: s.domainType || "",
    pageCount: s.pageCount ?? 1,
    priceOriginal: s.priceOriginal ?? "",
    priceFinal: s.priceFinal ?? "",
    workingDays: s.workingDays || "",
    features: (s.features || []).join("\n"),
    isPopular: !!s.isPopular,
    isActive: !!s.isActive,
  };
}

export default function AdminServices() {
  const token = localStorage.getItem("admin_token");
  const { isDemo } = useAdminRole();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // null = tidak ada form, "new" = form tambah
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api.getAdminServices(token).then(setServices).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setError("");
    setEditingId("new");
  }

  function openEdit(service) {
    setForm(serviceToForm(service));
    setError("");
    setEditingId(service.id);
  }

  function closeForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        slug: form.slug || undefined,
        name: form.name,
        subtitle: form.subtitle,
        domainType: form.domainType,
        pageCount: Number(form.pageCount),
        priceOriginal: Number(form.priceOriginal),
        priceFinal: Number(form.priceFinal),
        workingDays: form.workingDays,
        features: form.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        isPopular: form.isPopular,
        isActive: form.isActive,
      };

      if (editingId === "new") {
        await api.createService(body, token);
      } else {
        await api.updateService(editingId, body, token);
      }
      closeForm();
      load();
    } catch (err) {
      setError(err.message || "Gagal menyimpan paket");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(service) {
    await api.updateService(service.id, { isActive: !service.isActive }, token);
    load();
  }

  async function remove(service) {
    if (!confirm(`Hapus paket "${service.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api.deleteService(service.id, token);
      load();
    } catch (err) {
      alert(err.message || "Gagal menghapus paket");
    }
  }

  const isFormOpen = editingId !== null;

  return (
    <div>
      <h2 style={{ fontSize: 24 }}>Setting Layanan</h2>
      <p style={{ marginBottom: 20 }}>
        Kelola paket layanan yang tampil di halaman depan — nama, harga, fitur, dan status aktif.
      </p>

      {!isFormOpen && !isDemo && (
        <button className="btn btn-primary" style={{ marginBottom: 20 }} onClick={openNew}>
          + Tambah Paket
        </button>
      )}

      {isFormOpen && (
        <form className="card" style={{ maxWidth: 640, marginBottom: 24 }} onSubmit={submit}>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>
            {editingId === "new" ? "Tambah Paket Baru" : "Edit Paket"}
          </h3>

          <div className="form-group">
            <label>Nama Paket</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="contoh: Landing Page"
              required
            />
          </div>

          <div className="form-group">
            <label>Subjudul</label>
            <input
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="contoh: 1 Halaman · domain .com"
              required
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Tipe Domain</label>
              <input
                value={form.domainType}
                onChange={(e) => setForm({ ...form, domainType: e.target.value })}
                placeholder=".com / .co.id"
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Jumlah Halaman</label>
              <input
                type="number"
                min="1"
                value={form.pageCount}
                onChange={(e) => setForm({ ...form, pageCount: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Harga Coret (Rp)</label>
              <input
                type="number"
                min="0"
                value={form.priceOriginal}
                onChange={(e) => setForm({ ...form, priceOriginal: e.target.value })}
                placeholder="contoh: 5325750"
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Harga Final (Rp)</label>
              <input
                type="number"
                min="0"
                value={form.priceFinal}
                onChange={(e) => setForm({ ...form, priceFinal: e.target.value })}
                placeholder="contoh: 1565900"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Estimasi Pengerjaan</label>
            <input
              value={form.workingDays}
              onChange={(e) => setForm({ ...form, workingDays: e.target.value })}
              placeholder="contoh: 7 hari kerja"
              required
            />
          </div>

          <div className="form-group">
            <label>Slug (opsional, kosongkan untuk otomatis)</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="contoh: landing-page"
            />
          </div>

          <div className="form-group">
            <label>Fitur (satu baris = satu fitur)</label>
            <textarea
              rows={6}
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder={"Domain .com + hosting 1 tahun\n1 email bisnis\nWebsite 1 halaman"}
            />
          </div>

          <div className="form-group" style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 0 }}>
              <input
                type="checkbox"
                checked={form.isPopular}
                onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
              />
              Tandai "Paling Populer"
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 0 }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Aktif (tampil di halaman depan)
            </label>
          </div>

          {error && <p style={{ color: "#b3261e", marginBottom: 12 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={closeForm}>
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="card">
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Paket</th>
                  <th>Domain</th>
                  <th>Halaman</th>
                  <th>Harga</th>
                  <th>Estimasi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.name}
                      {s.isPopular && <span className="badge badge-paid" style={{ marginLeft: 6 }}>Populer</span>}
                      <br />
                      <small>{s.subtitle}</small>
                    </td>
                    <td>{s.domainType}</td>
                    <td>{s.pageCount}</td>
                    <td>
                      {formatRupiah(s.priceFinal)}
                      <br />
                      <small style={{ textDecoration: "line-through" }}>{formatRupiah(s.priceOriginal)}</small>
                    </td>
                    <td>{s.workingDays}</td>
                    <td>
                      <span className={`badge ${s.isActive ? "badge-paid" : "badge-cancelled"}`}>
                        {s.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      {isDemo ? (
                        <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>—</span>
                      ) : (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => openEdit(s)}>
                            Edit
                          </button>
                          <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => toggleActive(s)}>
                            {s.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: "4px 10px", fontSize: 12, color: "#b3261e" }}
                            onClick={() => remove(s)}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan={7}>Belum ada paket layanan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
