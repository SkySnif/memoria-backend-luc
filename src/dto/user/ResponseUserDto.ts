import type { AuthProviderEnum } from '@/constants/enums/AuthProviderEnum';
import type { RoleEnum } from '@/constants/enums/RoleEnum';
import type { IUser } from '@/interfaces/entities/user/IUser';

export class ResponseUserDto {
  public readonly id: string;
  public readonly email: string;
  public readonly pseudo: string;
  public readonly role: RoleEnum;
  public readonly authProvider: AuthProviderEnum;
  public readonly settingsUser: Record<string, unknown>;
  public readonly gdprConsent: boolean;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  private constructor(user: IUser) {
    this.id = user.getId();
    this.email = user.getEmail();
    this.pseudo = user.getPseudo();
    this.role = user.getRole();
    this.authProvider = user.getAuthProvider();
    this.settingsUser = user.getSettingsUser();
    this.gdprConsent = user.hasGdprConsent();
    this.createdAt = user.getCreatedAt();
    this.updatedAt = user.getUpdatedAt();
  }

  public static fromUser(user: IUser): ResponseUserDto {
    return new ResponseUserDto(user);
  }

  public static fromUsers(users: IUser[]): ResponseUserDto[] {
    return users.map((u): ResponseUserDto => ResponseUserDto.fromUser(u));
  }
}
