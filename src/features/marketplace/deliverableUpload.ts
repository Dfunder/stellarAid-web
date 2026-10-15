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
