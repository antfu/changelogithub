import { notNullish } from '@antfu/utils'
import type { GitCommit, GitCommitAuthor, RawGitCommit } from 'changelogen'
import type { ChangelogenOptions } from './types'

export function parseCommits(commits: RawGitCommit[], config: ChangelogenOptions): GitCommit[] {
  return commits.map(commit => parseGitCommit(commit, config)).filter(notNullish)
}

// https://www.conventionalcommits.org/en/v1.0.0/
// https://regex101.com/r/FSfNvA/1
const ConventionalCommitRegex = /(?<type>[a-z]+)(\((?<scope>.+)\))?(?<breaking>!)?: (?<description>.+)/i
const CoAuthoredByRegex = /Co-authored-by:\s*(?<name>.+)(<(?<email>.+)>)/gmi
const ReferencesRegex = /\((#[0-9]+)\)/gm

export function parseGitCommit(commit: RawGitCommit, config: ChangelogenOptions): GitCommit | null {
  const match = commit.message.match(ConventionalCommitRegex)
  if (!match)
    return null

  const groups = match.groups!
  const type = groups.type

  const rawScope = groups.scope || ''
  const scope = config.scopeMap[rawScope] || rawScope

  const isBreaking = Boolean(groups.breaking) || rawScope.toLowerCase().includes('breaking')
  let description = groups.description

  // Extract references from message
  const references = []

  const matches = description.matchAll(ReferencesRegex)
  for (const m of matches) {
    // Remove brackets for references
    references.push(m[1])
  }

  if (!references.length)
    references.push(commit.shortHash)

  // Remove references and normalize
  description = description.replace(ReferencesRegex, '').trim()

  // Find all authors
  const authors: GitCommitAuthor[] = [commit.author]
  for (const match of commit.body.matchAll(CoAuthoredByRegex)) {
    authors.push({
      name: (match.groups!.name || '').trim(),
      email: (match.groups!.email || '').trim(),
    })
  }

  return {
    ...commit,
    authors,
    description,
    type,
    scope,
    references,
    isBreaking,
  }
}
