# 🛡 Validation with Zod

> Schemas at the boundary. Parse once, trust everywhere downstream.

## The core idea

Every HTTP request body, every path parameter, every query string is **untyped, untrusted input**. Before any of it reaches a service, we validate it with Zod and parse it into a strongly-typed DTO.

The pattern is short:

```ts
const dto = CreateItemSchema.parse(req.body);
// `dto` is now a CreateItemDto. If `req.body` was the wrong shape, Zod threw.
```

If validation fails, `schema.parse()` throws a `ZodError`. The error middleware catches it and produces a clean 400 response — see [`04-error-handling.md`](./04-error-handling.md).

## Where schemas live

All Zod schemas go in `src/constants/zod/`, organized by domain:

```text
src/constants/zod/
├─ item/
│  ├─ createItem.ts
│  ├─ updateItem.ts
│  └─ index.ts
├─ tag/
├─ share/
└─ user/
   ├─ auth/
   │  ├─ register.ts
   │  ├─ login.ts
   │  └─ ...
   └─ ...
```

DTOs live separately in `src/dto/` but their **types are inferred** from these schemas — never written by hand.

## A complete schema + DTO pair

The flow is: schema → infer the type → use both at the right layer.

```ts
// src/constants/zod/item/createItem.ts
import { z } from 'zod';
import { ContentType } from '@/constants/enums';

export const CreateItemSchema = z.object({
  contentType: z.nativeEnum(ContentType),
  title: z.string().min(3).max(255),
  content: z.string().max(10000).optional(),
  sourceAuthor: z.string().max(255).optional(),
  thumbnailUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
  tagIds: z.array(z.string().uuid()).optional()
});

// src/dto/item/CreateItemDto.ts
import type { z } from 'zod';
import type { CreateItemSchema } from '@/constants/zod/item/createItem';

export type CreateItemDto = z.infer<typeof CreateItemSchema>;
```

The DTO type is derived. If the schema changes, the type follows. No hand-maintained interfaces, no drift.

## Parsing at the controller boundary

The controller is the single place where untrusted input crosses into trusted territory:

```ts
// src/controllers/ItemController.ts
create = async (req: Request, res: Response): Promise<void> => {
  const dto = CreateItemSchema.parse(req.body); // throws ZodError if invalid

  const item = await this.service.create(req.user!.id, dto);

  res.status(201).json(ApiResponseFactory.success(item));
};
```

Inside the service, `dto` is fully typed and trusted. The service never needs to recheck `if (typeof dto.title !== 'string')` — Zod already enforced it.

## Three flavors of DTO per domain

Most domains have a recurring pattern:

```text
src/dto/item/
├─ CreateItemDto.ts       # POST  /items
├─ UpdateItemDto.ts       # PATCH /items/:id
└─ ResponseItemDto.ts     # what the API returns to the client
```

`UpdateItemDto` is usually `CreateItemSchema.partial()` — every field becomes optional:

```ts
// src/constants/zod/item/updateItem.ts
import { CreateItemSchema } from './createItem';

export const UpdateItemSchema = CreateItemSchema.partial();
```

`ResponseItemDto` is **not** parsed from any input — it's the shape the service _returns_. So it's typically a plain interface:

```ts
// src/dto/item/ResponseItemDto.ts
export interface ResponseItemDto {
  id: string;
  contentType: ContentType;
  title: string;
  slug: string;
  tags: Array<{ id: string; tagName: string }>;
  createdAt: Date;
  updatedAt: Date;
}
```

The Response DTO is built by the service from an entity (plus any joined data) before returning to the controller.

## `parse` vs `safeParse`

We use `.parse()` in controllers — it throws on invalid input, the middleware catches it. Clean.

`.safeParse()` is for places where you want to **inspect** the error without throwing — typically unit tests:

```ts
const result = CreateItemSchema.safeParse({ title: 'ab' });
expect(result.success).toBe(false);
expect(result.error?.issues[0].path).toEqual(['title']);
```

## Validating path params and query strings

Same idea, different source:

```ts
const ItemIdParamSchema = z.object({
  id: z.string().uuid()
});

show = async (req: Request, res: Response): Promise<void> => {
  const { id } = ItemIdParamSchema.parse(req.params);
  // ...
};
```

This catches things like `GET /v1/items/not-a-uuid` at the controller and produces a 400 — before the repo tries to use it as a UUID and gets back a `22P02` SQL error.

## Common patterns

### Refinements (custom rules across fields)

```ts
const ChangePasswordSchema = z
  .object({
    oldPassword: z.string(),
    newPassword: z.string().min(8),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });
```

### Reusable building blocks

```ts
// src/constants/zod/common.ts
export const UuidSchema = z.string().uuid();
export const EmailSchema = z.string().email().min(5).max(254);
export const PasswordSchema = z.string().min(8).max(128);

// Reuse everywhere:
export const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  pseudo: z.string().min(2).max(50)
});
```

### Coercion (numbers in query strings)

Query strings are always strings. Use `z.coerce.number()` to turn `"42"` into `42`:

```ts
const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
```

### Discriminated unions

For shapes that depend on a `type` field — e.g. a share with different access configs:

```ts
const AccessConfigSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('public') }),
  z.object({ mode: z.literal('expires'), expiresAt: z.string().datetime() }),
  z.object({ mode: z.literal('password'), passwordHash: z.string() })
]);
```

## What Zod doesn't do (and why that's fine)

- **Authentication** — Zod validates _shape_, not _identity_. JWT verification lives in `AuthMiddleware`.
- **Authorization** — checking that user X can edit item Y is business logic; it stays in the service layer.
- **Database constraint enforcement** — unique violations come back from PostgreSQL. Catch them in the repository, map to `409 Conflict`.

## Related docs

- [`04-error-handling.md`](./04-error-handling.md) — how `ZodError` becomes a 400 response.
- [`06-authentication-jwt.md`](./06-authentication-jwt.md) — schemas for register/login bodies.
- [`../conventions/01-typescript-style.md`](../conventions/01-typescript-style.md) — naming conventions for schemas and DTOs.

[⬆ Back to docs index](../README.md)

---

_Last updated: 12/05/2026_
