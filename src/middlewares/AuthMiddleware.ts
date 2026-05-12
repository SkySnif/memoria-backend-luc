import type { NextFunction, Request, Response } from 'express';
import { TokenError } from '@/exceptions/security/TokenError';
import type { IBlacklistService } from '@/interfaces/security/IBlacklistService';
import type { ITokenManager } from '@/interfaces/security/ITokenManager';

/**
 * Middleware d'authentification JWT.
 * Lit le header `Authorization: Bearer <token>`, vérifie l'access token,
 * et injecte `req.user` pour les controllers en aval.
 */
export class AuthMiddleware {
  public constructor(
    private readonly tokenManager: ITokenManager,
    private readonly blacklistService: IBlacklistService
  ) {}

  public requireAuth() {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const authHeader: string | undefined = req.header('authorization');
        if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
          throw TokenError.missing();
        }
        const token: string = authHeader.slice('bearer '.length).trim();
        const payload = await this.tokenManager.verifyAccessToken(token);

        if (payload.jti && this.blacklistService.isBlacklisted(payload.jti)) {
          throw TokenError.revoked();
        }

        req.user = {
          id: payload.sub,
          email: payload.email,
          pseudo: payload.pseudo,
          role: payload.role
        };
        next();
      } catch (err) {
        next(err);
      }
    };
  }
}
