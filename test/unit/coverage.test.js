import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CRText,
  CRTextError,
  ChangeStreamAdapter,
  BeforeInputStreamAdapter,
  translateDOMBeforeInputEvent,
} from '../../dist/index.js'

class MockText {
  constructor(data = '') {
    this.data = data
    this.parentNode = null
  }

  get length() {
    return this.data.length
  }

  get textContent() {
    return this.data
  }

  set textContent(value) {
    this.data = String(value)
  }

  deleteData(index, count) {
    this.data = this.data.slice(0, index) + this.data.slice(index + count)
  }

  insertData(index, value) {
    this.data = this.data.slice(0, index) + value + this.data.slice(index)
  }

  remove() {
    this.parentNode?.removeChild(this)
  }
}

class MockElement {
  constructor(tagName = 'div', ownerDocument = null) {
    this.tagName = tagName.toUpperCase()
    this.ownerDocument = ownerDocument
    this.parentNode = null
    this.childNodes = []
    this.dataset = {}
    this._textContent = ''
  }

  get firstChild() {
    return this.childNodes[0] ?? null
  }

  get children() {
    return this.childNodes.filter((node) => node instanceof MockElement)
  }

  get textContent() {
    if (this.childNodes.length === 0) return this._textContent
    return this.childNodes.map((node) => node.textContent ?? '').join('')
  }

  set textContent(value) {
    this._textContent = String(value)
    this.childNodes = []
  }

  append(node) {
    return this.insertBefore(node, null)
  }

  insertBefore(node, referenceNode) {
    if (node.parentNode) node.parentNode.removeChild(node)
    const index =
      referenceNode === null
        ? this.childNodes.length
        : this.childNodes.indexOf(referenceNode)
    if (index === -1) throw new Error('reference node not found')
    node.parentNode = this
    if (this.ownerDocument && node instanceof MockElement) {
      node.ownerDocument = this.ownerDocument
    }
    this.childNodes.splice(index, 0, node)
    return node
  }

  removeChild(node) {
    const index = this.childNodes.indexOf(node)
    if (index >= 0) this.childNodes.splice(index, 1)
    node.parentNode = null
    return node
  }

  remove() {
    this.parentNode?.removeChild(this)
  }

  contains(node) {
    let current = node
    while (current) {
      if (current === this) return true
      current = current.parentNode
    }
    return false
  }

  querySelector(selector) {
    if (selector === '[data-caret-anchor="true"]') {
      return (
        this.children.find((child) => child.dataset.caretAnchor === 'true') ??
        null
      )
    }
    return null
  }
}

class MockInputElement extends MockElement {
  constructor(ownerDocument) {
    super('input', ownerDocument)
    this.value = ''
    this.selectionStart = 0
    this.selectionEnd = 0
  }

  setRangeText(replacement, start, end) {
    this.value =
      this.value.slice(0, start) + replacement + this.value.slice(end)
    const next = start + replacement.length
    this.selectionStart = next
    this.selectionEnd = next
  }
}

class MockTextAreaElement extends MockInputElement {
  constructor(ownerDocument) {
    super(ownerDocument)
    this.tagName = 'TEXTAREA'
  }
}

class MockRange {
  constructor() {
    this.startContainer = null
    this.startOffset = 0
    this.endContainer = null
    this.endOffset = 0
    this.selectedNode = null
    this.collapsed = false
  }

  cloneRange() {
    const range = new MockRange()
    range.startContainer = this.startContainer
    range.startOffset = this.startOffset
    range.endContainer = this.endContainer
    range.endOffset = this.endOffset
    range.selectedNode = this.selectedNode
    return range
  }

  selectNodeContents(node) {
    this.selectedNode = node
  }

  setEnd(container, offset) {
    this.endContainer = container
    this.endOffset = offset
  }

  setStart(container, offset) {
    this.startContainer = container
    this.startOffset = offset
  }

  collapse(value) {
    this.collapsed = Boolean(value)
  }

  toString() {
    if (
      this.selectedNode &&
      this.endContainer instanceof MockText &&
      this.selectedNode.contains(this.endContainer)
    ) {
      return this.endContainer.data.slice(0, this.endOffset)
    }
    if (
      this.startContainer instanceof MockText &&
      this.endContainer instanceof MockText
    ) {
      if (this.startContainer === this.endContainer) {
        return this.startContainer.data.slice(this.startOffset, this.endOffset)
      }
      return (
        this.startContainer.data.slice(this.startOffset) +
        this.endContainer.data.slice(0, this.endOffset)
      )
    }
    return ''
  }
}

class MockSelection {
  constructor(range = null) {
    this.range = range
    this.addedRanges = []
    this.removed = 0
  }

  get rangeCount() {
    return this.range ? 1 : 0
  }

  getRangeAt() {
    if (!this.range) throw new Error('no range')
    return this.range
  }

  removeAllRanges() {
    this.removed++
    this.addedRanges = []
  }

  addRange(range) {
    this.range = range
    this.addedRanges.push(range)
  }
}

class MockDocument {
  constructor() {
    this.activeElement = null
    this.selection = new MockSelection(null)
    this.defaultView = {
      getSelection: () => this.selection,
    }
  }

  createTextNode(data) {
    const node = new MockText(data)
    node.ownerDocument = this
    return node
  }

  createElement(tagName) {
    const element = new MockElement(tagName, this)
    if (tagName.toLowerCase() === 'span') {
      const textNode = this.createTextNode('')
      element.append(textNode)
    }
    return element
  }

  createRange() {
    return new MockRange()
  }
}

function installMockDom() {
  const previous = {
    HTMLElement: globalThis.HTMLElement,
    HTMLInputElement: globalThis.HTMLInputElement,
    HTMLTextAreaElement: globalThis.HTMLTextAreaElement,
    Text: globalThis.Text,
    window: globalThis.window,
  }

  globalThis.HTMLElement = MockElement
  globalThis.HTMLInputElement = MockInputElement
  globalThis.HTMLTextAreaElement = MockTextAreaElement
  globalThis.Text = MockText

  return {
    setDocument(doc) {
      globalThis.window = { getSelection: () => doc.selection }
    },
    restore() {
      globalThis.HTMLElement = previous.HTMLElement
      globalThis.HTMLInputElement = previous.HTMLInputElement
      globalThis.HTMLTextAreaElement = previous.HTMLTextAreaElement
      globalThis.Text = previous.Text
      globalThis.window = previous.window
    },
  }
}

function createInputEvent(target, init = {}) {
  const event = {
    target,
    data: init.data ?? null,
    dataTransfer: init.dataTransfer,
    inputType: init.inputType ?? 'insertText',
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true
    },
  }
  return event
}

test('coverage: CRTextError and inspection helpers', () => {
  const error = new CRTextError('BAD_PARAMS')
  assert.equal(error.code, 'BAD_PARAMS')
  assert.equal(error.name, 'CRTextError')
  assert.match(
    error.message,
    /\{@sovereignbase\/convergent-replicated-text\} BAD_PARAMS/
  )

  const replica = new CRText()
  replica.insertAfter(-1, 'ab')
  assert.equal(replica.toString(), JSON.stringify(replica.toJSON()))
  assert.equal(replica[Symbol.for('nodejs.util.inspect.custom')](), 'ab')
  assert.equal(replica[Symbol.for('Deno.customInspect')](), 'ab')
})

test('coverage: CRText bad params and no-op branches do not mutate', () => {
  const replica = new CRText()
  assert.throws(() => replica.insertAfter('x', 'a'), /typeof number/)
  assert.throws(() => replica.removeAfter(0, 'x'), /removeCount/)
  assert.equal(replica.valueOf(), '')

  replica.removeAfter(0, 1)
  assert.equal(replica.valueOf(), '')

  const events = []
  replica.addEventListener('change', (event) => events.push(event.detail))
  replica.merge(false)
  assert.equal(events.length, 0)

  replica.insertAfter(-1, '')
  assert.equal(replica.valueOf(), '')

  const malformed = new CRText()
  malformed.insertAfter(-1, 'ok')
  const snapshot = malformed.toJSON()
  snapshot.values[0].value = 123
  const rebuilt = new CRText(snapshot)
  assert.deepEqual([...rebuilt], ['k'])
})

test('coverage: translateDOMBeforeInputEvent handles input elements and unsupported targets', () => {
  const mock = installMockDom()
  try {
    const doc = new MockDocument()
    mock.setDocument(doc)
    const input = new MockInputElement(doc)
    input.value = 'abcd'
    input.selectionStart = 1
    input.selectionEnd = 3

    assert.equal(translateDOMBeforeInputEvent({ target: null }), false)

    const pasteEvent = createInputEvent(input, {
      dataTransfer: {
        getData(type) {
          return type === 'text/plain' ? 'XY' : ''
        },
      },
      inputType: 'insertFromPaste',
    })
    assert.deepEqual(translateDOMBeforeInputEvent(pasteEvent), {
      insert: { index: 1, characters: 'XY' },
      remove: { index: 1, removeCount: 2 },
    })

    input.selectionStart = 2
    input.selectionEnd = 2
    assert.deepEqual(
      translateDOMBeforeInputEvent(
        createInputEvent(input, { inputType: 'deleteContentBackward' })
      ),
      {
        insert: false,
        remove: { index: 1, removeCount: 1 },
      }
    )

    assert.deepEqual(
      translateDOMBeforeInputEvent(
        createInputEvent(input, { inputType: 'deleteContentForward' })
      ),
      {
        insert: false,
        remove: { index: 2, removeCount: 1 },
      }
    )

    assert.deepEqual(
      translateDOMBeforeInputEvent(
        createInputEvent(input, {
          inputType: 'insertParagraph',
        })
      ),
      {
        insert: { index: 2, characters: '\n' },
        remove: false,
      }
    )

    input.selectionStart = null
    input.selectionEnd = null
    assert.deepEqual(
      translateDOMBeforeInputEvent(
        createInputEvent(input, { inputType: 'insertText', data: 'Q' })
      ),
      {
        insert: { index: 0, characters: 'Q' },
        remove: false,
      }
    )
  } finally {
    mock.restore()
  }
})

test('coverage: translateDOMBeforeInputEvent handles contenteditable selections', () => {
  const mock = installMockDom()
  try {
    const doc = new MockDocument()
    mock.setDocument(doc)
    const host = new MockElement('div', doc)
    const text = doc.createTextNode('hello')
    host.append(text)

    const range = new MockRange()
    range.startContainer = text
    range.startOffset = 1
    range.endContainer = text
    range.endOffset = 4
    doc.selection = new MockSelection(range)

    assert.deepEqual(
      translateDOMBeforeInputEvent(createInputEvent(host, { data: 'X' })),
      {
        insert: { index: 1, characters: 'X' },
        remove: { index: 1, removeCount: 3 },
      }
    )

    doc.selection = new MockSelection(null)
    assert.deepEqual(
      translateDOMBeforeInputEvent(
        createInputEvent(host, { inputType: 'insertText', data: 'Y' })
      ),
      {
        insert: { index: 0, characters: 'Y' },
        remove: false,
      }
    )

    const outsider = doc.createTextNode('other')
    const outsideRange = new MockRange()
    outsideRange.startContainer = outsider
    outsideRange.startOffset = 0
    outsideRange.endContainer = outsider
    outsideRange.endOffset = 1
    doc.selection = new MockSelection(outsideRange)
    assert.deepEqual(
      translateDOMBeforeInputEvent(
        createInputEvent(host, { inputType: 'insertText', data: 'Z' })
      ),
      {
        insert: { index: 0, characters: 'Z' },
        remove: false,
      }
    )
  } finally {
    mock.restore()
  }
})

test('coverage: BeforeInputStreamAdapter applies translated insertions and removals', () => {
  const mock = installMockDom()
  try {
    const doc = new MockDocument()
    mock.setDocument(doc)
    const input = new MockInputElement(doc)
    const replica = new CRText()

    const insertEvent = createInputEvent(input, {
      data: 'ab',
      inputType: 'insertText',
    })
    input.selectionStart = 0
    input.selectionEnd = 0
    BeforeInputStreamAdapter(insertEvent, replica)
    assert.equal(insertEvent.defaultPrevented, true)
    assert.equal(replica.valueOf(), 'ab')

    input.selectionStart = 1
    input.selectionEnd = 1
    const removeEvent = createInputEvent(input, {
      inputType: 'deleteContentBackward',
    })
    BeforeInputStreamAdapter(removeEvent, replica)
    assert.equal(replica.valueOf(), 'b')

    const invalidEvent = {
      target: {},
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true
      },
      inputType: 'insertText',
    }
    BeforeInputStreamAdapter(invalidEvent, replica)
    assert.equal(invalidEvent.defaultPrevented, true)
    assert.equal(replica.valueOf(), 'b')

    input.selectionStart = -1
    input.selectionEnd = -1
    const negativeInsert = createInputEvent(input, {
      data: 'z',
      inputType: 'insertText',
    })
    BeforeInputStreamAdapter(negativeInsert, replica)
    assert.equal(replica.valueOf(), 'b')
  } finally {
    mock.restore()
  }
})

test('coverage: ChangeStreamAdapter updates input and textarea controls', () => {
  const mock = installMockDom()
  try {
    const doc = new MockDocument()
    mock.setDocument(doc)

    const input = new MockInputElement(doc)
    input.value = 'abcd'
    ChangeStreamAdapter(
      new CustomEvent('change', {
        detail: { 1: undefined, 2: 'X' },
      }),
      input
    )
    assert.equal(input.value, 'acXd')

    const textarea = new MockTextAreaElement(doc)
    textarea.value = 'xy'
    ChangeStreamAdapter(
      new CustomEvent('change', {
        detail: { 2: '\n' },
      }),
      textarea
    )
    assert.equal(textarea.value, 'xy\n')
  } finally {
    mock.restore()
  }
})

test('coverage: ChangeStreamAdapter updates contenteditable text and caret state', () => {
  const mock = installMockDom()
  try {
    const doc = new MockDocument()
    mock.setDocument(doc)
    const host = new MockElement('div', doc)
    const oldAnchor = doc.createElement('span')
    oldAnchor.dataset.caretAnchor = 'true'
    host.append(oldAnchor)
    const text = doc.createTextNode('abcd')
    host.append(text)
    doc.activeElement = host
    doc.selection = new MockSelection(new MockRange())

    ChangeStreamAdapter(
      new CustomEvent('change', {
        detail: { 1: undefined, 3: 'Z' },
      }),
      host
    )

    assert.equal(host.querySelector('[data-caret-anchor="true"]'), null)
    assert.equal(host.firstChild.data, 'acdZ')
    assert.equal(doc.selection.addedRanges.length, 1)
    assert.equal(doc.selection.removed, 1)
  } finally {
    mock.restore()
  }
})

test('coverage: ChangeStreamAdapter handles unfocused hosts missing selections and trailing newline anchors', () => {
  const mock = installMockDom()
  try {
    const doc = new MockDocument()
    mock.setDocument(doc)

    const unfocusedHost = new MockElement('div', doc)
    ChangeStreamAdapter(
      new CustomEvent('change', {
        detail: { 0: 'A' },
      }),
      unfocusedHost
    )
    assert.equal(unfocusedHost.firstChild.data, 'A')

    const focusedHost = new MockElement('div', doc)
    focusedHost.append(doc.createTextNode('a'))
    doc.activeElement = focusedHost
    doc.defaultView = { getSelection: () => null }
    ChangeStreamAdapter(
      new CustomEvent('change', {
        detail: { 1: '\n' },
      }),
      focusedHost
    )
    assert.equal(focusedHost.firstChild.data, 'a\n')

    doc.defaultView = { getSelection: () => doc.selection }
    doc.selection = new MockSelection(new MockRange())
    ChangeStreamAdapter(
      new CustomEvent('change', {
        detail: { 2: '\n' },
      }),
      focusedHost
    )
    const anchor = focusedHost.querySelector('[data-caret-anchor="true"]')
    assert(anchor, 'expected caret anchor for trailing newline')
    assert.equal(anchor.textContent, '\u200B')
  } finally {
    mock.restore()
  }
})
