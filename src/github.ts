/* eslint-disable no-console */
import { $fetch } from 'ohmyfetch'
import { cyan, green } from 'kolorist'
import type { ChangelogOptions } from './types'

export async function sendRelease(
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
