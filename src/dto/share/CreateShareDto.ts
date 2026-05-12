import { type CreateShareSchemaType, ShareConstants } from '@/constants/zod/ShareConstants';
import type { IAccessConfig } from '@/interfaces/entities/share/IAccessConfig';

export class CreateShareDto {
  public readonly itemId: string;
  public readonly recipientEmail: string | null;
  public readonly accessConfig: IAccessConfig;

  public constructor(data: unknown) {
    const validated: CreateShareSchemaType = ShareConstants.validateCreate(data);
    this.itemId = validated.itemId;
    this.recipientEmail = validated.recipientEmail ?? null;
    this.accessConfig = validated.accessConfig;
  }
}
