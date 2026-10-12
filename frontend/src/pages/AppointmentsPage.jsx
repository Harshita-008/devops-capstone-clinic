import { useState } from 'react'

import { appointmentsApi, doctorsApi } from '../api/clinic'
import DataState from '../components/DataState'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import AppointmentForm from '../forms/AppointmentForm'
import { useAction } from '../hooks/useAction'
import { useApi } from '../hooks/useApi'
import { NEXT_ACTIONS, STATUS_LABELS, STATUSES } from '../utils/appointmentStatus'
import { formatDate, formatTime } from '../utils/format'

const NO_FILTERS = { status: '', on_date: '', doctor_id: '' }

export default function AppointmentsPage() {
  const [filters, setFilters] = useState(NO_FILTERS)
  const [booking, setBooking] = useState(false)
  const appointments = useApi(() => appointmentsApi.list(filters), JSON.stringify(filters))
  const doctors = useApi(() => doctorsApi.list(), 'doctors')
  const changeStatus = useAction(({ id, status }) => appointmentsApi.update(id, { status }), {
    successText: 'Appointment updated',
    onSuccess: appointments.reload,
  })

  const setFilter = (name) => (event) => setFilters((current) => ({ ...current, [name]: event.target.value }))
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <>
      <PageHeader title="Appointments" subtitle="Book visits and move patients through the day">
        <button type="button" className="btn btn-primary" onClick={() => setBooking(true)}>
          <Icon name="plus" /> Book appointment
        </button>
      </PageHeader>

      <section className="card">
        <div className="filters">
          <select aria-label="Filter by status" value={filters.status} onChange={setFilter('status')}>
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <select aria-label="Filter by doctor" value={filters.doctor_id} onChange={setFilter('doctor_id')}>
            <option value="">All doctors</option>
            {doctors.data?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name}
              </option>
            ))}
          </select>
          <input type="date" aria-label="Filter by date" value={filters.on_date} onChange={setFilter('on_date')} />
          {hasFilters && (
            <button type="button" className="btn btn-link" onClick={() => setFilters(NO_FILTERS)}>
              Clear filters
            </button>
          )}
        </div>

        <DataState
          loading={appointments.loading}
          error={appointments.error}
          isEmpty={!appointments.data?.length}
          emptyText={hasFilters ? 'No appointments match these filters.' : 'No appointments booked yet.'}
          onRetry={appointments.reload}
        >
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {appointments.data?.map((a) => (
                  <tr key={a.id}>
                    <td>{formatDate(a.scheduled_at)}</td>
                    <td>{formatTime(a.scheduled_at)}</td>
                    <td className="strong">{a.patient_name}</td>
                    <td>{a.doctor_name}</td>
                    <td className="muted">{a.reason}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        {NEXT_ACTIONS[a.status].map((action) => (
                          <button
                            key={action.status}
                            type="button"
                            className={`btn btn-small ${action.danger ? 'btn-danger' : 'btn-secondary'}`}
                            disabled={changeStatus.pending}
                            onClick={() => changeStatus.run({ id: a.id, status: action.status })}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataState>
      </section>

      {booking && (
        <Modal title="Book appointment" onClose={() => setBooking(false)}>
          <AppointmentForm
            onCancel={() => setBooking(false)}
            onSaved={() => {
              setBooking(false)
              appointments.reload()
            }}
          />
        </Modal>
      )}
    </>
  )
}
