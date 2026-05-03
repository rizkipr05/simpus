import { useState } from "react";

export default function LoginForm({ onSubmit, error, loading }) {
  const [form, setForm] = useState({
    username: "admin",
    password: "admin123",
  });

  return (
    <div className="login-shell">
      <div className="login-hero">
        <p className="eyebrow">Platform Pelayanan Puskesmas</p>
        <h1>Antarmuka SIMPUS yang lebih rapi untuk pelayanan yang lebih tenang.</h1>
        <p className="muted">
          Dirancang untuk administrasi pasien, pencatatan rekam medis, dan sinkronisasi data
          dengan tampilan yang bersih serta profesional.
        </p>
        <div className="hero-metrics">
          <div className="hero-metric">
            <strong>Offline-first</strong>
            <span>Pelayanan tetap berjalan saat jaringan tidak stabil.</span>
          </div>
          <div className="hero-metric">
            <strong>Sinkron otomatis</strong>
            <span>Data lokal dan server diselaraskan saat koneksi tersedia.</span>
          </div>
        </div>
      </div>

      <div className="login-card">
        <div>
          <p className="eyebrow">Puskesmas Bhintuka</p>
          <h2>SIMPUS Offline-First</h2>
          <p className="muted">
            Pendaftaran pasien dan rekam medis tetap berjalan walaupun internet terputus.
          </p>
        </div>

        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(form);
          }}
        >
          <label>
            Username
            <input
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="Masukkan username"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Masukkan password"
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="demo-note">
          <strong>Akses demo</strong>
          <span>Admin: admin/admin123</span>
          <span>Perawat: perawat/perawat123</span>
        </div>
      </div>
    </div>
  );
}
