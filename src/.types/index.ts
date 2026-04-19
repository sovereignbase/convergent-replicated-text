import type {
  CRListSnapshot,
  CRListChange,
  CRListDelta,
  CRListAck,
} from '@sovereignbase/convergent-replicated-list'

/**
 * Maps `CRText` event names to their corresponding `CustomEvent.detail` payloads.
 */
export type CRTextEventMap = {
  /**
   * Fired after `snapshot()` materializes a detached snapshot.
   */
  snapshot: CRListSnapshot<string>

  /**
   * Fired after local or merged operations change the visible text projection.
   */
  change: CRListChange<string>

  /**
   * Fired after a local edit produces a replicable delta payload.
   */
  delta: CRListDelta<string>

  /**
   * Fired after `acknowledge()` yields a frontier acknowledgement.
   */
  ack: CRListAck
}

/**
 * Represents a strongly typed `CRText` event listener.
 */
export type CRTextEventListener<K extends keyof CRTextEventMap> =
  | ((event: CustomEvent<CRTextEventMap[K]>) => void)
  | { handleEvent(event: CustomEvent<CRTextEventMap[K]>): void }

/**
 * Resolves an event name to its corresponding listener type.
 */
export type CRTextEventListenerFor<K extends string> =
  K extends keyof CRTextEventMap
    ? CRTextEventListener<K>
    : EventListenerOrEventListenerObject

/**
 * Describes a linear text selection in UTF-16 code unit offsets.
 */
export type TextSelection = {
  /**
   * The inclusive selection anchor offset.
   */
  selectionStart: number

  /**
   * The exclusive selection focus offset.
   */
  selectionEnd: number
}

/**
 * Describes a text insertion derived from DOM editing input.
 */
export type InsertOperation = {
  /**
   * The insertion offset in the current text projection.
   */
  index: number

  /**
   * The characters to insert.
   */
  characters: string
}

/**
 * Describes a text removal derived from DOM editing input.
 */
export type RemoveOperation = {
  /**
   * The first offset to remove.
   */
  index: number

  /**
   * The number of characters to remove.
   */
  removeCount: number
}

/**
 * Represents the CR-Text operations translated from a single DOM input event.
 */
export type DOMTranslation = {
  /**
   * The translated insertion operation, if any.
   */
  insert: InsertOperation | false

  /**
   * The translated removal operation, if any.
   */
  remove: RemoveOperation | false
}
