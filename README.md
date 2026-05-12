# 🐼 Memoria — Your Second Brain

> **Memoria** is a **REST API** for capturing, organizing, and preserving your knowledge gems — book excerpts, podcast notes, articles, videos, personal thoughts — and sharing them publicly through temporary links.

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17+-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🆕 New to the project?

If you're picking up this project, **start by reading [`ONBOARDING.md`](./ONBOARDING.md)**: stack, setup, structure, conventions, where to start.

The list of ongoing and remaining tasks lives in [`TODO.md`](./TODO.md).

---

## 📋 Table of contents

- [🎯 Project goal](#-project-goal)
- [🛠 Tech stack](#-tech-stack)
- [🏗️ Layered architecture](#️-layered-architecture)
- [📁 Project structure](#-project-structure)
- [🚀 Install & run](#-install--run)
- [📡 API & interactive documentation](#-api--interactive-documentation)
- [🧪 Tests](#-tests)
- [📚 Documentation](#-documentation)
- [📊 Data model](#-data-model)
- [🔧 Utility scripts](#-utility-scripts)
- [📝 License](#-license)

---

## 🎯 Project goal

**Memoria** lets you:

- 📖 **Capture** your discoveries (books, podcasts, articles, videos, notes).
- 🏷️ **Organize** them with a flexible tag system.
- 🔍 **Find** anything fast through SQL views and full-text search.
- 🤝 **Share** publicly via temporary links (with optional expiration).
- 📦 **Export** all your data in one click (GDPR-compliant).

The project also serves as a **teaching support** for learning a modern REST architecture in TypeScript: strict layered design (SOLID), Zod validation, JWT authentication, unit testing, OpenAPI documentation.

---

## 🛠 Tech stack

| Layer                 | Technology                                                                |
| :-------------------- | :------------------------------------------------------------------------ |
| **Runtime**           | Node.js 24+ (ES Modules)                                                  |
| **Language**          | TypeScript 5.7 (strict mode)                                              |
| **HTTP framework**    | Express.js 5.x                                                            |
| **Database**          | PostgreSQL 17+ (UUID, JSONB, ENUMs, GIN indexes, full-text via `pg_trgm`) |
| **DB driver**         | `pg` (node-postgres)                                                      |
| **Validation**        | Zod 4                                                                     |
| **Auth**              | JWT (`jose`) with refresh token rotation                                  |
| **Password hashing**  | `@node-rs/argon2` (argon2id)                                              |
| **Logging**           | `pino` + `pino-pretty` (dev) + `pino-roll` (prod)                         |
| **API documentation** | `swagger-jsdoc` + `swagger-ui-express`                                    |
| **Tests**             | Vitest 4 + `@vitest/coverage-v8`                                          |
| **Lint & format**     | ESLint 9 (flat config) + Prettier + Husky + lint-staged                   |
| **Package manager**   | pnpm 10+                                                                  |

---

## 🏗️ Layered architecture

```text
HTTP request
    ↓
Middlewares (helmet, cors, rate-limit, requestId, AuthMiddleware)
    ↓
Routes (factories `createXxxRouter(controller)`)
    ↓
Controllers (parse req, build DTO, call service, format response)
    ↓
Services (business rules, ownership, orchestration)
    ↓
Repositories (data access, SQL via `pg`)
    ↓
PostgreSQL
```

Each layer talks to the next through an **interface** (`IUserService`, `ITagRepository`…), never through a concrete implementation. Dependencies are wired in `src/routes/v1/index.ts` (composition root).

For the full picture 👉 [`docs/architecture.md`](./docs/architecture.md).

---

## 📁 Project structure

```text
memoria-backend/
│
├─ 💻 src/                         # TypeScript source
│  ├─ app.ts                       # Express configuration
│  ├─ server.ts                    # HTTP entry point
│  ├─ config/                      # Singletons (DatabaseConnection, LoggerSingleton, SwaggerConfig)
│  ├─ constants/                   # TS enums + Zod schemas
│  ├─ controllers/                 # HTTP handlers
│  ├─ dto/                         # Data Transfer Objects (Create, Update, Response)
│  ├─ entities/                    # Domain entities
│  ├─ exceptions/                  # ApiError + factories
│  ├─ interfaces/                  # Contracts (DI)
│  ├─ middlewares/                 # AuthMiddleware
│  ├─ repositories/                # Pg* (real) + Mock* (in-memory for tests)
│  ├─ routes/v1/                   # Router factories + composition root
│  ├─ services/                    # Business logic
│  ├─ types/                       # Ambient TS types (express.d.ts)
│  └─ utils/                       # Pure helpers (SlugGenerator, TokenManager, …)
│
├─ 🗄️ database/                    # Pure SQL
│  ├─ migrations/                  # Structure (config, tables, drop)
│  ├─ seeders/                     # Test data
│  ├─ triggers/                    # PL/pgSQL functions + triggers
│  ├─ views/                       # Business views (v_*)
│  └─ queries/                     # Reference SQL
│
├─ 📚 docs/                        # Internal documentation
│  ├─ README.md                    # Documentation index
│  ├─ architecture.md              # Layered architecture deep dive
│  ├─ backend/                     # Backend guides (01 to 08)
│  ├─ database/                    # PostgreSQL guides (01 to 04)
│  └─ conventions/                 # TS style, file organization, git workflow
│
├─ 🔧 scripts/                     # Automation
│  ├─ README.md                    # Detailed script documentation
│  ├─ init_db.sh                   # Full database bootstrap
│  ├─ reset_db.sh                  # Drop tables (keep the database)
│  ├─ nuke_db.sh                   # ☢️ Drop database + role
│  ├─ run_sql.sh                   # Run an ad-hoc SQL file
│  └─ gen-secrets.js               # Generate secrets for .env
│
├─ ONBOARDING.md                   # 🆕 Project handover
├─ TODO.md                         # 🆕 Open and remaining tasks
└─ README.md                       # This file
```

---

## 🚀 Install & run

### 1️⃣ Clone the repository

```bash
git clone https://github.com/wisepanda-fr/memoria-backend.git
cd memoria-backend
```

> The companion frontend lives at https://github.com/wisepanda-fr/memoria-frontend

### 2️⃣ Environment setup

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
pnpm gen:secrets   # Generates cryptographic secrets
```

### 3️⃣ Database initialization

```bash
chmod +x scripts/*.sh
pnpm db:init       # Creates the database, the app_memoria role, the privileges
pnpm db:migrate    # Runs all migrations (idempotent)
```

### 4️⃣ Run the app

```bash
pnpm install
pnpm dev           # Dev server with hot reload (tsx watch)
```

The API listens on `http://localhost:3000`.

### 5️⃣ Production build

```bash
pnpm build         # Compile TS → dist/
pnpm start         # Run node on dist/server.js
```

---

## 📡 API & interactive documentation

Once the server is running:

- **Swagger UI** — http://localhost:3000/docs
- **Raw OpenAPI spec** — http://localhost:3000/docs.json
- **Health check** — http://localhost:3000/health

### Endpoint overview

| Domain     | Endpoints                                                                       | Auth          |
| :--------- | :------------------------------------------------------------------------------ | :------------ |
| **Auth**   | `POST /v1/auth/register`, `/login`, `/refresh`, `/logout`, `GET /me`            | Bearer JWT \* |
| **Items**  | `GET\|POST /v1/items`, `GET\|PATCH\|DELETE /v1/items/:id`                       | Bearer JWT    |
| **Tags**   | `GET\|POST /v1/tags`, `GET\|PATCH\|DELETE /v1/tags/:id`                         | Bearer JWT    |
| **Shares** | `GET\|POST /v1/shares`, `GET\|PATCH\|DELETE /v1/shares/:id`                     | Bearer JWT    |
| **Users**  | `PATCH /v1/users/me`, `PUT /me/password`, `DELETE /me`, `GET /me/export` (GDPR) | Bearer JWT    |
| **Public** | `GET /v1/public/shared/:token`                                                  | ❌ None       |

> \* Except `register`, `login`, and `refresh`, which are public.

---

## 🧪 Tests

Tests are **colocated** with the source code, inside `__test__/` folders:

```text
src/services/TagService.ts
src/services/__test__/TagService.test.ts
```

| Script               | Action                                |
| :------------------- | :------------------------------------ |
| `pnpm test`          | Single run (CI / pre-commit).         |
| `pnpm test:watch`    | Watch mode (dev).                     |
| `pnpm test:coverage` | HTML report in `coverage/index.html`. |

Pattern: services are tested with repositories mocked via `vi.fn()`, DTOs are tested on valid and invalid inputs, utilities are tested for their pure logic. See [`docs/backend/07-testing-tdd.md`](./docs/backend/07-testing-tdd.md).

---

## 📚 Documentation

See the **[full documentation hub](./docs/README.md)** to dig deeper:

| Domain           | Main guide                                                                    |
| :--------------- | :---------------------------------------------------------------------------- |
| **Architecture** | [`architecture.md`](./docs/architecture.md)                                   |
| **Onboarding**   | [`backend/01-getting-started.md`](./docs/backend/01-getting-started.md)       |
| **Errors**       | [`backend/04-error-handling.md`](./docs/backend/04-error-handling.md)         |
| **Validation**   | [`backend/05-validation-zod.md`](./docs/backend/05-validation-zod.md)         |
| **Auth**         | [`backend/06-authentication-jwt.md`](./docs/backend/06-authentication-jwt.md) |
| **Tests**        | [`backend/07-testing-tdd.md`](./docs/backend/07-testing-tdd.md)               |
| **SQL**          | [`database/01-sql-guide.md`](./docs/database/01-sql-guide.md)                 |
| **Scripts**      | [`scripts/README.md`](./scripts/README.md)                                    |

---

## 📊 Data model

### Main tables

- `users` — user accounts (UUID, role, JSONB settings, GDPR consent).
- `items` — captured content (books, podcasts, articles, videos, notes).
- `tags` — per-user tagging system.
- `item_tags` — N-N join between items and tags.
- `shares` — public links with access config (expiration stored as JSONB).
- `app_events` — application audit log (security, traceability).

### Business views

Several SQL views (`v_*`) live in `database/views/` to aggregate frontend-ready data. See [`docs/database/04-aggregation-and-views.md`](./docs/database/04-aggregation-and-views.md) for the detailed patterns.

---

## 🔧 Utility scripts

| Script                        | Action                                          |
| :---------------------------- | :---------------------------------------------- |
| `pnpm dev`                    | Dev server with hot reload                      |
| `pnpm build`                  | Production build (TS → `dist/`)                 |
| `pnpm start`                  | Run the compiled output                         |
| `pnpm test`                   | Run Vitest                                      |
| `pnpm test:coverage`          | Tests + coverage report                         |
| `pnpm lint` / `pnpm lint:fix` | Check / auto-fix lint                           |
| `pnpm typecheck`              | TypeScript check without emitting files         |
| `pnpm db:init`                | Create the database + the application user      |
| `pnpm db:migrate`             | Run all migrations (idempotent)                 |
| `pnpm db:reset`               | Wipe and rebuild the schema                     |
| `pnpm db:nuke`                | **Danger** — drop database AND application role |
| `pnpm db:run <file.sql>`      | Run a single SQL file                           |
| `pnpm gen:secrets`            | Generate cryptographically secure secrets       |

Full reference: [`scripts/README.md`](./scripts/README.md).

---

## 📝 License

This project is released under the **MIT** license. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Made with ❤️ for knowledge lovers.**
_Last updated: 12/05/2026_

[⬆ Back to top](#-memoria--your-second-brain)

</div>
