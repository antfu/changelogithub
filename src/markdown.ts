import type { GitCommit } from 'changelogen'
import type { ChangelogOptions } from './types'

export function generateMarkdown(commits: GitCommit[], config: ChangelogOptions) {
  const group = groupBy(commits, 'type')

  const titlePadding = '&nbsp;&nbsp;&nbsp;'
  let markdown = ''
  const breakingChanges: string[] = []

  for (const type of Object.keys(group)) {
    const items = group[type] || []
    const lines = items.reverse()
      .map((commit) => {
        const scope = commit.scope ? `**${commit.scope.trim()}:** ` : ''
        const refs = commit.references.map((r) => {
          const url = r[0] === '#'
            ? `https://github.com/${config.github}/issues/${r.slice(1)}`
            : `https://github.com/${config.github}/commit/${r}`
          return `[\`${r}\`](${url})`
        }).join(' ')
        const line = `- ${scope}${commit.description} ${refs}`
        if (commit.isBreaking) {
          breakingChanges.push(line)
          return undefined
        }
        else {
          return line
        }
      })
      .filter(Boolean)

    if (!lines.length)
      continue
    if (!config.types[type])
      continue

    markdown += `\n\n### ${titlePadding}${config.types[type].title}\n\n${lines.join('\n')}`
  }

  if (!markdown)
    markdown = '*No significant changes*'

  if (breakingChanges.length)
    markdown = `### ${titlePadding}${config.breakingChangeMessage}\n\n${breakingChanges.join('\n')}${markdown}`

  const url = `https://github.com/${config.github}/compare/${config.from}...${config.to}`

  markdown += `\n\n> [Changes on GitHub](${url})\n`

  return markdown.trim()
}

function groupBy<T>(items: T[], key: string) {
  const groups: Record<string, T[]> = {}
  for (const item of items) {
    const v = (item as any)[key] as string
    groups[v] = groups[v] || []
    groups[v].push(item)
  }
  return groups
}
