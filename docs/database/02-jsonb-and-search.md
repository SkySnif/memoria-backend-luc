# 🔍 JSONB & Querying Patterns

> How to inspect, filter, and read inside JSONB columns. Plus the basic SQL toolkit (sorting, length, casing) you'll reach for daily.

In Memoria, several columns are `JSONB` — `items.metadata`, `users.settings_user`, `app_events.metadata`, `shares.access_config`. This document covers the patterns you need to query them confidently.

## Sorting results — `ORDER BY ... DESC`

The most basic way to surface useful information: sort by the right column.

```sql
SELECT pseudo, email, role_name
FROM users
ORDER BY created_at DESC;
```

`DESC` (descending) puts the most recent first — typical for activity dashboards. Use `ASC` (or omit it; it's the default) when you want chronological order.

> Tip: column aliases (`AS`) are not allowed in the `WHERE` clause but are fine in `ORDER BY`. Useful for sorting on computed expressions.

## Measuring text — `LENGTH()`

Filter rows based on the length of a text column:

```sql
SELECT title, content_type
FROM items
WHERE LENGTH(content) < 20;
```

This is handy for surfacing items with too little content (could be cleanup candidates) or, with `>`, for filtering out giant blobs.

`LENGTH()` counts characters, spaces included.

## Reading inside JSONB — the `->` and `->>` operators

JSONB is queryable like a column once you know the operators:

| Operator | Returns                         | Use when                                                       |
| :------- | :------------------------------ | :------------------------------------------------------------- |
| `->`     | A JSON value (object or scalar) | You want to keep working with JSONB (e.g. chain another `->`). |
| `->>`    | A `text` value                  | You want to compare with `LIKE`, cast to a number, etc.        |
| `#>`     | A JSON value at a path          | Drill deeper than one level.                                   |
| `#>>`    | A `text` value at a path        | Same, but extract as text.                                     |

### Reading a top-level key

```sql
-- The JSONB value (still JSONB)
SELECT metadata->'source_url' FROM items;

-- As text — required for LIKE / string comparisons
SELECT metadata->>'source_url' FROM items;
```

### Filtering on a JSONB key

```sql
-- All video items whose source URL is NOT a YouTube link
SELECT title, metadata->>'source_url' AS url
FROM items
WHERE content_type = 'video'
  AND metadata->>'source_url' NOT LIKE '%youtube%';
```

Three things to notice:

1. We extract as **text** with `->>` so `LIKE` can compare against a string.
2. `LIKE '%youtube%'` matches any value _containing_ `youtube`. `NOT LIKE` inverts it.
3. `AS url` gives the output column a clean name — useful when the frontend will read it.

### Drilling into nested JSONB

```sql
-- access_config.rules.expires_at lives two levels deep
SELECT
    id_share,
    access_config #>> '{rules,expires_at}' AS expires_at
FROM shares
WHERE access_config #>> '{rules,mode}' = 'expires';
```

The path syntax `'{rules,expires_at}'` is an array of keys; you can have as many as you need.

## Filtering app events by severity and shape

`app_events.metadata` carries debug context — query duration, the SQL statement that caused a warning, etc. Pull it out at query time:

```sql
SELECT
    message,
    metadata->>'duration_ms' AS duration_ms,
    metadata->>'query'       AS query_executed
FROM app_events
WHERE severity = 'warning';
```

This is your go-to debugging query in production. Combine with `ORDER BY created_at DESC LIMIT 50` to scope it to recent events.

## Case-insensitive comparison — `CITEXT` and `ILIKE`

Two ways to handle case-insensitivity:

**Column-level** (preferred for `email` and `pseudo`):

```sql
-- The column is declared CITEXT
email CITEXT UNIQUE;

-- This now matches regardless of casing
SELECT * FROM users WHERE email = 'Alice@example.com';
```

**Query-level** (for ad-hoc comparisons on non-CITEXT columns):

```sql
-- ILIKE = LIKE, case-insensitive
SELECT * FROM items WHERE title ILIKE '%philosophy%';
```

Prefer the column-level approach when you control the schema. `CITEXT` indexes correctly with `UNIQUE`; `ILIKE` queries on a regular `VARCHAR` may bypass indexes unless you create a special expression index.

## What this looks like in code

When a repository queries on JSONB or applies casing logic, the SQL goes in the repo, not in the service. The service stays JS — no `->>` operators, no `ILIKE`.

```ts
// src/repositories/PgAppEventRepository.ts (simplified)
async listWarningsWithContext(limit = 50): Promise<AppEvent[]> {
  const result = await this.db.query<AppEventRow>(
    `SELECT
        message,
        metadata->>'duration_ms' AS duration_ms,
        metadata->>'query'       AS query_executed,
        created_at
     FROM app_events
     WHERE severity = 'warning'
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit],
  );
  return result.rows.map(this.rowToEntity);
}
```

## Patterns to remember

- ✅ `->>` when you want text (for `LIKE`, casting, output).
- ✅ `->` when you keep working with JSONB (chaining, type-preserving).
- ✅ `LENGTH()` for size-based filters.
- ✅ `ORDER BY ... DESC` for "most recent first" lists.
- ✅ `CITEXT` for human-facing identifiers (email, pseudo).
- ✅ `ILIKE` only when you can't change the column type.

## Related docs

- [`01-sql-guide.md`](./01-sql-guide.md) — JSONB vs JSON, indexing JSONB with GIN.
- [`03-joins-and-relationships.md`](./03-joins-and-relationships.md) — combining JSONB queries with joins.

[⬆ Back to docs index](../README.md)

---

_Last updated: 12/05/2026_
