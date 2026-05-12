import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requis')
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RefreshTokenSchemaType = z.infer<typeof refreshTokenSchema>;

export class AuthConstants {
  public static validateLogin(data: unknown): LoginSchemaType {
    return loginSchema.parse(data);
  }
  public static validateRefreshToken(data: unknown): RefreshTokenSchemaType {
    return refreshTokenSchema.parse(data);
  }
}
