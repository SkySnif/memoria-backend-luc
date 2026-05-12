import type { CreateItemDto } from '@/dto/item/CreateItemDto';
import type { UpdateItemDto } from '@/dto/item/UpdateItemDto';
import type { IItem } from '@/interfaces/entities/item/IItem';
import type { IItemListOptions, IItemListResult } from '@/interfaces/repositories/IItemRepository';

export interface IItemService {
  create(userId: string, dto: CreateItemDto): Promise<IItem>;
  findById(userId: string, itemId: string): Promise<IItem>;
  findBySlug(userId: string, slug: string): Promise<IItem>;
  listByUser(userId: string, options?: IItemListOptions): Promise<IItemListResult>;
  update(userId: string, itemId: string, dto: UpdateItemDto): Promise<IItem>;
  delete(userId: string, itemId: string): Promise<void>;
}
