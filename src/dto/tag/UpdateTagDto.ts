import { type UpdateTagSchemaType, TagConstants } from '@/constants/zod/TagConstants';

export class UpdateTagDto {
  public readonly tagName: string;

  public constructor(data: unknown) {
    const validated: UpdateTagSchemaType = TagConstants.validateUpdate(data);
    this.tagName = validated.tagName;
  }
}
