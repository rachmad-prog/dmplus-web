/**
 * useAdminRole — kembalikan role user yang sedang login.
 * - "ADMIN"  → akses penuh
 * - "DEMO"   → hanya bisa melihat, tidak bisa edit/hapus
 */
export function useAdminRole() {
  const role = localStorage.getItem("admin_role") || "ADMIN";
  return {
    role,
    isDemo: role === "DEMO",
    isAdmin: role === "ADMIN",
  };
}
