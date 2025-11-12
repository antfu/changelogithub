import type { ChangelogConfig, GitCommit, RepoConfig } from 'changelogen'

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
  /**
   * Github base url
   * @default github.com
   */
  baseUrl?: string
  /**
   * Github base API url
   * @default api.github.com
   */
  baseUrlApi?: string

  /**
   * Filter tags
   */
  tagFilter?: (tag: string) => boolean

  /**
   * Release repository, defaults to `repo`
   */
  releaseRepo?: RepoConfig | string

  /**
   * Can be set to a custom tag string
   * Any `%s` placeholders in the tag string will be replaced
   * If the tag string does _not_ contain any `%s` placeholders,
   * then the version number will be appended to the tag.
   *
   * @default `v%s`.
   */
  tag?: string

  /**
   * Files to upload as assets to the release
   * `--assets path1,path2` or `--assets path1 --assets path2`
   */
  assets?: string[] | string

  /**
   * Paths to filter commits by
   * If true, CWD will be used as the path
   */
  commitPaths?: string[] | true
}

export type ResolvedChangelogOptions = Required<ChangelogOptions>

export interface AuthorInfo {
  commits: string[]
  login?: string
  email: string
  name: string
}
