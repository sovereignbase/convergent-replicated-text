[![npm version](https://img.shields.io/npm/v/@sovereignbase/convergent-replicated-text)](https://www.npmjs.com/package/@sovereignbase/convergent-replicated-text)
[![CI](https://github.com/sovereignbase/convergent-replicated-text/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/sovereignbase/convergent-replicated-text/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/sovereignbase/convergent-replicated-text/branch/master/graph/badge.svg)](https://codecov.io/gh/sovereignbase/convergent-replicated-text)
[![license](https://img.shields.io/npm/l/@sovereignbase/convergent-replicated-text)](LICENSE)

# convergent-replicated-text

Convergent Replicated Text (CR-Text), a delta CRDT for text value state.

Try the demo:

- https://sovereignbase.dev/convergent-replicated-text

## Compatibility

- Runtimes: Node >= 20, modern browsers, Bun, Deno, Cloudflare Workers, Edge Runtime.
- Module format: ESM + CommonJS.
- Required globals / APIs: `EventTarget`, `CustomEvent`, `structuredClone`.
- TypeScript: bundled types.

## Goals

- Deterministic convergence of the live map projection under asynchronous gossip delivery.
- Consistent behavior across Node, browsers, worker, and edge runtimes.
- Garbage collection possibility without breaking live-view convergence.
- Event-driven API.

## Installation

```sh
npm install @sovereignbase/convergent-replicated-map
# or
pnpm add @sovereignbase/convergent-replicated-map
# or
yarn add @sovereignbase/convergent-replicated-map
# or
bun add @sovereignbase/convergent-replicated-map
# or
deno add jsr:@sovereignbase/convergent-replicated-map
# or
vlt install jsr:@sovereignbase/convergent-replicated-map
```

## Usage

### Copy-paste example

```ts
import {
  CRText,
  InputStreamAdapter,
  ChangeStreamAdapter,
} from '@sovereignbase/convergent-replicated-text'

import { StationClient } from '@sovereignbase/station-client'

const station = new StationClient()
const snapshot = JSON.parse(localStorage.getItem('state')) ?? undefined
const frontiers = JSON.parse(localStorage.getItem('frontiers')) ?? undefined

const text = new CRText(snapshot)

if (frontiers) {
  void text.garbageCollect(frontiers)
}

text.addEventListener('snapshot', (ev) => {
  void localStorage.setItem('state', JSON.stringify(ev.detail))
})

text.addEventListener('ack', (ev) => {
  void localStorage.setItem('frontiers', JSON.stringify([ev.detail]))
})

const elements = [
  document.getElementById('textarea-element'),
  document.getElementById('input-element'),
  document.getElementById('html-element'),
]

text.addEventListener('change', (event) => {
  for (const element of elements) {
    void ChangeStreamAdapter(event, element)
  }
  void text.snapshot()
  void text.acknowledge()
})

for (const element of elements) {
  element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
    ? (element.value = text)
    : (element.textContent = text)

  void element.addEventListener(
    'beforeinput',
    (event) => void InputStreamAdapter(event, text)
  )
}

text.addEventListener('delta', (ev) => {
  station.relay(ev.detail)
})

station.addEventListener('message', (ev) => {
  text.merge(ev.detail)
})
```

## Runtime behavior

### Validation and errors

### Safety and copying semantics

### Convergence and compaction

## Tests

```sh
npm run test
```

## Benchmarks

```sh
npm run bench
```

group scenario chars workload ops ms ms/op ops/sec

---

throughput typing / append random article 12,500 1010 append operations 24,240 2,940.61 0.12 8,243.18
throughput editing / random inserts and deletes 15,153 2000 random insert/remove operations 24,000 7,030.45 0.29 3,413.72
projection snapshot / toJSON revised article 15,153 detached snapshot 240 6,542.39 27.26 36.68
projection valueOf / materialize current string 15,153 string projection 360 5,635.13 15.65 63.88

## License

Apache-2.0
