/* eslint-disable no-console */
// @ts-check
import conventionalChangelog from 'conventional-changelog'
import createDebug from 'debug'
import gitSemverTags from 'git-semver-tags'
import { fetch } from 'ohmyfetch'
import merge from 'lodash.merge'
import semver from 'semver'
import through from 'through2'
import { transform } from './transform.js'

const debug = createDebug('changelogithub')

export default async function conventionalGithubReleaser(
  auth,
  changelogOpts = {},
  context = {},
  gitRawCommitsOpts = {},
  parserOpts = {},
  writerOpts = {},
) {
  if (!auth)
    throw new Error('Expected an auth object')

  const promises = []

  changelogOpts = merge({
    transform,
    releaseCount: 1,
  }, changelogOpts)

  writerOpts.includeDetails = true

  // ignore the default header partial
  writerOpts.headerPartial = writerOpts.headerPartial || ''

  const tags = await new Promise((resolve, reject) => {
    gitSemverTags((err, r) => {
      if (err)
        reject(err)
      else
        resolve(r)
    })
  })

  if (!tags || !tags.length)
    throw new Error('No semver tags found')

  const releaseCount = changelogOpts.releaseCount
  if (releaseCount !== 0) {
    gitRawCommitsOpts = {
      from: tags[releaseCount],
      ...gitRawCommitsOpts,
    }
  }

  gitRawCommitsOpts.to = gitRawCommitsOpts.to || tags[0]

  await new Promise((resolve, reject) => {
    conventionalChangelog(changelogOpts, context, gitRawCommitsOpts, parserOpts, writerOpts)
      .on('error', (err) => {
        reject(err)
      })
      .pipe(through.obj((chunk, enc, cb) => {
        if (!chunk.keyCommit || !chunk.keyCommit.version) {
          cb()
          return
        }

        console.log(chunk.keyCommit.version)
        console.log()
        console.log(chunk.log.trim())

        const url = `${auth.url}repos/${context.owner}/${context.repository}/releases`
        const body = {
          body: chunk.log.trim(),
          draft: changelogOpts.draft || false,
          name: changelogOpts.name || chunk.keyCommit.version,
          prerelease: semver.parse(chunk.keyCommit.version).prerelease.length > 0,
          tag_name: chunk.keyCommit.version,
          target_commitish: changelogOpts.targetCommitish,
        }
        debug('posting %o', body)

        promises.push(fetch(url, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            accept: 'application/vnd.github.v3+json',
            authorization: `token ${auth.token}`,
          },
        }))

        cb()
      }, () => {
        Promise.all(promises)
          .then((responses) => {
            resolve(responses)
          })
          .catch((err) => {
            reject(err)
          })
      }))
  })
}

