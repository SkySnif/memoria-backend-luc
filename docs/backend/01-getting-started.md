# 🚀 Getting Started

## Requirements

- **Node.js 22+** — pinned by `engines` in `package.json`.
- **pnpm 10+** — see below if you don't have it.
- **PostgreSQL 17+** — local install, Docker, or a managed service.

### Installing pnpm

The cleanest way is via **Corepack** (ships with Node 16.13+):

```bash
corepack enable
corepack prepare pnpm@10.30.2 --activate
```

Alternative (manual install):

```bash
npm install -g pnpm
```

Verify:

```bash
pnpm --version
node --version
psql --version
```

## Install

```bash
git clone <your-repo-url> memoria-backend
cd memoria-backend
pnpm install
```

This creates `node_modules/` (hard-linked from pnpm's content-addressable store — disk-efficient) and `pnpm-lock.yaml`. Commit the lockfile.

The `pnpm install` step also activates the **Husky git hooks** via the `prepare` script. From this point on, your commits and pushes are validated automatically. See [`../conventions/03-git-workflow.md`](../conventions/03-git-workflow.md) for what each hook does.

## Configure

```bash
cp .env.example .env
```

`.env` contains:

| Variable             | Default                                                         | Purpose                                           |
| :------------------- | :-------------------------------------------------------------- | :------------------------------------------------ |
| `NODE_ENV`           | `development`                                                   | Switches log format, error verbosity, etc.        |
| `PORT`               | `3000`                                                          | HTTP port the API listens on.                     |
| `DATABASE_URL`       | `postgresql://app_memoria:<password>@localhost:5432/memoria_db` | PostgreSQL connection string for the app role.    |
| `JWT_ACCESS_SECRET`  | _(generated)_                                                   | Symmetric secret for access tokens (15 min TTL).  |
| `JWT_REFRESH_SECRET` | _(generated)_                                                   | Symmetric secret for refresh tokens (7 days TTL). |
| `LOG_LEVEL`          | `debug` in dev, `info` in prod                                  | Pino log level (`trace`/`debug`/`info`/`warn`/…). |

### Generate JWT secrets

Don't make up your own. Use the helper script — it produces cryptographically strong values:

```bash
pnpm gen:secrets
```

Copy the output into your `.env`. Never commit `.env` (it's gitignored).

## Initialize the database

Three steps, all idempotent (safe to re-run).

```bash
# 1. Create the database, the app role, grant privileges
chmod +x scripts/*.sh
pnpm db:init

# 2. Run all migrations (tables, extensions, triggers, views)
pnpm db:migrate
```

`db:init` runs `scripts/init_db.sh` which uses the **`postgres` superuser** locally to create `memoria_db` and the `app_memoria` role. The app itself never connects as `postgres` — it uses `app_memoria` with limited privileges. See [`../database/01-sql-guide.md`](../database/01-sql-guide.md) for the rationale.

`db:migrate` runs every `.sql` file in `database/migrations/` (skipping `00_*.sql`, which are handled by `init_db.sh`).

To wipe and rebuild from scratch:

```bash
pnpm db:nuke      # Drops the database and the role. DANGER.
pnpm db:init      # Recreate
pnpm db:migrate   # Replay all migrations
```

## Run

```bash
pnpm dev
```

The server listens on `http://localhost:3000`. `tsx watch` reloads on every save. Once up, point your browser to:

- **`http://localhost:3000/health`** — basic health probe.
- **`http://localhost:3000/docs`** — Swagger UI with the full OpenAPI spec.

## Scripts

| Script               | Purpose                                                   |
| :------------------- | :-------------------------------------------------------- |
| `pnpm dev`           | Dev server with hot reload (`tsx watch --env-file=.env`). |
| `pnpm build`         | Type-check + compile to `dist/` (`tsc` then `tsc-alias`). |
| `pnpm start`         | Run the compiled output (`node dist/server.js`).          |
| `pnpm test`          | Vitest single run (CI / pre-commit).                      |
| `pnpm test:watch`    | Vitest watch mode (TDD).                                  |
| `pnpm test:coverage` | Vitest with V8 coverage report in `coverage/`.            |
| `pnpm lint`          | ESLint on `src/`.                                         |
| `pnpm lint:fix`      | ESLint with auto-fix.                                     |
| `pnpm typecheck`     | `tsc --noEmit` — type-check without writing files.        |
| `pnpm db:init`       | Create the database and the `app_memoria` role.           |
| `pnpm db:migrate`    | Apply all migrations (idempotent).                        |
| `pnpm db:nuke`       | **Danger**: drop the database and the role.               |
| `pnpm gen:secrets`   | Generate JWT secrets to paste into `.env`.                |

## Project tour

After `pnpm install`, the structure is:

```text
memoria-backend/
├─ src/                  # Application source (TypeScript)
│  ├─ app.ts             # Express configuration (middlewares, routes)
│  ├─ server.ts          # HTTP entry point
│  ├─ config/            # Singletons (DatabaseConnection, LoggerSingleton, SwaggerConfig)
│  ├─ constants/         # TS enums + Zod schemas
│  ├─ controllers/       # HTTP handlers
│  ├─ dto/               # Data Transfer Objects (Create/Update/Response)
│  ├─ entities/          # Domain entities
│  ├─ exceptions/        # ApiError + factories
│  ├─ interfaces/        # Contracts for DI (I-prefixed)
│  ├─ middlewares/       # AuthMiddleware
│  ├─ repositories/      # Pg* (real) + Mock* (in-memory for tests)
│  ├─ routes/v1/         # Router factories (composition root lives here)
│  ├─ services/          # Business logic
│  ├─ types/             # express.d.ts and other ambient types
│  └─ utils/             # Pure helpers (SlugGenerator, TokenManager, ...)
├─ database/             # Pure SQL
│  ├─ migrations/        # Idempotent DDL (tables, extensions, triggers, views)
│  ├─ seeders/           # Test data
│  └─ views/             # Named SQL views
├─ scripts/              # Bash + TS scripts (init_db.sh, gen-secrets.ts, etc.)
├─ docs/                 # This documentation
├─ .husky/               # Git hooks (managed by Husky)
├─ tsconfig*.json        # TS project references
├─ eslint.config.js      # ESLint flat config
└─ vitest.config.ts      # Vitest config (extends tsconfig path aliases)
```

See [`../conventions/02-file-organization.md`](../conventions/02-file-organization.md) for the detailed reasoning.

## First feature, end-to-end

Adding a feature follows this loop (TDD-first):

1. **Create the branch**: `git checkout -b feature/<name> develop`.
2. **Add the entity** in `src/entities/<Entity>.ts` (if new).
3. **Add the migration** in `database/migrations/tables/<n>_<entity>.sql`.
4. **Write the Zod schema** in `src/constants/zod/<entity>/`.
5. **Add the DTO** in `src/dto/<entity>/` (Create, Update, Response).
6. **Write a failing test** in `src/services/__tests__/<EntityService>.test.ts`.
7. **Add the repository interface + Pg implementation** in `src/interfaces/repositories/` and `src/repositories/`.
8. **Add the service interface + implementation** in `src/interfaces/services/` and `src/services/`.
9. **Add the controller** in `src/controllers/<Entity>Controller.ts`.
10. **Add the router factory** in `src/routes/v1/<entity>.ts` and wire it in `src/routes/v1/index.ts` (composition root).
11. **Refactor** with tests green.

See [`07-testing-tdd.md`](./07-testing-tdd.md) for the test patterns and [`../conventions/03-git-workflow.md`](../conventions/03-git-workflow.md) for branches and commits.

## Adding dependencies

```bash
pnpm add <package>            # runtime dependency
pnpm add -D <package>         # dev dependency
pnpm remove <package>         # remove
pnpm update                   # update within ranges
pnpm outdated                 # check for newer versions
```

## Build for production

```bash
pnpm build       # → dist/
pnpm start       # node dist/server.js
```

For real production deployments with **PM2 + Traefik**, see [`08-deployment.md`](./08-deployment.md).

## Troubleshooting

| Symptom                                            | Likely cause                                                                   |
| :------------------------------------------------- | :----------------------------------------------------------------------------- |
| `pnpm: command not found`                          | Corepack not enabled. Run `corepack enable`.                                   |
| `ERR_PNPM_IGNORED_BUILDS` for esbuild              | `pnpm.onlyBuiltDependencies` is missing in `package.json`. Already pre-set.    |
| `password authentication failed for "app_memoria"` | The password in `DATABASE_URL` doesn't match what `init_db.sh` set.            |
| `relation "items" does not exist`                  | You forgot `pnpm db:migrate`.                                                  |
| Indexes/triggers fail on second `pnpm db:migrate`  | A migration is not idempotent. Use `IF NOT EXISTS` / `DROP ... IF EXISTS`.     |
| `Unsupported engine` on `pnpm install`             | Node version below 24. Upgrade Node.                                           |
| Git hooks don't fire on commit / push              | Run `pnpm install` again — the `prepare` script activates Husky.               |
| `Cannot find module '@/...'`                       | TS path aliases not resolved at runtime. Build uses `tsc-alias`; dev uses tsx. |

## Related docs

- [`03-database-connection.md`](./03-database-connection.md) — the `DatabaseConnection` singleton.
- [`07-testing-tdd.md`](./07-testing-tdd.md) — the testing workflow.
- [`../conventions/03-git-workflow.md`](../conventions/03-git-workflow.md) — branches, commits, hooks.

[⬆ Back to docs index](../README.md)

---

_Last updated: 12/05/2026_
