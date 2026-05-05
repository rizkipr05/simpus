import PouchDB from "pouchdb-browser";
import pouchdbFind from "pouchdb-find";

PouchDB.plugin(pouchdbFind);

const LOCAL_DB_NAME = "simpus-local";

function normalizeUrl(value) {
  return value ? value.replace(/\/+$/, "") : "";
}

function isLoopbackHost(hostname) {
  return ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname);
}

function shouldIgnoreConfiguredUrl(value) {
  if (typeof window === "undefined" || !value || isLoopbackHost(window.location.hostname)) {
    return false;
  }

  try {
    return isLoopbackHost(new URL(value).hostname);
  } catch {
    return false;
  }
}

function getDefaultRemoteDbUrl(recordsDbName) {
  if (typeof window === "undefined") {
    return `http://localhost:4000/db/${encodeURIComponent(recordsDbName)}`;
  }

  const { protocol, hostname, origin } = window.location;
  if (isLoopbackHost(hostname)) {
    return `${protocol}//${hostname}:4000/db/${encodeURIComponent(recordsDbName)}`;
  }

  return `${origin}/couchdb/${encodeURIComponent(recordsDbName)}`;
}

function buildRemoteDbUrl() {
  const recordsDbName = import.meta.env.VITE_COUCHDB_DB_NAME || "simpus_records";
  const explicitRemoteUrl = normalizeUrl(import.meta.env.VITE_REMOTE_DB_URL || "");
  if (explicitRemoteUrl && !shouldIgnoreConfiguredUrl(explicitRemoteUrl)) {
    return explicitRemoteUrl;
  }

  const couchdbUrl = normalizeUrl(import.meta.env.VITE_COUCHDB_URL || "");

  if (couchdbUrl && !shouldIgnoreConfiguredUrl(couchdbUrl)) {
    return `${couchdbUrl}/${encodeURIComponent(recordsDbName)}`;
  }

  return getDefaultRemoteDbUrl(recordsDbName);
}

const REMOTE_DB_URL = buildRemoteDbUrl();

export const localDb = new PouchDB(LOCAL_DB_NAME);
export const remoteDb = new PouchDB(REMOTE_DB_URL, {
  skip_setup: false,
});

let indexesReady;

export async function ensureIndexes() {
  if (!indexesReady) {
    indexesReady = Promise.all([
      localDb.createIndex({ index: { fields: ["type", "updatedAt"] } }),
      localDb.createIndex({ index: { fields: ["type", "patientId", "updatedAt"] } }),
    ]);
  }

  await indexesReady;
}

export async function putDocument(doc) {
  const timestamp = new Date().toISOString();
  const payload = {
    ...doc,
    updatedAt: timestamp,
    createdAt: doc.createdAt || timestamp,
  };

  try {
    const current = await localDb.get(payload._id);
    const response = await localDb.put({ ...current, ...payload });
    return { ...payload, _rev: response.rev };
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
    const response = await localDb.put(payload);
    return { ...payload, _rev: response.rev };
  }
}

export async function listDocuments(type) {
  await ensureIndexes();
  const result = await localDb.find({
    selector: { type },
    sort: [{ type: "asc" }, { updatedAt: "desc" }],
  });
  return result.docs;
}

export async function listRecordsByPatient(patientId) {
  await ensureIndexes();
  const result = await localDb.find({
    selector: { type: "medical-record", patientId },
    sort: [{ type: "asc" }, { patientId: "asc" }, { updatedAt: "desc" }],
  });
  return result.docs;
}

export async function syncNow(onChange) {
  return new Promise((resolve, reject) => {
    localDb
      .sync(remoteDb, {
        live: false,
        retry: false,
        conflicts: true,
      })
      .on("change", (info) => {
        onChange?.(info);
      })
      .on("complete", resolve)
      .on("denied", (error) => {
        console.error("Sync denied", error);
      })
      .on("error", reject);
  });
}

export function watchContinuousSync(onChange, onError) {
  return localDb
    .sync(remoteDb, {
      live: true,
      retry: true,
      conflicts: true,
    })
    .on("change", (info) => {
      onChange?.(info);
    })
    .on("error", (error) => {
      console.error("Sinkronisasi error", error);
      onError?.(error);
    });
}
