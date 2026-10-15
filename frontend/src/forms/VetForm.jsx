import { doctorsApi } from '../api/clinic'
import { Field, FormActions } from '../components/Form'
import { useAction } from '../hooks/useAction'
import { readForm } from '../utils/form'

const SPECIALTIES = ['General care', 'Surgery', 'Dental', 'Dermatology', 'Vaccinations', 'Emergency']

export default function VetForm({ onSaved, onCancel }) {
  const { run, pending } = useAction(doctorsApi.create, { successText: 'Vet added', onSuccess: onSaved })

  function handleSubmit(event) {
    event.preventDefault()
    run(readForm(event.currentTarget))
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Field label="Vet name">
        <input name="full_name" required minLength={2} maxLength={120} placeholder="Dr. " autoFocus />
      </Field>
      <div className="form-row">
        <Field label="Specialty">
          <input name="specialization" list="vet-specialties" required minLength={2} maxLength={80} />
          <datalist id="vet-specialties">
            {SPECIALTIES.map((specialty) => (
              <option key={specialty} value={specialty} />
            ))}
          </datalist>
        </Field>
        <Field label="Consult room">
          <input name="room" maxLength={20} placeholder="2" />
        </Field>
      </div>
      <FormActions onCancel={onCancel} pending={pending} submitLabel="Add vet" />
    </form>
  )
}
