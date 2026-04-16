import type { CRListChange } from '@sovereignbase/convergent-replicated-list'

export function ChangeStreamAdapter(
  changeEvent: CustomEvent<CRListChange<string>>,
  htmlElement: HTMLElement
): void {
  console.log(changeEvent.detail)
  const textNode =
    htmlElement.firstChild instanceof Text
      ? htmlElement.firstChild
      : htmlElement.insertBefore(
          htmlElement.ownerDocument.createTextNode(''),
          htmlElement.firstChild
        )

  for (const [key, value] of Object.entries(changeEvent.detail)) {
    const index = Number(key)

    if (value === undefined) {
      textNode.deleteData(index, 1)
      continue
    }
    if (typeof value === 'string') {
      textNode.replaceData(index, 1, value)
      continue
    }
  }
}
