import type { ContentTypeEnum } from '@/constants/enums/ContentTypeEnum';
import type { IBaseEntityData } from '@/interfaces/entities/IBaseEntityData';

export interface IItemData extends IBaseEntityData {
  userId: string;
  contentType: ContentTypeEnum;
  title: string;
  slug: string;
  content: string;
  sourceAuthor: string;
  thumbnailUrl?: string | null;
  metadata: Record<string, unknown>;
}
