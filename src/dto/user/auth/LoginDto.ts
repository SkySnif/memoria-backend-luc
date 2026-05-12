import { AuthConstants, type LoginSchemaType } from '@/constants/zod/AuthConstants';

export class LoginDto {
  public readonly email: string;
  public readonly password: string;

  public constructor(data: unknown) {
    const validated: LoginSchemaType = AuthConstants.validateLogin(data);
    this.email = validated.email;
    this.password = validated.password;
  }
}
