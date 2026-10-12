import { useState } from 'react'

import { useToast } from './useToast'

/**
 * Wraps a write call (create, update, delete): tracks the pending state, shows a toast with
 * the API's own error message on failure, and runs `onSuccess` when the call succeeds.
 */
export function useAction(action, { successText, onSuccess } = {}) {
  const notify = useToast()
  const [pending, setPending] = useState(false)

  async function run(...args) {
    setPending(true)
    try {
      const result = await action(...args)
      if (successText) notify(successText)
      onSuccess?.(result)
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setPending(false)
    }
  }

  return { run, pending }
}
