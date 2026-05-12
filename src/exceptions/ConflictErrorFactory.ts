import { ApiError } from '@/exceptions/ApiError';

/**
 * Factory d'erreurs 409 Conflict (violations d'unicité métier).
 * Le pattern factory permet de garder les messages cohérents et localisés.
 */
export class ConflictErrorFactory extends ApiError {
  public static usernameExists(username: string): ConflictErrorFactory {
    return new ConflictErrorFactory(`Le nom d'utilisateur « ${username} » est déjà utilisé.`, 409, {
      code: 'USERNAME_EXISTS',
      field: 'username',
      value: username
    });
  }

  public static slugExists(slug: string): ConflictErrorFactory {
    return new ConflictErrorFactory(`Le slug « ${slug} » est déjà utilisé.`, 409, {
      code: 'SLUG_EXISTS',
      field: 'slug',
      value: slug
    });
  }
}
