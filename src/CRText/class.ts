import {
  __create,
  __read,
  __update,
  __delete,
  __snapshot,
  __garbageCollect,
  type CRListState,
  type CRListSnapshot,
  type CRListDelta,
  type CRListAck,
  __acknowledge,
  __merge,
} from '@sovereignbase/convergent-replicated-list'
import { CRTextError } from '../.errors/class.js'
import { transformStringToGraphemeArray } from '../.helpers/index.js'
import type { CRTextEventMap, CRTextEventListenerFor } from '../.types/index.js'

export class CRText {
  declare private readonly state: CRListState<string>
  declare private readonly eventTarget: EventTarget
  constructor(snapshot?: CRListSnapshot<string>) {
    Object.defineProperties(this, {
      state: {
        value: __create<string>(snapshot),
        enumerable: false,
        configurable: false,
        writable: false,
      },
      eventTarget: {
        value: new EventTarget(),
        enumerable: false,
        configurable: false,
        writable: false,
      },
    })
  }
  /**
   * The current number of characters.
   */
  get size(): number {
    return this.state.size
  }
  /**
   *
   * @param index
   * @param chars
   * @returns
   */
  insertAfter(index: number, characters: string): void {
    if (typeof index !== 'number' || typeof characters !== 'string')
      throw new CRTextError(
        'BAD_PARAMS',
        '`index` must be typeof number and `characters` must be typeof string.'
      )
    const result = __update<string>(
      index,
      transformStringToGraphemeArray(characters),
      this.state,
      'after'
    )
    if (!result) return
    const { delta, change } = result
    if (delta)
      void this.eventTarget.dispatchEvent(
        new CustomEvent('delta', { detail: delta })
      )
    if (change)
      void this.eventTarget.dispatchEvent(
        new CustomEvent('change', { detail: change })
      )
  }
  /**
   *
   * @param index  Inclusive
   * @param removeCount
   * @returns
   */
  removeAfter(index: number, removeCount: number) {
    if (typeof index !== 'number' || typeof removeCount !== 'number')
      throw new CRTextError(
        'BAD_PARAMS',
        '`index` must be typeof number and `removeCount` must be typeof number.'
      )
    const result = __delete<string>(this.state, index, index + removeCount)
    if (!result) return
    const { delta, change } = result
    if (delta)
      void this.eventTarget.dispatchEvent(
        new CustomEvent('delta', { detail: delta })
      )
    if (change)
      void this.eventTarget.dispatchEvent(
        new CustomEvent('change', { detail: change })
      )
  }
  merge(delta: CRListDelta<string>) {
    const change = __merge(this.state, delta)
    if (change)
      void this.eventTarget.dispatchEvent(
        new CustomEvent('change', { detail: change })
      )
  }
  acknowledge() {
    const ack = __acknowledge(this.state)
    if (ack) {
      void this.eventTarget.dispatchEvent(
        new CustomEvent('ack', { detail: ack })
      )
    }
  }
  garbageCollect(frontiers: Array<CRListAck>) {
    void __garbageCollect(frontiers, this.state)
  }
  snapshot() {
    const snapshot = __snapshot<string>(this.state)
    if (snapshot) {
      this.eventTarget.dispatchEvent(
        new CustomEvent('snapshot', { detail: snapshot })
      )
    }
  }
  /**
   * Returns a detached structured-clone-compatible snapshot of this list.
   *
   * Called automatically by `JSON.stringify`.
   */
  toJSON(): CRListSnapshot<string> {
    return __snapshot<string>(this.state)
  }
  /**
   * Returns this snapshot as a JSON string.
   */
  toString(): string {
    return JSON.stringify(this)
  }
  /**
   * Iterates over detached copies of the current live values in index order.
   */
  *[Symbol.iterator](): IterableIterator<string> {
    for (let index = 0; index < this.size; index++) {
      const value = __read<string>(index, this.state)
      if (typeof value !== 'string') continue
      yield value
    }
  }

  valueOf(): string {
    return [...this].join('')
  }

  [Symbol.toPrimitive](): string {
    return [...this].join('')
  }
  /**
   * Returns the Node.js console inspection representation.
   */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.valueOf()
  }
  /**
   * Returns the Deno console inspection representation.
   */
  [Symbol.for('Deno.customInspect')](): string {
    return this.valueOf()
  }

  /**
   * Registers an event listener.
   *
   * @param type - The event type to listen for.
   * @param listener - The listener to register.
   * @param options - Listener registration options.
   */
  addEventListener<K extends keyof CRTextEventMap>(
    type: K,
    listener: CRTextEventListenerFor<K> | null,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.eventTarget.addEventListener(
      type,
      listener as EventListenerOrEventListenerObject | null,
      options
    )
  }

  /**
   * Removes an event listener.
   *
   * @param type - The event type to stop listening for.
   * @param listener - The listener to remove.
   * @param options - Listener removal options.
   */
  removeEventListener<K extends keyof CRTextEventMap>(
    type: K,
    listener: CRTextEventListenerFor<K> | null,
    options?: boolean | EventListenerOptions
  ): void {
    this.eventTarget.removeEventListener(
      type,
      listener as EventListenerOrEventListenerObject | null,
      options
    )
  }
}
