import type { CreateTagDto } from '@/dto/tag/CreateTagDto';
import type { UpdateTagDto } from '@/dto/tag/UpdateTagDto';
import type { Tag } from '@/entities/Tag';
import { TagErrorFactory } from '@/exceptions/entities/TagErrorFactory';
import type { ITag } from '@/interfaces/entities/tag/ITag';
import type { ITagRepository } from '@/interfaces/repositories/ITagRepository';
import type { ITagService } from '@/interfaces/services/ITagService';

export class TagService implements ITagService {
  public constructor(private readonly tagRepository: ITagRepository) {}

  public async create(userId: string, dto: CreateTagDto): Promise<ITag> {
    // Le repository remontera TagErrorFactory.nameExists si doublon (contrainte unique_user_tag)
    return await this.tagRepository.create({
      id: '',
      userId,
      tagName: dto.tagName
    });
  }

  public async findById(userId: string, tagId: string): Promise<ITag> {
    const tag: Tag | null = await this.tagRepository.findById(tagId);
    if (!tag) throw TagErrorFactory.notFound(tagId);
    if (tag.getUserId() !== userId) throw TagErrorFactory.accessDenied(tagId, userId);
    return tag;
  }

  public async listByUser(userId: string): Promise<ITag[]> {
    return await this.tagRepository.findByUserId(userId);
  }

  public async update(userId: string, tagId: string, dto: UpdateTagDto): Promise<ITag> {
    const existing: Tag | null = await this.tagRepository.findById(tagId);
    if (!existing) throw TagErrorFactory.notFound(tagId);
    if (existing.getUserId() !== userId) throw TagErrorFactory.accessDenied(tagId, userId);

    // Pré-vérification d'unicité si on change vraiment le nom
    if (dto.tagName.toLowerCase() !== existing.getTagName().toLowerCase()) {
      const conflict: Tag | null = await this.tagRepository.findByName(userId, dto.tagName);
      if (conflict) throw TagErrorFactory.nameExists(userId, dto.tagName);
    }

    const updated: Tag | null = await this.tagRepository.update(tagId, {
      tagName: dto.tagName
    });
    if (!updated) throw TagErrorFactory.notFound(tagId);
    return updated;
  }

  public async delete(userId: string, tagId: string): Promise<void> {
    const existing: Tag | null = await this.tagRepository.findById(tagId);
    if (!existing) throw TagErrorFactory.notFound(tagId);
    if (existing.getUserId() !== userId) throw TagErrorFactory.accessDenied(tagId, userId);

    const deleted: boolean = await this.tagRepository.delete(tagId);
    if (!deleted) throw TagErrorFactory.notFound(tagId);
  }
}
