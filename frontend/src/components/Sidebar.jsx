import Icon from './Icon'

export default function Sidebar({ pages, current, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/favicon.svg" alt="" className="brand-logo" />
        <div>
          <strong>ClinicFlow</strong>
          <small>Front desk</small>
        </div>
      </div>
      <nav className="nav">
        {pages.map((page) => (
          <button
            key={page.id}
            type="button"
            className={`nav-item ${current === page.id ? 'active' : ''}`}
            aria-current={current === page.id ? 'page' : undefined}
            onClick={() => onNavigate(page.id)}
          >
            <Icon name={page.icon} />
            <span>{page.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
