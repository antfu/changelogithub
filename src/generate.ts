import { getGitDiff, parseCommits } from 'changelogen'
import type { ChangelogOptions } from './types'
import { generateMarkdown } from './markdown'
import { getContributors } from './github'
import { resolveConfig } from './config'

export async function generate(options: ChangelogOptions) {
  const resolved = await resolveConfig(options)

  const rawCommits = await getGitDiff(resolved.from, resolved.to)
  const commits = parseCommits(rawCommits, resolved)
  const contributors = resolved.contributors ? await getContributors(commits, resolved) : undefined
  const md = generateMarkdown(commits, resolved, contributors)

  return { config: resolved, md, commits }
}
