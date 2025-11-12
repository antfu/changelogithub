import type { ChangelogOptions, ResolvedChangelogOptions } from './types'
import { getCurrentGitBranch, getFirstGitCommit, getGitHubRepo, getLastMatchingTag, getSafeTagTemplate, isPrerelease } from './git'

export function defineConfig(config: ChangelogOptions) {
  return config
}

const defaultConfig = {
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
  tag: 'v%s',
} satisfies ChangelogOptions

export async function resolveConfig(options: ChangelogOptions) {
  const { loadConfig } = await import('c12')
  const config = await loadConfig<ChangelogOptions>({
    name: 'changelogithub',
    defaults: defaultConfig,
    overrides: options,
    packageJson: 'changelogithub',
  }).then(r => r.config || defaultConfig)

  config.baseUrl = config.baseUrl ?? 'github.com'
  config.baseUrlApi = config.baseUrlApi ?? 'api.github.com'
  config.to = config.to || await getCurrentGitBranch()
  config.tagFilter = config.tagFilter ?? (() => true)
  config.tag = getSafeTagTemplate(config.tag ?? defaultConfig.tag)
  config.from = config.from || await getLastMatchingTag(
    config.to,
    config.tagFilter,
    config.tag,
  ) || await getFirstGitCommit()
  // @ts-expect-error backward compatibility
  config.repo = config.repo || config.github || await getGitHubRepo(config.baseUrl)
  // @ts-expect-error backward compatibility
  config.releaseRepo = config.releaseRepo || config.releaseGithub || config.repo
  config.prerelease = config.prerelease ?? isPrerelease(config.to)
  config.commitPaths = config.commitPaths ?? []
  if (config.commitPaths === true)
    config.commitPaths = [config.cwd ?? process.cwd()]

  if (typeof config.repo !== 'string')
    throw new Error(`Invalid GitHub repository, expected a string but got ${JSON.stringify(config.repo)}`)

  return config as ResolvedChangelogOptions
}
