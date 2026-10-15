import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Unmount components between tests so state never leaks across cases.
afterEach(() => {
  cleanup()
})
