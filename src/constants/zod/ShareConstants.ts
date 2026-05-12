import { z } from 'zod';

const recipientEmailSchema = z.string().email().max(255).nullable().optional();
const expiresAtSchema = z
  .string()
  .datetime({ message: 'expiresAt doit être au format ISO 8601' })
  .optional();

const accessConfigSchema = z.object({ expiresAt: expiresAtSchema }).default({});

const createShareSchema = z.object({
  itemId: z.string().uuid('itemId doit être un UUID valide'),
  recipientEmail: recipientEmailSchema,
  accessConfig: accessConfigSchema
});

const updateShareSchema = z.object({
  recipientEmail: recipientEmailSchema,
  accessConfig: accessConfigSchema.optional()
});

export type CreateShareSchemaType = z.infer<typeof createShareSchema>;
export type UpdateShareSchemaType = z.infer<typeof updateShareSchema>;

export class ShareConstants {
  public static validateCreate(data: unknown): CreateShareSchemaType {
    return createShareSchema.parse(data);
  }
  public static validateUpdate(data: unknown): UpdateShareSchemaType {
    return updateShareSchema.parse(data);
  }
}
