import multer, { type Multer, type FileFilterCallback } from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';

/**
 * Singleton de configuration pour l'upload de fichiers (images).
 * Stockage local sur disque dans /public/uploads/.
 */
export class UploadConfig {
  static #instance: Multer;

  private static readonly UPLOAD_DIR: string = 'public/uploads/';
  private static readonly MAX_FILE_SIZE: number = 5 * 1024 * 1024; // 5 MB
  private static readonly ALLOWED_MIME_TYPES: ReadonlyArray<string> = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  private constructor() {
    // Empêche l'instanciation directe (pattern Singleton)
  }

  public static getInstance(): Multer {
    if (!UploadConfig.#instance) {
      const storage = multer.diskStorage({
        destination: (
          _req: Request,
          _file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void
        ): void => {
          cb(null, UploadConfig.UPLOAD_DIR);
        },
        filename: (
          _req: Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void
        ): void => {
          const uniqueSuffix: string = randomUUID();
          const ext: string = path.extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        }
      });

      const fileFilter = (
        _req: Request,
        file: Express.Multer.File,
        cb: FileFilterCallback
      ): void => {
        if (UploadConfig.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Format de fichier non supporté. Images uniquement.'));
        }
      };

      UploadConfig.#instance = multer({
        storage,
        fileFilter,
        limits: { fileSize: UploadConfig.MAX_FILE_SIZE }
      });
    }
    return UploadConfig.#instance;
  }
}
