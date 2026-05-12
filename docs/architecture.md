# 🏛 Architecture — Layered, REST-only

> **TL;DR**: The backend is a REST API organized into strict layers. Each layer depends on the next via interfaces, never on concrete implementations. Composition happens at startup, in one file.

## Why layered (and not MVC)

The original Memoria backend was an Express MVC app — Models, Views (EJS), Controllers. The frontend is now a separate Vue 3 SPA, which changes everything:

- **No views**: the V in MVC is gone. We serve JSON, not HTML.
- **No more "Models" doing everything**: in classic MVC, the Model owns SQL, business rules, and serialization. That violates the Single Responsibility Principle and bloats fast.

So we replaced MVC with a **layered architecture** (sometimes called "Clean Architecture lite"). Each responsibility gets its own layer, and dependencies point inward only.

## The four layers

```text
┌──────────────────────────────────────────────────────────────────┐
│  CONTROLLER     src/controllers/*.ts                              │
│                 HTTP-aware. Parses req, builds DTO, calls service,│
│                 formats response via ApiResponseFactory.          │
│                 No business logic. No SQL.                        │
├──────────────────────────────────────────────────────────────────┤
│  SERVICE        src/services/*.ts                                 │
│                 Business rules, ownership checks, orchestration.  │
│                 Calls repositories. Knows nothing about HTTP.     │
├──────────────────────────────────────────────────────────────────┤
│  REPOSITORY     src/repositories/Pg*.ts                           │
│                 SQL queries. Maps rows ↔ entities.                │
│                 Wraps pg errors into ApiError via factories.      │
│                 Knows nothing about HTTP or business rules.       │
├──────────────────────────────────────────────────────────────────┤
│  ENTITY         src/entities/*.ts                                 │
│                 Domain types. Snake_case in DB → camelCase here.  │
│                 No SQL, no HTTP, no behavior beyond identity.     │
└──────────────────────────────────────────────────────────────────┘
```

DTOs (`src/dto/`) and Zod schemas (`src/constants/zod/`) live alongside these layers — they're the shape of data moving in and out at the boundaries.

## Concrete mapping

For a feature like "list a user's items", the layers look like this:

```ts
// ENTITY — src/entities/Item.ts
export class Item extends BaseEntity {
  constructor(
    id: string,
    public readonly userId: string,
    public readonly contentType: ContentType,
    public title: string
    // ...
  ) {
    super(id);
  }
}

// REPOSITORY — src/repositories/PgItemRepository.ts
export class PgItemRepository implements IItemRepository {
  constructor(private readonly db: IDatabaseConnection) {}

  async findAllByUser(userId: string): Promise<Item[]> {
    const result = await this.db.query<ItemRow>(
      'SELECT * FROM items WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map((row) => this.rowToEntity(row));
  }
}

// SERVICE — src/services/ItemService.ts
export class ItemService implements IItemService {
  constructor(
    private readonly itemRepo: IItemRepository,
    private readonly tagRepo: ITagRepository,
    private readonly itemTagRepo: IItemTagRepository
  ) {}

  async listForUser(userId: string): Promise<ResponseItemDto[]> {
    const items = await this.itemRepo.findAllByUser(userId);
    return Promise.all(items.map((item) => this.toResponseDto(item)));
  }
}

// CONTROLLER — src/controllers/ItemController.ts
export class ItemController implements IItemController {
  constructor(private readonly service: IItemService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const items = await this.service.listForUser(req.user!.id);
    res.json(ApiResponseFactory.success(items));
  };
}
```

Four files, four responsibilities, zero ceremony. Each layer talks to the one below it via an **interface** (`IItemService`, `IItemRepository`…), never via a concrete class.

## Dependency injection — by constructor

Every service and repository takes its dependencies as **constructor parameters**, typed against interfaces:

```ts
constructor(
  private readonly itemRepo: IItemRepository,
  private readonly tagRepo: ITagRepository,
) {}
```

No DI container, no decorators, no `@Inject`. Plain TypeScript classes — Java-style explicit, JavaScript-style cheap.

### Why classes here (and not object literals like the frontend)

The frontend uses `export const api = { ... }` — an object literal — and that fits Vue's composable culture.

On the backend, **classes** make more sense:

- **State per instance**: a repository holds a reference to the DB pool. A service holds references to its repositories. Each instance has identity.
- **Constructor DI** is more ergonomic than partial application or factory functions when you have 3+ dependencies.
- **Mocking** is straightforward in Vitest — pass a mock implementing the interface to the constructor.
- **No `this` gotchas in request handlers**: we declare controller methods as arrow-function properties (`list = async (req, res) => { ... }`) so `this` is bound correctly when Express invokes them.

The cost is a tiny bit more code than `const itemService = { listForUser: async (id) => { ... } }`. The benefit is a uniform DI pattern across the entire backend, mockable everywhere, with no surprises.

## Composition root

All wiring happens in **one place**: `src/routes/v1/index.ts`. This is the only file that imports concrete implementations (`PgItemRepository`, `ItemService`, `ItemController`).

```ts
// src/routes/v1/index.ts (composition root, simplified)
const db = DatabaseConnection.getInstance();

// Repositories
const itemRepo = new PgItemRepository(db);
const tagRepo = new PgTagRepository(db);
const itemTagRepo = new PgItemTagRepository(db);

// Services
const itemService = new ItemService(itemRepo, tagRepo, itemTagRepo);

// Controllers
const itemController = new ItemController(itemService);

// Routes
router.use('/items', createItemRouter(itemController));
```

Everywhere else in the codebase, layers depend on **interfaces** (`IItemRepository`), not on `PgItemRepository`. Want to swap PostgreSQL for in-memory in a test? Inject `MockItemRepository`. Want to swap for MongoDB someday? Write `MongoItemRepository` and rewire here. Nothing else changes.

## DTOs at the boundaries

DTOs (Data Transfer Objects) are the shape of data crossing the API boundary. We have three flavors per domain:

```text
src/dto/item/
├─ CreateItemDto.ts       # POST  /items     body
├─ UpdateItemDto.ts       # PATCH /items/:id body
└─ ResponseItemDto.ts     # what the API returns to the client
```

Why a separate `ResponseItemDto` instead of returning the `Item` entity directly?

- **Hide internals**: a `User` entity carries `passwordHash` — a `ResponseUserDto` doesn't.
- **Compose at the edge**: `ResponseItemDto` can include `tags` (joined from another repo) even though the `Item` entity doesn't carry them.
- **Versioning**: when the API changes shape, the DTO changes; the entity stays stable.

Zod schemas (in `src/constants/zod/`) validate incoming DTOs at the controller layer before anything reaches the service. See [`backend/05-validation-zod.md`](./backend/05-validation-zod.md).

## Singletons (sparingly)

Two singletons exist in the codebase:

- **`DatabaseConnection`** — the `pg` pool. One per process.
- **`LoggerSingleton`** — the pino logger. One per process.

Both are accessed via `getInstance()` and **injected** into the constructors that need them. They're singletons because they own scarce resources (a pool of TCP connections, a write stream) — not for convenience.

Everything else is constructed at startup in the composition root.

## Errors — typed, factory-built

Errors flow through `ApiError` and its specialized factories:

```ts
throw ItemErrorFactory.notFound(itemId);
// →  ApiError(404, 'ITEM_NOT_FOUND', `Item ${itemId} not found`)
```

The global error middleware (`HandlerService`) catches anything that bubbles up and converts it into a JSON response with the right HTTP status. Controllers don't need `try/catch` around service calls — Express 5 forwards rejected promises automatically, and the middleware does the right thing.

See [`backend/04-error-handling.md`](./backend/04-error-handling.md) for the full pattern.

## Request lifecycle

```text
                  HTTP request
                       │
                       ▼
            ┌──────────────────┐
            │ Global middleware│  helmet, cors, rate-limit, requestId
            └─────────┬────────┘
                      │
                      ▼
            ┌──────────────────┐
            │   Route matcher  │  src/routes/v1/*
            └─────────┬────────┘
                      │
                      ▼
            ┌──────────────────┐
            │  AuthMiddleware  │  verifies Bearer token, sets req.user
            └─────────┬────────┘
                      │
                      ▼
            ┌──────────────────┐
            │    Controller    │  parses req → builds DTO → calls service
            └─────────┬────────┘
                      │ Zod schema parsed
                      ▼
            ┌──────────────────┐
            │     Service      │  business rules, ownership, orchestration
            └─────────┬────────┘
                      │ entity in, entity out
                      ▼
            ┌──────────────────┐
            │    Repository    │  SQL via pg, row → entity mapping
            └─────────┬────────┘
                      │
                      ▼
            ┌──────────────────┐
            │   PostgreSQL     │
            └─────────┬────────┘
                      │ rows
                      ▼
            ┌──────────────────┐
            │    Repository    │  entity returned
            └─────────┬────────┘
                      ▼
            ┌──────────────────┐
            │     Service      │  builds ResponseDto
            └─────────┬────────┘
                      ▼
            ┌──────────────────┐
            │    Controller    │  ApiResponseFactory.success(dto)
            └─────────┬────────┘
                      ▼
                  HTTP response
```

If an error is thrown anywhere in this chain, the global error middleware catches it and produces a clean JSON error response.

## Design patterns in use

Deliberate choices, _not_ cargo-culted:

- **Layered architecture** — separation of concerns by responsibility.
- **Dependency Injection (constructor-based)** — testability, swap-ability.
- **Repository pattern** — abstract data access behind an interface.
- **Factory** — for errors (`ItemErrorFactory.notFound(...)`) and responses (`ApiResponseFactory.success(...)`).
- **Singleton** — for shared resources (`DatabaseConnection`, `LoggerSingleton`).
- **DTO** — explicit boundary types separate from domain entities.

Deliberately **avoided**:

- ❌ **DI containers** (Inversify, tsyringe) — overkill for this size of codebase.
- ❌ **Decorators** (`@Controller`, `@Service`) — would tie us to a framework or to experimental TS features. Plain classes do the job.
- ❌ **ORMs** (Prisma, TypeORM) — raw SQL is more honest, more performant, and teaches more.
- ❌ **MVC** — no views, no need.
- ❌ **Static-everywhere** (`Item.findAll(userId)`) — couples the call site to the implementation and kills DI.

## Related docs

- [`backend/03-database-connection.md`](./backend/03-database-connection.md) — the `DatabaseConnection` singleton in depth.
- [`backend/04-error-handling.md`](./backend/04-error-handling.md) — `ApiError`, factories, middleware mapping.
- [`backend/05-validation-zod.md`](./backend/05-validation-zod.md) — Zod schemas at the boundary.
- [`conventions/01-typescript-style.md`](./conventions/01-typescript-style.md) — code style and visibility rules.

[⬆ Back to docs index](./README.md)

---

_Last updated: 12/05/2026_
