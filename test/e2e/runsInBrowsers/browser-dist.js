// node_modules/uuid/dist/regex.js
var regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

// node_modules/uuid/dist/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default = validate;

// node_modules/uuid/dist/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist/rng.js
var rnds8 = new Uint8Array(16);
function rng() {
  return crypto.getRandomValues(rnds8);
}

// node_modules/uuid/dist/v7.js
var _state = {};
function v7(options, buf, offset) {
  let bytes;
  if (options) {
    bytes = v7Bytes(options.random ?? options.rng?.() ?? rng(), options.msecs, options.seq, buf, offset);
  } else {
    const now = Date.now();
    const rnds = rng();
    updateV7State(_state, now, rnds);
    bytes = v7Bytes(rnds, _state.msecs, _state.seq, buf, offset);
  }
  return buf ?? unsafeStringify(bytes);
}
function updateV7State(state, now, rnds) {
  state.msecs ??= -Infinity;
  state.seq ??= 0;
  if (now > state.msecs) {
    state.seq = rnds[6] << 23 | rnds[7] << 16 | rnds[8] << 8 | rnds[9];
    state.msecs = now;
  } else {
    state.seq = state.seq + 1 | 0;
    if (state.seq === 0) {
      state.msecs++;
    }
  }
  return state;
}
function v7Bytes(rnds, msecs, seq, buf, offset = 0) {
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  if (!buf) {
    buf = new Uint8Array(16);
    offset = 0;
  } else {
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
  }
  msecs ??= Date.now();
  seq ??= rnds[6] * 127 << 24 | rnds[7] << 16 | rnds[8] << 8 | rnds[9];
  buf[offset++] = msecs / 1099511627776 & 255;
  buf[offset++] = msecs / 4294967296 & 255;
  buf[offset++] = msecs / 16777216 & 255;
  buf[offset++] = msecs / 65536 & 255;
  buf[offset++] = msecs / 256 & 255;
  buf[offset++] = msecs & 255;
  buf[offset++] = 112 | seq >>> 28 & 15;
  buf[offset++] = seq >>> 20 & 255;
  buf[offset++] = 128 | seq >>> 14 & 63;
  buf[offset++] = seq >>> 6 & 255;
  buf[offset++] = seq << 2 & 255 | rnds[10] & 3;
  buf[offset++] = rnds[11];
  buf[offset++] = rnds[12];
  buf[offset++] = rnds[13];
  buf[offset++] = rnds[14];
  buf[offset++] = rnds[15];
  return buf;
}
var v7_default = v7;

// node_modules/uuid/dist/version.js
function version(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.slice(14, 15), 16);
}
var version_default = version;

// node_modules/@sovereignbase/utils/dist/index.js
var PROTOTYPE_LIST = [
  "null",
  "undefined",
  "boolean",
  "string",
  "symbol",
  "number",
  "bigint",
  "record",
  "array",
  "map",
  "set",
  "date",
  "regexp",
  "error",
  "arraybuffer",
  "sharedarraybuffer",
  "dataview",
  "int8array",
  "uint8array",
  "uint8clampedarray",
  "int16array",
  "uint16array",
  "int32array",
  "uint32array",
  "float32array",
  "float64array",
  "bigint64array",
  "biguint64array",
  "url",
  "urlsearchparams",
  "blob",
  "file",
  "unknown"
];
function prototype(value) {
  let type = typeof value;
  if (type === "object") {
    type = Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  }
  if (type === "object") type = "record";
  if (!PROTOTYPE_LIST.includes(type)) {
    type = "unknown";
  }
  return type;
}
function isUuidV7(value) {
  if (typeof value !== "string") return false;
  try {
    return version_default(value) === 7;
  } catch {
    return false;
  }
}

// node_modules/@sovereignbase/convergent-replicated-list/dist/index.js
function rebuildLiveIndex(crListReplica) {
  if (!crListReplica.cursor) {
    crListReplica.index?.clear();
    crListReplica.cursorIndex = void 0;
    return;
  }
  let index = crListReplica.size;
  const entries = crListReplica.index ?? /* @__PURE__ */ new Map();
  void entries.clear();
  while (crListReplica.cursor.next)
    crListReplica.cursor = crListReplica.cursor.next;
  while (index >= 1) {
    index--;
    crListReplica.cursor.index = index;
    void entries.set(index, crListReplica.cursor);
    if (crListReplica.cursor.prev === void 0) break;
    crListReplica.cursor = crListReplica.cursor.prev;
  }
  crListReplica.index = entries;
  crListReplica.cursorIndex = 0;
}
var CRListError = class extends Error {
  /**
   * The semantic error code for the failure.
   */
  code;
  /**
   * Creates a typed CRList error.
   *
   * @param code - The semantic error code.
   * @param message - An optional human-readable detail message.
   */
  constructor(code, message) {
    const detail = message ?? code;
    super(`{@sovereignbase/convergent-replicated-list} ${detail}`);
    this.code = code;
    this.name = "CRListError";
  }
};
function seekCursorToIndex(targetIndex, crListReplica) {
  if (targetIndex < 0 || targetIndex >= crListReplica.size)
    throw new CRListError("INDEX_OUT_OF_BOUNDS", "Index out of bounds");
  const indexedEntry = crListReplica.index?.get(targetIndex);
  if (indexedEntry) {
    if (crListReplica.parentMap.get(indexedEntry.uuidv7) === indexedEntry) {
      crListReplica.cursor = indexedEntry;
      crListReplica.cursorIndex = targetIndex;
      return;
    } else {
      void crListReplica.index?.delete(targetIndex);
    }
  }
  if (!crListReplica.cursor)
    throw new CRListError("LIST_EMPTY", "List is empty");
  let cursorIndex = crListReplica.cursorIndex ?? crListReplica.cursor.index;
  const direction = cursorIndex > targetIndex ? "prev" : "next";
  while (crListReplica.cursor && cursorIndex !== targetIndex) {
    crListReplica.cursor = crListReplica.cursor[direction];
    cursorIndex += direction === "next" ? 1 : -1;
  }
  if (crListReplica.cursor) {
    crListReplica.cursorIndex = targetIndex;
    void crListReplica.index?.set(targetIndex, crListReplica.cursor);
  }
}
function linkEntryBetween(prev, linkedListEntry, next) {
  linkedListEntry.prev = prev;
  linkedListEntry.next = next;
  if (prev) prev.next = linkedListEntry;
  if (next) next.prev = linkedListEntry;
}
function rebuildLiveProjection(crListReplica) {
  crListReplica.cursor = void 0;
  const entries = crListReplica.index ?? /* @__PURE__ */ new Map();
  void entries.clear();
  for (const entry of crListReplica.parentMap.values()) {
    if (!entry) continue;
    entry.prev = void 0;
    entry.next = void 0;
  }
  let previous = void 0;
  let first = void 0;
  let index = 0;
  const appendChildren = (predecessorIdentifier) => {
    const stack = [{ predecessorIdentifier, siblingIndex: 0 }];
    while (stack.length > 0) {
      const frame = stack[stack.length - 1];
      if (!frame.siblings) {
        frame.siblings = crListReplica.childrenMap.get(
          frame.predecessorIdentifier
        );
        if (!frame.siblings) {
          void stack.pop();
          continue;
        }
        if (frame.siblings.length > 1)
          void frame.siblings.sort((a, b) => a.uuidv7 > b.uuidv7 ? 1 : -1);
      }
      if (frame.siblingIndex >= frame.siblings.length) {
        void stack.pop();
        continue;
      }
      const sibling = frame.siblings[frame.siblingIndex];
      frame.siblingIndex++;
      if (!sibling) continue;
      if (crListReplica.parentMap.get(sibling.uuidv7) !== sibling) continue;
      sibling.index = index;
      index++;
      void linkEntryBetween(previous, sibling, void 0);
      if (!first) first = sibling;
      previous = sibling;
      void stack.push({
        predecessorIdentifier: sibling.uuidv7,
        siblingIndex: 0
      });
    }
  };
  void appendChildren("\0");
  const detachedPredecessors = [];
  for (const predecessorIdentifier of crListReplica.childrenMap.keys()) {
    if (predecessorIdentifier !== "\0" && !crListReplica.parentMap.get(predecessorIdentifier))
      void detachedPredecessors.push(predecessorIdentifier);
  }
  if (detachedPredecessors.length > 1)
    detachedPredecessors.sort((a, b) => a > b ? 1 : -1);
  for (const predecessorIdentifier of detachedPredecessors)
    void appendChildren(predecessorIdentifier);
  crListReplica.cursor = first;
  crListReplica.cursorIndex = first ? 0 : void 0;
  if (first) void entries.set(0, first);
  crListReplica.index = entries;
  crListReplica.size = crListReplica.parentMap.size;
}
function materializeSnapshotEntry(valueEntry, crListReplica) {
  if (valueEntry === null || valueEntry === void 0) return void 0;
  if (!isUuidV7(valueEntry.uuidv7) || crListReplica.tombstones.has(valueEntry.uuidv7) || crListReplica.parentMap.has(valueEntry.uuidv7) || !isUuidV7(valueEntry.predecessor) && valueEntry.predecessor !== "\0" && !crListReplica.tombstones.has(valueEntry.predecessor))
    return void 0;
  return {
    uuidv7: valueEntry.uuidv7,
    value: valueEntry.value,
    predecessor: valueEntry.predecessor,
    index: 0,
    next: void 0,
    prev: void 0
  };
}
function attachEntryToIndexes(crListReplica, linkedListEntry, deltaBuf) {
  void crListReplica.parentMap.set(linkedListEntry.uuidv7, linkedListEntry);
  const siblings = crListReplica.childrenMap.get(linkedListEntry.predecessor);
  if (siblings) {
    void siblings.push(linkedListEntry);
  } else {
    void crListReplica.childrenMap.set(linkedListEntry.predecessor, [
      linkedListEntry
    ]);
  }
  if (deltaBuf && !Array.isArray(deltaBuf.values)) deltaBuf.values = [];
  if (deltaBuf?.values)
    void deltaBuf.values.push({
      uuidv7: linkedListEntry.uuidv7,
      value: linkedListEntry.value,
      predecessor: linkedListEntry.predecessor
    });
}
function detachEntryFromIndexes(crListReplica, linkedListEntry) {
  void crListReplica.parentMap.delete(linkedListEntry.uuidv7);
  const siblings = crListReplica.childrenMap.get(linkedListEntry.predecessor);
  if (!siblings) return;
  const index = siblings.indexOf(linkedListEntry);
  if (index !== -1) void siblings.splice(index, 1);
}
function deleteLiveEntry(crListReplica, linkedListEntry, deltaBuf) {
  const prev = linkedListEntry.prev;
  const next = linkedListEntry.next;
  void crListReplica.tombstones.add(linkedListEntry.uuidv7);
  if (deltaBuf && !Array.isArray(deltaBuf.tombstones)) deltaBuf.tombstones = [];
  void deltaBuf?.tombstones?.push(linkedListEntry.uuidv7);
  if (prev) prev.next = next;
  if (next) {
    next.prev = prev;
  }
  void detachEntryFromIndexes(crListReplica, linkedListEntry);
  if (crListReplica.cursor === linkedListEntry)
    crListReplica.cursor = next ?? prev;
  if (!crListReplica.cursor) crListReplica.cursorIndex = void 0;
  linkedListEntry.prev = void 0;
  linkedListEntry.next = void 0;
  crListReplica.size = crListReplica.parentMap.size;
}
function dispatchCRListEvent(eventTarget, type, detail) {
  void eventTarget.dispatchEvent(new CustomEvent(type, { detail }));
}
function moveEntryToPredecessor(crListReplica, linkedListEntry, predecessor, deltaBuf) {
  void detachEntryFromIndexes(crListReplica, linkedListEntry);
  linkedListEntry.predecessor = predecessor;
  void attachEntryToIndexes(crListReplica, linkedListEntry, deltaBuf);
}
function indexFromPropertyKey(index) {
  if (typeof index !== "string" || !/^(0|[1-9]\d*)$/.test(index))
    return void 0;
  const listIndex = Number(index);
  return Number.isSafeInteger(listIndex) ? listIndex : void 0;
}
function trySpliceInsertedParent(crListReplica, insertedEntries, reparentedEntries) {
  if (insertedEntries.length !== 1 || reparentedEntries.length !== 1)
    return false;
  const inserted = insertedEntries[0];
  const reparented = reparentedEntries[0];
  const moved = reparented.entry;
  if (moved.predecessor !== inserted.uuidv7 || inserted.predecessor !== reparented.previousPredecessor)
    return false;
  const siblings = crListReplica.childrenMap.get(inserted.predecessor);
  const children = crListReplica.childrenMap.get(inserted.uuidv7);
  if (siblings?.length !== 1 || siblings[0] !== inserted || children?.length !== 1 || children[0] !== moved)
    return false;
  const predecessor = inserted.predecessor === "\0" ? void 0 : crListReplica.parentMap.get(inserted.predecessor);
  if (inserted.predecessor !== "\0" && !predecessor) return false;
  const expectedIndex = predecessor ? predecessor.index + 1 : 0;
  if (moved.index !== expectedIndex || moved.prev !== predecessor || predecessor && predecessor.next !== moved)
    return false;
  void linkEntryBetween(predecessor, inserted, moved);
  let current = inserted;
  let index = expectedIndex;
  while (current) {
    current.index = index;
    index++;
    current = current.next;
  }
  crListReplica.index = /* @__PURE__ */ new Map([[inserted.index, inserted]]);
  crListReplica.cursor = inserted;
  crListReplica.cursorIndex = inserted.index;
  crListReplica.size = crListReplica.parentMap.size;
  return true;
}
function __create(snapshot) {
  const crListReplica = {
    size: 0,
    cursor: void 0,
    cursorIndex: void 0,
    index: /* @__PURE__ */ new Map(),
    tombstones: /* @__PURE__ */ new Set(),
    parentMap: /* @__PURE__ */ new Map(),
    childrenMap: /* @__PURE__ */ new Map()
  };
  if (!snapshot || prototype(snapshot) !== "record") return crListReplica;
  if (Object.hasOwn(snapshot, "tombstones") && Array.isArray(snapshot.tombstones)) {
    for (const tombstone of snapshot.tombstones) {
      if (crListReplica.tombstones.has(tombstone) || !isUuidV7(tombstone))
        continue;
      void crListReplica.tombstones.add(tombstone);
    }
  }
  if (!Object.hasOwn(snapshot, "values") || !Array.isArray(snapshot.values))
    return crListReplica;
  let canUseLinearProjection = true;
  let previous = void 0;
  for (const valueEntry of snapshot.values) {
    const linkedListEntry = materializeSnapshotEntry(
      valueEntry,
      crListReplica
    );
    if (!linkedListEntry) continue;
    void attachEntryToIndexes(crListReplica, linkedListEntry);
    if (canUseLinearProjection && linkedListEntry.predecessor === (previous?.uuidv7 ?? "\0")) {
      linkedListEntry.index = crListReplica.parentMap.size - 1;
      void linkEntryBetween(previous, linkedListEntry, void 0);
      previous = linkedListEntry;
      void crListReplica.index?.set(linkedListEntry.index, linkedListEntry);
      continue;
    }
    canUseLinearProjection = false;
  }
  if (canUseLinearProjection) {
    crListReplica.cursor = previous;
    crListReplica.cursorIndex = previous ? crListReplica.parentMap.size - 1 : void 0;
    crListReplica.size = crListReplica.parentMap.size;
    return crListReplica;
  }
  void rebuildLiveProjection(crListReplica);
  return crListReplica;
}
function __read(targetIndex, crListReplica) {
  try {
    void seekCursorToIndex(targetIndex, crListReplica);
    return crListReplica.cursor?.value;
  } catch {
    return void 0;
  }
}
function __update(listIndex, listValues, crListReplica, mode) {
  if (listIndex < 0 || listIndex > crListReplica.size)
    throw new CRListError("INDEX_OUT_OF_BOUNDS");
  if (!Array.isArray(listValues))
    throw new CRListError(
      "UPDATE_EXPECTED_AN_ARRAY",
      "`listValues` must be an Array"
    );
  if (listValues.length === 0) return false;
  const change = {};
  const delta = { values: [], tombstones: [] };
  for (const listValue of listValues) {
    const v72 = v7_default();
    const linkedListEntry = {
      uuidv7: v72,
      value: listValue,
      predecessor: "\0",
      index: 0,
      next: void 0,
      prev: void 0
    };
    switch (mode) {
      case "overwrite": {
        if (listIndex === crListReplica.size) {
          if (crListReplica.size === 0) {
            crListReplica.cursor = linkedListEntry;
            crListReplica.cursorIndex = linkedListEntry.index;
            void attachEntryToIndexes(crListReplica, linkedListEntry, delta);
            crListReplica.index?.set(linkedListEntry.index, linkedListEntry);
            change[linkedListEntry.index] = linkedListEntry.value;
            break;
          }
          void seekCursorToIndex(crListReplica.size - 1, crListReplica);
          if (!crListReplica.cursor) return false;
          linkedListEntry.index = (crListReplica.cursorIndex ?? 0) + 1;
          linkedListEntry.predecessor = crListReplica.cursor.uuidv7;
          void linkEntryBetween(
            crListReplica.cursor,
            linkedListEntry,
            void 0
          );
          void attachEntryToIndexes(crListReplica, linkedListEntry, delta);
          crListReplica.cursor = linkedListEntry;
          crListReplica.cursorIndex = linkedListEntry.index;
          void crListReplica.index?.set(linkedListEntry.index, linkedListEntry);
          change[linkedListEntry.index] = linkedListEntry.value;
          break;
        }
        void seekCursorToIndex(listIndex, crListReplica);
        if (!crListReplica.cursor) return false;
        const entryToOverwrite = crListReplica.cursor;
        const actualIndex = crListReplica.cursorIndex ?? listIndex;
        linkedListEntry.predecessor = entryToOverwrite.predecessor;
        linkedListEntry.index = actualIndex;
        void linkEntryBetween(
          entryToOverwrite.prev,
          linkedListEntry,
          entryToOverwrite.next
        );
        if (entryToOverwrite.next) {
          if (entryToOverwrite.next.predecessor === entryToOverwrite.uuidv7) {
            void moveEntryToPredecessor(
              crListReplica,
              entryToOverwrite.next,
              linkedListEntry.uuidv7,
              delta
            );
          }
        }
        void attachEntryToIndexes(crListReplica, linkedListEntry, delta);
        void crListReplica.tombstones.add(entryToOverwrite.uuidv7);
        void delta.tombstones?.push(entryToOverwrite.uuidv7);
        void detachEntryFromIndexes(crListReplica, entryToOverwrite);
        entryToOverwrite.next = void 0;
        entryToOverwrite.prev = void 0;
        crListReplica.cursor = linkedListEntry;
        crListReplica.cursorIndex = actualIndex;
        void crListReplica.index?.set(linkedListEntry.index, linkedListEntry);
        change[actualIndex] = linkedListEntry.value;
        break;
      }
      case "after": {
        if (crListReplica.size === 0 && listIndex === 0) {
          crListReplica.cursor = linkedListEntry;
          crListReplica.cursorIndex = linkedListEntry.index;
          void attachEntryToIndexes(crListReplica, linkedListEntry, delta);
          void crListReplica.index?.set(linkedListEntry.index, linkedListEntry);
          change[linkedListEntry.index] = linkedListEntry.value;
          break;
        }
        if (listIndex === crListReplica.size) {
          void seekCursorToIndex(crListReplica.size - 1, crListReplica);
        } else {
          void seekCursorToIndex(listIndex, crListReplica);
        }
        if (!crListReplica.cursor) return false;
        const actualIndex = crListReplica.cursorIndex ?? listIndex;
        const next = listIndex === crListReplica.size ? void 0 : crListReplica.cursor.next;
        linkedListEntry.index = actualIndex + 1;
        linkedListEntry.predecessor = crListReplica.cursor.uuidv7;
        void linkEntryBetween(crListReplica.cursor, linkedListEntry, next);
        if (next) {
          if (next.predecessor === crListReplica.cursor.uuidv7) {
            void moveEntryToPredecessor(
              crListReplica,
              next,
              linkedListEntry.uuidv7,
              delta
            );
          }
        }
        void attachEntryToIndexes(crListReplica, linkedListEntry, delta);
        crListReplica.cursor = linkedListEntry;
        crListReplica.cursorIndex = linkedListEntry.index;
        if (next) crListReplica.index = /* @__PURE__ */ new Map();
        void crListReplica.index?.set(linkedListEntry.index, linkedListEntry);
        change[linkedListEntry.index] = linkedListEntry.value;
        break;
      }
      case "before": {
        if (crListReplica.size === 0 && listIndex === 0) {
          crListReplica.cursor = linkedListEntry;
          crListReplica.cursorIndex = linkedListEntry.index;
          void attachEntryToIndexes(crListReplica, linkedListEntry, delta);
          void crListReplica.index?.set(linkedListEntry.index, linkedListEntry);
          change[linkedListEntry.index] = linkedListEntry.value;
          mode = "after";
          listIndex = linkedListEntry.index - 1;
          break;
        }
        void seekCursorToIndex(listIndex, crListReplica);
        if (!crListReplica.cursor) return false;
        const actualIndex = crListReplica.cursorIndex ?? listIndex;
        const prev = crListReplica.cursor.prev;
        linkedListEntry.index = actualIndex;
        linkedListEntry.predecessor = prev?.uuidv7 ?? "\0";
        void linkEntryBetween(prev, linkedListEntry, crListReplica.cursor);
        if (crListReplica.cursor.predecessor === linkedListEntry.predecessor) {
          void moveEntryToPredecessor(
            crListReplica,
            crListReplica.cursor,
            linkedListEntry.uuidv7,
            delta
          );
        }
        void attachEntryToIndexes(crListReplica, linkedListEntry, delta);
        crListReplica.cursor = linkedListEntry;
        crListReplica.cursorIndex = actualIndex;
        crListReplica.index = /* @__PURE__ */ new Map();
        void crListReplica.index?.set(linkedListEntry.index, linkedListEntry);
        change[actualIndex] = linkedListEntry.value;
        mode = "after";
        listIndex = linkedListEntry.index - 1;
        break;
      }
    }
    crListReplica.size = crListReplica.parentMap.size;
    listIndex++;
  }
  return { change, delta };
}
function __delete(crListReplica, startIndex, endIndex) {
  const change = {};
  const delta = { values: [], tombstones: [] };
  const listIndex = startIndex ?? 0;
  const targetEndIndex = endIndex ?? crListReplica.size;
  if (listIndex < 0 || targetEndIndex < listIndex || listIndex > crListReplica.size)
    throw new CRListError("INDEX_OUT_OF_BOUNDS");
  const deleteCount = Math.min(targetEndIndex, crListReplica.size) - listIndex;
  if (deleteCount <= 0) return false;
  void seekCursorToIndex(listIndex, crListReplica);
  if (!crListReplica.cursor) return false;
  let current = crListReplica.cursor;
  let deleted = 0;
  let currentIndex = crListReplica.cursorIndex ?? listIndex;
  while (current && deleted < deleteCount) {
    const next = current.next;
    change[currentIndex] = void 0;
    void crListReplica.index?.delete(currentIndex);
    void deleteLiveEntry(crListReplica, current, delta);
    current = next;
    currentIndex++;
    deleted++;
  }
  crListReplica.size = crListReplica.parentMap.size;
  crListReplica.cursor = current ?? crListReplica.cursor;
  crListReplica.cursorIndex = current ? listIndex : crListReplica.cursor ? Math.max(0, crListReplica.size - 1) : void 0;
  crListReplica.index = /* @__PURE__ */ new Map();
  if (crListReplica.cursor && crListReplica.cursorIndex !== void 0)
    void crListReplica.index.set(
      crListReplica.cursorIndex,
      crListReplica.cursor
    );
  return { change, delta };
}
function __merge(crListReplica, crListDelta) {
  if (!crListDelta || prototype(crListDelta) !== "record") return false;
  const newVals = [];
  const newTombsIndices = [];
  const reparentedVals = [];
  const change = {};
  let needsRelink = false;
  if (Object.hasOwn(crListDelta, "values") && Array.isArray(crListDelta.values) && crListDelta.values.length === 1 && (!Object.hasOwn(crListDelta, "tombstones") || Array.isArray(crListDelta.tombstones) && crListDelta.tombstones.length === 0)) {
    const linkedListEntry = materializeSnapshotEntry(
      crListDelta.values[0],
      crListReplica
    );
    if (!linkedListEntry) return false;
    const predecessor = linkedListEntry.predecessor === "\0" ? void 0 : crListReplica.parentMap.get(linkedListEntry.predecessor);
    if (linkedListEntry.predecessor === "\0" && crListReplica.size === 0 || predecessor && !predecessor.next) {
      linkedListEntry.prev = predecessor;
      linkedListEntry.index = crListReplica.size;
      if (predecessor) predecessor.next = linkedListEntry;
      crListReplica.cursor = linkedListEntry;
      crListReplica.cursorIndex = linkedListEntry.index;
      void attachEntryToIndexes(crListReplica, linkedListEntry);
      crListReplica.size = crListReplica.parentMap.size;
      void crListReplica.index?.set(linkedListEntry.index, linkedListEntry);
      return { [linkedListEntry.index]: linkedListEntry.value };
    }
  }
  if (Object.hasOwn(crListDelta, "tombstones") && Array.isArray(crListDelta.tombstones)) {
    for (const tombstone of crListDelta.tombstones) {
      if (crListReplica.tombstones.has(tombstone) || !isUuidV7(tombstone))
        continue;
      void crListReplica.tombstones.add(tombstone);
      const linkedListEntry = crListReplica.parentMap.get(tombstone);
      if (linkedListEntry) {
        void newTombsIndices.push(linkedListEntry.index);
        void crListReplica.index?.delete(linkedListEntry.index);
        void deleteLiveEntry(crListReplica, linkedListEntry);
        needsRelink = true;
      }
    }
  }
  if (!Object.hasOwn(crListDelta, "values") || !Array.isArray(crListDelta.values)) {
    if (newTombsIndices.length === 0) return false;
    void rebuildLiveIndex(crListReplica);
    for (const index of newTombsIndices) {
      change[index] = void 0;
    }
    return change;
  }
  for (const valueEntry of crListDelta.values) {
    if (valueEntry === null || valueEntry === void 0) continue;
    const existingEntry = crListReplica.parentMap.get(valueEntry.uuidv7);
    if (existingEntry) {
      if (crListReplica.tombstones.has(valueEntry.uuidv7)) continue;
      if (valueEntry.predecessor !== "\0" && !isUuidV7(valueEntry.predecessor))
        continue;
      if (existingEntry.predecessor >= valueEntry.predecessor) continue;
      const previousPredecessor = existingEntry.predecessor;
      void moveEntryToPredecessor(
        crListReplica,
        existingEntry,
        valueEntry.predecessor
      );
      void reparentedVals.push({ entry: existingEntry, previousPredecessor });
      needsRelink = true;
      continue;
    }
    const linkedListEntry = materializeSnapshotEntry(
      valueEntry,
      crListReplica
    );
    if (!linkedListEntry) continue;
    const predecessor = linkedListEntry.predecessor === "\0" ? void 0 : crListReplica.parentMap.get(linkedListEntry.predecessor);
    void attachEntryToIndexes(crListReplica, linkedListEntry);
    void newVals.push(linkedListEntry);
    if (!needsRelink && linkedListEntry.predecessor === "\0") {
      if (crListReplica.size === 0) {
        crListReplica.cursor = linkedListEntry;
        crListReplica.cursorIndex = linkedListEntry.index;
        crListReplica.size = crListReplica.parentMap.size;
        void crListReplica.index?.set(linkedListEntry.index, linkedListEntry);
      } else {
        needsRelink = true;
      }
    } else if (!needsRelink && predecessor && !predecessor.next) {
      linkedListEntry.prev = predecessor;
      linkedListEntry.index = crListReplica.size;
      predecessor.next = linkedListEntry;
      crListReplica.cursor = linkedListEntry;
      crListReplica.cursorIndex = linkedListEntry.index;
      crListReplica.size = crListReplica.parentMap.size;
      void crListReplica.index?.set(linkedListEntry.index, linkedListEntry);
    } else {
      needsRelink = true;
    }
  }
  if (needsRelink) {
    if (!trySpliceInsertedParent(crListReplica, newVals, reparentedVals)) {
      void rebuildLiveProjection(crListReplica);
    }
  }
  if (newTombsIndices.length === 0 && newVals.length === 0) return false;
  for (const index of newTombsIndices) {
    change[index] = void 0;
  }
  for (const val of newVals) {
    change[val.index] = val.value;
  }
  return change;
}
function __acknowledge(crListReplica) {
  let largest = false;
  void crListReplica.tombstones.forEach((tombstone) => {
    if (largest === false || largest < tombstone) largest = tombstone;
  });
  if (typeof largest === "string") return largest;
  return false;
}
function __garbageCollect(frontiers, crListReplica) {
  if (!Array.isArray(frontiers)) return;
  void frontiers.sort();
  const smallest = frontiers.find((frontier) => isUuidV7(frontier));
  if (typeof smallest !== "string") return;
  void crListReplica.tombstones.forEach((tombstone, __, tombstones) => {
    if (tombstone <= smallest) {
      void tombstones.delete(tombstone);
    }
  });
}
function __snapshot(crListReplica) {
  return {
    values: Array.from(crListReplica.parentMap.values()).map(
      (linkedListEntry) => {
        if (!linkedListEntry) throw new CRListError("LIST_INTEGRITY_VIOLATION");
        return {
          uuidv7: linkedListEntry.uuidv7,
          value: linkedListEntry.value,
          predecessor: linkedListEntry.predecessor
        };
      }
    ),
    tombstones: Array.from(crListReplica.tombstones)
  };
}
var CRList = class {
  /**
   * Creates a replicated list from an optional CRList snapshot.
   *
   * @param snapshot - A previously emitted CRList snapshot.
   */
  constructor(snapshot) {
    void Object.defineProperties(this, {
      state: {
        value: __create(snapshot),
        enumerable: false,
        configurable: false,
        writable: false
      },
      eventTarget: {
        value: new EventTarget(),
        enumerable: false,
        configurable: false,
        writable: false
      }
    });
    return new Proxy(this, {
      get(target, index, receiver) {
        const listIndex = indexFromPropertyKey(index);
        if (listIndex === void 0) return Reflect.get(target, index, receiver);
        return __read(listIndex, target.state);
      },
      has(target, index) {
        const listIndex = indexFromPropertyKey(index);
        if (listIndex === void 0) return Reflect.has(target, index);
        return listIndex >= 0 && listIndex < target.state.size;
      },
      set(target, index, value) {
        const listIndex = indexFromPropertyKey(index);
        if (listIndex === void 0) return false;
        try {
          const result = __update(listIndex, [value], target.state, "overwrite");
          if (!result) return false;
          const { delta, change } = result;
          if (delta)
            void dispatchCRListEvent(target.eventTarget, "delta", delta);
          if (change)
            void dispatchCRListEvent(target.eventTarget, "change", change);
          return true;
        } catch (error) {
          if (error instanceof CRListError) throw error;
          return false;
        }
      },
      deleteProperty(target, index) {
        const listIndex = indexFromPropertyKey(index);
        if (listIndex === void 0) return false;
        try {
          const result = __delete(target.state, listIndex, listIndex + 1);
          if (!result) return false;
          const { delta, change } = result;
          if (delta)
            void dispatchCRListEvent(target.eventTarget, "delta", delta);
          if (change)
            void dispatchCRListEvent(target.eventTarget, "change", change);
          return true;
        } catch (error) {
          if (error instanceof CRListError) throw error;
          return false;
        }
      },
      ownKeys(target) {
        return [
          ...Reflect.ownKeys(target),
          ...Array.from({ length: target.size }, (_, index) => String(index))
        ];
      },
      getOwnPropertyDescriptor(target, index) {
        const listIndex = indexFromPropertyKey(index);
        if (listIndex !== void 0 && listIndex < target.size) {
          return {
            value: __read(listIndex, target.state),
            writable: true,
            enumerable: true,
            configurable: true
          };
        }
        return Reflect.getOwnPropertyDescriptor(target, index);
      }
    });
  }
  /**
   * The current number of live entries.
   */
  get size() {
    return this.state.size;
  }
  /**
   * Inserts a value before an index.
   *
   * If `beforeIndex` is omitted, the value is inserted at the start of the list.
   *
   * @param value - The value to insert.
   * @param beforeIndex - The index to insert before.
   */
  prepend(value, beforeIndex) {
    const result = __update(beforeIndex ?? 0, [value], this.state, "before");
    if (!result) return;
    const { delta, change } = result;
    if (delta) void dispatchCRListEvent(this.eventTarget, "delta", delta);
    if (change) void dispatchCRListEvent(this.eventTarget, "change", change);
  }
  /**
   * Inserts a value after an index.
   *
   * If `afterIndex` is omitted, the value is appended at the end of the list.
   *
   * @param value - The value to insert.
   * @param afterIndex - The index to insert after.
   */
  append(value, afterIndex) {
    const result = __update(
      afterIndex ?? this.state.size,
      [value],
      this.state,
      "after"
    );
    if (!result) return;
    const { delta, change } = result;
    if (delta) void dispatchCRListEvent(this.eventTarget, "delta", delta);
    if (change) void dispatchCRListEvent(this.eventTarget, "change", change);
  }
  /**
   * Removes the entry at an index.
   *
   * @param index - The index to remove.
   */
  remove(index) {
    const result = __delete(this.state, index, index + 1);
    if (!result) return;
    const { delta, change } = result;
    if (delta) void dispatchCRListEvent(this.eventTarget, "delta", delta);
    if (change) void dispatchCRListEvent(this.eventTarget, "change", change);
  }
  /**
   * Returns the first live value matching a predicate in index order.
   *
   * Predicate values are live references. Mutating them directly can mutate the
   * list without emitting a delta.
   *
   * @param predicate - Function to test each live value.
   * @param thisArg - Optional `this` value for the predicate.
   */
  find(predicate, thisArg) {
    let linkedListEntry = this.state.index?.get(0) ?? this.state.cursor;
    while (linkedListEntry?.prev) linkedListEntry = linkedListEntry.prev;
    let index = 0;
    while (linkedListEntry) {
      if (predicate.call(thisArg, linkedListEntry.value, index, this))
        return linkedListEntry.value;
      linkedListEntry = linkedListEntry.next;
      index++;
    }
    return void 0;
  }
  /**
   * Applies a remote gossip delta to this list.
   *
   * Emits a `change` event when the merge changes the live projection.
   *
   * @param delta - The remote CRList delta to merge.
   */
  merge(delta) {
    const change = __merge(this.state, delta);
    if (change) void dispatchCRListEvent(this.eventTarget, "change", change);
  }
  /**
   * Emits an acknowledgement frontier for currently retained tombstones.
   */
  acknowledge() {
    const ack = __acknowledge(this.state);
    if (ack) void dispatchCRListEvent(this.eventTarget, "ack", ack);
  }
  /**
   * Garbage-collects tombstones that are covered by acknowledgement frontiers.
   *
   * @param frontiers - Replica acknowledgement frontiers.
   */
  garbageCollect(frontiers) {
    void __garbageCollect(frontiers, this.state);
  }
  /**
   * Emits the current CRList snapshot.
   *
   * Snapshot value payloads are live references. Mutating them can mutate
   * replica state without emitting a delta.
   */
  snapshot() {
    const snapshot = __snapshot(this.state);
    if (snapshot)
      void dispatchCRListEvent(this.eventTarget, "snapshot", snapshot);
  }
  /**
   * Registers an event listener.
   *
   * @param type - The event type to listen for.
   * @param listener - The listener to register.
   * @param options - Listener registration options.
   */
  addEventListener(type, listener, options) {
    void this.eventTarget.addEventListener(
      type,
      listener,
      options
    );
  }
  /**
   * Removes an event listener.
   *
   * @param type - The event type to stop listening for.
   * @param listener - The listener to remove.
   * @param options - Listener removal options.
   */
  removeEventListener(type, listener, options) {
    void this.eventTarget.removeEventListener(
      type,
      listener,
      options
    );
  }
  /**
   * Returns a CRList snapshot of this list.
   *
   * Snapshot value payloads are live references. Mutating them can mutate
   * replica state without emitting a delta.
   *
   * Called automatically by `JSON.stringify`.
   */
  toJSON() {
    return __snapshot(this.state);
  }
  /**
   * Attempts to return this list snapshot as a JSON string.
   *
   * This can fail when list values are not JSON-compatible.
   */
  toString() {
    return JSON.stringify(this);
  }
  /**
   * Returns the Node.js console inspection representation.
   */
  [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toJSON();
  }
  /**
   * Returns the Deno console inspection representation.
   */
  [/* @__PURE__ */ Symbol.for("Deno.customInspect")]() {
    return this.toJSON();
  }
  /**
   * Iterates over current live values in index order.
   */
  *[Symbol.iterator]() {
    for (let index = 0; index < this.size; index++) {
      const value = this[index];
      yield value;
    }
  }
  /**
   * Calls a function once for each live value in index order.
   *
   * Callback values are live references. Mutating them directly can mutate the
   * list without emitting a delta.
   *
   * @param callback - Function to call for each live value.
   * @param thisArg - Optional `this` value for the callback.
   */
  forEach(callback, thisArg) {
    for (let index = 0; index < this.size; index++) {
      void callback.call(thisArg, this[index], index, this);
    }
  }
};

// dist/index.js
var CRTextError = class extends Error {
  code;
  /**
   * Creates a new `CRTextError`.
   *
   * @param code The semantic error code.
   * @param message An optional human-readable detail message.
   */
  constructor(code, message) {
    const detail = message ?? code;
    super(`{@sovereignbase/convergent-replicated-text} ${detail}`);
    this.code = code;
    this.name = "CRTextError";
  }
};
var segmenter = new Intl.Segmenter(void 0, { granularity: "grapheme" });
function transformStringToGraphemeArray(value) {
  return Array.from(segmenter.segment(value), (x) => x.segment);
}
function dispatchCRTextEvent(eventTarget, type, detail) {
  void eventTarget.dispatchEvent(new CustomEvent(type, { detail }));
}
var CRText = class {
  /**
   * Creates a new `CRText` instance.
   *
   * @param snapshot An optional detached snapshot used to hydrate the initial state.
   */
  constructor(snapshot) {
    void Object.defineProperties(this, {
      state: {
        value: __create(snapshot),
        enumerable: false,
        configurable: false,
        writable: false
      },
      eventTarget: {
        value: new EventTarget(),
        enumerable: false,
        configurable: false,
        writable: false
      }
    });
  }
  /**
   * Returns the current number of grapheme clusters in the text projection.
   */
  get size() {
    return this.state.size;
  }
  /**
   * Inserts characters immediately after the specified index.
   *
   * Pass `-1` to insert at the beginning of the document.
   *
   * @param index The anchor index after which the characters are inserted.
   * @param characters The text to insert.
   * @throws {CRTextError} Thrown when the arguments are not a number and string pair.
   */
  insertAfter(index, characters) {
    if (typeof index !== "number" || typeof characters !== "string")
      throw new CRTextError(
        "BAD_PARAMS",
        "`index` must be typeof number and `characters` must be typeof string."
      );
    let mode = "after";
    if (index === -1) {
      index = 0;
      if (this.size > 0) mode = "before";
    }
    const result = __update(
      index,
      transformStringToGraphemeArray(characters),
      this.state,
      mode
    );
    if (!result) return;
    const { delta, change } = result;
    if (delta) void dispatchCRTextEvent(this.eventTarget, "delta", delta);
    if (change) void dispatchCRTextEvent(this.eventTarget, "change", change);
  }
  /**
   * Removes characters starting at the specified index.
   *
   * @param index The inclusive start index to remove from.
   * @param removeCount The number of characters to remove.
   * @throws {CRTextError} Thrown when the arguments are not numeric.
   */
  removeAfter(index, removeCount) {
    if (typeof index !== "number" || typeof removeCount !== "number")
      throw new CRTextError(
        "BAD_PARAMS",
        "`index` must be typeof number and `removeCount` must be typeof number."
      );
    const result = __delete(this.state, index, index + removeCount);
    if (!result) return;
    const { delta, change } = result;
    if (delta) void dispatchCRTextEvent(this.eventTarget, "delta", delta);
    if (change) void dispatchCRTextEvent(this.eventTarget, "change", change);
  }
  /**
   * Merges a remote delta into this replica.
   *
   * Dispatches a `change` event when the merge updates the current projection.
   *
   * @param delta The remote delta to merge.
   */
  merge(delta) {
    const change = __merge(this.state, delta);
    if (change) void dispatchCRTextEvent(this.eventTarget, "change", change);
  }
  /**
   * Emits an acknowledgement frontier for the current replica state.
   *
   * Dispatches an `ack` event when an acknowledgement is produced.
   */
  acknowledge() {
    const ack = __acknowledge(this.state);
    if (ack) void dispatchCRTextEvent(this.eventTarget, "ack", ack);
  }
  /**
   * Removes tombstoned history acknowledged by every provided frontier.
   *
   * @param frontiers The acknowledgement frontiers that permit garbage collection.
   */
  garbageCollect(frontiers) {
    void __garbageCollect(frontiers, this.state);
  }
  /**
   * Dispatches a detached snapshot of the current state.
   */
  snapshot() {
    const snapshot = __snapshot(this.state);
    if (snapshot)
      void dispatchCRTextEvent(this.eventTarget, "snapshot", snapshot);
  }
  /**
   * Returns a detached structured-clone-compatible snapshot of this list.
   *
   * Called automatically by `JSON.stringify`.
   */
  toJSON() {
    return __snapshot(this.state);
  }
  /**
   * Returns this snapshot as a JSON string.
   */
  toString() {
    return JSON.stringify(this);
  }
  /**
   * Iterates over detached copies of the current live values in index order.
   */
  *[Symbol.iterator]() {
    for (let index = 0; index < this.size; index++) {
      const value = __read(index, this.state);
      if (typeof value !== "string") continue;
      yield value;
    }
  }
  /**
   * Returns the current text projection as a string.
   */
  valueOf() {
    return [...this].join("");
  }
  /**
   * Returns the current text projection when coerced to a primitive.
   */
  [Symbol.toPrimitive]() {
    return [...this].join("");
  }
  /**
   * Returns the Node.js console inspection representation.
   */
  [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")]() {
    return this.valueOf();
  }
  /**
   * Returns the Deno console inspection representation.
   */
  [/* @__PURE__ */ Symbol.for("Deno.customInspect")]() {
    return this.valueOf();
  }
  /**
   * Registers an event listener.
   *
   * @param type The event type to listen for.
   * @param listener The listener to register.
   * @param options Listener registration options.
   */
  addEventListener(type, listener, options) {
    this.eventTarget.addEventListener(
      type,
      listener,
      options
    );
  }
  /**
   * Removes an event listener.
   *
   * @param type The event type to stop listening for.
   * @param listener The listener to remove.
   * @param options Listener removal options.
   */
  removeEventListener(type, listener, options) {
    this.eventTarget.removeEventListener(
      type,
      listener,
      options
    );
  }
};
function getElementTextSelection(el) {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return {
      selectionStart: el.selectionStart ?? 0,
      selectionEnd: el.selectionEnd ?? 0
    };
  }
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return {
      selectionStart: 0,
      selectionEnd: 0
    };
  }
  const range = selection.getRangeAt(0);
  if (!el.contains(range.startContainer) || !el.contains(range.endContainer)) {
    return {
      selectionStart: 0,
      selectionEnd: 0
    };
  }
  const beforeRange = range.cloneRange();
  void beforeRange.selectNodeContents(el);
  void beforeRange.setEnd(range.startContainer, range.startOffset);
  const selectionStart = beforeRange.toString().length;
  const selectionEnd = selectionStart + range.toString().length;
  return {
    selectionStart,
    selectionEnd
  };
}
function getInputCharacters(ev) {
  const transferred = ev.dataTransfer?.getData("text/plain");
  if (typeof transferred === "string" && transferred.length > 0)
    return transferred;
  if (typeof ev.data === "string") return ev.data;
  if (ev.inputType === "insertParagraph" || ev.inputType === "insertLineBreak") {
    return "\n";
  }
  return "";
}
function translateDOMBeforeInputEvent(ev) {
  const el = ev.target;
  if (!(el instanceof HTMLElement)) return false;
  const { selectionStart, selectionEnd } = getElementTextSelection(el);
  const characters = getInputCharacters(ev);
  let removeIndex = selectionStart;
  let removeCount = selectionEnd - selectionStart;
  if (selectionStart === selectionEnd && removeIndex > 0) {
    if (ev.inputType === "deleteContentBackward") {
      removeIndex = Math.max(0, selectionStart - 1);
      removeCount = 1;
    } else if (ev.inputType === "deleteContentForward") {
      removeIndex = selectionStart;
      removeCount = 1;
    }
  }
  return {
    insert: characters ? {
      index: selectionStart,
      characters
    } : false,
    remove: removeCount ? {
      index: removeIndex,
      removeCount
    } : false
  };
}
function BeforeInputStreamAdapter(beforeInputEvent, crText) {
  void beforeInputEvent.preventDefault();
  const result = translateDOMBeforeInputEvent(beforeInputEvent);
  if (!result) return;
  const { insert, remove } = result;
  if (insert) {
    let index = insert.index;
    if (index < 0) return;
    index--;
    void crText.insertAfter(index, insert.characters);
  }
  if (remove) {
    void crText.removeAfter(remove.index, remove.removeCount);
  }
}
function ChangeStreamAdapter(changeEvent, htmlElement, crText) {
  const entries = Object.entries(changeEvent.detail);
  if (entries.length > 1) {
    htmlElement instanceof HTMLInputElement || htmlElement instanceof HTMLTextAreaElement ? htmlElement.value = crText.valueOf() : htmlElement.textContent = crText.valueOf();
    return;
  }
  const removals = [...entries].sort(([a], [b]) => Number(b) - Number(a));
  const inserts = [...entries].sort(([a], [b]) => Number(a) - Number(b));
  if (htmlElement instanceof HTMLInputElement || htmlElement instanceof HTMLTextAreaElement) {
    for (const [key, value] of removals) {
      const index = Number(key);
      if (value === void 0) {
        void htmlElement.setRangeText("", index, index + 1, "end");
      }
    }
    for (const [key, value] of inserts) {
      if (typeof value === "string") {
        let index = Number(key);
        void htmlElement.setRangeText(value, index, index, "end");
      }
    }
    return;
  }
  const doc = htmlElement.ownerDocument;
  const oldAnchor = htmlElement.querySelector('[data-caret-anchor="true"]');
  oldAnchor?.remove();
  const textNode = htmlElement.firstChild instanceof Text ? htmlElement.firstChild : htmlElement.insertBefore(doc.createTextNode(""), htmlElement.firstChild);
  let caretOffset = textNode.length;
  for (const [key, value] of removals) {
    const index = Number(key);
    if (value === void 0) {
      void textNode.deleteData(index, 1);
      caretOffset = index;
    }
  }
  for (const [key, value] of inserts) {
    if (typeof value === "string") {
      const index = Number(key);
      void textNode.insertData(index, value);
      caretOffset = index + value.length;
    }
  }
  if (htmlElement !== doc.activeElement && !htmlElement.contains(doc.activeElement)) {
    return;
  }
  const selection = doc.defaultView?.getSelection();
  if (!selection) return;
  const range = doc.createRange();
  const clampedOffset = Math.max(0, Math.min(caretOffset, textNode.length));
  if (clampedOffset === textNode.length && textNode.data.length > 0 && textNode.data.endsWith("\n")) {
    const anchor = doc.createElement("span");
    anchor.dataset.caretAnchor = "true";
    anchor.textContent = "\u200B";
    void htmlElement.append(anchor);
    void range.setStart(anchor.firstChild, 0);
    void range.collapse(true);
  } else {
    void range.setStart(textNode, clampedOffset);
    void range.collapse(true);
  }
  void selection.removeAllRanges();
  void selection.addRange(range);
}
export {
  BeforeInputStreamAdapter,
  CRText,
  CRTextError,
  ChangeStreamAdapter,
  translateDOMBeforeInputEvent
};
