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
import { queryClient } from '@/stores'

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
