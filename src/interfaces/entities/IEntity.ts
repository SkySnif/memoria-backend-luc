import type { IBaseEntityData } from '@/interfaces/entities/IBaseEntityData';

/**
 * Contrat générique d'une entité du domaine.
 * Toute entité doit exposer ses champs de base et savoir se sérialiser.
 */
export interface IEntity<T extends IBaseEntityData = IBaseEntityData> {
  getId(): string;
  getCreatedAt(): Date | undefined;
  getUpdatedAt(): Date | undefined;
  toData(): T;
}
