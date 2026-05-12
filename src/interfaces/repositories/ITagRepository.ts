import type { Tag } from '@/entities/Tag';
import type { ITagData } from '@/interfaces/entities/tag/ITagData';
import type { IBaseRepository } from '@/interfaces/repositories/IBaseRepository';

export interface ITagRepository extends IBaseRepository<Tag, ITagData> {
  findByUserId(userId: string): Promise<Tag[]>;
  findByName(userId: string, tagName: string): Promise<Tag | null>;
  findByIds(ids: ReadonlyArray<string>): Promise<Tag[]>;
}
