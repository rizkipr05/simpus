export default function PageHeader({ title, description, action }) {
  return (
    <section className="page-header">
      <div className="page-header-copy">
        <p className="eyebrow">Workspace</p>
        <h2>{title}</h2>
        <p className="muted">{description}</p>
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </section>
  );
}
