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
import { loadRemoteFeatureFlags, loadResult } from '@/config'
import { AuthProvider } from '@/features/auth'
import { queryClient } from '@/stores'

const root = document.getElementById('root')

// The config error takes precedence: an invalid environment is a deployment
// problem, so the app must not boot against guessed values.
if (!loadResult.ok) {
  const errorRoot = root ?? document.body.appendChild(document.createElement('div'))
  createRoot(errorRoot).render(
    <StrictMode>
      <ThemeProvider>
        <ConfigErrorScreen message={loadResult.configError} />
      </ThemeProvider>
    </StrictMode>,
  )
} else {
  void loadRemoteFeatureFlags()
  if (!root) throw new Error('Root element #root was not found')
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
