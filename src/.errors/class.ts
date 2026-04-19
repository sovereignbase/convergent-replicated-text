/**
 * Enumerates semantic error codes thrown by `CRText`.
 */
export type CRTextErrorCode = 'BAD_PARAMS'

/**
 * Represents an explicit package-scoped `CRText` failure.
 */
export class CRTextError extends Error {
  readonly code: CRTextErrorCode

  /**
   * Creates a new `CRTextError`.
   *
   * @param code The semantic error code.
   * @param message An optional human-readable detail message.
   */
  constructor(code: CRTextErrorCode, message?: string) {
    const detail = message ?? code
    super(`{@sovereignbase/convergent-replicated-text} ${detail}`)
    this.code = code
    this.name = 'CRTextError'
  }
}
