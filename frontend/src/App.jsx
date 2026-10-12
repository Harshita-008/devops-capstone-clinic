import { useEffect, useState } from 'react'

import Sidebar from './components/Sidebar'
import ToastProvider from './components/ToastProvider'
import { PAGES } from './pages/registry'

// The current page is kept in the URL hash so refresh and the back button work.
const pageFromHash = () => PAGES.find((page) => `#${page.id}` === window.location.hash)?.id ?? PAGES[0].id

export default function App() {
  const [current, setCurrent] = useState(pageFromHash)

  useEffect(() => {
    const syncWithHash = () => setCurrent(pageFromHash())
    window.addEventListener('hashchange', syncWithHash)
    return () => window.removeEventListener('hashchange', syncWithHash)
  }, [])

  const navigate = (id) => {
    window.location.hash = id
  }
  const Page = PAGES.find((page) => page.id === current).component

  return (
    <ToastProvider>
      <div className="layout">
        <Sidebar pages={PAGES} current={current} onNavigate={navigate} />
        <main className="content">
          <Page onNavigate={navigate} />
        </main>
      </div>
    </ToastProvider>
  )
}
