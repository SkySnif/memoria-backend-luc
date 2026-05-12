import type { CreateShareDto } from '@/dto/share/CreateShareDto';
import type { UpdateShareDto } from '@/dto/share/UpdateShareDto';
import type { IItem } from '@/interfaces/entities/item/IItem';
import type { IShare } from '@/interfaces/entities/share/IShare';

export interface IShareService {
  create(userId: string, dto: CreateShareDto): Promise<IShare>;
  findById(userId: string, shareId: string): Promise<IShare>;
  listByUser(userId: string): Promise<IShare[]>;
  update(userId: string, shareId: string, dto: UpdateShareDto): Promise<IShare>;
  delete(userId: string, shareId: string): Promise<void>;
  /** Public — récupère l'item via le token. Lève si introuvable ou expiré. */
  findItemByToken(token: string): Promise<IItem>;
}
