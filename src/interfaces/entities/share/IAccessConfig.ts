/** Configuration du JSONB `access_config` d'un partage. */
export interface IAccessConfig {
  /** ISO 8601. Si absent, le partage n'expire jamais. */
  expiresAt?: string;
}
