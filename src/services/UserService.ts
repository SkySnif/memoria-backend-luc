import type { ChangePasswordDto } from '@/dto/user/ChangePasswordDto';
import type { DeleteAccountDto } from '@/dto/user/DeleteAccountDto';
import type { UpdateProfileDto } from '@/dto/user/UpdateProfileDto';
import type { User } from '@/entities/User';
import { UserErrorFactory } from '@/exceptions/entities/UserErrorFactory';
import type { IUser } from '@/interfaces/entities/user/IUser';
import type { IUserData } from '@/interfaces/entities/user/IUserData';
import type { IUserRepository } from '@/interfaces/repositories/IUserRepository';
import type { IPasswordHasher } from '@/interfaces/security/IPasswordHasher';
import type { IUserService } from '@/interfaces/services/IUserService';

export class UserService implements IUserService {
  public constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  public async updateProfile(userId: string, dto: UpdateProfileDto): Promise<IUser> {
    const existing: User | null = await this.userRepository.findById(userId);
    if (!existing) throw UserErrorFactory.notFound(userId);

    // Vérifie l'unicité de l'email si changé
    if (dto.email && dto.email.toLowerCase() !== existing.getEmail().toLowerCase()) {
      const byEmail: User | null = await this.userRepository.findByEmail(dto.email);
      if (byEmail) throw UserErrorFactory.profileConflict('email', dto.email);
    }

    // Vérifie l'unicité du pseudo si changé
    if (dto.pseudo && dto.pseudo !== existing.getPseudo()) {
      const byPseudo: User | null = await this.userRepository.findByPseudo(dto.pseudo);
      if (byPseudo) throw UserErrorFactory.profileConflict('pseudo', dto.pseudo);
    }

    const updates: Partial<IUserData> = {};
    if (dto.email !== undefined) updates.email = dto.email;
    if (dto.pseudo !== undefined) updates.pseudo = dto.pseudo;
    if (dto.settingsUser !== undefined) updates.settingsUser = dto.settingsUser;

    const updated: User | null = await this.userRepository.update(userId, updates);
    if (!updated) throw UserErrorFactory.notFound(userId);
    return updated;
  }

  public async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user: User | null = await this.userRepository.findById(userId);
    if (!user) throw UserErrorFactory.notFound(userId);

    const ok: boolean = await this.passwordHasher.verify(
      dto.currentPassword,
      user.getPasswordHash()
    );
    if (!ok) throw UserErrorFactory.wrongPassword();

    const newHash: string = await this.passwordHasher.hash(dto.newPassword);
    const updated: User | null = await this.userRepository.update(userId, {
      passwordHash: newHash
    });
    if (!updated) throw UserErrorFactory.notFound(userId);
  }

  public async deleteAccount(userId: string, dto: DeleteAccountDto): Promise<void> {
    const user: User | null = await this.userRepository.findById(userId);
    if (!user) throw UserErrorFactory.notFound(userId);

    const ok: boolean = await this.passwordHasher.verify(dto.password, user.getPasswordHash());
    if (!ok) throw UserErrorFactory.wrongPassword();

    // FK CASCADE sur items, tags, shares, item_tags → tout est nettoyé en une seule opération
    const deleted: boolean = await this.userRepository.delete(userId);
    if (!deleted) throw UserErrorFactory.notFound(userId);
  }
}
