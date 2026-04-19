const TEST_TIMEOUT_MS = 10_000

export async function runCRTextSuite(api, options = {}) {
  const {
    label = 'runtime',
    stressRounds = 8,
    scenarioCount = 40,
    includeStress = false,
    verbose = false,
  } = options
  const results = { label, ok: true, errors: [], tests: [] }

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'assertion failed')
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected)
      throw new Error(message || `expected ${actual} to equal ${expected}`)
  }

  function assertJsonEqual(actual, expected, message) {
    const actualJson = JSON.stringify(actual)
    const expectedJson = JSON.stringify(expected)
    if (actualJson !== expectedJson)
      throw new Error(
        message || `expected ${actualJson} to equal ${expectedJson}`
      )
  }

  async function withTimeout(promise, ms, name) {
    let timer
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`timeout after ${ms}ms${name ? `: ${name}` : ''}`))
      }, ms)
    })
    return Promise.race([promise.finally(() => clearTimeout(timer)), timeout])
  }

  async function runTest(name, fn) {
    try {
      if (verbose) console.log(`${label}: ${name}`)
      await withTimeout(Promise.resolve().then(fn), TEST_TIMEOUT_MS, name)
      results.tests.push({ name, ok: true })
    } catch (error) {
      results.ok = false
      results.tests.push({ name, ok: false })
      results.errors.push({ name, message: String(error) })
    }
  }

  async function withSilencedConsole(fn) {
    const originalLog = console.log
    console.log = () => {}
    try {
      return await fn()
    } finally {
      console.log = originalLog
    }
  }

  function createReplica(snapshot) {
    return new api.CRText(snapshot)
  }

  function textOf(replica) {
    return replica.valueOf()
  }

  function snapshotOf(replica) {
    return JSON.parse(JSON.stringify(replica.toJSON()))
  }

  function graphemes(text) {
    return Array.from(
      new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
      (entry) => entry.segment
    )
  }

  function random(seed) {
    let state = seed >>> 0
    return () => {
      state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0
      return state / 0x1_0000_0000
    }
  }

  function shuffled(values, seed) {
    const next = values.slice()
    const rand = random(seed)
    for (let index = next.length - 1; index > 0; index--) {
      const other = Math.floor(rand() * (index + 1))
      ;[next[index], next[other]] = [next[other], next[index]]
    }
    return next
  }

  function shuffledIndices(length, seed) {
    return shuffled(
      Array.from({ length }, (_, index) => index),
      seed
    )
  }

  function captureEvents(replica) {
    const events = {
      delta: [],
      change: [],
      snapshot: [],
      ack: [],
    }
    const listeners = {
      delta(event) {
        events.delta.push(event.detail)
      },
      change(event) {
        events.change.push(event.detail)
      },
      snapshot(event) {
        events.snapshot.push(event.detail)
      },
      ack(event) {
        events.ack.push(event.detail)
      },
    }
    for (const type of Object.keys(listeners))
      replica.addEventListener(type, listeners[type])
    return {
      events,
      dispose() {
        for (const type of Object.keys(listeners))
          replica.removeEventListener(type, listeners[type])
      },
    }
  }

  function emitSnapshot(replica) {
    const probe = captureEvents(replica)
    replica.snapshot()
    const snapshot = probe.events.snapshot.at(-1)
    probe.dispose()
    return snapshot
  }

  function emitAck(replica) {
    const probe = captureEvents(replica)
    replica.acknowledge()
    const ack = probe.events.ack.at(-1)
    probe.dispose()
    return ack
  }

  function assertReplicasConverged(replicas, message) {
    const expectedText = textOf(replicas[0])
    for (let index = 1; index < replicas.length; index++) {
      assertEqual(
        textOf(replicas[index]),
        expectedText,
        message || `replica ${index} text diverged`
      )
    }
    for (let index = 0; index < replicas.length; index++) {
      const hydrated = createReplica(replicas[index].toJSON())
      assertEqual(
        textOf(hydrated),
        textOf(replicas[index]),
        message || `replica ${index} hydrate diverged`
      )
    }
  }

  function mergeDeltas(replica, deltas, seed, options = {}) {
    const { restart = false } = options
    let current = replica
    const order = shuffledIndices(deltas.length, seed)
    for (let index = 0; index < order.length; index++) {
      const deltaIndex = order[index]
      current.merge(deltas[deltaIndex])
      if (deltaIndex % 3 === 0) current.merge(deltas[deltaIndex])
      if (restart && index % 7 === 0) current = createReplica(current.toJSON())
    }
    return current
  }

  function mergeSnapshots(replica, snapshots, seed, options = {}) {
    const { restart = false } = options
    let current = replica
    const order = shuffledIndices(snapshots.length, seed)
    for (let index = 0; index < order.length; index++) {
      const snapshotIndex = order[index]
      current.merge(snapshots[snapshotIndex])
      if (snapshotIndex % 2 === 0) current.merge(snapshots[snapshotIndex])
      if (restart && index % 5 === 0) current = createReplica(current.toJSON())
    }
    return current
  }

  function nextChunk(serial, rand) {
    const corpus = ['a', 'b', 'c', 'd', '\n', 'å', 'ä', '🙂', '🚀', 'e\u0301']
    const width = 1 + Math.floor(rand() * 3)
    let text = ''
    for (let index = 0; index < width; index++) {
      const value =
        corpus[(serial + index + Math.floor(rand() * 7)) % corpus.length]
      text += value
    }
    return text
  }

  function applyLocalEdit(replica, probe, rand, serial) {
    const deltaCount = probe.events.delta.length
    const changeCount = probe.events.change.length
    const roll = rand()

    if (replica.size === 0 || roll < 0.6) {
      const anchor =
        replica.size === 0 ? -1 : Math.floor(rand() * (replica.size + 1)) - 1
      replica.insertAfter(anchor, nextChunk(serial, rand))
    } else {
      const index = Math.floor(rand() * replica.size)
      const removeCount =
        1 + Math.floor(rand() * Math.min(3, replica.size - index))
      replica.removeAfter(index, removeCount)
    }

    assertEqual(
      probe.events.delta.length,
      deltaCount + 1,
      'local edit did not emit exactly one delta'
    )
    assertEqual(
      probe.events.change.length,
      changeCount + 1,
      'local edit did not emit exactly one change'
    )

    return probe.events.delta.at(-1)
  }

  function collectStressDeltas(replicas, rounds, seed) {
    const rand = random(seed)
    const probes = replicas.map((replica) => captureEvents(replica))
    const deltas = []
    let serial = 0

    try {
      for (let round = 0; round < rounds; round++) {
        for (let index = 0; index < replicas.length; index++) {
          deltas.push(
            applyLocalEdit(replicas[index], probes[index], rand, serial)
          )
          serial++
        }
      }
    } finally {
      for (const probe of probes) probe.dispose()
    }

    return deltas
  }

  await runTest('exports shape', () => {
    assert(typeof api.CRText === 'function', 'CRText export missing')
    assert(
      typeof api.ChangeStreamAdapter === 'function',
      'ChangeStreamAdapter export missing'
    )
    assert(
      typeof api.BeforeInputStreamAdapter === 'function',
      'BeforeInputStreamAdapter export missing'
    )
    assert(
      typeof api.translateDOMBeforeInputEvent === 'function',
      'translateDOMBeforeInputEvent export missing'
    )
    assert(typeof api.CRTextError === 'function', 'CRTextError export missing')
  })

  await runTest(
    'constructor hydrate and string coercions preserve the visible text',
    () => {
      const replica = createReplica()
      replica.insertAfter(-1, 'he')
      replica.insertAfter(1, 'llo')
      replica.insertAfter(replica.size - 1, '🙂')

      assertEqual(textOf(replica), 'hello🙂')
      assertEqual(`${replica}`, 'hello🙂')
      assertEqual(replica[Symbol.toPrimitive](), 'hello🙂')
      assertEqual([...replica].join(''), 'hello🙂')

      const hydrated = createReplica(replica.toJSON())
      assertEqual(textOf(hydrated), 'hello🙂')
      assertEqual(hydrated.size, replica.size)
    }
  )

  await runTest('insert and remove operate on grapheme clusters', () => {
    const replica = createReplica()
    const text = 'A👨‍👩‍👧‍👦e\u0301Z'
    replica.insertAfter(-1, text)

    assertEqual(textOf(replica), text)
    assertEqual(replica.size, graphemes(text).length)

    replica.removeAfter(1, 1)
    assertEqual(textOf(replica), 'Ae\u0301Z')
    assertEqual(replica.size, graphemes('Ae\u0301Z').length)
  })

  await runTest(
    'local operations emit delta and change while remote merges emit change only',
    () =>
      withSilencedConsole(() => {
        const local = createReplica()
        const localProbe = captureEvents(local)

        try {
          local.insertAfter(-1, 'ab')
          assertEqual(localProbe.events.delta.length, 1)
          assertEqual(localProbe.events.change.length, 1)

          const remote = createReplica(local.toJSON())
          const remoteProbe = captureEvents(remote)
          remote.insertAfter(-1, 'X')
          const remoteDelta = remoteProbe.events.delta.at(-1)
          local.merge(remoteDelta)

          assertEqual(localProbe.events.delta.length, 1)
          assertEqual(localProbe.events.change.length, 2)
          assertEqual(textOf(local), textOf(remote))
          remoteProbe.dispose()
        } finally {
          localProbe.dispose()
        }
      })
  )

  await runTest(
    'snapshot acknowledge and removeEventListener work with function and object listeners',
    () => {
      const replica = createReplica()
      const counts = { delta: 0, snapshot: 0 }
      const deltaListener = () => {
        counts.delta++
      }
      const snapshotListener = {
        handleEvent() {
          counts.snapshot++
        },
      }

      replica.addEventListener('delta', deltaListener)
      replica.addEventListener('snapshot', snapshotListener)

      replica.insertAfter(-1, 'abc')
      const snapshot = emitSnapshot(replica)
      void emitAck(replica)

      replica.removeEventListener('delta', deltaListener)
      replica.removeEventListener('snapshot', snapshotListener)
      replica.insertAfter(replica.size - 1, 'd')
      replica.snapshot()
      replica.acknowledge()

      assertEqual(counts.delta, 1)
      assertEqual(counts.snapshot, 1)

      snapshot.values.length = 0
      snapshot.tombstones.length = 0

      assertEqual(textOf(replica), 'abcd')
      assert(snapshotOf(replica).values.length > 0, 'snapshot mutation leaked')
    }
  )

  await runTest('duplicate delta merges are idempotent', () =>
    withSilencedConsole(() => {
      const source = createReplica()
      const sourceProbe = captureEvents(source)
      const target = createReplica()
      const targetProbe = captureEvents(target)

      try {
        source.insertAfter(-1, 'abc')
        const insertDelta = sourceProbe.events.delta.at(-1)

        target.merge(insertDelta)
        target.merge(insertDelta)

        assertEqual(textOf(target), 'abc')
        assertEqual(targetProbe.events.change.length, 1)

        source.removeAfter(1, 1)
        const removeDelta = sourceProbe.events.delta.at(-1)

        target.merge(removeDelta)
        target.merge(removeDelta)

        assertEqual(textOf(target), 'ac')
        assertEqual(targetProbe.events.change.length, 2)
      } finally {
        sourceProbe.dispose()
        targetProbe.dispose()
      }
    })
  )

  await runTest(
    'full-frontier garbage collection preserves converged value and snapshot hydration',
    () =>
      withSilencedConsole(() => {
        const seed = createReplica()
        seed.insertAfter(-1, 'abcdef')
        const baseSnapshot = seed.toJSON()
        const replicas = Array.from({ length: 3 }, () =>
          createReplica(baseSnapshot)
        )
        const sourceProbe = captureEvents(replicas[0])

        try {
          replicas[0].removeAfter(1, 3)
          replicas[0].insertAfter(0, 'XYZ')
          replicas[0].insertAfter(replicas[0].size - 1, '🙂')

          for (const delta of sourceProbe.events.delta) {
            replicas[1].merge(delta)
            replicas[2].merge(delta)
          }

          assertReplicasConverged(replicas)

          const frontiers = replicas
            .map((replica) => emitAck(replica))
            .filter((frontier) => typeof frontier === 'string')

          for (const replica of replicas) replica.garbageCollect(frontiers)

          assertReplicasConverged(replicas, 'gc changed converged state')
          for (const replica of replicas) {
            const hydrated = createReplica(replica.toJSON())
            assertEqual(textOf(hydrated), textOf(replica))
          }
        } finally {
          sourceProbe.dispose()
        }
      })
  )

  if (includeStress) {
    await runTest('replicas converge after shuffled delta delivery', () =>
      withSilencedConsole(() => {
        const seed = createReplica()
        seed.insertAfter(-1, 'seed🙂')
        const baseSnapshot = seed.toJSON()
        const sources = Array.from({ length: 5 }, () =>
          createReplica(baseSnapshot)
        )
        const deltas = collectStressDeltas(sources, stressRounds, 0xc0ffee)
        const snapshots = sources.map((replica) => replica.toJSON())
        const targets = Array.from({ length: 5 }, () =>
          createReplica(baseSnapshot)
        )

        for (let index = 0; index < targets.length; index++) {
          targets[index] = mergeDeltas(targets[index], deltas, 10_000 + index)
          targets[index] = mergeSnapshots(
            targets[index],
            snapshots,
            15_000 + index
          )
        }

        assertReplicasConverged(targets)
      })
    )

    await runTest(
      'replicas converge across shuffled delivery with restarts',
      () =>
        withSilencedConsole(() => {
          const seed = createReplica()
          seed.insertAfter(-1, 'seed🙂')
          const baseSnapshot = seed.toJSON()
          const sources = Array.from({ length: 5 }, () =>
            createReplica(baseSnapshot)
          )
          const deltas = collectStressDeltas(sources, stressRounds, 0x51ced)
          const snapshots = sources.map((replica) => replica.toJSON())
          const targets = Array.from({ length: 5 }, () =>
            createReplica(baseSnapshot)
          )

          for (let index = 0; index < targets.length; index++) {
            targets[index] = mergeDeltas(
              targets[index],
              deltas,
              20_000 + index,
              {
                restart: true,
              }
            )
            targets[index] = mergeSnapshots(
              targets[index],
              snapshots,
              25_000 + index,
              {
                restart: true,
              }
            )
          }

          assertReplicasConverged(targets)
        })
    )

    await runTest(
      'deterministic randomized scenarios converge on valueOf output',
      () =>
        withSilencedConsole(() => {
          for (let scenario = 0; scenario < scenarioCount; scenario++) {
            const seed = createReplica()
            seed.insertAfter(-1, nextChunk(scenario, random(30_000 + scenario)))
            const baseSnapshot = seed.toJSON()
            const replicaCount = 3 + (scenario % 3)
            const rounds = 2 + (scenario % 5)
            const sources = Array.from({ length: replicaCount }, () =>
              createReplica(baseSnapshot)
            )
            const deltas = collectStressDeltas(
              sources,
              rounds,
              40_000 + scenario * 17
            )
            const snapshots = sources.map((replica) => replica.toJSON())
            const targets = Array.from({ length: replicaCount }, () =>
              createReplica(baseSnapshot)
            )

            for (let index = 0; index < targets.length; index++) {
              targets[index] = mergeDeltas(
                targets[index],
                deltas,
                50_000 + scenario * 13 + index,
                { restart: scenario % 2 === 1 }
              )
              targets[index] = mergeSnapshots(
                targets[index],
                snapshots,
                55_000 + scenario * 13 + index,
                { restart: scenario % 2 === 1 }
              )
            }

            assertReplicasConverged(targets, `scenario ${scenario} diverged`)
          }
        })
    )
  }

  return results
}

export function printResults(results) {
  const passed = results.tests.filter((test) => test.ok).length
  console.log(`${results.label}: ${passed}/${results.tests.length} passed`)
  if (!results.ok) {
    for (const error of results.errors)
      console.error(`  - ${error.name}: ${error.message}`)
  }
}

export function ensurePassing(results) {
  if (results.ok) return
  throw new Error(
    `${results.label} failed with ${results.errors.length} failing tests`
  )
}
