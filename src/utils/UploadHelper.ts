import fs from 'node:fs/promises';
import path from 'node:path';
import { LoggerSingleton } from '@/config/LoggerSingleton';

export class UploadHelper {
  private static readonly logger = LoggerSingleton.getInstance();
  private static readonly PUBLIC_DIR: string = 'public';
  private static readonly UPLOADS_URL_PREFIX: string = '/uploads';

  /**
   * Supprime un fichier physique du dossier public/.
   * Ignore les chemins externes (http://) et les fichiers déjà absents.
   */
  public static async deleteFile(relativePath: string | null | undefined): Promise<void> {
    if (!relativePath || relativePath.startsWith('http')) return;

    try {
      const fullPath: string = path.join(process.cwd(), UploadHelper.PUBLIC_DIR, relativePath);
      await fs.unlink(fullPath);
      UploadHelper.logger.info({ file: relativePath }, 'Fichier supprimé');
    } catch (err) {
      const code: string | undefined = (err as NodeJS.ErrnoException).code;
      // ENOENT = fichier déjà absent, c'est le résultat voulu
      if (code !== 'ENOENT') {
        UploadHelper.logger.error(
          { err, file: relativePath },
          'Erreur lors de la suppression du fichier'
        );
      }
    }
  }

  /**
   * Transforme un fichier multer en chemin web stockable en BDD.
   * Exemple : { filename: 'abc.jpg' } → '/uploads/abc.jpg'
   */
  public static formatUploadPath(file: Express.Multer.File | undefined): string | null {
    if (!file) return null;
    return `${UploadHelper.UPLOADS_URL_PREFIX}/${file.filename}`;
  }
}
