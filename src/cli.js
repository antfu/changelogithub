#!/usr/bin/env node
'use strict'

const resolve = require('path').resolve
const meow = require('meow')
const conventionalGithubReleaser = require('./index')

const cli = meow({
  help: `
    Usage
      changelogithub

    Example
      changelogithub

    Options
      -u, --url                 URL of your GitHub provider. Defaults to 'https://api.github.com/'
      -t, --token               Your GitHub auth token

      -p, --preset              Name of the preset you want to use. Must be one of the following:
                                angular, atom, codemirror, ember, eslint, express, jquery, jscs or jshint

      -k, --pkg                 A filepath of where your package.json is located
                                Default is the closest package.json from cwd

      -r, --release-count       How many releases to be generated from the latest
                                If 0, the whole changelog will be regenerated and the outfile will be overwritten
                                Default: 1

      -v, --verbose             Verbose output. Use this for debugging
                                Default: false

      -n, --config              A filepath of your config script
                                Example of a config script: https://github.com/conventional-changelog/conventional-changelog-angular/blob/master/index.js

      -c, --context             A filepath of a javascript that is used to define template variables

      -d, --draft               Publishes a draft instead of a real release
                                Default: false
  `,
  flags: {
    url: {
      alias: 'u',
      default: process.env.CONVENTIONAL_GITHUB_URL || process.env.GITHUB_URL || 'https://api.github.com/',
      type: 'string',
    },
    token: {
      alias: 't',
      default: process.env.CONVENTIONAL_GITHUB_RELEASER_TOKEN || process.env.GITHUB_TOKEN || '',
      type: 'string',
    },
    preset: {
      alias: 'p',
      type: 'string',
      default: 'angular',
    },
    pkg: {
      alias: 'k',
      type: 'string',
    },
    releaseCount: {
      alias: 'r',
      default: 1,
      type: 'number',
    },
    verbose: {
      alias: 'v',
      default: false,
      type: 'boolean',
    },
    config: {
      alias: 'n',
      type: 'string',
    },
    context: {
      alias: 'c',
      type: 'string',
    },
    draft: {
      alias: 'd',
      default: false,
      type: 'boolean',
    },
  },
})

let config = {}
const flags = cli.flags

let templateContext
let gitRawCommitsOpts
let parserOpts
let writerOpts

try {
  if (flags.context)
    templateContext = require(resolve(process.cwd(), flags.context))

  if (flags.config)
    config = require(resolve(process.cwd(), flags.config))

  if (config.gitRawCommitsOpts)
    gitRawCommitsOpts = config.gitRawCommitsOpts

  if (config.parserOpts)
    parserOpts = config.parserOpts

  if (config.writerOpts)
    writerOpts = config.writerOpts
}
catch (err) {
  console.error(`Failed to get file. ${err}`)
  process.exit(1)
}

const changelogOpts = {
  preset: flags.preset,
  pkg: {
    path: flags.pkg,
  },
  releaseCount: flags.releaseCount,
  draft: flags.draft,
}

if (flags.verbose) {
  changelogOpts.debug = console.info.bind(console)
  changelogOpts.warn = console.warn.bind(console)
}

conventionalGithubReleaser({
  url: flags.url,
  token: flags.token,
}, changelogOpts, templateContext, gitRawCommitsOpts, parserOpts, writerOpts, (err, data) => {
  if (err) {
    console.error(err.toString())
    process.exit(1)
  }

  if (flags.verbose)
    console.log(data)
})
