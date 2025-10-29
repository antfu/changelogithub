import type { ChangelogOptions } from './types'
import { getGitDiff } from 'changelogen'
import { resolveConfig } from './config'
import { resolveAuthors } from './github'
import { generateMarkdown } from './format/markdown'
import { parseCommits } from './parse'
import { generatePlain } from './format/plain'

export async function generate(options: ChangelogOptions) {
  const resolved = await resolveConfig(options)

  const rawCommits = await getGitDiff(resolved.from, resolved.to)
  const commits = parseCommits(rawCommits, resolved)
  if (resolved.contributors)
    await resolveAuthors(commits, resolved)

  let output: string

  switch (resolved.format) {
    case 'markdown':
      output = generateMarkdown(commits, resolved)
      break
    case 'plain':
      output = generatePlain(commits, resolved)
      break
    default:
      throw new Error(`Invalid format: ${resolved.format}`)
  }

  return { config: resolved, output, commits }
}
