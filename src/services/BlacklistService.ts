import type { IBlacklistService } from '@/interfaces/security/IBlacklistService';

/**
 * Blacklist en mémoire des jti (token IDs) révoqués.
 * Limitation : perdu au redémarrage du serveur. Pour une vraie persistance,
 * migrer vers Redis ou une table PostgreSQL.
 *
 * Format interne : jti → exp (timestamp unix en secondes).
 */
export class BlacklistService implements IBlacklistService {
  private readonly entries: Map<string, number> = new Map();

  public add(jti: string, expiresAtEpochSeconds: number): void {
    this.entries.set(jti, expiresAtEpochSeconds);
    this.cleanup();
  }

  public isBlacklisted(jti: string): boolean {
    const exp: number | undefined = this.entries.get(jti);
    if (exp === undefined) return false;
    if (this.nowSeconds() > exp) {
      this.entries.delete(jti);
      return false;
    }
    return true;
  }

  public size(): number {
    return this.entries.size;
  }

  /**
   * Nettoie les entrées expirées. Appelé à chaque ajout pour limiter la croissance.
   * Pour très haut volume, remplacer par un setInterval périodique.
   */
  private cleanup(): void {
    const now: number = this.nowSeconds();
    for (const [jti, exp] of this.entries) {
      if (now > exp) this.entries.delete(jti);
    }
  }

  private nowSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }
}
