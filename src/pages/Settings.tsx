import { Download, LogOut, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { deriveKey, getSalt, reencryptAll, verifySentinel } from '../crypto/vault'
import { MAX_FAVORITES, useFavorites } from '../hooks/useFavorites'
import { useInstallPrompt } from '../hooks/usePWA'
import { useJournalContext } from '../store/journal'
import { registry } from '../tools/registry'

function FavoriteToolsSection() {
  const { t } = useTranslation()
  const { favorites, toggle } = useFavorites()

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: 'var(--color-text-muted)' }}>
        {t('settings.section_favorites')}
      </h2>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {t('settings.favorites_hint')}
      </p>
      <div className="flex flex-wrap gap-2">
        {registry.map((tool) => {
          const selected = favorites.includes(tool.id)
          const disabled = !selected && favorites.length >= MAX_FAVORITES
          return (
            <button
              key={tool.id}
              onClick={() => !disabled && toggle(tool.id)}
              disabled={disabled}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: selected ? 'var(--color-primary)' : 'var(--color-surface)',
                color: selected ? '#fff' : 'var(--color-text)',
                borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            >
              <span className="text-base leading-none">{tool.icon}</span>
              {t(tool.name)}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function ChangePassphrase() {
  const { t } = useTranslation()
  const { key, setKey } = useJournalContext()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!key) return
    if (next.length < 4) { setError(t('settings.err_too_short')); return }
    if (next !== confirm) { setError(t('settings.err_mismatch')); return }

    setLoading(true)
    try {
      const salt = getSalt()!
      const currentKey = await deriveKey(current, salt)
      const ok = await verifySentinel(currentKey)
      if (!ok) { setError(t('settings.err_wrong_current')); return }

      const newKey = await reencryptAll(currentKey, next)
      setKey(newKey)
      setSuccess(true)
      setCurrent(''); setNext(''); setConfirm('')
    } catch {
      setError(t('settings.err_generic'))
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { label: t('settings.placeholder_current'), value: current, set: setCurrent },
    { label: t('settings.placeholder_new'), value: next, set: setNext },
    { label: t('settings.placeholder_confirm'), value: confirm, set: setConfirm },
  ]

  return (
    <div className="rounded-xl border p-4 space-y-3"
         style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <h3 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
        {t('settings.change_passphrase_title')}
      </h3>
      {success ? (
        <p className="text-sm" style={{ color: 'var(--color-success)' }}>{t('settings.success_changed')}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          {fields.map((f, i) => (
            <input key={i} type="password" value={f.value}
              onChange={(e) => f.set(e.target.value)} placeholder={f.label} required
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
          ))}
          {error && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: 'var(--color-primary)' }}>
            {loading ? t('settings.btn_changing') : t('settings.btn_change')}
          </button>
        </form>
      )}
    </div>
  )
}

function AppSection() {
  const { t } = useTranslation()
  const { canInstall, install } = useInstallPrompt()

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: 'var(--color-text-muted)' }}>
        {t('settings.section_app')}
      </h2>
      <div className="flex flex-col gap-2">
        {canInstall && (
          <button onClick={install}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--color-primary)' }}>
            <Download className="w-4 h-4" />{t('settings.btn_install')}
          </button>
        )}
        <button onClick={() => window.location.reload()}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
          <RefreshCw className="w-4 h-4" />{t('settings.btn_get_updates')}
        </button>
      </div>
    </section>
  )
}

export default function Settings() {
  const { t } = useTranslation()
  const { clearKey } = useJournalContext()
  const navigate = useNavigate()

  function handleLock() {
    clearKey()
    navigate('/lock')
  }

  return (
    <div className="max-w-lg lg:max-w-2xl mx-auto space-y-6">
      <AppSection />
      <FavoriteToolsSection />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: 'var(--color-text-muted)' }}>
          {t('settings.section_security')}
        </h2>
        <ChangePassphrase />
        <button onClick={handleLock}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
          <LogOut className="w-4 h-4" />{t('settings.btn_lock')}
        </button>
      </section>

      <section className="space-y-1 pb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: 'var(--color-text-muted)' }}>
          {t('settings.section_about')}
        </h2>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {t('settings.about_text')}
        </p>
      </section>
    </div>
  )
}
