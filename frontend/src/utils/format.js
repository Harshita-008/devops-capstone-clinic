const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const longDateFormat = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
const timeFormat = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' })

// API times have no timezone, so the browser reads them as local time.
export const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : '-')
export const formatLongDate = (value) => longDateFormat.format(new Date(value))
export const formatTime = (value) => timeFormat.format(new Date(value))

/** Today as YYYY-MM-DD in the browser's timezone. */
export function todayIso() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function greeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/** Pet ages read better in months for young animals: "5 mos", "3 yrs". */
export function petAge(birthday) {
  if (!birthday) return null
  const born = new Date(birthday)
  const now = new Date()
  const months = (now.getFullYear() - born.getFullYear()) * 12 + now.getMonth() - born.getMonth()
  const fullMonths = now.getDate() < born.getDate() ? months - 1 : months
  if (fullMonths < 12) return `${Math.max(fullMonths, 0)} mo${fullMonths === 1 ? '' : 's'}`
  const years = Math.floor(fullMonths / 12)
  return `${years} yr${years === 1 ? '' : 's'}`
}

export const initials = (name) =>
  name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
