import type { IEntity } from '@/interfaces/entities/IEntity';
import type { IAccessConfig } from '@/interfaces/entities/share/IAccessConfig';
import type { IShareData } from '@/interfaces/entities/share/IShareData';

export interface IShare extends IEntity<IShareData> {
  getItemId(): string;
  getRecipientEmail(): string | null;
  getShareToken(): string;
  getAccessConfig(): IAccessConfig;
  isExpired(): boolean;
}
