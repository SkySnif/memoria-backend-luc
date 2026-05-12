import type { QueryResultRow } from 'pg';
import { DatabaseConnection } from '@/config/DatabaseConnection';
import { Tag } from '@/entities/Tag';
import { DatabaseErrorFactory } from '@/exceptions/database/DatabaseErrorFactory';
import type { IDatabaseConnection } from '@/interfaces/database/IDatabaseConnection';
import type { IItemTagRepository } from '@/interfaces/repositories/IItemTagRepository';

interface ITagRow extends QueryResultRow {
  id_tag: string;
  user_id: string;
  tag_name: string;
  created_at: Date;
  updated_at: Date | null;
}

export class PgItemTagRepository implements IItemTagRepository {
  private readonly db: IDatabaseConnection;

  public constructor(db: IDatabaseConnection = DatabaseConnection.getInstance()) {
    this.db = db;
  }

  public async add(itemId: string, tagId: string): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO item_tags (id_item, id_tag) VALUES ($1, $2)
         ON CONFLICT (id_tag, id_item) DO NOTHING`,
        [itemId, tagId]
      );
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('ItemTag.add', msg);
    }
  }

  public async remove(itemId: string, tagId: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'DELETE FROM item_tags WHERE id_item = $1 AND id_tag = $2',
        [itemId, tagId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('ItemTag.remove', msg);
    }
  }

  public async sync(itemId: string, tagIds: ReadonlyArray<string>): Promise<void> {
    const pool = this.db.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM item_tags WHERE id_item = $1', [itemId]);
      if (tagIds.length > 0) {
        const placeholders: string = tagIds.map((_, i): string => `($1, $${i + 2})`).join(', ');
        await client.query(`INSERT INTO item_tags (id_item, id_tag) VALUES ${placeholders}`, [
          itemId,
          ...tagIds
        ]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('ItemTag.sync', msg);
    } finally {
      client.release();
    }
  }

  public async findTagsForItem(itemId: string): Promise<Tag[]> {
    try {
      const result = await this.db.query<ITagRow>(
        `SELECT t.id_tag, t.user_id, t.tag_name, t.created_at, t.updated_at
         FROM tags t
         INNER JOIN item_tags it ON it.id_tag = t.id_tag
         WHERE it.id_item = $1
         ORDER BY t.tag_name ASC`,
        [itemId]
      );
      return result.rows.map(
        (row): Tag =>
          new Tag({
            id: row.id_tag,
            userId: row.user_id,
            tagName: row.tag_name,
            createdAt: row.created_at,
            updatedAt: row.updated_at ?? undefined
          })
      );
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('ItemTag.findTagsForItem', msg);
    }
  }

  public async clearForItem(itemId: string): Promise<void> {
    try {
      await this.db.query('DELETE FROM item_tags WHERE id_item = $1', [itemId]);
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('ItemTag.clearForItem', msg);
    }
  }
}
