import { waLink } from "./Navbar.jsx";

export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand" style={{ color: "#fff", marginBottom: 10 }}>
              dmplus-web
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: 320 }}>
              Website yang dibangun untuk jualan. Jasa pembuatan website company
              profile conversion-first untuk UMKM & bisnis jasa.
            </p>
          </div>
          <div>
            <h4>Navigasi</h4>
            <ul style={{ marginTop: 12 }}>
              <li style={{ marginBottom: 8 }}>
                <a href="/#kenapa">Kenapa Kami</a>
              </li>
              <li style={{ marginBottom: 8 }}>
                <a href="/#fitur">Fitur</a>
              </li>
              <li style={{ marginBottom: 8 }}>
                <a href="/#harga">Harga</a>
              </li>
              <li style={{ marginBottom: 8 }}>
                <a href="/#faq">FAQ</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Kontak</h4>
            <ul style={{ marginTop: 12 }}>
              <li style={{ marginBottom: 8 }}>
                <a href={waLink}>WhatsApp</a>
              </li>
              <li style={{ marginBottom: 8 }}>Senin–Jumat, 08.30–17.00 WIB</li>
              <li>Sabtu, 08.00–13.00 WIB</li>
            </ul>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} dmplus-web. All rights reserved. by
            Rachmadinata
          </span>
          <a href="/admin/login" style={{ opacity: 0.6 }}>
            Admin
          </a>
        </div>
      </footer>
    </>
  );
}
