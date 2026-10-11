import type { Commit } from '../src'
import { describe, expect, it } from 'vitest'
import { resolveAuthors } from '../src'

function commit(shortHash: string, authors: { name: string, email: string }[]) {
  return { shortHash, authors } as Commit
}

describe('resolveAuthors', () => {
  it('resolves co-authors with a noreply address without a token', async () => {
    const authors = await resolveAuthors([
      commit('1234567', [
        { name: 'github-actions[bot]', email: '41898282+github-actions[bot]@users.noreply.github.com' },
        { name: 'Jane Doe', email: '42+janedoe@users.noreply.github.com' },
      ]),
    ], { baseUrl: 'github.com' })

    expect(authors.map(a => a.login)).toEqual(['janedoe'])
  })

  it('resolves the noreply format without an ID', async () => {
    const authors = await resolveAuthors([
      commit('1234567', [{ name: 'Jane Doe', email: 'janedoe@users.noreply.github.com' }]),
    ], { baseUrl: 'github.com' })

    expect(authors.map(a => a.login)).toEqual(['janedoe'])
  })

  it('does not map github.com noreply addresses to logins on another host', async () => {
    const authors = await resolveAuthors([
      commit('1234567', [{ name: 'Jane Doe', email: '42+janedoe@users.noreply.github.com' }]),
    ], { baseUrl: 'github.acme.com' })

    expect(authors.map(a => a.login)).toEqual([undefined])
  })

  it('leaves other addresses unresolved without a token', async () => {
    const authors = await resolveAuthors([
      commit('1234567', [{ name: 'Jane Doe', email: 'jane@example.com' }]),
    ], { baseUrl: 'github.com' })

    expect(authors.map(a => a.login)).toEqual([undefined])
  })
})
