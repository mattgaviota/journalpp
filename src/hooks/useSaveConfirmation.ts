import { useState } from 'react'

export function useSaveConfirmation(durationMs = 1500) {
  const [saved, setSaved] = useState(false)

  async function withConfirmation(saveFn: () => Promise<void> | void) {
    await saveFn()
    setSaved(true)
    setTimeout(() => setSaved(false), durationMs)
  }

  return { saved, withConfirmation }
}
