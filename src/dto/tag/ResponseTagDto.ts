import type { ITag } from '@/interfaces/entities/tag/ITag';

export class ResponseTagDto {
  public readonly id: string;
  public readonly userId: string;
  public readonly tagName: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  private constructor(tag: ITag) {
    this.id = tag.getId();
    this.userId = tag.getUserId();
    this.tagName = tag.getTagName();
    this.createdAt = tag.getCreatedAt();
    this.updatedAt = tag.getUpdatedAt();
  }

  public static fromTag(tag: ITag): ResponseTagDto {
    return new ResponseTagDto(tag);
  }

  public static fromTags(tags: ITag[]): ResponseTagDto[] {
    return tags.map((t): ResponseTagDto => ResponseTagDto.fromTag(t));
  }
}
