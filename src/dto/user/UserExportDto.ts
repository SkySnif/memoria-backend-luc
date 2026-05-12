import type { IAccessConfig } from '@/interfaces/entities/share/IAccessConfig';
import type { IItem } from '@/interfaces/entities/item/IItem';
import type { IShare } from '@/interfaces/entities/share/IShare';
import type { ITag } from '@/interfaces/entities/tag/ITag';
import type { IUser } from '@/interfaces/entities/user/IUser';

interface IExportedTag {
  id: string;
  tagName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IExportedItem {
  id: string;
  contentType: string;
  title: string;
  slug: string;
  content: string;
  sourceAuthor: string;
  thumbnailUrl?: string | null;
  metadata: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  tags: IExportedTag[];
}

interface IExportedShare {
  id: string;
  itemId: string;
  recipientEmail: string | null;
  shareToken: string;
  accessConfig: IAccessConfig;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IExportedUser {
  id: string;
  email: string;
  pseudo: string;
  role: string;
  authProvider: string;
  settingsUser: Record<string, unknown>;
  gdprConsent: boolean;
  gdprConsentDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IItemWithTags {
  item: IItem;
  tags: ITag[];
}

export class UserExportDto {
  public readonly exportDate: string;
  public readonly user: IExportedUser;
  public readonly items: IExportedItem[];
  public readonly tags: IExportedTag[];
  public readonly shares: IExportedShare[];

  private constructor(user: IUser, itemsWithTags: IItemWithTags[], tags: ITag[], shares: IShare[]) {
    this.exportDate = new Date().toISOString();

    this.user = {
      id: user.getId(),
      email: user.getEmail(),
      pseudo: user.getPseudo(),
      role: user.getRole(),
      authProvider: user.getAuthProvider(),
      settingsUser: user.getSettingsUser(),
      gdprConsent: user.getGdprConsentDate() !== null,
      gdprConsentDate: user.getGdprConsentDate(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt()
    };

    this.tags = tags.map(
      (t): IExportedTag => ({
        id: t.getId(),
        tagName: t.getTagName(),
        createdAt: t.getCreatedAt(),
        updatedAt: t.getUpdatedAt()
      })
    );

    this.items = itemsWithTags.map(
      ({ item, tags: itemTags }): IExportedItem => ({
        id: item.getId(),
        contentType: item.getContentType(),
        title: item.getTitle(),
        slug: item.getSlug(),
        content: item.getContent(),
        sourceAuthor: item.getSourceAuthor(),
        thumbnailUrl: item.getThumbnailUrl(),
        metadata: item.getMetadata(),
        createdAt: item.getCreatedAt(),
        updatedAt: item.getUpdatedAt(),
        tags: itemTags.map(
          (t): IExportedTag => ({
            id: t.getId(),
            tagName: t.getTagName(),
            createdAt: t.getCreatedAt(),
            updatedAt: t.getUpdatedAt()
          })
        )
      })
    );

    this.shares = shares.map(
      (s): IExportedShare => ({
        id: s.getId(),
        itemId: s.getItemId(),
        recipientEmail: s.getRecipientEmail(),
        shareToken: s.getShareToken(),
        accessConfig: s.getAccessConfig(),
        createdAt: s.getCreatedAt(),
        updatedAt: s.getUpdatedAt()
      })
    );
  }

  public static fromData(
    user: IUser,
    itemsWithTags: IItemWithTags[],
    tags: ITag[],
    shares: IShare[]
  ): UserExportDto {
    return new UserExportDto(user, itemsWithTags, tags, shares);
  }
}
