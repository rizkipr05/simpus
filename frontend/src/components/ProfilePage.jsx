import { useEffect, useState } from "react";

export default function ProfilePage({ session, onSave }) {
  const [form, setForm] = useState({
    name: session.user.name || "",
    password: "",
  });

  useEffect(() => {
    setForm({
      name: session.user.name || "",
      password: "",
    });
  }, [session]);

  return (
    <form
      className="panel form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <div className="panel-header">
        <div>
          <h2>Profil Pengguna</h2>
          <p className="muted">Perbarui identitas akun yang sedang Anda gunakan.</p>
        </div>
      </div>

      <div className="profile-summary">
        <div>
          <span className="label">Username</span>
          <strong>{session.user.username}</strong>
        </div>
        <div>
          <span className="label">Role</span>
          <strong>{session.user.role}</strong>
        </div>
      </div>

      <div className="input-grid">
        <label>
          Nama Lengkap
          <input
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </label>

        <label>
          Password Baru
          <input
            type="password"
            placeholder="Kosongkan jika tidak ingin mengubah password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
        </label>
      </div>

      <button className="primary-button" type="submit">
        Simpan Profil
      </button>
    </form>
  );
}
