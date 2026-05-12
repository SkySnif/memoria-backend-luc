import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { DatabaseConnection } from '@/config/DatabaseConnection';
import { LoggerSingleton } from '@/config/LoggerSingleton';
import { HandlerService } from '@/services/http/HandlerService';
import { ApiResponseFactory } from '@/utils/ApiResponseFactory';
import { RequestIdGenerator } from '@/utils/RequestIdGenerator';
import { createV1Router } from '@/routes/v1';
import { SwaggerConfig } from '@/config/SwaggerConfig';

/**
 * Construit et configure l'application Express.
 * Exportée comme fonction pour faciliter les tests (chaque test crée son app).
 */
export function createApp(): Express {
  const app: Express = express();
  const logger = LoggerSingleton.getInstance();
  const handlerService = new HandlerService();

  // ----- Sécurité & parsing -----
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) ?? '*',
      credentials: true
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ----- Rate limiting global -----
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  // ----- Request ID (corrélation logs/erreurs) -----
  app.use((req: Request, res: Response, next: NextFunction): void => {
    const incoming: string | undefined = req.header('x-request-id');
    const id: string = incoming && incoming.length > 0 ? incoming : RequestIdGenerator.generate();
    res.setHeader('x-request-id', id);
    (req as Request & { id: string }).id = id;
    next();
  });

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Vérifier l'état du service et de la base de données
   *     tags: [Health]
   *     security: []
   *     responses:
   *       200:
   *         description: Service opérationnel
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
   *                         status: { type: string, example: ok }
   *                         uptime: { type: number, example: 42.5 }
   *                         database: { type: string, example: up }
   *                         timestamp: { type: string, format: date-time }
   *       503: { description: Service dégradé (DB down) }
   */
  // ----- Health check -----
  app.get('/health', async (_req: Request, res: Response): Promise<void> => {
    const db = DatabaseConnection.getInstance();
    const dbAlive: boolean = await db.ping().catch((): boolean => false);
    const payload = {
      status: dbAlive ? 'ok' : 'degraded',
      uptime: process.uptime(),
      database: dbAlive ? 'up' : 'down',
      timestamp: new Date().toISOString()
    };
    res.status(dbAlive ? 200 : 503).json(ApiResponseFactory.success('Health check', payload));
  });

  // ----- Routes versionnées -----
  app.use('/v1', createV1Router());

  // Swagger UI sur /docs + spec brute sur /docs.json
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(SwaggerConfig.getSpec(), {
      customSiteTitle: 'Memoria API Docs',
      swaggerOptions: { persistAuthorization: true }
    })
  );
  app.get('/docs.json', (_req, res): void => {
    res.json(SwaggerConfig.getSpec());
  });

  // ----- Handlers de fin (404 + erreurs) -----
  app.use(handlerService.handleNotFound.bind(handlerService));
  app.use(handlerService.handleError.bind(handlerService));

  logger.info('Application Express initialisée');
  return app;
}
