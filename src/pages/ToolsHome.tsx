import { HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import HowToUseDrawer from '../components/HowToUseDrawer'
import { useToolData } from '../store/journal'
import { hasEntryForCurrentPeriod, periodicityBadgeKey } from '../tools/periodicity'
import { registry } from '../tools/registry'
import type { JournalTool } from '../tools/tool.types'

function ToolCard({ tool }: { tool: JournalTool }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showDrawer, setShowDrawer] = useState(false)
  const [data] = useToolData(tool)
  const hasEntry = hasEntryForCurrentPeriod(tool.periodicity, data)
  const name = t(tool.name)

  return (
    <>
      <div
        className="rounded-2xl border p-4 flex flex-col gap-3"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{tool.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                  {name}
                </h2>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: hasEntry ? 'var(--color-success)' : 'var(--color-border)' }}
                  title={hasEntry ? t('home.status_logged') : t('home.status_not_logged')}
                />
              </div>
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}
              >
                {t(periodicityBadgeKey(tool.periodicity))}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowDrawer(true)}
            className="p-1.5 rounded-lg flex-shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label={t('aria.how_to_use')}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {t(tool.description.summary)}
        </p>

        {tool.description.sourceBook && (
          <a
            href={tool.description.sourceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs"
            style={{ color: 'var(--color-primary)' }}
          >
            {tool.description.sourceBook} ↗
          </a>
        )}

        <button
          onClick={() => navigate(tool.route)}
          className="mt-auto w-full py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          {t('home.btn_open')}
        </button>
      </div>

      {showDrawer && (
        <HowToUseDrawer
          title={t('home.how_to_use_title', { name })}
          markdown={t(tool.description.howToUse)}
          onClose={() => setShowDrawer(false)}
        />
      )}
    </>
  )
}

export default function ToolsHome() {
  const { t } = useTranslation()
  return (
    <div className="max-w-lg lg:max-w-2xl mx-auto space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
      <p className="text-sm lg:col-span-2" style={{ color: 'var(--color-text-muted)' }}>
        {t('home.intro')}
      </p>
      {registry.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  )
}
