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

export interface ChangelogOptions extends ChangelogenOptions {
  draft?: boolean
  prerelease?: boolean
  dry?: boolean
  name?: string
  token: string
  breakingChangeMessage: string
}

export interface AuthorInfo {
  commits: string[]
  login?: string
  email: string
  name: string
}
