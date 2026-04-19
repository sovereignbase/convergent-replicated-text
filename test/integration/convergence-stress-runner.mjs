import * as api from '../../dist/index.js'
import {
  ensurePassing,
  printResults,
  runCRTextSuite,
} from '../e2e/shared/suite.mjs'

setTimeout(() => {
  console.error('integration stress watchdog timeout')
  process.exit(124)
}, 12_000).unref()

const results = await runCRTextSuite(api, {
  label: 'integration stress',
  includeStress: true,
  stressRounds: Number.parseInt(process.env.CRTEXT_STRESS_ROUNDS ?? '14', 10),
  scenarioCount: Number.parseInt(
    process.env.CRTEXT_SCENARIO_COUNT ?? '120',
    10
  ),
  verbose: true,
})

printResults(results)
ensurePassing(results)
