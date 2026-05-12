import type { NextFunction, Request, Response } from 'express';
import { ChangePasswordDto } from '@/dto/user/ChangePasswordDto';
import { DeleteAccountDto } from '@/dto/user/DeleteAccountDto';
import { ResponseUserDto } from '@/dto/user/ResponseUserDto';
import { UpdateProfileDto } from '@/dto/user/UpdateProfileDto';
import { UserErrorFactory } from '@/exceptions/entities/UserErrorFactory';
import type { IUserController } from '@/interfaces/controllers/IUserController';
import type { IUserExportService } from '@/interfaces/services/IUserExportService';
import type { IUserService } from '@/interfaces/services/IUserService';
import { ApiResponseFactory } from '@/utils/ApiResponseFactory';
import { RequestIdGenerator } from '@/utils/RequestIdGenerator';

export class UserController implements IUserController {
  public constructor(
    private readonly userService: IUserService,
    private readonly userExportService: IUserExportService
  ) {}

  private getUserId(req: Request): string {
    const id: string | undefined = req.user?.id;
    if (!id) throw UserErrorFactory.invalidCredentials();
    return id;
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);
      const dto = new UpdateProfileDto(req.body);

      const user = await this.userService.updateProfile(userId, dto);

      res
        .status(200)
        .json(
          ApiResponseFactory.success(
            'Profil mis à jour',
            { user: ResponseUserDto.fromUser(user) },
            requestId
          )
        );
    } catch (err) {
      next(err);
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);
      const dto = new ChangePasswordDto(req.body);

      await this.userService.changePassword(userId, dto);

      res
        .status(200)
        .json(ApiResponseFactory.success('Mot de passe modifié', undefined, requestId));
    } catch (err) {
      next(err);
    }
  }

  public async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);
      const dto = new DeleteAccountDto(req.body);

      await this.userService.deleteAccount(userId, dto);

      res.status(200).json(ApiResponseFactory.success('Compte supprimé', undefined, requestId));
    } catch (err) {
      next(err);
    }
  }

  public async exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);

      const exportData = await this.userExportService.exportUserData(userId);

      // Header pour suggérer un téléchargement au navigateur (le frontend peut respecter ou non)
      const dateStr: string = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Disposition', `attachment; filename="memoria-export-${dateStr}.json"`);

      res
        .status(200)
        .json(ApiResponseFactory.success('Export RGPD généré', { export: exportData }, requestId));
    } catch (err) {
      next(err);
    }
  }
}
