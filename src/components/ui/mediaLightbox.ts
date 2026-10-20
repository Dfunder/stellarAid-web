export function normalizeImageList(
  images: Array<string | null | undefined> | null | undefined,
): string[] {
  return (images ?? [])
    .map((image) => (typeof image === 'string' ? image.trim() : ''))
    .filter((image) => image.length > 0)
}

export function clampIndex(index: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(Math.max(index, 0), total - 1)
}

export function getAdjacentIndices(
  index: number,
  total: number,
): { previous: number; next: number } {
  const safeTotal = total <= 0 ? 1 : total
  const safeIndex = clampIndex(index, safeTotal)

  // Adjacent indices wrap around the gallery, so preloading at either end
  // fetches the image the previous/next control will actually show.
  return {
    previous: (safeIndex - 1 + safeTotal) % safeTotal,
    next: (safeIndex + 1) % safeTotal,
  }
}
