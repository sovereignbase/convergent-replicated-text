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
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    if (typeof crypto === "undefined" || !crypto.getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
    getRandomValues = crypto.getRandomValues.bind(crypto);
  }
  return getRandomValues(rnds8);
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
function safeStructuredClone(value) {
  try {
    return [true, structuredClone(value)];
  } catch {
    return [false];
  }
}

// node_modules/@sovereignbase/convergent-replicated-list/dist/index.js
function assertListIndices(crListReplica) {
  if (!crListReplica.cursor) return;
  let index = crListReplica.size;
  while (crListReplica.cursor.next)
    crListReplica.cursor = crListReplica.cursor.next;
  while (index >= 1) {
    index--;
    crListReplica.cursor.index = index;
    if (crListReplica.cursor.prev === void 0) break;
    crListReplica.cursor = crListReplica.cursor.prev;
  }
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
function walkToIndex(targetIndex, crListReplica) {
  if (targetIndex < 0 || targetIndex >= crListReplica.size)
    throw new CRListError("INDEX_OUT_OF_BOUNDS", "Index out of bounds");
  if (!crListReplica.cursor)
    throw new CRListError("LIST_EMPTY", "List is empty");
  const direction = crListReplica.cursor.index > targetIndex ? "prev" : "next";
  while (crListReplica.cursor && crListReplica.cursor.index !== targetIndex) {
    crListReplica.cursor = crListReplica.cursor[direction];
  }
}
function insertBetween(prev, linkedListEntry, next) {
  linkedListEntry.prev = prev;
  linkedListEntry.next = next;
  if (prev) prev.next = linkedListEntry;
  if (next) next.prev = linkedListEntry;
}
function flattenAndLinkTrustedState(crListReplica) {
  crListReplica.cursor = void 0;
  const resolvedSiblingPredecessors = /* @__PURE__ */ new Set();
  for (const entry of crListReplica.parentMap.values()) {
    if (!entry) continue;
    entry.prev = void 0;
    entry.next = void 0;
  }
  const keys = [...crListReplica.childrenMap.keys()].sort(
    (a, b) => a > b ? 1 : -1
  );
  let hasProgress = true;
  while (hasProgress) {
    hasProgress = false;
    for (const predecessorIdentifier of keys) {
      if (resolvedSiblingPredecessors.has(predecessorIdentifier)) continue;
      const siblings = crListReplica.childrenMap.get(predecessorIdentifier);
      if (!siblings) continue;
      if (siblings.length > 1)
        siblings.sort((a, b) => a.uuidv7 > b.uuidv7 ? 1 : -1);
      const predecessor = predecessorIdentifier === "\0" ? void 0 : crListReplica.parentMap.get(predecessorIdentifier);
      if (predecessor && !predecessor.prev && !predecessor.next && crListReplica.cursor !== predecessor)
        continue;
      let prev = predecessor ?? crListReplica.cursor;
      const predecessorNext = predecessor?.next;
      if (siblings.length === 1) {
        const sibling = siblings[0];
        insertBetween(prev, sibling, sibling.next);
        prev = sibling;
        if (predecessorNext && predecessorNext !== sibling) {
          prev.next = predecessorNext;
          predecessorNext.prev = prev;
        } else {
          prev.next = void 0;
        }
        if (!predecessorNext) crListReplica.cursor = prev;
        resolvedSiblingPredecessors.add(predecessorIdentifier);
        hasProgress = true;
        continue;
      }
      const siblingSet = new Set(siblings);
      for (let index = 0; index < siblings.length; index++) {
        const sibling = siblings[index];
        const next = siblings[index + 1];
        insertBetween(prev, sibling, sibling.next);
        prev = sibling;
        if (next) {
          prev.next = next;
          next.prev = prev;
        } else if (predecessorNext && !siblingSet.has(predecessorNext)) {
          prev.next = predecessorNext;
          predecessorNext.prev = prev;
        } else {
          prev.next = void 0;
        }
      }
      if (!predecessorNext) crListReplica.cursor = prev;
      resolvedSiblingPredecessors.add(predecessorIdentifier);
      hasProgress = true;
    }
  }
  crListReplica.size = crListReplica.parentMap.size;
}
function transformSnapshotEntryToStateEntry(valueEntry, crListReplica) {
  if (valueEntry === null || valueEntry === void 0) return void 0;
  if (!isUuidV7(valueEntry.uuidv7) || crListReplica.tombstones.has(valueEntry.uuidv7) || crListReplica.parentMap.has(valueEntry.uuidv7) || !isUuidV7(valueEntry.predecessor) && valueEntry.predecessor !== "\0" && !crListReplica.tombstones.has(valueEntry.predecessor))
    return void 0;
  const [cloned, copiedValue] = safeStructuredClone(valueEntry.value);
  if (!cloned) return void 0;
  return {
    uuidv7: valueEntry.uuidv7,
    value: copiedValue,
    predecessor: valueEntry.predecessor,
    index: 0,
    next: void 0,
    prev: void 0
  };
}
function updateEntryToMaps(crListReplica, linkedListEntry, deltaBuf) {
  crListReplica.parentMap.set(linkedListEntry.uuidv7, linkedListEntry);
  const siblings = crListReplica.childrenMap.get(linkedListEntry.predecessor);
  if (siblings) {
    siblings.push(linkedListEntry);
  } else {
    crListReplica.childrenMap.set(linkedListEntry.predecessor, [
      linkedListEntry
    ]);
  }
  if (deltaBuf && !Array.isArray(deltaBuf.values)) deltaBuf.values = [];
  if (deltaBuf?.values)
    deltaBuf.values.push({
      uuidv7: linkedListEntry.uuidv7,
      value: linkedListEntry.value,
      predecessor: linkedListEntry.predecessor
    });
}
function deleteEntryFromMaps(crListReplica, linkedListEntry) {
  crListReplica.parentMap.delete(linkedListEntry.uuidv7);
  const siblings = crListReplica.childrenMap.get(linkedListEntry.predecessor);
  if (!siblings) return;
  const index = siblings.indexOf(linkedListEntry);
  if (index !== -1) siblings.splice(index, 1);
}
function deleteLinkedEntry(crListReplica, linkedListEntry, deltaBuf) {
  const prev = linkedListEntry.prev;
  const next = linkedListEntry.next;
  crListReplica.tombstones.add(linkedListEntry.uuidv7);
  if (deltaBuf && !Array.isArray(deltaBuf.tombstones)) deltaBuf.tombstones = [];
  deltaBuf?.tombstones?.push(linkedListEntry.uuidv7);
  if (prev) prev.next = next;
  if (next) {
    next.prev = prev;
  }
  void deleteEntryFromMaps(crListReplica, linkedListEntry);
  if (crListReplica.cursor === linkedListEntry)
    crListReplica.cursor = next ?? prev;
  linkedListEntry.prev = void 0;
  linkedListEntry.next = void 0;
  crListReplica.size = crListReplica.parentMap.size;
}
function moveEntryToPredecessor(crListReplica, linkedListEntry, predecessor, deltaBuf) {
  void deleteEntryFromMaps(crListReplica, linkedListEntry);
  linkedListEntry.predecessor = predecessor;
  void updateEntryToMaps(crListReplica, linkedListEntry, deltaBuf);
}
function indexFromPropertyKey(index) {
  if (typeof index !== "string" || !/^(0|[1-9]\d*)$/.test(index))
    return void 0;
  const listIndex = Number(index);
  return Number.isSafeInteger(listIndex) ? listIndex : void 0;
}
function __create(snapshot2) {
  const crListReplica = {
    size: 0,
    cursor: void 0,
    tombstones: /* @__PURE__ */ new Set(),
    parentMap: /* @__PURE__ */ new Map(),
    childrenMap: /* @__PURE__ */ new Map()
  };
  if (!snapshot2 || prototype(snapshot2) !== "record") return crListReplica;
  if (Object.hasOwn(snapshot2, "tombstones") && Array.isArray(snapshot2.tombstones)) {
    for (const tombstone of snapshot2.tombstones) {
      if (crListReplica.tombstones.has(tombstone) || !isUuidV7(tombstone))
        continue;
      crListReplica.tombstones.add(tombstone);
    }
  }
  if (!Object.hasOwn(snapshot2, "values") || !Array.isArray(snapshot2.values))
    return crListReplica;
  for (const valueEntry of snapshot2.values) {
    const linkedListEntry = transformSnapshotEntryToStateEntry(
      valueEntry,
      crListReplica
    );
    if (!linkedListEntry) continue;
    void updateEntryToMaps(crListReplica, linkedListEntry);
  }
  void flattenAndLinkTrustedState(crListReplica);
  void assertListIndices(crListReplica);
  return crListReplica;
}
function __read(targetIndex, crListReplica) {
  try {
    void walkToIndex(targetIndex, crListReplica);
    return structuredClone(crListReplica?.cursor?.value);
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
  let shiftCursor;
  for (const listValue of listValues) {
    const [cloned, copiedValue] = safeStructuredClone(listValue);
    if (!cloned) throw new CRListError("VALUE_NOT_CLONEABLE");
    const v72 = v7_default();
    const linkedListEntry = {
      uuidv7: v72,
      value: copiedValue,
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
            void updateEntryToMaps(crListReplica, linkedListEntry, delta);
            change[linkedListEntry.index] = linkedListEntry.value;
            break;
          }
          void walkToIndex(crListReplica.size - 1, crListReplica);
          if (!crListReplica.cursor) return false;
          linkedListEntry.index = crListReplica.cursor.index + 1;
          linkedListEntry.predecessor = crListReplica.cursor.uuidv7;
          insertBetween(crListReplica.cursor, linkedListEntry, void 0);
          void updateEntryToMaps(crListReplica, linkedListEntry, delta);
          crListReplica.cursor = linkedListEntry;
          change[linkedListEntry.index] = structuredClone(linkedListEntry.value);
          break;
        }
        void walkToIndex(listIndex, crListReplica);
        if (!crListReplica.cursor) return false;
        const entryToOverwrite = crListReplica.cursor;
        linkedListEntry.predecessor = entryToOverwrite.predecessor;
        linkedListEntry.index = entryToOverwrite.index;
        insertBetween(
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
        void updateEntryToMaps(crListReplica, linkedListEntry, delta);
        crListReplica.tombstones.add(entryToOverwrite.uuidv7);
        delta.tombstones?.push(entryToOverwrite.uuidv7);
        void deleteEntryFromMaps(crListReplica, entryToOverwrite);
        entryToOverwrite.next = void 0;
        entryToOverwrite.prev = void 0;
        crListReplica.cursor = linkedListEntry;
        change[linkedListEntry.index] = structuredClone(linkedListEntry.value);
        break;
      }
      case "after": {
        if (crListReplica.size === 0 && listIndex === 0) {
          crListReplica.cursor = linkedListEntry;
          void updateEntryToMaps(crListReplica, linkedListEntry, delta);
          change[linkedListEntry.index] = structuredClone(linkedListEntry.value);
          break;
        }
        if (listIndex === crListReplica.size) {
          void walkToIndex(crListReplica.size - 1, crListReplica);
        } else {
          void walkToIndex(listIndex, crListReplica);
        }
        if (!crListReplica.cursor) return false;
        const next = listIndex === crListReplica.size ? void 0 : crListReplica.cursor.next;
        shiftCursor = next;
        linkedListEntry.index = crListReplica.cursor.index + 1;
        linkedListEntry.predecessor = crListReplica.cursor.uuidv7;
        insertBetween(crListReplica.cursor, linkedListEntry, next);
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
        void updateEntryToMaps(crListReplica, linkedListEntry, delta);
        crListReplica.cursor = linkedListEntry;
        change[linkedListEntry.index] = structuredClone(linkedListEntry.value);
        break;
      }
      case "before": {
        if (crListReplica.size === 0 && listIndex === 0) {
          crListReplica.cursor = linkedListEntry;
          void updateEntryToMaps(crListReplica, linkedListEntry, delta);
          change[linkedListEntry.index] = structuredClone(linkedListEntry.value);
          mode = "after";
          listIndex = linkedListEntry.index - 1;
          break;
        }
        void walkToIndex(listIndex, crListReplica);
        if (!crListReplica.cursor) return false;
        const prev = crListReplica.cursor.prev;
        shiftCursor = crListReplica.cursor;
        linkedListEntry.index = crListReplica.cursor.index;
        linkedListEntry.predecessor = prev?.uuidv7 ?? "\0";
        insertBetween(prev, linkedListEntry, crListReplica.cursor);
        if (crListReplica.cursor.predecessor === linkedListEntry.predecessor) {
          void moveEntryToPredecessor(
            crListReplica,
            crListReplica.cursor,
            linkedListEntry.uuidv7,
            delta
          );
        }
        void updateEntryToMaps(crListReplica, linkedListEntry, delta);
        crListReplica.cursor = linkedListEntry;
        change[linkedListEntry.index] = structuredClone(linkedListEntry.value);
        mode = "after";
        listIndex = linkedListEntry.index - 1;
        break;
      }
    }
    crListReplica.size = crListReplica.parentMap.size;
    listIndex++;
  }
  if (mode !== "overwrite")
    while (shiftCursor) {
      shiftCursor.index += listValues.length;
      shiftCursor = shiftCursor.next;
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
  void walkToIndex(listIndex, crListReplica);
  if (!crListReplica.cursor) return false;
  let current = crListReplica.cursor;
  let deleted = 0;
  while (current && deleted < deleteCount) {
    const next = current.next;
    change[current.index] = void 0;
    void deleteLinkedEntry(crListReplica, current, delta);
    current = next;
    deleted++;
  }
  crListReplica.size = crListReplica.parentMap.size;
  while (current) {
    current.index -= deleted;
    current = current.next;
  }
  return { change, delta };
}
function __merge(crListReplica, crListDelta) {
  if (!crListDelta || prototype(crListDelta) !== "record") return false;
  const newVals = [];
  const newTombsIndices = [];
  const change = {};
  let needsRelink = false;
  if (Object.hasOwn(crListDelta, "tombstones") && Array.isArray(crListDelta.tombstones)) {
    for (const tombstone of crListDelta.tombstones) {
      if (crListReplica.tombstones.has(tombstone) || !isUuidV7(tombstone))
        continue;
      crListReplica.tombstones.add(tombstone);
      const linkedListEntry = crListReplica.parentMap.get(tombstone);
      if (linkedListEntry) {
        void newTombsIndices.push(linkedListEntry.index);
        void deleteLinkedEntry(crListReplica, linkedListEntry);
        needsRelink = true;
      }
    }
  }
  if (!Object.hasOwn(crListDelta, "values") || !Array.isArray(crListDelta.values)) {
    if (newTombsIndices.length === 0) return false;
    void assertListIndices(crListReplica);
    for (const index of newTombsIndices) {
      change[index] = void 0;
    }
    return change;
  }
  for (const valueEntry of crListDelta.values) {
    if (valueEntry === null || valueEntry === void 0) continue;
    const existingEntry = crListReplica.parentMap.get(valueEntry.uuidv7);
    if (existingEntry) {
      if (crListReplica.tombstones.has(valueEntry.uuidv7) || !isUuidV7(valueEntry.predecessor) && valueEntry.predecessor !== "\0")
        continue;
      if (existingEntry.predecessor >= valueEntry.predecessor) continue;
      void moveEntryToPredecessor(
        crListReplica,
        existingEntry,
        valueEntry.predecessor
      );
      needsRelink = true;
      continue;
    }
    const linkedListEntry = transformSnapshotEntryToStateEntry(
      valueEntry,
      crListReplica
    );
    if (!linkedListEntry) continue;
    const predecessor = linkedListEntry.predecessor === "\0" ? void 0 : crListReplica.parentMap.get(linkedListEntry.predecessor);
    void updateEntryToMaps(crListReplica, linkedListEntry);
    void newVals.push(linkedListEntry);
    if (!needsRelink && linkedListEntry.predecessor === "\0") {
      if (crListReplica.size === 0) {
        crListReplica.cursor = linkedListEntry;
        crListReplica.size = crListReplica.parentMap.size;
      } else {
        needsRelink = true;
      }
    } else if (!needsRelink && predecessor && !predecessor.next) {
      linkedListEntry.prev = predecessor;
      linkedListEntry.index = predecessor.index + 1;
      predecessor.next = linkedListEntry;
      crListReplica.cursor = linkedListEntry;
      crListReplica.size = crListReplica.parentMap.size;
    } else {
      needsRelink = true;
    }
  }
  if (needsRelink) {
    void flattenAndLinkTrustedState(crListReplica);
    void assertListIndices(crListReplica);
  }
  if (newTombsIndices.length === 0 && newVals.length === 0) return false;
  for (const index of newTombsIndices) {
    change[index] = void 0;
  }
  for (const val of newVals) {
    change[val.index] = structuredClone(val.value);
  }
  return change;
}
function __acknowledge(crListReplica) {
  let largest = false;
  crListReplica.tombstones.forEach((tombstone) => {
    if (largest === false || largest < tombstone) largest = tombstone;
  });
  if (typeof largest === "string") return largest;
  return false;
}
function __garbageCollect(frontiers2, crListReplica) {
  if (!Array.isArray(frontiers2)) return;
  frontiers2.sort();
  const smallest = frontiers2.find((frontier) => isUuidV7(frontier));
  if (typeof smallest !== "string") return;
  crListReplica.tombstones.forEach((tombstone, __, tombstones) => {
    if (tombstone <= smallest) {
      tombstones.delete(tombstone);
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
          value: structuredClone(linkedListEntry.value),
          predecessor: linkedListEntry.predecessor
        };
      }
    ),
    tombstones: Array.from(crListReplica.tombstones)
  };
}
var CRList = class {
  /**
   * Creates a replicated list from an optional detached structured-clone-compatible snapshot.
   *
   * @param snapshot - A previously emitted CRList snapshot.
   */
  constructor(snapshot2) {
    Object.defineProperties(this, {
      state: {
        value: __create(snapshot2),
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
            void target.eventTarget.dispatchEvent(
              new CustomEvent("delta", { detail: delta })
            );
          if (change)
            void target.eventTarget.dispatchEvent(
              new CustomEvent("change", { detail: change })
            );
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
          if (delta) {
            void target.eventTarget.dispatchEvent(
              new CustomEvent("delta", { detail: delta })
            );
          }
          if (change) {
            void target.eventTarget.dispatchEvent(
              new CustomEvent("change", { detail: change })
            );
          }
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
    if (delta)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("delta", { detail: delta })
      );
    if (change)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("change", { detail: change })
      );
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
    if (delta)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("delta", { detail: delta })
      );
    if (change)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("change", { detail: change })
      );
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
    if (delta)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("delta", { detail: delta })
      );
    if (change)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("change", { detail: change })
      );
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
    if (change)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("change", { detail: change })
      );
  }
  /**
   * Emits an acknowledgement frontier for currently retained tombstones.
   */
  acknowledge() {
    const ack = __acknowledge(this.state);
    if (ack)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("ack", { detail: ack })
      );
  }
  /**
   * Garbage-collects tombstones that are covered by acknowledgement frontiers.
   *
   * @param frontiers - Replica acknowledgement frontiers.
   */
  garbageCollect(frontiers2) {
    void __garbageCollect(frontiers2, this.state);
  }
  /**
   * Emits the current detached structured-clone-compatible list snapshot.
   */
  snapshot() {
    const snapshot2 = __snapshot(this.state);
    if (snapshot2)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("snapshot", { detail: snapshot2 })
      );
  }
  /**
   * Registers an event listener.
   *
   * @param type - The event type to listen for.
   * @param listener - The listener to register.
   * @param options - Listener registration options.
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
   * @param type - The event type to stop listening for.
   * @param listener - The listener to remove.
   * @param options - Listener removal options.
   */
  removeEventListener(type, listener, options) {
    this.eventTarget.removeEventListener(
      type,
      listener,
      options
    );
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
   * Iterates over detached copies of the current live values in index order.
   */
  *[Symbol.iterator]() {
    for (let index = 0; index < this.size; index++) {
      const value = this[index];
      yield value;
    }
  }
  /**
   * Calls a function once for each live value copy in index order.
   *
   * Callback values are detached copies, so mutating them does not mutate the
   * list.
   *
   * @param callback - Function to call for each value copy.
   * @param thisArg - Optional `this` value for the callback.
   */
  forEach(callback, thisArg) {
    for (let index = 0; index < this.size; index++) {
      callback.call(thisArg, this[index], index, this);
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
var CRText = class {
  /**
   * Creates a new `CRText` instance.
   *
   * @param snapshot An optional detached snapshot used to hydrate the initial state.
   */
  constructor(snapshot2) {
    Object.defineProperties(this, {
      state: {
        value: __create(snapshot2),
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
    if (delta)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("delta", { detail: delta })
      );
    if (change)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("change", { detail: change })
      );
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
    if (delta)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("delta", { detail: delta })
      );
    if (change)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("change", { detail: change })
      );
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
    if (change) {
      void this.eventTarget.dispatchEvent(
        new CustomEvent("change", { detail: change })
      );
    }
  }
  /**
   * Emits an acknowledgement frontier for the current replica state.
   *
   * Dispatches an `ack` event when an acknowledgement is produced.
   */
  acknowledge() {
    const ack = __acknowledge(this.state);
    if (ack) {
      void this.eventTarget.dispatchEvent(
        new CustomEvent("ack", { detail: ack })
      );
    }
  }
  /**
   * Removes tombstoned history acknowledged by every provided frontier.
   *
   * @param frontiers The acknowledgement frontiers that permit garbage collection.
   */
  garbageCollect(frontiers2) {
    void __garbageCollect(frontiers2, this.state);
  }
  /**
   * Dispatches a detached snapshot of the current state.
   */
  snapshot() {
    const snapshot2 = __snapshot(this.state);
    if (snapshot2) {
      this.eventTarget.dispatchEvent(
        new CustomEvent("snapshot", { detail: snapshot2 })
      );
    }
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
  if (selectionStart === selectionEnd) {
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
function ChangeStreamAdapter(changeEvent, htmlElement) {
  const entries = Object.entries(changeEvent.detail);
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

// node_modules/@msgpack/msgpack/dist.esm/utils/utf8.mjs
function utf8Count(str) {
  const strLength = str.length;
  let byteLength = 0;
  let pos = 0;
  while (pos < strLength) {
    let value = str.charCodeAt(pos++);
    if ((value & 4294967168) === 0) {
      byteLength++;
      continue;
    } else if ((value & 4294965248) === 0) {
      byteLength += 2;
    } else {
      if (value >= 55296 && value <= 56319) {
        if (pos < strLength) {
          const extra = str.charCodeAt(pos);
          if ((extra & 64512) === 56320) {
            ++pos;
            value = ((value & 1023) << 10) + (extra & 1023) + 65536;
          }
        }
      }
      if ((value & 4294901760) === 0) {
        byteLength += 3;
      } else {
        byteLength += 4;
      }
    }
  }
  return byteLength;
}
function utf8EncodeJs(str, output, outputOffset) {
  const strLength = str.length;
  let offset = outputOffset;
  let pos = 0;
  while (pos < strLength) {
    let value = str.charCodeAt(pos++);
    if ((value & 4294967168) === 0) {
      output[offset++] = value;
      continue;
    } else if ((value & 4294965248) === 0) {
      output[offset++] = value >> 6 & 31 | 192;
    } else {
      if (value >= 55296 && value <= 56319) {
        if (pos < strLength) {
          const extra = str.charCodeAt(pos);
          if ((extra & 64512) === 56320) {
            ++pos;
            value = ((value & 1023) << 10) + (extra & 1023) + 65536;
          }
        }
      }
      if ((value & 4294901760) === 0) {
        output[offset++] = value >> 12 & 15 | 224;
        output[offset++] = value >> 6 & 63 | 128;
      } else {
        output[offset++] = value >> 18 & 7 | 240;
        output[offset++] = value >> 12 & 63 | 128;
        output[offset++] = value >> 6 & 63 | 128;
      }
    }
    output[offset++] = value & 63 | 128;
  }
}
var sharedTextEncoder = new TextEncoder();
var TEXT_ENCODER_THRESHOLD = 50;
function utf8EncodeTE(str, output, outputOffset) {
  sharedTextEncoder.encodeInto(str, output.subarray(outputOffset));
}
function utf8Encode(str, output, outputOffset) {
  if (str.length > TEXT_ENCODER_THRESHOLD) {
    utf8EncodeTE(str, output, outputOffset);
  } else {
    utf8EncodeJs(str, output, outputOffset);
  }
}
var CHUNK_SIZE = 4096;
function utf8DecodeJs(bytes, inputOffset, byteLength) {
  let offset = inputOffset;
  const end = offset + byteLength;
  const units = [];
  let result = "";
  while (offset < end) {
    const byte1 = bytes[offset++];
    if ((byte1 & 128) === 0) {
      units.push(byte1);
    } else if ((byte1 & 224) === 192) {
      const byte2 = bytes[offset++] & 63;
      units.push((byte1 & 31) << 6 | byte2);
    } else if ((byte1 & 240) === 224) {
      const byte2 = bytes[offset++] & 63;
      const byte3 = bytes[offset++] & 63;
      units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
    } else if ((byte1 & 248) === 240) {
      const byte2 = bytes[offset++] & 63;
      const byte3 = bytes[offset++] & 63;
      const byte4 = bytes[offset++] & 63;
      let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
      if (unit > 65535) {
        unit -= 65536;
        units.push(unit >>> 10 & 1023 | 55296);
        unit = 56320 | unit & 1023;
      }
      units.push(unit);
    } else {
      units.push(byte1);
    }
    if (units.length >= CHUNK_SIZE) {
      result += String.fromCharCode(...units);
      units.length = 0;
    }
  }
  if (units.length > 0) {
    result += String.fromCharCode(...units);
  }
  return result;
}
var sharedTextDecoder = new TextDecoder();
var TEXT_DECODER_THRESHOLD = 200;
function utf8DecodeTD(bytes, inputOffset, byteLength) {
  const stringBytes = bytes.subarray(inputOffset, inputOffset + byteLength);
  return sharedTextDecoder.decode(stringBytes);
}
function utf8Decode(bytes, inputOffset, byteLength) {
  if (byteLength > TEXT_DECODER_THRESHOLD) {
    return utf8DecodeTD(bytes, inputOffset, byteLength);
  } else {
    return utf8DecodeJs(bytes, inputOffset, byteLength);
  }
}

// node_modules/@msgpack/msgpack/dist.esm/ExtData.mjs
var ExtData = class {
  type;
  data;
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }
};

// node_modules/@msgpack/msgpack/dist.esm/DecodeError.mjs
var DecodeError = class _DecodeError extends Error {
  constructor(message) {
    super(message);
    const proto = Object.create(_DecodeError.prototype);
    Object.setPrototypeOf(this, proto);
    Object.defineProperty(this, "name", {
      configurable: true,
      enumerable: false,
      value: _DecodeError.name
    });
  }
};

// node_modules/@msgpack/msgpack/dist.esm/utils/int.mjs
var UINT32_MAX = 4294967295;
function setUint64(view, offset, value) {
  const high = value / 4294967296;
  const low = value;
  view.setUint32(offset, high);
  view.setUint32(offset + 4, low);
}
function setInt64(view, offset, value) {
  const high = Math.floor(value / 4294967296);
  const low = value;
  view.setUint32(offset, high);
  view.setUint32(offset + 4, low);
}
function getInt64(view, offset) {
  const high = view.getInt32(offset);
  const low = view.getUint32(offset + 4);
  return high * 4294967296 + low;
}
function getUint64(view, offset) {
  const high = view.getUint32(offset);
  const low = view.getUint32(offset + 4);
  return high * 4294967296 + low;
}

// node_modules/@msgpack/msgpack/dist.esm/timestamp.mjs
var EXT_TIMESTAMP = -1;
var TIMESTAMP32_MAX_SEC = 4294967296 - 1;
var TIMESTAMP64_MAX_SEC = 17179869184 - 1;
function encodeTimeSpecToTimestamp({ sec, nsec }) {
  if (sec >= 0 && nsec >= 0 && sec <= TIMESTAMP64_MAX_SEC) {
    if (nsec === 0 && sec <= TIMESTAMP32_MAX_SEC) {
      const rv = new Uint8Array(4);
      const view = new DataView(rv.buffer);
      view.setUint32(0, sec);
      return rv;
    } else {
      const secHigh = sec / 4294967296;
      const secLow = sec & 4294967295;
      const rv = new Uint8Array(8);
      const view = new DataView(rv.buffer);
      view.setUint32(0, nsec << 2 | secHigh & 3);
      view.setUint32(4, secLow);
      return rv;
    }
  } else {
    const rv = new Uint8Array(12);
    const view = new DataView(rv.buffer);
    view.setUint32(0, nsec);
    setInt64(view, 4, sec);
    return rv;
  }
}
function encodeDateToTimeSpec(date) {
  const msec = date.getTime();
  const sec = Math.floor(msec / 1e3);
  const nsec = (msec - sec * 1e3) * 1e6;
  const nsecInSec = Math.floor(nsec / 1e9);
  return {
    sec: sec + nsecInSec,
    nsec: nsec - nsecInSec * 1e9
  };
}
function encodeTimestampExtension(object) {
  if (object instanceof Date) {
    const timeSpec = encodeDateToTimeSpec(object);
    return encodeTimeSpecToTimestamp(timeSpec);
  } else {
    return null;
  }
}
function decodeTimestampToTimeSpec(data) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  switch (data.byteLength) {
    case 4: {
      const sec = view.getUint32(0);
      const nsec = 0;
      return { sec, nsec };
    }
    case 8: {
      const nsec30AndSecHigh2 = view.getUint32(0);
      const secLow32 = view.getUint32(4);
      const sec = (nsec30AndSecHigh2 & 3) * 4294967296 + secLow32;
      const nsec = nsec30AndSecHigh2 >>> 2;
      return { sec, nsec };
    }
    case 12: {
      const sec = getInt64(view, 4);
      const nsec = view.getUint32(0);
      return { sec, nsec };
    }
    default:
      throw new DecodeError(`Unrecognized data size for timestamp (expected 4, 8, or 12): ${data.length}`);
  }
}
function decodeTimestampExtension(data) {
  const timeSpec = decodeTimestampToTimeSpec(data);
  return new Date(timeSpec.sec * 1e3 + timeSpec.nsec / 1e6);
}
var timestampExtension = {
  type: EXT_TIMESTAMP,
  encode: encodeTimestampExtension,
  decode: decodeTimestampExtension
};

// node_modules/@msgpack/msgpack/dist.esm/ExtensionCodec.mjs
var ExtensionCodec = class _ExtensionCodec {
  static defaultCodec = new _ExtensionCodec();
  // ensures ExtensionCodecType<X> matches ExtensionCodec<X>
  // this will make type errors a lot more clear
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __brand;
  // built-in extensions
  builtInEncoders = [];
  builtInDecoders = [];
  // custom extensions
  encoders = [];
  decoders = [];
  constructor() {
    this.register(timestampExtension);
  }
  register({ type, encode: encode2, decode: decode2 }) {
    if (type >= 0) {
      this.encoders[type] = encode2;
      this.decoders[type] = decode2;
    } else {
      const index = -1 - type;
      this.builtInEncoders[index] = encode2;
      this.builtInDecoders[index] = decode2;
    }
  }
  tryToEncode(object, context) {
    for (let i = 0; i < this.builtInEncoders.length; i++) {
      const encodeExt = this.builtInEncoders[i];
      if (encodeExt != null) {
        const data = encodeExt(object, context);
        if (data != null) {
          const type = -1 - i;
          return new ExtData(type, data);
        }
      }
    }
    for (let i = 0; i < this.encoders.length; i++) {
      const encodeExt = this.encoders[i];
      if (encodeExt != null) {
        const data = encodeExt(object, context);
        if (data != null) {
          const type = i;
          return new ExtData(type, data);
        }
      }
    }
    if (object instanceof ExtData) {
      return object;
    }
    return null;
  }
  decode(data, type, context) {
    const decodeExt = type < 0 ? this.builtInDecoders[-1 - type] : this.decoders[type];
    if (decodeExt) {
      return decodeExt(data, type, context);
    } else {
      return new ExtData(type, data);
    }
  }
};

// node_modules/@msgpack/msgpack/dist.esm/utils/typedArrays.mjs
function isArrayBufferLike(buffer) {
  return buffer instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && buffer instanceof SharedArrayBuffer;
}
function ensureUint8Array(buffer) {
  if (buffer instanceof Uint8Array) {
    return buffer;
  } else if (ArrayBuffer.isView(buffer)) {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else if (isArrayBufferLike(buffer)) {
    return new Uint8Array(buffer);
  } else {
    return Uint8Array.from(buffer);
  }
}

// node_modules/@msgpack/msgpack/dist.esm/Encoder.mjs
var DEFAULT_MAX_DEPTH = 100;
var DEFAULT_INITIAL_BUFFER_SIZE = 2048;
var Encoder = class _Encoder {
  extensionCodec;
  context;
  useBigInt64;
  maxDepth;
  initialBufferSize;
  sortKeys;
  forceFloat32;
  ignoreUndefined;
  forceIntegerToFloat;
  pos;
  view;
  bytes;
  entered = false;
  constructor(options) {
    this.extensionCodec = options?.extensionCodec ?? ExtensionCodec.defaultCodec;
    this.context = options?.context;
    this.useBigInt64 = options?.useBigInt64 ?? false;
    this.maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH;
    this.initialBufferSize = options?.initialBufferSize ?? DEFAULT_INITIAL_BUFFER_SIZE;
    this.sortKeys = options?.sortKeys ?? false;
    this.forceFloat32 = options?.forceFloat32 ?? false;
    this.ignoreUndefined = options?.ignoreUndefined ?? false;
    this.forceIntegerToFloat = options?.forceIntegerToFloat ?? false;
    this.pos = 0;
    this.view = new DataView(new ArrayBuffer(this.initialBufferSize));
    this.bytes = new Uint8Array(this.view.buffer);
  }
  clone() {
    return new _Encoder({
      extensionCodec: this.extensionCodec,
      context: this.context,
      useBigInt64: this.useBigInt64,
      maxDepth: this.maxDepth,
      initialBufferSize: this.initialBufferSize,
      sortKeys: this.sortKeys,
      forceFloat32: this.forceFloat32,
      ignoreUndefined: this.ignoreUndefined,
      forceIntegerToFloat: this.forceIntegerToFloat
    });
  }
  reinitializeState() {
    this.pos = 0;
  }
  /**
   * This is almost equivalent to {@link Encoder#encode}, but it returns an reference of the encoder's internal buffer and thus much faster than {@link Encoder#encode}.
   *
   * @returns Encodes the object and returns a shared reference the encoder's internal buffer.
   */
  encodeSharedRef(object) {
    if (this.entered) {
      const instance = this.clone();
      return instance.encodeSharedRef(object);
    }
    try {
      this.entered = true;
      this.reinitializeState();
      this.doEncode(object, 1);
      return this.bytes.subarray(0, this.pos);
    } finally {
      this.entered = false;
    }
  }
  /**
   * @returns Encodes the object and returns a copy of the encoder's internal buffer.
   */
  encode(object) {
    if (this.entered) {
      const instance = this.clone();
      return instance.encode(object);
    }
    try {
      this.entered = true;
      this.reinitializeState();
      this.doEncode(object, 1);
      return this.bytes.slice(0, this.pos);
    } finally {
      this.entered = false;
    }
  }
  doEncode(object, depth) {
    if (depth > this.maxDepth) {
      throw new Error(`Too deep objects in depth ${depth}`);
    }
    if (object == null) {
      this.encodeNil();
    } else if (typeof object === "boolean") {
      this.encodeBoolean(object);
    } else if (typeof object === "number") {
      if (!this.forceIntegerToFloat) {
        this.encodeNumber(object);
      } else {
        this.encodeNumberAsFloat(object);
      }
    } else if (typeof object === "string") {
      this.encodeString(object);
    } else if (this.useBigInt64 && typeof object === "bigint") {
      this.encodeBigInt64(object);
    } else {
      this.encodeObject(object, depth);
    }
  }
  ensureBufferSizeToWrite(sizeToWrite) {
    const requiredSize = this.pos + sizeToWrite;
    if (this.view.byteLength < requiredSize) {
      this.resizeBuffer(requiredSize * 2);
    }
  }
  resizeBuffer(newSize) {
    const newBuffer = new ArrayBuffer(newSize);
    const newBytes = new Uint8Array(newBuffer);
    const newView = new DataView(newBuffer);
    newBytes.set(this.bytes);
    this.view = newView;
    this.bytes = newBytes;
  }
  encodeNil() {
    this.writeU8(192);
  }
  encodeBoolean(object) {
    if (object === false) {
      this.writeU8(194);
    } else {
      this.writeU8(195);
    }
  }
  encodeNumber(object) {
    if (!this.forceIntegerToFloat && Number.isSafeInteger(object)) {
      if (object >= 0) {
        if (object < 128) {
          this.writeU8(object);
        } else if (object < 256) {
          this.writeU8(204);
          this.writeU8(object);
        } else if (object < 65536) {
          this.writeU8(205);
          this.writeU16(object);
        } else if (object < 4294967296) {
          this.writeU8(206);
          this.writeU32(object);
        } else if (!this.useBigInt64) {
          this.writeU8(207);
          this.writeU64(object);
        } else {
          this.encodeNumberAsFloat(object);
        }
      } else {
        if (object >= -32) {
          this.writeU8(224 | object + 32);
        } else if (object >= -128) {
          this.writeU8(208);
          this.writeI8(object);
        } else if (object >= -32768) {
          this.writeU8(209);
          this.writeI16(object);
        } else if (object >= -2147483648) {
          this.writeU8(210);
          this.writeI32(object);
        } else if (!this.useBigInt64) {
          this.writeU8(211);
          this.writeI64(object);
        } else {
          this.encodeNumberAsFloat(object);
        }
      }
    } else {
      this.encodeNumberAsFloat(object);
    }
  }
  encodeNumberAsFloat(object) {
    if (this.forceFloat32) {
      this.writeU8(202);
      this.writeF32(object);
    } else {
      this.writeU8(203);
      this.writeF64(object);
    }
  }
  encodeBigInt64(object) {
    if (object >= BigInt(0)) {
      this.writeU8(207);
      this.writeBigUint64(object);
    } else {
      this.writeU8(211);
      this.writeBigInt64(object);
    }
  }
  writeStringHeader(byteLength) {
    if (byteLength < 32) {
      this.writeU8(160 + byteLength);
    } else if (byteLength < 256) {
      this.writeU8(217);
      this.writeU8(byteLength);
    } else if (byteLength < 65536) {
      this.writeU8(218);
      this.writeU16(byteLength);
    } else if (byteLength < 4294967296) {
      this.writeU8(219);
      this.writeU32(byteLength);
    } else {
      throw new Error(`Too long string: ${byteLength} bytes in UTF-8`);
    }
  }
  encodeString(object) {
    const maxHeaderSize = 1 + 4;
    const byteLength = utf8Count(object);
    this.ensureBufferSizeToWrite(maxHeaderSize + byteLength);
    this.writeStringHeader(byteLength);
    utf8Encode(object, this.bytes, this.pos);
    this.pos += byteLength;
  }
  encodeObject(object, depth) {
    const ext = this.extensionCodec.tryToEncode(object, this.context);
    if (ext != null) {
      this.encodeExtension(ext);
    } else if (Array.isArray(object)) {
      this.encodeArray(object, depth);
    } else if (ArrayBuffer.isView(object)) {
      this.encodeBinary(object);
    } else if (typeof object === "object") {
      this.encodeMap(object, depth);
    } else {
      throw new Error(`Unrecognized object: ${Object.prototype.toString.apply(object)}`);
    }
  }
  encodeBinary(object) {
    const size = object.byteLength;
    if (size < 256) {
      this.writeU8(196);
      this.writeU8(size);
    } else if (size < 65536) {
      this.writeU8(197);
      this.writeU16(size);
    } else if (size < 4294967296) {
      this.writeU8(198);
      this.writeU32(size);
    } else {
      throw new Error(`Too large binary: ${size}`);
    }
    const bytes = ensureUint8Array(object);
    this.writeU8a(bytes);
  }
  encodeArray(object, depth) {
    const size = object.length;
    if (size < 16) {
      this.writeU8(144 + size);
    } else if (size < 65536) {
      this.writeU8(220);
      this.writeU16(size);
    } else if (size < 4294967296) {
      this.writeU8(221);
      this.writeU32(size);
    } else {
      throw new Error(`Too large array: ${size}`);
    }
    for (const item of object) {
      this.doEncode(item, depth + 1);
    }
  }
  countWithoutUndefined(object, keys) {
    let count = 0;
    for (const key of keys) {
      if (object[key] !== void 0) {
        count++;
      }
    }
    return count;
  }
  encodeMap(object, depth) {
    const keys = Object.keys(object);
    if (this.sortKeys) {
      keys.sort();
    }
    const size = this.ignoreUndefined ? this.countWithoutUndefined(object, keys) : keys.length;
    if (size < 16) {
      this.writeU8(128 + size);
    } else if (size < 65536) {
      this.writeU8(222);
      this.writeU16(size);
    } else if (size < 4294967296) {
      this.writeU8(223);
      this.writeU32(size);
    } else {
      throw new Error(`Too large map object: ${size}`);
    }
    for (const key of keys) {
      const value = object[key];
      if (!(this.ignoreUndefined && value === void 0)) {
        this.encodeString(key);
        this.doEncode(value, depth + 1);
      }
    }
  }
  encodeExtension(ext) {
    if (typeof ext.data === "function") {
      const data = ext.data(this.pos + 6);
      const size2 = data.length;
      if (size2 >= 4294967296) {
        throw new Error(`Too large extension object: ${size2}`);
      }
      this.writeU8(201);
      this.writeU32(size2);
      this.writeI8(ext.type);
      this.writeU8a(data);
      return;
    }
    const size = ext.data.length;
    if (size === 1) {
      this.writeU8(212);
    } else if (size === 2) {
      this.writeU8(213);
    } else if (size === 4) {
      this.writeU8(214);
    } else if (size === 8) {
      this.writeU8(215);
    } else if (size === 16) {
      this.writeU8(216);
    } else if (size < 256) {
      this.writeU8(199);
      this.writeU8(size);
    } else if (size < 65536) {
      this.writeU8(200);
      this.writeU16(size);
    } else if (size < 4294967296) {
      this.writeU8(201);
      this.writeU32(size);
    } else {
      throw new Error(`Too large extension object: ${size}`);
    }
    this.writeI8(ext.type);
    this.writeU8a(ext.data);
  }
  writeU8(value) {
    this.ensureBufferSizeToWrite(1);
    this.view.setUint8(this.pos, value);
    this.pos++;
  }
  writeU8a(values) {
    const size = values.length;
    this.ensureBufferSizeToWrite(size);
    this.bytes.set(values, this.pos);
    this.pos += size;
  }
  writeI8(value) {
    this.ensureBufferSizeToWrite(1);
    this.view.setInt8(this.pos, value);
    this.pos++;
  }
  writeU16(value) {
    this.ensureBufferSizeToWrite(2);
    this.view.setUint16(this.pos, value);
    this.pos += 2;
  }
  writeI16(value) {
    this.ensureBufferSizeToWrite(2);
    this.view.setInt16(this.pos, value);
    this.pos += 2;
  }
  writeU32(value) {
    this.ensureBufferSizeToWrite(4);
    this.view.setUint32(this.pos, value);
    this.pos += 4;
  }
  writeI32(value) {
    this.ensureBufferSizeToWrite(4);
    this.view.setInt32(this.pos, value);
    this.pos += 4;
  }
  writeF32(value) {
    this.ensureBufferSizeToWrite(4);
    this.view.setFloat32(this.pos, value);
    this.pos += 4;
  }
  writeF64(value) {
    this.ensureBufferSizeToWrite(8);
    this.view.setFloat64(this.pos, value);
    this.pos += 8;
  }
  writeU64(value) {
    this.ensureBufferSizeToWrite(8);
    setUint64(this.view, this.pos, value);
    this.pos += 8;
  }
  writeI64(value) {
    this.ensureBufferSizeToWrite(8);
    setInt64(this.view, this.pos, value);
    this.pos += 8;
  }
  writeBigUint64(value) {
    this.ensureBufferSizeToWrite(8);
    this.view.setBigUint64(this.pos, value);
    this.pos += 8;
  }
  writeBigInt64(value) {
    this.ensureBufferSizeToWrite(8);
    this.view.setBigInt64(this.pos, value);
    this.pos += 8;
  }
};

// node_modules/@msgpack/msgpack/dist.esm/encode.mjs
function encode(value, options) {
  const encoder = new Encoder(options);
  return encoder.encodeSharedRef(value);
}

// node_modules/@msgpack/msgpack/dist.esm/utils/prettyByte.mjs
function prettyByte(byte) {
  return `${byte < 0 ? "-" : ""}0x${Math.abs(byte).toString(16).padStart(2, "0")}`;
}

// node_modules/@msgpack/msgpack/dist.esm/CachedKeyDecoder.mjs
var DEFAULT_MAX_KEY_LENGTH = 16;
var DEFAULT_MAX_LENGTH_PER_KEY = 16;
var CachedKeyDecoder = class {
  hit = 0;
  miss = 0;
  caches;
  maxKeyLength;
  maxLengthPerKey;
  constructor(maxKeyLength = DEFAULT_MAX_KEY_LENGTH, maxLengthPerKey = DEFAULT_MAX_LENGTH_PER_KEY) {
    this.maxKeyLength = maxKeyLength;
    this.maxLengthPerKey = maxLengthPerKey;
    this.caches = [];
    for (let i = 0; i < this.maxKeyLength; i++) {
      this.caches.push([]);
    }
  }
  canBeCached(byteLength) {
    return byteLength > 0 && byteLength <= this.maxKeyLength;
  }
  find(bytes, inputOffset, byteLength) {
    const records = this.caches[byteLength - 1];
    FIND_CHUNK: for (const record of records) {
      const recordBytes = record.bytes;
      for (let j = 0; j < byteLength; j++) {
        if (recordBytes[j] !== bytes[inputOffset + j]) {
          continue FIND_CHUNK;
        }
      }
      return record.str;
    }
    return null;
  }
  store(bytes, value) {
    const records = this.caches[bytes.length - 1];
    const record = { bytes, str: value };
    if (records.length >= this.maxLengthPerKey) {
      records[Math.random() * records.length | 0] = record;
    } else {
      records.push(record);
    }
  }
  decode(bytes, inputOffset, byteLength) {
    const cachedValue = this.find(bytes, inputOffset, byteLength);
    if (cachedValue != null) {
      this.hit++;
      return cachedValue;
    }
    this.miss++;
    const str = utf8DecodeJs(bytes, inputOffset, byteLength);
    const slicedCopyOfBytes = Uint8Array.prototype.slice.call(bytes, inputOffset, inputOffset + byteLength);
    this.store(slicedCopyOfBytes, str);
    return str;
  }
};

// node_modules/@msgpack/msgpack/dist.esm/Decoder.mjs
var STATE_ARRAY = "array";
var STATE_MAP_KEY = "map_key";
var STATE_MAP_VALUE = "map_value";
var mapKeyConverter = (key) => {
  if (typeof key === "string" || typeof key === "number") {
    return key;
  }
  throw new DecodeError("The type of key must be string or number but " + typeof key);
};
var StackPool = class {
  stack = [];
  stackHeadPosition = -1;
  get length() {
    return this.stackHeadPosition + 1;
  }
  top() {
    return this.stack[this.stackHeadPosition];
  }
  pushArrayState(size) {
    const state = this.getUninitializedStateFromPool();
    state.type = STATE_ARRAY;
    state.position = 0;
    state.size = size;
    state.array = new Array(size);
  }
  pushMapState(size) {
    const state = this.getUninitializedStateFromPool();
    state.type = STATE_MAP_KEY;
    state.readCount = 0;
    state.size = size;
    state.map = {};
  }
  getUninitializedStateFromPool() {
    this.stackHeadPosition++;
    if (this.stackHeadPosition === this.stack.length) {
      const partialState = {
        type: void 0,
        size: 0,
        array: void 0,
        position: 0,
        readCount: 0,
        map: void 0,
        key: null
      };
      this.stack.push(partialState);
    }
    return this.stack[this.stackHeadPosition];
  }
  release(state) {
    const topStackState = this.stack[this.stackHeadPosition];
    if (topStackState !== state) {
      throw new Error("Invalid stack state. Released state is not on top of the stack.");
    }
    if (state.type === STATE_ARRAY) {
      const partialState = state;
      partialState.size = 0;
      partialState.array = void 0;
      partialState.position = 0;
      partialState.type = void 0;
    }
    if (state.type === STATE_MAP_KEY || state.type === STATE_MAP_VALUE) {
      const partialState = state;
      partialState.size = 0;
      partialState.map = void 0;
      partialState.readCount = 0;
      partialState.type = void 0;
    }
    this.stackHeadPosition--;
  }
  reset() {
    this.stack.length = 0;
    this.stackHeadPosition = -1;
  }
};
var HEAD_BYTE_REQUIRED = -1;
var EMPTY_VIEW = new DataView(new ArrayBuffer(0));
var EMPTY_BYTES = new Uint8Array(EMPTY_VIEW.buffer);
try {
  EMPTY_VIEW.getInt8(0);
} catch (e) {
  if (!(e instanceof RangeError)) {
    throw new Error("This module is not supported in the current JavaScript engine because DataView does not throw RangeError on out-of-bounds access");
  }
}
var MORE_DATA = new RangeError("Insufficient data");
var sharedCachedKeyDecoder = new CachedKeyDecoder();
var Decoder = class _Decoder {
  extensionCodec;
  context;
  useBigInt64;
  rawStrings;
  maxStrLength;
  maxBinLength;
  maxArrayLength;
  maxMapLength;
  maxExtLength;
  keyDecoder;
  mapKeyConverter;
  totalPos = 0;
  pos = 0;
  view = EMPTY_VIEW;
  bytes = EMPTY_BYTES;
  headByte = HEAD_BYTE_REQUIRED;
  stack = new StackPool();
  entered = false;
  constructor(options) {
    this.extensionCodec = options?.extensionCodec ?? ExtensionCodec.defaultCodec;
    this.context = options?.context;
    this.useBigInt64 = options?.useBigInt64 ?? false;
    this.rawStrings = options?.rawStrings ?? false;
    this.maxStrLength = options?.maxStrLength ?? UINT32_MAX;
    this.maxBinLength = options?.maxBinLength ?? UINT32_MAX;
    this.maxArrayLength = options?.maxArrayLength ?? UINT32_MAX;
    this.maxMapLength = options?.maxMapLength ?? UINT32_MAX;
    this.maxExtLength = options?.maxExtLength ?? UINT32_MAX;
    this.keyDecoder = options?.keyDecoder !== void 0 ? options.keyDecoder : sharedCachedKeyDecoder;
    this.mapKeyConverter = options?.mapKeyConverter ?? mapKeyConverter;
  }
  clone() {
    return new _Decoder({
      extensionCodec: this.extensionCodec,
      context: this.context,
      useBigInt64: this.useBigInt64,
      rawStrings: this.rawStrings,
      maxStrLength: this.maxStrLength,
      maxBinLength: this.maxBinLength,
      maxArrayLength: this.maxArrayLength,
      maxMapLength: this.maxMapLength,
      maxExtLength: this.maxExtLength,
      keyDecoder: this.keyDecoder
    });
  }
  reinitializeState() {
    this.totalPos = 0;
    this.headByte = HEAD_BYTE_REQUIRED;
    this.stack.reset();
  }
  setBuffer(buffer) {
    const bytes = ensureUint8Array(buffer);
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    this.pos = 0;
  }
  appendBuffer(buffer) {
    if (this.headByte === HEAD_BYTE_REQUIRED && !this.hasRemaining(1)) {
      this.setBuffer(buffer);
    } else {
      const remainingData = this.bytes.subarray(this.pos);
      const newData = ensureUint8Array(buffer);
      const newBuffer = new Uint8Array(remainingData.length + newData.length);
      newBuffer.set(remainingData);
      newBuffer.set(newData, remainingData.length);
      this.setBuffer(newBuffer);
    }
  }
  hasRemaining(size) {
    return this.view.byteLength - this.pos >= size;
  }
  createExtraByteError(posToShow) {
    const { view, pos } = this;
    return new RangeError(`Extra ${view.byteLength - pos} of ${view.byteLength} byte(s) found at buffer[${posToShow}]`);
  }
  /**
   * @throws {@link DecodeError}
   * @throws {@link RangeError}
   */
  decode(buffer) {
    if (this.entered) {
      const instance = this.clone();
      return instance.decode(buffer);
    }
    try {
      this.entered = true;
      this.reinitializeState();
      this.setBuffer(buffer);
      const object = this.doDecodeSync();
      if (this.hasRemaining(1)) {
        throw this.createExtraByteError(this.pos);
      }
      return object;
    } finally {
      this.entered = false;
    }
  }
  *decodeMulti(buffer) {
    if (this.entered) {
      const instance = this.clone();
      yield* instance.decodeMulti(buffer);
      return;
    }
    try {
      this.entered = true;
      this.reinitializeState();
      this.setBuffer(buffer);
      while (this.hasRemaining(1)) {
        yield this.doDecodeSync();
      }
    } finally {
      this.entered = false;
    }
  }
  async decodeAsync(stream) {
    if (this.entered) {
      const instance = this.clone();
      return instance.decodeAsync(stream);
    }
    try {
      this.entered = true;
      let decoded = false;
      let object;
      for await (const buffer of stream) {
        if (decoded) {
          this.entered = false;
          throw this.createExtraByteError(this.totalPos);
        }
        this.appendBuffer(buffer);
        try {
          object = this.doDecodeSync();
          decoded = true;
        } catch (e) {
          if (!(e instanceof RangeError)) {
            throw e;
          }
        }
        this.totalPos += this.pos;
      }
      if (decoded) {
        if (this.hasRemaining(1)) {
          throw this.createExtraByteError(this.totalPos);
        }
        return object;
      }
      const { headByte, pos, totalPos } = this;
      throw new RangeError(`Insufficient data in parsing ${prettyByte(headByte)} at ${totalPos} (${pos} in the current buffer)`);
    } finally {
      this.entered = false;
    }
  }
  decodeArrayStream(stream) {
    return this.decodeMultiAsync(stream, true);
  }
  decodeStream(stream) {
    return this.decodeMultiAsync(stream, false);
  }
  async *decodeMultiAsync(stream, isArray) {
    if (this.entered) {
      const instance = this.clone();
      yield* instance.decodeMultiAsync(stream, isArray);
      return;
    }
    try {
      this.entered = true;
      let isArrayHeaderRequired = isArray;
      let arrayItemsLeft = -1;
      for await (const buffer of stream) {
        if (isArray && arrayItemsLeft === 0) {
          throw this.createExtraByteError(this.totalPos);
        }
        this.appendBuffer(buffer);
        if (isArrayHeaderRequired) {
          arrayItemsLeft = this.readArraySize();
          isArrayHeaderRequired = false;
          this.complete();
        }
        try {
          while (true) {
            yield this.doDecodeSync();
            if (--arrayItemsLeft === 0) {
              break;
            }
          }
        } catch (e) {
          if (!(e instanceof RangeError)) {
            throw e;
          }
        }
        this.totalPos += this.pos;
      }
    } finally {
      this.entered = false;
    }
  }
  doDecodeSync() {
    DECODE: while (true) {
      const headByte = this.readHeadByte();
      let object;
      if (headByte >= 224) {
        object = headByte - 256;
      } else if (headByte < 192) {
        if (headByte < 128) {
          object = headByte;
        } else if (headByte < 144) {
          const size = headByte - 128;
          if (size !== 0) {
            this.pushMapState(size);
            this.complete();
            continue DECODE;
          } else {
            object = {};
          }
        } else if (headByte < 160) {
          const size = headByte - 144;
          if (size !== 0) {
            this.pushArrayState(size);
            this.complete();
            continue DECODE;
          } else {
            object = [];
          }
        } else {
          const byteLength = headByte - 160;
          object = this.decodeString(byteLength, 0);
        }
      } else if (headByte === 192) {
        object = null;
      } else if (headByte === 194) {
        object = false;
      } else if (headByte === 195) {
        object = true;
      } else if (headByte === 202) {
        object = this.readF32();
      } else if (headByte === 203) {
        object = this.readF64();
      } else if (headByte === 204) {
        object = this.readU8();
      } else if (headByte === 205) {
        object = this.readU16();
      } else if (headByte === 206) {
        object = this.readU32();
      } else if (headByte === 207) {
        if (this.useBigInt64) {
          object = this.readU64AsBigInt();
        } else {
          object = this.readU64();
        }
      } else if (headByte === 208) {
        object = this.readI8();
      } else if (headByte === 209) {
        object = this.readI16();
      } else if (headByte === 210) {
        object = this.readI32();
      } else if (headByte === 211) {
        if (this.useBigInt64) {
          object = this.readI64AsBigInt();
        } else {
          object = this.readI64();
        }
      } else if (headByte === 217) {
        const byteLength = this.lookU8();
        object = this.decodeString(byteLength, 1);
      } else if (headByte === 218) {
        const byteLength = this.lookU16();
        object = this.decodeString(byteLength, 2);
      } else if (headByte === 219) {
        const byteLength = this.lookU32();
        object = this.decodeString(byteLength, 4);
      } else if (headByte === 220) {
        const size = this.readU16();
        if (size !== 0) {
          this.pushArrayState(size);
          this.complete();
          continue DECODE;
        } else {
          object = [];
        }
      } else if (headByte === 221) {
        const size = this.readU32();
        if (size !== 0) {
          this.pushArrayState(size);
          this.complete();
          continue DECODE;
        } else {
          object = [];
        }
      } else if (headByte === 222) {
        const size = this.readU16();
        if (size !== 0) {
          this.pushMapState(size);
          this.complete();
          continue DECODE;
        } else {
          object = {};
        }
      } else if (headByte === 223) {
        const size = this.readU32();
        if (size !== 0) {
          this.pushMapState(size);
          this.complete();
          continue DECODE;
        } else {
          object = {};
        }
      } else if (headByte === 196) {
        const size = this.lookU8();
        object = this.decodeBinary(size, 1);
      } else if (headByte === 197) {
        const size = this.lookU16();
        object = this.decodeBinary(size, 2);
      } else if (headByte === 198) {
        const size = this.lookU32();
        object = this.decodeBinary(size, 4);
      } else if (headByte === 212) {
        object = this.decodeExtension(1, 0);
      } else if (headByte === 213) {
        object = this.decodeExtension(2, 0);
      } else if (headByte === 214) {
        object = this.decodeExtension(4, 0);
      } else if (headByte === 215) {
        object = this.decodeExtension(8, 0);
      } else if (headByte === 216) {
        object = this.decodeExtension(16, 0);
      } else if (headByte === 199) {
        const size = this.lookU8();
        object = this.decodeExtension(size, 1);
      } else if (headByte === 200) {
        const size = this.lookU16();
        object = this.decodeExtension(size, 2);
      } else if (headByte === 201) {
        const size = this.lookU32();
        object = this.decodeExtension(size, 4);
      } else {
        throw new DecodeError(`Unrecognized type byte: ${prettyByte(headByte)}`);
      }
      this.complete();
      const stack = this.stack;
      while (stack.length > 0) {
        const state = stack.top();
        if (state.type === STATE_ARRAY) {
          state.array[state.position] = object;
          state.position++;
          if (state.position === state.size) {
            object = state.array;
            stack.release(state);
          } else {
            continue DECODE;
          }
        } else if (state.type === STATE_MAP_KEY) {
          if (object === "__proto__") {
            throw new DecodeError("The key __proto__ is not allowed");
          }
          state.key = this.mapKeyConverter(object);
          state.type = STATE_MAP_VALUE;
          continue DECODE;
        } else {
          state.map[state.key] = object;
          state.readCount++;
          if (state.readCount === state.size) {
            object = state.map;
            stack.release(state);
          } else {
            state.key = null;
            state.type = STATE_MAP_KEY;
            continue DECODE;
          }
        }
      }
      return object;
    }
  }
  readHeadByte() {
    if (this.headByte === HEAD_BYTE_REQUIRED) {
      this.headByte = this.readU8();
    }
    return this.headByte;
  }
  complete() {
    this.headByte = HEAD_BYTE_REQUIRED;
  }
  readArraySize() {
    const headByte = this.readHeadByte();
    switch (headByte) {
      case 220:
        return this.readU16();
      case 221:
        return this.readU32();
      default: {
        if (headByte < 160) {
          return headByte - 144;
        } else {
          throw new DecodeError(`Unrecognized array type byte: ${prettyByte(headByte)}`);
        }
      }
    }
  }
  pushMapState(size) {
    if (size > this.maxMapLength) {
      throw new DecodeError(`Max length exceeded: map length (${size}) > maxMapLengthLength (${this.maxMapLength})`);
    }
    this.stack.pushMapState(size);
  }
  pushArrayState(size) {
    if (size > this.maxArrayLength) {
      throw new DecodeError(`Max length exceeded: array length (${size}) > maxArrayLength (${this.maxArrayLength})`);
    }
    this.stack.pushArrayState(size);
  }
  decodeString(byteLength, headerOffset) {
    if (!this.rawStrings || this.stateIsMapKey()) {
      return this.decodeUtf8String(byteLength, headerOffset);
    }
    return this.decodeBinary(byteLength, headerOffset);
  }
  /**
   * @throws {@link RangeError}
   */
  decodeUtf8String(byteLength, headerOffset) {
    if (byteLength > this.maxStrLength) {
      throw new DecodeError(`Max length exceeded: UTF-8 byte length (${byteLength}) > maxStrLength (${this.maxStrLength})`);
    }
    if (this.bytes.byteLength < this.pos + headerOffset + byteLength) {
      throw MORE_DATA;
    }
    const offset = this.pos + headerOffset;
    let object;
    if (this.stateIsMapKey() && this.keyDecoder?.canBeCached(byteLength)) {
      object = this.keyDecoder.decode(this.bytes, offset, byteLength);
    } else {
      object = utf8Decode(this.bytes, offset, byteLength);
    }
    this.pos += headerOffset + byteLength;
    return object;
  }
  stateIsMapKey() {
    if (this.stack.length > 0) {
      const state = this.stack.top();
      return state.type === STATE_MAP_KEY;
    }
    return false;
  }
  /**
   * @throws {@link RangeError}
   */
  decodeBinary(byteLength, headOffset) {
    if (byteLength > this.maxBinLength) {
      throw new DecodeError(`Max length exceeded: bin length (${byteLength}) > maxBinLength (${this.maxBinLength})`);
    }
    if (!this.hasRemaining(byteLength + headOffset)) {
      throw MORE_DATA;
    }
    const offset = this.pos + headOffset;
    const object = this.bytes.subarray(offset, offset + byteLength);
    this.pos += headOffset + byteLength;
    return object;
  }
  decodeExtension(size, headOffset) {
    if (size > this.maxExtLength) {
      throw new DecodeError(`Max length exceeded: ext length (${size}) > maxExtLength (${this.maxExtLength})`);
    }
    const extType = this.view.getInt8(this.pos + headOffset);
    const data = this.decodeBinary(
      size,
      headOffset + 1
      /* extType */
    );
    return this.extensionCodec.decode(data, extType, this.context);
  }
  lookU8() {
    return this.view.getUint8(this.pos);
  }
  lookU16() {
    return this.view.getUint16(this.pos);
  }
  lookU32() {
    return this.view.getUint32(this.pos);
  }
  readU8() {
    const value = this.view.getUint8(this.pos);
    this.pos++;
    return value;
  }
  readI8() {
    const value = this.view.getInt8(this.pos);
    this.pos++;
    return value;
  }
  readU16() {
    const value = this.view.getUint16(this.pos);
    this.pos += 2;
    return value;
  }
  readI16() {
    const value = this.view.getInt16(this.pos);
    this.pos += 2;
    return value;
  }
  readU32() {
    const value = this.view.getUint32(this.pos);
    this.pos += 4;
    return value;
  }
  readI32() {
    const value = this.view.getInt32(this.pos);
    this.pos += 4;
    return value;
  }
  readU64() {
    const value = getUint64(this.view, this.pos);
    this.pos += 8;
    return value;
  }
  readI64() {
    const value = getInt64(this.view, this.pos);
    this.pos += 8;
    return value;
  }
  readU64AsBigInt() {
    const value = this.view.getBigUint64(this.pos);
    this.pos += 8;
    return value;
  }
  readI64AsBigInt() {
    const value = this.view.getBigInt64(this.pos);
    this.pos += 8;
    return value;
  }
  readF32() {
    const value = this.view.getFloat32(this.pos);
    this.pos += 4;
    return value;
  }
  readF64() {
    const value = this.view.getFloat64(this.pos);
    this.pos += 8;
    return value;
  }
};

// node_modules/@msgpack/msgpack/dist.esm/decode.mjs
function decode(buffer, options) {
  const decoder = new Decoder(options);
  return decoder.decode(buffer);
}

// node_modules/@sovereignbase/station-client/dist/index.js
var StationClient = class {
  eventTarget = new EventTarget();
  lockName;
  channelName;
  webSocketUrl;
  instanceId = self.crypto.randomUUID();
  onlineHandler = () => {
    void this.opportunisticConnect();
  };
  broadcastChannel = null;
  webSocket = null;
  isLeader = false;
  isClosed = false;
  isConnecting = false;
  outboundQueue = [];
  pendingTransacts = /* @__PURE__ */ new Map();
  pendingTransactTargets = /* @__PURE__ */ new Map();
  /**
   * Initializes a new {@link StationClient} instance.
   *
   * @param webSocketUrl The base station WebSocket URL. When omitted, the instance operates in local-only mode.
   */
  constructor(webSocketUrl = "") {
    this.webSocketUrl = webSocketUrl;
    this.channelName = `origin-channel-lock::${this.webSocketUrl}`;
    this.lockName = `origin-channel-lock::${this.webSocketUrl}`;
    this.broadcastChannel = new BroadcastChannel(this.channelName);
    this.broadcastChannel.onmessage = (event) => {
      const envelope = event.data;
      if (!envelope) return;
      if (envelope.kind === "relay") {
        this.eventTarget.dispatchEvent(
          new CustomEvent("message", { detail: envelope.message })
        );
        if (!this.isLeader) return;
        this.sendToStation(envelope.message);
        return;
      }
      if (envelope.kind === "transact-response") {
        if (envelope.target !== this.instanceId) return;
        const pending = this.pendingTransacts.get(envelope.id);
        if (!pending) return;
        this.pendingTransacts.delete(envelope.id);
        pending.cleanup();
        pending.resolve(envelope.message);
        return;
      }
      if (envelope.kind === "transact-abort") {
        if (!this.isLeader) return;
        const pendingTarget2 = this.pendingTransactTargets.get(envelope.id);
        if (pendingTarget2) clearTimeout(pendingTarget2.timeoutId);
        this.pendingTransactTargets.delete(envelope.id);
        return;
      }
      if (!this.isLeader) return;
      if (!this.webSocketUrl || self.navigator.onLine !== true || !this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
        this.broadcastChannel?.postMessage({
          kind: "transact-response",
          id: envelope.id,
          target: envelope.source,
          message: false
        });
        return;
      }
      const pendingTarget = this.pendingTransactTargets.get(envelope.id);
      if (pendingTarget) clearTimeout(pendingTarget.timeoutId);
      this.pendingTransactTargets.set(envelope.id, {
        target: envelope.source,
        timeoutId: setTimeout(() => {
          this.pendingTransactTargets.delete(envelope.id);
        }, envelope.ttlMs ?? 3e4)
      });
      this.sendToStation([
        "station-client-request",
        envelope.id,
        envelope.message
      ]);
    };
    if (this.webSocketUrl && navigator.onLine) void this.opportunisticConnect();
    if (this.webSocketUrl) {
      self.addEventListener("online", this.onlineHandler);
    }
  }
  /**main methods*/
  /**
   * Broadcasts a message to other same-origin contexts and opportunistically forwards it to the base station.
   *
   * @param message The message to broadcast.
   */
  relay(message) {
    if (this.isClosed) return;
    this.broadcastChannel?.postMessage({ kind: "relay", message });
    this.sendToStation(message);
  }
  /**
   * Sends a request to the base station and resolves with the corresponding response message.
   *
   * @param message The message to send.
   * @param options Options that control cancellation and stale follower cleanup.
   * @returns A promise that resolves with the response message, or `false` when the request cannot be issued.
   */
  transact(message, options = {}) {
    if (this.isClosed) return Promise.resolve(false);
    const id = self.crypto.randomUUID();
    const { signal, ttlMs } = options;
    return new Promise((resolve, reject) => {
      const abortReason = () => signal?.reason ?? new DOMException("The operation was aborted.", "AbortError");
      if (signal?.aborted) {
        reject(abortReason());
        return;
      }
      if (!this.webSocketUrl || self.navigator.onLine !== true) {
        resolve(false);
        return;
      }
      if (this.isLeader && (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN)) {
        resolve(false);
        return;
      }
      const handleAbort = () => {
        this.pendingTransacts.delete(id);
        const pendingTarget = this.pendingTransactTargets.get(id);
        if (pendingTarget) clearTimeout(pendingTarget.timeoutId);
        this.pendingTransactTargets.delete(id);
        signal?.removeEventListener("abort", handleAbort);
        if (!this.isLeader) {
          this.broadcastChannel?.postMessage({ kind: "transact-abort", id });
        }
        reject(abortReason());
      };
      this.pendingTransacts.set(id, {
        resolve,
        reject,
        cleanup: () => {
          signal?.removeEventListener("abort", handleAbort);
        }
      });
      signal?.addEventListener("abort", handleAbort, { once: true });
      if (this.isLeader) {
        this.sendToStation(["station-client-request", id, message]);
        return;
      }
      this.broadcastChannel?.postMessage({
        kind: "transact",
        id,
        source: this.instanceId,
        ttlMs,
        message
      });
    });
  }
  /**
   * Closes the client and releases its local and remote resources.
   */
  close() {
    const wasLeader = this.isLeader;
    const broadcastChannel = this.broadcastChannel;
    this.isClosed = true;
    self.removeEventListener("online", this.onlineHandler);
    if (!wasLeader) {
      for (const id of this.pendingTransacts.keys()) {
        try {
          broadcastChannel?.postMessage({ kind: "transact-abort", id });
        } catch {
        }
      }
    }
    try {
      broadcastChannel?.close();
    } catch {
    }
    try {
      this.webSocket?.close(1e3, "closed");
    } catch {
    }
    this.broadcastChannel = null;
    this.webSocket = null;
    this.isLeader = false;
    this.outboundQueue.length = 0;
    for (const pending of this.pendingTransacts.values()) {
      pending.cleanup();
      pending.reject(new Error("Station client closed"));
    }
    this.pendingTransacts.clear();
    for (const pendingTarget of this.pendingTransactTargets.values()) {
      clearTimeout(pendingTarget.timeoutId);
    }
    this.pendingTransactTargets.clear();
  }
  /**listeners*/
  /**
   * Appends an event listener for events whose type attribute value is `type`.
   *
   * @param type The event type to listen for.
   * @param listener The callback that receives the event.
   * @param options An options object that specifies characteristics about the event listener.
   */
  addEventListener(type, listener, options) {
    this.eventTarget.addEventListener(
      type,
      listener,
      options
    );
  }
  /**
   * Removes an event listener previously registered with {@link addEventListener}.
   *
   * @param type The event type to remove.
   * @param listener The callback to remove.
   * @param options An options object that specifies characteristics about the event listener.
   */
  removeEventListener(type, listener, options) {
    this.eventTarget.removeEventListener(
      type,
      listener,
      options
    );
  }
  /**helpers*/
  sendToStation(message) {
    if (!this.isLeader || !this.webSocketUrl) return;
    if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
      if (self.navigator.onLine) {
        if (this.outboundQueue.length >= 64) this.outboundQueue.shift();
        this.outboundQueue.push(message);
      }
      return;
    }
    try {
      this.webSocket.send(encode(message));
    } catch {
    }
  }
  flushOutboundQueue() {
    if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) return;
    while (this.outboundQueue.length > 0) {
      const message = this.outboundQueue.shift();
      if (!message) continue;
      try {
        this.webSocket.send(encode(message));
      } catch {
        this.outboundQueue.unshift(message);
        return;
      }
    }
  }
  async opportunisticConnect() {
    if (this.isClosed || this.isConnecting || !this.webSocketUrl) return;
    if (!self.navigator.locks) return;
    this.isConnecting = true;
    try {
      while (!this.isClosed) {
        if (self.navigator.onLine !== true) return;
        await self.navigator.locks.request(
          this.lockName,
          { ifAvailable: true },
          async (lockHandle) => {
            if (!lockHandle || this.isClosed) return;
            this.isLeader = true;
            let socket;
            try {
              socket = new WebSocket(this.webSocketUrl);
            } catch {
              this.isLeader = false;
              this.webSocket = null;
              return;
            }
            socket.binaryType = "arraybuffer";
            this.webSocket = socket;
            socket.onopen = () => {
              this.flushOutboundQueue();
            };
            socket.onmessage = (event) => {
              const message = decode(event.data);
              if (!message) return;
              if (Array.isArray(message) && message[0] === "station-client-response" && typeof message[1] === "string") {
                const id = message[1];
                const pendingTarget = this.pendingTransactTargets.get(id);
                if (pendingTarget) {
                  clearTimeout(pendingTarget.timeoutId);
                  this.pendingTransactTargets.delete(id);
                  this.broadcastChannel?.postMessage({
                    kind: "transact-response",
                    id,
                    target: pendingTarget.target,
                    message: message[2]
                  });
                  return;
                }
                const pending = this.pendingTransacts.get(id);
                if (!pending) return;
                this.pendingTransacts.delete(id);
                pending.cleanup();
                pending.resolve(message[2]);
                return;
              }
              this.eventTarget.dispatchEvent(
                new CustomEvent("message", { detail: message })
              );
              this.broadcastChannel?.postMessage({
                kind: "relay",
                message
              });
            };
            socket.onclose = () => {
              if (this.webSocket === socket) this.webSocket = null;
              this.isLeader = false;
            };
            await new Promise((resolve) => {
              socket.addEventListener("close", () => resolve(), { once: true });
            });
            this.isLeader = false;
            if (this.webSocket === socket) this.webSocket = null;
          }
        );
        if (this.isClosed || self.navigator.onLine !== true) return;
        await new Promise((resolve) => setTimeout(resolve, 1e4));
      }
    } finally {
      this.isConnecting = false;
    }
  }
};

// in-browser-testing-libs.js
var station = new StationClient();
var snapshot = JSON.parse(localStorage.getItem("state")) ?? void 0;
var frontiers = JSON.parse(localStorage.getItem("frontiers")) ?? void 0;
var text = new CRText(snapshot);
if (frontiers) {
  void text.garbageCollect(frontiers);
}
text.addEventListener("snapshot", (ev) => {
  void localStorage.setItem("state", JSON.stringify(ev.detail));
});
text.addEventListener("ack", (ev) => {
  void localStorage.setItem("frontiers", JSON.stringify([ev.detail]));
});
var elements = [
  document.getElementById("textarea-element"),
  document.getElementById("input-element"),
  document.getElementById("html-element")
];
text.addEventListener("change", (event) => {
  for (const element of elements) {
    void ChangeStreamAdapter(event, element);
  }
  void text.snapshot();
  void text.acknowledge();
});
for (const element of elements) {
  element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? element.value = text : element.textContent = text;
  void element.addEventListener(
    "beforeinput",
    (event) => void BeforeInputStreamAdapter(event, text)
  );
}
text.addEventListener("delta", (ev) => {
  void station.relay(ev.detail);
});
station.addEventListener("message", (ev) => {
  void text.merge(ev.detail);
});
