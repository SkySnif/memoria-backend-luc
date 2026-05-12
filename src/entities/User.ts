import type { AuthProviderEnum } from '@/constants/enums/AuthProviderEnum';
import type { RoleEnum } from '@/constants/enums/RoleEnum';
import { BaseEntity } from '@/entities/BaseEntity';
import type { IUser } from '@/interfaces/entities/user/IUser';
import type { IUserData } from '@/interfaces/entities/user/IUserData';

export class User extends BaseEntity<IUserData> implements IUser {
  private readonly email: string;
  private readonly passwordHash: string;
  private readonly pseudo: string;
  private readonly role: RoleEnum;
  private readonly authProvider: AuthProviderEnum;
  private readonly settingsUser: Record<string, unknown>;
  private readonly gdprConsent: boolean;
  private readonly gdprConsentDate?: Date | null;

  public constructor(data: IUserData) {
    super(data);
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.pseudo = data.pseudo;
    this.role = data.role;
    this.authProvider = data.authProvider;
    this.settingsUser = data.settingsUser;
    this.gdprConsent = data.gdprConsent;
    this.gdprConsentDate = data.gdprConsentDate;
  }

  public getEmail(): string {
    return this.email;
  }
  public getPasswordHash(): string {
    return this.passwordHash;
  }
  public getPseudo(): string {
    return this.pseudo;
  }
  public getRole(): RoleEnum {
    return this.role;
  }
  public getAuthProvider(): AuthProviderEnum {
    return this.authProvider;
  }
  public getSettingsUser(): Record<string, unknown> {
    return this.settingsUser;
  }
  public hasGdprConsent(): boolean {
    return this.gdprConsent;
  }
  public getGdprConsentDate(): Date | null | undefined {
    return this.gdprConsentDate;
  }

  public toData(): IUserData {
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      pseudo: this.pseudo,
      role: this.role,
      authProvider: this.authProvider,
      settingsUser: this.settingsUser,
      gdprConsent: this.gdprConsent,
      gdprConsentDate: this.gdprConsentDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
