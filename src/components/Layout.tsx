import { BookOpen, ChevronLeft, ChevronRight, Cog, Moon, Settings, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { SUPPORTED_LANGUAGES } from '../i18n'
import { useSidebarState } from '../hooks/useSidebarState'
import { getPeriodLabel } from '../tools/periodicity'
import { registry } from '../tools/registry'
import type { Periodicity } from '../tools/tool.types'
import BottomNav from './BottomNav'
import FabSpeedDial from './FabSpeedDial'
import Sidebar from './Sidebar'
import ToolSettingsDrawer from './ToolSettingsDrawer'
import ToolsDrawer from './ToolsDrawer'

type Theme = 'system' | 'light' | 'dark'

function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('jrnl_theme') as Theme) ?? 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
    localStorage.setItem('jrnl_theme', theme)
  }, [theme])

  return [theme, setThemeState]
}

interface LayoutProps {
  title: string
  children: React.ReactNode
  periodicity: Periodicity
  periodKey: string | null
  periodOffset: number
  onPeriodChange: (offset: number) => void
}

export default function Layout({ title, children, periodicity, periodKey, periodOffset, onPeriodChange }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [theme, setTheme] = useTheme()
  const { collapsed, toggle } = useSidebarState()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toolSettingsOpen, setToolSettingsOpen] = useState(false)

  const isHome = location.pathname === '/'
  const isSettings = location.pathname === '/settings'
  const hasPeriodNav = periodicity !== 'ongoing' && periodKey !== null
  const activeTool = registry.find((tool) => tool.route === location.pathname) ?? null

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')
  }

  const themeIcon = theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />

  const currentLangIdx = SUPPORTED_LANGUAGES.findIndex((l) => l.code === i18n.resolvedLanguage) ?? 0
  const currentLang = SUPPORTED_LANGUAGES[currentLangIdx < 0 ? 0 : currentLangIdx]

  function cycleLanguage() {
    const next = SUPPORTED_LANGUAGES[(currentLangIdx + 1) % SUPPORTED_LANGUAGES.length]
    i18n.changeLanguage(next.code)
  }

  const navItems = [
    { routeMatch: '/', label: t('nav.tools'), icon: <BookOpen className="w-5 h-5" /> },
    ...registry.map((tool) => ({
      routeMatch: tool.route,
      label: t(tool.name),
      icon: <span className="text-base leading-none">{tool.icon}</span>,
    })),
    { routeMatch: '/settings', label: t('nav.settings'), icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Sidebar collapsed={collapsed} onToggle={toggle} navItems={navItems} />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-10 flex items-center px-4 h-14 gap-2 border-b"
          style={{ background: 'var(--color-nav-bg)', borderColor: 'var(--color-border)' }}
        >
          {!isHome && !isSettings && (
            <button
              onClick={() => navigate('/')}
              className="p-1 rounded-lg"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label={t('aria.back')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <h1 className="flex-1 font-semibold text-base truncate" style={{ color: 'var(--color-text)' }}>
            {title}
          </h1>

          {activeTool && (
            <button
              onClick={() => setToolSettingsOpen(true)}
              className="p-2 rounded-lg"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label={t('aria.tool_settings')}
            >
              <Cog className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={cycleLanguage}
            aria-label={t('aria.select_language')}
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border outline-none cursor-pointer"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span className="text-sm leading-none">{currentLang.flag}</span>
            <span>{currentLang.label}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label={t('aria.toggle_theme')}
          >
            {themeIcon}
          </button>
        </header>

        {/* Period navigation */}
        {hasPeriodNav && (
          <div
            className="flex items-center justify-between px-4 py-2 border-b"
            style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={() => onPeriodChange(periodOffset - 1)}
              className="p-1 rounded-lg"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label={t('aria.prev_period')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {getPeriodLabel(periodicity, periodKey)}
            </span>

            <button
              onClick={() => onPeriodChange(Math.min(periodOffset + 1, 0))}
              className="p-1 rounded-lg disabled:opacity-30"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label={t('aria.next_period')}
              disabled={periodOffset >= 0}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 lg:pb-6">
          {children}
        </main>

        <BottomNav onOpenDrawer={() => setDrawerOpen(true)} />
      </div>

      {drawerOpen && <ToolsDrawer onClose={() => setDrawerOpen(false)} />}
      {toolSettingsOpen && activeTool && (
        <ToolSettingsDrawer tool={activeTool} onClose={() => setToolSettingsOpen(false)} />
      )}
      <FabSpeedDial />
    </div>
  )
}
