import type { GitCommit } from 'changelogen'
import type { ChangelogenOptions } from './types'

export function generateMarkdown(commits: GitCommit[], config: ChangelogenOptions) {
  const typeGroups = groupBy(commits, 'type')

  let markdown = ''
  const breakingChanges: string[] = []

  for (const type in config.types) {
    const group = typeGroups[type]
    if (!group || !group.length)
      continue

    const lines = group.reverse()
      .map((commit) => {
        const scope = commit.scope ? `**${commit.scope.trim()}:** ` : ''
        const ref = `([${commit.references[0]}](https://github.com/${config.github}/commit/${commit.references[0]}))`
        const line = `- ${scope}${commit.description} ${ref}`
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

    markdown += `\n\n### ${config.types[type].title}\n\n${lines.join('\n')}`
  }

  if (breakingChanges.length)
    markdown = `## Breaking Changes\n\n${breakingChanges.join('\n')}\n${markdown}`

  const url = `https://github.com/${config.github}/compare/${config.from}...${config.to}`

  markdown += '\n\n----\n\n'
  markdown += `[Changes on GitHub](${url})\n`

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
