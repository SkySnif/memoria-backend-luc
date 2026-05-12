import { type UpdateUserSchemaType, UserConstants } from '@/constants/zod/UserConstants';

export class UpdateUserDto {
  public readonly email?: string;
  public readonly password?: string;
  public readonly pseudo?: string;
  public readonly settingsUser?: Record<string, unknown>;

  public constructor(data: unknown) {
    const validated: UpdateUserSchemaType = UserConstants.validateUpdate(data);
    this.email = validated.email;
    this.password = validated.password;
    this.pseudo = validated.pseudo;
    this.settingsUser = validated.settingsUser;
  }
}
