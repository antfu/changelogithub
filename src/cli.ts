#!/usr/bin/env node
import minimist from 'minimist'
import { dim, red } from 'kolorist'
import { run } from './index'

const args = minimist(process.argv.slice(2), {
  boolean: [
    'draft',
    'dry',
  ],
  string: [
    'token',
    'github',
    'from',
    'to',
    'name',
  ],
  default: {
    prerelease: undefined,
  },
  alias: {
    draft: 'd',
  },
})

args.token = args.token || process.env.GITHUB_TOKEN

run(args as any)
  .catch((e) => {
    console.error(red(String(e)))
    console.error(dim(e.stack?.split('\n').slice(1).join('\n')))
    process.exit(1)
  })
