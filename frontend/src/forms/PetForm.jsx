import { patientsApi } from '../api/clinic'
import { Field, FormActions } from '../components/Form'
import { useAction } from '../hooks/useAction'
import { readForm } from '../utils/form'
import { todayIso } from '../utils/format'

export default function PetForm({ onSaved, onCancel }) {
  const { run, pending } = useAction(patientsApi.create, { successText: 'Pet registered', onSuccess: onSaved })

  function handleSubmit(event) {
    event.preventDefault()
    run(readForm(event.currentTarget, ['email', 'date_of_birth']))
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <Field label="Pet name">
          <input name="full_name" required minLength={2} maxLength={120} placeholder="Bruno" autoFocus />
        </Field>
        <Field label="Sex">
          <select name="gender" defaultValue="MALE">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Unknown</option>
          </select>
        </Field>
      </div>
      <Field label="Birthday (optional)">
        <input name="date_of_birth" type="date" max={todayIso()} />
      </Field>
      <p className="form-section">Owner contact</p>
      <div className="form-row">
        <Field label="Phone">
          <input name="phone" type="tel" required minLength={7} maxLength={20} />
        </Field>
        <Field label="Email (optional)">
          <input name="email" type="email" maxLength={120} />
        </Field>
      </div>
      <FormActions onCancel={onCancel} pending={pending} submitLabel="Register pet" />
    </form>
  )
}
