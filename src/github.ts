/* eslint-disable no-console */
import { $fetch } from 'ohmyfetch'
import { cyan, green } from 'kolorist'
import { notNullish } from '@antfu/utils'
import type { AuthorInfo, ChangelogOptions, Commit } from './types'

export async function sendRelease(
  options: ChangelogOptions,
  content: string,
) {
  const headers = getHeaders(options)
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

  const body = {
    body: content,
    draft: options.draft || false,
    name: options.name || options.to,
    prerelease: options.prerelease,
    tag_name: options.to,
  }
  console.log(cyan(method === 'POST' ? 'Creating release notes...' : 'Updating release notes...'))
  const res = await $fetch(url, {
    method,
    body: JSON.stringify(body),
    headers,
  })
  console.log(green(`Released on ${res.html_url}`))
}

function getHeaders(options: ChangelogOptions) {
  return {
    accept: 'application/vnd.github.v3+json',
    authorization: `token ${options.token}`,
  }
}

export async function resolveAuthorInfo(options: ChangelogOptions, info: AuthorInfo) {
  if (info.login)
    return info

  // token not provided, skip github resolving
  if (!options.token)
    return info

  try {
    const data = await $fetch(`https://api.github.com/search/users?q=${encodeURIComponent(info.email)}`, {
      headers: getHeaders(options),
    })
    info.login = data.items[0].login
  }
  catch {}

  if (info.login)
    return info

  if (info.commits.length) {
    try {
      const data = await $fetch(`https://api.github.com/repos/${options.github}/commits/${info.commits[0]}`, {
        headers: getHeaders(options),
      })
      info.login = data.author.login
    }
    catch (e) {}
  }

  return info
}

export async function resolveAuthors(commits: Commit[], options: ChangelogOptions) {
  const map = new Map<string, AuthorInfo>()
  commits.forEach((commit) => {
    commit.resolvedAuthors = commit.authors.map((a, idx) => {
      if (!a.email || !a.name)
        return null
      if (!map.has(a.email)) {
        map.set(a.email, {
          commits: [],
          name: a.name,
          email: a.email,
        })
      }
      const info = map.get(a.email)!

      // record commits only for the first author
      if (idx === 0)
        info.commits.push(commit.shortHash)

      return info
    }).filter(notNullish)
  })
  const authors = Array.from(map.values())
  const resolved = await Promise.all(authors.map(info => resolveAuthorInfo(options, info)))

  const loginSet = new Set<string>()
  const nameSet = new Set<string>()
  return resolved
    .sort((a, b) => (a.login || a.name).localeCompare(b.login || b.name))
    .filter((i) => {
      if (i.login && loginSet.has(i.login))
        return false
      if (i.login) {
        loginSet.add(i.login)
      }
      else {
        if (nameSet.has(i.name))
          return false
        nameSet.add(i.name)
      }
      return true
    })
}

export async function hasTagOnGitHub(tag: string, options: ChangelogOptions) {
  try {
    await $fetch(`https://api.github.com/repos/${options.github}/git/ref/tags/${tag}`, {
      headers: getHeaders(options),
    })
    return true
  }
  catch (e) {
    return false
  }
}
