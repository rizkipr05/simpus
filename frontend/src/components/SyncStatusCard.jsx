export default function SyncStatusCard({ online, syncState, onManualSync }) {
  return (
    <section className="panel status-card">
      <div className="status-card-top">
        <div>
          <h2>Status Sinkronisasi</h2>
          <p className="muted">Aplikasi tetap bisa dipakai penuh saat offline.</p>
        </div>
        <span className={`badge ${online ? "badge-online" : "badge-offline"}`}>
          {online ? "Online" : "Offline"}
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

      <button className="secondary-button" onClick={onManualSync} type="button">
        Sinkronkan Sekarang
      </button>
    </section>
  );
}
