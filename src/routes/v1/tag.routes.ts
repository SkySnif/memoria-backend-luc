import { Router } from 'express';
import type { TagController } from '@/controllers/TagController';

export function createTagRouter(tagController: TagController): Router {
  const router: Router = Router();

  /**
   * @swagger
   * /v1/tags:
   *   get:
   *     summary: Lister tous les tags de l'utilisateur (ordre alphabétique)
   *     tags: [Tags]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Liste des tags
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
   *                         tags:
   *                           type: array
   *                           items: { $ref: '#/components/schemas/Tag' }
   *       401: { description: Non authentifié }
   */
  router.get('/', tagController.list.bind(tagController));

  /**
   * @swagger
   * /v1/tags:
   *   post:
   *     summary: Créer un nouveau tag
   *     tags: [Tags]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [tagName]
   *             properties:
   *               tagName: { type: string, maxLength: 50, example: philosophie }
   *     responses:
   *       201:
   *         description: Tag créé
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
   *                         tag: { $ref: '#/components/schemas/Tag' }
   *       400: { description: Validation échouée }
   *       409: { description: Nom de tag déjà utilisé (TAG_NAME_EXISTS) }
   */
  router.post('/', tagController.create.bind(tagController));

  /**
   * @swagger
   * /v1/tags/{id}:
   *   get:
   *     summary: Récupérer un tag par ID
   *     tags: [Tags]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       200: { description: Tag trouvé }
   *       403: { description: Pas autorisé }
   *       404: { description: Tag introuvable }
   */
  router.get('/:id', tagController.findById.bind(tagController));

  /**
   * @swagger
   * /v1/tags/{id}:
   *   patch:
   *     summary: Renommer un tag
   *     tags: [Tags]
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
   *             required: [tagName]
   *             properties:
   *               tagName: { type: string, maxLength: 50, example: philosophie-antique }
   *     responses:
   *       200: { description: Tag mis à jour }
   *       403: { description: Pas autorisé }
   *       404: { description: Tag introuvable }
   *       409: { description: Nouveau nom déjà utilisé }
   */
  router.patch('/:id', tagController.update.bind(tagController));

  /**
   * @swagger
   * /v1/tags/{id}:
   *   delete:
   *     summary: Supprimer un tag (cascade sur item_tags)
   *     tags: [Tags]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       200: { description: Tag supprimé }
   *       403: { description: Pas autorisé }
   *       404: { description: Tag introuvable }
   */
  router.delete('/:id', tagController.delete.bind(tagController));

  return router;
}
