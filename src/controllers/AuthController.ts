import type { NextFunction, Request, Response } from 'express';
import { LoggerSingleton } from '@/config/LoggerSingleton';
import { CreateUserDto } from '@/dto/user/CreateUserDto';
import { LoginDto } from '@/dto/user/auth/LoginDto';
import { RefreshTokenDto } from '@/dto/user/auth/RefreshTokenDto';
import { ResponseUserDto } from '@/dto/user/ResponseUserDto';
import { UserErrorFactory } from '@/exceptions/entities/UserErrorFactory';
import type { IAuthController } from '@/interfaces/controllers/IAuthController';
import type { IUserRepository } from '@/interfaces/repositories/IUserRepository';
import type { IAuthService } from '@/interfaces/services/IAuthService';
import { ApiResponseFactory } from '@/utils/ApiResponseFactory';
import { RequestIdGenerator } from '@/utils/RequestIdGenerator';

export class AuthController implements IAuthController {
  private readonly logger = LoggerSingleton.getInstance();

  public constructor(
    private readonly authService: IAuthService,
    private readonly userRepository: IUserRepository
  ) {}

  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const dto = new CreateUserDto(req.body);

      this.logger.info({ requestId, email: dto.email, pseudo: dto.pseudo }, 'register attempt');
      const user = await this.authService.register(dto);

      res
        .status(201)
        .json(
          ApiResponseFactory.success(
            'Inscription réussie. Vous pouvez maintenant vous connecter.',
            { user: ResponseUserDto.fromUser(user) },
            requestId
          )
        );
    } catch (err) {
      next(err);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const dto = new LoginDto(req.body);

      const result = await this.authService.login(dto);

      res.status(200).json(
        ApiResponseFactory.success(
          'Connexion réussie',
          {
            user: ResponseUserDto.fromUser(result.user),
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
          },
          requestId
        )
      );
    } catch (err) {
      next(err);
    }
  }

  public async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const dto = new RefreshTokenDto(req.body);
      const result = await this.authService.refresh(dto);

      res
        .status(200)
        .json(
          ApiResponseFactory.success(
            'Tokens régénérés',
            { accessToken: result.accessToken, refreshToken: result.refreshToken },
            requestId
          )
        );
    } catch (err) {
      next(err);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const dto = new RefreshTokenDto(req.body);
      await this.authService.logout(dto.refreshToken);

      res.status(200).json(ApiResponseFactory.success('Déconnexion réussie', undefined, requestId));
    } catch (err) {
      next(err);
    }
  }

  public async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string | undefined = req.user?.id;
      if (!userId) throw UserErrorFactory.invalidCredentials();

      const user = await this.userRepository.findById(userId);
      if (!user) throw UserErrorFactory.notFound(userId);

      res
        .status(200)
        .json(
          ApiResponseFactory.success(
            'Profil utilisateur',
            { user: ResponseUserDto.fromUser(user) },
            requestId
          )
        );
    } catch (err) {
      next(err);
    }
  }
}
