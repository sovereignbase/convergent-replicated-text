import * as api from '../../../dist/index.js'
import {
  ensurePassing,
  printResults,
  runCRTextSuite,
} from '../shared/suite.mjs'

const results = await runCRTextSuite(api, { label: 'deno esm' })
printResults(results)
ensurePassing(results)
