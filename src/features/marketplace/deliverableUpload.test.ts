import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { uploadToPresignedUrl } from './deliverableUpload'

type Listener = (event?: unknown) => void

/** Controllable XMLHttpRequest double; installed on globalThis per test. */
class FakeXHR {
  static instances: FakeXHR[] = []
  /** Status/statusText + which listener fires when `send` completes. */
  static next: { status?: number; statusText?: string; outcome?: 'load' | 'error' } = {}

  status = 0
  statusText = ''
  method = ''
  url = ''
  headers: Record<string, string> = {}
  sentBody: unknown = null
  listeners: Record<string, Listener> = {}
  uploadListeners: Record<string, Listener> = {}
  upload = {
    addEventListener: (type: string, listener: Listener) => {
      this.uploadListeners[type] = listener
    },
  }

  constructor() {
    FakeXHR.instances.push(this)
  }

  addEventListener(type: string, listener: Listener) {
    this.listeners[type] = listener
  }

  open(method: string, url: string) {
    this.method = method
    this.url = url
  }

  setRequestHeader(key: string, value: string) {
    this.headers[key] = value
  }

  send(body: unknown) {
    this.sentBody = body
    const { status = 200, statusText = 'OK', outcome = 'load' } = FakeXHR.next
    this.status = status
    this.statusText = statusText
    if (outcome === 'load') {
      this.uploadListeners['progress']?.({
        lengthComputable: true,
        loaded: 5,
        total: 10,
      })
      this.listeners['load']?.()
    } else {
      this.listeners['error']?.()
    }
  }
}

const originalXHR = globalThis.XMLHttpRequest

beforeEach(() => {
  FakeXHR.instances = []
  FakeXHR.next = {}
  globalThis.XMLHttpRequest = FakeXHR as unknown as typeof XMLHttpRequest
})

afterEach(() => {
  globalThis.XMLHttpRequest = originalXHR
})

describe('uploadToPresignedUrl (#775)', () => {
  it('sends the raw File bytes as the request body — not a descriptor object', async () => {
    const file = new File(['hello deliverable'], 'art.psd', { type: 'application/octet-stream' })
    const progress: number[] = []

    await uploadToPresignedUrl('https://storage.test/upload-token', file, (p) => progress.push(p))

    const xhr = FakeXHR.instances[0]
    expect(xhr).toBeDefined()
    // The exact File instance goes over the wire; XHR.send rejects anything else.
    expect(xhr?.sentBody).toBe(file)
    expect(xhr?.sentBody).toBeInstanceOf(File)
    await expect(
      (xhr?.sentBody as File).text()
    ).resolves.toBe('hello deliverable')
    expect(xhr?.method).toBe('PUT')
    expect(xhr?.url).toBe('https://storage.test/upload-token')
    expect(xhr?.headers['Content-Type']).toBe('application/octet-stream')
    expect(progress).toEqual([50])
  })

  it('rejects with the storage status code and status text on a failed upload', async () => {
    FakeXHR.next = { status: 403, statusText: 'Forbidden' }
    const file = new File(['x'], 'nope.png', { type: 'image/png' })

    await expect(uploadToPresignedUrl('https://storage.test/u', file, () => {})).rejects.toThrow(
      'Upload failed: storage responded with 403 (Forbidden)'
    )
  })

  it('names a network-level failure distinctly from an HTTP failure', async () => {
    FakeXHR.next = { outcome: 'error' }
    const file = new File(['x'], 'flaky.png', { type: 'image/png' })

    await expect(uploadToPresignedUrl('https://storage.test/u', file, () => {})).rejects.toThrow(
      'Upload failed: network error reaching the storage host'
    )
  })
})
