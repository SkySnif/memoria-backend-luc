export interface IBlacklistService {
  add(jti: string, expiresAtEpochSeconds: number): void;
  isBlacklisted(jti: string): boolean;
  size(): number;
}
