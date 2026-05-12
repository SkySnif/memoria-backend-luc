import type { NextFunction, Request, Response } from 'express';

/**
 * Contrat d'un service de gestion d'erreurs Express.
 * Permet d'injecter une implémentation alternative en test.
 */
export interface IHandlerService {
  handleError(error: unknown, req: Request, res: Response, next: NextFunction): void;
  handleNotFound(req: Request, res: Response, next: NextFunction): void;
}
