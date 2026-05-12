import { BaseEntity } from '@/entities/BaseEntity';
import type { IAccessConfig } from '@/interfaces/entities/share/IAccessConfig';
import type { IShare } from '@/interfaces/entities/share/IShare';
import type { IShareData } from '@/interfaces/entities/share/IShareData';

export class Share extends BaseEntity<IShareData> implements IShare {
  private readonly itemId: string;
  private readonly recipientEmail: string | null;
  private readonly shareToken: string;
  private readonly accessConfig: IAccessConfig;

  public constructor(data: IShareData) {
    super(data);
    this.itemId = data.itemId;
    this.recipientEmail = data.recipientEmail;
    this.shareToken = data.shareToken;
    this.accessConfig = data.accessConfig;
  }

  public getItemId(): string {
    return this.itemId;
  }
  public getRecipientEmail(): string | null {
    return this.recipientEmail;
  }
  public getShareToken(): string {
    return this.shareToken;
  }
  public getAccessConfig(): IAccessConfig {
    return this.accessConfig;
  }

  public isExpired(): boolean {
    if (!this.accessConfig.expiresAt) return false;
    return new Date(this.accessConfig.expiresAt) < new Date();
  }

  public toData(): IShareData {
    return {
      id: this.id,
      itemId: this.itemId,
      recipientEmail: this.recipientEmail,
      shareToken: this.shareToken,
      accessConfig: this.accessConfig,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
