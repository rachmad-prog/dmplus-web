import { useEffect, useState } from "react";
import { api, formatRupiah } from "../../lib/api.js";
import { useAdminRole } from "../../lib/useAdminRole.js";

const BADGE = {
  NEW: "badge-new",
  PENDING: "badge-pending",
  PAID: "badge-paid",
  COMPLETED: "badge-completed",
  CANCELLED: "badge-cancelled",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("admin_token");
  const { isDemo } = useAdminRole();

  function load() {
    setLoading(true);
    api.getAllOrders(token).then(setOrders).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function verify(paymentId) {
    if (!confirm("Konfirmasi pembayaran ini sudah masuk?")) return;
    await api.verifyPayment(paymentId, token);
    load();
  }

  return (
    <div>
      <h2 style={{ fontSize: 24 }}>Orders</h2>
      <p style={{ marginBottom: 20 }}>Semua order masuk dari website, pembayaran penuh (100%) per order.</p>

      <div className="card">
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <>
            <div className="admin-scroll-hint">
              Geser tabel untuk lihat kolom lainnya
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Paket</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Pembayaran</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.invoiceNumber}</td>
                      <td>{o.service.name}<br /><small>{o.service.subtitle}</small></td>
                      <td>{o.customerName}<br /><small>{o.customerEmail} · {o.customerPhone}</small></td>
                      <td>{formatRupiah(o.totalAmount)}</td>
                      <td><span className={`badge ${BADGE[o.status] || ""}`}>{o.status}</span></td>
                      <td>
                        {o.payments.length === 0 && "—"}
                        {o.payments.map((p) => (
                          <div key={p.id} style={{ marginBottom: 6 }}>
                            {p.method === "MIDTRANS" ? "Midtrans" : "Transfer Bank"} · {formatRupiah(p.amount)} ·{" "}
                            <span className={`badge ${p.status === "PAID" ? "badge-paid" : "badge-pending"}`}>{p.status}</span>
                            {p.method === "BANK_TRANSFER" && p.status === "PENDING" && !isDemo && (
                              <button className="btn btn-primary" style={{ padding: "4px 10px", fontSize: 12, marginLeft: 8 }} onClick={() => verify(p.id)}>
                                Verifikasi
                              </button>
                            )}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
