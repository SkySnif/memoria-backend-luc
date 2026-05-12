import type { QueryResultRow } from 'pg';
import { DatabaseConnection } from '@/config/DatabaseConnection';
import { Share } from '@/entities/Share';
import { DatabaseErrorFactory } from '@/exceptions/database/DatabaseErrorFactory';
import { ShareErrorFactory } from '@/exceptions/entities/ShareErrorFactory';
import type { IDatabaseConnection } from '@/interfaces/database/IDatabaseConnection';
import type { IAccessConfig } from '@/interfaces/entities/share/IAccessConfig';
import type { IShareData } from '@/interfaces/entities/share/IShareData';
import type { IShareRepository } from '@/interfaces/repositories/IShareRepository';

interface IShareRow extends QueryResultRow {
  id_share: string;
  item_id: string;
  recipient_email: string | null;
  share_token: string;
  access_config: IAccessConfig;
  created_at: Date;
  updated_at: Date | null;
}

export class PgShareRepository implements IShareRepository {
  private readonly db: IDatabaseConnection;

  public constructor(db: IDatabaseConnection = DatabaseConnection.getInstance()) {
    this.db = db;
  }

  private rowToShare(row: IShareRow): Share {
    return new Share({
      id: row.id_share,
      itemId: row.item_id,
      recipientEmail: row.recipient_email,
      shareToken: row.share_token,
      accessConfig: row.access_config,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? undefined
    });
  }

  public async findById(id: string): Promise<Share | null> {
    try {
      const result = await this.db.query<IShareRow>('SELECT * FROM shares WHERE id_share = $1', [
        id
      ]);
      return result.rows[0] ? this.rowToShare(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('Share.findById', msg);
    }
  }

  public async findByToken(token: string): Promise<Share | null> {
    try {
      const result = await this.db.query<IShareRow>('SELECT * FROM shares WHERE share_token = $1', [
        token
      ]);
      return result.rows[0] ? this.rowToShare(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('Share.findByToken', msg);
    }
  }

  public async findByItemId(itemId: string): Promise<Share[]> {
    try {
      const result = await this.db.query<IShareRow>(
        'SELECT * FROM shares WHERE item_id = $1 ORDER BY created_at DESC',
        [itemId]
      );
      return result.rows.map((row): Share => this.rowToShare(row));
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('Share.findByItemId', msg);
    }
  }

  public async findByUserId(userId: string): Promise<Share[]> {
    try {
      const result = await this.db.query<IShareRow>(
        `SELECT s.* FROM shares s
         INNER JOIN items i ON i.id_item = s.item_id
         WHERE i.user_id = $1
         ORDER BY s.created_at DESC`,
        [userId]
      );
      return result.rows.map((row): Share => this.rowToShare(row));
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('Share.findByUserId', msg);
    }
  }

  public async create(data: IShareData): Promise<Share> {
    try {
      const result = await this.db.query<IShareRow>(
        `INSERT INTO shares (item_id, recipient_email, share_token, access_config)
         VALUES ($1, $2, $3, $4::jsonb)
         RETURNING *`,
        [data.itemId, data.recipientEmail, data.shareToken, JSON.stringify(data.accessConfig)]
      );
      const row = result.rows[0];
      if (!row) throw ShareErrorFactory.creation('No row returned from INSERT');
      return this.rowToShare(row);
    } catch (err) {
      if (err instanceof ShareErrorFactory) throw err;
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw ShareErrorFactory.creation(msg);
    }
  }

  public async update(id: string, data: Partial<IShareData>): Promise<Share | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx: number = 1;

    if (data.recipientEmail !== undefined) {
      fields.push(`recipient_email = $${idx++}`);
      values.push(data.recipientEmail);
    }
    if (data.accessConfig !== undefined) {
      fields.push(`access_config = $${idx++}::jsonb`);
      values.push(JSON.stringify(data.accessConfig));
    }

    if (fields.length === 0) return await this.findById(id);
    values.push(id);

    try {
      const result = await this.db.query<IShareRow>(
        `UPDATE shares SET ${fields.join(', ')} WHERE id_share = $${idx} RETURNING *`,
        values
      );
      return result.rows[0] ? this.rowToShare(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('Share.update', msg);
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db.query('DELETE FROM shares WHERE id_share = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('Share.delete', msg);
    }
  }
}
