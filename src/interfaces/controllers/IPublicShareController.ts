import type { NextFunction, Request, Response } from 'express';

export interface IPublicShareController {
  getByToken(req: Request, res: Response, next: NextFunction): Promise<void>;
}
