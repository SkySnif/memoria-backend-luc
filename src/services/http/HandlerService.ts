import type { NextFunction, Request, Response } from 'express';
import { LoggerSingleton } from '@/config/LoggerSingleton';
import { ApiError } from '@/exceptions/ApiError';
import type { IHandlerService } from '@/interfaces/http/IHandlerService';
import { ApiResponseFactory } from '@/utils/ApiResponseFactory';
import { RequestIdGenerator } from '@/utils/RequestIdGenerator';

/**
 * Middleware de gestion centralisée des erreurs Express.
 * À monter EN DERNIER dans la chaîne (après toutes les routes).
 */
export class HandlerService implements IHandlerService {
  private readonly logger = LoggerSingleton.getInstance();

  public handleError(error: unknown, req: Request, res: Response, _next: NextFunction): void {
    const requestId: string = RequestIdGenerator.getFromRequest(req);

    if (error instanceof ApiError) {
      error.log();
      res
        .status(error.statusCode)
        .json(
          ApiResponseFactory.error(
            error.message,
            error.additionalInfo.code ?? error.name,
            undefined,
            error.additionalInfo.field,
            requestId
          )
        );
      return;
    }

    this.logger.error({ err: error, requestId }, 'Erreur non gérée par les handlers métiers');

    res
      .status(500)
      .json(
        ApiResponseFactory.error(
          'Erreur interne du serveur',
          'INTERNAL_ERROR',
          undefined,
          undefined,
          requestId
        )
      );
  }

  public handleNotFound(req: Request, res: Response, _next: NextFunction): void {
    const requestId: string = RequestIdGenerator.getFromRequest(req);
    res
      .status(404)
      .json(
        ApiResponseFactory.error(
          `Route non trouvée : ${req.method} ${req.originalUrl}`,
          'ROUTE_NOT_FOUND',
          undefined,
          undefined,
          requestId
        )
      );
  }
}
