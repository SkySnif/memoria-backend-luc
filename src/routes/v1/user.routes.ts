import { Router } from 'express';
import type { UserController } from '@/controllers/UserController';

export function createUserRouter(userController: UserController): Router {
  const router: Router = Router();

  /**
   * @swagger
   * /v1/users/me:
   *   patch:
   *     summary: Mettre à jour son profil (pseudo, email, settings)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               pseudo: { type: string, minLength: 3, maxLength: 30 }
   *               email: { type: string, format: email }
   *               settingsUser: { type: object }
   *     responses:
   *       200:
   *         description: Profil mis à jour
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
   *       400: { description: Validation échouée }
   *       409: { description: Email ou pseudo déjà utilisé }
   */
  router.patch('/me', userController.updateProfile.bind(userController));

  /**
   * @swagger
   * /v1/users/me/password:
   *   put:
   *     summary: Changer son mot de passe (requiert l'ancien)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [currentPassword, newPassword]
   *             properties:
   *               currentPassword: { type: string, format: password }
   *               newPassword: { type: string, format: password, minLength: 8 }
   *     responses:
   *       200: { description: Mot de passe modifié }
   *       401: { description: Ancien mot de passe incorrect (WRONG_PASSWORD) }
   */
  router.put('/me/password', userController.changePassword.bind(userController));

  /**
   * @swagger
   * /v1/users/me:
   *   delete:
   *     summary: Supprimer son compte (RGPD - cascade sur items, tags, shares)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [password]
   *             properties:
   *               password: { type: string, format: password, description: "Mot de passe pour confirmer" }
   *     responses:
   *       200: { description: Compte supprimé }
   *       401: { description: Mot de passe incorrect }
   */
  router.delete('/me', userController.deleteAccount.bind(userController));

  /**
   * @swagger
   * /v1/users/me/export:
   *   get:
   *     summary: Exporter toutes ses données (RGPD article 20 - portabilité)
   *     description: "Retourne un dump JSON complet : profil + items (avec tags) + tags + shares. Header Content-Disposition fourni pour suggérer un téléchargement."
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Export généré
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
   *                         export:
   *                           type: object
   *                           properties:
   *                             exportDate: { type: string, format: date-time }
   *                             user: { type: object }
   *                             items: { type: array, items: { type: object } }
   *                             tags: { type: array, items: { type: object } }
   *                             shares: { type: array, items: { type: object } }
   */
  router.get('/me/export', userController.exportData.bind(userController));

  return router;
}
