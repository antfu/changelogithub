#!/usr/bin/env node
import { blue, bold, cyan, dim, red, yellow } from 'kolorist'
import cac from 'cac'
import { version } from '../package.json'
import { generate, hasTagOnGitHub, isRefGitTag, sendRelease } from './index'

const cli = cac('vitest')

cli
  .version(version)
  .option('-t, --token <path>', 'GitHub Token')
  .option('--from <ref>', 'From tag')
  .option('--to <ref>', 'To tag')
  .option('--github <path>', 'GitHub Repository, e.g. antfu/changelogithub')
  .option('--name <name>', 'Name of the release')
  .option('--contributors', 'Show contributors section')
  .option('--prerelease', 'Mark release as prerelease')
  .option('-d, --draft', 'Mark release as draft')
  .option('--capitalize', 'Should capitalize for each comment message')
  .option('--dry', 'Dry run')
  .help()

cli
  .command('')
  .action(async (args) => {
    args.token = args.token || process.env.GITHUB_TOKEN

    try {
      console.log()
      console.log(dim(`changelo${bold('github')} `) + dim(`v${version}`))

      const { config, md, commits } = await generate(args as any)

      console.log(bold(config.github))
      console.log(cyan(config.from) + dim(' -> ') + blue(config.to) + dim(` (${commits.length} commits)`))
      console.log(dim('--------------'))
      console.log()
      console.log(md.replaceAll('&nbsp;', ''))
      console.log()
      console.log(dim('--------------'))

      if (config.dry) {
        console.log(yellow('Dry run. Release skipped.'))
        return
      }

      if (!config.token) {
        console.log(red('No GitHub token found, specify it via GITHUB_TOKEN env. Release skipped.'))
        process.exitCode = 1
        return
      }

      if (!await isRefGitTag(config.to)) {
        console.log(yellow(`Current ref "${bold(config.to)}" not a tag. Release skipped.`))
        process.exitCode = 1
        return
      }

      if (!await hasTagOnGitHub(config.to, config)) {
        console.log(yellow(`Current ref "${bold(config.to)}" is not available as tags on GitHub. Release skipped.`))
        process.exitCode = 1
        return
      }

      await sendRelease(config, md)
    }
    catch (e: any) {
      console.error(red(String(e)))
      if (e?.stack)
        console.error(dim(e.stack?.split('\n').slice(1).join('\n')))
      process.exit(1)
    }
  })

cli.parse()

