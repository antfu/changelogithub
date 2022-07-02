import { partition } from '@antfu/utils'
import type { Commit, ResolvedChangelogOptions } from './types'

const emojisRE = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g

function formatReferences(references: string[], github: string, type: 'pr' | 'hash'): string {
  const refs = references
    .filter((ref) => {
      if (type === 'pr')
        return ref[0] === '#'

      return ref[0] !== '#'
    })
    .map((ref) => {
      if (!github)
        return ref

      if (type === 'pr')
        return `https://github.com/${github}/issues/${ref.slice(1)}`

      return `[<samp>${ref.slice(0, 5)}</samp>](https://github.com/${github}/commit/${ref})`
    })

  const referencesString = join(refs).trim()

  if (type === 'pr')
    return referencesString && `in ${referencesString}`

  return referencesString && `(${referencesString})`
}

function formatLine(commit: Commit, options: ResolvedChangelogOptions) {
  const prRefs = formatReferences(commit.references, options.github, 'pr')
  const hashRefs = formatReferences(commit.references, options.github, 'hash')

  let authors = join([...new Set(commit.resolvedAuthors?.map(i => i.login ? `@${i.login}` : `**${i.name}**`))])?.trim()
  if (authors)
    authors = `by ${authors}`

  let refs = [authors, prRefs, hashRefs].filter(i => i?.trim()).join(' ')

  if (refs)
    refs = `&nbsp;-&nbsp; ${refs}`

  const description = options.capitalize ? capitalize(commit.description) : commit.description

  return [description, refs].filter(i => i?.trim()).join(' ')
}

function formatTitle(name: string, options: ResolvedChangelogOptions) {
  if (!options.emoji)
    name = name.replace(emojisRE, '')

  return `### &nbsp;&nbsp;&nbsp;${name.trim()}`
}

function formatSection(commits: Commit[], sectionName: string, options: ResolvedChangelogOptions) {
  if (!commits.length)
    return []

  const lines: string[] = [
    '',
    formatTitle(sectionName, options),
    '',
  ]

  const scopes = groupBy(commits, 'scope')
  let useScopeGroup = options.group

  // group scopes only when one of the scope have multiple commits
  if (!Object.entries(scopes).some(([k, v]) => k && v.length > 1))
    useScopeGroup = false

  Object.keys(scopes).sort().forEach((scope) => {
    let padding = ''
    let prefix = ''
    const scopeText = `**${options.scopeMap[scope] || scope}**`
    if (scope && useScopeGroup) {
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

function join(array?: string[], glue = ', ', finalGlue = ' and '): string {
  if (!array || array.length === 0)
    return ''

  if (array.length === 1)
    return array[0]

  if (array.length === 2)
    return array.join(finalGlue)

  return `${array.slice(0, -1).join(glue)}${finalGlue}${array.slice(-1)}`
}
