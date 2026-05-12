import { User } from '@/entities/User';
import type { IUserData } from '@/interfaces/entities/user/IUserData';
import type { IUserRepository } from '@/interfaces/repositories/IUserRepository';

export class MockUserRepository implements IUserRepository {
  private users: User[] = [];
  private currentId: number = 1;

  public async findById(id: string): Promise<User | null> {
    return this.users.find((u): boolean => u.getId() === id) ?? null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    return (
      this.users.find((u): boolean => u.getEmail().toLowerCase() === email.toLowerCase()) ?? null
    );
  }

  public async findByPseudo(pseudo: string): Promise<User | null> {
    return (
      this.users.find((u): boolean => u.getPseudo().toLowerCase() === pseudo.toLowerCase()) ?? null
    );
  }

  public async existsByEmail(email: string): Promise<boolean> {
    return this.users.some((u): boolean => u.getEmail().toLowerCase() === email.toLowerCase());
  }

  public async existsByPseudo(pseudo: string): Promise<boolean> {
    return this.users.some((u): boolean => u.getPseudo().toLowerCase() === pseudo.toLowerCase());
  }

  public async create(data: IUserData): Promise<User> {
    const id: string = (this.currentId++).toString();
    const user = new User({
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    this.users.push(user);
    return user;
  }

  public async update(id: string, data: Partial<IUserData>): Promise<User | null> {
    const idx: number = this.users.findIndex((u): boolean => u.getId() === id);
    if (idx === -1) return null;
    const current: IUserData = this.users[idx].toData();
    const updated = new User({ ...current, ...data, id, updatedAt: new Date() });
    this.users[idx] = updated;
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    const before: number = this.users.length;
    this.users = this.users.filter((u): boolean => u.getId() !== id);
    return this.users.length < before;
  }
}
