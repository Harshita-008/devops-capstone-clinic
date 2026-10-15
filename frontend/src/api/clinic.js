import { request } from './client'

// The API calls the pets "patients" and the vets "doctors"; the UI uses the pet clinic names.
export const patientsApi = {
  list: (search) => request('/patients', { params: { search } }),
  create: (patient) => request('/patients', { method: 'POST', body: patient }),
  remove: (id) => request(`/patients/${id}`, { method: 'DELETE' }),
}

export const doctorsApi = {
  list: (activeOnly = false) => request('/doctors', { params: { active_only: activeOnly || undefined } }),
  create: (doctor) => request('/doctors', { method: 'POST', body: doctor }),
  update: (id, changes) => request(`/doctors/${id}`, { method: 'PUT', body: changes }),
  remove: (id) => request(`/doctors/${id}`, { method: 'DELETE' }),
}

export const appointmentsApi = {
  list: (filters) => request('/appointments', { params: filters }),
  create: (appointment) => request('/appointments', { method: 'POST', body: appointment }),
  update: (id, changes) => request(`/appointments/${id}`, { method: 'PUT', body: changes }),
}

export const dashboardApi = {
  stats: () => request('/dashboard/stats'),
}
