import { ApiError } from '@/exceptions/ApiError';

export class PasswordError extends ApiError {
  public static hashFailed(originalError: string): PasswordError {
    return new PasswordError('Échec du hashage du mot de passe', 500, {
      code: 'PASSWORD_HASH_FAILED',
      originalError
    });
  }

  public static verifyFailed(originalError: string): PasswordError {
    return new PasswordError('Échec de la vérification du mot de passe', 500, {
      code: 'PASSWORD_VERIFY_FAILED',
      originalError
    });
  }
}
