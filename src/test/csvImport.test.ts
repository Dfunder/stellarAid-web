import { describe, expect, it } from 'vitest'
import {
  CsvValidationError,
  MAX_CSV_COLUMNS,
  MAX_CSV_ROWS,
  parseAndValidateCsv,
  parseCsv,
  sanitizeCsvCell,
  validateCsvFile,
} from '@/lib/csvImport'

function csvFile(overrides: Partial<{ name: string; type: string; size: number }> = {}) {
  return { name: 'artworks.csv', type: 'text/csv', size: 128, ...overrides }
}

function dataRows(count: number, columns = 2): string {
  return Array.from({ length: count }, (_, row) =>
    Array.from({ length: columns }, (_, column) => `r${row}c${column}`).join(','),
  ).join('\n')
}

describe('validateCsvFile', () => {
  it('accepts a .csv file reported as text/csv', () => {
    expect(() => validateCsvFile(csvFile())).not.toThrow()
  })

  it('accepts the legacy/vendor MIME types browsers use for CSV', () => {
    expect(() => validateCsvFile(csvFile({ type: 'application/vnd.ms-excel' }))).not.toThrow()
    expect(() => validateCsvFile(csvFile({ type: 'text/plain' }))).not.toThrow()
    expect(() => validateCsvFile(csvFile({ type: '' }))).not.toThrow()
  })

  it('rejects non-.csv extensions', () => {
    expect(() => validateCsvFile(csvFile({ name: 'malware.exe' }))).toThrow(CsvValidationError)
    expect(() => validateCsvFile(csvFile({ name: 'payload.csv.exe' }))).toThrow(/only \.csv files/i)
  })

  it('rejects executable MIME types even when the extension is .csv', () => {
    expect(() => validateCsvFile(csvFile({ type: 'application/x-msdownload' }))).toThrow(
      /not a supported csv type/i,
    )
    expect(() => validateCsvFile(csvFile({ type: 'application/javascript' }))).toThrow(
      /not a supported csv type/i,
    )
  })

  it('rejects empty and oversized files', () => {
    expect(() => validateCsvFile(csvFile({ size: 0 }))).toThrow(/empty/i)
    expect(() => validateCsvFile(csvFile({ size: 3 * 1024 * 1024 }))).toThrow(/too large/i)
  })
})

describe('parseCsv', () => {
  it('parses quoted fields, escaped quotes, CRLF and embedded newlines', () => {
    const rows = parseCsv(
      'name,note\r\n"Ada, Lovelace","said ""hi""\r\nthen left"\r\nGrace,compiler\r\n',
    )

    expect(rows).toEqual([
      ['name', 'note'],
      ['Ada, Lovelace', 'said "hi"\r\nthen left'],
      ['Grace', 'compiler'],
    ])
  })

  it('strips a UTF-8 BOM and ignores blank lines', () => {
    expect(parseCsv('\uFEFFa,b\n\n1,2\n\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('rejects unclosed quotes, stray quotes and binary content', () => {
    expect(() => parseCsv('a,b\n"unclosed,1')).toThrow(/unclosed quoted field/i)
    expect(() => parseCsv('a,b\nhe"llo,1')).toThrow(/unexpected quote/i)
    expect(() => parseCsv('a,b\n"x"tail,1')).toThrow(/after a closing quote/i)
    expect(() => parseCsv('a,b\n1,\u00002')).toThrow(/binary data/i)
  })
})

describe('sanitizeCsvCell', () => {
  it('strips markup and event-handler payloads', () => {
    expect(sanitizeCsvCell('<img src=x onerror=alert(1)>Safe')).toBe('Safe')
    expect(sanitizeCsvCell('<script>alert(1)</script>')).not.toContain('<script')
  })

  it('defuses spreadsheet formula injection', () => {
    expect(sanitizeCsvCell('=SUM(A1:A2)')).toBe("'=SUM(A1:A2)")
    expect(sanitizeCsvCell('+1')).toBe("'+1")
    expect(sanitizeCsvCell('-1')).toBe("'-1")
    expect(sanitizeCsvCell('@import')).toBe("'@import")
  })
})

describe('parseAndValidateCsv', () => {
  it('returns sanitized headers and rows, and pads short rows', () => {
    const result = parseAndValidateCsv('title,description\nNebula,<b>Bright</b>\nTide\n')

    expect(result.headers).toEqual(['title', 'description'])
    expect(result.rows).toEqual([
      ['Nebula', 'Bright'],
      ['Tide', ''],
    ])
  })

  it('enforces the row limit', () => {
    const text = `title,description\n${dataRows(MAX_CSV_ROWS + 1)}`

    expect(() => parseAndValidateCsv(text)).toThrow(new RegExp(`maximum is ${MAX_CSV_ROWS}`, 'i'))
  })

  it('enforces the column limit', () => {
    const header = Array.from({ length: MAX_CSV_COLUMNS + 1 }, (_, i) => `c${i}`).join(',')
    const row = Array.from({ length: MAX_CSV_COLUMNS + 1 }, (_, i) => `v${i}`).join(',')

    expect(() => parseAndValidateCsv(`${header}\n${row}`)).toThrow(
      new RegExp(`maximum is ${MAX_CSV_COLUMNS}`, 'i'),
    )
  })

  it('rejects rows with more cells than the header', () => {
    expect(() => parseAndValidateCsv('a,b\n1,2,3')).toThrow(/more columns than the header/i)
  })

  it('requires a header and at least one data row', () => {
    expect(() => parseAndValidateCsv('a,b')).toThrow(/at least one data row/i)
    expect(() => parseAndValidateCsv('a,b\n\n')).toThrow(/at least one data row/i)
  })
})
