import { appointmentsApi, dashboardApi } from '../api/clinic'
import DataState from '../components/DataState'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import StatusBreakdown from '../components/StatusBreakdown'
import { useApi } from '../hooks/useApi'
import { formatDate, formatTime, todayIso } from '../utils/format'

export default function DashboardPage({ onNavigate }) {
  const today = todayIso()
  const stats = useApi(dashboardApi.stats, 'stats')
  const schedule = useApi(() => appointmentsApi.list({ on_date: today }), today)
  const s = stats.data

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Today, ${formatDate(today)}`}>
        <button type="button" className="btn btn-primary" onClick={() => onNavigate('appointments')}>
          Manage appointments
        </button>
      </PageHeader>

      <DataState loading={stats.loading} error={stats.error} isEmpty={!s} onRetry={stats.reload}>
        {s && (
          <>
            <div className="stats-grid">
              <StatCard label="Appointments today" value={s.appointments_today} hint="Booked for today" />
              <StatCard label="Waiting room" value={s.checked_in} hint="Checked in, not yet seen" tone="amber" />
              <StatCard label="Patients" value={s.patients} hint="Registered in total" tone="blue" />
              <StatCard label="Doctors on duty" value={s.active_doctors} hint="Accepting bookings" tone="violet" />
            </div>
            <StatusBreakdown stats={s} />
          </>
        )}
      </DataState>

      <section className="card">
        <h2>Today&apos;s schedule</h2>
        <DataState
          loading={schedule.loading}
          error={schedule.error}
          isEmpty={!schedule.data?.length}
          emptyText="No appointments booked for today."
          onRetry={schedule.reload}
        >
          <ul className="schedule">
            {schedule.data?.map((a) => (
              <li key={a.id}>
                <time>{formatTime(a.scheduled_at)}</time>
                <div>
                  <strong>{a.patient_name}</strong>
                  <span>
                    {a.doctor_name} · {a.reason}
                  </span>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </DataState>
      </section>
    </>
  )
}
