const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
// The service role key is required for backend-only writes. Never expose it
// to the browser or use it in frontend code.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

let supabase = null;
let pgPool = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('[Database] Supabase client initialized.');
  } catch (err) {
    console.error('[Database] Failed to initialize Supabase client:', err.message);
  }
} else {
  console.warn('[Database] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not configured yet.');
}

if (databaseUrl && !databaseUrl.includes('your-project-ref')) {
  try {
    pgPool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });
    console.log('[Database] PostgreSQL Pool initialized.');
  } catch (err) {
    console.error('[Database] Failed to initialize PG Pool:', err.message);
  }
}

/**
 * Check connectivity to Supabase or PostgreSQL.
 *
 * This function performs a real query. It returns ok: false whenever the
 * query fails, so /api/health cannot report a false positive.
 */
async function checkConnection() {
  if (supabase) {
    try {
      // Verify connectivity and that the expected CyberSafe tables exist.
      for (const table of ['admins', 'modules', 'lessons']) {
        const { error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          return {
            ok: false,
            type: 'supabase',
            table,
            error: error.message,
            code: error.code || null
          };
        }
      }

      return {
        ok: true,
        type: 'supabase',
        message: 'Connected to Supabase successfully'
      };
    } catch (err) {
      return {
        ok: false,
        type: 'supabase',
        error: err.message
      };
    }
  }

  if (pgPool) {
    let client = null;
    try {
      client = await pgPool.connect();

      // Verify connectivity and that the expected CyberSafe tables exist.
      for (const table of ['admins', 'modules', 'lessons']) {
        await client.query(`SELECT 1 FROM ${table} LIMIT 1`);
      }

      return {
        ok: true,
        type: 'postgres',
        message: 'Connected to PostgreSQL successfully'
      };
    } catch (err) {
      return {
        ok: false,
        type: 'postgres',
        error: err.message
      };
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  return {
    ok: false,
    type: 'unconfigured',
    message: 'Supabase credentials are not configured in backend/.env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
  };
}

module.exports = {
  supabase,
  pgPool,
  checkConnection
};
