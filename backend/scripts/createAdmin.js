#!/usr/bin/env node
/**
 * CyberSafe — Secure administrator creation script
 * -------------------------------------------------
 * Usage:
 *   node scripts/createAdmin.js <username>
 *   ADMIN_PASSWORD='...' node scripts/createAdmin.js <username>
 *   node scripts/createAdmin.js <username> <password>   (not recommended:
 *                                                        the password may
 *                                                        appear in shell history)
 *
 * What this script does:
 *   - Loads backend/.env
 *   - Requires Supabase (or PostgreSQL) to be configured
 *   - Checks whether the username already exists (case-insensitive)
 *   - Hashes the password with bcryptjs before saving it
 *   - Never prints the password or the hash
 *   - Only touches the specified administrator account
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const { supabase, pgPool, checkConnection } = require('../src/config/database');

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

function usage() {
  console.log(`
CyberSafe administrator creation

Usage:
  node scripts/createAdmin.js <username>
  ADMIN_PASSWORD='...' node scripts/createAdmin.js <username>

Examples:
  npm run create-admin -- adminpogi
  ADMIN_PASSWORD='...' npm run create-admin -- adminpogi

The script prompts for the password securely when it is not supplied
through the ADMIN_PASSWORD environment variable.
`);
}

function validateUsername(username) {
  if (!username) {
    throw new Error('A username is required.');
  }
  if (username.length < 3 || username.length > 100) {
    throw new Error('Username must be between 3 and 100 characters.');
  }
  if (!/^[A-Za-z0-9._-]+$/.test(username)) {
    throw new Error('Username may only contain letters, numbers, dots, underscores, and hyphens.');
  }
}

function escapeLikePattern(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

/**
 * Read a password without echoing it to the terminal.
 * Falls back to a normal readline prompt when stdin is not a TTY.
 */
function promptHidden(question) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
      const readline = require('readline');
      const rl = readline.createInterface({ input: stdin, output: stdout });
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
      return;
    }

    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let value = '';
    let settled = false;

    const cleanup = () => {
      if (settled) return;
      settled = true;
      stdin.removeListener('data', onData);
      if (typeof stdin.setRawMode === 'function') {
        stdin.setRawMode(false);
      }
      stdin.pause();
    };

    const finish = (callback, result) => {
      cleanup();
      stdout.write('\n');
      callback(result);
    };

    const onData = (chunk) => {
      for (const char of chunk.toString()) {
        if (char === '\n' || char === '\r' || char === '\u0004') {
          finish(resolve, value);
          return;
        }
        if (char === '\u0003') {
          finish(reject, new Error('Cancelled.'));
          return;
        }
        if (char === '\u007f' || char === '\b') {
          if (value.length > 0) {
            value = value.slice(0, -1);
            stdout.write('\b \b');
          }
          continue;
        }
        if (char >= ' ') {
          value += char;
          stdout.write('*');
        }
      }
    };

    stdin.on('data', onData);
  });
}

async function findExistingAdmin(username) {
  if (supabase) {
    const { data, error } = await supabase
      .from('admins')
      .select('id, username, password_hash')
      .ilike('username', escapeLikePattern(username))
      .limit(1);

    if (error) {
      throw new Error(`Could not query the admins table: ${error.message}`);
    }
    return data && data[0] ? data[0] : null;
  }

  if (pgPool) {
    const result = await pgPool.query(
      'SELECT id, username, password_hash FROM admins WHERE LOWER(username) = LOWER($1) LIMIT 1',
      [username]
    );
    return result.rows[0] || null;
  }

  throw new Error('No database client is configured.');
}

async function insertAdmin(username, passwordHash) {
  if (supabase) {
    const { data, error } = await supabase
      .from('admins')
      .insert([{ username, password_hash: passwordHash }])
      .select('id, username, created_at')
      .single();

    if (error) {
      throw new Error(`Could not create the administrator: ${error.message}`);
    }
    return data;
  }

  if (pgPool) {
    const result = await pgPool.query(
      'INSERT INTO admins (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, passwordHash]
    );
    return result.rows[0];
  }

  throw new Error('No database client is configured.');
}

async function updateAdminPassword(id, passwordHash) {
  if (supabase) {
    const { data, error } = await supabase
      .from('admins')
      .update({ password_hash: passwordHash })
      .eq('id', id)
      .select('id, username, created_at')
      .single();

    if (error) {
      throw new Error(`Could not update the administrator password: ${error.message}`);
    }
    return data;
  }

  if (pgPool) {
    const result = await pgPool.query(
      'UPDATE admins SET password_hash = $1 WHERE id = $2 RETURNING id, username, created_at',
      [passwordHash, id]
    );
    return result.rows[0];
  }

  throw new Error('No database client is configured.');
}

async function main() {
  const username = (process.argv[2] || process.env.ADMIN_USERNAME || '').trim();

  if (!username || username === '--help' || username === '-h') {
    usage();
    process.exit(username ? 0 : 1);
  }

  validateUsername(username);

  const connection = await checkConnection();
  if (!connection.ok) {
    console.error('❌ Database is not available.');
    console.error(`   ${connection.error || connection.message || 'Unknown database error'}`);
    console.error('   Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env,');
    console.error('   then run backend/schema.sql in the Supabase SQL Editor.');
    process.exit(1);
  }

  let password = process.argv[3] || process.env.ADMIN_PASSWORD || '';

  if (!password) {
    password = await promptHidden(`Password for "${username}": `);
    const confirmation = await promptHidden('Confirm password: ');
    if (password !== confirmation) {
      console.error('❌ Passwords do not match.');
      process.exit(1);
    }
  }

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters.');
    process.exit(1);
  }

  const existing = await findExistingAdmin(username);

  if (existing) {
    const samePassword = await bcrypt.compare(password, existing.password_hash);
    if (samePassword) {
      console.log(`ℹ️  Administrator "${existing.username}" already exists. Password unchanged.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await updateAdminPassword(existing.id, passwordHash);
    console.log(`✅ Administrator "${existing.username}" already existed. Password was updated securely.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const created = await insertAdmin(username, passwordHash);
  console.log(`✅ Administrator "${created.username}" was created successfully.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
