import { ApiError } from '@/exceptions/ApiError';

export class ItemErrorFactory extends ApiError {
  public static notFound(identifier: string): ItemErrorFactory {
    return new ItemErrorFactory(`Pépite introuvable : ${identifier}`, 404, {
      code: 'ITEM_NOT_FOUND',
      identifier
    });
  }

  public static titleExists(userId: string, title: string): ItemErrorFactory {
    return new ItemErrorFactory(`Une pépite avec le titre « ${title} » existe déjà.`, 409, {
      code: 'ITEM_TITLE_EXISTS',
      field: 'title',
      userId,
      value: title
    });
  }

  public static slugExists(userId: string, slug: string): ItemErrorFactory {
    return new ItemErrorFactory(`Une pépite avec le slug « ${slug} » existe déjà.`, 409, {
      code: 'ITEM_SLUG_EXISTS',
      field: 'slug',
      userId,
      value: slug
    });
  }

  public static creation(originalError: string): ItemErrorFactory {
    return new ItemErrorFactory('Erreur lors de la création de la pépite', 500, {
      code: 'ITEM_CREATION_FAILED',
      originalError
    });
  }

  public static accessDenied(itemId: string, userId: string): ItemErrorFactory {
    return new ItemErrorFactory("Vous n'avez pas accès à cette pépite.", 403, {
      code: 'ITEM_ACCESS_DENIED',
      itemId,
      userId
    });
  }
}
