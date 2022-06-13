# changelogithub

[![CircleCI](https://circleci.com/gh/conventional-changelog/releaser-tools.svg?style=svg)](https://circleci.com/gh/conventional-changelog/releaser-tools)
[![codecov.io](https://codecov.io/gh/conventional-changelog/releaser-tools/coverage.svg?branch=master)](https://codecov.io/gh/conventional-changelog/releaser-tools?branch=master)

> Make a new GitHub release from git metadata.

**Note** You don't have to use the angular commit convention. For the best result of the tool to tokenize your commit and produce flexible output, it's recommended to use a commit convention.

## Quick start

[Set up a token first](#setup-token-for-cli).

```sh
$ npm install -g changelogithub
$ cd my-project
$ changelogithub -p angular
```

The above generates a GitHub Release based on commits since the last semver tag that match the pattern of a "Feature", "Fix", "Performance Improvement" or "Breaking Changes".

If you first time use this tool and want to generate all previous releases, you could do

```sh
$ changelogithub -p angular -r 0
```

This will *not* overwrite the releases you have already made. Read ["Regenerate all the releases"](#regenerate-all-the-releases) section if you want to.

All available command line parameters can be listed using [CLI](#cli) : `changelogithub --help`.

**Hint:** You can alias your command or add it to your package.json. EG: `"github-release": "changelogithub -p angular -r 0"`.

Or use one of the plugins if you are already using the tool:  [grunt](https://github.com/conventional-changelog/grunt-changelogithub)/[atom](https://github.com/conventional-changelog/atom-conventional-changelog)

## Example output

- https://github.com/conventional-changelog/changelogithub/releases
- https://github.com/conventional-changelog/conventional-changelog/releases

### Recommended workflow

1. Make changes
2. Commit those changes
3. Make sure Travis CI turns green
4. Bump version in `package.json`
5. Commit `package.json` files
6. Tag
7. Push
8. `conventionalGithubReleaser`

You have to have a tag on GitHub to make a release. hence `gitRawCommitsOpts.to` defaults to the latest semver tag.

Please use this [gist](https://gist.github.com/stevemao/280ef22ee861323993a0) to make a release or change it to your needs.

## Why

- Based on [conventional-changelog](https://www.npmjs.com/package/conventional-changelog) but GitHub releases are more elegant.
- Easy fully automate changelog generation. You could still add more points on top of it.
- Detecting prerelease based on semver, ignoring reverted commits, templating with [handlebars.js](https://www.npmjs.com/package/handlebars) and links to references, etc. Open an [issue](../../issues/new) if you want more reasonable features.
- Intelligently setup defaults but yet fully configurable with presets of [popular projects](https://www.npmjs.com/package/conventional-changelog#preset).
- Everything internally or externally is pluggable.
- A lot of tests and actively maintained.

## Programmatic Usage

```sh
$ npm install --save changelogithub
```

```js
const conventionalGithubReleaser = require('changelogithub')

const AUTH = {
  type: 'oauth',
  token: '0126af95c0e2d9b0a7c78738c4c00a860b04acc8' // change this to your own GitHub token or use an environment variable
}

conventionalGithubReleaser(AUTH, {
  preset: 'angular'
}, callback)
```

## API

### conventionalGithubReleaser(auth, [changelogOpts, [context, [gitRawCommitsOpts, [parserOpts, [writerOpts]]]]], callback)

#### auth

An object that may contain the following properties:

* token - A [GitHub Personal Token](https://github.com/blog/1509-personal-api-tokens) with `repo` [scope permissions](https://developer.github.com/enterprise/2.11/apps/building-integrations/setting-up-and-registering-oauth-apps/about-scopes-for-oauth-apps/).
* url - The fully qualified domain name for the GitHub instance (such as `https://api.github.com`).

For example:

```javascript
{
  token: '0126af95c0e2d9b0a7c78738c4c00a860b04acc8',
  url: 'https://api.github.com'
}
```

> Please read [`gh-got`](https://www.npmjs.com/package/gh-got#token) for default behavior when `token` and/or `url` aren't provided.

#### callback

##### callback(err, responses)

###### responses

Type: `array`

An array of responses returned by `github.releases.createRelease` calls.

Please check [conventional-changelog](https://github.com/ajoslin/conventional-changelog#api) for other arguments.

There are some changes:

#### changelogOpts

##### transform

Default: grab the whole tag for the version (including a leading v) and format date.

##### releaseCount

Default: `1`

How many releases of changelog you want to generate. It counts from the latest semver tag. Useful when you forgot to generate any previous releases. Set to `0` to regenerate all.

##### name

Default: same as version tag

Name that should be applied to the release on GitHub.

##### targetCommitish

Default: `undefined` (uses the tag to determine commit)

Specific `target_commitish` in GitHub release

#### gitRawCommitsOpts

##### from

Default: based on `options.releaseCount`.

##### to

Default: latest semver tag

#### writerOpts

##### includeDetails

It is always `true`.

##### headerPartial

Default: `''`

Default header contains the version and date which are already in the release.

## CLI

```sh
$ npm install --global changelogithub
$ changelogithub --help # for more details
```

You can supply your auth token by a flag `-t` or `--token`. You can also set up an environment variable `CONVENTIONAL_GITHUB_RELEASER_TOKEN` to avoid typing your token every time.

You can also submit your release as a draft version via the '--draft' flag. This allows you to review the and edit the release notes before an official release.

Note: If all results error, it will print the error messages to stderr and exit with code `1`.

## Regenerate all the releases

Use [github-remove-all-releases](https://github.com/stevemao/github-remove-all-releases) to remove all releases and set `changelogOpts.releaseCount` to `0` to regenerate.

## Setup token for cli

[Create a new token](https://github.com/settings/tokens/new) and set your environment variable `CONVENTIONAL_GITHUB_RELEASER_TOKEN` to the token you just created. You can google [How to set environment variable](https://www.google.com.au/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=how%20to%20set%20environment%20variable). The scopes for the token you need is `public_repo` or `repo` (if you need to access private repos). [More details](https://developer.github.com/v3/oauth/#scopes).

## Related

- [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog-cli) - Generate a changelog from git metadata
- [conventional-recommended-bump](https://github.com/conventional-changelog/conventional-recommended-bump) - Get a recommended version bump based on conventional commits
- [conventional-commits-detector](https://github.com/conventional-changelog/conventional-commits-detector) - Detect what commit message convention your repository is using
- [github-remove-all-releases](https://github.com/stevemao/github-remove-all-releases) - Remove all releases of your GitHub repo

## Debugging

To assist users of `changelogithub` with debugging the behavior of this module we use the [debug](https://www.npmjs.com/package/debug) utility package to print information about the release process to the console. To enable debug message printing, the environment variable `DEBUG`, which is the variable used by the `debug` package, must be set to a value configured by the package containing the debug messages to be printed.

To print debug messages on a unix system set the environment variable `DEBUG` with the name of this package prior to executing `changelogithub`:

```bash
DEBUG=changelogithub changelogithub
```

On the Windows command line you may do:

```bash
set DEBUG=changelogithub
changelogithub
```

## Node Support Policy

We only support [Long-Term Support](https://github.com/nodejs/Release) versions of Node.

We specifically limit our support to LTS versions of Node, not because this package won't work on other versions, but because we have a limited amount of time, and supporting LTS offers the greatest return on that investment.

It's possible this package will work correctly on newer versions of Node. It may even be possible to use this package on older versions of Node, though that's more unlikely as we'll make every effort to take advantage of features available in the oldest LTS version we support.

As each Node LTS version reaches its end-of-life we will remove that version from the `node` `engines` property of our package's `package.json` file. Removing a Node version is considered a breaking change and will entail the publishing of a new major version of this package. We will not accept any requests to support an end-of-life version of Node. Any merge requests or issues supporting an end-of-life version of Node will be closed.

We will accept code that allows this package to run on newer, non-LTS, versions of Node. Furthermore, we will attempt to ensure our own changes work on the latest version of Node. To help in that commitment, our continuous integration setup runs against all LTS versions of Node in addition the most recent Node release; called _current_.

JavaScript package managers should allow you to install this package with any version of Node, with, at most, a warning if your version of Node does not fall within the range specified by our `node` `engines` property. If you encounter issues installing this package, please report the issue to your package manager.

## Contributing

Please read our [contributing guide](https://github.com/conventional-changelog/releaser-tools/blob/master/CONTRIBUTING.md) to see how you may contribute to this project.

## License

MIT © [Steve Mao](https://github.com/stevemao)
