export default function StatCard({ label, value, hint, tone = 'teal' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value ?? '-'}</strong>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  )
}
