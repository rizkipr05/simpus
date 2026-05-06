export default function MedicalRecordsPage({
  records,
  title = "Riwayat Pemeriksaan",
  description,
  onDelete,
  canDelete = false,
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p className="muted">
            {description || "Halaman ini hanya menampilkan rekam medis pasien."}
          </p>
        </div>
      </div>

      <div className="record-list">
        {records.map((record) => (
          <article className="record-card" key={record._id}>
            <div className="record-card-top">
              <div>
                <strong>{record.patientName || "Pasien tidak diketahui"}</strong>
                <span>{record.visitDate}</span>
              </div>
              <div className="record-card-actions">
                <small>{new Date(record.updatedAt).toLocaleString("id-ID")}</small>
                {canDelete ? (
                  <button className="danger-button" type="button" onClick={() => onDelete(record)}>
                    Hapus
                  </button>
                ) : null}
              </div>
            </div>
            <p>
              <strong>Keluhan:</strong> {record.complaint}
            </p>
            <p>
              <strong>Diagnosis:</strong> {record.diagnosis}
            </p>
            <p>
              <strong>Tindakan:</strong> {record.treatment}
            </p>
            {record.notes ? (
              <p>
                <strong>Catatan:</strong> {record.notes}
              </p>
            ) : null}
          </article>
        ))}

        {records.length === 0 ? <p className="empty-state">Belum ada rekam medis.</p> : null}
      </div>
    </section>
  );
}
