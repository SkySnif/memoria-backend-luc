import { BaseEntity } from '@/entities/BaseEntity';
import type { ITag } from '@/interfaces/entities/tag/ITag';
import type { ITagData } from '@/interfaces/entities/tag/ITagData';

export class Tag extends BaseEntity<ITagData> implements ITag {
  private readonly userId: string;
  private readonly tagName: string;

  public constructor(data: ITagData) {
    super(data);
    this.userId = data.userId;
    this.tagName = data.tagName;
  }

  public getUserId(): string {
    return this.userId;
  }
  public getTagName(): string {
    return this.tagName;
  }

  public toData(): ITagData {
    return {
      id: this.id,
      userId: this.userId,
      tagName: this.tagName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
