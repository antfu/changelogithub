import { getCurrentGitBranch, getFirstGitCommit, getGitHubRepo, getLastGitTag, isPrerelease } from './git'
import type { ChangelogOptions, ResolvedChangelogOptions } from './types'

export function defineConfig(config: ChangelogOptions) {
  return config
}

export async function resolveConfig(options: ChangelogOptions) {
  const { loadConfig } = await import('c12')
  const { config } = await loadConfig<ChangelogOptions>({
    name: 'changelogithub',
    defaults: {
      scopeMap: {},
      types: {
        feat: { title: '🚀 Features' },
        fix: { title: '🐞 Bug Fixes' },
        perf: { title: '🏎 Performance' },
      },
      titles: {
        breakingChanges: '🚨 Breaking Changes',
        contributors: '❤️ Contributors',
      },
      contributors: true,
      capitalize: true,
      groupByScope: true,
    },
    overrides: options,
  })

  config.from = config.from || await getLastGitTag()
  config.to = config.to || await getCurrentGitBranch()
  config.github = config.github || await getGitHubRepo()
  config.prerelease = config.prerelease ?? isPrerelease(config.to)

  if (config.to === config.from)
    config.from = await getLastGitTag(-1) || await getFirstGitCommit()

  return config as ResolvedChangelogOptions
}
