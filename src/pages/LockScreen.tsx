import { BookOpen, Lock } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  deriveKey,
  generateSalt,
  getSalt,
  isFirstRun,
  storeSalt,
  verifySentinel,
  writeSentinel,
} from '../crypto/vault'
import { useJournalContext } from '../store/journal'

export default function LockScreen() {
  const { t } = useTranslation()
  const { setKey } = useJournalContext()
  const navigate = useNavigate()
  const firstRun = isFirstRun()

  const [passphrase, setPassphrase] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (firstRun) {
        if (passphrase.length < 4) { setError(t('lock.err_too_short')); return }
        if (passphrase !== confirm) { setError(t('lock.err_mismatch')); return }
        const salt = await generateSalt()
        storeSalt(salt)
        const key = await deriveKey(passphrase, salt)
        await writeSentinel(key)
        setKey(key)
        navigate('/')
      } else {
        const salt = getSalt()!
        const key = await deriveKey(passphrase, salt)
        const ok = await verifySentinel(key)
        if (!ok) { setError(t('lock.err_wrong')); return }
        setKey(key)
        navigate('/')
      }
    } catch {
      setError(t('lock.err_generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
         style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
               style={{ background: 'var(--color-primary)' }}>
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {t('lock.app_name')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {firstRun ? t('lock.subtitle_setup') : t('lock.subtitle_unlock')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              {t('lock.label_passphrase')}
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              autoFocus
              required
              placeholder={firstRun ? t('lock.placeholder_choose') : t('lock.placeholder_enter')}
              className="w-full px-4 py-3 rounded-xl border text-base outline-none"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          {firstRun && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                {t('lock.label_confirm')}
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder={t('lock.placeholder_repeat')}
                className="w-full px-4 py-3 rounded-xl border text-base outline-none"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          )}

          {error && (
            <p className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-60"
            style={{ background: 'var(--color-primary)' }}
          >
            <Lock className="w-4 h-4" />
            {loading ? t('lock.btn_loading') : firstRun ? t('lock.btn_create') : t('lock.btn_unlock')}
          </button>
        </form>

        <p className="text-xs text-center mt-6" style={{ color: 'var(--color-text-muted)' }}>
          {t('lock.footer')}
        </p>
      </div>
    </div>
  )
}
