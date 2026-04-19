import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import * as crList from '@sovereignbase/convergent-replicated-list'
import { EdgeRuntime } from 'edge-runtime'
import {
  ensurePassing,
  printResults,
  runCRTextSuite,
} from '../shared/suite.mjs'

const root = process.cwd()
const esmDistPath = resolve(root, 'dist', 'index.js')

function toExecutableEdgeEsm(bundleCode) {
  const withoutImports = replaceNamedImports(
    bundleCode,
    '@sovereignbase/convergent-replicated-list',
    'globalThis.__CRTEXT_LIST'
  )

  const exportMatch = withoutImports.match(
    /export\s*\{\s*([\s\S]*?)\s*\};\s*(\/\/# sourceMappingURL=.*)?\s*$/
  )
  if (!exportMatch)
    throw new Error('edge-runtime esm harness could not find bundle exports')

  const exportEntries = exportMatch[1]
    .split(',')
    .map((specifier) => specifier.trim())
    .filter(Boolean)
    .map((specifier) => {
      const [localName, exportedName] = specifier.split(/\s+as\s+/)
      return exportedName
        ? `${JSON.stringify(exportedName)}: ${localName}`
        : localName
    })
    .join(',\n  ')

  const sourceMapComment = exportMatch[2] ? `${exportMatch[2]}\n` : ''
  return (
    withoutImports.slice(0, exportMatch.index) +
    `globalThis.__crTextEsmExports = {\n  ${exportEntries}\n};\n` +
    sourceMapComment
  )
}

function toDestructure(specifiers, globalName) {
  const members = specifiers
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [left, right] = part.split(/\s+as\s+/)
      return right ? `${left.trim()}: ${right.trim()}` : left.trim()
    })
    .join(', ')

  return `const { ${members} } = ${globalName};\n`
}

function replaceNamedImports(bundleCode, packageName, globalName) {
  const pattern = new RegExp(
    `import\\s*\\{([^}]*)\\}\\s*from\\s*["']${packageName.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    )}["'];\\s*`,
    'g'
  )

  return bundleCode.replace(pattern, (_, specifiers) =>
    toDestructure(specifiers, globalName)
  )
}

const runtime = new EdgeRuntime()
runtime.context.__CRTEXT_LIST = crList
runtime.evaluate(`
  if (typeof globalThis.CustomEvent === 'undefined') {
    globalThis.CustomEvent = class CustomEvent extends Event {
      constructor(type, init = {}) {
        super(type, init)
        this.detail = init.detail ?? null
      }
    }
  }
`)
const moduleCode = await readFile(esmDistPath, 'utf8')
runtime.evaluate(toExecutableEdgeEsm(moduleCode))

const results = await runCRTextSuite(runtime.context.__crTextEsmExports, {
  label: 'edge-runtime esm',
  runtimeGlobals: runtime.context,
})
printResults(results)
ensurePassing(results)
