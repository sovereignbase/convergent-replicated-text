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
])
