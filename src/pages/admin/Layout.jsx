import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    api.adminMe(token)
      .then((data) => setAdmin(data.admin))
      .catch(() => { localStorage.removeItem("admin_token"); navigate("/admin/login"); })
      .finally(() => setChecked(true));
  }, [navigate]);

  function logout() {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  }

  if (!checked) return null;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 24 }}>web.studio</div>
        <NavLink to="/admin" end>📦 Orders</NavLink>
        <NavLink to="/admin/pixels">🎯 Pixel Ads</NavLink>
        <div style={{ marginTop: 24, fontSize: 13, opacity: 0.7 }}>{admin?.email}</div>
        <button className="btn btn-ghost btn-block" style={{ marginTop: 12, color: "#fff", borderColor: "rgba(255,255,255,0.3)" }} onClick={logout}>
          Keluar
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
