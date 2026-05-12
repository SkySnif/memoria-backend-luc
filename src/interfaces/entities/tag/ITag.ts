import type { IEntity } from '@/interfaces/entities/IEntity';
import type { ITagData } from '@/interfaces/entities/tag/ITagData';

export interface ITag extends IEntity<ITagData> {
  getUserId(): string;
  getTagName(): string;
}
