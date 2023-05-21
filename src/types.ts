import type { ChangelogConfig, GitCommit } from 'changelogen'

export type ChangelogenOptions = ChangelogConfig

export interface GitHubRepo {
  owner: string
  repo: string
}

export interface GitHubAuth {
  token: string
  url: string
}

export interface Commit extends GitCommit {
  resolvedAuthors?: AuthorInfo[]
}

export interface ChangelogOptions extends Partial<ChangelogenOptions> {
  /**
   * Dry run. Skip releasing to GitHub.
   */
  dry?: boolean
  /**
   * Whether to include contributors in release notes.
   *
   * @default true
   */
  contributors?: boolean
  /**
   * Name of the release
   */
  name?: string
  /**
   * Mark the release as a draft
   */
  draft?: boolean
  /**
   * Mark the release as prerelease
   */
  prerelease?: boolean
  /**
   * GitHub Token
   */
  token?: string
  /**
   * Custom titles
   */
  titles?: {
    breakingChanges?: string
  }
  /**
   * Capitalize commit messages
   * @default true
   */
  capitalize?: boolean
  /**
   * Nest commit messages under their scopes
   * @default true
   */
  group?: boolean | 'multiple'
  /**
   * Use emojis in section titles
   * @default true
   */
  emoji?: boolean
}

export type ResolvedChangelogOptions = Required<ChangelogOptions>

export interface AuthorInfo {
  commits: string[]
  login?: string
  email: string
  name: string
}
