import { execa } from 'execa'

export async function getGitHubRepo() {
  const res = await execa('git', ['config', '--get', 'remote.origin.url'])
  const url = String(res.stdout).trim()
  const match = url.match(/github\.com\/(\w+)\/(\w+)(\.git)?$/i)
  if (!match)
    throw new Error(`Can not parse GitHub repo from url ${url}`)
  return `${match[1]}/${match[2]}`
}

