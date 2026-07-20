import { useEffect, useState } from "react";
import Navbar, { waLink } from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PricingCard from "../components/PricingCard.jsx";
import { api } from "../lib/api.js";

const PROBLEMS = [
  { num: "01", title: "Cuma jadi pajangan", desc: "Website ada, tapi tidak ada yang menghubungi kamu." },
  { num: "02", title: "Tidak muncul di Google", desc: "Calon klien mencari jasamu, yang muncul malah kompetitor." },
  { num: "03", title: "Tidak ada tracking", desc: "Tidak tahu berapa orang yang lihat & klik. Hasilnya gelap." },
  { num: "04", title: "Kalah meyakinkan", desc: "Kompetitor dengan web rapi tampil lebih kredibel di mata calon klien." },
];

const FEATURES = [
  { icon: "🎯", title: "Conversion-First", desc: "Setiap halaman dirancang untuk mendatangkan leads, bukan sekadar tampil bagus." },
  { icon: "📊", title: "Tracking Bawaan", desc: "GA4 & GTM terpasang sejak awal, jadi hasilnya terukur, bukan tebak-tebakan." },
  { icon: "🔎", title: "Ditemukan di Google", desc: "SEO dasar supaya calon klien lebih mudah menemukan bisnismu." },
];

const INCLUDES = [
  "Domain + hosting 1 tahun",
  "1 email bisnis (@domainmu)",
  "Desain conversion-first & mobile-responsive",
  "Halaman lengkap: Beranda, Tentang, Layanan, Portofolio, Kontak",
  "Tracking GA4 + GTM bawaan",
  "SEO dasar biar muncul di Google",
  "Integrasi Google Maps + tombol WhatsApp + form leads",
  "Revisi 1x, gratis 12x editing minor/tahun",
];

const STEPS = [
  { n: "1", title: "Konsultasi gratis", desc: "Ceritakan bisnis & tujuanmu via WhatsApp, tanpa komitmen." },
  { n: "2", title: "Kami bangun", desc: "Desain conversion-first, konten, tracking, dan SEO dasar." },
  { n: "3", title: "Review & revisi", desc: "Kamu cek hasilnya, kami rapikan sampai pas." },
  { n: "4", title: "Website live", desc: "Landing Page 4 hari, Website 5 Halaman 7 hari kerja." },
];

const TESTIMONIALS = [
  { name: "Kedai Kopi Nusantara", text: "Sejak websitenya jalan, cukup banyak pelanggan baru yang bilang menemukan kami lewat pencarian Google." },
  { name: "Studio Foto Zeva", text: "Website-nya benar-benar mendatangkan calon klien, bukan cuma pajangan. Chat booking naik terus." },
  { name: "Catering Arkan", text: "Sekarang kami bisa lihat langsung datanya, jadi tahu persis hasil dari websitenya." },
];

const DEFAULT_SERVICES = [
  {
    id: "default-landing-com",
    slug: "landing-page-com",
    name: "Landing Page 1 Halaman",
    subtitle: "Domain .com — cocok untuk promosi & campaign",
    priceOriginal: 2500000,
    priceFinal: 1500000,
    workingDays: "4 hari kerja",
    isPopular: false,
    features: [
      "Domain .com + hosting 1 tahun",
      "1 email bisnis (@domainmu)",
      "Desain conversion-first & mobile-responsive",
      "Tracking GA4 + GTM bawaan",
      "Integrasi WhatsApp + form leads",
    ],
  },
  {
    id: "default-website-com",
    slug: "website-5-halaman-com",
    name: "Website 5 Halaman",
    subtitle: "Domain .com — paling cocok untuk company profile",
    priceOriginal: 4500000,
    priceFinal: 2900000,
    workingDays: "7 hari kerja",
    isPopular: true,
    features: [
      "Domain .com + hosting 1 tahun",
      "1 email bisnis (@domainmu)",
      "Halaman: Beranda, Tentang, Layanan, Portofolio, Kontak",
      "Tracking GA4 + GTM bawaan",
      "SEO dasar biar muncul di Google",
      "Integrasi Google Maps + WhatsApp + form leads",
    ],
  },
  {
    id: "default-website-coid",
    slug: "website-5-halaman-co-id",
    name: "Website 5 Halaman",
    subtitle: "Domain .co.id — lebih kredibel untuk badan usaha",
    priceOriginal: 5000000,
    priceFinal: 3400000,
    workingDays: "7 hari kerja",
    isPopular: false,
    features: [
      "Domain .co.id + hosting 1 tahun",
      "1 email bisnis (@domainmu)",
      "Halaman: Beranda, Tentang, Layanan, Portofolio, Kontak",
      "Tracking GA4 + GTM bawaan",
      "SEO dasar biar muncul di Google",
      "Integrasi Google Maps + WhatsApp + form leads",
    ],
  },
];

const FAQS = [
  { q: "Berapa biaya jasa pembuatan website company profile?", a: "Mulai dari paket Landing Page 1 halaman hingga Website 5 Halaman dengan pilihan domain .com atau .co.id. Semua harga sudah all-in untuk periode 1 tahun: domain, hosting, email bisnis, tracking, dan garansi." },
  { q: "Berapa lama website perusahaan saya selesai?", a: "Landing Page selesai dalam 4 hari kerja, dan Website 5 Halaman selesai dalam 7 hari kerja — terhitung sejak konten & materi lengkap kami terima." },
  { q: "Pilih domain apa — .com atau .co.id? Apa bedanya?", a: ".com cocok untuk hampir semua bisnis dan paling familiar. .co.id khusus badan usaha berbadan hukum (butuh dokumen legal) dan memberi kesan lebih kredibel di mata calon klien." },
  { q: "Apakah ada tracking biar tahu jumlah pengunjung & leads?", a: "Ada. Setiap website dipasangi GA4 + GTM bawaan, sehingga kamu tahu persis berapa pengunjung, klik tombol WhatsApp, dan yang menghubungi kamu." },
  { q: "Bagaimana skema pembayarannya?", a: "Pembayaran dilakukan 100% di awal sebelum pengerjaan dimulai. Bisa transfer bank manual atau otomatis via Midtrans (VA, e-wallet, kartu)." },
  { q: "Apakah bisa tambah halaman / desain custom?", a: "Bisa. Kebutuhan halaman tambahan atau desain custom kami diskusikan saat konsultasi dan disesuaikan dengan tujuan bisnismu." },
];

export default function Home() {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [openFaq, setOpenFaq] = useState(null);
  const [siteSettings, setSiteSettings] = useState({ pricingMode: "PAYMENT_GATEWAY" });

  useEffect(() => {
    api
      .getServices()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      })
      .catch((err) => {
        console.warn("Gagal mengambil data paket dari API, menampilkan paket default:", err);
      });

    api
      .getSiteSettings()
      .then((data) => setSiteSettings(data))
      .catch((err) => {
        console.warn("Gagal mengambil pengaturan pricing dari API, memakai mode default:", err);
      });
  }, []);

  return (
    <div id="top">
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">⭐ 160+ Website · Tim In-House Bersertifikat</span>
            <h1>Website Company Profile yang Dibangun untuk Mendatangkan Leads</h1>
            <p style={{ fontSize: 17, maxWidth: 480 }}>
              Jasa pembuatan website & landing page untuk profil perusahaan yang bukan sekadar cantik,
              tapi mencetak calon klien. Conversion-first, mudah ditemukan di Google, dan dilengkapi
              tracking bawaan supaya hasilnya terukur.
            </p>
            <div style={{ display: "flex", gap: 14, marginTop: 26 }}>
              <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-primary">Konsultasi Gratis</a>
              <a href="#harga" className="btn btn-ghost">Lihat Paket & Harga</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><b>160+</b><span>Website dibangun</span></div>
              <div className="hero-stat"><b>4.9/5</b><span>60+ ulasan klien</span></div>
              <div className="hero-stat"><b>1 thn</b><span>Garansi anti-hack</span></div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-row"><span>GA4 + GTM</span><b>Aktif ✓</b></div>
            <div className="hero-card-row"><span>Website dibangun</span><b>160+</b></div>
            <div className="hero-card-row"><span>Rating klien</span><b>4.9 / 5</b></div>
            <div className="hero-card-row"><span>Spesialis in-house</span><b>8+</b></div>
            <div className="hero-card-row"><span>Garansi</span><b>1 tahun</b></div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section-tight" id="kenapa">
        <div className="container">
          <span className="eyebrow">Masalah Umum</span>
          <h2 style={{ fontSize: 30, maxWidth: 600 }}>Punya website tapi masih sepi leads?</h2>
          <p style={{ maxWidth: 560 }}>Banyak website perusahaan berhenti jadi "pajangan". Ini 4 penyebab yang paling sering kami temukan.</p>
          <div className="problem-grid">
            {PROBLEMS.map((p) => (
              <div className="problem-card" key={p.num}>
                <div className="num">{p.num}</div>
                <h3 style={{ fontSize: 17 }}>{p.title}</h3>
                <p style={{ fontSize: 14 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="fitur">
        <div className="container">
          <span className="eyebrow">Solusinya</span>
          <h2 style={{ fontSize: 30, maxWidth: 640 }}>Website perusahaan yang dibangun untuk closing</h2>
          <p style={{ maxWidth: 640 }}>
            Desain conversion-first, setiap halaman mengarahkan pengunjung untuk menghubungimu via
            WhatsApp atau form, plus tracking bawaan supaya kamu tahu persis hasilnya.
          </p>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <h3 style={{ fontSize: 18 }}>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INCLUDES */}
      <section className="section-tight">
        <div className="container">
          <span className="eyebrow">Semua Sudah Termasuk</span>
          <h2 style={{ fontSize: 28 }}>Done-for-you — kamu terima beres</h2>
          <div className="includes-list">
            {INCLUDES.map((item) => (
              <div className="includes-item" key={item}>
                <span className="check">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="section">
        <div className="container">
          <span className="eyebrow">Proses Kerja</span>
          <h2 style={{ fontSize: 28 }}>4 langkah, cepat & jelas</h2>
          <div className="steps-grid">
            {STEPS.map((s) => (
              <div className="step-card" key={s.n}>
                <div className="step-num">{s.n}</div>
                <h3 style={{ fontSize: 17 }}>{s.title}</h3>
                <p style={{ fontSize: 14 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="harga" style={{ background: "var(--paper-raised)" }}>
        <div className="container">
          <span className="eyebrow">🔥 Promo Bulan Ini</span>
          <h2 style={{ fontSize: 30 }}>Paket Jasa Pembuatan Website</h2>
          <p>Harga spesial periode 1 tahun — slot terbatas.</p>
          <div className="pricing-grid">
            {services.map((s) => (
              <PricingCard
                key={s.id}
                service={s}
                pricingMode={siteSettings.pricingMode}
                ctwaWhatsapp={siteSettings.ctwaWhatsapp}
                ctwaMessage={siteSettings.ctwaMessage}
              />
            ))}
          </div>
          <p style={{ marginTop: 22, fontSize: 13, textAlign: "center" }}>
            Semua harga periode 1 tahun, all-in (domain + hosting + email + tracking + garansi).
          </p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-tight">
        <div className="container">
          <span className="eyebrow">Cerita Klien</span>
          <h2 style={{ fontSize: 28 }}>160+ website, ratusan bisnis terbantu</h2>
          <div className="testi-grid">
            {TESTIMONIALS.map((t) => (
              <div className="testi-card" key={t.name}>
                <div className="testi-stars">★★★★★</div>
                <p style={{ fontStyle: "italic" }}>"{t.text}"</p>
                <b style={{ fontSize: 14 }}>{t.name}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="container" style={{ maxWidth: 780 }}>
          <span className="eyebrow">FAQ</span>
          <h2 style={{ fontSize: 28 }}>Pertanyaan yang sering ditanyakan</h2>
          {FAQS.map((f, i) => (
            <div className="faq-item" key={f.q} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-q">
                <span>{f.q}</span>
                <span>{openFaq === i ? "–" : "+"}</span>
              </div>
              <div className="faq-a" hidden={openFaq !== i}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight" style={{ background: "var(--moss)", color: "#fff", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ color: "#fff", fontSize: 28 }}>Siap punya website yang mendatangkan leads?</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", maxWidth: 480, margin: "0 auto 24px" }}>
            Konsultasi gratis sekarang, tanpa komitmen.
          </p>
          <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-amber">Konsultasi Gratis via WhatsApp</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
