import { useCallback, useEffect, useEffectEvent, useState } from 'react'

/**
 * Loads data with `loader` and reloads whenever `key` changes or `reload()` is called.
 * `key` is a string built from the inputs the loader depends on (for example the active filters).
 */
export function useApi(loader, key = '') {
  const [result, setResult] = useState({ data: null, error: null, loadedFor: null })
  const [version, setVersion] = useState(0)
  const requestId = `${key}#${version}`
  const load = useEffectEvent(loader)

  useEffect(() => {
    let cancelled = false
    load()
      .then((data) => !cancelled && setResult({ data, error: null, loadedFor: requestId }))
      .catch((error) => !cancelled && setResult((prev) => ({ ...prev, error, loadedFor: requestId })))
    return () => {
      cancelled = true
    }
  }, [requestId])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { data: result.data, error: result.error, loading: result.loadedFor !== requestId, reload }
}
