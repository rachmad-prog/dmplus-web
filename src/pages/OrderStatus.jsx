import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { api, formatRupiah } from "../lib/api.js";

const STATUS_LABEL = {
  NEW: "Order baru",
  PENDING: "Menunggu konfirmasi pembayaran",
  PAID: "Lunas — pengerjaan dimulai",
  COMPLETED: "Selesai — website sudah live",
  CANCELLED: "Dibatalkan",
};

const PAYMENT_METHOD_LABEL = {
  MIDTRANS: "Midtrans",
  BANK_TRANSFER: "Transfer Bank",
};

export default function OrderStatus() {
  const { invoiceNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getOrder(invoiceNumber).then(setOrder).catch((e) => setError(e.message));
  }, [invoiceNumber]);

  if (error) return <div className="container section">{error}</div>;
  if (!order) return null;

  return (
    <div>
      <Navbar />
      <div className="container section-tight" style={{ maxWidth: 640 }}>
        <span className="eyebrow">Status Order</span>
        <h1 style={{ fontSize: 26 }}>{order.invoiceNumber}</h1>
        <div className="card">
          <p><b>Paket:</b> {order.service.name} ({order.service.subtitle})</p>
          <p><b>Status:</b> {STATUS_LABEL[order.status] || order.status}</p>
          <p><b>Total:</b> {formatRupiah(order.totalAmount)}</p>

          <h4 style={{ marginTop: 20 }}>Riwayat Pembayaran</h4>
          {order.payments.length === 0 && <p>Belum ada pembayaran.</p>}
          {order.payments.map((p) => (
            <div key={p.id} className="hero-card-row">
              <span>{PAYMENT_METHOD_LABEL[p.method] || p.method}</span>
              <b>{formatRupiah(p.amount)} — {p.status}</b>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
