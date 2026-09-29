// frontend/src/components/KPICard.jsx
export default function KPICard({ label, value, loading, accent }) {
  return (
    <div className={`kpi-card ${loading ? "kpi-card--loading" : ""}`}>
      <div className="kpi-card__label">{label}</div>
      {loading ? (
        <div className="skeleton-line" style={{ width: "70%" }} />
      ) : (
        <div className={`kpi-card__value ${accent ? "kpi-card__value--brass" : ""}`}>{value}</div>
      )}
    </div>
  );
}
