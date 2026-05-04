export default function DashboardPage({ patients, records, syncState, connection, role }) {
  const latestPatients = patients.slice(0, 5);
  const latestRecords = records.slice(0, 5);
  const roleDescription =
    role === "Admin"
      ? "Panel admin difokuskan untuk pengelolaan data pasien dan sinkronisasi sistem."
      : "Panel perawat difokuskan untuk pelayanan pasien dan pencatatan pemeriksaan.";

  return (
    <section className="dashboard-grid">
      <article className="panel summary-card accent-card">
        <div className="summary-top">
          <span className="label">Total Pasien</span>
          <span className="soft-badge">Live</span>
        </div>
        <strong>{patients.length}</strong>
        <p className="muted">{roleDescription}</p>
      </article>

      <article className="panel summary-card">
        <div className="summary-top">
          <span className="label">Total Rekam Medis</span>
          <span className="soft-badge">Arsip</span>
        </div>
        <strong>{records.length}</strong>
        <p className="muted">Riwayat pemeriksaan dapat diakses tanpa internet.</p>
      </article>

      <article className="panel summary-card">
        <div className="summary-top">
          <span className="label">Koneksi</span>
          <span
            className={`soft-badge ${connection.ready ? "soft-badge-online" : "soft-badge-offline"}`}
          >
            {connection.badge}
          </span>
        </div>
        <strong>{connection.label}</strong>
        <p className="muted">{syncState.detail}</p>
      </article>

      <section className="panel dashboard-panel">
        <div className="panel-header">
          <div>
            <h2>Pasien Terbaru</h2>
            <p className="muted">Lima data pasien yang terakhir diperbarui.</p>
          </div>
        </div>
        <div className="simple-list">
          {latestPatients.map((patient) => (
            <div className="simple-list-item" key={patient._id}>
              <div>
                <strong>{patient.name}</strong>
                <span>{patient.nik}</span>
              </div>
              <span className="soft-badge">Pasien</span>
            </div>
          ))}
          {latestPatients.length === 0 ? <p className="empty-state">Belum ada data pasien.</p> : null}
        </div>
      </section>

      <section className="panel dashboard-panel">
        <div className="panel-header">
          <div>
            <h2>Rekam Medis Terbaru</h2>
            <p className="muted">Lima pemeriksaan yang terakhir diperbarui.</p>
          </div>
        </div>
        <div className="simple-list">
          {latestRecords.map((record) => (
            <div className="simple-list-item" key={record._id}>
              <div>
                <strong>{record.patientName || "Pasien"}</strong>
                <span>{record.visitDate}</span>
              </div>
              <span className="soft-badge">Pemeriksaan</span>
            </div>
          ))}
          {latestRecords.length === 0 ? <p className="empty-state">Belum ada rekam medis.</p> : null}
        </div>
      </section>
    </section>
  );
}
