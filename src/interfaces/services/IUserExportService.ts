import type { UserExportDto } from '@/dto/user/UserExportDto';

export interface IUserExportService {
  /** Agrège toutes les données d'un utilisateur (RGPD article 20). */
  exportUserData(userId: string): Promise<UserExportDto>;
}
