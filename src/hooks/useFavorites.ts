import { useState } from 'react'

const STORAGE_KEY = 'jrnl_favorites'
export const MAX_FAVORITES = 3

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
      return []
    }
  })

  const toggle = (toolId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : prev.length < MAX_FAVORITES
          ? [...prev, toolId]
          : prev
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return { favorites, toggle, MAX_FAVORITES }
}
