import { BookOpen, ChevronLeft, ChevronRight, Cog, Moon, Settings, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { SUPPORTED_LANGUAGES } from '../i18n'
import { useSidebarState } from '../hooks/useSidebarState'
import { getPeriodKey, getPeriodLabel, hasPeriodEntry } from '../tools/periodicity'
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

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getMondayOf(d: Date): Date {
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  monday.setHours(0, 0, 0, 0)
  return monday
}

function computeOffset(periodicity: Periodicity, cellDate: Date): number {
  const today = new Date()
  if (periodicity === 'daily') {
    const a = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const b = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate())
    return Math.round((b.getTime() - a.getTime()) / 86400000)
  }
  if (periodicity === 'weekly') {
    const a = getMondayOf(today)
    const b = getMondayOf(cellDate)
    return Math.round((b.getTime() - a.getTime()) / (7 * 86400000))
  }
  if (periodicity === 'monthly') {
    return (cellDate.getFullYear() - today.getFullYear()) * 12 + (cellDate.getMonth() - today.getMonth())
  }
  if (periodicity === 'yearly') {
    return cellDate.getFullYear() - today.getFullYear()
  }
  return 0
}

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

interface PeriodPickerProps {
  periodicity: Periodicity
  entryData: unknown
  currentOffset: number
  onSelect: (offset: number) => void
  onClose: () => void
}

function PeriodPicker({ periodicity, entryData, currentOffset, onSelect, onClose }: PeriodPickerProps) {
  const today = new Date()
  const activeDate = new Date(today)
  if (periodicity === 'daily') activeDate.setDate(today.getDate() + currentOffset)
  else if (periodicity === 'weekly') activeDate.setDate(today.getDate() + currentOffset * 7)
  else if (periodicity === 'monthly') activeDate.setMonth(today.getMonth() + currentOffset)

  const [viewYear, setViewYear] = useState(activeDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(activeDate.getMonth())
  const backdropRef = useRef<HTMLDivElement>(null)

  const cells = buildMonthGrid(viewYear, viewMonth)
  const currentPeriodKey = getPeriodKey(periodicity, today, currentOffset)

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    const futureMonth = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth >= today.getMonth())
    if (futureMonth) return
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const isNextMonthDisabled = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth >= today.getMonth())

  // For weekly: group cells into rows (weeks), check if the whole row has an entry
  const rows: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))

  function getWeekKey(row: (Date | null)[]): string | null {
    const firstReal = row.find((c) => c !== null)
    if (!firstReal) return null
    return getPeriodKey('weekly', firstReal, 0)
  }

  function handleCellClick(cellDate: Date) {
    const offset = computeOffset(periodicity, cellDate)
    if (offset > 0) return
    onSelect(offset)
    onClose()
  }

  function isFuture(cellDate: Date): boolean {
    const cell = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate())
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return cell > todayMidnight
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div
        className="rounded-2xl shadow-xl w-80 p-4"
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            className="p-1 rounded-lg"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{monthLabel}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={nextMonth}
              disabled={isNextMonthDisabled}
              className="p-1 rounded-lg disabled:opacity-30"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="text-center text-xs font-medium py-1" style={{ color: 'var(--color-text-muted)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar rows */}
        {rows.map((row, ri) => {
          const weekKey = periodicity === 'weekly' ? getWeekKey(row) : null
          const isActiveWeek = weekKey !== null && weekKey === currentPeriodKey

          return (
            <div
              key={ri}
              className="grid grid-cols-7 rounded-lg"
              style={isActiveWeek ? { background: 'rgba(34,197,94,0.1)', outline: '1px solid #22c55e' } : undefined}
            >
              {row.map((cellDate, ci) => {
                if (!cellDate) return <div key={ci} />

                const inCurrentMonth = cellDate.getMonth() === viewMonth
                const cellKey = getPeriodKey(periodicity, cellDate, 0)
                const hasEntry = hasPeriodEntry(entryData, cellKey)
                const isCurrentPeriod = cellKey !== null && cellKey === currentPeriodKey
                const future = isFuture(cellDate)
                const isToday = cellKey === getPeriodKey('daily', today, 0)

                const bgStyle = isCurrentPeriod
                  ? { background: '#22c55e', color: '#fff' }
                  : isToday && periodicity !== 'daily'
                  ? { background: 'var(--color-bg-secondary)' }
                  : {}

                return (
                  <button
                    key={ci}
                    onClick={() => !future && handleCellClick(cellDate)}
                    disabled={future}
                    className="flex flex-col items-center py-1 rounded-lg disabled:cursor-default"
                    style={{
                      opacity: future ? 0.25 : inCurrentMonth ? 1 : 0.35,
                      color: isCurrentPeriod ? '#fff' : 'var(--color-text)',
                      ...bgStyle,
                    }}
                  >
                    <span className="text-xs leading-none">{cellDate.getDate()}</span>
                    {hasEntry ? (
                      <span
                        className="mt-0.5 rounded-full"
                        style={{
                          width: 4,
                          height: 4,
                          background: isCurrentPeriod ? 'rgba(255,255,255,0.8)' : '#22c55e',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <span style={{ width: 4, height: 4, display: 'block' }} />
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface LayoutProps {
  title: string
  children: React.ReactNode
  periodicity: Periodicity
  periodKey: string | null
  periodOffset: number
  onPeriodChange: (offset: number) => void
  entryData?: unknown
}

export default function Layout({ title, children, periodicity, periodKey, periodOffset, onPeriodChange, entryData }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [theme, setTheme] = useTheme()
  const { collapsed, toggle } = useSidebarState()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toolSettingsOpen, setToolSettingsOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

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
            className="flex items-center justify-center px-4 py-2 border-b gap-1"
            style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={() => onPeriodChange(periodOffset - 1)}
              className="p-1 rounded-lg"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label={t('aria.prev_period')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setPickerOpen(true)}
              className="px-3 py-1 rounded-lg text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              {getPeriodLabel(periodicity, periodKey)}
            </button>

            <button
              onClick={() => onPeriodChange(Math.min(periodOffset + 1, 0))}
              className="p-1 rounded-lg disabled:opacity-30"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label={t('aria.next_period')}
              disabled={periodOffset >= 0}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {pickerOpen && hasPeriodNav && (
          <PeriodPicker
            periodicity={periodicity}
            entryData={entryData}
            currentOffset={periodOffset}
            onSelect={onPeriodChange}
            onClose={() => setPickerOpen(false)}
          />
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
