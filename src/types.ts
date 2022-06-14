export interface GitHubRepo {
  owner: string
  repo: string
}

export interface GitHubAuth {
  token: string
  url: string
}

export interface ChangelogenOptions {
  types: Record<string, { title: string }>
  scopeMap: Record<string, string>
  github: string
  from: string
  to: string
}

export interface ChangelogOptions extends Partial<ChangelogenOptions> {
  /**
   * Dry run. Skip releasing to GitHub.
   */
  dry?: boolean
  /**
   * Wether includes the contributors section
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
    contributors?: string
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
  groupByScope?: boolean
}

export type ResolvedChangelogOptions = Required<ChangelogOptions>

export interface AuthorInfo {
  commits: string[]
  login?: string
  email: string
  name: string
}
