import { build } from 'esbuild'

await Promise.all([
  build({
    entryPoints: ['./in-browser-testing-libs.js'],
    outfile: './index.js',
    bundle: true,
    external: ['node:*'],
    platform: 'browser',
    format: 'esm',
    treeShaking: true,
  }),
  build({
    entryPoints: ['./dist/index.js'],
    outfile: './test/e2e/runsInBrowsers/browser-dist.js',
    bundle: true,
    external: ['node:*'],
    platform: 'browser',
    format: 'esm',
    treeShaking: true,
  }),
])
