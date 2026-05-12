import type { Tag } from '@/entities/Tag';

export interface IItemTagRepository {
  /** Ajoute un tag à un item. Idempotent (ON CONFLICT DO NOTHING). */
  add(itemId: string, tagId: string): Promise<void>;
  /** Retire un tag d'un item. Renvoie true si une ligne a été supprimée. */
  remove(itemId: string, tagId: string): Promise<boolean>;
  /** Remplace tous les tags d'un item par la liste fournie (transactionnel). */
  sync(itemId: string, tagIds: ReadonlyArray<string>): Promise<void>;
  /** Récupère les tags associés à un item. */
  findTagsForItem(itemId: string): Promise<Tag[]>;
  /** Supprime toutes les associations d'un item (utilisé avant DELETE item). */
  clearForItem(itemId: string): Promise<void>;
}
