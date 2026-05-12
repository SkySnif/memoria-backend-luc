import type { NextFunction, Request, Response } from 'express';
import { PublicShareDto } from '@/dto/share/PublicShareDto';
import type { IPublicShareController } from '@/interfaces/controllers/IPublicShareController';
import type { IShareService } from '@/interfaces/services/IShareService';
import { ApiResponseFactory } from '@/utils/ApiResponseFactory';
import { RequestIdGenerator } from '@/utils/RequestIdGenerator';

export class PublicShareController implements IPublicShareController {
  public constructor(private readonly shareService: IShareService) {}

  public async getByToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const token: string | string[] | undefined = req.params.token;
      if (typeof token !== 'string' || token.length === 0) {
        throw new Error('Token de partage manquant ou invalide');
      }

      const item = await this.shareService.findItemByToken(token);

      res
        .status(200)
        .json(
          ApiResponseFactory.success(
            'Contenu partagé',
            { item: PublicShareDto.fromItem(item) },
            requestId
          )
        );
    } catch (err) {
      next(err);
    }
  }
}
