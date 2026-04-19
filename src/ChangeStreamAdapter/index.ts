import type { CRListChange } from '@sovereignbase/convergent-replicated-list'

/**
 * Applies a `CRText` change event to an editable DOM host.
 *
 * For `<input>` and `<textarea>` elements, the adapter updates the control value
 * via `setRangeText()`. For other editable hosts, it mutates the first text node
 * and restores the caret position when the host is focused.
 *
 * @param changeEvent The `change` event emitted by `CRText`.
 * @param htmlElement The editable element that should reflect the change.
 */
export function ChangeStreamAdapter(
  changeEvent: CustomEvent<CRListChange<string>>,
  htmlElement: HTMLElement
): void {
  const entries = Object.entries(changeEvent.detail)
  const removals = [...entries].sort(([a], [b]) => Number(b) - Number(a))
  const inserts = [...entries].sort(([a], [b]) => Number(a) - Number(b))

  if (
    htmlElement instanceof HTMLInputElement ||
    htmlElement instanceof HTMLTextAreaElement
  ) {
    for (const [key, value] of removals) {
      const index = Number(key)

      if (value === undefined) {
        void htmlElement.setRangeText('', index, index + 1, 'end')
      }
    }
    for (const [key, value] of inserts) {
      if (typeof value === 'string') {
        let index = Number(key)
        void htmlElement.setRangeText(value, index, index, 'end')
      }
    }

    return
  }
  const doc = htmlElement.ownerDocument

  const oldAnchor = htmlElement.querySelector('[data-caret-anchor="true"]')
  oldAnchor?.remove()

  const textNode =
    htmlElement.firstChild instanceof Text
      ? htmlElement.firstChild
      : htmlElement.insertBefore(doc.createTextNode(''), htmlElement.firstChild)

  let caretOffset = textNode.length

  for (const [key, value] of removals) {
    const index = Number(key)

    if (value === undefined) {
      void textNode.deleteData(index, 1)
      caretOffset = index
    }
  }

  for (const [key, value] of inserts) {
    if (typeof value === 'string') {
      const index = Number(key)
      void textNode.insertData(index, value)
      caretOffset = index + value.length
    }
  }

  if (
    htmlElement !== doc.activeElement &&
    !htmlElement.contains(doc.activeElement)
  ) {
    return
  }

  const selection = doc.defaultView?.getSelection()
  if (!selection) return

  const range = doc.createRange()
  const clampedOffset = Math.max(0, Math.min(caretOffset, textNode.length))

  if (
    clampedOffset === textNode.length &&
    textNode.data.length > 0 &&
    textNode.data.endsWith('\n')
  ) {
    const anchor = doc.createElement('span')
    anchor.dataset.caretAnchor = 'true'
    anchor.textContent = '\u200B'
    void htmlElement.append(anchor)

    void range.setStart(anchor.firstChild!, 0)
    void range.collapse(true)
  } else {
    void range.setStart(textNode, clampedOffset)
    void range.collapse(true)
  }

  void selection.removeAllRanges()
  void selection.addRange(range)
}
