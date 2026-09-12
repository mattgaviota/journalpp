import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Pact, CheckIn } from './schema'
import { isScheduledDay, toLocalDateString, parseLocalDate } from './schema'

interface Props {
  pact: Pact
  onToggleCheckIn: (date: string) => void
}

function buildMonthGrid(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // Monday-first: Sun=0 → offset 6, Mon=1 → offset 0, …
  const startOffset = (firstDay.getDay() + 6) % 7
  const cells: (string | null)[] = Array(startOffset).fill(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(toLocalDateString(new Date(year, month, d)))
  }
  return cells
}

function ymIndex(year: number, month: number) {
  return year * 12 + month
}

export default function PactCalendar({ pact, onToggleCheckIn }: Props) {
  const { i18n, t } = useTranslation()
  const locale = i18n.language
  const today = toLocalDateString()

  const pactStart = parseLocalDate(pact.startDate)
  const pactEnd = parseLocalDate(pact.endDate)
  const now = new Date()
  // Clamp initial view to pact range
  const clampedInit = now > pactEnd ? pactEnd : now < pactStart ? pactStart : now

  const [viewYear, setViewYear] = useState(clampedInit.getFullYear())
  const [viewMonth, setViewMonth] = useState(clampedInit.getMonth())

  const pactStartYM = ymIndex(pactStart.getFullYear(), pactStart.getMonth())
  const pactEndYM = ymIndex(pactEnd.getFullYear(), pactEnd.getMonth())
  const currentYM = ymIndex(viewYear, viewMonth)
  const canPrev = currentYM > pactStartYM
  const canNext = currentYM < pactEndYM

  function prevMonth() {
    if (!canPrev) return
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (!canNext) return
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  // Mon-first day headers via Intl
  const dayHeaders = Array.from({ length: 7 }, (_, i) => {
    // 2024-01-01 was a Monday; i=0 → Mon, i=6 → Sun
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, 1 + i))
  })

  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(viewYear, viewMonth)
  )

  const cells = buildMonthGrid(viewYear, viewMonth)

  function getCheckIn(date: string): CheckIn | undefined {
    return pact.checkIns.find(c => c.date === date)
  }

  type CellState = 'accomplished' | 'missed' | 'unmarked' | 'future' | 'unscheduled' | 'out-of-range'

  function getCellState(dateStr: string): CellState {
    if (dateStr < pact.startDate || dateStr > pact.endDate) return 'out-of-range'
    if (!isScheduledDay(dateStr, pact.periodicity)) return 'unscheduled'
    if (dateStr > today) return 'future'
    const ci = getCheckIn(dateStr)
    if (!ci) return 'unmarked'
    return ci.accomplished ? 'accomplished' : 'missed'
  }

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          disabled={!canPrev}
          className="p-1.5 rounded-lg transition-opacity disabled:opacity-30"
          style={{ color: 'var(--color-text)' }}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text)' }}>
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          disabled={!canNext}
          className="p-1.5 rounded-lg transition-opacity disabled:opacity-30"
          style={{ color: 'var(--color-text)' }}
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {dayHeaders.map(d => (
          <div
            key={d}
            className="text-center text-xs font-medium py-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={`e-${i}`} className="min-h-[40px] sm:min-h-[52px]" />

          const state = getCellState(dateStr)
          const isToday = dateStr === today
          const interactive = state === 'unmarked' || state === 'accomplished' || state === 'missed'
          const dayNum = parseLocalDate(dateStr).getDate()

          let bg = 'transparent'
          let textColor = 'var(--color-text-muted)'
          let border = 'none'
          let label = String(dayNum)
          let opacity = '1'

          if (state === 'out-of-range' || state === 'unscheduled') {
            opacity = '0.2'
          } else if (state === 'accomplished') {
            bg = 'var(--color-success)'
            textColor = 'white'
            label = '✓'
          } else if (state === 'missed') {
            bg = 'var(--color-danger)'
            textColor = 'white'
            label = '✗'
            opacity = '0.75'
          } else if (state === 'unmarked') {
            border = '1.5px dashed var(--color-border)'
            textColor = 'var(--color-text)'
          } else if (state === 'future') {
            border = '1px solid var(--color-border)'
            textColor = 'var(--color-text-muted)'
          }

          return (
            <button
              key={dateStr}
              onClick={() => interactive && onToggleCheckIn(dateStr)}
              disabled={!interactive}
              className="flex items-center justify-center rounded-lg text-xs font-semibold min-h-[40px] sm:min-h-[52px] transition-transform active:scale-95"
              style={{
                background: bg,
                color: textColor,
                border,
                opacity,
                cursor: interactive ? 'pointer' : 'default',
                outline: isToday && state !== 'accomplished' && state !== 'missed'
                  ? '2px solid var(--color-primary)'
                  : undefined,
                outlineOffset: '1px',
              }}
              aria-label={dateStr}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-4 justify-center flex-wrap">
        {([
          ['var(--color-success)', '1', t('tiny_experiments.legend_done')],
          ['var(--color-danger)', '0.75', t('tiny_experiments.legend_missed')],
          ['transparent', '1', t('tiny_experiments.legend_unmarked')],
        ] as [string, string, string][]).map(([bg, op, label]) => (
          <span
            key={label}
            className="flex items-center gap-1 text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span
              className="w-3.5 h-3.5 rounded inline-block flex-shrink-0"
              style={{
                background: bg,
                opacity: op,
                border: bg === 'transparent' ? '1.5px dashed var(--color-border)' : undefined,
              }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
