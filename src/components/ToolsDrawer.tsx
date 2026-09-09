import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { registry } from '../tools/registry'

interface ToolsDrawerProps {
  onClose: () => void
}

export default function ToolsDrawer({ onClose }: ToolsDrawerProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  function openTool(route: string) {
    navigate(route)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-y-auto"
        style={{
          background: 'var(--color-surface)',
          maxHeight: '80vh',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-border)' }} />
        </div>

        <div
          className="flex items-center justify-between px-5 pb-3 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
            {t('nav.open_tools')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label={t('aria.close_tools_drawer')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 pb-10 space-y-1">
          {registry.map((tool) => (
            <button
              key={tool.id}
              onClick={() => openTool(tool.route)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
              style={{ color: 'var(--color-text)' }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-secondary)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = ''
              }}
            >
              <span className="text-2xl leading-none">{tool.icon}</span>
              <div>
                <div className="font-medium text-sm">{t(tool.name)}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {t(tool.description.summary)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
