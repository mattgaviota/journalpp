import { Download, LogOut, RefreshCw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
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

function RequestToolSection() {
  const { t } = useTranslation()
  const [toolName, setToolName] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('https://formspree.io/f/mzebwylk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ toolName, description, link }),
      })
      const data = await res.json()
      if (!res.ok || data.errors) throw new Error('failed')
      setSuccess(true)
      setToolName('')
      setDescription('')
      setLink('')
    } catch {
      setError(t('settings.request_tool_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: 'var(--color-text-muted)' }}>
        {t('settings.section_request_tool')}
      </h2>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {t('settings.request_tool_hint')}
      </p>
      <div className="rounded-xl border p-4 space-y-3"
           style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        {success ? (
          <p className="text-sm" style={{ color: 'var(--color-success)' }}>{t('settings.request_tool_success')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder={t('settings.request_tool_name')}
              required
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('settings.request_tool_description')}
              required
              rows={3}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={t('settings.request_tool_link')}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            {error && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'var(--color-primary)' }}
            >
              {loading ? t('settings.request_tool_submitting') : t('settings.request_tool_submit')}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

function DeleteDataSection() {
  const { t } = useTranslation()
  const { clearKey } = useJournalContext()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const code = useMemo(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from(crypto.getRandomValues(new Uint8Array(10)))
      .map(b => chars[b % chars.length])
      .join('')
  }, [open]) // regenerate each time the dialog opens

  function openDialog() {
    setInput('')
    setError('')
    setOpen(true)
  }

  function handleDelete() {
    if (input !== code) {
      setError(t('settings.delete_data_code_mismatch'))
      return
    }
    Object.keys(localStorage)
      .filter(k => k.startsWith('jrnl_'))
      .forEach(k => localStorage.removeItem(k))
    clearKey()
    navigate('/lock')
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: 'var(--color-danger)' }}>
        {t('settings.section_danger')}
      </h2>
      <div className="rounded-xl border p-4 space-y-3"
           style={{ background: 'var(--color-surface)', borderColor: 'var(--color-danger)' }}>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {t('settings.delete_data_title')}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {t('settings.delete_data_hint')}
          </p>
        </div>
        <button
          onClick={openDialog}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--color-danger)' }}>
          <Trash2 className="w-4 h-4" />
          {t('settings.delete_data_btn')}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
               style={{ background: 'var(--color-surface)', border: '1px solid var(--color-danger)' }}>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
              {t('settings.delete_data_title')}
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {t('settings.delete_data_hint')}
            </p>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {t('settings.delete_data_confirm_label')}
            </p>
            <div className="text-center py-2 px-4 rounded-lg font-mono text-lg font-bold tracking-widest select-none"
                 style={{ background: 'var(--color-bg)', color: 'var(--color-danger)', userSelect: 'none' }}>
              {code}
            </div>
            <input
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setError('') }}
              onCopy={e => e.preventDefault()}
              onCut={e => e.preventDefault()}
              onPaste={e => e.preventDefault()}
              autoComplete="off"
              spellCheck={false}
              placeholder={code}
              className="w-full px-3 py-2 rounded-lg border text-sm font-mono text-center outline-none tracking-widest"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            {error && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                {t('settings.delete_data_cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: 'var(--color-danger)' }}>
                {t('settings.delete_data_confirm_btn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
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
      <RequestToolSection />

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

      <DeleteDataSection />

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
