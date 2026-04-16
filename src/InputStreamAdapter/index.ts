import type { TextSelection, DOMTranslation } from '../.types/index.js'
import { CRText } from '../CRText/class.js'

function getElementTextSelection(el: HTMLElement): TextSelection {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return {
      selectionStart: el.selectionStart ?? 0,
      selectionEnd: el.selectionEnd ?? 0,
    }
  }

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    return {
      selectionStart: 0,
      selectionEnd: 0,
    }
  }

  const range = selection.getRangeAt(0)

  if (!el.contains(range.startContainer) || !el.contains(range.endContainer)) {
    return {
      selectionStart: 0,
      selectionEnd: 0,
    }
  }

  const beforeRange = range.cloneRange()
  beforeRange.selectNodeContents(el)
  beforeRange.setEnd(range.startContainer, range.startOffset)

  const selectionStart = beforeRange.toString().length
  const selectionEnd = selectionStart + range.toString().length

  return {
    selectionStart,
    selectionEnd,
  }
}

function getInputCharacters(ev: InputEvent): string {
  const transferred = ev.dataTransfer?.getData('text/plain')
  if (typeof transferred === 'string' && transferred.length > 0)
    return transferred

  if (typeof ev.data === 'string') return ev.data

  if (
    ev.inputType === 'insertParagraph' ||
    ev.inputType === 'insertLineBreak'
  ) {
    return '\n'
  }

  return ''
}

function translateDOMEvent(ev: InputEvent): DOMTranslation | false {
  const el = ev.target
  if (!(el instanceof HTMLElement)) return false

  const { selectionStart, selectionEnd } = getElementTextSelection(el)
  const characters = getInputCharacters(ev)

  let removeIndex = selectionStart
  let removeCount = selectionEnd - selectionStart

  if (selectionStart === selectionEnd) {
    if (ev.inputType === 'deleteContentBackward') {
      removeIndex = Math.max(0, selectionStart - 1)
      removeCount = 1
    } else if (ev.inputType === 'deleteContentForward') {
      removeIndex = selectionStart
      removeCount = 1
    }
  }

  return {
    insert: characters
      ? {
          index: selectionStart,
          characters,
        }
      : false,
    remove: removeCount
      ? {
          index: removeIndex,
          removeCount,
        }
      : false,
  }
}

export function InputStreamAdapter(
  beforeInputEvent: InputEvent,
  crText: CRText
): void {
  beforeInputEvent.preventDefault()

  const result = translateDOMEvent(beforeInputEvent)
  if (!result) return

  const { insert, remove } = result

  if (insert) {
    let index = insert.index
    if (index < 0) return
    index--
    void crText.insertAfter(index, insert.characters)
  }

  if (remove) {
    void crText.removeAfter(remove.index, remove.removeCount)
  }
}
