const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

export function transformStringToGraphemeArray(value: string): string[] {
  return Array.from(segmenter.segment(value), (x) => x.segment)
}
