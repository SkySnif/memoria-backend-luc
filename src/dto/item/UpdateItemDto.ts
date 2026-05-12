import type { ContentTypeEnum } from '@/constants/enums/ContentTypeEnum';
import { type UpdateItemSchemaType, ItemConstants } from '@/constants/zod/ItemConstants';

export class UpdateItemDto {
  public readonly contentType?: ContentTypeEnum;
  public readonly title?: string;
  public readonly slug?: string;
  public readonly content?: string;
  public readonly sourceAuthor?: string;
  public readonly thumbnailUrl?: string | null;
  public readonly metadata?: Record<string, unknown>;
  public readonly tagIds?: string[];

  public constructor(data: unknown) {
    const validated: UpdateItemSchemaType = ItemConstants.validateUpdate(data);
    this.contentType = validated.contentType;
    this.title = validated.title;
    this.slug = validated.slug;
    this.content = validated.content;
    this.sourceAuthor = validated.sourceAuthor;
    this.thumbnailUrl = validated.thumbnailUrl;
    this.metadata = validated.metadata;
    this.tagIds = validated.tagIds;
  }
}
