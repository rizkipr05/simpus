import { useEffect, useState } from "react";

const emptyForm = {
  username: "",
  name: "",
  role: "Perawat",
  password: "",
};

export default function UserManagementPage({
  users,
  selectedUser,
  onEdit,
  onSave,
  onCancelEdit,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!selectedUser) {
      setForm(emptyForm);
      return;
    }

    setForm({
      username: selectedUser.username || "",
      name: selectedUser.name || "",
      role: selectedUser.role || "Perawat",
      password: selectedUser.password || "",
    });
  }, [selectedUser]);

  return (
    <section className="stack-section">
      <form
        className="panel form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
      >
        <div className="panel-header">
          <div>
            <h2>{selectedUser ? "Edit Akun User" : "Tambah Akun User"}</h2>
            <p className="muted">Admin dapat mengelola akun login petugas dari halaman ini.</p>
          </div>
        </div>

        <div className="input-grid">
          <label>
            Username
            <input
              required
              disabled={Boolean(selectedUser)}
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            />
          </label>

          <label>
            Role
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            >
              <option value="Admin">Admin</option>
              <option value="Perawat">Perawat</option>
            </select>
          </label>

          <label>
            Nama Lengkap
            <input
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>
        </div>

        <div className="action-row">
          <button className="primary-button" type="submit">
            {selectedUser ? "Simpan Perubahan User" : "Tambah User"}
          </button>
          {selectedUser ? (
            <button className="secondary-button" type="button" onClick={onCancelEdit}>
              Batal Edit
            </button>
          ) : null}
        </div>
      </form>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Daftar User</h2>
            <p className="muted">Akun yang tampil di sini ikut tersimpan ke database aplikasi.</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" onClick={() => onEdit(user)}>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">
                    Belum ada akun user.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
