import { ApiError } from '@/exceptions/ApiError';

export class ShareErrorFactory extends ApiError {
  public static notFound(identifier: string): ShareErrorFactory {
    return new ShareErrorFactory(`Partage introuvable : ${identifier}`, 404, {
      code: 'SHARE_NOT_FOUND',
      identifier
    });
  }

  public static accessDenied(shareId: string, userId: string): ShareErrorFactory {
    return new ShareErrorFactory(`Vous n'avez pas accès à ce partage.`, 403, {
      code: 'SHARE_ACCESS_DENIED',
      identifier: shareId,
      userId
    });
  }

  public static expired(token: string): ShareErrorFactory {
    // 410 Gone est sémantiquement le bon code pour un lien expiré
    return new ShareErrorFactory('Ce lien de partage a expiré.', 410, {
      code: 'SHARE_EXPIRED',
      identifier: token
    });
  }

  public static creation(originalError: string): ShareErrorFactory {
    return new ShareErrorFactory('Erreur lors de la création du partage', 500, {
      code: 'SHARE_CREATION_FAILED',
      originalError
    });
  }

  public static tokenCollision(): ShareErrorFactory {
    return new ShareErrorFactory(
      'Impossible de générer un token de partage unique après plusieurs tentatives',
      500,
      { code: 'SHARE_TOKEN_COLLISION' }
    );
  }
}
