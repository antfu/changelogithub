import { getGitDiff, parseCommits } from 'changelogen'
import type { ChangelogOptions } from './types'
import { generateMarkdown } from './markdown'
import { getGitHubLogins } from './github'
import { resolveConfig } from './config'

export async function generate(options: ChangelogOptions) {
  const resolved = await resolveConfig(options)

  const rawCommits = await getGitDiff(resolved.from, resolved.to)
  const commits = parseCommits(rawCommits, resolved)
  const contributors = await getGitHubLogins(commits, resolved)
  const md = generateMarkdown(commits, resolved, contributors)

  return { config: resolved, md, commits }
}
