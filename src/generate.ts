import type { ChangelogOptions } from './types'
import { getGitDiff } from 'changelogen'
import { resolveConfig } from './config'
import { resolveAuthors } from './github'
import { parseCommits } from './parse'
import { generateMarkdown } from './style/markdown'
import { generatePlain } from './style/plain'

export async function generate(options: ChangelogOptions) {
  const resolved = await resolveConfig(options)

  const rawCommits = await getGitDiff(resolved.from, resolved.to)
  const commits = parseCommits(rawCommits, resolved)
  if (resolved.contributors)
    await resolveAuthors(commits, resolved)

  let output: string

  switch (resolved.style) {
    case 'markdown':
      output = generateMarkdown(commits, resolved)
      break
    case 'plain':
      output = generatePlain(commits, resolved)
      break
    default:
      throw new Error(`Invalid style: ${resolved.style}`)
  }

  return { config: resolved, output, commits }
}
