import { LoggerSingleton } from '@/config/LoggerSingleton';
import type { IAdditionalInfo } from '@/interfaces/security/IAdditionalInfo';

/**
 * Erreur API de base.
 *
 * SOLID :
 *  - SRP : représentation + logging d'une erreur HTTP.
 *  - DIP : dépend du LoggerSingleton, pas de winston directement.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly additionalInfo: IAdditionalInfo;
  public readonly timestamp: string;
  public readonly logger = LoggerSingleton.getInstance();

  constructor(message: string, statusCode: number, additionalInfo: IAdditionalInfo = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.additionalInfo = additionalInfo;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Logge l'erreur. Retourne `this` pour permettre le method chaining.
   */
  public log(): this {
    this.logger.error(
      {
        name: this.name,
        statusCode: this.statusCode,
        additionalInfo: this.additionalInfo,
        timestamp: this.timestamp,
        stack: this.stack
      },
      this.message
    );
    return this;
  }

  /**
   * Représentation safe pour le client (PAS d'additionalInfo, PAS de stack).
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp
    };
  }
}
