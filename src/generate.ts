import { getGitDiff, parseCommits } from 'changelogen'
import type { ChangelogOptions } from './types'
import { getCurrentGitBranch, getGitHubRepo, getLastGitTag, isPrerelease } from './git'
import { generateMarkdown } from './markdown'

export async function generate(options: ChangelogOptions) {
  const config: ChangelogOptions = {
    scopeMap: {},
    types: {
      feat: { title: '🚀 Features' },
      fix: { title: '🐞 Bug Fixes' },
      perf: { title: '🏎 Performance' },
    },
    breakingChangeMessage: '🚨 Breaking Changes',
    ...options as any,
  }

  config.from = config.from || await getLastGitTag()
  config.to = config.to || await getCurrentGitBranch()
  config.github = config.github || await getGitHubRepo()
  config.prerelease = config.prerelease ?? isPrerelease(config.to)

  if (config.to === config.from)
    config.from = await getLastGitTag(-2)

  const rawCommits = await getGitDiff(config.from, config.to)
  const commits = parseCommits(rawCommits, config)
  const md = generateMarkdown(commits, config)

  return { config, md, commits }
}
