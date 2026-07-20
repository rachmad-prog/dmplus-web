import { Link } from "react-router-dom";
import Navbar, { waLink } from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

export default function NotFound() {
  return (
    <div>
      <Navbar />
      <section className="section" style={{ textAlign: "center" }}>
        <div className="container">
          <span className="eyebrow">404</span>
          <h1 style={{ fontSize: 40, marginTop: 8 }}>Halaman tidak ditemukan</h1>
          <p style={{ maxWidth: 480, margin: "0 auto 28px" }}>
            Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan. Coba kembali ke
            beranda atau hubungi kami langsung via WhatsApp.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <Link to="/" className="btn btn-primary">Kembali ke Beranda</Link>
            <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-ghost">
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
