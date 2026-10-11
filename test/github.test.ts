import type { ChangelogOptions, Commit } from '../src'
import { $fetch } from 'ofetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveAuthors } from '../src'

vi.mock('ofetch', () => ({ $fetch: vi.fn() }))

const options: ChangelogOptions = { baseUrl: 'github.com', baseUrlApi: 'api.github.com', token: 'token' }

function commit(shortHash: string, authors: { name: string, email: string }[]) {
  return { shortHash, authors } as Commit
}

function userRequests() {
  return vi.mocked($fetch).mock.calls.map(([url]) => url).filter(url => String(url).includes('/user/'))
}

describe('resolveAuthors', () => {
  beforeEach(() => {
    vi.mocked($fetch).mockReset()
    vi.mocked($fetch).mockImplementation((async (url: string) => {
      if (url === 'https://api.github.com/user/42')
        return { login: 'janedoe' }
      throw new Error('Not Found')
    }) as any)
  })

  it('resolves co-authors with a noreply address by account ID', async () => {
    const authors = await resolveAuthors([
      commit('1234567', [
        { name: 'github-actions[bot]', email: '41898282+github-actions[bot]@users.noreply.github.com' },
        { name: 'Jane Doe', email: '42+oldname@users.noreply.github.com' },
      ]),
    ], options)

    expect(authors.map(a => a.login)).toEqual(['janedoe'])
    expect(userRequests()).toEqual(['https://api.github.com/user/42'])
  })

  it('does not look up noreply addresses without an ID', async () => {
    const authors = await resolveAuthors([
      commit('1234567', [{ name: 'Jane Doe', email: 'janedoe@users.noreply.github.com' }]),
    ], options)

    expect(authors.map(a => a.login)).toEqual([undefined])
    expect(userRequests()).toEqual([])
  })

  it('does not look up github.com noreply addresses on another host', async () => {
    const authors = await resolveAuthors([
      commit('1234567', [{ name: 'Jane Doe', email: '42+janedoe@users.noreply.github.com' }]),
    ], { ...options, baseUrl: 'github.acme.com', baseUrlApi: 'github.acme.com/api/v3' })

    expect(authors.map(a => a.login)).toEqual([undefined])
    expect(userRequests()).toEqual([])
  })

  it('does not resolve anything without a token', async () => {
    const authors = await resolveAuthors([
      commit('1234567', [{ name: 'Jane Doe', email: '42+janedoe@users.noreply.github.com' }]),
    ], { ...options, token: undefined })

    expect(authors.map(a => a.login)).toEqual([undefined])
    expect($fetch).not.toHaveBeenCalled()
  })
})
