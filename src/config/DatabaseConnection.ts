import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { LoggerSingleton } from '@/config/LoggerSingleton';
import type { IDatabaseConnection } from '@/interfaces/database/IDatabaseConnection';

/**
 * Singleton encapsulant le pool de connexions PostgreSQL.
 *
 * SOLID :
 *  - SRP : ne fait QUE gérer la connexion à la BDD.
 *  - DIP : implémente IDatabaseConnection, les repositories dépendent de l'interface.
 */
export class DatabaseConnection implements IDatabaseConnection {
  static #instance: DatabaseConnection;
  private readonly pool: Pool;
  private readonly logger = LoggerSingleton.getInstance();

  private constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("La variable DATABASE_URL est manquante dans l'environnement.");
    }
    const useSSL: boolean = process.env.DB_SSL === 'true';
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
      max: Number(process.env.DB_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000
    });

    this.pool.on('connect', (): void => {
      this.logger.debug('🐘 PostgreSQL : nouvelle connexion établie');
    });

    this.pool.on('error', (err: Error): void => {
      this.logger.error({ err }, 'Erreur PostgreSQL inattendue');
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.#instance) {
      DatabaseConnection.#instance = new DatabaseConnection();
    }
    return DatabaseConnection.#instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: ReadonlyArray<unknown>
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params as unknown[] | undefined);
  }

  public async ping(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (err) {
      this.logger.warn({ err }, 'Database ping failed');
      return false;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
