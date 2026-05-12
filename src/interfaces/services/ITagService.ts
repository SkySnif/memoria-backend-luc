import type { CreateTagDto } from '@/dto/tag/CreateTagDto';
import type { UpdateTagDto } from '@/dto/tag/UpdateTagDto';
import type { ITag } from '@/interfaces/entities/tag/ITag';

export interface ITagService {
  create(userId: string, dto: CreateTagDto): Promise<ITag>;
  findById(userId: string, tagId: string): Promise<ITag>;
  listByUser(userId: string): Promise<ITag[]>;
  update(userId: string, tagId: string, dto: UpdateTagDto): Promise<ITag>;
  delete(userId: string, tagId: string): Promise<void>;
}
