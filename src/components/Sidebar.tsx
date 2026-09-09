import { PanelLeft, PanelLeftClose } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

interface NavItem {
  routeMatch: string
  label: string
  icon: React.ReactNode
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  navItems: NavItem[]
}

export default function Sidebar({ collapsed, onToggle, navItems }: SidebarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside
      className="hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen border-r overflow-hidden"
      style={{
        width: collapsed ? '4rem' : '14rem',
        transition: 'width 200ms ease',
        background: 'var(--color-nav-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div
        className="flex items-center justify-end px-2 py-3 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={onToggle}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label={collapsed ? t('aria.expand_sidebar') : t('aria.collapse_sidebar')}
        >
          {collapsed
            ? <PanelLeft className="w-5 h-5" />
            : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const active = item.routeMatch === '/'
            ? location.pathname === '/'
            : location.pathname === item.routeMatch

          return (
            <button
              key={item.routeMatch}
              onClick={() => navigate(item.routeMatch)}
              aria-current={active ? 'page' : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 mx-0 my-0.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                background: active ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)' : 'transparent',
                paddingLeft: collapsed ? '0' : undefined,
                justifyContent: collapsed ? 'center' : undefined,
              }}
              title={collapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
