import { ApiError } from '@/exceptions/ApiError';

export class UserErrorFactory extends ApiError {
  public static notFound(identifier: string): UserErrorFactory {
    return new UserErrorFactory(`Utilisateur introuvable : ${identifier}`, 404, {
      code: 'USER_NOT_FOUND',
      identifier
    });
  }

  public static emailExists(email: string): UserErrorFactory {
    return new UserErrorFactory(`L'email « ${email} » est déjà utilisé.`, 409, {
      code: 'USER_EMAIL_EXISTS',
      field: 'email',
      value: email
    });
  }

  public static invalidCredentials(): UserErrorFactory {
    return new UserErrorFactory('Email ou mot de passe incorrect.', 401, {
      code: 'INVALID_CREDENTIALS'
    });
  }

  public static creation(originalError: string): UserErrorFactory {
    return new UserErrorFactory("Erreur lors de la création de l'utilisateur", 500, {
      code: 'USER_CREATION_FAILED',
      originalError
    });
  }

  public static wrongPassword(): UserErrorFactory {
    return new UserErrorFactory('Mot de passe actuel incorrect.', 401, {
      code: 'WRONG_PASSWORD'
    });
  }

  public static profileConflict(field: string, value: string): UserErrorFactory {
    return new UserErrorFactory(`Le champ « ${field} » est déjà utilisé.`, 409, {
      code: 'PROFILE_CONFLICT',
      field,
      value
    });
  }
}
