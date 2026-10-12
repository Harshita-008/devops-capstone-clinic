import { patientsApi } from '../api/clinic'
import { Field, FormActions } from '../components/Form'
import { useAction } from '../hooks/useAction'
import { readForm } from '../utils/form'
import { todayIso } from '../utils/format'

export default function PatientForm({ onSaved, onCancel }) {
  const { run, pending } = useAction(patientsApi.create, { successText: 'Patient registered', onSuccess: onSaved })

  function handleSubmit(event) {
    event.preventDefault()
    run(readForm(event.currentTarget, ['email', 'date_of_birth']))
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Field label="Full name">
        <input name="full_name" required minLength={2} maxLength={120} autoFocus />
      </Field>
      <div className="form-row">
        <Field label="Phone">
          <input name="phone" type="tel" required minLength={7} maxLength={20} />
        </Field>
        <Field label="Gender">
          <select name="gender" defaultValue="FEMALE">
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>
      </div>
      <div className="form-row">
        <Field label="Email (optional)">
          <input name="email" type="email" maxLength={120} />
        </Field>
        <Field label="Date of birth (optional)">
          <input name="date_of_birth" type="date" max={todayIso()} />
        </Field>
      </div>
      <FormActions onCancel={onCancel} pending={pending} submitLabel="Register patient" />
    </form>
  )
}
