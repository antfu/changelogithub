import { blue, bold, cyan, dim, yellow } from 'kolorist'
import { version } from 'typescript'
import { generate } from './generate'
import { sendRelease } from './github'
import type { ChangelogOptions } from './types'

export * from './types'
export * from './github'
export * from './git'
export * from './markdown'
export * from './generate'

export async function run(options: ChangelogOptions) {
  /* eslint-disable no-console */
  const { config, md } = await generate(options)

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
