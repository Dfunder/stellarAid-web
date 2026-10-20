import { useId, useState, type ChangeEvent } from 'react'
import Button from '@/components/ui/Button'
import {
  CsvValidationError,
  MAX_CSV_COLUMNS,
  MAX_CSV_ROWS,
  parseAndValidateCsv,
  validateCsvFile,
  type ParsedCsv,
} from '@/lib/csvImport'

export interface CsvImportResult extends ParsedCsv {
  fileName: string
}

export interface ImportCSVProps {
  /** Called only after the user reviews and confirms the parsed preview. */
  onImport: (result: CsvImportResult) => void | Promise<void>
  maxRows?: number
  maxColumns?: number
  className?: string
}

function readFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text()
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Could not read the selected file.'))
    reader.readAsText(file)
  })
}

/**
 * CSV importer with validation, a confirmation preview and sanitization.
 *
 * Nothing is imported until the user reviews the parsed rows and presses
 * "Confirm import"; the parent only receives sanitized data.
 */
export default function ImportCSV({
  onImport,
  maxRows = MAX_CSV_ROWS,
  maxColumns = MAX_CSV_COLUMNS,
  className = '',
}: ImportCSVProps) {
  const inputId = useId()
  const helpId = `${inputId}-help`
  const [preview, setPreview] = useState<ParsedCsv | null>(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isReading, setIsReading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [imported, setImported] = useState(false)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]

    // Reset so selecting the same file again fires change.
    input.value = ''

    setError(null)
    setPreview(null)
    setImported(false)
    setFileName('')

    if (!file) return

    setIsReading(true)
    try {
      validateCsvFile(file, { maxRows, maxColumns })
      const text = await readFileText(file)
      const parsed = parseAndValidateCsv(text, { maxRows, maxColumns })
      setPreview(parsed)
      setFileName(file.name)
    } catch (cause) {
      setError(
        cause instanceof CsvValidationError
          ? cause.message
          : 'The CSV could not be read. Please try another file.',
      )
    } finally {
      setIsReading(false)
    }
  }

  const handleConfirm = async () => {
    if (!preview) return

    setError(null)
    setIsImporting(true)
    try {
      await onImport({ ...preview, fileName })
      setPreview(null)
      setFileName('')
      setImported(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The import failed. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleCancel = () => {
    setPreview(null)
    setFileName('')
    setError(null)
  }

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-caption font-semibold text-foreground">
          CSV file
        </label>
        <input
          id={inputId}
          type="file"
          accept=".csv,text/csv,application/csv,application/vnd.ms-excel"
          aria-describedby={helpId}
          onChange={handleFileChange}
          disabled={isReading || isImporting}
          className="block w-full cursor-pointer rounded-control border border-line bg-surface p-3 text-caption text-foreground file:mr-3 file:rounded-control file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-caption file:font-semibold file:text-primary-contrast"
        />
        <p id={helpId} className="text-caption-sm text-muted">
          Only .csv files are accepted. Up to {maxRows} rows and {maxColumns} columns.
        </p>
      </div>

      {isReading ? (
        <p role="status" className="text-caption text-muted">
          Reading and validating {fileName || 'file'}…
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-control border border-danger bg-danger/10 px-3 py-2 text-caption text-danger"
        >
          {error}
        </p>
      ) : null}

      {imported ? (
        <p
          role="status"
          className="rounded-control border border-success/40 bg-success/10 px-3 py-2 text-caption text-success"
        >
          Import completed.
        </p>
      ) : null}

      {preview ? (
        <section aria-labelledby={`${inputId}-preview`} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 id={`${inputId}-preview`} className="text-body font-semibold text-foreground">
              Preview
            </h3>
            <p className="text-caption-sm text-muted">
              {preview.rows.length} row{preview.rows.length === 1 ? '' : 's'} · {fileName}
            </p>
          </div>

          <div className="max-h-80 overflow-auto rounded-control border border-line">
            <table className="w-full border-collapse text-left text-caption">
              <caption className="sr-only">Preview of the CSV rows to be imported</caption>
              <thead className="sticky top-0 bg-surface-muted">
                <tr>
                  {preview.headers.map((header, index) => (
                    <th
                      key={`${header}-${index}`}
                      scope="col"
                      className="border-b border-line px-3 py-2 font-semibold text-foreground"
                    >
                      {header || `Column ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`} className="odd:bg-surface">
                    {row.map((cell, columnIndex) => (
                      <td
                        key={`cell-${rowIndex}-${columnIndex}`}
                        className="border-b border-line px-3 py-2 text-foreground"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleConfirm} isLoading={isImporting}>
              Confirm import
            </Button>
            <Button type="button" variant="ghost" onClick={handleCancel} disabled={isImporting}>
              Cancel
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
