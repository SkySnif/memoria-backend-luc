# 🔗 Joins & Relationships

> How rows from different tables come together. `INNER` vs `LEFT`, aggregation, and the many-to-many pivot pattern that powers tags.

PostgreSQL stores data in normalized tables — a tag is not duplicated across every item that uses it. Joins are how you reassemble those relations when you query.

## Why we normalize

Storing the user's `pseudo` directly in the `items` table would be redundant: when a user renames themselves, you'd have to update every item they ever wrote. Instead, we store `user_id` and let SQL join when needed. This is the **DRY** principle applied to data.

## `INNER JOIN` — strict matching

Returns only rows where the join condition matches in **both** tables.

```sql
SELECT
    i.title,
    i.content_type,
    u.pseudo
FROM items AS i
INNER JOIN users AS u ON i.user_id = u.id_user;
```

If an item somehow had no matching user (impossible here thanks to `FOREIGN KEY` + `NOT NULL`), it would be excluded from the result.

### Aliasing tables

`AS i`, `AS u` are aliases. They make joins more readable, especially when you join three or more tables. Convention: one or two letters that hint at the table name.

## `LEFT JOIN` — preserve the left side

Returns **all** rows from the left table, even when the join doesn't match. Missing fields from the right table come back as `NULL`.

```sql
-- All app events, with the user email if there is one.
-- System events (user_id IS NULL) still appear, with email = NULL.
SELECT
    ae.message,
    u.email
FROM app_events AS ae
LEFT JOIN users AS u ON ae.user_id = u.id_user;
```

This is the right choice whenever the relation is **nullable** (`ON DELETE SET NULL` columns, optional foreign keys). An `INNER JOIN` would silently hide all system events.

### Detecting orphans with `LEFT JOIN ... WHERE ... IS NULL`

The "left joined and check for NULL" pattern finds rows that have **no match** in the right table:

```sql
-- Items with no tags attached
SELECT i.title
FROM items AS i
LEFT JOIN item_tags AS it ON i.id_item = it.id_item
WHERE it.id_item IS NULL;
```

Useful for cleanup queries, dashboards, and "needs attention" lists.

## Aggregating with `COUNT` and `GROUP BY`

Count rows per group with `COUNT(*)` and `GROUP BY`:

```sql
-- How many items each user has authored
SELECT
    u.pseudo,
    COUNT(i.id_item) AS total_items
FROM users AS u
LEFT JOIN items AS i ON u.id_user = i.user_id
GROUP BY u.id_user, u.pseudo;
```

Three things to keep in mind:

1. **Use `LEFT JOIN`** if you want users with zero items in the result. `INNER JOIN` would hide them.
2. **`COUNT(i.id_item)`** ignores `NULL` rows — so users with no items count zero. `COUNT(*)` would count them as 1 because the row exists after the left join.
3. **`GROUP BY` must include every non-aggregated column** you select. Include `id_user` (the primary key) to be safe — two users could share a pseudo otherwise.

## Many-to-many — the pivot table pattern

A pépite can have many tags, and a tag can be on many pépites. Direct foreign keys can't model that — you need a **pivot table** sitting between them:

```text
items                item_tags              tags
+-----------+        +-----------+          +----------+
| id_item   |◄──────┤ id_item   │           | id_tag   │
| title     |        │ id_tag    │──────────►│ tag_name │
| ...       |        │ ...       │           | ...      │
+-----------+        +-----------+           +----------+
                      (composite PK)
```

`item_tags` has two columns — both foreign keys — that together form the primary key (no duplicate `(item, tag)` pairs).

To list pépites with their tag names, join through the pivot:

```sql
SELECT
    i.title AS item_title,
    t.tag_name
FROM items AS i
JOIN item_tags AS it ON i.id_item = it.id_item
JOIN tags AS t       ON it.id_tag = t.id_tag;
```

Each row in the result represents **one (item, tag) pair**. An item with three tags appears three times. To collapse those rows into a single one with a tags array, see [`04-aggregation-and-views.md`](./04-aggregation-and-views.md).

> `JOIN` without a qualifier means `INNER JOIN`. Both are valid. We use `JOIN` for brevity here; spell out `INNER` if you want to be explicit.

## Filtering with joins

Combine `JOIN` with `WHERE` to filter on either side:

```sql
-- All pépites belonging to user 'Sophie'
SELECT i.title, t.tag_name
FROM items AS i
JOIN users AS u ON i.user_id = u.id_user
LEFT JOIN item_tags AS it ON i.id_item = it.id_item
LEFT JOIN tags AS t       ON it.id_tag = t.id_tag
WHERE u.pseudo = 'Sophie';
```

The `WHERE` clause runs **after** the joins, so it can reference columns from any joined table.

## What this looks like in code

Joins live in repositories — never in services. A typical "list items with tags" query:

```ts
// src/repositories/PgItemRepository.ts (simplified)
async findAllByUserWithTags(userId: string): Promise<ItemWithTagsRow[]> {
  const result = await this.db.query<ItemWithTagsRow>(
    `SELECT
        i.id_item, i.title, i.content_type, i.created_at,
        t.id_tag, t.tag_name
     FROM items AS i
     LEFT JOIN item_tags AS it ON i.id_item = it.id_item
     LEFT JOIN tags AS t       ON it.id_tag = t.id_tag
     WHERE i.user_id = $1
     ORDER BY i.created_at DESC`,
    [userId],
  );
  return result.rows;
}
```

The service then folds the rows by `id_item` to build the final shape — or better, the repository uses `JSON_AGG` to return one row per item with a tags array already. See [`04-aggregation-and-views.md`](./04-aggregation-and-views.md).

## Patterns to remember

- ✅ `INNER JOIN` when both sides must exist.
- ✅ `LEFT JOIN` when the right side is optional / nullable.
- ✅ `LEFT JOIN ... WHERE x IS NULL` to find orphans.
- ✅ Always alias tables — readability scales fast as joins multiply.
- ✅ `GROUP BY` every non-aggregated column you select.
- ✅ Use a pivot table for any many-to-many relation.

## Related docs

- [`01-sql-guide.md`](./01-sql-guide.md) — index your foreign keys (PostgreSQL doesn't auto-index them).
- [`04-aggregation-and-views.md`](./04-aggregation-and-views.md) — collapsing joined rows into JSON arrays.

[⬆ Back to docs index](../README.md)

---

_Last updated: 12/05/2026_
