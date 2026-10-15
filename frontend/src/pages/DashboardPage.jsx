import { appointmentsApi, dashboardApi } from '../api/clinic'
import Avatar from '../components/Avatar'
import DataState from '../components/DataState'
import Icon from '../components/Icon'
import PawTrail from '../components/PawTrail'
import Stat from '../components/Stat'
import StatusBadge from '../components/StatusBadge'
import StatusBreakdown from '../components/StatusBreakdown'
import { useApi } from '../hooks/useApi'
import { formatTime, greeting, todayIso } from '../utils/format'

export default function DashboardPage({ onNavigate }) {
  const today = todayIso()
  const stats = useApi(dashboardApi.stats, 'stats')
  const schedule = useApi(() => appointmentsApi.list({ on_date: today }), today)
  const s = stats.data

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <h1>{greeting()}</h1>
          <p>
            {s
              ? `${s.appointments_today} visits on today's list, ${s.checked_in} waiting to be seen.`
              : 'Getting today ready...'}
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-dark" onClick={() => onNavigate('visits')}>
              <Icon name="plus" size={16} /> Book a visit
            </button>
            <button type="button" className="btn btn-light" onClick={() => onNavigate('pets')}>
              Register a pet
            </button>
          </div>
        </div>
        <PawTrail />
      </section>

      <DataState loading={stats.loading} error={stats.error} isEmpty={!s} onRetry={stats.reload}>
        {s && (
          <div className="stat-strip">
            <Stat label="Waiting room" value={s.checked_in} note="checked in, not seen yet" />
            <Stat label="Visits today" value={s.appointments_today} note="on the calendar" />
            <Stat label="Pets registered" value={s.patients} note="in total" />
            <Stat label="Vets on duty" value={s.active_doctors} note="taking bookings" />
          </div>
        )}
      </DataState>

      <div className="dash-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>Today&apos;s line-up</h2>
            <span className="count">{schedule.data?.length ?? 0}</span>
          </div>
          <DataState
            loading={schedule.loading}
            error={schedule.error}
            isEmpty={!schedule.data?.length}
            emptyText="No visits booked for today yet."
            onRetry={schedule.reload}
          >
            <ol className="timeline">
              {schedule.data?.map((visit) => (
                <li key={visit.id} className={`status-${visit.status.toLowerCase()}`}>
                  <time>{formatTime(visit.scheduled_at)}</time>
                  <span className="timeline-dot" />
                  <div className="timeline-card">
                    <Avatar name={visit.patient_name} />
                    <div className="timeline-text">
                      <strong>{visit.patient_name}</strong>
                      <span>
                        {visit.reason} · {visit.doctor_name}
                      </span>
                    </div>
                    <StatusBadge status={visit.status} />
                  </div>
                </li>
              ))}
            </ol>
          </DataState>
        </section>

        {s && <StatusBreakdown stats={s} />}
      </div>
    </>
  )
}
