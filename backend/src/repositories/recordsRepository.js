import { recordsDb } from "../db.js";

function normalizeTimestamp(doc) {
  return new Date(doc.updatedAt || doc.createdAt || 0).getTime();
}

export async function listByType(type) {
  const result = await recordsDb.allDocs({ include_docs: true });
  return result.rows
    .map((row) => row.doc)
    .filter((doc) => doc?.type === type)
    .sort((a, b) => normalizeTimestamp(b) - normalizeTimestamp(a));
}

export async function getById(id) {
  return recordsDb.get(id);
}

export async function saveDocument(doc) {
  const timestamp = new Date().toISOString();

  try {
    const current = await recordsDb.get(doc._id);
    const merged =
      normalizeTimestamp(doc) >= normalizeTimestamp(current)
        ? { ...current, ...doc, updatedAt: timestamp }
        : { ...doc, ...current, updatedAt: current.updatedAt || timestamp };

    const response = await recordsDb.put(merged);
    return { ...merged, _rev: response.rev };
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }

    const created = {
      ...doc,
      createdAt: doc.createdAt || timestamp,
      updatedAt: doc.updatedAt || timestamp,
    };
    const response = await recordsDb.put(created);
    return { ...created, _rev: response.rev };
  }
}
