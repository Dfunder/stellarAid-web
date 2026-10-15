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

/**
 * PUTs the file's own bytes to a presigned URL, reporting progress as 0-100.
 * Rejects when the transfer fails or the server answers with a non-2xx status.
 */
export function uploadToPresignedUrl(
  url: string,
  source: File,
  onProgress: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload failed with status ${xhr.status}`))
    })
    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', source.type)
    xhr.send(source)
  })
}
