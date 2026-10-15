import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyFileCap, uploadToPresignedUrl } from './uploadHelpers'

type Listener = (event?: unknown) => void

/** Minimal XMLHttpRequest stand-in that records what was sent. */
class FakeXhr {
  static latest: FakeXhr | null = null

  status = 200
  method = ''
  url = ''
  headers: Record<string, string> = {}
  body: unknown = null
  listeners: Record<string, Listener[]> = {}
  uploadListeners: Listener[] = []
  upload = {
    addEventListener: (type: string, listener: Listener): void => {
      if (type === 'progress') this.uploadListeners.push(listener)
    },
  }

  constructor() {
    FakeXhr.latest = this
  }

  open(method: string, url: string): void {
    this.method = method
    this.url = url
  }

  setRequestHeader(key: string, value: string): void {
    this.headers[key] = value
  }

  send(body: unknown): void {
    this.body = body
  }

  addEventListener(type: string, listener: Listener): void {
    const existing = this.listeners[type]
    if (existing) existing.push(listener)
    else this.listeners[type] = [listener]
  }

  /** Fire a request lifecycle event (load / error / abort). */
  emit(type: string): void {
    for (const listener of this.listeners[type] ?? []) listener()
  }

  /** Fire an upload progress event. */
  emitProgress(loaded: number, total: number): void {
    for (const listener of this.uploadListeners) {
      listener({ lengthComputable: true, loaded, total })
    }
  }
}

function takeXhr(): FakeXhr {
  const xhr = FakeXhr.latest
  if (!xhr) throw new Error('XMLHttpRequest was never constructed')
  return xhr
}

describe('applyFileCap', () => {
  it('keeps everything when the batch is under the cap', () => {
    expect(applyFileCap(['a', 'b', 'c'], 0, 20)).toEqual({
      accepted: ['a', 'b', 'c'],
      exceeded: false,
    })
  })

  it('does not report an overflow when the batch lands exactly on the cap', () => {
    expect(applyFileCap(['new'], 19, 20)).toEqual({ accepted: ['new'], exceeded: false })
  })

  it('trims and reports an overflow when the cap would be exceeded', () => {
    expect(applyFileCap(['a', 'b', 'c'], 19, 20)).toEqual({ accepted: ['a'], exceeded: true })
  })

  it('accepts nothing when the cap is already reached', () => {
    expect(applyFileCap(['a', 'b'], 20, 20)).toEqual({ accepted: [], exceeded: true })
  })
})

describe('uploadToPresignedUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    FakeXhr.latest = null
  })

  it('sends the file bytes themselves as the request body', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr)

    const source = new File(['hello deliverable'], 'art.png', { type: 'image/png' })
    const onProgress = vi.fn()
    const done = uploadToPresignedUrl('https://cdn.example/upload?sig=abc', source, onProgress)
    const xhr = takeXhr()

    expect(xhr.method).toBe('PUT')
    expect(xhr.url).toBe('https://cdn.example/upload?sig=abc')
    expect(xhr.headers['Content-Type']).toBe('image/png')

    // The body must be the file itself — its bytes, not the metadata object.
    expect(xhr.body).toBe(source)
    if (!(xhr.body instanceof File)) throw new Error('request body was not the File')
    await expect(xhr.body.text()).resolves.toBe('hello deliverable')

    xhr.emitProgress(5, 10)
    expect(onProgress).toHaveBeenCalledWith(50)

    xhr.emit('load') // status stays 200
    await expect(done).resolves.toBeUndefined()
  })

  it('rejects with the status when the server refuses the upload', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr)

    const source = new File(['x'], 'art.png', { type: 'image/png' })
    const done = uploadToPresignedUrl('https://cdn.example/upload', source, () => {})
    const xhr = takeXhr()

    xhr.status = 500
    xhr.emit('load')

    await expect(done).rejects.toThrow('Upload failed with status 500')
  })

  it('rejects when the transfer fails at the network level', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr)

    const source = new File(['x'], 'art.png', { type: 'image/png' })
    const done = uploadToPresignedUrl('https://cdn.example/upload', source, () => {})
    const xhr = takeXhr()

    xhr.emit('error')

    await expect(done).rejects.toThrow('Upload failed')
  })
})
