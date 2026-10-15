import { useState } from 'react'

import { appointmentsApi, doctorsApi } from '../api/clinic'
import Avatar from '../components/Avatar'
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
  const visits = useApi(() => appointmentsApi.list(filters), JSON.stringify(filters))
  const vets = useApi(() => doctorsApi.list(), 'vets')
  const changeStatus = useAction(({ id, status }) => appointmentsApi.update(id, { status }), {
    successText: 'Visit updated',
    onSuccess: visits.reload,
  })

  const setFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }))
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <>
      <PageHeader title="Visits" subtitle="Book visits and move each pet through the day">
        <button type="button" className="btn btn-primary" onClick={() => setBooking(true)}>
          <Icon name="plus" size={16} /> Book visit
        </button>
      </PageHeader>

      <section className="panel">
        <div className="toolbar">
          <div className="chips" role="group" aria-label="Filter by status">
            {['', ...STATUSES].map((status) => (
              <button
                key={status || 'all'}
                type="button"
                className={`chip ${filters.status === status ? 'active' : ''}`}
                aria-pressed={filters.status === status}
                onClick={() => setFilter('status', status)}
              >
                {status ? STATUS_LABELS[status] : 'All'}
              </button>
            ))}
          </div>
          <div className="toolbar-right">
            <select
              aria-label="Filter by vet"
              value={filters.doctor_id}
              onChange={(event) => setFilter('doctor_id', event.target.value)}
            >
              <option value="">All vets</option>
              {vets.data?.map((vet) => (
                <option key={vet.id} value={vet.id}>
                  {vet.full_name}
                </option>
              ))}
            </select>
            <input
              type="date"
              aria-label="Filter by date"
              value={filters.on_date}
              onChange={(event) => setFilter('on_date', event.target.value)}
            />
            {hasFilters && (
              <button type="button" className="btn btn-link" onClick={() => setFilters(NO_FILTERS)}>
                Clear filters
              </button>
            )}
          </div>
        </div>

        <DataState
          loading={visits.loading}
          error={visits.error}
          isEmpty={!visits.data?.length}
          emptyText={hasFilters ? 'No visits match these filters.' : 'No visits booked yet.'}
          onRetry={visits.reload}
        >
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Pet</th>
                  <th>Vet</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visits.data?.map((visit) => (
                  <tr key={visit.id}>
                    <td>
                      <div className="when">
                        <strong>{formatTime(visit.scheduled_at)}</strong>
                        <span>{formatDate(visit.scheduled_at)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="who">
                        <Avatar name={visit.patient_name} size="sm" />
                        <strong>{visit.patient_name}</strong>
                      </div>
                    </td>
                    <td>{visit.doctor_name}</td>
                    <td className="muted">{visit.reason}</td>
                    <td>
                      <StatusBadge status={visit.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        {NEXT_ACTIONS[visit.status].map((action) => (
                          <button
                            key={action.status}
                            type="button"
                            className={`btn btn-small ${action.danger ? 'btn-danger' : 'btn-light'}`}
                            disabled={changeStatus.pending}
                            onClick={() => changeStatus.run({ id: visit.id, status: action.status })}
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
        <Modal title="Book a visit" onClose={() => setBooking(false)}>
          <AppointmentForm
            onCancel={() => setBooking(false)}
            onSaved={() => {
              setBooking(false)
              visits.reload()
            }}
          />
        </Modal>
      )}
    </>
  )
}
