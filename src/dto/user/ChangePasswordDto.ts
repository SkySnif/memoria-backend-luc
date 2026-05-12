import { type ChangePasswordSchemaType, UserConstants } from '@/constants/zod/UserConstants';

export class ChangePasswordDto {
  public readonly currentPassword: string;
  public readonly newPassword: string;

  public constructor(data: unknown) {
    const validated: ChangePasswordSchemaType = UserConstants.validateChangePassword(data);
    this.currentPassword = validated.currentPassword;
    this.newPassword = validated.newPassword;
  }
}
