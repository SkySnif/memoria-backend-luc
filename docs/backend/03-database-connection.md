# 🔌 Database Connection

> One pool, one process, one place to find it. The `DatabaseConnection` singleton is the only thing in the codebase that knows how to reach PostgreSQL.

## Why a singleton

Opening a new TCP connection for every query is wasteful and slow. PostgreSQL clients use a **connection pool** — a fixed bag of open connections that get reused across queries.

The `pg` driver gives us `pg.Pool` for exactly this. We wrap it in a singleton because:

- **One pool per process** is the right amount. More pools = more sockets, no benefit.
- **One import path** to remember: `DatabaseConnection.getInstance()`.
- **One place to configure** — connection string, pool size, timeouts — all in `src/config/DatabaseConnection.ts`.

## The interface

Repositories don't talk to `pg` directly. They depend on the `IDatabaseConnection` interface:

```ts
// src/interfaces/database/IDatabaseConnection.ts
export interface IDatabaseConnection {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>>;

  getClient(): Promise<PoolClient>;

  close(): Promise<void>;
}
```

That interface is enough for **every repository** in the codebase. Need to mock the DB in a test? Implement `IDatabaseConnection` with stubbed methods. Done.

## Configuration

The pool reads its config from `DATABASE_URL` in `.env`:

```text
DATABASE_URL=postgresql://app_memoria:<password>@localhost:5432/memoria_db
```

Critical points (covered in depth in [`../database/01-sql-guide.md`](../database/01-sql-guide.md)):

- The app **never** connects as the `postgres` superuser. It uses the `app_memoria` role with limited privileges.
- The password is generated locally by `scripts/init_db.sh` and stored only in your `.env`. Never commit it.
- In production, prefer Unix socket connections or TLS — set `?sslmode=require` in the URL when applicable.

## Usage in a repository

```ts
// src/repositories/PgItemRepository.ts
export class PgItemRepository implements IItemRepository {
  constructor(private readonly db: IDatabaseConnection) {}

  async findAllByUser(userId: string): Promise<Item[]> {
    try {
      const result = await this.db.query<ItemRow>(
        'SELECT * FROM items WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows.map((row) => this.rowToEntity(row));
    } catch (error) {
      throw DatabaseErrorFactory.queryFailed('findAllByUser', error);
    }
  }
}
```

Three things to notice:

1. **Parameterized queries** (`$1`, `$2`…) — never string-interpolate user input. The driver handles escaping; this is your SQL-injection defense.
2. **A typed `<ItemRow>` generic** — TypeScript can't know the row shape; we tell it. The row type matches the database column names (snake_case).
3. **Wrap pg errors in our own factory** — every repository catches raw `pg` errors and re-throws as `ApiError` via `DatabaseErrorFactory`. The HTTP layer never sees a `pg.DatabaseError`. See [`04-error-handling.md`](./04-error-handling.md).

## Transactions

For operations that must succeed or fail together (e.g. creating an item _and_ attaching its tags), use `getClient()` to grab a single client from the pool and run a transaction on it:

```ts
async createWithTags(item: CreateItemDto, tagIds: string[]): Promise<Item> {
  const client = await this.db.getClient();
  try {
    await client.query('BEGIN');

    const itemResult = await client.query<ItemRow>(
      'INSERT INTO items (...) VALUES ($1, $2, ...) RETURNING *',
      [/* ... */],
    );
    const item = this.rowToEntity(itemResult.rows[0]);

    for (const tagId of tagIds) {
      await client.query(
        'INSERT INTO item_tags (id_item, id_tag) VALUES ($1, $2)',
        [item.id, tagId],
      );
    }

    await client.query('COMMIT');
    return item;
  } catch (error) {
    await client.query('ROLLBACK');
    throw DatabaseErrorFactory.queryFailed('createWithTags', error);
  } finally {
    client.release(); // always release, even on success
  }
}
```

The pattern is always **BEGIN → work → COMMIT** in the happy path, **BEGIN → work → ROLLBACK** on any error, and **`client.release()` in `finally`** to return the client to the pool.

## Lifecycle

The singleton is created the first time anyone calls `getInstance()`. In practice, that's in the **composition root** (`src/routes/v1/index.ts`):

```ts
const db = DatabaseConnection.getInstance();
const itemRepo = new PgItemRepository(db);
// ...
```

On shutdown (SIGTERM, SIGINT), `server.ts` calls `db.close()` to drain the pool gracefully. Without that, the process may hang holding idle TCP connections.

## Testing without PostgreSQL

For unit tests, we **never** spin up a real database. Instead, services get a `MockItemRepository` that holds rows in a `Map`:

```ts
// src/repositories/MockItemRepository.ts (simplified)
export class MockItemRepository implements IItemRepository {
  private readonly items = new Map<string, Item>();

  async findAllByUser(userId: string): Promise<Item[]> {
    return [...this.items.values()].filter((i) => i.userId === userId);
  }

  // ...other methods using the same in-memory store
}
```

Service tests inject the mock; no SQL, no `pg`, no `pool.connect()`. Tests run in milliseconds and stay deterministic.

For **integration tests** (rarer), we _could_ stand up a real Postgres in a Docker container with `testcontainers`. That's not wired up yet — add it when needed.

## Configuration knobs (advanced)

The default pool config is sane for development. For production tuning, the relevant `pg.Pool` options are:

| Option                    | Default | Notes                                                                 |
| :------------------------ | :------ | :-------------------------------------------------------------------- |
| `max`                     | 10      | Max concurrent connections. Match it to your DB's `max_connections`.  |
| `idleTimeoutMillis`       | 10000   | Close idle clients after N ms.                                        |
| `connectionTimeoutMillis` | 0       | How long to wait for a free client before erroring. Set 2000–5000 ms. |
| `statement_timeout`       | unset   | Per-query timeout from PG side. Useful to kill runaway queries.       |

Edit `src/config/DatabaseConnection.ts` to override them. Don't go beyond `max: 20` unless you've benchmarked — more connections often _hurts_ throughput on small DBs.

## Common pitfalls

| Symptom                                          | Cause                                                                                             |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `Error: Connection terminated unexpectedly`      | DB went down or restarted. The pool reconnects automatically — but in-flight queries will fail.   |
| `Error: timeout exceeded when trying to connect` | Pool exhausted. Some code path forgets to `release()` a client after `getClient()`.               |
| `error: invalid input syntax for type uuid: ""`  | A controller is passing an empty string as a UUID. Validate at the Zod layer before reaching SQL. |
| Slow queries in production                       | Check `EXPLAIN ANALYZE`. Look for missing indexes on `user_id`, `created_at`, etc.                |

## Related docs

- [`04-error-handling.md`](./04-error-handling.md) — `DatabaseErrorFactory` and how repository errors become HTTP responses.
- [`07-testing-tdd.md`](./07-testing-tdd.md) — using `MockItemRepository` in tests.
- [`../database/01-sql-guide.md`](../database/01-sql-guide.md) — security model around the `app_memoria` role.

[⬆ Back to docs index](../README.md)

---

_Last updated: 12/05/2026_
