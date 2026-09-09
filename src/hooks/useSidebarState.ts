import { useState } from 'react'

const STORAGE_KEY = 'jrnl_sidebar_collapsed'

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState<boolean>(() =>
    localStorage.getItem(STORAGE_KEY) === 'true'
  )

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(STORAGE_KEY, String(next))
  }

  return { collapsed, toggle }
}
