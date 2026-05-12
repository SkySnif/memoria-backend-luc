import { randomUUID } from 'node:crypto';
import type { Request } from 'express';

/**
 * Génère / récupère un identifiant unique de requête (corrélation des logs).
 */
export class RequestIdGenerator {
  private static readonly HEADER_NAME = 'x-request-id';

  public static generate(): string {
    return randomUUID();
  }

  public static getFromRequest(req: Request): string {
    const header: string | undefined = req.header(RequestIdGenerator.HEADER_NAME);
    if (typeof header === 'string' && header.length > 0) {
      return header;
    }
    const local = (req as Request & { id?: string }).id;
    if (typeof local === 'string' && local.length > 0) {
      return local;
    }
    return RequestIdGenerator.generate();
  }
}
