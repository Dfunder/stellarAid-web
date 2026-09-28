import { useCallback, useState } from 'react'

const STORAGE_KEY = 'recentlyViewed'
const MAX_HISTORY = 20

function getStoredHistory(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function setStoredHistory(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Ignore storage errors
  }
}

export function useRecentlyViewed() {
  const [history, setHistory] = useState<string[]>(() => getStoredHistory())

  const addToHistory = useCallback((artworkId: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((id) => id !== artworkId)
      const updated = [artworkId, ...filtered].slice(0, MAX_HISTORY)
      setStoredHistory(updated)
      return updated
    })
  }, [])

  const removeFromHistory = useCallback((artworkId: string) => {
    setHistory((prev) => {
      const updated = prev.filter((id) => id !== artworkId)
      setStoredHistory(updated)
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    setStoredHistory([])
  }, [])

  return { history, addToHistory, removeFromHistory, clearHistory }
}