import type { Item } from '@/entities/Item';
import type { IItemData } from '@/interfaces/entities/item/IItemData';
import type { IBaseRepository } from '@/interfaces/repositories/IBaseRepository';

export interface IItemListOptions {
  limit?: number;
  offset?: number;
  contentType?: string;
  search?: string;
}

export interface IItemListResult {
  items: Item[];
  total: number;
}

export interface IItemRepository extends IBaseRepository<Item, IItemData> {
  findBySlug(userId: string, slug: string): Promise<Item | null>;
  findByTitle(userId: string, title: string): Promise<Item | null>;
  listByUser(userId: string, options?: IItemListOptions): Promise<IItemListResult>;
}
