function MetricCard({ label, value, detail, icon, accent = "default" }) {
  return (
    <article className={`metric-card metric-card-${accent}`}>
      <div className="metric-card-head">
        <span>{label}</span>
        <i className="material-symbols-outlined">{icon}</i>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export default MetricCard;
