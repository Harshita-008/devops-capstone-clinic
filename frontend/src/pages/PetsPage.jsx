import { useDeferredValue, useState } from 'react'

import { patientsApi } from '../api/clinic'
import Avatar from '../components/Avatar'
import DataState from '../components/DataState'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import PetForm from '../forms/PetForm'
import { useAction } from '../hooks/useAction'
import { useApi } from '../hooks/useApi'
import { formatDate, petAge } from '../utils/format'

const SEX_LABELS = { MALE: 'Male', FEMALE: 'Female', OTHER: 'Sex unknown' }

export default function PetsPage() {
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  // Deferred so typing stays smooth while the list request catches up.
  const query = useDeferredValue(search.trim())
  const pets = useApi(() => patientsApi.list(query), query)
  const remove = useAction(patientsApi.remove, { successText: 'Pet removed', onSuccess: pets.reload })

  function confirmRemove(pet) {
    if (window.confirm(`Remove ${pet.full_name}? Pets with visits cannot be removed.`)) {
      remove.run(pet.id)
    }
  }

  return (
    <>
      <PageHeader title="Pets" subtitle="Every pet registered at the clinic, with the owner's contact">
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          <Icon name="plus" size={16} /> Register pet
        </button>
      </PageHeader>

      <div className="search">
        <Icon name="search" size={16} />
        <input
          type="search"
          placeholder="Search by pet name or owner phone"
          aria-label="Search pets"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <DataState
        loading={pets.loading}
        error={pets.error}
        isEmpty={!pets.data?.length}
        emptyText={query ? `No pets match "${query}".` : 'No pets registered yet.'}
        onRetry={pets.reload}
      >
        <div className="card-grid">
          {pets.data?.map((pet) => (
            <article key={pet.id} className="pet-card">
              <div className="pet-card-top">
                <Avatar name={pet.full_name} size="lg" />
                <div>
                  <h3>{pet.full_name}</h3>
                  <p className="muted">
                    {[SEX_LABELS[pet.gender], petAge(pet.date_of_birth)].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
              <ul className="contact">
                <li>
                  <Icon name="phone" size={14} /> {pet.phone}
                </li>
                {pet.email && (
                  <li>
                    <Icon name="mail" size={14} /> {pet.email}
                  </li>
                )}
              </ul>
              <div className="pet-card-foot">
                <span className="muted">Since {formatDate(pet.created_at)}</span>
                <button
                  type="button"
                  className="btn btn-small btn-danger"
                  disabled={remove.pending}
                  onClick={() => confirmRemove(pet)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </DataState>

      {adding && (
        <Modal title="Register a pet" onClose={() => setAdding(false)}>
          <PetForm
            onCancel={() => setAdding(false)}
            onSaved={() => {
              setAdding(false)
              pets.reload()
            }}
          />
        </Modal>
      )}
    </>
  )
}
