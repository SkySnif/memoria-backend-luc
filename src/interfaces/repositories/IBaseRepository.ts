import type { IBaseEntityData } from '@/interfaces/entities/IBaseEntityData';
import type { IEntity } from '@/interfaces/entities/IEntity';

export interface IBaseRepository<TEntity extends IEntity<TData>, TData extends IBaseEntityData> {
  findById(id: string): Promise<TEntity | null>;
  create(data: TData): Promise<TEntity>;
  update(id: string, data: Partial<TData>): Promise<TEntity | null>;
  delete(id: string): Promise<boolean>;
}
