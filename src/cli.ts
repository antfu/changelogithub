#!/usr/bin/env node
import minimist from 'minimist'
import changelogithub from './index'

const args = minimist(process.argv.slice(2), {
  boolean: [
    'draft',
    'prerelease',
  ],
  string: [
    'token',
    'from',
    'to',
    'name',
  ],
  alias: {
    draft: 'd',
  },
})

args.token = args.token || process.env.GITHUB_TOKEN

await changelogithub(args as any)
