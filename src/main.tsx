import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/sora'
import '@/index.css'
import ConfigErrorScreen from '@/components/ui/ConfigErrorScreen'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import ThemeProvider from '@/components/ui/ThemeProvider'
import App from '@/App'
import { configError, loadRemoteFeatureFlags } from '@/config'

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
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ThemeProvider>
    </StrictMode>,
  )
}
