import Icon from './Icon'

/** Renders loading, error and empty states so pages only describe the happy path. */
export default function DataState({ loading, error, isEmpty, emptyText, onRetry, children }) {
  if (error) {
    return (
      <div className="state state-error" role="alert">
        <p>Could not load data: {error.message}</p>
        {onRetry && (
          <button type="button" className="btn btn-light" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    )
  }
  if (loading && isEmpty) return <div className="state">Loading...</div>
  if (isEmpty) {
    return (
      <div className="state">
        <Icon name="paw" size={28} filled />
        <p>{emptyText}</p>
      </div>
    )
  }
  return children
}
