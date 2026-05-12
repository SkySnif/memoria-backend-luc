import { AuthConstants, type RefreshTokenSchemaType } from '@/constants/zod/AuthConstants';

export class RefreshTokenDto {
  public readonly refreshToken: string;

  public constructor(data: unknown) {
    const validated: RefreshTokenSchemaType = AuthConstants.validateRefreshToken(data);
    this.refreshToken = validated.refreshToken;
  }
}
