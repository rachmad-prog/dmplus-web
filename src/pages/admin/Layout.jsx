import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
        <div className="admin-sidebar-top">
          <div className="admin-brand">web.studio</div>
          <button
            className="admin-menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Buka menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        <nav className={`admin-nav ${menuOpen ? "open" : ""}`}>
          <NavLink to="/admin" end onClick={() => setMenuOpen(false)}>📦 Orders</NavLink>
          <NavLink to="/admin/bank" onClick={() => setMenuOpen(false)}>🏦 Rekening Bank</NavLink>
          <NavLink to="/admin/pixels" onClick={() => setMenuOpen(false)}>🎯 Pixel Ads</NavLink>
          <div className="admin-email">{admin?.email}</div>
          <button className="btn btn-ghost btn-block admin-logout" onClick={logout}>
            Keluar
          </button>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
