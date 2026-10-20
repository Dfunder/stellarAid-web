/**
 * Presigned-URL upload transport for deliverables (#775).
 *
 * Extracted from `DeliverableUpload` so the XHR path can be unit-tested
 * without mounting the component. `XMLHttpRequest.send` only accepts a
 * `Blob`/`File`; callers must pass the raw browser `File`, never a
 * descriptor object.
 */
export function uploadToPresignedUrl(
  url: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!(file instanceof Blob)) {
      reject(new TypeError('Upload failed: expected a File or Blob upload body'))
      return
    }

    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        const detail = xhr.statusText ? ` (${xhr.statusText})` : ''
        reject(new Error(`Upload failed: storage responded with ${xhr.status}${detail}`))
      }
    })
    xhr.addEventListener('error', () =>
      reject(new Error('Upload failed: network error reaching the storage host'))
    )
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  })
}

/**
 * Runs `task` over `items` with at most `limit` promises in flight at once,
 * preserving input order in the results (#854).
 *
 * `task` is expected to resolve for every item — callers that need per-item
 * failure handling should catch inside `task` so one rejected upload cannot
 * cancel its siblings.
 */
export async function runWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length)
  const workerCount = Math.max(1, Math.min(limit, items.length))
  let nextIndex = 0

  async function worker(): Promise<void> {
    for (;;) {
      const index = nextIndex
      nextIndex += 1
      if (index >= items.length) return
      results[index] = await task(items[index]!, index)
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}

/** Result of applying the per-revision file-count cap. */
export interface FileCap<T> {
  /** Incoming items that fit under the cap, in order. */
  accepted: T[]
  /** True only when the incoming batch actually overflowed the cap. */
  exceeded: boolean
}

/**
 * Applies the file-count cap: keeps at most `max - existingCount` incoming
 * items. `exceeded` is true only when items had to be dropped, so the
 * "maximum files" message never appears when a batch lands exactly on the cap.
 */
export function applyFileCap<T>(incoming: T[], existingCount: number, max: number): FileCap<T> {
  const room = Math.max(max - existingCount, 0)
  if (incoming.length <= room) return { accepted: incoming, exceeded: false }
  return { accepted: incoming.slice(0, room), exceeded: true }
}
