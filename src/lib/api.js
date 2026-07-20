const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Terjadi kesalahan, coba lagi");
  }
  return data;
}

export const api = {
  getServices: () => request("/services"),
  getService: (slug) => request(`/services/${slug}`),
  getAdminServices: (token) => request("/services/admin/all", { token }),
  createService: (body, token) => request("/services", { method: "POST", body, token }),
  updateService: (id, body, token) => request(`/services/${id}`, { method: "PUT", body, token }),
  deleteService: (id, token) => request(`/services/${id}`, { method: "DELETE", token }),

  createOrder: (body) => request("/orders", { method: "POST", body }),
  getOrder: (invoiceNumber) => request(`/orders/${invoiceNumber}`),
  getAllOrders: (token) => request("/orders", { token }),

  createPayment: (body) => request("/payments", { method: "POST", body }),
  verifyPayment: (paymentId, token) => request(`/payments/${paymentId}/verify`, { method: "POST", token }),

  adminLogin: (body) => request("/admin/login", { method: "POST", body }),
  adminMe: (token) => request("/admin/me", { token }),

  getPixels: () => request("/pixels"),
  updatePixels: (body, token) => request("/pixels", { method: "PUT", body, token }),

  getBankSettings: (token) => request("/bank-settings", { token }),
  updateBankSettings: (body, token) => request("/bank-settings", { method: "PUT", body, token }),

  getSiteSettings: () => request("/site-settings"),
  updateSiteSettings: (body, token) => request("/site-settings", { method: "PUT", body, token }),
};

export function formatRupiah(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}
