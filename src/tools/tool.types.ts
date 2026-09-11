import type React from 'react'

export type Periodicity = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'ongoing'

export interface ToolDescription {
  summary: string
  howToUse: string // markdown
  sourceBook?: string
  sourceLink?: string
  references?: Array<{ label: string; url: string }>
}

export interface ToolSchema<T> {
  defaultData: T
  serialize: (data: T) => string
  deserialize: (raw: string) => T
}

export type EncryptFn = (plaintext: string, key: CryptoKey) => Promise<string>

export interface ExporterContext {
  key: CryptoKey
  encrypt: EncryptFn
}

export interface Exporter {
  id: string
  label: string
  export: (data: unknown, ctx?: ExporterContext) => Promise<void>
}

export interface ToolProps {
  periodKey: string | null
  onSave?: () => void
}

export interface JournalTool<T = unknown> {
  id: string
  name: string
  icon: string // emoji
  route: string // e.g. "/gratitude"
  periodicity: Periodicity
  description: ToolDescription
  component: React.ComponentType<ToolProps>
  schema: ToolSchema<T>
  exporters: Exporter[]
}
