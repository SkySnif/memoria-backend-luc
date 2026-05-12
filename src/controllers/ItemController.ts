import type { NextFunction, Request, Response } from 'express';
import { CreateItemDto } from '@/dto/item/CreateItemDto';
import { ResponseItemDto } from '@/dto/item/ResponseItemDto';
import { UpdateItemDto } from '@/dto/item/UpdateItemDto';
import { UserErrorFactory } from '@/exceptions/entities/UserErrorFactory';
import type { IItem } from '@/interfaces/entities/item/IItem';
import type { IItemController } from '@/interfaces/controllers/IItemController';
import type { IItemTagRepository } from '@/interfaces/repositories/IItemTagRepository';
import type { IItemService } from '@/interfaces/services/IItemService';
import { ApiResponseFactory } from '@/utils/ApiResponseFactory';
import { RequestIdGenerator } from '@/utils/RequestIdGenerator';

export class ItemController implements IItemController {
  public constructor(
    private readonly itemService: IItemService,
    private readonly itemTagRepository: IItemTagRepository
  ) {}

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

  /** Charge les tags d'un item et retourne le DTO de réponse enrichi. */
  private async enrich(item: IItem): Promise<ResponseItemDto> {
    const tags = await this.itemTagRepository.findTagsForItem(item.getId());
    return ResponseItemDto.fromItem(item, tags);
  }

  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);

      const limit: number = req.query.limit ? Number(req.query.limit) : 20;
      const offset: number = req.query.offset ? Number(req.query.offset) : 0;
      const contentType: string | undefined =
        typeof req.query.contentType === 'string' ? req.query.contentType : undefined;
      const search: string | undefined =
        typeof req.query.search === 'string' ? req.query.search : undefined;

      const result = await this.itemService.listByUser(userId, {
        limit,
        offset,
        contentType,
        search
      });

      const enriched: ResponseItemDto[] = await Promise.all(
        result.items.map((item): Promise<ResponseItemDto> => this.enrich(item))
      );

      const page: number = Math.floor(offset / limit) + 1;

      res
        .status(200)
        .json(
          ApiResponseFactory.paginated(
            'Liste des pépites',
            enriched,
            page,
            limit,
            result.total,
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
      const dto = new CreateItemDto(req.body);

      const item = await this.itemService.create(userId, dto);
      const enriched: ResponseItemDto = await this.enrich(item);

      res
        .status(201)
        .json(ApiResponseFactory.success('Pépite créée', { item: enriched }, requestId));
    } catch (err) {
      next(err);
    }
  }

  public async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);
      const itemId: string = this.getRequiredParam(req, 'id');

      const item = await this.itemService.findById(userId, itemId);
      const enriched: ResponseItemDto = await this.enrich(item);

      res
        .status(200)
        .json(ApiResponseFactory.success('Pépite récupérée', { item: enriched }, requestId));
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);
      const itemId: string = this.getRequiredParam(req, 'id');
      const dto = new UpdateItemDto(req.body);

      const item = await this.itemService.update(userId, itemId, dto);
      const enriched: ResponseItemDto = await this.enrich(item);

      res
        .status(200)
        .json(ApiResponseFactory.success('Pépite mise à jour', { item: enriched }, requestId));
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);
      const itemId: string = this.getRequiredParam(req, 'id');

      await this.itemService.delete(userId, itemId);

      res.status(200).json(ApiResponseFactory.success('Pépite supprimée', undefined, requestId));
    } catch (err) {
      next(err);
    }
  }
}
