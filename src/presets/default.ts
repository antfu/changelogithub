import { join } from '../utils'
import { definePreset } from './index'

export default definePreset({
  name: 'default',
  formatSingleReference: ({ ref, type, options }) => {
    if (!options.github)
      return ref

    if (type === 'pr')
      return `https://github.com/${options.github}/issues/${ref.slice(1)}`

    return `[<samp>(${ref.slice(0, 5)})</samp>](https://github.com/${options.github}/commit/${ref})`
  },
  formatReferences: ({ refs, type }) => {
    const referencesString = join(refs).trim()

    if (type === 'pr')
      return referencesString && `in ${referencesString}`
    return referencesString
  },
  formatAuthors: ({ authors }) => {
    const str = join([...new Set(authors?.map(i => i.login ? `@${i.login}` : `**${i.name}**`))])?.trim()
    return str
      ? `by ${str}`
      : ''
  },
  formatCommitSuffix: ({ authors, prRefs, hashRefs }) => {
    const refs = [authors, prRefs, hashRefs].filter(i => i?.trim()).join(' ')
    return refs
      ? `&nbsp;-&nbsp; ${refs}`
      : ''
  },
  formatTitle: ({ title }) => {
    return `### &nbsp;&nbsp;&nbsp;${title.trim()}`
  },
  formatEmptyChangelog: () => {
    return '*No significant changes*'
  },
  formatDiff: ({ url }) => {
    return `##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](${url})`
  },
})
