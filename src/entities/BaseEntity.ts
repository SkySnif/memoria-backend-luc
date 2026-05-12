import type { IBaseEntityData } from '@/interfaces/entities/IBaseEntityData';
import type { IEntity } from '@/interfaces/entities/IEntity';

/**
 * Classe de base abstraite pour toutes les entités du domaine.
 * Mutualise les champs id/createdAt/updatedAt et leurs getters.
 */
export abstract class BaseEntity<
  T extends IBaseEntityData = IBaseEntityData
> implements IEntity<T> {
  protected readonly id: string;
  protected readonly createdAt?: Date;
  protected readonly updatedAt?: Date;

  protected constructor(data: T) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public getId(): string {
    return this.id;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  public abstract toData(): T;
}
