import { getCurrentGitBranch, getFirstGitCommit, getGitHubRepo, getLastGitTag, isPrerelease } from './git'
import type { ChangelogOptions, ResolvedChangelogOptions } from './types'

export function defineConfig(config: ChangelogOptions) {
  return config
}

const defaultConfig: ChangelogOptions = {
  scopeMap: {},
  types: {
    feat: { title: '🚀 Features' },
    fix: { title: '🐞 Bug Fixes' },
    perf: { title: '🏎 Performance' },
  },
  titles: {
    breakingChanges: '🚨 Breaking Changes',
  },
  contributors: true,
  capitalize: true,
  group: true,
}

export async function resolveConfig(options: ChangelogOptions) {
  const { loadConfig } = await import('c12')
  const config = await loadConfig<ChangelogOptions>({
    name: 'changelogithub',
    defaults: defaultConfig,
    overrides: options,
  }).then(r => r.config || defaultConfig)

  config.from = config.from || await getLastGitTag()
  config.to = config.to || await getCurrentGitBranch()
  // @ts-expect-error backward compatibility
  config.repo = config.repo || config.github || await getGitHubRepo()

  if (typeof config.repo !== 'string')
    throw new Error(`Invalid GitHub repository, expected a string but got ${JSON.stringify(config.repo)}`)

  config.prerelease = config.prerelease ?? isPrerelease(config.to)

  if (config.to === config.from)
    config.from = await getLastGitTag(-1) || await getFirstGitCommit()

  return config as ResolvedChangelogOptions
}
