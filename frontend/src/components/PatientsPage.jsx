export default function PatientsPage({
  patients,
  search,
  onSearchChange,
  onEdit,
  onOpenHistory,
  onDelete,
  onGoToCreate,
  canManage,
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Daftar Pasien</h2>
          <p className="muted">Tampilan ini khusus untuk pencarian dan pengelolaan data pasien.</p>
        </div>
        <div className="panel-actions">
          <input
            className="search-input"
            placeholder="Cari nama, NIK, atau telepon"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {canManage ? (
            <button className="primary-button" onClick={onGoToCreate} type="button">
              Tambah Pasien
            </button>
          ) : null}
        </div>
      </div>

      <div className="inline-stats">
        <div className="inline-stat">
          <span className="label">Total tampil</span>
          <strong>{patients.length}</strong>
        </div>
        <div className="inline-stat">
          <span className="label">Akses</span>
          <strong>{canManage ? "Admin penuh" : "Perawat baca/tinjau"}</strong>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>NIK</th>
              <th>Tanggal Lahir</th>
              <th>Kontak</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id}>
                <td>{patient.name}</td>
                <td>{patient.nik}</td>
                <td>{patient.birthDate}</td>
                <td>{patient.phone || "-"}</td>
                <td>
                  <div className="table-actions">
                    {canManage ? (
                      <button type="button" onClick={() => onEdit(patient)}>
                        Edit
                      </button>
                    ) : null}
                    <button type="button" onClick={() => onOpenHistory(patient._id)}>
                      Riwayat
                    </button>
                    {canManage ? (
                      <button className="danger-button" type="button" onClick={() => onDelete(patient)}>
                        Hapus
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {patients.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  Belum ada data pasien.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
