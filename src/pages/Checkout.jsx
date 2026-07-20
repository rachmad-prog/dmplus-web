import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { api, formatRupiah } from "../lib/api.js";
import { trackEvent } from "../lib/injectPixels.js";

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "";
const MIDTRANS_SNAP_URL = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true"
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "628111848185";

export default function Checkout() {
  const { slug } = useParams();

  const [service, setService] = useState(null);
  const [step, setStep] = useState("form"); // form -> payment -> done
  const [order, setOrder] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
  const [method, setMethod] = useState(null); // null = belum pilih
  const [senderName, setSenderName] = useState("");
  const [paymentLink, setPaymentLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    businessName: "",
    notes: "",
  });

  useEffect(() => {
    api.getService(slug).then(setService).catch(() => setError("Paket tidak ditemukan"));
  }, [slug]);

  useEffect(() => {
    if (document.getElementById("midtrans-snap")) return;
    const s = document.createElement("script");
    s.id = "midtrans-snap";
    s.src = MIDTRANS_SNAP_URL;
    s.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
    document.body.appendChild(s);
  }, []);

  // Hanya simpan order ke DB, belum kirim notif apapun
  async function submitForm(e) {
    e.preventDefault();
    setError("");

    if (!form.customerName.trim()) {
      setError("Nama lengkap wajib diisi");
      return;
    }
    if (!form.customerEmail.trim() || !/^\S+@\S+\.\S+$/.test(form.customerEmail)) {
      setError("Email wajib diisi dengan format yang benar");
      return;
    }
    if (!form.customerPhone.trim()) {
      setError("No. WhatsApp wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const data = await api.createOrder({ serviceSlug: slug, ...form });
      setOrder(data.order);
      setBankInfo(data.bankInfo);
      trackEvent("Lead", { content_name: service?.name });
      setStep("payment");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Baru kirim notif + proses payment saat customer confirm metode
  async function pay() {
    if (!method) {
      setError("Pilih metode pembayaran terlebih dahulu");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (method === "BANK_TRANSFER") {
        if (!senderName) {
          setError("Nama pengirim transfer wajib diisi");
          setLoading(false);
          return;
        }
        const data = await api.createPayment({
          orderId: order.id,
          method: "BANK_TRANSFER",
          bankSenderName: senderName,
        });
        setResult(data);
        setStep("done");
      } else {
        const data = await api.createPayment({ orderId: order.id, method: "MIDTRANS" });
        trackEvent("InitiateCheckout", { value: order.totalAmount, currency: "IDR" });
        setPaymentLink(data.redirectUrl);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function waConfirmUrl() {
    if (!order) return "#";
    const text = `Halo, saya sudah transfer pembayaran sebesar ${formatRupiah(order.totalAmount)} untuk invoice ${order.invoiceNumber} atas nama ${order.customerName}. Mohon dikonfirmasi. Terima kasih!`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  if (error && !service) return <div className="container section">Paket tidak ditemukan.</div>;
  if (!service) return null;

  return (
    <div>
      <Navbar />
      <div className="container section-tight" style={{ maxWidth: 640 }}>
        <span className="eyebrow">Checkout</span>
        <h1 style={{ fontSize: 28 }}>{service.name}</h1>
        <p>{service.subtitle} · {formatRupiah(service.priceFinal)}</p>

        {/* ===== STEP 1: Form data diri ===== */}
        {step === "form" && (
          <form className="card" onSubmit={submitForm} noValidate>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
            </div>
            <div className="form-group">
              <label>No. WhatsApp</label>
              <input placeholder="08xxxxxxxxxx" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Nama Bisnis (opsional)</label>
              <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Catatan (opsional)</label>
              <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            {error && <p style={{ color: "#b23b3b" }}>{error}</p>}
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Memproses..." : "Lanjutkan ke Pembayaran"}
            </button>
          </form>
        )}

        {/* ===== STEP 2: Pilih metode pembayaran ===== */}
        {step === "payment" && order && (
          <div className="card">
            <h3 style={{ fontSize: 18 }}>Pilih Metode Pembayaran</h3>
            <p style={{ fontSize: 14 }}>
              Invoice <b>{order.invoiceNumber}</b> · Total paket {formatRupiah(order.totalAmount)}
            </p>

            {/* Ringkasan total */}
            <div style={{ background: "#f6f3ea", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total yang dibayar</span>
                <b style={{ color: "#2d6a4f" }}>{formatRupiah(order.totalAmount)}</b>
              </div>
            </div>

            {paymentLink ? (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <p style={{ marginBottom: 16 }}>
                  Klik tombol di bawah untuk menyelesaikan pembayaran via Midtrans
                  (Virtual Account / E-wallet / Kartu).
                </p>
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-block"
                  style={{ marginBottom: 10 }}
                >
                  💳 Bayar Sekarang via Midtrans
                </a>
                <a
                  className="btn btn-ghost btn-block"
                  href={`/status/${order.invoiceNumber}`}
                >
                  Sudah bayar? Cek Status Order
                </a>
              </div>
            ) : (
              <>
            {/* Opsi: Transfer Bank */}
            <div
              className={`payment-option ${method === "BANK_TRANSFER" ? "selected" : ""}`}
              onClick={() => setMethod("BANK_TRANSFER")}
            >
              <span>🏦 Transfer Bank Manual (Mandiri)</span>
              <input type="radio" checked={method === "BANK_TRANSFER"} readOnly />
            </div>

            {method === "BANK_TRANSFER" && bankInfo && (
              <div style={{ background: "#f6f3ea", borderRadius: 10, padding: "14px 16px", marginBottom: 12, fontSize: 14, lineHeight: 1.8 }}>
                <div>Transfer ke <b>{bankInfo.bankName}</b> a.n. <b>{bankInfo.accountHolder}</b></div>
                <div>No. Rekening: <b>{bankInfo.accountNumber}</b></div>
                <div>Nominal: <b style={{ color: "#2d6a4f" }}>{formatRupiah(order.totalAmount)}</b></div>
                <div className="form-group" style={{ marginTop: 10, marginBottom: 8 }}>
                  <label>Nama Pengirim Transfer</label>
                  <input
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Sesuai nama di rekening pengirim"
                  />
                </div>
              </div>
            )}

            {/* Opsi: Midtrans */}
            <div
              className={`payment-option ${method === "MIDTRANS" ? "selected" : ""}`}
              onClick={() => setMethod("MIDTRANS")}
            >
              <span>💳 Bayar Otomatis (VA / E-wallet / Kartu — Midtrans)</span>
              <input type="radio" checked={method === "MIDTRANS"} readOnly />
            </div>

            {method === "MIDTRANS" && (
              <div style={{ background: "#f6f3ea", borderRadius: 10, padding: "14px 16px", marginBottom: 12, fontSize: 14, lineHeight: 1.7 }}>
                <div>Kamu akan diarahkan ke halaman pembayaran Midtrans.</div>
                <div style={{ marginTop: 4, color: "#555" }}>
                  Tersedia: <b>Virtual Account</b> (BCA, BNI, BRI, Mandiri, dll), <b>E-wallet</b> (GoPay, OVO, ShopeePay, DANA), dan <b>Kartu Kredit/Debit</b>.
                </div>
                <div style={{ marginTop: 8, color: "#2d6a4f", fontWeight: 600 }}>
                  Total yang dibayar: {formatRupiah(order.totalAmount)}
                </div>
              </div>
            )}

            {error && <p style={{ color: "#b23b3b", marginTop: 8 }}>{error}</p>}

            <button
              className="btn btn-primary btn-block"
              onClick={pay}
              disabled={loading || !method}
              style={{ marginTop: 8, opacity: !method ? 0.5 : 1 }}
            >
              {loading
                ? "Memproses..."
                : !method
                  ? "Pilih metode pembayaran"
                  : method === "BANK_TRANSFER"
                    ? "✓ Konfirmasi Sudah Transfer"
                    : "Lanjut Bayar via Midtrans →"}
            </button>
              </>
            )}
          </div>
        )}

        {/* ===== STEP 3: Done (bank transfer) ===== */}
        {step === "done" && result && (
          <div className="card">
            <h3 style={{ fontSize: 18 }}>✅ Konfirmasi diterima!</h3>
            <p>
              Pembayaran untuk invoice <b>{order.invoiceNumber}</b> sedang menunggu verifikasi admin
              (maks 1×24 jam kerja). Detail pembayaran sudah dikirim ke email kamu.
            </p>
            <a
              href={waConfirmUrl()}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#25d366", color: "#fff", padding: "10px 20px",
                borderRadius: 8, textDecoration: "none", fontWeight: 600, marginBottom: 12,
              }}
            >
              💬 Hubungi Admin via WhatsApp
            </a>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
