import { beforeEach, expect, it, vi } from 'vitest'
import { getLastMatchingTag } from '../src/git'

const { execa } = vi.hoisted(() => ({
  execa: vi.fn(),
}))

vi.mock('execa', () => ({ execa }))

beforeEach(() => {
  execa.mockReset()
})

function mockTags(tags: string[]) {
  execa.mockResolvedValue({
    stdout: `(HEAD -> main, ${tags.map(tag => `tag: ${tag}`).join(', ')})`,
  })
}

it('finds the previous stable semantic version for a stable release', async () => {
  mockTags(['v2.0.0', 'v1.5.0-beta.1', 'release', 'v1.4.0'])

  await expect(getLastMatchingTag('v2.0.0', () => true, 'v%s'))
    .resolves
    .toBe('v1.4.0')
})

it('falls back to the previous tag for a prerelease', async () => {
  mockTags(['v2.0.0-beta.2', 'v2.0.0-beta.1', 'v1.9.0'])

  await expect(getLastMatchingTag('v2.0.0-beta.2', () => true, 'v%s'))
    .resolves
    .toBe('v2.0.0-beta.1')
})

it('falls back to the previous tag for an invalid version', async () => {
  mockTags(['latest', 'v1.9.0'])

  await expect(getLastMatchingTag('latest', () => true, 'v%s'))
    .resolves
    .toBe('v1.9.0')
})
