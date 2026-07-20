import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [captcha, setCaptcha] = useState(null); // { a, b, expiresAt, token }
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(true);

  async function loadCaptcha() {
    setCaptchaLoading(true);
    setCaptchaAnswer("");
    try {
      const data = await api.getAdminCaptcha();
      setCaptcha(data);
    } catch {
      setCaptcha(null);
    } finally {
      setCaptchaLoading(false);
    }
  }

  useEffect(() => {
    loadCaptcha();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!captcha) {
      setError("Verifikasi belum siap, tunggu sebentar lalu coba lagi");
      return;
    }
    if (!captchaAnswer.trim()) {
      setError("Isi dulu jawaban verifikasi di bawah");
      return;
    }

    setLoading(true);
    try {
      const data = await api.adminLogin({
        email,
        password,
        captcha: { ...captcha, answer: captchaAnswer },
      });
      localStorage.setItem("admin_token", data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
      // Soal captcha sekali pakai — ambil soal baru tiap gagal (baik salah
      // jawaban maupun salah email/password), supaya tidak bisa dicoba berulang
      // dengan soal & jawaban yang sama (mencegah brute-force otomatis).
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--moss-dark)", padding: "20px" }}>
      <form className="card" style={{ width: "100%", maxWidth: 360 }} onSubmit={submit}>
        <h2 style={{ fontSize: 22 }}>Admin Login</h2>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Verifikasi — kamu bukan robot kan?</label>
          {captchaLoading || !captcha ? (
            <div style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>Menyiapkan soal verifikasi…</div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                {captcha.a} + {captcha.b} =
              </span>
              <input
                type="number"
                inputMode="numeric"
                required
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="Jawaban"
                style={{ maxWidth: 120 }}
              />
            </div>
          )}
        </div>

        {error && <p style={{ color: "#b23b3b" }}>{error}</p>}
        <button className="btn btn-primary btn-block" disabled={loading || captchaLoading}>
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}

