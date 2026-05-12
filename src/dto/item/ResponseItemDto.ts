import type { ContentTypeEnum } from '@/constants/enums/ContentTypeEnum';
import { ResponseTagDto } from '@/dto/tag/ResponseTagDto';
import type { IItem } from '@/interfaces/entities/item/IItem';
import type { ITag } from '@/interfaces/entities/tag/ITag';

export class ResponseItemDto {
  public readonly id: string;
  public readonly userId: string;
  public readonly contentType: ContentTypeEnum;
  public readonly title: string;
  public readonly slug: string;
  public readonly content: string;
  public readonly sourceAuthor: string;
  public readonly thumbnailUrl?: string | null;
  public readonly metadata: Record<string, unknown>;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
  public readonly tags?: ResponseTagDto[];

  private constructor(item: IItem, tags?: ITag[]) {
    this.id = item.getId();
    this.userId = item.getUserId();
    this.contentType = item.getContentType();
    this.title = item.getTitle();
    this.slug = item.getSlug();
    this.content = item.getContent();
    this.sourceAuthor = item.getSourceAuthor();
    this.thumbnailUrl = item.getThumbnailUrl();
    this.metadata = item.getMetadata();
    this.createdAt = item.getCreatedAt();
    this.updatedAt = item.getUpdatedAt();
    if (tags) {
      this.tags = ResponseTagDto.fromTags(tags);
    }
  }

  public static fromItem(item: IItem, tags?: ITag[]): ResponseItemDto {
    return new ResponseItemDto(item, tags);
  }

  public static fromItems(items: IItem[]): ResponseItemDto[] {
    return items.map((i): ResponseItemDto => ResponseItemDto.fromItem(i));
  }
}
