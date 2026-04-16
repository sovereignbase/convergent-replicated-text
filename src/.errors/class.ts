export type CRTextErrorCode = 'BAD_PARAMS'

export class CRTextError extends Error {
  readonly code: CRTextErrorCode

  constructor(code: CRTextErrorCode, message?: string) {
    const detail = message ?? code
    super(`{@sovereignbase/convergent-replicated-text} ${detail}`)
    this.code = code
    this.name = 'CRTextError'
  }
}
