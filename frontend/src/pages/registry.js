import AppointmentsPage from './AppointmentsPage'
import DashboardPage from './DashboardPage'
import PetsPage from './PetsPage'
import VetsPage from './VetsPage'

export const PAGES = [
  { id: 'today', label: 'Today', icon: 'sun', component: DashboardPage },
  { id: 'visits', label: 'Visits', icon: 'calendar', component: AppointmentsPage },
  { id: 'pets', label: 'Pets', icon: 'paw', component: PetsPage },
  { id: 'vets', label: 'Vets', icon: 'stethoscope', component: VetsPage },
]
