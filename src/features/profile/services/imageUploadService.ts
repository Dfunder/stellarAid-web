import { http } from '@/services'

export interface PresignedUrlResponse {
  uploadUrl: string
  fileId: string
  publicUrl: string
}

export interface ImageUploadOptions {
  fileName: string
  fileType: string
  fileSize: number
  imageType: 'avatar' | 'cover'
}

/**
 * Uploads a profile image using presigned URL flow
 */
export async function uploadProfileImage(
  file: File,
  imageType: 'avatar' | 'cover',
  onProgress?: (progress: number) => void
): Promise<string> {
  // Step 1: Get presigned URL from backend
  const { uploadUrl, publicUrl } = await http.post<PresignedUrlResponse>(
    '/profiles/images/presigned-url',
    {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      imageType,
    }
  )

  // Step 2: Upload to S3-compatible storage using presigned URL
  await uploadToPresignedUrl(uploadUrl, file, file.type, onProgress)

  // Step 3: Return the public URL
  return publicUrl
}

/**
 * Uploads a file to a presigned URL with progress tracking
 */
function uploadToPresignedUrl(
  url: string,
  file: File,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))

    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.send(file)
  })
}

/**
 * Deletes a profile image from storage
 */
export async function deleteProfileImage(imageUrl: string, imageType: 'avatar' | 'cover'): Promise<void> {
  try {
    await http.delete('/profiles/images', {
      data: { imageUrl, imageType },
    })
  } catch (error) {
    // Log error but don't throw - deletion is best-effort
    console.error('Failed to delete profile image:', error)
  }
}
