# 🔧 Scripts

> Automation scripts for database lifecycle and project bootstrap. Driven by pnpm aliases defined in `package.json`.

## Overview

```text
scripts/
├─ README.md         # this file
├─ init_db.sh        # Create database, role, schema, permissions
├─ reset_db.sh       # Drop tables (keep database and role)
├─ nuke_db.sh        # ☢️ Drop database AND role
├─ run_sql.sh        # Run a single SQL file with chosen user/db
└─ gen-secrets.js    # Generate cryptographic secrets for .env
```

Each script is wired to a pnpm alias:

| Script           | pnpm alias           | What it does                                   |
| :--------------- | :------------------- | :--------------------------------------------- |
| `init_db.sh`     | `pnpm db:init`       | Bootstrap the database from scratch.           |
| `reset_db.sh`    | `pnpm db:reset`      | Drop tables, optionally re-init.               |
| `nuke_db.sh`     | `pnpm db:nuke`       | Drop database + role. Nuclear option.          |
| `run_sql.sh`     | `pnpm db:run <file>` | Run a single SQL file.                         |
| `gen-secrets.js` | `pnpm gen:secrets`   | Generate cryptographic secrets for the `.env`. |

All shell scripts require executable permission. After cloning the repo:

```bash
chmod +x scripts/*.sh
```

---

## `init_db.sh` — bootstrap the database

The full pipeline that takes you from empty PostgreSQL to a ready-to-use Memoria database.

**What it runs, in order:**

| Phase | Action                                      | Connection user |
| :---- | :------------------------------------------ | :-------------- |
| 0     | Create the database if missing              | `DB_SUPERUSER`  |
| 1     | Create the application role                 | `DB_SUPERUSER`  |
|       | Install extensions (`citext`, `pg_trgm`, …) | `DB_SUPERUSER`  |
|       | Create custom types (ENUMs)                 | `DB_SUPERUSER`  |
| 2     | Install triggers (functions + bindings)     | `DB_SUPERUSER`  |
| 3     | Create tables                               | `DB_SUPERUSER`  |
| 4     | Grant permissions to the app role           | `DB_SUPERUSER`  |
| 5     | _(optional, prompts y/N)_ Seed data         | `DB_SUPERUSER`  |
| 6     | Create views (`v_*`)                        | `DB_SUPERUSER`  |

**Environment variables read from `.env`:**

| Variable       | Default          | Purpose                            |
| :------------- | :--------------- | :--------------------------------- |
| `DB_SUPERUSER` | `postgres`       | The PostgreSQL superuser locally.  |
| `DB_APP_USER`  | `app_memoria`    | The application role created here. |
| `DB_NAME`      | `memoria_db_dev` | Database name.                     |

**Usage:**

```bash
pnpm db:init
```

**Idempotent.** Safe to re-run — each phase uses `CREATE … IF NOT EXISTS` (or equivalent). Running it twice on an existing database does nothing.

---

## `reset_db.sh` — drop tables, keep the rest

Wipes the schema but keeps the database and the `app_memoria` role intact. Useful when you want a fresh start without recreating roles and permissions.

**What it does:**

1. Confirms with the user (typed `RESET` required).
2. Runs every `.sql` file in `database/migrations/drop/`.
3. Offers to immediately re-init via `init_db.sh`.

**Usage:**

```bash
pnpm db:reset
```

Type `RESET` to confirm. Answer `y` at the re-init prompt to bring the schema back.

If the database doesn't exist yet, the script offers to run `init_db.sh` instead — no error.

---

## `nuke_db.sh` — full destruction

☢️ **The nuclear option.** Drops the database **and** the application role. Use only when you want a completely clean state, or when migrating to a fresh setup.

**What it does:**

1. Requires the user to type `NUKE` to confirm.
2. `DROP DATABASE memoria_db_dev (FORCE)` — disconnects active sessions (PostgreSQL 13+).
3. `DROP OWNED BY app_memoria` — releases any privileges held by the role.
4. `DROP ROLE app_memoria` — removes the role entirely.
5. Offers to immediately rebuild via `init_db.sh`.

**Usage:**

```bash
pnpm db:nuke
```

⚠️ **Never run this in production.** It's intended for local development resets.

---

## `run_sql.sh` — execute a single SQL file

A utility for running any SQL file against the project database with a chosen user. Useful for ad-hoc migrations, debugging, or running new SQL files before adding them to the migration pipeline.

**Usage:**

```bash
# With defaults (app role on the project DB)
pnpm db:run database/migrations/tables/07_session.sql

# Override the database
pnpm db:run database/queries/some_report.sql memoria_db_prod

# Override the user too (e.g. for DDL that requires superuser)
pnpm db:run database/migrations/config/01_roles.sql postgres postgres
```

**Defaults read from `.env`:**

- DB user → `DB_APP_USER` (typically `app_memoria`)
- DB name → `DB_NAME`

**Behavior:**

- Uses `psql -v ON_ERROR_STOP=1` — stops on the first error.
- Validates that the file exists before running.
- Prints a usage banner if called without arguments.

---

## `gen-secrets.js` — generate cryptographic secrets

⚠️ **This script's content is legacy and needs updating.** It currently generates `SESSION_SECRET` and `CSRF_SECRET` — leftovers from the JS Express SSR architecture. With the new TypeScript REST API using JWT, the right variables are `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`. The update is tracked in [`TODO.md`](../TODO.md).

> ℹ️ The `.js` extension is fine — scripts live outside `src/` and don't need to be TypeScript. Only the **content** of the script needs adapting to the JWT auth.

**Current behavior (legacy):**

Generates the following secrets and writes them into `.env`:

| Variable          | Length   | Encoding  |
| :---------------- | :------- | :-------- |
| `SESSION_SECRET`  | 64 bytes | hex       |
| `CSRF_SECRET`     | 64 bytes | hex       |
| `DB_PASSWORD`     | 24 bytes | base64url |
| `DB_APP_PASSWORD` | 24 bytes | base64url |

**Usage:**

```bash
# Update .env locally (wraps values in single quotes)
pnpm gen:secrets

# Print to stdout without writing — for production env vars (no quotes)
pnpm gen:secrets -- --prod
```

**Pitfalls:**

- The script reads `.env` first, then overwrites matching keys in place. If a key doesn't exist, it's appended at the bottom — check the file after running.
- The dev mode wraps values in single quotes. **Don't paste those into production env panels** (Vercel, Render, AlwaysData…) — they don't strip the quotes. Use `--prod` for unquoted output.
- After regenerating `DB_APP_PASSWORD`, update `DATABASE_URL` to use the new password, **and** synchronize the password on the database (via `ALTER ROLE app_memoria WITH PASSWORD '…';`).

**Target content update (tracked in TODO):**

- Replace `SESSION_SECRET` + `CSRF_SECRET` with `JWT_ACCESS_SECRET` + `JWT_REFRESH_SECRET`.
- Keep the DB password generation logic — still useful for setting `app_memoria`'s password.
- The `.js` extension stays — no migration to TypeScript needed (scripts live outside `src/`).

---

## Common workflows

### First-time setup on a fresh machine

```bash
pnpm install               # installs deps + activates Husky hooks
cp .env.example .env       # then edit DB connection info
pnpm gen:secrets           # generate secrets, write to .env
pnpm db:init               # create database + schema
pnpm dev                   # start the dev server
```

### Apply a new SQL file without restarting

```bash
pnpm db:run database/migrations/tables/12_new_feature.sql
```

### Start over after a schema mess

```bash
pnpm db:reset              # type RESET, then 'y' to re-init
```

### Full reset, including role and permissions

```bash
pnpm db:nuke               # type NUKE, then 'y' to rebuild
```

---

## Adding a new script

When you add a new script:

1. Place it in `scripts/`.
2. For shell scripts: start with `#!/usr/bin/env sh`, use `set -e`, prefer the existing color/helper conventions for consistency.
3. For Node scripts: use TypeScript (`.ts`), run via `tsx` from a pnpm alias.
4. Document it in this README — what it does, when to use it, pitfalls.
5. Wire it in `package.json` under `scripts:` so it's discoverable via `pnpm <alias>`.

## Related docs

- [`../docs/backend/01-getting-started.md`](../docs/backend/01-getting-started.md) — install and bootstrap workflow.
- [`../docs/backend/03-database-connection.md`](../docs/backend/03-database-connection.md) — how the app reaches the DB.
- [`../docs/database/01-sql-guide.md`](../docs/database/01-sql-guide.md) — security, indexing, types.

[⬆ Back to project root](../README.md)

---

_Last updated: 12/05/2026_
