import { appointmentsApi, doctorsApi, patientsApi } from '../api/clinic'
import { Field, FormActions } from '../components/Form'
import { useAction } from '../hooks/useAction'
import { useApi } from '../hooks/useApi'
import { todayIso } from '../utils/format'

export default function AppointmentForm({ onSaved, onCancel }) {
  const patients = useApi(() => patientsApi.list(), 'patients')
  const doctors = useApi(() => doctorsApi.list(true), 'active-doctors')
  const { run, pending } = useAction(appointmentsApi.create, { successText: 'Appointment booked', onSuccess: onSaved })

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
      <Field label="Patient">
        <select name="patient_id" required defaultValue="">
          <option value="" disabled>
            {patients.data?.length === 0 ? 'Register a patient first' : 'Select patient'}
          </option>
          {patients.data?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name} ({p.phone})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Doctor">
        <select name="doctor_id" required defaultValue="">
          <option value="" disabled>
            Select doctor
          </option>
          {doctors.data?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.full_name} - {d.specialization}
            </option>
          ))}
        </select>
      </Field>
      <div className="form-row">
        <Field label="Date">
          <input name="date" type="date" required min={todayIso()} defaultValue={todayIso()} />
        </Field>
        <Field label="Time">
          <input name="time" type="time" required step={900} defaultValue="10:00" />
        </Field>
      </div>
      <Field label="Reason for visit">
        <input name="reason" required minLength={2} maxLength={200} />
      </Field>
      <Field label="Notes (optional)">
        <textarea name="notes" rows={2} />
      </Field>
      <FormActions onCancel={onCancel} pending={pending} submitLabel="Book appointment" />
    </form>
  )
}
