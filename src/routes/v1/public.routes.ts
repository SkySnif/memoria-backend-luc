import { Router } from 'express';
import type { PublicShareController } from '@/controllers/PublicShareController';

export function createPublicRouter(publicShareController: PublicShareController): Router {
  const router: Router = Router();

  /**
   * @swagger
   * /v1/public/shared/{token}:
   *   get:
   *     summary: Accéder au contenu d'une pépite partagée publiquement
   *     description: "Aucune authentification requise. Le contenu est filtré : aucun ID interne n'est exposé."
   *     tags: [Public]
   *     security: []
   *     parameters:
   *       - in: path
   *         name: token
   *         required: true
   *         schema: { type: string }
   *         description: Le shareToken obtenu lors de la création du partage
   *     responses:
   *       200:
   *         description: Contenu de la pépite partagée
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
   *                         item:
   *                           type: object
   *                           properties:
   *                             title: { type: string }
   *                             slug: { type: string }
   *                             contentType: { type: string, enum: [livre, podcast, article, video, note] }
   *                             content: { type: string }
   *                             sourceAuthor: { type: string }
   *                             thumbnailUrl: { type: string, nullable: true }
   *                             metadata: { type: object }
   *                             createdAt: { type: string, format: date-time }
   *       404: { description: Token invalide ou partage révoqué (SHARE_NOT_FOUND) }
   *       410: { description: Le partage a expiré (SHARE_EXPIRED) }
   */
  router.get('/shared/:token', publicShareController.getByToken.bind(publicShareController));

  return router;
}
