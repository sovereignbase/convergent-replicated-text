import type { CRTextEventMap } from '../.types/type.js'

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

/**
 * Splits a string into user-perceived characters using grapheme segmentation.
 *
 * @param value The text to segment.
 * @returns An array of grapheme clusters in source order.
 */
export function transformStringToGraphemeArray(value: string): string[] {
  return Array.from(segmenter.segment(value), (x) => x.segment)
}

/**
 * Dispatches a typed CRText event payload through an EventTarget.
 */
export function dispatchCRTextEvent<K extends keyof CRTextEventMap>(
  eventTarget: EventTarget,
  type: K,
  detail: CRTextEventMap[K]
): void {
  void eventTarget.dispatchEvent(new CustomEvent(type, { detail }))
}
