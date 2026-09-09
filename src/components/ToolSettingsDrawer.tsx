import { Download, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { decrypt, encrypt } from '../crypto/vault'
import { useJournalContext, useToolData } from '../store/journal'
import type { JournalTool } from '../tools/tool.types'

interface Envelope {
  encrypted: boolean
  tool: string
  version: number
  data: unknown
}

interface ToolSettingsDrawerProps {
  tool: JournalTool
  onClose: () => void
}

export default function ToolSettingsDrawer({ tool, onClose }: ToolSettingsDrawerProps) {
  const { t } = useTranslation()
  const { key } = useJournalContext()
  const [data] = useToolData(tool)
  const [status, setStatus] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  function downloadJson(filename: string, payload: Envelope) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleExport(encrypted: boolean) {
    if (encrypted) {
      if (!key) return
      const plain = tool.schema.serialize(data)
      const ciphertext = await encrypt(plain, key)
      downloadJson(`${tool.id}-encrypted.json`, { encrypted: true, tool: tool.id, version: 1, data: ciphertext })
    } else {
      downloadJson(`${tool.id}-plain.json`, { encrypted: false, tool: tool.id, version: 1, data })
    }
    setStatus(t('settings.success_exported'))
    setTimeout(() => setStatus(''), 2000)
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text()
      const envelope = JSON.parse(text) as Envelope
      if (envelope.tool !== tool.id) { setStatus(t('settings.err_wrong_tool')); return }

      let plainData: unknown
      if (envelope.encrypted) {
        if (!key) { setStatus(t('settings.err_not_unlocked')); return }
        const plain = await decrypt(envelope.data as string, key)
        plainData = JSON.parse(plain)
      } else {
        plainData = envelope.data
      }

      const deserialized = tool.schema.deserialize(JSON.stringify(plainData))
      const plain = tool.schema.serialize(deserialized)
      if (!key) { setStatus(t('settings.err_not_unlocked')); return }
      const ciphertext = await encrypt(plain, key)
      localStorage.setItem(`jrnl_${tool.id}`, ciphertext)
      setStatus(t('settings.success_imported'))
      setTimeout(() => setStatus(''), 4000)
    } catch {
      setStatus(t('settings.err_import_failed'))
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl"
        style={{
          background: 'var(--color-surface)',
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
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{tool.icon}</span>
            <h2 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
              {t('settings.section_export')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label={t('aria.close_tools_drawer')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 pb-10 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleExport(false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <Download className="w-4 h-4" />{t('settings.btn_export_plain')}
            </button>
            <button
              onClick={() => handleExport(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <Download className="w-4 h-4" />{t('settings.btn_export_encrypted')}
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <Upload className="w-4 h-4" />{t('settings.btn_import')}
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
            />
          </div>

          {status && (
            <p className="text-sm" style={{ color: 'var(--color-success)' }}>{status}</p>
          )}
        </div>
      </div>
    </>
  )
}
