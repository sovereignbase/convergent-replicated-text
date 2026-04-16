import type { CRListChange } from '@sovereignbase/convergent-replicated-list'

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
        if (index !== htmlElement.value.length) index--
        void htmlElement.setRangeText(value, index, index, 'end')
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

  for (const [key, value] of removals) {
    const index = Number(key)

    if (value === undefined) {
      textNode.deleteData(index, 1)
    }
  }

  for (const [key, value] of inserts) {
    let index = Number(key)
    if (typeof value === 'string') {
      if (index !== textNode.length) index--
      textNode.insertData(index, value)
    }
  }
}
