# 📊 Aggregation & Views

> `JSON_AGG` to ship arrays to the frontend in one query. Views to name and reuse complex SQL. Both keep the API layer thin.

This is where the database does the heavy lifting — assembling data into shapes the frontend can render directly, and naming reusable queries so the code stays clean.

## `JSON_AGG` — return arrays in a single row

Joining items with their tags gives you one row per `(item, tag)` pair. That's awkward for an API: the client wants one item with a `tags: [...]` array. `JSON_AGG` collapses the rows for you.

```sql
SELECT
    i.id_item,
    i.title,
    JSON_AGG(t.tag_name) AS tags
FROM items AS i
LEFT JOIN item_tags AS it ON i.id_item = it.id_item
LEFT JOIN tags AS t       ON it.id_tag = t.id_tag
GROUP BY i.id_item, i.title;
```

Result: one row per item, with `tags` already a JSON array. The frontend can iterate over `tags` directly.

### Avoiding `[null]` for items with no tags

A naive `JSON_AGG(t.tag_name)` on an item with no tags returns `[null]` — because the `LEFT JOIN` produced one row with `NULL` for the tag side. Two helpers fix it:

```sql
SELECT
    i.id_item,
    i.title,
    COALESCE(
        JSON_AGG(t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL),
        '[]'
    ) AS tags
FROM items AS i
LEFT JOIN item_tags AS it ON i.id_item = it.id_item
LEFT JOIN tags AS t       ON it.id_tag = t.id_tag
GROUP BY i.id_item, i.title;
```

- **`FILTER (WHERE t.tag_name IS NOT NULL)`** excludes the `NULL` rows from the aggregation.
- **`COALESCE(..., '[]')`** turns a fully-empty aggregate into an empty array instead of `NULL`.

The frontend now always gets `tags: []` or `tags: ['x', 'y']` — never `[null]`, never `null`.

## `JSON_BUILD_OBJECT` — richer shapes

When you want more than a scalar in each array element:

```sql
SELECT
    i.id_item,
    i.title,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT('id', t.id_tag, 'name', t.tag_name)
        ) FILTER (WHERE t.id_tag IS NOT NULL),
        '[]'
    ) AS tags
FROM items AS i
LEFT JOIN item_tags AS it ON i.id_item = it.id_item
LEFT JOIN tags AS t       ON it.id_tag = t.id_tag
GROUP BY i.id_item, i.title;
```

Now each tag is `{ "id": "...", "name": "..." }` — perfect for the `key` prop in a React/Vue `.map()`.

## `COUNT(DISTINCT ...)` to avoid double-counting

When you join multiple tables in an aggregation, rows multiply (a Cartesian product within each group). `COUNT(*)` will over-count. `COUNT(DISTINCT ...)` fixes it:

```sql
-- ❌ Wrong: total_items is inflated by the tags join
SELECT
    u.pseudo,
    COUNT(i.id_item) AS total_items,
    COUNT(t.id_tag)  AS total_tags
FROM users AS u
LEFT JOIN items AS i ON u.id_user = i.user_id
LEFT JOIN tags  AS t ON u.id_user = t.user_id
GROUP BY u.id_user, u.pseudo;

-- ✅ Correct: distinct ids only
SELECT
    u.pseudo,
    COUNT(DISTINCT i.id_item) AS total_items,
    COUNT(DISTINCT t.id_tag)  AS total_tags
FROM users AS u
LEFT JOIN items AS i ON u.id_user = i.user_id
LEFT JOIN tags  AS t ON u.id_user = t.user_id
GROUP BY u.id_user, u.pseudo;
```

Rule of thumb: whenever you `JOIN` more than one related table in an aggregation, use `DISTINCT` inside the aggregates.

## `LIMIT` + `ORDER BY` — Top-N queries

For "top 3 tags", "10 most recent items", etc.:

```sql
SELECT
    t.tag_name,
    COUNT(it.id_tag) AS usage_count
FROM tags AS t
JOIN item_tags AS it ON t.id_tag = it.id_tag
GROUP BY t.id_tag, t.tag_name
ORDER BY usage_count DESC
LIMIT 3;
```

`LIMIT` comes last. If the order is unstable (ties on `usage_count`), add a tiebreaker: `ORDER BY usage_count DESC, t.tag_name ASC`.

## Views — naming reusable queries

A **view** is a saved `SELECT`. You query it like a regular table, but the underlying query runs on each `SELECT`:

```sql
CREATE OR REPLACE VIEW v_items_with_tags AS
SELECT
    i.id_item,
    i.user_id,
    i.title,
    i.content_type,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT('id', t.id_tag, 'name', t.tag_name)
        ) FILTER (WHERE t.id_tag IS NOT NULL),
        '[]'
    ) AS tags
FROM items AS i
LEFT JOIN item_tags AS it ON i.id_item = it.id_item
LEFT JOIN tags AS t       ON it.id_tag = t.id_tag
GROUP BY i.id_item;
```

Now the application — and any psql user — can write:

```sql
SELECT * FROM v_items_with_tags WHERE user_id = '<uuid>';
```

Three benefits:

1. **The complex query lives in one file**, in `database/views/`. Easy to review, easy to evolve.
2. **The repository stays short**: `SELECT * FROM v_items_with_tags WHERE user_id = $1`.
3. **The shape is reused** by every caller — no copy-paste of the JOIN + AGG logic.

### Naming convention

We prefix views with `v_` (e.g. `v_items_with_tags`, `v_user_activity_metrics`). Same idea as the `idx_` prefix for indexes — instantly recognizable.

### `CREATE OR REPLACE` — idempotent

Always use `CREATE OR REPLACE VIEW` so migrations re-run safely. The view definition is fully replaced; you don't have to drop it first.

## Three useful views in this project

### 1. Orphan items (no tags)

```sql
CREATE OR REPLACE VIEW v_orphan_items AS
SELECT
    i.id_item,
    i.title,
    u.pseudo AS owner_pseudo
FROM items AS i
JOIN users AS u ON i.user_id = u.id_user
LEFT JOIN item_tags AS it ON i.id_item = it.id_item
WHERE it.id_item IS NULL;
```

Surfaces items with no tags — useful to nudge users into tagging their library.

### 2. Shared items overview

```sql
CREATE OR REPLACE VIEW v_shared_access AS
SELECT
    s.id_share,
    i.title AS item_title,
    u.email AS owner_email,
    s.recipient_email,
    s.access_config,
    s.created_at
FROM items AS i
JOIN users AS u ON i.user_id = u.id_user
JOIN shares AS s ON i.id_item = s.item_id;
```

A bridge between three tables for notifications and admin panels.

### 3. Per-user activity metrics

```sql
CREATE OR REPLACE VIEW v_user_activity_metrics AS
SELECT
    u.id_user,
    u.pseudo,
    COUNT(DISTINCT i.id_item) AS total_items,
    COUNT(DISTINCT t.id_tag)  AS total_tags_created
FROM users AS u
LEFT JOIN items AS i ON u.id_user = i.user_id
LEFT JOIN tags  AS t ON u.id_user = t.user_id
GROUP BY u.id_user, u.pseudo;
```

`DISTINCT` is essential here — see the section above.

## Views vs materialized views

- **`VIEW`** — query runs every time you read it. Always up to date, but no speed gain.
- **`MATERIALIZED VIEW`** — result is cached on disk. Fast to read but **stale** until you `REFRESH MATERIALIZED VIEW`.

Use plain views unless you've measured a real performance problem on a read-heavy view. Materialized views add operational complexity (when to refresh, who triggers the refresh).

## What this looks like in code

Repositories read from views just like tables:

```ts
// src/repositories/PgItemRepository.ts (simplified)
async findAllByUserWithTags(userId: string): Promise<ItemWithTagsRow[]> {
  const result = await this.db.query<ItemWithTagsRow>(
    'SELECT * FROM v_items_with_tags WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  );
  return result.rows;
}
```

No `JOIN`, no `JSON_AGG`, no `COALESCE` — the complexity lives in the view definition. The repository is one line.

## Patterns to remember

- ✅ `JSON_AGG(...)` + `FILTER (WHERE ... IS NOT NULL)` + `COALESCE(..., '[]')` for clean arrays.
- ✅ `JSON_BUILD_OBJECT` when each array element needs multiple fields.
- ✅ `COUNT(DISTINCT ...)` inside aggregates when you join multiple tables.
- ✅ `LIMIT` + `ORDER BY` for Top-N. Always include a tiebreaker.
- ✅ `CREATE OR REPLACE VIEW` for idempotent migrations.
- ✅ Prefix views with `v_` for instant recognition.

## Related docs

- [`01-sql-guide.md`](./01-sql-guide.md) — JSONB and GIN indexes (the foundation `JSON_AGG` builds on).
- [`03-joins-and-relationships.md`](./03-joins-and-relationships.md) — joins are the input to aggregation.
- [`../backend/03-database-connection.md`](../backend/03-database-connection.md) — how repositories query views.

[⬆ Back to docs index](../README.md)

---

_Last updated: 12/05/2026_
