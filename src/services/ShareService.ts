import type { CreateShareDto } from '@/dto/share/CreateShareDto';
import type { UpdateShareDto } from '@/dto/share/UpdateShareDto';
import type { Item } from '@/entities/Item';
import type { Share } from '@/entities/Share';
import { ItemErrorFactory } from '@/exceptions/entities/ItemErrorFactory';
import { ShareErrorFactory } from '@/exceptions/entities/ShareErrorFactory';
import type { IItem } from '@/interfaces/entities/item/IItem';
import type { IShare } from '@/interfaces/entities/share/IShare';
import type { IShareData } from '@/interfaces/entities/share/IShareData';
import type { IItemRepository } from '@/interfaces/repositories/IItemRepository';
import type { IShareRepository } from '@/interfaces/repositories/IShareRepository';
import type { IShareService } from '@/interfaces/services/IShareService';
import { ShareTokenGenerator } from '@/utils/ShareTokenGenerator';

const MAX_TOKEN_GEN_ATTEMPTS: number = 5;

export class ShareService implements IShareService {
  public constructor(
    private readonly shareRepository: IShareRepository,
    private readonly itemRepository: IItemRepository
  ) {}

  /** Génère un shareToken unique. Retry défensif si collision (très improbable). */
  private async generateUniqueToken(): Promise<string> {
    for (let i: number = 0; i < MAX_TOKEN_GEN_ATTEMPTS; i++) {
      const token: string = ShareTokenGenerator.generate();
      const existing: Share | null = await this.shareRepository.findByToken(token);
      if (!existing) return token;
    }
    throw ShareErrorFactory.tokenCollision();
  }

  /** Vérifie qu'un share appartient bien à l'utilisateur via son item. */
  private async ensureOwnership(userId: string, shareId: string): Promise<Share> {
    const share: Share | null = await this.shareRepository.findById(shareId);
    if (!share) throw ShareErrorFactory.notFound(shareId);
    const item: Item | null = await this.itemRepository.findById(share.getItemId());
    if (!item || item.getUserId() !== userId) {
      throw ShareErrorFactory.accessDenied(shareId, userId);
    }
    return share;
  }

  public async create(userId: string, dto: CreateShareDto): Promise<IShare> {
    const item: Item | null = await this.itemRepository.findById(dto.itemId);
    if (!item) throw ItemErrorFactory.notFound(dto.itemId);
    if (item.getUserId() !== userId) throw ItemErrorFactory.accessDenied(dto.itemId, userId);

    const token: string = await this.generateUniqueToken();

    const data: IShareData = {
      id: '',
      itemId: dto.itemId,
      recipientEmail: dto.recipientEmail,
      shareToken: token,
      accessConfig: dto.accessConfig
    };

    return await this.shareRepository.create(data);
  }

  public async findById(userId: string, shareId: string): Promise<IShare> {
    return await this.ensureOwnership(userId, shareId);
  }

  public async listByUser(userId: string): Promise<IShare[]> {
    return await this.shareRepository.findByUserId(userId);
  }

  public async update(userId: string, shareId: string, dto: UpdateShareDto): Promise<IShare> {
    await this.ensureOwnership(userId, shareId);

    const updates: Partial<IShareData> = {};
    if (dto.recipientEmail !== undefined) updates.recipientEmail = dto.recipientEmail;
    if (dto.accessConfig !== undefined) updates.accessConfig = dto.accessConfig;

    const updated: Share | null = await this.shareRepository.update(shareId, updates);
    if (!updated) throw ShareErrorFactory.notFound(shareId);
    return updated;
  }

  public async delete(userId: string, shareId: string): Promise<void> {
    await this.ensureOwnership(userId, shareId);
    const deleted: boolean = await this.shareRepository.delete(shareId);
    if (!deleted) throw ShareErrorFactory.notFound(shareId);
  }

  public async findItemByToken(token: string): Promise<IItem> {
    const share: Share | null = await this.shareRepository.findByToken(token);
    if (!share) throw ShareErrorFactory.notFound(token);
    if (share.isExpired()) throw ShareErrorFactory.expired(token);

    const item: Item | null = await this.itemRepository.findById(share.getItemId());
    // Cas pathologique : le share existe mais son item a disparu (FK CASCADE normalement = ne devrait pas arriver)
    if (!item) throw ShareErrorFactory.notFound(token);
    return item;
  }
}
