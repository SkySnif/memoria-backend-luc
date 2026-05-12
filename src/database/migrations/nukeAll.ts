import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';
import { LoggerSingleton } from '@/config/LoggerSingleton';

const logger = LoggerSingleton.getInstance();

/**
 * Dossier des scripts de drop (suppression des objets dans le bon ordre).
 * À exécuter avant un `runAll` pour repartir d'une BDD propre.
 */
const DROP_DIR: string = 'database/migrations/drop';

function createAdminPool(): Pool {
  const host: string | undefined = process.env.DB_HOST;
  const port: number = Number(process.env.DB_PORT ?? 5432);
  const database: string | undefined = process.env.DB_NAME;
  const user: string | undefined = process.env.DB_USER;
  const password: string | undefined = process.env.DB_PASSWORD;

  if (!host || !database || !user || !password) {
    throw new Error('DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD sont requis.');
  }

  return new Pool({ host, port, database, user, password });
}

async function main(): Promise<void> {
  logger.warn('⚠️  Suppression de tous les objets de la base en cours...');

  const pool: Pool = createAdminPool();
  try {
    let files: string[];
    try {
      const all: string[] = await readdir(DROP_DIR);
      files = all.filter((f): boolean => f.endsWith('.sql')).sort();
    } catch (err) {
      const code: string | undefined = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        logger.error({ dir: DROP_DIR }, "Le dossier de drop n'existe pas");
        process.exitCode = 1;
        return;
      }
      throw err;
    }

    if (files.length === 0) {
      logger.warn({ dir: DROP_DIR }, 'Aucun script de drop trouvé');
      return;
    }

    for (const file of files) {
      const filepath: string = path.join(DROP_DIR, file);
      const sql: string = await readFile(filepath, 'utf-8');
      try {
        await pool.query(sql);
        logger.info({ file: filepath }, '🗑️  Drop appliqué');
      } catch (err) {
        logger.error({ file: filepath, err }, "❌ Échec d'un drop");
        throw err;
      }
    }
    logger.info('🧹 Base nettoyée');
  } catch (err) {
    logger.error({ err }, '💥 Le processus de nuke a échoué');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();
