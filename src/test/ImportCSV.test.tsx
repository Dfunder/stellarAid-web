import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import ImportCSV from '@/components/ImportCSV'

const validCsv = 'title,description\nNebula,<img src=x onerror=alert(1)>Safe\nHarbor,Calm water\n'

function file(content: string, name = 'artworks.csv', type = 'text/csv') {
  return new File([content], name, { type })
}

describe('ImportCSV', () => {
  it('rejects executables and MIME-spoofed files without previewing them', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onImport = vi.fn()
    render(<ImportCSV onImport={onImport} />)

    const input = screen.getByLabelText(/csv file/i)
    await user.upload(input, file('MZ binary', 'malware.exe', 'application/x-msdownload'))

    expect(await screen.findByRole('alert')).toHaveTextContent(/only \.csv files/i)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    await user.upload(input, file('a,b\n1,2', 'spoofed.csv', 'application/x-msdownload'))
    expect(await screen.findByRole('alert')).toHaveTextContent(/not a supported csv type/i)
    expect(onImport).not.toHaveBeenCalled()
  })

  it('previews sanitized data and imports only after confirmation', async () => {
    const user = userEvent.setup()
    const onImport = vi.fn()
    render(<ImportCSV onImport={onImport} />)

    const input = screen.getByLabelText(/csv file/i)
    await user.upload(input, file(validCsv))

    expect(await screen.findByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Safe')).toBeInTheDocument()
    expect(document.querySelector('img')).not.toBeInTheDocument()
    expect(onImport).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /confirm import/i }))

    await waitFor(() => expect(onImport).toHaveBeenCalledTimes(1))
    expect(onImport).toHaveBeenCalledWith({
      fileName: 'artworks.csv',
      headers: ['title', 'description'],
      rows: [
        ['Nebula', 'Safe'],
        ['Harbor', 'Calm water'],
      ],
    })
    expect(screen.getByText(/import completed/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('does not import when the user cancels the preview', async () => {
    const user = userEvent.setup()
    const onImport = vi.fn()
    render(<ImportCSV onImport={onImport} />)

    await user.upload(screen.getByLabelText(/csv file/i), file(validCsv))
    expect(await screen.findByRole('table')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(onImport).not.toHaveBeenCalled()
  })

  it('rejects a CSV that exceeds the row limit', async () => {
    const user = userEvent.setup()
    const onImport = vi.fn()
    render(<ImportCSV onImport={onImport} maxRows={3} />)

    const csv = `title,description\n${Array.from(
      { length: 4 },
      (_, i) => `item ${i},description`,
    ).join('\n')}`

    await user.upload(screen.getByLabelText(/csv file/i), file(csv))

    expect(await screen.findByRole('alert')).toHaveTextContent(/maximum is 3/i)
    expect(onImport).not.toHaveBeenCalled()
  })
})
