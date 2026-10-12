export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

export function FormActions({ onCancel, pending, submitLabel }) {
  return (
    <div className="form-actions">
      <button type="button" className="btn btn-secondary" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Saving...' : submitLabel}
      </button>
    </div>
  )
}
