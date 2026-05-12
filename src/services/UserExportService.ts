import { type IItemWithTags, UserExportDto } from '@/dto/user/UserExportDto';
import type { Item } from '@/entities/Item';
import type { Share } from '@/entities/Share';
import type { Tag } from '@/entities/Tag';
import type { User } from '@/entities/User';
import { UserErrorFactory } from '@/exceptions/entities/UserErrorFactory';
import type { IItemListResult, IItemRepository } from '@/interfaces/repositories/IItemRepository';
import type { IItemTagRepository } from '@/interfaces/repositories/IItemTagRepository';
import type { IShareRepository } from '@/interfaces/repositories/IShareRepository';
import type { ITagRepository } from '@/interfaces/repositories/ITagRepository';
import type { IUserRepository } from '@/interfaces/repositories/IUserRepository';
import type { IUserExportService } from '@/interfaces/services/IUserExportService';

const EXPORT_ITEMS_LIMIT: number = 10000;

export class UserExportService implements IUserExportService {
  public constructor(
    private readonly userRepository: IUserRepository,
    private readonly itemRepository: IItemRepository,
    private readonly itemTagRepository: IItemTagRepository,
    private readonly tagRepository: ITagRepository,
    private readonly shareRepository: IShareRepository
  ) {}

  public async exportUserData(userId: string): Promise<UserExportDto> {
    const user: User | null = await this.userRepository.findById(userId);
    if (!user) throw UserErrorFactory.notFound(userId);

    // Fetch en parallèle pour économiser du temps de round-trip DB
    const [itemList, tags, shares]: [IItemListResult, Tag[], Share[]] = await Promise.all([
      this.itemRepository.listByUser(userId, { limit: EXPORT_ITEMS_LIMIT, offset: 0 }),
      this.tagRepository.findByUserId(userId),
      this.shareRepository.findByUserId(userId)
    ]);

    // Pour chaque item, on récupère ses tags associés. N+1 acceptable pour un export occasionnel.
    const itemsWithTags: IItemWithTags[] = await Promise.all(
      itemList.items.map(
        async (item: Item): Promise<IItemWithTags> => ({
          item,
          tags: await this.itemTagRepository.findTagsForItem(item.getId())
        })
      )
    );

    return UserExportDto.fromData(user, itemsWithTags, tags, shares);
  }
}
