/**
 * Automatic Prisma Schema Selector
 * Detects whether the active database is PostgreSQL (e.g. Render, Supabase, Neon)
 * or SQLite (local offline development) and sets the correct Prisma schema.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables if present
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = (process.env.DATABASE_URL || '').trim();
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

const prismaDir = path.join(__dirname, '../prisma');
const targetSchema = path.join(prismaDir, 'schema.prisma');
const sourceSchema = isPostgres
  ? path.join(prismaDir, 'schema.postgresql.prisma')
  : path.join(prismaDir, 'schema.sqlite.prisma');

try {
  if (fs.existsSync(sourceSchema)) {
    const content = fs.readFileSync(sourceSchema, 'utf8');
    fs.writeFileSync(targetSchema, content, 'utf8');
    if (isPostgres) {
      console.log('📦 [Prisma Config] Active Provider: PostgreSQL (Persistent Cloud Database)');
      console.log('🔒 Data persistence enabled across server sleep and restarts.');
    } else {
      console.log('💻 [Prisma Config] Active Provider: SQLite (Local Development)');
    }
  } else {
    console.warn('⚠️ [Prisma Config] Source schema not found at:', sourceSchema);
  }
} catch (err) {
  console.error('❌ [Prisma Config] Error preparing schema:', err.message);
}
