import { type UpdateShareSchemaType, ShareConstants } from '@/constants/zod/ShareConstants';
import type { IAccessConfig } from '@/interfaces/entities/share/IAccessConfig';

export class UpdateShareDto {
  public readonly recipientEmail?: string | null;
  public readonly accessConfig?: IAccessConfig;

  public constructor(data: unknown) {
    const validated: UpdateShareSchemaType = ShareConstants.validateUpdate(data);
    this.recipientEmail = validated.recipientEmail;
    this.accessConfig = validated.accessConfig;
  }
}
