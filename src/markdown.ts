import { partition } from '@antfu/utils'
import type { Reference } from 'changelogen'
import { convert } from 'convert-gitmoji'
import type { Commit, ResolvedChangelogOptions } from './types'

const emojisRE = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g

function formatReferences(references: Reference[], github: string, type: 'issues' | 'hash'): string {
  const refs = references
    .filter((i) => {
      if (type === 'issues')
        return i.type === 'issue' || i.type === 'pull-request'
      return i.type === 'hash'
    })
    .map((ref) => {
      if (!github)
        return ref.value
      if (ref.type === 'pull-request' || ref.type === 'issue')
        return `https://github.com/${github}/issues/${ref.value.slice(1)}`
      return `[<samp>(${ref.value.slice(0, 5)})</samp>](https://github.com/${github}/commit/${ref.value})`
    })

  const referencesString = join(refs).trim()

  if (type === 'issues')
    return referencesString && `in ${referencesString}`
  return referencesString
}

function formatLine(commit: Commit, options: ResolvedChangelogOptions) {
  const prRefs = formatReferences(commit.references, options.github, 'issues')
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
    if (scope && (useScopeGroup === true || (useScopeGroup === 'multiple' && scopes[scope].length > 1))) {
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

  return convert(lines.join('\n').trim(), true)
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
