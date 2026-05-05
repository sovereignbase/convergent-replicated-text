import {
  CRText,
  BeforeInputStreamAdapter,
  ChangeStreamAdapter,
} from './dist/index.js'

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
const mergeButton = document.getElementById('merge-button')
const syncModeButtons = document.querySelectorAll('[data-sync-mode]')

let syncMode = 'auto'
let manualInputElement
let isFlushingManualSync = false
const pendingLocalChanges = []
const pendingOutgoingDeltas = []
const pendingIncomingDeltas = []

function flushManualUi() {
  for (const { detail, sourceElement } of pendingLocalChanges.splice(0)) {
    for (const element of elements) {
      if (element === sourceElement) continue
      void ChangeStreamAdapter({ detail }, element)
    }
  }
}

function flushManualSync() {
  flushManualUi()

  isFlushingManualSync = true
  try {
    for (const delta of pendingIncomingDeltas.splice(0)) {
      void text.merge(delta)
    }
  } finally {
    isFlushingManualSync = false
  }

  for (const delta of pendingOutgoingDeltas.splice(0)) {
    void station.relay(delta)
  }
}

function setSyncMode(nextMode) {
  syncMode = nextMode
  mergeButton.hidden = syncMode !== 'manual'

  for (const button of syncModeButtons) {
    button.setAttribute(
      'aria-pressed',
      button.dataset.syncMode === syncMode ? 'true' : 'false'
    )
  }

  if (syncMode === 'auto') {
    flushManualSync()
  }
}

text.addEventListener('change', (event) => {
  if (syncMode === 'manual' && !isFlushingManualSync) {
    if (manualInputElement) {
      void ChangeStreamAdapter(event, manualInputElement)
    }
    pendingLocalChanges.push({
      detail: event.detail,
      sourceElement: manualInputElement,
    })
  } else {
    for (const element of elements) {
      void ChangeStreamAdapter(event, element)
    }
  }

  void text.snapshot()
  void text.acknowledge()
})

for (const element of elements) {
  element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
    ? (element.value = text)
    : (element.textContent = text)

  void element.addEventListener('beforeinput', (event) => {
    manualInputElement = syncMode === 'manual' ? element : undefined
    try {
      void BeforeInputStreamAdapter(event, text)
    } finally {
      manualInputElement = undefined
    }
  })
}

mergeButton.addEventListener('click', flushManualSync)

for (const button of syncModeButtons) {
  button.addEventListener('click', () => {
    const nextMode = button.dataset.syncMode
    if (nextMode === 'auto' || nextMode === 'manual') {
      setSyncMode(nextMode)
    }
  })
}

setSyncMode('auto')

text.addEventListener('delta', (ev) => {
  if (syncMode === 'auto') {
    void station.relay(ev.detail)
    return
  }

  pendingOutgoingDeltas.push(ev.detail)
})

station.addEventListener('message', (ev) => {
  if (syncMode === 'auto') {
    void text.merge(ev.detail)
    return
  }

  pendingIncomingDeltas.push(ev.detail)
})
