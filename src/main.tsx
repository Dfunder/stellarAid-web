import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import '@fontsource-variable/inter'
import '@fontsource-variable/sora'
import '@/index.css'
import ConfigErrorScreen from '@/components/ui/ConfigErrorScreen'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import ThemeProvider from '@/components/ui/ThemeProvider'
import App from '@/App'
import { configError, loadRemoteFeatureFlags } from '@/config'
import { AuthProvider } from '@/features/auth'
import { analytics } from '@/lib'
import { queryClient } from '@/stores'

// #846 — `analytics.setProvider` had no call site anywhere, so `track` ran
// against the default no-op provider and every event was discarded. This is the
// single place a provider is installed. No vendor SDK is configured yet, so
// development gets a console provider and production keeps the no-op until one
// is wired; `analytics.getFailedEventCount()` then means something.
if (import.meta.env.DEV) {
  analytics.setProvider({
    track: (event, props) => {
      console.debug('[analytics:provider]', event, props)
    },
  })
}

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root was not found')

if (configError) {
  createRoot(root).render(
    <StrictMode>
      <ThemeProvider>
        <ConfigErrorScreen message={configError} />
      </ThemeProvider>
    </StrictMode>,
  )
} else {
  void loadRemoteFeatureFlags()
  createRoot(root).render(
    <StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ErrorBoundary>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}
