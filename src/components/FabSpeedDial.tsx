import { Star, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useFavorites } from '../hooks/useFavorites'
import { registry } from '../tools/registry'

export default function FabSpeedDial() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { favorites } = useFavorites()
  const [open, setOpen] = useState(false)

  if (favorites.length === 0) return null

  const favoriteTools = favorites
    .map((id) => registry.find((tool) => tool.id === id))
    .filter(Boolean) as typeof registry

  function openTool(route: string) {
    navigate(route)
    setOpen(false)
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col-reverse items-end gap-3 lg:hidden">
      {open && favoriteTools.map((tool) => (
        <div key={tool.id} className="flex items-center gap-2">
          <span
            className="text-xs font-medium px-2 py-1 rounded-lg pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.65)', color: '#fff' }}
          >
            {t(tool.name)}
          </span>
          <button
            onClick={() => openTool(tool.route)}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-2xl leading-none"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            aria-label={t(tool.name)}
          >
            {tool.icon}
          </button>
        </div>
      ))}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white transition-transform"
        style={{ background: 'var(--color-primary)', transform: open ? 'rotate(45deg)' : 'none' }}
        aria-label={open ? t('aria.close_speed_dial') : t('aria.open_speed_dial')}
        aria-expanded={open}
      >
        {open ? <X className="w-6 h-6" /> : <Star className="w-6 h-6" />}
      </button>
    </div>
  )
}
