import { ApiError } from '@/exceptions/ApiError';

export class TokenError extends ApiError {
  public static invalid(reason?: string): TokenError {
    return new TokenError('Token invalide', 401, {
      code: 'TOKEN_INVALID',
      ...(reason && { originalError: reason })
    });
  }

  public static expired(): TokenError {
    return new TokenError('Token expiré', 401, { code: 'TOKEN_EXPIRED' });
  }

  public static revoked(): TokenError {
    return new TokenError('Token révoqué', 401, { code: 'TOKEN_REVOKED' });
  }

  public static missing(): TokenError {
    return new TokenError("Token d'authentification manquant", 401, {
      code: 'TOKEN_MISSING'
    });
  }

  public static wrongType(): TokenError {
    return new TokenError('Type de token incorrect', 401, {
      code: 'TOKEN_WRONG_TYPE'
    });
  }
}
