const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../prisma/migrations');
const outputFile = path.join(__dirname, '../prisma/supabase_complete_schema.sql');

try {
  const dirs = fs.readdirSync(migrationsDir)
    .filter(name => {
      const fullPath = path.join(migrationsDir, name);
      return fs.statSync(fullPath).isDirectory() && /^\d{14}_/.test(name);
    })
    .sort();

  let combinedSql = `-- Delson PS Academic - Complete Supabase Schema Setup\n`;
  combinedSql += `-- Generated on ${new Date().toISOString()}\n\n`;

  // Add _prisma_migrations table definition
  combinedSql += `-- Create _prisma_migrations table\n`;
  combinedSql += `CREATE TABLE IF NOT EXISTS "_prisma_migrations" (\n`;
  combinedSql += `    "id" VARCHAR(36) PRIMARY KEY NOT NULL,\n`;
  combinedSql += `    "checksum" VARCHAR(64) NOT NULL,\n`;
  combinedSql += `    "finished_at" TIMESTAMPTZ,\n`;
  combinedSql += `    "migration_name" VARCHAR(255) NOT NULL,\n`;
  combinedSql += `    "logs" TEXT,\n`;
  combinedSql += `    "rolled_back_at" TIMESTAMPTZ,\n`;
  combinedSql += `    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),\n`;
  combinedSql += `    "applied_steps_count" INTEGER NOT NULL DEFAULT 0\n`;
  combinedSql += `);\n\n`;

  for (const dir of dirs) {
    const sqlPath = path.join(migrationsDir, dir, 'migration.sql');
    if (fs.existsSync(sqlPath)) {
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      combinedSql += `\n-- =========================================================================\n`;
      combinedSql += `-- MIGRATION: ${dir}\n`;
      combinedSql += `-- =========================================================================\n\n`;
      combinedSql += sqlContent;
      combinedSql += `\n`;

      // Insert record into _prisma_migrations
      // We generate a deterministic UUID based on the migration name to be clean, or use random/standard pg uuid
      // Since pg crypto might not be enabled by default, let's use a generated UUID here.
      const uuid = require('crypto').randomUUID();
      // Calculate a pseudo SHA256 of the migration sql content
      const hash = require('crypto').createHash('sha256').update(sqlContent).digest('hex');
      
      combinedSql += `INSERT INTO "_prisma_migrations" (\n`;
      combinedSql += `  "id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"\n`;
      combinedSql += `) VALUES (\n`;
      combinedSql += `  '${uuid}',\n`;
      combinedSql += `  '${hash}',\n`;
      combinedSql += `  now(),\n`;
      combinedSql += `  '${dir}',\n`;
      combinedSql += `  NULL,\n`;
      combinedSql += `  NULL,\n`;
      combinedSql += `  now(),\n`;
      combinedSql += `  1\n`;
      combinedSql += `) ON CONFLICT ("id") DO NOTHING;\n\n`;
    }
  }

  fs.writeFileSync(outputFile, combinedSql, 'utf8');
  console.log(`Successfully combined ${dirs.length} migrations into ${outputFile}`);
} catch (error) {
  console.error('Error merging migrations:', error);
  process.exit(1);
}
