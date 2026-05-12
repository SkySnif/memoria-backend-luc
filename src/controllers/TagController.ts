import type { NextFunction, Request, Response } from 'express';
import { CreateTagDto } from '@/dto/tag/CreateTagDto';
import { ResponseTagDto } from '@/dto/tag/ResponseTagDto';
import { UpdateTagDto } from '@/dto/tag/UpdateTagDto';
import { UserErrorFactory } from '@/exceptions/entities/UserErrorFactory';
import type { ITagController } from '@/interfaces/controllers/ITagController';
import type { ITagService } from '@/interfaces/services/ITagService';
import { ApiResponseFactory } from '@/utils/ApiResponseFactory';
import { RequestIdGenerator } from '@/utils/RequestIdGenerator';

export class TagController implements ITagController {
  public constructor(private readonly tagService: ITagService) {}

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

  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);
      const tags = await this.tagService.listByUser(userId);

      res
        .status(200)
        .json(
          ApiResponseFactory.success(
            'Liste des tags',
            { tags: ResponseTagDto.fromTags(tags) },
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
      const dto = new CreateTagDto(req.body);

      const tag = await this.tagService.create(userId, dto);

      res
        .status(201)
        .json(
          ApiResponseFactory.success('Tag créé', { tag: ResponseTagDto.fromTag(tag) }, requestId)
        );
    } catch (err) {
      next(err);
    }
  }

  public async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId: string = RequestIdGenerator.getFromRequest(req);
      const userId: string = this.getUserId(req);
      const tagId: string = this.getRequiredParam(req, 'id');

      const tag = await this.tagService.findById(userId, tagId);

      res
        .status(200)
        .json(
          ApiResponseFactory.success(
            'Tag récupéré',
            { tag: ResponseTagDto.fromTag(tag) },
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
      const tagId: string = this.getRequiredParam(req, 'id');
      const dto = new UpdateTagDto(req.body);

      const tag = await this.tagService.update(userId, tagId, dto);

      res
        .status(200)
        .json(
          ApiResponseFactory.success(
            'Tag mis à jour',
            { tag: ResponseTagDto.fromTag(tag) },
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
      const tagId: string = this.getRequiredParam(req, 'id');

      await this.tagService.delete(userId, tagId);

      res.status(200).json(ApiResponseFactory.success('Tag supprimé', undefined, requestId));
    } catch (err) {
      next(err);
    }
  }
}
