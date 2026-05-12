import { AuthProviderEnum } from '@/constants/enums/AuthProviderEnum';
import { RoleEnum } from '@/constants/enums/RoleEnum';
import type { CreateUserDto } from '@/dto/user/CreateUserDto';
import type { LoginDto } from '@/dto/user/auth/LoginDto';
import type { RefreshTokenDto } from '@/dto/user/auth/RefreshTokenDto';
import type { User } from '@/entities/User';
import { ConflictErrorFactory } from '@/exceptions/ConflictErrorFactory';
import { UserErrorFactory } from '@/exceptions/entities/UserErrorFactory';
import { TokenError } from '@/exceptions/security/TokenError';
import type { IUser } from '@/interfaces/entities/user/IUser';
import type { IUserData } from '@/interfaces/entities/user/IUserData';
import type { IUserRepository } from '@/interfaces/repositories/IUserRepository';
import type { IPasswordHasher } from '@/interfaces/security/IPasswordHasher';
import type { IBlacklistService } from '@/interfaces/security/IBlacklistService';
import type { ITokenManager } from '@/interfaces/security/ITokenManager';
import type { IAuthResult, IAuthService, IRefreshResult } from '@/interfaces/services/IAuthService';

export class AuthService implements IAuthService {
  public constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenManager: ITokenManager,
    private readonly blacklistService: IBlacklistService
  ) {}

  public async register(dto: CreateUserDto): Promise<IUser> {
    // 1. Vérifie unicité email et pseudo (fail-fast avant le hash coûteux)
    const existingEmail: User | null = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw UserErrorFactory.emailExists(dto.email);
    }
    const existingPseudo: User | null = await this.userRepository.findByPseudo(dto.pseudo);
    if (existingPseudo) {
      throw ConflictErrorFactory.usernameExists(dto.pseudo);
    }

    // 2. Hash du mot de passe
    const passwordHash: string = await this.passwordHasher.hash(dto.password);

    // 3. Construit IUserData pour le repository
    const userData: IUserData = {
      id: '', // généré par PG via gen_random_uuid()
      email: dto.email,
      passwordHash,
      pseudo: dto.pseudo,
      role: RoleEnum.CUSTOMER,
      authProvider: AuthProviderEnum.LOCAL,
      settingsUser: {},
      gdprConsent: dto.gdprConsent,
      gdprConsentDate: new Date()
    };

    // 4. Persistance (le repo gère les conflits restants : 23505)
    return await this.userRepository.create(userData);
  }

  public async login(dto: LoginDto): Promise<IAuthResult> {
    const user: User | null = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw UserErrorFactory.invalidCredentials();
    }

    const isValid: boolean = await this.passwordHasher.verify(dto.password, user.getPasswordHash());
    if (!isValid) {
      throw UserErrorFactory.invalidCredentials();
    }

    const { accessToken, refreshToken } = await this.tokenManager.generateTokens({
      sub: user.getId(),
      email: user.getEmail(),
      pseudo: user.getPseudo(),
      role: user.getRole()
    });

    return { user, accessToken, refreshToken };
  }

  public async refresh(dto: RefreshTokenDto): Promise<IRefreshResult> {
    // 1. Vérifie la signature et la non-expiration
    const payload = await this.tokenManager.verifyRefreshToken(dto.refreshToken);

    // 2. Vérifie que le jti n'est pas dans la blacklist
    if (payload.jti && this.blacklistService.isBlacklisted(payload.jti)) {
      throw TokenError.revoked();
    }

    // 3. Vérifie que l'utilisateur existe toujours
    const user: User | null = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw UserErrorFactory.notFound(payload.sub);
    }

    // 4. Rotation : l'ancien refresh token est invalidé
    if (payload.jti && payload.exp) {
      this.blacklistService.add(payload.jti, payload.exp);
    }

    // 5. Génère un nouveau couple
    const tokens = await this.tokenManager.generateTokens({
      sub: user.getId(),
      email: user.getEmail(),
      pseudo: user.getPseudo(),
      role: user.getRole()
    });

    return tokens;
  }

  public async logout(refreshToken: string): Promise<void> {
    try {
      const payload = await this.tokenManager.verifyRefreshToken(refreshToken);
      if (payload.jti && payload.exp) {
        this.blacklistService.add(payload.jti, payload.exp);
      }
    } catch {
      // Logout silencieux : un token invalide est de toute façon déjà inutilisable
    }
  }
}
