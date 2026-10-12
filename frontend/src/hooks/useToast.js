import { createContext, useContext } from 'react'

export const ToastContext = createContext(() => {})

/** Returns `notify(text, type)` to show a short message; type is 'success' or 'error'. */
export function useToast() {
  return useContext(ToastContext)
}
