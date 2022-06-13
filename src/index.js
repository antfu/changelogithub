'use strict'

const assign = require('object-assign')
const conventionalChangelog = require('conventional-changelog')
const debug = require('debug')('changelogithub')
const gitSemverTags = require('git-semver-tags')
const ghGot = require('gh-got')
const merge = require('lodash.merge')
const Q = require('q')
const semver = require('semver')
const through = require('through2')
const transform = require('./transform')

/* eslint max-params: ["error", 7] */
function conventionalGithubReleaser(auth, changelogOpts, context, gitRawCommitsOpts, parserOpts, writerOpts, userCb) {
  if (!auth)
    throw new Error('Expected an auth object')

  const promises = []

  const changelogArgs = [changelogOpts, context, gitRawCommitsOpts, parserOpts, writerOpts].map((arg) => {
    if (typeof arg === 'function') {
      userCb = arg
      return {}
    }
    return arg || {}
  })

  if (!userCb)
    throw new Error('Expected an callback')

  changelogOpts = changelogArgs[0]
  context = changelogArgs[1]
  gitRawCommitsOpts = changelogArgs[2]
  parserOpts = changelogArgs[3]
  writerOpts = changelogArgs[4]

  changelogOpts = merge({
    transform,
    releaseCount: 1,
  }, changelogOpts)

  writerOpts.includeDetails = true

  // ignore the default header partial
  writerOpts.headerPartial = writerOpts.headerPartial || ''

  Q.nfcall(gitSemverTags)
    .then((tags) => {
      if (!tags || !tags.length) {
        setImmediate(userCb, new Error('No semver tags found'))
        return
      }

      const releaseCount = changelogOpts.releaseCount
      if (releaseCount !== 0) {
        gitRawCommitsOpts = assign({
          from: tags[releaseCount],
        }, gitRawCommitsOpts)
      }

      gitRawCommitsOpts.to = gitRawCommitsOpts.to || tags[0]

      conventionalChangelog(changelogOpts, context, gitRawCommitsOpts, parserOpts, writerOpts)
        .on('error', (err) => {
          userCb(err)
        })
        .pipe(through.obj((chunk, enc, cb) => {
          if (!chunk.keyCommit || !chunk.keyCommit.version) {
            cb()
            return
          }

          const url = `repos/${context.owner}/${context.repository}/releases`
          const options = {
            endpoint: auth.url,
            body: {
              body: chunk.log,
              draft: changelogOpts.draft || false,
              name: changelogOpts.name || chunk.keyCommit.version,
              prerelease: semver.parse(chunk.keyCommit.version).prerelease.length > 0,
              tag_name: chunk.keyCommit.version,
              target_commitish: changelogOpts.targetCommitish,
            },
          }
          debug(`posting %o to the following URL - ${url}`, options)

          // Set auth after debug output so that we don't print auth token to console.
          options.token = auth.token

          promises.push(ghGot(url, options))

          cb()
        }, () => {
          Q.all(promises)
            .then((responses) => {
              userCb(null, responses)
            })
            .catch((err) => {
              userCb(err)
            })
        }))
    })
    .catch((err) => {
      userCb(err)
    })
}

module.exports = conventionalGithubReleaser
