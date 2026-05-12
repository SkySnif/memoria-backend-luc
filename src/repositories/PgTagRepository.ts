import type { QueryResultRow } from 'pg';
import { DatabaseConnection } from '@/config/DatabaseConnection';
import { Tag } from '@/entities/Tag';
import { DatabaseErrorFactory } from '@/exceptions/database/DatabaseErrorFactory';
import { TagErrorFactory } from '@/exceptions/entities/TagErrorFactory';
import type { IDatabaseConnection } from '@/interfaces/database/IDatabaseConnection';
import type { ITagData } from '@/interfaces/entities/tag/ITagData';
import type { ITagRepository } from '@/interfaces/repositories/ITagRepository';

interface ITagRow extends QueryResultRow {
  id_tag: string;
  user_id: string;
  tag_name: string;
  created_at: Date;
  updated_at: Date | null;
}

export class PgTagRepository implements ITagRepository {
  private readonly db: IDatabaseConnection;

  public constructor(db: IDatabaseConnection = DatabaseConnection.getInstance()) {
    this.db = db;
  }

  private rowToTag(row: ITagRow): Tag {
    return new Tag({
      id: row.id_tag,
      userId: row.user_id,
      tagName: row.tag_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? undefined
    });
  }

  public async findById(id: string): Promise<Tag | null> {
    try {
      const result = await this.db.query<ITagRow>('SELECT * FROM tags WHERE id_tag = $1', [id]);
      return result.rows[0] ? this.rowToTag(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('Tag.findById', msg);
    }
  }

  public async findByUserId(userId: string): Promise<Tag[]> {
    try {
      const result = await this.db.query<ITagRow>(
        'SELECT * FROM tags WHERE user_id = $1 ORDER BY tag_name ASC',
        [userId]
      );
      return result.rows.map((row): Tag => this.rowToTag(row));
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('Tag.findByUserId', msg);
    }
  }

  public async findByName(userId: string, tagName: string): Promise<Tag | null> {
    try {
      const result = await this.db.query<ITagRow>(
        'SELECT * FROM tags WHERE user_id = $1 AND LOWER(tag_name) = LOWER($2)',
        [userId, tagName]
      );
      return result.rows[0] ? this.rowToTag(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('Tag.findByName', msg);
    }
  }

  public async findByIds(ids: ReadonlyArray<string>): Promise<Tag[]> {
    if (ids.length === 0) return [];
    try {
      const result = await this.db.query<ITagRow>(
        'SELECT * FROM tags WHERE id_tag = ANY($1::uuid[])',
        [ids]
      );
      return result.rows.map((row): Tag => this.rowToTag(row));
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('Tag.findByIds', msg);
    }
  }

  public async create(data: ITagData): Promise<Tag> {
    try {
      const result = await this.db.query<ITagRow>(
        `INSERT INTO tags (user_id, tag_name) VALUES ($1, $2) RETURNING *`,
        [data.userId, data.tagName]
      );
      const row = result.rows[0];
      if (!row) throw TagErrorFactory.creation('No row returned from INSERT');
      return this.rowToTag(row);
    } catch (err) {
      if (err instanceof TagErrorFactory) throw err;
      const msg: string = err instanceof Error ? err.message : 'unknown';
      if (msg.includes('unique_user_tag')) {
        throw TagErrorFactory.nameExists(data.userId, data.tagName);
      }
      throw TagErrorFactory.creation(msg);
    }
  }

  public async update(id: string, data: Partial<ITagData>): Promise<Tag | null> {
    if (data.tagName === undefined) return await this.findById(id);
    try {
      const result = await this.db.query<ITagRow>(
        'UPDATE tags SET tag_name = $1 WHERE id_tag = $2 RETURNING *',
        [data.tagName, id]
      );
      return result.rows[0] ? this.rowToTag(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      if (msg.includes('unique_user_tag')) {
        throw TagErrorFactory.nameExists('?', data.tagName);
      }
      throw DatabaseErrorFactory.queryFailed('Tag.update', msg);
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db.query('DELETE FROM tags WHERE id_tag = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('Tag.delete', msg);
    }
  }
}
