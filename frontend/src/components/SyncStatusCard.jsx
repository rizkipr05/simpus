export default function SyncStatusCard({ connection, syncState, onManualSync, offlineReady }) {
  return (
    <section className="panel status-card">
      <div className="status-card-top">
        <div>
          <h2>Status Sinkronisasi</h2>
          <p className="muted">
            Data lokal tetap bisa dipakai saat internet atau backend sedang tidak tersedia.
          </p>
        </div>
        <span className={`badge ${connection.ready ? "badge-online" : "badge-offline"}`}>
          {connection.label}
        </span>
      </div>

      <div className="status-grid">
        <div className="status-cell">
          <span className="label">Status</span>
          <strong>{syncState.label}</strong>
        </div>
        <div className="status-cell">
          <span className="label">Terakhir</span>
          <strong>{syncState.lastSync || "-"}</strong>
        </div>
        <div className="status-cell">
          <span className="label">Detail</span>
          <strong>{syncState.detail}</strong>
        </div>
      </div>

      {!offlineReady ? (
        <p className="muted">
          Offline penuh butuh HTTPS. Jika situs masih `Not secure`, browser tidak akan mengaktifkan
          service worker.
        </p>
      ) : null}

      <button className="secondary-button" onClick={onManualSync} type="button">
        Sinkronkan Sekarang
      </button>
    </section>
  );
}
