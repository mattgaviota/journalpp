import type { Exporter, ExporterContext } from './tool.types'

interface Envelope {
  encrypted: boolean
  tool: string
  version: number
  data: unknown
}

function downloadJson(filename: string, payload: Envelope) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function makeJsonExporters(toolId: string): Exporter[] {
  return [
    {
      id: 'json-plain',
      label: 'Export JSON (plain)',
      export: async (data) => {
        downloadJson(`${toolId}-plain.json`, {
          encrypted: false,
          tool: toolId,
          version: 1,
          data,
        })
      },
    },
    {
      id: 'json-encrypted',
      label: 'Export JSON (encrypted)',
      export: async (data, ctx?: ExporterContext) => {
        if (!ctx) throw new Error('Encryption context required')
        const plain = JSON.stringify(data)
        const ciphertext = await ctx.encrypt(plain, ctx.key)
        downloadJson(`${toolId}-encrypted.json`, {
          encrypted: true,
          tool: toolId,
          version: 1,
          data: ciphertext,
        })
      },
    },
  ]
}
