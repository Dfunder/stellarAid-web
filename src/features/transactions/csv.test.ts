import { describe, expect, it } from 'vitest'
import { buildCsv, csvFilename, isNegativeAmount, toCsvCell } from './csv'

describe('isNegativeAmount', () => {
  it('detects a leading minus on decimal strings without parseFloat', () => {
    expect(isNegativeAmount('-3')).toBe(true)
    expect(isNegativeAmount('-0.0000001')).toBe(true)
    expect(isNegativeAmount('  -12.5')).toBe(true)
    expect(isNegativeAmount('12.5')).toBe(false)
    expect(isNegativeAmount('+4')).toBe(false)
    expect(isNegativeAmount('0')).toBe(false)
  })
})

describe('toCsvCell', () => {
  it('quotes cells and doubles embedded quotes', () => {
    expect(toCsvCell('plain')).toBe('"plain"')
    expect(toCsvCell('say "hi"')).toBe('"say ""hi"""')
  })

  it('strips newlines so a row can never break the CSV shape', () => {
    expect(toCsvCell('line1\r\nline2')).toBe('"line1 line2"')
    expect(toCsvCell('line1\nline2')).toBe('"line1 line2"')
  })

  it('neutralises formula-leading cells', () => {
    expect(toCsvCell('=SUM(A1:A9)')).toBe(`"'=SUM(A1:A9)"`)
    expect(toCsvCell('+1')).toBe(`"'+1"`)
    expect(toCsvCell('-1')).toBe(`"'-1"`)
    expect(toCsvCell('@cmd')).toBe(`"'@cmd"`)
  })
})

describe('buildCsv', () => {
  it('joins cells with commas and rows with newlines', () => {
    const csv = buildCsv([
      ['Date', 'Amount'],
      ['Jan 15, 2024', '-3.5'],
    ])
    expect(csv).toBe('"Date","Amount"\n"Jan 15, 2024","\'-3.5"')
  })

  it('keeps a quoted cell containing a comma on one row', () => {
    const csv = buildCsv([['a,b', 'c']])
    expect(csv).toBe('"a,b","c"')
  })
})

describe('csvFilename', () => {
  it('produces only filesystem-safe characters', () => {
    const name = csvFilename(new Date('2026-10-15T12:34:56.000Z'))
    expect(name).toBe('transactions-2026-10-15.csv')
    expect(name).toMatch(/^transactions-\d{4}-\d{2}-\d{2}\.csv$/)
    expect(name).not.toMatch(/[\s,:]/)
  })
})
