import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToolData } from '../../store/journal'
import type { ToolProps } from '../tool.types'
import wealthQuizTool from './index'
import { computeScores, type WealthQuizResult, type WealthQuizStore } from './schema'

function randomId() { return Math.random().toString(36).slice(2) }
function todayDate() { return new Date().toISOString().slice(0, 10) }

// ─── Quiz data ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'time',      labelKey: 'wealth_quiz.cat_time' },
  { key: 'social',    labelKey: 'wealth_quiz.cat_social' },
  { key: 'mental',    labelKey: 'wealth_quiz.cat_mental' },
  { key: 'physical',  labelKey: 'wealth_quiz.cat_physical' },
  { key: 'financial', labelKey: 'wealth_quiz.cat_financial' },
] as const

const QUESTIONS_KEYS = [
  // Time (0-4)
  'wealth_quiz.q_t1', 'wealth_quiz.q_t2', 'wealth_quiz.q_t3', 'wealth_quiz.q_t4', 'wealth_quiz.q_t5',
  // Social (5-9)
  'wealth_quiz.q_s1', 'wealth_quiz.q_s2', 'wealth_quiz.q_s3', 'wealth_quiz.q_s4', 'wealth_quiz.q_s5',
  // Mental (10-14)
  'wealth_quiz.q_m1', 'wealth_quiz.q_m2', 'wealth_quiz.q_m3', 'wealth_quiz.q_m4', 'wealth_quiz.q_m5',
  // Physical (15-19)
  'wealth_quiz.q_p1', 'wealth_quiz.q_p2', 'wealth_quiz.q_p3', 'wealth_quiz.q_p4', 'wealth_quiz.q_p5',
  // Financial (20-24)
  'wealth_quiz.q_f1', 'wealth_quiz.q_f2', 'wealth_quiz.q_f3', 'wealth_quiz.q_f4', 'wealth_quiz.q_f5',
]

const LIKERT_KEYS = [
  'wealth_quiz.strongly_disagree',
  'wealth_quiz.disagree',
  'wealth_quiz.neutral',
  'wealth_quiz.agree',
  'wealth_quiz.strongly_agree',
]

// ─── Radar / Diamond chart ───────────────────────────────────────────────────

interface RadarChartProps {
  scores: { time: number; social: number; mental: number; physical: number; financial: number }
  size?: number
}

function RadarChart({ scores, size = 300 }: RadarChartProps) {
  const { t } = useTranslation()
  const cx = size / 2
  const cy = size / 2
  const maxR = (size / 2) * 0.60

  // 5 axes, starting from top (−90°), clockwise
  const axes = [
    { key: 'time',      labelKey: 'wealth_quiz.cat_time',      value: scores.time },
    { key: 'social',    labelKey: 'wealth_quiz.cat_social',    value: scores.social },
    { key: 'mental',    labelKey: 'wealth_quiz.cat_mental',    value: scores.mental },
    { key: 'physical',  labelKey: 'wealth_quiz.cat_physical',  value: scores.physical },
    { key: 'financial', labelKey: 'wealth_quiz.cat_financial', value: scores.financial },
  ]

  function polarToXY(angle: number, r: number) {
    const rad = (angle - 90) * (Math.PI / 180)
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const n = axes.length
  const axisAngles = axes.map((_, i) => (360 / n) * i)

  // Grid rings at 1,2,3,4,5
  const gridRings = [1, 2, 3, 4, 5].map(level => {
    const r = (level / 5) * maxR
    return axisAngles.map(a => polarToXY(a, r)).map(p => `${p.x},${p.y}`).join(' ')
  })

  // Data polygon
  const dataPoints = axes.map((ax, i) => {
    const r = (ax.value / 5) * maxR
    return polarToXY(axisAngles[i], r)
  })
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'

  // Label positions — push further out
  const labelR = maxR + 28
  const labels = axes.map((ax, i) => {
    const { x, y } = polarToXY(axisAngles[i], labelR)
    return { label: t(ax.labelKey), x, y }
  })

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="mx-auto">
      {/* Grid rings */}
      {gridRings.map((pts, ri) => (
        <polygon key={ri} points={pts}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={ri === 4 ? 1.5 : 0.8}
          opacity={0.8}
        />
      ))}

      {/* Axis lines */}
      {axisAngles.map((angle, i) => {
        const end = polarToXY(angle, maxR)
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
          stroke="var(--color-border)" strokeWidth={0.8} opacity={0.6} />
      })}

      {/* Data polygon */}
      <path d={dataPath}
        fill="var(--color-primary)"
        fillOpacity={0.18}
        stroke="var(--color-primary)"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4}
          fill="var(--color-primary)"
          stroke="var(--color-bg)"
          strokeWidth={2}
        />
      ))}

      {/* Score labels on points */}
      {dataPoints.map((p, i) => {
        const score = axes[i].value
        const angle = axisAngles[i]
        const offset = 14
        const rad = (angle - 90) * (Math.PI / 180)
        const lx = p.x + offset * Math.cos(rad)
        const ly = p.y + offset * Math.sin(rad)
        return (
          <text key={i} x={lx} y={ly}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={10} fontWeight="700"
            fill="var(--color-primary)">
            {score.toFixed(1)}
          </text>
        )
      })}

      {/* Axis labels */}
      {labels.map((l, i) => (
        <text key={i} x={l.x} y={l.y}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={11} fontWeight={600}
          fill="var(--color-text)">
          {l.label}
        </text>
      ))}
    </svg>
  )
}

// ─── Score bar ───────────────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = ((value - 1) / 4) * 100
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span style={{ color: 'var(--color-text)' }}>{label}</span>
        <span style={{ color: 'var(--color-primary)' }} className="font-bold">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'var(--color-primary)' }} />
      </div>
    </div>
  )
}

// ─── Result view ─────────────────────────────────────────────────────────────

function ResultView({ result, onRetake }: { result: WealthQuizResult; onRetake: () => void }) {
  const { t } = useTranslation()
  const { scores } = result
  const d = new Date(result.date + 'T12:00:00')
  const dateLabel = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="rounded-2xl border p-5 space-y-4"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
            {t('wealth_quiz.your_results')}
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{dateLabel}</p>
        </div>

        <RadarChart scores={scores} />

        <div className="space-y-3 pt-2">
          {CATEGORIES.map(cat => (
            <ScoreBar key={cat.key} label={t(cat.labelKey)} value={scores[cat.key]} />
          ))}
        </div>
      </div>

      <button
        onClick={onRetake}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: 'var(--color-primary)' }}>
        {t('wealth_quiz.retake')}
      </button>
    </div>
  )
}

// ─── Past result card ─────────────────────────────────────────────────────────

function PastResultCard({ result, onView }: { result: WealthQuizResult; onView: () => void }) {
  const { t } = useTranslation()
  const d = new Date(result.date + 'T12:00:00')
  const dateLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  const { scores } = result
  const total = (scores.time + scores.social + scores.mental + scores.physical + scores.financial) / 5

  return (
    <button
      onClick={onView}
      className="w-full rounded-xl border px-4 py-3 text-left flex items-center justify-between gap-3"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{dateLabel}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {t('wealth_quiz.overall')}: {total.toFixed(1)} / 5
        </p>
      </div>
      <span style={{ color: 'var(--color-text-muted)' }}>›</span>
    </button>
  )
}

// ─── Quiz form ───────────────────────────────────────────────────────────────

function QuizForm({ onComplete }: { onComplete: (answers: number[]) => void }) {
  const { t } = useTranslation()
  const [answers, setAnswers] = useState<(number | null)[]>(Array(25).fill(null))
  const [currentCat, setCurrentCat] = useState(0)

  const catStart = currentCat * 5
  const catQuestions = QUESTIONS_KEYS.slice(catStart, catStart + 5)
  const catAnswers = answers.slice(catStart, catStart + 5)
  const catComplete = catAnswers.every(a => a !== null)
  const isLast = currentCat === 4

  function setAnswer(qIdx: number, val: number) {
    setAnswers(prev => {
      const next = [...prev]
      next[catStart + qIdx] = val
      return next
    })
  }

  function handleNext() {
    if (!catComplete) return
    if (isLast) {
      onComplete(answers as number[])
    } else {
      setCurrentCat(c => c + 1)
    }
  }

  const progress = Math.round((answers.filter(a => a !== null).length / 25) * 100)

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span>{t(CATEGORIES[currentCat].labelKey)}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: 'var(--color-primary)' }} />
        </div>
        {/* Category dots */}
        <div className="flex gap-1.5 pt-1">
          {CATEGORIES.map((cat, i) => (
            <div key={cat.key} className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{
                background: i < currentCat
                  ? 'var(--color-success)'
                  : i === currentCat
                    ? 'var(--color-primary)'
                    : 'var(--color-border)',
              }} />
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="rounded-2xl border p-4 space-y-6"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <h2 className="text-base font-bold text-center" style={{ color: 'var(--color-primary)' }}>
          {t(CATEGORIES[currentCat].labelKey)}
        </h2>

        {catQuestions.map((qKey, qi) => (
          <div key={qKey} className="space-y-3">
            <p className="text-sm leading-snug" style={{ color: 'var(--color-text)' }}>
              <span className="font-semibold mr-1" style={{ color: 'var(--color-text-muted)' }}>
                {catStart + qi + 1}.
              </span>
              {t(qKey)}
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => setAnswer(qi, val)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-150"
                  style={{
                    background: catAnswers[qi] === val ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                    borderColor: catAnswers[qi] === val ? 'var(--color-primary)' : 'var(--color-border)',
                    color: catAnswers[qi] === val ? '#fff' : 'var(--color-text)',
                  }}>
                  {val}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span>{t(LIKERT_KEYS[0])}</span>
              <span>{t(LIKERT_KEYS[4])}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={!catComplete}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity duration-200"
        style={{
          background: 'var(--color-primary)',
          opacity: catComplete ? 1 : 0.4,
          cursor: catComplete ? 'pointer' : 'not-allowed',
        }}>
        {isLast ? t('wealth_quiz.see_results') : t('wealth_quiz.next_section')}
      </button>

      {currentCat > 0 && (
        <button
          onClick={() => setCurrentCat(c => c - 1)}
          className="w-full py-2 text-sm"
          style={{ color: 'var(--color-text-muted)' }}>
          ← {t('wealth_quiz.back')}
        </button>
      )}
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

type View = { type: 'list' } | { type: 'quiz' } | { type: 'result'; result: WealthQuizResult }

export default function WealthQuizPage(_props: ToolProps) {
  const { t } = useTranslation()
  const [data, save] = useToolData<WealthQuizStore>(wealthQuizTool)
  const [view, setView] = useState<View>({ type: 'list' })

  const sorted = [...data.results].sort((a, b) => b.date.localeCompare(a.date))
  const latest = sorted[0]

  async function handleComplete(answers: number[]) {
    const scores = computeScores(answers)
    const result: WealthQuizResult = {
      id: randomId(),
      date: todayDate(),
      answers,
      scores,
    }
    await save({ results: [result, ...data.results] })
    setView({ type: 'result', result })
  }

  if (view.type === 'quiz') {
    return <QuizForm onComplete={handleComplete} />
  }

  if (view.type === 'result') {
    return (
      <ResultView
        result={view.result}
        onRetake={() => setView({ type: 'quiz' })}
      />
    )
  }

  // List view
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {latest ? (
        <>
          <div className="rounded-2xl border p-5 space-y-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="text-center space-y-0.5">
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                {t('wealth_quiz.last_result')}
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {new Date(latest.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <RadarChart scores={latest.scores} />
            <div className="space-y-3">
              {CATEGORIES.map(cat => (
                <ScoreBar key={cat.key} label={t(cat.labelKey)} value={latest.scores[cat.key]} />
              ))}
            </div>
          </div>

          <button
            onClick={() => setView({ type: 'quiz' })}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--color-primary)' }}>
            {t('wealth_quiz.retake')}
          </button>

          {sorted.length > 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}>
                {t('wealth_quiz.history')}
              </h3>
              {sorted.slice(1).map(r => (
                <PastResultCard key={r.id} result={r}
                  onView={() => setView({ type: 'result', result: r })} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border p-6 text-center space-y-4"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="text-4xl">💎</div>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
              {t('wealth_quiz.start_title')}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {t('wealth_quiz.start_body')}
            </p>
          </div>
          <button
            onClick={() => setView({ type: 'quiz' })}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--color-primary)' }}>
            {t('wealth_quiz.start_btn')}
          </button>
        </div>
      )}
    </div>
  )
}
