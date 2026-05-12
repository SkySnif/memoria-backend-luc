import { Router } from 'express';
import type { ShareController } from '@/controllers/ShareController';

export function createShareRouter(shareController: ShareController): Router {
  const router: Router = Router();

  /**
   * @swagger
   * /v1/shares:
   *   get:
   *     summary: Lister tous les partages créés par l'utilisateur
   *     tags: [Shares]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Liste des partages
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
   *                         shares:
   *                           type: array
   *                           items: { $ref: '#/components/schemas/Share' }
   */
  router.get('/', shareController.list.bind(shareController));

  /**
   * @swagger
   * /v1/shares:
   *   post:
   *     summary: Créer un lien de partage public pour une pépite
   *     tags: [Shares]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [itemId]
   *             properties:
   *               itemId: { type: string, format: uuid }
   *               recipientEmail: { type: string, format: email, nullable: true, example: ami@example.com }
   *               accessConfig:
   *                 type: object
   *                 properties:
   *                   expiresAt:
   *                     type: string
   *                     format: date-time
   *                     description: "ISO 8601. Si absent, le partage n'expire jamais."
   *                     example: 2026-12-31T23:59:59Z
   *     responses:
   *       201:
   *         description: Partage créé
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
   *                         share: { $ref: '#/components/schemas/Share' }
   *       403: { description: "La pépite n'appartient pas à l'utilisateur" }
   *       404: { description: Pépite introuvable }
   */
  router.post('/', shareController.create.bind(shareController));

  /**
   * @swagger
   * /v1/shares/{id}:
   *   get:
   *     summary: Récupérer les détails d'un partage
   *     tags: [Shares]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       200: { description: Partage trouvé }
   *       403: { description: Pas autorisé }
   *       404: { description: Partage introuvable }
   */
  router.get('/:id', shareController.findById.bind(shareController));

  /**
   * @swagger
   * /v1/shares/{id}:
   *   patch:
   *     summary: Modifier un partage (expiration ou destinataire)
   *     tags: [Shares]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               recipientEmail: { type: string, format: email, nullable: true }
   *               accessConfig:
   *                 type: object
   *                 properties:
   *                   expiresAt: { type: string, format: date-time }
   *     responses:
   *       200: { description: Partage mis à jour }
   *       403: { description: Pas autorisé }
   *       404: { description: Partage introuvable }
   */
  router.patch('/:id', shareController.update.bind(shareController));

  /**
   * @swagger
   * /v1/shares/{id}:
   *   delete:
   *     summary: Révoquer un partage (le lien public ne fonctionnera plus)
   *     tags: [Shares]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       200: { description: Partage révoqué }
   *       403: { description: Pas autorisé }
   *       404: { description: Partage introuvable }
   */
  router.delete('/:id', shareController.delete.bind(shareController));

  return router;
}
