import type { CRListChange } from '@sovereignbase/convergent-replicated-list'

export function ChangeStreamAdapter(
  changeEvent: CustomEvent<CRListChange<string>>,
  htmlElement: HTMLElement
): void {
  const entries = Object.entries(changeEvent.detail).sort(
    ([a], [b]) => Number(b) - Number(a)
  )

  if (
    htmlElement instanceof HTMLInputElement ||
    htmlElement instanceof HTMLTextAreaElement
  ) {
    for (const [key, value] of entries) {
      const index = Number(key)

      if (value === undefined) {
        htmlElement.setRangeText('', index, index + 1, 'end')
      } else {
        htmlElement.setRangeText(value, index, index + 1, 'end')
      }
    }

    return
  }

  const textNode =
    htmlElement.firstChild instanceof Text
      ? htmlElement.firstChild
      : htmlElement.insertBefore(
          htmlElement.ownerDocument.createTextNode(''),
          htmlElement.firstChild
        )

  for (const [key, value] of entries) {
    const index = Number(key)

    if (value === undefined) {
      textNode.deleteData(index, 1)
    } else {
      textNode.replaceData(index, 1, value)
    }
  }
}
