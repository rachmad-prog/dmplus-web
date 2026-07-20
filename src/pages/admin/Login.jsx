import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.adminLogin({ email, password });
      localStorage.setItem("admin_token", data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
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
        {error && <p style={{ color: "#b23b3b" }}>{error}</p>}
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? "Masuk..." : "Masuk"}</button>
      </form>
    </div>
  );
}
