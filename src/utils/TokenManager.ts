import { randomUUID } from 'node:crypto';
import { SignJWT, jwtVerify, errors as joseErrors } from 'jose';
import { TokenError } from '@/exceptions/security/TokenError';
import type { IGeneratedTokens, ITokenManager } from '@/interfaces/security/ITokenManager';
import type { ITokenPayload } from '@/interfaces/security/ITokenPayload';

interface ITokenManagerConfig {
  accessSecret?: string;
  refreshSecret?: string;
  accessTTL?: string;
  refreshTTL?: string;
}

/**
 * Gestionnaire de tokens JWT via la lib `jose`.
 *
 *  - Access token : courte durée (15min par défaut), envoyé en Authorization
 *  - Refresh token : longue durée (7j par défaut), permet de re-générer un access
 *  - Tous deux contiennent un `jti` (uuid) pour le blacklisting éventuel
 */
export class TokenManager implements ITokenManager {
  private static readonly ALG: string = 'HS256';
  private readonly accessSecret: Uint8Array;
  private readonly refreshSecret: Uint8Array;
  private readonly accessTTL: string;
  private readonly refreshTTL: string;

  public constructor(config?: ITokenManagerConfig) {
    const accessSecret: string | undefined = config?.accessSecret ?? process.env.JWT_ACCESS_SECRET;
    const refreshSecret: string | undefined =
      config?.refreshSecret ?? process.env.JWT_REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
      throw new Error("JWT_ACCESS_SECRET et JWT_REFRESH_SECRET sont requis dans l'environnement.");
    }

    this.accessSecret = new TextEncoder().encode(accessSecret);
    this.refreshSecret = new TextEncoder().encode(refreshSecret);
    this.accessTTL = config?.accessTTL ?? process.env.JWT_ACCESS_TTL ?? '15m';
    this.refreshTTL = config?.refreshTTL ?? process.env.JWT_REFRESH_TTL ?? '7d';
  }

  public async generateTokens(
    payload: Omit<ITokenPayload, 'type' | 'iat' | 'exp' | 'jti'>
  ): Promise<IGeneratedTokens> {
    const accessToken: string = await this.sign(payload, 'access');
    const refreshToken: string = await this.sign(payload, 'refresh');
    return { accessToken, refreshToken };
  }

  public async verifyAccessToken(token: string): Promise<ITokenPayload> {
    return await this.verify(token, this.accessSecret, 'access');
  }

  public async verifyRefreshToken(token: string): Promise<ITokenPayload> {
    return await this.verify(token, this.refreshSecret, 'refresh');
  }

  private async sign(
    payload: Omit<ITokenPayload, 'type' | 'iat' | 'exp' | 'jti'>,
    type: 'access' | 'refresh'
  ): Promise<string> {
    const secret: Uint8Array = type === 'access' ? this.accessSecret : this.refreshSecret;
    const ttl: string = type === 'access' ? this.accessTTL : this.refreshTTL;

    return await new SignJWT({
      email: payload.email,
      pseudo: payload.pseudo,
      role: payload.role,
      type
    })
      .setProtectedHeader({ alg: TokenManager.ALG })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime(ttl)
      .setJti(randomUUID())
      .sign(secret);
  }

  private async verify(
    token: string,
    secret: Uint8Array,
    expectedType: 'access' | 'refresh'
  ): Promise<ITokenPayload> {
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.type !== expectedType) {
        throw TokenError.wrongType();
      }
      return payload as unknown as ITokenPayload;
    } catch (err) {
      if (err instanceof TokenError) throw err;
      if (err instanceof joseErrors.JWTExpired) throw TokenError.expired();
      if (err instanceof joseErrors.JOSEError) {
        throw TokenError.invalid(err.message);
      }
      throw TokenError.invalid(err instanceof Error ? err.message : 'unknown');
    }
  }
}
