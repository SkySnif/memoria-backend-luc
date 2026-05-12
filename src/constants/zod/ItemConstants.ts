import { z } from 'zod';
import { ContentTypeEnum } from '@/constants/enums/ContentTypeEnum';

const contentTypeSchema = z.nativeEnum(ContentTypeEnum);
const titleSchema = z.string().trim().min(1, 'Le titre est requis').max(255);
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9-]+$/, 'Le slug doit être en minuscules, chiffres et tirets uniquement');
const contentSchema = z.string().min(1, 'Le contenu est requis');
const sourceAuthorSchema = z.string().trim().max(50).default('N.C');
const thumbnailUrlSchema = z.string().url().max(255).nullable().optional();
const metadataSchema = z.record(z.string(), z.unknown()).default({});
const tagIdsSchema = z.array(z.string().uuid('Chaque tagId doit être un UUID valide')).optional();

const createItemSchema = z.object({
  contentType: contentTypeSchema,
  title: titleSchema,
  slug: slugSchema.optional(),
  content: contentSchema,
  sourceAuthor: sourceAuthorSchema,
  thumbnailUrl: thumbnailUrlSchema,
  metadata: metadataSchema,
  tagIds: tagIdsSchema
});

const updateItemSchema = z.object({
  contentType: contentTypeSchema.optional(),
  title: titleSchema.optional(),
  slug: slugSchema.optional(),
  content: contentSchema.optional(),
  sourceAuthor: sourceAuthorSchema.optional(),
  thumbnailUrl: thumbnailUrlSchema,
  metadata: metadataSchema.optional(),
  tagIds: tagIdsSchema
});

export type CreateItemSchemaType = z.infer<typeof createItemSchema>;
export type UpdateItemSchemaType = z.infer<typeof updateItemSchema>;

export class ItemConstants {
  public static validateCreate(data: unknown): CreateItemSchemaType {
    return createItemSchema.parse(data);
  }

  public static validateUpdate(data: unknown): UpdateItemSchemaType {
    return updateItemSchema.parse(data);
  }
}
