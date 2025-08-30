// Wrapper to share a single Prisma Postgres DB instance
let dbPool = null;

function getDbPool() {
  if (dbPool) return dbPool;
  // prisma-postgres.js exports { createPool, createConnection }
  // This DB is cloud-based and initialized on first use
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const postgresDB = require('./prisma-postgres');
  dbPool = postgresDB.createPool();
  return dbPool;
}

module.exports = {
  getDbPool,
};

