import type { QueryResultRow } from 'pg';
import type { ContentTypeEnum } from '@/constants/enums/ContentTypeEnum';
import { DatabaseConnection } from '@/config/DatabaseConnection';
import { Item } from '@/entities/Item';
import { DatabaseErrorFactory } from '@/exceptions/database/DatabaseErrorFactory';
import { ItemErrorFactory } from '@/exceptions/entities/ItemErrorFactory';
import type { IDatabaseConnection } from '@/interfaces/database/IDatabaseConnection';
import type { IItemData } from '@/interfaces/entities/item/IItemData';
import type {
  IItemListOptions,
  IItemListResult,
  IItemRepository
} from '@/interfaces/repositories/IItemRepository';

interface IItemRow extends QueryResultRow {
  id_item: string;
  user_id: string;
  content_type: ContentTypeEnum;
  title: string;
  slug: string;
  content: string;
  source_author: string;
  thumbnail_url: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date | null;
}

export class PgItemRepository implements IItemRepository {
  private readonly db: IDatabaseConnection;

  public constructor(db: IDatabaseConnection = DatabaseConnection.getInstance()) {
    this.db = db;
  }

  /**
   * Mappe une ligne PostgreSQL (snake_case) vers une entité Item (camelCase).
   * Centralisé pour éviter la duplication dans chaque méthode.
   */
  private rowToItem(row: IItemRow): Item {
    return new Item({
      id: row.id_item,
      userId: row.user_id,
      contentType: row.content_type,
      title: row.title,
      slug: row.slug,
      content: row.content,
      sourceAuthor: row.source_author,
      thumbnailUrl: row.thumbnail_url,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? undefined
    });
  }

  public async findById(id: string): Promise<Item | null> {
    try {
      const result = await this.db.query<IItemRow>('SELECT * FROM items WHERE id_item = $1', [id]);
      return result.rows[0] ? this.rowToItem(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('findById', msg);
    }
  }

  public async findBySlug(userId: string, slug: string): Promise<Item | null> {
    try {
      const result = await this.db.query<IItemRow>(
        'SELECT * FROM items WHERE user_id = $1 AND slug = $2',
        [userId, slug]
      );
      return result.rows[0] ? this.rowToItem(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('findBySlug', msg);
    }
  }

  public async findByTitle(userId: string, title: string): Promise<Item | null> {
    try {
      const result = await this.db.query<IItemRow>(
        'SELECT * FROM items WHERE user_id = $1 AND title = $2',
        [userId, title]
      );
      return result.rows[0] ? this.rowToItem(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('findByTitle', msg);
    }
  }

  public async listByUser(userId: string, options?: IItemListOptions): Promise<IItemListResult> {
    const limit: number = options?.limit ?? 20;
    const offset: number = options?.offset ?? 0;
    const conditions: string[] = ['user_id = $1'];
    const params: unknown[] = [userId];

    if (options?.contentType) {
      params.push(options.contentType);
      conditions.push(`content_type = $${params.length}`);
    }
    if (options?.search) {
      params.push(`%${options.search}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }
    const whereClause: string = conditions.join(' AND ');

    try {
      const itemsResult = await this.db.query<IItemRow>(
        `SELECT * FROM items WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );
      const countResult = await this.db.query<{ count: string } & QueryResultRow>(
        `SELECT COUNT(*)::text AS count FROM items WHERE ${whereClause}`,
        params
      );
      return {
        items: itemsResult.rows.map((row): Item => this.rowToItem(row)),
        total: Number(countResult.rows[0]?.count ?? 0)
      };
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('listByUser', msg);
    }
  }

  public async create(data: IItemData): Promise<Item> {
    try {
      const result = await this.db.query<IItemRow>(
        `INSERT INTO items
           (user_id, content_type, title, slug, content, source_author, thumbnail_url, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          data.userId,
          data.contentType,
          data.title,
          data.slug,
          data.content,
          data.sourceAuthor,
          data.thumbnailUrl ?? null,
          data.metadata
        ]
      );
      const row = result.rows[0];
      if (!row) throw ItemErrorFactory.creation('No row returned from INSERT');
      return this.rowToItem(row);
    } catch (err) {
      if (err instanceof ItemErrorFactory) throw err;
      const msg: string = err instanceof Error ? err.message : 'unknown';
      // Détection des violations d'unicité (contraintes PG)
      if (msg.includes('unique_user_item_title')) {
        throw ItemErrorFactory.titleExists(data.userId, data.title);
      }
      if (msg.includes('unique_user_item_slug')) {
        throw ItemErrorFactory.slugExists(data.userId, data.slug);
      }
      throw ItemErrorFactory.creation(msg);
    }
  }

  public async update(id: string, data: Partial<IItemData>): Promise<Item | null> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let i: number = 1;

    const columnMap: Record<string, string> = {
      contentType: 'content_type',
      title: 'title',
      slug: 'slug',
      content: 'content',
      sourceAuthor: 'source_author',
      thumbnailUrl: 'thumbnail_url',
      metadata: 'metadata'
    };

    for (const [key, col] of Object.entries(columnMap)) {
      const value: unknown = (data as Record<string, unknown>)[key];
      if (value !== undefined) {
        fields.push(`${col} = $${i++}`);
        params.push(value);
      }
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    params.push(id);

    try {
      const result = await this.db.query<IItemRow>(
        `UPDATE items SET ${fields.join(', ')} WHERE id_item = $${i} RETURNING *`,
        params
      );
      return result.rows[0] ? this.rowToItem(result.rows[0]) : null;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('update', msg);
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db.query('DELETE FROM items WHERE id_item = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (err) {
      const msg: string = err instanceof Error ? err.message : 'unknown';
      throw DatabaseErrorFactory.queryFailed('delete', msg);
    }
  }
}
