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
function __create(snapshot) {
  const crListReplica = {
    size: 0,
    cursor: void 0,
    tombstones: /* @__PURE__ */ new Set(),
    parentMap: /* @__PURE__ */ new Map(),
    childrenMap: /* @__PURE__ */ new Map()
  };
  if (!snapshot || prototype(snapshot) !== "record") return crListReplica;
  if (Object.hasOwn(snapshot, "tombstones") && Array.isArray(snapshot.tombstones)) {
    for (const tombstone of snapshot.tombstones) {
      if (crListReplica.tombstones.has(tombstone) || !isUuidV7(tombstone))
        continue;
      crListReplica.tombstones.add(tombstone);
    }
  }
  if (!Object.hasOwn(snapshot, "values") || !Array.isArray(snapshot.values))
    return crListReplica;
  for (const valueEntry of snapshot.values) {
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
      void newVals.push(existingEntry);
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
function __garbageCollect(frontiers, crListReplica) {
  if (!Array.isArray(frontiers)) return;
  frontiers.sort();
  const smallest = frontiers.find((frontier) => isUuidV7(frontier));
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
  constructor(snapshot) {
    Object.defineProperties(this, {
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
  garbageCollect(frontiers) {
    void __garbageCollect(frontiers, this.state);
  }
  /**
   * Emits the current detached structured-clone-compatible list snapshot.
   */
  snapshot() {
    const snapshot = __snapshot(this.state);
    if (snapshot)
      void this.eventTarget.dispatchEvent(
        new CustomEvent("snapshot", { detail: snapshot })
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
  constructor(snapshot) {
    Object.defineProperties(this, {
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
   * The current number of characters.
   */
  get size() {
    return this.state.size;
  }
  /**
   *
   * @param index
   * @param chars
   * @returns
   */
  insertAfter(index, characters) {
    if (typeof index !== "number" || typeof characters !== "string")
      throw new CRTextError(
        "BAD_PARAMS",
        "`index` must be typeof number and `characters` must be typeof string."
      );
    const result = __update(
      index,
      transformStringToGraphemeArray(characters),
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
   *
   * @param index
   * @param removeCount
   * @returns
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
  valueOf() {
    return [...this].join("");
  }
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
  beforeRange.selectNodeContents(el);
  beforeRange.setEnd(range.startContainer, range.startOffset);
  const selectionStart = beforeRange.toString().length;
  const selectionEnd = selectionStart + range.toString().length;
  return {
    selectionStart,
    selectionEnd
  };
}
function translateDOMEvent(ev) {
  const el = ev.target;
  if (!(el instanceof HTMLElement)) return false;
  const { selectionStart, selectionEnd } = getElementTextSelection(el);
  const characters = ev.dataTransfer?.getData("text/plain") ?? ev.data ?? "";
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
function InputStreamAdapter(beforeInputEvent, crText) {
  beforeInputEvent.preventDefault();
  const result = translateDOMEvent(beforeInputEvent);
  if (!result) return;
  const { insert, remove } = result;
  if (insert) {
    crText.insertAfter(insert.index, insert.characters);
  }
  if (remove) {
    crText.removeAfter(remove.index, remove.removeCount);
  }
}
function ChangeStreamAdapter(changeEvent, htmlElement) {
  console.log(changeEvent.detail);
  const textNode = htmlElement.firstChild instanceof Text ? htmlElement.firstChild : htmlElement.insertBefore(
    htmlElement.ownerDocument.createTextNode(""),
    htmlElement.firstChild
  );
  for (const [key, value] of Object.entries(changeEvent.detail)) {
    const index = Number(key);
    if (value === void 0) {
      textNode.deleteData(index, 1);
      continue;
    }
    if (typeof value === "string") {
      textNode.replaceData(index, 1, value);
      continue;
    }
  }
}

// in-browser-testing-libs.js
var text = new CRText();
var elements = Array.from(document.querySelectorAll("body > *")).slice(0, 3);
text.addEventListener("change", (event) => {
  for (const element of elements) {
    ChangeStreamAdapter(event, element);
  }
});
for (const element of elements) {
  element.addEventListener(
    "beforeinput",
    (event) => InputStreamAdapter(event, text)
  );
}
