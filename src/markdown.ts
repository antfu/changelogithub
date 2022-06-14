import type { GitCommit } from 'changelogen'
import { partition } from '@antfu/utils'
import type { AuthorInfo, ResolvedChangelogOptions } from './types'

function formatLine(commit: GitCommit, github: string) {
  const refs = commit.references.map((r) => {
    if (!github)
      return `\`${r}\``
    const url = r[0] === '#'
      ? `https://github.com/${github}/issues/${r.slice(1)}`
      : `https://github.com/${github}/commit/${r}`
    return `[\`${r}\`](${url})`
  }).join(' ')
  return `- ${capitalize(commit.description)} ${refs}`
}

function formatTitle(name: string) {
  return `### &nbsp;&nbsp;&nbsp;${name}`
}

function formatSection(commits: GitCommit[], sectionName: string, config: ResolvedChangelogOptions) {
  if (!commits.length)
    return []
  const lines: string[] = [
    '',
    formatTitle(sectionName),
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

export function generateMarkdown(commits: GitCommit[], config: ResolvedChangelogOptions, contributors?: AuthorInfo[]) {
  const lines: string[] = []

  const [breaking, changes] = partition(commits, c => c.isBreaking)

  const group = groupBy(changes, 'type')

  lines.push(
    ...formatSection(breaking, config.titles.breakingChanges!, config),
  )

  for (const type of Object.keys(config.types)) {
    const items = group[type] || []
    lines.push(
      ...formatSection(items, config.types[type].title, config),
    )
  }

  if (!lines.length)
    lines.push('*No significant changes*')

  if (contributors?.length) {
    lines.push(
      '',
      formatTitle(config.titles.contributors!),
      '',
      `&nbsp;&nbsp;&nbsp;Thanks to ${contributors.map(i => i.login ? `@${i.login}` : i.name).join(' | ')}`,
    )
  }

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

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
