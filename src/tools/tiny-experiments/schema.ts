import type { ToolSchema } from '../tool.types'

export interface PactPeriodicity {
  type: 'daily' | 'weekly'
  days?: number[] // 0=Sun…6=Sat; only when type is 'weekly'
}

export interface CheckIn {
  date: string // "YYYY-MM-DD"
  accomplished: boolean
}

export type PactStatus = 'active' | 'paused' | 'completed'
export type PactOutcome = 'paused' | 'pivoted' | null

export interface Pact {
  id: string
  action: string
  startDate: string // "YYYY-MM-DD"
  endDate: string // "YYYY-MM-DD"
  periodicity: PactPeriodicity
  status: PactStatus
  outcome: PactOutcome
  parentId: string | null
  checkIns: CheckIn[]
}

export interface TinyExperimentsStore {
  pacts: Pact[]
}

// ── Date utilities ─────────────────────────────────────────────────────────────
// Never use new Date().toISOString().slice(0,10) — that's UTC and wrong for
// users in negative-offset timezones late at night.

export function toLocalDateString(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA') // en-CA locale always formats as YYYY-MM-DD
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

// Parse a stored "YYYY-MM-DD" string as local midnight, not UTC
export function parseLocalDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

// ── Scheduling utilities ───────────────────────────────────────────────────────

export function isScheduledDay(dateStr: string, periodicity: PactPeriodicity): boolean {
  if (periodicity.type === 'daily') return true
  const dow = parseLocalDate(dateStr).getDay() // 0=Sun…6=Sat (local)
  return (periodicity.days ?? []).includes(dow)
}

export function isExpired(pact: Pact): boolean {
  return toLocalDateString() > pact.endDate
}

export function getPactStats(pact: Pact): {
  total: number
  accomplished: number
  missed: number
  unmarked: number
} {
  const today = toLocalDateString()
  // Only count scheduled days up to today (or endDate if the pact is expired)
  const ceiling = pact.endDate < today ? pact.endDate : today

  let total = 0
  const cur = parseLocalDate(pact.startDate)

  while (toLocalDateString(cur) <= ceiling) {
    if (isScheduledDay(toLocalDateString(cur), pact.periodicity)) {
      total++
    }
    cur.setDate(cur.getDate() + 1)
  }

  const accomplished = pact.checkIns.filter(c => c.accomplished).length
  const missed = pact.checkIns.filter(c => !c.accomplished).length
  const unmarked = Math.max(0, total - pact.checkIns.length)

  return { total, accomplished, missed, unmarked }
}

export function canPersist(pact: Pact): boolean {
  if (!isExpired(pact)) return false
  return getPactStats(pact).unmarked === 0
}

export function maxEndDate(): string {
  return toLocalDateString(addMonths(new Date(), 4))
}

// ── ToolSchema ─────────────────────────────────────────────────────────────────

function isValidPact(p: unknown): p is Pact {
  if (!p || typeof p !== 'object') return false
  const o = p as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.action === 'string' &&
    typeof o.startDate === 'string' &&
    typeof o.endDate === 'string' &&
    typeof o.status === 'string' &&
    Array.isArray(o.checkIns)
  )
}

const schema: ToolSchema<TinyExperimentsStore> = {
  defaultData: { pacts: [] },
  serialize: (data) => JSON.stringify(data),
  deserialize: (raw) => {
    try {
      const parsed = JSON.parse(raw) as { pacts: unknown[] }
      return {
        pacts: Array.isArray(parsed.pacts) ? parsed.pacts.filter(isValidPact) : [],
      }
    } catch {
      return { pacts: [] }
    }
  },
}

export default schema
