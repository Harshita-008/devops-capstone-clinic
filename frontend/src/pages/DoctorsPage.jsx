import { useState } from 'react'

import { doctorsApi } from '../api/clinic'
import DataState from '../components/DataState'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import DoctorForm from '../forms/DoctorForm'
import { useAction } from '../hooks/useAction'
import { useApi } from '../hooks/useApi'
import { initials } from '../utils/format'

export default function DoctorsPage() {
  const [adding, setAdding] = useState(false)
  const doctors = useApi(() => doctorsApi.list(), 'doctors')
  const toggle = useAction((doctor) => doctorsApi.update(doctor.id, { is_active: !doctor.is_active }), {
    onSuccess: doctors.reload,
  })

  return (
    <>
      <PageHeader title="Doctors" subtitle="Who is available for bookings">
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          <Icon name="plus" /> Add doctor
        </button>
      </PageHeader>

      <DataState
        loading={doctors.loading}
        error={doctors.error}
        isEmpty={!doctors.data?.length}
        emptyText="No doctors added yet."
        onRetry={doctors.reload}
      >
        <div className="doctor-grid">
          {doctors.data?.map((d) => (
            <article key={d.id} className={`card doctor-card ${d.is_active ? '' : 'inactive'}`}>
              <span className="avatar avatar-large">{initials(d.full_name)}</span>
              <h3>{d.full_name}</h3>
              <p>{d.specialization}</p>
              <span className="muted">{d.room ? `Room ${d.room}` : 'No room assigned'}</span>
              <span className={`badge ${d.is_active ? 'status-completed' : 'status-cancelled'}`}>
                {d.is_active ? 'Accepting bookings' : 'Not accepting bookings'}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                disabled={toggle.pending}
                onClick={() => toggle.run(d)}
              >
                {d.is_active ? 'Mark unavailable' : 'Mark available'}
              </button>
            </article>
          ))}
        </div>
      </DataState>

      {adding && (
        <Modal title="Add doctor" onClose={() => setAdding(false)}>
          <DoctorForm
            onCancel={() => setAdding(false)}
            onSaved={() => {
              setAdding(false)
              doctors.reload()
            }}
          />
        </Modal>
      )}
    </>
  )
}
