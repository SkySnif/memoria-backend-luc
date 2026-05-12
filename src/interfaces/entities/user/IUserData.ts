import type { AuthProviderEnum } from '@/constants/enums/AuthProviderEnum';
import type { RoleEnum } from '@/constants/enums/RoleEnum';
import type { IBaseEntityData } from '@/interfaces/entities/IBaseEntityData';

export interface IUserData extends IBaseEntityData {
  email: string;
  passwordHash: string;
  pseudo: string;
  role: RoleEnum;
  authProvider: AuthProviderEnum;
  settingsUser: Record<string, unknown>;
  gdprConsent: boolean;
  gdprConsentDate?: Date | null;
}
