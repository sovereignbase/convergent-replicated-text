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
