import type { QueryResultRow } from 'pg';
import { DatabaseConnection } from '@/config/DatabaseConnection';
import type { AuthProviderEnum } from '@/constants/enums/AuthProviderEnum';
import type { RoleEnum } from '@/constants/enums/RoleEnum';
import { User } from '@/entities/User';
import { ConflictErrorFactory } from '@/exceptions/ConflictErrorFactory';
import { DatabaseErrorFactory } from '@/exceptions/database/DatabaseErrorFactory';
import { UserErrorFactory } from '@/exceptions/entities/UserErrorFactory';
import type { IDatabaseConnection } from '@/interfaces/database/IDatabaseConnection';
import type { IUserData } from '@/interfaces/entities/user/IUserData';
import type { IUserRepository } from '@/interfaces/repositories/IUserRepository';

interface IUserRow extends QueryResultRow {
  id_user: string;
  email: string;
  password_hash: string;
  pseudo: string;
  role_name: RoleEnum;
  auth_provider: AuthProviderEnum;
  settings_user: Record<string, unknown>;
  gdpr_consent: boolean;
  gdpr_consent_date: Date | null;
  created_at: Date;
  updated_at: Date | null;
}

export class PgUserRepository implements IUserRepository {
  private readonly db: IDatabaseConnection;

  public constructor(db: IDatabaseConnection = DatabaseConnection.getInstance()) {
    this.db = db;
  }

  private rowToUser(row: IUserRow): User {
    return new User({
      id: row.id_user,
      email: row.email,
      passwordHash: row.password_hash,
      pseudo: row.pseudo,
      role: row.role_name,
      authProvider: row.auth_provider,
      settingsUser: row.settings_user,
      gdprConsent: row.gdpr_consent,
      gdprConsentDate: row.gdpr_consent_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? undefined
    });
  }

  public async findById(id: string): Promise<User | null> {
    try {
      const result = await this.db.query<IUserRow>('SELECT * FROM users WHERE id_user = $1', [id]);
      return result.rows[0] ? this.rowToUser(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('findById', msg);
    }
  }

  public async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.query<IUserRow>('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] ? this.rowToUser(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('findByEmail', msg);
    }
  }

  public async findByPseudo(pseudo: string): Promise<User | null> {
    try {
      const result = await this.db.query<IUserRow>('SELECT * FROM users WHERE pseudo = $1', [
        pseudo
      ]);
      return result.rows[0] ? this.rowToUser(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('findByPseudo', msg);
    }
  }

  public async existsByEmail(email: string): Promise<boolean> {
    try {
      const result = await this.db.query<{ exists: boolean } & QueryResultRow>(
        'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) AS exists',
        [email]
      );
      return result.rows[0]?.exists ?? false;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('existsByEmail', msg);
    }
  }

  public async existsByPseudo(pseudo: string): Promise<boolean> {
    try {
      const result = await this.db.query<{ exists: boolean } & QueryResultRow>(
        'SELECT EXISTS(SELECT 1 FROM users WHERE pseudo = $1) AS exists',
        [pseudo]
      );
      return result.rows[0]?.exists ?? false;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('existsByPseudo', msg);
    }
  }

  public async create(data: IUserData): Promise<User> {
    try {
      const result = await this.db.query<IUserRow>(
        `INSERT INTO users
           (email, password_hash, pseudo, auth_provider, settings_user, gdpr_consent, gdpr_consent_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          data.email,
          data.passwordHash,
          data.pseudo,
          data.authProvider,
          data.settingsUser,
          data.gdprConsent,
          data.gdprConsentDate ?? (data.gdprConsent ? new Date() : null)
        ]
      );
      const row = result.rows[0];
      if (!row) throw UserErrorFactory.creation('No row returned from INSERT');
      return this.rowToUser(row);
    } catch (err) {
      if (err instanceof UserErrorFactory) throw err;
      const msg: string = err instanceof Error ? err.message : 'unknown';
      if (msg.includes('users_email_key')) {
        throw UserErrorFactory.emailExists(data.email);
      }
      if (msg.includes('users_pseudo_key')) {
        throw ConflictErrorFactory.usernameExists(data.pseudo);
      }
      throw UserErrorFactory.creation(msg);
    }
  }

  public async update(id: string, data: Partial<IUserData>): Promise<User | null> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let i: number = 1;

    const columnMap: Record<string, string> = {
      email: 'email',
      passwordHash: 'password_hash',
      pseudo: 'pseudo',
      role: 'role_name',
      authProvider: 'auth_provider',
      settingsUser: 'settings_user',
      gdprConsent: 'gdpr_consent',
      gdprConsentDate: 'gdpr_consent_date'
    };

    for (const [key, col] of Object.entries(columnMap)) {
      const value: unknown = (data as Record<string, unknown>)[key];
      if (value !== undefined) {
        fields.push(`${col} = $${i++}`);
        params.push(value);
      }
    }

    if (fields.length === 0) return await this.findById(id);
    params.push(id);

    try {
      const result = await this.db.query<IUserRow>(
        `UPDATE users SET ${fields.join(', ')} WHERE id_user = $${i} RETURNING *`,
        params
      );
      return result.rows[0] ? this.rowToUser(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('update', msg);
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db.query('DELETE FROM users WHERE id_user = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('delete', msg);
    }
  }
}
