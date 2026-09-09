import { X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface HowToUseDrawerProps {
  title: string
  markdown: string
  onClose: () => void
}

export default function HowToUseDrawer({ title, markdown, onClose }: HowToUseDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-y-auto"
        style={{
          background: 'var(--color-surface)',
          maxHeight: '80vh',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-border)' }} />
        </div>

        <div className="flex items-center justify-between px-5 pb-3 border-b"
             style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: 'var(--color-text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className="px-5 py-4 pb-10 prose prose-sm max-w-none"
          style={{
            color: 'var(--color-text)',
            '--tw-prose-body': 'var(--color-text)',
            '--tw-prose-headings': 'var(--color-text)',
            '--tw-prose-lead': 'var(--color-text-muted)',
            '--tw-prose-links': 'var(--color-primary)',
            '--tw-prose-bold': 'var(--color-text)',
            '--tw-prose-counters': 'var(--color-text-muted)',
            '--tw-prose-bullets': 'var(--color-text-muted)',
            '--tw-prose-hr': 'var(--color-border)',
            '--tw-prose-quotes': 'var(--color-text)',
            '--tw-prose-quote-borders': 'var(--color-primary)',
            '--tw-prose-captions': 'var(--color-text-muted)',
            '--tw-prose-code': 'var(--color-text)',
            '--tw-prose-th-borders': 'var(--color-border)',
            '--tw-prose-td-borders': 'var(--color-border)',
          } as React.CSSProperties}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>
    </>
  )
}
