import { describe, expect, it } from 'vitest'
import type { Message, MessageDraft } from './types'
import {
  MAX_ATTACHMENTS,
  MAX_MESSAGE_LENGTH,
  appendPending,
  canSend,
  confirmPending,
  createPendingMessage,
  dismissMessage,
  extractLinkPreview,
  failPending,
  formatAttachmentSize,
  isSafePreviewUrl,
  normalizeAttachments,
  normalizeBody,
  remainingLength,
  retryPending,
  retryableIds,
  sendIntentForKey,
  truncateAttachmentName,
} from './utils'

const DRAFT: MessageDraft = { threadId: 'thread-1', body: 'Hello there', attachments: [] }
const AT = new Date('2026-01-01T10:00:00.000Z')

function pending(id: string, body = 'Hello there', at: Date = AT): Message {
  return createPendingMessage({ ...DRAFT, body }, { id, senderId: 'me', createdAt: at })
}

function sent(id: string, at: Date = AT): Message {
  return { ...pending(id, 'Hello there', at), status: 'sent' }
}

describe('sendIntentForKey', () => {
  it('sends on plain Enter', () => {
    expect(sendIntentForKey('Enter', false, false)).toBe('send')
  })

  it('inserts a newline on Shift+Enter', () => {
    expect(sendIntentForKey('Enter', true, false)).toBe('newline')
  })

  it('ignores every other key', () => {
    expect(sendIntentForKey('a', false, false)).toBe('ignore')
    expect(sendIntentForKey('Escape', false, false)).toBe('ignore')
    expect(sendIntentForKey('Tab', true, false)).toBe('ignore')
  })

  it('never sends while an IME candidate window is open', () => {
    // Enter confirms the IME candidate, so sending here would post a half word.
    expect(sendIntentForKey('Enter', false, true)).toBe('ignore')
    expect(sendIntentForKey('Enter', true, true)).toBe('ignore')
  })
})

describe('canSend', () => {
  it('rejects empty and whitespace-only drafts', () => {
    expect(canSend('')).toBe(false)
    expect(canSend('   ')).toBe(false)
    expect(canSend('\n\n\t ')).toBe(false)
  })

  it('accepts a trimmed body', () => {
    expect(canSend('  hi  ')).toBe(true)
    expect(normalizeBody('  hi  ')).toBe('hi')
  })

  it('rejects a body over the length limit', () => {
    expect(canSend('a'.repeat(MAX_MESSAGE_LENGTH))).toBe(true)
    expect(canSend('a'.repeat(MAX_MESSAGE_LENGTH + 1))).toBe(false)
  })

  it('reports remaining characters, floored at zero', () => {
    expect(remainingLength('')).toBe(MAX_MESSAGE_LENGTH)
    expect(remainingLength('abc')).toBe(MAX_MESSAGE_LENGTH - 3)
    expect(remainingLength('a'.repeat(MAX_MESSAGE_LENGTH + 50))).toBe(0)
  })
})

describe('isSafePreviewUrl', () => {
  it('accepts http and https', () => {
    expect(isSafePreviewUrl('https://example.com')).toBe(true)
    expect(isSafePreviewUrl('http://example.com/path?q=1')).toBe(true)
  })

  it('rejects scripting and data schemes', () => {
    expect(isSafePreviewUrl('javascript:alert(1)')).toBe(false)
    expect(isSafePreviewUrl('JavaScript:alert(1)')).toBe(false)
    expect(isSafePreviewUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
    expect(isSafePreviewUrl('vbscript:msgbox(1)')).toBe(false)
    expect(isSafePreviewUrl('file:///etc/passwd')).toBe(false)
  })

  it('rejects embedded credentials', () => {
    expect(isSafePreviewUrl('https://user:secret@example.com')).toBe(false)
  })

  it('rejects unparseable and empty input', () => {
    expect(isSafePreviewUrl('')).toBe(false)
    expect(isSafePreviewUrl('   ')).toBe(false)
    expect(isSafePreviewUrl('not a url')).toBe(false)
  })
})

describe('extractLinkPreview', () => {
  it('finds the first link in a body', () => {
    const preview = extractLinkPreview('look at https://example.com/a?b=1 now')
    expect(preview).toEqual({ url: 'https://example.com/a?b=1', href: 'https://example.com/a?b=1' })
  })

  it('upgrades a bare www host to https', () => {
    expect(extractLinkPreview('see www.example.com')).toEqual({
      url: 'www.example.com',
      href: 'https://www.example.com',
    })
  })

  it('drops trailing sentence punctuation from the url', () => {
    expect(extractLinkPreview('go to https://example.com.')?.url).toBe('https://example.com')
  })

  it('returns null when the body has no link', () => {
    expect(extractLinkPreview('just words')).toBeNull()
    expect(extractLinkPreview('')).toBeNull()
  })

  it('does not treat a scripting scheme as a link at all', () => {
    // The pattern only matches http(s):// and www., so a `javascript:` URL is
    // never promoted to a link. Not linking it is strictly safer than linking
    // it without an href.
    expect(extractLinkPreview('javascript:alert(1)')).toBeNull()
  })

  it('keeps a detected link whose href fails the allowlist as text', () => {
    // Reachable for a matched `https:` URL that embeds credentials: the
    // pattern matches, `isSafePreviewUrl` rejects.
    expect(extractLinkPreview('https://user:secret@example.com')).toEqual({
      url: 'https://user:secret@example.com',
      href: null,
    })
  })
})

describe('normalizeAttachments', () => {
  const valid = { id: 'a1', name: 'receipt.pdf', size: 2048, contentType: 'application/pdf', url: 'https://cdn.example.com/a1' }

  it('accepts a well-formed payload', () => {
    expect(normalizeAttachments([valid])).toEqual([valid])
  })

  it('returns an empty list for missing or malformed payloads', () => {
    expect(normalizeAttachments(undefined)).toEqual([])
    expect(normalizeAttachments(null)).toEqual([])
    expect(normalizeAttachments('receipt.pdf')).toEqual([])
    expect(normalizeAttachments({})).toEqual([])
  })

  it('drops entries that are missing required fields or mistyped', () => {
    expect(normalizeAttachments([{ ...valid, id: '' }])).toEqual([])
    expect(normalizeAttachments([{ ...valid, name: 42 }])).toEqual([])
    expect(normalizeAttachments([{ ...valid, url: 'javascript:alert(1)' }])).toEqual([])
    expect(normalizeAttachments([null, 'x', 7, valid])).toEqual([valid])
  })

  it('coerces a numeric string size and defaults an unusable one to zero', () => {
    expect(normalizeAttachments([{ ...valid, size: '512' }])[0]?.size).toBe(512)
    expect(normalizeAttachments([{ ...valid, size: -5 }])[0]?.size).toBe(0)
    expect(normalizeAttachments([{ ...valid, contentType: '' }])[0]?.contentType).toBe('application/octet-stream')
  })

  it('caps the chip count so a malformed payload cannot render unbounded UI', () => {
    const many = Array.from({ length: 25 }, (_, index) => ({ ...valid, id: `a${index}` }))
    expect(normalizeAttachments(many)).toHaveLength(MAX_ATTACHMENTS)
  })

  it('truncates a long label', () => {
    const [chip] = normalizeAttachments([{ ...valid, name: 'x'.repeat(200) }])
    expect(chip?.name.length).toBeLessThanOrEqual(60)
    expect(chip?.name.endsWith('\u2026')).toBe(true)
  })
})

describe('formatAttachmentSize', () => {
  it('formats byte counts', () => {
    expect(formatAttachmentSize(0)).toBe('0 B')
    expect(formatAttachmentSize(512)).toBe('512 B')
    expect(formatAttachmentSize(2048)).toBe('2.0 KB')
    expect(formatAttachmentSize(1024 * 1024 * 1.5)).toBe('1.5 MB')
  })

  it('treats unusable input as empty', () => {
    expect(formatAttachmentSize(Number.NaN)).toBe('0 B')
    expect(formatAttachmentSize(-1)).toBe('0 B')
  })

  it('elides whitespace in a label', () => {
    expect(truncateAttachmentName('  a   b  ')).toBe('a b')
  })
})

describe('optimistic send lifecycle', () => {
  it('creates a sending message from a draft', () => {
    const message = createPendingMessage(
      { ...DRAFT, body: '  Hello there  ' },
      { id: 'p1', senderId: 'me', createdAt: AT },
    )
    expect(message).toMatchObject({ id: 'p1', body: 'Hello there', status: 'sending', senderId: 'me' })
  })

  it('appends a pending message in chronological order', () => {
    const older = sent('s0', new Date('2026-01-01T09:00:00.000Z'))
    expect(appendPending([older], pending('p1')).map((m) => m.id)).toEqual(['s0', 'p1'])
    expect(appendPending([sent('s2', new Date('2026-01-01T11:00:00.000Z'))], pending('p1')).map((m) => m.id)).toEqual([
      'p1',
      's2',
    ])
  })

  it('does not duplicate a message that is already present', () => {
    const list = [pending('p1')]
    expect(appendPending(list, pending('p1'))).toHaveLength(1)
  })

  it('replaces the pending entry in place when the server confirms', () => {
    const list = [sent('s0'), pending('p1'), sent('s2', new Date('2026-01-01T11:00:00.000Z'))]
    const saved = { ...pending('p1'), id: 'server-1', status: 'sent' as const }
    const next = confirmPending(list, 'p1', saved)

    expect(next.map((m) => m.id)).toEqual(['s0', 'server-1', 's2'])
    expect(next[1]?.status).toBe('sent')
  })

  it('ignores a confirmation for a message that is no longer present', () => {
    const list = [sent('s0')]
    expect(confirmPending(list, 'p1', pending('p1'))).toBe(list)
  })

  it('marks a failed send in place and keeps the typed text', () => {
    const next = failPending([pending('p1', 'do not lose this')], 'p1', 'Network unreachable')
    expect(next[0]).toMatchObject({
      id: 'p1',
      status: 'failed',
      failureReason: 'Network unreachable',
      body: 'do not lose this',
    })
  })

  it('is a no-op when failing an unknown or already-sent message', () => {
    const list = [sent('s0')]
    expect(failPending(list, 'nope', 'x')).toBe(list)
  })

  it('retries a failed message and clears its reason', () => {
    const failed = failPending([pending('p1')], 'p1', 'boom')
    const retried = retryPending(failed, 'p1')
    expect(retried[0]?.status).toBe('sending')
    expect(retried[0]?.failureReason).toBeUndefined()
  })

  it('only retries messages that actually failed', () => {
    const list = [sent('s0'), pending('p1')]
    expect(retryPending(list, 's0')).toBe(list)
    expect(retryPending(list, 'missing')).toBe(list)
  })

  it('dismisses a failed message', () => {
    const failed = failPending([sent('s0'), pending('p1')], 'p1', 'boom')
    expect(dismissMessage(failed, 'p1').map((m) => m.id)).toEqual(['s0'])
  })

  it('lists exactly the failed messages as retryable', () => {
    const list = [
      sent('s0'),
      pending('p1'),
      failPending([pending('p2')], 'p2', 'boom')[0]!,
      failPending([pending('p3')], 'p3', 'boom')[0]!,
    ]
    expect(retryableIds(list)).toEqual(['p2', 'p3'])
  })
})
