import { type UpdateProfileSchemaType, UserConstants } from '@/constants/zod/UserConstants';

export class UpdateProfileDto {
  public readonly pseudo?: string;
  public readonly email?: string;
  public readonly settingsUser?: Record<string, unknown>;

  public constructor(data: unknown) {
    const validated: UpdateProfileSchemaType = UserConstants.validateUpdateProfile(data);
    this.pseudo = validated.pseudo;
    this.email = validated.email;
    this.settingsUser = validated.settingsUser;
  }
}
