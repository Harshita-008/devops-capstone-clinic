/** Renders loading, error and empty states so pages only describe the happy path. */
export default function DataState({ loading, error, isEmpty, emptyText, onRetry, children }) {
  if (error) {
    return (
      <div className="state state-error" role="alert">
        <p>Could not load data: {error.message}</p>
        {onRetry && (
          <button type="button" className="btn btn-secondary" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    )
  }
  if (loading && isEmpty) return <div className="state">Loading...</div>
  if (isEmpty) return <div className="state">{emptyText}</div>
  return children
}
