import type { CreateItemDto } from '@/dto/item/CreateItemDto';
import type { UpdateItemDto } from '@/dto/item/UpdateItemDto';
import type { Item } from '@/entities/Item';
import type { Tag } from '@/entities/Tag';
import { ItemErrorFactory } from '@/exceptions/entities/ItemErrorFactory';
import { TagErrorFactory } from '@/exceptions/entities/TagErrorFactory';
import type { IItem } from '@/interfaces/entities/item/IItem';
import type { IItemData } from '@/interfaces/entities/item/IItemData';
import type {
  IItemRepository,
  IItemListOptions,
  IItemListResult
} from '@/interfaces/repositories/IItemRepository';
import type { IItemTagRepository } from '@/interfaces/repositories/IItemTagRepository';
import type { ITagRepository } from '@/interfaces/repositories/ITagRepository';
import type { IItemService } from '@/interfaces/services/IItemService';
import { SlugGenerator } from '@/utils/SlugGenerator';

export class ItemService implements IItemService {
  public constructor(
    private readonly itemRepository: IItemRepository,
    private readonly itemTagRepository: IItemTagRepository,
    private readonly tagRepository: ITagRepository
  ) {}

  /**
   * Vérifie que tous les tagIds existent ET appartiennent bien à l'utilisateur.
   * Sinon, lève une erreur claire (404 ou 403 selon le cas).
   */
  private async validateTagOwnership(userId: string, tagIds: ReadonlyArray<string>): Promise<void> {
    const tags: Tag[] = await this.tagRepository.findByIds(tagIds);
    if (tags.length !== tagIds.length) {
      throw TagErrorFactory.notFound('un ou plusieurs tags');
    }
    for (const tag of tags) {
      if (tag.getUserId() !== userId) {
        throw TagErrorFactory.accessDenied(tag.getId(), userId);
      }
    }
  }

  public async create(userId: string, dto: CreateItemDto): Promise<IItem> {
    const slug: string = dto.slug ?? SlugGenerator.generate(dto.title);

    const existingSlug: Item | null = await this.itemRepository.findBySlug(userId, slug);
    if (existingSlug) throw ItemErrorFactory.slugExists(userId, slug);

    const existingTitle: Item | null = await this.itemRepository.findByTitle(userId, dto.title);
    if (existingTitle) throw ItemErrorFactory.titleExists(userId, dto.title);

    // Validation ownership des tags AVANT l'insert pour fail-fast
    if (dto.tagIds && dto.tagIds.length > 0) {
      await this.validateTagOwnership(userId, dto.tagIds);
    }

    const data: IItemData = {
      id: '',
      userId,
      contentType: dto.contentType,
      title: dto.title,
      slug,
      content: dto.content,
      sourceAuthor: dto.sourceAuthor,
      thumbnailUrl: dto.thumbnailUrl,
      metadata: dto.metadata
    };

    const item: Item = await this.itemRepository.create(data);

    // Sync des tags après création de l'item
    if (dto.tagIds && dto.tagIds.length > 0) {
      await this.itemTagRepository.sync(item.getId(), dto.tagIds);
    }

    return item;
  }

  public async findById(userId: string, itemId: string): Promise<IItem> {
    const item: Item | null = await this.itemRepository.findById(itemId);
    if (!item) throw ItemErrorFactory.notFound(itemId);
    if (item.getUserId() !== userId) throw ItemErrorFactory.accessDenied(itemId, userId);
    return item;
  }

  public async findBySlug(userId: string, slug: string): Promise<IItem> {
    const item: Item | null = await this.itemRepository.findBySlug(userId, slug);
    if (!item) throw ItemErrorFactory.notFound(slug);
    return item;
  }

  public async listByUser(userId: string, options?: IItemListOptions): Promise<IItemListResult> {
    return await this.itemRepository.listByUser(userId, options);
  }

  public async update(userId: string, itemId: string, dto: UpdateItemDto): Promise<IItem> {
    const existing: Item | null = await this.itemRepository.findById(itemId);
    if (!existing) throw ItemErrorFactory.notFound(itemId);
    if (existing.getUserId() !== userId) throw ItemErrorFactory.accessDenied(itemId, userId);

    if (dto.tagIds !== undefined && dto.tagIds.length > 0) {
      await this.validateTagOwnership(userId, dto.tagIds);
    }

    const updates: Partial<IItemData> = { ...dto };
    delete (updates as { tagIds?: string[] }).tagIds; // tagIds n'est pas une colonne items
    if (dto.title && !dto.slug) {
      updates.slug = SlugGenerator.generate(dto.title);
    }

    const updated: Item | null = await this.itemRepository.update(itemId, updates);
    if (!updated) throw ItemErrorFactory.notFound(itemId);

    // Sync des tags : si tagIds est passé (même []), on remplace tout
    if (dto.tagIds !== undefined) {
      await this.itemTagRepository.sync(itemId, dto.tagIds);
    }

    return updated;
  }

  public async delete(userId: string, itemId: string): Promise<void> {
    const existing: Item | null = await this.itemRepository.findById(itemId);
    if (!existing) throw ItemErrorFactory.notFound(itemId);
    if (existing.getUserId() !== userId) throw ItemErrorFactory.accessDenied(itemId, userId);

    // FK CASCADE sur item_tags se charge de nettoyer les liaisons
    const deleted: boolean = await this.itemRepository.delete(itemId);
    if (!deleted) throw ItemErrorFactory.notFound(itemId);
  }
}
