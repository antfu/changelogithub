import defaultPreset from './default'
import { definePreset } from './index'

export default definePreset({
  ...defaultPreset,
  name: 'github',
  options: {
    emoji: false,
    contributors: true,
    capitalize: false,
    group: false,
  },
  formatSingleReference: ({ ref, type, options }) => {
    if (!options.github)
      return ref

    if (type === 'pr')
      return `https://github.com/${options.github}/issues/${ref.slice(1)}`

    return `([${ref.slice(0, 6)}](https://github.com/${options.github}/commit/${ref}))`
  },
  formatCommitSuffix: ({ authors, prRefs, hashRefs }) => {
    return [authors, prRefs, hashRefs].filter(i => i?.trim()).join(' ')
  },
  formatTitle: ({ title }) => {
    return `### ${title.trim()}`
  },
  formatDiff: ({ url }) => {
    return `#### **Full changelog**: ${url}`
  },
})
