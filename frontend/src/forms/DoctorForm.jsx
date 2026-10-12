import { doctorsApi } from '../api/clinic'
import { Field, FormActions } from '../components/Form'
import { useAction } from '../hooks/useAction'
import { readForm } from '../utils/form'

export default function DoctorForm({ onSaved, onCancel }) {
  const { run, pending } = useAction(doctorsApi.create, { successText: 'Doctor added', onSuccess: onSaved })

  function handleSubmit(event) {
    event.preventDefault()
    run(readForm(event.currentTarget))
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Field label="Full name">
        <input name="full_name" required minLength={2} maxLength={120} placeholder="Dr. " autoFocus />
      </Field>
      <div className="form-row">
        <Field label="Specialization">
          <input name="specialization" required minLength={2} maxLength={80} />
        </Field>
        <Field label="Room">
          <input name="room" maxLength={20} />
        </Field>
      </div>
      <FormActions onCancel={onCancel} pending={pending} submitLabel="Add doctor" />
    </form>
  )
}
