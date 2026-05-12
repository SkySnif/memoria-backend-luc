import type { IAccessConfig } from '@/interfaces/entities/share/IAccessConfig';
import type { IShare } from '@/interfaces/entities/share/IShare';

export class ResponseShareDto {
  public readonly id: string;
  public readonly itemId: string;
  public readonly recipientEmail: string | null;
  public readonly shareToken: string;
  public readonly shareUrl: string;
  public readonly accessConfig: IAccessConfig;
  public readonly isExpired: boolean;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  private constructor(share: IShare, baseUrl: string) {
    this.id = share.getId();
    this.itemId = share.getItemId();
    this.recipientEmail = share.getRecipientEmail();
    this.shareToken = share.getShareToken();
    this.shareUrl = `${baseUrl}/v1/public/shared/${share.getShareToken()}`;
    this.accessConfig = share.getAccessConfig();
    this.isExpired = share.isExpired();
    this.createdAt = share.getCreatedAt();
    this.updatedAt = share.getUpdatedAt();
  }

  public static fromShare(share: IShare, baseUrl: string): ResponseShareDto {
    return new ResponseShareDto(share, baseUrl);
  }

  public static fromShares(shares: IShare[], baseUrl: string): ResponseShareDto[] {
    return shares.map((s): ResponseShareDto => ResponseShareDto.fromShare(s, baseUrl));
  }
}
