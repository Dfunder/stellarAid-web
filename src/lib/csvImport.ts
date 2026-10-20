import { sanitizeText } from './sanitize'

/** Maximum number of data rows accepted by the import flow. */
export const MAX_CSV_ROWS = 100

/** Maximum number of columns accepted by the import flow. */
export const MAX_CSV_COLUMNS = 10

/** Hard cap on the uploaded file size (2 MB). */
export const MAX_CSV_FILE_SIZE_BYTES = 2 * 1024 * 1024

/**
 * MIME types browsers use for CSV files. Some browsers report a CSV as
 * `text/plain` or as the legacy Excel type, so both are accepted together with
 * the `.csv` extension requirement.
 */
export const CSV_MIME_TYPES = [
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'text/plain',
] as const

export class CsvValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CsvValidationError'
  }
}

export interface CsvFileLike {
  name: string
  type: string
  size: number
}

export interface CsvImportOptions {
  maxRows?: number
  maxColumns?: number
}

export interface ParsedCsv {
  headers: string[]
  rows: string[][]
}

const CSV_EXTENSION = /\.csv$/i
const FORMULA_LEADING_CHARACTER = /^[=+\-@\t\r]/

/**
 * Validates a candidate upload before reading it. Both the extension and the
 * browser-reported MIME type must look like CSV; this blocks renamed binaries
 * such as `payload.csv.exe` and executables mislabelled with a `.csv` name.
 */
export function validateCsvFile(file: CsvFileLike, options: CsvImportOptions = {}): void {
  const maxRows = options.maxRows ?? MAX_CSV_ROWS

  if (!CSV_EXTENSION.test(file.name.trim())) {
    throw new CsvValidationError('Only .csv files are supported.')
  }

  const mime = file.type.toLowerCase().trim()
  if (mime && !CSV_MIME_TYPES.includes(mime as (typeof CSV_MIME_TYPES)[number])) {
    throw new CsvValidationError('The selected file is not a supported CSV type.')
  }

  if (file.size <= 0) {
    throw new CsvValidationError('The selected CSV file is empty.')
  }

  if (file.size > MAX_CSV_FILE_SIZE_BYTES) {
    throw new CsvValidationError(
      `The CSV file is too large. The maximum size is ${Math.round(
        MAX_CSV_FILE_SIZE_BYTES / (1024 * 1024),
      )} MB.`,
    )
  }

  if (maxRows <= 0) {
    throw new CsvValidationError('The CSV row limit must be greater than zero.')
  }
}

/**
 * Parses RFC 4180-style CSV, including quoted fields, escaped quotes and
 * embedded newlines. Blank lines are ignored. Throws {@link CsvValidationError}
 * for malformed input rather than silently producing partial data.
 */
export function parseCsv(text: string): string[][] {
  if (text.includes('\0')) {
    throw new CsvValidationError('The CSV contains binary data and cannot be imported.')
  }

  const source = text.replace(/^\uFEFF/, '')
  if (source.trim() === '') {
    throw new CsvValidationError('The CSV file is empty.')
  }

  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let quoteClosed = false
  let line = 1

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]!

    if (inQuotes) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          field += '"'
          index += 1
          continue
        }
        inQuotes = false
        quoteClosed = true
        continue
      }
      if (character === '\n') line += 1
      field += character
      continue
    }

    if (quoteClosed && character !== ',' && character !== '\r' && character !== '\n') {
      throw new CsvValidationError(`Unexpected text after a closing quote on line ${line}.`)
    }

    if (character === '"') {
      if (field.length > 0) {
        throw new CsvValidationError(`Unexpected quote on line ${line}.`)
      }
      inQuotes = true
      quoteClosed = false
      continue
    }

    if (character === ',') {
      row.push(field)
      field = ''
      quoteClosed = false
      continue
    }

    if (character === '\r' || character === '\n') {
      if (character === '\r' && source[index + 1] === '\n') index += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      quoteClosed = false
      line += 1
      continue
    }

    field += character
  }

  if (inQuotes) {
    throw new CsvValidationError('The CSV contains an unclosed quoted field.')
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const nonEmptyRows = rows.filter((cells) => cells.some((cell) => cell.trim() !== ''))
  if (nonEmptyRows.length === 0) {
    throw new CsvValidationError('The CSV file is empty.')
  }

  return nonEmptyRows
}

/**
 * Sanitizes a single cell before it is shown in the preview or handed to the
 * import callback:
 * - strips HTML/script/event-handler content via the shared sanitizer,
 * - prefixes formula-leading characters so spreadsheet programs do not execute
 *   imported values as formulas.
 */
export function sanitizeCsvCell(value: unknown): string {
  const cleaned = sanitizeText(String(value ?? ''))
  return FORMULA_LEADING_CHARACTER.test(cleaned) ? `'${cleaned}` : cleaned
}

/**
 * Parses, validates (row/column limits, header shape) and sanitizes a CSV
 * document in one step.
 */
export function parseAndValidateCsv(text: string, options: CsvImportOptions = {}): ParsedCsv {
  const maxRows = options.maxRows ?? MAX_CSV_ROWS
  const maxColumns = options.maxColumns ?? MAX_CSV_COLUMNS
  const rawRows = parseCsv(text)

  const headerRow = rawRows[0]
  if (!headerRow || headerRow.length === 0) {
    throw new CsvValidationError('The CSV must start with a header row.')
  }

  if (headerRow.length > maxColumns) {
    throw new CsvValidationError(
      `This CSV has ${headerRow.length} columns; the maximum is ${maxColumns}.`,
    )
  }

  if (rawRows.length < 2) {
    throw new CsvValidationError('The CSV must include a header row and at least one data row.')
  }

  const dataRowCount = rawRows.length - 1
  if (dataRowCount > maxRows) {
    throw new CsvValidationError(`This CSV has ${dataRowCount} rows; the maximum is ${maxRows}.`)
  }

  const columnCount = headerRow.length
  const rows = rawRows.slice(1).map((cells, rowIndex) => {
    if (cells.length > maxColumns) {
      throw new CsvValidationError(
        `Row ${rowIndex + 2} has ${cells.length} columns; the maximum is ${maxColumns}.`,
      )
    }
    if (cells.length > columnCount) {
      throw new CsvValidationError(`Row ${rowIndex + 2} has more columns than the header.`)
    }

    return Array.from({ length: columnCount }, (_, columnIndex) =>
      sanitizeCsvCell(cells[columnIndex] ?? ''),
    )
  })

  const headers = headerRow.map(sanitizeCsvCell)
  if (headers.every((header) => header === '')) {
    throw new CsvValidationError('The CSV header row is empty.')
  }

  return { headers, rows }
}
