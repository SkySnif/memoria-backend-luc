import { type CreateUserSchemaType, UserConstants } from '@/constants/zod/UserConstants';

export class CreateUserDto {
  public readonly email: string;
  public readonly password: string;
  public readonly pseudo: string;
  public readonly gdprConsent: boolean;

  public constructor(data: unknown) {
    const validated: CreateUserSchemaType = UserConstants.validateCreate(data);
    this.email = validated.email;
    this.password = validated.password;
    this.pseudo = validated.pseudo;
    this.gdprConsent = validated.gdprConsent;
  }
}
