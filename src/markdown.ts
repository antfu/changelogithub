import type { GitCommit } from 'changelogen'
import { partition } from '@antfu/utils'
import { upperFirst } from 'scule'
import type { ChangelogOptions } from './types'

function formatLine(commit: GitCommit, github: string) {
  const refs = commit.references.map((r) => {
    if (!github)
      return `\`${r}\``
    const url = r[0] === '#'
      ? `https://github.com/${github}/issues/${r.slice(1)}`
      : `https://github.com/${github}/commit/${r}`
    return `[\`${r}\`](${url})`
  }).join(' ')
  return `- ${upperFirst(commit.description)} ${refs}`
}

function formatSection(commits: GitCommit[], sectionName: string, config: ChangelogOptions) {
  if (!commits.length)
    return []
  const lines: string[] = [
    '',
    `### &nbsp;&nbsp;${sectionName}`,
    '',
  ]
  const scopes = groupBy(commits, 'scope')
  const keys = Object.keys(scopes).sort()
  keys.forEach((key) => {
    let padding = ''
    if (key) {
      lines.push(`- **${key}:**`)
      padding = '  '
    }
    lines.push(...scopes[key]
      .reverse()
      .map(i => padding + formatLine(i, config.github)),
    )
  })
  return lines
}

export function generateMarkdown(commits: GitCommit[], config: ChangelogOptions) {
  const lines: string[] = []

  const [breaking, changes] = partition(commits, c => c.isBreaking)

  const group = groupBy(changes, 'type')

  lines.push(
    ...formatSection(breaking, config.breakingChangeMessage, config),
  )

  for (const type of Object.keys(config.types)) {
    const items = group[type] || []
    lines.push(
      ...formatSection(items, config.types[type].title, config),
    )
  }

  if (!lines.length)
    lines.push('*No significant changes*')

  const url = `https://github.com/${config.github}/compare/${config.from}...${config.to}`

  lines.push('', `##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](${url})`)

  return lines.join('\n').trim()
}

function groupBy<T>(items: T[], key: string, groups: Record<string, T[]> = {}) {
  for (const item of items) {
    const v = (item as any)[key] as string
    groups[v] = groups[v] || []
    groups[v].push(item)
  }
  return groups
}
