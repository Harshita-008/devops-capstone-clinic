import Icon from './Icon'

// Decorative paw prints walking across the greeting banner.
const STEPS = [
  { right: 40, top: 26, rotate: 18, size: 30 },
  { right: 92, top: 70, rotate: -8, size: 26 },
  { right: 46, top: 116, rotate: 22, size: 30 },
  { right: 100, top: 158, rotate: -4, size: 26 },
]

export default function PawTrail() {
  return (
    <div className="paw-trail" aria-hidden="true">
      {STEPS.map((step, index) => (
        <span
          key={index}
          style={{ right: step.right, top: step.top, transform: `rotate(${step.rotate}deg)`, opacity: 0.3 + index * 0.12 }}
        >
          <Icon name="paw" size={step.size} filled />
        </span>
      ))}
    </div>
  )
}
