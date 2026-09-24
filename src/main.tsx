import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ConfigErrorScreen from '@/components/ui/ConfigErrorScreen'
import App from '@/App'
import { configError } from '@/config'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root was not found')

if (configError) {
  createRoot(root).render(
    <StrictMode>
      <ConfigErrorScreen message={configError} />
    </StrictMode>,
  )
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
