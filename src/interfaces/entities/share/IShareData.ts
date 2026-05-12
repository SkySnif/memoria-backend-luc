import type { IBaseEntityData } from '@/interfaces/entities/IBaseEntityData';
import type { IAccessConfig } from '@/interfaces/entities/share/IAccessConfig';

export interface IShareData extends IBaseEntityData {
  itemId: string;
  recipientEmail: string | null;
  shareToken: string;
  accessConfig: IAccessConfig;
}
