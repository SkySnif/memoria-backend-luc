import { Item } from '@/entities/Item';
import type { IItemData } from '@/interfaces/entities/item/IItemData';
import type {
  IItemListOptions,
  IItemListResult,
  IItemRepository
} from '@/interfaces/repositories/IItemRepository';

export class MockItemRepository implements IItemRepository {
  private items: Item[] = [];
  private currentId: number = 1;

  public async findById(id: string): Promise<Item | null> {
    return this.items.find((i): boolean => i.getId() === id) ?? null;
  }

  public async findBySlug(userId: string, slug: string): Promise<Item | null> {
    return (
      this.items.find((i): boolean => i.getUserId() === userId && i.getSlug() === slug) ?? null
    );
  }

  public async findByTitle(userId: string, title: string): Promise<Item | null> {
    return (
      this.items.find(
        (i): boolean =>
          i.getUserId() === userId && i.getTitle().toLowerCase() === title.toLowerCase()
      ) ?? null
    );
  }

  public async listByUser(userId: string, options?: IItemListOptions): Promise<IItemListResult> {
    let filtered: Item[] = this.items.filter((i): boolean => i.getUserId() === userId);
    if (options?.contentType) {
      filtered = filtered.filter((i): boolean => i.getContentType() === options.contentType);
    }
    if (options?.search) {
      const q: string = options.search.toLowerCase();
      filtered = filtered.filter((i): boolean => i.getTitle().toLowerCase().includes(q));
    }
    const total: number = filtered.length;
    const offset: number = options?.offset ?? 0;
    const limit: number = options?.limit ?? 20;
    return { items: filtered.slice(offset, offset + limit), total };
  }

  public async create(data: IItemData): Promise<Item> {
    const id: string = (this.currentId++).toString();
    const item = new Item({
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    this.items.push(item);
    return item;
  }

  public async update(id: string, data: Partial<IItemData>): Promise<Item | null> {
    const idx: number = this.items.findIndex((i): boolean => i.getId() === id);
    if (idx === -1) return null;
    const current: IItemData = this.items[idx].toData();
    const updated = new Item({ ...current, ...data, id, updatedAt: new Date() });
    this.items[idx] = updated;
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    const before: number = this.items.length;
    this.items = this.items.filter((i): boolean => i.getId() !== id);
    return this.items.length < before;
  }
}
