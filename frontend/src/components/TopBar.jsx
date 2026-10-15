import { formatLongDate, todayIso } from '../utils/format'
import Icon from './Icon'

export default function TopBar({ pages, current, onNavigate }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#today" aria-label="ClinicFlow home">
          <span className="brand-mark">
            <Icon name="paw" size={22} filled />
          </span>
          <span className="brand-text">
            <strong>ClinicFlow</strong>
            <small>Pet clinic</small>
          </span>
        </a>

        <nav className="tabs" aria-label="Main">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              className={`tab ${current === page.id ? 'active' : ''}`}
              aria-current={current === page.id ? 'page' : undefined}
              onClick={() => onNavigate(page.id)}
            >
              <Icon name={page.icon} size={16} />
              <span>{page.label}</span>
            </button>
          ))}
        </nav>

        <span className="today-chip">{formatLongDate(todayIso())}</span>
      </div>
    </header>
  )
}
