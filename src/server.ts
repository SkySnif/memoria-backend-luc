import { createApp } from '@/app';
import { DatabaseConnection } from '@/config/DatabaseConnection';
import { LoggerSingleton } from '@/config/LoggerSingleton';

const logger = LoggerSingleton.getInstance();
const PORT: number = Number(process.env.PORT ?? 3000);

async function bootstrap(): Promise<void> {
  try {
    // Fail-fast : on vérifie la BDD avant d'écouter sur le port
    const db = DatabaseConnection.getInstance();
    const dbAlive: boolean = await db.ping();
    if (!dbAlive) {
      throw new Error('La base de données est injoignable au démarrage');
    }
    logger.info('🐘 Connexion PostgreSQL OK');

    const app = createApp();
    const server = app.listen(PORT, (): void => {
      logger.info(`🚀 Memoria API démarrée sur http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.warn(`Signal reçu : ${signal}. Arrêt en cours…`);
      server.close((): void => {
        logger.info('Serveur HTTP fermé.');
      });
      await db.close();
      logger.info('Pool PostgreSQL fermé.');
      process.exit(0);
    };

    process.on('SIGTERM', (): void => void shutdown('SIGTERM'));
    process.on('SIGINT', (): void => void shutdown('SIGINT'));
  } catch (error) {
    const msg: string = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Échec du démarrage : ${msg}`);
    process.exit(1);
  }
}

void bootstrap();
