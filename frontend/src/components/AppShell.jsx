export default function AppShell({
  session,
  pages,
  activePage,
  onNavigate,
  onLogout,
  panelTitle,
  panelDescription,
  children,
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">S</div>
          <div>
            <p className="eyebrow">Sistem Informasi Puskesmas</p>
            <strong className="brand-title">{panelTitle}</strong>
          </div>
        </div>
        <div>
          <p className="sidebar-description">{panelDescription}</p>
        </div>

        <div className="user-card">
          <span className="user-card-label">Akun aktif</span>
          <strong>{session.user.name}</strong>
          <div className="user-meta-row">
            <span className="soft-badge">{session.user.role}</span>
            <span>{session.user.username}</span>
          </div>
        </div>

        <nav className="nav-tabs">
          {pages.map((page) => (
            <button
              key={page.id}
              className={page.id === activePage ? "nav-active" : ""}
              onClick={() => onNavigate(page.id)}
              type="button"
            >
              {page.label}
            </button>
          ))}
        </nav>

        <button className="logout-button" type="button" onClick={onLogout}>
          Keluar
        </button>
      </aside>

      <main className="content">
        <div className="content-shell">{children}</div>
      </main>
    </div>
  );
}
