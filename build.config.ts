import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/cli',
    'src/action',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
