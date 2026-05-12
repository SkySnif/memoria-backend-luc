import type { NextFunction, Request, Response } from 'express';
import { CreateShareDto } from '@/dto/share/CreateShareDto';
import { ResponseShareDto } from '@/dto/share/ResponseShareDto';
import { UpdateShareDto } from '@/dto/share/UpdateShareDto';
import { UserErrorFactory } from '@/exceptions/entities/UserErrorFactory';
import type { IShareController } from '@/interfaces/controllers/IShareController';
import type { IShareService } from '@/interfaces/services/IShareService';
import { ApiResponseFactory } from '@/utils/ApiResponseFactory';
import { RequestIdGenerator } from '@/utils/RequestIdGenerator';

export class ShareController implements IShareController {
  public constructor(private readonly shareService: IShareService) {}

  private getUserId(req: Request): string {
    const id: string | undefined = req.user?.id;
    if (!id) throw UserErrorFactory.invalidCredentials();
    return id;
  }

  private getRequiredParam(req: Request, name: string): string {
    const value: string | string[] | undefined = req.params[name];
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(`Path parameter "${name}" is missing or invalid`);
    }
    return value;
  }

  /** Construit l'URL absolue de l'API à partir de la requête (utile pour shareUrl). */
  private buildBaseUrl(req: Request): string {
    return `${req.protocol}://${req.get('host') ?? 'localhost'}`;
  }

  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);
      const baseUrl: string = this.buildBaseUrl(req);

      const shares = await this.shareService.listByUser(userId);

      res
        .status(200)
        .json(
          ApiResponseFactory.success(
            'Liste des partages',
            { shares: ResponseShareDto.fromShares(shares, baseUrl) },
            requestId
          )
        );
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);
      const baseUrl: string = this.buildBaseUrl(req);
      const dto = new CreateShareDto(req.body);

      const share = await this.shareService.create(userId, dto);

      res
        .status(201)
        .json(
          ApiResponseFactory.success(
            'Partage créé',
            { share: ResponseShareDto.fromShare(share, baseUrl) },
            requestId
          )
        );
    } catch (err) {
      next(err);
    }
  }

  public async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);
      const baseUrl: string = this.buildBaseUrl(req);
      const shareId: string = this.getRequiredParam(req, 'id');

      const share = await this.shareService.findById(userId, shareId);

      res
        .status(200)
        .json(
          ApiResponseFactory.success(
            'Partage récupéré',
            { share: ResponseShareDto.fromShare(share, baseUrl) },
            requestId
          )
        );
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);
      const baseUrl: string = this.buildBaseUrl(req);
      const shareId: string = this.getRequiredParam(req, 'id');
      const dto = new UpdateShareDto(req.body);

      const share = await this.shareService.update(userId, shareId, dto);

      res
        .status(200)
        .json(
          ApiResponseFactory.success(
            'Partage mis à jour',
            { share: ResponseShareDto.fromShare(share, baseUrl) },
            requestId
          )
        );
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);
      const shareId: string = this.getRequiredParam(req, 'id');

      await this.shareService.delete(userId, shareId);

      res.status(200).json(ApiResponseFactory.success('Partage révoqué', undefined, requestId));
    } catch (err) {
      next(err);
    }
  }
}
