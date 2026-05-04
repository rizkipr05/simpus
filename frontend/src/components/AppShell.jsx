import { useEffect, useState } from "react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activePage]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="app-shell">
      <div
        className={`sidebar-backdrop ${mobileMenuOpen ? "sidebar-backdrop-visible" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-block">
          <div className="brand-mark">S</div>
          <div>
            <p className="eyebrow">Sistem Informasi Puskesmas</p>
            <strong className="brand-title">{panelTitle}</strong>
          </div>
          <button
            className="mobile-close-button"
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Tutup menu"
          >
            ×
          </button>
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
              onClick={() => {
                onNavigate(page.id);
                setMobileMenuOpen(false);
              }}
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

      <button
        className="mobile-menu-button"
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Buka menu navigasi"
      >
        <span />
        <span />
        <span />
      </button>
    </div>
  );
}
