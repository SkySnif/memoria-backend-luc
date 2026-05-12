import { Router } from 'express';
import type { ItemController } from '@/controllers/ItemController';

export function createItemRouter(itemController: ItemController): Router {
  const router: Router = Router();

  /**
   * @swagger
   * /v1/items:
   *   get:
   *     summary: Lister les pépites de l'utilisateur courant (paginé)
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
   *       - in: query
   *         name: offset
   *         schema: { type: integer, minimum: 0, default: 0 }
   *       - in: query
   *         name: contentType
   *         schema: { type: string, enum: [livre, podcast, article, video, note] }
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *         description: Recherche full-text sur titre et contenu
   *     responses:
   *       200:
   *         description: Liste paginée des pépites (incluant leurs tags)
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponseSuccess'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items: { $ref: '#/components/schemas/Item' }
   *       401: { description: Non authentifié }
   */
  router.get('/', itemController.list.bind(itemController));

  /**
   * @swagger
   * /v1/items:
   *   post:
   *     summary: Créer une nouvelle pépite
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [contentType, title, content]
   *             properties:
   *               contentType: { type: string, enum: [livre, podcast, article, video, note], example: livre }
   *               title: { type: string, maxLength: 255, example: Sapiens }
   *               slug: { type: string, description: "Optionnel, auto-généré depuis le titre si absent" }
   *               content: { type: string, example: "Une histoire brève de l'humanité" }
   *               sourceAuthor: { type: string, maxLength: 50, default: N.C, example: Yuval Noah Harari }
   *               thumbnailUrl: { type: string, format: uri, nullable: true }
   *               metadata: { type: object, default: {} }
   *               tagIds:
   *                 type: array
   *                 items: { type: string, format: uuid }
   *                 description: IDs des tags à associer (doivent appartenir à l'utilisateur)
   *     responses:
   *       201:
   *         description: Pépite créée
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
   *                         item: { $ref: '#/components/schemas/Item' }
   *       400: { description: Validation échouée }
   *       401: { description: Non authentifié }
   *       404: { description: "Un ou plusieurs tagIds n'existent pas" }
   *       409: { description: Titre ou slug déjà utilisé }
   */
  router.post('/', itemController.create.bind(itemController));

  /**
   * @swagger
   * /v1/items/{id}:
   *   get:
   *     summary: Récupérer une pépite par son ID (avec ses tags)
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       200:
   *         description: Pépite trouvée
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
   *                         item: { $ref: '#/components/schemas/Item' }
   *       403: { description: "Pas autorisé (n'appartient pas à l'utilisateur)" }
   *       404: { description: Pépite introuvable }
   */
  router.get('/:id', itemController.findById.bind(itemController));

  /**
   * @swagger
   * /v1/items/{id}:
   *   patch:
   *     summary: Mettre à jour une pépite (champs partiels)
   *     tags: [Items]
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
   *               contentType: { type: string, enum: [livre, podcast, article, video, note] }
   *               title: { type: string }
   *               slug: { type: string }
   *               content: { type: string }
   *               sourceAuthor: { type: string }
   *               thumbnailUrl: { type: string, format: uri, nullable: true }
   *               metadata: { type: object }
   *               tagIds:
   *                 type: array
   *                 items: { type: string, format: uuid }
   *                 description: "Remplace complètement l'ensemble des tags (sync). Passer [] pour tout retirer."
   *     responses:
   *       200:
   *         description: Pépite mise à jour
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
   *                         item: { $ref: '#/components/schemas/Item' }
   *       400: { description: Validation échouée }
   *       403: { description: Pas autorisé }
   *       404: { description: Pépite ou tagId introuvable }
   */
  router.patch('/:id', itemController.update.bind(itemController));

  /**
   * @swagger
   * /v1/items/{id}:
   *   delete:
   *     summary: Supprimer une pépite (cascade sur item_tags et shares)
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       200: { description: Pépite supprimée }
   *       403: { description: Pas autorisé }
   *       404: { description: Pépite introuvable }
   */
  router.delete('/:id', itemController.delete.bind(itemController));

  return router;
}
