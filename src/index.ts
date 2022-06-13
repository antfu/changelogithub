import { fetch } from 'ohmyfetch'
import { getCurrentGitBranch, getGitDiff, getLastGitTag, parseCommits } from 'changelogen'
import semver from 'semver'
import type { ChangelogOptions } from './types'
import { getGitHubRepo } from './git'
import { generateMarkdown } from './markdown'

export default async function changelogithub(
  options: ChangelogOptions,
) {
  const config: ChangelogOptions = {
    scopeMap: {},
    types: {
      feat: { title: 'Features' },
      fix: { title: 'Bug Fixes' },
      perf: { title: 'Performance' },
      docs: { title: 'Documentation' },
    },
    ...options as any,
  }
  config.from = config.from || await getLastGitTag()
  config.to = config.to || await getCurrentGitBranch()
  config.github = config.github || await getGitHubRepo()

  const rawCommits = await getGitDiff(config.from, config.to)
  const commits = parseCommits(rawCommits, config)
  const md = generateMarkdown(commits, config)

  await sendRelease(config, md)
}

async function sendRelease(
  options: ChangelogOptions,
  content: string,
) {
  const url = `https://api.github.com/repos/${options.github}/releases`
  const version = options.from.startsWith('v') ? options.from.slice(1) : options.from
  const body = {
    body: content,
    draft: options.draft || false,
    name: options.name || options.from,
    prerelease: options.prerelease || semver.parse(version)!.prerelease.length > 0,
    tag_name: options.from,
  }

  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      accept: 'application/vnd.github.v3+json',
      authorization: `token ${options.token}`,
    },
  })
}
