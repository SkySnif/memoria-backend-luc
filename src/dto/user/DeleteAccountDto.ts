import { type DeleteAccountSchemaType, UserConstants } from '@/constants/zod/UserConstants';

export class DeleteAccountDto {
  public readonly password: string;

  public constructor(data: unknown) {
    const validated: DeleteAccountSchemaType = UserConstants.validateDeleteAccount(data);
    this.password = validated.password;
  }
}
