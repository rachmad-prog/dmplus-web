import { Link } from "react-router-dom";
import { formatRupiah } from "../lib/api.js";
import { trackEvent } from "../lib/injectPixels.js";

const DEFAULT_WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "628111848185";

export default function PricingCard({ service, pricingMode = "PAYMENT_GATEWAY", ctwaWhatsapp, ctwaMessage }) {
  const savePct = Math.round((1 - service.priceFinal / service.priceOriginal) * 100);
  const isCtwa = pricingMode === "CTWA";

  function handleSelect() {
    trackEvent(isCtwa ? "Contact" : "AddToCart", {
      content_name: service.name,
      content_ids: [service.slug],
      value: service.priceFinal,
      currency: "IDR",
    });
  }

  const waNumber = ctwaWhatsapp || DEFAULT_WA_NUMBER;
  const waText =
    (ctwaMessage || "Halo, saya mau ambil paket {paket} seharga {harga}. Bisa dibantu lanjut prosesnya?")
      .replace("{paket}", service.name)
      .replace("{harga}", formatRupiah(service.priceFinal));
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

  return (
    <div className={`price-card ${service.isPopular ? "popular" : ""}`}>
      {service.isPopular && <span className="price-badge">★ Paling Laris</span>}
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--moss)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {service.name}
      </div>
      <div style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 14 }}>{service.subtitle}</div>

      <div className="price-old">{formatRupiah(service.priceOriginal)}</div>
      <div className="price-new">{formatRupiah(service.priceFinal)}</div>
      <span className="price-save">Hemat {savePct}%</span>

      <ul className="price-features">
        {service.features.map((f, i) => (
          <li key={i}>
            <span className="check">✓</span>
            <span>{f}</span>
          </li>
        ))}
        <li><span className="check">⚡</span><span>Selesai {service.workingDays}</span></li>
      </ul>

      {isCtwa ? (
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          onClick={handleSelect}
          className={`btn btn-block ${service.isPopular ? "btn-amber" : "btn-primary"}`}
        >
          Ambil Paket Ini
        </a>
      ) : (
        <Link to={`/checkout/${service.slug}`} onClick={handleSelect} className={`btn btn-block ${service.isPopular ? "btn-amber" : "btn-primary"}`}>
          Ambil Paket Ini
        </Link>
      )}
    </div>
  );
}
