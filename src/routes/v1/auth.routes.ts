import { Router } from 'express';
import type { AuthController } from '@/controllers/AuthController';
import type { AuthMiddleware } from '@/middlewares/AuthMiddleware';

export function createAuthRouter(
  authController: AuthController,
  authMiddleware: AuthMiddleware
): Router {
  const router: Router = Router();

  /**
   * @swagger
   * /v1/auth/register:
   *   post:
   *     summary: Créer un compte utilisateur
   *     tags: [Auth]
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password, pseudo, gdprConsent]
   *             properties:
   *               email: { type: string, format: email, example: alice@example.com }
   *               password: { type: string, format: password, minLength: 8, example: MotDePasseSur1 }
   *               pseudo: { type: string, minLength: 3, maxLength: 30, example: alice }
   *               gdprConsent: { type: boolean, example: true }
   *     responses:
   *       201:
   *         description: Compte créé
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponseSuccess'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         user: { $ref: '#/components/schemas/User' }
   *       400:
   *         description: Validation échouée
   *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiResponseError' } } }
   *       409:
   *         description: Email ou pseudo déjà utilisé
   *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiResponseError' } } }
   */
  router.post('/register', authController.register.bind(authController));

  /**
   * @swagger
   * /v1/auth/login:
   *   post:
   *     summary: Se connecter et obtenir un accessToken + refreshToken
   *     tags: [Auth]
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email: { type: string, format: email }
   *               password: { type: string, format: password }
   *     responses:
   *       200:
   *         description: Connexion réussie
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponseSuccess'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         user: { $ref: '#/components/schemas/User' }
   *                         accessToken: { type: string }
   *                         refreshToken: { type: string }
   *       401:
   *         description: Identifiants incorrects
   *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiResponseError' } } }
   */
  router.post('/login', authController.login.bind(authController));

  /**
   * @swagger
   * /v1/auth/refresh:
   *   post:
   *     summary: Échanger un refreshToken contre un nouveau couple access + refresh
   *     tags: [Auth]
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [refreshToken]
   *             properties:
   *               refreshToken: { type: string }
   *     responses:
   *       200:
   *         description: Nouveaux tokens émis (l'ancien refreshToken est révoqué)
   *       401:
   *         description: Token invalide, expiré ou révoqué
   *         content: { application/json: { schema: { $ref: '#/components/schemas/ApiResponseError' } } }
   */
  router.post('/refresh', authController.refresh.bind(authController));

  /**
   * @swagger
   * /v1/auth/logout:
   *   post:
   *     summary: Se déconnecter (blackliste l'accessToken et le refreshToken courants)
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Déconnexion réussie
   *       401:
   *         description: Non authentifié
   */
  router.post('/logout', authMiddleware.requireAuth(), authController.logout.bind(authController));

  /**
   * @swagger
   * /v1/auth/me:
   *   get:
   *     summary: Récupérer son propre profil
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Profil utilisateur
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponseSuccess'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         user: { $ref: '#/components/schemas/User' }
   *       401:
   *         description: Non authentifié
   */
  router.get('/me', authMiddleware.requireAuth(), authController.me.bind(authController));

  return router;
}
