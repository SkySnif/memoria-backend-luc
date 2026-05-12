import type { ITokenPayload } from '@/interfaces/security/ITokenPayload';

export interface IGeneratedTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenManager {
  generateTokens(
    payload: Omit<ITokenPayload, 'type' | 'iat' | 'exp' | 'jti'>
  ): Promise<IGeneratedTokens>;
  verifyAccessToken(token: string): Promise<ITokenPayload>;
  verifyRefreshToken(token: string): Promise<ITokenPayload>;
}
