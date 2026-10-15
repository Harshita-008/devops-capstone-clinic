const PATHS = {
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  calendar: 'M7 2v3M17 2v3M3 8h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  paw:
    'M3.7 10a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0M7.1 6a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0' +
    'M13.1 6a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0M16.7 10a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0' +
    'M12 12.5c-3 0-6 3.4-6 5.8 0 1.6 1.2 2.4 2.7 2.4 1.3 0 2-.6 3.3-.6s2 .6 3.3.6c1.5 0 2.7-.8 2.7-2.4 0-2.4-3-5.8-6-5.8z',
  stethoscope: 'M5 3v6a5 5 0 0 0 10 0V3M4 3h2M14 3h2M10 14v2a5 5 0 0 0 10 0v-3M20 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6L6 18',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
  door: 'M3 21h18M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M14 12h.01',
}

export default function Icon({ name, size = 18, filled = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
