import React, { createContext, useCallback, useContext, useState } from 'react'
import { decrypt, encrypt } from '../crypto/vault'
import type { JournalTool } from '../tools/tool.types'

interface JournalContextValue {
  key: CryptoKey | null
  setKey: (key: CryptoKey) => void
  clearKey: () => void
}

const JournalContext = createContext<JournalContextValue>({
  key: null,
  setKey: () => {},
  clearKey: () => {},
})

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [key, setKeyState] = useState<CryptoKey | null>(null)

  const setKey = useCallback((k: CryptoKey) => setKeyState(k), [])
  const clearKey = useCallback(() => setKeyState(null), [])

  return (
    <JournalContext.Provider value={{ key, setKey, clearKey }}>
      {children}
    </JournalContext.Provider>
  )
}

export function useJournalContext() {
  return useContext(JournalContext)
}

/**
 * Generic hook to read and write a tool's data from encrypted localStorage.
 * Falls back to tool.schema.defaultData when the key is empty or missing.
 */
export function useToolData<T>(tool: JournalTool<T>): [T, (next: T) => Promise<void>] {
  const { key } = useJournalContext()
  const storageKey = `jrnl_${tool.id}`

  const [data, setData] = useState<T>(() => {
    // Synchronous init: return default; async load happens on first render
    return tool.schema.defaultData
  })

  // Load on mount (key available) — wrapped in useCallback so it only re-runs when key changes
  const load = useCallback(async () => {
    if (!key) return
    const stored = localStorage.getItem(storageKey)
    if (!stored) { setData(tool.schema.defaultData); return }
    try {
      const plain = await decrypt(stored, key)
      setData(tool.schema.deserialize(plain))
    } catch {
      setData(tool.schema.defaultData)
    }
  }, [key, storageKey, tool.schema])

  React.useEffect(() => { load() }, [load])

  const save = useCallback(async (next: T) => {
    if (!key) return
    const plain = tool.schema.serialize(next)
    const encrypted = await encrypt(plain, key)
    localStorage.setItem(storageKey, encrypted)
    setData(next)
  }, [key, storageKey, tool.schema])

  return [data, save]
}
