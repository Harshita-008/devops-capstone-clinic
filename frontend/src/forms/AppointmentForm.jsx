import { appointmentsApi, doctorsApi, patientsApi } from '../api/clinic'
import { Field, FormActions } from '../components/Form'
import { useAction } from '../hooks/useAction'
import { useApi } from '../hooks/useApi'
import { todayIso } from '../utils/format'

export default function AppointmentForm({ onSaved, onCancel }) {
  const pets = useApi(() => patientsApi.list(), 'pets')
  const vets = useApi(() => doctorsApi.list(true), 'active-vets')
  const { run, pending } = useAction(appointmentsApi.create, { successText: 'Visit booked', onSuccess: onSaved })

  function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    run({
      patient_id: Number(form.get('patient_id')),
      doctor_id: Number(form.get('doctor_id')),
      scheduled_at: `${form.get('date')}T${form.get('time')}`,
      reason: form.get('reason'),
      notes: form.get('notes'),
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <Field label="Pet">
          <select name="patient_id" required defaultValue="">
            <option value="" disabled>
              {pets.data?.length === 0 ? 'Register a pet first' : 'Choose a pet'}
            </option>
            {pets.data?.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.full_name} ({pet.phone})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vet">
          <select name="doctor_id" required defaultValue="">
            <option value="" disabled>
              Choose a vet
            </option>
            {vets.data?.map((vet) => (
              <option key={vet.id} value={vet.id}>
                {vet.full_name}, {vet.specialization}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="form-row">
        <Field label="Date">
          <input name="date" type="date" required min={todayIso()} defaultValue={todayIso()} />
        </Field>
        <Field label="Time">
          <input name="time" type="time" required step={900} defaultValue="10:00" />
        </Field>
      </div>
      <Field label="Reason for visit">
        <input name="reason" required minLength={2} maxLength={200} placeholder="Vaccination, limping, check-up" />
      </Field>
      <Field label="Notes (optional)">
        <textarea name="notes" rows={2} />
      </Field>
      <FormActions onCancel={onCancel} pending={pending} submitLabel="Book visit" />
    </form>
  )
}
