/** Types shared by the deliverable upload flow. */
export type DeliverableKind = 'wip' | 'final'

export interface DeliverableFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed'
  progress: number
  error?: string
  /** WIP uploads are work-in-progress; finals are the deliverable. */
  kind: DeliverableKind
  /** Revision round this file belongs to, stacked per submission. */
  revision: number
  note?: string
  /**
   * Raw browser `File` kept so the upload can send real bytes (#775) —
   * `XMLHttpRequest.send` rejects anything that is not a Blob. Absent for
   * server-loaded `initialFiles`, which cannot be re-uploaded from this
   * session.
   */
  file?: File
}
