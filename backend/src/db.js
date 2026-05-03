import PouchDB from "pouchdb-node";
import { config } from "./config.js";

function buildDbTarget(name) {
  if (!config.useRemoteCouchdb) {
    return name;
  }

  return `${config.couchdbUrl}/${encodeURIComponent(name)}`;
}

const defaultOptions = {
  skip_setup: false,
};

const recordsDb = new PouchDB(buildDbTarget(config.recordsDbName), defaultOptions);
const authDb = new PouchDB(buildDbTarget(config.authDbName), defaultOptions);

export { PouchDB, recordsDb, authDb };
