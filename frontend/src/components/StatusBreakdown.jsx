import { STATUS_LABELS, STATUSES } from '../utils/appointmentStatus'

const COUNT_KEYS = { SCHEDULED: 'scheduled', CHECKED_IN: 'checked_in', COMPLETED: 'completed', CANCELLED: 'cancelled' }

export default function StatusBreakdown({ stats }) {
  const counts = STATUSES.map((status) => ({ status, count: stats[COUNT_KEYS[status]] }))
  const total = counts.reduce((sum, item) => sum + item.count, 0)

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>All visits by status</h2>
        <span className="count">{total}</span>
      </div>
      <div className="breakdown-bar" role="img" aria-label="Share of visits in each status">
        {total > 0 &&
          counts.map(({ status, count }) => (
            <span key={status} className={`segment status-${status.toLowerCase()}`} style={{ flexGrow: count }} />
          ))}
      </div>
      <ul className="breakdown-list">
        {counts.map(({ status, count }) => (
          <li key={status}>
            <span className={`dot status-${status.toLowerCase()}`} />
            <span>{STATUS_LABELS[status]}</span>
            <strong>{count}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}
