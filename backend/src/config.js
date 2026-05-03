function normalizeUrl(value) {
  return value ? value.replace(/\/+$/, "") : "";
}

const couchdbUrl = normalizeUrl(process.env.COUCHDB_URL || "");
const recordsDbName = process.env.COUCHDB_RECORDS_DB || "simpus_records";
const authDbName = process.env.COUCHDB_AUTH_DB || "simpus_auth";

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "simpus-offline-secret",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  couchdbUrl,
  recordsDbName,
  authDbName,
  useRemoteCouchdb: Boolean(couchdbUrl),
};
