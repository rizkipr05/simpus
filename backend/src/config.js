function normalizeUrl(value) {
  return value ? value.replace(/\/+$/, "") : "";
}

function parseCorsOrigins(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const couchdbUrl = normalizeUrl(process.env.COUCHDB_URL || "");
const recordsDbName = process.env.COUCHDB_RECORDS_DB || "simpus_records";
const authDbName = process.env.COUCHDB_AUTH_DB || "simpus_auth";
const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGIN || "http://localhost:5173");

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "simpus-offline-secret",
  corsOrigins,
  couchdbUrl,
  recordsDbName,
  authDbName,
  useRemoteCouchdb: Boolean(couchdbUrl),
};
