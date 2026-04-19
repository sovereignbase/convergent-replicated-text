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
