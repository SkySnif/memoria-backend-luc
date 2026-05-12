import { hash as argonHash, verify as argonVerify } from '@node-rs/argon2';
import { PasswordError } from '@/exceptions/security/PasswordError';
import type { IPasswordHasher } from '@/interfaces/security/IPasswordHasher';

/**
 * Hashing de mots de passe via Argon2id.
 * Paramètres conformes aux recommandations OWASP 2025.
 */
export class PasswordHasher implements IPasswordHasher {
  private static readonly MEMORY_COST: number = 19_456; // ~19 MB
  private static readonly TIME_COST: number = 2;
  private static readonly PARALLELISM: number = 1;

  public async hash(plaintext: string): Promise<string> {
    try {
      return await argonHash(plaintext, {
        memoryCost: PasswordHasher.MEMORY_COST,
        timeCost: PasswordHasher.TIME_COST,
        parallelism: PasswordHasher.PARALLELISM
      });
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw PasswordError.hashFailed(msg);
    }
  }

  public async verify(plaintext: string, hashStr: string): Promise<boolean> {
    try {
      return await argonVerify(hashStr, plaintext);
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw PasswordError.verifyFailed(msg);
    }
  }
}
