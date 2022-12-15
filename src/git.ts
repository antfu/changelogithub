export async function getGitHubRepo() {
  const url = await execCommand('git', ['config', '--get', 'remote.origin.url'])
  const match = url.match(/github\.com[\/:]([\w\d._-]+?)\/([\w\d._-]+?)(\.git)?$/i)
  if (!match)
    throw new Error(`Can not parse GitHub repo from url ${url}`)
  return `${match[1]}/${match[2]}`
}

export async function getCurrentGitBranch() {
  return await execCommand('git', ['tag', '--points-at', 'HEAD']) || await execCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
}

export async function isRepoShallow() {
  return (await execCommand('git', ['rev-parse', '--is-shallow-repository'])).trim() === 'true'
}

export async function getLastGitTag(delta = 0) {
  const tags = await execCommand('git', ['--no-pager', 'tag', '-l', '--sort=creatordate']).then(r => r.split('\n'))
  return tags[tags.length + delta - 1]
}

export async function isRefGitTag(to: string) {
  const { execa } = await import('execa')
  try {
    await execa('git', ['show-ref', '--verify', `refs/tags/${to}`], { reject: true })
  }
  catch {
    return false
  }
}

export async function getFirstGitCommit() {
  return await execCommand('git', ['rev-list', '--max-parents=0', 'HEAD'])
}

export function isPrerelease(version: string) {
  return !/^[^.]*[\d.]+$/.test(version)
}

async function execCommand(cmd: string, args: string[]) {
  const { execa } = await import('execa')
  const res = await execa(cmd, args)
  return res.stdout.trim()
}
