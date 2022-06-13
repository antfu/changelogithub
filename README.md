# changelogithub

> Generate changelog for GitHub.

In GitHub Actions:

```yml
# .github/workflows/release.yml

name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v3
        with:
          node-version: 16.x

      - run: npx changelogithub
        env:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

## Examples

- [unocss/unocss](https://github.com/unocss/unocss/releases/tag/v0.39.0)

## License

MIT 2022 [Anthony Fu](https://github.com/antfu)
