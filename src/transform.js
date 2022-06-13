'use strict'

const dateFormat = require('dateformat')
const semverRegex = require('semver-regex')

function transform(chunk, cb) {
  if (typeof chunk.gitTags === 'string')
    chunk.version = (chunk.gitTags.match(semverRegex()) || [])[0]

  if (chunk.committerDate)
    chunk.committerDate = dateFormat(chunk.committerDate, 'yyyy-mm-dd', true)

  cb(null, chunk)
}

module.exports = transform
