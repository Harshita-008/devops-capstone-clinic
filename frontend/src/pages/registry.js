import AppointmentsPage from './AppointmentsPage'
import DashboardPage from './DashboardPage'
import DoctorsPage from './DoctorsPage'
import PatientsPage from './PatientsPage'

export const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', component: DashboardPage },
  { id: 'appointments', label: 'Appointments', icon: 'calendar', component: AppointmentsPage },
  { id: 'patients', label: 'Patients', icon: 'users', component: PatientsPage },
  { id: 'doctors', label: 'Doctors', icon: 'doctor', component: DoctorsPage },
]
