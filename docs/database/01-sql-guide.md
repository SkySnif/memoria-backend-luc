# 🗄️ PostgreSQL Guide — Memoria

> Standards, security, and performance rules for the Memoria database.

## 📌 Table of Contents

1. [Glossary](#glossary)
2. [Security & Best Practices](#security--best-practices)
3. [Indexing & Performance](#indexing--performance)
4. [Data Types](#data-types)
5. [Relationships & Cardinalities](#relationships--cardinalities)
6. [Automation (Triggers & Defaults)](#automation-triggers--defaults)
7. [Search Engine Features](#search-engine-features)
8. [Production Checklist](#production-checklist)
9. [KISS Philosophy](#kiss-philosophy)

---

## Glossary

- **DCL (Data Control Language)** — commands that manage rights and access (e.g. `CREATE USER`, `GRANT`). This is security.
- **DDL (Data Definition Language)** — commands that define structure (e.g. `CREATE TABLE`, `ALTER`). This is architecture.
- **DML (Data Manipulation Language)** — commands that manipulate data (`SELECT`, `INSERT`, `UPDATE`, `DELETE`). This is content.

---

## Security & Best Practices

### 1. NEVER connect the application as the `postgres` role

```sql
-- ❌ DANGEROUS: using postgres in production
DATABASE_URL=postgresql://postgres:password@localhost/memoria_db

-- ✅ CORRECT: create a dedicated application role
CREATE ROLE app_memoria WITH LOGIN PASSWORD '<strong_password>';
GRANT ALL PRIVILEGES ON DATABASE memoria_db TO app_memoria;

-- In the application:
DATABASE_URL=postgresql://app_memoria:<strong_password>@localhost/memoria_db
```

**Why?**

- `postgres` = superuser → can drop the entire database.
- `app_memoria` = limited rights → reduced blast radius if the app is compromised.

This is enforced by `scripts/init_db.sh`. The app **never** connects as `postgres`.

### 2. Always hash passwords (backend-side)

```sql
-- ❌ NEVER store plaintext
INSERT INTO users (password) VALUES ('mypassword123');

-- ✅ ALWAYS hash with Argon2id (in Node.js, via @node-rs/argon2)
import { hash } from '@node-rs/argon2';
const hashed = await hash('mypassword123');
INSERT INTO users (password_hash) VALUES ($1);  -- $1 = hashed
```

**Recommended algorithms (OWASP 2024+):**

- **Argon2id** — what we use. Memory-hard, recommended for new applications.
- **bcrypt** — acceptable legacy choice (12+ rounds).
- **scrypt** — also fine, less common.

See [`../backend/06-authentication-jwt.md`](../backend/06-authentication-jwt.md) for the full pattern.

### 3. GDPR — cascade and right to be forgotten

```sql
-- ✅ When a user is deleted, all their private data must disappear too.
CREATE TABLE items (
    user_id UUID REFERENCES users(id_user) ON DELETE CASCADE
);

-- ❌ Without CASCADE, deletion fails when the user has related data.
```

**Relevant GDPR article**: Article 17 (Right to erasure).

---

## Indexing & Performance

### 1. PostgreSQL creates automatic indexes for

| **Constraint** | **Auto index?** | **Type**                    |
| -------------- | --------------- | --------------------------- |
| `PRIMARY KEY`  | ✅ YES          | B-tree UNIQUE               |
| `UNIQUE`       | ✅ YES          | B-tree UNIQUE               |
| `FOREIGN KEY`  | ❌ NO           | _None_ (you must create it) |

```sql
-- ❌ REDUNDANT: email is already UNIQUE
CREATE TABLE users (email CITEXT UNIQUE);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);  -- Useless!

-- ✅ NECESSARY: Foreign Key (no auto index)
CREATE TABLE items (user_id UUID REFERENCES users(id_user));
CREATE INDEX IF NOT EXISTS idx_items_user ON items (user_id);  -- Mandatory!
```

### 2. When to create a manual index

#### ✅ Mandatory indexes

```sql
-- Foreign Keys (never auto-indexed)
CREATE INDEX IF NOT EXISTS idx_items_user ON items (user_id);

-- Columns frequently filtered (WHERE)
CREATE INDEX IF NOT EXISTS idx_items_type ON items (content_type);

-- Columns frequently sorted (ORDER BY ... DESC)
CREATE INDEX IF NOT EXISTS idx_items_created ON items (created_at DESC);
```

#### ✅ Specialized indexes

```sql
-- Full-text search (French)
CREATE INDEX IF NOT EXISTS idx_items_search ON items USING gin (
    to_tsvector('french', title || ' ' || content)
);

-- Fuzzy search (trigram)
CREATE INDEX IF NOT EXISTS idx_items_title_trgm ON items USING gin (title gin_trgm_ops);

-- JSONB (flexible metadata)
CREATE INDEX IF NOT EXISTS idx_items_metadata ON items USING gin (metadata);
```

#### ✅ Partial indexes (conditional)

```sql
-- Index only for user-attributed events (skips NULL rows)
CREATE INDEX IF NOT EXISTS idx_events_user ON app_events (user_id)
WHERE user_id IS NOT NULL;
```

**Benefit**: index ~50% smaller and faster.

### 3. Avoid over-indexing

#### ❌ Bad practice

```sql
-- Indexing every column (over-engineering)
CREATE INDEX IF NOT EXISTS idx_users_created ON users (created_at);  -- Never used
CREATE INDEX IF NOT EXISTS idx_users_updated ON users (updated_at);  -- Never used

-- Indexing rarely-filtered columns
CREATE INDEX IF NOT EXISTS idx_items_source_author ON items (source_author);  -- Rare
```

**Cost of an unused index:**

- +10-30% storage.
- +5-15% time on INSERT / UPDATE.
- Zero benefit on SELECT.

---

## Data Types

### 1. Use ENUM instead of VARCHAR + CHECK

```sql
-- ❌ LESS PERFORMANT
event_category VARCHAR(20) CHECK (event_category IN ('analytics', 'audit'));

-- ✅ BETTER (native PostgreSQL type)
CREATE TYPE event_category_enum AS ENUM ('analytics', 'audit', 'monitoring', 'gdpr');
event_category event_category_enum NOT NULL;
```

**Benefits:**

- Strong typing (clear error on invalid value).
- Faster (native type vs constraint check).
- Self-documenting (`\dT` in psql lists them).

### 2. CITEXT for email and pseudo (case-insensitive)

```sql
-- ❌ Case-sensitive: Panda@mail.com ≠ panda@mail.com
email VARCHAR(255) UNIQUE;

-- ✅ Case-insensitive: Panda@mail.com = panda@mail.com
email CITEXT UNIQUE;
```

**Required extension:**

```sql
CREATE EXTENSION IF NOT EXISTS "citext";
```

### 3. JSONB vs JSON

```sql
-- ❌ JSON: raw text, slow to query
settings JSON;

-- ✅ JSONB: binary format, indexable
settings JSONB NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_users_settings ON users USING gin (settings);
```

**Differences:**

| **JSON**            | **JSONB**                |
| :------------------ | :----------------------- |
| Text storage        | Optimized binary storage |
| Cannot be indexed   | Indexable with GIN       |
| Preserves key order | Key order not guaranteed |
| Faster to insert    | Faster to query          |

### 4. UUID for identifiers

```sql
-- Standard PostgreSQL: random UUID v4
id_user UUID PRIMARY KEY DEFAULT gen_random_uuid();
```

UUID v4 is what `pgcrypto` ships natively. It's random — fine for our use cases.

**For very high-traffic tables**, UUID v7 (time-ordered) gives better B-tree index locality. PostgreSQL doesn't ship a built-in `uuidv7()` function yet — install the `pg_uuidv7` extension if you need it:

```sql
-- After installing the extension:
id_item UUID PRIMARY KEY DEFAULT uuidv7();
```

For Memoria, `gen_random_uuid()` is enough.

---

## Relationships & Cardinalities

### 1. Verify business cardinalities

```sql
-- ❌ WRONG: an event always belongs to a user
app_events (0,N) ──── (1,1) users

-- ✅ CORRECT: an event can be a system event (no user)
app_events (0,1) ──── (1,N) users
```

**In SQL:**

```sql
user_id UUID REFERENCES users(id_user) ON DELETE SET NULL  -- Nullable!
```

### 2. ON DELETE CASCADE vs SET NULL

```sql
-- ✅ CASCADE: delete related data (GDPR)
CREATE TABLE items (
    user_id UUID REFERENCES users(id_user) ON DELETE CASCADE
);

-- ✅ SET NULL: keep history (audit)
CREATE TABLE app_events (
    user_id UUID REFERENCES users(id_user) ON DELETE SET NULL
);
```

**When to use CASCADE:**

- Private data (items, tags).
- Required by GDPR.

**When to use SET NULL:**

- Logs and events (audit trail).
- Aggregated statistics.

---

## Automation (Triggers & Defaults)

### 1. Trigger for `updated_at`

```sql
-- Reusable function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to each table (idempotent — drop first, then create)
DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
```

**Why?**

- Removes the risk of forgetting to update `updated_at` in application code.
- Guarantees consistency (database = source of truth).

### 2. Smart defaults

```sql
-- ✅ Automatic timestamp
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

-- ✅ Automatic UUID
id_user UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- ✅ Empty JSONB by default
metadata JSONB NOT NULL DEFAULT '{}'

-- ✅ Default role
role_name role_enum NOT NULL DEFAULT 'customer'
```

---

## Search Engine Features

### 1. Full-text search

```sql
-- French-aware full-text index
CREATE INDEX IF NOT EXISTS idx_items_search ON items USING gin (
    to_tsvector('french', coalesce(title, '') || ' ' || coalesce(content, ''))
);

-- Query
SELECT * FROM items
WHERE to_tsvector('french', title || ' ' || content)
      @@ to_tsquery('french', 'panda & red');
```

### 2. Fuzzy search (trigram)

```sql
-- Required extension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Index
CREATE INDEX IF NOT EXISTS idx_items_title_trgm ON items USING gin (title gin_trgm_ops);

-- Query: finds "panda" even if the user types "penda"
SELECT * FROM items
WHERE title % 'penda'        -- fuzzy similarity
ORDER BY similarity(title, 'penda') DESC;
```

---

## Production Checklist

### ✅ Security

- [ ] Application role created (not `postgres`).
- [ ] Passwords hashed with Argon2id.
- [ ] GDPR: `ON DELETE CASCADE` on private user data.
- [ ] HTTPS enabled (SSL certificate).
- [ ] Environment variables secured (`.env` with `chmod 600`).

### ✅ Performance

- [ ] Index on every Foreign Key.
- [ ] No redundant indexes (check against UNIQUE constraints).
- [ ] GIN indexes on JSONB and full-text columns.
- [ ] `EXPLAIN ANALYZE` on the slow queries.

### ✅ Integrity

- [ ] UNIQUE constraints on unique columns.
- [ ] CHECK constraints (or ENUM) on bounded values.
- [ ] NOT NULL on required columns.
- [ ] `updated_at` trigger on every table that needs it.

### ✅ Documentation

- [ ] SQL comments on tables and columns.
- [ ] Entity Relationship Diagram (ERD) in `assets/`.
- [ ] This guide kept up to date as the schema evolves.

---

## KISS Philosophy

> **"Keep It Simple, Stupid"**

### ✅ Do simple

```sql
-- Simple and effective
email CITEXT UNIQUE NOT NULL
```

### ❌ Over-engineering

```sql
-- Complex with no benefit
CREATE TABLE email_validations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id_user),
    email_hash VARCHAR(64),
    validation_token VARCHAR(255),
    validated_at TIMESTAMPTZ,
    -- ...
);
```

**When to add complexity:**

- Real business need (not "just in case").
- Measured performance gap (not "I think it'll be faster").
- Required by compliance (GDPR, PCI-DSS).

---

## Related docs

- [`02-jsonb-and-search.md`](./02-jsonb-and-search.md) — querying JSONB columns with `->>` and string functions.
- [`03-joins-and-relationships.md`](./03-joins-and-relationships.md) — INNER vs LEFT JOIN, pivot tables, aggregation.
- [`04-aggregation-and-views.md`](./04-aggregation-and-views.md) — `JSON_AGG`, named views, dashboard-ready queries.
- [`../backend/03-database-connection.md`](../backend/03-database-connection.md) — how the app reaches the DB.
- [`../backend/06-authentication-jwt.md`](../backend/06-authentication-jwt.md) — Argon2id hashing in detail.

[⬆ Back to docs index](../README.md)

---

_Last updated: 12/05/2026_
