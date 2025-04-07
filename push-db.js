import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from './shared/schema.js';

// This script will push the schema to the database
async function main() {
  console.log('Connecting to database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  console.log('Connected to database. Migrating schema...');
  
  const db = drizzle(pool, { schema });
  
  // This will create or update tables based on your schema
  await migrate(db, { migrationsFolder: 'drizzle' });
  
  console.log('Migration completed successfully!');
  
  // Close the pool
  await pool.end();
}

main().catch((err) => {
  console.error('Error during migration:', err);
  process.exit(1);
});