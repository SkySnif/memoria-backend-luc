import type { ChangePasswordDto } from '@/dto/user/ChangePasswordDto';
import type { DeleteAccountDto } from '@/dto/user/DeleteAccountDto';
import type { UpdateProfileDto } from '@/dto/user/UpdateProfileDto';
import type { IUser } from '@/interfaces/entities/user/IUser';

export interface IUserService {
  updateProfile(userId: string, dto: UpdateProfileDto): Promise<IUser>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
  deleteAccount(userId: string, dto: DeleteAccountDto): Promise<void>;
}
