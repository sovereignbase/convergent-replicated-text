import type {
  CRListSnapshot,
  CRListChange,
  CRListDelta,
  CRListAck,
} from '@sovereignbase/convergent-replicated-list'
/**
 * Maps CRText event names to their event payload shapes.
 */
export type CRTextEventMap = {
  /** STATE / PROJECTION */
  snapshot: CRListSnapshot<string>
  /***/
  change: CRListChange<string>

  /** GOSSIP / PROTOCOL */
  delta: CRListDelta<string>
  ack: CRListAck
}

/**
 * Represents a strongly typed CRText event listener.
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

export type TextSelection = {
  selectionStart: number
  selectionEnd: number
}

export type InsertOperation = {
  index: number
  characters: string
}

export type RemoveOperation = {
  index: number
  removeCount: number
}

export type DOMTranslation = {
  insert: InsertOperation | false
  remove: RemoveOperation | false
}
