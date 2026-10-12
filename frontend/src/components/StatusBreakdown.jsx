import { STATUS_LABELS, STATUSES } from '../utils/appointmentStatus'

const COUNT_KEYS = { SCHEDULED: 'scheduled', CHECKED_IN: 'checked_in', COMPLETED: 'completed', CANCELLED: 'cancelled' }

export default function StatusBreakdown({ stats }) {
  const counts = STATUSES.map((status) => ({ status, count: stats[COUNT_KEYS[status]] }))
  const total = counts.reduce((sum, item) => sum + item.count, 0)

  return (
    <section className="card">
      <h2>Appointments by status</h2>
      <div className="breakdown-bar" role="img" aria-label="Share of appointments in each status">
        {total > 0 &&
          counts.map(({ status, count }) => (
            <span key={status} className={`segment status-${status.toLowerCase()}`} style={{ flexGrow: count }} />
          ))}
      </div>
      <ul className="breakdown-legend">
        {counts.map(({ status, count }) => (
          <li key={status}>
            <span className={`dot status-${status.toLowerCase()}`} />
            {STATUS_LABELS[status]}
            <strong>{count}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}
