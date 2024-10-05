import type { GitCommit, RawGitCommit } from 'changelogen'
import type { ChangelogenOptions } from './types'
import { notNullish } from '@antfu/utils'
import { parseGitCommit } from 'changelogen'

export function parseCommits(commits: RawGitCommit[], config: ChangelogenOptions): GitCommit[] {
  return commits.map(commit => parseGitCommit(commit, config)).filter(notNullish)
}
