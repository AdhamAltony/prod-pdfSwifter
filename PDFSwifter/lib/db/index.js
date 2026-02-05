import sql from 'mssql';

// Central DB connection helper moved from lib/tools/database.js
// If credentials/secrets need to be hidden, migrate them to env vars instead of hardcoding.
const config = {
  server: 'db31373.public.databaseasp.net',
  database: 'db31373',
  user: 'db31373',
  password: 'W@x8#b2HeP=6',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    multipleActiveResultSets: true,
  },
};

let pool;

export async function getConnection() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

export { sql };
