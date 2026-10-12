const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const timeFormat = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' })

// The API returns clinic local times without a timezone, which the browser parses as local time.
export const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : '-')
export const formatTime = (value) => timeFormat.format(new Date(value))
export const formatDateTime = (value) => `${formatDate(value)}, ${formatTime(value)}`

/** YYYY-MM-DD for today in the browser's timezone, the format date inputs and the API expect. */
export function todayIso() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function ageFrom(dateOfBirth) {
  if (!dateOfBirth) return '-'
  const born = new Date(dateOfBirth)
  const now = new Date()
  const hadBirthday =
    now.getMonth() > born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() >= born.getDate())
  return now.getFullYear() - born.getFullYear() - (hadBirthday ? 0 : 1)
}

export const initials = (name) =>
  name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
