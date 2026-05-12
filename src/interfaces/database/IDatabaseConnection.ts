import type { Pool, QueryResult, QueryResultRow } from 'pg';

/**
 * Contrat de la couche de connexion PostgreSQL.
 * Les repositories ne dépendent QUE de cette interface (DIP).
 */
export interface IDatabaseConnection {
  getPool(): Pool;
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: ReadonlyArray<unknown>
  ): Promise<QueryResult<T>>;
  ping(): Promise<boolean>;
  close(): Promise<void>;
}
