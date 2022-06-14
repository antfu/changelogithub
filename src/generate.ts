import { getGitDiff, parseCommits } from 'changelogen'
import { loadConfig } from 'c12'
import type { ChangelogOptions } from './types'
import { getCurrentGitBranch, getGitHubRepo, getLastGitTag, isPrerelease } from './git'
import { generateMarkdown } from './markdown'
import { getGitHubLogins } from './github'

export async function generate(options: ChangelogOptions) {
  const { config: resolved } = await loadConfig<ChangelogOptions>({
    name: 'changelogithub',
    defaults: {
      scopeMap: {},
      types: {
        feat: { title: '🚀 Features' },
        fix: { title: '🐞 Bug Fixes' },
        perf: { title: '🏎 Performance' },
      },
      breakingChangeMessage: '🚨 Breaking Changes',
    } as any,
    overrides: options,
  })

  resolved.from = resolved.from || await getLastGitTag()
  resolved.to = resolved.to || await getCurrentGitBranch()
  resolved.github = resolved.github || await getGitHubRepo()
  resolved.prerelease = resolved.prerelease ?? isPrerelease(resolved.to)

  if (resolved.to === resolved.from)
    resolved.from = await getLastGitTag(-2)

  const rawCommits = await getGitDiff(resolved.from, resolved.to)
  const commits = parseCommits(rawCommits, resolved)
  const contributors = await getGitHubLogins(commits, resolved)
  const md = generateMarkdown(commits, resolved, contributors)

  return { config: resolved, md, commits }
}
