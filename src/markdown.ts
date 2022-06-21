import { partition } from '@antfu/utils'
import type { Commit, ResolvedChangelogOptions } from './types'

function formatLine(commit: Commit, options: ResolvedChangelogOptions) {
  const refs = commit.references.map((r) => {
    if (!options.github)
      return `\`${r}\``
    const url = r[0] === '#'
      ? `https://github.com/${options.github}/issues/${r.slice(1)}`
      : `https://github.com/${options.github}/commit/${r}`
    return `[\`${r}\`](${url})`
  }).join(' ')

  let authors = commit.resolvedAuthors?.map(i => i.login ? `@${i.login}` : i.name).join(' ').trim()
  if (authors)
    authors = `by ${authors}`

  const description = options.capitalize ? capitalize(commit.description) : commit.description

  return [description, refs, authors].filter(i => i?.trim()).join(' ')
}

function formatTitle(name: string) {
  return `### &nbsp;&nbsp;&nbsp;${name}`
}

function formatSection(commits: Commit[], sectionName: string, options: ResolvedChangelogOptions) {
  if (!commits.length)
    return []

  const lines: string[] = [
    '',
    formatTitle(sectionName),
    '',
  ]

  const scopes = groupBy(commits, 'scope')
  Object.keys(scopes).sort().forEach((scope) => {
    let padding = ''
    let prefix = ''
    const scopeText = `**${options.scopeMap[scope] || scope}**`
    if (scope && options.groupByScope) {
      lines.push(`- ${scopeText}:`)
      padding = '  '
    }
    else if (scope) {
      prefix = `${scopeText}: `
    }

    lines.push(...scopes[scope]
      .reverse()
      .map(commit => `${padding}- ${prefix}${formatLine(commit, options)}`),
    )
  })

  return lines
}

export function generateMarkdown(commits: Commit[], options: ResolvedChangelogOptions) {
  const lines: string[] = []

  const [breaking, changes] = partition(commits, c => c.isBreaking)

  const group = groupBy(changes, 'type')

  lines.push(
    ...formatSection(breaking, options.titles.breakingChanges!, options),
  )

  for (const type of Object.keys(options.types)) {
    const items = group[type] || []
    lines.push(
      ...formatSection(items, options.types[type].title, options),
    )
  }

  if (!lines.length)
    lines.push('*No significant changes*')

  const url = `https://github.com/${options.github}/compare/${options.from}...${options.to}`

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
