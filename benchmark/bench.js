import assert from 'node:assert/strict'
import { CRText } from '../dist/index.js'

const ARTICLE_TARGET_CHARS = 12_500
const REVISION_OPS = 2_000
const DRAFT_REPEATS = 24
const REVISION_REPEATS = 12
const SNAPSHOT_REPEATS = 240
const VALUE_REPEATS = 360

const CHARACTER_CORPUS = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  ' ',
  '\n',
  '.',
  ',',
]

function symbols(value) {
  return Array.from(value)
}

function random(seed) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0
    return state / 0x1_0000_0000
  }
}

function nextText(rand, maxWidth) {
  const width = 1 + Math.floor(rand() * maxWidth)
  let text = ''
  for (let index = 0; index < width; index++) {
    text += CHARACTER_CORPUS[Math.floor(rand() * CHARACTER_CORPUS.length)]
  }
  return text
}

function buildDraftWorkload(targetChars, seed) {
  const rand = random(seed)
  const model = []
  const operations = []

  while (model.length < targetChars) {
    const remaining = targetChars - model.length
    const text = nextText(rand, Math.min(24, remaining))
    const insertAt = model.length
    const segments = symbols(text)
    model.push(...segments)
    operations.push({
      type: 'insert',
      after: insertAt - 1,
      text,
    })
  }

  return {
    operations,
    chars: model.length,
    text: model.join(''),
    workload: `${operations.length} append operations`,
  }
}

function buildRevisionWorkload(baseText, operationCount, seed) {
  const rand = random(seed)
  const model = symbols(baseText)
  const operations = []

  for (let step = 0; step < operationCount; step++) {
    if (model.length > 3_000 && rand() < 0.35) {
      const index = Math.floor(rand() * model.length)
      const removeCount =
        1 + Math.floor(rand() * Math.min(16, model.length - index))
      model.splice(index, removeCount)
      operations.push({
        type: 'remove',
        index,
        removeCount,
      })
      continue
    }

    const text = nextText(rand, 12)
    const insertAt = Math.floor(rand() * (model.length + 1))
    model.splice(insertAt, 0, ...symbols(text))
    operations.push({
      type: 'insert',
      after: insertAt - 1,
      text,
    })
  }

  return {
    operations,
    chars: model.length,
    text: model.join(''),
    workload: `${operations.length} random insert/remove operations`,
  }
}

function applyOperations(replica, operations) {
  for (const operation of operations) {
    if (operation.type === 'insert') {
      replica.insertAfter(operation.after, operation.text)
      continue
    }
    replica.removeAfter(operation.index, operation.removeCount)
  }
  return operations.length
}

function time(fn) {
  const start = process.hrtime.bigint()
  const ops = fn()
  const end = process.hrtime.bigint()
  return { ms: Number(end - start) / 1_000_000, ops }
}

function formatNumber(number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
    number
  )
}

function pad(value, width) {
  return String(value).padEnd(width, ' ')
}

function printTable(rows) {
  const columns = [
    ['group', (row) => row.group],
    ['scenario', (row) => row.name],
    ['chars', (row) => formatNumber(row.chars)],
    ['workload', (row) => row.workload],
    ['ops', (row) => formatNumber(row.ops)],
    ['ms', (row) => formatNumber(row.ms)],
    ['ms/op', (row) => formatNumber(row.msPerOp)],
    ['ops/sec', (row) => formatNumber(row.opsPerSecond)],
  ]
  const widths = columns.map(([header, getter]) =>
    Math.max(header.length, ...rows.map((row) => getter(row).length))
  )

  console.log(
    columns.map(([header], index) => pad(header, widths[index])).join('  ')
  )
  console.log(widths.map((width) => '-'.repeat(width)).join('  '))

  for (const row of rows) {
    console.log(
      columns
        .map(([, getter], index) => pad(getter(row), widths[index]))
        .join('  ')
    )
  }
}

const draft = buildDraftWorkload(ARTICLE_TARGET_CHARS, 0x12_34_56_78)
const revision = buildRevisionWorkload(draft.text, REVISION_OPS, 0x87_65_43_21)

const baseReplica = new CRText()
applyOperations(baseReplica, draft.operations)
assert.equal(baseReplica.valueOf(), draft.text)
const baseSnapshot = structuredClone(baseReplica.toJSON())

const revisedReplica = new CRText(structuredClone(baseSnapshot))
applyOperations(revisedReplica, revision.operations)
assert.equal(revisedReplica.valueOf(), revision.text)

const revisedSnapshot = structuredClone(revisedReplica.toJSON())
const revisedSnapshotJson = JSON.stringify(revisedSnapshot)
const revisionSeedSnapshots = Array.from({ length: REVISION_REPEATS }, () =>
  structuredClone(baseSnapshot)
)

const BENCHMARKS = [
  {
    group: 'throughput',
    name: 'typing / append random article',
    chars: draft.chars,
    workload: draft.workload,
    run() {
      return time(() => {
        let ops = 0
        let lastValue = ''
        for (let index = 0; index < DRAFT_REPEATS; index++) {
          const replica = new CRText()
          ops += applyOperations(replica, draft.operations)
          lastValue = replica.valueOf()
        }
        assert.equal(lastValue, draft.text)
        return ops
      })
    },
  },
  {
    group: 'throughput',
    name: 'editing / random inserts and deletes',
    chars: revision.chars,
    workload: revision.workload,
    run() {
      return time(() => {
        let ops = 0
        let lastValue = ''
        for (let index = 0; index < REVISION_REPEATS; index++) {
          const replica = new CRText(revisionSeedSnapshots[index])
          ops += applyOperations(replica, revision.operations)
          lastValue = replica.valueOf()
        }
        assert.equal(lastValue, revision.text)
        return ops
      })
    },
  },
  {
    group: 'projection',
    name: 'snapshot / toJSON revised article',
    chars: revision.chars,
    workload: 'detached snapshot',
    run() {
      return time(() => {
        let lastJson = ''
        for (let index = 0; index < SNAPSHOT_REPEATS; index++) {
          lastJson = JSON.stringify(revisedReplica.toJSON())
        }
        assert.equal(lastJson, revisedSnapshotJson)
        return SNAPSHOT_REPEATS
      })
    },
  },
  {
    group: 'projection',
    name: 'valueOf / materialize current string',
    chars: revision.chars,
    workload: 'string projection',
    run() {
      return time(() => {
        let lastValue = ''
        for (let index = 0; index < VALUE_REPEATS; index++) {
          lastValue = revisedReplica.valueOf()
        }
        assert.equal(lastValue, revision.text)
        return VALUE_REPEATS
      })
    },
  },
]

const rows = BENCHMARKS.map((benchmark) => {
  const result = benchmark.run()
  return {
    group: benchmark.group,
    name: benchmark.name,
    chars: benchmark.chars,
    workload: benchmark.workload,
    ops: result.ops,
    ms: result.ms,
    msPerOp: result.ms / result.ops,
    opsPerSecond: result.ops / (result.ms / 1_000),
  }
})

console.log('CRText benchmark')
console.log(
  `node=${process.version} platform=${process.platform} arch=${process.arch}`
)
console.log(
  `profile=random character throughput on ~${formatNumber(
    draft.chars
  )} graphemes with ${formatNumber(REVISION_OPS)} random edits`
)
console.log('')
printTable(rows)
