#!/usr/bin/env node
import minimist from 'minimist'
import { blue, bold, cyan, dim, red, yellow } from 'kolorist'
import { version } from '../package.json'
import { generate, sendRelease } from './index'

const args = minimist(process.argv.slice(2), {
  boolean: [
    'draft',
    'dry',
  ],
  string: [
    'token',
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

async function run() {
  const { config, md } = await generate(args as any)

  console.log()
  console.log(dim(`changelo${bold('github')} `) + dim(`v${version}`))
  console.log(bold(config.github))
  console.log(cyan(config.from) + dim(' -> ') + blue(config.to))
  console.log(dim('--------------'))
  console.log()
  console.log(md.replaceAll('&nbsp;', ''))
  console.log()
  console.log(dim('--------------'))

  if (config.dry)
    return console.log(yellow('Dry run, skipped.'))

  if (!config.to.startsWith('v')) {
    console.log(yellow('Release version must starts with `v`, skipped.'))
    process.exitCode = 1
    return
  }

  await sendRelease(config, md)
}

run()
  .catch((e) => {
    console.error(red(String(e)))
    console.error(dim(e.stack?.split('\n').slice(1).join('\n')))
    process.exit(1)
  })
