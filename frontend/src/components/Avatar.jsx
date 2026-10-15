import { initials } from '../utils/format'

const TONES = ['#FFE08A', '#FFD3B6', '#CFEBD6', '#D8E6FF', '#F2DAF4', '#FFE1DC']

/** Soft coloured initials badge; the same name always gets the same colour. */
export default function Avatar({ name, size = 'md' }) {
  const tone = TONES[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % TONES.length]
  return (
    <span className={`avatar avatar-${size}`} style={{ background: tone }} aria-hidden="true">
      {initials(name)}
    </span>
  )
}
