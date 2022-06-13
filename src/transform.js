import dateFormat from 'dateformat'
import semverRegex from 'semver-regex'

export function transform(chunk, cb) {
  if (typeof chunk.gitTags === 'string')
    chunk.version = (chunk.gitTags.match(semverRegex()) || [])[0]

  if (chunk.committerDate)
    chunk.committerDate = dateFormat(chunk.committerDate, 'yyyy-mm-dd', true)

  cb(null, chunk)
}
