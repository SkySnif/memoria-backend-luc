import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { ItemController } from '@/controllers/ItemController';
import { PublicShareController } from '@/controllers/PublicShareController';
import { ShareController } from '@/controllers/ShareController';
import { TagController } from '@/controllers/TagController';
import { UserController } from '@/controllers/UserController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { PgItemRepository } from '@/repositories/PgItemRepository';
import { PgItemTagRepository } from '@/repositories/PgItemTagRepository';
import { PgShareRepository } from '@/repositories/PgShareRepository';
import { PgTagRepository } from '@/repositories/PgTagRepository';
import { PgUserRepository } from '@/repositories/PgUserRepository';
import { createAuthRouter } from '@/routes/v1/auth.routes';
import { createItemRouter } from '@/routes/v1/item.routes';
import { createPublicRouter } from '@/routes/v1/public.routes';
import { createShareRouter } from '@/routes/v1/share.routes';
import { createTagRouter } from '@/routes/v1/tag.routes';
import { createUserRouter } from '@/routes/v1/user.routes';
import { AuthService } from '@/services/AuthService';
import { BlacklistService } from '@/services/BlacklistService';
import { ItemService } from '@/services/ItemService';
import { ShareService } from '@/services/ShareService';
import { TagService } from '@/services/TagService';
import { UserService } from '@/services/UserService';
import { PasswordHasher } from '@/utils/PasswordHasher';
import { TokenManager } from '@/utils/TokenManager';
import { UserExportService } from '@/services/UserExportService';

export function createV1Router(): Router {
  // Utils / sécurité
  const passwordHasher = new PasswordHasher();
  const tokenManager = new TokenManager();
  const blacklistService = new BlacklistService();

  // Repositories
  const userRepository = new PgUserRepository();
  const itemRepository = new PgItemRepository();
  const tagRepository = new PgTagRepository();
  const itemTagRepository = new PgItemTagRepository();
  const shareRepository = new PgShareRepository();

  // Services
  const authService = new AuthService(
    userRepository,
    passwordHasher,
    tokenManager,
    blacklistService
  );
  const itemService = new ItemService(itemRepository, itemTagRepository, tagRepository);
  const tagService = new TagService(tagRepository);
  const shareService = new ShareService(shareRepository, itemRepository);
  const userService = new UserService(userRepository, passwordHasher);
  const userExportService = new UserExportService(
    userRepository,
    itemRepository,
    itemTagRepository,
    tagRepository,
    shareRepository
  );
  // Middleware
  const authMiddleware = new AuthMiddleware(tokenManager, blacklistService);

  // Controllers
  const authController = new AuthController(authService, userRepository);
  const itemController = new ItemController(itemService, itemTagRepository);
  const tagController = new TagController(tagService);
  const shareController = new ShareController(shareService);
  const publicShareController = new PublicShareController(shareService);
  const userController = new UserController(userService, userExportService);

  // Assemblage
  const v1: Router = Router();
  v1.use('/auth', createAuthRouter(authController, authMiddleware));
  v1.use('/items', authMiddleware.requireAuth(), createItemRouter(itemController));
  v1.use('/tags', authMiddleware.requireAuth(), createTagRouter(tagController));
  v1.use('/shares', authMiddleware.requireAuth(), createShareRouter(shareController));
  v1.use('/users', authMiddleware.requireAuth(), createUserRouter(userController));
  v1.use('/public', createPublicRouter(publicShareController));

  return v1;
}
