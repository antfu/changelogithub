import type { AuthorInfo, ChangelogOptions } from '../types'
import githubPreset from './github'
import defaultPreset from './default'

interface FormatArguments {
  options: Omit<ChangelogOptions, 'preset'>
}

interface FormatSingleRefArguments extends FormatArguments {
  ref: string
  type: 'pr' | 'hash'
}

interface FormatRefsArguments extends FormatArguments {
  refs: string[]
  type: 'pr' | 'hash'
}

interface FormatAuthorsArguments extends FormatArguments {
  authors?: AuthorInfo[]
}

interface FormatCommitSuffixArguments extends FormatArguments {
  authors: string
  prRefs: string
  hashRefs: string
}

interface FormatTitleArguments extends FormatArguments {
  title: string
}

interface FormatDiffArguments extends FormatArguments {
  url: string
}

export interface Preset {
  name: string
  options?: Omit<ChangelogOptions, 'preset'>
  formatSingleReference: (args: FormatSingleRefArguments) => string
  formatReferences: (args: FormatRefsArguments) => string
  formatAuthors: (args: FormatAuthorsArguments) => string
  formatCommitSuffix: (args: FormatCommitSuffixArguments) => string
  formatTitle: (args: FormatTitleArguments) => string
  formatDiff: (args: FormatDiffArguments) => string
  formatEmptyChangelog: (args: FormatArguments) => string
}

export function definePreset(preset: Preset): Preset {
  return preset
}

export function resolvePreset(name?: string): Preset {
  return [
    githubPreset,
  ].find(preset => preset.name === name) ?? defaultPreset
}
