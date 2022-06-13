#!/usr/bin/env node
import minimist from 'minimist'
import changelogithub from './dist/index.mjs'

const args = minimist(process.argv.slice(2), {
  boolean: [
    'draft',
    'prerelease',
    'dry',
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

changelogithub(args)
