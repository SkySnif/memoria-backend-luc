import type { Share } from '@/entities/Share';
import type { IShareData } from '@/interfaces/entities/share/IShareData';
import type { IBaseRepository } from '@/interfaces/repositories/IBaseRepository';

export interface IShareRepository extends IBaseRepository<Share, IShareData> {
  /** Récupère un partage par son token public. */
  findByToken(token: string): Promise<Share | null>;
  /** Récupère tous les partages d'un item donné. */
  findByItemId(itemId: string): Promise<Share[]>;
  /** Récupère tous les partages créés par un utilisateur (JOIN via items). */
  findByUserId(userId: string): Promise<Share[]>;
}
