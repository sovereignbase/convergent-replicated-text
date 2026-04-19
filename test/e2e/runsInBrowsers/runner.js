import * as api from '/runsInBrowsers/browser-dist.js'
import { printResults, runCRTextSuite } from '../shared/suite.mjs'

const results = await runCRTextSuite(api, { label: 'browser esm' })
printResults(results)
window.__CRTEXT_RESULTS__ = results
const status = document.getElementById('status')
if (status)
  status.textContent = results.ok ? 'ok' : 'failed: ' + results.errors.length
