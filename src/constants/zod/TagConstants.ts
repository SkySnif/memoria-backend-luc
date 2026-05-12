import { z } from 'zod';

const tagNameSchema = z
  .string()
  .trim()
  .min(1, 'Le nom du tag est requis')
  .max(50, 'Le nom du tag est trop long (50 caractères max)');

const createTagSchema = z.object({ tagName: tagNameSchema });
const updateTagSchema = z.object({ tagName: tagNameSchema });

export type CreateTagSchemaType = z.infer<typeof createTagSchema>;
export type UpdateTagSchemaType = z.infer<typeof updateTagSchema>;

export class TagConstants {
  public static validateCreate(data: unknown): CreateTagSchemaType {
    return createTagSchema.parse(data);
  }
  public static validateUpdate(data: unknown): UpdateTagSchemaType {
    return updateTagSchema.parse(data);
  }
}
