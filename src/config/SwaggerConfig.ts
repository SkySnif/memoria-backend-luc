import swaggerJsdoc from 'swagger-jsdoc';
import { LoggerSingleton } from '@/config/LoggerSingleton';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Memoria API',
      version: '1.0.0',
      description:
        'API REST de gestion de connaissances personnelles. ' +
        'Permet de créer, organiser et partager des pépites (livres, podcasts, articles, vidéos, notes).'
    },
    servers: [{ url: 'http://localhost:3000', description: 'Développement local' }],
    tags: [
      { name: 'Auth', description: 'Inscription, connexion, gestion du token' },
      { name: 'Items', description: 'Pépites de connaissance' },
      { name: 'Tags', description: 'Étiquettes pour organiser les pépites' },
      { name: 'Shares', description: 'Partages publics de pépites' },
      { name: 'Public', description: 'Endpoints accessibles sans authentification' },
      { name: 'Health', description: 'Monitoring' },
      { name: 'Users', description: 'Gestion du profil et RGPD' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT obtenu via POST /v1/auth/login'
        }
      },
      schemas: {
        // === Enveloppes de réponse ===
        ResponseMeta: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            requestId: { type: 'string', format: 'uuid' }
          }
        },
        ApiResponseSuccess: {
          type: 'object',
          required: ['success', 'message', 'meta'],
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Opération réussie' },
            data: { type: 'object', description: "Payload, varie selon l'endpoint" },
            meta: { $ref: '#/components/schemas/ResponseMeta' }
          }
        },
        ApiResponseError: {
          type: 'object',
          required: ['success', 'message', 'error', 'meta'],
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Erreur de validation' },
            error: {
              type: 'object',
              properties: { code: { type: 'string', example: 'VALIDATION_ERROR' } }
            },
            meta: { $ref: '#/components/schemas/ResponseMeta' }
          }
        },

        // === Domaine User ===
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            pseudo: { type: 'string' },
            role: { type: 'string', enum: ['customer', 'admin', 'super_admin'] },
            authProvider: { type: 'string', enum: ['local', 'google', 'azure', 'apple'] },
            settingsUser: { type: 'object' },
            gdprConsent: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },

        // === Domaine Item ===
        Item: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            contentType: { type: 'string', enum: ['livre', 'podcast', 'article', 'video', 'note'] },
            title: { type: 'string' },
            slug: { type: 'string' },
            content: { type: 'string' },
            sourceAuthor: { type: 'string' },
            thumbnailUrl: { type: 'string', nullable: true },
            metadata: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            tags: { type: 'array', items: { $ref: '#/components/schemas/Tag' } }
          }
        },

        // === Domaine Tag ===
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            tagName: { type: 'string', maxLength: 50 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        // === Domaine Share ===
        Share: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            itemId: { type: 'string', format: 'uuid' },
            recipientEmail: { type: 'string', format: 'email', nullable: true },
            shareToken: { type: 'string' },
            shareUrl: { type: 'string', format: 'uri' },
            accessConfig: {
              type: 'object',
              properties: { expiresAt: { type: 'string', format: 'date-time' } }
            },
            isExpired: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    // Auth par défaut sur toute la spec ; on override sur les routes publiques avec `security: []`
    security: [{ bearerAuth: [] }]
  },
  // Chemin où chercher les JSDoc @swagger
  apis: ['./src/routes/**/*.ts', './src/app.ts']
};

export class SwaggerConfig {
  private static spec: object | null = null;

  public static getSpec(): object {
    if (this.spec === null) {
      this.spec = swaggerJsdoc(options);
      LoggerSingleton.getInstance().info('📚 Spec OpenAPI générée');
    }
    return this.spec;
  }
}
