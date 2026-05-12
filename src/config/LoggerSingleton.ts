import pino, { type Logger } from 'pino';

/**
 * Singleton pour le logger Pino.
 * Pattern Singleton : une seule instance partagée dans toute l'app.
 *
 *  - DEV : pino-pretty (sortie colorée et lisible).
 *  - PROD : JSON sur stdout (observabilité plateforme) + rotation fichiers
 *           erreurs (30j) et audit (365j) via pino-roll.
 */
export class LoggerSingleton {
  static #instance: Logger;

  private constructor() {
    // Empêche l'instanciation directe (pattern Singleton)
  }

  public static getInstance(): Logger {
    if (!LoggerSingleton.#instance) {
      const isDev: boolean = process.env.NODE_ENV !== 'production';

      const transport = isDev
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'dd-mm-yyyy HH:MM:ss',
              ignore: 'pid,hostname'
            }
          }
        : {
            targets: [
              // 1. stdout JSON (observabilité plateforme : Docker, k8s, etc.)
              {
                target: 'pino/file',
                options: { destination: 1 },
                level: 'info'
              },
              // 2. Logs d'erreurs (30 jours, ~10MB par fichier)
              {
                target: 'pino-roll',
                options: {
                  file: 'logs/error',
                  frequency: 'daily',
                  size: '10m',
                  extension: '.log',
                  mkdir: true,
                  limit: { count: 30 }
                },
                level: 'error'
              },
              // 3. Audit RGPD (1 an, ~20MB par fichier)
              {
                target: 'pino-roll',
                options: {
                  file: 'logs/audit',
                  frequency: 'daily',
                  size: '20m',
                  extension: '.log',
                  mkdir: true,
                  limit: { count: 365 }
                },
                level: 'info'
              }
            ]
          };

      LoggerSingleton.#instance = pino({
        level: process.env.LOG_LEVEL ?? 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
        transport
      });
    }
    return LoggerSingleton.#instance;
  }
}
