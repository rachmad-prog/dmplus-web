const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "628111848185";
const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  "Halo, saya mau konsultasi bikin website company profile. Bisnis saya: "
)}`;

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a href="/" className="brand">web.studio</a>
        <nav className="nav-links">
          <a href="/#kenapa">Kenapa Kami</a>
          <a href="/#fitur">Fitur</a>
          <a href="/#harga">Harga</a>
          <a href="/#faq">FAQ</a>
        </nav>
        <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-primary">
          Konsultasi Gratis
        </a>
      </div>
    </header>
  );
}

export { waLink };
