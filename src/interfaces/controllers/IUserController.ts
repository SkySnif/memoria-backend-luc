import type { NextFunction, Request, Response } from 'express';

export interface IUserController {
  updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
  changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void>;
  exportData(req: Request, res: Response, next: NextFunction): Promise<void>;
}
