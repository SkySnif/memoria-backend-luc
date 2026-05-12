import type { ContentTypeEnum } from '@/constants/enums/ContentTypeEnum';
import { BaseEntity } from '@/entities/BaseEntity';
import type { IItem } from '@/interfaces/entities/item/IItem';
import type { IItemData } from '@/interfaces/entities/item/IItemData';

export class Item extends BaseEntity<IItemData> implements IItem {
  private readonly userId: string;
  private readonly contentType: ContentTypeEnum;
  private readonly title: string;
  private readonly slug: string;
  private readonly content: string;
  private readonly sourceAuthor: string;
  private readonly thumbnailUrl?: string | null;
  private readonly metadata: Record<string, unknown>;

  public constructor(data: IItemData) {
    super(data);
    this.userId = data.userId;
    this.contentType = data.contentType;
    this.title = data.title;
    this.slug = data.slug;
    this.content = data.content;
    this.sourceAuthor = data.sourceAuthor;
    this.thumbnailUrl = data.thumbnailUrl;
    this.metadata = data.metadata;
  }

  public getUserId(): string {
    return this.userId;
  }
  public getContentType(): ContentTypeEnum {
    return this.contentType;
  }
  public getTitle(): string {
    return this.title;
  }
  public getSlug(): string {
    return this.slug;
  }
  public getContent(): string {
    return this.content;
  }
  public getSourceAuthor(): string {
    return this.sourceAuthor;
  }
  public getThumbnailUrl(): string | null | undefined {
    return this.thumbnailUrl;
  }
  public getMetadata(): Record<string, unknown> {
    return this.metadata;
  }

  public toData(): IItemData {
    return {
      id: this.id,
      userId: this.userId,
      contentType: this.contentType,
      title: this.title,
      slug: this.slug,
      content: this.content,
      sourceAuthor: this.sourceAuthor,
      thumbnailUrl: this.thumbnailUrl,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
