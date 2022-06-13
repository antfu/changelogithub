# changelogithub

> Generate changelog for GitHub.

Fork from [`conventional-github-releaser`](https://github.com/conventional-changelog/releaser-tools/tree/master/packages/conventional-github-releaser).

## Changes in this fork

- The preset is default to `angular`. `-p angular` is no longer required.
- It also reads `GITHUB_TOKEN` from env as fallback
- Requires Node v12 or higher

## Quick start

```sh
npx changelogithub preview
```

```sh
npx changelogithub
```

## License

MIT 2018-2020 [Steve Mao](https://github.com/stevemao)
MIT 2022 [Anthony Fu](https://github.com/antfu)
