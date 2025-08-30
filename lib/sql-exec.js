// Wrapper to share a single in-memory virtual DB instance
let dbPool = null;

function getDbPool() {
  if (dbPool) return dbPool;
  // sqlite-db.js exports { createPool, createConnection }
  // This DB is in-memory and initialized on import
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sqliteDB = require('../sqlite-db');
  dbPool = sqliteDB.createPool();
  return dbPool;
}

module.exports = {
  getDbPool,
};

