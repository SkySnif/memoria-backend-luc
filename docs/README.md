# 📚 Memoria Backend — Documentation

> Welcome to the Memoria backend documentation. This is your map.

This documentation mirrors the structure of the frontend's `docs/` folder for consistency. It is organized into four areas: **architecture**, **backend guides**, **database guides**, and **conventions**.

---

## 🏛 Architecture

The high-level picture of how the API is structured and how requests flow through the layers.

| Document                               | Topic                                                                            |
| :------------------------------------- | :------------------------------------------------------------------------------- |
| [`architecture.md`](./architecture.md) | Layered architecture, dependency injection, request lifecycle, design decisions. |

---

## 🛠️ Backend guides

Practical, hands-on guides for working in the codebase.

| Document                                                           | Topic                                                                |
| :----------------------------------------------------------------- | :------------------------------------------------------------------- |
| [`01-getting-started.md`](./backend/01-getting-started.md)         | Install, configure, run the server, scripts.                         |
| [`02-oop-refresher.md`](./backend/02-oop-refresher.md)             | Quick OOP refresher: classes, instances, methods. For students.      |
| [`03-database-connection.md`](./backend/03-database-connection.md) | The `DatabaseConnection` singleton and the `pg` pool.                |
| [`04-error-handling.md`](./backend/04-error-handling.md)           | `ApiError`, factories, `HandlerService`, HTTP mapping in Express 5.  |
| [`05-validation-zod.md`](./backend/05-validation-zod.md)           | Zod schemas, DTOs, parsing at the controller boundary.               |
| [`06-authentication-jwt.md`](./backend/06-authentication-jwt.md)   | JWT rotation, Argon2id hashing, auth middleware, blacklist strategy. |
| [`07-testing-tdd.md`](./backend/07-testing-tdd.md)                 | Vitest, mocking strategies, colocation, the TDD loop.                |
| [`08-deployment.md`](./backend/08-deployment.md)                   | Production deployment with PM2 + Traefik on a VPS.                   |

---

## 🗄️ Database guides

PostgreSQL-specific patterns and reference SQL.

| Document                                                                    | Topic                                                                       |
| :-------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| [`01-sql-guide.md`](./database/01-sql-guide.md)                             | Security, indexing, types, relations, triggers, KISS principles.            |
| [`02-jsonb-and-search.md`](./database/02-jsonb-and-search.md)               | Inspecting JSONB columns, filtering with `->>`, length functions.           |
| [`03-joins-and-relationships.md`](./database/03-joins-and-relationships.md) | `INNER JOIN` vs `LEFT JOIN`, pivot tables, basic aggregation.               |
| [`04-aggregation-and-views.md`](./database/04-aggregation-and-views.md)     | `JSON_AGG`, named views, dashboard-ready queries, frontend-friendly shapes. |

---

## 📐 Conventions

The "how we write code here" reference. Shared with the frontend repo — same TypeScript style, same git workflow.

| Document                                                           | Topic                                      |
| :----------------------------------------------------------------- | :----------------------------------------- |
| [`01-typescript-style.md`](./conventions/01-typescript-style.md)   | TSDoc, visibility, naming, file structure. |
| [`02-file-organization.md`](./conventions/02-file-organization.md) | Where things go and why.                   |
| [`03-git-workflow.md`](./conventions/03-git-workflow.md)           | Branches, commit messages, husky hooks.    |

---

## 🧭 Reading order

If you're new to the project, read in this order:

1. **[`architecture.md`](./architecture.md)** — understand the big picture.
2. **[`conventions/03-git-workflow.md`](./conventions/03-git-workflow.md)** — internalize the workflow before your first commit.
3. **[`backend/01-getting-started.md`](./backend/01-getting-started.md)** — get the API running.
4. **[`backend/02-oop-refresher.md`](./backend/02-oop-refresher.md)** — if classes and instances feel rusty.
5. **[`conventions/01-typescript-style.md`](./conventions/01-typescript-style.md)** — internalize the code style.
6. **[`backend/03-database-connection.md`](./backend/03-database-connection.md)** → **[`05-validation-zod.md`](./backend/05-validation-zod.md)** → **[`04-error-handling.md`](./backend/04-error-handling.md)** — understand the plumbing.
7. **[`backend/06-authentication-jwt.md`](./backend/06-authentication-jwt.md)** — auth and security.
8. **[`backend/07-testing-tdd.md`](./backend/07-testing-tdd.md)** — write your first feature, TDD-style.

---

[⬆ Back to project root](../README.md)

---

_Last updated: 12/05/2026_
