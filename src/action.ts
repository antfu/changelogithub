#!/usr/bin/env node
import core from '@actions/core'
import { red } from 'kolorist'
import { run } from './index'

const inputs = {
  token: core.getInput('token'),
  github: core.getInput('github'),
  from: core.getInput('from'),
  to: core.getInput('to'),
  name: core.getInput('name'),
  prerelease: core.getInput('prerelease'),
  dry: core.getInput('dry') === 'true',
  draft: core.getInput('draft') === 'true',
}

const options = Object.fromEntries(Object.entries(inputs).filter(([_, v]) => v !== '')) as any

run(options)
  .catch((e) => {
    console.error(red(String(e)))
    process.exit(1)
  })
