import { partition } from '@antfu/utils'
import { convert } from 'convert-gitmoji'
import { capitalize, emojisRE, groupBy } from './utils'
import type { Commit, ResolvedChangelogOptions } from './types'

function formatReferences(options: ResolvedChangelogOptions, references: string[], type: 'pr' | 'hash'): string {
  const refs = references
    .filter((ref) => {
      if (type === 'pr')
        return ref[0] === '#'
      return ref[0] !== '#'
    })
    .map(ref => options.preset.formatSingleReference({ options, ref, type }))

  return options.preset.formatReferences({ options, type, refs })
}

function formatLine(commit: Commit, options: ResolvedChangelogOptions) {
  const prRefs = formatReferences(options, commit.references, 'pr')
  const hashRefs = formatReferences(options, commit.references, 'hash')
  const authors = options.preset.formatAuthors({ options, authors: commit.resolvedAuthors })
  const refs = options.preset.formatCommitSuffix({ options, authors, prRefs, hashRefs })
  const description = options.capitalize ? capitalize(commit.description) : commit.description

  return [description, refs].filter(i => i?.trim()).join(' ')
}

function formatSection(commits: Commit[], title: string, options: ResolvedChangelogOptions) {
  if (!commits.length)
    return []

  if (!options.emoji)
    title = title.replace(emojisRE, '')

  const lines: string[] = [
    '',
    options.preset.formatTitle({ title, options }),
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

  lines.push(...formatSection(breaking, options.titles.breakingChanges!, options))

  for (const type of Object.keys(options.types)) {
    const items = group[type] || []
    lines.push(...formatSection(items, options.types[type].title, options))
  }

  if (!lines.length)
    lines.push(options.preset.formatEmptyChangelog({ options }))

  lines.push('', options.preset.formatDiff({
    options,
    url: `https://github.com/${options.github}/compare/${options.from}...${options.to}`,
  }))

  return convert(lines.join('\n').trim(), true)
}
