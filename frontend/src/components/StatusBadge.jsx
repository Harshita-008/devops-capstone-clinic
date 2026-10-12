import { STATUS_LABELS } from '../utils/appointmentStatus'

export default function StatusBadge({ status }) {
  return <span className={`badge status-${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>
}
