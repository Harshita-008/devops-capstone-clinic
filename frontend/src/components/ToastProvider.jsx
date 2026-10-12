import { useCallback, useRef, useState } from 'react'

import { ToastContext } from '../hooks/useToast'

const TOAST_DURATION_MS = 4000
const MAX_VISIBLE = 3

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const notify = useCallback((text, type = 'success') => {
    const id = ++nextId.current
    setToasts((current) => [...current, { id, text, type }].slice(-MAX_VISIBLE))
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), TOAST_DURATION_MS)
  }, [])

  return (
    <ToastContext value={notify}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.text}
          </div>
        ))}
      </div>
    </ToastContext>
  )
}
