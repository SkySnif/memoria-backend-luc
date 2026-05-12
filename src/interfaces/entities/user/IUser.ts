import type { AuthProviderEnum } from '@/constants/enums/AuthProviderEnum';
import type { RoleEnum } from '@/constants/enums/RoleEnum';
import type { IEntity } from '@/interfaces/entities/IEntity';
import type { IUserData } from '@/interfaces/entities/user/IUserData';

export interface IUser extends IEntity<IUserData> {
  getEmail(): string;
  getPasswordHash(): string;
  getPseudo(): string;
  getRole(): RoleEnum;
  getAuthProvider(): AuthProviderEnum;
  getSettingsUser(): Record<string, unknown>;
  hasGdprConsent(): boolean;
  getGdprConsentDate(): Date | null | undefined;
}
