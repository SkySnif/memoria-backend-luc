# 📂 File Organization

> Where things go, and why. When unsure, this is the reference.

## Top-level layout

```text
memoria-backend/
├─ src/                     # TypeScript source
├─ database/                # SQL: migrations, seeders, triggers, views
├─ scripts/                 # Bash and JS/TS automation
├─ docs/                    # This documentation
├─ dist/                    # Build output (gitignored)
├─ coverage/                # Vitest coverage reports (gitignored)
├─ .husky/                  # Git hooks (managed by Husky)
├─ package.json
├─ tsconfig.json            # Base TS config + path aliases
├─ tsconfig.build.json      # Production build config (excludes tests)
├─ vitest.config.ts
├─ eslint.config.js         # ESLint flat config
├─ .prettierrc.json
└─ .env.example
```

## `src/` — application source

Each subfolder corresponds to one responsibility in the layered architecture.

```text
src/
├─ app.ts             # Express configuration (middlewares, routes wiring)
├─ server.ts          # HTTP entry point
├─ config/            # Singletons: DatabaseConnection, LoggerSingleton, SwaggerConfig, UploadConfig
├─ constants/
│  ├─ enums/          # TypeScript enums shared between layers (ContentType, Role, ...)
│  └─ zod/            # Zod schemas, grouped by domain
├─ controllers/       # HTTP handlers (parse request, call service, format response)
├─ dto/               # Data Transfer Objects (Create / Update / Response)
├─ entities/          # Domain types (BaseEntity, User, Item, Tag, Share)
├─ exceptions/        # ApiError + per-domain factories
├─ interfaces/        # Contracts for dependency injection (I-prefixed)
├─ middlewares/       # AuthMiddleware (and future per-route middlewares)
├─ repositories/      # Pg* (real) + Mock* (in-memory for tests)
├─ routes/v1/         # Router factories + composition root
├─ services/          # Business logic (orchestrates repositories, applies rules)
├─ types/             # Ambient TS types (express.d.ts, ...)
└─ utils/             # Pure helpers (SlugGenerator, TokenManager, PasswordHasher, ...)
```

### When to put a file where

Decision tree:

```text
Is it an HTTP request handler?           → src/controllers/
Is it a business rule?                   → src/services/
Is it raw SQL on PostgreSQL?             → src/repositories/Pg*.ts
Is it an in-memory test double?          → src/repositories/Mock*.ts
Is it a domain object?                   → src/entities/
Is it a Zod schema?                      → src/constants/zod/<domain>/
Is it a derived DTO type?                → src/dto/<domain>/
Is it a typed error?                     → src/exceptions/
Is it an interface for DI?               → src/interfaces/<layer>/
Is it a singleton owning a resource?     → src/config/
Is it a pure helper (no Express, no SQL)? → src/utils/
```

### Controllers vs services vs repositories

The single most important distinction in this codebase:

- **Controller**: HTTP-aware. Takes `req`/`res`, parses with Zod, calls the service, formats the response. **No business rules. No SQL.**
- **Service**: HTTP-agnostic. Takes plain TypeScript values, returns plain TypeScript values. Orchestrates repositories and applies business rules. **No `req`/`res`. No `pg`.**
- **Repository**: Talks to PostgreSQL. Takes plain values, returns entities. Wraps `pg` errors into `ApiError` via factories. **No business logic. No HTTP.**

Heuristic: a method that says "this user owns this resource" is in a service. A method that says "SELECT … FROM items WHERE …" is in a repository. A method that says "the request body is missing a field" is in a controller (or, more often, in the Zod schema invoked by the controller).

### Repository files

One file per entity per implementation:

```text
repositories/
├─ PgItemRepository.ts        # Real implementation, talks to PostgreSQL
├─ MockItemRepository.ts      # In-memory double for tests
├─ PgTagRepository.ts
├─ MockTagRepository.ts
└─ ...
```

Both implementations match the same interface (e.g. `IItemRepository` in `src/interfaces/repositories/`). The composition root picks one at startup.

### Service files

One file per business domain:

```text
services/
├─ AuthService.ts           # Register, login, refresh, logout
├─ BlacklistService.ts      # Revoked refresh tokens (in-memory)
├─ ItemService.ts           # Item rules + orchestration
├─ TagService.ts            # Tag rules + orchestration
├─ ShareService.ts          # Public share rules (token generation, expiry)
├─ UserService.ts           # Profile, password change, account deletion
├─ UserExportService.ts     # GDPR export aggregator
└─ http/HandlerService.ts   # Global error middleware
```

### DTO files

Three flavors per domain, all in the same folder:

```text
dto/item/
├─ CreateItemDto.ts          # POST  /items     body
├─ UpdateItemDto.ts          # PATCH /items/:id body
└─ ResponseItemDto.ts        # what the API returns
```

`CreateItemDto` and `UpdateItemDto` types are inferred from Zod schemas in `constants/zod/item/`. `ResponseItemDto` is hand-written because it's the shape your service _produces_, not the shape it _validates_.

### Interface files (I-prefixed)

```text
interfaces/
├─ controllers/IItemController.ts
├─ database/IDatabaseConnection.ts
├─ entities/IUser.ts
├─ http/IHandlerService.ts
├─ repositories/IItemRepository.ts
├─ security/IBlacklistService.ts
└─ services/IItemService.ts
```

Every concrete class has a matching interface. Code depends on the interface — only the composition root (`src/routes/v1/index.ts`) imports concrete implementations.

## Tests — colocated, no root `tests/` folder

Backend tests live **next to the code they test**, in `__tests__/` folders:

```text
src/services/
├─ TagService.ts
└─ __tests__/
   └─ TagService.test.ts

src/utils/
├─ SlugGenerator.ts
└─ __tests__/
   └─ SlugGenerator.test.ts
```

> Coming from the frontend? The frontend uses a central `tests/` folder at the root. The backend chose colocation instead. Both are valid; the backend prefers colocation because:
>
> - Tests live next to the implementation they cover — easier to find, easier to refactor.
> - Renaming the source file in your IDE moves the test with it.
> - It surfaces "this file is well-tested" / "this file isn't" at a glance.

Build excludes test files from the production output via `tsconfig.build.json` (`"exclude": ["src/**/*.test.ts"]`).

## `database/` — pure SQL

```text
database/
├─ migrations/
│  ├─ config/                 # 01-04: roles, extensions, types
│  ├─ tables/                 # 01-NN: table definitions (idempotent)
│  └─ drop/                   # Tear-down scripts (used by db:reset)
├─ seeders/                   # Optional test data
├─ triggers/                  # PL/pgSQL functions + triggers
├─ views/                     # Named views (v_*)
└─ queries/                   # Reference SQL, not executed by migrations
```

Migration files run in **filename order** (lexical sort), which is why we prefix them with two digits. Files in `migrations/config/00_*.sql` are skipped by `pnpm db:migrate` because the database/role creation lives in `scripts/init_db.sh`.

All migrations are **idempotent** — `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `CREATE OR REPLACE VIEW`, `DROP TRIGGER IF EXISTS … CREATE TRIGGER …`. Re-running `pnpm db:migrate` should never fail.

## `scripts/` — automation

```text
scripts/
├─ README.md                  # Detailed documentation for each script
├─ init_db.sh                 # Create database + role + schema + permissions
├─ reset_db.sh                # Drop tables (keep database/role)
├─ nuke_db.sh                 # ☢️ Drop database AND role
├─ run_sql.sh                 # Run any SQL file with chosen user/db
└─ gen-secrets.js             # Generate cryptographic secrets for .env
```

See [**`scripts/README.md`**](../../scripts/README.md) for the full reference — what each script does, when to use it, and the common pitfalls.

> ⚠️ Some scripts here are still `.js` (legacy from the JS Express SSR era). Migrating them to `.ts` is part of the student migration TODO.

## `docs/` — this documentation

Mirrors the frontend's `docs/` structure:

```text
docs/
├─ README.md                          # Index
├─ architecture.md                    # Layered architecture, DI, request lifecycle
├─ backend/
│  ├─ 01-getting-started.md
│  ├─ 02-oop-refresher.md
│  ├─ 03-database-connection.md
│  ├─ 04-error-handling.md
│  ├─ 05-validation-zod.md
│  ├─ 06-authentication-jwt.md
│  ├─ 07-testing-tdd.md
│  └─ 08-deployment.md
├─ database/
│  ├─ 01-sql-guide.md
│  ├─ 02-jsonb-and-search.md
│  ├─ 03-joins-and-relationships.md
│  ├─ 04-aggregation-and-views.md
│  └─ assets/                         # MCD, MLD, ERD diagrams
└─ conventions/
   ├─ 01-typescript-style.md
   ├─ 02-file-organization.md         # ← you are here
   └─ 03-git-workflow.md
```

Numbered prefixes define reading order.

## Files that don't fit anywhere

If you can't decide where a file goes, it usually means **the file does too much**. Split it.

Concrete examples:

- A service that also issues raw `pg.query` calls → extract the SQL into a repository.
- A controller that contains a business rule → move the rule into the service.
- A utility that imports `express` → it's a middleware, not a utility. Move to `middlewares/`.
- A file under `src/` still in `.js` → migrate it to `.ts`. The migration is documented in the project [`TODO.md`](../../TODO.md).

## Related docs

- [`01-typescript-style.md`](./01-typescript-style.md) — naming, visibility, TSDoc.
- [`../architecture.md`](../architecture.md) — the layered architecture these folders serve.
- [`../../scripts/README.md`](../../scripts/README.md) — automation scripts in detail.

[⬆ Back to docs index](../README.md)

---

_Last updated: 12/05/2026_
