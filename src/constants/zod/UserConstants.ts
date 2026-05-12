import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().email('Email invalide').max(255);

const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit faire au moins 8 caractères')
  .max(128, 'Le mot de passe est trop long')
  .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Doit contenir au moins un chiffre');

const pseudoSchema = z
  .string()
  .trim()
  .min(3, 'Pseudo trop court (3 caractères min)')
  .max(30, 'Pseudo trop long (30 caractères max)')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Caractères autorisés : lettres, chiffres, _ et -');

const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  pseudo: pseudoSchema,
  gdprConsent: z.boolean().refine((v): v is true => v === true, {
    message: 'Le consentement RGPD est obligatoire'
  })
});

const updateUserSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  pseudo: pseudoSchema.optional(),
  settingsUser: z.record(z.string(), z.unknown()).optional()
});

const deleteUserSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis')
});

const updateProfileSchema = z.object({
  pseudo: z.string().trim().min(3).max(30).optional(),
  email: z.string().email().max(255).optional(),
  settingsUser: z.record(z.string(), z.unknown()).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z
    .string()
    .min(8, '8 caractères minimum')
    .max(72)
    .regex(/[A-Z]/, 'Une majuscule requise')
    .regex(/[a-z]/, 'Une minuscule requise')
    .regex(/[0-9]/, 'Un chiffre requis')
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Mot de passe requis pour confirmer la suppression')
});

export type UpdateProfileSchemaType = z.infer<typeof updateProfileSchema>;
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
export type DeleteAccountSchemaType = z.infer<typeof deleteAccountSchema>;
export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
export type DeleteUserSchemaType = z.infer<typeof deleteUserSchema>;

export class UserConstants {
  public static validateCreate(data: unknown): CreateUserSchemaType {
    return createUserSchema.parse(data);
  }
  public static validateUpdate(data: unknown): UpdateUserSchemaType {
    return updateUserSchema.parse(data);
  }
  public static validateDelete(data: unknown): DeleteUserSchemaType {
    return deleteUserSchema.parse(data);
  }

  public static validateUpdateProfile(data: unknown): UpdateProfileSchemaType {
    return updateProfileSchema.parse(data);
  }
  public static validateChangePassword(data: unknown): ChangePasswordSchemaType {
    return changePasswordSchema.parse(data);
  }
  public static validateDeleteAccount(data: unknown): DeleteAccountSchemaType {
    return deleteAccountSchema.parse(data);
  }
}
