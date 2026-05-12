import type { User } from '@/entities/User';
import type { IUserData } from '@/interfaces/entities/user/IUserData';
import type { IBaseRepository } from '@/interfaces/repositories/IBaseRepository';

export interface IUserRepository extends IBaseRepository<User, IUserData> {
  findByEmail(email: string): Promise<User | null>;
  findByPseudo(pseudo: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByPseudo(pseudo: string): Promise<boolean>;
}
