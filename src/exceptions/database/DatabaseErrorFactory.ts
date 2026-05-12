import { ApiError } from '@/exceptions/ApiError';

/**
 * Factory d'erreurs liées à la couche persistance PostgreSQL.
 */
export class DatabaseErrorFactory extends ApiError {
  public static queryFailed(operation: string, originalError: string): DatabaseErrorFactory {
    return new DatabaseErrorFactory(`Échec de l'opération en base : ${operation}`, 500, {
      code: 'DB_QUERY_FAILED',
      operation,
      originalError
    });
  }

  public static connectionLost(): DatabaseErrorFactory {
    return new DatabaseErrorFactory('Connexion à la base de données perdue', 503, {
      code: 'DB_CONNECTION_LOST'
    });
  }

  public static notFound(entity: string, identifier: string): DatabaseErrorFactory {
    return new DatabaseErrorFactory(`${entity} introuvable : ${identifier}`, 404, {
      code: 'NOT_FOUND',
      entity,
      identifier
    });
  }

  public static uniqueViolation(constraint: string): DatabaseErrorFactory {
    return new DatabaseErrorFactory(`Violation d'unicité : ${constraint}`, 409, {
      code: 'UNIQUE_VIOLATION',
      constraint
    });
  }
}
