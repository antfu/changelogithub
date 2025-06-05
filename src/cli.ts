#!/usr/bin/env node

import fs from 'node:fs/promises'
import process from 'node:process'
import { setOutput } from '@actions/core'
import { blue, bold, cyan, dim, red, yellow } from 'ansis'
import cac from 'cac'
import { execa } from 'execa'
import { version } from '../package.json'
import { uploadAssets } from './github'
import { generate, hasTagOnGitHub, isRepoShallow, sendRelease } from './index'

const cli = cac('changelogithub')

cli
  .version(version)
  .option('-t, --token <path>', 'GitHub Token')
  .option('--from <ref>', 'From tag')
  .option('--to <ref>', 'To tag')
  .option('--github <path>', 'GitHub Repository, e.g. antfu/changelogithub')
  .option('--release-github <path>', 'Release GitHub Repository, defaults to `github`')
  .option('--name <name>', 'Name of the release')
  .option('--contributors', 'Show contributors section')
  .option('--prerelease', 'Mark release as prerelease')
  .option('-d, --draft', 'Mark release as draft')
  .option('--output <path>', 'Output to file instead of sending to GitHub')
  .option('--capitalize', 'Should capitalize for each comment message')
  .option('--emoji', 'Use emojis in section titles', { default: true })
  .option('--group', 'Nest commit messages under their scopes')
  .option('--dry', 'Dry run')
  .option('--assets <paths...>', 'Files to upload as assets to the release')
  .help()

async function readTokenFromGitHubCli() {
  try {
    return (await execa('gh', ['auth', 'token'])).stdout.trim()
  }
  catch {
    return ''
  }
}

cli
  .command('')
  .action(async (args) => {
    const token = args.token || process.env.GITHUB_TOKEN || await readTokenFromGitHubCli()

    if (token) {
      args.token = token
    }

    let webUrl = ''

    try {
      console.log()
      console.log(dim(`changelo${bold('github')} `) + dim(`v${version}`))

      const { config, md, commits } = await generate(args as any)
      webUrl = `https://${config.baseUrl}/${config.releaseRepo}/releases/new?title=${encodeURIComponent(String(config.name || config.to))}&body=${encodeURIComponent(String(md))}&tag=${encodeURIComponent(String(config.to))}&prerelease=${config.prerelease}`

      console.log(cyan(config.from) + dim(' -> ') + blue(config.to) + dim(` (${commits.length} commits)`))
      console.log(dim('--------------'))
      console.log()
      console.log(md.replace(/&nbsp;/g, ''))
      console.log()
      console.log(dim('--------------'))

      function printWebUrl() {
        console.log()
        console.error(yellow('Using the following link to create it manually:'))
        console.error(yellow(webUrl))
        console.log()
      }

      if (config.dry) {
        console.log(yellow('Dry run. Release skipped.'))
        printWebUrl()
        return
      }

      if (typeof config.output === 'string') {
        await fs.writeFile(config.output, md, 'utf-8')
        console.log(yellow(`Saved to ${config.output}`))
        return
      }

      if (!config.token) {
        console.error(red('No GitHub token found, specify it via GITHUB_TOKEN env. Release skipped.'))
        process.exitCode = 1
        printWebUrl()
        return
      }

      if (!await hasTagOnGitHub(config.to, config)) {
        console.error(yellow(`Current ref "${bold(config.to)}" is not available as tags on GitHub. Release skipped.`))
        process.exitCode = 1
        printWebUrl()
        return
      }

      if (!commits.length && await isRepoShallow()) {
        console.error(yellow('The repo seems to be clone shallowly, which make changelog failed to generate. You might want to specify `fetch-depth: 0` in your CI config.'))
        process.exitCode = 1
        printWebUrl()
        return
      }

      const { id, html_url, upload_url } = await sendRelease(config, md)

      setOutput('id', id)
      setOutput('html_url', html_url)
      setOutput('upload_url', upload_url)

      if (args.assets && args.assets.length > 0) {
        await uploadAssets(config, args.assets)
      }
    }
    catch (e: any) {
      console.error(red(String(e)))
      if (e?.stack)
        console.error(dim(e.stack?.split('\n').slice(1).join('\n')))

      if (webUrl) {
        console.log()
        console.error(red('Failed to create the release. Using the following link to create it manually:'))
        console.error(yellow(webUrl))
        console.log()
      }

      process.exit(1)
    }
  })

cli.parse()
