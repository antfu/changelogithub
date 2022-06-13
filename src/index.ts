/* eslint-disable no-console */
import { $fetch } from 'ohmyfetch'
import { getGitDiff, parseCommits } from 'changelogen'
import semver from 'semver'
import { blue, bold, cyan, dim, green } from 'kolorist'
import type { ChangelogOptions } from './types'
import { getCurrentGitBranch, getGitHubRepo, getLastGitTag } from './git'
import { generateMarkdown } from './markdown'

export default async function changelogithub(
  options: ChangelogOptions,
) {
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

  if (config.to === config.from)
    config.from = await getLastGitTag(-2)

  const rawCommits = await getGitDiff(config.from, config.to)
  const commits = parseCommits(rawCommits, config)

  if (!commits.length) {
    console.log('No commits')
    process.exitCode = 1
    return
  }

  const md = generateMarkdown(commits, config)

  console.log(bold(config.github))
  console.log(cyan(config.from) + dim(' -> ') + blue(config.to))
  console.log(dim('--------------'))
  console.log()
  console.log(md)
  console.log()
  console.log(dim('--------------'))

  if (config.dry)
    return

  await sendRelease(config, md)
}

async function sendRelease(
  options: ChangelogOptions,
  content: string,
) {
  const headers = {
    accept: 'application/vnd.github.v3+json',
    authorization: `token ${options.token}`,
  }
  let url = `https://api.github.com/repos/${options.github}/releases`
  let method = 'POST'
  try {
    const exists = await $fetch(`https://api.github.com/repos/${options.github}/releases/tags/${options.to}`, {
      headers,
    })
    if (exists.url) {
      url = exists.url
      method = 'PATCH'
    }
  }
  catch (e) {
  }

  const version = options.from.startsWith('v') ? options.to.slice(1) : options.to
  const body = {
    body: content,
    draft: options.draft || false,
    name: options.name || options.to,
    prerelease: options.prerelease || semver.parse(version)!.prerelease.length > 0,
    tag_name: options.to,
  }

  console.log(cyan(method === 'POST' ? 'Creating release notes...' : 'Updating release notes...'))
  const res = await $fetch(url, {
    method,
    body: JSON.stringify(body),
    headers,
  })
  console.log(green(`Release: ${res.html_url}`))
}
