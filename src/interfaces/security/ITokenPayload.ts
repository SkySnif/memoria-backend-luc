import type { RoleEnum } from '@/constants/enums/RoleEnum';

/**
 * Charge utile d'un JWT généré par notre TokenManager.
 * Étend les claims standards JWT (sub, iat, exp, jti) avec nos données métier.
 */
export interface ITokenPayload {
  sub: string; // user.id (JWT standard claim)
  email: string;
  pseudo: string;
  role: RoleEnum;
  type: 'access' | 'refresh';
  iat?: number; // issued at (unix ts en secondes)
  exp?: number; // expires at
  jti?: string; // unique token id (pour blacklisting)
}
