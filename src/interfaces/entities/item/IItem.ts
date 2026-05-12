import type { ContentTypeEnum } from '@/constants/enums/ContentTypeEnum';
import type { IEntity } from '@/interfaces/entities/IEntity';
import type { IItemData } from '@/interfaces/entities/item/IItemData';

export interface IItem extends IEntity<IItemData> {
  getUserId(): string;
  getContentType(): ContentTypeEnum;
  getTitle(): string;
  getSlug(): string;
  getContent(): string;
  getSourceAuthor(): string;
  getThumbnailUrl(): string | null | undefined;
  getMetadata(): Record<string, unknown>;
}
