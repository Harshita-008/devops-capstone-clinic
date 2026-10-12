export const STATUSES = ['SCHEDULED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED']

export const STATUS_LABELS = {
  SCHEDULED: 'Scheduled',
  CHECKED_IN: 'Checked in',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

// Front desk actions allowed from each status; mirrors the rules enforced by the API.
export const NEXT_ACTIONS = {
  SCHEDULED: [
    { label: 'Check in', status: 'CHECKED_IN' },
    { label: 'Cancel', status: 'CANCELLED', danger: true },
  ],
  CHECKED_IN: [{ label: 'Complete', status: 'COMPLETED' }],
  COMPLETED: [],
  CANCELLED: [],
}
