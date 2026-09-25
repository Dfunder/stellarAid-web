import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/useAuthStore'

/** `true` once the persisted auth session has been restored. */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated())

  useEffect(() => useAuthStore.persist.onFinishHydration(() => setHydrated(true)), [])

  return hydrated
}
