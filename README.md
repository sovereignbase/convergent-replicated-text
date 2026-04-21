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

- Deterministic convergence of the live text projection under asynchronous gossip delivery.
- Consistent behavior across Node, browsers, worker, and edge runtimes.
- Garbage collection possibility without breaking live-text convergence.
- Event-driven API.

## Installation

```sh
npm install @sovereignbase/convergent-replicated-text
# or
pnpm add @sovereignbase/convergent-replicated-text
# or
yarn add @sovereignbase/convergent-replicated-text
# or
bun add @sovereignbase/convergent-replicated-text
# or
deno add jsr:@sovereignbase/convergent-replicated-text
# or
vlt install jsr:@sovereignbase/convergent-replicated-text
```

## Usage

### Copy-paste example

```ts
import {
  CRText,
  BeforeInputStreamAdapter,
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
    (event) => void BeforeInputStreamAdapter(event, text)
  )
}

text.addEventListener('delta', (ev) => {
  void station.relay(ev.detail)
})

station.addEventListener('message', (ev) => {
  void text.merge(ev.detail)
})
```

## Runtime behavior

### Validation and errors

- `insertAfter()` and `removeAfter()` validate parameter types and throw `CRTextError` with the stable code `BAD_PARAMS` for invalid calls.
- `insertAfter(-1, text)` is the supported way to insert at the beginning of the document.
- Local `insertAfter()` and `removeAfter()` emit both `delta` and `change`; remote `merge()` emits `change` only when the visible text projection changes.
- `snapshot()` emits a detached snapshot event and `acknowledge()` emits an acknowledgement frontier event.

### Safety and copying semantics

- `CRText` stores text as grapheme-cluster entries backed by `@sovereignbase/convergent-replicated-list`.
- `toJSON()` returns a detached structured-clone-compatible snapshot and `toString()` serializes that snapshot as JSON.
- `valueOf()`, `Symbol.toPrimitive`, iteration, and runtime inspect hooks expose the current visible string projection.
- `BeforeInputStreamAdapter()` prevents the browser's default DOM mutation and translates `beforeinput` events into `insertAfter()` / `removeAfter()` calls.
- `ChangeStreamAdapter()` applies `change` patches to `<input>`, `<textarea>`, and `contenteditable` hosts and restores the caret for focused editable elements.

### Convergence and compaction

- The convergence target is the visible text returned by `valueOf()`.
- `merge()` applies remote CR-List deltas to the underlying replica state while preserving the event-driven `CRText` surface.
- `garbageCollect(frontiers)` compacts tombstoned history after acknowledgement frontiers make it safe to do so.

## Tests

```sh
npm run test
```

What the current test suite covers:

- Coverage on built `dist/**/*.js`: `100%` statements, `100%` branches, `100%` functions, and `100%` lines.
- Public API surface: `CRText`, `CRTextError`, `BeforeInputStreamAdapter`, `translateDOMBeforeInputEvent`, and `ChangeStreamAdapter`.
- `CRText` invariants: snapshot hydration, string coercion, grapheme-aware insert/remove semantics, event channels, duplicate delta idempotency, and garbage-collection-preserved text convergence.
- DOM adapter behavior for input, textarea, and contenteditable hosts, including selection translation and caret restoration edge paths.
- Deterministic convergence stress for shuffled gossip delivery, replica restarts, and `valueOf()` equality across replicas after randomized local edits.
- End-to-end runtime matrix:
  - Node ESM
  - Node CJS
  - Bun ESM
  - Bun CJS
  - Deno ESM
  - Cloudflare Workers ESM
  - Edge Runtime ESM
  - Browsers via Playwright: Chromium, Firefox, WebKit, mobile Chrome, mobile Safari

## Benchmarks

```sh
npm run bench
```

Last measured on Node `v22.14.0` (`win32 x64`).

| group        | scenario                               |  chars | workload                               |    ops |       ms | ms/op |   ops/sec |
| ------------ | -------------------------------------- | -----: | -------------------------------------- | -----: | -------: | ----: | --------: |
| `throughput` | `typing / append random article`       | 12,500 | `1010 append operations`               | 24,240 | 2,301.96 |  0.09 | 10,530.14 |
| `throughput` | `editing / random inserts and deletes` | 15,153 | `2000 random insert/remove operations` | 24,000 | 6,638.76 |  0.28 |  3,615.13 |
| `projection` | `snapshot / toJSON revised article`    | 15,153 | `detached snapshot`                    |    240 | 6,020.95 | 25.09 |     39.86 |
| `projection` | `valueOf / materialize current string` | 15,153 | `string projection`                    |    360 | 8,024.94 | 22.29 |     44.86 |

## License

Apache-2.0
