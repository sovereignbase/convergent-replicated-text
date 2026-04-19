import test from 'node:test'
import * as api from '../../dist/index.js'
import {
  ensurePassing,
  printResults,
  runCRTextSuite,
} from '../e2e/shared/suite.mjs'

test('unit: CRText core invariants', async () => {
  const results = await runCRTextSuite(api, {
    label: 'unit',
    includeStress: false,
  })
  printResults(results)
  ensurePassing(results)
})
