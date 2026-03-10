import pg from 'pg';
import fs from 'fs';

// Supabase direct connection (pooler mode)
// Default password for Supabase projects - you may need to update this
const connectionString = `postgresql://postgres.rwssxtkrxkagpwpcilqp:${process.argv[2] || 'YOUR_DB_PASSWORD'}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');
    
    const sql = fs.readFileSync('supabase-migrations.sql', 'utf8');
    // Split on semicolons but be careful of function bodies
    const statements = [];
    let current = '';
    let inDollar = false;
    for (const line of sql.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('--')) continue;
      current += line + '\n';
      if (trimmed.includes('$$') && !inDollar) { inDollar = true; continue; }
      if (trimmed.includes('$$') && inDollar) { inDollar = false; }
      if (!inDollar && trimmed.endsWith(';')) {
        statements.push(current.trim());
        current = '';
      }
    }
    if (current.trim()) statements.push(current.trim());

    for (const stmt of statements) {
      if (!stmt || stmt === ';') continue;
      try {
        await client.query(stmt);
        console.log('OK:', stmt.substring(0, 70).replace(/\n/g,' '));
      } catch (e) {
        if (e.message.includes('already exists')) {
          console.log('SKIP (exists):', stmt.substring(0, 70).replace(/\n/g,' '));
        } else {
          console.error('ERR:', e.message, '\n  SQL:', stmt.substring(0, 100).replace(/\n/g,' '));
        }
      }
    }
    console.log('\nMigrations complete!');
  } catch (e) {
    console.error('Connection failed:', e.message);
    console.log('\nTo run migrations manually:');
    console.log('1. Go to https://supabase.com/dashboard/project/rwssxtkrxkagpwpcilqp/sql/new');
    console.log('2. Paste the contents of supabase-migrations.sql');
    console.log('3. Click "Run"');
  } finally {
    await client.end();
  }
}

run();
