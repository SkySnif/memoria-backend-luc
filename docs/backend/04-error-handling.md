# 🚨 Error Handling

> Throw errors with intent. Let the middleware shape the response. Never expose a stack trace.

## The shape of an error in this codebase

Every error that travels through the API is (or becomes) an **`ApiError`**:

```ts
// src/exceptions/ApiError.ts (simplified)
export class ApiError extends Error {
  constructor(
    public readonly status: number, // HTTP status: 400, 401, 404, 409, 500, ...
    public readonly code: string, // Stable identifier: 'ITEM_NOT_FOUND'
    message: string, // Human-readable explanation
    public readonly details?: unknown // Optional context (validation issues, etc.)
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

Three things you can rely on:

- **`status`** maps directly to the HTTP response code.
- **`code`** is what the frontend switches on (e.g. `if (err.code === 'ITEM_NOT_FOUND') { ... }`).
- **`message`** is safe to display to humans — never includes stack traces or raw SQL.

## Factories — typed shortcuts to common errors

Throwing `new ApiError(404, 'ITEM_NOT_FOUND', 'Item abc-123 not found')` everywhere is ceremonial and easy to typo. We use **factories** instead:

```ts
// src/exceptions/ItemErrorFactory.ts (simplified)
export const ItemErrorFactory = {
  notFound: (id: string) => new ApiError(404, 'ITEM_NOT_FOUND', `Item ${id} not found`),

  forbidden: (itemId: string) =>
    new ApiError(403, 'ITEM_FORBIDDEN', `You don't have access to item ${itemId}`),

  duplicateTitle: (title: string) =>
    new ApiError(409, 'ITEM_DUPLICATE_TITLE', `An item titled "${title}" already exists`)
};
```

At the call site, it reads like English:

```ts
const item = await this.itemRepo.findById(id);
if (!item) throw ItemErrorFactory.notFound(id);
if (item.userId !== userId) throw ItemErrorFactory.forbidden(id);
```

The factories that exist today (in `src/exceptions/`):

| Factory                | Domain              | Typical errors                                               |
| :--------------------- | :------------------ | :----------------------------------------------------------- |
| `ItemErrorFactory`     | Items               | `notFound`, `forbidden`, `duplicateTitle`                    |
| `TagErrorFactory`      | Tags                | `notFound`, `forbidden`, `duplicateName`                     |
| `ShareErrorFactory`    | Shares              | `notFound`, `forbidden`, `expired`, `tokenCollision`         |
| `UserErrorFactory`     | Users               | `notFound`, `emailTaken`, `profileConflict`, `wrongPassword` |
| `PasswordError`        | Password operations | `tooWeak`, `verifyFailed`                                    |
| `TokenError`           | JWT operations      | `invalid`, `expired`, `revoked`                              |
| `ConflictError`        | Generic 409         | Catch-all for uniqueness conflicts                           |
| `DatabaseErrorFactory` | Repository layer    | `queryFailed`, `connectionLost`                              |

Whenever you find yourself building `new ApiError(...)` more than once, add a factory.

## Wrapping raw errors at the repository layer

Repositories catch raw `pg` errors and re-throw via `DatabaseErrorFactory`:

```ts
async findById(id: string): Promise<Item | null> {
  try {
    const result = await this.db.query<ItemRow>(
      'SELECT * FROM items WHERE id_item = $1',
      [id],
    );
    return result.rows[0] ? this.rowToEntity(result.rows[0]) : null;
  } catch (error) {
    throw DatabaseErrorFactory.queryFailed('findById', error);
  }
}
```

This is the **boundary** where third-party error types stop. Services, controllers, and tests above this layer only ever see `ApiError` subclasses.

`DatabaseErrorFactory` can also map known PostgreSQL `SQLSTATE` codes to better HTTP responses — for example, code `23505` (unique violation) becomes a 409, code `22P02` (invalid UUID syntax) becomes a 400. Add cases as you discover them.

## The middleware — `HandlerService`

Express 5 forwards rejected promises from `async` handlers to the error middleware automatically. So our controllers don't need `try/catch` around service calls — they just throw, and `HandlerService` catches everything at the edge:

```ts
// src/services/http/HandlerService.ts (simplified)
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    logger.warn({ err, requestId: req.id }, err.message);
    return res.status(err.status).json(ApiResponseFactory.error(err));
  }

  if (err instanceof ZodError) {
    const apiError = new ApiError(400, 'VALIDATION_ERROR', 'Invalid request body', err.flatten());
    return res.status(400).json(ApiResponseFactory.error(apiError));
  }

  // Unknown error — log it as critical, hide the details
  logger.error({ err, requestId: req.id }, 'Unhandled error');
  return res
    .status(500)
    .json(ApiResponseFactory.error(new ApiError(500, 'INTERNAL_ERROR', 'Internal server error')));
};
```

Three branches:

1. **`ApiError`** — already shaped. Just log + serialize.
2. **`ZodError`** — happens when a controller calls `schema.parse(req.body)` on invalid input. Convert to a 400 with `details`.
3. **Anything else** — unexpected. Log with full context (the only place that does), respond with a generic 500. **Never** leak `err.message` or `err.stack` to the client here.

`HandlerService` is registered as the last middleware in `app.ts`, so anything that bubbles up reaches it.

## Success responses — `ApiResponseFactory`

The mirror image of error handling. Successful responses are built through a factory so they're uniform across the whole API:

```ts
// src/utils/ApiResponseFactory.ts (simplified)
export const ApiResponseFactory = {
  success: <T>(data: T) => ({
    success: true,
    data
  }),

  error: (err: ApiError) => ({
    success: false,
    error: {
      code: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {})
    }
  })
};
```

So **every** JSON response from the API has either:

```json
{ "success": true, "data": { ... } }
```

or:

```json
{ "success": false, "error": { "code": "ITEM_NOT_FOUND", "message": "Item abc-123 not found" } }
```

The frontend keys off `success` first, then inspects `data` or `error.code`. Predictable, easy to type, easy to test.

## End-to-end example

A `POST /v1/items` request with an existing title goes through this chain:

```ts
// 1. Controller — parses the body, calls the service.
create = async (req: Request, res: Response): Promise<void> => {
  const body = CreateItemSchema.parse(req.body); // throws ZodError if invalid
  const item = await this.service.create(req.user!.id, body);
  res.status(201).json(ApiResponseFactory.success(item));
};

// 2. Service — checks for duplicate title.
async create(userId: string, dto: CreateItemDto): Promise<ResponseItemDto> {
  const existing = await this.itemRepo.findByTitle(userId, dto.title);
  if (existing) throw ItemErrorFactory.duplicateTitle(dto.title);
  // ...continue
}

// 3. The thrown ApiError bubbles up.
// 4. HandlerService catches it, returns:
//    HTTP/1.1 409 Conflict
//    { "success": false, "error": { "code": "ITEM_DUPLICATE_TITLE", "message": "..." } }
```

No `try/catch` anywhere in user code. The middleware is the single point of error shaping.

## Logging discipline

We use [pino](https://github.com/pinojs/pino) and follow one rule: **structured first, message second**.

```ts
logger.error({ err, userId, itemId }, 'Failed to create item');
//          ^object first        ^message second
```

This produces JSON logs that are searchable in production (Datadog, Loki, etc.). Never concatenate values into the message — make them top-level keys.

What gets logged where:

- **Repository errors** → wrapped, then thrown. The middleware logs at `warn` (expected error) or `error` (unexpected).
- **`ApiError`** in the middleware → `warn` (it's a known error type).
- **Unknown errors** in the middleware → `error` with the full stack and request context.

## What NOT to do

- ❌ **`throw new Error('Something went wrong')`** — untyped, can't be mapped to HTTP, leaks message to the client. Always throw an `ApiError`.
- ❌ **`try { ... } catch (e) { res.status(500).send(e.message) }`** in a controller — leaks internals, bypasses the middleware, kills uniformity.
- ❌ **Swallowing errors** (`catch (e) { /* nothing */ }`) — bugs hide forever. If you genuinely want to ignore an error, comment why.
- ❌ **`throw 'some string'`** — JavaScript allows it but it's awful. Always throw an `Error` subclass.

## Related docs

- [`05-validation-zod.md`](./05-validation-zod.md) — how `ZodError` flows through the same pipeline.
- [`03-database-connection.md`](./03-database-connection.md) — where `DatabaseErrorFactory` is invoked.
- [`07-testing-tdd.md`](./07-testing-tdd.md) — asserting thrown errors in unit tests.

[⬆ Back to docs index](../README.md)

---

_Last updated: 12/05/2026_
