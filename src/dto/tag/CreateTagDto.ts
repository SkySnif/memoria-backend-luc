import { type CreateTagSchemaType, TagConstants } from '@/constants/zod/TagConstants';

export class CreateTagDto {
  public readonly tagName: string;

  public constructor(data: unknown) {
    const validated: CreateTagSchemaType = TagConstants.validateCreate(data);
    this.tagName = validated.tagName;
  }
}
