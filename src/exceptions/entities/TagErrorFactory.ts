import { ApiError } from '@/exceptions/ApiError';

export class TagErrorFactory extends ApiError {
  public static notFound(identifier: string): TagErrorFactory {
    return new TagErrorFactory(`Tag introuvable : ${identifier}`, 404, {
      code: 'TAG_NOT_FOUND',
      identifier
    });
  }

  public static nameExists(userId: string, tagName: string): TagErrorFactory {
    return new TagErrorFactory(`Le tag « ${tagName} » existe déjà.`, 409, {
      code: 'TAG_NAME_EXISTS',
      field: 'tagName',
      userId,
      value: tagName
    });
  }

  public static accessDenied(tagId: string, userId: string): TagErrorFactory {
    return new TagErrorFactory(`Vous n'avez pas accès à ce tag.`, 403, {
      code: 'TAG_ACCESS_DENIED',
      identifier: tagId,
      userId
    });
  }

  public static creation(originalError: string): TagErrorFactory {
    return new TagErrorFactory('Erreur lors de la création du tag', 500, {
      code: 'TAG_CREATION_FAILED',
      originalError
    });
  }
}
