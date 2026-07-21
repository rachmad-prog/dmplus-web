import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { useAdminRole } from "../../lib/useAdminRole.js";

const ROLE_LABEL = { ADMIN: "Admin", DEMO: "Demo (View Only)" };
const ROLE_BADGE = { ADMIN: "badge-paid", DEMO: "badge-pending" };

const EMPTY_FORM = { name: "", email: "", password: "", role: "DEMO" };
const EMPTY_PW = { currentPassword: "", newPassword: "", confirmPassword: "" };

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--paper-raised)", borderRadius: "var(--radius)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)", width: "100%", maxWidth: 460,
          padding: 28, position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--ink-soft)", lineHeight: 1 }}
            aria-label="Tutup"
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const token = localStorage.getItem("admin_token");
  const { isDemo, role: myRole } = useAdminRole();

  // Ambil id dari token (decode payload)
  const myId = (() => {
    try { return JSON.parse(atob(token.split(".")[1])).id; } catch { return null; }
  })();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [modal, setModal] = useState(null); // null | "add" | "edit" | "password" | "mypassword"
  const [target, setTarget] = useState(null); // user yang sedang diedit

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [pw, setPw] = useState(EMPTY_PW);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  function load() {
    setLoading(true);
    setError("");
    api.getAdminUsers(token)
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError(""); setFormSuccess("");
    setModal("add");
  }

  function openEdit(user) {
    setTarget(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setFormError(""); setFormSuccess("");
    setModal("edit");
  }

  function openResetPw(user) {
    setTarget(user);
    setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setFormError(""); setFormSuccess("");
    setModal("password");
  }

  function openMyPw() {
    setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setFormError(""); setFormSuccess("");
    setModal("mypassword");
  }

  function closeModal() {
    setModal(null);
    setTarget(null);
    setFormError(""); setFormSuccess("");
  }

  // ── Tambah user ──
  async function handleAdd(e) {
    e.preventDefault();
    setFormError(""); setSaving(true);
    try {
      await api.createAdminUser({ ...form }, token);
      closeModal(); load();
    } catch (err) { setFormError(err.message); }
    finally { setSaving(false); }
  }

  // ── Edit user (nama, email, role, password opsional) ──
  async function handleEdit(e) {
    e.preventDefault();
    setFormError(""); setSaving(true);
    try {
      const body = { name: form.name, email: form.email, role: form.role };
      if (form.password) body.password = form.password;
      await api.updateAdminUser(target.id, body, token);
      closeModal(); load();
    } catch (err) { setFormError(err.message); }
    finally { setSaving(false); }
  }

  // ── Reset password user lain (oleh admin) ──
  async function handleResetPw(e) {
    e.preventDefault();
    setFormError(""); setFormSuccess("");
    if (pw.newPassword !== pw.confirmPassword) {
      setFormError("Konfirmasi password tidak cocok"); return;
    }
    setSaving(true);
    try {
      await api.updateAdminUser(target.id, { password: pw.newPassword }, token);
      setFormSuccess("Password berhasil diubah.");
      setPw(EMPTY_PW);
    } catch (err) { setFormError(err.message); }
    finally { setSaving(false); }
  }

  // ── Ganti password sendiri ──
  async function handleMyPw(e) {
    e.preventDefault();
    setFormError(""); setFormSuccess("");
    if (pw.newPassword !== pw.confirmPassword) {
      setFormError("Konfirmasi password tidak cocok"); return;
    }
    setSaving(true);
    try {
      await api.changePassword(
        { currentPassword: pw.currentPassword, newPassword: pw.newPassword },
        token
      );
      setFormSuccess("Password berhasil diubah!");
      setPw(EMPTY_PW);
    } catch (err) { setFormError(err.message); }
    finally { setSaving(false); }
  }

  // ── Hapus user ──
  async function handleDelete(user) {
    if (!confirm(`Hapus user "${user.name}" (${user.email})?\nTindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api.deleteAdminUser(user.id, token);
      load();
    } catch (err) { alert(err.message); }
  }

  // ─── Render helpers ──────────────────────────────────────────────────────────

  function FieldGroup({ label, children }) {
    return (
      <div className="form-group">
        <label>{label}</label>
        {children}
      </div>
    );
  }

  function FormError({ msg }) {
    return msg ? <p style={{ color: "#b3261e", marginBottom: 12, fontSize: 13.5 }}>{msg}</p> : null;
  }
  function FormSuccess({ msg }) {
    return msg ? <p style={{ color: "var(--moss-dark)", marginBottom: 12, fontSize: 13.5 }}>✓ {msg}</p> : null;
  }

  // ─── Main render ─────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
        <div>
          <h2 style={{ fontSize: 24, margin: 0 }}>Manajemen User</h2>
          <p style={{ marginTop: 6, marginBottom: 0 }}>Kelola akun yang bisa login ke dashboard admin.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" style={{ fontSize: 13.5 }} onClick={openMyPw}>
            🔑 Ganti Password Saya
          </button>
          {!isDemo && (
            <button className="btn btn-primary" onClick={openAdd}>
              + Tambah User
            </button>
          )}
        </div>
      </div>

      {isDemo && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 6, padding: "8px 14px", fontSize: 13, color: "#856404", marginBottom: 16 }}>
          👁️ Mode demo — kamu hanya bisa melihat daftar user dan mengganti password sendiri.
        </div>
      )}

      {error && <p style={{ color: "#b3261e" }}>{error}</p>}

      <div className="card" style={{ marginTop: 20 }}>
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={u.id === myId ? { background: "rgba(31,77,58,0.04)" } : {}}>
                    <td>
                      {u.name}
                      {u.id === myId && (
                        <span style={{ marginLeft: 6, fontSize: 11, color: "var(--ink-soft)", fontStyle: "italic" }}>(kamu)</span>
                      )}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${ROLE_BADGE[u.role] || "badge-new"}`}>
                        {ROLE_LABEL[u.role] || u.role}
                      </span>
                    </td>
                    <td style={{ color: "var(--ink-soft)", fontSize: 13 }}>
                      {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {/* Ganti password sendiri */}
                        {u.id === myId && (
                          <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={openMyPw}>
                            🔑 Password
                          </button>
                        )}
                        {/* Edit & hapus user lain — hanya ADMIN */}
                        {u.id !== myId && !isDemo && (
                          <>
                            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => openEdit(u)}>
                              Edit
                            </button>
                            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => openResetPw(u)}>
                              Reset PW
                            </button>
                            <button
                              className="btn btn-ghost"
                              style={{ padding: "4px 10px", fontSize: 12, color: "#b3261e" }}
                              onClick={() => handleDelete(u)}
                            >
                              Hapus
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5}>Belum ada user.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal: Tambah User ── */}
      {modal === "add" && (
        <Modal title="Tambah User Baru" onClose={closeModal}>
          <form onSubmit={handleAdd}>
            <FieldGroup label="Nama">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="contoh: Budi Santoso" />
            </FieldGroup>
            <FieldGroup label="Email">
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@domain.com" />
            </FieldGroup>
            <FieldGroup label="Password (min. 8 karakter)">
              <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Buat password kuat" />
            </FieldGroup>
            <FieldGroup label="Role">
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="DEMO">Demo — hanya bisa melihat</option>
                <option value="ADMIN">Admin — akses penuh</option>
              </select>
            </FieldGroup>
            <FormError msg={formError} />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button className="btn btn-primary" disabled={saving}>{saving ? "Menyimpan…" : "Simpan"}</button>
              <button type="button" className="btn btn-ghost" onClick={closeModal}>Batal</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Edit User ── */}
      {modal === "edit" && target && (
        <Modal title={`Edit User — ${target.name}`} onClose={closeModal}>
          <form onSubmit={handleEdit}>
            <FieldGroup label="Nama">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Email">
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Role">
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="DEMO">Demo — hanya bisa melihat</option>
                <option value="ADMIN">Admin — akses penuh</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Password baru (kosongkan jika tidak ingin mengubah)">
              <input type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Isi untuk mengganti password" />
            </FieldGroup>
            <FormError msg={formError} />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button className="btn btn-primary" disabled={saving}>{saving ? "Menyimpan…" : "Simpan"}</button>
              <button type="button" className="btn btn-ghost" onClick={closeModal}>Batal</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Reset Password User Lain (by admin) ── */}
      {modal === "password" && target && (
        <Modal title={`Reset Password — ${target.name}`} onClose={closeModal}>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 16 }}>
            Kamu akan mengganti password untuk akun <strong>{target.email}</strong>. User harus login ulang setelah ini.
          </p>
          <form onSubmit={handleResetPw}>
            <FieldGroup label="Password baru (min. 8 karakter)">
              <input type="password" required minLength={8} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} placeholder="Password baru" />
            </FieldGroup>
            <FieldGroup label="Konfirmasi password baru">
              <input type="password" required minLength={8} value={pw.confirmPassword} onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })} placeholder="Ulangi password baru" />
            </FieldGroup>
            <FormError msg={formError} />
            <FormSuccess msg={formSuccess} />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button className="btn btn-primary" disabled={saving}>{saving ? "Menyimpan…" : "Ganti Password"}</button>
              <button type="button" className="btn btn-ghost" onClick={closeModal}>Tutup</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Ganti Password Sendiri ── */}
      {modal === "mypassword" && (
        <Modal title="Ganti Password Saya" onClose={closeModal}>
          <form onSubmit={handleMyPw}>
            <FieldGroup label="Password saat ini">
              <input type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} placeholder="Password yang sedang dipakai" />
            </FieldGroup>
            <FieldGroup label="Password baru (min. 8 karakter)">
              <input type="password" required minLength={8} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} placeholder="Password baru" />
            </FieldGroup>
            <FieldGroup label="Konfirmasi password baru">
              <input type="password" required minLength={8} value={pw.confirmPassword} onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })} placeholder="Ulangi password baru" />
            </FieldGroup>
            <FormError msg={formError} />
            <FormSuccess msg={formSuccess} />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button className="btn btn-primary" disabled={saving}>{saving ? "Menyimpan…" : "Ganti Password"}</button>
              <button type="button" className="btn btn-ghost" onClick={closeModal}>Tutup</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
