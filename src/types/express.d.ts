import type { RoleEnum } from '@/constants/enums/RoleEnum';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        pseudo: string;
        role: RoleEnum;
      };
      id?: string; // populated par le middleware Request ID dans app.ts
    }
  }
}

export {};
