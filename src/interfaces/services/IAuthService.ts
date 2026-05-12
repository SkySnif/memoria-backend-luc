import type { CreateUserDto } from '@/dto/user/CreateUserDto';
import type { LoginDto } from '@/dto/user/auth/LoginDto';
import type { RefreshTokenDto } from '@/dto/user/auth/RefreshTokenDto';
import type { IUser } from '@/interfaces/entities/user/IUser';

export interface IAuthResult {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshResult {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService {
  register(dto: CreateUserDto): Promise<IUser>;
  login(dto: LoginDto): Promise<IAuthResult>;
  refresh(dto: RefreshTokenDto): Promise<IRefreshResult>;
  logout(refreshToken: string): Promise<void>;
}
