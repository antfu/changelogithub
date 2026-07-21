import { describe, expect, it } from 'vitest'
import { escapeHtml } from '../src/utils'

describe('escapeHtml', () => {
  it('escapes angle brackets so markdown/HTML is not broken', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('escapes ampersands', () => {
    expect(escapeHtml('foo & bar')).toBe('foo &amp; bar')
  })

  it('escapes quotes', () => {
    expect(escapeHtml(`use "double" and 'single' quotes`)).toBe('use &quot;double&quot; and &#39;single&#39; quotes')
  })

  it('does not double-escape entities produced by the ampersand replacement', () => {
    // a naive implementation that chains .replace('<', '&lt;') and then
    // .replace('&', '&amp;') would turn `<` into `&amp;lt;` instead of `&lt;`
    expect(escapeHtml('<')).toBe('&lt;')
    expect(escapeHtml('generic<T>')).toBe('generic&lt;T&gt;')
  })

  it('leaves strings without special characters untouched', () => {
    expect(escapeHtml('nothing to escape here')).toBe('nothing to escape here')
  })

  it('handles empty strings', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('escapes every special character in a mixed string', () => {
    expect(escapeHtml(`<a href="x">it's & "fun"</a>`))
      .toBe('&lt;a href=&quot;x&quot;&gt;it&#39;s &amp; &quot;fun&quot;&lt;/a&gt;')
  })
})
