import { Link } from "react-router-dom";
import { formatRupiah } from "../lib/api.js";
import { trackEvent } from "../lib/injectPixels.js";

export default function PricingCard({ service }) {
  const savePct = Math.round((1 - service.priceFinal / service.priceOriginal) * 100);

  function handleSelect() {
    trackEvent("AddToCart", {
      content_name: service.name,
      content_ids: [service.slug],
      value: service.priceFinal,
      currency: "IDR",
    });
  }

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

      <Link to={`/checkout/${service.slug}`} onClick={handleSelect} className={`btn btn-block ${service.isPopular ? "btn-amber" : "btn-primary"}`}>
        Ambil Paket Ini
      </Link>
    </div>
  );
}
