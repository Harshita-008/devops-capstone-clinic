import { useDeferredValue, useState } from 'react'

import { patientsApi } from '../api/clinic'
import DataState from '../components/DataState'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import PatientForm from '../forms/PatientForm'
import { useAction } from '../hooks/useAction'
import { useApi } from '../hooks/useApi'
import { ageFrom, formatDate, initials } from '../utils/format'

const GENDER_LABELS = { FEMALE: 'Female', MALE: 'Male', OTHER: 'Other' }

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  // Deferred so typing stays smooth while the list request catches up.
  const query = useDeferredValue(search.trim())
  const patients = useApi(() => patientsApi.list(query), query)
  const remove = useAction(patientsApi.remove, { successText: 'Patient removed', onSuccess: patients.reload })

  function confirmRemove(patient) {
    if (window.confirm(`Remove ${patient.full_name}? Patients with appointments cannot be removed.`)) {
      remove.run(patient.id)
    }
  }

  return (
    <>
      <PageHeader title="Patients" subtitle="Everyone registered at the clinic">
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          <Icon name="plus" /> Register patient
        </button>
      </PageHeader>

      <section className="card">
        <div className="filters">
          <div className="search">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search by name or phone"
              aria-label="Search patients"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <DataState
          loading={patients.loading}
          error={patients.error}
          isEmpty={!patients.data?.length}
          emptyText={query ? `No patients match "${query}".` : 'No patients registered yet.'}
          onRetry={patients.reload}
        >
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Registered</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {patients.data?.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="person">
                        <span className="avatar">{initials(p.full_name)}</span>
                        <div>
                          <strong>{p.full_name}</strong>
                          {p.email && <small>{p.email}</small>}
                        </div>
                      </div>
                    </td>
                    <td>{p.phone}</td>
                    <td>{GENDER_LABELS[p.gender]}</td>
                    <td>{ageFrom(p.date_of_birth)}</td>
                    <td className="muted">{formatDate(p.created_at)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn-small btn-danger"
                          disabled={remove.pending}
                          onClick={() => confirmRemove(p)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataState>
      </section>

      {adding && (
        <Modal title="Register patient" onClose={() => setAdding(false)}>
          <PatientForm
            onCancel={() => setAdding(false)}
            onSaved={() => {
              setAdding(false)
              patients.reload()
            }}
          />
        </Modal>
      )}
    </>
  )
}
