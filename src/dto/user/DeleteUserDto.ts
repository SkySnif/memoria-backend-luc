import { type DeleteUserSchemaType, UserConstants } from '@/constants/zod/UserConstants';

export class DeleteUserDto {
  public readonly password: string;

  public constructor(data: unknown) {
    const validated: DeleteUserSchemaType = UserConstants.validateDelete(data);
    this.password = validated.password;
  }
}
