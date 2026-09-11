import { BookOpen, ShieldCheck } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { isFirstRun } from '../crypto/vault'
import i18n, { SUPPORTED_LANGUAGES } from '../i18n'
import { useJournalContext } from '../store/journal'
import { periodicityBadgeKey } from '../tools/periodicity'
import { registry } from '../tools/registry'

export default function Welcome() {
  const { t } = useTranslation()
  const { key } = useJournalContext()
  const navigate = useNavigate()
  const firstRun = isFirstRun()

  const currentLangIdx = SUPPORTED_LANGUAGES.findIndex((l) => l.code === i18n.resolvedLanguage)
  const currentLang = SUPPORTED_LANGUAGES[currentLangIdx < 0 ? 0 : currentLangIdx]

  function cycleLanguage() {
    const next = SUPPORTED_LANGUAGES[(currentLangIdx + 1) % SUPPORTED_LANGUAGES.length]
    i18n.changeLanguage(next.code)
  }

  useEffect(() => {
    if (key) navigate('/', { replace: true })
  }, [key, navigate])

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <div
        className="sticky top-0 z-10 flex justify-end px-6 py-3 border-b"
        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
      >
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
      </div>
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-20">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="flex flex-col items-center text-center space-y-6">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
            style={{ background: 'var(--color-primary)' }}
          >
            <BookOpen className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
              {t('lock.app_name')}
            </h1>
            <p className="text-lg font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {t('welcome.headline')}
            </p>
          </div>

          <p className="text-base max-w-lg" style={{ color: 'var(--color-text-muted)' }}>
            {t('welcome.subheadline')}
          </p>

          <button
            onClick={() => navigate('/lock')}
            className="px-8 py-3 rounded-2xl font-semibold text-white text-base shadow-md"
            style={{ background: 'var(--color-primary)' }}
          >
            {firstRun ? t('welcome.cta_get_started') : t('welcome.cta_unlock')}
          </button>
        </section>

        {/* ── Tools ────────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              {t('welcome.section_tools')}
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {t('welcome.section_tools_sub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registry.map((tool) => (
              <div
                key={tool.id}
                className="rounded-2xl border p-5 space-y-3"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none">{tool.icon}</span>
                  <div>
                    <div className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                      {t(tool.name)}
                    </div>
                    <span
                      className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}
                    >
                      {t(periodicityBadgeKey(tool.periodicity))}
                    </span>
                  </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {t(tool.description.summary)}
                </p>
                {tool.description.sourceBook && (
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    From <em>{tool.description.sourceBook}</em>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Privacy ──────────────────────────────────────────────── */}
        <section
          className="rounded-2xl border p-6 flex gap-4 items-start"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'color-mix(in srgb, var(--color-success) 15%, transparent)' }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
              {t('welcome.section_privacy')}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {t('welcome.privacy_body')}
            </p>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer className="flex flex-col items-center gap-3 pb-6">
          <button
            onClick={() => navigate('/lock')}
            className="px-8 py-3 rounded-2xl font-semibold text-white text-base"
            style={{ background: 'var(--color-primary)' }}
          >
            {firstRun ? t('welcome.cta_get_started') : t('welcome.cta_unlock')}
          </button>

          {firstRun && (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {t('welcome.already_setup')}{' '}
              <button
                onClick={() => navigate('/lock')}
                className="underline"
                style={{ color: 'var(--color-primary)' }}
              >
                {t('welcome.link_unlock')}
              </button>
            </p>
          )}

          <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
            {t('lock.footer')}
          </p>
        </footer>

      </div>
    </div>
  )
}
