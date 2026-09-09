import { BookOpen, Menu, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

interface BottomNavProps {
  onOpenDrawer: () => void
}

export default function BottomNav({ onOpenDrawer }: BottomNavProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const isHome = location.pathname === '/'
  const isSettings = location.pathname === '/settings'

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t flex items-stretch lg:hidden"
      style={{ background: 'var(--color-nav-bg)', borderColor: 'var(--color-border)' }}
    >
      <button
        onClick={() => navigate('/')}
        aria-current={isHome ? 'page' : undefined}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors"
        style={{ color: isHome ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
      >
        <BookOpen className="w-5 h-5" />
        <span>{t('nav.tools')}</span>
      </button>

      <button
        onClick={onOpenDrawer}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
        aria-label={t('aria.open_tools_drawer')}
      >
        <Menu className="w-5 h-5" />
        <span>{t('nav.open_tools')}</span>
      </button>

      <button
        onClick={() => navigate('/settings')}
        aria-current={isSettings ? 'page' : undefined}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors"
        style={{ color: isSettings ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
      >
        <Settings className="w-5 h-5" />
        <span>{t('nav.settings')}</span>
      </button>
    </nav>
  )
}
