import type { IBaseEntityData } from '@/interfaces/entities/IBaseEntityData';

export interface ITagData extends IBaseEntityData {
  userId: string;
  tagName: string;
}
