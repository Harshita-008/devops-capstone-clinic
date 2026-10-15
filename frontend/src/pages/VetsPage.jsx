import { useState } from 'react'

import { doctorsApi } from '../api/clinic'
import Avatar from '../components/Avatar'
import DataState from '../components/DataState'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import VetForm from '../forms/VetForm'
import { useAction } from '../hooks/useAction'
import { useApi } from '../hooks/useApi'

export default function VetsPage() {
  const [adding, setAdding] = useState(false)
  const vets = useApi(() => doctorsApi.list(), 'vets')
  const toggle = useAction((vet) => doctorsApi.update(vet.id, { is_active: !vet.is_active }), {
    onSuccess: vets.reload,
  })
  const remove = useAction(doctorsApi.remove, { successText: 'Vet removed', onSuccess: vets.reload })

  function confirmRemove(vet) {
    if (window.confirm(`Remove ${vet.full_name}? Vets with visits cannot be removed.`)) {
      remove.run(vet.id)
    }
  }

  return (
    <>
      <PageHeader title="Vets" subtitle="Who is in today and taking bookings">
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          <Icon name="plus" size={16} /> Add vet
        </button>
      </PageHeader>

      <DataState
        loading={vets.loading}
        error={vets.error}
        isEmpty={!vets.data?.length}
        emptyText="No vets added yet."
        onRetry={vets.reload}
      >
        <div className="card-grid">
          {vets.data?.map((vet) => (
            <article key={vet.id} className={`vet-card ${vet.is_active ? '' : 'away'}`}>
              <div className="vet-card-top">
                <Avatar name={vet.full_name} size="lg" />
                <button
                  type="button"
                  role="switch"
                  aria-checked={vet.is_active}
                  aria-label={`${vet.full_name} taking bookings`}
                  className="switch"
                  disabled={toggle.pending}
                  onClick={() => toggle.run(vet)}
                >
                  <span />
                </button>
              </div>
              <h3>{vet.full_name}</h3>
              <span className="specialty">{vet.specialization}</span>
              <p className="muted vet-room">
                <Icon name="door" size={14} /> {vet.room ? `Room ${vet.room}` : 'No room yet'}
              </p>
              <div className="vet-card-foot">
                <span className={`availability ${vet.is_active ? 'on' : 'off'}`}>
                  {vet.is_active ? 'Taking bookings' : 'Away'}
                </span>
                <button
                  type="button"
                  className="btn btn-small btn-link danger"
                  disabled={remove.pending}
                  onClick={() => confirmRemove(vet)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </DataState>

      {adding && (
        <Modal title="Add a vet" onClose={() => setAdding(false)}>
          <VetForm
            onCancel={() => setAdding(false)}
            onSaved={() => {
              setAdding(false)
              vets.reload()
            }}
          />
        </Modal>
      )}
    </>
  )
}
