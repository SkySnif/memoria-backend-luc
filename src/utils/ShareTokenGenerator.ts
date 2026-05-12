import { randomBytes } from 'node:crypto';

export class ShareTokenGenerator {
  /**
   * Génère un token URL-safe d'environ 32 caractères (≈192 bits d'entropie).
   * Utilise base64url (sans padding, sans `+`/`/`) pour pouvoir le mettre direct dans une URL.
   */
  public static generate(): string {
    return randomBytes(24).toString('base64url');
  }
}
