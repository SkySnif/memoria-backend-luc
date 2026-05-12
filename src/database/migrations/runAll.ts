import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';
import { LoggerSingleton } from '@/config/LoggerSingleton';

const logger = LoggerSingleton.getInstance();

/**
 * Dossiers de migration exécutés dans cet ordre exact.
 * Chaque dossier contient des .sql triés par ordre alphabétique du nom de fichier.
 *  - config : extensions, rôles, types ENUM
 *  - triggers : fonctions trigger PL/pgSQL
 *  - tables : tables (qui utilisent les types + triggers déjà créés)
 *  - views : vues métier (qui dépendent des tables)
 *  - seeders : données de test (optionnel)
 */
const MIGRATION_DIRS: ReadonlyArray<string> = [
  'database/migrations/config',
  'database/triggers',
  'database/migrations/tables',
  'database/views',
  'database/seeders'
];

function createAdminPool(): Pool {
  const host: string | undefined = process.env.DB_HOST;
  const port: number = Number(process.env.DB_PORT ?? 5432);
  const database: string | undefined = process.env.DB_NAME;
  const user: string | undefined = process.env.DB_USER;
  const password: string | undefined = process.env.DB_PASSWORD;

  if (!host || !database || !user || !password) {
    throw new Error(
      'DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD sont requis pour les migrations.'
    );
  }

  return new Pool({ host, port, database, user, password });
}

async function runDirectory(pool: Pool, dir: string): Promise<void> {
  let files: string[];
  try {
    const all: string[] = await readdir(dir);
    files = all
      .filter((f): boolean => f.endsWith('.sql'))
      .filter((f): boolean => !f.startsWith('00_')) // skip bootstrap files (CREATE DATABASE, etc.)
      .sort();
  } catch (err) {
    const code: string | undefined = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      logger.warn({ dir }, 'Dossier de migration introuvable, ignoré');
      return;
    }
    throw err;
  }

  if (files.length === 0) {
    logger.info({ dir }, 'Aucun fichier SQL trouvé, dossier ignoré');
    return;
  }

  logger.info({ dir, count: files.length }, '▶️  Exécution du dossier');

  for (const file of files) {
    const filepath: string = path.join(dir, file);
    const sql: string = await readFile(filepath, 'utf-8');
    try {
      await pool.query(sql);
      logger.info({ file: filepath }, '✅ Migration appliquée');
    } catch (err) {
      logger.error({ file: filepath, err }, '❌ Échec de la migration');
      throw err;
    }
  }
}

async function main(): Promise<void> {
  const pool: Pool = createAdminPool();
  try {
    for (const dir of MIGRATION_DIRS) {
      await runDirectory(pool, dir);
    }
    logger.info('🎉 Toutes les migrations sont passées');
  } catch (err) {
    logger.error({ err }, '💥 Le processus de migration a échoué');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();
