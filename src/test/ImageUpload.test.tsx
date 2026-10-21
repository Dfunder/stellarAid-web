import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import ImageUpload from '@/components/ImageUpload/ImageUpload'
import { MAX_ALT_TEXT_LENGTH } from '@/lib/altText'

const noop = () => {}

function renderUpload(overrides: Partial<ComponentProps<typeof ImageUpload>> = {}) {
  return render(<ImageUpload label="Profile photo" onFileSelect={noop} {...overrides} />)
}

const altField = () => screen.getByLabelText(/alternative text \(alt text\)/i)

describe('ImageUpload alt text (#999)', () => {
  it('describes the current image from its file name instead of a generic label', () => {
    renderUpload({ currentImage: 'https://cdn.lumora.art/harbor-at-dusk.jpg' })

    const preview = screen.getByRole('img')
    expect(preview).toHaveAttribute('alt', 'harbor at dusk')
    expect(preview).not.toHaveAttribute('alt', 'Current upload')
  })

  it('offers a labelled, described alt text field prefilled with the generated description', () => {
    renderUpload({ currentImage: 'https://cdn.lumora.art/harbor-at-dusk.jpg' })

    expect(altField()).toHaveValue('harbor at dusk')
    expect(altField()).toHaveAccessibleDescription(/screen readers/i)
    expect(altField()).toHaveAttribute('maxlength', String(MAX_ALT_TEXT_LENGTH))
  })

  it('uses the description the uploader types and reports it', async () => {
    const user = userEvent.setup()
    const onAltTextChange = vi.fn()
    renderUpload({
      currentImage: 'https://cdn.lumora.art/harbor-at-dusk.jpg',
      onAltTextChange,
    })

    await user.clear(altField())
    await user.type(altField(), 'Harbour at dusk, oil on canvas')

    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Harbour at dusk, oil on canvas')
    expect(onAltTextChange).toHaveBeenLastCalledWith('Harbour at dusk, oil on canvas')
  })

  it('accepts alt text before a file is chosen', async () => {
    const user = userEvent.setup()
    renderUpload()

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    await user.type(altField(), 'Sketch of a heron')
    expect(altField()).toHaveValue('Sketch of a heron')
  })

  it('keeps saved alt text and lets the user edit it after upload', async () => {
    const user = userEvent.setup()
    renderUpload({
      currentImage: 'https://cdn.lumora.art/harbor-at-dusk.jpg',
      altText: 'Harbour at dusk',
    })

    expect(altField()).toHaveValue('Harbour at dusk')
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Harbour at dusk')

    await user.type(altField(), ' (restored)')
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Harbour at dusk (restored)')
  })

  it('falls back to the generated description when the field is cleared', async () => {
    const user = userEvent.setup()
    renderUpload({
      currentImage: 'https://cdn.lumora.art/harbor-at-dusk.jpg',
      altText: 'Harbour at dusk',
    })

    await user.clear(altField())

    expect(screen.getByRole('img')).toHaveAttribute('alt', 'harbor at dusk')
  })

  it('never reads a meaningless description such as a file name', async () => {
    const user = userEvent.setup()
    renderUpload({ currentImage: 'https://cdn.lumora.art/harbor-at-dusk.jpg' })

    await user.clear(altField())
    await user.type(altField(), 'IMG_0001')

    expect(screen.getByRole('img')).toHaveAttribute('alt', 'harbor at dusk')
  })

  it('uses the label wording when the image URL carries no description', () => {
    renderUpload({ currentImage: 'https://cdn.lumora.art/a1b2c3d4e5f6.jpg' })

    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Profile photo image')
  })

  it('respects a custom fallback wording', () => {
    renderUpload({
      currentImage: 'https://cdn.lumora.art/a1b2c3d4e5f6.jpg',
      altFallback: 'Gallery artwork',
    })

    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Gallery artwork')
  })
})
