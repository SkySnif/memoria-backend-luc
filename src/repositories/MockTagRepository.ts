import { Tag } from '@/entities/Tag';
import type { ITagData } from '@/interfaces/entities/tag/ITagData';
import type { ITagRepository } from '@/interfaces/repositories/ITagRepository';

export class MockTagRepository implements ITagRepository {
  private tags: Tag[] = [];
  private currentId: number = 1;

  public async findById(id: string): Promise<Tag | null> {
    return this.tags.find((t): boolean => t.getId() === id) ?? null;
  }

  public async findByUserId(userId: string): Promise<Tag[]> {
    return this.tags.filter((t): boolean => t.getUserId() === userId);
  }

  public async findByName(userId: string, tagName: string): Promise<Tag | null> {
    return (
      this.tags.find(
        (t): boolean =>
          t.getUserId() === userId && t.getTagName().toLowerCase() === tagName.toLowerCase()
      ) ?? null
    );
  }

  public async findByIds(ids: ReadonlyArray<string>): Promise<Tag[]> {
    return this.tags.filter((t): boolean => ids.includes(t.getId()));
  }

  public async create(data: ITagData): Promise<Tag> {
    const id: string = (this.currentId++).toString();
    const tag = new Tag({
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    this.tags.push(tag);
    return tag;
  }

  public async update(id: string, data: Partial<ITagData>): Promise<Tag | null> {
    const idx: number = this.tags.findIndex((t): boolean => t.getId() === id);
    if (idx === -1) return null;
    const current: ITagData = this.tags[idx].toData();
    const updated = new Tag({ ...current, ...data, id, updatedAt: new Date() });
    this.tags[idx] = updated;
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    const before: number = this.tags.length;
    this.tags = this.tags.filter((t): boolean => t.getId() !== id);
    return this.tags.length < before;
  }
}
