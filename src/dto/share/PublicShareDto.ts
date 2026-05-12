import type { ContentTypeEnum } from '@/constants/enums/ContentTypeEnum';
import type { IItem } from '@/interfaces/entities/item/IItem';

export class PublicShareDto {
  public readonly title: string;
  public readonly slug: string;
  public readonly contentType: ContentTypeEnum;
  public readonly content: string;
  public readonly sourceAuthor: string;
  public readonly thumbnailUrl?: string | null;
  public readonly metadata: Record<string, unknown>;
  public readonly createdAt?: Date;

  private constructor(item: IItem) {
    this.title = item.getTitle();
    this.slug = item.getSlug();
    this.contentType = item.getContentType();
    this.content = item.getContent();
    this.sourceAuthor = item.getSourceAuthor();
    this.thumbnailUrl = item.getThumbnailUrl();
    this.metadata = item.getMetadata();
    this.createdAt = item.getCreatedAt();
  }

  public static fromItem(item: IItem): PublicShareDto {
    return new PublicShareDto(item);
  }
}
