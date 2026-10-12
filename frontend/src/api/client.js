// The browser always calls /api; nginx or the Vite dev proxy forwards it to the backend.
const API_BASE = '/api'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

function errorMessage(body, status) {
  const detail = body?.detail
  if (typeof detail === 'string') return detail
  // FastAPI validation errors arrive as a list of { loc, msg } objects.
  if (Array.isArray(detail)) return detail.map((e) => `${e.loc.at(-1)}: ${e.msg}`).join(', ')
  return `Request failed with status ${status}`
}

export async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(API_BASE + path, window.location.origin)
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  }

  const response = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(errorMessage(data, response.status), response.status)
  return data
}
