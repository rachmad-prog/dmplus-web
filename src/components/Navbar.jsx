import { useState } from "react";

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "628111848185";
const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  "Halo, saya mau konsultasi bikin website company profile. Bisnis saya: ",
)}`;

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a href="/" className="brand">
          dmplus-web
        </a>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          <a href="/#kenapa" onClick={() => setOpen(false)}>
            Kenapa Kami
          </a>
          <a href="/#fitur" onClick={() => setOpen(false)}>
            Fitur
          </a>
          <a href="/#harga" onClick={() => setOpen(false)}>
            Harga
          </a>
          <a href="/#faq" onClick={() => setOpen(false)}>
            FAQ
          </a>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary nav-cta-mobile"
            onClick={() => setOpen(false)}>
            Konsultasi Gratis
          </a>
        </nav>

        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary nav-cta-desktop">
          Konsultasi Gratis
        </a>

        <button
          className="nav-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="Buka menu"
          aria-expanded={open}>
          {open ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}

export { waLink };
